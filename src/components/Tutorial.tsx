import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, ChevronRight, ChevronLeft, Sparkles, Target, TrendingUp, ShieldCheck, Zap } from "lucide-react";
import { cn } from "../lib/utils";

interface TutorialStep {
  title: string;
  description: string;
  icon: React.ReactNode;
  feature: string;
}

const steps: TutorialStep[] = [
  {
    title: "Welcome to WealthWise Elite",
    description: "Your journey to financial freedom starts here. Let's take a quick tour of your new command center.",
    icon: <Sparkles className="w-8 h-8 text-accent-gold" />,
    feature: "Dashboard"
  },
  {
    title: "Wealth Architect",
    description: "Run a 'One-Click AI Audit' to get personalized insights and a Wealth Health Score based on your data.",
    icon: <Zap className="w-8 h-8 text-accent-gold" />,
    feature: "Dashboard"
  },
  {
    title: "Budget Architect",
    description: "Connect your bank or manually track expenses. Our AI categorizes your spending to find hidden savings.",
    icon: <Target className="w-8 h-8 text-accent-gold" />,
    feature: "Budget"
  },
  {
    title: "Investment Simulator",
    description: "Visualize the power of compound interest and track progress towards your life goals like retirement or a new home.",
    icon: <TrendingUp className="w-8 h-8 text-accent-gold" />,
    feature: "Simulator"
  },
  {
    title: "Scenario Planning",
    description: "What if you bought a house? Or took a sabbatical? Simulate life decisions and see their long-term impact.",
    icon: <ShieldCheck className="w-8 h-8 text-accent-gold" />,
    feature: "What-If"
  }
];

interface TutorialProps {
  onClose: () => void;
}

export function Tutorial({ onClose }: TutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const next = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const prev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="card max-w-lg w-full p-8 relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-bg-secondary">
          <motion.div 
            className="h-full bg-accent-gold"
            initial={{ width: 0 }}
            animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>

        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-text-muted hover:text-text-primary transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -20, opacity: 0 }}
            className="space-y-8 py-4"
          >
            <div className="w-16 h-16 rounded-2xl bg-bg-secondary flex items-center justify-center mx-auto">
              {steps[currentStep].icon}
            </div>

            <div className="text-center space-y-2">
              <div className="text-[10px] text-accent-gold uppercase tracking-[0.2em] font-bold">
                Step {currentStep + 1} of {steps.length} • {steps[currentStep].feature}
              </div>
              <h2 className="text-3xl font-display font-bold">{steps[currentStep].title}</h2>
              <p className="text-text-secondary leading-relaxed">
                {steps[currentStep].description}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="flex items-center justify-between pt-8">
          <button
            onClick={prev}
            disabled={currentStep === 0}
            className={cn(
              "flex items-center gap-2 text-sm font-bold transition-all",
              currentStep === 0 ? "opacity-0 pointer-events-none" : "text-text-muted hover:text-text-primary"
            )}
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </button>

          <div className="flex gap-1.5">
            {steps.map((_, i) => (
              <div 
                key={i}
                className={cn(
                  "w-1.5 h-1.5 rounded-full transition-all",
                  i === currentStep ? "bg-accent-gold w-4" : "bg-border"
                )}
              />
            ))}
          </div>

          <button
            onClick={next}
            className="btn-primary flex items-center gap-2 px-6"
          >
            {currentStep === steps.length - 1 ? "Get Started" : "Next"}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
