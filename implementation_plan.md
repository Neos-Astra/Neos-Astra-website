# Performance Audit & Load Testing Plan — Neos Astra Website

## Codebase Overview

| Property | Value |
|---|---|
| **Next.js Version** | ^15.1.6 |
| **React Version** | ^19.0.0 |
| **Router** | App Router |
| **Database** | PostgreSQL (Supabase) via Prisma |
| **Auth** | NextAuth v5 (beta) — Credentials provider |
| **Hosting** | Vercel Free/Hobby |
| **Domain** | Hostinger |
| **CSS** | Tailwind CSS 3.x |
| **Animations** | Framer Motion |
| **Smooth Scroll** | Lenis |

---

## TASK 1 — FULL PERFORMANCE AUDIT

### Architecture Summary

#### Public-Facing Pages (high traffic)
| Page | Route | Rendering | DB Calls |
|---|---|---|---|
| Homepage | `/` | **Client Component** (SSR shell → client fetch) | 1x API (`/api/home-media`) |
| Courses | `/courses` | **Client Component** | 1x API (`/api/courses`) |
| Course Explore/Enroll | `/courses/explore` | **Client Component** | 1x API (`/api/courses`) + enrollment POST |
| About | `/about` | **Client Component** | None |
| Team | `/team` | **Client Component** | 1x API (`/api/team`) |
| Events | `/events` | **Client Component** | None (hardcoded data) |
| FAQ | `/faq` | **Client Component** | None (hardcoded data) |
| Privacy | `/privacy` | **Client Component** | None |
| Career | `/career` | **Server Component** ✅ | 1x Prisma direct query |
| Survey Form | `/form` | **Client Component** | Survey POST |

#### Admin Pages (low traffic, auth-protected)
| Page | Route | Notes |
|---|---|---|
| Admin Dashboard | `/admin/*` | Protected by middleware |
| Superadmin Dashboard | `/superadmin/*` | Protected by middleware |

#### API Routes (public-facing GET routes hit by every visitor)
| Route | Methods | Auth Required | Caching |
|---|---|---|---|
| `/api/courses` | GET, POST | GET: No, POST: Yes | `s-maxage=30, stale-while-revalidate=120` |
| `/api/team` | GET, POST | GET: No, POST: Yes | `s-maxage=30, stale-while-revalidate=120` |
| `/api/home-media` | GET, POST | GET: No, POST: Yes | `s-maxage=30, stale-while-revalidate=120` |
| `/api/jobs` | GET, POST | GET: No, POST: Yes | `s-maxage=10, stale-while-revalidate=59` |
| `/api/inquiries` | POST, GET, PATCH | POST: No | None |
| `/api/enrollments` | POST, GET, PATCH, DELETE | POST: No | None |
| `/api/survey` | POST, GET | POST: No | None |

---

### 🔴 CRITICAL Issues

