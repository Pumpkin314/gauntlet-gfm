import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { ContentFeed } from '@/components/content-feed';
import { ActivityFeed } from '@/components/profile/activity-feed';
import { FundraiserCard } from '@/components/shared/fundraiser-card';
import { GivingIdentityCard } from '@/components/profile/giving-identity-card';
import { GivingWrappedCard } from '@/components/profile/giving-wrapped-card';
import { ProfileHeader } from '@/components/profile/profile-header';
import { getCurrentUser } from '@/lib/auth';
import { getContentByAuthorId } from '@/lib/queries/content';
import {
  getAllUsernames,
  getUserByUsername,
  getUserDonations,
  getUserFollowCounts,
  getUserFundraisers,
  getUserGivingSummary,
  isUserFollowing,
} from '@/lib/queries/users';

export const revalidate = 60;

export async function generateStaticParams() {
  const usernames = await getAllUsernames();
  return usernames.map((username) => ({ username }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  const user = await getUserByUsername(username);

  if (!user) {
    return { title: 'User Not Found' };
  }

  const description =
    user.bio?.slice(0, 160) ?? `Check out ${user.displayName}'s profile on GoFundMe Reimagined.`;

  return {
    title: `${user.displayName} (@${user.username}) | GoFundMe Reimagined`,
    description,
    openGraph: {
      title: `${user.displayName} (@${user.username})`,
      description,
      images: user.avatarUrl ? [user.avatarUrl] : [],
      type: 'profile',
    },
    twitter: {
      card: 'summary',
      title: `${user.displayName} (@${user.username})`,
      description,
      images: user.avatarUrl ? [user.avatarUrl] : [],
    },
  };
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const user = await getUserByUsername(username);

  if (!user) {
    notFound();
  }

  // Fetch all data in parallel
  const currentUser = await getCurrentUser();
  const [
    fundraiserData,
    donationData,
    givingSummary,
    followCounts,
    following,
    contentItems,
  ] = await Promise.all([
    getUserFundraisers(user.id),
    getUserDonations(user.id, 10),
    getUserGivingSummary(user.id, user.createdAt),
    getUserFollowCounts(user.id),
    currentUser ? isUserFollowing(currentUser.id, user.id) : false,
    getContentByAuthorId(user.id),
  ]);

  const isOwnProfile = currentUser?.id === user.id;

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Profile Header */}
      <ProfileHeader
        user={user}
        followCounts={followCounts}
        isOwnProfile={isOwnProfile}
        isFollowing={following}
      />

      {/* Giving Identity Card */}
      <div className="mt-8">
        <GivingIdentityCard summary={givingSummary} />
      </div>

      {/* Giving Wrapped */}
      <div className="mt-6">
        <GivingWrappedCard
          displayName={user.displayName}
          username={user.username}
          summary={givingSummary}
        />
      </div>

      {/* Fundraisers */}
      {fundraiserData.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-4 text-lg font-bold text-gfm-dark">
            Fundraisers
          </h2>
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {fundraiserData.map(({ fundraiser, community }) => (
              <FundraiserCard
                key={fundraiser.id}
                fundraiser={fundraiser}
                community={community}
                fixedWidth
              />
            ))}
          </div>
        </section>
      )}

      {/* Recent Activity */}
      <section className="mt-8">
        <h2 className="mb-4 text-lg font-bold text-gfm-dark">
          Recent Activity
        </h2>
        <ActivityFeed
          donations={donationData}
          fundraisers={fundraiserData}
        />
      </section>

      {/* Content Posts */}
      {contentItems.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-4 text-lg font-bold text-gfm-dark">Posts</h2>
          <ContentFeed items={contentItems} />
        </section>
      )}
    </div>
  );
}
