import { Heart, Users, Award, Calendar } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCents, formatDate } from '@/lib/format';
import type { GivingSummary } from '@/lib/queries/users';

interface GivingIdentityCardProps {
  summary: GivingSummary;
}

export function GivingIdentityCard({ summary }: GivingIdentityCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-bold text-gfm-dark">
          Giving Identity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {/* Total donated */}
          <div className="flex items-start gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gfm-green/10">
              <Heart className="h-4 w-4 text-gfm-green" />
            </div>
            <div className="min-w-0">
              <p className="text-lg font-bold text-gfm-dark">
                {formatCents(summary.totalDonatedCents)}
              </p>
              <p className="text-xs text-muted-foreground">donated</p>
            </div>
          </div>

          {/* Causes supported */}
          <div className="flex items-start gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gfm-green/10">
              <Award className="h-4 w-4 text-gfm-green" />
            </div>
            <div className="min-w-0">
              <p className="text-lg font-bold text-gfm-dark">
                {summary.causesCount}
              </p>
              <p className="text-xs text-muted-foreground">
                {summary.causesCount === 1 ? 'cause' : 'causes'}
              </p>
            </div>
          </div>

          {/* Top cause */}
          {summary.topCause && (
            <div className="flex items-start gap-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gfm-green/10">
                <Award className="h-4 w-4 text-gfm-green" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-gfm-dark">
                  {summary.topCause}
                </p>
                <p className="text-xs text-muted-foreground">top cause</p>
              </div>
            </div>
          )}

          {/* Communities joined */}
          <div className="flex items-start gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gfm-green/10">
              <Users className="h-4 w-4 text-gfm-green" />
            </div>
            <div className="min-w-0">
              <p className="text-lg font-bold text-gfm-dark">
                {summary.communitiesJoined}
              </p>
              <p className="text-xs text-muted-foreground">
                {summary.communitiesJoined === 1 ? 'community' : 'communities'}
              </p>
            </div>
          </div>

          {/* Active since */}
          {summary.activeSince && (
            <div className="flex items-start gap-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gfm-green/10">
                <Calendar className="h-4 w-4 text-gfm-green" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gfm-dark">
                  {formatDate(summary.activeSince)}
                </p>
                <p className="text-xs text-muted-foreground">active since</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
