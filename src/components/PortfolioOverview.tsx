import { useState, useEffect, useMemo, useRef } from "react";
import { motion } from "motion/react";
import * as d3 from "d3";
import { PieChart, TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight, Briefcase, Globe, Activity, Layers, Sparkles, ShieldAlert, Download, PieChart as RechartsIcon } from "lucide-react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { PieChart as RechartsPieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, Legend as RechartsLegend } from 'recharts';
import { formatCurrency, cn } from "../lib/utils";
import { CURRENCIES } from "../constants";
import { UserProfile, Portfolio } from "../types";
import { CryptoPortfolio } from "./CryptoPortfolio";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title);

interface PortfolioOverviewProps {
  user: UserProfile;
}

export function D3NetWorthChart({ user, currency }: { user: UserProfile; currency: any }) {
  const [timeframe, setTimeframe] = useState<30 | 90 | 365>(90);
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredPoint, setHoveredPoint] = useState<{ date: string; value: number; changePct: number } | null>(null);

  const data = useMemo(() => {
    const points: Array<{ date: Date; value: number }> = [];
    const baseValue = user.netWorth && user.netWorth.assets > 0 
      ? (user.netWorth.assets - user.netWorth.liabilities) 
      : 85000;
    
    const today = new Date();
    let currentValue = baseValue * (timeframe === 30 ? 0.92 : timeframe === 90 ? 0.82 : 0.65);
    
    for (let i: number = timeframe; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      const seed = (i * 17 + timeframe * 3) % 100;
      const dailyFluctuation = (seed - 48) / 1000;
      const trend = (baseValue - currentValue) / (i + 1);
      currentValue = Math.max(1000, currentValue + trend + currentValue * dailyFluctuation);
      
      if (i === 0) currentValue = baseValue;
      points.push({ date, value: Math.round(currentValue) });
    }
    return points;
  }, [user.netWorth, timeframe]);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || data.length === 0) return;

    const width = containerRef.current.clientWidth || 700;
    const height = 280;
    const margin = { top: 20, right: 30, bottom: 40, left: 60 };

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    svg.attr("width", width).attr("height", height);

    const x = d3.scaleTime()
      .domain(d3.extent(data, d => d.date) as [Date, Date])
      .range([margin.left, width - margin.right]);

    const yMin = d3.min(data, d => d.value) || 0;
    const yMax = d3.max(data, d => d.value) || 1000;
    const y = d3.scaleLinear()
      .domain([yMin * 0.95, yMax * 1.05])
      .range([height - margin.bottom, margin.top]);

    const defs = svg.append("defs");
    const gradient = defs.append("linearGradient")
      .attr("id", "networth-area-gradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "0%")
      .attr("y2", "100%");

    gradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#f0b429")
      .attr("stop-opacity", 0.35);

    gradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#f0b429")
      .attr("stop-opacity", 0.0);

    const xAxis = d3.axisBottom(x)
      .ticks(width < 500 ? 4 : 6)
      .tickFormat(d3.timeFormat("%b %d") as any);

    svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(xAxis)
      .attr("color", "rgba(148, 163, 184, 0.4)")
      .selectAll("text")
      .style("fill", "#94a3b8")
      .style("font-size", "10px")
      .style("font-family", "monospace");

    const yAxis = d3.axisLeft(y)
      .ticks(5)
      .tickFormat((d) => `${currency.symbol}${(Number(d) / 1000).toFixed(0)}k`);

    svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(yAxis)
      .attr("color", "rgba(148, 163, 184, 0.2)")
      .selectAll("text")
      .style("fill", "#94a3b8")
      .style("font-size", "10px")
      .style("font-family", "monospace");

    svg.append("g")
      .attr("class", "grid")
      .attr("transform", `translate(${margin.left},0)`)
      .call(
        d3.axisLeft(y)
          .ticks(5)
          .tickSize(-(width - margin.left - margin.right))
          .tickFormat("" as any)
      )
      .attr("color", "rgba(255, 255, 255, 0.05)");

    const area = d3.area<{ date: Date; value: number }>()
      .x(d => x(d.date))
      .y0(height - margin.bottom)
      .y1(d => y(d.value))
      .curve(d3.curveMonotoneX);

    svg.append("path")
      .datum(data)
      .attr("fill", "url(#networth-area-gradient)")
      .attr("d", area);

    const line = d3.line<{ date: Date; value: number }>()
      .x(d => x(d.date))
      .y(d => y(d.value))
      .curve(d3.curveMonotoneX);

    svg.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "#f0b429")
      .attr("stroke-width", 2.5)
      .attr("d", line);

    const bisect = d3.bisector<{ date: Date; value: number }, Date>(d => d.date).center;

    const hoverLine = svg.append("line")
      .attr("stroke", "rgba(240, 180, 41, 0.5)")
      .attr("stroke-dasharray", "3 3")
      .attr("y1", margin.top)
      .attr("y2", height - margin.bottom)
      .style("opacity", 0);

    const hoverDot = svg.append("circle")
      .attr("r", 5)
      .attr("fill", "#f0b429")
      .attr("stroke", "#0f172a")
      .attr("stroke-width", 2)
      .style("opacity", 0);

    svg.append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "transparent")
      .on("mousemove", (event) => {
        const [xPos] = d3.pointer(event);
        const xDate = x.invert(xPos);
        const index = bisect(data, xDate);
        const selected = data[index];

        if (selected) {
          const startVal = data[0].value;
          const pct = ((selected.value - startVal) / startVal) * 100;

          hoverLine
            .attr("x1", x(selected.date))
            .attr("x2", x(selected.date))
            .style("opacity", 1);

          hoverDot
            .attr("cx", x(selected.date))
            .attr("cy", y(selected.value))
            .style("opacity", 1);

          setHoveredPoint({
            date: selected.date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
            value: selected.value,
            changePct: Math.round(pct * 10) / 10,
          });
        }
      })
      .on("mouseleave", () => {
        hoverLine.style("opacity", 0);
        hoverDot.style("opacity", 0);
        setHoveredPoint(null);
      });

  }, [data, currency]);

  const firstVal = data[0]?.value || 1;
  const lastVal = data[data.length - 1]?.value || 1;
  const totalPeriodPct = Math.round(((lastVal - firstVal) / firstVal) * 1000) / 10;

  return (
    <div className="card p-6 sm:p-8 space-y-6 border-accent-gold/20 shadow-xl relative" ref={containerRef}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/40">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-accent-gold" />
            <h3 className="text-xl font-bold font-display text-text-primary">Historical Net Worth Progression</h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-accent-gold/10 text-accent-gold border border-accent-gold/30 font-bold uppercase">
              D3.js Vector Engine
            </span>
          </div>
          <p className="text-xs text-text-secondary mt-1">Real-time vector progression over last {timeframe} days</p>
        </div>

        {/* Timeframe Selector Pills */}
        <div className="flex items-center gap-1.5 bg-bg-secondary p-1 rounded-xl border border-border/60 self-start sm:self-auto">
          {([30, 90, 365] as const).map((days) => (
            <button
              key={days}
              onClick={() => setTimeframe(days)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer",
                timeframe === days
                  ? "bg-accent-gold text-bg-void shadow-md"
                  : "text-text-muted hover:text-text-primary hover:bg-bg-void/50"
              )}
            >
              {days} Days
            </button>
          ))}
        </div>
      </div>

      {/* Net Worth Summary Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-bg-secondary/50 border border-border/40 font-mono text-xs">
        <div>
          <span className="text-text-muted text-[10px] uppercase tracking-wider block">Current Net Worth</span>
          <span className="text-lg font-bold text-accent-gold">{formatCurrency(lastVal, user.currency, currency.locale)}</span>
        </div>
        <div>
          <span className="text-text-muted text-[10px] uppercase tracking-wider block">{timeframe}-Day Growth</span>
          <span className={cn("text-lg font-bold flex items-center gap-1", totalPeriodPct >= 0 ? "text-emerald-400" : "text-rose-400")}>
            {totalPeriodPct >= 0 ? "+" : ""}{totalPeriodPct}%
          </span>
        </div>
        <div className="col-span-2 sm:col-span-1">
          <span className="text-text-muted text-[10px] uppercase tracking-wider block">Hover Inspection</span>
          {hoveredPoint ? (
            <span className="text-xs font-bold text-text-primary">
              {hoveredPoint.date}: <span className="text-emerald-400">{formatCurrency(hoveredPoint.value, user.currency, currency.locale)}</span> ({hoveredPoint.changePct >= 0 ? "+" : ""}{hoveredPoint.changePct}%)
            </span>
          ) : (
            <span className="text-xs text-text-muted italic">Hover chart curve to inspect date point...</span>
          )}
        </div>
      </div>

      {/* D3 Vector Canvas Container */}
      <div className="w-full overflow-hidden">
        <svg ref={svgRef} className="w-full overflow-visible"></svg>
      </div>
    </div>
  );
}

