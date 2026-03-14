/**
 * Database seed script for GoFundMe Reimagined.
 *
 * Reads docs/seed-data.json (single source of truth) and populates all
 * Postgres tables. Idempotent — clears all tables before inserting.
 *
 * Run via: npm run db:seed
 */

import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq, sql } from 'drizzle-orm';
import * as fs from 'fs';
import * as path from 'path';
import Mux from '@mux/mux-node';

import * as schema from './schema';

// ── Drizzle client for seed (standalone script) ─────────────────────────────
const sqlClient = neon(process.env.DATABASE_URL!);
const db = drizzle(sqlClient, { schema });

// ── Load seed data ──────────────────────────────────────────────────────────
const seedPath = path.resolve(__dirname, '../../../docs/seed-data.json');
const seedData = JSON.parse(fs.readFileSync(seedPath, 'utf-8'));

// ── Mux client ──────────────────────────────────────────────────────────────
const mux = new Mux({
  tokenId: process.env.MUX_TOKEN_ID!,
  tokenSecret: process.env.MUX_TOKEN_SECRET!,
});

// ── Helpers ─────────────────────────────────────────────────────────────────
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateId(): string {
  return crypto.randomUUID();
}

/**
 * Wait for a given number of milliseconds.
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Resolve Pexels page URLs to direct CDN video file URLs.
 * Pexels page URLs return HTML, so Mux cannot ingest them.
 * We extract the video ID and try multiple resolution variants.
 */
function getPexelsDirectUrls(pageUrl: string): string[] {
  const match = pageUrl.match(/(\d+)\/?$/);
  if (!match) return [];
  const id = match[1];
  // Try multiple resolution/fps variants (Pexels isn't consistent)
  return [
    `https://videos.pexels.com/video-files/${id}/${id}-hd_1920_1080_30fps.mp4`,
    `https://videos.pexels.com/video-files/${id}/${id}-hd_1920_1080_25fps.mp4`,
    `https://videos.pexels.com/video-files/${id}/${id}-hd_1280_720_30fps.mp4`,
    `https://videos.pexels.com/video-files/${id}/${id}-hd_1280_720_25fps.mp4`,
    `https://videos.pexels.com/video-files/${id}/${id}-uhd_2560_1440_30fps.mp4`,
    `https://videos.pexels.com/video-files/${id}/${id}-uhd_2560_1440_25fps.mp4`,
    `https://videos.pexels.com/video-files/${id}/${id}-sd_960_540_30fps.mp4`,
    `https://videos.pexels.com/video-files/${id}/${id}-sd_960_540_25fps.mp4`,
    `https://videos.pexels.com/video-files/${id}/${id}-sd_640_360_30fps.mp4`,
    `https://videos.pexels.com/video-files/${id}/${id}-sd_640_360_25fps.mp4`,
  ];
}

/**
 * Well-known public MP4 test videos as final fallbacks.
 * These are guaranteed to be accessible by Mux.
 */
const PUBLIC_FALLBACK_VIDEOS = [
  'https://storage.googleapis.com/muxdemofiles/mux-video-intro.mp4',
  'https://test-streams.mux.dev/x36xhzz/x36xhzz.mp4',
];

/**
 * Upload a video to Mux from a URL, poll until ready, and return the
 * playback ID and asset ID. Resolves Pexels page URLs to direct CDN URLs.
 * Falls back to public test videos if Pexels CDN is unavailable.
 * Returns null values if all attempts fail.
 */
