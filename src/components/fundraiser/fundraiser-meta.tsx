import { CalendarDays, Shield, Tag } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/format';

interface FundraiserMetaProps {
  createdAt: Date | string | null;
  category: string | null;
  taxDeductible: boolean;
}

export function FundraiserMeta({
  createdAt,
  category,
  taxDeductible,
}: FundraiserMetaProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {createdAt && (
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <CalendarDays className="h-4 w-4" />
          <span>Created {formatDate(createdAt)}</span>
        </div>
      )}

      {category && (
        <Badge variant="secondary" className="gap-1">
          <Tag className="h-3 w-3" />
          {category}
        </Badge>
      )}

      {taxDeductible && (
        <Badge variant="secondary" className="gap-1">
          <Shield className="h-3 w-3" />
          Tax-deductible
        </Badge>
      )}
    </div>
  );
}
