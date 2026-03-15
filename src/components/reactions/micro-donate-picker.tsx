'use client';

const PRESETS = [
  { label: '$1', cents: 100 },
  { label: '$2', cents: 200 },
  { label: '$5', cents: 500 },
];

interface MicroDonatePickerProps {
  userBalanceCents: number;
  onConfirm: (amountCents: number) => void;
  onCancel: () => void;
}

export function MicroDonatePicker({
  userBalanceCents,
  onConfirm,
  onCancel,
}: MicroDonatePickerProps) {
  const hasInsufficientBalance = userBalanceCents <= 0;

  return (
    <div className="reaction-picker-reveal flex flex-col items-center gap-2 rounded-2xl bg-white p-3 shadow-lg ring-1 ring-black/5 dark:bg-zinc-800 dark:ring-white/10">
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <span role="img" aria-hidden="true">
          {'\uD83D\uDCB0'}
        </span>
        <span>
          Balance: ${(userBalanceCents / 100).toFixed(2)}
        </span>
      </div>

      {hasInsufficientBalance ? (
        <p className="text-xs text-red-500">Insufficient balance</p>
      ) : (
        <div className="flex items-center gap-1.5">
          {PRESETS.map(({ label, cents }) => {
            const disabled = userBalanceCents < cents;
            return (
              <button
                key={cents}
                type="button"
                disabled={disabled}
                onClick={() => onConfirm(cents)}
                className={`min-h-[44px] min-w-[48px] rounded-xl px-3 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gfm-green ${
                  disabled
                    ? 'cursor-not-allowed bg-zinc-100 text-zinc-400 dark:bg-zinc-700 dark:text-zinc-500'
                    : 'bg-gfm-green/10 text-gfm-green hover:bg-gfm-green/20 active:bg-gfm-green/30'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      )}

      <button
        type="button"
        onClick={onCancel}
        className="text-xs text-muted-foreground transition-colors hover:text-foreground"
      >
        Cancel
      </button>
    </div>
  );
}
