'use client';

import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { formatCents } from '@/lib/format';

interface MobileDonateBarProps {
  raisedCents: number;
  goalCents: number;
  slug: string;
}

export function MobileDonateBar({
  raisedCents,
  goalCents,
  slug,
}: MobileDonateBarProps) {
  const percentage = Math.min(
    Math.round((raisedCents / goalCents) * 100),
    100,
  );

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card px-4 py-3 shadow-[0_-4px_12px_rgba(0,0,0,0.1)] lg:hidden">
      <div className="flex items-center gap-3">
        {/* Mini progress info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-1">
            <span className="text-sm font-bold text-gfm-dark">
              {formatCents(raisedCents)}
            </span>
            <span className="text-xs text-muted-foreground">
              {percentage}%
            </span>
          </div>
          <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-gfm-green transition-all duration-500"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        {/* Donate button */}
        <Link href={`/f/${slug}/donate`}>
          <Button className="h-10 px-6 font-bold bg-gfm-green hover:bg-gfm-green/90 text-white border-transparent">
            Donate
          </Button>
        </Link>
      </div>
    </div>
  );
}
