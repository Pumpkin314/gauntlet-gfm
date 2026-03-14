import {
  pgTable,
  pgEnum,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
  index,
  unique,
  primaryKey,
} from 'drizzle-orm/pg-core';

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

export const contentTypeEnum = pgEnum('content_type', [
  'video',
  'image_story',
  'milestone',
  'community_pulse',
  'donor_spotlight',
  'challenge',
  'text_update',
]);

export const reactionTypeEnum = pgEnum('reaction_type', [
  'heart',
  'clap',
  'hug',
  'inspired',
  'pray',
  'micro_donate',
]);

export const donationSourceEnum = pgEnum('donation_source', [
  'fundraiser_page',
  'fyp_quick_donate',
  'micro_reaction',
  'community_page',
]);

export const fundraiserStatusEnum = pgEnum('fundraiser_status', [
  'active',
  'completed',
  'paused',
]);

export const postStatusEnum = pgEnum('post_status', [
  'published',
  'draft',
  'archived',
]);

export const communityRoleEnum = pgEnum('community_role', [
  'admin',
  'member',
]);

// ---------------------------------------------------------------------------
// Auth.js adapter tables
// ---------------------------------------------------------------------------

export const users = pgTable('users', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  username: text('username').unique().notNull(),
  displayName: text('display_name').notNull(),
  email: text('email').unique(),
  emailVerified: timestamp('email_verified', { mode: 'date' }),
  image: text('image'),
  avatarUrl: text('avatar_url'),
  coverImageUrl: text('cover_image_url'),
  location: text('location'),
  bio: text('bio'),
  /** Denormalized: updated via donation triggers / server actions */
  mockBalanceCents: integer('mock_balance_cents').default(0),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow(),
});

export const accounts = pgTable(
  'accounts',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: text('type').notNull(),
    provider: text('provider').notNull(),
    providerAccountId: text('provider_account_id').notNull(),
    refreshToken: text('refresh_token'),
    accessToken: text('access_token'),
    expiresAt: integer('expires_at'),
    tokenType: text('token_type'),
    scope: text('scope'),
    idToken: text('id_token'),
    sessionState: text('session_state'),
  },
  (table) => [
    unique('accounts_provider_provider_account_id_unique').on(
      table.provider,
      table.providerAccountId,
    ),
  ],
);

export const sessions = pgTable('sessions', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  sessionToken: text('session_token').unique().notNull(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
});

export const verificationTokens = pgTable(
  'verification_tokens',
  {
    identifier: text('identifier').notNull(),
    token: text('token').unique().notNull(),
    expires: timestamp('expires', { mode: 'date' }).notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.identifier, table.token] }),
  ],
);

// ---------------------------------------------------------------------------
// Core entities
// ---------------------------------------------------------------------------

export const communities = pgTable('communities', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  slug: text('slug').unique().notNull(),
  name: text('name').notNull(),
  description: text('description'),
  bannerImageUrl: text('banner_image_url'),
  logoUrl: text('logo_url'),
  /** Denormalized: incremented/decremented by follow mutations */
  followerCount: integer('follower_count').default(0),
  /** Denormalized: sum of all fundraiser raised_cents in this community */
  totalRaisedCents: integer('total_raised_cents').default(0),
  /** Denormalized: count of all donations in this community */
  totalDonations: integer('total_donations').default(0),
  /** Denormalized: count of fundraisers in this community */
  fundraiserCount: integer('fundraiser_count').default(0),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow(),
});

export const communityMembers = pgTable(
  'community_members',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    communityId: text('community_id')
      .notNull()
      .references(() => communities.id, { onDelete: 'cascade' }),
    role: communityRoleEnum('role').default('member'),
    joinedAt: timestamp('joined_at', { mode: 'date' }).defaultNow(),
  },
  (table) => [
    unique('community_members_user_community_unique').on(
      table.userId,
      table.communityId,
    ),
  ],
);

export const fundraisers = pgTable(
  'fundraisers',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    slug: text('slug').unique().notNull(),
    organizerId: text('organizer_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    communityId: text('community_id').references(() => communities.id, {
      onDelete: 'set null',
    }),
    title: text('title').notNull(),
    description: text('description'),
    heroImageUrl: text('hero_image_url'),
    goalCents: integer('goal_cents').notNull(),
    /** Denormalized: sum of donation amount_cents for this fundraiser */
    raisedCents: integer('raised_cents').default(0),
    /** Denormalized: count of donations for this fundraiser */
    donationCount: integer('donation_count').default(0),
    category: text('category'),
    taxDeductible: boolean('tax_deductible').default(false),
    status: fundraiserStatusEnum('status').default('active'),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow(),
    updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow(),
  },
  (table) => [
    index('fundraisers_slug_idx').on(table.slug),
    index('fundraisers_organizer_id_idx').on(table.organizerId),
    index('fundraisers_community_id_idx').on(table.communityId),
    index('fundraisers_status_idx').on(table.status),
  ],
);
