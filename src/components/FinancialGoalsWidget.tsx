import React, { useState } from "react";
import { motion } from "motion/react";
import { 
  Target, 
  Home, 
  Car, 
  GraduationCap, 
  PiggyBank, 
  Plus, 
  CheckCircle2, 
  Sparkles, 
  PlusCircle, 
  ArrowUpRight,
  ShieldCheck,
  Calendar
} from "lucide-react";
import { UserProfile, FinancialGoal } from "../types";
import { formatCurrency, cn } from "../lib/utils";
import { CURRENCIES } from "../constants";

interface FinancialGoalsWidgetProps {
  user: UserProfile;
  onUpdateProfile?: (updated: UserProfile) => void;
}

export function FinancialGoalsWidget({ user, onUpdateProfile }: FinancialGoalsWidgetProps) {
  const currency = CURRENCIES[user.currency] || CURRENCIES.USD;
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [depositGoalId, setDepositGoalId] = useState<string | null>(null);
  const [depositAmountInput, setDepositAmountInput] = useState<string>("");

  // New Goal Modal state
  const [newTitle, setNewTitle] = useState("");
  const [newTarget, setNewTarget] = useState("50000");
  const [newCategory, setNewCategory] = useState<FinancialGoal["category"]>("HOUSE");
  const [newDeadline, setNewDeadline] = useState("2028-12-31");

  const goalsList: FinancialGoal[] = (user.goals && user.goals.length > 0)
    ? user.goals
    : [
        {
          id: "goal_retire",
          title: "Early Retirement Nest Egg (FIRE)",
          targetAmount: 500000,
          currentAmount: 185000,
          deadline: "2042-12-31",
          category: "RETIREMENT",
        },
        {
          id: "goal_house",
          title: "Sovereign Penthouse Downpayment",
          targetAmount: 120000,
          currentAmount: 64000,
          deadline: "2029-06-30",
          category: "HOUSE",
        },
        {
          id: "goal_car",
          title: "EV Supercar Reserve Fund",
          targetAmount: 65000,
          currentAmount: 39000,
          deadline: "2027-09-30",
          category: "CAR",
        },
        {
          id: "goal_reserve",
          title: "6-Month Liquid Buffer Reserve",
          targetAmount: 30000,
          currentAmount: 24500,
          deadline: "2026-12-31",
          category: "OTHER",
        },
      ];

  const getCategoryIcon = (category: FinancialGoal["category"]) => {
    switch (category) {
      case "HOUSE":
        return <Home className="w-4 h-4 text-amber-400" />;
      case "CAR":
        return <Car className="w-4 h-4 text-cyan-400" />;
      case "EDUCATION":
        return <GraduationCap className="w-4 h-4 text-purple-400" />;
      case "RETIREMENT":
        return <PiggyBank className="w-4 h-4 text-emerald-400" />;
      default:
        return <Target className="w-4 h-4 text-blue-400" />;
    }
  };

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!depositGoalId) return;
    const amount = Number(depositAmountInput);
    if (isNaN(amount) || amount <= 0) return;

    const updatedGoals = goalsList.map((g) => {
      if (g.id === depositGoalId) {
        return {
          ...g,
          currentAmount: Math.min(g.targetAmount, g.currentAmount + amount),
        };
      }
      return g;
    });

    const updatedUser = {
      ...user,
      goals: updatedGoals,
    };

    if (onUpdateProfile) onUpdateProfile(updatedUser);

    window.dispatchEvent(
      new CustomEvent("ww-trigger-alert", {
        detail: {
          type: "success",
          title: "Goal Allocation Saved! 🎯",
          message: `Added ${formatCurrency(amount, user.currency, currency.locale)} towards goal progress!`,
        },
      })
    );

    setDepositGoalId(null);
    setDepositAmountInput("");
  };

  const handleAddGoalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newGoalObj: FinancialGoal = {
      id: "goal_" + Date.now(),
      title: newTitle.trim(),
      targetAmount: Number(newTarget) || 10000,
      currentAmount: 0,
      deadline: newDeadline || "2028-12-31",
      category: newCategory,
    };

    const updatedGoals = [...goalsList, newGoalObj];
    const updatedUser = {
      ...user,
      goals: updatedGoals,
    };

    if (onUpdateProfile) onUpdateProfile(updatedUser);

    window.dispatchEvent(
      new CustomEvent("ww-trigger-alert", {
        detail: {
          type: "success",
          title: "Financial Goal Created! 🚀",
          message: `Added "${newGoalObj.title}" to your active goals dashboard.`,
        },
      })
    );

    setIsAddingGoal(false);
    setNewTitle("");
  };

  return (
    <div id="goals" className="card p-6 md:p-8 space-y-6 border-accent-gold/40 bg-bg-secondary/90 shadow-2xl relative overflow-hidden">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-accent-gold/15 text-accent-gold border border-accent-gold/30 text-[10px] font-mono font-bold uppercase tracking-wider">
            <Target className="w-3.5 h-3.5" /> Target Allocation Tracker
          </div>
          <h3 className="text-xl font-extrabold font-display text-text-primary tracking-tight mt-1">
            Financial Goals & Milestone Progress
          </h3>
          <p className="text-xs text-text-secondary mt-0.5">
            Visual breakdown of active saving milestones and completion percentages.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddingGoal(true)}
          className="px-4 py-2 bg-accent-gold hover:bg-accent-gold/90 text-bg-void text-xs font-mono font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-md shrink-0"
        >
          <Plus className="w-4 h-4" /> Add Goal
        </button>
      </div>

      {/* Goals Grid with Progress Bars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {goalsList.map((goal) => {
          const pct = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
          const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);

          return (
            <div
              key={goal.id}
              className="p-5 bg-bg-void/90 border border-border/80 hover:border-accent-gold/40 rounded-2xl space-y-4 transition-all shadow-lg group relative overflow-hidden"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-bg-secondary border border-border/80 shrink-0">
                    {getCategoryIcon(goal.category)}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-text-primary group-hover:text-accent-gold transition-colors">
                      {goal.title}
                    </h4>
                    <div className="flex items-center gap-2 text-[10px] font-mono text-text-muted mt-0.5">
                      <span className="uppercase text-accent-gold font-bold">{goal.category}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-text-muted" /> Target: {goal.deadline}
                      </span>
                    </div>
                  </div>
                </div>

                <span
                  className={cn(
                    "px-2.5 py-1 rounded-full text-xs font-mono font-bold border shrink-0",
                    pct >= 100
                      ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
                      : pct >= 50
                      ? "bg-amber-500/15 border-amber-500/30 text-amber-300"
                      : "bg-blue-500/15 border-blue-500/30 text-blue-300"
                  )}
                >
                  {pct}%
                </span>
              </div>

              {/* Progress Bar Container */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-text-primary font-bold">
                    {formatCurrency(goal.currentAmount, user.currency, currency.locale)}
                  </span>
                  <span className="text-text-muted">
                    Target: {formatCurrency(goal.targetAmount, user.currency, currency.locale)}
                  </span>
                </div>

                <div className="w-full h-3 rounded-full bg-bg-secondary overflow-hidden border border-border/60 p-0.5">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className={cn(
                      "h-full rounded-full transition-all",
                      pct >= 100
                        ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                        : pct >= 50
                        ? "bg-gradient-to-r from-amber-500 to-emerald-400"
                        : "bg-gradient-to-r from-purple-500 to-blue-400"
                    )}
                  />
                </div>

                <div className="flex justify-between items-center text-[10px] font-mono text-text-muted pt-0.5">
                  <span>{pct >= 100 ? "🎉 Milestone Reached!" : `Remaining: ${formatCurrency(remaining, user.currency, currency.locale)}`}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setDepositGoalId(goal.id);
                      setDepositAmountInput("1000");
                    }}
                    className="text-accent-gold hover:underline font-bold cursor-pointer"
                  >
                    + Contribute
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Contribute Deposit Modal */}
      {depositGoalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-950 border border-accent-gold/40 rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold font-display text-text-primary">Contribute to Goal</h3>
            <p className="text-xs text-text-secondary">Allocate capital to boost your milestone progress.</p>
            <form onSubmit={handleDepositSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-mono font-bold text-text-muted uppercase">Amount</label>
                <input
                  type="number"
                  value={depositAmountInput}
                  onChange={(e) => setDepositAmountInput(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-bg-void border border-border text-sm font-mono text-text-primary outline-none focus:border-accent-gold"
                  placeholder="1000"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDepositGoalId(null)}
                  className="px-4 py-2 rounded-xl bg-bg-secondary text-xs font-mono font-bold text-text-muted hover:text-text-primary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-accent-gold text-bg-void text-xs font-mono font-bold hover:bg-accent-gold/90"
                >
                  Save Contribution
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add New Goal Modal */}
      {isAddingGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-950 border border-accent-gold/40 rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold font-display text-text-primary">Create New Financial Goal</h3>
            <form onSubmit={handleAddGoalSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-mono font-bold text-text-muted uppercase">Goal Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-bg-void border border-border text-sm font-mono text-text-primary outline-none focus:border-accent-gold"
                  placeholder="e.g. World Travel Fund"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-mono font-bold text-text-muted uppercase">Target ({currency.symbol})</label>
                  <input
                    type="number"
                    required
                    value={newTarget}
                    onChange={(e) => setNewTarget(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-bg-void border border-border text-sm font-mono text-text-primary outline-none focus:border-accent-gold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono font-bold text-text-muted uppercase">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-bg-void border border-border text-xs font-mono text-text-primary outline-none focus:border-accent-gold"
                  >
                    <option value="HOUSE">House / Real Estate</option>
                    <option value="CAR">Car / Vehicle</option>
                    <option value="EDUCATION">Education / Career</option>
                    <option value="RETIREMENT">Retirement / FIRE</option>
                    <option value="OTHER">Other / Emergency</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono font-bold text-text-muted uppercase">Target Deadline</label>
                <input
                  type="date"
                  value={newDeadline}
                  onChange={(e) => setNewDeadline(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-bg-void border border-border text-sm font-mono text-text-primary outline-none focus:border-accent-gold"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingGoal(false)}
                  className="px-4 py-2 rounded-xl bg-bg-secondary text-xs font-mono font-bold text-text-muted hover:text-text-primary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-accent-gold text-bg-void text-xs font-mono font-bold hover:bg-accent-gold/90"
                >
                  Create Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
