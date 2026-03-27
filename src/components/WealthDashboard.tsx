import { motion } from "motion/react";
import { TrendingUp, ShieldCheck, Target, BrainCircuit, ChevronRight, Sparkles, Wallet, PieChart, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { UserProfile, BudgetPlan } from "../types";
import { formatCurrency, cn } from "../lib/utils";
import { CURRENCIES } from "../constants";
import { useMemo, useState } from "react";
import { generateWealthAudit } from "../lib/gemini";

interface WealthDashboardProps {
  user: UserProfile;
  budget: BudgetPlan | null;
}

export function WealthDashboard({ user, budget }: WealthDashboardProps) {
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState<string | null>(null);

  const currency = CURRENCIES[user.currency] || CURRENCIES.USD;

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

  const handleRunAudit = async () => {
    setIsAuditing(true);
    try {
      const result = await generateWealthAudit(user, budget);
      setAuditResult(result);
    } catch (error) {
      console.error("Audit failed:", error);
    } finally {
      setIsAuditing(false);
    }
  };

  return (
    <div className="container mx-auto px-6 py-12 space-y-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-display font-bold tracking-tight"
          >
            Welcome back, <span className="text-accent-gold">{user.name}</span>
          </motion.h1>
          <p className="text-text-secondary text-lg">Your Personal Wealth Architect is ready.</p>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleRunAudit}
          disabled={isAuditing}
          className="btn-primary flex items-center gap-3 px-8 py-4 text-lg group"
        >
          {isAuditing ? (
            <BrainCircuit className="w-6 h-6 animate-spin" />
          ) : (
            <Sparkles className="w-6 h-6 text-bg-void group-hover:animate-pulse" />
          )}
          {isAuditing ? "Analyzing Wealth..." : "One-Click AI Audit"}
        </motion.button>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Health Score Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card p-8 flex flex-col items-center justify-center text-center space-y-6 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-4">
            <ShieldCheck className="w-6 h-6 text-accent-gold opacity-20" />
          </div>
          
          <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-text-muted">Financial Health Score</h3>
          
          <div className="relative w-48 h-48 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="96"
                cy="96"
                r="88"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-border"
              />
              <circle
                cx="96"
                cy="96"
                r="88"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={552.92}
                strokeDashoffset={552.92 - (552.92 * healthScore) / 100}
                className="text-accent-gold transition-all duration-1000 ease-out"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-6xl font-display font-bold">{healthScore}</span>
              <span className="text-xs text-text-muted uppercase tracking-widest">Out of 100</span>
            </div>
          </div>

          <p className="text-sm text-text-secondary max-w-[200px]">
            {healthScore > 80 ? "Excellent! You're in the top 5% of financial planners." : 
             healthScore > 60 ? "Good progress. A few tweaks could boost your score." :
             "Let's focus on building your foundation."}
          </p>
        </motion.div>

        {/* Wealth Summary Card */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card p-8 space-y-6 relative group overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
              <Wallet className="w-12 h-12" />
            </div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-text-muted">Net Worth</h3>
            <div className="space-y-1">
              <div className="text-4xl font-display font-bold">
                {formatCurrency(user.netWorth.assets - user.netWorth.liabilities, user.currency, currency.locale)}
              </div>
              <div className="flex items-center gap-2 text-accent-emerald text-sm font-medium">
                <TrendingUp className="w-4 h-4" />
                <span>+12.5% from last month</span>
              </div>
            </div>
            <div className="pt-6 border-t border-border grid grid-cols-2 gap-4">
              <div>
                <div className="text-[10px] text-text-muted uppercase tracking-wider">Assets</div>
                <div className="text-lg font-mono font-bold">{formatCurrency(user.netWorth.assets, user.currency, currency.locale)}</div>
              </div>
              <div>
                <div className="text-[10px] text-text-muted uppercase tracking-wider">Liabilities</div>
                <div className="text-lg font-mono font-bold text-accent-red">{formatCurrency(user.netWorth.liabilities, user.currency, currency.locale)}</div>
              </div>
            </div>
          </div>

          <div className="card p-8 space-y-6 relative group overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
              <PieChart className="w-12 h-12" />
            </div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-text-muted">Monthly Cashflow</h3>
            {budget ? (
              <>
                <div className="space-y-1">
                  <div className="text-4xl font-display font-bold">
                    {formatCurrency(budget.income - Object.values(budget.expenses).reduce((a, b) => a + b, 0), user.currency, currency.locale)}
                  </div>
                  <div className="text-text-secondary text-sm">Surplus this month</div>
                </div>
                <div className="pt-6 border-t border-border flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-accent-emerald" />
                    <span className="text-xs text-text-secondary">Savings Rate</span>
                  </div>
                  <span className="text-lg font-mono font-bold text-accent-emerald">
                    {Math.round(((budget.income - Object.values(budget.expenses).reduce((a, b) => a + b, 0)) / budget.income) * 100)}%
                  </span>
                </div>
              </>
            ) : (
              <div className="h-full flex items-center justify-center text-text-muted italic text-sm">
                Set up your budget to see cashflow analysis.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Audit Result / Action Items */}
      {auditResult && (
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-8 border-accent-gold/20 bg-accent-gold/5 space-y-8"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-accent-gold/20 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-accent-gold" />
            </div>
            <div>
              <h2 className="text-2xl font-display font-bold">AI Wealth Audit Results</h2>
              <p className="text-text-secondary text-sm">Generated just now based on your real-time data.</p>
            </div>
          </div>
          
          <div className="prose prose-invert max-w-none prose-p:text-text-secondary prose-strong:text-accent-gold prose-headings:text-text-primary">
            {auditResult.split('\n').map((line, i) => (
              <p key={i} className="mb-2">{line}</p>
            ))}
          </div>
        </motion.div>
      )}

      {/* Quick Navigation / Next Steps */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { title: "Optimize Budget", desc: "Find hidden savings in your expenses.", icon: <TrendingUp />, hash: "#budget" },
          { title: "Test Literacy", desc: "Boost your score with a quick quiz.", icon: <Target />, hash: "#quiz" },
          { title: "Simulate Future", desc: "See how your wealth grows over time.", icon: <BrainCircuit />, hash: "#simulator" },
        ].map((item, i) => (
          <motion.a
            key={i}
            href={item.hash}
            whileHover={{ x: 5, backgroundColor: "var(--bg-card-hover)" }}
            className="card p-6 flex items-center justify-between group"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-bg-secondary flex items-center justify-center text-accent-gold group-hover:scale-110 transition-transform">
                {item.icon}
              </div>
              <div>
                <h4 className="font-bold text-sm">{item.title}</h4>
                <p className="text-xs text-text-muted">{item.desc}</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-text-muted group-hover:text-accent-gold transition-colors" />
          </motion.a>
        ))}
      </div>
    </div>
  );
}
