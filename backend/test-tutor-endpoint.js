const http = require("http");
require("dotenv").config();

// Test data
const testPayload = {
  message: "Bagaimana cara menghitung luas persegi panjang?",
  context: {
    subject: "Matematika",
    grade: "SMP",
    topic: "Geometri"
  }
};

// Create request
const options = {
  hostname: "localhost",
  port: 3000,
  path: "/api/ai/tutor",
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    // Fake JWT for testing (dalam real scenario, perlu valid JWT)
    "Authorization": "Bearer test-token"
  }
};

console.log("╔════════════════════════════════════════════════════════════╗");
console.log("║     Testing /api/ai/tutor Endpoint                        ║");
console.log("╚════════════════════════════════════════════════════════════╝\n");

console.log("Sending request to: http://localhost:3000/api/ai/tutor");
console.log("Payload:", JSON.stringify(testPayload, null, 2));
console.log("\n");

const req = http.request(options, (res) => {
  let data = "";

  res.on("data", (chunk) => {
    data += chunk;
  });

  res.on("end", () => {
    console.log(`Status: ${res.statusCode}`);
    console.log("Response:", data);
    
    try {
      const parsed = JSON.parse(data);
      if (parsed.success) {
        console.log("\n════════════════════════════════════════════════════════════");
        console.log("✅ /api/ai/tutor Endpoint is WORKING!");
        console.log("════════════════════════════════════════════════════════════");
      } else {
        console.log("\n❌ Response not successful");
      }
    } catch (e) {
      console.log("\n❌ Error parsing response");
    }
  });
});

req.on("error", (error) => {
  console.error("❌ Request error:", error.message);
});

req.write(JSON.stringify(testPayload));
req.end();
