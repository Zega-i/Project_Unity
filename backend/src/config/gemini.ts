import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || "" });

export const getGeminiModel = () => {
  return groq.chat.completions;
};

export const getGeminiVisionModel = () => {
  return groq.chat.completions;
};
