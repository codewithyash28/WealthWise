import { useState, useEffect, useRef, useMemo } from "react";
import { motion } from "motion/react";
import * as d3 from "d3";
import { 
  Grid, 
  Sparkles, 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  Filter, 
  RefreshCw, 
  Zap,
  Info,
  Sliders,
  DollarSign
} from "lucide-react";
import { formatCurrency, cn } from "../lib/utils";
import { CURRENCIES } from "../constants";
import { UserProfile } from "../types";

interface AssetTile {
  id: string;
  symbol: string;
  name: string;
  category: string;
  value: number;
  yieldPct: number;
  change30dPct: number;
}

interface D3PortfolioHeatmapProps {
  user: UserProfile;
}

export function D3PortfolioHeatmap({ user }: D3PortfolioHeatmapProps) {
  const currency = CURRENCIES[user.currency] || CURRENCIES.USD;
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const [activeCategory, setActiveCategory] = useState<string>("ALL");
  const [livePulseActive, setLivePulseActive] = useState<boolean>(true);
  const [selectedAsset, setSelectedAsset] = useState<AssetTile | null>(null);
  const [hoveredAsset, setHoveredAsset] = useState<AssetTile | null>(null);

  // Initial seed portfolio holdings with high-fidelity financial values
  const [holdings, setHoldings] = useState<AssetTile[]>([
    { id: "nvda", symbol: "NVDA", name: "NVIDIA Corp.", category: "Equities & Tech", value: 24500, yieldPct: 18.4, change30dPct: 22.1 },
    { id: "aapl", symbol: "AAPL", name: "Apple Inc.", category: "Equities & Tech", value: 18200, yieldPct: 6.2, change30dPct: 4.8 },
    { id: "msft", symbol: "MSFT", name: "Microsoft Corp.", category: "Equities & Tech", value: 21000, yieldPct: 8.5, change30dPct: 7.3 },
    { id: "googl", symbol: "GOOGL", name: "Alphabet Inc.", category: "Equities & Tech", value: 14200, yieldPct: 4.1, change30dPct: 3.5 },
    { id: "spy", symbol: "SPY", name: "S&P 500 ETF Trust", category: "ETFs & Indexes", value: 35000, yieldPct: 3.8, change30dPct: 2.9 },
    { id: "qqq", symbol: "QQQ", name: "Invesco QQQ Trust", category: "ETFs & Indexes", value: 22800, yieldPct: 7.9, change30dPct: 8.4 },
    { id: "btc", symbol: "BTC", name: "Bitcoin", category: "Digital Crypto", value: 16500, yieldPct: 24.6, change30dPct: 31.2 },
    { id: "eth", symbol: "ETH", name: "Ethereum", category: "Digital Crypto", value: 9400, yieldPct: 12.8, change30dPct: 14.5 },
    { id: "sol", symbol: "SOL", name: "Solana", category: "Digital Crypto", value: 4200, yieldPct: -3.4, change30dPct: 1.2 },
    { id: "reit", symbol: "VNQ", name: "Vanguard Real Estate", category: "Real Estate", value: 12500, yieldPct: 1.8, change30dPct: -0.5 },
    { id: "bnd", symbol: "BND", name: "Total Bond Market ETF", category: "Fixed Income & Cash", value: 15000, yieldPct: -1.2, change30dPct: -0.8 },
    { id: "hysa", symbol: "CASH", name: "High-Yield Cash Reserve", category: "Fixed Income & Cash", value: 18500, yieldPct: 0.42, change30dPct: 0.42 }
  ]);

  // Live yield simulation interval
  useEffect(() => {
    if (!livePulseActive) return;
    const interval = setInterval(() => {
      setHoldings(prev => prev.map(item => {
        // Subtle random tick fluctuation
        const delta = (Math.random() - 0.48) * 0.15;
        const newYield = Number((item.yieldPct + delta).toFixed(2));
        return {
          ...item,
          yieldPct: newYield
        };
      }));
    }, 2500);

    return () => clearInterval(interval);
  }, [livePulseActive]);

  const filteredHoldings = useMemo(() => {
    if (activeCategory === "ALL") return holdings;
    return holdings.filter(h => h.category === activeCategory);
  }, [holdings, activeCategory]);

  const totalValue = useMemo(() => {
    return filteredHoldings.reduce((sum, item) => sum + item.value, 0);
  }, [filteredHoldings]);

  // D3 Treemap Layout Rendering
  useEffect(() => {
    if (!svgRef.current || !containerRef.current || filteredHoldings.length === 0) return;

    const width = containerRef.current.clientWidth || 700;
    const height = 380;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    svg.attr("width", width).attr("height", height);

    // Build hierarchy for D3 Treemap
    const hierarchyData = {
      name: "Portfolio",
      children: filteredHoldings.map(h => ({
        ...h,
        value: Math.max(100, h.value)
      }))
    };

    const root = d3.hierarchy(hierarchyData)
      .sum(d => (d as any).value)
      .sort((a, b) => (b.value || 0) - (a.value || 0));

    const treemapLayout = d3.treemap()
      .size([width, height])
      .paddingOuter(3)
      .paddingInner(3)
      .round(true);

    treemapLayout(root as any);

    // Color Interpolator: Red for negative, Neutral Dark Gray for zero, Emerald Green for positive
    const getColor = (pct: number) => {
      if (pct > 15) return "#10b981"; // Vibrant Emerald
      if (pct > 5) return "#059669";  // Dark Emerald
      if (pct > 0) return "#0f766e";  // Teal Green
      if (pct === 0) return "#1e293b"; // Neutral Gray
      if (pct > -5) return "#9f1239"; // Muted Red
      return "#e11d48"; // Crimson Red
    };

    const nodes = svg.selectAll("g")
      .data(root.leaves())
      .enter()
      .append("g")
      .attr("transform", (d: any) => `translate(${d.x0},${d.y0})`)
      .style("cursor", "pointer")
      .on("mouseenter", (_, d: any) => {
        setHoveredAsset(d.data as AssetTile);
      })
      .on("mouseleave", () => {
        setHoveredAsset(null);
      })
      .on("click", (_, d: any) => {
        setSelectedAsset(d.data as AssetTile);
      });

    // Rectangles
    nodes.append("rect")
      .attr("width", (d: any) => Math.max(0, d.x1 - d.x0))
      .attr("height", (d: any) => Math.max(0, d.y1 - d.y0))
      .attr("rx", 8)
      .attr("ry", 8)
      .attr("fill", (d: any) => getColor((d.data as AssetTile).yieldPct))
      .attr("stroke", "rgba(255, 255, 255, 0.15)")
      .attr("stroke-width", 1)
      .style("transition", "fill 0.5s ease");

    // Symbol Text
    nodes.append("text")
      .attr("x", 8)
      .attr("y", 20)
      .text((d: any) => (d.data as AssetTile).symbol)
      .attr("font-size", (d: any) => ((d.x1 - d.x0) < 60 || (d.y1 - d.y0) < 40) ? "10px" : "13px")
      .attr("font-weight", "800")
      .attr("font-family", "monospace")
      .attr("fill", "#ffffff");

    // Yield % Text
    nodes.append("text")
      .attr("x", 8)
      .attr("y", 36)
      .text((d: any) => {
        const yPct = (d.data as AssetTile).yieldPct;
        return `${yPct >= 0 ? "+" : ""}${yPct.toFixed(1)}%`;
      })
      .attr("font-size", (d: any) => ((d.x1 - d.x0) < 60 || (d.y1 - d.y0) < 40) ? "9px" : "11px")
      .attr("font-weight", "700")
      .attr("font-family", "monospace")
      .attr("fill", (d: any) => (d.data as AssetTile).yieldPct >= 0 ? "#a7f3d0" : "#fecdd3")
      .attr("visibility", (d: any) => (d.y1 - d.y0) < 32 ? "hidden" : "visible");

    // Value Text (if tile is large enough)
    nodes.append("text")
      .attr("x", 8)
      .attr("y", 52)
      .text((d: any) => formatCurrency((d.data as AssetTile).value, user.currency, currency.locale))
      .attr("font-size", "10px")
      .attr("font-family", "monospace")
      .attr("fill", "rgba(255, 255, 255, 0.7)")
      .attr("visibility", (d: any) => ((d.x1 - d.x0) < 90 || (d.y1 - d.y0) < 55) ? "hidden" : "visible");

  }, [filteredHoldings, user.currency, currency.locale]);

  return (
    <div className="card p-6 border-accent-gold/40 bg-bg-secondary/90 space-y-6 shadow-2xl relative overflow-hidden">
      {/* Top Title & Control Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border/60">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1">
              <Grid className="w-3 h-3 text-teal-400" /> D3 Treemap Matrix Engine
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-accent-gold/20 text-accent-gold border border-accent-gold/30 text-[10px] font-mono font-bold uppercase flex items-center gap-1">
              Interactive Yield Heatmap {!user.isPremium && <span className="px-1.5 py-0.2 bg-accent-gold text-bg-void font-black text-[9px] rounded">🔒 PRO</span>}
            </span>
          </div>
          <h3 className="text-xl font-extrabold font-display text-text-primary tracking-tight mt-1">
            Portfolio Performance Heatmap
          </h3>
          <p className="text-xs text-text-secondary mt-0.5">
            Tile sizes represent asset weights; color codes reflect real-time simulated return yields.
          </p>
        </div>

        {/* Live Pulse & Filter Action */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setLivePulseActive(!livePulseActive)}
            className={cn(
              "px-3 py-1.5 rounded-xl border text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer",
              livePulseActive
                ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300 shadow-md"
                : "bg-bg-void border-border text-text-muted hover:text-text-primary"
            )}
            title={livePulseActive ? "Pause live tick updates" : "Resume live market tick updates"}
          >
            <Activity className={cn("w-3.5 h-3.5", livePulseActive ? "text-emerald-400 animate-pulse" : "text-text-muted")} />
            <span>{livePulseActive ? "Live Ticks Active" : "Ticks Paused"}</span>
          </button>
        </div>
      </div>

      {/* Filter Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-border/40">
        <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider shrink-0 flex items-center gap-1">
          <Filter className="w-3 h-3 text-accent-gold" /> Filter Category:
        </span>
        {[
          "ALL",
          "Equities & Tech",
          "ETFs & Indexes",
          "Digital Crypto",
          "Real Estate",
          "Fixed Income & Cash"
        ].map(cat => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveCategory(cat)}
            className={cn(
              "px-3 py-1 rounded-full text-[11px] font-mono font-bold uppercase transition-all whitespace-nowrap cursor-pointer",
              activeCategory === cat
                ? "bg-accent-gold text-bg-void shadow-md"
                : "bg-bg-void border border-border/80 text-text-muted hover:text-text-primary hover:border-border"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* D3 Treemap Canvas Container */}
      <div className="relative" ref={containerRef}>
        <div className="w-full bg-bg-void border border-border/80 rounded-2xl p-2 shadow-inner overflow-hidden">
          <svg ref={svgRef} className="w-full h-[380px] block"></svg>
        </div>

        {/* Hover / Active Asset Detail Badge */}
        {(hoveredAsset || selectedAsset) && (
          <div className="mt-3 p-4 bg-bg-void border border-accent-gold/40 rounded-xl flex items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-3">
              <div className={cn(
                "p-2.5 rounded-xl border font-mono font-bold text-sm",
                (hoveredAsset || selectedAsset)!.yieldPct >= 0 
                  ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
                  : "bg-rose-500/15 border-rose-500/30 text-rose-300"
              )}>
                {(hoveredAsset || selectedAsset)!.symbol}
              </div>
              <div>
                <div className="text-sm font-bold text-text-primary">
                  {(hoveredAsset || selectedAsset)!.name}
                </div>
                <div className="text-[10px] font-mono text-text-muted">
                  {(hoveredAsset || selectedAsset)!.category} • Allocation Weight: {(((hoveredAsset || selectedAsset)!.value / totalValue) * 100).toFixed(1)}%
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6 text-right">
              <div>
                <div className="text-[10px] font-mono text-text-muted uppercase">Asset Value</div>
                <div className="text-sm font-mono font-bold text-text-primary">
                  {formatCurrency((hoveredAsset || selectedAsset)!.value, user.currency, currency.locale)}
                </div>
              </div>

              <div>
                <div className="text-[10px] font-mono text-text-muted uppercase">Simulated Return</div>
                <div className={cn(
                  "text-sm font-mono font-bold flex items-center justify-end gap-1",
                  (hoveredAsset || selectedAsset)!.yieldPct >= 0 ? "text-emerald-400" : "text-rose-400"
                )}>
                  {(hoveredAsset || selectedAsset)!.yieldPct >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                  {(hoveredAsset || selectedAsset)!.yieldPct >= 0 ? "+" : ""}
                  {(hoveredAsset || selectedAsset)!.yieldPct.toFixed(2)}%
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Color Scale Legend */}
      <div className="flex items-center justify-between text-[10px] font-mono text-text-muted border-t border-border/40 pt-3">
        <span className="flex items-center gap-1">
          <Info className="w-3 h-3 text-accent-gold" /> Color Intensity Scale:
        </span>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-rose-600 inline-block" /> Loss (&lt;0%)</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-slate-800 inline-block" /> Neutral (0%)</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-teal-700 inline-block" /> Gain (0-5%)</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-500 inline-block" /> High Yield (&gt;15%)</span>
        </div>
      </div>
    </div>
  );
}
