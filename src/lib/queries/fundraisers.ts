import { eq } from 'drizzle-orm';

import { cachedQuery } from '@/lib/cache';
import { db } from '@/lib/db';
import { communities, fundraisers, users } from '@/lib/db/schema';

export async function getFundraiserBySlug(slug: string) {
  return cachedQuery(`fundraiser:${slug}`, 60, async () => {
    const result = await db
      .select({
        fundraiser: fundraisers,
        organizer: users,
        community: communities,
      })
      .from(fundraisers)
      .leftJoin(users, eq(fundraisers.organizerId, users.id))
      .leftJoin(communities, eq(fundraisers.communityId, communities.id))
      .where(eq(fundraisers.slug, slug));

    return result[0] ?? null;
  });
}

export async function getAllFundraiserSlugs() {
  const result = await db
    .select({ slug: fundraisers.slug })
    .from(fundraisers);

  return result.map((r) => r.slug);
}
