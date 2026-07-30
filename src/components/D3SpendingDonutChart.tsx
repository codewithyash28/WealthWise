import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import { formatCurrency, cn } from "../lib/utils";
import { CURRENCIES } from "../constants";
import { UserProfile } from "../types";
import { PieChart, Filter, X, Sparkles } from "lucide-react";

interface CategoryData {
  key: string;
  label: string;
  amount: number;
  color: string;
}

interface D3SpendingDonutChartProps {
  expenses: Record<string, number>;
  totalExpenses: number;
  user: UserProfile;
  selectedCategory: string | null;
  onSelectCategory: (cat: string | null) => void;
}

const CATEGORY_CONFIG: Record<string, { label: string; color: string }> = {
  housing: { label: "Housing / Rent", color: "#f0b429" },
  food: { label: "Food & Groceries", color: "#10b981" },
  transport: { label: "Transport", color: "#3b82f6" },
  health: { label: "Health & Insurance", color: "#ef4444" },
  entertainment: { label: "Entertainment", color: "#a855f7" },
  education: { label: "Education", color: "#f97316" },
  loans: { label: "Loan / EMI Payments", color: "#64748b" },
  other: { label: "Other Expenses", color: "#94a3b8" },
};

export function D3SpendingDonutChart({
  expenses,
  totalExpenses,
  user,
  selectedCategory,
  onSelectCategory,
}: D3SpendingDonutChartProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const currency = CURRENCIES[user.currency] || CURRENCIES.USD;

  const data: CategoryData[] = Object.entries(expenses)
    .filter(([_, amount]) => amount > 0)
    .map(([key, amount]) => ({
      key,
      label: CATEGORY_CONFIG[key]?.label || key,
      amount,
      color: CATEGORY_CONFIG[key]?.color || "#e2e8f0",
    }));

  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    // Clear previous SVG content
    d3.select(svgRef.current).selectAll("*").remove();

    const width = 280;
    const height = 280;
    const margin = 20;
    const radius = Math.min(width, height) / 2 - margin;
    const innerRadius = radius * 0.65;

    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${width / 2},${height / 2})`);

    // Create pie generator
    const pie = d3
      .pie<CategoryData>()
      .value((d) => d.amount)
      .sort(null);

    // Create arc generator
    const arc = d3
      .arc<d3.PieArcDatum<CategoryData>>()
      .innerRadius(innerRadius)
      .outerRadius(radius)
      .cornerRadius(6)
      .padAngle(0.03);

    const hoverArc = d3
      .arc<d3.PieArcDatum<CategoryData>>()
      .innerRadius(innerRadius - 4)
      .outerRadius(radius + 8)
      .cornerRadius(8)
      .padAngle(0.03);

    const arcs = svg
      .selectAll(".arc")
      .data(pie(data))
      .enter()
      .append("g")
      .attr("class", "arc");

    arcs
      .append("path")
      .attr("d", arc as any)
      .attr("fill", (d) => d.data.color)
      .attr("stroke", "#0f172a")
      .attr("stroke-width", "2px")
      .style("cursor", "pointer")
      .style("opacity", (d) => (selectedCategory && selectedCategory !== d.data.key ? 0.35 : 1))
      .on("mouseover", function (event, d) {
        d3.select(this)
          .transition()
          .duration(150)
          .attr("d", hoverArc as any)
          .style("opacity", 1);
      })
      .on("mouseout", function (event, d) {
        d3.select(this)
          .transition()
          .duration(150)
          .attr("d", arc as any)
          .style("opacity", selectedCategory && selectedCategory !== d.data.key ? 0.35 : 1);
      })
      .on("click", (event, d) => {
        if (selectedCategory === d.data.key) {
          onSelectCategory(null);
        } else {
          onSelectCategory(d.data.key);
        }
      });

    // Center text total
    const centerGroup = svg.append("g").attr("class", "center-label");

    const selectedData = selectedCategory
      ? data.find((d) => d.key === selectedCategory)
      : null;

    centerGroup
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "-0.6em")
      .attr("fill", "#94a3b8")
      .attr("font-size", "10px")
      .attr("font-family", "monospace")
      .attr("font-weight", "bold")
      .text(selectedData ? selectedData.label.toUpperCase() : "TOTAL MONTHLY");

    centerGroup
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "0.8em")
      .attr("fill", selectedData ? selectedData.color : "#f0b429")
      .attr("font-size", "18px")
      .attr("font-family", "monospace")
      .attr("font-weight", "900")
      .text(
        formatCurrency(
          selectedData ? selectedData.amount : totalExpenses,
          user.currency,
          currency.locale
        )
      );
  }, [data, totalExpenses, selectedCategory, user.currency, currency.locale]);

  return (
    <div className="card p-6 space-y-4 border-accent-gold/20 shadow-xl relative overflow-hidden">
      <div className="flex items-center justify-between pb-3 border-b border-border/40">
        <div className="flex items-center gap-2">
          <PieChart className="w-5 h-5 text-accent-gold" />
          <h3 className="text-lg font-bold font-display text-text-primary">
            D3 Category Spending Donut
          </h3>
        </div>

        {selectedCategory ? (
          <button
            onClick={() => onSelectCategory(null)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-accent-gold/20 text-accent-gold border border-accent-gold/40 text-[11px] font-mono font-bold hover:bg-accent-gold/30 transition-colors cursor-pointer"
          >
            <Filter className="w-3 h-3" />
            Filtered: {CATEGORY_CONFIG[selectedCategory]?.label || selectedCategory}
            <X className="w-3 h-3 ml-0.5" />
          </button>
        ) : (
          <span className="text-[10px] font-mono text-text-muted uppercase">
            Click segment to filter
          </span>
        )}
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        {/* SVG Donut Container */}
        <div className="relative flex-shrink-0 flex items-center justify-center">
          <svg ref={svgRef}></svg>
        </div>

        {/* Category Legend Badges */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-xs">
          {Object.entries(expenses).map(([catKey, amt]) => {
            if (amt <= 0) return null;
            const config = CATEGORY_CONFIG[catKey] || { label: catKey, color: "#cbd5e1" };
            const isSelected = selectedCategory === catKey;
            const pct = totalExpenses > 0 ? Math.round((amt / totalExpenses) * 100) : 0;

            return (
              <button
                key={catKey}
                onClick={() => onSelectCategory(isSelected ? null : catKey)}
                className={cn(
                  "p-2.5 rounded-xl border flex items-center justify-between text-left transition-all cursor-pointer",
                  isSelected
                    ? "bg-bg-void border-accent-gold shadow-md ring-1 ring-accent-gold"
                    : "bg-bg-secondary/60 border-border/40 hover:border-border hover:bg-bg-secondary"
                )}
              >
                <div className="flex items-center gap-2 truncate">
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: config.color }}
                  />
                  <span className="text-text-primary font-medium truncate text-xs">
                    {config.label}
                  </span>
                </div>

                <div className="text-right shrink-0 ml-2">
                  <span className="font-bold text-text-primary block">
                    {formatCurrency(amt, user.currency, currency.locale)}
                  </span>
                  <span className="text-[10px] text-text-muted block">{pct}%</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
