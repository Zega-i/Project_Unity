// Check if there are any async issues in AIService
const fs = require('fs');
const path = require('path');

const aiServicePath = path.join('D:', 'EduBridge', 'backend', 'src', 'services', 'AIService.ts');
const aiControllerPath = path.join('D:', 'EduBridge', 'backend', 'src', 'controllers', 'AIController.ts');

console.log("╔════════════════════════════════════════════════════════════╗");
console.log("║     Checking AI Tutor Implementation                       ║");
console.log("╚════════════════════════════════════════════════════════════╝\n");

// Check AIService
console.log("1️⃣ AIService.ts Analysis:");
console.log("─────────────────────────────────────────");

const aiServiceContent = fs.readFileSync(aiServicePath, 'utf-8');

if (aiServiceContent.includes('static async chatWithTutor')) {
  console.log("✅ chatWithTutor method exists");
  
  // Check for Groq
  if (aiServiceContent.includes('new Groq')) {
    console.log("✅ Groq initialization found");
  } else {
    console.log("❌ Groq initialization missing");
  }
  
  // Check for chat.completions.create
  if (aiServiceContent.includes('chat.completions.create')) {
    console.log("✅ chat.completions.create call found");
  } else {
    console.log("❌ chat.completions.create call missing");
  }
  
  // Check for proper error handling
  if (aiServiceContent.includes('catch (error)')) {
    console.log("✅ Error handling present");
  } else {
    console.log("❌ Error handling missing");
  }
  
  // Check for logger
  if (aiServiceContent.includes('logger.')) {
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
  
  // Check for AIService call
  if (aiContent.includes('AIService.chatWithTutor')) {
    console.log("✅ AIService.chatWithTutor call found");
  } else {
    console.log("❌ AIService.chatWithTutor call missing");
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
} else {
  console.log("❌ tutorChat method NOT FOUND");
}

console.log("\n3️⃣ Potential Issues:");
console.log("─────────────────────────────────────────");

// Check for async/await issues
const tutorChatMatch = aiServiceContent.match(/static async chatWithTutor[\s\S]*?\n  \}/);
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
console.log("[ ] GROQ_API_KEY is valid");
console.log("[ ] groq-sdk package is installed");
console.log("[ ] Network connection is available");
console.log("[ ] Rate limiting not exceeded");
console.log("[ ] Prompt is valid and complete");
console.log("[ ] Response parsing handles all cases");

console.log("\n════════════════════════════════════════════════════════════");
