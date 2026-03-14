# GoFundMe Reimagined — Sprint Plan

---

## Project File References

All planning docs live in `docs/` within the repo:

| File | Purpose |
|------|---------|
| `docs/sprint-plan.md` | This file. The orchestrator agent's primary reference. |
| `docs/seed-data.json` | All demo data: users, communities, fundraisers, donations, content posts, media URLs. The seed script reads this file directly. |
| `docs/setup-guides.md` | Google OAuth setup instructions. GitHub Issues creation script. |
| `docs/project-brief.md` | Original GoFundMe project brief (copy of uploaded brief). |
| `CLAUDE.md` | Agent instructions: methodology, coding standards, parallelization protocol. |

---

## Brief Alignment Checklist

Every requirement from the project brief, mapped to where it's addressed:

| Brief Requirement | Where Addressed | Epic |
|---|---|---|
| Profile Page | `/u/[username]` route | TB3 PR 3.2 |
| Fundraiser Page | `/f/[slug]` route | TB2 |
| Community Page | `/communities/[slug]` route | TB3 PR 3.1 |
| Pages feel connected, seamless UX | Cross-page linking + shared components | TB3 PR 3.3 |
| AI-powered experience | Auto-generated content cards (milestones, pulses, spotlights), AI feed ranking, content creation studio (stretch) | TB4, TB5, TB10 |
| React / Next.js | Next.js 15 App Router, TypeScript, React Server Components | TB1 |
| AWS preferred | Vercel for MVP → AWS migration via SST/OpenNext | TB8 (stretch) |
| Use AI to accelerate build | AI-assisted planning, code generation, architecture design | TB7 PR 7.5 (AI_USAGE.md) |
| Fast response times | ISR, RSC streaming, Redis caching, edge CDN, progressive loading | TB2, TB7 PR 7.2 |
| Instrumentation and analytics | Web Vitals, query timing, action tracking, admin metrics dashboard | TB6 |
| Design decisions and tradeoffs | ARCHITECTURE.md documenting all decisions | TB7 PR 7.5 |
| AI Usage Documentation | AI_USAGE.md | TB7 PR 7.5 |
| Repeat Visits (impact metric) | Fund You Page discovery feed, content subscriptions via follow, community engagement | TB5 |
| Meaningful Actions (impact metric) | Donate, Share, Follow instrumented on every surface + FYP right-rail | TB2-TB6 |

---

## Pre-Flight Checklist (Complete Before Starting TB1)

These are MANUAL steps that must be done by the human before the orchestrator agent begins:

- [ ] **Create GitHub repo** and clone locally
- [ ] **Copy planning docs into repo**: `docs/sprint-plan.md`, `docs/seed-data.json`, `docs/setup-guides.md`, `docs/project-brief.md`
- [ ] **Copy CLAUDE.md** into repo root
- [ ] **Google OAuth credentials**: Follow `docs/setup-guides.md` Step 1. Get `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`. Add to `.env.local`.
- [ ] **Vercel project**: Create Vercel project linked to the repo. Get Vercel Postgres database provisioned. Copy `DATABASE_URL` to `.env.local`.
- [ ] **Vercel KV (Redis)**: In Vercel dashboard → Storage → Create KV Database. Environment variables `KV_REST_API_URL` and `KV_REST_API_TOKEN` are auto-injected into deployments. For local dev, pull them via `vercel env pull .env.local`.
- [ ] **Mux account**: Sign up at https://dashboard.mux.com. Get `MUX_TOKEN_ID` and `MUX_TOKEN_SECRET`. Add to `.env.local`. (Video uploads are automated by the seed script — no manual uploads needed.)
- [ ] **Generate NextAuth secret**: `openssl rand -base64 32` → add as `NEXTAUTH_SECRET` in `.env.local`.
- [ ] **Run GitHub Issues script**: `bash docs/setup-github-issues.sh owner/repo` (from `docs/setup-guides.md`)
- [ ] **Verify .env.local** has all required vars: `DATABASE_URL`, `KV_REST_API_URL`, `KV_REST_API_TOKEN`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL=http://localhost:3000`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `MUX_TOKEN_ID`, `MUX_TOKEN_SECRET`, `NEXT_PUBLIC_MUX_ENV_KEY`

Once all boxes are checked, tell the orchestrator agent: "Start TB1. Sprint plan is at docs/sprint-plan.md. Seed data at docs/seed-data.json. Follow CLAUDE.md methodology."

---

## Methodology

**Tracer Bullet (TB) development**: Each Epic is a vertical slice that cuts across the entire stack — database schema → server actions/API → UI components → E2E test. At the end of each Epic, the feature is deployed, visually verified via headless Chrome, and regression-tested with Playwright.

**Parallelization**: PRs within an Epic and across Epics are parallelized using git worktrees and background agents where dependency graphs allow. The plan annotates which PRs can run concurrently.

**Testing philosophy**: E2E tests per Epic verify the full vertical slice. Unit tests are added iteratively for non-trivial logic only (no testing getters, no testing what Playwright already covers). Unit tests serve as regression checks for: financial calculations, feed ranking logic, cache invalidation, and data transformation functions.

**Visual verification**: At the end of each Epic, an agent connects to headless Chrome on the deployed preview, navigates the added features, and screenshots key states to verify correctness.

---

## Architecture for Parallelization

```
main
├── worktree-a (Agent A — primary)
├── worktree-b (Agent B — parallel PR)
└── worktree-c (Agent C — parallel PR, when applicable)
```

PRs merge to `main` via squash merge. Each PR's branch is prefixed with the Epic number: `tb1/scaffold`, `tb2/fundraiser-shell`, etc. Background agents work on independent PRs that don't touch overlapping files.

**File ownership boundaries** (reduces merge conflicts):
- `app/f/` — fundraiser page (one agent)
- `app/communities/` — community page (one agent)
- `app/u/` — profile page (one agent)
- `app/fyp/` — FYP (one agent)
- `lib/db/` — schema, queries (serialize changes, one agent at a time)
- `lib/actions/` — server actions (can parallelize if different action files)
- `components/` — shared components (serialize changes to avoid conflicts)

---

## MVP Milestone

MVP = Epics TB1 through TB7. At the end of TB7, the app is demo-ready with all four pages functional, social layer working, observability dashboard live, and mobile-responsive.

---

## TB1: Foundation

**Goal**: Deployable skeleton with database, auth, seed data, and navigation. Every subsequent Epic builds on this.

**Day target**: Day 1

### PR 1.1: Project Scaffold + Tooling
**Branch**: `tb1/scaffold`
**Agent**: A (primary)

