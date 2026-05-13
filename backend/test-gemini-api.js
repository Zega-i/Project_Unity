// Test if Gemini API key is valid
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

console.log("╔════════════════════════════════════════════════════════════╗");
console.log("║     Testing Gemini API Key Validity                       ║");
console.log("╚════════════════════════════════════════════════════════════╝\n");

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.log("❌ GEMINI_API_KEY not found in environment");
  process.exit(1);
}

console.log("API Key: " + apiKey.substring(0, 20) + "...\n");

(async () => {
  try {
    console.log("1️⃣ Initializing GoogleGenerativeAI...");
    const genAI = new GoogleGenerativeAI(apiKey);
    console.log("✅ Initialization successful\n");
    
    console.log("2️⃣ Loading model: gemini-pro");
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    console.log("✅ Model loaded\n");
    
    console.log("3️⃣ Sending test prompt to Gemini...");
    const testPrompt = "Kamu adalah AI Tutor. Jelaskan fotosintesis dalam 50 kata.";
    
    const result = await model.generateContent(testPrompt);
    const response = await result.response;
    const text = response.text();
    
    console.log("✅ Gemini responded successfully!\n");
    console.log("Response preview:");
    console.log(text.substring(0, 200) + (text.length > 200 ? "..." : ""));
    
    console.log("\n════════════════════════════════════════════════════════════");
    console.log("✅ Gemini API Key is VALID and working correctly!");
    console.log("════════════════════════════════════════════════════════════");
    
  } catch (error) {
    console.log("❌ ERROR: " + error.message);
    console.log("\nPossible causes:");
    
    if (error.message.includes('401') || error.message.includes('UNAUTHENTICATED')) {
      console.log("  - Invalid API key (401 Unauthorized)");
      console.log("  - API key doesn't have permission");
    } else if (error.message.includes('429')) {
      console.log("  - Rate limit exceeded (429)");
      console.log("  - Try again after waiting a bit");
    } else if (error.message.includes('500')) {
      console.log("  - Gemini API server error (500)");
      console.log("  - Try again later");
    } else if (error.message.includes('network') || error.message.includes('ECONNREFUSED')) {
      console.log("  - Network connection error");
      console.log("  - Check internet connection");
    } else {
      console.log("  - " + error.message);
    }
    
    process.exit(1);
  }
})();
