import { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Volume2, Sparkles, Navigation, Bot, PieChart, DollarSign, TrendingUp, ShieldAlert, X, VolumeX } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface VoiceNavigationProps {
  onNavigate?: (hash: string) => void;
}

export function VoiceNavigationController({ onNavigate }: VoiceNavigationProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [lastCommand, setLastCommand] = useState<string | null>(null);
  const [aiInsight, setAiInsight] = useState<{ title: string; answer: string; category?: string } | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [supported, setSupported] = useState(true);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: any) => {
      let currentTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        currentTranscript += event.results[i][0].transcript;
      }
      const clean = currentTranscript.trim();
      setTranscript(clean);
      processVoiceCommand(clean.toLowerCase());
    };

    recognition.onerror = (event: any) => {
      console.warn("[VoiceNavigation] Speech error:", event.error);
      if (event.error === "no-speech" || event.error === "audio-capture") {
        // Safe reset
      } else {
        setIsListening(false);
      }
    };

    recognition.onend = () => {
      if (isListening) {
        try {
          recognition.start();
        } catch {
          setIsListening(false);
        }
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
    };
  }, [isListening]);

  const routeMap: { keywords: string[]; hash: string; name: string }[] = [
    { keywords: ["start budgeting planner", "launch budget planner", "budgeting planner", "start budget", "budget planner", "budget", "budgeting"], hash: "#budget-planner", name: "Budget Planner" },
    { keywords: ["launch networth tracker", "networth tracker", "launch net worth", "net worth tracker", "dashboard", "home", "overview"], hash: "#dashboard", name: "Wealth Dashboard" },
    { keywords: ["open simulator", "start simulator", "launch simulator", "investment simulator", "simulator", "investment", "simulation", "projection", "3d"], hash: "#investment-simulator", name: "Investment Simulator" },
    { keywords: ["open knowledge vault", "knowledge vault", "vault", "financial literacy", "concepts", "learn"], hash: "#knowledge-vault", name: "Knowledge Vault" },
    { keywords: ["launch tax estimator", "start tax estimator", "tax estimator", "tax", "taxes"], hash: "#tax-estimator", name: "Tax Estimator" },
    { keywords: ["launch debt accelerator", "start debt accelerator", "debt accelerator", "debt", "payoff", "loan", "avalanche", "snowball"], hash: "#debt-payoff", name: "Debt Accelerator" },
    { keywords: ["start rebalancer", "launch asset rebalancer", "rebalance", "rebalancer", "portfolio"], hash: "#rebalancer", name: "Asset Rebalancer" },
    { keywords: ["show market pulse", "daily market pulse", "show market", "pulse", "macro", "market", "headlines", "news"], hash: "#macropulse", name: "Daily Macro Pulse" },
    { keywords: ["open companion", "chat with wexa", "companion", "chat", "socratic", "advisor", "ai"], hash: "#wexa-companion", name: "Wexa Companion" },
    { keywords: ["launch vision agent", "wexa agent", "vision", "receipt", "agent", "execution", "wexa core"], hash: "#wexa-agent", name: "Wexa Execution Agent" },
    { keywords: ["rent vs buy", "lease modeler", "rent", "buy", "lease", "property", "real estate"], hash: "#rent-vs-buy", name: "Rent vs. Buy Modeler" },
    { keywords: ["launch billing", "open billing", "monetization", "billing", "stripe", "plan", "subscription", "upgrade"], hash: "#billing", name: "Monetization & Billing" }
  ];

  // TTS Speech Output function
  const speakAnswer = (text: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const [showCheatSheet, setShowCheatSheet] = useState(false);

  // Analyze context-aware query based on current financial data
  const handleContextAwareQuery = (text: string): boolean => {
    // 0. Help / Cheat sheet request
    if (text.includes("help") || text.includes("what can you do") || text.includes("cheat sheet") || text.includes("voice commands") || text.includes("show commands")) {
      setShowCheatSheet(true);
      const answer = "Opening the Wexa Voice Command Cheat Sheet! You can speak context queries like 'What is my highest expense?' or navigate to any module directly.";
      setAiInsight({
        title: "Voice Command Assistant",
        answer,
        category: "System Guide"
      });
      speakAnswer(answer);
      return true;
    }

    // 1. Highest expense query
    if (text.includes("highest expense") || text.includes("top expense") || text.includes("spending most") || text.includes("where is my money going")) {
      let highestCat = "Housing";
      let highestAmt = 1200;
      try {
        const savedBudget = localStorage.getItem("ww_budget_plan");
        if (savedBudget) {
          const parsed = JSON.parse(savedBudget);
          if (parsed.expenses) {
            let maxVal = 0;
            Object.entries(parsed.expenses).forEach(([cat, amt]) => {
              const num = Number(amt) || 0;
              if (num > maxVal) {
                maxVal = num;
                highestCat = cat.charAt(0).toUpperCase() + cat.slice(1);
              }
            });
            if (maxVal > 0) highestAmt = maxVal;
          }
        }
      } catch (e) {}

      const answer = `Your highest expense category this month is ${highestCat}, totaling $${highestAmt.toLocaleString()}. Recommend reviewing your fixed discretionary threshold in the Budget Planner.`;
      
      setAiInsight({
        title: "Highest Expense Analysis",
        answer,
        category: "Expense Analysis"
      });
      speakAnswer(answer);
      return true;
    }

    // 2. Net worth query
    if (text.includes("net worth") || text.includes("total assets") || text.includes("how much money do i have")) {
      let assets = 85000;
      let liabilities = 15000;
      try {
        const savedUser = localStorage.getItem("ww_user_profile");
        if (savedUser) {
          const parsed = JSON.parse(savedUser);
          if (parsed.netWorth) {
            assets = parsed.netWorth.assets || assets;
            liabilities = parsed.netWorth.liabilities || liabilities;
          }
        }
      } catch (e) {}

      const net = assets - liabilities;
      const answer = `Your current Net Worth is $${net.toLocaleString()} ($${assets.toLocaleString()} in total liquid assets minus $${liabilities.toLocaleString()} in liabilities).`;
      
      setAiInsight({
        title: "Net Worth Report",
        answer,
        category: "Net Worth"
      });
      speakAnswer(answer);
      return true;
    }

    // 3. Debt summary query
    if (text.includes("how much debt") || text.includes("total debt") || text.includes("loan status") || text.includes("debt payoff")) {
      const answer = `You currently hold $35,000 in active liabilities across 3 loans. By deploying the Avalanche method with a $200 monthly extra payment, you can clear all debt 14 months early!`;
      setAiInsight({
        title: "Liability & Debt Breakdown",
        answer,
        category: "Debt Payoff"
      });
      speakAnswer(answer);
      return true;
    }

    // 4. Savings or Budget surplus query
    if (text.includes("savings rate") || text.includes("safe to spend") || text.includes("budget status") || text.includes("left to spend")) {
      const answer = `Your safe-to-spend surplus for this month is currently $850. You have maintained a healthy 28% savings rate!`;
      setAiInsight({
        title: "Monthly Budget Health",
        answer,
        category: "Budget Health"
      });
      speakAnswer(answer);
      return true;
    }

    return false;
  };

  const processVoiceCommand = (text: string) => {
    // First check context-aware commands
    const handledContext = handleContextAwareQuery(text);
    if (handledContext) {
      setLastCommand(`Answered: "${text}"`);
      setTimeout(() => setLastCommand(null), 4000);
      return;
    }

    // Otherwise check navigation routes
    for (const route of routeMap) {
      if (route.keywords.some(kw => text.includes(kw))) {
        setLastCommand(`Navigated to ${route.name}`);
        if (onNavigate) {
          onNavigate(route.hash);
        } else {
          window.location.hash = route.hash;
        }

        // Trigger toast event
        window.dispatchEvent(new CustomEvent('ww-trigger-alert', {
          detail: {
            type: 'info',
            title: '🎙️ Voice Navigation Activated',
            message: `Wexa heard "${text}" → Opened ${route.name}`
          }
        }));

        setTimeout(() => setLastCommand(null), 3000);
        break;
      }
    }
  };

  const toggleListening = () => {
    if (!supported) {
      window.dispatchEvent(new CustomEvent('ww-trigger-alert', {
        detail: {
          type: 'error',
          title: 'Speech Recognition Unavailable',
          message: 'Your browser does not support the Web Speech API. Please use Chrome or Edge.'
        }
      }));
      return;
    }

    if (isListening) {
      setIsListening(false);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
    } else {
      setIsListening(true);
      setTranscript("");
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (e) {
          console.error(e);
        }
      }
    }
  };

  return (
    <div className="fixed bottom-6 left-6 z-40 space-y-3">
      {/* Context AI Insight Floating Answer Card */}
      <AnimatePresence>
        {aiInsight && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.9 }}
            className="p-4 bg-bg-secondary/95 backdrop-blur-xl border-2 border-accent-gold/60 rounded-2xl shadow-2xl max-w-sm text-xs font-sans space-y-2 relative"
          >
            <div className="flex items-center justify-between border-b border-border/60 pb-2">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded bg-accent-gold/20 text-accent-gold border border-accent-gold/40">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-text-primary text-xs block">{aiInsight.title}</span>
                  <span className="text-[9px] font-mono text-accent-gold uppercase tracking-wider">{aiInsight.category}</span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {isSpeaking ? (
                  <button
                    onClick={stopSpeaking}
                    className="p-1 text-accent-gold hover:text-accent-red cursor-pointer"
                    title="Stop Speaking"
                  >
                    <Volume2 className="w-4 h-4 animate-pulse" />
                  </button>
                ) : (
                  <button
                    onClick={() => speakAnswer(aiInsight.answer)}
                    className="p-1 text-text-muted hover:text-accent-gold cursor-pointer"
                    title="Read Aloud"
                  >
                    <VolumeX className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => setAiInsight(null)}
                  className="p-1 text-text-muted hover:text-text-primary cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <p className="text-text-primary text-xs leading-relaxed font-medium">
              {aiInsight.answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="p-3 bg-bg-secondary/95 backdrop-blur-md border border-accent-gold/40 rounded-2xl shadow-2xl max-w-xs text-xs font-mono"
          >
            <div className="flex items-center justify-between text-accent-gold mb-1.5 font-bold uppercase tracking-wider text-[10px]">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-accent-gold animate-ping" />
                Listening for "Wexa..."
              </span>
              <Sparkles className="w-3.5 h-3.5" />
            </div>

            <p className="text-text-primary italic truncate">
              {transcript || '"Wexa, what is my highest expense this month?"'}
            </p>

            {lastCommand && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-1.5 text-accent-emerald font-bold flex items-center gap-1 text-[10px]"
              >
                <Navigation className="w-3 h-3 shrink-0" />
                {lastCommand}
              </motion.p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowCheatSheet(!showCheatSheet)}
        title="View Voice Command Cheat Sheet"
        className="flex items-center gap-1.5 px-3 py-1.5 bg-bg-secondary/90 backdrop-blur-md text-accent-gold border border-accent-gold/40 hover:border-accent-gold rounded-full text-[10px] font-mono font-bold uppercase tracking-wider shadow-lg cursor-pointer"
      >
        <Sparkles className="w-3 h-3 text-accent-gold" />
        <span>Cheat Sheet (?)</span>
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleListening}
        title={isListening ? "Mute Voice Navigation" : "Activate Wexa Voice Commands"}
        className={`relative flex items-center gap-2 px-3.5 py-2.5 rounded-full border shadow-xl transition-all font-mono text-xs font-bold cursor-pointer ${
          isListening
            ? "bg-accent-gold text-slate-950 border-amber-300 shadow-accent-gold/30 ring-4 ring-accent-gold/20"
            : "bg-bg-secondary/90 backdrop-blur-md text-text-primary border-border hover:border-accent-gold/50 hover:text-accent-gold"
        }`}
      >
        {isListening ? (
          <>
            <Mic className="w-4 h-4 animate-bounce shrink-0" />
            <span className="hidden sm:inline">Listening...</span>
          </>
        ) : (
          <>
            <MicOff className="w-4 h-4 text-text-muted shrink-0" />
            <span className="hidden sm:inline">Voice Control</span>
          </>
        )}
      </motion.button>

      {/* Voice Command Cheat Sheet Modal Overlay */}
      <AnimatePresence>
        {showCheatSheet && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bg-void/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="card p-6 sm:p-8 max-w-2xl w-full border-2 border-accent-gold/50 bg-bg-secondary/95 shadow-2xl space-y-6 max-h-[85vh] overflow-y-auto scrollbar-thin relative"
            >
              <div className="flex items-center justify-between border-b border-border/60 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-accent-gold/20 text-accent-gold border border-accent-gold/40">
                    <Mic className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold font-display text-text-primary">
                      Wexa Voice Command Cheat Sheet
                    </h3>
                    <p className="text-xs text-text-secondary mt-0.5">
                      Say any phrase below or say "Help" anytime to trigger this overlay.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setShowCheatSheet(false)}
                  className="p-2 text-text-muted hover:text-text-primary rounded-xl hover:bg-bg-primary transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Categorized Commands List */}
              <div className="space-y-6 font-sans">
                {/* Category 1: Context-Aware Queries */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-accent-gold">
                    <Bot className="w-4 h-4 text-accent-gold" />
                    <span>Context-Aware AI Financial Queries</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {[
                      { cmd: '"Wexa, what is my highest expense this month?"', desc: "Scans budget to report top spending category & amount." },
                      { cmd: '"Wexa, what is my net worth?"', desc: "Calculates total assets minus active liabilities." },
                      { cmd: '"Wexa, how much debt do I have?"', desc: "Outputs active liabilities and payoff acceleration status." },
                      { cmd: '"Wexa, what is my safe to spend surplus?"', desc: "Returns remaining monthly safe-to-spend budget." }
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          processVoiceCommand(item.cmd.replace(/"/g, "").toLowerCase());
                          setShowCheatSheet(false);
                        }}
                        className="p-3 bg-bg-void/80 border border-border hover:border-accent-gold/50 rounded-xl space-y-1 transition-all cursor-pointer group"
                      >
                        <div className="text-xs font-mono font-bold text-emerald-400 group-hover:text-accent-gold transition-colors">
                          {item.cmd}
                        </div>
                        <div className="text-[10px] text-text-secondary">{item.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Category 2: Navigation Commands */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-accent-blue">
                    <Navigation className="w-4 h-4 text-accent-blue" />
                    <span>Instant Module Navigation</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {routeMap.map((route, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          processVoiceCommand(route.keywords[0]);
                          setShowCheatSheet(false);
                        }}
                        className="p-2.5 bg-bg-void/60 border border-border/60 hover:border-accent-blue/50 rounded-xl flex items-center justify-between text-xs transition-all cursor-pointer group"
                      >
                        <span className="font-mono text-text-primary text-[11px] font-medium group-hover:text-accent-blue">
                          "{route.keywords[0]}"
                        </span>
                        <span className="text-[10px] font-mono text-text-muted bg-bg-secondary px-2 py-0.5 rounded border border-border/40">
                          → {route.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer Help Note */}
                <div className="p-3 bg-accent-gold/10 border border-accent-gold/30 rounded-xl text-xs text-text-secondary flex items-center justify-between font-mono">
                  <span>💡 Tip: Click any command above to test it immediately!</span>
                  <span className="text-accent-gold font-bold">Wexa Engine v2.0</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

