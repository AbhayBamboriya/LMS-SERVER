import axios from "axios";
import fs from "fs";
import FormData from "form-data";

const firstNames = [
  "Rehan", "Myra", "Ira", "Kabir", "Naina",
  "Arjun", "Vanya", "Rudra", "Zoya", "Reeva",
  "Laksh", "Aira", "Dev", "Inaaya", "Hriday",
  "Tanish", "Amaira", "Ishika", "Reyansh", "Meher"
];
const lastNames = [
  "Shekhawat", "Bhargava", "Rajput", "Goswami", "Kulkarni",
  "Phadke", "Banerjee", "Gokhale", "Talwar", "Khanna",
  "Bajpai", "Sengupta", "Dwivedi", "Gandhi", "Bedekar",
  "Kohli", "Purohit", "Saraf", "Lulla", "Wadhwa"
];


const roles = ["USER", "ADMIN"];

// Helper functions
function getRandomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateRandomEmail(firstName, lastName) {
  const num = Math.floor(Math.random() * 10000);
  return `${firstName.toLowerCase()}.${lastName.toLowerCase()}${num}@example.com`;
}
let i=1;
// Create a single user
async function createUser() {
  const firstName = getRandomElement(firstNames);
  const lastName = getRandomElement(lastNames);

  // FormData payload
  const form = new FormData();
  form.append("fullName", `${firstName} ${lastName}`);
  form.append("email", generateRandomEmail(firstName, lastName));
  form.append("password", "Chintu@123");
  form.append("role", getRandomElement(roles));
  form.append("avatar", fs.createReadStream("./einstein.png")); // Upload the image

  try {
    const res = await axios.post(
      "http://localhost:4052/api/v1/user/register",
      form,
      {
        headers: form.getHeaders(), // Important for multipart/form-data
      }
    );
    console.log(i,res.status, form.getBuffer().toString());
    i++;
  } catch (err) {
    console.error("Error:", err.message);
  }
}

// Create multiple users
async function createUsers(count) {
  for (let i = 0; i < count; i++) {
    await createUser();
  }
}

// Generate 2 users
createUsers(3);
