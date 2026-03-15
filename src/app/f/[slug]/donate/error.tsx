'use client';

import Link from 'next/link';

import { Button } from '@/components/ui/button';

export default function DonateError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-green-100 text-green-600">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-8"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>

      <h2 className="mt-6 text-xl font-bold text-gfm-dark">
        Your donation may have been processed!
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Something went wrong displaying the page, but your donation was likely
        successful. Check the fundraiser page to confirm.
      </p>

      <div className="mt-6 flex gap-3">
        <Button
          onClick={reset}
          className="bg-gfm-green hover:bg-gfm-green/90 text-white border-transparent font-bold px-6 h-11"
          size="lg"
        >
          Try again
        </Button>
        <Link href="/">
          <Button variant="outline" size="lg" className="h-11 px-6">
            Go home
          </Button>
        </Link>
      </div>
    </div>
  );
}
