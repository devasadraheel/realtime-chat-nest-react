import { z } from 'zod';

// User schemas
export const UserSchema = z.object({
  sub: z.string(),
  email: z.string().email(),
  name: z.string(),
  avatarUrl: z.string().url().optional(),
  status: z.enum(['online', 'offline', 'away']).default('offline'),
  lastSeen: z.date().optional(),
});

export const CreateUserSchema = UserSchema.omit({ status: true, lastSeen: true });
export const UpdateUserSchema = UserSchema.partial().omit({ sub: true });

// Conversation schemas
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

// Response schemas
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

// Export types
export type User = z.infer<typeof UserSchema>;
export type CreateUser = z.infer<typeof CreateUserSchema>;
export type UpdateUser = z.infer<typeof UpdateUserSchema>;
export type CreatePrivateConversation = z.infer<typeof CreatePrivateConversationSchema>;
export type CreateGroupConversation = z.infer<typeof CreateGroupConversationSchema>;
export type UpdateConversation = z.infer<typeof UpdateConversationSchema>;
export type CreateMessage = z.infer<typeof CreateMessageSchema>;
export type MarkRead = z.infer<typeof MarkReadSchema>;
export type Pagination = z.infer<typeof PaginationSchema>;
export type SearchUsers = z.infer<typeof SearchUsersSchema>;
