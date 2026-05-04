export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`} />
  );
}

export function TableSkeleton() {
  return (
    <div className="space-y-2">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded">
          <Skeleton className="w-16 h-6" />
          <Skeleton className="w-32 h-6" />
          <Skeleton className="flex-1 h-6" />
          <Skeleton className="w-24 h-6" />
          <Skeleton className="w-20 h-6" />
        </div>
      ))}
    </div>
  );
}
