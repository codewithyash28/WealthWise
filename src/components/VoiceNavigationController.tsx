import { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Volume2, Sparkles, Navigation } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface VoiceNavigationProps {
  onNavigate?: (hash: string) => void;
}

export function VoiceNavigationController({ onNavigate }: VoiceNavigationProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [lastCommand, setLastCommand] = useState<string | null>(null);
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
    { keywords: ["start budgeting planner", "launch budget planner", "budgeting planner", "start budget", "budget planner", "budget", "budgeting", "expense"], hash: "#budget-planner", name: "Budget Planner" },
    { keywords: ["launch networth tracker", "networth tracker", "launch net worth", "net worth tracker", "dashboard", "home", "overview", "net worth"], hash: "#dashboard", name: "Wealth Dashboard" },
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

  const processVoiceCommand = (text: string) => {
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
    <div className="fixed bottom-6 left-6 z-40">
      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="mb-3 p-3 bg-bg-secondary/95 backdrop-blur-md border border-accent-gold/40 rounded-2xl shadow-2xl max-w-xs text-xs font-mono"
          >
            <div className="flex items-center justify-between text-accent-gold mb-1.5 font-bold uppercase tracking-wider text-[10px]">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-accent-gold animate-ping" />
                Listening for "Wexa..."
              </span>
              <Sparkles className="w-3.5 h-3.5" />
            </div>

            <p className="text-text-primary italic truncate">
              {transcript || '"Wexa, show my budget"'}
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
        onClick={toggleListening}
        title={isListening ? "Mute Voice Navigation" : "Activate Wexa Voice Commands"}
        className={`relative flex items-center gap-2 px-3.5 py-2.5 rounded-full border shadow-xl transition-all font-mono text-xs font-bold ${
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
    </div>
  );
}
