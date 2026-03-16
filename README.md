# GoFundMe Reimagined

A reimagined crowdfunding platform built with Next.js 16, React Server Components, and modern web technologies. Discover fundraisers, donate, and make a difference through a TikTok-style discovery feed.

**Live:** https://gauntlet-gfm.vercel.app (Vercel) | https://d220wjvplh2h35.cloudfront.net (AWS/CloudFront)

## Features

- **Fundraiser Pages** — Rich campaign pages with hero images, progress tracking, donation lists, and content feeds
- **Fund You Page** — TikTok-style vertical scroll discovery feed with full-viewport snap-scroll cards
- **Community Pages** — Community hubs with activity feeds, leaderboards, and fundraiser directories
- **Profile Pages** — Giving identity cards, activity feeds, and social connections
- **Social Layer** — Reactions (6 types + micro-donate), comments, follows, and sharing
- **Quick Donate** — One-tap donations from the FYP with preset amounts
- **Admin Dashboard** — Real-time metrics with Web Vitals, action tracking, and event logs
- **Full Observability** — Client-side Web Vitals, page views, action tracking via sendBeacon

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 16, App Router, RSC, TypeScript |
| Deployment | AWS (SST/OpenNext — CloudFront + Lambda + S3) |
| CI/CD | GitHub Actions |
| Database | Neon Postgres + Drizzle ORM |
| Cache | Upstash Redis (HTTP) |
| Auth | Auth.js v5 + Google OAuth |
| Video | Mux (HLS streaming + thumbnails) |
| Styling | Tailwind CSS + shadcn/ui |
| Charts | Recharts (admin dashboard) |
| Analytics | Custom (Web Vitals + Postgres) |
| Font | DM Sans |

## Architecture

All pages use **ISR** (60s revalidation) with **React Server Components** for the initial shell and `<Suspense>` for streaming data-heavy sections. Mutations use **API routes** (not server actions) to avoid RSC re-render crashes on Vercel.

Key architectural decisions:
- **No transactions**: Neon HTTP driver doesn't support `db.transaction()` — we use sequential queries with atomic SQL increments
- **Denormalized counters**: `raisedCents`, `donationCount`, `reactionCount` updated atomically to avoid expensive aggregations
- **sendBeacon analytics**: Client events batched for 1 second, sent via `navigator.sendBeacon` for reliable delivery during page unload
- **Feed ranking**: Multi-signal algorithm (seed context → community → trending → chronological) with cursor pagination

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for detailed architecture documentation.

## Getting Started

```bash
npm install
cp .env.example .env.local  # Fill in credentials
npm run db:seed              # Seed demo data
npm run dev                  # Start dev server at localhost:3000
```

### Required Environment Variables

```
DATABASE_URL              # Neon Postgres connection string
UPSTASH_REDIS_REST_URL    # Upstash Redis REST endpoint
UPSTASH_REDIS_REST_TOKEN  # Upstash Redis REST token
NEXTAUTH_SECRET           # openssl rand -base64 32
NEXTAUTH_URL              # http://localhost:3000 (dev)
GOOGLE_CLIENT_ID          # Google OAuth
GOOGLE_CLIENT_SECRET      # Google OAuth
MUX_TOKEN_ID              # Mux video (optional)
MUX_TOKEN_SECRET          # Mux video (optional)
```

## Documentation

- [Architecture](docs/ARCHITECTURE.md) — Rendering strategy, data model, caching, feed ranking
- [AI Usage](docs/AI_USAGE.md) — How AI was used to accelerate development
- [Observability](docs/OBSERVABILITY.md) — What's tracked, how, and the admin dashboard guide
- [Sprint Plan](docs/gofundme-sprint-plan.md) — Full development plan with parallelization maps

## Commit History

### TB1: Foundation
- `f80d684` — PR 1.1: Project scaffold, Tailwind, shadcn/ui, Playwright config
- `930deb5` — PR 1.2: Drizzle schema (14 tables, 6 enums, 15 indexes)
- `77acaf3` — PR 1.3: Auth.js v5 Google OAuth with custom adapter
- `4165a10` — PR 1.4: Seed data (8 users, 2 communities, 8 fundraisers, ~50 donations, 5 Mux videos) + Redis cache
- `4baba12` — PR 1.5: Root layout with DM Sans, nav + footer

### TB2: Fundraiser Page
- `26eff9b` — PR 2.1: Fundraiser page at /f/[slug] with ISR, hero, progress bar, organizer card, description
- `a78c52e` — PR 2.2: Donations list with Suspense streaming
- `e0ef5ca` — PR 2.3: Donate page with server action, Zod validation, celebration animation

### TB3: Community + Profile Pages
- `1e3e8cb` — PR 3.1: Community page at /communities/[slug] with header, tabs, leaderboard, follow action
- `6b92cb2` — PR 3.2: Profile page at /u/[username] with giving identity card, activity feed, follow
- `c240fde` — PR 3.3: Shared components (fundraiser-card, user-avatar-link, community-badge-link)

### TB4: Social Layer
- `cea4599` — PR 4.1: Content card components for all 7 content types (video/Mux, image_story, milestone, pulse, spotlight, text, challenge)
- `4a7c14e` — PR 4.2: Reaction system with toggle action, picker UI, micro-donate flow, CSS animations
- `718b56a` — PR 4.3: Comments with query/action, collapsible section, donation-sourced badges
- `387be5e` — PR 4.4: Content feeds integrated into fundraiser, community, and profile pages
- `d1bd223` — PR 4.5: Content permalink page at /content/[postId] with reactions + expanded comments

### TB5: Fund You Page
- `4bdc4fd` — PR 5.1: FYP layout with scroll-snap, full-viewport cards, right-rail actions, desktop centered column
- `c4e23b1` — PR 5.2: Feed API route with ranking algorithm and cursor pagination
- `c4b93ac` — PR 5.3: FYP client-side infinite scroll, quick donate sheet, scroll position persistence
- `2543340` — PR 5.4: FYP entry points from nav, fundraiser, community, and profile pages

### TB6: Observability + Metrics Dashboard
- `2481ee5` — PR 6.1–6.4: Server/client instrumentation, admin metrics dashboard at /admin/metrics, action tracking across all surfaces

### TB7: Polish + Mobile + Demo Prep
- `2514564` — PR 7.1–7.2: Mobile responsiveness (all pages), image optimization, CLS fixes, loading skeletons, docs
- `49d6de8` — PR 7.3: Giving Wrapped card on profile, GFM-styled 404 page
- `1e1f8ef` — PR 7.6: Loading/latency visibility — timedQuery, Server-Timing headers, slow query tracking, nav timing

### TB8: AWS Infrastructure Migration
- `d84b366` — PR 8.1–8.4: Swap ioredis → @upstash/redis, SST v3 config, GitHub Actions CI/CD, Playwright remote testing, docs update
