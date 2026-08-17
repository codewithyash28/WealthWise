import React, { useState, useMemo } from "react";
import { motion } from "motion/react";
import { 
  TrendingDown, TrendingUp, AlertTriangle, ShieldAlert, Sparkles, 
  Activity, Sliders, RefreshCw, BarChart2, ShieldCheck, Flame, Zap, ArrowRight 
} from "lucide-react";
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, 
  CartesianGrid, Legend, ReferenceLine 
} from "recharts";
import { UserProfile } from "../types";
import { SupportedCurrency, formatStandardCurrency } from "../lib/revenueUtils";
import { cn } from "../lib/utils";

interface MacroScenarioStressTesterProps {
  user: UserProfile;
}

export type MacroScenarioKey = 
  | "baseline" 
  | "inflation_spike" 
  | "black_swan_crash" 
  | "tech_bull_run" 
  | "stagflation" 
  | "rate_hike";

interface ScenarioPreset {
  key: MacroScenarioKey;
  name: string;
  badge: string;
  icon: typeof AlertTriangle;
  color: string;
  description: string;
  initialShockPct: number;    // Immediate asset drawdown/boost %
  annualReturnDelta: number;  // Annual drag or boost %
  inflationRate: number;      // Annual inflation %
}

const SCENARIO_PRESETS: ScenarioPreset[] = [
  {
    key: "baseline",
    name: "Steady Compound Baseline",
    badge: "MODERATE GROWTH",
    icon: Activity,
    color: "#f0b429",
    description: "Standard market trajectory at ~11.5% nominal returns with 4.5% baseline inflation.",
    initialShockPct: 0,
    annualReturnDelta: 0,
    inflationRate: 4.5,
  },
  {
    key: "black_swan_crash",
    name: "Black Swan Crash (-30%)",
    badge: "SEVERE STRESS",
    icon: TrendingDown,
    color: "#ef4444",
    description: "Global liquidity crunch triggering immediate 30% equity correction with 2-year recovery curve.",
    initialShockPct: -30,
    annualReturnDelta: -4.0,
    inflationRate: 3.5,
  },
  {
    key: "inflation_spike",
    name: "Hyper-Inflation Spike (+8%)",
    badge: "PURCHASING POWER EROSION",
    icon: Flame,
    color: "#f97316",
    description: "Central bank over-expansion causing real purchasing power to contract by 8% annually.",
    initialShockPct: -5,
    annualReturnDelta: -2.5,
    inflationRate: 8.0,
  },
  {
    key: "tech_bull_run",
    name: "Autonomous AI Bull Run (+35%)",
    badge: "EXPONENTIAL UPSIDE",
    icon: TrendingUp,
    color: "#10b981",
    description: "AI productivity explosion compounding sovereign returns at +22% annualized growth.",
    initialShockPct: +15,
    annualReturnDelta: +10.5,
    inflationRate: 3.8,
  },
  {
    key: "stagflation",
    name: "Stagflation Crisis (Low Growth + High Inflation)",
    badge: "SYSTEMIC DRAG",
    icon: ShieldAlert,
    color: "#a855f7",
    description: "Stagnant GDP expansion paired with high energy inflation causing real returns to stagnate.",
    initialShockPct: -15,
    annualReturnDelta: -6.0,
    inflationRate: 7.2,
  },
];