| Commit | Description |
|--------|-------------|
| `init: create-next-app with app router, typescript strict` | `npx create-next-app@latest --ts --tailwind --app --src-dir` |
| `config: eslint + prettier + .editorconfig` | Strict TS config, import sorting, Tailwind plugin |
| `deps: shadcn/ui init + base components` | Button, Card, Skeleton, Dialog, Sheet, Avatar, Badge, Tabs, DropdownMenu |
| `config: vercel project link + env vars template` | `.env.example` with all required vars, Vercel project connected |
| `ci: playwright config + base test` | Playwright config, `tests/smoke.spec.ts` that hits `/` and asserts 200 |

**Subtasks**:
- [ ] `tsconfig.json` — strict: true, paths: `@/*` → `./src/*`
- [ ] `tailwind.config.ts` — extend with GFM color palette (green primary: `#00b964`, dark: `#1d1d1d`)
- [ ] `.env.example` — DATABASE_URL, KV_REST_API_URL, KV_REST_API_TOKEN, NEXTAUTH_SECRET, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, MUX_TOKEN_ID, MUX_TOKEN_SECRET, NEXT_PUBLIC_MUX_ENV_KEY

### PR 1.2: Database Schema + Migrations
**Branch**: `tb1/schema`
**Agent**: B (parallel with PR 1.1)

| Commit | Description |
|--------|-------------|
| `deps: drizzle-orm + drizzle-kit + @neondatabase/serverless` | DB dependencies |
| `schema: users, fundraisers, communities, community_members` | Core entity tables with all columns, types, constraints |
| `schema: donations, content_posts, reactions` | Social layer tables |
| `schema: comments, comment_votes, follows` | Engagement tables |
| `schema: analytics_events` | Observability table |
| `schema: all indexes` | All 15 indexes from the performance plan |
| `db: drizzle config + connection helper` | `drizzle.config.ts`, `lib/db/index.ts` with connection pooling |
| `db: run initial migration` | `drizzle-kit push` against Vercel Postgres |

**Subtasks**:
- [ ] All tables defined in `lib/db/schema.ts` as a single file (Drizzle convention)
- [ ] Enum types: `content_type` (video, image_story, milestone, community_pulse, donor_spotlight, challenge, text_update), `reaction_type` (heart, clap, hug, inspired, pray, micro_donate), `donation_source` (fundraiser_page, fyp_quick_donate, micro_reaction, community_page), `fundraiser_status` (active, completed, paused), `post_status` (published, draft, archived), `community_role` (admin, member)
- [ ] Denormalized counter columns identified with comments in schema
- [ ] `lib/db/index.ts` exports typed `db` instance + typed table references

### PR 1.3: Auth (Google OAuth)
**Branch**: `tb1/auth`
**Agent**: A (after PR 1.1 merges, parallel with PR 1.2)

| Commit | Description |
|--------|-------------|
| `deps: next-auth@beta @auth/drizzle-adapter` | Auth.js v5 |
| `auth: config with google provider + drizzle adapter` | `lib/auth.ts` — GoogleProvider, DrizzleAdapter, JWT session strategy |
| `auth: middleware for protected routes` | `middleware.ts` — protect `/studio/*` routes |
| `ui: sign-in page with google button` | `app/sign-in/page.tsx` — GFM-styled sign-in page |
| `ui: auth state in nav` | Signed-in: avatar + dropdown. Signed-out: "Sign in" link |
| `auth: getCurrentUser helper` | `lib/auth.ts` — `getCurrentUser()` returns typed User or null |

**Subtasks**:
- [ ] Google Cloud Console: create OAuth client, add authorized redirect URIs
- [ ] Session callback: embed `user.id` and `user.username` in JWT token
- [ ] `useSession` client hook for auth-aware UI components

### PR 1.4: Seed Data + Redis
**Branch**: `tb1/seed`
**Agent**: B (after PR 1.2 merges)

**CRITICAL**: This PR reads `docs/seed-data.json` as its single source of truth. All entity data, relationships, media URLs, and generation rules are defined there. The seed script should parse this file directly — do NOT hardcode seed data in the script.

| Commit | Description |
|--------|-------------|
| `seed: create lib/db/seed.ts reading from docs/seed-data.json` | Main seed script, reads JSON, maps to Drizzle inserts |
| `seed: users (8 users from seed-data.json)` | Including pravatar.cc URLs for avatars, locations, bios, mock_balance_cents |
| `seed: communities (2 from seed-data.json)` | Watch Duty (GFM CDN images) + Bay Area Mutual Aid (Pexels images) |
| `seed: fundraisers (8 from seed-data.json)` | All image URLs from seed-data.json media_setup section |
| `seed: donations (40-60, programmatically generated)` | Use sample_donations + additional_generation_rules from seed-data.json. Spread timestamps across Feb 2026. |
| `seed: content posts — creator posts (12 from seed-data.json)` | 5 video posts (Mux playback IDs from seed-data.json), 3 image stories, 4 text updates |
| `seed: content posts — auto-generated (5 from seed-data.json)` | 2 milestones, 2 community pulses, 1 donor spotlight. author_id = null, auto_gen_data from JSON. |
| `seed: comments, reactions, follows, community_members` | From seed-data.json arrays. Reactions generated per distribution rules. |
| `seed: npm script "db:seed"` | Idempotent — clears all tables then re-seeds. Add to package.json scripts. |
| `deps: @vercel/kv + cache helpers` | `lib/cache.ts` — `cachedQuery(key, ttl, queryFn)` helper |

**Subtasks**:
- [ ] Mux video uploads are AUTOMATED by the seed script: for each video in seed-data.json mux_videos array, call Mux API with the Pexels source URL, poll until ready, capture playback ID, and write to DB. Handle rate limits and fallback URLs.
- [ ] For image URLs: use the direct URLs from seed-data.json (GFM CDN + Pexels CDN). No need to download — these are stable public CDNs. For local fallback, download to `/public/seed/images/`.
- [ ] Avatar URLs use pravatar.cc pattern: `https://i.pravatar.cc/128?u={user_id}@gfm-demo.com`
- [ ] Donation generation: use sample_donations verbatim first, then generate remaining to hit 40-60 total using generic_messages and amount_distribution from seed-data.json
- [ ] Seed data tells a coherent story: Janahan organizes Watch Duty fundraiser, Tim Cadogan leads leaderboard, Surveen runs Bay Area Mutual Aid
- [ ] Vercel KV: `@vercel/kv` package, cache helpers with typed get/set, TTL, invalidation by key pattern
- [ ] Verify after seeding: run a quick query counting rows in each table, log the results

### PR 1.5: Root Layout + Navigation
**Branch**: `tb1/layout`
**Agent**: A (after PR 1.3 merges)

| Commit | Description |
|--------|-------------|
| `ui: root layout with GFM-style nav` | Logo, nav links (Donate, Fundraise, About dropdowns), search placeholder, auth button |
| `ui: mobile nav with hamburger menu` | Sheet-based slide-out menu on mobile |
| `ui: font loading (Inter or GFM's font)` | `next/font` with preload, display: swap |
| `ui: footer matching GFM` | Secondary nav, legal links, copyright |
| `ui: global loading fallback` | Root loading.tsx with minimal skeleton |

