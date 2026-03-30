export function VideoCardSkeleton() {
  return (
    <div className="flex-shrink-0 w-48 md:w-56">
      <div className="relative aspect-video bg-netflix-bg-elevated rounded overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(90deg, #181818 0%, #2f2f2f 50%, #181818 100%)',
            backgroundSize: '1000px 100%',
            animation: 'shimmer 2s infinite linear',
          }}
        />
      </div>
      <div className="mt-2 space-y-1">
        <div
          className="h-3 rounded"
          style={{
            width: '75%',
            background: 'linear-gradient(90deg, #181818 0%, #2f2f2f 50%, #181818 100%)',
            backgroundSize: '1000px 100%',
            animation: 'shimmer 2s infinite linear',
          }}
        />
        <div
          className="h-2 rounded"
          style={{
            width: '50%',
            background: 'linear-gradient(90deg, #181818 0%, #2f2f2f 50%, #181818 100%)',
            backgroundSize: '1000px 100%',
            animation: 'shimmer 2s infinite linear',
          }}
        />
      </div>
    </div>
  );
}

export function VideoRowSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="flex gap-2 overflow-hidden px-4 md:px-12">
      {Array.from({ length: count }).map((_, i) => (
        <VideoCardSkeleton key={i} />
      ))}
    </div>
  );
}
