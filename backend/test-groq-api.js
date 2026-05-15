// Test if Groq API key is valid
require('dotenv').config();
const Groq = require('groq-sdk');

console.log("╔════════════════════════════════════════════════════════════╗");
console.log("║     Testing Groq API Key Validity                         ║");
console.log("╚════════════════════════════════════════════════════════════╝\n");

const apiKey = process.env.GROQ_API_KEY;

if (!apiKey) {
  console.log("❌ GROQ_API_KEY not found in environment");
  process.exit(1);
}

console.log("API Key: " + apiKey.substring(0, 10) + "..." + apiKey.substring(apiKey.length - 5) + "\n");

(async () => {
  try {
    console.log("1️⃣ Initializing Groq SDK...");
    const groq = new Groq({ apiKey });
    console.log("✅ Initialization successful\n");
    
    console.log("2️⃣ Sending test prompt to Llama-3.3-70b...");
    const testPrompt = "Kamu adalah AI Tutor. Jelaskan fotosintesis dalam 50 kata.";
    
    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: testPrompt }],
      model: "llama-3.3-70b-versatile",
    });
    
    const text = completion.choices[0]?.message?.content || "";
    
    console.log("✅ Groq responded successfully!\n");
    console.log("Response preview:");
    console.log(text.substring(0, 200) + (text.length > 200 ? "..." : ""));
    
    console.log("\n════════════════════════════════════════════════════════════");
    console.log("✅ Groq API Key is VALID and working correctly!");
    console.log("════════════════════════════════════════════════════════════");
    
  } catch (error) {
    console.log("❌ ERROR: " + error.message);
    console.log("\nPossible causes:");
    
    if (error.message.includes('401') || error.message.includes('unauthorized')) {
      console.log("  - Invalid API key (401 Unauthorized)");
    } else if (error.message.includes('429')) {
      console.log("  - Rate limit exceeded (429)");
    } else if (error.message.includes('500')) {
      console.log("  - Groq API server error (500)");
    } else {
      console.log("  - " + error.message);
    }
    
    process.exit(1);
  }
})();
