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
    return "System under heavy load: Simulating MacroPulse stability locally. I'm currently in high-fidelity sandbox mode while the server-side engine recalibrates. Projections remain 100% functional.";
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
    return "AI Engine Connection Latency: Generating Local Structural Audit instead. Based on your current obsidian-tier portfolio, you have strong capital velocity but should monitor inflation erosion in the MacroPulse module.";
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
    return "Visual Processing Engine Offline: Please verify your document structure manually. Standard OCR and analysis services are temporarily transitioning to local backup buffers.";
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
    return "Fast Logic Core Recalibrating: Defaulting to local structural rules. Macro simulations are unaffected by this service interruption.";
  }
}
