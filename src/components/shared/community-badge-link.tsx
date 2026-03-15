import Image from 'next/image';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';

interface CommunityBadgeLinkProps {
  slug: string;
  name: string;
  logoUrl?: string | null;
}

export function CommunityBadgeLink({
  slug,
  name,
  logoUrl,
}: CommunityBadgeLinkProps) {
  return (
    <Link
      href={`/communities/${slug}`}
      className="inline-flex items-center gap-1.5 group"
    >
      {logoUrl && (
        <Image
          src={logoUrl}
          alt={name}
          width={16}
          height={16}
          className="h-4 w-4 rounded-full object-cover"
        />
      )}
      <Badge
        variant="secondary"
        className="text-[10px] px-1.5 py-0 h-4 group-hover:bg-muted"
      >
        {name}
      </Badge>
    </Link>
  );
}
