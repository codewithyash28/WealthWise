import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.GEMINI_API_KEY || "";
const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

export async function getAIResponse(prompt: string, history: { role: "user" | "model", parts: { text: string }[] }[] = []) {
  if (!ai) return "AI Advisor is currently unavailable (Missing API Key).";
  try {
    const model = ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: history.length > 0 ? [...history, { role: "user", parts: [{ text: prompt }] }] : [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        systemInstruction: "You are the WealthWise AI Advisor, a world-class personal finance expert. Provide clear, actionable, and encouraging financial advice. Use formatting like bolding and bullet points for readability. Always include a disclaimer that this is for educational purposes and not professional financial advice.",
      }
    });
    const response = await model;
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "I'm sorry, I encountered an error. Please try again later.";
  }
}

export async function analyzeFinancialImage(base64Image: string, prompt: string) {
  if (!ai) return "Image analysis is currently unavailable (Missing API Key).";
  try {
    const model = ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: {
        parts: [
          { inlineData: { mimeType: "image/jpeg", data: base64Image } },
          { text: prompt }
        ]
      }
    });
    const response = await model;
    return response.text;
  } catch (error) {
    console.error("Gemini Image Analysis Error:", error);
    return "I couldn't analyze the image. Please ensure it's a clear financial document or chart.";
  }
}

export async function getFastAIResponse(prompt: string) {
  if (!ai) return "Fast AI response is currently unavailable (Missing API Key).";
  try {
    const model = ai.models.generateContent({
      model: "gemini-3.1-flash-lite-preview",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });
    const response = await model;
    return response.text;
  } catch (error) {
    console.error("Gemini Lite Error:", error);
    return "Error getting fast response.";
  }
}
