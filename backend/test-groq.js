const Groq = require("groq-sdk").default;
require("dotenv").config();

async function testGroq() {
  console.log("╔════════════════════════════════════════════════════════════╗");
  console.log("║     Testing Groq API with llama-3.3-70b-versatile         ║");
  console.log("╚════════════════════════════════════════════════════════════╝\n");

  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

  try {
    console.log("1️⃣ Sending test message to Groq...");
    
    const message = await groq.chat.completions.create({
      messages: [{ role: "user", content: "Jelaskan fotosintesis dalam 50 kata" }],
      model: "llama-3.3-70b-versatile",
    });

    const response = message.choices[0]?.message?.content || "";
    
    console.log("✅ Groq responded successfully!\n");
    console.log("Response:");
    console.log(response);
    
    console.log("\n════════════════════════════════════════════════════════════");
    console.log("✅ Groq API is WORKING correctly!");
    console.log("════════════════════════════════════════════════════════════");

  } catch (error) {
    console.log("❌ ERROR: " + error.message);
    process.exit(1);
  }
}

testGroq();
