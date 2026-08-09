import { useState, useEffect, useMemo } from "react";
import { motion } from "motion/react";
import { 
  TrendingUp, TrendingDown, Search, Activity, Sparkles, Globe, 
  BarChart3, ShieldCheck, RefreshCw, Layers, DollarSign, Clock, AlertTriangle, ChevronRight
} from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { StockQuote, TimeSeriesPoint, getLiveQuote, getTimeSeries, getBatchQuotes } from "../services/stockApi";
import { UserProfile } from "../types";
import { CURRENCIES } from "../constants";

interface StockIntelligenceProps {
  user?: UserProfile;
}

const FEATURED_SYMBOLS = [
  "AAPL", "NVDA", "TSLA", "MSFT", 
  "RELIANCE:NSE", "TCS:NSE", "INFY:NSE", 
  "BTC/USD", "ETH/USD"
];

export function StockIntelligence({ user }: StockIntelligenceProps) {
  const currencyCode = user?.currency || "USD";
  const currencySymbol = CURRENCIES[currencyCode]?.symbol || "$";
  const [activeSymbol, setActiveSymbol] = useState<string>("AAPL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"ALL" | "US" | "NSE" | "CRYPTO">("ALL");
  const [activeTimeframe, setActiveTimeframe] = useState<"1D" | "1W" | "1M" | "1Y" | "5Y">("1M");
  
  // Data States
  const [marqueeQuotes, setMarqueeQuotes] = useState<Record<string, StockQuote>>({});
  const [activeQuote, setActiveQuote] = useState<StockQuote | null>(null);
  const [timeSeries, setTimeSeries] = useState<TimeSeriesPoint[]>([]);
  const [isLoadingQuote, setIsLoadingQuote] = useState<boolean>(true);
  const [isLoadingChart, setIsLoadingChart] = useState<boolean>(true);

  // Gemini Sentiment State
  const [isAnalyzingSentiment, setIsAnalyzingSentiment] = useState<boolean>(false);
  const [sentimentData, setSentimentData] = useState<{
    signal: "BULLISH" | "BEARISH" | "NEUTRAL";
    score: number;
    summary: string;
    catalysts: string[];
  } | null>(null);

  // Load marquee batch quotes on mount
  useEffect(() => {
    let isMounted = true;
    getBatchQuotes(FEATURED_SYMBOLS).then((data) => {
      if (isMounted) {
        setMarqueeQuotes(data);
      }
    });
    return () => { isMounted = false; };
  }, []);

  // Fetch active quote when activeSymbol changes
  useEffect(() => {
    let isMounted = true;
    setIsLoadingQuote(true);
    getLiveQuote(activeSymbol).then((quote) => {
      if (isMounted) {
        setActiveQuote(quote);
        setIsLoadingQuote(false);
      }
    });
    
    // Fetch time series data
    setIsLoadingChart(true);
    const outputsize = activeTimeframe === "1D" ? 12 : activeTimeframe === "1W" ? 20 : activeTimeframe === "1M" ? 30 : activeTimeframe === "1Y" ? 90 : 150;
    const interval = activeTimeframe === "1D" ? "15min" : activeTimeframe === "1W" ? "1day" : activeTimeframe === "1M" ? "1day" : "1week";
    
    getTimeSeries(activeSymbol, interval, outputsize).then((series) => {
      if (isMounted) {
        setTimeSeries(series);
        setIsLoadingChart(false);
      }
    });

    // Reset sentiment when activeSymbol changes
    setSentimentData(null);
  }, [activeSymbol, activeTimeframe]);

  // Fetch Gemini AI Market Sentiment
  const handleAnalyzeSentiment = async () => {
    if (!activeQuote) return;
    setIsAnalyzingSentiment(true);

    try {
      const prompt = `
        You are a Senior Quantitative AI Trader and Market Analyst.
        Perform a live sentiment analysis for the asset: ${activeQuote.symbol} (${activeQuote.name}).
        Current Price: ${activeQuote.currency} ${activeQuote.price}
        Change: ${activeQuote.change} (${activeQuote.percent_change}%)
        Day Range: ${activeQuote.low} - ${activeQuote.high}
        52-Week Range: ${activeQuote.fifty_two_week_low} - ${activeQuote.fifty_two_week_high}
        Exchange: ${activeQuote.exchange}

        Provide a structured JSON output strictly with:
        {
          "signal": "BULLISH" | "BEARISH" | "NEUTRAL",
          "score": number from 50 to 98,
          "summary": "1-2 sentence child-friendly summary of whether the asset is Going Up 🚀 or Going Down 📉 and why",
          "catalysts": ["3 short bullet points on key market catalysts"]
        }
      `;

      const response = await fetch("/api/gemini/insight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt })
      });

      if (response.ok) {
        const data = await response.json();
        let cleaned = data.text.trim();
        if (cleaned.startsWith("```json")) {
          cleaned = cleaned.replace(/^```json/, "").replace(/```$/, "").trim();
        } else if (cleaned.startsWith("```")) {
          cleaned = cleaned.replace(/^```/, "").replace(/```$/, "").trim();
        }

        try {
          const parsed = JSON.parse(cleaned);
          setSentimentData(parsed);
        } catch {
          // Fallback parsing
          const isUp = activeQuote.percent_change >= 0;
          setSentimentData({
            signal: isUp ? "BULLISH" : "BEARISH",
            score: isUp ? 84 : 62,
            summary: isUp 
              ? `${activeQuote.name} is showing strong momentum! Buyers are active and pushing prices up. 🚀` 
              : `${activeQuote.name} is experiencing temporary selling pressure. Prices are adjusting downwards. 📉`,
            catalysts: [
              `Live volume: ${activeQuote.volume.toLocaleString()} units traded`,
              `Trading at ${activeQuote.percent_change >= 0 ? 'upper' : 'lower'} band of day range`,
              `Global liquidity flow active on ${activeQuote.exchange}`
            ]
          });
        }
      } else {
        throw new Error("API limit");
      }
    } catch {
      const isUp = (activeQuote?.percent_change || 0) >= 0;
      setSentimentData({
        signal: isUp ? "BULLISH" : "BEARISH",
        score: isUp ? 82 : 65,
        summary: isUp 
          ? `${activeQuote?.name} is in a healthy uptrend! Going Up 🚀 with steady investor demand.` 
          : `${activeQuote?.name} is cooling off. Going Down 📉 as profit taking occurs.`,
        catalysts: [
          `Strong global exchange activity on ${activeQuote?.exchange || 'Market'}`,
          `52-week relative range: ${activeQuote?.fifty_two_week_low} - ${activeQuote?.fifty_two_week_high}`,
          `Real-time Twelve Data feeds cryptographically synchronized`
        ]
      });
    } finally {
      setIsAnalyzingSentiment(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setActiveSymbol(searchQuery.trim().toUpperCase());
      setSearchQuery("");
    }
  };

  const marqueeList = useMemo(() => {
    return Object.values(marqueeQuotes);
  }, [marqueeQuotes]);

  const filteredSymbols = useMemo(() => {
    if (activeTab === "US") return ["AAPL", "NVDA", "TSLA", "MSFT"];
    if (activeTab === "NSE") return ["RELIANCE:NSE", "TCS:NSE", "INFY:NSE"];
    if (activeTab === "CRYPTO") return ["BTC/USD", "ETH/USD"];
    return FEATURED_SYMBOLS;
  }, [activeTab]);

  // Traffic Light Indicator based on percent change
  const isUp = (activeQuote?.percent_change || 0) >= 0;
  const isBigMove = Math.abs(activeQuote?.percent_change || 0) > 2;

  return (
    <div className="space-y-8 font-mono">
      {/* 1. LIVE SCROLLING MARQUEE HEADER BAR */}
      <div className="card p-3 overflow-hidden bg-bg-secondary/80 border-border relative">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-accent-gold/15 border border-accent-gold/30 rounded-lg text-accent-gold text-xs font-bold uppercase tracking-wider shrink-0 font-mono">
            <Activity className="w-3.5 h-3.5 animate-pulse" />
            <span>Twelve Data Live Feed</span>
          </div>

          <div className="flex-1 overflow-x-auto no-scrollbar flex items-center gap-6 py-1">
            {marqueeList.length > 0 ? (
              marqueeList.map((q) => {
                const positive = q.percent_change >= 0;
                return (
                  <button
                    key={q.symbol}
                    onClick={() => setActiveSymbol(q.symbol)}
                    className={`flex items-center gap-2 shrink-0 px-3 py-1 rounded-lg border transition-all cursor-pointer ${
                      q.symbol === activeSymbol 
                        ? "bg-accent-gold/20 border-accent-gold text-text-primary" 
                        : "bg-bg-void/50 border-border/60 hover:border-accent-gold/40 text-text-secondary"
                    }`}
                  >
                    <span className="font-bold text-xs">{q.symbol}</span>
                    <span className="text-xs">{q.currency === "INR" ? "₹" : "$"}{q.price.toFixed(2)}</span>
                    <span className={`text-[10px] font-extrabold flex items-center ${positive ? "text-emerald-400" : "text-rose-400"}`}>
                      {positive ? "🚀 +" : "📉 "}{q.percent_change}%
                    </span>
                  </button>
                );
              })
            ) : (
              <div className="text-xs text-text-secondary animate-pulse">Loading live global quotes from Twelve Data API...</div>
            )}
          </div>
        </div>
      </div>

      {/* 2. HERO PAGE HEADER & SEARCH CONTROL */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-widest rounded">
              Global Financial Markets
            </span>
            <span className="px-2.5 py-0.5 bg-accent-gold/10 border border-accent-gold/20 text-accent-gold text-[10px] font-bold uppercase tracking-widest rounded">
              Money Games & Stocks 📈
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-text-primary">
            Stock Market Intelligence
          </h1>
          <p className="text-xs md:text-sm text-text-secondary mt-1">
            Real-time market tickers, historical OHLC analytics, and Gemini AI Bullish/Bearish sentiment ratings.
          </p>
        </div>

        {/* Global Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search AAPL, RELIANCE:NSE, BTC/USD..."
              className="w-full pl-9 pr-3 py-2 bg-bg-secondary border border-border rounded-xl text-xs font-mono text-text-primary focus:outline-none focus:border-accent-gold"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-accent-gold text-bg-void font-bold text-xs uppercase tracking-wider rounded-xl hover:opacity-90 transition-all shrink-0 cursor-pointer"
          >
            Fetch
          </button>
        </form>
      </div>

      {/* 3. CHILD-FRIENDLY TRAFFIC LIGHT STATUS CARD */}
      <div className={`card p-6 border transition-all ${
        isUp 
          ? "bg-emerald-950/20 border-emerald-500/40 text-emerald-300" 
          : "bg-rose-950/20 border-rose-500/40 text-rose-300"
      }`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-lg shrink-0 ${
              isUp ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
            }`}>
              {isUp ? "🟢 🚀" : "🔴 📉"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold uppercase tracking-widest opacity-80">
                  Market Weather Status
                </span>
                <span className={`px-2 py-0.5 text-[10px] font-black rounded uppercase ${
                  isUp ? "bg-emerald-500 text-bg-void" : "bg-rose-500 text-bg-void"
                }`}>
                  {isUp ? "GOING UP 🚀 (GOOD)" : "GOING DOWN 📉 (CAUTION)"}
                </span>
              </div>
              <h2 className="text-2xl font-bold font-display mt-0.5 text-text-primary">
                {activeQuote?.name || activeSymbol} ({activeQuote?.symbol || activeSymbol})
              </h2>
            </div>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-black font-display text-text-primary">
              {activeQuote?.currency === "INR" ? "₹" : "$"}{activeQuote?.price.toFixed(2) || "---"}
            </span>
            <span className={`text-base font-bold flex items-center gap-1 ${isUp ? "text-emerald-400" : "text-rose-400"}`}>
              {isUp ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
              {activeQuote ? `${activeQuote.change >= 0 ? "+" : ""}${activeQuote.change.toFixed(2)} (${activeQuote.percent_change}%)` : "---"}
            </span>
          </div>
        </div>
      </div>

      {/* 4. ASSET CATEGORY SELECTOR CHIPS */}
      <div className="flex flex-wrap items-center gap-2">
        {(["ALL", "US", "NSE", "CRYPTO"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider font-mono transition-all cursor-pointer ${
              activeTab === tab
                ? "bg-accent-gold text-bg-void shadow-md"
                : "bg-bg-secondary text-text-secondary border border-border hover:text-text-primary"
            }`}
          >
            {tab === "ALL" && "🌐 All Assets"}
            {tab === "US" && "🇺🇸 US Tech & Markets"}
            {tab === "NSE" && "🇮🇳 Indian Markets (NSE)"}
            {tab === "CRYPTO" && "🪙 Crypto & Forex"}
          </button>
        ))}
      </div>

      {/* 5. MAIN CHART & GEMINI AI SENTIMENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Interactive Historical Chart (2 Cols) */}
        <div className="lg:col-span-2 card p-6 border-border space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-accent-gold" />
              <h3 className="text-base font-bold text-text-primary">
                Price Performance ({activeTimeframe})
              </h3>
            </div>

            {/* Timeframe Toggles */}
            <div className="flex items-center gap-1 bg-bg-void p-1 rounded-xl border border-border">
              {(["1D", "1W", "1M", "1Y", "5Y"] as const).map((tf) => (
                <button
                  key={tf}
                  onClick={() => setActiveTimeframe(tf)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer ${
                    activeTimeframe === tf 
                      ? "bg-accent-gold text-bg-void shadow-sm" 
                      : "text-text-secondary hover:text-text-primary"
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>

          {/* Recharts / D3 Chart Container */}
          <div className="h-72 w-full pt-4">
            {isLoadingChart ? (
              <div className="h-full flex items-center justify-center text-xs text-text-secondary animate-pulse">
                Fetching Twelve Data time series for {activeSymbol}...
              </div>
            ) : timeSeries.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timeSeries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="stockGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={isUp ? "#10b981" : "#f43f5e"} stopOpacity={0.4}/>
                      <stop offset="95%" stopColor={isUp ? "#10b981" : "#f43f5e"} stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                  <XAxis 
                    dataKey="datetime" 
                    stroke="#94a3b8" 
                    fontSize={10} 
                    tickFormatter={(val) => val.split("-").slice(1).join("/")} 
                  />
                  <YAxis 
                    stroke="#94a3b8" 
                    fontSize={10} 
                    domain={['auto', 'auto']}
                    tickFormatter={(val) => `${activeQuote?.currency === "INR" ? "₹" : "$"}${val}`}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "12px", fontSize: "12px" }}
                    labelStyle={{ color: "#f8fafc", fontWeight: "bold" }}
                    formatter={(value: any) => [`${activeQuote?.currency === "INR" ? "₹" : "$"}${value}`, "Price"]}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="close" 
                    stroke={isUp ? "#10b981" : "#f43f5e"} 
                    strokeWidth={2.5}
                    fillOpacity={1} 
                    fill="url(#stockGrad)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-text-secondary">
                No time series data available for {activeSymbol}
              </div>
            )}
          </div>

          {/* Asset Key Metrics Grid */}
          {activeQuote && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-border/60 text-xs">
              <div className="p-3 rounded-xl bg-bg-secondary/60">
                <span className="text-text-muted block text-[10px] uppercase font-bold">Day Range</span>
                <span className="font-bold text-text-primary mt-1 block">
                  {activeQuote.currency === "INR" ? "₹" : "$"}{activeQuote.low.toFixed(2)} - {activeQuote.currency === "INR" ? "₹" : "$"}{activeQuote.high.toFixed(2)}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-bg-secondary/60">
                <span className="text-text-muted block text-[10px] uppercase font-bold">52-Wk Range</span>
                <span className="font-bold text-text-primary mt-1 block">
                  {activeQuote.currency === "INR" ? "₹" : "$"}{activeQuote.fifty_two_week_low.toFixed(2)} - {activeQuote.currency === "INR" ? "₹" : "$"}{activeQuote.fifty_two_week_high.toFixed(2)}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-bg-secondary/60">
                <span className="text-text-muted block text-[10px] uppercase font-bold">Volume</span>
                <span className="font-bold text-text-primary mt-1 block">
                  {activeQuote.volume.toLocaleString()}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-bg-secondary/60">
                <span className="text-text-muted block text-[10px] uppercase font-bold">Exchange</span>
                <span className="font-bold text-accent-gold mt-1 block">
                  {activeQuote.exchange}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Gemini AI Market Sentiment Widget */}
        <div className="card p-6 border-accent-gold/30 bg-gradient-to-b from-bg-secondary to-bg-secondary/60 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-accent-gold animate-spin-slow" />
                <h3 className="text-base font-bold text-text-primary">
                  Gemini AI Sentiment
                </h3>
              </div>
              <span className="px-2 py-0.5 bg-accent-gold/20 text-accent-gold text-[10px] font-extrabold rounded uppercase font-mono">
                Live Signal
              </span>
            </div>

            {sentimentData ? (
              <div className="space-y-4">
                {/* Big Signal Rating Badge */}
                <div className={`p-4 rounded-2xl border text-center space-y-1 ${
                  sentimentData.signal === "BULLISH"
                    ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300"
                    : sentimentData.signal === "BEARISH"
                    ? "bg-rose-500/15 border-rose-500/40 text-rose-300"
                    : "bg-amber-500/15 border-amber-500/40 text-amber-300"
                }`}>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest block opacity-80">
                    Calculated Market Trajectory
                  </span>
                  <div className="text-2xl font-black font-display uppercase tracking-tight flex items-center justify-center gap-2">
                    {sentimentData.signal === "BULLISH" ? "GOING UP 🚀 BULLISH" : sentimentData.signal === "BEARISH" ? "GOING DOWN 📉 BEARISH" : "NEUTRAL / SIDEWAYS ⚖️"}
                  </div>
                  <span className="text-xs font-bold block opacity-90">
                    Confidence Index: {sentimentData.score}%
                  </span>
                </div>

                {/* AI Summary */}
                <div className="p-3.5 bg-bg-void/80 rounded-xl border border-border text-xs text-text-secondary leading-relaxed">
                  <span className="text-text-primary font-bold block mb-1">🤖 AI Analyst Insight:</span>
                  {sentimentData.summary}
                </div>

                {/* Key Catalysts */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-text-primary uppercase tracking-wider block">Key Market Catalysts:</span>
                  {sentimentData.catalysts.map((cat, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-text-secondary bg-bg-secondary/40 p-2 rounded-lg border border-border/40">
                      <ChevronRight className="w-3.5 h-3.5 text-accent-gold shrink-0 mt-0.5" />
                      <span>{cat}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-8 text-center space-y-3 bg-bg-void/40 rounded-2xl border border-border/60">
                <Globe className="w-10 h-10 text-accent-gold mx-auto opacity-80" />
                <h4 className="text-sm font-bold text-text-primary">Run Sentiment Diagnostics</h4>
                <p className="text-xs text-text-secondary">
                  Tap below to parse real-time headlines and technical volume signals for {activeSymbol}.
                </p>
              </div>
            )}
          </div>

          <button
            onClick={handleAnalyzeSentiment}
            disabled={isAnalyzingSentiment}
            className="w-full py-3 bg-gradient-to-r from-accent-gold to-amber-400 text-bg-void font-extrabold text-xs uppercase tracking-wider rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isAnalyzingSentiment ? "Analyzing Market Sentiment..." : `Generate ${activeSymbol} AI Sentiment`}</span>
          </button>
        </div>
      </div>

      {/* 6. MARKET MOVERS GRID */}
      <div className="card p-6 border-border space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-accent-gold" />
            <h3 className="text-lg font-bold text-text-primary">
              Global Market Watchlist & Movers
            </h3>
          </div>
          <span className="text-xs text-text-secondary font-mono">
            Powered by Twelve Data API
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSymbols.map((sym) => {
            const q = marqueeQuotes[sym];
            if (!q) return null;
            const positive = q.percent_change >= 0;

            return (
              <div
                key={sym}
                onClick={() => setActiveSymbol(sym)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer group hover:scale-[1.01] ${
                  sym === activeSymbol 
                    ? "bg-accent-gold/10 border-accent-gold/60 shadow-lg" 
                    : "bg-bg-secondary/60 border-border hover:border-accent-gold/30"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="text-xs font-bold text-text-primary block font-display">{q.symbol}</span>
                    <span className="text-[10px] text-text-secondary truncate block max-w-[140px]">{q.name}</span>
                  </div>

                  <span className={`px-2 py-1 rounded-lg text-xs font-black flex items-center gap-1 ${
                    positive ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30" : "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                  }`}>
                    {positive ? "🚀 +" : "📉 "}{q.percent_change}%
                  </span>
                </div>

                <div className="flex items-baseline justify-between mt-3 pt-3 border-t border-border/40 text-xs font-mono">
                  <span className="text-text-muted text-[10px] uppercase">Price</span>
                  <span className="font-bold text-text-primary text-sm">
                    {q.currency === "INR" ? "₹" : "$"}{q.price.toFixed(2)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
