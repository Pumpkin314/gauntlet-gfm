'use client';

import { useState } from 'react';

import { MicroDonatePicker } from '@/components/reactions/micro-donate-picker';

export const REACTION_EMOJI: Record<string, string> = {
  heart: '\u2764\uFE0F',
  clap: '\uD83D\uDC4F',
  hug: '\uD83E\uDD17',
  inspired: '\u2728',
  pray: '\uD83D\uDE4F',
  micro_donate: '\uD83D\uDCB0',
};

export const REACTION_LABELS: Record<string, string> = {
  heart: 'Heart',
  clap: 'Clap',
  hug: 'Hug',
  inspired: 'Inspired',
  pray: 'Pray',
  micro_donate: 'Donate',
};

const REACTION_TYPES = [
  'heart',
  'clap',
  'hug',
  'inspired',
  'pray',
  'micro_donate',
] as const;

interface ReactionPickerProps {
  onSelect: (reactionType: string, microDonationCents?: number) => void;
  currentReaction: string | null;
  userBalanceCents?: number;
}

export function ReactionPicker({
  onSelect,
  currentReaction,
  userBalanceCents = 0,
}: ReactionPickerProps) {
  const [showMicroDonate, setShowMicroDonate] = useState(false);

  if (showMicroDonate) {
    return (
      <MicroDonatePicker
        userBalanceCents={userBalanceCents}
        onConfirm={(amountCents) => {
          onSelect('micro_donate', amountCents);
          setShowMicroDonate(false);
        }}
        onCancel={() => setShowMicroDonate(false)}
      />
    );
  }

  return (
    <div className="reaction-picker-reveal flex items-center gap-1 rounded-full bg-white px-2 py-1.5 shadow-lg ring-1 ring-black/5 dark:bg-zinc-800 dark:ring-white/10">
      {REACTION_TYPES.map((type) => (
        <button
          key={type}
          type="button"
          onClick={() => {
            if (type === 'micro_donate') {
              setShowMicroDonate(true);
            } else {
              onSelect(type);
            }
          }}
          className={`group relative flex min-h-[44px] min-w-[44px] flex-col items-center justify-center rounded-full transition-transform hover:scale-125 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gfm-green ${
            currentReaction === type
              ? 'bg-gfm-green/10 ring-2 ring-gfm-green'
              : ''
          }`}
          aria-label={REACTION_LABELS[type]}
        >
          <span className="text-xl" role="img" aria-hidden="true">
            {REACTION_EMOJI[type]}
          </span>
          <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-medium text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
            {REACTION_LABELS[type]}
          </span>
        </button>
      ))}
    </div>
  );
}
