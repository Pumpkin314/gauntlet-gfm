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
