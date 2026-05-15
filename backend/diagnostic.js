// Diagnostic script for AI Tutor endpoint
require("dotenv").config();

// Check environment setup
console.log("╔════════════════════════════════════════════════════════════╗");
console.log("║       AI Tutor Endpoint Diagnostic Check                   ║");
console.log("╚════════════════════════════════════════════════════════════╝");

console.log("\n1️⃣ Environment Variables:");
console.log("────────────────────────────────────────");
console.log(`DATABASE_URL: ${process.env.DATABASE_URL ? '✅ Set' : '❌ Missing'}`);
console.log(`GROQ_API_KEY: ${process.env.GROQ_API_KEY ? '✅ Set (' + process.env.GROQ_API_KEY.substring(0, 10) + '...)' : '❌ Missing'}`);
console.log(`JWT_SECRET: ${process.env.JWT_SECRET ? '✅ Set' : '❌ Missing'}`);
console.log(`PORT: ${process.env.PORT || '3000'} ✅`);

console.log("\n2️⃣ Testing Groq import:");
console.log("────────────────────────────────────────");
try {
  const Groq = require("groq-sdk");
  console.log("✅ groq-sdk imported successfully");
  
  if (!process.env.GROQ_API_KEY) {
    console.log("⚠️  WARNING: GROQ_API_KEY is not set, this will cause errors at runtime");
  } else {
    console.log("✅ GROQ_API_KEY is set, will initialize Groq");
    
    // Try to initialize
    try {
      const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
      console.log("✅ Groq initialized successfully");
    } catch (err) {
      console.log("❌ Error initializing Groq: " + err.message);
    }
  }
} catch (err) {
  console.log("❌ Error importing groq-sdk: " + err.message);
  console.log("   Run: npm install groq-sdk");
}

console.log("\n3️⃣ Checking AIController:");
console.log("────────────────────────────────────────");
try {
  // Use .ts if in development, or .js if built
  let AIController;
  try {
    AIController = require("./src/controllers/AIController").AIController;
  } catch {
    AIController = require("./dist/controllers/AIController").AIController;
  }
  console.log("✅ AIController imported successfully");
  console.log("   Methods: " + Object.getOwnPropertyNames(AIController).filter(m => m !== 'length' && m !== 'prototype' && m !== 'name').join(", "));
} catch (err) {
  console.log("❌ Error loading AIController: " + err.message);
}

console.log("\n4️⃣ Checking AIService:");
console.log("────────────────────────────────────────");
try {
  let AIService;
  try {
    AIService = require("./src/services/AIService").AIService;
  } catch {
    AIService = require("./dist/services/AIService").AIService;
  }
  console.log("✅ AIService imported successfully");
  console.log("   Methods: " + Object.getOwnPropertyNames(AIService).filter(m => m !== 'length' && m !== 'prototype' && m !== 'name').join(", "));
} catch (err) {
  console.log("❌ Error loading AIService: " + err.message);
}

console.log("\n════════════════════════════════════════════════════════════");
console.log("Diagnostic complete!");
console.log("════════════════════════════════════════════════════════════");
