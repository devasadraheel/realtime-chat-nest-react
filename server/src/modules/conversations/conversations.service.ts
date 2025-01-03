import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Conversation, ConversationDocument } from './schemas/conversation.schema';
import { Message, MessageDocument } from '../messages/schemas/message.schema';
import { CreatePrivateConversation, CreateGroupConversation, UpdateConversation } from '../../common/schemas';

@Injectable()
export class ConversationsService {
  constructor(
    @InjectModel(Conversation.name) private conversationModel: Model<ConversationDocument>,
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
  ) {}

  async createPrivate(userId: string, targetUserId: string): Promise<Conversation> {
    // Check if private conversation already exists
    const existingConversation = await this.conversationModel.findOne({
      isGroup: false,
      participants: { $all: [userId, targetUserId] }
    }).exec();

    if (existingConversation) {
      return existingConversation;
    }

    const conversation = new this.conversationModel({
      isGroup: false,
      participants: [userId, targetUserId],
    });

    return conversation.save();
  }

  async createGroup(name: string, adminId: string, participantIds: string[]): Promise<Conversation> {
    const allParticipants = [adminId, ...participantIds];
    const uniqueParticipants = [...new Set(allParticipants)];

    const conversation = new this.conversationModel({
      isGroup: true,
      name,
      participants: uniqueParticipants,
      admins: [adminId],
    });

    return conversation.save();
  }

  async findAll(userId: string): Promise<Conversation[]> {
    return this.conversationModel
      .find({ participants: userId })
      .populate('participants', 'name email avatarUrl status lastSeen')
      .populate('lastMessage')
      .populate('admins', 'name email')
      .sort({ updatedAt: -1 })
      .exec();
  }

  async findOne(id: string, userId: string): Promise<Conversation> {
    const conversation = await this.conversationModel
      .findOne({ _id: id, participants: userId })
      .populate('participants', 'name email avatarUrl status lastSeen')
      .populate('lastMessage')
      .populate('admins', 'name email')
      .exec();

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    return conversation;
  }

  async update(id: string, userId: string, updateData: UpdateConversation): Promise<Conversation> {
    const conversation = await this.conversationModel.findById(id).exec();
    
    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    if (!conversation.participants.includes(new Types.ObjectId(userId))) {
      throw new ForbiddenException('Not a participant in this conversation');
    }

    if (conversation.isGroup && !conversation.admins.includes(new Types.ObjectId(userId))) {
      throw new ForbiddenException('Only admins can update group conversations');
    }

    const updatedConversation = await this.conversationModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .populate('participants', 'name email avatarUrl status lastSeen')
      .populate('lastMessage')
      .populate('admins', 'name email')
      .exec();

    return updatedConversation!;
  }

  async getUnreadCount(conversationId: string, userId: string): Promise<number> {
    return this.messageModel.countDocuments({
      conversationId,
      senderId: { $ne: userId },
      readBy: { $nin: [userId] }
    }).exec();
  }

  async updateLastMessage(conversationId: string, messageId: string): Promise<void> {
    await this.conversationModel.findByIdAndUpdate(conversationId, {
      lastMessage: messageId,
    }).exec();
  }

  async isParticipant(conversationId: string, userId: string): Promise<boolean> {
    const conversation = await this.conversationModel.findOne({
      _id: conversationId,
      participants: userId
    }).exec();
    
    return !!conversation;
  }

  async isAdmin(conversationId: string, userId: string): Promise<boolean> {
    const conversation = await this.conversationModel.findOne({
      _id: conversationId,
      admins: userId
    }).exec();
    
    return !!conversation;
  }
}
