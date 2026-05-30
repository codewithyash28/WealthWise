import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronRight, BrainCircuit, TrendingUp, PieChart, Sparkles, X } from "lucide-react";
import { cn } from "../lib/utils";
import { Logo } from "./Logo";

interface OnboardingProps {
  onComplete: (goal: string) => void;
  onClose: () => void;
}

const GOALS = [
  { 
    id: "inflation", 
    title: "Understand Inflation", 
    desc: "Learn how macro-economics erodes capital purchasing power.", 
    icon: <BrainCircuit className="w-5 h-5" />, 
    hash: "#macropulse",
    color: "text-accent-gold",
    bg: "bg-[#C5A880]/5"
  },
  { 
    id: "stocks", 
    title: "Learn Stock Trading", 
    desc: "Master behavior patterns with pop-culture simulated stocks.", 
    icon: <TrendingUp className="w-5 h-5" />, 
    hash: "#trendmarket",
    color: "text-accent-emerald",
    bg: "bg-[#10D9A0]/5"
  },
  { 
    id: "housing", 
    title: "Rent vs Buy", 
    desc: "Analyze lease calculations and real estate acquisitions.", 
    icon: <PieChart className="w-5 h-5" />, 
    hash: "#liveorlease",
    color: "text-accent-blue",
    bg: "bg-[#4A89FF]/5"
  },
  { 
    id: "defi", 
    title: "DeFi Basics", 
    desc: "Simulate decentralized liquidity pools and yield farm protocols.", 
    icon: <Sparkles className="w-5 h-5" />, 
    hash: "#mockyield",
    color: "text-[#E2C9A1]",
    bg: "bg-[#E2C9A1]/5"
  },
];

export function Onboarding({ onComplete, onClose }: OnboardingProps) {
  const [step] = useState(0);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-bg-primary/80 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-2xl bg-bg-card border border-white/[0.04] shadow-2xl rounded-3xl overflow-hidden relative backdrop-blur-xl"
      >
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-text-muted hover:text-text-primary transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-8 md:p-12 text-left">
          <AnimatePresence mode="wait">
            {step === 0 ? (
              <motion.div 
                key="step0"
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                className="space-y-6"
              >
                <div className="space-y-3">
                  <Logo size="lg" />
                  <h2 className="text-3xl md:text-4xl font-display font-medium text-text-primary leading-[1.2]">
                    Your journey to <span className="text-accent-gold italic font-semibold">financial mastery</span> starts here.
                  </h2>
                  <p className="text-text-secondary text-sm font-light leading-relaxed">We've built a suite of simulators to help you master elite wealth management. What would you like to learn first?</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  {GOALS.map((goal) => (
                    <button
                      key={goal.id}
                      onClick={() => {
                        onComplete(goal.hash);
                        onClose();
                      }}
                      className="flex items-start gap-4 p-5 rounded-2xl bg-white/[0.01] border border-white/[0.04] text-left hover:border-accent-gold/30 hover:bg-[#C5A880]/5 transition-all group duration-300 cursor-pointer"
                    >
                      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-white/[0.04]", goal.bg, goal.color)}>
                        {goal.icon}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-text-primary group-hover:text-accent-gold transition-colors">{goal.title}</h4>
                        <p className="text-[11px] text-text-secondary mt-1 leading-relaxed">{goal.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        <div className="px-8 py-5 bg-white/[0.01] border-t border-white/[0.04] flex items-center justify-between">
           <div className="flex gap-1.5">
              {[0].map((_, i) => (
                <div key={i} className={cn("h-1 rounded-full transition-all", step === i ? "w-6 bg-accent-gold" : "w-1 bg-border")} />
              ))}
           </div>
           <p className="text-[8px] font-bold text-text-muted uppercase tracking-[0.2em]">
             Step {step + 1} of 1
           </p>
        </div>
      </motion.div>
    </div>
  );
}
