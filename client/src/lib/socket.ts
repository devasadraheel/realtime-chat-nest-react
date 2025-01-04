import { io, type Socket } from 'socket.io-client';
import { useAuthStore } from '../store/auth.store';
import { useChatStore } from '../store/chat.store';
import { usePresenceStore } from '../store/presence.store';
import type { SocketMessage, TypingEvent, PresenceEvent } from './schemas';

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:4000';

class SocketManager {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  connect() {
    const { accessToken } = useAuthStore.getState();
    
    if (!accessToken) {
      console.warn('No access token available for socket connection');
      return;
    }

    if (this.socket?.connected) {
      return;
    }

    this.socket = io(`${WS_URL}/chat`, {
      auth: {
        token: accessToken,
      },
      transports: ['websocket'],
      timeout: 20000,
    });

    this.setupEventListeners();
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.reconnectAttempts = 0;
  }

  private setupEventListeners() {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      console.log('Socket connected');
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      this.handleReconnect();
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.handleReconnect();
    });

    // Chat events
    this.socket.on('message:new', (data: SocketMessage) => {
      this.handleNewMessage(data);
    });

    this.socket.on('message:ack', (data: { tempId: string; messageId: string }) => {
      this.handleMessageAck(data);
    });

    this.socket.on('message:error', (data: { tempId: string; error: string }) => {
      this.handleMessageError(data);
    });

    this.socket.on('message:typing', (data: TypingEvent) => {
      this.handleTyping(data);
    });

    this.socket.on('message:read', (data: { conversationId: string; userId: string; messageIds?: string[] }) => {
      this.handleMessageRead(data);
    });

    // Presence events
    this.socket.on('presence:update', (data: PresenceEvent) => {
      this.handlePresenceUpdate(data);
    });
  }

  private handleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);
    
    setTimeout(() => {
      this.connect();
    }, delay);
  }

  private handleNewMessage(data: SocketMessage) {
    const { addMessage, removeOptimisticMessage } = useChatStore.getState();
    
    // Remove optimistic message if it exists
    if (data.tempId) {
      removeOptimisticMessage(data.tempId);
    }
    
    // Add the real message
    addMessage(data);
  }

  private handleMessageAck(data: { tempId: string; messageId: string }) {
    const { removeOptimisticMessage, updateMessage } = useChatStore.getState();
    
    // Remove optimistic message and update with real ID
    removeOptimisticMessage(data.tempId);
    
    // Update the message with the real ID
    updateMessage(data.tempId, { _id: data.messageId });
  }

  private handleMessageError(data: { tempId: string; error: string }) {
    const { removeOptimisticMessage } = useChatStore.getState();
    
    // Remove the failed optimistic message
    removeOptimisticMessage(data.tempId);
    
    // TODO: Show error toast
    console.error('Message send failed:', data.error);
  }

  private handleTyping(data: TypingEvent) {
    const { setTypingUser } = useChatStore.getState();
    setTypingUser(data.conversationId, data.userId, data.isTyping);
  }

  private handleMessageRead(data: { conversationId: string; userId: string; messageIds?: string[] }) {
    // TODO: Update message read status
    console.log('Message read:', data);
  }

  private handlePresenceUpdate(data: PresenceEvent) {
    const { updateUserStatus } = usePresenceStore.getState();
    updateUserStatus(data.userId, data.status, data.lastSeen);
  }

  // Public methods for sending events
  joinConversation(conversationId: string) {
    if (this.socket?.connected) {
      this.socket.emit('chat:join', { conversationId });
    }
  }

  leaveConversation(conversationId: string) {
    if (this.socket?.connected) {
      this.socket.emit('chat:leave', { conversationId });
    }
  }

  sendMessage(conversationId: string, content: string, tempId: string) {
    if (this.socket?.connected) {
      this.socket.emit('message:send', { conversationId, content, tempId });
    }
  }

  setTyping(conversationId: string, isTyping: boolean) {
    if (this.socket?.connected) {
      this.socket.emit('message:typing', { conversationId, isTyping });
    }
  }

  markAsRead(conversationId: string, messageIds?: string[]) {
    if (this.socket?.connected) {
      this.socket.emit('message:read', { conversationId, messageIds });
    }
  }

  isConnected() {
    return this.socket?.connected || false;
  }
}

// Export singleton instance
export const socketManager = new SocketManager();

// Auto-connect when auth state changes
useAuthStore.subscribe(
  (state) => {
    if (state.isAuthenticated) {
      socketManager.connect();
    } else {
      socketManager.disconnect();
    }
  }
);
