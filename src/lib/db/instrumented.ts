// ---------------------------------------------------------------------------
// Timed query wrapper for observability
// ---------------------------------------------------------------------------

interface QueryTiming {
  label: string;
  durationMs: number;
}

/** Module-level buffer of collected query timings. */
let timings: QueryTiming[] = [];

/**
 * Execute an async query function while measuring its duration.
 * In development, logs the label and duration to the console.
 * Timing data is buffered and can be retrieved via `getTimings()`.
 */
export async function timedQuery<T>(
  label: string,
  fn: () => Promise<T>,
): Promise<T> {
  const start = performance.now();
  try {
    return await fn();
  } finally {
    const durationMs = performance.now() - start;
    timings.push({ label, durationMs });

    if (process.env.NODE_ENV === 'development') {
      console.log(
        `[db] ${label} completed in ${durationMs.toFixed(1)}ms`,
      );
    }
  }
}

/**
 * Return all collected timings and clear the buffer.
 * Call this once per request to drain the accumulated data.
 */
export function getTimings(): QueryTiming[] {
  const collected = timings;
  timings = [];
  return collected;
}

/**
 * Format collected timings as a `Server-Timing` header value.
 * Each entry becomes `db;desc="<label>";dur=<ms>`.
 * Returns an empty string when there are no timings.
 *
 * Example output:
 *   db;desc="fundraiser.getBySlug";dur=12.3, db;desc="donations.list";dur=8.1
 */
export function getServerTimingHeader(): string {
  const collected = getTimings();
  if (collected.length === 0) return '';

  return collected
    .map(
      (t) =>
        `db;desc="${t.label}";dur=${t.durationMs.toFixed(1)}`,
    )
    .join(', ');
}