**Subtasks**:
- [ ] Nav is a Server Component (no JS shipped for static nav)
- [ ] Auth state shown via server-side `getCurrentUser()` — no client-side flash
- [ ] Mobile breakpoint: 768px

### E2E Test: TB1
**File**: `tests/tb1-foundation.spec.ts`

```
- Navigate to / → page loads, nav renders
- Click "Sign in" → redirected to sign-in page, Google button visible
- Nav shows correct links (Donate, Fundraise, About)
- Mobile viewport: hamburger menu opens/closes
- API health: GET /api/feed returns 200 (empty feed OK)
```

### Visual Verification: TB1
Agent connects to deployed preview URL:
- Screenshot: desktop nav at 1280px
- Screenshot: mobile nav at 375px (hamburger open + closed)
- Screenshot: sign-in page

### Parallelization Map: TB1
```
Timeline: ──────────────────────────────────────────►

Agent A: [PR 1.1: Scaffold]──►[PR 1.3: Auth]──────►[PR 1.5: Layout]
Agent B: [PR 1.2: Schema]──────►[PR 1.4: Seed+Redis]
                                                     ▼
                                              TB1 Complete
```

---

## TB2: Fundraiser Page

**Goal**: The most important page is fully functional — view fundraiser, donate, share. Matches GFM's visual layout. Fast.

**Day target**: Day 2

**Depends on**: TB1 complete

### PR 2.1: Fundraiser Page — Static Shell
**Branch**: `tb2/fundraiser-shell`
**Agent**: A (primary)

| Commit | Description |
|--------|-------------|
| `query: getFundraiserBySlug with organizer join` | `lib/queries/fundraisers.ts` — typed query, Redis-cached stats |
| `ui: fundraiser page route + ISR config` | `app/f/[slug]/page.tsx` — `revalidate = 60`, `generateStaticParams` for seed data |
| `ui: hero image with next/image priority` | 16:9 aspect ratio, blur placeholder, priority loading |
| `ui: progress bar component` | Animated fill, percentage, raised/goal amounts. Reusable. |
| `ui: organizer card` | Avatar, name, "for [beneficiary]" link, verified badge, location |
| `ui: fundraiser description with read-more` | Truncation at 3 lines, expand/collapse. Server Component. |
| `ui: metadata section` | Date, category, tax deductible badge |
| `ui: share button` | Web Share API on mobile, copy-link dropdown on desktop |
| `ui: loading.tsx skeleton` | Dimension-matched skeleton for the full page |
| `meta: OG tags for social sharing` | `generateMetadata` — title, description, image from fundraiser data |

**Subtasks**:
- [ ] Progress bar uses CSS transitions (no JS animation library)
- [ ] Hero image: `sizes` prop set correctly for responsive loading
- [ ] ISR: `generateStaticParams` pre-renders seed fundraiser pages at build time
- [ ] Read-more: pure CSS `:has()` selector approach (no client JS) or minimal client component

### PR 2.2: Donations List (Streamed)
**Branch**: `tb2/donations-list`
**Agent**: B (parallel with PR 2.1)

| Commit | Description |
|--------|-------------|
| `query: getRecentDonations(fundraiserId, limit)` | `lib/queries/donations.ts` — typed, with user join |
| `ui: donation card component` | Avatar, name, amount, message, timestamp (relative time) |
| `ui: donations list with Suspense` | Suspense boundary wrapping async server component. Skeleton fallback. |
| `ui: "See all" / "See top" toggle` | Client component toggling sort order |

**Subtasks**:
- [ ] Relative time formatting: `lib/utils/time.ts` — "2 hours ago", "3 days ago"
- [ ] Anonymous donations: show "Anonymous" with generic avatar
- [ ] Donation amounts formatted with `Intl.NumberFormat`

### PR 2.3: Donate Modal + Server Action
**Branch**: `tb2/donate-modal`
**Agent**: A (after PR 2.1 merges)

| Commit | Description |
|--------|-------------|
| `action: createDonation server action` | `lib/actions/donations.ts` — validates input, atomic transaction (INSERT donation + UPDATE fundraiser counters), Redis cache invalidation |
| `ui: donate modal (intercepting route)` | `app/f/[slug]/@donate/(.)donate/page.tsx` — amount presets ($25, $50, $100, custom), message field, submit button |
| `ui: mobile bottom sheet variant` | Sheet component on mobile viewport, Dialog on desktop |
| `ui: optimistic UI on donate` | `useOptimistic` — progress bar updates immediately, reconciles on server response |
| `ui: success state` | Confetti/celebration animation, share prompt, "View your donation" link |
| `test: unit test for donation amount validation` | Edge cases: $0, negative, exceeds max, non-numeric |
| `test: unit test for atomic counter update` | Verify raised_cents increments correctly |

**Subtasks**:
- [ ] Form validation: Zod schema for donation input
- [ ] Server action: revalidatePath on success to bust ISR cache
- [ ] Error handling: insufficient mock balance, fundraiser not found, fundraiser completed
- [ ] Analytics event: `action_click` with `action: "donate"`, `source: "fundraiser_page"`

### E2E Test: TB2
**File**: `tests/tb2-fundraiser.spec.ts`

```
- Navigate to /f/realtime-alerts-for-wildfire-safety → fundraiser page loads
- Hero image visible, progress bar shows ~70% ($2,102 of $3,000)
- Organizer shows "Janahan Vivekanandan" with avatar
- Description text visible, "Read more" expands full text
- Donations list appears (verify Suspense resolved, shows seed donations)
- Click "Donate now" → modal opens
- Select $50 → fill message "Test donation" → submit → success state shows
- Progress bar updates (optimistic)
- Close modal → back on fundraiser page with updated donation count
- Click "Share" → share UI appears
- Mobile viewport (375px): bottom sheet for donate, layout is single-column
- OG meta tags present in page source (title contains "Real-Time Alerts")
```

### Visual Verification: TB2
- Screenshot: fundraiser page full-page at 1280px
- Screenshot: fundraiser page at 375px (mobile)
- Screenshot: donate modal open (desktop)
- Screenshot: donate bottom sheet (mobile)
- Screenshot: donation success state

### Parallelization Map: TB2
```
Agent A: [PR 2.1: Shell]──────────►[PR 2.3: Donate Modal]
Agent B: [PR 2.2: Donations List]──┘
                                    ▼
                              TB2 Complete
```

---

## TB3: Community + Profile Pages

**Goal**: Both pages functional and interlinked with fundraiser page. Can be heavily parallelized since community and profile pages don't share files.

