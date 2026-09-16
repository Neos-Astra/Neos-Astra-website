import http from "k6/http";
import { check, sleep, group } from "k6";

export const options = {
  stages: [
    { duration: "30s", target: 10 },  // Ramp up to Level 2 (10 VUs)
    { duration: "1m", target: 25 },   // Ramp up to 25 VUs
    { duration: "1m", target: 50 },   // Level 3 (50 VUs)
    { duration: "30s", target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_failed: ["rate<0.01"], // Error rate < 1%
    http_req_duration: ["p(95)<2000", "p(99)<4000"], // p95 < 2s, p99 < 4s
  },
};

const BASE_URL = __ENV.BASE_URL || "http://localhost:3000";

export default function () {
  const params = {
    headers: {
      "User-Agent": "k6-load-test/1.0 (NeosAstra-NormalTraffic)",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    },
  };

  // Step 1: Every user visits the Homepage
  group("01_Browse_Homepage", () => {
    const res = http.get(`${BASE_URL}/`, params);
    check(res, { "Home is 200": (r) => r.status === 200 });
    sleep(Math.random() * 2 + 1); // 1-3s think time
  });

  // Step 2: 70% of users navigate to Courses
  if (Math.random() < 0.7) {
    group("02_Browse_Courses", () => {
      const res = http.get(`${BASE_URL}/courses`, params);
      check(res, { "Courses is 200": (r) => r.status === 200 });

      // Simulate API call if client-fetching is still present
      const apiRes = http.get(`${BASE_URL}/api/courses`, {
        headers: { Accept: "application/json" },
      });
      check(apiRes, { "Courses API is 200": (r) => r.status === 200 });

      sleep(Math.random() * 2 + 1);
    });
  }

  // Step 3: 40% of users check out the Team
  if (Math.random() < 0.4) {
    group("03_Browse_Team", () => {
      const res = http.get(`${BASE_URL}/team`, params);
      check(res, { "Team is 200": (r) => r.status === 200 });
      sleep(Math.random() * 2 + 1);
    });
  }

  // Step 4: 30% of users check Events or FAQ
  if (Math.random() < 0.3) {
    group("04_Browse_Events_FAQ", () => {
      const page = Math.random() < 0.5 ? "events" : "faq";
      const res = http.get(`${BASE_URL}/${page}`, params);
      check(res, { "Events/FAQ is 200": (r) => r.status === 200 });
      sleep(Math.random() * 2 + 1);
    });
  }

  // Step 5: 20% of users view Careers or Survey Form
  if (Math.random() < 0.2) {
    group("05_Browse_Career_Form", () => {
      const page = Math.random() < 0.5 ? "career" : "form";
      const res = http.get(`${BASE_URL}/${page}`, params);
      check(res, { "Career/Form is 200": (r) => r.status === 200 });
      sleep(Math.random() * 2 + 1);
    });
  }
}
