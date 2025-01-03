import axios, { type AxiosInstance } from 'axios';
import { useAuthStore } from '../store/auth.store';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, clear auth state
      useAuthStore.getState().clearAuth();
    }
    return Promise.reject(error);
  }
);

// API endpoints
export const api = {
  // Health check
  health: () => apiClient.get('/health'),

  // Users
  users: {
    getMe: () => apiClient.get('/users/me'),
    upsertMe: (data: any) => apiClient.post('/users/me', data),
    search: (params: { q: string; limit?: number }) => 
      apiClient.get('/users/search', { params }),
  },

  // Conversations
  conversations: {
    createPrivate: (data: { userId: string }) => 
      apiClient.post('/conversations/private', data),
    createGroup: (data: { name: string; participantIds: string[] }) => 
      apiClient.post('/conversations/group', data),
    getAll: () => apiClient.get('/conversations'),
    getById: (id: string) => apiClient.get(`/conversations/${id}`),
    update: (id: string, data: any) => apiClient.patch(`/conversations/${id}`, data),
  },

  // Messages
  messages: {
    create: (conversationId: string, data: any) => 
      apiClient.post(`/conversations/${conversationId}/messages`, data),
    getAll: (conversationId: string, params?: { cursor?: string; limit?: number }) => 
      apiClient.get(`/conversations/${conversationId}/messages`, { params }),
    markAsRead: (conversationId: string, data?: { messageIds?: string[] }) => 
      apiClient.post(`/conversations/${conversationId}/messages/read`, data),
    getUnreadCount: (conversationId: string) => 
      apiClient.get(`/conversations/${conversationId}/messages/unread-count`),
  },
};

export default apiClient;
