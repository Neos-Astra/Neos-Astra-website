# LOAD TESTING GUIDE & BENCHMARKING FRAMEWORK
**Target**: Neos Astra (`https://www.neosastra.com`)  
**Tool**: [Grafana k6](https://k6.io/)  
**Environment**: Localhost Staging (`http://localhost:3000`) or Staging Deployment  
**Safety Rule**: **NEVER run aggressive stress, spike, or breakpoint tests directly against production (`neosastra.com`) without explicit written confirmation.**

---

## 1. Safety Architecture & Setup

All scripts are completely decoupled from hostnames via the `BASE_URL` environment variable:
```bash
# Default (safe local test):
BASE_URL="http://localhost:3000"

# Explicit staging:
BASE_URL="https://staging.neosastra.com"
```

No test script submits fake inquiry, enrollment, or payment entries to prevent polluting production databases or triggering email/WhatsApp notification webhooks.

---

## 2. Progressive Load Test Levels

Tests must be executed sequentially. **Never jump directly to Level 5 or Level 6.**

| Level | Virtual Users (VUs) | Target Purpose | Associated Script |
| :--- | :--- | :--- | :--- |
| **Level 1** | 1–2 VUs | **Sanity / Smoke Test**: Validates routing, HTTP 200 statuses, basic latency, zero 5xx. | `load-test/smoke.js` |
| **Level 2** | 10 VUs | **Low Traffic**: Simulates 5-10 concurrent active users browsing courses & team. | `load-test/normal.js` (Stage 1) |
| **Level 3** | 50 VUs | **Normal Day Active Traffic**: Matches Scenario A average day traffic. | `load-test/normal.js` |
| **Level 4** | 100 VUs | **Peak Day Traffic**: Simulates peak hours of a 100,000 visitors/day load. | `load-test/stress.js` (Stage 3) |
| **Level 5** | 500 VUs | **Heavy Stress & Campaign Surge**: Evaluates queueing, pooling, memory, CPU limits. | `load-test/stress.js` |
| **Level 6** | 1000 VUs | **Breakpoint Discovery**: Ramps up until latency or error rate breaches thresholds. | `load-test/breakpoint.js` |

---

## 3. Test Suites & Commands

### 1. Smoke Test (Sanity Check)
```powershell
$env:BASE_URL="http://localhost:3000"
k6 run load-test/smoke.js
```
- **Duration**: 30 seconds
- **Load**: 2 VUs
- **Checks**: `/`, `/courses`, `/api/courses`, `/team`, `/events`, `/faq`, `/career`, `/privacy`.

### 2. Normal Traffic Test
```powershell
$env:BASE_URL="http://localhost:3000"
k6 run load-test/normal.js
```
- **Duration**: 3 minutes
- **Load**: 10 -> 25 -> 50 VUs -> 0
- **User Journey**: Multi-page browsing with realistic think times (1–3s).

### 3. Stress Test
```powershell
$env:BASE_URL="http://localhost:3000"
k6 run load-test/stress.js
```
- **Duration**: ~4.5 minutes
- **Load**: 10 -> 50 -> 100 -> 250 -> 500 VUs
- **Thresholds**: Evaluates p95 and p99 under sustained multi-user contention.

### 4. Sudden Spike Test
```powershell
$env:BASE_URL="http://localhost:3000"
k6 run load-test/spike.js
```
- **Duration**: ~2 minutes
- **Pattern**: 5 VUs -> instant jump to 350 VUs in 15s -> hold for 1 min -> drop.
- **Goal**: Verifies if the serverless container auto-scales or drops connections with 502/504 errors.

### 5. Breakpoint Test
```powershell
$env:BASE_URL="http://localhost:3000"
k6 run load-test/breakpoint.js
```
- **Duration**: ~5 minutes
- **Ramp**: 50 -> 100 -> 200 -> 400 -> 600 -> 800 -> 1000 VUs
- **Goal**: Identifies the exact breaking point (where p95 > 3s or error rate > 5%).

### 6. Traffic Model Rate-Based (RPS) Test
```powershell
# Scenario A Peak (75 RPS):
$env:BASE_URL="http://localhost:3000"; $env:TARGET_RPS="75"; $env:DURATION="1m"
k6 run load-test/rate-based.js

# Scenario B Average (250 RPS):
$env:BASE_URL="http://localhost:3000"; $env:TARGET_RPS="250"; $env:DURATION="1m"
k6 run load-test/rate-based.js
```

---

## 4. Performance Thresholds (SLAs)

The following thresholds are configured in the k6 test options:

| Metric | Target SLA | Alert / Failure Level |
| :--- | :--- | :--- |
| **HTTP Error Rate (`http_req_failed`)** | **< 1.0%** | > 2.0% |
| **5xx Server Errors** | **< 0.1%** | > 0.5% |
| **Normal Page/API Latency (p95)** | **< 1.5 seconds** | > 2.5 seconds |
| **Peak Latency (p99)** | **< 3.0 seconds** | > 5.0 seconds |
| **Static / Cached Route Latency (p95)** | **< 150 ms** | > 500 ms |
| **Checks Passing Rate** | **> 99%** | < 98% |

---

## 5. Metrics Recording Template

For every test executed, record results in this format:

```markdown
### Test Run: [Script Name] — [Level / Date]
- **Target URL**: [BASE_URL]
- **Duration**: [e.g. 30s]
- **Total Requests**: [e.g. 14,210]
- **Throughput**: [e.g. 78.4 req/s]
- **Latency Average**: [e.g. 42 ms]
- **Latency Median (p50)**: [e.g. 28 ms]
- **Latency p90**: [e.g. 68 ms]
- **Latency p95**: [e.g. 112 ms]
- **Latency p99**: [e.g. 240 ms]
- **HTTP Error Rate**: [e.g. 0.00%]
- **4xx Errors**: [e.g. 0]
- **5xx Errors**: [e.g. 0]
- **Timeouts**: [e.g. 0]
- **Checks Passed / Failed**: [e.g. 100% (28,420 passed / 0 failed)]
```
