import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Compass, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  Sparkles, 
  PieChart, 
  Bot, 
  TrendingUp, 
  Layers, 
  Trophy, 
  X,
  ArrowRight
} from "lucide-react";
import { cn } from "../lib/utils";

export interface OnboardingStep {
  id: string;
  stepNumber: number;
  title: string;
  moduleName: string;
  hashLink: string;
  description: string;
  icon: React.ReactNode;
  badge: string;
  color: string;
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: "step_budget",
    stepNumber: 1,
    title: "Configure Monthly Budget Plan",
    moduleName: "Budget Planner Engine",
    hashLink: "#dashboard",
    description: "Establish your monthly net income, categorize fixed & discretionary liabilities, and calculate your safe-to-spend buffer.",
    icon: <PieChart className="w-8 h-8 text-amber-400" />,
    badge: "Essential Baseline",
    color: "from-amber-500/20 via-bg-secondary to-bg-primary"
  },
  {
    id: "step_wexa",
    stepNumber: 2,
    title: "Scan Receipts & Socratic Q&A",
    moduleName: "Wexa Companion AI",
    hashLink: "#wexa-companion",
    description: "Upload paper receipts for Gemini Vision auto-categorization or ask Wexa Socratic questions like 'Can I afford a $45 dinner tonight?'.",
    icon: <Bot className="w-8 h-8 text-teal-400" />,
    badge: "Multimodal AI",
    color: "from-teal-500/20 via-bg-secondary to-bg-primary"
  },
  {
    id: "step_scenario",
    stepNumber: 3,
    title: "Macro Stress-Testing",
    moduleName: "Scenario Simulator",
    hashLink: "#dashboard",
    description: "Simulate interest rate hikes, inflation spikes, and economic downturns to test your portfolio's resilience over a 30-year horizon.",
    icon: <TrendingUp className="w-8 h-8 text-cyan-400" />,
    badge: "Risk Defense",
    color: "from-cyan-500/20 via-bg-secondary to-bg-primary"
  },
  {
    id: "step_rebalance",
    stepNumber: 4,
    title: "Asset Allocation Rebalancing",
    moduleName: "Asset Rebalancer",
    hashLink: "#rebalancer",
    description: "Align target portfolio weights across Stocks, Bonds, Cash, and High-Yield assets to eliminate structural asset drift.",
    icon: <Layers className="w-8 h-8 text-purple-400" />,
    badge: "Portfolio Growth",
    color: "from-purple-500/20 via-bg-secondary to-bg-primary"
  },
  {
    id: "step_leveling",
    stepNumber: 5,
    title: "Complete Quests & Rank Up",
    moduleName: "Leveling System & Vault",
    hashLink: "#vault",
    description: "Earn XP by completing daily quests, unlock achievement badges, and climb the ranks toward WealthWise Elite status.",
    icon: <Trophy className="w-8 h-8 text-accent-gold" />,
    badge: "Gamified Mastery",
    color: "from-accent-gold/20 via-bg-secondary to-bg-primary"
  }
];

