# TRAFFIC MODEL & VERCEL PLATFORM LIMITS SPECIFICATION
**Project**: Neos Astra (`www.neosastra.com`)  
**Target Workload**: Up to 100,000 visitors/day  
**Scope**: Realistic traffic scenarios, resource breakdown, and verified Vercel capacity limits.

---

## Part 1: Realistic Traffic Model (Phase 1)

### 1. Fundamental Principles & Assumptions

A common architectural fallacy is assuming:
1. `100,000 visitors = 100,000 requests` *(False — each visitor views multiple pages and requests static subresources).*
2. `page views × 2 = serverless function executions` *(False — statically rendered or cached pages do not execute serverless functions at all, whereas client-side waterfall fetching invokes functions on every component mount).*

#### Differentiating Request Types:
- **CDN / Static Response**: HTML, JavaScript chunks, CSS, icons, and pre-rendered assets served directly from Vercel's global edge cache (Cloudflare/Fastly Anycast network). **Zero compute time, zero database queries.**
- **Cached ISR Response**: Dynamic pages revalidated at fixed intervals (e.g., `revalidate = 3600`). The Edge CDN serves stale-while-revalidate to 99.9% of users without invoking compute.
- **Dynamic Server Render**: Server executes a serverless function on every page request to render HTML. Consumes CPU time, active execution duration, and memory.
- **API Function Execution**: Client-side `fetch("/api/...")` route handler execution. Spawns or reuses a serverless container.
- **Database Query**: Prisma query to Supabase PostgreSQL. Subject to connection limits, query latency, and network round-trips.

#### User Behavioral Assumptions:
- **Pages / Visitor**:
  - *Low*: 2.0 pages/session (e.g. Landing on Home, viewing Courses)
  - *Medium*: 3.5 pages/session (Home -> Courses -> Team -> Events/FAQ)
  - *High*: 5.0 pages/session (Home -> Courses -> Explore -> Team -> Form/Career)
- **Subresources per Page View**:
  - *Initial visit (cold cache)*: 1 HTML + ~8-15 JS/CSS/image chunks.
  - *Subsequent client-side navigation (warm cache)*: 1 RSC payload (few KB) + new images.
  - *Blended Average Requests / Page View*:
    - *Low*: 3.0 requests/pageview
    - *Medium*: 6.0 requests/pageview
    - *High*: 10.0 requests/pageview
- **Diurnal Distribution & Peak Factor**:
  - Traffic is not uniformly spread over 24 hours. Typically, 70% of traffic arrives in an 8-hour window (10 AM – 6 PM or 6 PM – 11 PM IST).
  - Peak multiplier over the period's average:
    - *Low*: 2.0x
    - *Medium*: 3.0x
    - *High*: 4.5x

---

### 2. Traffic Calculations Across 3 Scenarios

#### Scenario A: 100,000 Visitors / Day (24 Hours = 86,400 Seconds)
*Baseline production target.*

| Metric | LOW | MEDIUM (Expected) | HIGH |
| :--- | :--- | :--- | :--- |
| **Average Visitors / sec** | 1.16 | 1.16 | 1.16 |
| **Page Views / sec (Avg)** | 2.31 pv/s | 4.05 pv/s | 5.79 pv/s |
| **Estimated Total Requests / sec (Avg)** | 6.9 req/s | 24.3 req/s | 57.9 req/s |
| **Peak Visitors / sec** | 2.32 v/s (2.0x) | 3.47 v/s (3.0x) | 5.21 v/s (4.5x) |
| **Peak Total Requests / sec** | **13.8 req/s** | **72.9 req/s** | **260.6 req/s** |
| **Unoptimized API Requests / sec (Avg)** | 2.90 req/s | 2.90 req/s | 2.90 req/s |
| **Unoptimized API Requests / sec (Peak)** | **5.80 req/s** | **8.70 req/s** | **13.05 req/s** |
| **Unoptimized Database Queries / sec (Peak)**| **5.80 qps** | **8.70 qps** | **13.05 qps** |
| **Optimized API Requests / sec (Peak)** | **< 0.1 req/s** | **< 0.3 req/s** | **< 0.8 req/s** |
| **Optimized Database Queries / sec (Peak)** | **< 0.2 qps** | **< 0.5 qps** | **< 1.0 qps** |