// D3.js Portfolio Allocation Treemap / Heatmap Component
export function D3PortfolioHeatmap({ user, currency, totalValue }: { user: UserProfile; currency: any; totalValue: number }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredSector, setHoveredSector] = useState<any>(null);

  const sectorData = useMemo(() => {
    const val = totalValue > 0 ? totalValue : 100000;
    return {
      name: "Portfolio",
      children: [
        { name: "Tech Growth & AI", weight: 35, yield24h: 3.4, yield1Y: 22.4, color: "#10D9A0", usd: val * 0.35, holdings: ["Alpha-Grade Tech ETF", "Semiconductor Index", "Cloud Infrastructure"] },
        { name: "Financials & Banking", weight: 20, yield24h: 1.2, yield1Y: 9.8, color: "#3B82F6", usd: val * 0.20, holdings: ["Global Banking Leaders", "Fintech Innovations", "Insurance Trust"] },
        { name: "Sovereign Fixed Income", weight: 15, yield24h: 0.4, yield1Y: 4.8, color: "#F0B429", usd: val * 0.15, holdings: ["10Y Treasury Notes", "Corporate Green Bonds", "Short-Term Yield Vault"] },
        { name: "Crypto & Decentralized", weight: 12, yield24h: -4.2, yield1Y: 45.0, color: "#EF4444", usd: val * 0.12, holdings: ["Ethereum Smart Contracts", "Bitcoin Sovereign Vault", "DeFi Liquidity Pool"] },
        { name: "Real Estate REITs", weight: 10, yield24h: -1.5, yield1Y: 6.2, color: "#F97316", usd: val * 0.10, holdings: ["Commercial Office REIT", "Residential Living Fund", "Industrial Logistics"] },
        { name: "Clean Energy & Infra", weight: 8, yield24h: 2.8, yield1Y: 15.5, color: "#06B6D4", usd: val * 0.08, holdings: ["Solar Power Grid", "Wind Infrastructure", "Battery Materials"] }
      ]
    };
  }, [totalValue]);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth || 700;
    const height = 320;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    svg.attr("width", width).attr("height", height);

    const root = d3.hierarchy(sectorData)
      .sum((d: any) => d.weight || 0)
      .sort((a, b) => (b.value || 0) - (a.value || 0));

    d3.treemap()
      .size([width, height])
      .paddingInner(6)
      .paddingOuter(4)
      .round(true)(root);

    const nodes = svg.selectAll("g")
      .data(root.leaves())
      .enter()
      .append("g")
      .attr("transform", (d: any) => `translate(${d.x0},${d.y0})`);

    // Sector Rectangles
    nodes.append("rect")
      .attr("width", (d: any) => Math.max(0, d.x1 - d.x0))
      .attr("height", (d: any) => Math.max(0, d.y1 - d.y0))
      .attr("rx", 10)
      .attr("ry", 10)
      .attr("fill", (d: any) => {
        // Color intensity based on 24h yield
        const y24 = d.data.yield24h;
        return y24 >= 3 ? "rgba(16, 217, 160, 0.25)" :
               y24 >= 0 ? "rgba(59, 130, 246, 0.25)" :
               y24 >= -2 ? "rgba(249, 115, 22, 0.25)" : "rgba(239, 68, 68, 0.25)";
      })
      .attr("stroke", (d: any) => d.data.color)
      .attr("stroke-width", 2)
      .style("cursor", "pointer")
      .style("transition", "all 0.2s ease")
      .on("mouseenter", function(event, d: any) {
        d3.select(this)
          .attr("stroke-width", 3.5)
          .attr("filter", "brightness(1.3)");
        setHoveredSector(d.data);
      })
      .on("mouseleave", function() {
        d3.select(this)
          .attr("stroke-width", 2)
          .attr("filter", "none");
        setHoveredSector(null);
      });

    // Sector Labels inside boxes
    nodes.append("text")
      .attr("x", 12)
      .attr("y", 22)
      .text((d: any) => d.data.name)
      .attr("font-size", (d: any) => (d.x1 - d.x0 > 100 ? "11px" : "9px"))
      .attr("font-weight", "bold")
      .attr("fill", "#F8FAFC")
      .attr("pointer-events", "none");

    nodes.append("text")
      .attr("x", 12)
      .attr("y", 38)
      .text((d: any) => `${d.data.weight}% | ${d.data.yield24h >= 0 ? "+" : ""}${d.data.yield24h}%`)
      .attr("font-size", "10px")
      .attr("font-family", "monospace")
      .attr("font-weight", "bold")
      .attr("fill", (d: any) => (d.data.yield24h >= 0 ? "#10D9A0" : "#EF4444"))
      .attr("pointer-events", "none");

  }, [sectorData]);

  return (
    <div className="card p-6 sm:p-8 space-y-6 border-accent-gold/20 shadow-xl relative" ref={containerRef}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/40">
        <div>
          <div className="flex items-center gap-2">
            <PieChart className="w-5 h-5 text-accent-gold" />
            <h3 className="text-xl font-bold font-display text-text-primary">Portfolio Sector Allocation Heatmap</h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold uppercase">
              D3.js Treemap Engine
            </span>
          </div>
          <p className="text-xs text-text-secondary mt-1">
            Visualizing asset class weightings relative to sector 24h yields and 1Y performance. Hover over sectors for yield breakdowns.
          </p>
        </div>
      </div>

      {/* Hover Information Banner */}
      <div className="p-4 rounded-2xl bg-bg-secondary/60 border border-border/60 font-mono text-xs min-h-[72px] flex items-center">
        {hoveredSector ? (
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 w-full">
            <div>
              <span className="text-text-muted text-[9px] uppercase block">Sector Name</span>
              <span className="font-bold text-text-primary text-sm">{hoveredSector.name}</span>
            </div>
            <div>
              <span className="text-text-muted text-[9px] uppercase block">Weighting & Valuation</span>
              <span className="font-bold text-accent-gold text-sm">
                {hoveredSector.weight}% ({formatCurrency(hoveredSector.usd, user.currency, currency.locale)})
              </span>
            </div>
            <div>
              <span className="text-text-muted text-[9px] uppercase block">Yield Performance</span>
              <span className={cn("font-bold text-sm", hoveredSector.yield24h >= 0 ? "text-emerald-400" : "text-rose-400")}>
                24h: {hoveredSector.yield24h >= 0 ? "+" : ""}{hoveredSector.yield24h}% | 1Y: +{hoveredSector.yield1Y}%
              </span>
            </div>
            <div>
              <span className="text-text-muted text-[9px] uppercase block">Top Holdings</span>
              <span className="text-[10px] text-text-secondary font-sans truncate block">
                {hoveredSector.holdings.join(", ")}
              </span>
            </div>
          </div>
        ) : (
          <div className="text-text-muted italic text-xs w-full text-center">
            💡 Hover over any sector box in the D3 Heatmap below to inspect detailed yield breakdowns, asset weightings, and holding compositions...
          </div>
        )}
      </div>

      {/* D3 Treemap SVG Canvas */}
      <div className="w-full overflow-hidden">
        <svg ref={svgRef} className="w-full overflow-visible"></svg>
      </div>
    </div>
  );
}

