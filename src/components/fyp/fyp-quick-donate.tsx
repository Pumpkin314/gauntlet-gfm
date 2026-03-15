'use client';

import { useState, useTransition } from 'react';
import { DollarSign, Check, Loader2 } from 'lucide-react';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { createDonation } from '@/lib/actions/donations';

const PRESETS = [500, 1000, 2500, 5000] as const;

interface FYPQuickDonateProps {
  fundraiserId: string;
  fundraiserTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FYPQuickDonate({
  fundraiserId,
  fundraiserTitle,
  open,
  onOpenChange,
}: FYPQuickDonateProps) {
  const [selectedCents, setSelectedCents] = useState<number>(1000);
  const [customAmount, setCustomAmount] = useState('');
  const [isCustom, setIsCustom] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const amountCents = isCustom
    ? Math.round(parseFloat(customAmount || '0') * 100)
    : selectedCents;

  const isValidAmount = amountCents >= 100 && amountCents <= 100000000;

  function handlePresetSelect(cents: number) {
    setSelectedCents(cents);
    setIsCustom(false);
    setCustomAmount('');
  }

  function handleCustomFocus() {
    setIsCustom(true);
  }

  function handleSubmit() {
    if (!isValidAmount) return;

    startTransition(async () => {
      const res = await createDonation({
        fundraiserId,
        amountCents,
        source: 'fyp_quick_donate',
      });

      if (res.success) {
        setResult('success');
        // Auto-close after brief confirmation
        setTimeout(() => {
          setResult('idle');
          onOpenChange(false);
        }, 1500);
      } else {
        setResult('error');
        setErrorMessage(res.error);
      }
    });
  }

  function handleClose(nextOpen: boolean) {
    if (!nextOpen) {
      // Reset state on close
      setResult('idle');
      setErrorMessage('');
      setIsCustom(false);
      setCustomAmount('');
      setSelectedCents(1000);
    }
    onOpenChange(nextOpen);
  }

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent side="bottom" className="rounded-t-2xl pb-8">
        <SheetHeader>
          <SheetTitle>Quick Donate</SheetTitle>
          <SheetDescription className="line-clamp-1">
            {fundraiserTitle}
          </SheetDescription>
        </SheetHeader>

        {result === 'success' ? (
          <div className="flex flex-col items-center gap-3 py-8">
            <div className="flex size-16 items-center justify-center rounded-full bg-green-100 text-green-600">
              <Check className="size-8" />
            </div>
            <p className="text-lg font-semibold">Thank you!</p>
            <p className="text-sm text-muted-foreground">
              Your ${(amountCents / 100).toFixed(2)} donation was successful.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4 px-4 pb-2">
            {/* Preset amounts */}
            <div className="grid grid-cols-4 gap-2">
              {PRESETS.map((cents) => (
                <button
                  key={cents}
                  type="button"
                  onClick={() => handlePresetSelect(cents)}
                  className={`rounded-xl border-2 px-3 py-3 text-center text-sm font-semibold transition-colors ${
                    !isCustom && selectedCents === cents
                      ? 'border-green-600 bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400'
                      : 'border-zinc-200 text-zinc-700 hover:border-zinc-300 dark:border-zinc-700 dark:text-zinc-300'
                  }`}
                >
                  ${cents / 100}
                </button>
              ))}
            </div>

            {/* Custom amount */}
            <div className="relative">
              <DollarSign className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
              <input
                type="number"
                inputMode="decimal"
                placeholder="Custom amount"
                value={customAmount}
                onChange={(e) => {
                  setCustomAmount(e.target.value);
                  setIsCustom(true);
                }}
                onFocus={handleCustomFocus}
                min="1"
                step="0.01"
                className={`w-full rounded-xl border-2 bg-transparent py-3 pl-8 pr-3 text-sm font-medium outline-none transition-colors placeholder:text-zinc-400 ${
                  isCustom
                    ? 'border-green-600'
                    : 'border-zinc-200 dark:border-zinc-700'
                }`}
              />
            </div>

            {/* Error message */}
            {result === 'error' && (
              <p className="text-center text-sm text-red-500">{errorMessage}</p>
            )}

            {/* Submit button */}
            <Button
              onClick={handleSubmit}
              disabled={isPending || !isValidAmount}
              className="h-12 w-full rounded-xl bg-green-600 text-base font-semibold text-white hover:bg-green-700 disabled:opacity-50"
            >
              {isPending ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                `Donate $${(amountCents / 100).toFixed(2)}`
              )}
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
