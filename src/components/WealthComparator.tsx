import React, { useState, useMemo } from "react";
import { motion } from "motion/react";
import { 
  Split, 
  TrendingUp, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles, 
  DollarSign, 
  Zap, 
  BarChart2, 
  Sliders, 
  CheckCircle2 
} from "lucide-react";
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from "recharts";
import { formatCurrency, cn } from "../lib/utils";
import { CURRENCIES } from "../constants";
import { UserProfile } from "../types";

interface WealthComparatorProps {
  user: UserProfile;
}

interface ScenarioOption {
  id: string;
  name: string;
  description: string;
  expectedAnnualReturn: number;
  monthlyContribution: number;
  riskTier: "CONSERVATIVE" | "MODERATE" | "AGGRESSIVE" | "CUSTOM";
  initialCapital: number;
  color: string;
}

const PRESET_SCENARIOS: ScenarioOption[] = [
  {
    id: "sc-index",
    name: "S&P 500 Index DCA (Balanced)",
    description: "Systematic monthly dollar-cost averaging into broad market low-cost equity indices.",
    expectedAnnualReturn: 10.5,
    monthlyContribution: 500,
    riskTier: "MODERATE",
    initialCapital: 10000,
    color: "#f0b429"
  },
  {
    id: "sc-high-yield",
    name: "Treasury + High Yield Bond Ladder (Conservative)",
    description: "Sovereign guaranteed debt, fixed deposits, and ultra-short bond liquidity vaults.",
    expectedAnnualReturn: 5.8,
    monthlyContribution: 500,
    riskTier: "CONSERVATIVE",
    initialCapital: 10000,
    color: "#10b981"
  },
  {
    id: "sc-aggressive-tech",
    name: "Tech & AI Growth Fund (Aggressive)",
    description: "Concentrated semiconductor, cloud infrastructure, and frontier innovation portfolio.",
    expectedAnnualReturn: 15.2,
    monthlyContribution: 500,
    riskTier: "AGGRESSIVE",
    initialCapital: 10000,
    color: "#38bdf8"
  },
  {
    id: "sc-real-estate",
    name: "Real Estate REIT + Cash Flow (Moderate)",
    description: "Dividend yielding real estate trusts, commercial leaseholds, and mortgage-backed notes.",
    expectedAnnualReturn: 8.4,
    monthlyContribution: 500,
    riskTier: "MODERATE",
    initialCapital: 10000,
    color: "#c084fc"
  }
];

