import http from "k6/http";
import { check } from "k6";

// RPS-based scenarios corresponding directly to TRAFFIC_MODEL_AND_VERCEL_LIMITS.md
const TARGET_RPS = parseInt(__ENV.TARGET_RPS || "75", 10); // Default to Scenario A Peak: 75 RPS
const TEST_DURATION = __ENV.DURATION || "1m";

export const options = {
  scenarios: {
    constant_rate_test: {
      executor: "constant-arrival-rate",
      rate: TARGET_RPS,
      timeUnit: "1s",
      duration: TEST_DURATION,
      preAllocatedVUs: Math.min(TARGET_RPS * 2, 200),
      maxVUs: Math.max(TARGET_RPS * 4, 500),
    },
  },
  thresholds: {
    http_req_failed: ["rate<0.01"], // Error rate < 1%
    http_req_duration: ["p(95)<1500", "p(99)<3000"], // p95 < 1.5s, p99 < 3s
  },
};

const BASE_URL = __ENV.BASE_URL || "http://localhost:3000";

export default function () {
  const params = {
    headers: {
      "User-Agent": "k6-load-test/1.0 (NeosAstra-RPS-Test)",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    },
  };

  // Distribution matching realistic user page preferences
  const rand = Math.random();
  let url = `${BASE_URL}/`;

  if (rand < 0.40) {
    url = `${BASE_URL}/`;
  } else if (rand < 0.70) {
    url = `${BASE_URL}/courses`;
  } else if (rand < 0.85) {
    url = `${BASE_URL}/team`;
  } else if (rand < 0.95) {
    url = `${BASE_URL}/about`;
  } else {
    url = `${BASE_URL}/faq`;
  }

  const res = http.get(url, params);

  check(res, {
    "Status 200": (r) => r.status === 200,
    "No 5xx server error": (r) => r.status < 500,
  });
}