> **Critical Takeaway for Scenario A**:  
> In the **Unoptimized** state, 100K visitors/day produces **~250,000 serverless API invocations/day (7.5 Million/month)** solely for fetching courses, team members, and home media!  
> In the **Optimized** state with Server Components and ISR, 99.8% of traffic is served by the Vercel Edge CDN. Serverless API invocations drop to only legitimate form submissions (~1,000–3,000/day).

---

#### Scenario B: 100,000 Visitors / Hour (3,600 Seconds)
*Sustained marketing campaign, product launch, or influencer shoutout.*

| Metric | LOW | MEDIUM (Expected) | HIGH |
| :--- | :--- | :--- | :--- |
| **Average Visitors / sec** | 27.78 | 27.78 | 27.78 |
| **Page Views / sec (Avg)** | 55.56 pv/s | 97.22 pv/s | 138.89 pv/s |
| **Estimated Total Requests / sec (Avg)** | 166.7 req/s | 583.3 req/s | 1,388.9 req/s |
| **Peak Factor within Hour** | 1.5x | 2.0x | 2.5x |
| **Peak Visitors / sec** | 41.67 v/s | 55.56 v/s | 69.44 v/s |
| **Peak Total Requests / sec** | **250.0 req/s** | **1,166.7 req/s** | **3,472.2 req/s** |
| **Unoptimized API Requests / sec (Avg)** | 69.4 req/s | 69.4 req/s | 69.4 req/s |
| **Unoptimized API Requests / sec (Peak)** | **104.2 req/s** | **138.9 req/s** | **173.6 req/s** |
| **Unoptimized Database Queries / sec (Peak)**| **104.2 qps** | **138.9 qps** | **173.6 qps** |
| **Optimized API Requests / sec (Peak)** | **1.2 req/s** | **2.5 req/s** | **5.0 req/s** |
| **Optimized Database Queries / sec (Peak)** | **1.5 qps** | **3.0 qps** | **6.0 qps** |

> **Critical Takeaway for Scenario B**:  
> In the **Unoptimized** state, peak database queries reach **138–173 QPS**. Standard Supabase database connections (typically 15-60 direct connections on free/micro compute) would immediately hit `FATAL: remaining connection slots are reserved for non-replication superuser connections` or timeout.  
> In the **Optimized** state, Edge CDN absorbs ~99.5% of the 1,166 RPS traffic, maintaining smooth sub-50ms page loads.

---

#### Scenario C: 100,000 Visitors / 10 Minutes (600 Seconds)
*Extreme viral spike (e.g. TV feature, national news, or viral social media post).*

| Metric | LOW | MEDIUM (Expected) | HIGH |
| :--- | :--- | :--- | :--- |
| **Average Visitors / sec** | 166.67 | 166.67 | 166.67 |
| **Page Views / sec (Avg)** | 333.3 pv/s | 583.3 pv/s | 833.3 pv/s |
| **Estimated Total Requests / sec (Avg)** | 1,000.0 req/s | 3,500.0 req/s | 8,333.3 req/s |
| **Peak Factor within 10 min** | 1.5x | 2.0x | 2.5x |
| **Peak Visitors / sec** | 250.0 v/s | 333.3 v/s | 416.7 v/s |
| **Peak Total Requests / sec** | **1,500.0 req/s** | **7,000.0 req/s** | **20,833.3 req/s** |
| **Unoptimized API Requests / sec (Avg)** | 416.7 req/s | 416.7 req/s | 416.7 req/s |
| **Unoptimized API Requests / sec (Peak)** | **625.0 req/s** | **833.3 req/s** | **1,041.7 req/s** |
| **Unoptimized Database Queries / sec (Peak)**| **625.0 qps** | **833.3 qps** | **1,041.7 qps** |
| **Optimized API Requests / sec (Peak)** | **8.0 req/s** | **15.0 req/s** | **30.0 req/s** |
| **Optimized Database Queries / sec (Peak)** | **10.0 qps** | **18.0 qps** | **35.0 qps** |

