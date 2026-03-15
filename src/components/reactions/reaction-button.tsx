'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useTransition,
} from 'react';

import '@/components/reactions/reaction-animation.css';

import { toggleReaction } from '@/lib/actions/reactions';

import {
  REACTION_EMOJI,
  ReactionPicker,
} from '@/components/reactions/reaction-picker';

interface ReactionButtonProps {
  contentPostId: string;
  currentReaction: string | null;
  reactionCount: number;
  isAuthenticated: boolean;
  userBalanceCents?: number;
}

export function ReactionButton({
  contentPostId,
  currentReaction: initialReaction,
  reactionCount: initialCount,
  isAuthenticated,
  userBalanceCents = 0,
}: ReactionButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [currentReaction, setCurrentReaction] = useState(initialReaction);
  const [reactionCount, setReactionCount] = useState(initialCount);
  const [showPicker, setShowPicker] = useState(false);
  const [floatingEmoji, setFloatingEmoji] = useState<string | null>(null);
  const [popKey, setPopKey] = useState(0);

  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync with server state when props change
  useEffect(() => {
    setCurrentReaction(initialReaction);
    setReactionCount(initialCount);
  }, [initialReaction, initialCount]);

  // Close picker when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowPicker(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleReaction = useCallback(
    (reactionType: string, microDonationCents?: number) => {
      if (!isAuthenticated) return;

      // Optimistic update
      const wasSameReaction = currentReaction === reactionType;
      const hadReaction = currentReaction !== null;

      if (wasSameReaction) {
        // Un-react
        setCurrentReaction(null);
        setReactionCount((prev) => Math.max(prev - 1, 0));
      } else {
        setCurrentReaction(reactionType);
        if (!hadReaction) {
          setReactionCount((prev) => prev + 1);
        }
        // Trigger float-up animation
        setFloatingEmoji(REACTION_EMOJI[reactionType] ?? null);
        setTimeout(() => setFloatingEmoji(null), 600);
      }

      // Trigger pop animation
      setPopKey((prev) => prev + 1);

      // Close picker
      setShowPicker(false);

      // Call server action
      startTransition(async () => {
        const result = await toggleReaction(
          contentPostId,
          reactionType,
          microDonationCents,
        );

        if (result.success) {
          setCurrentReaction(result.reactionType);
          setReactionCount(result.reactionCount);
        } else {
          // Revert optimistic update on failure
          setCurrentReaction(initialReaction);
          setReactionCount(initialCount);
        }
      });
    },
    [
      contentPostId,
      currentReaction,
      initialReaction,
      initialCount,
      isAuthenticated,
    ],
  );

  // Desktop hover: show picker after 300ms delay
  const handleMouseEnter = useCallback(() => {
    if (!isAuthenticated) return;
    hoverTimeoutRef.current = setTimeout(() => {
      setShowPicker(true);
    }, 300);
  }, [isAuthenticated]);

  const handleMouseLeave = useCallback(() => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    // Delay closing so user can move to the picker
    hoverTimeoutRef.current = setTimeout(() => {
      setShowPicker(false);
    }, 300);
  }, []);

  // Mobile long-press: show picker after 500ms
  const handleTouchStart = useCallback(() => {
    if (!isAuthenticated) return;
    touchTimeoutRef.current = setTimeout(() => {
      setShowPicker(true);
    }, 500);
  }, [isAuthenticated]);

  const handleTouchEnd = useCallback(() => {
    if (touchTimeoutRef.current) {
      clearTimeout(touchTimeoutRef.current);
      touchTimeoutRef.current = null;
    }
  }, []);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
      if (touchTimeoutRef.current) clearTimeout(touchTimeoutRef.current);
    };
  }, []);

  const emoji = currentReaction
    ? (REACTION_EMOJI[currentReaction] ?? '\u2764\uFE0F')
    : '\u2764\uFE0F';
  const isActive = currentReaction !== null;

  return (
    <div
      ref={containerRef}
      className="relative inline-flex items-center"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Floating emoji animation */}
      {floatingEmoji && (
        <span className="reaction-float-up text-lg" aria-hidden="true">
          {floatingEmoji}
        </span>
      )}

      {/* Reaction picker popover */}
      {showPicker && (
        <div className="absolute -top-16 left-1/2 z-50 -translate-x-1/2">
          <ReactionPicker
            onSelect={handleReaction}
            currentReaction={currentReaction}
            userBalanceCents={userBalanceCents}
          />
        </div>
      )}

      {/* Main reaction button */}
      <button
        key={popKey}
        type="button"
        disabled={isPending || !isAuthenticated}
        onClick={() => handleReaction(currentReaction ?? 'heart')}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className={`reaction-pop flex min-h-[44px] items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gfm-green disabled:cursor-not-allowed disabled:opacity-50 ${
          isActive
            ? 'bg-gfm-green/10 text-gfm-green'
            : 'text-muted-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800'
        }`}
        aria-label={
          isActive
            ? `Remove ${currentReaction} reaction`
            : 'React with heart'
        }
        aria-pressed={isActive}
      >
        <span role="img" aria-hidden="true" className="text-base">
          {emoji}
        </span>
        <span>{reactionCount}</span>
      </button>
    </div>
  );
}
