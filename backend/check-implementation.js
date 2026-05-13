// Check if there are any async issues in GeminiService
const fs = require('fs');
const path = require('path');

const geminServicePath = path.join('D:', 'EduBridge', 'backend', 'src', 'services', 'GeminiService.ts');
const aiControllerPath = path.join('D:', 'EduBridge', 'backend', 'src', 'controllers', 'AIController.ts');

console.log("╔════════════════════════════════════════════════════════════╗");
console.log("║     Checking AI Tutor Implementation                       ║");
console.log("╚════════════════════════════════════════════════════════════╝\n");

// Check GeminiService
console.log("1️⃣ GeminiService.ts Analysis:");
console.log("─────────────────────────────────────────");

const geminContent = fs.readFileSync(geminServicePath, 'utf-8');

if (geminContent.includes('static async chatWithTutor')) {
  console.log("✅ chatWithTutor method exists");
  
  // Check for GoogleGenerativeAI
  if (geminContent.includes('new GoogleGenerativeAI')) {
    console.log("✅ GoogleGenerativeAI initialization found");
  } else {
    console.log("❌ GoogleGenerativeAI initialization missing");
  }
  
  // Check for getGenerativeModel
  if (geminContent.includes('getGenerativeModel')) {
    console.log("✅ getGenerativeModel call found");
  } else {
    console.log("❌ getGenerativeModel call missing");
  }
  
  // Check for generateContent
  if (geminContent.includes('generateContent')) {
    console.log("✅ generateContent call found");
  } else {
    console.log("❌ generateContent call missing");
  }
  
  // Check for proper error handling
  if (geminContent.includes('catch (error)')) {
    console.log("✅ Error handling present");
  } else {
    console.log("❌ Error handling missing");
  }
  
  // Check for logger
  if (geminContent.includes('logger.')) {
    console.log("✅ Logger calls present");
  } else {
    console.log("⚠️ Logger calls missing");
  }
} else {
  console.log("❌ chatWithTutor method NOT FOUND");
}

console.log("\n2️⃣ AIController.ts Analysis:");
console.log("─────────────────────────────────────────");

const aiContent = fs.readFileSync(aiControllerPath, 'utf-8');

if (aiContent.includes('static async tutorChat')) {
  console.log("✅ tutorChat method exists");
  
  // Check for validation
  if (aiContent.includes('validateTutorChatRequest')) {
    console.log("✅ Input validation present");
  } else {
    console.log("❌ Input validation missing");
  }
  
  // Check for GeminiService call
  if (aiContent.includes('GeminiService.chatWithTutor')) {
    console.log("✅ GeminiService.chatWithTutor call found");
  } else {
    console.log("❌ GeminiService.chatWithTutor call missing");
  }
  
  // Check for response formatting
  if (aiContent.includes('ApiResponse')) {
    console.log("✅ ApiResponse formatting present");
  } else {
    console.log("❌ ApiResponse formatting missing");
  }
  
  // Check for error handling
  if (aiContent.includes('ApiError') && aiContent.includes('catch')) {
    console.log("✅ Error handling present");
  } else {
    console.log("❌ Error handling missing");
  }
  
  // Check for logging
  if (aiContent.includes('logger.')) {
    console.log("✅ Logger calls present");
  } else {
    console.log("⚠️ Logger calls missing");
  }
} else {
  console.log("❌ tutorChat method NOT FOUND");
}

console.log("\n3️⃣ Potential Issues:");
console.log("─────────────────────────────────────────");

// Check for async/await issues
const tutorChatMatch = geminContent.match(/static async chatWithTutor[\s\S]*?\n  \}/);
if (tutorChatMatch) {
  const methodContent = tutorChatMatch[0];
  
  if (methodContent.includes('await')) {
    console.log("✅ Using await for async operations");
  } else {
    console.log("❌ Not using await for async operations");
  }
  
  if (methodContent.includes('this.model')) {
    console.log("✅ Using this.model properly");
  } else {
    console.log("⚠️ Not using this.model");
  }
}

console.log("\n4️⃣ Common Issues Checklist:");
console.log("─────────────────────────────────────────");
console.log("[ ] GEMINI_API_KEY is valid");
console.log("[ ] GoogleGenerativeAI package is installed");
console.log("[ ] Network connection is available");
console.log("[ ] Rate limiting not exceeded");
console.log("[ ] Prompt is valid and complete");
console.log("[ ] Response parsing handles all cases");

console.log("\n════════════════════════════════════════════════════════════");
