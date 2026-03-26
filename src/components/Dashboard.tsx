import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { TrendingUp, Brain, Bot, PieChart, ArrowUpRight, ArrowDownRight, Flame, Calendar, Plus, Minus } from "lucide-react";
import { formatCurrency, cn } from "../lib/utils";
import { CURRENCIES } from "../constants";
import { UserProfile, BudgetPlan } from "../types";

import { MarketInsights } from "./MarketInsights";

interface DashboardProps {
  user: UserProfile;
  budget: BudgetPlan | null;
  onUpdateNetWorth: (assets: number, liabilities: number) => void;
}

export function Dashboard({ user, budget, onUpdateNetWorth }: DashboardProps) {
  const [assets, setAssets] = useState(user.netWorth.assets);
  const [liabilities, setLiabilities] = useState(user.netWorth.liabilities);
  const [isEditingNetWorth, setIsEditingNetWorth] = useState(false);

  const currency = CURRENCIES[user.currency] || CURRENCIES.USD;
  const netWorth = assets - liabilities;

  const calculateHealthScore = () => {
    let score = 0;
    if (budget) score += 20;
    if (budget) {
      const savingsRate = ((budget.income - Object.values(budget.expenses).reduce((a, b) => a + b, 0)) / budget.income) * 100;
      score += Math.min(20, (savingsRate / 20) * 20);
    }
    score += Math.min(20, (user.highScore / 250) * 20);
    if (user.netWorth.assets > 0) score += 15;
    score += Math.min(15, (user.visitDates.length / 3) * 15);
    // Simulator usage could be tracked, but let's assume +10 if they have a budget
    if (budget) score += 10;
    return Math.round(score);
  };

  const healthScore = calculateHealthScore();

  const getHealthGrade = (score: number) => {
    if (score >= 81) return { text: "Excellent Financial Health", color: "text-accent-emerald", border: "border-accent-emerald" };
    if (score >= 61) return { text: "Good Financial Health", color: "text-accent-gold", border: "border-accent-gold" };
    if (score >= 31) return { text: "Fair Financial Health", color: "text-accent-orange", border: "border-accent-orange" };
    return { text: "Needs Improvement", color: "text-accent-red", border: "border-accent-red" };
  };

  const healthGrade = getHealthGrade(healthScore);

  const savingsRate = budget ? Math.round(((budget.income - Object.values(budget.expenses).reduce((a, b) => a + b, 0)) / budget.income) * 100) : 0;
  const monthlyExpenses = budget ? Object.values(budget.expenses).reduce((a, b) => a + b, 0) : 0;
  const monthlySavings = budget ? budget.income - monthlyExpenses : 0;
  
  const yearsToFI = (budget && monthlySavings > 0) 
    ? Math.max(0, Math.round(((monthlyExpenses * 12 * 25) - netWorth) / (monthlySavings * 12)))
    : null;

  const dtiRatio = (budget && budget.income > 0)
    ? Math.round((liabilities / (budget.income * 12)) * 100) // Using total debt to annual income as a simplified DTI for dashboard
    : 0;

  return (
    <div className="container mx-auto px-6 py-12 space-y-12">
      {/* Welcome Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-display font-bold">
            Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 18 ? "afternoon" : "evening"}, {user.name}! 👋
          </h1>
          <p className="text-text-secondary mt-1">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="glass px-4 py-2 rounded-full flex items-center gap-2">
            <Flame className="w-5 h-5 text-accent-orange" />
            <span className="font-bold">{user.visitDates.length} Day Streak</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-accent-gold/20 flex items-center justify-center text-accent-gold font-bold border border-accent-gold/30">
            {user.name[0]}
          </div>
        </div>
      </div>

      {/* Market Insights Feature */}
      <MarketInsights />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-text-secondary text-sm font-medium">Monthly Savings Rate</div>
            <div className="w-8 h-8 rounded-lg bg-accent-emerald/10 flex items-center justify-center text-accent-emerald">
              <Plus className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <div className={cn("text-3xl font-mono font-bold", savingsRate >= 20 ? "text-accent-emerald" : savingsRate >= 10 ? "text-accent-gold" : "text-accent-red")}>
              {budget ? `${savingsRate}%` : "Fill Budget →"}
            </div>
            <div className="text-xs text-text-muted">▲ 3% vs last month</div>
          </div>
          <div className="h-1 bg-border rounded-full overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: `${savingsRate}%` }} className="h-full bg-accent-emerald" />
          </div>
        </div>

        <div className="card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-text-secondary text-sm font-medium">Net Worth Tracker</div>
            <button onClick={() => setIsEditingNetWorth(!isEditingNetWorth)} className="w-8 h-8 rounded-lg bg-accent-gold/10 flex items-center justify-center text-accent-gold hover:bg-accent-gold/20 transition-colors">
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-1">
            <div className="text-3xl font-mono font-bold text-accent-gold">
              {formatCurrency(netWorth, user.currency, currency.locale)}
            </div>
            <div className="text-xs text-text-muted">Assets - Liabilities</div>
          </div>
          {isEditingNetWorth && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="space-y-3 pt-2">
              <div className="flex items-center gap-2">
                <span className="text-xs text-text-muted w-16">Assets:</span>
                <input 
                  type="number" 
                  value={assets} 
                  onChange={(e) => setAssets(Number(e.target.value))}
                  className="bg-bg-secondary border border-border rounded px-2 py-1 text-xs w-full outline-none focus:border-accent-gold"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-text-muted w-16">Liabilities:</span>
                <input 
                  type="number" 
                  value={liabilities} 
                  onChange={(e) => setLiabilities(Number(e.target.value))}
                  className="bg-bg-secondary border border-border rounded px-2 py-1 text-xs w-full outline-none focus:border-accent-gold"
                />
              </div>
              <button onClick={() => { onUpdateNetWorth(assets, liabilities); setIsEditingNetWorth(false); }} className="btn-primary !py-1 !px-3 text-[10px] w-full">Save Changes</button>
            </motion.div>
          )}
        </div>

        <div className="card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-text-secondary text-sm font-medium">Years to FI</div>
            <div className="w-8 h-8 rounded-lg bg-accent-purple/10 flex items-center justify-center text-accent-purple">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-3xl font-mono font-bold text-accent-purple">
              {yearsToFI !== null ? `${yearsToFI} Years` : "Set Budget →"}
            </div>
            <div className="text-xs text-text-muted">Financial Independence</div>
          </div>
          <div className="h-1 bg-border rounded-full overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: yearsToFI !== null ? `${Math.max(5, 100 - (yearsToFI / 40) * 100)}%` : "0%" }} className="h-full bg-accent-purple" />
          </div>
        </div>

        <div className="card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-text-secondary text-sm font-medium">Debt-to-Income</div>
            <div className="w-8 h-8 rounded-lg bg-accent-red/10 flex items-center justify-center text-accent-red">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <div className={cn("text-3xl font-mono font-bold", dtiRatio <= 36 ? "text-accent-emerald" : dtiRatio <= 43 ? "text-accent-gold" : "text-accent-red")}>
              {dtiRatio}%
            </div>
            <div className="text-xs text-text-muted">Total Debt / Annual Income</div>
          </div>
          <div className="h-1 bg-border rounded-full overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(100, dtiRatio)}%` }} className={cn("h-full", dtiRatio <= 36 ? "bg-accent-emerald" : "bg-accent-red")} />
          </div>
        </div>

        <div className="card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-text-secondary text-sm font-medium">Quiz Best Score</div>
            <div className="w-8 h-8 rounded-lg bg-accent-blue/10 flex items-center justify-center text-accent-blue">
              <Brain className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-3xl font-mono font-bold text-accent-blue">
              {user.highScore} / 250
            </div>
            <div className="text-xs text-text-muted">Grade: {user.highScore >= 200 ? "Master" : user.highScore >= 150 ? "Pro" : user.highScore >= 100 ? "Student" : "Rookie"}</div>
          </div>
          <div className="h-1 bg-border rounded-full overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: `${(user.highScore / 250) * 100}%` }} className="h-full bg-accent-blue" />
          </div>
        </div>

        <div className="card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-text-secondary text-sm font-medium">Learning Streak</div>
            <div className="w-8 h-8 rounded-lg bg-accent-orange/10 flex items-center justify-center text-accent-orange">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-3xl font-mono font-bold text-accent-orange">
              {user.visitDates.length} Days
            </div>
            <div className="text-xs text-text-muted">Active Learning</div>
          </div>
          <div className="flex gap-1">
            {[...Array(7)].map((_, i) => (
              <div key={i} className={cn("flex-1 h-1 rounded-full", i < user.visitDates.length ? "bg-accent-orange" : "bg-border")} />
            ))}
          </div>
        </div>
      </div>

      {/* Financial Health Score */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 card p-8 flex flex-col items-center justify-center text-center space-y-6">
          <h3 className="text-xl font-bold">Financial Health Score</h3>
          <div className="relative w-48 h-48">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" className="text-border" />
              <motion.circle
                cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8"
                strokeDasharray="282.7"
                initial={{ strokeDashoffset: 282.7 }}
                animate={{ strokeDashoffset: 282.7 - (282.7 * healthScore) / 100 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className={cn(
                  healthScore >= 81 ? "text-accent-emerald" : healthScore >= 61 ? "text-accent-gold" : healthScore >= 31 ? "text-accent-orange" : "text-accent-red"
                )}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-mono font-bold">{healthScore}</span>
              <span className="text-text-muted text-sm">/ 100</span>
            </div>
          </div>
          <div className="space-y-1">
            <div className={cn("text-lg font-bold", healthGrade.color)}>{healthGrade.text}</div>
            <p className="text-text-secondary text-sm">Based on your activity and data</p>
          </div>
        </div>

        <div className="lg:col-span-2 card p-8 space-y-8">
          <h3 className="text-xl font-bold">Personalized Improvement Tips</h3>
          <div className="space-y-4">
            {!budget && (
              <div className="flex items-start gap-4 p-4 rounded-xl bg-accent-gold/5 border border-accent-gold/10">
                <div className="w-10 h-10 rounded-full bg-accent-gold/20 flex items-center justify-center shrink-0">📊</div>
                <div>
                  <div className="font-bold text-accent-gold">Complete your budget</div>
                  <p className="text-text-secondary text-sm">Unlock 20 more points by planning your monthly income and expenses.</p>
                </div>
              </div>
            )}
            {user.highScore < 150 && (
              <div className="flex items-start gap-4 p-4 rounded-xl bg-accent-blue/5 border border-accent-blue/10">
                <div className="w-10 h-10 rounded-full bg-accent-blue/20 flex items-center justify-center shrink-0">🧠</div>
                <div>
                  <div className="font-bold text-accent-blue">Improve your Financial IQ</div>
                  <p className="text-text-secondary text-sm">Take the quiz to test your knowledge and earn up to 20 more health points.</p>
                </div>
              </div>
            )}
            {savingsRate < 20 && budget && (
              <div className="flex items-start gap-4 p-4 rounded-xl bg-accent-emerald/5 border border-accent-emerald/10">
                <div className="w-10 h-10 rounded-full bg-accent-emerald/20 flex items-center justify-center shrink-0">💰</div>
                <div>
                  <div className="font-bold text-accent-emerald">Boost your savings rate</div>
                  <p className="text-text-secondary text-sm">Try to reach the 20% benchmark to maximize your wealth-building potential.</p>
                </div>
              </div>
            )}
            <div className="flex items-start gap-4 p-4 rounded-xl bg-accent-purple/5 border border-accent-purple/10">
              <div className="w-10 h-10 rounded-full bg-accent-purple/20 flex items-center justify-center shrink-0">🤖</div>
              <div>
                <div className="font-bold text-accent-purple">Consult the AI Advisor</div>
                <p className="text-text-secondary text-sm">Get personalized answers to your specific financial questions instantly.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <a href="#budget" className="card card-hover p-6 text-center space-y-3">
          <div className="w-12 h-12 bg-accent-gold/10 rounded-2xl flex items-center justify-center mx-auto text-accent-gold">
            <PieChart className="w-6 h-6" />
          </div>
          <div>
            <div className="font-bold">Budget Planner</div>
            <div className="text-[10px] text-text-muted uppercase tracking-wider">Analyze 50/30/20</div>
          </div>
        </a>
        <a href="#simulator" className="card card-hover p-6 text-center space-y-3">
          <div className="w-12 h-12 bg-accent-emerald/10 rounded-2xl flex items-center justify-center mx-auto text-accent-emerald">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <div className="font-bold">Simulator</div>
            <div className="text-[10px] text-text-muted uppercase tracking-wider">Compound Growth</div>
          </div>
        </a>
        <a href="#quiz" className="card card-hover p-6 text-center space-y-3">
          <div className="w-12 h-12 bg-accent-blue/10 rounded-2xl flex items-center justify-center mx-auto text-accent-blue">
            <Brain className="w-6 h-6" />
          </div>
          <div>
            <div className="font-bold">Take Quiz</div>
            <div className="text-[10px] text-text-muted uppercase tracking-wider">Test Knowledge</div>
          </div>
        </a>
        <a href="#advisor" className="card card-hover p-6 text-center space-y-3">
          <div className="w-12 h-12 bg-accent-purple/10 rounded-2xl flex items-center justify-center mx-auto text-accent-purple">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="font-bold">AI Advisor</div>
            <div className="text-[10px] text-text-muted uppercase tracking-wider">Instant Answers</div>
          </div>
        </a>
      </div>
    </div>
  );
}
