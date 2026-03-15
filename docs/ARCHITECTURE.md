# Architecture — GoFundMe Reimagined

## Overview

GoFundMe Reimagined is a full-stack crowdfunding platform built with Next.js 16, using the App Router with React Server Components. The architecture prioritizes fast initial page loads, real-time social engagement, and a TikTok-style discovery feed.

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Framework | Next.js 16 (App Router) | RSC for zero-JS server pages, streaming Suspense, ISR |
| Language | TypeScript | Type safety across the full stack |
| Database | Vercel Postgres (Neon) | Serverless Postgres with HTTP driver for edge compatibility |
| ORM | Drizzle | Type-safe queries, lightweight, Neon HTTP driver support |
| Cache | Upstash Redis | Low-latency caching for feed data and query results |
| Auth | Auth.js v5 + Google OAuth | JWT sessions, custom adapter for our user schema |
| Video | Mux | HLS streaming, adaptive bitrate, thumbnail generation |
| Styling | Tailwind CSS + shadcn/ui | Utility-first with accessible, composable components |
| Analytics | Custom (Postgres + Web Vitals) | Full observability without third-party dependencies |
| Deployment | AWS via SST/OpenNext | CloudFront CDN, Lambda SSR, S3 static assets, SQS ISR revalidation |
| CI/CD | GitHub Actions | Lint on PR, deploy on merge to main |

## Rendering Strategy

Each page uses the optimal rendering strategy for its data requirements:

| Page | Strategy | Revalidation | Why |
|------|----------|-------------|-----|
| `/f/[slug]` | ISR | 60s | Fundraiser data changes infrequently; stale-while-revalidate gives fast loads |
| `/f/[slug]/donate` | ISR | 60s | Form is client-side; server just provides fundraiser context |
| `/communities/[slug]` | ISR | 60s | Community stats update via donations; 60s is fresh enough |
| `/u/[username]` | ISR | 60s | Profile data is relatively stable |
| `/fyp` | ISR + Client | 60s (seed) | First page from server, infinite scroll via client-side `/api/feed` |
| `/admin/metrics` | Dynamic | 0 (no cache) | Always-fresh data for observability |
| `/content/[postId]` | ISR | 60s | Content post with reactions and comments |

### Static Shell + Streaming Pattern

Pages use React Server Components for the initial shell (nav, layout, above-fold content) with `<Suspense>` boundaries for data-heavy sections. This gives:

1. **Instant TTFB**: The shell renders immediately
2. **Progressive loading**: Donations list, comments, and content feeds stream in
3. **Zero client JS** for read-only sections (fundraiser description, community stats)

## Data Model

### Schema Overview (14 tables, 6 enums)

```
users ←→ accounts, sessions (Auth.js)
  │
  ├─→ fundraisers (organizer)
  │     ├─→ donations
  │     └─→ contentPosts
  │
  ├─→ communityMembers → communities
  │
  ├─→ reactions → contentPosts
  ├─→ comments → contentPosts
  ├─→ commentVotes → comments
  │
  ├─→ follows (follower ↔ following)
  │
  └─→ analyticsEvents (observability)
```

### Denormalized Counters

To avoid expensive COUNT queries, we maintain denormalized counters:

- `fundraisers.raisedCents` — sum of donation amounts
- `fundraisers.donationCount` — count of donations
- `contentPosts.reactionCount` — count of reactions
- `contentPosts.commentCount` — count of comments
- `communities.followerCount` — count of members

These are updated atomically via SQL: `SET raised_cents = raised_cents + $amount`. This is safe without transactions because each UPDATE is atomic at the database level.

### Why No Transactions

The Neon HTTP driver (`@neondatabase/serverless`) does not support `db.transaction()`. All multi-statement operations use sequential queries with atomic SQL increments/decrements. This is a deliberate trade-off: the HTTP driver enables edge deployment and serverless scaling, while atomic column-level updates prevent data corruption.

## Caching Strategy

### Redis (Upstash)

```
cachedQuery(key, ttl, queryFn)  →  check Redis → miss → run query → store → return
invalidateCache(pattern)         →  delete matching keys
```

Cache keys follow the pattern: `entity:id:variant`
- `fundraiser:slug:detail` — full fundraiser data
- `feed:source:cursor` — paginated feed results (30s TTL for first page)

### ISR (Next.js)

All pages use `revalidate = 60` (1 minute). On Vercel, this means:
- First request after 60s triggers a background regeneration
- Users always get a cached response (stale-while-revalidate)
- New data appears within ~60 seconds of a mutation

