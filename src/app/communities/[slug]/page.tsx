import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

import { CommunityHeader } from '@/components/community/community-header';
import { CommunityTabs } from '@/components/community/community-tabs';
import { ImpactStats } from '@/components/community/impact-stats';
import { getContentByCommunityId } from '@/lib/queries/content';
import {
  getAllCommunitySlugs,
  getCommunityBySlug,
  getCommunityFundraisers,
  getCommunityLeaderboard,
  getCommunityMembers,
  getCommunityPosts,
} from '@/lib/queries/communities';

export const revalidate = 60;

export async function generateStaticParams() {
  const slugs = await getAllCommunitySlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const community = await getCommunityBySlug(slug);

  if (!community) {
    return { title: 'Community Not Found' };
  }

  return {
    title: `${community.name} | GoFundMe Reimagined`,
    description:
      community.description?.slice(0, 160) ??
      `Support ${community.name} on GoFundMe Reimagined.`,
    openGraph: {
      title: community.name,
      description:
        community.description?.slice(0, 160) ??
        `Support ${community.name} on GoFundMe Reimagined.`,
      images: community.bannerImageUrl ? [community.bannerImageUrl] : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: community.name,
      description:
        community.description?.slice(0, 160) ??
        `Support ${community.name} on GoFundMe Reimagined.`,
      images: community.bannerImageUrl ? [community.bannerImageUrl] : [],
    },
  };
}

export default async function CommunityPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const community = await getCommunityBySlug(slug);

  if (!community) {
    notFound();
  }

  // Fetch all data in parallel
  const [fundraisers, leaderboard, members, posts, contentItems] =
    await Promise.all([
      getCommunityFundraisers(community.id),
      getCommunityLeaderboard(community.id),
      getCommunityMembers(community.id),
      getCommunityPosts(community.id),
      getContentByCommunityId(community.id),
    ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Header: banner, logo, name, description, follow button */}
      <CommunityHeader community={community} members={members} />

      {/* Impact stats bar */}
      <div className="mt-6 rounded-xl border border-border">
        <ImpactStats
          totalRaisedCents={community.totalRaisedCents ?? 0}
          totalDonations={community.totalDonations ?? 0}
          fundraiserCount={community.fundraiserCount ?? 0}
        />
      </div>

      {/* Tabbed content */}
      <div className="mt-8">
        <Suspense fallback={null}>
          <CommunityTabs
            fundraisers={fundraisers}
            leaderboard={leaderboard}
            posts={posts}
            members={members}
            communityDescription={community.description}
            contentItems={contentItems}
            communityId={community.id}
          />
        </Suspense>
      </div>
    </div>
  );
}
