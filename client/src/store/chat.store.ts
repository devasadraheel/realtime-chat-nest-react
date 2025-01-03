import { create } from 'zustand';
import type { Conversation, Message } from '../lib/schemas';

interface ChatState {
  // Current conversation
  currentConversationId: string | null;
  
  // Conversations list
  conversations: Conversation[];
  
  // Messages for current conversation
  messages: Message[];
  
  // Typing indicators
  typingUsers: Record<string, string[]>; // conversationId -> userIds[]
  
  // Optimistic messages (temporary messages being sent)
  optimisticMessages: Record<string, Message>; // tempId -> message
  
  // Pagination
  hasMoreMessages: boolean;
  nextCursor: string | null;
  
  // Loading states
  isLoadingConversations: boolean;
  isLoadingMessages: boolean;
  isSendingMessage: boolean;
}

interface ChatActions {
  // Conversation actions
  setCurrentConversation: (conversationId: string | null) => void;
  setConversations: (conversations: Conversation[]) => void;
  addConversation: (conversation: Conversation) => void;
  updateConversation: (conversationId: string, updates: Partial<Conversation>) => void;
  setLoadingConversations: (loading: boolean) => void;
  
  // Message actions
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  updateMessage: (messageId: string, updates: Partial<Message>) => void;
  removeOptimisticMessage: (tempId: string) => void;
  addOptimisticMessage: (tempId: string, message: Message) => void;
  setLoadingMessages: (loading: boolean) => void;
  setSendingMessage: (sending: boolean) => void;
  
  // Pagination
  setHasMoreMessages: (hasMore: boolean) => void;
  setNextCursor: (cursor: string | null) => void;
  
  // Typing indicators
  setTypingUser: (conversationId: string, userId: string, isTyping: boolean) => void;
  clearTypingUsers: (conversationId: string) => void;
  
  // Reset
  reset: () => void;
}

export const useChatStore = create<ChatState & ChatActions>((set, get) => ({
  // Initial state
  currentConversationId: null,
  conversations: [],
  messages: [],
  typingUsers: {},
  optimisticMessages: {},
  hasMoreMessages: false,
  nextCursor: null,
  isLoadingConversations: false,
  isLoadingMessages: false,
  isSendingMessage: false,

  // Conversation actions
  setCurrentConversation: (conversationId) => {
    set({ currentConversationId: conversationId });
    // Clear messages when switching conversations
    if (conversationId !== get().currentConversationId) {
      set({ messages: [], optimisticMessages: {} });
    }
  },

  setConversations: (conversations) => {
    set({ conversations });
  },

  addConversation: (conversation) => {
    const { conversations } = get();
    const exists = conversations.some(c => c._id === conversation._id);
    if (!exists) {
      set({ conversations: [conversation, ...conversations] });
    }
  },

  updateConversation: (conversationId, updates) => {
    const { conversations } = get();
    set({
      conversations: conversations.map(conv =>
        conv._id === conversationId ? { ...conv, ...updates } : conv
      ),
    });
  },

  setLoadingConversations: (loading) => {
    set({ isLoadingConversations: loading });
  },

  // Message actions
  setMessages: (messages) => {
    set({ messages });
  },

  addMessage: (message) => {
    const { messages } = get();
    const exists = messages.some(m => m._id === message._id);
    if (!exists) {
      set({ messages: [...messages, message] });
    }
  },

  updateMessage: (messageId, updates) => {
    const { messages } = get();
    set({
      messages: messages.map(msg =>
        msg._id === messageId ? { ...msg, ...updates } : msg
      ),
    });
  },

  removeOptimisticMessage: (tempId) => {
    const { optimisticMessages } = get();
    const { [tempId]: removed, ...rest } = optimisticMessages;
    set({ optimisticMessages: rest });
  },

  addOptimisticMessage: (tempId, message) => {
    const { optimisticMessages } = get();
    set({
      optimisticMessages: {
        ...optimisticMessages,
        [tempId]: message,
      },
    });
  },

  setLoadingMessages: (loading) => {
    set({ isLoadingMessages: loading });
  },

  setSendingMessage: (sending) => {
    set({ isSendingMessage: sending });
  },

  // Pagination
  setHasMoreMessages: (hasMore) => {
    set({ hasMoreMessages: hasMore });
  },

  setNextCursor: (cursor) => {
    set({ nextCursor: cursor });
  },

  // Typing indicators
  setTypingUser: (conversationId, userId, isTyping) => {
    const { typingUsers } = get();
    const currentTyping = typingUsers[conversationId] || [];
    
    if (isTyping) {
      if (!currentTyping.includes(userId)) {
        set({
          typingUsers: {
            ...typingUsers,
            [conversationId]: [...currentTyping, userId],
          },
        });
      }
    } else {
      set({
        typingUsers: {
          ...typingUsers,
          [conversationId]: currentTyping.filter(id => id !== userId),
        },
      });
    }
  },

  clearTypingUsers: (conversationId) => {
    const { typingUsers } = get();
    const { [conversationId]: removed, ...rest } = typingUsers;
    set({ typingUsers: rest });
  },

  // Reset
  reset: () => {
    set({
      currentConversationId: null,
      conversations: [],
      messages: [],
      typingUsers: {},
      optimisticMessages: {},
      hasMoreMessages: false,
      nextCursor: null,
      isLoadingConversations: false,
      isLoadingMessages: false,
      isSendingMessage: false,
    });
  },
}));
