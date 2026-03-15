import Link from 'next/link';
import { Heart, Megaphone } from 'lucide-react';

import { formatCents, formatRelativeDate } from '@/lib/format';

interface DonationActivity {
  type: 'donation';
  donation: {
    id: string;
    amountCents: number;
    message: string | null;
    isAnonymous: boolean | null;
    createdAt: Date | null;
  };
  fundraiser: {
    slug: string;
    title: string;
  };
}

interface FundraiserActivity {
  type: 'fundraiser_started';
  fundraiser: {
    slug: string;
    title: string;
    createdAt: Date | null;
  };
}

type ActivityItem = DonationActivity | FundraiserActivity;

interface ActivityFeedProps {
  donations: {
    donation: {
      id: string;
      amountCents: number;
      message: string | null;
      isAnonymous: boolean | null;
      createdAt: Date | null;
    };
    fundraiser: {
      slug: string;
      title: string;
      createdAt: Date | null;
    };
  }[];
  fundraisers: {
    fundraiser: {
      slug: string;
      title: string;
      createdAt: Date | null;
    };
  }[];
}

function mergeAndSort(
  donations: ActivityFeedProps['donations'],
  fundraisers: ActivityFeedProps['fundraisers'],
): ActivityItem[] {
  const items: ActivityItem[] = [];

  for (const d of donations) {
    items.push({
      type: 'donation',
      donation: d.donation,
      fundraiser: d.fundraiser,
    });
  }

  for (const f of fundraisers) {
    items.push({
      type: 'fundraiser_started',
      fundraiser: f.fundraiser,
    });
  }

  // Sort by date, most recent first
  items.sort((a, b) => {
    const dateA =
      a.type === 'donation'
        ? a.donation.createdAt
        : a.fundraiser.createdAt;
    const dateB =
      b.type === 'donation'
        ? b.donation.createdAt
        : b.fundraiser.createdAt;

    if (!dateA || !dateB) return 0;
    return dateB.getTime() - dateA.getTime();
  });

  return items;
}

export function ActivityFeed({ donations, fundraisers }: ActivityFeedProps) {
  const items = mergeAndSort(donations, fundraisers);

  if (items.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        No activity yet.
      </p>
    );
  }

  return (
    <div className="space-y-0">
      {items.map((item, idx) => {
        if (item.type === 'donation') {
          return (
            <div
              key={`donation-${item.donation.id}`}
              className="flex items-start gap-3 border-b border-border py-4 last:border-b-0 sm:py-3"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gfm-green/10">
                <Heart className="h-4 w-4 text-gfm-green" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-gfm-dark">
                  Donated{' '}
                  <span className="font-semibold">
                    {formatCents(item.donation.amountCents)}
                  </span>{' '}
                  to{' '}
                  <Link
                    href={`/f/${item.fundraiser.slug}`}
                    className="font-medium text-gfm-green hover:underline"
                  >
                    {item.fundraiser.title}
                  </Link>
                </p>
                {item.donation.message && (
                  <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                    &ldquo;{item.donation.message}&rdquo;
                  </p>
                )}
                {item.donation.createdAt && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatRelativeDate(item.donation.createdAt)}
                  </p>
                )}
              </div>
            </div>
          );
        }

        return (
          <div
            key={`fundraiser-${item.fundraiser.slug}-${idx}`}
            className="flex items-start gap-3 border-b border-border py-4 last:border-b-0 sm:py-3"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50">
              <Megaphone className="h-4 w-4 text-blue-600" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-gfm-dark">
                Started fundraiser{' '}
                <Link
                  href={`/f/${item.fundraiser.slug}`}
                  className="font-medium text-gfm-green hover:underline"
                >
                  {item.fundraiser.title}
                </Link>
              </p>
              {item.fundraiser.createdAt && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatRelativeDate(item.fundraiser.createdAt)}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
