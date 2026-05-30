import { motion } from "motion/react";
import { TrendingUp, ShieldCheck, Target, BrainCircuit, ChevronRight, Sparkles, Wallet, PieChart, ArrowUpRight, ArrowDownRight, CheckCircle2, Info, Trophy } from "lucide-react";
import { UserProfile, BudgetPlan } from "../types";
import { formatCurrency, cn } from "../lib/utils";
import { CURRENCIES } from "../constants";
import { useMemo, useState } from "react";
import { generateWealthAudit } from "../lib/gemini";
import { WealthPathChart } from "./WealthPathChart";
import { MarketInsights } from "./MarketInsights";

interface WealthDashboardProps {
  user: UserProfile;
  budget: BudgetPlan | null;
  onUnlockAchievement: (id: string) => void;
}

export function WealthDashboard({ user, budget, onUnlockAchievement }: WealthDashboardProps) {
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState<string | null>(null);

  const currency = CURRENCIES[user.currency] || CURRENCIES.USD;

  const hasBudget = !!budget;
  const hasGoals = (user.goals || []).length > 0;
  const hasAudit = !!auditResult;

  const checklist = [
    { id: 'budget', label: 'Set Up Your Budget Architect', completed: hasBudget, hash: '#budget', desc: 'Define your income and primary expenditures.' },
    { id: 'goals', label: 'Define a Financial Goal', completed: hasGoals, hash: '#simulator', desc: 'What are you saving for?' },
    { id: 'audit', label: 'Run AI Wealth Audit', completed: hasAudit, hash: '#dashboard', desc: 'Get personalized AI insights.' },
  ];

  const isNewUser = !hasBudget || !hasGoals;

  const healthScore = useMemo(() => {
    let score = 0;
    
    // 1. Savings Rate (Max 40 points)
    if (budget) {
      const totalExpenses = Object.values(budget.expenses).reduce((a, b) => a + b, 0);
      const savingsRate = budget.income > 0 ? ((budget.income - totalExpenses) / budget.income) * 100 : 0;
      score += Math.min(40, (savingsRate / 20) * 40);
    }

    // 2. Financial Literacy (Max 30 points)
    score += Math.min(30, (user.highScore / 150) * 30);

    // 3. Emergency Fund (Max 15 points)
    const netWorth = user.netWorth.assets - user.netWorth.liabilities;
    const targetEF = currency.emergencyTarget;
    score += Math.min(15, (netWorth / targetEF) * 15);

    // 4. Debt Management (Max 15 points)
    const debtRatio = user.netWorth.assets > 0 ? user.netWorth.liabilities / user.netWorth.assets : 0;
    score += Math.max(0, 15 - (debtRatio * 30));

    return Math.round(score);
  }, [user, budget, currency]);

  const masteryTier = useMemo(() => {
    if (healthScore >= 80) return { label: 'Diamond', color: 'text-[#b9f2ff]', bg: 'bg-[#b9f2ff]/5', border: 'border-[#b9f2ff]/20' };
    if (healthScore >= 60) return { label: 'Platinum', color: 'text-[#e5e4e2]', bg: 'bg-[#e5e4e2]/5', border: 'border-[#e5e4e2]/20' };
    if (healthScore >= 40) return { label: 'Gold', color: 'text-accent-gold', bg: 'bg-accent-gold/5', border: 'border-accent-gold/20' };
    if (healthScore >= 20) return { label: 'Silver', color: 'text-[#c0c0c0]', bg: 'bg-[#c0c0c0]/5', border: 'border-[#c0c0c0]/20' };
    return { label: 'Bronze', color: 'text-[#cd7f32]', bg: 'bg-[#cd7f32]/5', border: 'border-[#cd7f32]/20' };
  }, [healthScore]);

  const handleRunAudit = async () => {
    setIsAuditing(true);
    try {
      const result = await generateWealthAudit(user, budget);
      setAuditResult(result);
      onUnlockAchievement('audit_elite');
    } catch (error) {
      console.error("Audit failed:", error);
    } finally {
      setIsAuditing(false);
    }
  };

  return (
    <div className="container mx-auto px-6 py-12 space-y-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-4 border-b border-white/[0.04]">
        <div className="space-y-2 text-left">
          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-display font-medium tracking-tight flex flex-wrap items-center gap-3"
          >
            <span>Welcome back,</span>
            <span className="text-accent-gold italic font-semibold">{user.name}</span>
            <div className={cn("inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-[0.15em] border backdrop-blur-md shadow-sm", masteryTier.bg, masteryTier.color, masteryTier.border)}>
              <Trophy className="w-3 h-3" /> {masteryTier.label} Tier
            </div>
          </motion.h1>
          <div className="flex items-center gap-4">
            <p className="text-text-secondary text-sm md:text-base font-light">Your Personal Wealth Architect is active.</p>
            <button 
              onClick={() => window.location.reload()} 
              className="text-[9px] text-accent-gold hover:underline font-bold uppercase tracking-widest"
            >
              Restart Tutorial
            </button>
          </div>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.02, y: -1 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleRunAudit}
          disabled={isAuditing}
          className="btn-primary flex items-center gap-2.5 px-6 py-3.5 text-[10px] font-bold uppercase tracking-widest group"
        >
          {isAuditing ? (
            <BrainCircuit className="w-4 h-4 animate-spin text-bg-void" />
          ) : (
            <Sparkles className="w-4 h-4 text-bg-void group-hover:scale-110 transition-transform" />
          )}
          {isAuditing ? "Analyzing Wealth..." : "One-Click AI Audit"}
        </motion.button>
      </div>

      {/* Elite Status Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { label: "Overall Mastery", value: `${healthScore}%`, color: "text-accent-gold" },
          { label: "Savings Rate", value: budget ? `${Math.round(((budget.income - Object.values(budget.expenses).reduce((a, b) => a + b, 0)) / budget.income) * 100)}%` : "0%", color: "text-accent-emerald" },
          { label: "Elite Tier", value: masteryTier.label, color: masteryTier.color },
          { label: "Achievements", value: `${user.achievements?.length || 0}/6`, color: "text-accent-blue" }
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="card p-6 border-white/[0.04] bg-white/[0.01] hover:bg-white/[0.03] flex flex-col items-center text-center space-y-1 transition-all"
          >
            <div className="text-[9px] text-text-muted font-bold uppercase tracking-[0.15em]">{stat.label}</div>
            <div className={cn("text-2xl font-display font-semibold", stat.color)}>{stat.value}</div>
          </motion.div>
        ))}
      </div>

      {/* Getting Started Checklist for New Users */}
      {isNewUser && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-8 border-accent-gold/10 bg-accent-gold/[0.02] space-y-6"
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1 text-left">
              <h2 className="text-xl font-display font-medium flex items-center gap-2 text-text-primary">
                <Sparkles className="w-5 h-5 text-accent-gold" /> Your Path to Wealth Elite
              </h2>
              <p className="text-text-secondary text-xs">Complete these baseline tasks to unlock your personalized financial audit recommendations.</p>
            </div>
            <div className="px-3.5 py-1.5 rounded-full bg-accent-gold/5 border border-accent-gold/15 text-accent-gold text-[9px] font-bold uppercase tracking-widest">
              {checklist.filter(i => i.completed).length} / {checklist.length} Completed
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {checklist.map((item) => (
              <a 
                key={item.id}
                href={item.hash}
                className={cn(
                  "p-5 rounded-2xl border transition-all flex flex-col gap-3 group text-left",
                  item.completed 
                    ? "bg-accent-emerald/[0.02] border-accent-emerald/10 opacity-70 hover:opacity-100" 
                    : "bg-white/[0.01] border-white/[0.04] hover:border-accent-gold/20 hover:bg-accent-gold/[0.03]"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className={cn(
                    "w-7 h-7 rounded-lg flex items-center justify-center transition-all",
                    item.completed ? "bg-accent-emerald/10 text-accent-emerald" : "bg-bg-primary border border-white/[0.06] text-text-muted group-hover:border-accent-gold/30"
                  )}>
                    {item.completed ? <CheckCircle2 className="w-4 h-4" /> : <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />}
                  </div>
                </div>
                <div>
                  <div className={cn("font-bold text-xs uppercase tracking-wide", item.completed ? "line-through text-text-muted" : "text-text-primary")}>{item.label}</div>
                  <p className="text-[10px] text-text-secondary leading-relaxed mt-1">{item.desc}</p>
                </div>
              </a>
            ))}
          </div>
        </motion.div>
      )}

      {/* Achievements Section */}
      {(user.achievements || []).length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-secondary flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-accent-gold" /> Elite Achievements
            </h3>
            <div className="flex items-center gap-4">
              {user.achievements && user.achievements.length < 6 && (
                <span className="text-[9px] text-text-muted italic">Simulate more modules to unlock next achievements...</span>
              )}
              <span className="text-[10px] text-accent-gold font-bold">{user.achievements?.length} / 6 Earned</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            {user.achievements?.map((achievement) => (
              <div 
                key={achievement.id}
                title={`${achievement.title}: ${achievement.description}`}
                className="group relative"
              >
                <div className="w-11 h-11 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-accent-gold/30 flex items-center justify-center text-xl transition-all duration-300 hover:scale-105 hover:bg-accent-gold/5 cursor-help shadow-sm">
                  {achievement.icon}
                </div>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 bg-bg-secondary border border-white/[0.06] rounded-xl text-[10px] text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10 shadow-xl">
                  <div className="font-bold text-accent-gold uppercase tracking-wider">{achievement.title}</div>
                  <div className="text-text-secondary mt-1 text-[9px] leading-relaxed">{achievement.description}</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Insights and Projection Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 card p-8 space-y-6 text-left">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-secondary flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-accent-gold" /> Strategic Wealth Pathing
            </h3>
            <div className="flex bg-white/[0.02] p-1 rounded-lg border border-white/[0.04]">
              <button className="px-3 py-1 text-[9px] font-bold bg-white/[0.04] text-accent-gold rounded-md shadow-sm uppercase tracking-wider">6M Projection</button>
            </div>
          </div>
          <WealthPathChart user={user} budget={budget} />
        </div>
        
        <div className="space-y-8">
          <MarketInsights />
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Health Score Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card p-8 flex flex-col items-center justify-center text-center space-y-6 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-4">
            <ShieldCheck className="w-6 h-6 text-accent-gold opacity-10" />
          </div>
          
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-secondary">Financial Health Score</h3>
          
          <div className="relative w-48 h-48 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <defs>
                <linearGradient id="goldGaugeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#E2C9A1" />
                  <stop offset="100%" stopColor="#9F8259" />
                </linearGradient>
              </defs>
              <circle
                cx="96"
                cy="96"
                r="84"
                stroke="currentColor"
                strokeWidth="4.5"
                fill="transparent"
                className="text-white/[0.02]"
              />
              <circle
                cx="96"
                cy="96"
                r="84"
                stroke="url(#goldGaugeGrad)"
                strokeWidth="5"
                fill="transparent"
                strokeDasharray={527.7}
                strokeDashoffset={527.7 - (527.7 * healthScore) / 100}
                className="transition-all duration-1000 ease-out"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-6xl font-display font-light text-text-primary tracking-tighter">{healthScore}</span>
              <span className="text-[8px] text-text-muted uppercase tracking-[0.2em] font-bold">Out of 100</span>
            </div>
          </div>

          <p className="text-xs text-text-secondary max-w-[200px] leading-relaxed">
            {healthScore > 80 ? "Outstanding architecture! You operate in the top decile of structured financial planners." : 
             healthScore > 60 ? "Solid framework. Fine-tuning your allocation rates could elevate your score." :
             "Let's focus on defining a budget baseline to strengthen your core foundation."}
          </p>
        </motion.div>

        {/* Wealth Summary Card */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
          <div className="card p-8 space-y-6 relative group overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-[0.02] group-hover:scale-105 group-hover:opacity-[0.05] transition-all duration-300">
              <Wallet className="w-14 h-14" />
            </div>
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-secondary">Net Worth</h3>
            <div className="space-y-1">
              <div className="text-4xl font-display font-light text-text-primary tracking-tight">
                {formatCurrency(user.netWorth.assets - user.netWorth.liabilities, user.currency, currency.locale)}
              </div>
              {budget && budget.history && budget.history.length > 1 && (
                <div className={cn(
                  "flex items-center gap-1 text-xs font-semibold uppercase tracking-wider",
                  budget.history[budget.history.length - 1].total < budget.history[budget.history.length - 2].total ? "text-accent-emerald" : "text-[#FF6B6B]"
                )}>
                  {budget.history[budget.history.length - 1].total < budget.history[budget.history.length - 2].total ? <TrendingUp className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                  <span>
                    {Math.abs(Math.round(((budget.history[budget.history.length - 1].total - budget.history[budget.history.length - 2].total) / budget.history[budget.history.length - 2].total) * 100))}% vs last month
                  </span>
                </div>
              )}
            </div>
            <div className="pt-6 border-t border-white/[0.04] grid grid-cols-2 gap-4">
              <div>
                <div className="text-[9px] text-text-muted uppercase tracking-wider font-bold">Total Assets</div>
                <div className="text-base font-mono font-bold text-text-primary">{formatCurrency(user.netWorth.assets, user.currency, currency.locale)}</div>
              </div>
              <div>
                <div className="text-[9px] text-text-muted uppercase tracking-wider font-bold">Total Liabilities</div>
                <div className="text-base font-mono font-bold text-[#FF6B6B]">{formatCurrency(user.netWorth.liabilities, user.currency, currency.locale)}</div>
              </div>
            </div>
          </div>

          <div className="card p-8 space-y-6 relative group overflow-hidden cursor-pointer hover:border-accent-gold/20" onClick={() => window.location.hash = "#portfolio"}>
            <div className="absolute top-0 right-0 p-6 opacity-[0.02] group-hover:scale-105 group-hover:opacity-[0.05] transition-all duration-300">
              <PieChart className="w-14 h-14" />
            </div>
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-secondary">Portfolio Allocation</h3>
            <div className="space-y-1">
              <div className="text-4xl font-display font-light text-accent-gold tracking-tight">
                {formatCurrency(user.portfolio?.totalValue || 0, user.currency, currency.locale)}
              </div>
              {user.portfolio && (
                <div className={cn(
                  "flex items-center gap-1 text-xs font-semibold uppercase tracking-wider",
                  user.portfolio.change24h >= 0 ? "text-accent-emerald" : "text-[#FF6B6B]"
                )}>
                  {user.portfolio.change24h >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                  <span>{user.portfolio.change24h >= 0 ? "+" : ""}{user.portfolio.change24h}% (24h)</span>
                </div>
              )}
            </div>
            <div className="pt-6 border-t border-white/[0.04] flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="text-[9px] text-text-muted uppercase tracking-wider font-bold">Simulated Alpha</div>
                <div className="text-base font-mono font-bold text-accent-emerald">
                  {user.portfolio && user.portfolio.holdings.length > 0 ? "+4.2%" : "--"}
                </div>
              </div>
              <div className="space-y-0.5 text-right">
                <div className="text-[9px] text-text-muted uppercase tracking-wider font-bold">Sharpe Ratio</div>
                <div className="text-base font-mono font-bold text-accent-gold">
                  {user.portfolio && user.portfolio.holdings.length > 0 ? "1.85" : "--"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Audit Result / Action Items */}
      {auditResult && (
        <motion.div 
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-8 border-accent-gold/15 bg-accent-gold/[0.01] space-y-8 text-left"
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-2xl bg-accent-gold/10 flex items-center justify-center shadow-inner">
                <Sparkles className="w-5 h-5 text-accent-gold" />
              </div>
              <div>
                <h2 className="text-xl font-display font-medium text-text-primary">AI Wealth Audit Insights</h2>
                <p className="text-text-secondary text-xs">Generated based on your local device datasets.</p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.02] border border-white/[0.04] text-[9px] font-bold uppercase tracking-widest text-text-muted">
              <Info className="w-3 h-3" /> Technical Audit
            </div>
          </div>
          
          <div className="prose prose-invert max-w-none prose-p:text-text-secondary prose-p:text-xs prose-p:leading-relaxed prose-strong:text-accent-gold prose-headings:text-text-primary">
            {auditResult.split('\n').map((line, i) => (
              <p key={i} className="mb-2.5 font-light">{line}</p>
            ))}
          </div>

          <div className="pt-6 border-t border-white/[0.04]">
            <p className="text-[8px] text-text-muted italic text-center uppercase tracking-widest">
              Educational projection only. Not financial advice. Device local verification layer.
            </p>
          </div>
        </motion.div>
      )}

      {/* Quick Navigation / Mastery Modules */}
      <div className="space-y-4 text-left">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-secondary flex items-center gap-1.5">
          <BrainCircuit className="w-4 h-4 text-accent-gold" /> Core Mastery Modules
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { title: "MacroPulse Engine", desc: "Economic simulator", icon: <BrainCircuit />, hash: "#macropulse", color: "text-accent-gold" },
            { title: "TrendMarket", desc: "Pop-culture trading", icon: <TrendingUp />, hash: "#trendmarket", color: "text-accent-emerald" },
            { title: "LiveOrLease", desc: "Rent vs Buy engine", icon: <PieChart />, hash: "#liveorlease", color: "text-accent-blue" },
            { title: "MockYield DeFi", desc: "Staking mastery", icon: <Sparkles />, hash: "#mockyield", color: "text-[#E2C9A1]" },
          ].map((item, i) => (
            <motion.a
              key={i}
              href={item.hash}
              whileHover={{ y: -3, backgroundColor: "var(--color-bg-card-hover)" }}
              className="card p-6 flex flex-col gap-4 group border-white/[0.03] transition-all text-left"
            >
              <div className={cn("w-10 h-10 rounded-xl bg-white/[0.02] border border-white/[0.04] flex items-center justify-center group-hover:scale-105 transition-transform", item.color)}>
                {item.icon}
              </div>
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wide text-text-primary">{item.title}</h4>
                <p className="text-[9px] text-text-secondary uppercase tracking-widest mt-1">{item.desc}</p>
              </div>
              <div className="pt-2 flex items-center text-[9px] font-bold text-accent-gold opacity-0 group-hover:opacity-100 transition-opacity">
                ENTER MODULE <ChevronRight className="w-3 h-3 ml-0.5" />
              </div>
            </motion.a>
          ))}
        </div>
      </div>

      {/* Quick Navigation / Next Steps */}
      <div className="space-y-4 text-left">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-secondary flex items-center gap-1.5">
          <Target className="w-4 h-4 text-accent-gold" /> Strategic Management
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: "Portfolio Allocation", desc: "Balance your baseline assets and alpha triggers.", icon: <PieChart />, hash: "#portfolio" },
            { title: "Budget Architect", desc: "Optimize savings and trim redundant expenditures.", icon: <TrendingUp />, hash: "#budget" },
            { title: "Academic Quizzes", desc: "Complete literacy exercises to lift your health score.", icon: <Target />, hash: "#quiz" },
          ].map((item, i) => (
            <motion.a
              key={i}
              href={item.hash}
              whileHover={{ x: 3, backgroundColor: "var(--color-bg-card-hover)" }}
              className="card p-6 flex items-center justify-between group border-white/[0.03] transition-all text-left"
            >
              <div className="flex items-center gap-4">
                <div className="w-9 h-9 rounded-xl bg-white/[0.02] border border-white/[0.04] flex items-center justify-center text-accent-gold group-hover:scale-105 transition-transform">
                  {item.icon}
                </div>
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wide text-text-primary">{item.title}</h4>
                  <p className="text-[11px] text-text-secondary mt-0.5 font-light">{item.desc}</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-text-muted group-hover:text-accent-gold transition-colors" />
            </motion.a>
          ))}
        </div>
      </div>
    </div>
  );
}