async function uploadMuxVideo(
  videoId: string,
  sourceUrl: string,
  fallbackUrl: string | null,
): Promise<{ playbackId: string | null; assetId: string | null }> {
  const pageUrls = [sourceUrl, fallbackUrl].filter(Boolean) as string[];

  // Build list of direct URLs to try: resolved Pexels CDN variants, then fallbacks
  const candidateUrls: string[] = [];
  for (const pageUrl of pageUrls) {
    candidateUrls.push(...getPexelsDirectUrls(pageUrl));
  }
  // Add public fallback videos as last resort
  candidateUrls.push(...PUBLIC_FALLBACK_VIDEOS);

  // Pre-filter: HEAD request to find URLs that actually exist (200 OK)
  const urlsToTry: string[] = [];
  for (const url of candidateUrls) {
    try {
      const headResp = await fetch(url, { method: 'HEAD', redirect: 'follow' });
      if (headResp.ok) {
        console.log(`  [Pexels] Found accessible video: ${url.substring(0, 80)}...`);
        urlsToTry.push(url);
        break; // Only need one working URL per source
      }
    } catch {
      // URL not accessible, skip
    }
  }
  // If none found, use the fallback directly
  if (urlsToTry.length === 0) {
    urlsToTry.push(...PUBLIC_FALLBACK_VIDEOS);
  }

  for (const url of urlsToTry) {
    try {
      console.log(`  [Mux] Creating asset for ${videoId} from: ${url.substring(0, 80)}...`);
      const asset = await mux.video.assets.create({
        inputs: [{ url }],
        playback_policies: ['public'],
      });

      const assetId = asset.id;
      console.log(`  [Mux] Asset created: ${assetId}. Polling for ready...`);

      // Poll until ready (max 3 minutes)
      const maxAttempts = 36;
      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        const current = await mux.video.assets.retrieve(assetId);
        if (current.status === 'ready') {
          const playbackId = current.playback_ids?.[0]?.id ?? null;
          console.log(
            `  [Mux] Asset ${assetId} ready. Playback ID: ${playbackId}`,
          );
          return { playbackId, assetId };
        }
        if (current.status === 'errored') {
          console.warn(
            `  [Mux] Asset ${assetId} errored for URL: ${url.substring(0, 80)}. Trying next...`,
          );
          break;
        }
        await sleep(5000);
      }
    } catch (err) {
      console.warn(`  [Mux] Failed to upload ${videoId} from ${url.substring(0, 80)}:`, err);
    }
  }

  console.warn(
    `  [Mux] All attempts failed for ${videoId}. Using null playback ID.`,
  );
  return { playbackId: null, assetId: null };
}

