import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  X, 
  ArrowRight, 
  Globe,
  Sparkles,
  Zap
} from "lucide-react";
import { cn } from "../lib/utils";

interface CurrencyFluctuationAlertProps {
  activeCurrency: string;
}

const FLUCTUATION_MAP: Record<string, { change24h: number; benchmark: string; note: string }> = {
  INR: { change24h: 0.28, benchmark: "USD/INR", note: "INR stable against DXY index amidst strong foreign institutional inflows." },
  USD: { change24h: -0.42, benchmark: "DXY Dollar Index", note: "US Dollar Index consolidated following dovish bond yield guidance." },
  EUR: { change24h: +0.65, benchmark: "EUR/USD", note: "Euro gained +0.65% against USD following ECB structural balance announcements." },
  GBP: { change24h: +0.31, benchmark: "GBP/USD", note: "Sterling holds resilience across London exchange liquidity clearing." },
  JPY: { change24h: -1.14, benchmark: "USD/JPY", note: "Yen observed 1.14% daily volatility window around BOJ yield curve band changes." }
};

export function CurrencyFluctuationAlert({ activeCurrency }: CurrencyFluctuationAlertProps) {
  const [isVisible, setIsVisible] = useState<boolean>(() => {
    const isDismissed = sessionStorage.getItem(`ww_curr_alert_dismissed_${activeCurrency}`);
    return !isDismissed;
  });

  const currencyInfo = FLUCTUATION_MAP[activeCurrency] || {
    change24h: 0.35,
    benchmark: `${activeCurrency}/USD Benchmark`,
    note: "Global FX rates are updating across sovereign liquidity corridors."
  };

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem(`ww_curr_alert_dismissed_${activeCurrency}`, "true");
  };

  if (!isVisible) return null;

  const isPositive = currencyInfo.change24h >= 0;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="w-full bg-gradient-to-r from-bg-secondary via-bg-card to-bg-secondary border-b border-accent-gold/25 py-2.5 px-4 font-mono text-xs shadow-md relative z-40"
      >
        <div className="container mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5">
            <div className={cn(
              "p-1 rounded-lg border",
              isPositive ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400" : "bg-amber-500/15 border-amber-500/30 text-amber-400"
            )}>
              {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            </div>

            <div className="flex flex-wrap items-center gap-1.5 text-text-primary">
              <span className="font-bold text-accent-gold uppercase tracking-wider">
                24H FX Pulse ({currencyInfo.benchmark}):
              </span>
              <span className={cn("font-black", isPositive ? "text-emerald-400" : "text-amber-400")}>
                {isPositive ? `+${currencyInfo.change24h}%` : `${currencyInfo.change24h}%`}
              </span>
              <span className="text-text-secondary hidden md:inline">
                — {currencyInfo.note}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={() => {
                window.location.hash = "#macropulse";
              }}
              className="px-2.5 py-1 rounded-lg bg-bg-void/80 hover:bg-bg-tertiary border border-border/70 text-text-primary text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1"
            >
              <span>View MacroPulse</span>
              <ArrowRight className="w-3 h-3 text-accent-gold" />
            </button>

            <button
              type="button"
              onClick={handleDismiss}
              className="p-1 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-tertiary transition-all"
              title="Dismiss notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
