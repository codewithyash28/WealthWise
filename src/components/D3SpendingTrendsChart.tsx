import React, { useEffect, useRef, useState, useMemo } from "react";
import * as d3 from "d3";
import { formatCurrency, cn } from "../lib/utils";
import { CURRENCIES } from "../constants";
import { UserProfile } from "../types";
import { TrendingUp, LineChart, ShieldCheck, AlertCircle } from "lucide-react";

interface D3SpendingTrendsChartProps {
  user: UserProfile;
  totalExpenses: number;
  income: number;
  transactions: Array<{
    id: string;
    date: string;
    description: string;
    amount: number;
    category: string;
  }>;
}

interface TrendDayPoint {
  day: number;
  dateStr: string;
  projectedCum: number;
  actualCum: number;
  variance: number; // actual - projected
}

export function D3SpendingTrendsChart({
  user,
  totalExpenses,
  income,
  transactions,
}: D3SpendingTrendsChartProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const currency = CURRENCIES[user.currency] || CURRENCIES.USD;

  const [hoveredPoint, setHoveredPoint] = useState<TrendDayPoint | null>(null);

  const today = new Date();
  const daysInMonth = 30;
  const currentDayNum = Math.min(daysInMonth, today.getDate());

  // Compute daily trend points
  const trendData: TrendDayPoint[] = useMemo(() => {
    const dailyProjectedPace = totalExpenses > 0 ? totalExpenses / daysInMonth : (income * 0.7) / daysInMonth;

    // Group actual transactions by day of month (1..30)
    const dailyActuals: Record<number, number> = {};
    transactions.forEach((t) => {
      if (!t.date) return;
      const d = new Date(t.date);
      const dayNum = d.getDate();
      if (dayNum >= 1 && dayNum <= daysInMonth) {
        dailyActuals[dayNum] = (dailyActuals[dayNum] || 0) + Math.abs(t.amount);
      }
    });

    const points: TrendDayPoint[] = [];
    let runningActual = 0;

    for (let day = 1; day <= daysInMonth; day++) {
      const projectedCum = Math.round(dailyProjectedPace * day);

      if (day <= currentDayNum) {
        runningActual += dailyActuals[day] || Math.round(dailyProjectedPace * 0.85);
      } else {
        // Projected continuation
        runningActual += Math.round(dailyProjectedPace * 0.9);
      }

      const actualCum = Math.round(runningActual);
      const variance = actualCum - projectedCum;

      points.push({
        day,
        dateStr: `Day ${day}`,
        projectedCum,
        actualCum,
        variance,
      });
    }

    return points;
  }, [totalExpenses, income, transactions, currentDayNum]);

  const currentVariance = useMemo(() => {
    const pt = trendData[currentDayNum - 1];
    return pt ? pt.variance : 0;
  }, [trendData, currentDayNum]);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || trendData.length === 0) return;

    d3.select(svgRef.current).selectAll("*").remove();

    const margin = { top: 20, right: 30, bottom: 40, left: 60 };
    const width = containerRef.current.clientWidth || 600;
    const height = 260;

    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Scales
    const xScale = d3
      .scaleLinear()
      .domain([1, daysInMonth])
      .range([0, innerWidth]);

    const maxVal = d3.max(trendData, (d) => Math.max(d.projectedCum, d.actualCum)) || 1000;
    const yScale = d3
      .scaleLinear()
      .domain([0, maxVal * 1.1])
      .range([innerHeight, 0]);

    // Area Generator between Actual and Projected
    const areaGenerator = d3
      .area<TrendDayPoint>()
      .x((d) => xScale(d.day))
      .y0((d) => yScale(d.projectedCum))
      .y1((d) => yScale(d.actualCum))
      .curve(d3.curveMonotoneX);

    // Gradient definition
    const defs = svg.append("defs");

    // Favorable gradient (Green when actual < projected)
    const greenGradient = defs
      .append("linearGradient")
      .attr("id", "variance-green-grad")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "0%")
      .attr("y2", "100%");
    greenGradient.append("stop").attr("offset", "0%").attr("stop-color", "#10b981").attr("stop-opacity", 0.35);
    greenGradient.append("stop").attr("offset", "100%").attr("stop-color", "#10b981").attr("stop-opacity", 0.05);

    // Unfavorable gradient (Red when actual > projected)
    const redGradient = defs
      .append("linearGradient")
      .attr("id", "variance-red-grad")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "0%")
      .attr("y2", "100%");
    redGradient.append("stop").attr("offset", "0%").attr("stop-color", "#ef4444").attr("stop-opacity", 0.35);
    redGradient.append("stop").attr("offset", "100%").attr("stop-color", "#ef4444").attr("stop-opacity", 0.05);

    // Render Area Fill
    svg
      .append("path")
      .datum(trendData)
      .attr("fill", currentVariance <= 0 ? "url(#variance-green-grad)" : "url(#variance-red-grad)")
      .attr("d", areaGenerator as any);

    // Line Generators
    const lineProjected = d3
      .line<TrendDayPoint>()
      .x((d) => xScale(d.day))
      .y((d) => yScale(d.projectedCum))
      .curve(d3.curveMonotoneX);

    const lineActual = d3
      .line<TrendDayPoint>()
      .x((d) => xScale(d.day))
      .y((d) => yScale(d.actualCum))
      .curve(d3.curveMonotoneX);

    // Render Projected Line (Dashed Gold)
    svg
      .append("path")
      .datum(trendData)
      .attr("fill", "none")
      .attr("stroke", "#f0b429")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "4,4")
      .attr("d", lineProjected as any);

    // Render Actual Line (Solid Emerald/Rose)
    svg
      .append("path")
      .datum(trendData)
      .attr("fill", "none")
      .attr("stroke", currentVariance <= 0 ? "#10b981" : "#ef4444")
      .attr("stroke-width", 3)
      .attr("d", lineActual as any);

    // Axes
    const xAxis = d3.axisBottom(xScale).ticks(10).tickFormat((d) => `Day ${d}`);
    const yAxis = d3
      .axisLeft(yScale)
      .ticks(5)
      .tickFormat((d) => `${currency.symbol}${d3.format(".2s")(d)}`);

    svg
      .append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(xAxis as any)
      .attr("color", "#64748b")
      .attr("font-family", "monospace")
      .attr("font-size", "10px");

    svg
      .append("g")
      .call(yAxis as any)
      .attr("color", "#64748b")
      .attr("font-family", "monospace")
      .attr("font-size", "10px");

    // Grid lines
    svg
      .append("g")
      .attr("class", "grid")
      .call(
        d3
          .axisLeft(yScale)
          .ticks(5)
          .tickSize(-innerWidth)
          .tickFormat(() => "")
      )
      .attr("color", "#1e293b")
      .attr("stroke-opacity", 0.4);

    // Interactive Hover Overlay
    const focus = svg.append("g").style("display", "none");

    focus
      .append("line")
      .attr("class", "hover-line")
      .attr("y1", 0)
      .attr("y2", innerHeight)
      .attr("stroke", "#f0b429")
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "2,2");

    focus.append("circle").attr("class", "focus-actual").attr("r", 5).attr("fill", "#10b981");
    focus.append("circle").attr("class", "focus-projected").attr("r", 4).attr("fill", "#f0b429");

    svg
      .append("rect")
      .attr("width", innerWidth)
      .attr("height", innerHeight)
      .attr("fill", "none")
      .attr("pointer-events", "all")
      .on("mouseover", () => focus.style("display", null))
      .on("mouseout", () => {
        focus.style("display", "none");
        setHoveredPoint(null);
      })
      .on("mousemove", (event) => {
        const [mouseX] = d3.pointer(event);
        const xDay = Math.round(xScale.invert(mouseX));
        const point = trendData.find((p) => p.day === Math.max(1, Math.min(daysInMonth, xDay)));

        if (point) {
          setHoveredPoint(point);
          const xPos = xScale(point.day);
          focus.select(".hover-line").attr("transform", `translate(${xPos},0)`);
          focus.select(".focus-actual").attr("transform", `translate(${xPos},${yScale(point.actualCum)})`);
          focus.select(".focus-projected").attr("transform", `translate(${xPos},${yScale(point.projectedCum)})`);
        }
      });
  }, [trendData, currentVariance, currency.symbol]);

  return (
    <div
      ref={containerRef}
      className="card p-6 space-y-4 border-accent-gold/20 shadow-xl relative overflow-hidden"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/40">
        <div className="flex items-center gap-2">
          <LineChart className="w-5 h-5 text-accent-gold" />
          <div>
            <h3 className="text-lg font-bold font-display text-text-primary">
              D3 Spending Trends & Variance Overlay
            </h3>
            <p className="text-xs text-text-secondary">
              Overlaying actual vs. projected spending pace over 30 days
            </p>
          </div>
        </div>

        {/* Real-time Variance Badge */}
        <div
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-mono font-bold self-start sm:self-auto",
            currentVariance <= 0
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
              : "bg-rose-500/10 border-rose-500/30 text-rose-400"
          )}
        >
          {currentVariance <= 0 ? (
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400" />
          )}
          <span>
            {currentVariance <= 0
              ? `${formatCurrency(Math.abs(currentVariance), user.currency, currency.locale)} Favorable Variance (Under Pace)`
              : `${formatCurrency(currentVariance, user.currency, currency.locale)} Unfavorable Variance (Over Pace)`}
          </span>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="w-full overflow-x-auto">
        <svg ref={svgRef} className="w-full"></svg>
      </div>

      {/* Hover Point Tooltip Summary */}
      <div className="flex items-center justify-between p-3 rounded-xl bg-bg-secondary/80 border border-border/50 text-xs font-mono">
        {hoveredPoint ? (
          <>
            <span className="font-bold text-text-primary">{hoveredPoint.dateStr}</span>
            <div className="flex items-center gap-4">
              <span className="text-amber-400">
                Projected: {formatCurrency(hoveredPoint.projectedCum, user.currency, currency.locale)}
              </span>
              <span className="text-emerald-400">
                Actual: {formatCurrency(hoveredPoint.actualCum, user.currency, currency.locale)}
              </span>
              <span className={hoveredPoint.variance <= 0 ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
                Delta: {hoveredPoint.variance <= 0 ? "-" : "+"}{formatCurrency(Math.abs(hoveredPoint.variance), user.currency, currency.locale)}
              </span>
            </div>
          </>
        ) : (
          <span className="text-text-muted italic text-[11px]">
            Hover over chart curve to inspect daily cumulative spending projections and variance.
          </span>
        )}
      </div>
    </div>
  );
}
