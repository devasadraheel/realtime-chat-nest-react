import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MessageDocument = Message & Document;

@Schema({ timestamps: true })
export class Message {
  @Prop({ 
    type: Types.ObjectId, 
    ref: 'Conversation', 
    required: true 
  })
  conversationId: Types.ObjectId;

  @Prop({ 
    type: Types.ObjectId, 
    ref: 'User', 
    required: true 
  })
  senderId: Types.ObjectId;

  @Prop({ required: true, maxlength: 2000 })
  content: string;

  @Prop({ type: [String], default: [] })
  attachments: string[];

  @Prop({ 
    type: [{ type: Types.ObjectId, ref: 'User' }], 
    default: [] 
  })
  readBy: Types.ObjectId[];
}

export const MessageSchema = SchemaFactory.createForClass(Message);

// Create indexes
MessageSchema.index({ conversationId: 1, createdAt: -1 });
MessageSchema.index({ senderId: 1 });
