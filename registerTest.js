import http from "k6/http";
import { check, sleep } from "k6";
import encoding from "k6/encoding";

export const options = {
  vus: 10,
  iterations: 400,
};

// Load avatar file as base64
const avatarBinary = open("./einstein.png", "b");

// Data
const firstNames = [
  "Aarav", "Kiara", "Vivaan", "Siya", "Atharv",
  "Anaya", "Ishaan", "Tara", "Advait", "Mahira",
  "Riaan", "Saanvi", "Aryan", "Kashvi", "Revaan",
  "Eesha", "Vihaan", "Tanishka", "Arin", "Nyra"
];
const lastNames = [
  "Malhotra", "Chatterjee", "Sarin", "Mehta", "Bhasin",
  "Tandon", "Sharma", "Kapoor", "Nair", "Iyer",
  "Deshpande", "Sodhi", "Ahluwalia", "Gupta", "Saxena",
  "Rastogi", "Chhabra", "Suri", "Bhandari", "Sethi"
];

const roles = ["USER", "ADMIN"];

function getRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateEmail(first, last) {
  return `${first.toLowerCase()}.${last.toLowerCase()}${Math.floor(
    Math.random() * 10000
  )}@example.com`;
}

export default function () {
  const first = getRandom(firstNames);
  const last = getRandom(lastNames);

  const boundary = "----WebKitFormBoundary7MA4YWxkTrZu0gW";

  const payload =
    `--${boundary}\r\n` +
    `Content-Disposition: form-data; name="fullName"\r\n\r\n${first} ${last}\r\n` +

    `--${boundary}\r\n` +
    `Content-Disposition: form-data; name="email"\r\n\r\n${generateEmail(first, last)}\r\n` +

    `--${boundary}\r\n` +
    `Content-Disposition: form-data; name="password"\r\n\r\nChintu@123\r\n` +

    `--${boundary}\r\n` +
    `Content-Disposition: form-data; name="role"\r\n\r\n${getRandom(roles)}\r\n` +

    `--${boundary}\r\n` +
    `Content-Disposition: form-data; name="avatar"; filename="einstein.png"\r\n` +
    `Content-Type: image/png\r\n\r\n${avatarBinary}\r\n` +

    `--${boundary}--`;

  const headers = {
    "Content-Type": `multipart/form-data; boundary=${boundary}`,
  };

  const res = http.post(
    "http://localhost:4052/api/v1/user/register",
    payload,
    { headers }
  );

  check(res, {
    "status is 200 or 201": (r) => r.status === 200 || r.status === 201,
  });

  console.log("Status:", res.status);

  sleep(0.2);
}
