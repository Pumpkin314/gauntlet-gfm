import Link from 'next/link';

import { Button } from '@/components/ui/button';

export default function FundraiserNotFound() {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center justify-center px-4 py-24 text-center">
      <h1 className="text-3xl font-bold text-gfm-dark">
        Fundraiser not found
      </h1>
      <p className="mt-3 text-muted-foreground">
        The fundraiser you&apos;re looking for doesn&apos;t exist or may have
        been removed.
      </p>
      <Link href="/" className="mt-6">
        <Button variant="outline" size="lg">
          Back to home
        </Button>
      </Link>
    </div>
  );
}
