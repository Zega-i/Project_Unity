const http = require("http");
require("dotenv").config();

function makeRequest(method, path, data) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: "localhost",
      port: 3000,
      path: path,
      method: method,
      headers: {
        "Content-Type": "application/json",
      }
    };

    const req = http.request(options, (res) => {
      let responseData = "";
      res.on("data", (chunk) => {
        responseData += chunk;
      });
      res.on("end", () => {
        resolve({
          status: res.statusCode,
          data: responseData
        });
      });
    });

    req.on("error", reject);
    req.write(JSON.stringify(data));
    req.end();
  });
}

async function testAIFlow() {
  console.log("╔════════════════════════════════════════════════════════════╗");
  console.log("║     Complete AI Tutor Endpoint Test Flow                  ║");
  console.log("╚════════════════════════════════════════════════════════════╝\n");

  try {
    // Step 1: Register Student
    console.log("1️⃣ Registering student...");
    const registerRes = await makeRequest("POST", "/api/auth/register", {
      email: "student_test@example.com",
      password: "password123",
      name: "Test Student",
      role: "STUDENT",
      grade: 8
    });

    if (registerRes.status !== 201 && registerRes.status !== 200) {
      // Maybe already exists, try login
      console.log("   (User might already exist, trying login...)\n");
    } else {
      console.log("   ✅ Registration successful\n");
    }

    // Step 2: Login
    console.log("2️⃣ Logging in...");
    const loginRes = await makeRequest("POST", "/api/auth/login", {
      email: "student_test@example.com",
      password: "password123"
    });

    if (loginRes.status !== 200) {
      console.log("   ❌ Login failed:", loginRes.data);
      return;
    }

    const loginData = JSON.parse(loginRes.data);
    const token = loginData.data?.token;

    if (!token) {
      console.log("   ❌ No token in response");
      return;
    }

    console.log("   ✅ Login successful");
    console.log("   Token:", token.substring(0, 20) + "...\n");

    // Step 3: Test AI Tutor with JWT
    console.log("3️⃣ Testing /api/ai/tutor endpoint...");
    
    const tutorOptions = {
      hostname: "localhost",
      port: 3000,
      path: "/api/ai/tutor",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    };

    const tutorRes = await new Promise((resolve, reject) => {
      const req = http.request(tutorOptions, (res) => {
        let data = "";
        res.on("data", (chunk) => {
          data += chunk;
        });
        res.on("end", () => {
          resolve({
            status: res.statusCode,
            data: data
          });
        });
      });

      req.on("error", reject);
      req.write(JSON.stringify({
        message: "Bagaimana cara menghitung luas persegi panjang?",
        context: {
          subject: "Matematika",
          grade: "SMP",
          topic: "Geometri"
        }
      }));
      req.end();
    });

    if (tutorRes.status === 200) {
      const tutorData = JSON.parse(tutorRes.data);
      if (tutorData.success) {
        console.log("   ✅ AI Tutor responded!\n");
        console.log("Response from AI:");
        console.log(tutorData.data.response.substring(0, 300) + "...\n");
        
        console.log("════════════════════════════════════════════════════════════");
        console.log("✅ AI TUTOR ENDPOINT IS FULLY WORKING!");
        console.log("════════════════════════════════════════════════════════════");
      } else {
        console.log("   ❌ Response not successful:", tutorRes.data);
      }
    } else {
      console.log("   ❌ Request failed with status", tutorRes.status);
      console.log("   Response:", tutorRes.data);
    }

  } catch (error) {
    console.log("❌ Error:", error.message);
  }
}

testAIFlow();
