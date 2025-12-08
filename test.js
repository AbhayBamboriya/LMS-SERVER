import http from 'k6/http';
import { sleep } from 'k6';

export const options = {
  vus: 100,
  duration: '30s',
  cloud: {
    // Project: coursify backend
    projectID: 6023572,
    // Test runs with the same name groups test runs together.
    name: 'Testing Allcourses'
  },
  thresolds:{
    http_req_failed:['rate<0.01'],
    http_req_duration:['p(95)<200']
  }
};

export default function() {
  http.get('https://lms-server-10l8.onrender.com/api/v1/course');
  sleep(1);
}