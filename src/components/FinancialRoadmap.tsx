import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ShieldCheck, 
  CreditCard, 
  Calculator, 
  PieChart, 
  TrendingUp, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  Compass, 
  Award,
  ChevronRight
} from "lucide-react";
import { UserProfile } from "../types";
import { cn } from "../lib/utils";

interface FinancialRoadmapProps {
  user: UserProfile;
}

export interface RoadmapMilestone {
  id: string;
  stepNumber: number;
  title: string;
  category: string;
  description: string;
  targetMetric: string;
  toolName: string;
  hash: string;
  icon: any;
  status: "COMPLETED" | "IN_PROGRESS" | "RECOMMENDED";
  badgeText: string;
}

export function FinancialRoadmap({ user }: FinancialRoadmapProps) {
  const [activeStep, setActiveStep] = useState<string>("step_1");

  // Determine milestone completion states based on user data
  const milestones: RoadmapMilestone[] = [
    {
      id: "step_1",
      stepNumber: 1,
      title: "Build Emergency Buffer",
      category: "Foundation",
      description: "Secure 3 to 6 months of baseline liquid living expenses in a high-yield vault before investing.",
      targetMetric: "Target: $10,000 Liquid Buffer",
      toolName: "Budget & Emergency Fund Widget",
      hash: "#dashboard",
      icon: ShieldCheck,
      status: "IN_PROGRESS",
      badgeText: "Step 1: Liquidity"
    },
    {
      id: "step_2",
      stepNumber: 2,
      title: "Clear High-Interest Debt",
      category: "Liability Relief",
      description: "Deploy Avalanche strategy to extinguish toxic high-APR credit cards & personal loans early.",
      targetMetric: "Goal: $0 High-APR Debt",
      toolName: "Debt Payoff Accelerator",
      hash: "#debt-payoff",
      icon: CreditCard,
      status: "IN_PROGRESS",
      badgeText: "Step 2: Debt Free"
    },
    {
      id: "step_3",
      stepNumber: 3,
      title: "Optimize Pre-Tax Deductions",
      category: "Tax Efficiency",
      description: "Shield top salary brackets using 401(k), IRA, HSA, or 80C tax-advantaged vehicles.",
      targetMetric: "Goal: Up to 30% Tax Shield",
      toolName: "AI Tax Estimator & Advisor",
      hash: "#tax-estimator",
      icon: Calculator,
      status: "RECOMMENDED",
      badgeText: "Step 3: Tax Shield"
    },
    {
      id: "step_4",
      stepNumber: 4,
      title: "Core Asset Rebalancing",
      category: "Portfolio Allocation",
      description: "Align sector holdings (Tech, Bonds, REITs, Crypto) against your risk profile target weights.",
      targetMetric: "Goal: < 2% Target Slippage",
      toolName: "Asset Class Rebalancer",
      hash: "#rebalancer",
      icon: PieChart,
      status: "RECOMMENDED",
      badgeText: "Step 4: Rebalance"
    },
    {
      id: "step_5",
      stepNumber: 5,
      title: "Compound Wealth Acceleration",
      category: "Mastery",
      description: "Run multi-decade compound projections and rent vs buy real-estate scenario stress tests.",
      targetMetric: "Goal: Financial Freedom ($1M+)",
      toolName: "Investment Simulator",
      hash: "#investment-simulator",
      icon: TrendingUp,
      status: "RECOMMENDED",
      badgeText: "Step 5: Freedom"
    }
  ];

  const activeMilestone = milestones.find(m => m.id === activeStep) || milestones[0];
  const activeStepIndex = milestones.findIndex(m => m.id === activeStep);
  // Calculate percentage length of glowing line (e.g. Step 1 -> 20%, Step 5 -> 100%)
  const progressPercent = Math.min(100, Math.max(20, ((activeStepIndex + 1) / milestones.length) * 100));

  const handleMilestoneClick = (hash: string) => {
    window.location.hash = hash;
    window.dispatchEvent(new CustomEvent("ww-trigger-alert", {
      detail: {
        type: "info",
        title: "🚀 Roadmap Navigation",
        message: `Navigating directly to milestone tool: ${activeMilestone.toolName}`
      }
    }));
  };

  return (
    <div className="card p-6 sm:p-8 border-accent-gold/40 bg-gradient-to-br from-bg-secondary via-bg-primary to-bg-secondary/90 space-y-6 shadow-2xl relative overflow-hidden font-sans">
      {/* Background glow */}
      <div className="absolute top-0 left-1/3 w-96 h-96 bg-accent-gold/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-accent-gold/20 text-accent-gold border border-accent-gold/40 shadow-lg">
            <Compass className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold font-display text-text-primary">
                Financial Mastery Roadmap
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-accent-gold/20 border border-accent-gold/40 text-accent-gold text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-300" /> Step-By-Step Progression
              </span>
            </div>
            <p className="text-xs text-text-secondary mt-0.5">
              Click any milestone along your financial roadmap to open its dedicated wealth tool instantly.
            </p>
          </div>
        </div>

        <div className="text-xs font-mono text-text-muted bg-bg-void/80 px-3 py-1.5 rounded-xl border border-border/60 self-start sm:self-auto flex items-center gap-1.5">
          <Award className="w-4 h-4 text-emerald-400" />
          <span>Active Phase: <strong className="text-text-primary">{activeMilestone.title}</strong></span>
        </div>
      </div>

      {/* Linear Step-by-Step Path Bar with Glowing Animated Connector Line */}
      <div className="relative pt-2 pb-4">
        {/* Base Track Line */}
        <div className="absolute top-1/2 left-4 right-4 h-1.5 bg-border/80 -translate-y-1/2 z-0 hidden md:block rounded-full overflow-hidden">
          {/* Animated Self-Drawing Glowing Connector Line */}
          <motion.div
            initial={{ width: "20%" }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="h-full bg-gradient-to-r from-accent-gold via-amber-300 to-emerald-400 shadow-lg shadow-amber-500/50"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-3 relative z-10">
          {milestones.map((m, idx) => {
            const Icon = m.icon;
            const isSelected = m.id === activeStep;
            const isPassed = idx <= activeStepIndex;

            return (
              <motion.button
                key={m.id}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setActiveStep(m.id)}
                className={cn(
                  "p-3.5 rounded-2xl border transition-all text-left flex flex-col justify-between space-y-2 cursor-pointer relative overflow-hidden",
                  isSelected
                    ? "bg-accent-gold/20 border-accent-gold text-text-primary shadow-2xl shadow-amber-500/20 ring-2 ring-accent-gold/40"
                    : isPassed
                      ? "bg-bg-void/90 border-accent-gold/50 text-text-primary hover:border-accent-gold"
                      : "bg-bg-void/80 border-border/80 text-text-secondary hover:border-accent-gold/40 hover:text-text-primary"
                )}
              >
                {/* Step indicator badge */}
                <div className="flex items-center justify-between relative z-10">
                  <div className={cn(
                    "w-7 h-7 rounded-xl flex items-center justify-center font-mono font-black text-xs border shadow-sm transition-colors",
                    isSelected
                      ? "bg-accent-gold text-slate-950 border-amber-300 font-bold"
                      : isPassed
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                        : "bg-bg-secondary text-text-muted border-border"
                  )}>
                    0{m.stepNumber}
                  </div>

                  <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-accent-gold">
                    {m.category}
                  </span>
                </div>

                <div className="space-y-0.5 relative z-10">
                  <div className="text-xs font-bold font-display truncate flex items-center gap-1">
                    <Icon className={cn("w-3.5 h-3.5 shrink-0", isSelected ? "text-accent-gold" : isPassed ? "text-emerald-400" : "text-text-muted")} />
                    <span className="truncate">{m.title}</span>
                  </div>
                  <div className="text-[10px] font-mono text-text-muted truncate">{m.badgeText}</div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Selected Milestone Active Card with Framer Motion AnimatePresence */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeMilestone.id}
          initial={{ opacity: 0, y: 15, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -15, scale: 0.98 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="p-6 rounded-2xl bg-bg-void border-2 border-accent-gold/50 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xl relative overflow-hidden"
        >
          {/* Subtle top glowing bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent-gold via-amber-300 to-emerald-400" />

          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-accent-gold/20 text-accent-gold border border-accent-gold/40 text-[10px] font-mono font-bold uppercase">
                Milestone Step 0{activeMilestone.stepNumber}
              </span>
              <span className="text-xs font-mono text-emerald-400 font-bold">
                {activeMilestone.targetMetric}
              </span>
            </div>

            <h4 className="text-xl font-bold font-display text-text-primary">
              {activeMilestone.title}
            </h4>

            <p className="text-xs text-text-secondary leading-relaxed">
              {activeMilestone.description}
            </p>
          </div>

          <div className="shrink-0 space-y-2">
            <button
              onClick={() => handleMilestoneClick(activeMilestone.hash)}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-accent-gold hover:bg-amber-400 text-slate-950 font-mono text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer"
            >
              <span>Jump to {activeMilestone.toolName}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <div className="text-[10px] font-mono text-text-muted text-center">
              Clicking opens the dedicated module in 1-click
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