**Day target**: Day 3

**Depends on**: TB2 complete (shared components: donation card, progress bar, fundraiser card exist)

### PR 3.1: Community Page
**Branch**: `tb3/community-page`
**Agent**: A

| Commit | Description |
|--------|-------------|
| `query: getCommunityBySlug, getCommunityLeaderboard, getCommunityFundraisers` | `lib/queries/communities.ts` — typed queries, leaderboard sorted by raised_cents |
| `ui: community page route + ISR` | `app/communities/[slug]/page.tsx` — revalidate 60 |
| `ui: community header` | Banner image, community name, description, follower avatars, Follow button |
| `ui: impact stats bar` | Raised / Donations / Fundraisers — metric card components. Redis-cached. |
| `ui: leaderboard (streamed)` | Suspense boundary. Ranked fundraiser list with avatars, amounts. "See all" link. |
| `ui: tabs — Activity / Fundraisers / About` | Client component tab switcher. Each tab is a server component loaded on tab switch. |
| `ui: fundraiser grid` | Card grid of community fundraisers. Image + title + organizer + progress bar. Links to /f/[slug]. |
| `action: followCommunity server action` | `lib/actions/follows.ts` — toggle follow, update follower_count counter |
| `ui: loading.tsx skeleton` | Dimension-matched for community page |
| `meta: OG tags` | Community name, description, banner image |

**Subtasks**:
- [ ] "Start a GoFundMe" CTA links to creation flow (placeholder for MVP)
- [ ] Fundraiser card is a shared component: `components/fundraiser-card.tsx`
- [ ] Tab state: URL search params (`?tab=fundraisers`) for shareable tab links
- [ ] Activity tab: chronological list of community posts + fundraiser updates (seed data)

### PR 3.2: Profile Page
**Branch**: `tb3/profile-page`
**Agent**: B (parallel with PR 3.1)

| Commit | Description |
|--------|-------------|
| `query: getUserByUsername, getUserActivity, getUserDonations, getUserFundraisers` | `lib/queries/users.ts` — typed queries |
| `ui: profile page route + ISR` | `app/u/[username]/page.tsx` — revalidate 60 |
| `ui: profile header` | Cover image, avatar, display name, location, follower/following counts, Follow button |
| `ui: giving identity card` | Server-computed: total donated, causes count, top cause, communities joined, active since. Styled as a featured card. |
| `ui: top causes / highlights` | Horizontal scroll of fundraiser cards the user has supported or organized |
| `ui: activity feed` | Chronological: donations made, fundraisers started, posts created. Activity card component. |
| `action: followUser server action` | Reuse `lib/actions/follows.ts` — toggle follow user, update counts |
| `ui: loading.tsx skeleton` | Dimension-matched |
| `meta: OG tags` | User name, giving summary, avatar |

**Subtasks**:
- [ ] Giving identity card: `lib/queries/users.ts` — `getUserGivingSummary()` aggregates donations
- [ ] Activity items link to relevant fundraiser/community pages
- [ ] "Discover more people" section at bottom (seed data of suggested profiles)
- [ ] Own profile vs other's profile: show "Edit profile" button for self

### PR 3.3: Cross-Page Linking + Shared Components
**Branch**: `tb3/cross-links`
**Agent**: A or B (after their PR merges, whichever finishes first)

| Commit | Description |
|--------|-------------|
| `ui: fundraiser card component (shared)` | Used on community page, profile page, and fundraiser page (related fundraisers) |
| `ui: user avatar + name link component` | Clickable avatar → /u/[username]. Used everywhere. |
| `ui: community badge link component` | "Watch Duty" badge → /communities/[slug]. Used on fundraiser + profile pages. |
| `fix: fundraiser page → organizer profile link` | Organizer name links to /u/[username] |
| `fix: fundraiser page → community link` | "for [beneficiary]" links to community page if applicable |
| `fix: community page → fundraiser links` | Fundraiser cards in grid link to /f/[slug] |
| `fix: profile page → fundraiser links` | Highlights + activity items link to /f/[slug] |

### E2E Test: TB3
**File**: `tests/tb3-community-profile.spec.ts`

```
- Navigate to /communities/watch-duty → community page loads
- Banner, stats bar ($39.1K raised), leaderboard rendered
- Leaderboard shows Tim Cadogan #1, Arnie Katz #2, Janahan #3
- Click "Fundraisers" tab → fundraiser grid appears with seed fundraisers
- Click "Real-Time Alerts for Wildfire Safety" card → navigates to /f/realtime-alerts-for-wildfire-safety
- Navigate to /u/janahan → profile page loads
- Giving identity card shows aggregated stats (donations across Watch Duty + BAMA)
- Activity feed shows donations and fundraiser starts
- Click Follow → button state changes (optimistic)
- Cross-navigation: fundraiser page → click "Janahan Vivekanandan" → profile page /u/janahan
- Cross-navigation: fundraiser page → click "Watch Duty" → community page /communities/watch-duty
- Cross-navigation: community page → click leaderboard entry → fundraiser page
- Mobile (375px): all three pages render correctly, single-column layout
```

### Visual Verification: TB3
- Screenshot: community page at 1280px + 375px
- Screenshot: profile page at 1280px + 375px
- Screenshot: community fundraiser grid tab
- Screenshot: profile giving identity card

### Parallelization Map: TB3
```
Agent A: [PR 3.1: Community Page]──────►[PR 3.3: Cross-links]
Agent B: [PR 3.2: Profile Page]────────┘
                                        ▼
                                  TB3 Complete
```

---

## TB4: Social Layer

**Goal**: Content feeds appear on all three pages. Reactions and comments work. Content is shareable via permalink.

**Day target**: Day 4

**Depends on**: TB3 complete

### PR 4.1: Content Card Components
**Branch**: `tb4/content-cards`
**Agent**: A (primary)

| Commit | Description |
|--------|-------------|
| `ui: content card shell` | Shared wrapper: author avatar/name, timestamp, linked fundraiser/community badges, action bar (react, comment, share), view count |
| `ui: video content card` | Mux player integration (`@mux/mux-player-react`). Poster image, lazy player hydration. |
| `ui: image story content card` | Full-bleed image with text overlay. Gradient overlay for text readability. |
| `ui: milestone content card` | Progress ring animation, raised amount, fundraiser title. Auto-generated styling. |
| `ui: community pulse content card` | Stats layout: new fundraisers, raised, new members. Member avatar stack. |
| `ui: donor spotlight content card` | Donor avatar, amount, message, linked fundraiser. Opt-in badge. |
| `ui: text update content card` | Simple text post with optional image. |
| `ui: challenge content card` | Thermometer progress bar, countdown, challenge description, participate CTA. |

