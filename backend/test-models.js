const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const modelsToTest = [
  "gemini-pro",
  "gemini-pro-vision",
  "gemini-1.5-flash",
  "gemini-1.5-pro",
  "gemini-2.0-flash",
  "gemini-2.0-pro",
];

async function testModels() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  
  console.log("╔════════════════════════════════════════════════════════════╗");
  console.log("║     Testing Available Gemini Models                        ║");
  console.log("╚════════════════════════════════════════════════════════════╝\n");
  
  for (const modelName of modelsToTest) {
    try {
      console.log(`Testing: ${modelName}...`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent("Hello");
      console.log(`✅ ${modelName} - WORKS\n`);
    } catch (error) {
      const msg = error.message;
      if (msg.includes("404")) {
        console.log(`❌ ${modelName} - NOT FOUND\n`);
      } else if (msg.includes("401") || msg.includes("UNAUTHENTICATED")) {
        console.log(`❌ ${modelName} - UNAUTHORIZED\n`);
      } else {
        console.log(`❌ ${modelName} - ERROR: ${msg.substring(0, 80)}\n`);
      }
    }
  }
}

testModels();