export const OnboardingCarousel: React.FC = () => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("ww_completed_onboarding_steps");
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });
  const [isDismissed, setIsDismissed] = useState<boolean>(() => {
    return localStorage.getItem("ww_onboarding_dismissed") === "true";
  });

  if (isDismissed) return null;

  const currentStep = ONBOARDING_STEPS[currentStepIndex];

  const handleNext = () => {
    if (currentStepIndex < ONBOARDING_STEPS.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const toggleStepCompletion = (stepId: string) => {
    setCompletedSteps(prev => {
      const next = prev.includes(stepId)
        ? prev.filter(id => id !== stepId)
        : [...prev, stepId];
      localStorage.setItem("ww_completed_onboarding_steps", JSON.stringify(next));
      return next;
    });
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem("ww_onboarding_dismissed", "true");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-6 border-accent-gold/40 bg-gradient-to-r from-bg-secondary/90 via-bg-primary to-bg-secondary/60 shadow-2xl relative overflow-hidden"
    >
      <div className="flex items-center justify-between border-b border-border/60 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-accent-gold/15 border border-accent-gold/30 text-accent-gold">
            <Compass className="w-5 h-5 animate-spin-slow" />
          </div>
          <div>
            <h3 className="text-base font-bold font-display text-text-primary flex items-center gap-2">
              Get Started: Wealth Journey Tour
              <span className="text-[10px] font-mono bg-accent-gold/15 text-accent-gold border border-accent-gold/30 px-2 py-0.5 rounded-full uppercase">
                {completedSteps.length}/{ONBOARDING_STEPS.length} Completed
              </span>
            </h3>
            <p className="text-xs text-text-secondary">
              Follow this logical sequence to configure your financial terminal.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleDismiss}
          className="text-text-muted hover:text-text-primary text-xs font-mono p-1 rounded-lg hover:bg-bg-void transition-colors cursor-pointer flex items-center gap-1"
          title="Dismiss Onboarding Carousel"
        >
          <span>Dismiss</span> <X className="w-4 h-4" />
        </button>
      </div>

      {/* Slide Content */}
      <div className="relative min-h-[170px] flex flex-col justify-between">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center"
          >
            <div className="sm:col-span-2 flex justify-center">
              <div className="p-5 rounded-2xl bg-bg-void border border-border shadow-xl flex items-center justify-center">
                {currentStep.icon}
              </div>
            </div>

            <div className="sm:col-span-7 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-accent-gold/20 text-accent-gold border border-accent-gold/30 px-2.5 py-0.5 rounded-full">
                  Step {currentStep.stepNumber} of 5
                </span>
                <span className="text-[10px] font-mono text-text-muted">
                  {currentStep.badge}
                </span>
              </div>

              <h4 className="text-lg font-bold text-text-primary">
                {currentStep.title}
              </h4>

              <p className="text-xs text-text-secondary leading-relaxed">
                {currentStep.description}
              </p>
            </div>

            <div className="sm:col-span-3 flex flex-col gap-2 justify-center">
              <a
                href={currentStep.hashLink}
                className="px-4 py-2.5 rounded-xl bg-accent-gold hover:bg-accent-gold/90 text-bg-void text-xs font-bold font-mono tracking-wider uppercase transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <span>Launch {currentStep.moduleName}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>

              <button
                type="button"
                onClick={() => toggleStepCompletion(currentStep.id)}
                className={cn(
                  "px-3 py-1.5 rounded-xl border text-[11px] font-mono transition-all cursor-pointer flex items-center justify-center gap-1.5",
                  completedSteps.includes(currentStep.id)
                    ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-400 font-bold"
                    : "bg-bg-void border-border text-text-muted hover:text-text-primary"
                )}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{completedSteps.includes(currentStep.id) ? "Marked Complete ✓" : "Mark as Complete"}</span>
              </button>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Controls & Step Dots */}
        <div className="flex items-center justify-between border-t border-border/40 pt-3 mt-4">
          <div className="flex items-center gap-1.5">
            {ONBOARDING_STEPS.map((step, idx) => (
              <button
                key={step.id}
                type="button"
                onClick={() => setCurrentStepIndex(idx)}
                className={cn(
                  "h-2 rounded-full transition-all cursor-pointer",
                  idx === currentStepIndex
                    ? "w-8 bg-accent-gold"
                    : completedSteps.includes(step.id)
                    ? "w-3 bg-emerald-400"
                    : "w-2 bg-border hover:bg-text-muted"
                )}
                title={`Jump to Step ${step.stepNumber}`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrev}
              disabled={currentStepIndex === 0}
              className="p-1.5 rounded-lg border border-border bg-bg-void text-text-muted hover:text-text-primary disabled:opacity-30 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono text-text-muted">
              {currentStepIndex + 1} / {ONBOARDING_STEPS.length}
            </span>
            <button
              type="button"
              onClick={handleNext}
              disabled={currentStepIndex === ONBOARDING_STEPS.length - 1}
              className="p-1.5 rounded-lg border border-border bg-bg-void text-text-muted hover:text-text-primary disabled:opacity-30 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
