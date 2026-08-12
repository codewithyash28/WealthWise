import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { 
  Globe, 
  Sparkles, 
  TrendingUp, 
  Loader2, 
  RefreshCw, 
  ShieldCheck, 
  ArrowUpRight, 
  Newspaper,
  Zap,
  Sliders
} from "lucide-react";
import { cn } from "../lib/utils";
import { UserProfile } from "../types";

interface MarketHeadline {
  id: string;
  title: string;
  source: string;
  time: string;
  category: string;
  sentiment: "BULLISH" | "NEUTRAL" | "BEARISH";
}

interface GlobalIntelligenceWidgetProps {
  user: UserProfile;
}

export function GlobalIntelligenceWidget({ user }: GlobalIntelligenceWidgetProps) {
  const [portfolioStrategy, setPortfolioStrategy] = useState<string>("Aggressive Growth Strategy");
  const [volatilitySensitivity, setVolatilitySensitivity] = useState<number>(1.5); // 1.0x, 1.5x, 2.2x, 3.2x
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [impactMap, setImpactMap] = useState<Record<string, string>>({});

  const headlines: MarketHeadline[] = [
    {
      id: "h1",
      title: "Federal Reserve Signals Rate Cut Pause Amid Cooling Core CPI Inflation Data",
      source: "Bloomberg Finance",
      time: "15m ago",
      category: "Macro Monetary Policy",
      sentiment: "BULLISH"
    },
    {
      id: "h2",
      title: "Semiconductor & AI Infrastructure Rallies Following Surge in Cloud Guidance Beats",
      source: "Wall Street Journal",
      time: "42m ago",
      category: "Tech & AI Markets",
      sentiment: "BULLISH"
    },
    {
      id: "h3",
      title: "Global Supply Chain Realignment Drives Fixed Income Yield Adjustments",
      source: "Financial Times",
      time: "1h ago",
      category: "Global Commodities & Debt",
      sentiment: "NEUTRAL"
    }
  ];

  const fetchImpactAnalysis = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/gemini/headline-impact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ headlines, portfolioType: portfolioStrategy })
      });
      const contentType = res.headers.get("content-type") || "";
      if (res.ok && contentType.includes("application/json")) {
        const data = await res.json();
        if (data?.impactAnalyses) {
          setImpactMap(data.impactAnalyses);
        }
      }
    } catch (err) {
      console.warn("Failed fetching headline impacts:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchImpactAnalysis();
  }, [portfolioStrategy]);

  return (
    <div className="card p-6 border-accent-gold/40 bg-bg-secondary/90 space-y-6 shadow-2xl relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border/60">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1">
              <Globe className="w-3 h-3 text-purple-400" /> Global Market Intelligence
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-accent-gold/20 text-accent-gold border border-accent-gold/30 text-[10px] font-mono font-bold uppercase flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-300" /> Gemini AI Impact Engine
            </span>
          </div>
          <h3 className="text-xl font-extrabold font-display text-text-primary tracking-tight mt-1">
            Global Headlines & Portfolio Impact
          </h3>
          <p className="text-xs text-text-secondary mt-0.5">
            Top market signals contextualized specifically for your active asset portfolio allocation.
          </p>
        </div>

        {/* Portfolio Context & Volatility Sensitivity Controls */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-bg-void border border-border/80 rounded-xl px-3 py-1.5 text-xs font-mono">
            <span className="text-text-muted font-bold">Volatility Sensitivity:</span>
            <div className="flex items-center gap-1">
              {[
                { label: "Low (1.0x)", val: 1.0 },
                { label: "Mod (1.5x)", val: 1.5 },
                { label: "High (2.2x)", val: 2.2 },
                { label: "Shock (3.2x)", val: 3.2 },
              ].map((v) => (
                <button
                  key={v.val}
                  type="button"
                  onClick={() => setVolatilitySensitivity(v.val)}
                  className={cn(
                    "px-2 py-0.5 rounded-md text-[10px] font-bold transition-all cursor-pointer",
                    volatilitySensitivity === v.val
                      ? "bg-purple-600 text-white shadow-sm"
                      : "text-text-muted hover:text-text-primary bg-bg-secondary"
                  )}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 bg-bg-void border border-border/80 rounded-xl px-3 py-1.5 text-xs font-mono">
            <Sliders className="w-3.5 h-3.5 text-accent-gold" />
            <select
              value={portfolioStrategy}
              onChange={(e) => setPortfolioStrategy(e.target.value)}
              className="bg-transparent text-text-primary font-bold outline-none cursor-pointer"
            >
              <option value="Aggressive Growth Strategy">Aggressive Growth</option>
              <option value="Balanced Wealth Strategy">Balanced Wealth</option>
              <option value="Conservative Income Preservation">Conservative Income</option>
              <option value="Crypto & Digital Heavy">Crypto Heavy</option>
            </select>
          </div>

          <button
            type="button"
            onClick={fetchImpactAnalysis}
            disabled={isLoading}
            className="p-2.5 bg-accent-gold hover:bg-accent-gold/90 text-bg-void rounded-xl transition-all font-bold cursor-pointer shadow-md disabled:opacity-50 shrink-0"
            title="Re-run Gemini Portfolio Impact Analysis"
          >
            <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
          </button>
        </div>
      </div>

      {/* Headlines List with AI Impact Statements */}
      <div className="space-y-4">
        {headlines.map((item) => (
          <div
            key={item.id}
            className="p-4 bg-bg-void/90 border border-border/80 hover:border-accent-gold/40 rounded-2xl space-y-3 transition-all shadow-md group"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-[10px] font-mono">
                  <span className="text-purple-400 font-bold uppercase tracking-wider">{item.category}</span>
                  <span className="text-text-muted">•</span>
                  <span className="text-text-muted">{item.source} ({item.time})</span>
                </div>
                <h4 className="text-sm font-bold text-text-primary group-hover:text-accent-gold transition-colors leading-snug">
                  {item.title}
                </h4>
              </div>

              <span className={cn(
                "px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase shrink-0 border",
                item.sentiment === "BULLISH" && "bg-emerald-500/15 border-emerald-500/30 text-emerald-300",
                item.sentiment === "NEUTRAL" && "bg-blue-500/15 border-blue-500/30 text-blue-300",
                item.sentiment === "BEARISH" && "bg-rose-500/15 border-rose-500/30 text-rose-300"
              )}>
                {item.sentiment}
              </span>
            </div>

            {/* Gemini 1-Sentence AI Portfolio Impact Box */}
            <div className="p-3 bg-purple-950/30 border border-purple-800/40 rounded-xl space-y-1">
              <div className="flex items-center justify-between text-[10px] font-mono text-purple-300 font-bold">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  Gemini Impact Analysis ({portfolioStrategy} • {volatilitySensitivity}x Sensitivity)
                </span>
                <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-200 border border-purple-500/30">
                  Est Inflation Impact: -{(1.8 * volatilitySensitivity).toFixed(1)}% Yield
                </span>
              </div>

              <p className="text-xs text-text-primary font-mono leading-relaxed pt-0.5">
                {isLoading ? (
                  <span className="text-text-muted italic">Computing portfolio impact delta...</span>
                ) : (
                  impactMap[item.id] || `At ${volatilitySensitivity}x volatility sensitivity, this macro signal indicates maintaining current asset rebalancing targets for your ${portfolioStrategy}.`
                )}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
