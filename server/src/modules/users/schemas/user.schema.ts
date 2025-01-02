import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  sub: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  name: string;

  @Prop()
  avatarUrl?: string;

  @Prop({ 
    type: String, 
    enum: ['online', 'offline', 'away'], 
    default: 'offline' 
  })
  status: 'online' | 'offline' | 'away';

  @Prop()
  lastSeen?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Create indexes
UserSchema.index({ sub: 1 }, { unique: true });
UserSchema.index({ email: 1 }, { unique: true });
