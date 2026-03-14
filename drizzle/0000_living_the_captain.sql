CREATE TYPE "public"."community_role" AS ENUM('admin', 'member');--> statement-breakpoint
CREATE TYPE "public"."content_type" AS ENUM('video', 'image_story', 'milestone', 'community_pulse', 'donor_spotlight', 'challenge', 'text_update');--> statement-breakpoint
CREATE TYPE "public"."donation_source" AS ENUM('fundraiser_page', 'fyp_quick_donate', 'micro_reaction', 'community_page');--> statement-breakpoint
CREATE TYPE "public"."fundraiser_status" AS ENUM('active', 'completed', 'paused');--> statement-breakpoint
CREATE TYPE "public"."post_status" AS ENUM('published', 'draft', 'archived');--> statement-breakpoint
CREATE TYPE "public"."reaction_type" AS ENUM('heart', 'clap', 'hug', 'inspired', 'pray', 'micro_donate');--> statement-breakpoint
CREATE TABLE "accounts" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"type" text NOT NULL,
	"provider" text NOT NULL,
	"provider_account_id" text NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" text,
	"scope" text,
	"id_token" text,
	"session_state" text,
	CONSTRAINT "accounts_provider_provider_account_id_unique" UNIQUE("provider","provider_account_id")
);
--> statement-breakpoint
CREATE TABLE "analytics_events" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text,
	"event_type" text NOT NULL,
	"event_data" jsonb,
	"page_path" text,
	"session_id" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "comment_votes" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"comment_id" text NOT NULL,
	"vote" integer NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "comment_votes_user_comment_unique" UNIQUE("user_id","comment_id")
);
--> statement-breakpoint
CREATE TABLE "comments" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"content_post_id" text NOT NULL,
	"donation_id" text,
	"body" text NOT NULL,
	"upvotes" integer DEFAULT 0,
	"downvotes" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "communities" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"banner_image_url" text,
	"logo_url" text,
	"follower_count" integer DEFAULT 0,
	"total_raised_cents" integer DEFAULT 0,
	"total_donations" integer DEFAULT 0,
	"fundraiser_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "communities_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "community_members" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"community_id" text NOT NULL,
	"role" "community_role" DEFAULT 'member',
	"joined_at" timestamp DEFAULT now(),
	CONSTRAINT "community_members_user_community_unique" UNIQUE("user_id","community_id")
);
--> statement-breakpoint
CREATE TABLE "content_posts" (
	"id" text PRIMARY KEY NOT NULL,
	"author_id" text,
	"fundraiser_id" text,
	"community_id" text,
	"content_type" "content_type" NOT NULL,
	"title" text,
	"body" text,
	"media_url" text,
	"mux_playback_id" text,
	"mux_asset_id" text,
	"thumbnail_url" text,
	"auto_gen_data" jsonb,
	"view_count" integer DEFAULT 0,
	"reaction_count" integer DEFAULT 0,
	"comment_count" integer DEFAULT 0,
	"comments_enabled" boolean DEFAULT true,
	"status" "post_status" DEFAULT 'published',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "donations" (
	"id" text PRIMARY KEY NOT NULL,
	"donor_id" text,
	"fundraiser_id" text NOT NULL,
	"amount_cents" integer NOT NULL,
	"message" text,
	"is_anonymous" boolean DEFAULT false,
	"source" "donation_source" DEFAULT 'fundraiser_page',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "follows" (
	"id" text PRIMARY KEY NOT NULL,
	"follower_id" text NOT NULL,
	"following_id" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "follows_follower_following_unique" UNIQUE("follower_id","following_id")
);
--> statement-breakpoint
CREATE TABLE "fundraisers" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"organizer_id" text NOT NULL,
	"community_id" text,
	"title" text NOT NULL,
	"description" text,
	"hero_image_url" text,
	"goal_cents" integer NOT NULL,
	"raised_cents" integer DEFAULT 0,
	"donation_count" integer DEFAULT 0,
	"category" text,
	"tax_deductible" boolean DEFAULT false,
	"status" "fundraiser_status" DEFAULT 'active',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "fundraisers_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "reactions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"content_post_id" text NOT NULL,
	"reaction_type" "reaction_type" NOT NULL,
	"micro_donation_cents" integer,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "reactions_user_post_unique" UNIQUE("user_id","content_post_id")
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"session_token" text NOT NULL,
	"user_id" text NOT NULL,
	"expires" timestamp NOT NULL,
	CONSTRAINT "sessions_session_token_unique" UNIQUE("session_token")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"display_name" text NOT NULL,
	"email" text,
	"email_verified" timestamp,
	"image" text,
	"avatar_url" text,
	"cover_image_url" text,
	"location" text,
	"bio" text,
	"mock_balance_cents" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification_tokens" (
	"identifier" text NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp NOT NULL,
	CONSTRAINT "verification_tokens_identifier_token_pk" PRIMARY KEY("identifier","token"),
	CONSTRAINT "verification_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "analytics_events" ADD CONSTRAINT "analytics_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comment_votes" ADD CONSTRAINT "comment_votes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comment_votes" ADD CONSTRAINT "comment_votes_comment_id_comments_id_fk" FOREIGN KEY ("comment_id") REFERENCES "public"."comments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_content_post_id_content_posts_id_fk" FOREIGN KEY ("content_post_id") REFERENCES "public"."content_posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_donation_id_donations_id_fk" FOREIGN KEY ("donation_id") REFERENCES "public"."donations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "community_members" ADD CONSTRAINT "community_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "community_members" ADD CONSTRAINT "community_members_community_id_communities_id_fk" FOREIGN KEY ("community_id") REFERENCES "public"."communities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_posts" ADD CONSTRAINT "content_posts_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_posts" ADD CONSTRAINT "content_posts_fundraiser_id_fundraisers_id_fk" FOREIGN KEY ("fundraiser_id") REFERENCES "public"."fundraisers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_posts" ADD CONSTRAINT "content_posts_community_id_communities_id_fk" FOREIGN KEY ("community_id") REFERENCES "public"."communities"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "donations" ADD CONSTRAINT "donations_donor_id_users_id_fk" FOREIGN KEY ("donor_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "donations" ADD CONSTRAINT "donations_fundraiser_id_fundraisers_id_fk" FOREIGN KEY ("fundraiser_id") REFERENCES "public"."fundraisers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "follows" ADD CONSTRAINT "follows_follower_id_users_id_fk" FOREIGN KEY ("follower_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "follows" ADD CONSTRAINT "follows_following_id_users_id_fk" FOREIGN KEY ("following_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fundraisers" ADD CONSTRAINT "fundraisers_organizer_id_users_id_fk" FOREIGN KEY ("organizer_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fundraisers" ADD CONSTRAINT "fundraisers_community_id_communities_id_fk" FOREIGN KEY ("community_id") REFERENCES "public"."communities"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reactions" ADD CONSTRAINT "reactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reactions" ADD CONSTRAINT "reactions_content_post_id_content_posts_id_fk" FOREIGN KEY ("content_post_id") REFERENCES "public"."content_posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "comments_content_post_id_idx" ON "comments" USING btree ("content_post_id");--> statement-breakpoint
CREATE INDEX "content_posts_community_id_idx" ON "content_posts" USING btree ("community_id");--> statement-breakpoint
CREATE INDEX "content_posts_fundraiser_id_idx" ON "content_posts" USING btree ("fundraiser_id");--> statement-breakpoint
CREATE INDEX "content_posts_author_id_idx" ON "content_posts" USING btree ("author_id");--> statement-breakpoint
CREATE INDEX "content_posts_created_at_idx" ON "content_posts" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "donations_fundraiser_id_idx" ON "donations" USING btree ("fundraiser_id");--> statement-breakpoint
CREATE INDEX "donations_donor_id_idx" ON "donations" USING btree ("donor_id");--> statement-breakpoint
CREATE INDEX "donations_created_at_idx" ON "donations" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "follows_follower_id_idx" ON "follows" USING btree ("follower_id");--> statement-breakpoint
CREATE INDEX "follows_following_id_idx" ON "follows" USING btree ("following_id");--> statement-breakpoint
CREATE INDEX "fundraisers_slug_idx" ON "fundraisers" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "fundraisers_organizer_id_idx" ON "fundraisers" USING btree ("organizer_id");--> statement-breakpoint
CREATE INDEX "fundraisers_community_id_idx" ON "fundraisers" USING btree ("community_id");--> statement-breakpoint
CREATE INDEX "fundraisers_status_idx" ON "fundraisers" USING btree ("status");--> statement-breakpoint
CREATE INDEX "reactions_content_post_id_idx" ON "reactions" USING btree ("content_post_id");