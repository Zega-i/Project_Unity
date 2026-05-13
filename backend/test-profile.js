const http = require("http");

function makeRequest(method, path, data, token = null) {
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

    if (token) {
      options.headers["Authorization"] = `Bearer ${token}`;
    }

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
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function testProfile() {
  console.log("╔════════════════════════════════════════════════════════════╗");
  console.log("║     Testing Profile Data Persistence                      ║");
  console.log("╚════════════════════════════════════════════════════════════╝\n");

  try {
    // Register dengan data lengkap
    console.log("1️⃣ Registering student dengan data lengkap...\n");
    
    const registerData = {
      email: "profile_test_" + Date.now() + "@example.com",
      password: "password123",
      name: "Ahmad Wijaya",
      role: "STUDENT",
      grade: 9,
      className: "9B",
      school: "SMP Negeri 5 Jakarta",
      nisn: "0012345678",
      dateOfBirth: "2010-05-15",
      address: "Jl. Merdeka No. 123, Jakarta",
      parentName: "Budi Wijaya",
      parentPhone: "081234567890"
    };

    console.log("Data yang dikirim:");
    Object.keys(registerData).forEach(key => {
      if (key !== 'password') {
        console.log(`  - ${key}: ${registerData[key]}`);
      }
    });
    console.log();

    const registerRes = await makeRequest("POST", "/api/auth/register", registerData);
    
    if (registerRes.status !== 201) {
      console.log("❌ Register failed:", registerRes.data);
      return;
    }

    const registerJson = JSON.parse(registerRes.data);
    const token = registerJson.data.token;
    const email = registerData.email;

    console.log("✅ Register successful\n");
    console.log("Register response - user data:");
    console.log(JSON.stringify(registerJson.data.user, null, 2));
    console.log("\n");

    // Get profile
    console.log("2️⃣ Getting profile with /api/auth/me...\n");
    
    const profileRes = await makeRequest("GET", "/api/auth/me", null, token);
    
    if (profileRes.status !== 200) {
      console.log("❌ Get profile failed:", profileRes.data);
      return;
    }

    const profileJson = JSON.parse(profileRes.data);
    
    console.log("✅ Get profile successful\n");
    console.log("Profile response - user data:");
    console.log(JSON.stringify(profileJson.data.user, null, 2));
    
    // Check specific fields
    console.log("\n");
    console.log("════════════════════════════════════════════════════════════");
    console.log("Field Verification:");
    console.log("════════════════════════════════════════════════════════════");
    
    const user = profileJson.data.user;
    const fieldsMissing = [];
    
    if (!user.school) fieldsMissing.push("school");
    if (!user.className) fieldsMissing.push("className");
    if (!user.grade) fieldsMissing.push("grade");
    if (!user.dateOfBirth) fieldsMissing.push("dateOfBirth");
    
    if (fieldsMissing.length === 0) {
      console.log("✅ All fields present and saved correctly!");
      console.log(`   - school: ${user.school}`);
      console.log(`   - className: ${user.className}`);
      console.log(`   - grade: ${user.grade}`);
      console.log(`   - dateOfBirth: ${user.dateOfBirth}`);
    } else {
      console.log("❌ Missing fields:", fieldsMissing.join(", "));
    }

  } catch (error) {
    console.log("❌ Error:", error.message);
  }
}

testProfile();
