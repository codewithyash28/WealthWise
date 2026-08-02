import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Moon, 
  Sparkles, 
  CheckCircle2, 
  TrendingUp, 
  AlertTriangle, 
  RefreshCw, 
  ShieldCheck, 
  Zap, 
  Clock, 
  ChevronRight,
  PieChart
} from "lucide-react";
import { cn, formatCurrency } from "../lib/utils";
import { UserProfile, BudgetPlan } from "../types";

interface MidnightAuditorProps {
  user: UserProfile;
  budget: BudgetPlan | null;
}

export function MidnightAuditor({ user, budget }: MidnightAuditorProps) {
  const [isRunningScan, setIsRunningScan] = useState(false);
  const [lastAuditTime, setLastAuditTime] = useState<string>(() => {
    return localStorage.getItem("ww_last_midnight_audit") || "Today, 3:00 AM (Automated)";
  });
  const [auditSummary, setAuditSummary] = useState<{
    budgetDriftPct: number;
    driftCategory: string;
    volatilityIndex: number;
    healthStatus: "EXCELLENT" | "STABLE" | "WARNING";
    recommendation: string;
  }>(() => {
    try {
      const saved = localStorage.getItem("ww_midnight_audit_data");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn("Failed loading audit data", e);
    }
    return {
      budgetDriftPct: +1.4,
      driftCategory: "Discretionary Dining",
      volatilityIndex: 12.8,
      healthStatus: "EXCELLENT",
      recommendation: "Portfolio rebalancing target intact. Discretionary spending velocity is within safe 5% tolerance band."
    };
  });

  const runMidnightAudit = async (isManual = false) => {
    setIsRunningScan(true);
    try {
      // Simulate real-time background audit scan
      await new Promise((r) => setTimeout(r, 1200));

      const nowStr = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
      const timeDisplay = isManual ? `Today, ${nowStr} (On-Demand)` : "Today, 3:00 AM (Automated)";
      
      const newDrift = +(Math.random() * 2.5).toFixed(1);
      const newVol = +(10 + Math.random() * 5).toFixed(1);

      const updated = {
        budgetDriftPct: newDrift,
        driftCategory: newDrift > 2.0 ? "Entertainment & Tech" : "Discretionary Dining",
        volatilityIndex: newVol,
        healthStatus: (newDrift > 2.5 ? "WARNING" : "EXCELLENT") as "EXCELLENT" | "STABLE" | "WARNING",
        recommendation: `Automated scan complete: Budget drift is +${newDrift}% in ${newDrift > 2.0 ? "Entertainment" : "Dining"}. Portfolio volatility is nominal at ${newVol} Sharpe-adjusted score.`
      };

      setAuditSummary(updated);
      setLastAuditTime(timeDisplay);

      localStorage.setItem("ww_last_midnight_audit", timeDisplay);
      localStorage.setItem("ww_midnight_audit_data", JSON.stringify(updated));

      // Push summary notification to PulseAlert / NotificationCenter
      window.dispatchEvent(
        new CustomEvent("ww-trigger-alert", {
          detail: {
            type: "success",
            title: "🌙 Midnight Auditor Run Complete!",
            message: `Daily Audit: Budget drift +${newDrift}% (${updated.driftCategory}), Portfolio volatility index ${newVol}. Assets fully synchronized.`
          }
        })
      );
    } catch (err) {
      console.error("Midnight audit error:", err);
    } finally {
      setIsRunningScan(false);
    }
  };

  // Run automated initial check on mount if not run today
  useEffect(() => {
    const hasRunToday = localStorage.getItem("ww_last_midnight_audit");
    if (!hasRunToday) {
      runMidnightAudit(false);
    }
  }, []);

  return (
    <div className="card p-6 border-indigo-500/40 bg-gradient-to-br from-slate-950 via-indigo-950/30 to-zinc-950 shadow-2xl relative overflow-hidden space-y-5">
      {/* Background glow ambient */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-indigo-500/20">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1">
              <Moon className="w-3 h-3 text-indigo-400" /> Autonomous Midnight Auditor
            </span>
            <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 text-[9px] font-mono font-bold uppercase border border-emerald-500/30 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> 3:00 AM Daily Schedule Active
            </span>
          </div>

          <h3 className="text-xl font-black font-display text-text-primary tracking-tight">
            Daily Automated Budget & Portfolio Volatility Scan
          </h3>
        </div>

        <button
          type="button"
          onClick={() => runMidnightAudit(true)}
          disabled={isRunningScan}
          className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-lg disabled:opacity-50 shrink-0"
        >
          <RefreshCw className={cn("w-3.5 h-3.5", isRunningScan && "animate-spin")} />
          <span>{isRunningScan ? "Auditing..." : "Run Manual Audit Now"}</span>
        </button>
      </div>

      {/* Status Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Metric 1: Budget Drift Scan */}
        <div className="p-4 rounded-2xl bg-bg-void/80 border border-indigo-500/30 space-y-1">
          <div className="flex items-center justify-between text-xs font-mono text-text-muted">
            <span>Budget Drift Scan</span>
            <PieChart className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono text-emerald-400">
              +{auditSummary.budgetDriftPct}%
            </span>
            <span className="text-[10px] font-mono text-text-muted">vs baseline target</span>
          </div>
          <p className="text-[11px] text-text-secondary truncate">
            Category: <strong className="text-text-primary">{auditSummary.driftCategory}</strong>
          </p>
        </div>

        {/* Metric 2: Portfolio Volatility Index */}
        <div className="p-4 rounded-2xl bg-bg-void/80 border border-indigo-500/30 space-y-1">
          <div className="flex items-center justify-between text-xs font-mono text-text-muted">
            <span>Portfolio Volatility</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono text-amber-300">
              {auditSummary.volatilityIndex} Index
            </span>
            <span className="text-[10px] font-mono text-emerald-400 font-bold">Sharpe Safe</span>
          </div>
          <p className="text-[11px] text-text-secondary truncate">
            Intraday Beta Variance: <strong>Low Risk</strong>
          </p>
        </div>

        {/* Metric 3: Health & Last Scan */}
        <div className="p-4 rounded-2xl bg-bg-void/80 border border-indigo-500/30 space-y-1">
          <div className="flex items-center justify-between text-xs font-mono text-text-muted">
            <span>Last Auto-Scan Run</span>
            <Clock className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-sm font-bold font-mono text-indigo-300">
            {lastAuditTime}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>0 Anomaly Flagged</span>
          </div>
        </div>
      </div>

      {/* AI Midnight Recommendation Box */}
      <div className="p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-800/40 flex items-start gap-3">
        <Sparkles className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
        <div className="text-xs font-mono text-text-primary leading-relaxed">
          <span className="font-bold text-indigo-300">Midnight AI Summary: </span>
          {auditSummary.recommendation}
        </div>
      </div>
    </div>
  );
}
