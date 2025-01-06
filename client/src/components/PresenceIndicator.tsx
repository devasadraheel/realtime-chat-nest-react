import { usePresenceStore } from '../store/presence.store';

interface PresenceIndicatorProps {
  userId: string;
  showName?: boolean;
}

export function PresenceIndicator({ userId, showName = false }: PresenceIndicatorProps) {
  const { isUserOnline, getUserStatus } = usePresenceStore();
  
  const isOnline = isUserOnline(userId);
  const status = getUserStatus(userId);
  
  const getStatusColor = () => {
    if (isOnline) return 'bg-green-500';
    if (status?.status === 'away') return 'bg-yellow-500';
    return 'bg-gray-400';
  };
  
  const getStatusText = () => {
    if (isOnline) return 'Online';
    if (status?.status === 'away') return 'Away';
    if (status?.lastSeen) {
      const lastSeen = new Date(status.lastSeen);
      const now = new Date();
      const diffInMinutes = Math.floor((now.getTime() - lastSeen.getTime()) / (1000 * 60));
      
      if (diffInMinutes < 1) return 'Just now';
      if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
      if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
      return 'Offline';
    }
    return 'Offline';
  };

  return (
    <div className="flex items-center space-x-2">
      <div className={`w-2 h-2 rounded-full ${getStatusColor()}`}></div>
      {showName && (
        <span className="text-xs text-gray-500">{getStatusText()}</span>
      )}
    </div>
  );
}
