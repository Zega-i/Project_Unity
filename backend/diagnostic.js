// Diagnostic script for AI Tutor endpoint
require("dotenv").config();

// Check environment setup
console.log("╔════════════════════════════════════════════════════════════╗");
console.log("║       AI Tutor Endpoint Diagnostic Check                   ║");
console.log("╚════════════════════════════════════════════════════════════╝");

console.log("\n1️⃣ Environment Variables:");
console.log("────────────────────────────────────────");
console.log(`DATABASE_URL: ${process.env.DATABASE_URL ? '✅ Set' : '❌ Missing'}`);
console.log(`GEMINI_API_KEY: ${process.env.GEMINI_API_KEY ? '✅ Set (' + process.env.GEMINI_API_KEY.substring(0, 10) + '...)' : '❌ Missing'}`);
console.log(`JWT_SECRET: ${process.env.JWT_SECRET ? '✅ Set' : '❌ Missing'}`);
console.log(`PORT: ${process.env.PORT || '3000'} ✅`);

console.log("\n2️⃣ Testing GoogleGenerativeAI import:");
console.log("────────────────────────────────────────");
try {
  const { GoogleGenerativeAI } = require("@google/generative-ai");
  console.log("✅ @google/generative-ai imported successfully");
  
  if (!process.env.GEMINI_API_KEY) {
    console.log("⚠️  WARNING: GEMINI_API_KEY is not set, this will cause errors at runtime");
  } else {
    console.log("✅ GEMINI_API_KEY is set, will initialize GoogleGenerativeAI");
    
    // Try to initialize
    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      console.log("✅ GoogleGenerativeAI initialized successfully");
      
      try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        console.log("✅ Model 'gemini-1.5-flash' loaded successfully");
      } catch (err) {
        console.log("❌ Error loading model: " + err.message);
      }
    } catch (err) {
      console.log("❌ Error initializing GoogleGenerativeAI: " + err.message);
    }
  }
} catch (err) {
  console.log("❌ Error importing @google/generative-ai: " + err.message);
  console.log("   Run: npm install @google/generative-ai");
}

console.log("\n3️⃣ Checking AIController:");
console.log("────────────────────────────────────────");
try {
  const AIController = require("./dist/controllers/AIController").AIController;
  console.log("✅ AIController imported successfully");
  console.log("   Methods: " + Object.getOwnPropertyNames(AIController).filter(m => m !== 'length' && m !== 'prototype' && m !== 'name').join(", "));
} catch (err) {
  console.log("❌ Error loading AIController: " + err.message);
}

console.log("\n4️⃣ Checking GeminiService:");
console.log("────────────────────────────────────────");
try {
  const GeminiService = require("./dist/services/GeminiService").GeminiService;
  console.log("✅ GeminiService imported successfully");
  console.log("   Methods: " + Object.getOwnPropertyNames(GeminiService).filter(m => m !== 'length' && m !== 'prototype' && m !== 'name').join(", "));
} catch (err) {
  console.log("❌ Error loading GeminiService: " + err.message);
}

console.log("\n════════════════════════════════════════════════════════════");
console.log("Diagnostic complete!");
console.log("════════════════════════════════════════════════════════════");
