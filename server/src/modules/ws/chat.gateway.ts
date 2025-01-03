import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { JwksService } from '../../common/utils/jwks-client';
import { MessagesService } from '../messages/messages.service';
import { ConversationsService } from '../conversations/conversations.service';
import { UsersService } from '../users/users.service';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  user?: {
    sub: string;
    email: string;
    name: string;
  };
}

@WebSocketGateway({
  namespace: '/chat',
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private userSockets = new Map<string, Set<string>>(); // userId -> Set of socketIds

  constructor(
    private readonly jwksService: JwksService,
    private readonly messagesService: MessagesService,
    private readonly conversationsService: ConversationsService,
    private readonly usersService: UsersService,
  ) {}

  afterInit(server: Server) {
    console.log('WebSocket Gateway initialized');
  }

  async handleConnection(client: AuthenticatedSocket) {
    try {
      const token = this.extractTokenFromSocket(client);
      if (!token) {
        client.disconnect();
        return;
      }

      const payload = await this.jwksService.verifyToken(token);
      client.userId = payload.sub;
      client.user = {
        sub: payload.sub,
        email: payload.email,
        name: payload.name,
      };

      // Track user's socket connections
      if (!this.userSockets.has(payload.sub)) {
        this.userSockets.set(payload.sub, new Set());
      }
      this.userSockets.get(payload.sub)!.add(client.id);

      // Update user status to online
      await this.usersService.updateStatus(payload.sub, 'online');

      // Join user to their personal room
      client.join(`user:${payload.sub}`);

      // Broadcast presence update
      this.server.emit('presence:update', {
        userId: payload.sub,
        status: 'online',
        lastSeen: new Date(),
      });

      console.log(`User ${payload.sub} connected with socket ${client.id}`);
    } catch (error) {
      console.error('Authentication failed:', error);
      client.disconnect();
    }
  }

  async handleDisconnect(client: AuthenticatedSocket) {
    if (client.userId) {
      // Remove socket from user's connections
      const userSockets = this.userSockets.get(client.userId);
      if (userSockets) {
        userSockets.delete(client.id);
        if (userSockets.size === 0) {
          // User has no more active connections
          this.userSockets.delete(client.userId);
          
          // Update user status to offline
          await this.usersService.updateStatus(client.userId, 'offline', new Date());

          // Broadcast presence update
          this.server.emit('presence:update', {
            userId: client.userId,
            status: 'offline',
            lastSeen: new Date(),
          });
        }
      }
    }
    console.log(`Socket ${client.id} disconnected`);
  }

  @SubscribeMessage('chat:join')
  async handleJoinConversation(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { conversationId: string },
  ) {
    if (!client.userId) return;

    const isParticipant = await this.conversationsService.isParticipant(
      data.conversationId,
      client.userId,
    );

    if (isParticipant) {
      client.join(`conversation:${data.conversationId}`);
      console.log(`User ${client.userId} joined conversation ${data.conversationId}`);
    }
  }

  @SubscribeMessage('chat:leave')
  async handleLeaveConversation(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { conversationId: string },
  ) {
    client.leave(`conversation:${data.conversationId}`);
    console.log(`User ${client.userId} left conversation ${data.conversationId}`);
  }

  @SubscribeMessage('message:send')
  async handleSendMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { conversationId: string; content: string; tempId: string },
  ) {
    if (!client.userId) return;

    try {
      const message = await this.messagesService.create(
        data.conversationId,
        client.userId,
        { content: data.content },
      );

      // Broadcast to conversation room
      this.server.to(`conversation:${data.conversationId}`).emit('message:new', {
        ...(message as any).toObject(),
        tempId: data.tempId,
      });

      // Send acknowledgment to sender
      client.emit('message:ack', {
        tempId: data.tempId,
        messageId: (message as any)._id.toString(),
      });
    } catch (error) {
      client.emit('message:error', {
        tempId: data.tempId,
        error: 'Failed to send message',
      });
    }
  }

  @SubscribeMessage('message:typing')
  async handleTyping(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { conversationId: string; isTyping: boolean },
  ) {
    if (!client.userId) return;

    // Broadcast typing status to other users in conversation
    client.to(`conversation:${data.conversationId}`).emit('message:typing', {
      conversationId: data.conversationId,
      userId: client.userId,
      isTyping: data.isTyping,
    });
  }

  @SubscribeMessage('message:read')
  async handleMarkAsRead(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { conversationId: string; messageIds?: string[] },
  ) {
    if (!client.userId) return;

    try {
      await this.messagesService.markAsRead(
        data.conversationId,
        client.userId,
        { messageIds: data.messageIds },
      );

      // Broadcast read receipt to conversation
      this.server.to(`conversation:${data.conversationId}`).emit('message:read', {
        conversationId: data.conversationId,
        userId: client.userId,
        messageIds: data.messageIds,
      });
    } catch (error) {
      console.error('Failed to mark messages as read:', error);
    }
  }

  private extractTokenFromSocket(client: Socket): string | null {
    const authHeader = client.handshake.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }
    return null;
  }
}
