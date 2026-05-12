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
    desc: "Learn how macro-economics impacts your savings.", 
    icon: <BrainCircuit className="w-6 h-6" />, 
    hash: "#macropulse",
    color: "text-accent-gold",
    bg: "bg-accent-gold/10"
  },
  { 
    id: "stocks", 
    title: "Learn Stock Trading", 
    desc: "Master market trends with virtual pop-culture stocks.", 
    icon: <TrendingUp className="w-6 h-6" />, 
    hash: "#trendmarket",
    color: "text-accent-emerald",
    bg: "bg-accent-emerald/10"
  },
  { 
    id: "housing", 
    title: "Rent vs Buy", 
    desc: "Calculate the real cost of housing and home ownership.", 
    icon: <PieChart className="w-6 h-6" />, 
    hash: "#liveorlease",
    color: "text-accent-blue",
    bg: "bg-accent-blue/10"
  },
  { 
    id: "defi", 
    title: "DeFi Basics", 
    desc: "Explore decentralized finance and staking strategies.", 
    icon: <Sparkles className="w-6 h-6" />, 
    hash: "#mockyield",
    color: "text-accent-purple",
    bg: "bg-accent-purple/10"
  },
];

export function Onboarding({ onComplete, onClose }: OnboardingProps) {
  const [step, setStep] = useState(0);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-bg-primary/80 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-2xl bg-bg-card border border-border shadow-2xl rounded-3xl overflow-hidden relative"
      >
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-text-muted hover:text-text-primary transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8 md:p-12">
          <AnimatePresence mode="wait">
            {step === 0 ? (
              <motion.div 
                key="step0"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="space-y-4">
                  <Logo size="lg" />
                  <h2 className="text-4xl font-display font-bold">Your journey to financial mastery starts here.</h2>
                  <p className="text-text-secondary text-lg">We've built a suite of simulators to help you master elite wealth management. What would you like to learn first?</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                  {GOALS.map((goal) => (
                    <button
                      key={goal.id}
                      onClick={() => {
                        onComplete(goal.hash);
                        onClose();
                      }}
                      className="flex items-start gap-4 p-5 rounded-2xl bg-bg-secondary/50 border border-border/50 text-left hover:border-accent-gold/50 hover:bg-bg-secondary transition-all group"
                    >
                      <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0", goal.bg, goal.color)}>
                        {goal.icon}
                      </div>
                      <div>
                        <h4 className="font-bold group-hover:text-accent-gold transition-colors">{goal.title}</h4>
                        <p className="text-xs text-text-muted mt-1 leading-relaxed">{goal.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        <div className="px-8 py-6 bg-bg-secondary/30 border-t border-border flex items-center justify-between">
           <div className="flex gap-1.5">
              {[0].map((_, i) => (
                <div key={i} className={cn("h-1.5 rounded-full transition-all", step === i ? "w-8 bg-accent-gold" : "w-1.5 bg-border")} />
              ))}
           </div>
           <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">
             Step {step + 1} of 1
           </p>
        </div>
      </motion.div>
    </div>
  );
}
