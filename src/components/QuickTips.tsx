import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Lightbulb, X, Sparkles, CheckCircle2 } from "lucide-react";
import { cn } from "../lib/utils";

const QUICK_TIPS: Record<string, { title: string; subtitle: string; tips: string[] }> = {
  "#dashboard": {
    title: "Control Dashboard",
    subtitle: "Accelerate your path to Diamond Tier",
    tips: [
      "One-Click AI Audit: Generates deep portfolio analysis powered by Gemini AI.",
      "NetWorth Health Index: Check your calculated score (0-100) based on debt, savings, & literacy.",
      "GitOps Version Control: Click the branch indicator to sync data rules across automated commits.",
      "Strategic Pathing: Toggle DeFi Yield, Bull Market & High Inflation projections."
    ]
  },
  "#networth": {
    title: "NetWorth Real-Time Tracker",
    subtitle: "Manage your assets vs liabilities balance sheets",
    tips: [
      "Click 'Edit Assets' / 'Liabilities': Input real-time values to calculate instant Net Worth.",
      "Real-Time Validation: Input parsers protect the calculation engine from negative overflows.",
      "Historical Auditing: Tracks your balances securely to prevent sudden stress events."
    ]
  },
  "#budget": {
    title: "Budget Planner",
    subtitle: "Build strict budget allocation rules",
    tips: [
      "50/30/20 Guidelines: Allocates your income into Needs, Wants, and Savings rules automatically.",
      "Alert Threshold limits: Set spending limits per category to receive warning toasts.",
      "Persistent Memory: All changes commit locally directly into your browser's persistent cache."
    ]
  },
  "#simulator": {
    title: "Investment Simulator & Custom Goals",
    subtitle: "Harness compound interest",
    tips: [
      "SIP Calculator: Shows how small recurring contributions turn into millions over time.",
      "Custom Goals Planner: Add custom labels, specific target amounts, and deadline dates.",
      "Rule of 72: Divide 72 by rate of return to estimate doubling periods in years."
    ]
  },
  "#macropulse": {
    title: "MacroPulse Simulation",
    subtitle: "Stress test cash vs investments",
    tips: [
      "Inflation Erosion: Slide inflation sliders up to 15% to check real-time cash degradation.",
      "Real Yield Metrics: Visualizes true purchasing power of cash vs balanced investments.",
      "Smart Tactics: Learn standard central bank hedges & rebalancing techniques."
    ]
  },
  "#trendmarket": {
    title: "TrendMarket Signals",
    subtitle: "Interactive swing & pop-culture indexes",
    tips: [
      "Interactive Indicators: Simulated assets with high-contrast real-time volatility graphs.",
      "Fear & Greed Sentiment: Measures current swing momentum for smart dollar-cost averaging.",
      "Stress Conditions: Simulates bubbles, bear corrections & rising rates to gauge stability."
    ]
  },
  "#liveorlease": {
    title: "LiveOrLease Arbitrage",
    subtitle: "Rent vs buy primary property in India",
    tips: [
      "Complete Math Mode: Compares EMIs, renting rates, property appreciations & down payments.",
      "Real-World Presets: Tailored default prices for metro markets.",
      "Cumulative Outcomes: Displays absolute cash difference over 10-year holding terms."
    ]
  },
  "#mockyield": {
    title: "MockYield APY Tracker",
    subtitle: "Gamified stable yield protocols",
    tips: [
      "DeFi Staking: Interactive simulation of dynamic staking protocols (Ethereum, Solana, USDC).",
      "Smart Risk Ratings: Shows APY vs potential security smart-contract risk.",
      "Projection Matrices: Multi-year interest compounding calculations."
    ]
  },
  "#portfolio": {
    title: "Portfolio Overview",
    subtitle: "Interactive balance metrics",
    tips: [
      "Dynamic Guard: Enter configurable alarm limits to watch holdings.",
      "Decline Monitoring: Triggers high-priority risk alerts if any asset drops past your threshold limit."
    ]
  }
};

interface QuickTipsProps {
  hash: string;
}

export function QuickTips({ hash }: QuickTipsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close popover when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const activeInfo = QUICK_TIPS[hash] || {
    title: "WealthWise Elite Hub",
    subtitle: "Your sandbox for microeconomics & literacy",
    tips: [
      "Version Control: Use the GitOps branch features to manage your learning roadmap.",
      "Quiz Challenges: Test your knowledge inside the literacy command center to claim achievements.",
      "DeFi & Real Estate: Choose micro-courses below to simulate real-world asset behaviors."
    ]
  };

  return (
    <div className="fixed bottom-6 left-6 z-[100] flex flex-col items-start gap-4">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={popoverRef}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="card w-80 md:w-96 shadow-2xl border-accent-gold/20 backdrop-blur-2xl bg-bg-void/90 p-6 space-y-4 text-left"
          >
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-accent-gold" />
                <div>
                  <h3 className="font-bold text-sm tracking-tight text-text-primary">Quick Learning Tips</h3>
                  <p className="text-[10px] text-text-muted uppercase tracking-widest font-bold">Scope of: {activeInfo.title}</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg hover:bg-bg-secondary text-text-muted hover:text-text-primary transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5 py-1">
              <p className="text-[11px] text-accent-gold font-medium leading-relaxed italic">
                "{activeInfo.subtitle}"
              </p>
              <div className="space-y-3">
                {activeInfo.tips.map((tip, index) => {
                  const parts = tip.split(":");
                  const boldPart = parts[0];
                  const restPart = parts.slice(1).join(":");
                  return (
                    <div key={index} className="flex items-start gap-2.5">
                      <div className="w-4 h-4 rounded-full bg-accent-gold/10 flex items-center justify-center text-accent-gold shrink-0 mt-0.5">
                        <CheckCircle2 className="w-2.5 h-2.5 stroke-[2.5]" />
                      </div>
                      <p className="text-xs text-text-secondary leading-relaxed">
                        {restPart ? (
                          <>
                            <strong className="text-text-primary font-bold">{boldPart}:</strong>
                            {restPart}
                          </>
                        ) : (
                          tip
                        )}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-3 border-t border-border flex items-center justify-between text-[10px] text-text-muted font-mono bg-bg-secondary/10 px-2 py-1 rounded-lg">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-accent-gold animation-pulse" /> Sandbox Mode
              </span>
              <span>Updated live</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "px-4 py-2.5 rounded-full flex items-center gap-2 shadow-2xl transition-all hover:scale-105 active:scale-95 group border border-accent-gold/30 cursor-pointer font-bold select-none text-xs tracking-wider uppercase",
          isOpen ? "bg-bg-secondary text-text-primary" : "bg-bg-void hover:bg-zinc-900 border-accent-gold/30 text-accent-gold hover:border-accent-gold/60"
        )}
      >
        <Lightbulb className="w-4 h-4 text-accent-gold group-hover:rotate-12 transition-transform" />
        <span>Quick Tips</span>
      </button>
    </div>
  );
}