**Subtasks**:
- [ ] `components/content-cards/index.tsx` — `ContentCard` component that switches on `content_type`
- [ ] Mux player: `loading="viewport"` for lazy load, `stream-type="on-demand"`
- [ ] Auto-generated cards parse `auto_gen_data` JSON with Zod validation
- [ ] All cards have consistent height constraints for feed layout
- [ ] Shared action bar component: `components/content-cards/action-bar.tsx`

### PR 4.2: Reaction System
**Branch**: `tb4/reactions`
**Agent**: B (parallel with PR 4.1)

| Commit | Description |
|--------|-------------|
| `action: toggleReaction server action` | `lib/actions/reactions.ts` — upsert reaction, atomic counter update on content_posts, micro-donate deducts from mock_balance |
| `ui: reaction button component` | Default: heart. Hover (desktop) / long-press (mobile): expanded reaction set (heart, clap, hug, inspired, pray, micro-donate) |
| `ui: reaction animation` | CSS scale + fade animation on react. Emoji floats up briefly. |
| `ui: micro-donate reaction flow` | Selecting micro-donate opens quick amount picker ($1, $2, $5). Deducts from mock balance. Shows confirmation. |
| `ui: reaction counts display` | Grouped reaction counts on content card (e.g., "❤️ 12  👏 5  🔥 3") |
| `test: unit test for micro-donation balance deduction` | Edge case: insufficient balance, concurrent deductions |

**Subtasks**:
- [ ] Optimistic UI: reaction appears immediately, rolls back on error
- [ ] Long-press detection: `onTouchStart` + `setTimeout(500ms)` + `onTouchEnd` cancels
- [ ] Reaction button state: filled when user has reacted, shows their reaction type
- [ ] Analytics event: `action_click` with `action: "react"`, `reaction_type`

### PR 4.3: Basic Comments
**Branch**: `tb4/comments`
**Agent**: A (after PR 4.1 merges)

| Commit | Description |
|--------|-------------|
| `query: getCommentsByPostId` | `lib/queries/comments.ts` — flat list, newest first, with user join |
| `action: createComment server action` | `lib/actions/comments.ts` — validates, inserts, updates comment_count counter |
| `ui: comment list component` | Flat list of comments. Author avatar, name, text, timestamp. |
| `ui: comment input` | Text input + submit. Auth-gated (show "Sign in to comment" if not authenticated). |
| `ui: donation-sourced comments` | Comments with `donation_id` show donation badge + amount. Visually distinct. |
| `ui: comment section on content cards` | Collapsible comment section below each content card. "View N comments" toggle. |

**Subtasks**:
- [ ] Comment input: Zod validation, max 500 chars
- [ ] Donation-sourced comments pulled from `donations.message` and linked via `comments.donation_id`
- [ ] Seed script should create donation-sourced comments for demo

### PR 4.4: Content Feeds on All Pages
**Branch**: `tb4/content-feeds`
**Agent**: B (after PR 4.2 merges)

| Commit | Description |
|--------|-------------|
| `query: getContentByFundraiserId, getContentByCommunityId, getContentByAuthorId` | Cursor-based pagination queries |
| `ui: content feed component (shared)` | `components/content-feed.tsx` — accepts query function + params, handles IntersectionObserver trigger, infinite scroll, loading states |
| `ui: fundraiser page content section` | Below-fold, IntersectionObserver triggered, "More like this" → FYP link |
| `ui: community page activity tab integration` | Content feed replaces/enhances existing activity tab |
| `ui: profile page content section` | Below-fold, user's created content posts |

**Subtasks**:
- [ ] IntersectionObserver: trigger fetch when sentinel element is 200px from viewport
- [ ] Cursor-based pagination: pass `created_at` of last item as cursor
- [ ] Loading state: skeleton cards while fetching next page
- [ ] Empty state: "No content yet" with CTA to create (links to /studio)

### PR 4.5: Content Permalink Page
**Branch**: `tb4/permalink`
**Agent**: A (after PR 4.3 merges)

| Commit | Description |
|--------|-------------|
| `query: getContentPostById` | With author, fundraiser, community joins |
| `ui: content permalink page` | `app/content/[postId]/page.tsx` — full content display, expanded comments, linked fundraiser card, reactions |
| `meta: OG tags for content sharing` | Title, description, thumbnail. Video posts: OG video tag for inline playback on social. |

### E2E Test: TB4
**File**: `tests/tb4-social-layer.spec.ts`

```
- Navigate to /f/[slug] → scroll down → content feed loads (IntersectionObserver)
- Content cards render with correct types (video thumbnail, milestone animation, etc.)
- Click heart reaction → reaction count increments, button fills
- Hover reaction button → expanded reaction set appears
- Select "clap" → reaction updates to clap
- Click "View N comments" → comment section expands
- Type comment → submit → comment appears in list (auth required)
- Navigate to /content/[postId] → permalink page loads with full content + comments
- Navigate to /communities/[slug] → Activity tab shows content feed
- Navigate to /u/[username] → content section shows user's posts
- Donation-sourced comment shows donation badge with amount
- Micro-donate reaction: select → amount picker → confirm → balance decremented
```

### Visual Verification: TB4
- Screenshot: fundraiser page with content feed loaded
- Screenshot: expanded reaction picker (desktop hover)
- Screenshot: content card with comments expanded
- Screenshot: content permalink page
- Screenshot: community activity tab with content
- Screenshot: profile content section

### Parallelization Map: TB4
```
Agent A: [PR 4.1: Cards]──────►[PR 4.3: Comments]──►[PR 4.5: Permalink]
Agent B: [PR 4.2: Reactions]──►[PR 4.4: Feeds]──────┘
                                                      ▼
                                                TB4 Complete
```

---

## TB5: Fund You Page

**Goal**: Vertical scroll discovery feed with all content types, reactions, and quick-donate. The wow factor.

**Day target**: Day 5

**Depends on**: TB4 complete (content cards, reactions, comments all exist)

### PR 5.1: FYP Layout + Scroll Mechanics
**Branch**: `tb5/fyp-layout`
**Agent**: A (primary)

| Commit | Description |
|--------|-------------|
| `ui: FYP page route` | `app/fyp/page.tsx` — SSR first batch, client-side scroll after |
| `ui: full-viewport card container` | `scroll-snap-type: y mandatory`, `scroll-snap-align: start` on each card. 100dvh per card. |
| `ui: card wrapper for FYP context` | Full-screen variants of each content type. Video fills viewport. Images fill with overlay. Stats cards get large treatment. |
| `ui: right-rail action buttons` | Donate, Share, Follow, Fund It (→ fundraiser page). Fixed position on right side. 44px min touch targets. |
| `ui: bottom overlay` | Author name, post description, fundraiser/community badges. Semi-transparent gradient background. |
| `ui: desktop centered column` | Max-width 480px centered with dark background flanking on desktop. TikTok web style. |

