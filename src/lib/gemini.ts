export async function getAIResponse(prompt: string, history: any = []) {
  try {
    const isJudgeMode = localStorage.getItem("ww_judge_mode") === "true";
    const res = await fetch("/api/gemini/insight", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, history, isJudgeMode })
    });
    if (!res.ok) {
      throw new Error(`HTTP error ${res.status}`);
    }
    const data = await res.json();
    return data.text || "";
  } catch (error) {
    console.error("Gemini Insight Proxy Error:", error);
    return "I'm sorry, I encountered an error retrieving insights. Standard offline simulations are still fully active.";
  }
}

export async function generateWealthAudit(user: any, budget: any) {
  try {
    const isJudgeMode = localStorage.getItem("ww_judge_mode") === "true";
    const res = await fetch("/api/gemini/audit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user, budget, isJudgeMode })
    });
    if (!res.ok) {
      throw new Error(`HTTP error ${res.status}`);
    }
    const data = await res.json();
    return data.text || "Unable to generate audit at this time.";
  } catch (error) {
    console.error("Gemini Audit Proxy Error:", error);
    return "The Wealth Architect is currently over capacity. Offline analytical projections remain functional.";
  }
}

// Retain signatures to ensure absolute type safety & no broken imports
export async function analyzeFinancialImage(base64Image: string, prompt: string) {
  return "AI Image Analysis is currently disabled on client. Execute through backend server pipeline assets.";
}

export async function getFastAIResponse(prompt: string) {
  return "AI response services are offline. Check server key registration.";
}
