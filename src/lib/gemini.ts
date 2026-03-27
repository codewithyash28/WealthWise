import { GoogleGenAI } from "@google/genai";

// Support both Vite-style (import.meta.env) and process.env (for compatibility)
const getApiKey = () => {
  try {
    // @ts-ignore
    return (import.meta.env?.VITE_GEMINI_API_KEY || process.env?.GEMINI_API_KEY || "").trim();
  } catch {
    return "";
  }
};

const API_KEY = getApiKey();

// Ensure the API key is valid and not just the string "undefined" or "null"
const isValidKey = API_KEY && API_KEY !== "undefined" && API_KEY !== "null";
const ai = isValidKey ? new GoogleGenAI({ apiKey: API_KEY }) : null;

export const isAIAvailable = !!ai;

export async function getAIResponse(prompt: string, history: { role: "user" | "model", parts: { text: string }[] }[] = []) {
  if (!ai) return "AI Advisor is currently unavailable (Missing API Key).";
  try {
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: history.length > 0 ? [...history, { role: "user", parts: [{ text: prompt }] }] : [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        systemInstruction: "You are the WealthWise AI Advisor, a world-class personal finance expert. Provide clear, actionable, and encouraging financial advice. Use formatting like bolding and bullet points for readability. Always include a disclaimer that this is for educational purposes and not professional financial advice.",
      }
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "I'm sorry, I encountered an error. Please try again later.";
  }
}

export async function analyzeFinancialImage(base64Image: string, prompt: string) {
  if (!ai) return "Image analysis is currently unavailable (Missing API Key).";
  try {
    const response = await ai.models.generateContent({
      model: "gemini-1.5-pro",
      contents: [{
        role: "user",
        parts: [
          { inlineData: { mimeType: "image/jpeg", data: base64Image } },
          { text: prompt }
        ]
      }]
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Image Analysis Error:", error);
    return "I couldn't analyze the image. Please ensure it's a clear financial document or chart.";
  }
}

export async function getFastAIResponse(prompt: string) {
  if (!ai) return "Fast AI response is currently unavailable (Missing API Key).";
  try {
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Lite Error:", error);
    return "Error getting fast response.";
  }
}