export function PortfolioOverview({ user }: PortfolioOverviewProps) {
  const currency = CURRENCIES[user.currency] || CURRENCIES.USD;

  const handleExportCSV = () => {
    const netWorth = user.netWorth.assets - user.netWorth.liabilities;
    
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "--- WEXA AI PORTFOLIO ALLOCATION & NET WORTH REPORT ---\n";
    csvContent += `Generated On,${new Date().toLocaleString()}\n`;
    csvContent += `Account Holder,${user.name || "Elite Member"}\n`;
    csvContent += `Preferred Currency,${user.currency}\n\n`;
    
    csvContent += "=== SECTION 1: NET WORTH SUMMARY ===\n";
    csvContent += "Metric,Amount (USD Value)\n";
    csvContent += `Total Assets,$${user.netWorth.assets.toLocaleString()}\n`;
    csvContent += `Total Liabilities,$${user.netWorth.liabilities.toLocaleString()}\n`;
    csvContent += `Calculated Net Worth,$${netWorth.toLocaleString()}\n\n`;
    
    csvContent += "=== SECTION 2: PORTFOLIO ASSET ALLOCATION ===\n";
    csvContent += "Asset Class,Allocation (%),Value (USD Value)\n";
    
    portfolio.holdings.forEach((holding: any) => {
      const pct = Math.round((holding.value / portfolio.totalValue) * 100) || 0;
      csvContent += `"${holding.name}",${pct}%,$${holding.value.toLocaleString()}\n`;
    });
    
    csvContent += `\nTotal Portfolio Net Value,,$${portfolio.totalValue.toLocaleString()}\n`;
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `wexa_portfolio_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    window.dispatchEvent(new CustomEvent('ww-trigger-alert', {
      detail: {
        type: 'success',
        title: 'Export Successful! 📊',
        message: 'Your current portfolio allocation and net worth summary has been exported as a formatted CSV file.'
      }
    }));
  };

  // Load or generate dynamic high fidelity mock holdings so list is never sad
  const portfolio: Portfolio = useMemo(() => {
    if (user.portfolio && user.portfolio.holdings && user.portfolio.holdings.length > 0) {
      return user.portfolio;
    }
    const baseVal = user.netWorth && user.netWorth.assets > 0 ? user.netWorth.assets * 0.8 : currency.avgSalary * 5;
    return {
      totalValue: baseVal,
      change24h: 3.42,
      allocation: {
        stocks: 45,
        bonds: 20,
        crypto: 15,
        realEstate: 10,
        cash: 10
      },
      holdings: [
        { name: "Alpha-Grade Tech Growth ETF", value: baseVal * 0.45, allocation: 45, performance: 14.2 },
        { name: "Sovereign Treasury Notes 10Y", value: baseVal * 0.20, allocation: 20, performance: 4.8 },
        { name: "Ethereum smart contract DeFi", value: baseVal * 0.15, allocation: 15, performance: -6.4 }, // Drops -6.4%, triggering standard 5% alarm!
        { name: "Global REIT Real Estate Index", value: baseVal * 0.10, allocation: 10, performance: -2.3 },
        { name: "Fiat Stability Liquidity Vault", value: baseVal * 0.10, allocation: 10, performance: 1.15 }
      ]
    };
  }, [user.portfolio, user.netWorth, user.currency, currency]);

  const [dropThreshold, setDropThreshold] = useState(() => {
    const saved = localStorage.getItem("ww_portfolio_drop_threshold");
    return saved ? parseFloat(JSON.parse(saved)) : 5.0; // default to 5.0 % alert limit trigger
  });

  const triggeredAssetsRef = useRef<Record<string, number>>({});

  useEffect(() => {
    localStorage.setItem("ww_portfolio_drop_threshold", JSON.stringify(dropThreshold));
    
    // Check for performance drops exceeding threshold
    portfolio.holdings.forEach(holding => {
      if (holding.performance < 0) {
        const dropPercent = Math.abs(holding.performance);
        if (dropPercent >= dropThreshold) {
          const lastAlertTime = triggeredAssetsRef.current[holding.name];
          const now = Date.now();
          // Rate-limit alerts for this asset to once per 10 seconds to keep performance light and fast
          if (!lastAlertTime || (now - lastAlertTime > 10000)) {
            triggeredAssetsRef.current[holding.name] = now;
            
            const event = new CustomEvent("ww-trigger-alert", {
              detail: {
                type: "risk",
                title: `Asset Drop Alert: ${holding.name}`,
                message: `${holding.name} is down by ${holding.performance}% today, exceeding your user-configured safety risk threshold of ${dropThreshold}%. Recommend rebalancing.`
              }
            });
            window.dispatchEvent(event);
          }
        }
      }
    });
  }, [dropThreshold, portfolio.holdings]);

  const rechartsData = useMemo(() => [
    { name: 'Stocks', value: portfolio.allocation.stocks || 45, color: '#F0B429', usdValue: (portfolio.totalValue * (portfolio.allocation.stocks || 45)) / 100 },
    { name: 'Bonds', value: portfolio.allocation.bonds || 20, color: '#3B82F6', usdValue: (portfolio.totalValue * (portfolio.allocation.bonds || 20)) / 100 },
    { name: 'Crypto', value: portfolio.allocation.crypto || 15, color: '#10D9A0', usdValue: (portfolio.totalValue * (portfolio.allocation.crypto || 15)) / 100 },
    { name: 'Cash', value: portfolio.allocation.cash || 10, color: '#94A3B8', usdValue: (portfolio.totalValue * (portfolio.allocation.cash || 10)) / 100 },
    { name: 'Real Estate', value: portfolio.allocation.realEstate || 10, color: '#F97316', usdValue: (portfolio.totalValue * (portfolio.allocation.realEstate || 10)) / 100 },
  ], [portfolio.allocation, portfolio.totalValue]);

  return (
    <div className="container mx-auto px-6 py-12 space-y-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-4xl font-display font-bold">Portfolio Overview</h1>
          <p className="text-text-secondary">Your global asset allocation and performance metrics</p>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-[10px] text-text-muted uppercase tracking-widest font-bold">Total Net Value</div>
              <div className="text-2xl font-mono font-bold text-accent-gold">
                {formatCurrency(portfolio.totalValue, user.currency, currency.locale)}
              </div>
            </div>
            <div className={cn(
              "px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1",
              portfolio.change24h >= 0 ? "bg-accent-emerald/10 text-accent-emerald" : "bg-accent-red/10 text-accent-red"
            )}>
              {portfolio.change24h >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {Math.abs(portfolio.change24h)}%
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleExportCSV}
              className="flex items-center justify-center gap-1.5 px-4 py-2 bg-accent-emerald/10 border border-accent-emerald/25 text-accent-emerald text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-accent-emerald/20 transition-all font-mono cursor-pointer select-none"
              title="Download portfolio allocation and net worth details as CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Data</span>
            </button>
            <a 
              href="#rebalancer" 
              className="flex items-center justify-center px-4 py-2 bg-accent-gold/10 border border-accent-gold/25 text-accent-gold text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-accent-gold/20 transition-all font-mono"
            >
              Rebalance Asset Mix
            </a>
          </div>
        </div>
      </div>

      {/* D3.js Historical Net Worth Progression Chart */}
      <D3NetWorthChart user={user} currency={currency} />

      {/* D3.js Sector Allocation Heatmap */}
      <D3PortfolioHeatmap user={user} currency={currency} totalValue={portfolio.totalValue} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Allocation Chart using Recharts PieChart */}
        <div className="lg:col-span-1 card p-8 flex flex-col items-center justify-between relative min-h-[420px]">
          <div className="w-full flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Layers className="w-5 h-5 text-accent-gold" /> Recharts Asset Allocation
            </h3>
            <span className="px-2 py-0.5 rounded-full bg-accent-gold/10 border border-accent-gold/30 text-[10px] font-mono font-bold text-accent-gold uppercase tracking-wider">
              Interactive
            </span>
          </div>

          <div className="relative w-full h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={rechartsData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={4}
                  dataKey="value"
                  animationDuration={1000}
                >
                  {rechartsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="rgba(15, 23, 42, 0.6)" strokeWidth={2} />
                  ))}
                </Pie>
                <RechartsTooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-bg-void/95 border border-accent-gold/40 p-3 rounded-xl shadow-2xl backdrop-blur-md text-xs font-mono">
                          <div className="font-bold text-text-primary flex items-center gap-2 mb-1">
                            <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: data.color }} />
                            {data.name}
                          </div>
                          <div className="text-accent-gold font-bold">{data.value}% Allocation</div>
                          <div className="text-text-muted text-[10px]">{formatCurrency(data.usdValue, user.currency, currency.locale)}</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </RechartsPieChart>
            </ResponsiveContainer>

            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <div className="text-text-muted text-[10px] uppercase tracking-widest font-mono">Diversification</div>
              <div className="text-lg font-extrabold text-text-primary">{portfolio.totalValue > 0 ? "Optimal" : "N/A"}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 w-full mt-4 pt-4 border-t border-border/40">
            {rechartsData.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-[11px] text-text-secondary font-medium">{item.name}</span>
                </div>
                <span className="font-mono font-bold text-accent-gold text-[11px]">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Interactive D3 Portfolio Performance Heatmap */}
      <D3PortfolioHeatmap user={user} currency={currency} totalValue={portfolio.totalValue} />

      {/* Holdings Table */}
        <div className="lg:col-span-2 card p-8 space-y-6">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-accent-gold" /> Major Holdings
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border">
                  <th className="pb-4 text-[10px] text-text-muted uppercase tracking-widest font-bold">Asset Name</th>
                  <th className="pb-4 text-[10px] text-text-muted uppercase tracking-widest font-bold text-right">Value</th>
                  <th className="pb-4 text-[10px] text-text-muted uppercase tracking-widest font-bold text-right">Allocation</th>
                  <th className="pb-4 text-[10px] text-text-muted uppercase tracking-widest font-bold text-right">Performance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {portfolio.holdings.length > 0 ? portfolio.holdings.map((holding, i) => (
                  <tr key={i} className="group hover:bg-bg-secondary/50 transition-colors">
                    <td className="py-4">
                      <div className="font-bold text-sm">{holding.name}</div>
                    </td>
                    <td className="py-4 text-right font-mono text-sm">
                      {formatCurrency(holding.value, user.currency, currency.locale)}
                    </td>
                    <td className="py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 h-1 bg-border rounded-full overflow-hidden">
                          <div className="h-full bg-accent-gold" style={{ width: `${holding.allocation}%` }} />
                        </div>
                        <span className="text-[10px] font-mono font-bold text-text-muted">{holding.allocation}%</span>
                      </div>
                    </td>
                    <td className="py-4 text-right">
                      <span className={cn(
                        "text-xs font-bold",
                        holding.performance >= 0 ? "text-accent-emerald" : "text-accent-red"
                      )}>
                        {holding.performance >= 0 ? "+" : ""}{holding.performance}%
                      </span>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-text-muted italic text-sm">
                      No holdings found. Add assets to your portfolio to track them.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* User-Configurable Drop Alarm Guard Panel */}
          <div className="pt-6 border-t border-border/40 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <h4 className="font-bold flex items-center gap-2 text-accent-red text-xs uppercase tracking-wider">
                  <ShieldAlert className="w-4 h-4 text-accent-red" /> Defensive Portfolio Drop Guard
                </h4>
                <p className="text-[11px] text-text-muted leading-relaxed">
                  Triggers an automated high-priority PulseAlert notification if any held asset drops in value today sharper than your configurable threshold.
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0 bg-bg-secondary/20 p-2.5 rounded-xl border border-border/40">
                <span className="text-xs font-mono font-bold text-text-secondary uppercase">Cutoff Limit:</span>
                <input 
                  type="number" 
                  min="0.5" 
                  max="50" 
                  step="0.5"
                  value={dropThreshold}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setDropThreshold(isNaN(val) ? 5.0 : Math.max(0.1, Math.min(100, val)));
                  }}
                  className="bg-bg-void border border-border rounded-lg text-right font-mono font-bold px-2 py-1 text-xs text-text-primary focus:border-accent-red outline-none w-16"
                />
                <span className="text-xs font-bold text-text-muted">%</span>
                <input 
                  type="range" 
                  min="1" 
                  max="20" 
                  step="0.5" 
                  value={dropThreshold} 
                  onChange={(e) => setDropThreshold(parseFloat(e.target.value))} 
                  className="w-24 accent-accent-red cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Crypto Tracking Suite */}
      <CryptoPortfolio user={user} />

      {/* 'What-If' Stress Test Tool */}
      <WhatIfStressTest user={user} currency={currency} />

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {portfolio.holdings.length > 0 ? (
          [
            { label: "Alpha (vs S&P 500)", value: "+4.2%", icon: <Activity className="w-5 h-5" />, color: "text-accent-emerald" },
            { label: "Sharpe Ratio", value: "1.85", icon: <TrendingUp className="w-5 h-5" />, color: "text-accent-gold" },
            { label: "Volatility (Std Dev)", value: "12.4%", icon: <Globe className="w-5 h-5" />, color: "text-accent-blue" },
            { label: "Dividend Yield", value: "2.1%", icon: <Wallet className="w-5 h-5" />, color: "text-accent-emerald" }
          ].map((metric, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -5 }}
              className="card p-6 space-y-4 border-l-4 border-l-accent-gold"
            >
              <div className={cn("w-10 h-10 rounded-xl bg-bg-secondary flex items-center justify-center", metric.color)}>
                {metric.icon}
              </div>
              <div>
                <div className="text-[10px] text-text-muted uppercase tracking-widest font-bold">{metric.label}</div>
                <div className="text-2xl font-mono font-bold">{metric.value}</div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full card p-12 flex flex-col items-center justify-center text-center space-y-6 bg-accent-gold/5 border-dashed border-accent-gold/30">
            <div className="w-16 h-16 rounded-full bg-accent-gold/10 flex items-center justify-center text-accent-gold">
              <Sparkles className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold">Unlock Professional Metrics</h3>
              <p className="text-text-secondary max-w-md mx-auto">
                Add your first asset to track advanced performance indicators like Alpha, Sharpe Ratio, and Volatility.
              </p>
            </div>
            <button 
              onClick={() => console.log("Asset addition feature coming soon!")}
              className="btn-primary"
            >
              Add Your First Asset
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export function WhatIfStressTest({ user, currency }: { user: UserProfile; currency: any }) {
  const [selectedScenario, setSelectedScenario] = useState<"crash" | "rate_hike" | "inflation" | "tech_boom" | "custom">("crash");
  const [equityShock, setEquityShock] = useState<number>(-20);
  const [rateHike, setRateHike] = useState<number>(5);

  const applyPreset = (preset: "crash" | "rate_hike" | "inflation" | "tech_boom") => {
    setSelectedScenario(preset);
    if (preset === "crash") {
      setEquityShock(-20);
      setRateHike(1.5);
    } else if (preset === "rate_hike") {
      setEquityShock(-8);
      setRateHike(5);
    } else if (preset === "inflation") {
      setEquityShock(-12);
      setRateHike(3.5);
    } else if (preset === "tech_boom") {
      setEquityShock(25);
      setRateHike(0);
    }
  };

  const stressResults = useMemo(() => {
    const assets = user.netWorth?.assets || 0;
    const liabilities = user.netWorth?.liabilities || 0;
    const currentNetWorth = assets - liabilities;

    const stocks = assets * 0.50;
    const realEstate = assets * 0.25;
    const crypto = assets * 0.10;
    const cash = assets * 0.15;

    const stockChangePct = equityShock;
    const reChangePct = Math.round(-rateHike * 1.5 + (selectedScenario === "inflation" ? 5 : 0));
    const cryptoChangePct = Math.round(equityShock * 1.5);
    const cashChangePct = selectedScenario === "inflation" ? -8 : 0;
    const liabilityServicingIncrease = Math.round(liabilities * (rateHike * 0.02));

    const stressedStocks = Math.round(stocks * (1 + stockChangePct / 100));
    const stressedRE = Math.round(realEstate * (1 + reChangePct / 100));
    const stressedCrypto = Math.round(crypto * (1 + cryptoChangePct / 100));
    const stressedCash = Math.round(cash * (1 + cashChangePct / 100));
    const stressedLiabilities = liabilities + liabilityServicingIncrease;

    const stressedTotalAssets = stressedStocks + stressedRE + stressedCrypto + stressedCash;
    const stressedNetWorth = stressedTotalAssets - stressedLiabilities;
    const deltaVal = stressedNetWorth - currentNetWorth;
    const deltaPct = ((deltaVal / (currentNetWorth || 1)) * 100).toFixed(1);

    let resilienceGrade = "B (Moderate Resilience)";
    let resilienceColor = "text-accent-gold";
    if (Number(deltaPct) > 0) {
      resilienceGrade = "A+ (Growth Surge)";
      resilienceColor = "text-accent-emerald";
    } else if (Number(deltaPct) < -15) {
      resilienceGrade = "C- (High Downside Risk)";
      resilienceColor = "text-accent-red";
    }

    return {
      currentNetWorth,
      stressedNetWorth,
      deltaVal,
      deltaPct,
      resilienceGrade,
      resilienceColor,
      breakdown: {
        stocks: { orig: stocks, stressed: stressedStocks, pct: stockChangePct },
        realEstate: { orig: realEstate, stressed: stressedRE, pct: reChangePct },
        crypto: { orig: crypto, stressed: stressedCrypto, pct: cryptoChangePct },
        cash: { orig: cash, stressed: stressedCash, pct: cashChangePct }
      }
    };
  }, [user.netWorth, equityShock, rateHike, selectedScenario]);

  return (
    <div className="card p-8 space-y-6 border-accent-gold/25 bg-gradient-to-br from-bg-secondary/60 via-bg-primary to-bg-secondary/30 relative overflow-hidden my-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/60 pb-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-red/10 border border-accent-red/30 text-accent-red text-[10px] font-mono font-bold uppercase tracking-wider">
            <ShieldAlert className="w-3.5 h-3.5" /> What-If Stress Simulator
          </div>
          <h3 className="text-2xl font-bold font-display text-text-primary">Portfolio Market Stress Test</h3>
          <p className="text-xs text-text-secondary">Simulate net worth shifts under extreme market crashes, rate hikes, and macro volatility shocks.</p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="text-text-muted">Resilience Grade:</span>
          <span className={cn("font-bold text-xs px-3 py-1 rounded-lg bg-bg-void border border-border", stressResults.resilienceColor)}>
            {stressResults.resilienceGrade}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { id: "crash", label: "20% Market Crash", icon: "🔴", desc: "Equities -20%, High beta drop" },
          { id: "rate_hike", label: "5% Rate Spike", icon: "📈", desc: "Real estate & bond re-pricing" },
          { id: "inflation", label: "10% Inflation Shock", icon: "⚡", desc: "Cash erosion & commodity surge" },
          { id: "tech_boom", label: "Tech Boom (+25%)", icon: "🚀", desc: "Equities expansion" }
        ].map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => applyPreset(item.id as any)}
            className={cn(
              "p-3 rounded-xl border text-left space-y-1 transition-all cursor-pointer",
              selectedScenario === item.id
                ? "bg-accent-gold/15 border-accent-gold text-accent-gold shadow-md"
                : "bg-bg-secondary border-border/40 hover:bg-bg-secondary/80 text-text-secondary"
            )}
          >
            <div className="flex items-center gap-2">
              <span className="text-base">{item.icon}</span>
              <span className="text-xs font-bold">{item.label}</span>
            </div>
            <p className="text-[10px] text-text-muted">{item.desc}</p>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-bg-void/40 rounded-2xl border border-border/60">
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs font-mono">
            <label className="text-text-muted font-bold uppercase">Equity Market Shock</label>
            <span className={cn("font-bold text-sm", equityShock < 0 ? "text-accent-red" : "text-accent-emerald")}>
              {equityShock > 0 ? `+${equityShock}%` : `${equityShock}%`}
            </span>
          </div>
          <input
            type="range"
            min="-50"
            max="30"
            step="1"
            value={equityShock}
            onChange={(e) => {
              setSelectedScenario("custom");
              setEquityShock(Number(e.target.value));
            }}
            className="w-full accent-accent-gold cursor-pointer"
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs font-mono">
            <label className="text-text-muted font-bold uppercase">Fed Interest Rate Hike</label>
            <span className="font-bold text-sm text-accent-blue">+{rateHike}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="10"
            step="0.25"
            value={rateHike}
            onChange={(e) => {
              setSelectedScenario("custom");
              setRateHike(Number(e.target.value));
            }}
            className="w-full accent-accent-blue cursor-pointer"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-5 bg-bg-void/60 rounded-2xl border border-border/60 space-y-1">
          <div className="text-[10px] text-text-muted uppercase tracking-widest font-mono font-bold">Current Net Position</div>
          <div className="text-2xl font-mono font-bold text-text-primary">
            {formatCurrency(stressResults.currentNetWorth, user.currency, currency.locale)}
          </div>
          <p className="text-[10px] text-text-muted">Unstressed baseline valuation</p>
        </div>

        <div className="p-5 bg-bg-void/60 rounded-2xl border border-border/60 space-y-1">
          <div className="text-[10px] text-text-muted uppercase tracking-widest font-mono font-bold">Stressed Net Worth</div>
          <div className={cn("text-2xl font-mono font-bold", stressResults.deltaVal < 0 ? "text-accent-red" : "text-accent-emerald")}>
            {formatCurrency(stressResults.stressedNetWorth, user.currency, currency.locale)}
          </div>
          <p className="text-[10px] text-text-muted">Forecast under active shock parameters</p>
        </div>

        <div className="p-5 bg-bg-void/60 rounded-2xl border border-border/60 space-y-1">
          <div className="text-[10px] text-text-muted uppercase tracking-widest font-mono font-bold">Net Impact (Delta)</div>
          <div className={cn("text-2xl font-mono font-bold", stressResults.deltaVal < 0 ? "text-accent-red" : "text-accent-emerald")}>
            {stressResults.deltaVal > 0 ? `+` : ""}{formatCurrency(stressResults.deltaVal, user.currency, currency.locale)} ({stressResults.deltaPct}%)
          </div>
          <p className="text-[10px] text-text-muted">Total capital change under scenario</p>
        </div>
      </div>

      <div className="space-y-2 pt-2 border-t border-border/40">
        <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-text-muted">Stressed Asset Class Breakdown</h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          {Object.entries(stressResults.breakdown).map(([key, val]) => (
            <div key={key} className="p-3 bg-bg-secondary/40 rounded-xl border border-border/40 space-y-1">
              <div className="text-[10px] text-text-muted uppercase font-bold">{key}</div>
              <div className="font-bold text-text-primary">{formatCurrency(val.stressed, user.currency, currency.locale)}</div>
              <div className={cn("text-[10px]", val.pct < 0 ? "text-accent-red" : val.pct > 0 ? "text-accent-emerald" : "text-text-muted")}>
                {val.pct > 0 ? `+${val.pct}%` : `${val.pct}%`} shock
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
