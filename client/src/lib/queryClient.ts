import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors except 408, 429
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          if (error?.response?.status === 408 || error?.response?.status === 429) {
            return failureCount < 3;
          }
          return false;
        }
        // Retry on 5xx errors up to 3 times
        return failureCount < 3;
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
});

// Query keys factory
export const queryKeys = {
  all: ['api'] as const,
  users: () => [...queryKeys.all, 'users'] as const,
  user: (id: string) => [...queryKeys.users(), id] as const,
  conversations: () => [...queryKeys.all, 'conversations'] as const,
  conversation: (id: string) => [...queryKeys.conversations(), id] as const,
  messages: (conversationId: string) => [...queryKeys.all, 'messages', conversationId] as const,
  health: () => [...queryKeys.all, 'health'] as const,
} as const;
