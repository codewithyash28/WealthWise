import React from "react";
import { motion } from "motion/react";
import { 
  Trophy, 
  Target, 
  ShieldCheck, 
  CheckCircle2, 
  Flame, 
  TrendingUp, 
  Calendar, 
  ArrowRight,
  Sparkles,
  Award
} from "lucide-react";
import { formatCurrency, cn } from "../lib/utils";
import { CURRENCIES } from "../constants";
import { UserProfile, FinancialGoal } from "../types";

interface FinancialMilestonesProps {
  user: UserProfile;
  onUpdateGoals?: (goals: FinancialGoal[]) => void;
}

const DEFAULT_SYSTEM_MILESTONES = [
  {
    id: "m-emergency",
    title: "Essential Emergency Runway (6 Months)",
    category: "EMERGENCY_RESERVE",
    targetAmount: 300000,
    currentAmount: 180000,
    deadline: "Dec 2026",
    color: "from-amber-400 to-accent-gold",
    icon: ShieldCheck
  },
  {
    id: "m-debt-zero",
    title: "High-Interest Debt Elimination",
    category: "DEBT_REDUCTION",
    targetAmount: 150000,
    currentAmount: 125000,
    deadline: "Aug 2026",
    color: "from-cyan-400 to-blue-500",
    icon: Flame
  },
  {
    id: "m-index-portfolio",
    title: "Index DCA Foundation Portfolio",
    category: "INVESTMENT_WEALTH",
    targetAmount: 1000000,
    currentAmount: 640000,
    deadline: "Mar 2027",
    color: "from-emerald-400 to-teal-500",
    icon: TrendingUp
  },
  {
    id: "m-independence",
    title: "Trinity 4% Financial Sovereignty",
    category: "SOVEREIGNTY",
    targetAmount: 5000000,
    currentAmount: 1420000,
    deadline: "2032 Target",
    color: "from-purple-400 to-pink-500",
    icon: Award
  }
];

export function FinancialMilestones({ user, onUpdateGoals }: FinancialMilestonesProps) {
  const currency = CURRENCIES[user.currency] || CURRENCIES.USD;

  // Combine user goals with default milestone milestones
  const activeMilestones = user.goals && user.goals.length > 0 
    ? user.goals.map((g, idx) => ({
        id: g.id,
        title: g.title,
        targetAmount: g.targetAmount,
        currentAmount: g.currentAmount,
        deadline: g.deadline || "Active Target",
        color: idx % 4 === 0 ? "from-amber-400 to-accent-gold" : idx % 4 === 1 ? "from-cyan-400 to-blue-500" : idx % 4 === 2 ? "from-emerald-400 to-teal-500" : "from-purple-400 to-pink-500",
        icon: Target
      }))
    : DEFAULT_SYSTEM_MILESTONES;

  const totalTarget = activeMilestones.reduce((a, b) => a + b.targetAmount, 0);
  const totalCompleted = activeMilestones.reduce((a, b) => a + Math.min(b.currentAmount, b.targetAmount), 0);
  const overallProgress = Math.min(100, Math.round((totalCompleted / (totalTarget || 1)) * 100));

  return (
    <div className="card p-6 md:p-8 bg-gradient-to-br from-bg-secondary/90 via-bg-card to-bg-void border-border/80 space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-gold/10 border border-accent-gold/30 text-accent-gold text-xs font-mono font-bold uppercase tracking-wider">
            <Trophy className="w-3.5 h-3.5" />
            <span>Strategic Milestone Engine</span>
          </div>
          <h3 className="text-2xl font-display font-black text-text-primary">
            Financial Milestones & Goal Velocity
          </h3>
          <p className="text-xs md:text-sm text-text-secondary">
            Linear progress tracking against user-defined capital reserves, debt elimination, and independence targets.
          </p>
        </div>

        {/* Global Progress Gauge */}
        <div className="p-3.5 rounded-2xl bg-bg-void/80 border border-accent-gold/40 flex items-center gap-3 font-mono">
          <div className="text-right">
            <div className="text-[10px] text-text-muted uppercase">Cumulative Progress</div>
            <div className="text-xl font-black text-accent-gold">{overallProgress}%</div>
          </div>
          <div className="w-12 h-12 rounded-full border-2 border-accent-gold/30 flex items-center justify-center p-1 relative">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-bg-tertiary"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-accent-gold transition-all duration-1000"
                strokeDasharray={`${overallProgress}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <Sparkles className="w-4 h-4 text-accent-gold absolute" />
          </div>
        </div>
      </div>

      {/* Milestones Linear Bars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {activeMilestones.map((m, idx) => {
          const Icon = m.icon || Target;
          const pct = Math.min(100, Math.round((m.currentAmount / (m.targetAmount || 1)) * 100));
          const isComplete = pct >= 100;

          return (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="p-5 rounded-2xl bg-bg-void/70 border border-border/80 hover:border-accent-gold/40 transition-all space-y-3 relative group"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className={cn("p-2 rounded-xl bg-gradient-to-br text-slate-950 shadow-sm", m.color)}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-text-primary leading-tight">
                      {m.title}
                    </h4>
                    <div className="flex items-center gap-2 text-[11px] font-mono text-text-muted mt-0.5">
                      <Calendar className="w-3 h-3 text-text-muted" />
                      <span>{m.deadline}</span>
                    </div>
                  </div>
                </div>

                <span className={cn(
                  "px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider border shrink-0",
                  isComplete 
                    ? "bg-accent-emerald/10 border-accent-emerald/30 text-accent-emerald" 
                    : "bg-bg-secondary border-border text-text-secondary"
                )}>
                  {isComplete ? "Unlocked 🏆" : `${pct}%`}
                </span>
              </div>

              {/* Progress Track */}
              <div className="space-y-1.5 font-mono">
                <div className="w-full h-2.5 rounded-full bg-bg-tertiary overflow-hidden p-0.5 border border-border/50">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className={cn("h-full rounded-full bg-gradient-to-r shadow-sm", m.color)}
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-text-secondary pt-1">
                  <span>
                    Current: <strong className="text-text-primary">{formatCurrency(m.currentAmount, user.currency, currency.locale)}</strong>
                  </span>
                  <span>
                    Goal: <strong className="text-accent-gold">{formatCurrency(m.targetAmount, user.currency, currency.locale)}</strong>
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
