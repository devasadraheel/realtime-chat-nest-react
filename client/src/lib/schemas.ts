import { z } from 'zod';

// User schemas
export const UserSchema = z.object({
  _id: z.string(),
  sub: z.string(),
  email: z.string().email(),
  name: z.string(),
  avatarUrl: z.string().url().optional(),
  status: z.enum(['online', 'offline', 'away']),
  lastSeen: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const CreateUserSchema = UserSchema.omit({ 
  _id: true, 
  status: true, 
  lastSeen: true, 
  createdAt: true, 
  updatedAt: true 
});

// Conversation schemas
export const ConversationSchema = z.object({
  _id: z.string(),
  isGroup: z.boolean(),
  name: z.string().optional(),
  participants: z.array(UserSchema),
  admins: z.array(UserSchema),
  lastMessage: z.object({
    _id: z.string(),
    content: z.string(),
    senderId: z.string(),
    createdAt: z.string(),
  }).optional(),
  unreadCount: z.number().default(0),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const CreatePrivateConversationSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
});

export const CreateGroupConversationSchema = z.object({
  name: z.string().min(1, 'Group name is required').max(100, 'Group name too long'),
  participantIds: z.array(z.string()).min(2, 'At least 2 participants required'),
});

export const UpdateConversationSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  participantIds: z.array(z.string()).optional(),
}).refine(
  (data) => data.name || data.participantIds,
  { message: 'At least one field must be provided' }
);

// Message schemas
export const MessageSchema = z.object({
  _id: z.string(),
  conversationId: z.string(),
  senderId: z.string(),
  content: z.string(),
  attachments: z.array(z.string()).default([]),
  readBy: z.array(z.string()).default([]),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const CreateMessageSchema = z.object({
  content: z.string().min(1, 'Message content is required').max(2000, 'Message too long'),
  attachments: z.array(z.string()).optional(),
});

export const MarkReadSchema = z.object({
  messageIds: z.array(z.string()).optional(),
});

// Pagination schemas
export const PaginationSchema = z.object({
  cursor: z.string().optional(),
  limit: z.number().int().min(1).max(100).default(30),
});

// Search schemas
export const SearchUsersSchema = z.object({
  q: z.string().min(1, 'Search query is required'),
  limit: z.number().int().min(1).max(50).default(20),
});

// API Response schemas
export const ApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: dataSchema,
    message: z.string().optional(),
  });

export const PaginatedResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    success: z.boolean(),
    data: z.array(itemSchema),
    pagination: z.object({
      hasMore: z.boolean(),
      nextCursor: z.string().optional(),
    }),
  });

// Socket event schemas
export const SocketMessageSchema = MessageSchema.extend({
  tempId: z.string().optional(),
});

export const TypingEventSchema = z.object({
  conversationId: z.string(),
  userId: z.string(),
  isTyping: z.boolean(),
});

export const PresenceEventSchema = z.object({
  userId: z.string(),
  status: z.enum(['online', 'offline', 'away']),
  lastSeen: z.string(),
});

// Export types
export type User = z.infer<typeof UserSchema>;
export type CreateUser = z.infer<typeof CreateUserSchema>;
export type Conversation = z.infer<typeof ConversationSchema>;
export type CreatePrivateConversation = z.infer<typeof CreatePrivateConversationSchema>;
export type CreateGroupConversation = z.infer<typeof CreateGroupConversationSchema>;
export type UpdateConversation = z.infer<typeof UpdateConversationSchema>;
export type Message = z.infer<typeof MessageSchema>;
export type CreateMessage = z.infer<typeof CreateMessageSchema>;
export type MarkRead = z.infer<typeof MarkReadSchema>;
export type Pagination = z.infer<typeof PaginationSchema>;
export type SearchUsers = z.infer<typeof SearchUsersSchema>;
export type SocketMessage = z.infer<typeof SocketMessageSchema>;
export type TypingEvent = z.infer<typeof TypingEventSchema>;
export type PresenceEvent = z.infer<typeof PresenceEventSchema>;
