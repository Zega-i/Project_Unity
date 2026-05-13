require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

(async () => {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    console.log("Fetching available models...\n");
    const models = await genAI.listModels();
    
    console.log("Available models for generateContent:");
    console.log("─────────────────────────────────────");
    
    let foundWorkingModel = null;
    
    for (const model of models.models) {
      const supportsGenerateContent = model.supportedGenerationMethods?.includes('generateContent');
      
      if (supportsGenerateContent) {
        console.log(`✅ ${model.name.replace('models/', '')}`);
        if (!foundWorkingModel) foundWorkingModel = model.name.replace('models/', '');
      }
    }
    
    console.log("\n" + "═".repeat(45));
    if (foundWorkingModel) {
      console.log(`\n✅ RECOMMENDED MODEL: ${foundWorkingModel}`);
      console.log(`\nTo fix: Update GeminiService.ts line 22:`);
      console.log(`FROM: const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });`);
      console.log(`TO:   const model = genAI.getGenerativeModel({ model: "${foundWorkingModel}" });`);
    }
    
  } catch (error) {
    console.log("Error listing models: " + error.message);
  }
})();
