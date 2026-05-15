require('dotenv').config();
const Groq = require('groq-sdk');

(async () => {
  try {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    
    console.log("Fetching available Groq models...\n");
    const models = await groq.models.list();
    
    console.log("Available Groq Models:");
    console.log("─────────────────────────────────────");
    
    for (const model of models.data) {
      console.log(`✅ ${model.id} (Owner: ${model.owned_by})`);
    }
    
    console.log("\n" + "═".repeat(45));
    console.log("\nRECOMMENDED MODEL: llama-3.3-70b-versatile");
    console.log(`Current model in AIService.ts: llama-3.3-70b-versatile`);
    
  } catch (error) {
    console.log("Error listing models: " + error.message);
  }
})();