**Subtasks**:
- [ ] `100dvh` not `100vh` (handles mobile browser chrome correctly)
- [ ] Scroll-snap with CSS only — no JS scroll libraries needed for MVP
- [ ] Desktop: dark `#111` background flanking the centered column
- [ ] FYP has its own simplified nav (back arrow + "Fund You Page" title + profile avatar)

### PR 5.2: Feed API + Ranking
**Branch**: `tb5/feed-api`
**Agent**: B (parallel with PR 5.1)

| Commit | Description |
|--------|-------------|
| `api: /api/feed route handler` | GET with params: `source` (fundraiser/community/profile/discover), `id` (seed entity), `cursor`, `limit`. Returns typed content posts with author/fundraiser/community data. |
| `logic: feed ranking algorithm` | `lib/feed/rank.ts` — (1) Seed context items first, (2) same category, (3) same community, (4) trending (highest reaction_count in last 7 days). Chronological within tiers. |
| `logic: content type mixing` | Ensure feed isn't all one type. Inject auto-generated cards between creator content (~40% auto, ~60% creator). |
| `test: unit test for feed ranking` | Verify ordering: seed context > same category > trending. Verify mix ratio. |
| `api: prefetch headers` | Response includes `Link` header for next page (prefetch hint). |

**Subtasks**:
- [ ] Cursor-based: `WHERE created_at < $cursor ORDER BY created_at DESC LIMIT 10`
- [ ] First page cached in Redis (30s TTL) for popular seed queries
- [ ] Response shape: `{ items: ContentPost[], nextCursor: string | null }`

### PR 5.3: FYP Client Integration
**Branch**: `tb5/fyp-client`
**Agent**: A (after PR 5.1 merges, depends on PR 5.2)

| Commit | Description |
|--------|-------------|
| `ui: FYP client-side infinite scroll` | `useFYPFeed` hook — fetches from /api/feed, manages items array, cursor, loading state |
| `ui: prefetch next 2 items` | When current item enters viewport, trigger fetch for items beyond current buffer |
| `ui: FYP reactions integration` | Reaction bar in FYP context — same component, FYP styling variant |
| `ui: FYP quick-donate` | Right-rail Donate button → bottom sheet amount picker → server action → success toast. No page navigation. |
| `ui: "Fund It" button` | Navigates to full fundraiser page (`/f/[slug]`). Preserves FYP scroll position via `history.state`. |

**Subtasks**:
- [ ] Scroll position preservation: save scroll index to `sessionStorage` on navigate away, restore on back
- [ ] Loading state: skeleton full-viewport card while next batch loads
- [ ] Error state: "Couldn't load more content" with retry button

### PR 5.4: Entry Points Wired Up
**Branch**: `tb5/entry-points`
**Agent**: B (after PR 5.2 merges)

| Commit | Description |
|--------|-------------|
| `ui: "More like this" link on fundraiser page` | Below content feed section → `/fyp?source=fundraiser&id=[id]` |
| `ui: "More like this" link on community page` | Below activity tab → `/fyp?source=community&id=[id]` |
| `ui: "Fund You Page" button on profile page` | Prominent button in profile header or giving card → `/fyp?source=profile&id=[id]` |
| `ui: tap-to-expand from inline content cards` | Click any content card on fundraiser/community/profile → opens FYP at that item, scroll down continues feed |
| `ui: nav bar FYP link` | Add "FYP" or flame icon to main nav, links to `/fyp` (discover mode) |

**Subtasks**:
- [ ] Tap-to-expand: pass `startAtPostId` param to FYP, which scrolls to that item on load
- [ ] Nav FYP link: only shows for authenticated users (discovery needs personalization context)

### E2E Test: TB5
**File**: `tests/tb5-fyp.spec.ts`

```
- Navigate to /fyp → full-screen content card renders
- Scroll down → next card snaps into view (scroll-snap)
- Right-rail buttons visible: Donate, Share, Follow, Fund It
- Click Donate → bottom sheet opens → select amount → submit → success toast
- Click "Fund It" → navigates to fundraiser page
- Browser back → returns to FYP at same scroll position
- Navigate to /f/[slug] → scroll to content section → click "More like this" → FYP loads with fundraiser context
- Navigate to /communities/[slug] → click "More like this" → FYP loads with community context
- Navigate to /u/[username] → click "Fund You Page" → FYP loads
- Click inline content card on fundraiser page → FYP opens at that card, scroll continues
- Mobile viewport: full-screen cards, touch scroll works, right-rail accessible
- Desktop: centered column with dark flanking
- Mixed content types appear in feed (not all one type)
```

### Visual Verification: TB5
- Screenshot: FYP full-screen video card at 375px (mobile)
- Screenshot: FYP milestone card at 375px
- Screenshot: FYP at 1280px (desktop centered column)
- Screenshot: FYP quick-donate bottom sheet
- Screenshot: right-rail action buttons

### Parallelization Map: TB5
```
Agent A: [PR 5.1: Layout]────►[PR 5.3: Client Integration]
Agent B: [PR 5.2: Feed API]──►[PR 5.4: Entry Points]
                                        ▼
                                  TB5 Complete
```

---

## TB6: Observability + Metrics Dashboard

**Goal**: Full instrumentation across client and server. Admin dashboard showing real metrics. This is the "we're production-serious" signal.

**Day target**: Day 6 (first half)

**Depends on**: TB5 complete

### PR 6.1: Server-Side Instrumentation
**Branch**: `tb6/server-instrumentation`
**Agent**: A

| Commit | Description |
|--------|-------------|
| `instrumentation: query timing wrapper` | `lib/db/instrumented.ts` — wraps Drizzle queries with `performance.now()` timing. Logs to analytics_events. |
| `instrumentation: server action timing` | Higher-order function wrapping all server actions with duration measurement |
| `instrumentation: Server-Timing headers` | Next.js middleware adds `Server-Timing` header with DB query durations |
| `api: /api/analytics POST endpoint` | Fire-and-forget event ingestion. Validates event shape with Zod. Batch INSERT. |

**Subtasks**:
- [ ] `timedQuery` wrapper is generic — works with any Drizzle query
- [ ] Server-Timing header format: `Server-Timing: db;dur=12, total;dur=45`
- [ ] Analytics endpoint: no auth required (client-side beacon), rate-limited by IP
- [ ] Batch: collect events in memory for 1 second, then bulk INSERT (reduces DB writes)

### PR 6.2: Client-Side Instrumentation
**Branch**: `tb6/client-instrumentation`
**Agent**: B (parallel with PR 6.1)

