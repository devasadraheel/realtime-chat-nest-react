interface LoadingSkeletonProps {
  className?: string;
}

export function LoadingSkeleton({ className = '' }: LoadingSkeletonProps) {
  return (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`}></div>
  );
}

export function ConversationSkeleton() {
  return (
    <div className="p-3">
      <div className="flex items-center space-x-3">
        <LoadingSkeleton className="w-10 h-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <LoadingSkeleton className="h-4 w-3/4" />
          <LoadingSkeleton className="h-3 w-1/2" />
        </div>
      </div>
    </div>
  );
}

export function MessageSkeleton() {
  return (
    <div className="flex justify-start">
      <div className="max-w-xs lg:max-w-md px-4 py-2 rounded-lg bg-gray-100">
        <LoadingSkeleton className="h-4 w-32 mb-2" />
        <div className="flex items-center justify-between">
          <LoadingSkeleton className="h-3 w-12" />
          <LoadingSkeleton className="h-3 w-3" />
        </div>
      </div>
    </div>
  );
}

export function ChatSkeleton() {
  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header skeleton */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <LoadingSkeleton className="w-8 h-8 rounded-full" />
            <div>
              <LoadingSkeleton className="h-5 w-20 mb-1" />
              <LoadingSkeleton className="h-4 w-24" />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <LoadingSkeleton className="w-8 h-8 rounded" />
            <LoadingSkeleton className="w-8 h-8 rounded" />
          </div>
        </div>
      </div>

      {/* Messages skeleton */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {[...Array(5)].map((_, i) => (
          <MessageSkeleton key={i} />
        ))}
      </div>

      {/* Composer skeleton */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="flex items-end space-x-3">
          <div className="flex-1">
            <LoadingSkeleton className="h-12 w-full rounded-lg" />
          </div>
          <LoadingSkeleton className="w-12 h-12 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
