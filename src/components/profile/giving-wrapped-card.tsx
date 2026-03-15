'use client';

import { useRef, useState } from 'react';
import { Download, Share2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { formatCents } from '@/lib/format';
import type { GivingSummary } from '@/lib/queries/users';

interface GivingWrappedCardProps {
  displayName: string;
  username: string;
  summary: GivingSummary;
}

export function GivingWrappedCard({
  displayName,
  username,
  summary,
}: GivingWrappedCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [sharing, setSharing] = useState(false);

  async function handleShare() {
    if (sharing) return;
    setSharing(true);

    try {
      // Try native share if available
      if (typeof navigator.share === 'function') {
        await navigator.share({
          title: `${displayName}'s 2026 Giving Wrapped`,
          text: `I've donated ${formatCents(summary.totalDonatedCents)} to ${summary.causesCount} causes on GoFundMe Reimagined!`,
          url: `${window.location.origin}/u/${username}`,
        });
      } else {
        await navigator.clipboard.writeText(
          `${displayName}'s 2026 Giving Wrapped: ${formatCents(summary.totalDonatedCents)} donated to ${summary.causesCount} causes! ${window.location.origin}/u/${username}`,
        );
      }
    } catch {
      // User cancelled or API not available
    } finally {
      setSharing(false);
    }
  }

  const hasDonations = summary.totalDonatedCents > 0;

  if (!hasDonations) return null;

  return (
    <div className="space-y-3">
      {/* The wrapped card */}
      <div
        ref={cardRef}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 via-green-600 to-teal-700 p-[2px]"
      >
        <div className="relative rounded-[14px] bg-gradient-to-br from-gray-900 via-gray-950 to-black p-6 sm:p-8">
          {/* Decorative elements */}
          <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-emerald-500/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-teal-500/10 blur-2xl" />

          {/* Header */}
          <div className="relative">
            <p className="text-xs font-medium uppercase tracking-widest text-emerald-400">
              2026 Giving Wrapped
            </p>
            <h3 className="mt-1 text-xl font-bold text-white sm:text-2xl">
              {displayName}
            </h3>
            <p className="text-sm text-white/50">@{username}</p>
          </div>

          {/* Stats */}
          <div className="relative mt-6 grid grid-cols-2 gap-4 sm:gap-6">
            <div>
              <p className="text-3xl font-extrabold text-white sm:text-4xl">
                {formatCents(summary.totalDonatedCents)}
              </p>
              <p className="mt-0.5 text-xs text-emerald-300/80">total donated</p>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-white sm:text-4xl">
                {summary.causesCount}
              </p>
              <p className="mt-0.5 text-xs text-emerald-300/80">
                {summary.causesCount === 1 ? 'cause supported' : 'causes supported'}
              </p>
            </div>
            {summary.communitiesJoined > 0 && (
              <div>
                <p className="text-3xl font-extrabold text-white sm:text-4xl">
                  {summary.communitiesJoined}
                </p>
                <p className="mt-0.5 text-xs text-emerald-300/80">
                  {summary.communitiesJoined === 1 ? 'community' : 'communities'}
                </p>
              </div>
            )}
            {summary.topCause && (
              <div>
                <p className="truncate text-lg font-bold text-white sm:text-xl">
                  {summary.topCause}
                </p>
                <p className="mt-0.5 text-xs text-emerald-300/80">top cause</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="relative mt-6 flex items-center justify-between border-t border-white/10 pt-4">
            <p className="text-[10px] font-medium uppercase tracking-wider text-white/30">
              GoFundMe Reimagined
            </p>
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500">
              <span className="text-xs font-bold text-white">G</span>
            </div>
          </div>
        </div>
      </div>

      {/* Share button */}
      <Button
        onClick={handleShare}
        disabled={sharing}
        variant="outline"
        className="w-full gap-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
      >
        <Share2 className="h-4 w-4" />
        Share your 2026 Giving
      </Button>
    </div>
  );
}