export function WealthComparator({ user }: WealthComparatorProps) {
  const currency = CURRENCIES[user.currency] || CURRENCIES.USD;

  const [scenarioAId, setScenarioAId] = useState<string>("sc-index");
  const [scenarioBId, setScenarioBId] = useState<string>("sc-high-yield");
  const [yearsHorizon, setYearsHorizon] = useState<number>(15);

  const scenarioA = useMemo(() => PRESET_SCENARIOS.find(s => s.id === scenarioAId) || PRESET_SCENARIOS[0], [scenarioAId]);
  const scenarioB = useMemo(() => PRESET_SCENARIOS.find(s => s.id === scenarioBId) || PRESET_SCENARIOS[1], [scenarioBId]);

  // Generate 1..N years compounded growth points
  const comparisonData = useMemo(() => {
    const points = [];
    const rA = scenarioA.expectedAnnualReturn / 100 / 12;
    const rB = scenarioB.expectedAnnualReturn / 100 / 12;

    let balanceA = scenarioA.initialCapital;
    let balanceB = scenarioB.initialCapital;
    let totalInvested = scenarioA.initialCapital;

    points.push({
      year: "Year 0",
      scenarioA: Math.round(balanceA),
      scenarioB: Math.round(balanceB),
      principal: Math.round(totalInvested)
    });

    for (let y = 1; y <= yearsHorizon; y++) {
      for (let m = 1; m <= 12; m++) {
        balanceA = balanceA * (1 + rA) + scenarioA.monthlyContribution;
        balanceB = balanceB * (1 + rB) + scenarioB.monthlyContribution;
        totalInvested += scenarioA.monthlyContribution;
      }
      points.push({
        year: `Yr ${y}`,
        scenarioA: Math.round(balanceA),
        scenarioB: Math.round(balanceB),
        principal: Math.round(totalInvested)
      });
    }

    return points;
  }, [scenarioA, scenarioB, yearsHorizon]);

  const finalPoint = comparisonData[comparisonData.length - 1];
  const deltaValue = (finalPoint?.scenarioA || 0) - (finalPoint?.scenarioB || 0);

  return (
    <div className="card p-6 md:p-8 bg-gradient-to-br from-bg-secondary/90 via-bg-card to-bg-void border-border/80 space-y-6 font-sans">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-cyan/10 border border-accent-cyan/30 text-accent-cyan text-xs font-mono font-bold uppercase tracking-wider">
            <Split className="w-3.5 h-3.5" />
            <span>Side-by-Side Trajectory Sandbox</span>
          </div>
          <h3 className="text-2xl font-display font-black text-text-primary">
            Wealth Growth Comparator
          </h3>
          <p className="text-xs md:text-sm text-text-secondary">
            Pick two distinct compounding strategies to compare long-term capital divergence and wealth velocity.
          </p>
        </div>

        {/* Time Horizon Slider */}
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-bg-void/70 border border-border/80 font-mono text-xs">
          <span className="text-text-muted font-bold">Horizon:</span>
          <div className="flex gap-1.5">
            {[5, 10, 15, 20, 25, 30].map((yr) => (
              <button
                key={yr}
                onClick={() => setYearsHorizon(yr)}
                className={cn(
                  "px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer",
                  yearsHorizon === yr
                    ? "bg-accent-gold text-slate-950 shadow-sm"
                    : "bg-bg-secondary text-text-secondary hover:text-text-primary"
                )}
              >
                {yr}Y
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Scenario Selection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
        {/* Scenario A */}
        <div className="p-4 rounded-2xl bg-bg-void/80 border border-accent-gold/40 space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-1 rounded-lg bg-accent-gold/20 text-accent-gold font-bold text-[10px] uppercase border border-accent-gold/40">
              Scenario Alpha (A)
            </span>
            <span className="text-accent-gold font-black text-sm">
              +{scenarioA.expectedAnnualReturn}% APY
            </span>
          </div>

          <select
            value={scenarioAId}
            onChange={(e) => setScenarioAId(e.target.value)}
            className="w-full p-2.5 rounded-xl bg-bg-secondary border border-border text-text-primary font-bold focus:border-accent-gold outline-none cursor-pointer"
          >
            {PRESET_SCENARIOS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.expectedAnnualReturn}% APY)
              </option>
            ))}
          </select>

          <p className="text-[11px] text-text-secondary font-sans leading-relaxed">
            {scenarioA.description}
          </p>

          <div className="pt-2 border-t border-border/40 flex items-center justify-between text-[11px]">
            <span className="text-text-muted">End Balance ({yearsHorizon}Y):</span>
            <span className="text-accent-gold font-black text-sm">
              {formatCurrency(finalPoint?.scenarioA || 0, user.currency, currency.locale)}
            </span>
          </div>
        </div>

        {/* Scenario B */}
        <div className="p-4 rounded-2xl bg-bg-void/80 border border-accent-emerald/40 space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-1 rounded-lg bg-accent-emerald/20 text-accent-emerald font-bold text-[10px] uppercase border border-accent-emerald/40">
              Scenario Beta (B)
            </span>
            <span className="text-accent-emerald font-black text-sm">
              +{scenarioB.expectedAnnualReturn}% APY
            </span>
          </div>

          <select
            value={scenarioBId}
            onChange={(e) => setScenarioBId(e.target.value)}
            className="w-full p-2.5 rounded-xl bg-bg-secondary border border-border text-text-primary font-bold focus:border-accent-emerald outline-none cursor-pointer"
          >
            {PRESET_SCENARIOS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.expectedAnnualReturn}% APY)
              </option>
            ))}
          </select>

          <p className="text-[11px] text-text-secondary font-sans leading-relaxed">
            {scenarioB.description}
          </p>

          <div className="pt-2 border-t border-border/40 flex items-center justify-between text-[11px]">
            <span className="text-text-muted">End Balance ({yearsHorizon}Y):</span>
            <span className="text-accent-emerald font-black text-sm">
              {formatCurrency(finalPoint?.scenarioB || 0, user.currency, currency.locale)}
            </span>
          </div>
        </div>
      </div>

      {/* Trajectory Recharts Graph */}
      <div className="p-5 rounded-2xl bg-bg-void/60 border border-border/80 space-y-3">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-text-muted uppercase font-bold flex items-center gap-1.5">
            <BarChart2 className="w-4 h-4 text-accent-gold" />
            Compounding Trajectory Curve
          </span>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-accent-gold"></span>
              <span className="text-text-primary font-bold">{scenarioA.name.split(" ")[0]}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-accent-emerald"></span>
              <span className="text-text-primary font-bold">{scenarioB.name.split(" ")[0]}</span>
            </div>
            <div className="flex items-center gap-1.5 text-text-muted">
              <span className="w-3 h-1 bg-slate-500"></span>
              <span>Principal</span>
            </div>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={comparisonData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="year" stroke="#64748b" tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <YAxis 
                stroke="#64748b" 
                tick={{ fontSize: 10, fill: '#94a3b8' }} 
                tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`} 
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#020408",
                  borderColor: "rgba(240, 180, 41, 0.4)",
                  borderRadius: "12px",
                  fontSize: "11px",
                  fontFamily: "monospace"
                }}
                formatter={(val: any) => [formatCurrency(Number(val) || 0, user.currency, currency.locale), ""]}
              />
              <Line 
                type="monotone" 
                dataKey="scenarioA" 
                name="Scenario A" 
                stroke="#f0b429" 
                strokeWidth={3} 
                dot={false} 
              />
              <Line 
                type="monotone" 
                dataKey="scenarioB" 
                name="Scenario B" 
                stroke="#10b981" 
                strokeWidth={3} 
                dot={false} 
              />
              <Line 
                type="monotone" 
                dataKey="principal" 
                name="Total Contributed" 
                stroke="#64748b" 
                strokeDasharray="4 4" 
                strokeWidth={1.5} 
                dot={false} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Delta Analysis Pill */}
        <div className="p-3 rounded-xl bg-bg-card border border-border/80 flex items-center justify-between font-mono text-xs">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-accent-gold" />
            <span className="text-text-secondary">
              Strategic Alpha Divergence:
            </span>
          </div>
          <div className="font-black text-sm">
            {deltaValue >= 0 ? (
              <span className="text-accent-gold">
                Scenario A leads by +{formatCurrency(deltaValue, user.currency, currency.locale)} (+{Math.round((deltaValue / (finalPoint?.scenarioB || 1)) * 100)}%)
              </span>
            ) : (
              <span className="text-accent-emerald">
                Scenario B leads by +{formatCurrency(Math.abs(deltaValue), user.currency, currency.locale)} (+{Math.round((Math.abs(deltaValue) / (finalPoint?.scenarioA || 1)) * 100)}%)
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
