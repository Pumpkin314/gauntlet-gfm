import Link from 'next/link';

import { OrganizerCard } from '@/components/fundraiser/organizer-card';
import { ProgressBar } from '@/components/fundraiser/progress-bar';
import { ShareButton } from '@/components/fundraiser/share-button';
import { Button } from '@/components/ui/button';

interface DonateSidebarProps {
  fundraiser: {
    slug: string;
    title: string;
    raisedCents: number | null;
    goalCents: number;
    donationCount: number | null;
  };
  organizer: {
    username: string;
    displayName: string;
    avatarUrl: string | null;
    image: string | null;
    location: string | null;
  } | null;
  community: {
    slug: string;
    name: string;
    logoUrl: string | null;
  } | null;
}

export function DonateSidebar({
  fundraiser,
  organizer,
  community,
}: DonateSidebarProps) {
  return (
    <div className="sticky top-24">
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        {/* Progress */}
        <ProgressBar
          raisedCents={fundraiser.raisedCents ?? 0}
          goalCents={fundraiser.goalCents}
          donationCount={fundraiser.donationCount ?? 0}
        />

        {/* Donate button */}
        <Link href={`/f/${fundraiser.slug}/donate`} className="block mt-5">
          <Button
            className="w-full h-12 text-base font-bold bg-gfm-green hover:bg-gfm-green/90 text-white border-transparent"
            size="lg"
          >
            Donate now
          </Button>
        </Link>

        {/* Share button */}
        <div className="mt-3">
          <ShareButton
            title={fundraiser.title}
            text={`Support "${fundraiser.title}" on GoFundMe Reimagined`}
          />
        </div>
      </div>

      {/* Organizer card */}
      {organizer && (
        <div className="mt-4">
          <OrganizerCard
            organizer={organizer}
            community={community}
            variant="card"
          />
        </div>
      )}
    </div>
  );
}
