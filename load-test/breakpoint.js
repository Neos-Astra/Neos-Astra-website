import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  stages: [
    { duration: "30s", target: 50 },
    { duration: "45s", target: 100 },
    { duration: "45s", target: 200 },
    { duration: "45s", target: 400 },
    { duration: "45s", target: 600 },
    { duration: "45s", target: 800 },
    { duration: "45s", target: 1000 },
    { duration: "30s", target: 0 },
  ],
  thresholds: {
    // We intentionally observe where these thresholds breach:
    http_req_failed: ["rate<0.05"], // Breach indicates breakpoint
    http_req_duration: ["p(95)<3000"], // Breach indicates latency ceiling
  },
};

const BASE_URL = __ENV.BASE_URL || "http://localhost:3000";

export default function () {
  const params = {
    headers: {
      "User-Agent": "k6-load-test/1.0 (NeosAstra-Breakpoint)",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    },
  };

  const pages = ["/", "/courses", "/team", "/about", "/faq"];
  const selectedPage = pages[Math.floor(Math.random() * pages.length)];

  const res = http.get(`${BASE_URL}${selectedPage}`, params);

  check(res, {
    "Response is 200": (r) => r.status === 200,
    "No 5xx server error": (r) => r.status < 500,
  });

  sleep(1);
}