#### C1: Entire Homepage is a Client Component (26KB `"use client"`)
- **File**: [`Home.tsx`](file:///c:/Users/navin/Desktop/Neos%20Astra%20website/src/app/components/Home.tsx)
- **What's wrong**: The **entire** homepage (596 lines, 26KB) is wrapped in `"use client"`. This means:
  - Zero server-side rendering benefit — the page shell ships empty, then hydrates
  - Framer Motion (~40KB gzipped), Lucide icons, and all component logic ship to the browser
  - Every homepage visit triggers a client-side `fetch("/api/home-media")` **after** hydration
- **Why it matters at 100k/day**: Every single visitor downloads the full JS bundle, hydrates, then makes an additional API call. This means **2x the serverless function invocations** (page render + API call) and significantly worse Time-to-First-Contentful-Paint.
- **Impact**: Slow LCP, increased serverless function usage, poor SEO (content not in initial HTML)
- **Fix**: Convert to Server Component with client islands — fetch data server-side, pass to small client wrappers for interactivity

#### C2: All Major Public Pages are Client Components with Client-Side Data Fetching
- **Files**: [`CoursesComponent.tsx`](file:///c:/Users/navin/Desktop/Neos%20Astra%20website/src/app/components/courses/CoursesComponent.tsx), [`TeamComponent.tsx`](file:///c:/Users/navin/Desktop/Neos%20Astra%20website/src/app/components/team/TeamComponent.tsx)
- **What's wrong**: Courses, Team pages use `useEffect` + `fetch()` to load data client-side. The Career page is the **only** page correctly using server-side data fetching.
- **Why it matters**: Each page visit = 1 serverless invocation for page + 1 serverless invocation for API = **2x function calls**. With Vercel Free (100GB bandwidth, ~100K function invocations/month), this doubles your consumption.
- **Fix**: Follow the Career page pattern — fetch data in the Server Component, pass to client wrappers

#### C3: `logoBase64.ts` — 178KB Base64 String Shipped in Bundle
- **File**: [`logoBase64.ts`](file:///c:/Users/navin/Desktop/Neos%20Astra%20website/src/lib/logoBase64.ts) (178,473 bytes)
- **What's wrong**: A **178KB base64-encoded logo** is stored as a TypeScript export. This gets included in the server bundle and potentially in client bundles that import from `@/lib/`.
- **Why it matters**: This inflates the serverless function size by ~180KB, increases cold start time, and may be included in chunks sent to the browser.
- **Fix**: Move the logo to `/public/` as a normal image file. Reference via URL.

#### C4: No `next/image` Used Anywhere — All Images Are Raw `<img>` Tags
- **Files**: All component files
- **What's wrong**: Every image in the entire project uses raw `<img>` tags. No `next/image` optimization is used anywhere. This means:
  - No automatic WebP/AVIF conversion
  - No lazy loading
  - No responsive srcset
  - External Unsplash images (hero section, team, tracks) are not proxied through Vercel's image optimization
- **Why it matters**: Images are the largest assets. Without optimization, each page visit downloads unoptimized JPGs directly. The hero section loads **3 full-resolution Unsplash images simultaneously** (all in DOM, only one visible).
- **Fix**: Replace `<img>` with `next/image` for all images, add `priority` for above-the-fold images

---

### 🟠 HIGH Priority Issues

#### H1: SessionProvider Wraps the Entire App (Including Public Pages)
- **File**: [`layout.tsx`](file:///c:/Users/navin/Desktop/Neos%20Astra%20website/src/app/layout.tsx#L58)
- **What's wrong**: `<SessionProvider>` wraps the entire application, including public pages that don't need auth. This forces a session check API call on every page visit.
- **Fix**: Move `<SessionProvider>` to the `/admin` and `/superadmin` layout only

#### H2: SmoothScroll (Lenis) Adds Overhead to Every Page
- **File**: [`SmoothScroll.tsx`](file:///c:/Users/navin/Desktop/Neos%20Astra%20website/src/app/components/SmoothScroll.tsx)
- **What's wrong**: Lenis smooth scrolling library is loaded on every page via root layout, running a `requestAnimationFrame` loop continuously. Adds ~15KB to bundle + constant CPU usage.
- **Fix**: Consider removing or lazy-loading — CSS `scroll-behavior: smooth` already in globals.css

#### H3: No Font Optimization
- **File**: [`globals.css`](file:///c:/Users/navin/Desktop/Neos%20Astra%20website/src/app/globals.css#L32)
- **What's wrong**: Using `font-family: system-ui, ...` stack (which is fine), but Next.js's `next/font` is not used. If custom fonts are later added, they'll cause layout shift.
- **Impact**: Minor — system fonts are good for performance. But if Google Fonts are ever used, `next/font` should be adopted.

#### H4: Navbar and Footer Are Client Components in Root Layout
- **Files**: [`Navbar.tsx`](file:///c:/Users/navin/Desktop/Neos%20Astra%20website/src/app/components/Navbar.tsx), [`Footer.tsx`](file:///c:/Users/navin/Desktop/Neos%20Astra%20website/src/app/components/Footer.tsx), [`ClientLayout.tsx`](file:///c:/Users/navin/Desktop/Neos%20Astra%20website/src/app/components/ClientLayout.tsx)
- **What's wrong**: The entire Navbar + Footer + ClientLayout are client components. The Footer has no interactivity except a `scrollToTop` button and could be a Server Component. `ClientLayout` forces client rendering of the entire page tree.
- **Fix**: Make Footer a Server Component with a tiny client island for scrollToTop. Restructure ClientLayout.

#### H5: `form/page.tsx` is 65KB — Massive Single Client Component
- **File**: [`form/page.tsx`](file:///c:/Users/navin/Desktop/Neos%20Astra%20website/src/app/form/page.tsx) (65,525 bytes, 1,630 lines)
- **What's wrong**: An enormous survey form — all in a single `"use client"` file. Ships ~65KB of JSX to the browser.
- **Fix**: Split into sub-components, dynamically import sections

#### H6: File Upload API Writes to `public/uploads` — Won't Work on Vercel
- **File**: [`home-media/route.ts`](file:///c:/Users/navin/Desktop/Neos%20Astra%20website/src/app/api/home-media/route.ts#L61-L71)
- **What's wrong**: The home-media upload API writes files to `public/uploads` on the filesystem. On Vercel, the filesystem is read-only and ephemeral — uploads will be lost on next deployment.
- **Fix**: Use an external storage service (Supabase Storage, S3, Cloudinary) for uploaded images.

---

### 🟡 MEDIUM Priority Issues

#### M1: No ISR (Incremental Static Regeneration) on Any Page
- **What's wrong**: No pages use `revalidate` or `generateStaticParams`. Every page is either fully client-rendered or dynamically server-rendered on each request.
- **Fix**: Add `export const revalidate = 60` to pages like Career, or convert public pages to use ISR

#### M2: Rate Limiter Uses In-Memory Store — Won't Work Across Serverless Instances
- **File**: [`rateLimiter.ts`](file:///c:/Users/navin/Desktop/Neos%20Astra%20website/src/lib/rateLimiter.ts)
- **What's wrong**: `RateLimiterMemory` stores rate limits in process memory. On Vercel, each function invocation is isolated — the rate limiter resets on each cold start.
- **Fix**: Use a Redis-backed rate limiter (Upstash Redis) or Vercel's built-in rate limiting

#### M3: No `<link>` Tags for External Resources
- **What's wrong**: The hero section loads 3 external Unsplash images but no `<link rel="preconnect">` or `<link rel="dns-prefetch">` for `images.unsplash.com`
- **Fix**: Add preconnect hints in layout for external image domains

#### M4: Middleware Runs Auth Check on Every Admin Route
- **File**: [`middleware.ts`](file:///c:/Users/navin/Desktop/Neos%20Astra%20website/middleware.ts)
- **What's wrong**: The `auth()` call in middleware queries the JWT on every request to `/superadmin/*` and `/admin/*`. This is fine functionally but adds latency to admin routes.
- **Impact**: Low for public pages (middleware only matches admin routes), but important to note.

#### M5: Framer Motion Loaded on Pages That Don't Need It
- **Files**: About, Events, Team pages
- **What's wrong**: Framer Motion (~40KB gzipped) is imported on multiple pages for simple fade-in animations that could be achieved with CSS animations or Intersection Observer.
- **Fix**: Replace simple animations with CSS `@keyframes` + `IntersectionObserver`; use `dynamic()` import for Framer Motion where truly needed

---

### 🟢 LOW Priority Issues

#### L1: `<a>` Tags Used Instead of `next/link`
- **What's wrong**: All navigation uses raw `<a>` tags instead of `next/link`, preventing client-side navigation and prefetching.
- **Fix**: Replace `<a>` with `<Link>` from `next/link`

#### L2: No `robots.txt` or `sitemap.xml`
- **What's wrong**: No programmatic sitemap generation for SEO
- **Fix**: Add `app/sitemap.ts` and `app/robots.ts`

#### L3: CSS-in-JS (`<style jsx>`) in Home Component
- **File**: [`Home.tsx` L408](file:///c:/Users/navin/Desktop/Neos%20Astra%20website/src/app/components/Home.tsx#L408)
- **What's wrong**: Using `<style jsx>` for the marquee animation. This creates runtime CSS which adds overhead.
- **Fix**: Move to globals.css or a CSS module

---

## TASK 2 — REALISTIC TRAFFIC CALCULATIONS

### Assumptions
| Parameter | Value | Rationale |
|---|---|---|
| Avg pages/session | 2.5 | Education site — landing → courses → enrollment form |
| Avg requests/page | 6 | HTML + CSS + JS chunks + 1-2 API calls + images |
| Session duration | 3 minutes | Informational site with enrollment flow |
| Peak multiplier | 3x | Typical for education/campaign sites |
| Traffic distribution | 60% in 8 peak hours | Most traffic during daytime |

### Scenario A: 100,000 visitors/day

| Metric | Calculation | Result |
|---|---|---|
| Avg visitors/sec | 100,000 / 86,400 | **1.16 visitors/sec** |
| Peak visitors/sec | 1.16 × 3 | **3.47 visitors/sec** |
| Total page views/day | 100,000 × 2.5 | **250,000** |
| Avg requests/sec | 250,000 × 6 / 86,400 | **17.36 req/sec** |
| Peak requests/sec | 17.36 × 3 | **52.08 req/sec** |
| **Serverless invocations/day** | 250,000 × 2 (page + API) | **~500,000** |
| **Bandwidth/day (est.)** | 100K × 2MB avg page weight | **~200 GB** |

### Scenario B: 100,000 visitors/hour

| Metric | Calculation | Result |
|---|---|---|
| Avg visitors/sec | 100,000 / 3,600 | **27.78 visitors/sec** |
| Peak visitors/sec | 27.78 × 3 | **83.33 visitors/sec** |
| Avg requests/sec | 27.78 × 2.5 × 6 / 1 | **416.67 req/sec** |
| Peak requests/sec | 416.67 × 3 | **1,250 req/sec** |

### Scenario C: 100,000 visitors/10 minutes

| Metric | Calculation | Result |
|---|---|---|
| Avg visitors/sec | 100,000 / 600 | **166.67 visitors/sec** |
| Peak visitors/sec | 166.67 × 3 | **500 visitors/sec** |
| Avg requests/sec | 166.67 × 2.5 × 6 / 1 | **2,500 req/sec** |
| Peak requests/sec | 2,500 × 3 | **7,500 req/sec** |

> [!WARNING]
> **Scenario A** is the relevant one for your stated goal. Even at 100K/day, the estimated **500K serverless invocations/day** and **~200GB bandwidth** would **exceed Vercel Free tier limits** within 1-2 days. Vercel Free provides 100GB bandwidth/month and ~100K function executions/month.

---

## TASK 3–5 — LOAD TESTING PLAN

### Deliverables
Create `/load-test/` directory with:

| File | Purpose |
|---|---|
| `smoke.js` | 1-2 VUs, verify system works |
| `normal.js` | 10-50 VUs, typical daily traffic |
| `stress.js` | 100-500 VUs, push beyond normal |
| `spike.js` | Sudden burst from 10 → 500 → 10 VUs |
| `breakpoint.js` | Gradual ramp until failure |
| `rate-based.js` | Target specific req/sec based on Scenario A |

### Performance Thresholds

| Metric | Threshold | Rationale |
|---|---|---|
| HTTP error rate | < 1% | Standard reliability |
| p95 response time | < 2,000ms | Page loads acceptable |
| p99 response time | < 5,000ms | Worst-case still usable |
| HTTP 5xx rate | < 0.1% | Server errors unacceptable |
| Failed requests | < 0.5% | Includes timeouts |

---

## TASK 6 — NEXT.JS OPTIMIZATION RECOMMENDATIONS

### Pages That Should Use Server Components + ISR

| Page | Current | Recommended | Revalidate |
|---|---|---|---|
| Homepage | Client Component | **Server Component** with client islands | 60s |
| Courses | Client Component | **Server Component** (like Career page pattern) | 60s |
| Team | Client Component | **Server Component** | 300s |
| Events | Client Component | **Server Component** (data is hardcoded anyway) | N/A (static) |
| FAQ | Client Component | **Server Component** (data is hardcoded) | N/A (static) |
| About | Client Component | **Server Component** with client motion wrapper | N/A (static) |
| Privacy | Client Component | **Server Component** | N/A (static) |

### Caching Strategy
- Add `export const revalidate = 60` to data-fetching pages
- Use `unstable_cache` or `React.cache` for Prisma queries
- Leverage Vercel CDN caching via `Cache-Control` headers (already partially done on API routes ✅)

---

## TASK 7 — IMAGE OPTIMIZATION

### Current State: ❌ No `next/image` used anywhere

| Location | Image | Size | Issue |
|---|---|---|---|
| Hero carousel | 3x Unsplash images (~1600px wide) | ~300-500KB each | Loaded simultaneously, not lazy |
| Event images | 5x local `/event*.jpg` | 120-152KB each | Not optimized |
| Logos | `/logo.jpg`, `/logo.png`, `/icon.png` | 42KB, 134KB, 181KB | Multiple formats, not using `next/image` |
| Track images | 4x Unsplash images | ~200-400KB each | Not lazy loaded |
| Team images | 4x Unsplash images | ~100-200KB each | External, not proxied |

### Total estimated unoptimized image payload (homepage): **~2.5MB**
With `next/image`: estimated **~400KB** (WebP/AVIF + responsive sizing + lazy loading)

---

## TASK 8 — JAVASCRIPT BUNDLE ANALYSIS

### Heavy Dependencies

| Package | Estimated Size (gzipped) | Used Where | Optimization |
|---|---|---|---|
| `framer-motion` | ~40KB | Home, About, Events, Team | Replace simple animations with CSS; dynamic import for complex ones |
| `lenis` | ~15KB | Every page (root layout) | Remove or lazy-load |
| `lucide-react` | Tree-shakeable | Every page | Already tree-shaken ✅ |
| `next-auth` | ~30KB | Root layout (SessionProvider) | Move to admin layout only |
| `@prisma/client` | Server-only | API routes | OK — server bundle only ✅ |

### Estimated Savings
- Moving `SessionProvider` out of root layout: **~30KB** off public page bundle
- Removing Lenis from root: **~15KB**
- Using CSS animations instead of Framer Motion on simple pages: **~40KB** per page
- **Total potential savings: ~85KB gzipped per public page load**

### Bundle Analyzer Setup
```bash
npm install -D @next/bundle-analyzer
```
Add to `next.config.mjs`:
```js
const withBundleAnalyzer = require('@next/bundle-analyzer')({ enabled: process.env.ANALYZE === 'true' })
```

---

## TASK 9 — API + DATABASE AUDIT

### Database: Supabase PostgreSQL with PgBouncer

| Aspect | Status | Notes |
|---|---|---|
| Connection pooling | ✅ PgBouncer via Supabase | Good — connection string uses `?pgbouncer=true` |
| Prisma singleton | ✅ Correct pattern | Uses `globalThis` caching in [`client.ts`](file:///c:/Users/navin/Desktop/Neos%20Astra%20website/src/superadmin/prisma/client.ts) |
| N+1 queries | ✅ None found | Queries are simple `findMany` |
| Indexes | ⚠️ Minimal | Only `FeePayment.enrollmentId` has explicit index + unique constraints |
| Query complexity | ✅ Simple | All queries are basic CRUD |

### Missing Indexes (recommended for 100k/day)
- `Inquiry.status` — filtered by status in admin
- `Enrollment.status` — filtered by status
- `Course.isActive` — filtered in public queries
- `JobOpening.isActive` — filtered in public queries

### Under 100k/day Impact
The **public GET API routes** (`/api/courses`, `/api/team`, `/api/home-media`) will each hit the database on every uncached request. With the current `s-maxage=30` caching, Vercel CDN will serve cached responses for 30 seconds, limiting actual DB queries to ~1 per 30 seconds per route per edge location. **This is well within Supabase Free tier limits.**

---

## TASK 10 — VERCEL FREE/HOBBY ASSESSMENT

### Vercel Free Tier Limits vs Projected Usage (100K visitors/day)

| Resource | Vercel Free Limit | Projected Daily Usage | Projected Monthly Usage | Status |
|---|---|---|---|---|
| Bandwidth | 100 GB/month | ~200 GB/day (unoptimized) | ~6,000 GB | 🔴 **60x over** |
| Serverless Executions | 100K/month | ~500K/day | ~15M | 🔴 **150x over** |
| Edge Middleware | 1M/month | ~100K/day (admin only) | ~3M | 🟡 Close |
| Image Optimization | 1000 source images/month | Unlimited if using `next/image` | — | 🟢 OK |
| Build Time | 6000 min/month | — | — | 🟢 OK |

> [!CAUTION]
> **Vercel Free tier CANNOT handle 100K visitors/day** with the current architecture. The bandwidth alone would exceed the monthly limit in less than 12 hours.
>
> **However**, with proper optimization (static generation, ISR, `next/image`, reduced client JS), the actual serverless function invocations and bandwidth could be reduced by **80-90%**, bringing the numbers much closer to feasibility — but still likely requiring **Vercel Pro ($20/month)** at minimum.

### Vercel Pro ($20/month) Limits
| Resource | Vercel Pro Limit |
|---|---|
| Bandwidth | 1 TB/month |
| Serverless Executions | 1M/month (then $1/100K) |
| Image Optimization | 5000 source images/month |

With optimizations (SSG/ISR + next/image + reduced bundles):
- Estimated bandwidth: ~30-50 GB/day → **900-1500 GB/month** → Pro + some overage
- Serverless executions: ~50-100K/day (ISR cache) → **1.5-3M/month** → Pro + overage ($20-30 extra)

**Recommendation**: Vercel Pro at minimum, budget ~$50-80/month for 100K/day.

---

## TASK 11 — DOCUMENTATION PLAN

### Deliverables
| File | Contents |
|---|---|
| `/PERFORMANCE_AUDIT.md` | Complete audit findings (this plan's TASK 1 content) |
| `/LOAD_TESTING.md` | k6 installation, test execution, result interpretation |

---

## TASK 13 — PRELIMINARY VERDICT

### Current Status: 🔴 NOT READY for 100K visitors/day

### Biggest Bottlenecks (ordered by severity)
1. **Vercel Free tier limits** — bandwidth and function limits will be exhausted in hours
2. **No static generation** — every page is dynamically rendered (client or server)
3. **All public pages are Client Components** — doubles serverless invocations (page + API)
4. **No `next/image`** — unoptimized images inflate bandwidth by 5-6x
5. **178KB base64 logo in bundle** — inflates server function size and cold starts
6. **Heavy client bundles** — Framer Motion, Lenis, SessionProvider on every page

### Path to 🟢 Ready
1. ✅ Convert public pages to Server Components with ISR
2. ✅ Use `next/image` everywhere
3. ✅ Remove `logoBase64.ts`
4. ✅ Move `SessionProvider` to admin layout
5. ✅ Remove/lazy-load Lenis
6. ✅ Replace `<a>` with `<Link>`
7. ✅ Upgrade to Vercel Pro ($20/month minimum)
8. ✅ Add `sitemap.ts` and `robots.ts`

---

## Proposed Changes (Execution Plan)

### Phase 1: Load Testing Setup (no code changes)
#### [NEW] `load-test/smoke.js`
#### [NEW] `load-test/normal.js`
#### [NEW] `load-test/stress.js`
#### [NEW] `load-test/spike.js`
#### [NEW] `load-test/breakpoint.js`
#### [NEW] `load-test/rate-based.js`
#### [NEW] `LOAD_TESTING.md`
#### [NEW] `PERFORMANCE_AUDIT.md`

### Phase 2: Critical Optimizations
#### [MODIFY] [`layout.tsx`](file:///c:/Users/navin/Desktop/Neos%20Astra%20website/src/app/layout.tsx) — Remove SessionProvider from root, add to admin layouts
#### [DELETE or MODIFY] [`logoBase64.ts`](file:///c:/Users/navin/Desktop/Neos%20Astra%20website/src/lib/logoBase64.ts) — Replace with file reference
#### [MODIFY] [`Home.tsx`](file:///c:/Users/navin/Desktop/Neos%20Astra%20website/src/app/components/Home.tsx) — Refactor into Server + Client parts
#### [MODIFY] [`CoursesComponent.tsx`](file:///c:/Users/navin/Desktop/Neos%20Astra%20website/src/app/components/courses/CoursesComponent.tsx) — Server Component pattern
#### [MODIFY] [`TeamComponent.tsx`](file:///c:/Users/navin/Desktop/Neos%20Astra%20website/src/app/components/team/TeamComponent.tsx) — Server Component pattern
#### [MODIFY] All image usages — Replace `<img>` with `next/image`

### Phase 3: Bundle Optimization
#### [MODIFY] [`layout.tsx`](file:///c:/Users/navin/Desktop/Neos%20Astra%20website/src/app/layout.tsx) — Remove SmoothScroll wrapper
#### [MODIFY] [`Navbar.tsx`](file:///c:/Users/navin/Desktop/Neos%20Astra%20website/src/app/components/Navbar.tsx) — Use `next/link`
#### [MODIFY] [`Footer.tsx`](file:///c:/Users/navin/Desktop/Neos%20Astra%20website/src/app/components/Footer.tsx) — Use `next/link`, consider Server Component

---

## Verification Plan

### Automated Tests
- Run k6 smoke test against `localhost:3000` after each optimization phase
- Run `ANALYZE=true npm run build` to verify bundle size reductions
- Verify `npm run build` succeeds without errors

### Manual Verification
- Check all public pages render correctly in browser
- Verify admin/superadmin login still works
- Check Lighthouse scores before and after optimizations
- Verify images load with correct formats (WebP/AVIF)

---

## Open Questions

> [!IMPORTANT]
> 1. **Is the 100K visitors/day estimate realistic?** This is a very high number for an education startup. If peak traffic is actually 1,000-10,000/day, Vercel Free might work with optimizations.
> 2. **Are you willing to upgrade to Vercel Pro ($20/month)?** This is essential for 100K/day.
> 3. **Is the survey form (`/form`) high-traffic?** The 65KB form page is a concern only if many visitors use it.
> 4. **Do admin uploaded images (home-media) currently work on Vercel?** The file write to `public/uploads` won't persist on Vercel.
> 5. **Should I proceed with Phase 1 (load testing setup + documentation) first, before any code changes?**
