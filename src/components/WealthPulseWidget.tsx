import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Zap, 
  Globe, 
  Sparkles, 
  RefreshCw, 
  DollarSign, 
  BarChart2, 
  Flame, 
  AlertCircle 
} from "lucide-react";
import { UserProfile } from "../types";
import { cn, formatCurrency } from "../lib/utils";
import { CURRENCIES } from "../constants";

interface WealthPulseWidgetProps {
  user: UserProfile;
}

export interface TickerItem {
  id: string;
  symbol: string;
  name: string;
  category: "EQUITY" | "MACRO" | "CRYPTO" | "COMMODITY";
  price: number;
  changePercent: number;
  direction: "UP" | "DOWN";
  volume: string;
}

export interface MarketEvent {
  id: string;
  time: string;
  title: string;
  impact: "BULLISH" | "BEARISH" | "NEUTRAL";
  source: string;
}

export function WealthPulseWidget({ user }: WealthPulseWidgetProps) {
  const currency = CURRENCIES[user.currency] || CURRENCIES.USD;

  // Initial ticker data
  const [tickers, setTickers] = useState<TickerItem[]>([
    { id: "sp500", symbol: "S&P 500", name: "S&P 500 Index", category: "EQUITY", price: 5482.10, changePercent: +0.85, direction: "UP", volume: "3.2B" },
    { id: "nasdaq", symbol: "NASDAQ", name: "Tech Composite", category: "EQUITY", price: 17820.45, changePercent: +1.42, direction: "UP", volume: "4.8B" },
    { id: "gold", symbol: "XAU/USD", name: "Spot Gold", category: "COMMODITY", price: 2420.80, changePercent: +0.32, direction: "UP", volume: "850M" },
    { id: "btc", symbol: "BTC/USD", name: "Bitcoin Core", category: "CRYPTO", price: 67450.00, changePercent: +3.18, direction: "UP", volume: "28B" },
    { id: "eth", symbol: "ETH/USD", name: "Ethereum", category: "CRYPTO", price: 3510.20, changePercent: -0.65, direction: "DOWN", volume: "14B" },
    { id: "treasury", symbol: "US10Y", name: "10Y Treasury Yield", category: "MACRO", price: 4.18, changePercent: -1.12, direction: "DOWN", volume: "Macro" },
    { id: "oil", symbol: "WTI CRUDE", name: "Crude Oil Futures", category: "COMMODITY", price: 78.40, changePercent: -0.88, direction: "DOWN", volume: "1.2B" },
    { id: "nvda", symbol: "NVDA", name: "AI Tech Index", category: "EQUITY", price: 124.50, changePercent: +4.25, direction: "UP", volume: "9.2B" },
  ]);

  const [marketEvents, setMarketEvents] = useState<MarketEvent[]>([
    { id: "ev-1", time: "2m ago", title: "⚡ Fed Signals Rate Cut Outlook as Core Inflation Cools to 2.1%", impact: "BULLISH", source: "Global Macro Desk" },
    { id: "ev-2", time: "12m ago", title: "🚀 Tech Sector Leads Global Rally Driven by AI Enterprise Capex", impact: "BULLISH", source: "Silicon Valley Wire" },
    { id: "ev-3", time: "28m ago", title: "📊 Spot Gold Touches $2,420 High Amid Sovereign Asset Diversification", impact: "NEUTRAL", source: "Commodities Exchange" },
    { id: "ev-4", time: "45m ago", title: "📈 Bitcoin Reclaims $67K as ETF Institutional Inflows Surge 18%", impact: "BULLISH", source: "Crypto Ledger Pulse" },
  ]);

  const [filter, setFilter] = useState<"ALL" | "EQUITY" | "MACRO" | "CRYPTO" | "COMMODITY">("ALL");
  const [activeTickId, setActiveTickId] = useState<string | null>(null);

  // Simulate real-time ticker updates every 2.5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setTickers(prev => prev.map(t => {
        // Random small tick move between -0.4% and +0.4%
        const delta = (Math.random() - 0.48) * 0.8;
        const newPrice = Math.max(1, t.price * (1 + delta / 100));
        const newChange = t.changePercent + delta;
        const isUp = delta >= 0;

        return {
          ...t,
          price: Number(newPrice.toFixed(2)),
          changePercent: Number(newChange.toFixed(2)),
          direction: isUp ? "UP" : "DOWN"
        };
      }));

      // Randomly pulse a random ticker
      const randomIdx = Math.floor(Math.random() * tickers.length);
      setActiveTickId(tickers[randomIdx]?.id || null);
    }, 2500);

    return () => clearInterval(interval);
  }, [tickers.length]);

  const filteredTickers = filter === "ALL" ? tickers : tickers.filter(t => t.category === filter);

  return (
    <div className="card p-6 sm:p-8 border-accent-gold/40 bg-gradient-to-br from-bg-secondary via-bg-primary to-bg-secondary/95 space-y-6 shadow-2xl relative overflow-hidden font-sans">
      {/* Background glow effect */}
      <div className="absolute top-0 right-1/4 w-80 h-80 bg-accent-gold/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-accent-gold/20 text-accent-gold border border-accent-gold/40 shadow-lg relative">
            <Activity className="w-6 h-6 animate-pulse" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold font-display text-text-primary">
                Wealth Pulse • Real-Time Global Market Ticker
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold uppercase border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> LIVE STREAM
              </span>
            </div>
            <p className="text-xs text-text-secondary mt-0.5">
              Simulated real-time streaming terminal for global equities, macro yield curves, commodities, and digital assets.
            </p>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-1.5 bg-bg-void/90 p-1 rounded-xl border border-border/60 self-start sm:self-auto overflow-x-auto max-w-full scrollbar-none">
          {(["ALL", "EQUITY", "MACRO", "CRYPTO", "COMMODITY"] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={cn(
                "px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase transition-all cursor-pointer whitespace-nowrap",
                filter === cat
                  ? "bg-accent-gold text-slate-950 shadow-md font-black"
                  : "text-text-muted hover:text-text-primary hover:bg-bg-secondary"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Marquee Ticker Tape Banner */}
      <div className="p-3 bg-bg-void/90 border border-border/80 rounded-2xl overflow-hidden relative flex items-center gap-4">
        <div className="flex items-center gap-1.5 text-accent-gold font-mono text-xs font-bold uppercase shrink-0 px-2 py-1 rounded bg-accent-gold/10 border border-accent-gold/30">
          <Flame className="w-3.5 h-3.5 text-amber-400" /> Pulse Marquee
        </div>

        <div className="flex items-center gap-6 overflow-x-auto scrollbar-none py-1 font-mono text-xs text-text-primary shrink-0 animate-marquee">
          {tickers.map((t) => (
            <div key={t.id} className="flex items-center gap-2 shrink-0 border-r border-border/40 pr-6">
              <span className="font-bold text-text-primary">{t.symbol}</span>
              <span className="text-text-muted text-[11px]">${t.price.toLocaleString()}</span>
              <span className={cn(
                "px-1.5 py-0.5 rounded text-[10px] font-bold flex items-center gap-0.5",
                t.direction === "UP" ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
              )}>
                {t.direction === "UP" ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {t.changePercent > 0 ? `+${t.changePercent}%` : `${t.changePercent}%`}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Grid of Interactive Ticker Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {filteredTickers.map((tick) => {
          const isPulsing = activeTickId === tick.id;

          return (
            <motion.div
              key={tick.id}
              animate={isPulsing ? { scale: [1, 1.03, 1] } : {}}
              className={cn(
                "p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 bg-bg-void/90 relative overflow-hidden shadow-xl",
                tick.direction === "UP" ? "hover:border-emerald-500/50" : "hover:border-red-500/50",
                isPulsing ? (tick.direction === "UP" ? "border-emerald-400 shadow-emerald-500/10" : "border-red-400 shadow-red-500/10") : "border-border/80"
              )}
            >
              <div className="flex items-start justify-between gap-1">
                <div>
                  <span className="text-[9px] font-mono text-text-muted uppercase tracking-wider block">
                    {tick.category}
                  </span>
                  <h4 className="font-mono font-bold text-sm text-text-primary truncate">
                    {tick.symbol}
                  </h4>
                </div>

                <span className={cn(
                  "p-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-0.5",
                  tick.direction === "UP" ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
                )}>
                  {tick.direction === "UP" ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                  {tick.changePercent > 0 ? `+${tick.changePercent}%` : `${tick.changePercent}%`}
                </span>
              </div>

              <div className="pt-2 border-t border-border/50 flex items-baseline justify-between font-mono">
                <span className="text-lg font-bold text-text-primary tracking-tight">
                  ${tick.price.toLocaleString()}
                </span>
                <span className="text-[9px] text-text-muted">Vol: {tick.volume}</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Real-Time Major Financial Event Feed */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-accent-gold flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-accent-gold" /> Major Financial News & Macro Events Feed
          </span>
          <span className="text-[10px] font-mono text-text-muted">Updated live in terminal</span>
        </div>

        <div className="space-y-2">
          {marketEvents.map((ev) => (
            <div
              key={ev.id}
              className="p-3 bg-bg-void/80 border border-border/60 hover:border-accent-gold/40 rounded-xl flex items-center justify-between gap-4 transition-all"
            >
              <div className="flex items-center gap-3">
                <span className={cn(
                  "px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase border shrink-0",
                  ev.impact === "BULLISH" ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" : "bg-amber-500/20 text-amber-300 border-amber-500/30"
                )}>
                  {ev.impact}
                </span>

                <p className="text-xs font-sans text-text-primary font-medium line-clamp-1">
                  {ev.title}
                </p>
              </div>

              <div className="text-right shrink-0 font-mono text-[10px] text-text-muted">
                <div>{ev.time}</div>
                <div className="text-[9px] text-accent-gold">{ev.source}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
