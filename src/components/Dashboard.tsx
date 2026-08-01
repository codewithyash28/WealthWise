import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { TrendingUp, Brain, Bot, PieChart, ArrowUpRight, ArrowDownRight, Flame, Calendar, Plus, Minus, Globe, RefreshCw, DollarSign } from "lucide-react";
import { PieChart as RechartsPieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from "recharts";
import { formatCurrency, cn } from "../lib/utils";
import { CURRENCIES } from "../constants";
import { UserProfile, BudgetPlan } from "../types";

import { MarketInsights } from "./MarketInsights";
import { Logo } from "./Logo";
import { WealthPathChart } from "./WealthPathChart";
import { OnboardingCarousel } from "./OnboardingCarousel";
import { EmergencyFundWidget } from "./EmergencyFundWidget";
import { LevelingSystem } from "./LevelingSystem";
import { DailyGoalTracker } from "./DailyGoalTracker";
import { FinancialRoadmap } from "./FinancialRoadmap";

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

  const [isInfiniteMode, setIsInfiniteMode] = useState(false);

  // Currency Converter Utility State
  const [selectedTargetCurrency, setSelectedTargetCurrency] = useState<string>("INR");

  // Simulated exchange rates relative to USD base
  const exchangeRatesVsUSD: Record<string, number> = {
    USD: 1.0,
    EUR: 0.92,
    GBP: 0.79,
    INR: 83.5,
    JPY: 155.2,
    CAD: 1.36,
    AUD: 1.52,
    AED: 3.67,
    BRL: 5.45,
    ZAR: 18.2
  };

  const convertAmount = (amountInUserCurrency: number, targetCurrCode: string) => {
    const userRateToUSD = exchangeRatesVsUSD[user.currency] || 1.0;
    const targetRateToUSD = exchangeRatesVsUSD[targetCurrCode] || 1.0;
    const amountInUSD = amountInUserCurrency / userRateToUSD;
    return amountInUSD * targetRateToUSD;
  };

  // Recharts Expense Doughnut Chart Data
  const defaultExpenseCategories = [
    { name: "Housing & Rent", value: 1400, color: "#F0B429" },
    { name: "Food & Groceries", value: 600, color: "#10B981" },
    { name: "Transportation", value: 350, color: "#06B6D4" },
    { name: "Health & Wellness", value: 250, color: "#3B82F6" },
    { name: "Entertainment & Leisure", value: 300, color: "#8B5CF6" },
    { name: "Debt Payments", value: 400, color: "#EC4899" },
    { name: "Other Expenses", value: 200, color: "#94A3B8" },
  ];

  const expenseChartData = budget && budget.expenses && Object.keys(budget.expenses).length > 0
    ? Object.entries(budget.expenses).map(([cat, val], idx) => {
        const colors = ["#F0B429", "#10B981", "#06B6D4", "#3B82F6", "#8B5CF6", "#EC4899", "#F97316", "#94A3B8"];
        const formattedName = cat.charAt(0).toUpperCase() + cat.slice(1).replace(/([A-Z])/g, ' $1');
        return {
          name: formattedName,
          value: Number(val) || 0,
          color: colors[idx % colors.length]
        };
      }).filter(item => item.value > 0)
    : defaultExpenseCategories;

  const totalExpenseAmount = expenseChartData.reduce((acc, curr) => acc + curr.value, 0);

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
    if (budget) score += 10;
    return Math.round(score);
  };

  const healthScore = isInfiniteMode ? 999999 : calculateHealthScore();

  const getHealthGrade = (score: number) => {
    if (score > 100) return { text: "Infinite Wealth Master ♾️", color: "text-accent-gold animate-pulse", border: "border-accent-gold" };
    if (score >= 81) return { text: "Excellent Financial Health", color: "text-accent-emerald", border: "border-accent-emerald" };
    if (score >= 61) return { text: "Good Financial Health", color: "text-accent-gold", border: "border-accent-gold" };
    if (score >= 31) return { text: "Fair Financial Health", color: "text-accent-orange", border: "border-accent-orange" };
    return { text: "Needs Improvement", color: "text-accent-red", border: "border-accent-red" };
  };

  const healthGrade = getHealthGrade(healthScore);

  const savingsRate = budget ? Math.round(((budget.income - Object.values(budget.expenses).reduce((a, b) => a + b, 0)) / budget.income) * 100) : 0;
  const monthlyExpenses = budget ? Object.values(budget.expenses).reduce((a, b) => a + b, 0) : totalExpenseAmount;
  const monthlySavings = budget ? budget.income - monthlyExpenses : 0;
  
  const yearsToFI = (budget && monthlySavings > 0) 
    ? Math.max(0, Math.round(((monthlyExpenses * 12 * 25) - netWorth) / (monthlySavings * 12)))
    : null;

  const dtiRatio = (budget && budget.income > 0)
    ? Math.round((liabilities / (budget.income * 12)) * 100)
    : 0;

  return (
    <div className="container mx-auto px-6 py-12 space-y-12">
      {/* Welcome Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-bg-secondary/20 p-8 rounded-3xl border border-border/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
           <Logo size="xl" />
        </div>
        <div className="space-y-4">
          <Logo size="md" />
          <div>
            <h1 className="text-4xl font-display font-bold">
              Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 18 ? "afternoon" : "evening"}, {user.name}! 👋
            </h1>
            <p className="text-text-secondary mt-1 font-medium">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
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

      {/* Onboarding Carousel */}
      <OnboardingCarousel />

      {/* Financial Roadmap Visualizer */}
      <FinancialRoadmap user={user} />

      {/* Daily Goal Tracker Widget */}
      <DailyGoalTracker user={user} />

      {/* Standalone Emergency Fund Buffer Widget */}
      <EmergencyFundWidget user={user} budget={budget} />

      {/* Gamified Wealth Tier Leveling System */}
      <LevelingSystem user={user} />

      {/* Market Insights Feature */}
      <MarketInsights />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <motion.div 
          initial={{ scale: 0.97, opacity: 0, y: 15 }}
          whileInView={{ scale: 1, opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="card p-6 space-y-4 hover:border-border-active hover:shadow-[0_0_20px_rgba(240,180,41,0.05)]"
        >
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
        </motion.div>

        <motion.div 
          initial={{ scale: 0.97, opacity: 0, y: 15 }}
          whileInView={{ scale: 1, opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="card p-6 space-y-4 hover:border-border-active hover:shadow-[0_0_20px_rgba(240,180,41,0.05)]"
        >
          <div className="flex items-center justify-between">
            <div className="text-text-secondary text-sm font-medium">Net Worth Tracker</div>
            <button onClick={() => setIsEditingNetWorth(!isEditingNetWorth)} className="w-8 h-8 rounded-lg bg-accent-gold/10 flex items-center justify-center text-accent-gold hover:bg-accent-gold/20 transition-colors cursor-pointer">
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
                  value={assets === 0 ? "" : assets} 
                  onChange={(e) => {
                    const parsed = Number(e.target.value);
                    setAssets(isNaN(parsed) ? 0 : Math.max(0, parsed));
                  }}
                  aria-label="Edit Assets"
                  className="bg-bg-secondary border border-border rounded px-2 py-1 text-xs w-full outline-none focus:border-accent-gold"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-text-muted w-16">Liabilities:</span>
                <input 
                  type="number" 
                  value={liabilities === 0 ? "" : liabilities} 
                  onChange={(e) => {
                    const parsed = Number(e.target.value);
                    setLiabilities(isNaN(parsed) ? 0 : Math.max(0, parsed));
                  }}
                  aria-label="Edit Liabilities"
                  className="bg-bg-secondary border border-border rounded px-2 py-1 text-xs w-full outline-none focus:border-accent-gold"
                />
              </div>
              <button onClick={() => { onUpdateNetWorth(assets, liabilities); setIsEditingNetWorth(false); }} className="btn-primary !py-1 !px-3 text-[10px] w-full cursor-pointer">Save Changes</button>
            </motion.div>
          )}
        </motion.div>

        <motion.div 
          initial={{ scale: 0.97, opacity: 0, y: 15 }}
          whileInView={{ scale: 1, opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="card p-6 space-y-4 hover:border-border-active hover:shadow-[0_0_20px_rgba(240,180,41,0.05)]"
        >
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
        </motion.div>

        <motion.div 
          initial={{ scale: 0.97, opacity: 0, y: 15 }}
          whileInView={{ scale: 1, opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="card p-6 space-y-4 hover:border-border-active hover:shadow-[0_0_20px_rgba(240,180,41,0.05)]"
        >
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
        </motion.div>

        <motion.div 
          initial={{ scale: 0.97, opacity: 0, y: 15 }}
          whileInView={{ scale: 1, opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.25 }}
          className="card p-6 space-y-4 hover:border-border-active hover:shadow-[0_0_20px_rgba(240,180,41,0.05)]"
        >
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
        </motion.div>

        <motion.div 
          initial={{ scale: 0.97, opacity: 0, y: 15 }}
          whileInView={{ scale: 1, opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="card p-6 space-y-4 hover:border-border-active hover:shadow-[0_0_20px_rgba(240,180,41,0.05)]"
        >
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
        </motion.div>
      </div>

      {/* SECTION: Expenses Breakdown Doughnut & Multi-Currency Converter */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Monthly Expenses Recharts Doughnut Chart */}
        <div className="card p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-border/60 pb-4">
            <div>
              <h3 className="text-lg font-bold font-display flex items-center gap-2">
                <PieChart className="w-5 h-5 text-accent-gold" /> Monthly Expense Breakdown
              </h3>
              <p className="text-xs text-text-muted mt-0.5">Category allocation based on budget tracking</p>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono text-text-muted uppercase block">Total Expenses</span>
              <span className="text-lg font-mono font-bold text-accent-red">
                {formatCurrency(totalExpenseAmount, user.currency, currency.locale)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            {/* Doughnut Chart Canvas */}
            <div className="h-[220px] relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={expenseChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {expenseChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="rgba(0,0,0,0.3)" />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: '#050812',
                      borderColor: 'rgba(240,180,41,0.3)',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontFamily: 'monospace'
                    }}
                    formatter={(val: number) => [formatCurrency(val, user.currency, currency.locale), "Expense"]}
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
              {/* Doughnut Center Label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] font-mono text-text-muted uppercase">Monthly</span>
                <span className="text-xs font-mono font-bold text-text-primary">
                  {formatCurrency(totalExpenseAmount, user.currency, currency.locale).split('.')[0]}
                </span>
              </div>
            </div>

            {/* Expense Categories Legend */}
            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
              {expenseChartData.map((cat) => {
                const percentage = totalExpenseAmount > 0 ? Math.round((cat.value / totalExpenseAmount) * 100) : 0;
                return (
                  <div key={cat.name} className="flex items-center justify-between p-2 rounded-xl bg-bg-secondary/60 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                      <span className="font-medium text-text-secondary truncate max-w-[110px]">{cat.name}</span>
                    </div>
                    <div className="text-right font-mono">
                      <span className="font-bold text-text-primary block">{formatCurrency(cat.value, user.currency, currency.locale)}</span>
                      <span className="text-[9px] text-text-muted block">{percentage}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Currency Converter Utility */}
        <div className="card p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-border/60 pb-4">
            <div>
              <h3 className="text-lg font-bold font-display flex items-center gap-2">
                <Globe className="w-5 h-5 text-accent-cyan" /> Multi-Currency Net Worth Converter
              </h3>
              <p className="text-xs text-text-muted mt-0.5">Instantly translate figures across global exchange rates</p>
            </div>
            <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-accent-cyan/10 border border-accent-cyan/30 text-accent-cyan font-bold">
              Live Rates
            </span>
          </div>

          <div className="space-y-4">
            {/* Quick Currency Selection Buttons */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono font-bold text-text-muted uppercase">Select Target Currency</label>
              <div className="flex flex-wrap gap-2">
                {Object.keys(exchangeRatesVsUSD).map((code) => (
                  <button
                    key={code}
                    onClick={() => setSelectedTargetCurrency(code)}
                    className={cn(
                      "px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all border cursor-pointer",
                      selectedTargetCurrency === code 
                        ? "bg-accent-cyan text-bg-void border-accent-cyan shadow-sm" 
                        : "bg-bg-secondary border-border hover:border-border-active text-text-secondary"
                    )}
                  >
                    {code === "INR" ? "🇮🇳 INR (₹)" : code === "USD" ? "🇺🇸 USD ($)" : code === "EUR" ? "🇪🇺 EUR (€)" : code === "GBP" ? "🇬🇧 GBP (£)" : code === "JPY" ? "🇯🇵 JPY (¥)" : code === "AED" ? "🇦🇪 AED" : code}
                  </button>
                ))}
              </div>
            </div>

            {/* Live Converted Breakdown Matrix */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="p-4 rounded-2xl bg-bg-secondary/70 border border-border space-y-1">
                <span className="text-[10px] font-mono text-text-muted uppercase block">Total Net Worth</span>
                <span className="text-base font-mono font-bold text-accent-gold block truncate">
                  {formatCurrency(convertAmount(netWorth, selectedTargetCurrency), selectedTargetCurrency, CURRENCIES[selectedTargetCurrency]?.locale || 'en-US')}
                </span>
                <span className="text-[9px] text-text-muted block">Base: {user.currency}</span>
              </div>

              <div className="p-4 rounded-2xl bg-bg-secondary/70 border border-border space-y-1">
                <span className="text-[10px] font-mono text-text-muted uppercase block">Assets</span>
                <span className="text-base font-mono font-bold text-accent-emerald block truncate">
                  {formatCurrency(convertAmount(assets, selectedTargetCurrency), selectedTargetCurrency, CURRENCIES[selectedTargetCurrency]?.locale || 'en-US')}
                </span>
                <span className="text-[9px] text-text-muted block">Converted</span>
              </div>

              <div className="p-4 rounded-2xl bg-bg-secondary/70 border border-border space-y-1">
                <span className="text-[10px] font-mono text-text-muted uppercase block">Liabilities</span>
                <span className="text-base font-mono font-bold text-accent-red block truncate">
                  {formatCurrency(convertAmount(liabilities, selectedTargetCurrency), selectedTargetCurrency, CURRENCIES[selectedTargetCurrency]?.locale || 'en-US')}
                </span>
                <span className="text-[9px] text-text-muted block">Converted</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-accent-cyan/5 border border-accent-cyan/20 text-[11px] text-text-secondary flex items-center justify-between">
              <span>Rate: 1 {user.currency} = {(convertAmount(100, selectedTargetCurrency) / 100).toFixed(4)} {selectedTargetCurrency}</span>
              <RefreshCw className="w-3.5 h-3.5 text-accent-cyan animate-spin-slow" />
            </div>
          </div>
        </div>
      </div>

      {/* Strategic Wealth Projections Chart */}
      <div className="card p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-display font-bold flex items-center gap-2 text-text-primary">
              <TrendingUp className="w-6 h-6 text-accent-gold" /> Strategic Wealth Projections
            </h2>
            <p className="text-text-secondary text-xs mt-1">
              Interactive 6-month predictive simulator. Toggle dynamic scenarios below to cross-evaluate performance trends.
            </p>
          </div>
          <div className="px-3 py-1 rounded bg-bg-secondary border border-border/60 text-[10px] font-bold uppercase tracking-wider text-text-muted">
            Baseline vs Scenario Comparison
          </div>
        </div>
        <WealthPathChart user={user} budget={budget} />
      </div>

      {/* Financial Health Score */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className={cn(
          "lg:col-span-1 card p-8 flex flex-col items-center justify-center text-center space-y-6 transition-all duration-500 relative overflow-hidden",
          isInfiniteMode && "border-accent-gold/50 shadow-[0_0_30px_rgba(240,180,41,0.25)] bg-gradient-to-b from-bg-secondary via-bg-secondary/40 to-accent-gold/5"
        )}>
          {isInfiniteMode && (
            <div className="absolute inset-0 bg-stars opacity-15 pointer-events-none" />
          )}
          <h3 className="text-xl font-bold flex items-center gap-1.5">
            Financial Health Score
            {isInfiniteMode && <span className="text-xs text-accent-gold animate-pulse">✨</span>}
          </h3>
          <div 
            onClick={() => {
              const newMode = !isInfiniteMode;
              setIsInfiniteMode(newMode);
              window.dispatchEvent(new CustomEvent('ww-trigger-alert', {
                detail: {
                  type: 'success',
                  title: newMode ? 'Infinite Mode Activated! ♾️' : 'Infinite Mode Deactivated',
                  message: newMode 
                    ? 'Congratulations! You have unlocked Infinite Wealth Score / 100.' 
                    : 'Restored standard Socratic financial calculations.'
                }
              }));
            }}
            className="relative w-48 h-48 cursor-pointer group active:scale-95 transition-all duration-300"
            title="Click to toggle Infinite Score Mode!"
          >
            <svg viewBox="0 0 100 100" className={cn("w-full h-full -rotate-90", isInfiniteMode && "animate-[spin_12s_linear_infinite]")}>
              <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" className="text-border" />
              <motion.circle
                cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8"
                strokeDasharray="282.7"
                initial={{ strokeDashoffset: 282.7 }}
                animate={{ strokeDashoffset: isInfiniteMode ? 0 : 282.7 - (282.7 * healthScore) / 100 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className={cn(
                  isInfiniteMode ? "text-accent-gold" : healthScore >= 81 ? "text-accent-emerald" : healthScore >= 61 ? "text-accent-gold" : healthScore >= 31 ? "text-accent-orange" : "text-accent-red"
                )}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={cn(
                "font-mono font-bold transition-all duration-300 select-none", 
                isInfiniteMode ? "text-6xl text-accent-gold drop-shadow-[0_0_15px_rgba(240,180,41,0.6)] animate-[pulse_1.5s_infinite]" : "text-5xl"
              )}>
                {isInfiniteMode ? "∞" : healthScore}
              </span>
              <span className="text-text-muted text-sm select-none">/ 100</span>
            </div>
            
            {/* Soft hint bubble on hover */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-bg-void/90 border border-border text-[9px] font-mono text-accent-gold px-2 py-0.5 rounded shadow-lg whitespace-nowrap z-10 pointer-events-none">
              Click to activate Infinite Mode!
            </div>
          </div>
          <div className="space-y-1">
            <div className={cn("text-lg font-bold transition-colors duration-300", healthGrade.color)}>{healthGrade.text}</div>
            <p className="text-text-secondary text-sm">
              {isInfiniteMode ? "Boundless monetary horizons unlocked" : "Based on your activity and data"}
            </p>
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
