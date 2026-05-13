import { getGeminiModel } from "../config/gemini";

export class GeminiService {
  static async generateQuizFromText(text: string, count: number) {
    try {
      const model = getGeminiModel();

      const prompt = `Generate ${count} multiple choice quiz questions based on this text: ${text}. 
      Format as JSON array with objects containing: question, options (array of 4), correctAnswer (index).`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const content = response.text();

      return JSON.parse(content);
    } catch (error) {
      console.error("Error generating quiz:", error);
      throw error;
    }
  }

  static async chatWithTutor(message: string, context?: string) {
    try {
      const model = getGeminiModel();

      const prompt = context
        ? `As an education tutor, answer this question in context of: ${context}. Question: ${message}`
        : `As an education tutor, answer this question: ${message}`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error("Error chatting with tutor:", error);
      throw error;
    }
  }

  static async analyzeErrors(wrongAnswers: Array<{ question: string; answer: string; correct: string }>) {
    try {
      const model = getGeminiModel();

      const answersText = wrongAnswers
        .map((a) => `Question: ${a.question}, Given Answer: ${a.answer}, Correct: ${a.correct}`)
        .join("\n");

      const prompt = `Analyze these wrong answers and identify common error patterns:\n${answersText}\n
      Provide suggestions for improvement in JSON format with errorType and suggestion fields.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const content = response.text();

      return JSON.parse(content);
    } catch (error) {
      console.error("Error analyzing errors:", error);
      throw error;
    }
  }
}
