import http from 'k6/http';
import { sleep } from 'k6';

export const options = {
  vus: 50,        // 50 users
  duration: '30s' // for 30 seconds
};

export default function () {
  const res = http.get("http://localhost:4052/api/v1/course");

  // print response time
  console.log("Response time:", res.timings.duration, "ms");

  sleep(1); // wait 1 second between requests
}
