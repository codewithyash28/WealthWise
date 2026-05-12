import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronRight, Play, CheckCircle2, ShieldCheck, Trophy, Sparkles, X, Target } from "lucide-react";
import { cn } from "../lib/utils";
import { Logo } from "./Logo";

interface TourStep {
  title: string;
  desc: string;
  hash: string;
  highlight: string;
  icon: React.ReactNode;
}

const TOUR_STEPS: TourStep[] = [
  {
    title: "The Health Core",
    desc: "We start at the Wealth Mastery Dashboard. Here, elite metrics like Savings Rate and Health Score set the baseline.",
    hash: "#dashboard",
    highlight: "Overall Mastery",
    icon: <Target className="w-10 h-10 text-accent-gold" />
  },
  {
    title: "MacroPulse Engine",
    desc: "Next, we simulate global shifts. See how inflation erodes purchasing power in real-time.",
    hash: "#macropulse",
    highlight: "MacroPulse Engine",
    icon: <Sparkles className="w-10 h-10 text-accent-gold" />
  },
  {
    title: "TrendMarket Trading",
    desc: "Master market psychology with pop-culture stocks. DRIP, NEO, and more—virtual trading with zero risk.",
    hash: "#trendmarket",
    highlight: "TrendMarket",
    icon: <Play className="w-10 h-10 text-accent-emerald" />
  },
  {
    title: "LiveOrLease Engine",
    desc: "Visualize the biggest life decision. A 20-year projection comparing Renting vs. Buying wealth.",
    hash: "#liveorlease",
    highlight: "LiveOrLease",
    icon: <ShieldCheck className="w-10 h-10 text-accent-blue" />
  },
  {
    title: "Elite Achievements",
    desc: "Gamified mastery. Track your journey from Bronze to Diamond and unlock knowledge badges.",
    hash: "#badges",
    highlight: "Badges",
    icon: <Trophy className="w-10 h-10 text-accent-gold" />
  }
];

interface JudgeTourProps {
  onClose: () => void;
}

export function JudgeTour({ onClose }: JudgeTourProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const step = TOUR_STEPS[currentStep];

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
      window.location.hash = TOUR_STEPS[currentStep + 1].hash;
    } else {
      onClose();
    }
  };

  useEffect(() => {
    window.location.hash = TOUR_STEPS[0].hash;
  }, []);

  return (
    <div className="fixed inset-0 z-[200] pointer-events-none flex items-end justify-center p-8 pb-16">
      <div className="absolute inset-0 bg-bg-void/40 backdrop-blur-sm pointer-events-auto" onClick={onClose} />
      
      <motion.div 
        key={currentStep}
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 50, scale: 0.9 }}
        className="w-full max-w-xl bg-bg-card border border-accent-gold/50 shadow-[0_0_50px_rgba(240,180,41,0.2)] rounded-3xl p-8 pointer-events-auto relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-8 opacity-5">
           {step.icon}
        </div>

        <div className="flex gap-6 items-start">
           <div className="w-16 h-16 rounded-2xl bg-accent-gold/10 flex items-center justify-center shrink-0 text-accent-gold border border-accent-gold/20">
              {step.icon}
           </div>
           <div className="space-y-3 pr-8">
              <div className="flex items-center gap-2">
                 <Logo size="sm" />
                 <span className="text-[10px] text-text-muted font-mono">{step.hash}</span>
              </div>
              <h3 className="text-2xl font-bold">{step.title}</h3>
              <p className="text-text-secondary leading-relaxed">{step.desc}</p>
           </div>
        </div>

        <div className="flex items-center justify-between mt-8 pt-6 border-t border-border/50">
           <div className="flex gap-1.5">
              {TOUR_STEPS.map((_, i) => (
                <div key={i} className={cn("h-1.5 rounded-full transition-all", currentStep === i ? "w-8 bg-accent-gold" : "w-1.5 bg-border")} />
              ))}
           </div>
           <div className="flex items-center gap-4">
              <button onClick={onClose} className="text-xs font-bold text-text-muted hover:text-text-primary">Skip</button>
              <button 
                onClick={handleNext}
                className="px-6 py-2.5 bg-accent-gold text-bg-void font-bold rounded-xl flex items-center gap-2 hover:opacity-90 transition-all"
              >
                {currentStep === TOUR_STEPS.length - 1 ? "Finish Tour" : "Next Module"}
                <ChevronRight className="w-4 h-4" />
              </button>
           </div>
        </div>
      </motion.div>
    </div>
  );
}
