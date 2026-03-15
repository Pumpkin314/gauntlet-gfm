'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export function DashboardRefresh() {
  const router = useRouter();
  const [secondsLeft, setSecondsLeft] = useState(30);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          router.refresh();
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [router]);

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-muted-foreground">
        Auto-refresh in {secondsLeft}s
      </span>
      <button
        onClick={() => {
          router.refresh();
          setSecondsLeft(30);
        }}
        className="rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium text-gfm-dark transition-colors hover:bg-muted"
      >
        Refresh now
      </button>
    </div>
  );
}
