import { useAuthStore } from '../store/auth.store';
import type { User } from './schemas';

// Clerk configuration
const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const CLERK_DOMAIN = import.meta.env.VITE_CLERK_DOMAIN;

if (!CLERK_PUBLISHABLE_KEY) {
  throw new Error('VITE_CLERK_PUBLISHABLE_KEY is required');
}

// Initialize Clerk (this would be done in main.tsx in a real app)
export const initializeClerk = async () => {
  // In a real implementation, you would initialize Clerk here
  // For now, we'll simulate the auth flow
  console.log('Clerk initialized with key:', CLERK_PUBLISHABLE_KEY);
};

// Auth flow functions
export const auth = {
  // Sign in with Clerk Hosted UI
  signIn: () => {
    const redirectUrl = `${window.location.origin}/callback`;
    const clerkSignInUrl = `https://${CLERK_DOMAIN}/v1/oauth/authorize?client_id=${CLERK_PUBLISHABLE_KEY}&redirect_uri=${encodeURIComponent(redirectUrl)}&response_type=code&scope=openid+email+profile`;
    
    // Store the current URL to redirect back after auth
    localStorage.setItem('auth_redirect_url', window.location.pathname);
    
    // Redirect to Clerk
    window.location.href = clerkSignInUrl;
  },

  // Handle callback from Clerk
  handleCallback: async (): Promise<boolean> => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const error = urlParams.get('error');

    if (error) {
      console.error('Auth error:', error);
      return false;
    }

    if (!code) {
      console.error('No authorization code received');
      return false;
    }

    try {
      // In a real implementation, you would exchange the code for tokens
      // For now, we'll simulate getting user data
      const mockUser: User = {
        _id: 'mock-user-id',
        sub: 'mock-sub',
        email: 'user@example.com',
        name: 'Test User',
        avatarUrl: 'https://via.placeholder.com/40',
        status: 'online',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const mockToken = 'mock-access-token';

      // Set auth state
      useAuthStore.getState().setAuth(mockUser, mockToken);

      // Redirect to the original URL or home
      const redirectUrl = localStorage.getItem('auth_redirect_url') || '/';
      localStorage.removeItem('auth_redirect_url');
      window.location.href = redirectUrl;

      return true;
    } catch (error) {
      console.error('Failed to handle auth callback:', error);
      return false;
    }
  },

  // Sign out
  signOut: () => {
    useAuthStore.getState().clearAuth();
    
    // In a real implementation, you would also sign out from Clerk
    // For now, just redirect to login
    window.location.href = '/';
  },

  // Get current user
  getCurrentUser: () => {
    return useAuthStore.getState().user;
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return useAuthStore.getState().isAuthenticated;
  },
};

// Utility to check if we're on the callback page
export const isCallbackPage = () => {
  return window.location.pathname === '/callback';
};

// Utility to get the redirect URL after auth
export const getRedirectUrl = () => {
  return localStorage.getItem('auth_redirect_url') || '/';
};
