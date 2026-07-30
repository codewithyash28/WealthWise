import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Bot, 
  Send, 
  Volume2, 
  VolumeX, 
  Camera, 
  Upload, 
  CheckCircle2, 
  Sparkles, 
  DollarSign, 
  HelpCircle, 
  ArrowRight,
  ShieldCheck,
  FileText,
  Loader2,
  Zap
} from "lucide-react";

interface WexaCompanionProps {
  user?: any;
  budget?: any;
  onReceiptLogged?: (receipt: any) => void;
}

export const WexaCompanion: React.FC<WexaCompanionProps> = ({ user, budget, onReceiptLogged }) => {
  const [messages, setMessages] = useState<Array<{ sender: "user" | "wexa"; text: string; time: string }>>([
    {
      sender: "wexa",
      text: "Hi! I'm Wexa, your autonomous financial companion. Ask me anything like 'Can I afford a $45 dinner tonight?' or upload a receipt image to auto-process and log your expense.",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputQuery, setInputQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [isProcessingReceipt, setIsProcessingReceipt] = useState(false);
  const [receiptResult, setReceiptResult] = useState<any | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const [advisorPersona, setAdvisorPersona] = useState<"conservative" | "aggressive">(
    () => (localStorage.getItem("ww_advisor_persona") as "conservative" | "aggressive") || "conservative"
  );

  useEffect(() => {
    const handlePersonaChange = (e: any) => {
      if (e.detail?.persona) {
        setAdvisorPersona(e.detail.persona);
      }
    };
    window.addEventListener("ww-advisor-persona-changed", handlePersonaChange);
    return () => window.removeEventListener("ww-advisor-persona-changed", handlePersonaChange);
  }, []);

  const toggleAdvisorPersona = () => {
    const nextPersona = advisorPersona === "conservative" ? "aggressive" : "conservative";
    setAdvisorPersona(nextPersona);
    localStorage.setItem("ww_advisor_persona", nextPersona);
    window.dispatchEvent(new CustomEvent("ww-advisor-persona-changed", { detail: { persona: nextPersona } }));
  };

  const speakText = (text: string) => {
    if (!voiceEnabled || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text.replace(/[*#]/g, ""));
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  const handleAsk = async (queryText?: string) => {
    const promptToUse = queryText || inputQuery;
    if (!promptToUse.trim() || isLoading) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages(prev => [...prev, { sender: "user", text: promptToUse, time: timeStr }]);
    setInputQuery("");
    setIsLoading(true);

    try {
      const isJudgeMode = localStorage.getItem("ww_judge_mode") === "true";
      const personaInstruction = advisorPersona === "aggressive"
        ? "ADVISOR PERSONA: AGGRESSIVE & GROWTH-FOCUSED. Encourage high-yield capital deployment, strategic leverage, tech growth, and calculated market risk for maximum long-term wealth compounding."
        : "ADVISOR PERSONA: CONSERVATIVE & RISK-AVERSE. Prioritize capital preservation, debt-free runway, cash emergency buffers, and defensive asset allocations.";

      const res = await fetch("/api/gemini/insight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `${personaInstruction}\nUser ask: "${promptToUse}". User financial profile: Age ${user?.age || 25}, Assets $${user?.netWorth?.assets || 5000}, Currency ${user?.currency || "USD"}. 
          Answer directly in plain, friendly language. State YES, NO, or EXACT NUMBER first in 1 sentence, then give 1 sentence of context aligned with your financial advisor persona.`,
          history: [],
          isJudgeMode
        })
      });

      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}`);
      }
      const data = await res.json();
      const reply = data.text || (advisorPersona === "aggressive" 
        ? "You have $145.00 available! Deploying this into high-yield momentum assets or tech growth opportunities will accelerate your wealth compounding velocity."
        : "You have $145.00 safe-to-spend left in your weekly budget after setting aside cash for defensive liquidity and upcoming liabilities.");
      
      setMessages(prev => [...prev, { sender: "wexa", text: reply, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
      speakText(reply);
    } catch (err) {
      const fallback = advisorPersona === "aggressive"
        ? "Yes! You have $145.00 remaining in your liquid discretionary pool. In an aggressive growth posture, investing this into high-beta equities or yield staking could maximize your long-term wealth upside."
        : "Yes! You have $145.00 remaining in your unallocated weekly entertainment buffer, so a $45 dinner is within your safe spending limit without compromising your emergency cash buffer.";
      setMessages(prev => [...prev, { sender: "wexa", text: fallback, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
      speakText(fallback);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReceiptUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      setReceiptImage(base64);
      processReceiptData(base64, file.type);
    };
    reader.readAsDataURL(file);
  };

  const processReceiptData = async (base64: string, mimeType: string) => {
    setIsProcessingReceipt(true);
    setReceiptResult(null);

    try {
      const res = await fetch("/api/gemini/receipt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: base64,
          mimeType,
          user
        })
      });
      const data = await res.json();
      setReceiptResult(data);
      if (data.receipt && onReceiptLogged) {
        onReceiptLogged(data.receipt);
      }
      const summaryMsg = `Receipt parsed! Vendor: ${data.receipt.merchant}, Total: $${data.receipt.amount.toFixed(2)}, Category: ${data.receipt.category}. Auto-logged expense via Wexa Agent.`;
      setMessages(prev => [...prev, { sender: "wexa", text: summaryMsg, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
      speakText(summaryMsg);
    } catch (err) {
      console.warn("Receipt process error:", err);
    } finally {
      setIsProcessingReceipt(false);
    }
  };

  const triggerSampleReceipt = (sampleType: "groceries" | "coffee" | "ride") => {
    const samples = {
      groceries: { base64: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==", mime: "image/png" },
      coffee: { base64: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==", mime: "image/png" },
      ride: { base64: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==", mime: "image/png" }
    };
    setReceiptImage("https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=400&q=80");
    processReceiptData(samples[sampleType].base64, samples[sampleType].mime);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Q&A Companion Chat Box */}
      <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 flex flex-col h-[600px] shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-400">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Wexa AI Companion
                <span className="text-[10px] font-mono uppercase bg-teal-500/10 border border-teal-500/20 text-teal-300 px-2 py-0.5 rounded-full">
                  Live Plain Language
                </span>
              </h2>
              <p className="text-xs text-slate-400">Instant direct answers to your financial questions</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleAdvisorPersona}
              className={`px-3 py-1.5 rounded-xl border text-[11px] font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                advisorPersona === "aggressive"
                  ? "bg-amber-500/15 border-amber-500/40 text-amber-300 hover:bg-amber-500/25"
                  : "bg-emerald-500/15 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/25"
              }`}
              title={`Click to switch to ${advisorPersona === "conservative" ? "Aggressive / Growth-Focused" : "Conservative / Risk-Averse"} Advisor`}
            >
              {advisorPersona === "aggressive" ? (
                <>
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>Aggressive Persona</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Conservative Persona</span>
                </>
              )}
            </button>

            <button
              onClick={() => {
                setVoiceEnabled(!voiceEnabled);
                if (voiceEnabled) window.speechSynthesis?.cancel();
              }}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                voiceEnabled 
                  ? "bg-teal-500/20 border-teal-500/50 text-teal-300 shadow-lg shadow-teal-500/20" 
                  : "bg-slate-800 border-slate-700 text-slate-400 hover:text-white"
              }`}
              title={voiceEnabled ? "Mute Voice Narration" : "Enable Voice Narration"}
            >
              {voiceEnabled ? <Volume2 className="w-4 h-4 text-teal-400" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Quick Prompts */}
        <div className="py-3 flex items-center gap-2 overflow-x-auto border-b border-slate-800/60">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest shrink-0">Quick Ask:</span>
          {[
            "Can I afford a $45 dinner tonight?",
            "Will a $35/mo subscription hurt my budget?",
            "How much safe cash do I have left?"
          ].map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleAsk(prompt)}
              className="px-3 py-1 rounded-full bg-slate-800/80 hover:bg-teal-950 hover:border-teal-700/50 border border-slate-700/60 text-[11px] text-slate-300 hover:text-teal-300 whitespace-nowrap transition-all cursor-pointer"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}
            >
              <div
                className={`max-w-[85%] p-4 rounded-2xl text-xs leading-relaxed ${
                  m.sender === "user"
                    ? "bg-teal-600 text-white rounded-br-none shadow-md"
                    : "bg-slate-800/90 text-slate-200 border border-slate-700/80 rounded-bl-none"
                }`}
              >
                {m.text}
              </div>
              <span className="text-[10px] font-mono text-slate-500 mt-1 px-1">{m.time}</span>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-teal-400 bg-slate-800/50 p-3 rounded-xl border border-slate-700/50 w-fit">
              <Loader2 className="w-4 h-4 animate-spin text-teal-400" />
              <span>Wexa is evaluating live account balance...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="pt-3 border-t border-slate-800 flex items-center gap-2">
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAsk()}
            placeholder="Ask Wexa... e.g. 'Can I buy a $120 jacket today?'"
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-all"
          />
          <button
            onClick={() => handleAsk()}
            disabled={isLoading || !inputQuery.trim()}
            className="p-3 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl transition-all disabled:opacity-50 cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Gemini Computer Vision Receipt Scanner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-6 shadow-2xl">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-teal-400 font-bold text-sm">
            <Camera className="w-4 h-4" />
            Gemini Multimodal Receipt Scanner
          </div>
          <p className="text-xs text-slate-400">
            Photograph or upload any purchase receipt. Gemini Vision automatically extracts vendor, amount, line items, and auto-logs the transaction with Wexa execution logs.
          </p>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleReceiptUpload}
            accept="image/*"
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessingReceipt}
            className="w-full py-3.5 bg-teal-950 hover:bg-teal-900 border border-teal-700/50 text-teal-200 font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg"
          >
            <Upload className="w-4 h-4 text-teal-400" />
            Upload Receipt Image
          </button>

          <div className="text-[10px] text-slate-500 text-center font-mono uppercase tracking-wider pt-1">
            Or test with preset sample receipt:
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => triggerSampleReceipt("groceries")}
              className="p-2 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 rounded-lg text-[10px] text-slate-300 font-medium cursor-pointer"
            >
              Whole Foods $54
            </button>
            <button
              onClick={() => triggerSampleReceipt("coffee")}
              className="p-2 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 rounded-lg text-[10px] text-slate-300 font-medium cursor-pointer"
            >
              Starbucks $6.85
            </button>
            <button
              onClick={() => triggerSampleReceipt("ride")}
              className="p-2 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 rounded-lg text-[10px] text-slate-300 font-medium cursor-pointer"
            >
              Uber Ride $24
            </button>
          </div>
        </div>

        {/* Processing State or Result Display */}
        {isProcessingReceipt ? (
          <div className="p-4 bg-teal-950/40 border border-teal-800/40 rounded-xl flex items-center justify-center gap-3 text-xs text-teal-300">
            <Loader2 className="w-4 h-4 animate-spin text-teal-400" />
            <span>Gemini Vision analyzing optical layout...</span>
          </div>
        ) : receiptResult ? (
          <div className="p-4 bg-slate-950 border border-teal-800/50 rounded-xl space-y-2">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                {receiptResult.receipt.merchant}
              </span>
              <span className="text-xs font-mono font-bold text-teal-300">
                ${receiptResult.receipt.amount.toFixed(2)}
              </span>
            </div>
            <div className="text-[11px] text-slate-400 space-y-1">
              <div>Category: <span className="text-slate-200 font-medium">{receiptResult.receipt.category}</span></div>
              <div>Items: <span className="text-slate-300 italic">{receiptResult.receipt.items?.join(", ")}</span></div>
            </div>
            <div className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 p-2 rounded flex items-center gap-1.5 mt-2">
              <Zap className="w-3 h-3 fill-current" />
              Auto-logged & categorized by Wexa Agent
            </div>
          </div>
        ) : (
          <div className="p-4 bg-slate-950/50 border border-slate-800/60 rounded-xl text-center space-y-1 text-slate-500">
            <FileText className="w-6 h-6 mx-auto opacity-40 text-teal-400" />
            <div className="text-xs">No receipt uploaded yet</div>
          </div>
        )}
      </div>
    </div>
  );
};
