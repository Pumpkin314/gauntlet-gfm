import { Skeleton } from '@/components/ui/skeleton';

export default function ProfileLoading() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Cover image */}
      <Skeleton className="h-40 w-full rounded-xl sm:h-52" />

      {/* Avatar + info */}
      <div className="relative px-4 sm:px-6">
        <div className="-mt-12 sm:-mt-14">
          <Skeleton className="h-24 w-24 rounded-full border-4 border-background" />
        </div>

        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="mt-1 h-4 w-32" />
            <Skeleton className="mt-2 h-4 w-24" />
            <Skeleton className="mt-2 h-4 w-80" />
            <div className="mt-3 flex gap-4">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
          <Skeleton className="h-9 w-24 rounded-md" />
        </div>
      </div>

      {/* Giving identity card */}
      <div className="mt-8">
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>

      {/* Fundraisers section */}
      <div className="mt-8">
        <Skeleton className="h-6 w-32" />
        <div className="mt-4 flex gap-4">
          <Skeleton className="h-48 w-72 shrink-0 rounded-xl" />
          <Skeleton className="h-48 w-72 shrink-0 rounded-xl" />
          <Skeleton className="h-48 w-72 shrink-0 rounded-xl" />
        </div>
      </div>

      {/* Activity section */}
      <div className="mt-8">
        <Skeleton className="h-6 w-40" />
        <div className="mt-4 space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-start gap-3 py-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-4 w-full max-w-md" />
                <Skeleton className="mt-1 h-3 w-20" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
