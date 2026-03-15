# GoFundMe Reimagined

A reimagined crowdfunding platform built with Next.js 15, React Server Components, and modern web technologies. Discover fundraisers, donate, and make a difference.

**Live:** https://gauntlet-gfm.vercel.app

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 15, App Router, RSC, TypeScript |
| Database | Vercel Postgres (Neon) + Drizzle ORM |
| Cache | Upstash Redis |
| Auth | Auth.js v5 + Google OAuth |
| Styling | Tailwind CSS + shadcn/ui |
| Font | DM Sans |

## Getting Started

```bash
npm install
cp .env.example .env.local  # Fill in credentials
npm run db:seed              # Seed demo data
npm run dev                  # Start dev server at localhost:3000
```

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
