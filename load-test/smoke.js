import http from "k6/http";
import { check, sleep, group } from "k6";

export const options = {
  vus: 2,
  duration: "30s",
  thresholds: {
    http_req_failed: ["rate<0.01"], // Error rate < 1%
    http_req_duration: ["p(95)<1500", "p(99)<3000"], // 95% of requests < 1.5s
  },
};

const BASE_URL = __ENV.BASE_URL || "http://localhost:3000";

export default function () {
  const params = {
    headers: {
      "User-Agent": "k6-load-test/1.0 (NeosAstra-SmokeTest)",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    },
  };

  group("01_Homepage", () => {
    const res = http.get(`${BASE_URL}/`, params);
    check(res, {
      "Home status is 200": (r) => r.status === 200,
      "Home content loaded": (r) => r.body && r.body.includes("NEOS"),
    });
    sleep(1);
  });

  group("02_Courses_Page", () => {
    const res = http.get(`${BASE_URL}/courses`, params);
    check(res, {
      "Courses status is 200": (r) => r.status === 200,
    });
    sleep(1);
  });

  group("03_Courses_API_GET", () => {
    const apiRes = http.get(`${BASE_URL}/api/courses`, {
      headers: { Accept: "application/json" },
    });
    check(apiRes, {
      "Courses API status is 200": (r) => r.status === 200,
      "Courses API returns JSON array": (r) => {
        try {
          return Array.isArray(JSON.parse(r.body));
        } catch (_) {
          return false;
        }
      },
    });
    sleep(1);
  });

  group("04_Team_Page", () => {
    const res = http.get(`${BASE_URL}/team`, params);
    check(res, {
      "Team status is 200": (r) => r.status === 200,
    });
    sleep(1);
  });

  group("05_Events_And_FAQ", () => {
    const resEvents = http.get(`${BASE_URL}/events`, params);
    check(resEvents, { "Events status is 200": (r) => r.status === 200 });

    const resFaq = http.get(`${BASE_URL}/faq`, params);
    check(resFaq, { "FAQ status is 200": (r) => r.status === 200 });
    sleep(1);
  });

  group("06_Career_And_Privacy", () => {
    const resCareer = http.get(`${BASE_URL}/career`, params);
    check(resCareer, { "Career status is 200": (r) => r.status === 200 });

    const resPrivacy = http.get(`${BASE_URL}/privacy`, params);
    check(resPrivacy, { "Privacy status is 200": (r) => r.status === 200 });
    sleep(1);
  });
}
