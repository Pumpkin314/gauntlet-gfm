# Setup Guides

## Google OAuth Setup (10 minutes)

### Steps:

1. **Go to Google Cloud Console**: https://console.cloud.google.com/

2. **Create a new project** (or use existing):
   - Click the project dropdown at top → "New Project"
   - Name: `gofundme-reimagined`
   - Click "Create"

3. **Enable the Google Identity API**:
   - In the left sidebar: APIs & Services → Library
   - Search "Google Identity" or go directly to: APIs & Services → Credentials
   - (The OAuth consent screen setup will prompt you to configure this)

4. **Configure OAuth Consent Screen**:
   - APIs & Services → OAuth consent screen
   - Select "External" (anyone with a Google account can sign in)
   - App name: `GoFundMe Reimagined`
   - User support email: your email
   - Developer contact: your email
   - Click "Save and Continue"
   - Scopes: add `email`, `profile`, `openid` → Save
   - Test users: add your own email → Save
   - Back to dashboard

5. **Create OAuth Client ID**:
   - APIs & Services → Credentials → "Create Credentials" → "OAuth client ID"
   - Application type: **Web application**
   - Name: `GFM Reimagined Web`
   - Authorized JavaScript origins:
     - `http://localhost:3000`
     - `https://your-app.vercel.app` (add after first Vercel deploy)
   - Authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google`
     - `https://your-app.vercel.app/api/auth/callback/google`
   - Click "Create"

6. **Copy credentials**:
   - You'll see a Client ID and Client Secret
   - Add to your `.env.local`:
     ```
     GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
     GOOGLE_CLIENT_SECRET=your-client-secret-here
     ```

7. **Generate NextAuth secret**:
   ```bash
   openssl rand -base64 32
   ```
   Add to `.env.local`:
   ```
   NEXTAUTH_SECRET=your-generated-secret
   NEXTAUTH_URL=http://localhost:3000
   ```

8. **After first Vercel deploy**: Go back to Google Cloud Console and add your Vercel production URL to both the JavaScript origins and redirect URIs.

