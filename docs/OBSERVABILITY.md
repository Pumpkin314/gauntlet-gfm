# Observability — GoFundMe Reimagined

## What's Tracked

### Web Vitals (Client-Side)
Collected via the `web-vitals` library and reported as `web_vital` events.

| Metric | What It Measures | Good Threshold |
|--------|-----------------|----------------|
| **LCP** | Largest Contentful Paint — time to render the biggest visible element | < 2.5s |
| **INP** | Interaction to Next Paint — responsiveness to user input | < 200ms |
| **CLS** | Cumulative Layout Shift — visual stability during load | < 0.1 |
| **TTFB** | Time to First Byte — server response time | < 800ms |
| **FCP** | First Contentful Paint — time to first visible content | < 1.8s |

Each metric includes a `rating` field: `"good"`, `"needs-improvement"`, or `"poor"`.

### Page Views
Every page navigation fires a `page_view` event with:
- `pagePath`: The URL pathname (e.g., `/f/oakland-school-supplies-drive`)
- `referrer`: The `document.referrer` value
- `sessionId`: A unique ID per browser session (stored in `sessionStorage`)

### User Actions
Tracked via `trackAction()` calls in UI components:

| Action | Where Tracked | Metadata |
|--------|--------------|----------|
| `donate` | Donate form, FYP quick donate | `fundraiserId`, `amountCents`, `source` |
| `react` | Reaction button, FYP heart | `contentPostId`, `reactionType` |
| `share` | Share button, FYP share | `url` or `source` |
| `follow` | Profile follow, community follow | `targetUserId` or `communityId`, `type` |
| `comment` | Comment input | `contentPostId` |
| `view_content` | Content cards (via IntersectionObserver) | `contentType`, `contentPostId` |

## How It Works

### Data Flow

```
Browser → sendBeacon (1s batch) → POST /api/analytics → analytics_events table
                                                              ↓
                                                    /admin/metrics dashboard
```

### Client-Side Pipeline

1. **AnalyticsProvider** (root layout) initializes on mount:
   - Calls `reportWebVitals()` — registers callbacks for all 5 metrics
   - Calls `trackPageView()` — sends initial page view event
   - Registers `beforeunload` handler to flush pending events

2. **Event buffering** (`beacon.ts`):
   - Events are collected in a buffer for 1 second
   - After 1s, the batch is sent via `navigator.sendBeacon` (reliable during unload)
   - Fallback: `fetch()` with `keepalive: true`

3. **Session management** (`session.ts`):
   - Generates a UUID once per session via `crypto.randomUUID()`
   - Stored in `sessionStorage` — persists across navigations but not tabs/windows

### Server-Side Pipeline

1. **POST /api/analytics** receives batches of up to 50 events
2. Events are validated with Zod schema
3. Bulk INSERT into `analytics_events` table
4. No auth required — designed for fire-and-forget client beacons

### Query Timing (Optional)

```typescript
import { timedQuery } from '@/lib/db/instrumented';

const results = await timedQuery('fundraiser.getBySlug', () =>
  db.select().from(fundraisers).where(eq(fundraisers.slug, slug))
);
```

- Measures duration via `performance.now()`
- Logs to console in development
- `getServerTimingHeader()` formats as `Server-Timing` header

## Dashboard Guide

### Accessing the Dashboard
Navigate to `/admin/metrics`. Requires authentication (any signed-in user).

### Metric Cards (Top Row)
- **Page Views**: Count of `page_view` events in `analytics_events`
- **Donations / Reactions / Comments / Follows**: Direct counts from their respective tables (not analytics events)
- **LCP / CLS / INP (P50)**: 50th percentile of web vital measurements, calculated via Postgres `PERCENTILE_CONT`

### Charts
- **Actions Breakdown**: Bar chart showing counts per action type (donate, share, follow, react, comment)
- **Content Engagement**: Bar chart of view_content events grouped by content type
- **Web Vitals — LCP Distribution**: Histogram of LCP values with color-coded thresholds (green/yellow/red)

### Recent Events Table
Scrollable table of the last 50 raw analytics events, showing:
- Timestamp, event type, page path, event data (JSON), session ID

### Auto-Refresh
The dashboard polls for fresh data every 30 seconds using `router.refresh()`. A countdown timer and manual "Refresh now" button are in the top-right corner.

## Database Schema

```sql
CREATE TABLE analytics_events (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  event_data JSONB,
  page_path TEXT,
  session_id TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

The `event_data` JSONB column stores metric-specific data:
- Web vitals: `{"name": "LCP", "value": 1234.5, "rating": "good"}`
- Actions: `{"action": "donate", "fundraiserId": "...", "amountCents": 2500}`
- Page views: `{"referrer": "https://..."}`
