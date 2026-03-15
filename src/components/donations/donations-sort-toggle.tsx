"use client";

import { cn } from "@/lib/utils";

export type DonationSort = "recent" | "top";

interface DonationsSortToggleProps {
  value: DonationSort;
  onChange: (sort: DonationSort) => void;
}

const options: { label: string; value: DonationSort }[] = [
  { label: "Recent", value: "recent" },
  { label: "Top", value: "top" },
];

export function DonationsSortToggle({
  value,
  onChange,
}: DonationsSortToggleProps) {
  return (
    <div className="inline-flex rounded-lg bg-muted p-0.5">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={cn(
            "rounded-md px-3 py-1 text-sm font-medium transition-colors",
            value === option.value
              ? "bg-background text-gfm-dark shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
