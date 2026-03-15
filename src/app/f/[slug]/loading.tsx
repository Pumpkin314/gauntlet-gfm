import { Skeleton } from '@/components/ui/skeleton';

export default function FundraiserLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="lg:grid lg:grid-cols-[1fr_380px] lg:gap-8">
        {/* Left column skeleton */}
        <div className="min-w-0">
          {/* Hero image */}
          <Skeleton className="aspect-video w-full rounded-xl" />

          {/* Title */}
          <Skeleton className="mt-6 h-9 w-3/4" />

          {/* Mobile progress bar */}
          <div className="mt-4 lg:hidden">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="mt-2 h-2 w-full rounded-full" />
            <Skeleton className="mt-2 h-4 w-24" />
          </div>

          {/* Organizer row */}
          <div className="mt-6 flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-4 w-64" />
              <Skeleton className="mt-1.5 h-3 w-40" />
            </div>
          </div>

          <Skeleton className="my-6 h-px w-full" />

          {/* Description */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-3/4" />
          </div>

          <Skeleton className="mt-4 h-4 w-20" />

          <Skeleton className="my-6 h-px w-full" />

          {/* Meta */}
          <div className="flex gap-3">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-5 w-24 rounded-full" />
            <Skeleton className="h-5 w-28 rounded-full" />
          </div>
        </div>

        {/* Right column sidebar skeleton (desktop only) */}
        <aside className="hidden lg:block">
          <div className="rounded-xl border border-border p-6">
            {/* Progress */}
            <Skeleton className="h-6 w-48" />
            <Skeleton className="mt-2 h-2 w-full rounded-full" />
            <Skeleton className="mt-2 h-4 w-24" />

            {/* Donate button */}
            <Skeleton className="mt-5 h-12 w-full rounded-lg" />

            {/* Share button */}
            <Skeleton className="mt-3 h-8 w-full rounded-lg" />
          </div>

          {/* Organizer card */}
          <div className="mt-4 rounded-xl border border-border p-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="mt-1.5 h-3 w-24" />
              </div>
            </div>
            <Skeleton className="mt-3 h-8 w-full rounded-lg" />
          </div>
        </aside>
      </div>
    </div>
  );
}
