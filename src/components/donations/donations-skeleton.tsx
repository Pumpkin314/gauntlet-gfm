import { Skeleton } from "@/components/ui/skeleton";

export function DonationsSkeleton() {
  return (
    <div className="space-y-1">
      {/* Header skeleton */}
      <Skeleton className="mb-3 h-6 w-32" />

      {/* Card skeletons */}
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex gap-3 py-3">
          <Skeleton className="size-8 shrink-0 rounded-full" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-12" />
            </div>
            <Skeleton className="h-4 w-14" />
            <Skeleton className="h-3 w-48" />
          </div>
        </div>
      ))}
    </div>
  );
}
