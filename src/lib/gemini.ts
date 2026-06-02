export async function getAIResponse(prompt: string, history: any = []) {
  try {
    const uid = localStorage.getItem("ww_uid");
    const res = await fetch("/api/gemini/insight", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, history, uid })
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
    const uid = localStorage.getItem("ww_uid");
    const res = await fetch("/api/gemini/audit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user, budget, uid })
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

export async function analyzeFinancialImage(base64Image: string, prompt: string) {
  try {
    const res = await fetch("/api/gemini/image-analysis", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ base64Image, prompt })
    });
    if (!res.ok) {
      throw new Error(`HTTP error ${res.status}`);
    }
    const data = await res.json();
    return data.text || "Unable to analyze image at this time.";
  } catch (error) {
    console.error("Gemini Image Analysis Proxy Error:", error);
    return "I couldn't analyze the image. Please ensure it's a clear financial document or chart.";
  }
}

export async function getFastAIResponse(prompt: string) {
  try {
    const res = await fetch("/api/gemini/fast", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt })
    });
    if (!res.ok) {
      throw new Error(`HTTP error ${res.status}`);
    }
    const data = await res.json();
    return data.text || "";
  } catch (error) {
    console.error("Gemini Fast Proxy Error:", error);
    return "AI response services are offline. Check server key registration.";
  }
}
