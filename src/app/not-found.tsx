import Link from 'next/link';

import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="flex size-20 items-center justify-center rounded-full bg-gfm-green/10">
        <span className="text-4xl font-extrabold text-gfm-green">404</span>
      </div>
      <h1 className="mt-6 text-2xl font-bold text-gfm-dark">Page not found</h1>
      <p className="mt-2 max-w-md text-muted-foreground">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <div className="mt-8 flex gap-3">
        <Link href="/">
          <Button
            className="bg-gfm-green hover:bg-gfm-green/90 text-white border-transparent font-bold px-6 h-11"
            size="lg"
          >
            Go home
          </Button>
        </Link>
        <Link href="/fyp">
          <Button variant="outline" size="lg" className="h-11 px-6">
            Discover fundraisers
          </Button>
        </Link>
      </div>
    </div>
  );
}
