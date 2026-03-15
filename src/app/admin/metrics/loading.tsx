import { Skeleton } from '@/components/ui/skeleton';

export default function AdminMetricsLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <Skeleton className="h-9 w-64" />
          <Skeleton className="mt-1 h-4 w-80" />
        </div>
        <Skeleton className="h-9 w-24 rounded-lg" />
      </div>

      {/* Metric Cards Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-border p-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="mt-2 h-8 w-20" />
            <Skeleton className="mt-1 h-3 w-16" />
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-80 rounded-lg" />
        <Skeleton className="h-80 rounded-lg" />
      </div>

      {/* Web Vitals */}
      <div className="mt-8">
        <Skeleton className="h-80 rounded-lg" />
      </div>

      {/* Recent Events Table */}
      <div className="mt-8">
        <Skeleton className="h-64 rounded-lg" />
      </div>
    </div>
  );
}
