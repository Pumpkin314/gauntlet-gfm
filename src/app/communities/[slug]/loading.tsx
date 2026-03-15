import { Skeleton } from '@/components/ui/skeleton';

export default function CommunityLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Banner skeleton */}
      <Skeleton className="h-[200px] w-full rounded-xl sm:h-[240px] md:h-[280px]" />

      {/* Name + description + follow */}
      <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex-1">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="mt-2 h-4 w-full max-w-md" />
          <Skeleton className="mt-1 h-4 w-3/4 max-w-sm" />
          {/* Avatar stack */}
          <div className="mt-3 flex -space-x-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-6 w-6 rounded-full" />
            ))}
          </div>
        </div>
        <Skeleton className="h-9 w-28 rounded-lg" />
      </div>

      {/* Impact stats */}
      <div className="mt-6 rounded-xl border border-border">
        <div className="flex items-center divide-x divide-border">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex-1 px-4 py-3 text-center">
              <Skeleton className="mx-auto h-6 w-16" />
              <Skeleton className="mx-auto mt-1 h-3 w-12" />
            </div>
          ))}
        </div>
      </div>

      {/* Tab bar */}
      <div className="mt-8 flex gap-4 border-b border-border pb-2.5">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-5 w-14" />
      </div>

      {/* Content area */}
      <div className="mt-6 lg:grid lg:grid-cols-[1fr_280px] lg:gap-6">
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border p-4">
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-6 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="mt-1 h-2.5 w-16" />
                </div>
              </div>
              <Skeleton className="mt-3 h-4 w-3/4" />
              <Skeleton className="mt-1 h-4 w-full" />
              <Skeleton className="mt-1 h-4 w-5/6" />
            </div>
          ))}
        </div>

        {/* Leaderboard sidebar skeleton */}
        <aside className="hidden lg:block">
          <div className="rounded-xl border border-border p-4">
            <Skeleton className="h-4 w-28" />
            <div className="mt-3 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-6 w-6 rounded-full" />
                  <Skeleton className="h-6 w-6 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="mt-1 h-2.5 w-16" />
                  </div>
                  <Skeleton className="h-3 w-12" />
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
