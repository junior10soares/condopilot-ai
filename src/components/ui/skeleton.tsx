export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`bg-surface-elevated animate-pulse rounded-md ${className}`} />;
}

export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-7 w-48" />
      <div className="border-border overflow-hidden rounded-xl border">
        <div className="border-border bg-surface-elevated flex gap-6 border-b px-4 py-3">
          {Array.from({ length: cols }).map((_, i) => (
            <Skeleton key={i} className="h-3.5 w-20" />
          ))}
        </div>
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="border-border flex gap-6 border-b px-4 py-3.5 last:border-0">
            {Array.from({ length: cols }).map((_, c) => (
              <Skeleton key={c} className="h-3.5 w-20" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