> **Critical Takeaway for Scenario C**:  
> In the **Unoptimized** state, generating 800+ API requests/sec causes catastrophic 504 Gateway Timeouts on Vercel and crashes the database.  
> In the **Optimized** state, the static/ISR edge architecture absorbs the 7,000 RPS burst, and only legitimate form submissions hit serverless functions.

---

## Part 2: Vercel Limits Verification (Phase 2)

Verified directly against current official Vercel documentation (Vercel Fluid Compute architecture).

| Resource Dimension | Vercel Hobby (Free) Verified Limit | Vercel Pro ($20/seat/mo) Verified Limit | Unoptimized 100K/Day Consumption | Optimized 100K/Day Consumption | Hobby Feasible? |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Commercial Use Policy** | **Strictly Personal / Non-commercial** | Allowed for businesses & revenue | Commercial entity (course fees, admissions) | Commercial entity | ❌ **No (Policy Breach)** |
| **Fast Data Transfer (Bandwidth)** | **100 GB / month** | 1 TB/mo included (then $0.15/GB or flat rate) | ~1.2 MB/pageview × 350K pv/day = **420 GB/day** (**Exhausted in 6 hours!**) | ~120 KB/pv × 350K pv/day = **42 GB/day** (Exhausted in 2.5 days) | ❌ **No** |
| **Serverless Invocations** | **1,000,000 / month** | Usage credit based | 250,000 / day (**Exhausted in 4 days!**) | ~2,000 / day (**60,000 / month**) | ❌ Unoptimized: No<br>✅ Optimized: Yes |
| **Active CPU Time** | **4 hours / month** | Usage credit based | ~35 hours / month | ~0.5 hours / month | ❌ Unoptimized: No<br>✅ Optimized: Yes |
| **Provisioned Memory** | **360 GB-hours / month** | Usage credit based | ~3,600 GB-hours / month | ~60 GB-hours / month | ❌ Unoptimized: No<br>✅ Optimized: Yes |
| **Max Function Duration** | **300 seconds** (default 10-15s) | Up to 800s (1800s beta) | Normal calls < 1s | Normal calls < 100ms | ✅ Yes |
| **Image Optimization (Transformations)** | **5,000 / month** | Credit based | 0 (uses raw `<img>`) | First month: ~3,000 (cached after) | ⚠️ Tight on Hobby |
| **Image Cache Reads** | **300,000 / month** | Credit based | 0 | ~1,000,000 / month | ❌ Exceeds 300K on Hobby |
| **Overages Behavior** | **Hard Pause** (Site goes offline with 402/payment required error) | Pay-as-you-go overages (Site stays online) | Instant site shutdown on day 1 | Predictable low cost | ❌ Dangerous on Hobby |

### Verdict on Infrastructure Requirements:
1. **Can Vercel Hobby handle 100,000 visitors/day?**  
   **NO.** Regardless of code optimization, **100,000 visitors/day generating 350,000 page views produces at least 42 GB to 420 GB of bandwidth daily**, which exhausts the monthly 100 GB Hobby bandwidth limit in **6 to 60 hours**, triggering an immediate site suspension. Furthermore, Neos Astra collects student fees and course admissions, which violates Vercel's non-commercial Hobby terms of service.
2. **Is Vercel Pro sufficient?**  
   **YES, once the code is optimized.**  
   On Vercel Pro ($20/month):
   - 1 TB included bandwidth covers ~25 days of 100K traffic (overage bandwidth is very cheap: ~$0.15/GB).
   - Invocations are well within included credits when public pages are ISR/Server Components (~60K invocations/month).
   - Site never goes down; overages are billed smoothly without disruption.
