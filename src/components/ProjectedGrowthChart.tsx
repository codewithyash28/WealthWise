import { useState, useMemo } from "react";
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip as RechartsTooltip, 
  Legend, 
  CartesianGrid, 
  ReferenceLine 
} from "recharts";
import { UserProfile, BudgetPlan } from "../types";
import { CURRENCIES } from "../constants";
import { formatCurrency, cn } from "../lib/utils";
import { TrendingUp, Sparkles, Sliders, ShieldCheck, ArrowUpRight, DollarSign, Calendar } from "lucide-react";
import { motion } from "motion/react";

interface ProjectedGrowthChartProps {
  user: UserProfile;
  budget: BudgetPlan | null;
}

export function ProjectedGrowthChart({ user, budget }: ProjectedGrowthChartProps) {
  const [horizonYears, setHorizonYears] = useState<1 | 3 | 5 | 10>(5);
  const [expectedApy, setExpectedApy] = useState<number>(8.0); // 8.0% annual return
  const currency = CURRENCIES[user.currency] || CURRENCIES.USD;

  const currentNetWorth = useMemo(() => {
    return Math.max(0, user.netWorth.assets - user.netWorth.liabilities);
  }, [user.netWorth]);

  const monthlySavingsSurplus = useMemo(() => {
    if (!budget) return 0;
    const totalExp = Object.values(budget.expenses).reduce((a, b) => a + (Number(b) || 0), 0);
    return Math.max(0, budget.income - totalExp);
  }, [budget]);

  const savingsRatePercent = useMemo(() => {
    if (!budget || budget.income <= 0) return 0;
    return Math.round((monthlySavingsSurplus / budget.income) * 100);
  }, [budget, monthlySavingsSurplus]);

  // Generate dynamic monthly compounding data points
  const chartData = useMemo(() => {
    const totalMonths = horizonYears * 12;
    const stepMonths = horizonYears >= 5 ? 6 : horizonYears >= 3 ? 3 : 1;
    const monthlyApy = Math.pow(1 + expectedApy / 100, 1 / 12) - 1;
    const conservativeMonthlyApy = Math.pow(1 + 0.04, 1 / 12) - 1; // 4% conservative
    const highGrowthMonthlyApy = Math.pow(1 + 0.12, 1 / 12) - 1; // 12% aggressive

    const data: {
      monthLabel: string;
      monthIndex: number;
      projectedNetWorth: number;
      conservativeNetWorth: number;
      highGrowthNetWorth: number;
      principalContributions: number;
    }[] = [];

    // Month 0 (Starting Baseline)
    data.push({
      monthLabel: "Today",
      monthIndex: 0,
      projectedNetWorth: currentNetWorth,
      conservativeNetWorth: currentNetWorth,
      highGrowthNetWorth: currentNetWorth,
      principalContributions: currentNetWorth,
    });

    for (let m = stepMonths; m <= totalMonths; m += stepMonths) {
      // Future Value compounding formula:
      // FV = PV * (1 + r)^n + PMT * [((1 + r)^n - 1) / r]
      const fvExpected = Math.round(
        currentNetWorth * Math.pow(1 + monthlyApy, m) +
        (monthlySavingsSurplus * (Math.pow(1 + monthlyApy, m) - 1)) / (monthlyApy || 0.0001)
      );

      const fvConservative = Math.round(
        currentNetWorth * Math.pow(1 + conservativeMonthlyApy, m) +
        (monthlySavingsSurplus * (Math.pow(1 + conservativeMonthlyApy, m) - 1)) / (conservativeMonthlyApy || 0.0001)
      );

      const fvHighGrowth = Math.round(
        currentNetWorth * Math.pow(1 + highGrowthMonthlyApy, m) +
        (monthlySavingsSurplus * (Math.pow(1 + highGrowthMonthlyApy, m) - 1)) / (highGrowthMonthlyApy || 0.0001)
      );

      const principalTotal = currentNetWorth + (monthlySavingsSurplus * m);

      const yearNum = Math.floor(m / 12);
      const remMonths = m % 12;
      const label = yearNum > 0 && remMonths === 0 ? `Yr ${yearNum}` : `M${m}`;

      data.push({
        monthLabel: label,
        monthIndex: m,
        projectedNetWorth: fvExpected,
        conservativeNetWorth: fvConservative,
        highGrowthNetWorth: fvHighGrowth,
        principalContributions: principalTotal,
      });
    }

    return data;
  }, [currentNetWorth, monthlySavingsSurplus, expectedApy, horizonYears]);

  const endHorizonVal = chartData[chartData.length - 1]?.projectedNetWorth || currentNetWorth;
  const growthDelta = endHorizonVal - currentNetWorth;
  const safeMonthlyRetirementDraw = Math.round((endHorizonVal * 0.04) / 12);

  return (
    <div className="space-y-6">
      {/* Controls & Metrics Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 rounded-2xl bg-bg-void border border-border/80">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-text-muted">Horizon:</span>
            <div className="flex items-center gap-1 p-1 bg-bg-secondary rounded-xl border border-border">
              {([1, 3, 5, 10] as const).map((yr) => (
                <button
                  key={yr}
                  type="button"
                  onClick={() => setHorizonYears(yr)}
                  className={cn(
                    "px-3 py-1 text-xs font-mono font-bold rounded-lg transition-all cursor-pointer",
                    horizonYears === yr
                      ? "bg-accent-gold text-slate-950 shadow-sm font-black"
                      : "text-text-muted hover:text-text-primary"
                  )}
                >
                  {yr}Y
                </button>
              ))}
            </div>
          </div>

          <div className="h-4 w-px bg-border/60 hidden sm:block" />

          {/* Expected Return APY slider */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-text-muted">Expected APY:</span>
            <input
              type="range"
              min="2"
              max="18"
              step="0.5"
              value={expectedApy}
              onChange={(e) => setExpectedApy(Number(e.target.value))}
              className="w-24 accent-accent-gold cursor-pointer"
            />
            <span className="text-xs font-mono font-bold text-accent-gold w-12 text-right">
              {expectedApy.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Dynamic Metric Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-bold flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Savings Surplus: {formatCurrency(monthlySavingsSurplus, user.currency, currency.locale)}/mo ({savingsRatePercent}%)</span>
          </div>
        </div>
      </div>

      {/* Recharts Visual Projected Growth Line Chart */}
      <div className="h-[340px] w-full p-4 rounded-2xl bg-bg-secondary/20 border border-border/40 relative">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 15, right: 25, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
            <XAxis 
              dataKey="monthLabel" 
              tick={{ fill: "#94a3b8", fontSize: 11, fontFamily: "JetBrains Mono" }}
              axisLine={{ stroke: "rgba(255, 255, 255, 0.1)" }}
              tickLine={false}
            />
            <YAxis 
              tick={{ fill: "#94a3b8", fontSize: 10, fontFamily: "JetBrains Mono" }}
              axisLine={{ stroke: "rgba(255, 255, 255, 0.1)" }}
              tickLine={false}
              tickFormatter={(val) => {
                if (val >= 1000000) return `${currency.symbol}${(val / 1000000).toFixed(1)}M`;
                if (val >= 1000) return `${currency.symbol}${(val / 1000).toFixed(0)}K`;
                return `${currency.symbol}${val}`;
              }}
            />
            <RechartsTooltip 
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="p-3 rounded-xl bg-slate-950 border border-border/80 shadow-2xl text-xs font-mono space-y-1.5 backdrop-blur-md">
                      <div className="text-accent-gold font-bold border-b border-border/50 pb-1 flex items-center justify-between gap-4">
                        <span>Horizon Point: {label}</span>
                        <span className="text-[10px] text-text-muted font-normal">Compounding Model</span>
                      </div>
                      {payload.map((entry: any, index: number) => (
                        <div key={index} className="flex items-center justify-between gap-4">
                          <span className="flex items-center gap-1.5" style={{ color: entry.color }}>
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                            <span>{entry.name}:</span>
                          </span>
                          <span className="font-bold text-text-primary">
                            {formatCurrency(entry.value, user.currency, currency.locale)}
                          </span>
                        </div>
                      ))}
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend 
              verticalAlign="top"
              height={36}
              iconType="circle"
              wrapperStyle={{ fontSize: 11, fontFamily: "JetBrains Mono", paddingBottom: 10 }}
            />
            <ReferenceLine 
              y={currentNetWorth} 
              stroke="#64748b" 
              strokeDasharray="4 4" 
              label={{ value: "Starting Point", fill: "#64748b", fontSize: 9, position: "insideBottomRight" }}
            />
            <Line 
              type="monotone" 
              dataKey="projectedNetWorth" 
              name={`Optimized (${expectedApy}% APY)`} 
              stroke="#f59e0b" 
              strokeWidth={3}
              dot={{ r: 3, fill: "#f59e0b" }}
              activeDot={{ r: 6, fill: "#fbbf24" }}
            />
            <Line 
              type="monotone" 
              dataKey="conservativeNetWorth" 
              name="Conservative (4% APY)" 
              stroke="#38bdf8" 
              strokeWidth={2}
              strokeDasharray="3 3"
              dot={false}
            />
            <Line 
              type="monotone" 
              dataKey="principalContributions" 
              name="Cash Deposited (0% APY)" 
              stroke="#94a3b8" 
              strokeWidth={1.5}
              strokeDasharray="5 5"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 4 Compounding Insight Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
        <div className="p-4 rounded-xl bg-bg-void border border-border/60 space-y-1">
          <div className="text-[10px] text-text-muted uppercase tracking-wider font-bold">Initial Balance</div>
          <div className="text-lg font-bold text-text-primary">
            {formatCurrency(currentNetWorth, user.currency, currency.locale)}
          </div>
          <p className="text-[10px] text-text-muted font-sans">Starting active net worth baseline.</p>
        </div>

        <div className="p-4 rounded-xl bg-bg-void border border-border/60 space-y-1">
          <div className="text-[10px] text-text-muted uppercase tracking-wider font-bold">Monthly Inflow</div>
          <div className="text-lg font-bold text-emerald-400">
            +{formatCurrency(monthlySavingsSurplus, user.currency, currency.locale)}/mo
          </div>
          <p className="text-[10px] text-text-muted font-sans">Surplus swept into compounding.</p>
        </div>

        <div className="p-4 rounded-xl bg-bg-void border border-accent-gold/40 bg-accent-gold/5 space-y-1">
          <div className="text-[10px] text-accent-gold uppercase tracking-wider font-bold">
            {horizonYears}-Year Projected Total
          </div>
          <div className="text-lg font-bold text-accent-gold">
            {formatCurrency(endHorizonVal, user.currency, currency.locale)}
          </div>
          <p className="text-[10px] text-emerald-400 font-sans font-bold flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3" /> +{formatCurrency(growthDelta, user.currency, currency.locale)} estimated growth
          </p>
        </div>

        <div className="p-4 rounded-xl bg-bg-void border border-border/60 space-y-1">
          <div className="text-[10px] text-text-muted uppercase tracking-wider font-bold">Safe 4% Trinity Draw</div>
          <div className="text-lg font-bold text-teal-300">
            {formatCurrency(safeMonthlyRetirementDraw, user.currency, currency.locale)}/mo
          </div>
          <p className="text-[10px] text-text-muted font-sans">Perpetual passive withdrawal power.</p>
        </div>
      </div>
    </div>
  );
}
