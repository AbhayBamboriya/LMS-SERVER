import http from "k6/http";
import { sleep } from "k6";

export let options = {
  vus: 100,          // 100 concurrent users
  duration: "30s",   // run test for 30 sec

  thresholds: {
    // 1️⃣  Average response time must be < 500ms
    http_req_duration: ["avg < 500"],

    // 2️⃣  95% of requests must be < 800ms
    http_req_duration: ["p(95) < 800"],

    // 3️⃣  Error rate must be less than 1%
    http_req_failed: ["rate < 0.01"],

    // 4️⃣  Requests per second should be at least 20 rps
    "http_reqs": ["count > 600"],  // 20 rps * 30 sec = 600
  }
};

export default function () {
  const res = http.get("https://pokedetail.netlify.app/pokemon/2");
  sleep(1);
}
