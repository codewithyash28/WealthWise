import { GoogleGenAI } from "@google/genai";

let aiInstance: GoogleGenAI | null = null;

function getAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  
  // If no API key is provided, or it's a placeholder, don't even try to initialize
  if (!apiKey || apiKey === "undefined" || apiKey === "null" || apiKey.length < 10) {
    return null;
  }

  if (!aiInstance) {
    try {
      aiInstance = new GoogleGenAI({ apiKey });
    } catch (error) {
      console.error("Failed to initialize GoogleGenAI:", error);
      return null;
    }
  }
  return aiInstance;
}

export async function getAIResponse(prompt: string, history: { role: "user" | "model", parts: { text: string }[] }[] = []) {
  try {
    const ai = getAI();
    if (!ai) {
      // Return a helpful mock response if AI is not configured
      return "I'm currently in 'offline mode' because the Gemini API key isn't set up. To enable my full AI capabilities, please add your GEMINI_API_KEY to the environment variables. In the meantime, remember that consistent saving and diversified investing are keys to long-term wealth!";
    }
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
  try {
    const ai = getAI();
    if (!ai) {
      return "AI image analysis is currently unavailable. Please check your API configuration.";
    }
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
  try {
    const ai = getAI();
    if (!ai) {
      return "Fast AI response is currently unavailable.";
    }
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

export async function generateWealthAudit(user: any, budget: any) {
  const ai = getAI();
  if (!ai) return "AI services are currently unavailable. Please check your configuration.";

  const prompt = `
    As a World-Class Personal Wealth Architect, perform a "One-Click AI Audit" for the following user:
    Name: ${user.name}
    Age: ${user.age}
    Learning Goals: ${user.learningGoal}
    Currency: ${user.currency}
    Net Worth: Assets ${user.netWorth.assets}, Liabilities ${user.netWorth.liabilities}
    Financial Literacy Score: ${user.highScore}/150
    Budget: ${budget ? JSON.stringify(budget) : "Not set up yet"}

    Provide a concise, high-impact financial roadmap in 3 sections:
    1. **Wealth Health Check**: A brutal but fair assessment of their current position, specifically considering their age group (${user.age}).
    2. **The Golden Path**: 3 specific, actionable steps to increase their net worth by 20% in 12 months, aligned with their goal of learning about ${user.learningGoal}.
    3. **Risk Mitigation**: One major blind spot they are currently ignoring based on their profile.

    Keep the tone professional, elite, and encouraging. Use Markdown formatting.
    Max 300 words.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        temperature: 0.7,
        topP: 0.95,
        topK: 40,
      }
    });
    return response.text || "Unable to generate audit at this time.";
  } catch (error) {
    console.error("Gemini Audit Error:", error);
    return "The Wealth Architect is currently over capacity. Please try again in a few moments.";
  }
}
