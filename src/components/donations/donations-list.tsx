import { Suspense } from "react";

import { DonationCard } from "@/components/donations/donation-card";
import { DonationsSkeleton } from "@/components/donations/donations-skeleton";
import {
  getRecentDonations,
  getTopDonations,
} from "@/lib/queries/donations";

interface DonationsListProps {
  fundraiserId: string;
  sort?: "recent" | "top";
}

async function DonationsListContent({
  fundraiserId,
  sort = "recent",
}: DonationsListProps) {
  const results =
    sort === "top"
      ? await getTopDonations(fundraiserId)
      : await getRecentDonations(fundraiserId);

  if (results.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">
        No donations yet. Be the first to contribute!
      </p>
    );
  }

  return (
    <div className="divide-y divide-border">
      {results.map(({ donation, donor }) => (
        <DonationCard
          key={donation.id}
          donation={donation}
          donor={donor}
        />
      ))}
    </div>
  );
}

export function DonationsList({
  fundraiserId,
  sort = "recent",
}: DonationsListProps) {
  return (
    <Suspense fallback={<DonationsSkeleton />}>
      <DonationsListContent
        fundraiserId={fundraiserId}
        sort={sort}
      />
    </Suspense>
  );
}
