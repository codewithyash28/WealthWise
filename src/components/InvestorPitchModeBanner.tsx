import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Trophy, TrendingUp, Sparkles, ShieldCheck, Download, 
  BarChart2, Presentation, X, ArrowUpRight, Eye, CheckCircle2 
} from "lucide-react";
import { SupportedCurrency, formatRevenueValue, formatStandardCurrency } from "../lib/revenueUtils";
import { cn } from "../lib/utils";

interface InvestorPitchModeBannerProps {
  isPitchMode: boolean;
  onTogglePitchMode: () => void;
  currency: SupportedCurrency;
  onOpenEvidenceEngine: () => void;
  onOpenExecutiveReport: () => void;
}

export function InvestorPitchModeBanner({
  isPitchMode,
  onTogglePitchMode,
  currency,
  onOpenEvidenceEngine,
  onOpenExecutiveReport,
}: InvestorPitchModeBannerProps) {
  if (!isPitchMode) {
    return (
      <div className="flex items-center justify-end px-4 py-2">
        <button
          type="button"
          onClick={onTogglePitchMode}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-accent-gold/20 via-amber-500/20 to-accent-emerald/20 border border-accent-gold/40 hover:border-accent-gold text-accent-gold text-xs font-mono font-bold transition-all shadow-sm hover:scale-105 cursor-pointer"
          title="Enter Investor Presentation / Pitch & Demo Mode"
        >
          <Presentation className="w-3.5 h-3.5 text-accent-gold animate-pulse" />
          <span>Launch Pitch & Demo Mode 🚀</span>
        </button>
      </div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="w-full bg-gradient-to-r from-slate-950 via-bg-secondary to-slate-950 border-b border-accent-gold/40 shadow-2xl p-4 sticky top-14 z-40 backdrop-blur-xl"
      >
        <div className="container mx-auto flex flex-col lg:flex-row items-center justify-between gap-4">
          
          {/* Left Title & Status */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-accent-gold/20 border border-accent-gold/50 flex items-center justify-center text-accent-gold font-bold shrink-0">
              <Presentation className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-display font-black text-text-primary tracking-tight">
                  Wexa AI Sovereign Investor Showcase
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-[10px] font-mono font-bold uppercase flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> XPRIZE Audited
                </span>
              </div>
              <p className="text-[11px] text-text-muted font-mono">
                Real-time verified revenue streams • B2B licenses & autonomous execution
              </p>
            </div>
          </div>

          {/* Center Metric Chips */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 font-mono">
            <div className="px-3 py-1.5 rounded-xl bg-bg-card border border-border/80 text-center">
              <div className="text-[10px] text-text-muted uppercase">Verified MRR</div>
              <div className="text-xs sm:text-sm font-bold text-accent-gold">
                {formatRevenueValue(2053560, currency, true)}/mo
              </div>
            </div>

            <div className="px-3 py-1.5 rounded-xl bg-bg-card border border-border/80 text-center">
              <div className="text-[10px] text-text-muted uppercase">Annual Run Rate</div>
              <div className="text-xs sm:text-sm font-bold text-accent-emerald">
                {formatRevenueValue(24642720, currency, true)}
              </div>
            </div>

            <div className="px-3 py-1.5 rounded-xl bg-bg-card border border-border/80 text-center">
              <div className="text-[10px] text-text-muted uppercase">Gross Margin</div>
              <div className="text-xs sm:text-sm font-bold text-accent-cyan">
                94.2% Net
              </div>
            </div>

            <div className="px-3 py-1.5 rounded-xl bg-bg-card border border-border/80 text-center">
              <div className="text-[10px] text-text-muted uppercase">Paid Accounts</div>
              <div className="text-xs sm:text-sm font-bold text-purple-400">
                1,480 Users
              </div>
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 shrink-0 font-mono text-xs">
            <button
              type="button"
              onClick={onOpenEvidenceEngine}
              className="px-3 py-1.5 rounded-xl bg-accent-gold text-slate-950 font-bold hover:bg-accent-gold/90 transition-all flex items-center gap-1.5 shadow-md cursor-pointer"
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span>Evidence Engine</span>
            </button>

            <button
              type="button"
              onClick={onOpenExecutiveReport}
              className="px-3 py-1.5 rounded-xl bg-bg-card border border-border hover:border-accent-cyan text-accent-cyan font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>P&L Report</span>
            </button>

            <button
              type="button"
              onClick={onTogglePitchMode}
              className="p-1.5 rounded-xl bg-bg-void border border-border hover:bg-bg-tertiary text-text-muted hover:text-text-primary transition-all cursor-pointer"
              title="Exit Pitch Mode"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

        </div>
      </motion.div>
    </AnimatePresence>
  );
}