### Common gotchas:
- The redirect URI must match EXACTLY — including trailing slashes
- "Error 403: access_denied" usually means you haven't added your email as a test user (required while app is in "Testing" status)
- To move past "Testing" → publish the app (it'll say "unverified" but works fine for demos)


---

## GitHub Issues Setup Script

Save this as `scripts/setup-github-issues.sh` and run with:
```bash
chmod +x scripts/setup-github-issues.sh
./scripts/setup-github-issues.sh owner/repo
```

```bash
#!/bin/bash
# Usage: ./setup-github-issues.sh owner/repo
# Requires: gh CLI authenticated

REPO=$1
if [ -z "$REPO" ]; then
  echo "Usage: ./setup-github-issues.sh owner/repo"
  exit 1
fi

echo "Creating milestones..."

gh api repos/$REPO/milestones -f title="TB1: Foundation" -f description="Scaffold + DB + Auth + Seed data. Deployable skeleton." -f state="open" 2>/dev/null
gh api repos/$REPO/milestones -f title="TB2: Fundraiser Page" -f description="The most important page — view, donate, share. Matches GFM layout." -f state="open" 2>/dev/null
gh api repos/$REPO/milestones -f title="TB3: Community + Profile Pages" -f description="Both pages functional and interlinked. Can be parallelized." -f state="open" 2>/dev/null
gh api repos/$REPO/milestones -f title="TB4: Social Layer" -f description="Content feeds, reactions, comments, permalink page." -f state="open" 2>/dev/null
gh api repos/$REPO/milestones -f title="TB5: Fund You Page" -f description="Vertical scroll discovery feed — the wow factor." -f state="open" 2>/dev/null
gh api repos/$REPO/milestones -f title="TB6: Observability" -f description="Full instrumentation + admin metrics dashboard." -f state="open" 2>/dev/null
gh api repos/$REPO/milestones -f title="TB7: Polish + Mobile + Docs" -f description="MVP complete. Responsive, fast, documented, demo-ready." -f state="open" 2>/dev/null
gh api repos/$REPO/milestones -f title="TB8: AWS Infrastructure" -f description="[Stretch] Migrate to AWS via SST/OpenNext." -f state="open" 2>/dev/null
gh api repos/$REPO/milestones -f title="TB9: Full Comments" -f description="[Stretch] Threading, upvotes, enable/disable." -f state="open" 2>/dev/null
gh api repos/$REPO/milestones -f title="TB10: Content Studio" -f description="[Stretch] Full creation flow with AI assistance." -f state="open" 2>/dev/null

echo "Creating labels..."

gh label create "infra" --repo $REPO --color "1D76DB" --description "Infrastructure, config, deployment" 2>/dev/null
gh label create "ui" --repo $REPO --color "0E8A16" --description "UI components, pages, styling" 2>/dev/null
gh label create "data" --repo $REPO --color "D93F0B" --description "Database, queries, seed data" 2>/dev/null
gh label create "perf" --repo $REPO --color "FBCA04" --description "Performance, caching, optimization" 2>/dev/null
gh label create "stretch" --repo $REPO --color "D876E3" --description "Stretch goal — post-MVP" 2>/dev/null
gh label create "agent-a" --repo $REPO --color "C2E0C6" --description "Assigned to Agent A" 2>/dev/null
gh label create "agent-b" --repo $REPO --color "BFD4F2" --description "Assigned to Agent B" 2>/dev/null

echo "Creating TB1 issues..."

gh issue create --repo $REPO --title "PR 1.1: Project Scaffold + Tooling" --milestone "TB1: Foundation" --label "infra,agent-a" --body "## Scope
- create-next-app with App Router, TypeScript strict, Tailwind
- shadcn/ui init (Button, Card, Skeleton, Dialog, Sheet, Avatar, Badge, Tabs, DropdownMenu)
- ESLint + Prettier + editorconfig
- Vercel project link + .env.example
- Playwright config + smoke test

## Parallelization
Runs in parallel with PR 1.2 (no file overlap)

## Done when
- \`npm run dev\` starts successfully
- \`npm run lint\` passes
- Deployed to Vercel preview
- Playwright smoke test passes"

gh issue create --repo $REPO --title "PR 1.2: Database Schema + Migrations" --milestone "TB1: Foundation" --label "data,agent-b" --body "## Scope
- Drizzle ORM setup with @neondatabase/serverless
- All tables: users, fundraisers, communities, community_members, donations, content_posts, reactions, comments, comment_votes, follows, analytics_events
- All enum types: content_type, reaction_type, donation_source, fundraiser_status, post_status, community_role
- All 15 indexes from performance plan
- drizzle.config.ts + lib/db/index.ts connection helper
- Run initial migration

## Parallelization
Runs in parallel with PR 1.1 (no file overlap)

## Done when
- \`drizzle-kit push\` succeeds against Vercel Postgres
- TypeScript types exported for all tables
- db instance connectable from a test script"

gh issue create --repo $REPO --title "PR 1.3: Auth (Google OAuth)" --milestone "TB1: Foundation" --label "infra,agent-a" --body "## Scope
- Auth.js v5 with Google OAuth provider + Drizzle adapter
- JWT session strategy with user.id + user.username embedded
- Middleware protecting /studio/* routes
- Sign-in page with Google button (GFM-styled)
- getCurrentUser() helper returning typed User | null
- Auth state in nav (avatar dropdown when signed in)

## Dependencies
- PR 1.1 must merge first (project exists)
- Can run parallel with PR 1.2

## Prerequisites (manual)
- Google Cloud OAuth client created (see docs/google-oauth-setup.md)
- GOOGLE_CLIENT_ID + GOOGLE_CLIENT_SECRET in .env.local

## Done when
- Google sign-in flow works end-to-end
- Session persists across page navigations
- /studio redirects to /sign-in when not authenticated"

gh issue create --repo $REPO --title "PR 1.4: Seed Data + Redis" --milestone "TB1: Foundation" --label "data,agent-b" --body "## Scope
- Upstash Redis connection + cache helper utilities
- Seed script (\`lib/db/seed.ts\`) reads \`docs/seed-data.json\` as single source of truth
- 8 users, 2 communities, 8 fundraisers, 40-60 donations (generated), 17 content posts, comments, reactions, follows, community memberships
- All media URLs (images, Mux playback IDs) are defined in seed-data.json
- npm script: \`db:seed\` (idempotent — clears and re-seeds)

## Prerequisites (MANUAL — verify before starting)
- Mux playback IDs pasted into docs/seed-data.json (check for PASTE_HERE — if found, STOP)
- Vercel Postgres provisioned and DATABASE_URL in .env.local
- Upstash Redis provisioned and REDIS_URL in .env.local

## Done when
- \`npm run db:seed\` populates all tables
- Row counts logged after seeding
- Redis connection verified with test get/set
- cachedQuery helper works with typed TTL"

## Dependencies
- PR 1.2 must merge first (schema exists)

## Prerequisites (manual)
- Mux account with API credentials
- Demo videos uploaded to Mux

## Done when
- \`npm run db:seed\` populates all tables with realistic data
- Redis connection verified
- cachedQuery helper works with typed get/set/invalidation"

gh issue create --repo $REPO --title "PR 1.5: Root Layout + Navigation" --milestone "TB1: Foundation" --label "ui,agent-a" --body "## Scope
- Root layout with GFM-style nav (logo, Donate/Fundraise/About dropdowns, search placeholder, auth button)
- Mobile nav with hamburger menu (Sheet component)
- Font loading via next/font (Inter or GFM match), display: swap
- Footer matching GFM pattern
- Global loading.tsx fallback

## Dependencies
- PR 1.3 must merge first (auth state needed for nav)

## Done when
- Nav renders on all routes, responsive
- Mobile hamburger opens/closes
- Auth state shows in nav
- Footer renders"

echo "Creating TB2 issues..."

gh issue create --repo $REPO --title "PR 2.1: Fundraiser Page — Static Shell" --milestone "TB2: Fundraiser Page" --label "ui,perf,agent-a" --body "## Scope
- /f/[slug] route with ISR (revalidate=60)
- Hero image (next/image priority), progress bar, donate button
- Organizer card (avatar, name, beneficiary link, verified badge)
- Description with read-more truncation
- Metadata section (date, category, tax deductible)
- Share button (Web Share API + copy-link fallback)
- loading.tsx skeleton
- OG meta tags via generateMetadata

## Done when
- /f/realtime-alerts-for-wildfire-safety renders with seed data
- Looks like the real GFM fundraiser page
- Lighthouse LCP < 2.5s"

gh issue create --repo $REPO --title "PR 2.2: Donations List (Streamed)" --milestone "TB2: Fundraiser Page" --label "ui,perf,agent-b" --body "## Scope
- getRecentDonations query with user join
- Donation card component (avatar, name, amount, message, relative time)
- Suspense boundary with skeleton fallback
- See all / See top toggle
- Redis-cached fundraiser stats for progress bar

## Parallelization
Runs in parallel with PR 2.1

## Done when
- Donations list appears after skeleton resolves
- Relative time formatting works
- Anonymous donations handled"

gh issue create --repo $REPO --title "PR 2.3: Donate Modal + Server Action" --milestone "TB2: Fundraiser Page" --label "ui,data,agent-a" --body "## Scope
- createDonation server action (atomic transaction: INSERT donation + UPDATE counters)
- Intercepting route modal: /f/[slug]/@donate/(.)donate
- Amount presets ($25, $50, $100, custom) + message field
- Mobile: bottom sheet. Desktop: dialog.
- Optimistic UI (useOptimistic on progress bar)
- Success state with celebration animation
- Zod validation, error handling
- Analytics event tracking
- Unit tests for donation validation + counter update

## Dependencies
- PR 2.1 must merge first

## Done when
- Full donate flow works end-to-end
- Progress bar updates optimistically
- Direct navigation to /f/[slug]/donate works as full page
- Unit tests pass"

echo "Creating TB3 issues..."

gh issue create --repo $REPO --title "PR 3.1: Community Page" --milestone "TB3: Community + Profile Pages" --label "ui,agent-a" --body "## Scope
- /communities/[slug] route with ISR
- Banner, header, description, follow button
- Impact stats bar (Redis-cached)
- Leaderboard (streamed via Suspense)
- Tabs: Activity / Fundraisers / About (URL search params)
- Fundraiser grid with shared fundraiser-card component
- followCommunity server action
- loading.tsx skeleton, OG tags

## Parallelization
Runs in parallel with PR 3.2 (different route dirs)

## Done when
- /communities/watch-duty renders with all sections
- Tabs switch, fundraiser grid shows cards
- Follow button toggles"

gh issue create --repo $REPO --title "PR 3.2: Profile Page" --milestone "TB3: Community + Profile Pages" --label "ui,agent-b" --body "## Scope
- /u/[username] route with ISR
- Profile header (cover, avatar, follow stats, follow button)
- Giving identity card (server-computed aggregate)
- Top causes / highlights horizontal scroll
- Activity feed (donations, fundraiser starts)
- followUser server action
- loading.tsx skeleton, OG tags

## Parallelization
Runs in parallel with PR 3.1 (different route dirs)

## Done when
- /u/janahan renders with all sections
- Giving identity card shows correct aggregated stats
- Follow button toggles"

gh issue create --repo $REPO --title "PR 3.3: Cross-Page Linking + Shared Components" --milestone "TB3: Community + Profile Pages" --label "ui" --body "## Scope
- Shared fundraiser-card component
- User avatar + name link component
- Community badge link component
- Wire all cross-links: fundraiser→profile, fundraiser→community, community→fundraiser, profile→fundraiser

## Dependencies
- PR 3.1 and PR 3.2 must merge first

## Done when
- Can navigate between all three page types via links
- Shared components render consistently across pages"

echo "Creating TB4 issues..."

gh issue create --repo $REPO --title "PR 4.1: Content Card Components" --milestone "TB4: Social Layer" --label "ui,agent-a" --body "## Scope
Content card shell + 7 card type variants:
- Video (Mux player, lazy), Image story, Milestone, Community pulse, Donor spotlight, Text update, Challenge
- Shared action bar (react, comment, share)
- Mux player: loading=viewport, stream-type=on-demand

## Done when
- All 7 card types render correctly with seed data
- Video player loads lazily
- Action bar visible on all cards"

gh issue create --repo $REPO --title "PR 4.2: Reaction System" --milestone "TB4: Social Layer" --label "ui,data,agent-b" --body "## Scope
- toggleReaction server action (upsert + atomic counter)
- Reaction button: heart default, hover/long-press expands set
- Micro-donate reaction hook (mock balance deduction)
- Reaction counts on cards, optimistic UI
- Unit test for balance deduction edge cases

## Parallelization
Runs in parallel with PR 4.1

## Done when
- Can react to content, reaction persists on refresh
- Expanded reaction set appears on hover/long-press
- Micro-donate deducts from mock balance"

gh issue create --repo $REPO --title "PR 4.3: Basic Comments" --milestone "TB4: Social Layer" --label "ui,data,agent-a" --body "## Scope
- Flat comment list, newest first
- createComment server action (auth required)
- Comment input with Zod validation
- Donation-sourced comments with badge
- Collapsible comment section on cards

## Dependencies
- PR 4.1 must merge first

## Done when
- Can view and create comments on content posts
- Donation-sourced comments show amount badge
- Sign-in prompt for unauthenticated users"

gh issue create --repo $REPO --title "PR 4.4: Content Feeds on All Pages" --milestone "TB4: Social Layer" --label "ui,agent-b" --body "## Scope
- Shared content-feed component with IntersectionObserver trigger
- Cursor-based pagination
- Fundraiser page: below-fold content + 'More like this' link
- Community page: activity tab integration
- Profile page: user's content section

## Dependencies
- PR 4.2 must merge first (reactions needed on cards)

## Done when
- Content feeds load on all three pages via scroll trigger
- Infinite scroll pagination works
- 'More like this' links present"

gh issue create --repo $REPO --title "PR 4.5: Content Permalink Page" --milestone "TB4: Social Layer" --label "ui,agent-a" --body "## Scope
- /content/[postId] route (SSR)
- Full content display + expanded comments + reactions
- Linked fundraiser card
- OG tags for social sharing (video tag for video posts)

## Done when
- /content/[postId] renders with full content
- OG tags generate correct social preview"

echo "Creating TB5 issues..."

gh issue create --repo $REPO --title "PR 5.1: FYP Layout + Scroll Mechanics" --milestone "TB5: Fund You Page" --label "ui,agent-a" --body "## Scope
- /fyp route, full-viewport cards, CSS scroll-snap
- Full-screen card variants for each content type
- Right-rail action buttons (Donate, Share, Follow, Fund It)
- Bottom overlay (author, description, badges)
- Desktop: centered 480px column with dark flanking
- Simplified FYP nav bar

## Done when
- /fyp renders full-screen cards
- Scroll-snap works on desktop and mobile
- Right-rail buttons visible and clickable"

gh issue create --repo $REPO --title "PR 5.2: Feed API + Ranking" --milestone "TB5: Fund You Page" --label "data,agent-b" --body "## Scope
- /api/feed GET route handler
- Seed-based ranking: context items → same category → trending
- Content type mixing (~60% creator, ~40% auto)
- Cursor-based pagination
- Redis caching for first page of popular queries
- Unit test for ranking algorithm + mix ratio

## Parallelization
Runs in parallel with PR 5.1

## Done when
- /api/feed returns ranked, mixed content
- Pagination via cursor works
- Unit tests pass"

gh issue create --repo $REPO --title "PR 5.3: FYP Client Integration" --milestone "TB5: Fund You Page" --label "ui,agent-a" --body "## Scope
- useFYPFeed hook (fetch, manage items, cursor, loading)
- Prefetch next 2 items
- FYP reactions + quick-donate bottom sheet
- 'Fund It' button → fundraiser page with scroll preservation

## Dependencies
- PR 5.1 + PR 5.2 must merge first

## Done when
- Infinite scroll loads new content
- Quick-donate works without leaving FYP
- 'Fund It' navigates to fundraiser, back button returns to FYP position"

gh issue create --repo $REPO --title "PR 5.4: Entry Points Wired Up" --milestone "TB5: Fund You Page" --label "ui,agent-b" --body "## Scope
- 'More like this' on fundraiser + community pages → /fyp?source=...
- 'Fund You Page' button on profile
- Tap-to-expand from inline content cards → FYP at that item
- Nav bar FYP link (authenticated users)

## Dependencies
- PR 5.2 must merge first

## Done when
- All entry points navigate to FYP with correct seed context
- Tap inline card → opens FYP at that card"

echo "Creating TB6 issues..."

gh issue create --repo $REPO --title "PR 6.1: Server-Side Instrumentation" --milestone "TB6: Observability" --label "infra,perf,agent-a" --body "## Scope
- Query timing wrapper for all Drizzle calls
- Server action timing HOF
- Server-Timing headers in middleware
- /api/analytics POST endpoint (fire-and-forget, Zod validated)

## Done when
- All DB queries log timing to analytics_events
- Server-Timing header visible in browser DevTools
- /api/analytics accepts and stores events"

gh issue create --repo $REPO --title "PR 6.2: Client-Side Instrumentation" --milestone "TB6: Observability" --label "infra,perf,agent-b" --body "## Scope
- web-vitals reporting (LCP, INP, CLS, TTFB, FCP)
- Page view tracking on route change
- Action click tracking (donate, share, follow, react)
- Content view tracking (IntersectionObserver, 50%+ visible 1s+)
- Video watch duration via Mux Data or player events
- useRenderTiming hook for Suspense components
- All via sendBeacon (non-blocking)

## Parallelization
Runs in parallel with PR 6.1

## Done when
- Web vitals reported to /api/analytics
- All meaningful actions tracked
- Content views deduplicated per session"

gh issue create --repo $REPO --title "PR 6.3: Admin Metrics Dashboard" --milestone "TB6: Observability" --label "ui,data,agent-a" --body "## Scope
- /admin/metrics page
- Metric cards: P50/P95 LCP, query latency, page views, total actions
- Charts (recharts): actions by type, content views by type, web vitals distribution
- Recent events log (last 50)
- Auto-refresh every 30s

## Dependencies
- PR 6.1 must merge first

## Done when
- Dashboard shows real data from analytics_events
- Charts render with correct data
- Auto-refresh works"

echo "Creating TB7 issues..."

gh issue create --repo $REPO --title "PR 7.1: Mobile Responsiveness Pass" --milestone "TB7: Polish + Mobile + Docs" --label "ui,agent-a" --body "All four pages mobile-tested and fixed at 375px. Touch targets ≥44px. Reaction long-press. Nav hamburger polish."

gh issue create --repo $REPO --title "PR 7.2: Performance Audit + Fixes" --milestone "TB7: Polish + Mobile + Docs" --label "perf,agent-b" --body "Lighthouse audit all pages (target 90+). CLS fixes. ISR + Redis verification. Image optimization. Bundle analysis. Streaming verification."

gh issue create --repo $REPO --title "PR 7.3: Giving Wrapped Card + Visual Polish" --milestone "TB7: Polish + Mobile + Docs" --label "ui,agent-a" --body "Static giving wrapped card on profile. Share as image. Visual polish pass. Empty states. Error states. 404 page."

gh issue create --repo $REPO --title "PR 7.4: Studio Page Hooks (Stretch)" --milestone "TB7: Polish + Mobile + Docs" --label "ui,stretch,agent-b" --body "[STRETCH] /studio with post management. /studio/new basic creation flow. createContentPost server action. Content creation guidance sidebar."

gh issue create --repo $REPO --title "PR 7.5: Documentation + Demo Script" --milestone "TB7: Polish + Mobile + Docs" --label "infra,agent-a" --body "README, ARCHITECTURE.md, AI_USAGE.md, INFRASTRUCTURE_ROADMAP.md, OBSERVABILITY.md. Demo walkthrough script. sst.config.ts placeholder."

echo ""
echo "✅ All milestones, labels, and issues created!"
echo "View your project at: https://github.com/$REPO/milestones"
```
