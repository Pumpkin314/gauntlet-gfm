import { Button } from '@/components/ui/button';

interface ChallengeCardProps {
  title: string | null;
  body: string | null;
}

export function ChallengeCard({ title, body }: ChallengeCardProps) {
  return (
    <div className="px-4">
      {title && (
        <h3 className="text-lg font-semibold text-gfm-dark">{title}</h3>
      )}

      {body && (
        <p className="mt-1 text-sm text-muted-foreground">{body}</p>
      )}

      {/* Placeholder thermometer bar */}
      <div className="mt-4">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>0 participants</span>
          <span>Goal: 100</span>
        </div>
        <div className="mt-1.5 h-3 w-full overflow-hidden rounded-full bg-muted">
          <div className="h-full w-0 rounded-full bg-gfm-green" />
        </div>
      </div>

      {/* CTA button (non-functional placeholder) */}
      <Button className="mt-4 w-full" variant="default" disabled>
        Join Challenge
      </Button>
    </div>
  );
}
