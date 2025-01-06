import { useChatStore } from '../store/chat.store';
import { useAuthStore } from '../store/auth.store';

interface TypingIndicatorProps {
  conversationId: string;
}

export function TypingIndicator({ conversationId }: TypingIndicatorProps) {
  const { typingUsers } = useChatStore();
  const { user } = useAuthStore();
  
  const currentTypingUsers = typingUsers[conversationId] || [];
  
  if (currentTypingUsers.length === 0) {
    return null;
  }

  // Filter out current user
  const otherTypingUsers = currentTypingUsers.filter(userId => userId !== user?._id);
  
  if (otherTypingUsers.length === 0) {
    return null;
  }

  const getTypingText = () => {
    if (otherTypingUsers.length === 1) {
      return 'Someone is typing...';
    } else if (otherTypingUsers.length === 2) {
      return '2 people are typing...';
    } else {
      return `${otherTypingUsers.length} people are typing...`;
    }
  };

  return (
    <div className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-500">
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      </div>
      <span>{getTypingText()}</span>
    </div>
  );
}
