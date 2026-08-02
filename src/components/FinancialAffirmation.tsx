import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Volume2, VolumeX, RefreshCw, Quote, Heart, Copy, Check, ShieldCheck } from "lucide-react";
import { cn } from "../lib/utils";

export interface AffirmationQuote {
  id: string;
  quote: string;
  author: string;
  category: "Mindset" | "Compounding" | "Discipline" | "Risk Management" | "Patience";
}

const WEALTH_AFFIRMATIONS: AffirmationQuote[] = [
  {
    id: "aff_1",
    quote: "The stock market is a device for transferring money from the impatient to the patient.",
    author: "Warren Buffett",
    category: "Patience"
  },
  {
    id: "aff_2",
    quote: "Wealth is what you don't see. It's the cars not purchased, the watches not worn, and the hard assets accumulated.",
    author: "Morgan Housel (The Psychology of Money)",
    category: "Mindset"
  },
  {
    id: "aff_3",
    quote: "Compound interest is the eighth wonder of the world. He who understands it, earns it; he who doesn't, pays it.",
    author: "Albert Einstein",
    category: "Compounding"
  },
  {
    id: "aff_4",
    quote: "Do not save what is left after spending, but spend what is left after saving.",
    author: "Warren Buffett",
    category: "Discipline"
  },
  {
    id: "aff_5",
    quote: "An investment in knowledge pays the best interest.",
    author: "Benjamin Franklin",
    category: "Mindset"
  },
  {
    id: "aff_6",
    quote: "The individual investor should act consistently as an investor and not as a speculator.",
    author: "Benjamin Graham (The Intelligent Investor)",
    category: "Risk Management"
  },
  {
    id: "aff_7",
    quote: "Wealth is not about having many possessions, but having few wants and abundant freedom.",
    author: "Epictetus / Stoic Wealth",
    category: "Mindset"
  },
  {
    id: "aff_8",
    quote: "Spend less than you make, invest the difference in productive assets, and wait with unshakeable discipline.",
    author: "Naval Ravikant",
    category: "Compounding"
  }
];

export function FinancialAffirmation() {
  const [currentIndex, setCurrentIndex] = useState<number>(() => {
    // Pick based on day of year
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    return dayOfYear % WEALTH_AFFIRMATIONS.length;
  });

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const activeQuote = WEALTH_AFFIRMATIONS[currentIndex];

  const handleNextQuote = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % WEALTH_AFFIRMATIONS.length);
      setIsGenerating(false);
      setIsCopied(false);
      setIsFavorited(false);
    }, 300);
  };

  const handleSpeakText = () => {
    if (!('speechSynthesis' in window)) {
      alert("SpeechSynthesis API is not supported in this browser environment.");
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const textToSay = `Daily Financial Affirmation. ${activeQuote.quote} Said by ${activeQuote.author}.`;
    const utterance = new SpeechSynthesisUtterance(textToSay);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleCopyQuote = () => {
    const text = `"${activeQuote.quote}" — ${activeQuote.author} (via WealthWise Elite)`;
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-5 border-accent-gold/40 bg-gradient-to-r from-bg-secondary/90 via-bg-primary to-bg-secondary/80 shadow-2xl relative overflow-hidden font-sans group"
    >
      {/* Background ambient accent */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-accent-gold/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
        <div className="flex items-start gap-3 flex-1">
          <div className="p-2.5 rounded-xl bg-accent-gold/20 text-accent-gold border border-accent-gold/30 shrink-0 mt-0.5 shadow-md">
            <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-accent-gold/20 text-accent-gold border border-accent-gold/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Quote className="w-3 h-3 text-amber-300" /> Daily Wealth Mindset Affirmation
              </span>
              <span className="text-[10px] font-mono text-text-muted bg-bg-void px-2 py-0.5 rounded-full border border-border">
                {activeQuote.category}
              </span>
            </div>

            <AnimatePresence mode="wait">
              <motion.blockquote
                key={activeQuote.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="text-sm font-semibold text-text-primary italic leading-relaxed pt-1"
              >
                "{activeQuote.quote}"
              </motion.blockquote>
            </AnimatePresence>

            <div className="text-xs font-mono font-bold text-accent-gold flex items-center gap-1.5 pt-0.5">
              <span>— {activeQuote.author}</span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center border-t sm:border-t-0 border-border/40 pt-2 sm:pt-0 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={handleSpeakText}
            className={cn(
              "p-2 rounded-xl border text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer shadow-sm",
              isSpeaking
                ? "bg-amber-500/20 text-amber-300 border-amber-500/50 ring-1 ring-amber-400"
                : "bg-bg-void text-text-muted hover:text-text-primary border-border hover:border-accent-gold/30"
            )}
            title={isSpeaking ? "Stop Voice Readout" : "Listen via SpeechSynthesis"}
          >
            {isSpeaking ? (
              <>
                <VolumeX className="w-4 h-4 text-amber-400 animate-bounce" />
                <span className="text-[10px] font-bold uppercase">Speaking</span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4 text-accent-gold" />
                <span className="text-[10px] font-bold uppercase hidden md:inline">Listen</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleCopyQuote}
            className="p-2 rounded-xl bg-bg-void border border-border text-text-muted hover:text-text-primary transition-all cursor-pointer"
            title="Copy Affirmation"
          >
            {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={handleNextQuote}
            disabled={isGenerating}
            className="px-3 py-2 rounded-xl bg-accent-gold/15 hover:bg-accent-gold/25 border border-accent-gold/40 text-accent-gold text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Generate Next Affirmation"
          >
            <RefreshCw className={cn("w-3.5 h-3.5", isGenerating && "animate-spin")} />
            <span className="text-[10px]">Refresh</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
