import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { useAuthStore } from './store/auth.store';
import { isCallbackPage } from './lib/auth';
import { LoginPage } from './pages/LoginPage';
import { ChatPage } from './pages/ChatPage';
import { CallbackPage } from './pages/CallbackPage';

function App() {
  const { isAuthenticated, isLoading } = useAuthStore();

  // Handle callback page
  if (isCallbackPage()) {
    return <CallbackPage />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-50">
        {isAuthenticated ? <ChatPage /> : <LoginPage />}
      </div>
    </QueryClientProvider>
  );
}

export default App;