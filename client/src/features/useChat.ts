import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useChatStore } from '../store/chat.store';
import { useAuthStore } from '../store/auth.store';
import { api } from '../lib/api';
import { queryKeys } from '../lib/queryClient';
import { socketManager } from '../lib/socket';
import type { CreateMessage, CreatePrivateConversation, CreateGroupConversation, UpdateConversation } from '../lib/schemas';

// Conversations hooks
export const useConversations = () => {
  const { setConversations, setLoadingConversations } = useChatStore();

  return useQuery({
    queryKey: queryKeys.conversations(),
    queryFn: async () => {
      setLoadingConversations(true);
      try {
        const response = await api.conversations.getAll();
        setConversations(response.data.data);
        return response.data.data;
      } finally {
        setLoadingConversations(false);
      }
    },
    enabled: useAuthStore.getState().isAuthenticated,
  });
};

export const useConversation = (conversationId: string) => {
  return useQuery({
    queryKey: queryKeys.conversation(conversationId),
    queryFn: async () => {
      const response = await api.conversations.getById(conversationId);
      return response.data.data;
    },
    enabled: !!conversationId,
  });
};

export const useCreatePrivateConversation = () => {
  const queryClient = useQueryClient();
  const { addConversation } = useChatStore();

  return useMutation({
    mutationFn: async (data: CreatePrivateConversation) => {
      const response = await api.conversations.createPrivate(data);
      return response.data.data;
    },
    onSuccess: (conversation) => {
      addConversation(conversation);
      queryClient.invalidateQueries({ queryKey: queryKeys.conversations() });
    },
  });
};

export const useCreateGroupConversation = () => {
  const queryClient = useQueryClient();
  const { addConversation } = useChatStore();

  return useMutation({
    mutationFn: async (data: CreateGroupConversation) => {
      const response = await api.conversations.createGroup(data);
      return response.data.data;
    },
    onSuccess: (conversation) => {
      addConversation(conversation);
      queryClient.invalidateQueries({ queryKey: queryKeys.conversations() });
    },
  });
};

export const useUpdateConversation = () => {
  const queryClient = useQueryClient();
  const { updateConversation } = useChatStore();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateConversation }) => {
      const response = await api.conversations.update(id, data);
      return response.data.data;
    },
    onSuccess: (conversation) => {
      updateConversation(conversation._id, conversation);
      queryClient.invalidateQueries({ queryKey: queryKeys.conversation(conversation._id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.conversations() });
    },
  });
};

// Messages hooks
export const useMessages = (conversationId: string) => {
  const { 
    setMessages, 
    setLoadingMessages, 
    setHasMoreMessages, 
    nextCursor, 
    setNextCursor 
  } = useChatStore();

  return useQuery({
    queryKey: queryKeys.messages(conversationId),
    queryFn: async () => {
      setLoadingMessages(true);
      try {
        const response = await api.messages.getAll(conversationId, {
          cursor: nextCursor || undefined,
          limit: 30,
        });
        
        const { data, pagination } = response.data;
        setMessages(data);
        setHasMoreMessages(pagination.hasMore);
        setNextCursor(pagination.nextCursor || null);
        
        return data;
      } finally {
        setLoadingMessages(false);
      }
    },
    enabled: !!conversationId,
  });
};

export const useSendMessage = () => {
  const { addOptimisticMessage, setSendingMessage } = useChatStore();
  const { currentConversationId } = useChatStore();

  return useMutation({
    mutationFn: async (data: CreateMessage) => {
      if (!currentConversationId) {
        throw new Error('No conversation selected');
      }

      const response = await api.messages.create(currentConversationId, data);
      return response.data.data;
    },
    onMutate: async (data) => {
      if (!currentConversationId) return;

      setSendingMessage(true);
      
      // Create optimistic message
      const tempId = `temp-${Date.now()}`;
      const optimisticMessage = {
        _id: tempId,
        conversationId: currentConversationId,
        senderId: useAuthStore.getState().user?._id || '',
        content: data.content,
        attachments: data.attachments || [],
        readBy: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      addOptimisticMessage(tempId, optimisticMessage);

      // Send via socket
      socketManager.sendMessage(currentConversationId, data.content, tempId);

      return { tempId };
    },
    onSuccess: () => {
      setSendingMessage(false);
    },
    onError: (error) => {
      setSendingMessage(false);
      console.error('Failed to send message:', error);
    },
  });
};

export const useMarkAsRead = () => {
  const { currentConversationId } = useChatStore();

  return useMutation({
    mutationFn: async (messageIds?: string[]) => {
      if (!currentConversationId) {
        throw new Error('No conversation selected');
      }

      await api.messages.markAsRead(currentConversationId, { messageIds });
    },
    onSuccess: () => {
      if (currentConversationId) {
        socketManager.markAsRead(currentConversationId);
      }
    },
  });
};

// Socket hooks
export const useJoinConversation = () => {
  const { setCurrentConversation } = useChatStore();

  return (conversationId: string) => {
    setCurrentConversation(conversationId);
    socketManager.joinConversation(conversationId);
  };
};

export const useLeaveConversation = () => {
  const { setCurrentConversation } = useChatStore();

  return (conversationId: string) => {
    socketManager.leaveConversation(conversationId);
    setCurrentConversation(null);
  };
};

export const useTyping = () => {
  const { currentConversationId } = useChatStore();
  let typingTimeout: NodeJS.Timeout | null = null;

  const startTyping = () => {
    if (!currentConversationId) return;

    socketManager.setTyping(currentConversationId, true);

    // Clear existing timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    // Stop typing after 3 seconds of inactivity
    typingTimeout = setTimeout(() => {
      socketManager.setTyping(currentConversationId!, false);
    }, 3000);
  };

  const stopTyping = () => {
    if (!currentConversationId) return;

    if (typingTimeout) {
      clearTimeout(typingTimeout);
      typingTimeout = null;
    }

    socketManager.setTyping(currentConversationId, false);
  };

  return { startTyping, stopTyping };
};
