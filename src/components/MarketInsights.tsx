import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, TrendingUp, ArrowUpRight, ArrowDownRight, Loader2, BarChart3, ShieldAlert, Wifi } from "lucide-react";
import { getAIResponse } from "../lib/gemini";

export function MarketInsights() {
  const [insight, setInsight] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [marketBias, setMarketBias] = useState<"neutral" | "bull" | "bear">(() => {
    const saved = localStorage.getItem("ww_market_bias");
    return (saved as "neutral" | "bull" | "bear") || "neutral";
  });

  useEffect(() => {
    localStorage.setItem("ww_market_bias", marketBias);
    // Dispatch system-wide event so adjacent modules can dynamically update projections
    const event = new CustomEvent("ww-market-bias", { detail: { bias: marketBias } });
    window.dispatchEvent(event);
  }, [marketBias]);

  useEffect(() => {
    const fetchInsight = async () => {
      setLoading(true);
      try {
        let promptText = "Give me a short, 2-sentence daily financial tip or market insight for today. Make it encouraging and professional.";
        if (marketBias === "bull") {
          promptText = "Give me a short, 2-sentence bullish capital growth strategy tip. Discuss asset allocation during explosive bull runs.";
        } else if (marketBias === "bear") {
          promptText = "Give me a short, 2-sentence defensive portfolio hedge strategy tip for mitigating losses during deep bear corrections.";
        }
        const response = await getAIResponse(promptText);
        setInsight(response);
      } catch (error) {
        if (marketBias === "bull") {
          setInsight("In strong bull markets, momentum is your friend, but profit-taking is your shield. Realize micro-gains periodically.");
        } else if (marketBias === "bear") {
          setInsight("Bear markets test conviction. Accumulating high-interest stable yield deposits and sovereign notes preserves absolute liquidity.");
        } else {
          setInsight("Diversification is the only free lunch in investing. Keep your portfolio balanced across multiple historical cycles!");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchInsight();
  }, [marketBias]);

  // Determine market dynamics based on the selected bias
  const marketData = {
    neutral: {
      greedIndex: 68,
      sentiment: "Greed",
      markets: [
        { name: "S&P 500 Index", value: "5,241.53", change: "+0.86%", up: true },
        { name: "Nasdaq Composite", value: "16,384.47", change: "+1.12%", up: true },
        { name: "Bitcoin Vault", value: "$68,421", change: "-2.45%", up: false },
        { name: "Sovereign Gold SPOT", value: "$2,174.20", change: "+0.34%", up: true },
      ]
    },
    bull: {
      greedIndex: 91,
      sentiment: "Extreme Greed",
      markets: [
        { name: "S&P 500 Index", value: "5,488.12", change: "+4.71%", up: true },
        { name: "Nasdaq Composite", value: "17,295.49", change: "+5.56%", up: true },
        { name: "Bitcoin Vault", value: "$74,850", change: "+9.40%", up: true },
        { name: "Sovereign Gold SPOT", value: "$2,130.10", change: "-1.98%", up: false }, // Cash rotation out of gold
      ]
    },
    bear: {
      greedIndex: 14,
      sentiment: "Extreme Fear",
      markets: [
        { name: "S&P 500 Index", value: "4,895.30", change: "-6.61%", up: false },
        { name: "Nasdaq Composite", value: "14,925.80", change: "-8.90%", up: false },
        { name: "Bitcoin Vault", value: "$52,190", change: "-23.70%", up: false },
        { name: "Sovereign Gold SPOT", value: "$2,342.50", change: "+7.74%", up: true }, // Hedging pressure
      ]
    }
  };

  const activeSet = marketData[marketBias];

  return (
    <div className="card p-8 space-y-8 text-left">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-accent-gold" /> Global Market Intel
          </h3>
          <p className="text-[11px] text-text-muted leading-none">
            Real-time simulated global averages & algorithmic sentiment tracking.
          </p>
        </div>
        
        {/* Toggle Controls: Swaps between normal feed and forced market biases */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-bg-secondary/40 p-1.5 rounded-xl border border-border/80 self-start xl:self-auto">
          <span className="text-[10px] font-bold text-text-muted px-2.5 py-1 uppercase tracking-wider hidden sm:inline-block">Simulation Mode:</span>
          <div className="grid grid-cols-3 gap-1">
            {[
              { id: "neutral" as const, label: "Live Feed", style: "hover:text-text-primary" },
              { id: "bull" as const, label: "Bull Run", style: "text-accent-emerald hover:text-accent-emerald/80" },
              { id: "bear" as const, label: "Bear Stress", style: "text-accent-red hover:text-accent-red/80" }
            ].map((btn) => {
              const active = marketBias === btn.id;
              return (
                <button
                  key={btn.id}
                  onClick={() => setMarketBias(btn.id)}
                  type="button"
                  className={cn(
                    "text-[10px] font-bold uppercase tracking-wider py-1.5 px-3 rounded-lg transition-all cursor-pointer text-center",
                    active 
                      ? "bg-bg-void text-text-primary shadow-sm border border-border" 
                      : `text-text-muted ${btn.style}`
                  )}
                >
                  {btn.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center border-t border-b border-border/40 py-6">
        {/* Sentiment Gauge */}
        <div className="flex items-center justify-between gap-6 bg-bg-secondary/20 p-4 rounded-xl border border-gray-800/60">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Fear & Greed Index</span>
            <div className="text-base font-bold tracking-tight">
              Sentiment:{" "}
              <span className={cn(
                activeSet.greedIndex > 60 ? "text-accent-emerald" : activeSet.greedIndex < 30 ? "text-accent-red" : "text-accent-gold"
              )}>
                {activeSet.sentiment}
              </span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1.5 shrink-0">
            <span className="text-xs font-mono font-bold text-text-secondary">{activeSet.greedIndex} / 100</span>
            <div className="w-24 h-2 bg-bg-void rounded-full overflow-hidden border border-border relative">
              <motion.div 
                layout
                initial={{ width: 0 }}
                animate={{ width: `${activeSet.greedIndex}%` }}
                transition={{ type: "spring", stiffness: 80, damping: 15 }}
                className={cn("h-full", 
                  activeSet.greedIndex > 60 ? "bg-accent-emerald" : activeSet.greedIndex < 30 ? "bg-accent-red" : "bg-accent-gold"
                )}
              />
            </div>
          </div>
        </div>

        {/* Global Connection status */}
        <div className="flex items-center gap-3 bg-bg-secondary/10 p-4 rounded-xl border border-gray-800/40">
          <div className="h-2 w-2 rounded-full bg-accent-emerald animate-pulse shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest flex items-center gap-1.5">
              <Wifi className="w-3.5 h-3.5 text-accent-emerald" /> Core Sandbox Connectivity
            </div>
            <p className="text-[11px] text-text-muted truncate mt-0.5">
              {marketBias === "neutral" ? "Simulating dynamic global liquidity feeds." : `Forcing simulated systematic ${marketBias} market pressure.`}
            </p>
          </div>
        </div>
      </div>

      {/* Elegant, animated, staggered Grid of market assets */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <AnimatePresence mode="popLayout">
          {activeSet.markets.map((m, i) => (
            <motion.div 
              key={`${marketBias}-${m.name}`}
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -10 }}
              transition={{ duration: 0.35, delay: i * 0.05, ease: "easeOut" }}
              className="card p-4 bg-bg-secondary/30 hover:bg-bg-secondary/50 transition-all border border-border/40 hover:border-border-active space-y-1 hover:-translate-y-0.5"
            >
              <div className="text-[10px] text-text-muted font-bold uppercase tracking-wider truncate">{m.name}</div>
              <div className="text-base font-mono font-bold tracking-tight text-text-primary">{m.value}</div>
              <div className={cn("text-xs flex items-center gap-1 font-extrabold", m.up ? "text-accent-emerald" : "text-accent-red")}>
                {m.up ? <ArrowUpRight className="w-3 h-3 stroke-[2.5]" /> : <ArrowDownRight className="w-3 h-3 stroke-[2.5]" />}
                {m.change}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Daily Generative Advice Banner */}
      <div className="p-6 rounded-2xl bg-accent-gold/5 border border-accent-gold/10 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
          <TrendingUp className="w-24 h-24 text-accent-gold" />
        </div>
        <div className="relative z-10 space-y-3">
          <div className="text-xs text-accent-gold font-bold uppercase tracking-widest flex items-center gap-2">
            <Sparkles className="w-3 h-3" /> AI Strategy Advisor
          </div>
          {loading ? (
            <div className="flex items-center gap-2 text-text-secondary italic text-sm">
              <Loader2 className="w-4 h-4 animate-spin text-accent-gold" /> Modeling strategic portfolios...
            </div>
          ) : (
            <p className="text-base font-serif italic text-text-primary leading-relaxed">
              "{insight}"
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

