import { Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Message, MessageDocument } from './schemas/message.schema';
import { CreateMessage, MarkRead, Pagination } from '../../common/schemas';
import { ConversationsService } from '../conversations/conversations.service';

@Injectable()
export class MessagesService {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
    @Inject(forwardRef(() => ConversationsService))
    private conversationsService: ConversationsService,
  ) {}

  async create(conversationId: string, senderId: string, createMessageDto: CreateMessage): Promise<Message> {
    // Verify user is participant
    const isParticipant = await this.conversationsService.isParticipant(conversationId, senderId);
    if (!isParticipant) {
      throw new NotFoundException('Conversation not found or access denied');
    }

    const message = new this.messageModel({
      conversationId,
      senderId,
      ...createMessageDto,
    });

    const savedMessage = await message.save();

    // Update conversation's last message
    await this.conversationsService.updateLastMessage(conversationId, savedMessage._id.toString());

    return savedMessage;
  }

  async findAll(
    conversationId: string, 
    userId: string, 
    pagination: Pagination
  ): Promise<{ messages: Message[]; hasMore: boolean; nextCursor?: string }> {
    // Verify user is participant
    const isParticipant = await this.conversationsService.isParticipant(conversationId, userId);
    if (!isParticipant) {
      throw new NotFoundException('Conversation not found or access denied');
    }

    const query: any = { conversationId };
    
    if (pagination.cursor) {
      const cursorDate = new Date(pagination.cursor);
      query.createdAt = { $lt: cursorDate };
    }

    const messages = await this.messageModel
      .find(query)
      .populate('senderId', 'name email avatarUrl')
      .sort({ createdAt: -1 })
      .limit(pagination.limit + 1) // Get one extra to check if there are more
      .exec();

    const hasMore = messages.length > pagination.limit;
    const resultMessages = hasMore ? messages.slice(0, -1) : messages;
    
    const nextCursor = hasMore && resultMessages.length > 0 
      ? (resultMessages[resultMessages.length - 1] as any).createdAt.toISOString()
      : undefined;

    return {
      messages: resultMessages.reverse(), // Return in chronological order
      hasMore,
      nextCursor,
    };
  }

  async markAsRead(conversationId: string, userId: string, markReadDto: MarkRead): Promise<void> {
    // Verify user is participant
    const isParticipant = await this.conversationsService.isParticipant(conversationId, userId);
    if (!isParticipant) {
      throw new NotFoundException('Conversation not found or access denied');
    }

    const query: any = {
      conversationId,
      senderId: { $ne: userId },
      readBy: { $nin: [userId] }
    };

    if (markReadDto.messageIds && markReadDto.messageIds.length > 0) {
      query._id = { $in: markReadDto.messageIds };
    }

    await this.messageModel.updateMany(query, {
      $addToSet: { readBy: userId }
    }).exec();
  }

  async getUnreadCount(conversationId: string, userId: string): Promise<number> {
    return this.messageModel.countDocuments({
      conversationId,
      senderId: { $ne: userId },
      readBy: { $nin: [userId] }
    }).exec();
  }

  async findById(messageId: string): Promise<Message | null> {
    return this.messageModel
      .findById(messageId)
      .populate('senderId', 'name email avatarUrl')
      .exec();
  }
}
