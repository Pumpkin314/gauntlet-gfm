import Link from "next/link";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import type { DonationWithDonor } from "@/lib/queries/donations";
import { formatCurrency } from "@/lib/utils/format";
import { relativeTime } from "@/lib/utils/time";

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function DonationCard({
  donation,
  donor,
}: DonationWithDonor) {
  const isAnonymous = donation.isAnonymous || !donor;
  const displayName = isAnonymous
    ? "Anonymous"
    : donor.displayName;
  const avatarUrl = isAnonymous ? null : donor.avatarUrl ?? donor.image;
  const username = isAnonymous ? null : donor.username;

  const card = (
    <div className="flex gap-3 py-3">
      <Avatar className="mt-0.5">
        {avatarUrl ? (
          <AvatarImage src={avatarUrl} alt={displayName} />
        ) : null}
        <AvatarFallback>
          {isAnonymous ? "?" : getInitials(displayName)}
        </AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <span className="truncate text-sm font-medium text-gfm-dark">
            {displayName}
          </span>
          <span className="shrink-0 text-xs text-muted-foreground">
            {donation.createdAt
              ? relativeTime(donation.createdAt)
              : ""}
          </span>
        </div>

        <p className="text-sm font-semibold text-gfm-green">
          {formatCurrency(donation.amountCents)}
        </p>

        {donation.message ? (
          <p className="mt-1 text-sm text-muted-foreground">
            {donation.message}
          </p>
        ) : null}
      </div>
    </div>
  );

  if (username) {
    return (
      <Link
        href={`/u/${username}`}
        className="block rounded-lg transition-colors hover:bg-muted/50"
      >
        {card}
      </Link>
    );
  }

  return card;
}
