'use client';

import { useState } from 'react';
import { Heart, MessageCircle, DollarSign, Share2, ExternalLink } from 'lucide-react';
import Link from 'next/link';

import { trackAction } from '@/lib/analytics/actions';
import { FYPQuickDonate } from './fyp-quick-donate';

interface FYPActionButtonsProps {
  postId: string;
  fundraiserId: string | null;
  fundraiserSlug: string | null;
  fundraiserTitle: string | null;
  reactionCount: number;
  commentCount: number;
}

interface ActionItemProps {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  href?: string;
}

function ActionItem({ icon, label, onClick, href }: ActionItemProps) {
  const content = (
    <>
      <span className="flex size-11 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm">
        {icon}
      </span>
      <span className="text-[10px] font-medium text-white drop-shadow-sm">
        {label}
      </span>
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="flex min-h-[44px] min-w-[44px] flex-col items-center gap-1"
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-[44px] min-w-[44px] flex-col items-center gap-1"
    >
      {content}
    </button>
  );
}

function formatCount(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
  return String(count);
}

export function FYPActionButtons({
  postId,
  fundraiserId,
  fundraiserSlug,
  fundraiserTitle,
  reactionCount,
  commentCount,
}: FYPActionButtonsProps) {
  const [donateOpen, setDonateOpen] = useState(false);
  const [liked, setLiked] = useState(false);
  const [localReactionCount, setLocalReactionCount] = useState(reactionCount);

  const handleShare = async () => {
    trackAction('share', { source: 'fyp' });
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Check out this fundraiser on GoFundMe Reimagined',
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
      }
    } catch {
      // User cancelled or API not available
    }
  };

  const handleHeart = () => {
    // Simple toggle for FYP — full ReactionButton is too complex for the right-rail
    setLiked((prev) => !prev);
    setLocalReactionCount((prev) => (liked ? prev - 1 : prev + 1));
    if (!liked) {
      trackAction('react', { contentPostId: postId, reactionType: 'heart', source: 'fyp' });
    }
  };

  return (
    <>
      <div className="pointer-events-auto flex flex-col items-center gap-4">
        <ActionItem
          icon={
            <Heart
              className={`size-5 ${liked ? 'fill-red-500 text-red-500' : 'text-white'}`}
            />
          }
          label={formatCount(localReactionCount)}
          onClick={handleHeart}
        />

        <ActionItem
          icon={<MessageCircle className="size-5 text-white" />}
          label={formatCount(commentCount)}
          href={`/content/${postId}`}
        />

        {fundraiserId && (
          <ActionItem
            icon={<DollarSign className="size-5 text-white" />}
            label="Donate"
            onClick={() => setDonateOpen(true)}
          />
        )}

        <ActionItem
          icon={<Share2 className="size-5 text-white" />}
          label="Share"
          onClick={handleShare}
        />

        {fundraiserSlug && (
          <ActionItem
            icon={<ExternalLink className="size-5 text-white" />}
            label="Fund It"
            href={`/f/${fundraiserSlug}`}
          />
        )}
      </div>

      {/* Quick Donate bottom sheet */}
      {fundraiserId && (
        <FYPQuickDonate
          fundraiserId={fundraiserId}
          fundraiserTitle={fundraiserTitle ?? 'Fundraiser'}
          open={donateOpen}
          onOpenChange={setDonateOpen}
        />
      )}
    </>
  );
}
