import { create } from 'zustand';
// Presence store doesn't need User import

interface PresenceState {
  // Online users
  onlineUsers: Set<string>; // userIds
  
  // User statuses
  userStatuses: Record<string, {
    status: 'online' | 'offline' | 'away';
    lastSeen: string;
  }>;
}

interface PresenceActions {
  setUserOnline: (userId: string) => void;
  setUserOffline: (userId: string, lastSeen: string) => void;
  setUserAway: (userId: string) => void;
  updateUserStatus: (userId: string, status: 'online' | 'offline' | 'away', lastSeen?: string) => void;
  isUserOnline: (userId: string) => boolean;
  getUserStatus: (userId: string) => { status: 'online' | 'offline' | 'away'; lastSeen: string } | null;
  reset: () => void;
}

export const usePresenceStore = create<PresenceState & PresenceActions>((set, get) => ({
  // Initial state
  onlineUsers: new Set(),
  userStatuses: {},

  // Actions
  setUserOnline: (userId) => {
    const { onlineUsers, userStatuses } = get();
    set({
      onlineUsers: new Set([...onlineUsers, userId]),
      userStatuses: {
        ...userStatuses,
        [userId]: {
          status: 'online',
          lastSeen: new Date().toISOString(),
        },
      },
    });
  },

  setUserOffline: (userId, lastSeen) => {
    const { onlineUsers, userStatuses } = get();
    const newOnlineUsers = new Set(onlineUsers);
    newOnlineUsers.delete(userId);
    
    set({
      onlineUsers: newOnlineUsers,
      userStatuses: {
        ...userStatuses,
        [userId]: {
          status: 'offline',
          lastSeen,
        },
      },
    });
  },

  setUserAway: (userId) => {
    const { userStatuses } = get();
    set({
      userStatuses: {
        ...userStatuses,
        [userId]: {
          status: 'away',
          lastSeen: userStatuses[userId]?.lastSeen || new Date().toISOString(),
        },
      },
    });
  },

  updateUserStatus: (userId, status, lastSeen) => {
    const { onlineUsers, userStatuses } = get();
    
    if (status === 'online') {
      set({
        onlineUsers: new Set([...onlineUsers, userId]),
        userStatuses: {
          ...userStatuses,
          [userId]: {
            status,
            lastSeen: lastSeen || new Date().toISOString(),
          },
        },
      });
    } else {
      const newOnlineUsers = new Set(onlineUsers);
      newOnlineUsers.delete(userId);
      
      set({
        onlineUsers: newOnlineUsers,
        userStatuses: {
          ...userStatuses,
          [userId]: {
            status,
            lastSeen: lastSeen || new Date().toISOString(),
          },
        },
      });
    }
  },

  isUserOnline: (userId) => {
    return get().onlineUsers.has(userId);
  },

  getUserStatus: (userId) => {
    return get().userStatuses[userId] || null;
  },

  reset: () => {
    set({
      onlineUsers: new Set(),
      userStatuses: {},
    });
  },
}));