export function MacroScenarioStressTester({ user }: MacroScenarioStressTesterProps) {
  const currency: SupportedCurrency = (user?.currency as SupportedCurrency) || "INR";
  const [selectedScenarioKey, setSelectedScenarioKey] = useState<MacroScenarioKey>("black_swan_crash");
  const [customYears, setCustomYears] = useState<number>(7);
  const [monthlySavingsInput, setMonthlySavingsInput] = useState<number>(35000);

  const activeScenario = useMemo(() => {
    return SCENARIO_PRESETS.find((s) => s.key === selectedScenarioKey) || SCENARIO_PRESETS[0];
  }, [selectedScenarioKey]);

  // Generate Multi-Year Trajectory Data for Recharts
  const simulationData = useMemo(() => {
    const startAssets = Math.max(100000, user?.netWorth?.assets || 5000000);
    const baselineReturn = 0.115; // 11.5%
    const currentYear = new Date().getFullYear();

    const dataPoints = [];
    let currentBaseline = startAssets;
    
    // Immediate shock applied to stressed scenario
    let currentStressed = startAssets * (1 + activeScenario.initialShockPct / 100);
    const stressedAnnualReturn = Math.max(
      -0.15,
      baselineReturn + activeScenario.annualReturnDelta / 100
    );

    const annualContribution = monthlySavingsInput * 12;

    for (let yr = 0; yr <= customYears; yr++) {
      const yearLabel = String(currentYear + yr);

      if (yr === 0) {
        dataPoints.push({
          year: `${yearLabel} (Start)`,
          baselineNetWorth: Math.round(startAssets),
          stressedNetWorth: Math.round(currentStressed),
          difference: Math.round(currentStressed - startAssets),
        });
      } else {
        // Compound baseline
        currentBaseline = currentBaseline * (1 + baselineReturn) + annualContribution;
        
        // Compound stressed scenario (recovering over time)
        const recoveryDampener = Math.min(1.0, 0.5 + yr * 0.15);
        const dynamicReturn = stressedAnnualReturn * recoveryDampener;
        currentStressed = Math.max(0, currentStressed * (1 + dynamicReturn) + annualContribution);

        dataPoints.push({
          year: yearLabel,
          baselineNetWorth: Math.round(currentBaseline),
          stressedNetWorth: Math.round(currentStressed),
          difference: Math.round(currentStressed - currentBaseline),
        });
      }
    }

    const finalBaseline = dataPoints[dataPoints.length - 1].baselineNetWorth;
    const finalStressed = dataPoints[dataPoints.length - 1].stressedNetWorth;
    const deltaFinal = finalStressed - finalBaseline;
    const deltaPct = ((deltaFinal / finalBaseline) * 100).toFixed(1);

    return {
      points: dataPoints,
      finalBaseline,
      finalStressed,
      deltaFinal,
      deltaPct,
    };
  }, [user, activeScenario, customYears, monthlySavingsInput]);

  return (
    <div className="card p-6 md:p-8 bg-gradient-to-br from-bg-secondary/95 via-bg-card to-bg-void/90 border-border/80 relative overflow-hidden shadow-2xl space-y-7">
      {/* Glow Effects */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-accent-gold/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/50 pb-5">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-cyan/10 border border-accent-cyan/20 text-accent-cyan text-[11px] font-mono font-bold uppercase tracking-wider">
            <Sliders className="w-3.5 h-3.5 animate-pulse" />
            <span>Autonomous Macro-Stress Testing Sandbox</span>
          </div>
          <h3 className="text-2xl font-display font-black text-text-primary tracking-tight">
            Real-Time Portfolio Scenario Simulator
          </h3>
          <p className="text-xs md:text-sm text-text-secondary">
            Simulate the resilience of your balance sheet against acute global shocks, interest rate cycles, and inflationary spikes.
          </p>
        </div>

        {/* Delta Stat Pill */}
        <div className="flex items-center gap-3 bg-bg-void/80 border border-border/80 px-4 py-2.5 rounded-xl font-mono text-xs shadow-inner">
          <span className="text-text-muted">Impact at Yr {customYears}:</span>
          <span className={cn("font-black text-sm", Number(simulationData.deltaPct) >= 0 ? "text-accent-emerald" : "text-accent-red")}>
            {Number(simulationData.deltaPct) >= 0 ? "+" : ""}{simulationData.deltaPct}% ({formatStandardCurrency(simulationData.deltaFinal, currency, true)})
          </span>
        </div>
      </div>

      {/* Scenario Presets Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
        {SCENARIO_PRESETS.map((s) => {
          const Icon = s.icon;
          const isActive = selectedScenarioKey === s.key;
          return (
            <button
              key={s.key}
              type="button"
              onClick={() => setSelectedScenarioKey(s.key)}
              className={cn(
                "p-3 rounded-xl border text-left transition-all flex flex-col justify-between space-y-2 cursor-pointer font-mono",
                isActive
                  ? "bg-bg-secondary border-accent-gold shadow-md ring-1 ring-accent-gold/40 scale-[1.02]"
                  : "bg-bg-card/60 border-border/70 hover:border-border-active hover:bg-bg-tertiary/40"
              )}
            >
              <div className="flex items-center justify-between">
                <Icon className="w-4 h-4" style={{ color: s.color }} />
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-bg-void border border-border/50 text-text-muted uppercase">
                  {s.badge}
                </span>
              </div>
              <div>
                <div className="text-xs font-bold text-text-primary leading-tight">
                  {s.name}
                </div>
                <div className="text-[10px] text-text-secondary mt-1 line-clamp-2">
                  {s.description}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Interactive Simulation Levers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-bg-void/50 border border-border/60 font-mono text-xs">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-text-muted font-bold">Simulation Horizon:</span>
            <span className="text-accent-gold font-black">{customYears} Years</span>
          </div>
          <input
            type="range"
            min={3}
            max={15}
            step={1}
            value={customYears}
            onChange={(e) => setCustomYears(Number(e.target.value))}
            className="w-full accent-accent-gold cursor-pointer"
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-text-muted font-bold">Monthly Systematic Savings:</span>
            <span className="text-accent-emerald font-black">
              {formatStandardCurrency(monthlySavingsInput, currency, true)}/mo
            </span>
          </div>
          <input
            type="range"
            min={5000}
            max={200000}
            step={5000}
            value={monthlySavingsInput}
            onChange={(e) => setMonthlySavingsInput(Number(e.target.value))}
            className="w-full accent-accent-emerald cursor-pointer"
          />
        </div>
      </div>

      {/* Recharts Trajectory Visualization */}
      <div className="p-4 rounded-2xl bg-bg-void/70 border border-border/70 space-y-3">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="font-bold text-text-primary flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-accent-gold" />
            Net Worth Growth Trajectory ({currency})
          </span>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1.5 text-accent-gold">
              <span className="w-2.5 h-2.5 rounded-full bg-accent-gold" /> Baseline Growth
            </span>
            <span className="flex items-center gap-1.5" style={{ color: activeScenario.color }}>
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: activeScenario.color }} /> Stressed Path
            </span>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={simulationData.points} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorBaseline" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f0b429" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f0b429" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorStressed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={activeScenario.color} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={activeScenario.color} stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis dataKey="year" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis 
                stroke="#94a3b8" 
                fontSize={11} 
                tickLine={false}
                tickFormatter={(val) => formatStandardCurrency(val, currency, true)}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const base = payload.find((p) => p.dataKey === "baselineNetWorth")?.value as number;
                    const stress = payload.find((p) => p.dataKey === "stressedNetWorth")?.value as number;
                    return (
                      <div className="p-3 bg-bg-secondary/95 border border-border rounded-xl shadow-2xl backdrop-blur-md font-mono text-xs space-y-1.5">
                        <div className="font-bold text-text-primary border-b border-border/50 pb-1">{label}</div>
                        <div className="flex items-center justify-between gap-4 text-accent-gold">
                          <span>Baseline:</span>
                          <span className="font-bold">{formatStandardCurrency(base, currency)}</span>
                        </div>
                        <div className="flex items-center justify-between gap-4" style={{ color: activeScenario.color }}>
                          <span>Stressed:</span>
                          <span className="font-bold">{formatStandardCurrency(stress, currency)}</span>
                        </div>
                        <div className="flex items-center justify-between gap-4 text-text-muted text-[10px] pt-1 border-t border-border/40">
                          <span>Delta:</span>
                          <span className={stress >= base ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
                            {stress >= base ? "+" : ""}{formatStandardCurrency(stress - base, currency)}
                          </span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="baselineNetWorth"
                stroke="#f0b429"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorBaseline)"
                name="Baseline Growth"
              />
              <Area
                type="monotone"
                dataKey="stressedNetWorth"
                stroke={activeScenario.color}
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorStressed)"
                name="Stressed Simulation"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
