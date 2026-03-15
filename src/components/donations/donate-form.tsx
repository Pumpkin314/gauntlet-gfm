'use client';

import Link from 'next/link';
import { useCallback, useState, useTransition } from 'react';

import { Button } from '@/components/ui/button';
import {
  createDonation,
  type CreateDonationResult,
} from '@/lib/actions/donations';
import { formatCents } from '@/lib/format';

const PRESET_AMOUNTS_CENTS = [2500, 5000, 10000, 25000] as const;

interface DonateFormProps {
  fundraiserId: string;
  fundraiserSlug: string;
  fundraiserTitle: string;
  raisedCents: number;
  goalCents: number;
  isAuthenticated: boolean;
}

export function DonateForm({
  fundraiserId,
  fundraiserSlug,
  fundraiserTitle,
  raisedCents,
  goalCents,
  isAuthenticated,
}: DonateFormProps) {
  const [selectedPreset, setSelectedPreset] = useState<number | null>(5000);
  const [customAmount, setCustomAmount] = useState('');
  const [isCustom, setIsCustom] = useState(false);
  const [message, setMessage] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [result, setResult] = useState<CreateDonationResult | null>(null);
  const [isPending, startTransition] = useTransition();

  const amountCents = isCustom
    ? Math.round(parseFloat(customAmount || '0') * 100)
    : (selectedPreset ?? 0);

  const handlePresetClick = useCallback((cents: number) => {
    setSelectedPreset(cents);
    setIsCustom(false);
    setCustomAmount('');
  }, []);

  const handleCustomFocus = useCallback(() => {
    setIsCustom(true);
    setSelectedPreset(null);
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      if (amountCents < 100) return;

      startTransition(async () => {
        const res = await createDonation({
          fundraiserId,
          amountCents,
          message: message.trim() || undefined,
          isAnonymous,
        });
        setResult(res);
      });
    },
    [fundraiserId, amountCents, message, isAnonymous],
  );

  const percentage = Math.min(
    Math.round((raisedCents / goalCents) * 100),
    100,
  );

  // ---------- Success state ----------
  if (result?.success) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 text-center">
        {/* Celebration animation */}
        <div className="relative">
          <div className="celebration-burst" />
          <div className="animate-scale-in flex size-20 items-center justify-center rounded-full bg-gfm-green text-white">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-10"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          {/* Confetti dots */}
          {Array.from({ length: 12 }).map((_, i) => (
            <span
              key={i}
              className="confetti-dot"
              style={
                {
                  '--i': i,
                  '--color': ['#00b964', '#fbbf24', '#3b82f6', '#ef4444'][
                    i % 4
                  ],
                } as React.CSSProperties
              }
            />
          ))}
        </div>

        <h2 className="mt-8 text-2xl font-bold text-gfm-dark animate-fade-up">
          Thank you for your donation!
        </h2>
        <p className="mt-2 text-muted-foreground animate-fade-up animation-delay-100">
          You donated{' '}
          <span className="font-semibold text-gfm-green">
            {formatCents(amountCents, { showCents: true })}
          </span>{' '}
          to {fundraiserTitle}
        </p>

        <div className="mt-8 flex gap-3 animate-fade-up animation-delay-200">
          <Link href={`/f/${fundraiserSlug}`}>
            <Button
              className="bg-gfm-green hover:bg-gfm-green/90 text-white border-transparent font-bold px-6 h-11"
              size="lg"
            >
              View fundraiser
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // ---------- Not authenticated ----------
  if (!isAuthenticated) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center px-4 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-muted">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-8 text-muted-foreground"
          >
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </div>
        <h2 className="mt-4 text-xl font-bold text-gfm-dark">
          Sign in to donate
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          You need to be signed in to make a donation.
        </p>
        <div className="mt-6 flex gap-3">
          <Link href="/sign-in">
            <Button
              className="bg-gfm-green hover:bg-gfm-green/90 text-white border-transparent font-bold px-6 h-11"
              size="lg"
            >
              Sign in
            </Button>
          </Link>
          <Link href={`/f/${fundraiserSlug}`}>
            <Button variant="outline" size="lg" className="h-11 px-6">
              Go back
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // ---------- Donate form ----------
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Progress summary */}
      <div className="rounded-lg border border-border bg-card p-4">
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-gfm-dark">
            {formatCents(raisedCents)}
          </span>{' '}
          raised of {formatCents(goalCents)} goal
        </p>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-gfm-green transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Amount selection */}
      <div>
        <label className="block text-sm font-semibold text-gfm-dark mb-3">
          Choose an amount
        </label>
        <div className="grid grid-cols-2 gap-3">
          {PRESET_AMOUNTS_CENTS.map((cents) => (
            <button
              key={cents}
              type="button"
              onClick={() => handlePresetClick(cents)}
              className={`h-12 rounded-lg border-2 text-base font-bold transition-all ${
                !isCustom && selectedPreset === cents
                  ? 'border-gfm-green bg-gfm-green/5 text-gfm-green'
                  : 'border-border bg-card text-gfm-dark hover:border-gfm-green/50'
              }`}
            >
              {formatCents(cents)}
            </button>
          ))}
        </div>

        {/* Custom amount */}
        <div className="mt-3">
          <div
            className={`flex h-12 items-center rounded-lg border-2 bg-card transition-all ${
              isCustom
                ? 'border-gfm-green'
                : 'border-border hover:border-gfm-green/50'
            }`}
          >
            <span className="pl-4 text-base font-bold text-muted-foreground">
              $
            </span>
            <input
              type="number"
              inputMode="decimal"
              step="0.01"
              min="1"
              max="1000000"
              placeholder="Other amount"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              onFocus={handleCustomFocus}
              className="h-full flex-1 bg-transparent px-2 text-base font-bold text-gfm-dark outline-none placeholder:font-normal placeholder:text-muted-foreground"
            />
          </div>
        </div>
      </div>

      {/* Message */}
      <div>
        <label
          htmlFor="donation-message"
          className="block text-sm font-semibold text-gfm-dark mb-2"
        >
          Add a message{' '}
          <span className="font-normal text-muted-foreground">(optional)</span>
        </label>
        <textarea
          id="donation-message"
          rows={3}
          maxLength={500}
          placeholder="Write a message of support..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full rounded-lg border-2 border-border bg-card px-4 py-3 text-sm text-gfm-dark outline-none transition-colors placeholder:text-muted-foreground focus:border-gfm-green"
        />
        <p className="mt-1 text-xs text-muted-foreground text-right">
          {message.length}/500
        </p>
      </div>

      {/* Anonymous toggle */}
      <label className="flex items-center gap-3 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={isAnonymous}
          onChange={(e) => setIsAnonymous(e.target.checked)}
          className="size-5 rounded border-border accent-gfm-green cursor-pointer"
        />
        <span className="text-sm text-gfm-dark">
          Make my donation anonymous
        </span>
      </label>

      {/* Error message */}
      {result && !result.success && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {result.error}
        </div>
      )}

      {/* Submit button */}
      <Button
        type="submit"
        disabled={isPending || amountCents < 100}
        className="w-full h-12 text-base font-bold bg-gfm-green hover:bg-gfm-green/90 text-white border-transparent disabled:opacity-50"
        size="lg"
      >
        {isPending ? (
          <span className="flex items-center gap-2">
            <svg
              className="animate-spin size-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Processing...
          </span>
        ) : (
          `Donate ${amountCents >= 100 ? formatCents(amountCents, { showCents: true }) : ''}`
        )}
      </Button>
    </form>
  );
}