| Commit | Description |
|--------|-------------|
| `instrumentation: web-vitals reporting` | `lib/analytics/web-vitals.ts` — reports LCP, INP, CLS, TTFB, FCP to /api/analytics via sendBeacon |
| `instrumentation: page view tracking` | `lib/analytics/page-view.ts` — fires on route change, includes page path, referrer, session_id |
| `instrumentation: action click tracking` | `lib/analytics/actions.ts` — `trackAction(type, metadata)` called on donate, share, follow, react. |
| `instrumentation: content view tracking` | IntersectionObserver-based: fires when content card is 50%+ visible for 1+ second |
| `instrumentation: video watch duration` | Mux Data integration or manual tracking via player events (play, pause, ended, timeupdate) |
| `instrumentation: component render timing` | `useRenderTiming` hook — measures time from mount to paint for Suspense-wrapped components |

**Subtasks**:
- [ ] `sendBeacon` for all analytics — never blocks user interaction or navigation
- [ ] Session ID: generated once per session, stored in `sessionStorage`
- [ ] Content view: deduplicate — don't fire multiple times for same content in same session
- [ ] Mux Data: if using Mux player, it auto-reports watch metrics — just enable `mux-data` attributes

### PR 6.3: Admin Metrics Dashboard
**Branch**: `tb6/dashboard`
**Agent**: A (after PR 6.1 merges)

| Commit | Description |
|--------|-------------|
| `query: analytics aggregation queries` | `lib/queries/analytics.ts` — P50/P95 for LCP, query latency; counts by event type; time series for actions |
| `ui: /admin/metrics page` | Protected route (admin user only or demo bypass) |
| `ui: metric cards row` | P50 LCP, P95 LCP, P50 query latency, total page views, total actions |
| `ui: actions breakdown chart` | Bar chart (recharts): donate / share / follow / react counts |
| `ui: content engagement chart` | Bar chart: views by content type |
| `ui: web vitals distribution` | Histogram of LCP values with "good / needs improvement / poor" thresholds |
| `ui: recent events log` | Scrollable table of last 50 analytics events (raw data) |

**Subtasks**:
- [ ] Dashboard auto-refreshes every 30 seconds (polling, not websocket)
- [ ] Recharts for charts (already in our dependency list via shadcn)
- [ ] P50/P95 calculation: `PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY value)` — Postgres native
- [ ] Demo tip: generate some traffic (navigate around, donate, react) before showing dashboard to evaluators

### E2E Test: TB6
**File**: `tests/tb6-observability.spec.ts`

```
- Navigate to /f/[slug] → verify analytics event fired (check /api/analytics received page_view)
- Click Donate → complete donation → verify action_click event with action: "donate"
- React to content → verify action_click event with action: "react"
- Navigate to /admin/metrics → dashboard loads
- Metric cards show non-zero values
- Charts render with data
- Web vitals section shows LCP value
- Recent events log shows entries from test navigation
```

### Parallelization Map: TB6
```
Agent A: [PR 6.1: Server Instrumentation]──►[PR 6.3: Dashboard]
Agent B: [PR 6.2: Client Instrumentation]───┘
                                              ▼
                                        TB6 Complete
```

---

## TB7: Polish + Mobile + Demo Prep

**Goal**: Everything is beautiful, responsive, fast, and demo-ready. Documentation complete.

**Day target**: Day 6 (second half) + Day 7

**Depends on**: TB6 complete

### PR 7.1: Mobile Responsiveness Pass
**Branch**: `tb7/mobile`
**Agent**: A

| Commit | Description |
|--------|-------------|
| `ui: fundraiser page mobile fixes` | Single-column layout, sticky donate button at bottom, proper image sizing |
| `ui: community page mobile fixes` | Banner aspect ratio, tab scrolling, fundraiser grid → single column |
| `ui: profile page mobile fixes` | Identity card full-width, activity feed spacing |
| `ui: FYP mobile polish` | Verify 100dvh, touch-scroll, right-rail positioning, bottom sheet for donate |
| `ui: reaction long-press for mobile` | Touch event handling: long-press → expanded reactions |
| `ui: nav mobile polish` | Hamburger menu items, spacing, animation |

### PR 7.2: Performance Audit + Fixes
**Branch**: `tb7/performance`
**Agent**: B (parallel with PR 7.1)

| Commit | Description |
|--------|-------------|
| `perf: lighthouse audit all pages` | Run Lighthouse CI, log scores. Target: 90+ performance on all pages. |
| `perf: fix CLS issues` | Ensure all skeletons dimension-match their resolved components |
| `perf: verify ISR + Redis caching` | Check cache headers, verify Redis hit rates in logs |
| `perf: image optimization pass` | All images use next/image, correct sizes props, blur placeholders |
| `perf: bundle analysis` | `@next/bundle-analyzer` — identify any unexpectedly large client bundles |
| `perf: verify streaming works` | Check Server-Timing headers show staggered Suspense resolution |

### PR 7.3: Giving Wrapped Card + Visual Polish
**Branch**: `tb7/wrapped`
**Agent**: A (after PR 7.1)

| Commit | Description |
|--------|-------------|
| `ui: giving wrapped static card on profile` | Beautiful stat card: total donated, causes, communities, "Top X% giver in [category]". Gradient border, large typography. |
| `ui: share wrapped as image` | html-to-canvas or similar — "Share your 2026 Giving" button generates shareable image |
| `ui: visual polish pass` | Consistent spacing, color usage, hover states, focus rings, transitions across all pages |
| `ui: empty states` | No donations yet, no content yet, no communities joined — all have designed empty states with CTAs |
| `ui: error states` | 404 page (GFM-styled), error boundaries on dynamic sections, failed donation handling |

### PR 7.4: Studio Page Hooks (Stretch)
**Branch**: `tb7/studio-hooks`
**Agent**: B (if time allows, after PR 7.2)

| Commit | Description |
|--------|-------------|
| `ui: /studio page with post management` | Auth-gated. Lists user's content posts. Edit/delete actions (hooks only for delete). |
| `ui: /studio/new basic creation flow` | Select content type → upload media (or text) → link to fundraiser/community → preview → publish |
| `action: createContentPost server action` | `lib/actions/content.ts` — validates, inserts, revalidates affected pages |
| `ui: content creation guidance` | Sidebar with tips: "60-Second Story format", "What makes a great update", template suggestions |

### PR 7.5: Documentation + Demo Script
**Branch**: `tb7/docs`
**Agent**: A (after PR 7.3)

| Commit | Description |
|--------|-------------|
| `docs: README with architecture overview` | Tech stack, rendering strategy per page, data model summary, performance approach |
| `docs: ARCHITECTURE.md` | Detailed: static shell + streaming pattern, caching strategy, denormalized counters, feed ranking |
| `docs: AI_USAGE.md` | Required by brief. Where AI was used, how, and what value it provided. |
| `docs: INFRASTRUCTURE_ROADMAP.md` | Current state (Vercel) → Target (AWS via SST/OpenNext). Migration plan. Placeholder sst.config.ts. |
| `docs: demo walkthrough script` | 5-minute script: fundraiser → donate → community → profile → FYP → admin dashboard |
| `docs: OBSERVABILITY.md` | What's tracked, why, how. Metrics definitions. Dashboard guide. |