### Why Not revalidatePath

We discovered that calling `revalidatePath()` after server actions causes RSC re-render crashes on Vercel. The solution: mutations use API routes (`POST /api/donate`) instead of server actions, and rely on ISR's 60-second revalidation window.

## Feed Ranking Algorithm

The Fund You Page (`/fyp`) uses a multi-signal ranking algorithm:

1. **Seed context**: If the user arrived from a specific community/fundraiser, prioritize related content
2. **Same community**: Content from communities the seed fundraiser belongs to
3. **Trending**: Posts with high recent engagement (reactions + comments in last 24h)
4. **Chronological**: Remaining posts ordered by creation date
5. **Content type interleaving**: ~60% creator content, ~40% auto-generated (milestones, spotlights)

Pagination is cursor-based with deduplication to prevent seeing the same card twice.

## Authentication

Auth.js v5 with JWT strategy and Google OAuth:

- **Custom adapter**: Maps Auth.js's expected `name` field to our `displayName` + auto-generates `username`
- **JWT sessions**: No server-side session storage needed; token contains `user.id`
- **Middleware**: Protects `/studio/*` and `/admin/*` routes, redirecting to `/sign-in`

## Observability

### Client-Side
- **Web Vitals**: LCP, INP, CLS, TTFB, FCP via `web-vitals` package
- **Page views**: Tracked on every navigation with session ID
- **Action tracking**: donate, share, follow, react, comment events
- **Delivery**: Batched via `sendBeacon` (1s buffer) to `POST /api/analytics`

### Server-Side
- **Query timing**: `timedQuery()` wrapper measures Drizzle query duration
- **Server-Timing headers**: Available for any page to expose DB timing
- **Event tracking**: `trackEvent()` for server-side analytics

### Admin Dashboard (`/admin/metrics`)
- Metric cards: page views, donations, reactions, comments, follows, web vitals P50/P95
- Actions breakdown bar chart (recharts)
- LCP distribution histogram with good/needs-improvement/poor thresholds
- Recent events table (last 50 raw events)
- 30-second auto-refresh

## Deployment Architecture (AWS via SST/OpenNext)

SST v3 uses OpenNext to compile the Next.js app into AWS-native resources:

| Component | AWS Service | Purpose |
|-----------|------------|---------|
| CDN | CloudFront | Global edge caching, SSL termination |
| Static Assets | S3 | JS/CSS/images, immutable cache headers |
| SSR | Lambda | Server-side rendering for ISR pages |
| Middleware | Lambda@Edge | Auth middleware, redirects |
| ISR Revalidation | SQS + Lambda | Background page regeneration |
| Image Optimization | Lambda | On-demand image resizing via `next/image` |

All external services (Neon Postgres, Upstash Redis, Mux) connect over HTTPS — no VPC or private networking needed. Environment variables are injected at build time via `sst.config.ts`.

**CI/CD:** GitHub Actions runs lint on every PR. On merge to `main`, it deploys to AWS via `npx sst deploy --stage production`. AWS credentials and app secrets are stored as GitHub Secrets.

**Testing against AWS:** Set `PLAYWRIGHT_BASE_URL` to the CloudFront URL to run Playwright tests against the deployed stack:
```bash
PLAYWRIGHT_BASE_URL=https://<cloudfront-id>.cloudfront.net npx playwright test
```

## Key Design Decisions

| Decision | Alternative Considered | Why We Chose This |
|----------|----------------------|-------------------|
| Neon HTTP driver | Neon WebSocket driver | HTTP works at edge, no persistent connections needed |
| No transactions | WebSocket driver with transactions | Edge compatibility > transaction safety; atomic SQL is sufficient |
| API routes for mutations | Server actions | Server actions + revalidatePath crashes RSC on Vercel |
| ISR over SSR | Full SSR on every request | 60s stale data is acceptable; ISR is much faster |
| JWT sessions | Database sessions | Stateless, no DB lookup per request |
| Custom Auth.js adapter | Stock DrizzleAdapter | Our schema has `displayName` + `username` instead of `name` |
| Denormalized counters | JOIN + COUNT queries | O(1) reads vs O(n) aggregation; updated atomically |
| sendBeacon for analytics | fetch() | Reliable delivery during page unload |
| Recharts for dashboard | D3 / Chart.js | Built for React, works with RSC patterns, tree-shakeable |
