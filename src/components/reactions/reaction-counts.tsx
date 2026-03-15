import { REACTION_EMOJI } from '@/components/reactions/reaction-picker';

interface ReactionCountsProps {
  counts: Record<string, number>;
  total: number;
}

export function ReactionCounts({ counts, total }: ReactionCountsProps) {
  if (total === 0) return null;

  // Sort by count descending and take top 3
  const sorted = Object.entries(counts)
    .filter(([, count]) => count > 0)
    .sort(([, a], [, b]) => b - a);

  const top3 = sorted.slice(0, 3);

  // If only one type, show total with that emoji
  if (sorted.length === 1) {
    const [type] = sorted[0];
    return (
      <div className="flex items-center gap-1 text-sm text-muted-foreground">
        <span role="img" aria-hidden="true">
          {REACTION_EMOJI[type] ?? '\u2764\uFE0F'}
        </span>
        <span>{total}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 text-sm text-muted-foreground">
      <div className="flex -space-x-0.5">
        {top3.map(([type]) => (
          <span
            key={type}
            role="img"
            aria-hidden="true"
            className="text-xs"
          >
            {REACTION_EMOJI[type] ?? '\u2764\uFE0F'}
          </span>
        ))}
      </div>
      <span>{total}</span>
    </div>
  );
}
