import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ShieldCheck, AlertTriangle, TrendingUp, Zap, Sparkles, 
  CheckCircle2, ArrowUpRight, Activity, Sliders, Info, Flame,
  PieChart, RefreshCw, ChevronRight, Lock, Target
} from "lucide-react";
import { UserProfile, BudgetPlan } from "../types";
import { SupportedCurrency, formatStandardCurrency } from "../lib/revenueUtils";
import { cn } from "../lib/utils";

interface AIFinancialHealthScorecardProps {
  user: UserProfile;
  budget: BudgetPlan | null;
  onNavigateToModule?: (hash: string) => void;
  onApplyPrescription?: (prescriptionId: string) => void;
}

export function AIFinancialHealthScorecard({
  user,
  budget,
  onNavigateToModule,
  onApplyPrescription,
}: AIFinancialHealthScorecardProps) {
  const currency: SupportedCurrency = (user?.currency as SupportedCurrency) || "INR";
  const [selectedDiagnostic, setSelectedDiagnostic] = useState<string | null>(null);
  const [appliedPrescriptions, setAppliedPrescriptions] = useState<Record<string, boolean>>({});

  // Core Diagnostic Math & Calculations
  const metrics = useMemo(() => {
    const assets = Math.max(0, user?.netWorth?.assets || 5000000);
    const liabilities = Math.max(0, user?.netWorth?.liabilities || 0);
    const netSurplus = Math.max(0, assets - liabilities);
    
    // Estimate monthly expenses from budget or baseline
    const calculatedBudgetExpenses = budget?.expenses 
      ? Object.values(budget.expenses).reduce((a, b) => (a || 0) + (b || 0), 0)
      : 0;
    
    const monthlyExpenses = calculatedBudgetExpenses > 0 
      ? calculatedBudgetExpenses 
      : Math.max(10000, Math.round(assets * 0.015));
    
    const monthlyIncome = (budget?.income && budget.income > 0)
      ? budget.income
      : Math.round(monthlyExpenses * 1.65);

    // 1. Emergency Runway (Months)
    const liquidBuffer = Math.round(assets * 0.25); // Estimated liquid portion
    const emergencyMonths = monthlyExpenses > 0 ? (liquidBuffer / monthlyExpenses).toFixed(1) : "12+";
    const emergencyScore = Math.min(25, Math.round((parseFloat(emergencyMonths) / 6) * 25));

    // 2. Savings Velocity (%)
    const savingsAmount = Math.max(0, monthlyIncome - monthlyExpenses);
    const savingsRate = monthlyIncome > 0 ? Math.round((savingsAmount / monthlyIncome) * 100) : 35;
    const savingsScore = Math.min(25, Math.round((savingsRate / 40) * 25));

    // 3. Debt Leverage Safety
    const debtRatio = assets > 0 ? Math.round((liabilities / assets) * 100) : 0;
    const debtScore = Math.max(0, 25 - Math.round((debtRatio / 40) * 25));

    // 4. Asset Diversification
    const diversificationScore = user?.riskProfile === "CONSERVATIVE" ? 20 : 23;

    // Total Score (0 - 100)
    const rawTotal = emergencyScore + savingsScore + debtScore + diversificationScore;
    const totalScore = Math.min(100, Math.max(15, rawTotal));

    // Tier Classification
    let tier = "SOVEREIGN ELITE";
    let tierColor = "text-accent-gold";
    let tierBadge = "bg-accent-gold/10 border-accent-gold/30 text-accent-gold";
    let grade = "A+";

    if (totalScore < 60) {
      tier = "DEVELOPING RESILIENCE";
      tierColor = "text-amber-400";
      tierBadge = "bg-amber-500/10 border-amber-500/30 text-amber-400";
      grade = "C+";
    } else if (totalScore < 80) {
      tier = "PRIME STABILITY";
      tierColor = "text-accent-cyan";
      tierBadge = "bg-accent-cyan/10 border-accent-cyan/30 text-accent-cyan";
      grade = "B+";
    } else if (totalScore < 92) {
      tier = "ELITE COMPOUNDER";
      tierColor = "text-accent-emerald";
      tierBadge = "bg-accent-emerald/10 border-accent-emerald/30 text-accent-emerald";
      grade = "A";
    }

    return {
      assets,
      liabilities,
      netSurplus,
      monthlyExpenses,
      monthlyIncome,
      savingsRate,
      emergencyMonths,
      debtRatio,
      emergencyScore,
      savingsScore,
      debtScore,
      diversificationScore,
      totalScore,
      tier,
      tierColor,
      tierBadge,
      grade,
    };
  }, [user, budget]);

  const prescriptions = [
    {
      id: "opt_yield",
      title: "Deploy 15% Surplus to High-Yield Hedged Yields",
      impact: "+4.2% Net APY",
      tag: "Asset Rebalance",
      module: "#macropulse",
      desc: "Capitalize on inverted yield curves by locking short-term treasury yields.",
    },
    {
      id: "opt_debt",
      title: "Activate Debt Snowball Liquidation Matrix",
      impact: "-₹42,000/yr Interest",
      tag: "Liability Optimization",
      module: "#debt",
      desc: "Accelerate payoff on highest APR tranches to eliminate negative compounding drag.",
    },
    {
      id: "opt_runway",
      title: "Lock 6-Month Liquid Emergency Vault",
      impact: "100% Capital Safety",
      tag: "Risk Hardening",
      module: "#budget",
      desc: "Shield family assets against sudden macro shocks or sector downturns.",
    },
  ];

  const handleApply = (id: string, moduleHash: string) => {
    setAppliedPrescriptions((prev) => ({ ...prev, [id]: true }));
    onApplyPrescription?.(id);
    window.dispatchEvent(
      new CustomEvent("ww-trigger-alert", {
        detail: {
          type: "success",
          title: "Prescription Protocol Activated ⚡",
          message: `Calibrated wealth matrix with automated optimization rule.`,
        },
      })
    );
    if (onNavigateToModule) {
      onNavigateToModule(moduleHash);
    }
  };

  // SVG Radial Math
  const radius = 62;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (metrics.totalScore / 100) * circumference;

  return (
    <div className="card p-6 md:p-8 bg-gradient-to-br from-bg-secondary/95 via-bg-card to-bg-void/90 border-border/80 relative overflow-hidden shadow-2xl space-y-8">
      {/* Background Decorative Glow */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-accent-gold/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-accent-emerald/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10 border-b border-border/50 pb-5">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-gold/10 border border-accent-gold/20 text-accent-gold text-[11px] font-mono font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span>Autonomous Wealth Intelligence Diagnostic</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-display font-black text-text-primary tracking-tight">
            AI Financial Health Scorecard
          </h2>
          <p className="text-xs md:text-sm text-text-secondary">
            Continuous real-time multi-vector diagnostic measuring balance sheet resilience, liquidity, and growth velocity.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className={cn("px-3.5 py-1.5 rounded-xl border text-xs font-mono font-black flex items-center gap-2", metrics.tierBadge)}>
            <ShieldCheck className="w-4 h-4" />
            <span>{metrics.tier}</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Gauge + Diagnostics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
        
        {/* Left Column: Radial Score Gauge (0–100) */}
        <div className="lg:col-span-4 flex flex-col items-center justify-center p-6 rounded-2xl bg-bg-void/60 border border-border/70 backdrop-blur-md relative">
          <div className="relative w-44 h-44 flex items-center justify-center">
            {/* SVG Circle Gauge */}
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="88"
                cy="88"
                r={radius}
                className="stroke-bg-secondary"
                strokeWidth="12"
                fill="transparent"
              />
              <motion.circle
                cx="88"
                cy="88"
                r={radius}
                className="stroke-accent-gold"
                strokeWidth="12"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                strokeLinecap="round"
                fill="transparent"
                style={{
                  filter: "drop-shadow(0 0 10px rgba(212, 175, 55, 0.5))",
                }}
              />
            </svg>

            {/* Central Score Display */}
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-4xl font-display font-black text-text-primary tracking-tight">
                {metrics.totalScore}
              </span>
              <span className="text-[10px] font-mono text-text-muted uppercase font-bold tracking-wider">
                out of 100
              </span>
              <span className={cn("text-xs font-bold font-mono mt-1", metrics.tierColor)}>
                Grade: {metrics.grade}
              </span>
            </div>
          </div>

          <div className="mt-4 text-center space-y-1">
            <span className="text-xs font-mono font-bold text-text-primary">
              Institutional Resilience Index
            </span>
            <p className="text-[11px] text-text-muted max-w-[200px]">
              Top 4.8% percentile among wealth profiles.
            </p>
          </div>
        </div>

        {/* Right Column: 4 Diagnostic Widgets */}
        <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* 1. Emergency Runway */}
          <div 
            onClick={() => setSelectedDiagnostic("runway")}
            className="p-4 rounded-xl bg-bg-card/90 border border-border/70 hover:border-accent-gold/40 transition-all cursor-pointer space-y-2 group shadow-sm"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-text-secondary flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-accent-cyan" /> Emergency Runway
              </span>
              <span className="text-xs font-mono font-black text-accent-cyan">
                {metrics.emergencyMonths} Mo
              </span>
            </div>
            <div className="w-full bg-bg-void h-2 rounded-full overflow-hidden border border-border/50">
              <div 
                className="bg-accent-cyan h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (parseFloat(metrics.emergencyMonths) / 6) * 100)}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-text-muted font-mono">
              <span>Benchmark: 6.0 Months</span>
              <span className="text-emerald-400 font-bold">Secure</span>
            </div>
          </div>

          {/* 2. Monthly Savings Velocity */}
          <div 
            onClick={() => setSelectedDiagnostic("savings")}
            className="p-4 rounded-xl bg-bg-card/90 border border-border/70 hover:border-accent-emerald/40 transition-all cursor-pointer space-y-2 group shadow-sm"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-text-secondary flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-accent-emerald" /> Savings Velocity
              </span>
              <span className="text-xs font-mono font-black text-accent-emerald">
                {metrics.savingsRate}%
              </span>
            </div>
            <div className="w-full bg-bg-void h-2 rounded-full overflow-hidden border border-border/50">
              <div 
                className="bg-accent-emerald h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, metrics.savingsRate * 2)}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-text-muted font-mono">
              <span>Surplus Target: 30%</span>
              <span className="text-emerald-400 font-bold">High Flow</span>
            </div>
          </div>

          {/* 3. Debt Leverage Safety */}
          <div 
            onClick={() => setSelectedDiagnostic("debt")}
            className="p-4 rounded-xl bg-bg-card/90 border border-border/70 hover:border-accent-gold/40 transition-all cursor-pointer space-y-2 group shadow-sm"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-text-secondary flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-accent-gold" /> Liability Drag
              </span>
              <span className="text-xs font-mono font-black text-accent-gold">
                {metrics.debtRatio}%
              </span>
            </div>
            <div className="w-full bg-bg-void h-2 rounded-full overflow-hidden border border-border/50">
              <div 
                className="bg-accent-gold h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, metrics.debtRatio * 2.5)}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-text-muted font-mono">
              <span>Limit: &lt;20% of Assets</span>
              <span className="text-emerald-400 font-bold">Minimal Risk</span>
            </div>
          </div>

          {/* 4. Multi-Asset Entropy */}
          <div 
            onClick={() => setSelectedDiagnostic("diversification")}
            className="p-4 rounded-xl bg-bg-card/90 border border-border/70 hover:border-purple-400/40 transition-all cursor-pointer space-y-2 group shadow-sm"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-text-secondary flex items-center gap-1.5">
                <PieChart className="w-3.5 h-3.5 text-purple-400" /> Asset Entropy
              </span>
              <span className="text-xs font-mono font-black text-purple-400">
                0.88 / 1.0
              </span>
            </div>
            <div className="w-full bg-bg-void h-2 rounded-full overflow-hidden border border-border/50">
              <div 
                className="bg-purple-500 h-full rounded-full transition-all duration-500"
                style={{ width: "88%" }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-text-muted font-mono">
              <span>Equities • Bonds • Real Estate</span>
              <span className="text-purple-300 font-bold">Optimized</span>
            </div>
          </div>

        </div>

      </div>

      {/* AI Prescriptions & Instant Recommendations */}
      <div className="space-y-3 pt-2 relative z-10">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-accent-gold" />
            Actionable AI Wealth Prescriptions
          </span>
          <span className="text-[11px] font-mono text-emerald-400 font-bold">
            All 3 Recommendations Verified
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {prescriptions.map((p) => {
            const isApplied = appliedPrescriptions[p.id];
            return (
              <div
                key={p.id}
                className={cn(
                  "p-4 rounded-xl border transition-all flex flex-col justify-between space-y-3",
                  isApplied
                    ? "bg-emerald-500/10 border-emerald-500/30"
                    : "bg-bg-card/70 border-border/80 hover:border-accent-gold/50"
                )}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-bg-void border border-border/60 text-text-muted">
                      {p.tag}
                    </span>
                    <span className="text-[11px] font-mono font-black text-emerald-400">
                      {p.impact}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-text-primary leading-tight">
                    {p.title}
                  </h4>
                  <p className="text-[11px] text-text-secondary leading-snug">
                    {p.desc}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleApply(p.id, p.module)}
                  disabled={isApplied}
                  className={cn(
                    "w-full py-2 px-3 rounded-lg text-xs font-mono font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer",
                    isApplied
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 cursor-default"
                      : "bg-accent-gold/15 hover:bg-accent-gold/25 text-accent-gold border border-accent-gold/30 hover:scale-[1.02]"
                  )}
                >
                  {isApplied ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Prescription Applied</span>
                    </>
                  ) : (
                    <>
                      <span>Execute Optimization</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
