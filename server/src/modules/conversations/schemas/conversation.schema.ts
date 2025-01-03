import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ConversationDocument = Conversation & Document;

@Schema({ timestamps: true })
export class Conversation {
  @Prop({ required: true, default: false })
  isGroup: boolean;

  @Prop({ required: function() { return this.isGroup; } })
  name?: string;

  @Prop({ 
    type: [{ type: Types.ObjectId, ref: 'User' }], 
    required: true,
    validate: {
      validator: function(participants: Types.ObjectId[]) {
        return participants.length >= 2;
      },
      message: 'At least 2 participants required'
    }
  })
  participants: Types.ObjectId[];

  @Prop({ 
    type: [{ type: Types.ObjectId, ref: 'User' }],
    default: function() {
      return this.participants.slice(0, 1); // First participant is admin by default
    }
  })
  admins: Types.ObjectId[];

  @Prop({ type: Types.ObjectId, ref: 'Message' })
  lastMessage?: Types.ObjectId;
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);

// Create indexes
ConversationSchema.index({ participants: 1, isGroup: 1 });
ConversationSchema.index({ lastMessage: 1 });
