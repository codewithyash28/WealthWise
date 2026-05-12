import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Sparkles, TrendingUp, ArrowUpRight, ArrowDownRight, Loader2 } from "lucide-react";
import { getAIResponse } from "../lib/gemini";

export function MarketInsights() {
  const [insight, setInsight] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInsight = async () => {
      try {
        const response = await getAIResponse("Give me a short, 2-sentence daily financial tip or market insight for today. Make it encouraging and professional.");
        setInsight(response);
      } catch (error) {
        setInsight("Diversification is the only free lunch in investing. Keep your portfolio balanced!");
      } finally {
        setLoading(false);
      }
    };
    fetchInsight();
  }, []);

  const mockMarkets = [
    { name: "S&P 500", value: "5,241.53", change: "+0.86%", up: true },
    { name: "Nasdaq", value: "16,384.47", change: "+1.12%", up: true },
    { name: "Bitcoin", value: "$68,421", change: "-2.45%", up: false },
    { name: "Gold", value: "$2,174.20", change: "+0.34%", up: true },
  ];

  const greedIndex = 68; // Greed

  return (
    <div className="card p-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-accent-gold" /> Global Market Intel
        </h3>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="text-[10px] text-text-muted uppercase tracking-widest font-bold text-right hidden sm:block">
              Market Sentiment<br />
              <span className={cn(greedIndex > 60 ? "text-accent-emerald" : greedIndex < 40 ? "text-accent-red" : "text-accent-gold")}>
                {greedIndex > 60 ? "Greed" : greedIndex < 40 ? "Fear" : "Neutral"}
              </span>
            </div>
            <div className="w-16 h-2 bg-bg-secondary rounded-full overflow-hidden border border-border">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${greedIndex}%` }}
                className={cn("h-full transition-all", greedIndex > 60 ? "bg-accent-emerald" : greedIndex < 40 ? "bg-accent-red" : "bg-accent-gold")}
              />
            </div>
          </div>
          <div className="text-[10px] text-text-muted uppercase tracking-widest font-bold bg-bg-secondary px-3 py-1 rounded-full border border-border">Live Simulation</div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        {mockMarkets.map((m, i) => (
          <div key={i} className="card p-4 bg-bg-secondary/30 hover:bg-bg-secondary/50 transition-colors border-border/40 space-y-1">
            <div className="text-[10px] text-text-muted font-bold uppercase tracking-wider">{m.name}</div>
            <div className="text-lg font-mono font-bold tracking-tight">{m.value}</div>
            <div className={cn("text-xs flex items-center gap-1 font-bold", m.up ? "text-accent-emerald" : "text-accent-red")}>
              {m.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {m.change}
            </div>
          </div>
        ))}
      </div>

      <div className="p-6 rounded-2xl bg-accent-gold/5 border border-accent-gold/10 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <TrendingUp className="w-24 h-24 text-accent-gold" />
        </div>
        <div className="relative z-10 space-y-3">
          <div className="text-xs text-accent-gold font-bold uppercase tracking-widest flex items-center gap-2">
            <Sparkles className="w-3 h-3" /> AI Wisdom of the Day
          </div>
          {loading ? (
            <div className="flex items-center gap-2 text-text-secondary italic">
              <Loader2 className="w-4 h-4 animate-spin" /> Consulting the markets...
            </div>
          ) : (
            <p className="text-lg font-serif italic text-text-primary leading-relaxed">
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
