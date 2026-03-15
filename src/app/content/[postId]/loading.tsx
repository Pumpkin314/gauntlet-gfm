import { Skeleton } from '@/components/ui/skeleton';

export default function ContentPermalinkLoading() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      {/* Back link skeleton */}
      <Skeleton className="h-5 w-16" />

      {/* Content card skeleton */}
      <div className="mt-4 rounded-xl border border-border bg-background p-4">
        {/* Author row */}
        <div className="flex items-center gap-3">
          <Skeleton className="size-8 rounded-full" />
          <Skeleton className="h-4 w-32" />
          <div className="ml-auto flex items-center gap-2">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>

        {/* Title */}
        <Skeleton className="mt-4 h-6 w-3/4" />

        {/* Content area (aspect-video for media) */}
        <Skeleton className="mt-3 aspect-video w-full rounded-lg" />

        {/* Body text */}
        <div className="mt-3 space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>

        {/* Action bar */}
        <div className="mt-4 flex items-center gap-4 border-t border-border pt-3">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>

      {/* Reactions skeleton */}
      <div className="mt-6 flex items-center gap-4">
        <Skeleton className="h-10 w-20 rounded-full" />
        <Skeleton className="h-5 w-24" />
      </div>

      {/* Comments skeleton */}
      <div className="mt-8">
        <Skeleton className="h-5 w-28" />
        <div className="mt-3 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="size-6 flex-shrink-0 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Fundraiser card skeleton */}
      <div className="mt-8">
        <Skeleton className="h-5 w-36" />
        <div className="mt-3 rounded-xl border border-border bg-background overflow-hidden">
          <Skeleton className="aspect-video w-full" />
          <div className="p-4 space-y-3">
            <Skeleton className="h-5 w-3/4" />
            <div className="flex items-center gap-2">
              <Skeleton className="size-6 rounded-full" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-2 w-full rounded-full" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
      </div>
    </main>
  );
}