// ── Main seed function ──────────────────────────────────────────────────────
async function main() {
  console.log('=== Starting seed ===\n');

  // ────────────────────────────────────────────────────────────────────────
  // Step 0: Clear all tables in correct FK order
  // ────────────────────────────────────────────────────────────────────────
  console.log('Clearing all tables...');
  await db.delete(schema.analyticsEvents);
  await db.delete(schema.commentVotes);
  await db.delete(schema.comments);
  await db.delete(schema.reactions);
  await db.delete(schema.contentPosts);
  await db.delete(schema.donations);
  await db.delete(schema.communityMembers);
  await db.delete(schema.follows);
  await db.delete(schema.fundraisers);
  await db.delete(schema.communities);
  await db.delete(schema.sessions);
  await db.delete(schema.accounts);
  await db.delete(schema.verificationTokens);
  await db.delete(schema.users);
  console.log('All tables cleared.\n');

  // ────────────────────────────────────────────────────────────────────────
  // Step 1: Users
  // ────────────────────────────────────────────────────────────────────────
  console.log('Seeding users...');
  for (const u of seedData.users) {
    await db.insert(schema.users).values({
      id: u.id,
      username: u.username,
      displayName: u.display_name,
      avatarUrl: u.avatar_url,
      coverImageUrl: u.cover_image_url ?? null,
      location: u.location,
      bio: u.bio,
      mockBalanceCents: u.mock_balance_cents,
      email: `${u.username}@gfm-demo.com`,
    });
  }
  console.log(`  Inserted ${seedData.users.length} users.\n`);

  // ────────────────────────────────────────────────────────────────────────
  // Step 2: Communities
  // ────────────────────────────────────────────────────────────────────────
  console.log('Seeding communities...');
  for (const c of seedData.communities) {
    await db.insert(schema.communities).values({
      id: c.id,
      slug: c.slug,
      name: c.name,
      description: c.description,
      bannerImageUrl: c.banner_image_url,
      logoUrl: c.logo_url,
      followerCount: c.follower_count,
      totalRaisedCents: c.total_raised_cents,
      totalDonations: c.total_donations,
      fundraiserCount: c.fundraiser_count,
    });
  }
  console.log(`  Inserted ${seedData.communities.length} communities.\n`);

  // ────────────────────────────────────────────────────────────────────────
  // Step 3: Community members
  // ────────────────────────────────────────────────────────────────────────
  console.log('Seeding community members...');
  for (const cm of seedData.community_members) {
    await db.insert(schema.communityMembers).values({
      id: generateId(),
      userId: cm.user_id,
      communityId: cm.community_id,
      role: cm.role,
    });
  }
  console.log(
    `  Inserted ${seedData.community_members.length} community members.\n`,
  );

  // ────────────────────────────────────────────────────────────────────────
  // Step 4: Fundraisers
  // ────────────────────────────────────────────────────────────────────────
  console.log('Seeding fundraisers...');
  for (const f of seedData.fundraisers) {
    await db.insert(schema.fundraisers).values({
      id: f.id,
      slug: f.slug,
      organizerId: f.organizer_id,
      communityId: f.community_id,
      title: f.title,
      description: f.description,
      heroImageUrl: f.hero_image_url,
      goalCents: f.goal_cents,
      raisedCents: f.raised_cents,
      donationCount: f.donation_count,
      category: f.category,
      taxDeductible: f.tax_deductible,
      status: f.status,
      createdAt: new Date(f.created_at),
    });
  }
  console.log(`  Inserted ${seedData.fundraisers.length} fundraisers.\n`);

  // ────────────────────────────────────────────────────────────────────────
  // Step 5: Donations (sample + generated) then reconcile fundraisers
  // ────────────────────────────────────────────────────────────────────────
  console.log('Seeding donations...');

  const allDonations: Array<{
    id: string;
    donorId: string | null;
    fundraiserId: string;
    amountCents: number;
    message: string | null;
    isAnonymous: boolean;
    createdAt: Date;
  }> = [];

  const sampleDonations = seedData.donations.sample_donations;
  const rules = seedData.donations.additional_generation_rules;
  const genericMessages: string[] = rules.generic_messages;
  const fundraiserIds: string[] = seedData.fundraisers.map(
    (f: { id: string }) => f.id,
  );
  const userIds: string[] = seedData.users.map(
    (u: { id: string }) => u.id,
  );

  // Insert sample donations verbatim
  for (const d of sampleDonations) {
    const donation = {
      id: generateId(),
      donorId: d.donor_id,
      fundraiserId: d.fundraiser_id,
      amountCents: d.amount_cents,
      message: d.message,
      isAnonymous: d.is_anonymous,
      createdAt: new Date(
        2026,
        1,
        randomInt(1, 28),
        randomInt(8, 22),
        randomInt(0, 59),
      ),
    };
    allDonations.push(donation);
  }
  console.log(`  ${sampleDonations.length} sample donations prepared.`);

  // Generate additional donations to reach 40-60 total
  const totalTarget = randomInt(40, 60);
  const additionalNeeded = totalTarget - sampleDonations.length;

  // Amount distribution brackets (in cents)
  const amountBrackets = [
    { min: 1000, max: 2500, weight: 0.3 },
    { min: 2500, max: 5000, weight: 0.25 },
    { min: 5000, max: 10000, weight: 0.2 },
    { min: 10000, max: 25000, weight: 0.15 },
    { min: 25000, max: 50000, weight: 0.1 },
  ];

  function pickAmountCents(): number {
    const r = Math.random();
    let cumulative = 0;
    for (const bracket of amountBrackets) {
      cumulative += bracket.weight;
      if (r <= cumulative) {
        return randomInt(bracket.min, bracket.max);
      }
    }
    // Fallback
    return randomInt(1000, 5000);
  }

  for (let i = 0; i < additionalNeeded; i++) {
    const isAnonymous = Math.random() < 0.2;
    const donorId = isAnonymous ? null : randomElement(userIds);
    const fundraiserId = randomElement(fundraiserIds);
    // Some donations have no message
    const message =
      Math.random() < 0.3 ? null : randomElement(genericMessages);
    const day = randomInt(1, 28);
    const hour = randomInt(8, 22);
    const minute = randomInt(0, 59);

    allDonations.push({
      id: generateId(),
      donorId,
      fundraiserId,
      amountCents: pickAmountCents(),
      message,
      isAnonymous,
      createdAt: new Date(2026, 1, day, hour, minute),
    });
  }

  console.log(
    `  ${additionalNeeded} additional donations generated (total: ${allDonations.length}).`,
  );

  // Insert all donations
  for (const d of allDonations) {
    await db.insert(schema.donations).values({
      id: d.id,
      donorId: d.donorId,
      fundraiserId: d.fundraiserId,
      amountCents: d.amountCents,
      message: d.message,
      isAnonymous: d.isAnonymous,
      source: 'fundraiser_page',
      createdAt: d.createdAt,
    });
  }

  // Reconcile: recalculate raised_cents and donation_count per fundraiser
  console.log('  Reconciling fundraiser totals...');
  const fundraiserTotals = new Map<
    string,
    { raised: number; count: number }
  >();
  for (const d of allDonations) {
    const current = fundraiserTotals.get(d.fundraiserId) || {
      raised: 0,
      count: 0,
    };
    current.raised += d.amountCents;
    current.count += 1;
    fundraiserTotals.set(d.fundraiserId, current);
  }

  for (const [fId, totals] of fundraiserTotals) {
    await db
      .update(schema.fundraisers)
      .set({
        raisedCents: totals.raised,
        donationCount: totals.count,
      })
      .where(eq(schema.fundraisers.id, fId));
    console.log(
      `    ${fId}: raised=${totals.raised} cents, count=${totals.count}`,
    );
  }
  console.log(`  Donations seeded and reconciled.\n`);

  // ────────────────────────────────────────────────────────────────────────
  // Step 6: Follows
  // ────────────────────────────────────────────────────────────────────────
  console.log('Seeding follows...');
  for (const f of seedData.follows) {
    await db.insert(schema.follows).values({
      id: generateId(),
      followerId: f.follower_id,
      followingId: f.following_id,
    });
  }
  console.log(`  Inserted ${seedData.follows.length} follows.\n`);

  // ────────────────────────────────────────────────────────────────────────
  // Step 7: Mux video uploads
  // ────────────────────────────────────────────────────────────────────────
  console.log('Uploading videos to Mux...');

  // Clean up old Mux assets to stay within free tier limit (10 assets)
  console.log('  [Mux] Cleaning up old assets...');
  try {
    const existingAssets = await mux.video.assets.list();
    let deletedCount = 0;
    for await (const asset of existingAssets) {
      try {
        await mux.video.assets.delete(asset.id);
        deletedCount++;
      } catch {
        // Ignore deletion errors for individual assets
      }
    }
    console.log(`  [Mux] Deleted ${deletedCount} old assets.`);
  } catch (err) {
    console.warn('  [Mux] Could not clean up old assets:', err);
  }

  const muxVideos = seedData.media_setup.mux_videos.videos;
  const muxPlaybackMap = new Map<
    string,
    { playbackId: string | null; assetId: string | null }
  >();

  for (const video of muxVideos) {
    const result = await uploadMuxVideo(
      video.id,
      video.source,
      video.fallback,
    );
    muxPlaybackMap.set(video.id, result);
  }
  console.log(`  Processed ${muxVideos.length} videos.\n`);

  // ────────────────────────────────────────────────────────────────────────
  // Step 8: Content posts (creator + auto-generated)
  // ────────────────────────────────────────────────────────────────────────
  console.log('Seeding content posts...');

  // Map video IDs to content post IDs from seed data
  const videoPostMap: Record<string, string> = {
    video_1: 'cp_v1',
    video_2: 'cp_v2',
    video_3: 'cp_v3',
    video_4: 'cp_v4',
    video_5: 'cp_v5',
  };

  // Creator posts
  const creatorPosts = seedData.content_posts.creator_posts;
  for (const cp of creatorPosts) {
    // Resolve Mux playback ID for video posts
    let muxPlaybackId: string | null = null;
    let muxAssetId: string | null = null;

    if (cp.content_type === 'video') {
      // Find which video maps to this post
      const videoEntry = Object.entries(videoPostMap).find(
        ([, postId]) => postId === cp.id,
      );
      if (videoEntry) {
        const videoData = muxPlaybackMap.get(videoEntry[0]);
        if (videoData) {
          muxPlaybackId = videoData.playbackId;
          muxAssetId = videoData.assetId;
        }
      }
    }

    await db.insert(schema.contentPosts).values({
      id: cp.id,
      authorId: cp.author_id,
      fundraiserId: cp.fundraiser_id ?? null,
      communityId: cp.community_id,
      contentType: cp.content_type,
      title: cp.title,
      body: cp.body,
      mediaUrl: cp.media_url ?? null,
      muxPlaybackId,
      muxAssetId,
      thumbnailUrl:
        cp.thumbnail_url ??
        (muxPlaybackId
          ? `https://image.mux.com/${muxPlaybackId}/thumbnail.jpg`
          : null),
      viewCount: cp.view_count,
      reactionCount: cp.reaction_count,
      commentCount: cp.comment_count,
      commentsEnabled: cp.comments_enabled ?? true,
      status: cp.status,
      createdAt: new Date(cp.created_at),
    });
  }
  console.log(`  Inserted ${creatorPosts.length} creator posts.`);

  // Auto-generated posts
  const autoPosts = seedData.content_posts.auto_generated_posts;
  for (const ap of autoPosts) {
    await db.insert(schema.contentPosts).values({
      id: ap.id,
      authorId: ap.author_id ?? null,
      fundraiserId: ap.fundraiser_id ?? null,
      communityId: ap.community_id,
      contentType: ap.content_type,
      title: ap.title,
      body: ap.body ?? null,
      autoGenData: ap.auto_gen_data,
      viewCount: ap.view_count,
      reactionCount: ap.reaction_count,
      commentCount: ap.comment_count,
      commentsEnabled: true,
      status: ap.status,
      createdAt: new Date(ap.created_at),
    });
  }
  console.log(`  Inserted ${autoPosts.length} auto-generated posts.\n`);

  // ────────────────────────────────────────────────────────────────────────
  // Step 9: Comments
  // ────────────────────────────────────────────────────────────────────────
  console.log('Seeding comments...');
  const sampleComments = seedData.sample_comments;
  for (const sc of sampleComments) {
    await db.insert(schema.comments).values({
      id: generateId(),
      userId: sc.user_id,
      contentPostId: sc.content_post_id,
      donationId: sc.donation_id ?? null,
      body: sc.body,
    });
  }
  console.log(`  Inserted ${sampleComments.length} comments.\n`);

  // ────────────────────────────────────────────────────────────────────────
  // Step 10: Reactions (50-80 distributed across posts)
  // ────────────────────────────────────────────────────────────────────────
  console.log('Seeding reactions...');
  const reactionDistribution = seedData.sample_reactions.distribution;
  const reactionTypes: Array<{
    type: string;
    weight: number;
  }> = Object.entries(reactionDistribution).map(([type, pctStr]) => ({
    type,
    weight: parseFloat((pctStr as string).replace('%', '')) / 100,
  }));

  function pickReactionType(): string {
    const r = Math.random();
    let cumulative = 0;
    for (const rt of reactionTypes) {
      cumulative += rt.weight;
      if (r <= cumulative) return rt.type;
    }
    return 'heart';
  }

  // Collect all content post IDs
  const allPostIds = [
    ...creatorPosts.map((p: { id: string }) => p.id),
    ...autoPosts.map((p: { id: string }) => p.id),
  ];

  const totalReactions = randomInt(50, 80);
  // Track unique (userId, postId) combos to respect the unique constraint
  const usedReactionPairs = new Set<string>();
  let reactionsInserted = 0;

  for (let i = 0; i < totalReactions * 2 && reactionsInserted < totalReactions; i++) {
    const userId = randomElement(userIds);
    const postId = randomElement(allPostIds);
    const pairKey = `${userId}:${postId}`;

    if (usedReactionPairs.has(pairKey)) continue;
    usedReactionPairs.add(pairKey);

    const rType = pickReactionType();
    const microDonationCents =
      rType === 'micro_donate' ? randomElement([100, 200, 500]) : null;

    await db.insert(schema.reactions).values({
      id: generateId(),
      userId,
      contentPostId: postId,
      reactionType: rType as
        | 'heart'
        | 'clap'
        | 'hug'
        | 'inspired'
        | 'pray'
        | 'micro_donate',
      microDonationCents,
    });
    reactionsInserted++;
  }
  console.log(`  Inserted ${reactionsInserted} reactions.\n`);

  // ────────────────────────────────────────────────────────────────────────
  // Final: Log table counts
  // ────────────────────────────────────────────────────────────────────────
  console.log('=== Table counts ===');
  const tables = [
    { name: 'users', table: schema.users },
    { name: 'communities', table: schema.communities },
    { name: 'community_members', table: schema.communityMembers },
    { name: 'fundraisers', table: schema.fundraisers },
    { name: 'donations', table: schema.donations },
    { name: 'follows', table: schema.follows },
    { name: 'content_posts', table: schema.contentPosts },
    { name: 'comments', table: schema.comments },
    { name: 'reactions', table: schema.reactions },
  ];

  for (const t of tables) {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(t.table);
    console.log(`  ${t.name}: ${result[0].count}`);
  }

  console.log('\n=== Seed complete ===');
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  });
