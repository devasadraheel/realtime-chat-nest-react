import { useState, useRef, useEffect } from 'react';
import { useSendMessage, useTyping } from '../features/useChat';
import { useChatStore } from '../store/chat.store';

interface MessageComposerProps {
  conversationId: string;
}

export function MessageComposer({ conversationId: _conversationId }: MessageComposerProps) {
  const [message, setMessage] = useState('');
  const [isComposing, setIsComposing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const sendMessageMutation = useSendMessage();
  const { startTyping, stopTyping } = useTyping();
  const { isSendingMessage } = useChatStore();

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || isSendingMessage) return;

    const content = message.trim();
    setMessage('');
    stopTyping();

    sendMessageMutation.mutate({ content });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setMessage(value);

    if (value.trim() && !isComposing) {
      setIsComposing(true);
      startTyping();
    } else if (!value.trim() && isComposing) {
      setIsComposing(false);
      stopTyping();
    }
  };

  const handleBlur = () => {
    if (isComposing) {
      setIsComposing(false);
      stopTyping();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-end space-x-3">
      <div className="flex-1 relative">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          placeholder="Type a message..."
          className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 max-h-32"
          rows={1}
          disabled={isSendingMessage}
        />
        
        {/* Send button */}
        <button
          type="submit"
          disabled={!message.trim() || isSendingMessage}
          className="absolute right-2 bottom-2 p-2 text-primary-600 hover:text-primary-700 disabled:text-gray-400 disabled:cursor-not-allowed"
        >
          {isSendingMessage ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          )}
        </button>
      </div>
      
      {/* Attachment button */}
      <button
        type="button"
        className="p-3 text-gray-400 hover:text-gray-600"
        disabled={isSendingMessage}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
        </svg>
      </button>
    </form>
  );
}