### E2E Test: TB7 (Regression Suite)
**File**: `tests/tb7-regression.spec.ts`

Full regression covering all prior Epic tests plus:
```
- Mobile viewport (375px): all 4 pages render correctly
- Mobile: donate bottom sheet works
- Mobile: FYP scroll-snap works
- Mobile: reaction long-press works
- Desktop (1280px): all 4 pages render correctly
- Cross-page navigation: fundraiser → profile → community → FYP → back
- Auth flow: sign in → sign out → protected route redirects
- 404 page renders for invalid slugs
- Empty states render for entities with no content
- Lighthouse performance score >= 85 on fundraiser page
```

### Visual Verification: TB7
Full screenshot suite across all pages at 375px + 1280px:
- Fundraiser page (mobile + desktop)
- Community page (mobile + desktop)
- Profile page with giving identity card (mobile + desktop)
- FYP (mobile + desktop)
- Admin metrics dashboard
- Donate modal/bottom sheet
- Sign-in page
- 404 page
- Empty states

### Parallelization Map: TB7
```
Agent A: [PR 7.1: Mobile]──►[PR 7.3: Wrapped+Polish]──►[PR 7.5: Docs]
Agent B: [PR 7.2: Perf]────►[PR 7.4: Studio (stretch)]─┘
                                                          ▼
                                                    MVP COMPLETE
```

---

## Post-MVP Milestone: Stretch Goals

Ordered by priority. Each is a self-contained Epic following the same TB methodology.

### TB8: AWS Infrastructure (Priority 1)

**Goal**: Migrate deployment from Vercel to AWS via SST/OpenNext. Same app, production-grade infra.

| PR | Description |
|----|-------------|
| 8.1 | `sst.config.ts` with `Nextjs` construct. CloudFront + Lambda + S3. |
| 8.2 | Migrate Postgres to RDS (or keep Neon, just swap connection string) |
| 8.3 | Migrate Redis to ElastiCache (or keep Vercel KV / Upstash) |
| 8.4 | Custom domain + SSL via ACM |
| 8.5 | CI/CD: GitHub Actions → `sst deploy --stage prod` |
| 8.6 | Infrastructure monitoring: CloudWatch dashboards, Lambda metrics |

**E2E**: Same regression suite runs against AWS deployment URL.

### TB9: Full Comments System (Priority 2)

**Goal**: Threaded replies, upvotes, enable/disable toggle, real-time updates.

| PR | Description |
|----|-------------|
| 9.1 | Threaded comments: `parent_comment_id` UI (indent replies, "Reply" button) |
| 9.2 | Upvote system: `comment_votes` table integration, sort by upvotes option |
| 9.3 | Comments enable/disable toggle on content posts (creator setting) |
| 9.4 | Optimistic UI for comment creation + upvoting |
| 9.5 | Real-time comment updates via SSE (Server-Sent Events) |

### TB10: Content Creation Studio (Priority 3)

**Goal**: Full content creation flow with AI-assisted guidance.

| PR | Description |
|----|-------------|
| 10.1 | Studio dashboard: manage posts, analytics per post, draft system |
| 10.2 | Video upload flow: record or upload → Mux ingest → processing → ready |
| 10.3 | Image story creator: upload image → add text overlay → position/style → publish |
| 10.4 | AI content assistant: Claude API integration suggesting story structure, hooks, CTAs |
| 10.5 | Template system: pre-built Remotion compositions for "60-Second Story", "Update Drop", etc. |
| 10.6 | Remotion editor: lightweight embedded editor for template customization |
| 10.7 | Export to social: generate MP4 via Remotion Lambda, download or share directly |

### TB11: Community Montage (Priority 4)

**Goal**: Auto-assembled community video from member-submitted clips.

| PR | Description |
|----|-------------|
| 11.1 | Clip submission flow: community prompt → record 5-sec clip → upload |
| 11.2 | Clip review queue for community admins |
| 11.3 | Auto-montage: Remotion composition that stitches clips with transitions + music |
| 11.4 | Montage rendering via Remotion Lambda |
| 11.5 | Pinned montage on community page |

### TB12: Giving Wrapped Video (Priority 5)

**Goal**: Spotify Wrapped-style video for philanthropic identity.

| PR | Description |
|----|-------------|
| 12.1 | Data aggregation: annual giving stats pipeline |
| 12.2 | Remotion composition: animated wrapped sequence (stats, causes, impact) |
| 12.3 | Server-side rendering via Remotion Lambda (generate MP4 per user) |
| 12.4 | Share flow: download MP4 or share to IG Stories / LinkedIn / TikTok |

### TB13: Advanced FYP Ranking (Priority 6)

**Goal**: ML-based personalization for the discovery feed.

| PR | Description |
|----|-------------|
| 13.1 | Engagement scoring: weight reactions, watch duration, shares, donations |
| 13.2 | Collaborative filtering: "users who donated to X also engaged with Y" |
| 13.3 | Geographic proximity boost |
| 13.4 | Diversity injection: prevent filter bubbles, surface underrepresented causes |
| 13.5 | A/B testing framework for ranking experiments |

---

## Cross-Cutting Concerns

### Unit Test Strategy

Tests are added within each PR, not as a separate testing Epic. The rule:

**Do test**:
- Financial calculations (donation amounts, counter updates, balance deductions)
- Feed ranking algorithm (ordering, mix ratios)
- Data transformation functions (API response → UI props)
- Cache invalidation logic
- Zod validation schemas
- Time-sensitive logic (relative time formatting, TTL expiry)

**Don't test**:
- React component rendering (Playwright covers this)
- Simple CRUD operations (DB driver is trusted)
- Tailwind class application
- Static configuration
- Re-testing library behavior (Auth.js, Mux player)

### Test runner: Vitest
- Collocated with source: `lib/feed/__tests__/rank.test.ts`
- Run in CI before Playwright

### Playwright Configuration

```typescript
// playwright.config.ts
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'desktop', use: { viewport: { width: 1280, height: 720 } } },
    { name: 'mobile', use: { viewport: { width: 375, height: 812 } } },
  ],
});
```

### Visual Verification Agent Script

At the end of each Epic, the verification agent runs:

```bash
# 1. Start dev server or use preview deployment
# 2. Launch headless Chrome
# 3. Navigate to each affected page
# 4. Screenshot at desktop + mobile viewports
# 5. Compare against expected layout (manual review or visual regression)
# 6. Log any console errors
# 7. Check network tab for failed requests
# 8. Measure LCP via Performance Observer
```

Screenshots are stored in `tests/screenshots/tb{N}/` for review.
