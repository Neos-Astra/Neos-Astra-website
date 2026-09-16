import http from "k6/http";
import { check, sleep, group } from "k6";

export const options = {
  stages: [
    { duration: "10s", target: 5 },    // Baseline idle
    { duration: "15s", target: 350 },  // Sudden massive spike
    { duration: "1m", target: 350 },   // Sustain spike
    { duration: "15s", target: 10 },   // Sudden drop
    { duration: "30s", target: 10 },   // Recovery observation
  ],
  thresholds: {
    http_req_failed: ["rate<0.05"], // Error rate < 5% during sudden spike
    http_req_duration: ["p(95)<4000"], // p95 < 4s
  },
};

const BASE_URL = __ENV.BASE_URL || "http://localhost:3000";

export default function () {
  const params = {
    headers: {
      "User-Agent": "k6-load-test/1.0 (NeosAstra-SpikeTest)",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    },
  };

  group("Spike_Landing", () => {
    // 80% hit homepage
    const rHome = http.get(`${BASE_URL}/`, params);
    check(rHome, {
      "Home not 5xx": (r) => r.status < 500,
      "Home status 200": (r) => r.status === 200,
    });

    if (Math.random() < 0.5) {
      const rCourses = http.get(`${BASE_URL}/courses`, params);
      check(rCourses, {
        "Courses not 5xx": (r) => r.status < 500,
      });
    }

    sleep(1);
  });
}
