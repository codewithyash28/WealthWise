import React, { useState, useMemo } from "react";
import { motion } from "motion/react";
import { 
  ShieldCheck, 
  ShieldAlert, 
  DollarSign, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2, 
  Sliders, 
  RefreshCw, 
  Sparkles,
  Zap,
  ArrowRight
} from "lucide-react";
import { formatCurrency, cn } from "../lib/utils";
import { UserProfile, BudgetPlan } from "../types";
import { CURRENCIES } from "../constants";

interface EmergencyFundWidgetProps {
  user: UserProfile;
  budget: BudgetPlan | null;
}

export const EmergencyFundWidget: React.FC<EmergencyFundWidgetProps> = ({ user, budget }) => {
  const currency = CURRENCIES[user.currency] || CURRENCIES.USD;

  // Calculate default monthly expenses from budget plan or fallback
  const calculatedMonthlyExpenses = useMemo(() => {
    if (budget && budget.expenses && Object.keys(budget.expenses).length > 0) {
      return Object.values(budget.expenses).reduce((sum, val) => sum + (Number(val) || 0), 0);
    }
    return 2800; // Realistic default
  }, [budget]);

  // Liquid cash assets (estimate ~ 35% of total liquid assets or user customized)
  const defaultLiquidCash = useMemo(() => {
    if (user.netWorth.assets > 0) {
      return Math.round(user.netWorth.assets * 0.35);
    }
    return 12500;
  }, [user.netWorth.assets]);

  const [liquidCash, setLiquidCash] = useState<number>(defaultLiquidCash);
  const [monthlyExpense, setMonthlyExpense] = useState<number>(calculatedMonthlyExpenses);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  // Buffer Ratio Calculation
  const monthsOfRunway = useMemo(() => {
    if (monthlyExpense <= 0) return 0;
    return parseFloat((liquidCash / monthlyExpense).toFixed(1));
  }, [liquidCash, monthlyExpense]);

  // Targets
  const target3Month = monthlyExpense * 3;
  const target6Month = monthlyExpense * 6;
  const gapTo3Month = Math.max(0, target3Month - liquidCash);
  const gapTo6Month = Math.max(0, target6Month - liquidCash);

  // Status & Gauge Color Determination
  // Turns vibrant green when recommended 3-6 month buffer is achieved!
  const isOptimal = monthsOfRunway >= 3.0;
  const isSurplus = monthsOfRunway > 6.0;

  const gaugePercentage = Math.min(100, Math.round((monthsOfRunway / 6.0) * 100));

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={cn(
        "card p-6 sm:p-7 border-2 transition-all shadow-2xl relative overflow-hidden",
        isOptimal 
          ? "border-emerald-500/50 bg-gradient-to-br from-bg-secondary/90 via-bg-primary to-emerald-950/20 shadow-emerald-500/10" 
          : "border-amber-500/40 bg-gradient-to-br from-bg-secondary/90 via-bg-primary to-amber-950/20 shadow-amber-500/10"
      )}
    >
      {/* Background Glow Effect */}
      <div 
        className={cn(
          "absolute -right-16 -top-16 w-64 h-64 rounded-full blur-3xl pointer-events-none opacity-20 transition-all",
          isOptimal ? "bg-emerald-400" : "bg-amber-500"
        )} 
      />

      <div className="relative z-10 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-3 rounded-2xl border transition-all shadow-lg",
              isOptimal
                ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-400 shadow-emerald-500/20"
                : "bg-amber-500/15 border-amber-500/40 text-amber-400 shadow-amber-500/20"
            )}>
              {isOptimal ? <ShieldCheck className="w-6 h-6 text-emerald-400" /> : <ShieldAlert className="w-6 h-6 text-amber-400" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold font-display text-text-primary">
                  Emergency Fund Buffer
                </h3>
                <span className={cn(
                  "px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border flex items-center gap-1",
                  isOptimal
                    ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300 animate-pulse"
                    : "bg-amber-500/20 border-amber-500/40 text-amber-300"
                )}>
                  {isOptimal ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <AlertCircle className="w-3 h-3 text-amber-400" />}
                  {isSurplus ? "Surplus Buffer (>6 Mo)" : isOptimal ? "3-6 Month Buffer Achieved 🎉" : "Needs Attention (<3 Mo)"}
                </span>
              </div>
              <p className="text-xs text-text-secondary mt-0.5">
                Monitors ratio of liquid cash assets to monthly living expenses.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className="px-3 py-1.5 rounded-xl bg-bg-void hover:bg-bg-primary border border-border text-xs font-mono font-bold text-accent-gold transition-all cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{isEditing ? "Close Calculator" : "Adjust Runway"}</span>
          </button>
        </div>

        {/* Primary Metric Gauge */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          
          {/* Main Month Count & Gauge Bar */}
          <div className="md:col-span-7 space-y-4">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-text-muted">Liquid Runway Buffer</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className={cn(
                    "text-4xl sm:text-5xl font-mono font-black transition-colors",
                    isOptimal ? "text-emerald-400" : "text-amber-400"
                  )}>
                    {monthsOfRunway}
                  </span>
                  <span className="text-lg font-bold font-display text-text-secondary">Months</span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-mono uppercase text-text-muted">Liquid Cash Assets</span>
                <div className="text-xl font-mono font-bold text-text-primary mt-0.5">
                  {formatCurrency(liquidCash, user.currency, currency.locale)}
                </div>
              </div>
            </div>

            {/* Visual Gauge Progress Bar */}
            <div className="space-y-1.5">
              <div className="h-4 w-full bg-bg-void border border-border/80 rounded-full p-0.5 overflow-hidden relative">
                {/* 3-Month & 6-Month Marker Lines */}
                <div className="absolute left-[50%] top-0 bottom-0 w-0.5 bg-text-muted/40 z-10" title="3-Month Target Threshold" />
                <div className="absolute right-[0%] top-0 bottom-0 w-0.5 bg-emerald-400/60 z-10" title="6-Month Target Threshold" />

                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${gaugePercentage}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className={cn(
                    "h-full rounded-full transition-all shadow-md",
                    isOptimal
                      ? "bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.5)]"
                      : "bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-400 shadow-[0_0_15px_rgba(245,158,11,0.4)]"
                  )}
                />
              </div>

              {/* Threshold Labels */}
              <div className="flex justify-between text-[10px] font-mono text-text-muted pt-0.5">
                <span>0 Months</span>
                <span className={monthsOfRunway >= 3 ? "text-emerald-400 font-bold" : "text-text-muted"}>
                  3 Mo Target ({formatCurrency(target3Month, user.currency, currency.locale)})
                </span>
                <span className={monthsOfRunway >= 6 ? "text-emerald-400 font-bold" : "text-text-muted"}>
                  6 Mo Target ({formatCurrency(target6Month, user.currency, currency.locale)})
                </span>
              </div>
            </div>
          </div>

          {/* Key Targets & Advice Box */}
          <div className="md:col-span-5 bg-bg-void/80 border border-border/80 rounded-2xl p-4 space-y-3">
            <div className="text-xs font-mono font-bold uppercase tracking-wider text-text-muted flex items-center justify-between border-b border-border/40 pb-2">
              <span>Buffer Targets</span>
              <span className={isOptimal ? "text-emerald-400" : "text-amber-400"}>
                {isOptimal ? "Optimal Status" : "Action Required"}
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-text-secondary">Monthly Expenses:</span>
                <span className="font-mono font-bold text-text-primary">
                  {formatCurrency(monthlyExpense, user.currency, currency.locale)}/mo
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-text-secondary">3-Month Safety Floor:</span>
                <span className="font-mono font-bold text-text-primary">
                  {formatCurrency(target3Month, user.currency, currency.locale)}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-text-secondary">6-Month Optimal Ceiling:</span>
                <span className="font-mono font-bold text-text-primary">
                  {formatCurrency(target6Month, user.currency, currency.locale)}
                </span>
              </div>

              {/* Total Asset Composition Trace */}
              <div className="pt-2 border-t border-border/40 space-y-1.5">
                <div className="flex justify-between items-center text-[10px] text-text-muted uppercase font-mono">
                  <span>Asset Composition Breakdown</span>
                  <span className="text-accent-gold font-bold">Total: {formatCurrency(user.netWorth.assets, user.currency, currency.locale)}</span>
                </div>
                <div className="grid grid-cols-3 gap-1.5 text-[10px] font-mono">
                  <div className="bg-bg-primary/80 p-1.5 rounded-lg border border-emerald-500/20 text-center">
                    <span className="text-emerald-400 font-bold block">35% Liquid</span>
                    <span className="text-text-muted truncate">{formatCurrency(liquidCash, user.currency, currency.locale)}</span>
                  </div>
                  <div className="bg-bg-primary/80 p-1.5 rounded-lg border border-accent-gold/20 text-center">
                    <span className="text-accent-gold font-bold block">45% Equities</span>
                    <span className="text-text-muted truncate">{formatCurrency(Math.round(user.netWorth.assets * 0.45), user.currency, currency.locale)}</span>
                  </div>
                  <div className="bg-bg-primary/80 p-1.5 rounded-lg border border-purple-500/20 text-center">
                    <span className="text-purple-400 font-bold block">20% Bonds/Gold</span>
                    <span className="text-text-muted truncate">{formatCurrency(Math.round(user.netWorth.assets * 0.20), user.currency, currency.locale)}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-border/40 text-[11px] leading-relaxed">
                {isOptimal ? (
                  <div className="text-emerald-400 font-medium flex items-start gap-1.5">
                    <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>Your emergency fund ratio is in the green zone! You have sufficient runway to absorb economic market shocks without tapping into long-term investments.</span>
                  </div>
                ) : (
                  <div className="text-amber-300 font-medium flex items-start gap-1.5">
                    <Zap className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>
                      Add <strong className="text-emerald-400 font-mono">{formatCurrency(gapTo3Month, user.currency, currency.locale)}</strong> liquid cash to achieve your recommended 3-month safety threshold.
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Collapsible Interactive Scenario Controls */}
        {isEditing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="pt-4 border-t border-border/60 grid grid-cols-1 sm:grid-cols-2 gap-4 bg-bg-void/50 p-4 rounded-2xl"
          >
            <div className="space-y-2">
              <label className="text-xs font-mono font-bold text-text-secondary flex justify-between">
                <span>Adjust Liquid Cash:</span>
                <span className="text-accent-gold font-mono">{formatCurrency(liquidCash, user.currency, currency.locale)}</span>
              </label>
              <input
                type="range"
                min={1000}
                max={Math.max(50000, target6Month * 1.5)}
                step={500}
                value={liquidCash}
                onChange={(e) => setLiquidCash(Number(e.target.value))}
                className="w-full accent-accent-gold cursor-pointer"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono font-bold text-text-secondary flex justify-between">
                <span>Adjust Monthly Expenses:</span>
                <span className="text-accent-gold font-mono">{formatCurrency(monthlyExpense, user.currency, currency.locale)}</span>
              </label>
              <input
                type="range"
                min={500}
                max={10000}
                step={250}
                value={monthlyExpense}
                onChange={(e) => setMonthlyExpense(Number(e.target.value))}
                className="w-full accent-accent-gold cursor-pointer"
              />
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};
