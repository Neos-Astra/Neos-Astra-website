import http from "k6/http";
import { check, sleep, group } from "k6";

export const options = {
  stages: [
    { duration: "30s", target: 10 },   // Level 2 (10 VUs)
    { duration: "1m", target: 50 },    // Level 3 (50 VUs)
    { duration: "1m", target: 100 },   // Level 4 (100 VUs)
    { duration: "1m", target: 250 },   // Approaching peak
    { duration: "1m", target: 500 },   // Level 5 (500 VUs peak stress)
    { duration: "30s", target: 0 },    // Cooldown
  ],
  thresholds: {
    http_req_failed: ["rate<0.02"], // Error rate < 2% under stress
    http_req_duration: ["p(95)<3000", "p(99)<6000"], // p95 < 3s, p99 < 6s
  },
};

const BASE_URL = __ENV.BASE_URL || "http://localhost:3000";

export default function () {
  const params = {
    headers: {
      "User-Agent": "k6-load-test/1.0 (NeosAstra-StressTest)",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    },
  };

  // Weighted user journeys under stress
  const rand = Math.random();

  if (rand < 0.45) {
    // Journey 1: General Visitor (Home -> Courses)
    group("Journey_Home_Courses", () => {
      const r1 = http.get(`${BASE_URL}/`, params);
      check(r1, { "Home status 200": (r) => r.status === 200 });
      sleep(0.5);

      const r2 = http.get(`${BASE_URL}/courses`, params);
      check(r2, { "Courses status 200": (r) => r.status === 200 });

      const rApi = http.get(`${BASE_URL}/api/courses`, {
        headers: { Accept: "application/json" },
      });
      check(rApi, { "Courses API status 200": (r) => r.status === 200 });
      sleep(0.5);
    });
  } else if (rand < 0.75) {
    // Journey 2: About & Team Inspection
    group("Journey_About_Team", () => {
      const r1 = http.get(`${BASE_URL}/about`, params);
      check(r1, { "About status 200": (r) => r.status === 200 });
      sleep(0.5);

      const r2 = http.get(`${BASE_URL}/team`, params);
      check(r2, { "Team status 200": (r) => r.status === 200 });
      sleep(0.5);
    });
  } else {
    // Journey 3: Deep exploration (Events, FAQ, Career)
    group("Journey_Explore_More", () => {
      const r1 = http.get(`${BASE_URL}/events`, params);
      check(r1, { "Events status 200": (r) => r.status === 200 });

      const r2 = http.get(`${BASE_URL}/faq`, params);
      check(r2, { "FAQ status 200": (r) => r.status === 200 });

      const r3 = http.get(`${BASE_URL}/career`, params);
      check(r3, { "Career status 200": (r) => r.status === 200 });
      sleep(0.5);
    });
  }
}
