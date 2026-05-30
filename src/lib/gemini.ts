import { GoogleGenAI, Type } from "@google/genai";

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
      return "I'm currently in 'offline mode' because the Gemini API key isn't set up. To enable my full AI capabilities, please add your GEMINI_API_KEY to the environment variables. In the meantime, remember that consistent saving and diversified investing are keys to long-term wealth!";
    }
    
    const modelResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: history.length > 0 ? [...history, { role: "user", parts: [{ text: prompt }] }] : [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        systemInstruction: "You are the WealthWise AI Advisor, a world-class personal finance expert. You have direct access to the user's MongoDB database through tools. If the user asks about their net worth, assets, liabilities, budget, transactions, or goals, or asks you to record a transaction or update a budget, you MUST use the corresponding tool to query or update the database. Provide clear, actionable, and encouraging financial advice based on real-time MongoDB data. Always include a disclaimer that this is for educational purposes and not professional financial advice.",
        tools: [{
          functionDeclarations: [
            {
              name: "getUserFinancialState",
              description: "Retrieves the user's full profile, assets, liabilities, net worth, budget details, and transaction history from the MongoDB database.",
            },
            {
              name: "recordTransaction",
              description: "Logs a new financial transaction (income, expense, asset, or liability) in the user's database. Automatically adjusts their net worth.",
              parameters: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING, enum: ["income", "expense", "asset", "liability"], description: "Type of transaction" },
                  category: { type: Type.STRING, description: "Category name e.g. Stocks, Student Loan, Salary, Rent" },
                  amount: { type: Type.NUMBER, description: "The numeric transaction amount" },
                  description: { type: Type.STRING, description: "Optional notes/description" }
                },
                required: ["type", "category", "amount"]
              }
            },
            {
              name: "updateBudget",
              description: "Creates or modifies the user's 50/30/20 budget allocations in the database.",
              parameters: {
                type: Type.OBJECT,
                properties: {
                  income: { type: Type.NUMBER, description: "Total monthly income" },
                  savings: { type: Type.NUMBER, description: "Allocated savings amount" },
                  needs: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        category: { type: Type.STRING },
                        amount: { type: Type.NUMBER }
                      },
                      required: ["category", "amount"]
                    }
                  },
                  wants: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        category: { type: Type.STRING },
                        amount: { type: Type.NUMBER }
                      },
                      required: ["category", "amount"]
                    }
                  }
                }
              }
            },
            {
              name: "updateFinancialGoals",
              description: "Updates the user's learning goal focus in their profile database.",
              parameters: {
                type: Type.OBJECT,
                properties: {
                  learningGoal: { type: Type.STRING, description: "The new learning goal or interest" }
                },
                required: ["learningGoal"]
              }
            }
          ]
        }]
      }
    });

    const functionCalls = modelResponse.functionCalls;
    if (functionCalls && functionCalls.length > 0) {
      const uid = localStorage.getItem("ww_uid");
      if (!uid) {
        return "I'd love to help you manage your MongoDB database, but you are currently signed in under 'local storage' mode. Please Sign in with Google to enable MongoDB database sync and unlock my full AI agency capabilities!";
      }

      const toolResults = [];
      
      for (const call of functionCalls) {
        try {
          const res = await fetch("/api/ai/tool-call", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              uid,
              toolName: call.name,
              arguments: call.args
            })
          });
          const result = await res.json();
          toolResults.push({
            functionResponse: {
              name: call.name,
              response: { result }
            }
          });
        } catch (err) {
          console.error(`Failed to execute AI tool ${call.name}:`, err);
          toolResults.push({
            functionResponse: {
              name: call.name,
              response: { error: "Failed to connect to database API." }
            }
          });
        }
      }

      // Send the tool execution output back to Gemini
      const followUpResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          ...(history.length > 0 ? history : [{ role: "user", parts: [{ text: prompt }] }]),
          { role: "model", parts: modelResponse.candidates?.[0]?.content?.parts || [] },
          { role: "user", parts: toolResults as any }
        ],
        config: {
          systemInstruction: "You are the WealthWise AI Advisor. Inform the user clearly and encouragingly about the actions you have performed in MongoDB based on the tool results returned."
        }
      });

      return followUpResponse.text;
    }

    return modelResponse.text;
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
