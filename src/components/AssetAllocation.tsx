import { useState, useMemo } from "react";
import { motion } from "motion/react";
import { PieChart, Shield, Zap, Target, Info, ChevronRight } from "lucide-react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { cn } from "../lib/utils";

ChartJS.register(ArcElement, Tooltip, Legend);

type RiskLevel = "CONSERVATIVE" | "MODERATE" | "AGGRESSIVE" | "VERY_AGGRESSIVE";

interface Allocation {
  label: string;
  value: number;
  color: string;
  desc: string;
}

const ALLOCATIONS: Record<RiskLevel, Allocation[]> = {
  CONSERVATIVE: [
    { label: "Bonds", value: 60, color: "#3B82F6", desc: "Stable income, low risk" },
    { label: "Cash/FD", value: 20, color: "#94A3B8", desc: "Maximum liquidity" },
    { label: "Stocks", value: 20, color: "#F0B429", desc: "Modest growth potential" },
  ],
  MODERATE: [
    { label: "Stocks", value: 50, color: "#F0B429", desc: "Balanced growth" },
    { label: "Bonds", value: 40, color: "#3B82F6", desc: "Risk mitigation" },
    { label: "Gold/Other", value: 10, color: "#10D9A0", desc: "Diversification" },
  ],
  AGGRESSIVE: [
    { label: "Stocks", value: 80, color: "#F0B429", desc: "High growth focus" },
    { label: "Bonds", value: 15, color: "#3B82F6", desc: "Small safety net" },
    { label: "Crypto/Speculative", value: 5, color: "#7C3AED", desc: "High risk, high reward" },
  ],
  VERY_AGGRESSIVE: [
    { label: "Stocks (Large Cap)", value: 50, color: "#F0B429", desc: "Core growth" },
    { label: "Stocks (Mid/Small)", value: 40, color: "#F97316", desc: "Aggressive growth" },
    { label: "Crypto/Speculative", value: 10, color: "#7C3AED", desc: "Maximum risk" },
  ],
};

export function AssetAllocation() {
  const [riskLevel, setRiskLevel] = useState<RiskLevel>("MODERATE");

  const currentAllocation = ALLOCATIONS[riskLevel];

  const chartData = {
    labels: currentAllocation.map(a => a.label),
    datasets: [{
      data: currentAllocation.map(a => a.value),
      backgroundColor: currentAllocation.map(a => a.color),
      borderWidth: 0,
      hoverOffset: 10,
    }],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#111827',
        titleFont: { family: 'Syne', size: 14 },
        bodyFont: { family: 'Outfit', size: 12 },
        borderColor: 'rgba(240,180,41,0.2)',
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label: (context: any) => `${context.label}: ${context.raw}%`
        }
      }
    },
    cutout: '70%',
  };

  return (
    <div className="container mx-auto px-6 py-12 space-y-12">
      <div className="space-y-2">
        <h1 className="text-4xl font-display font-bold">Asset Allocation Tool</h1>
        <p className="text-text-secondary">Optimize your portfolio based on your risk appetite</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-8">
          <div className="card p-8 space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Shield className="w-5 h-5 text-accent-gold" /> Select Your Risk Tolerance
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(Object.keys(ALLOCATIONS) as RiskLevel[]).map((level) => (
                <button
                  key={level}
                  onClick={() => setRiskLevel(level)}
                  className={cn(
                    "p-4 rounded-xl border text-left transition-all group",
                    riskLevel === level 
                      ? "bg-accent-gold/10 border-accent-gold text-accent-gold" 
                      : "bg-bg-secondary border-border hover:border-border-active"
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-widest">{level.replace("_", " ")}</span>
                    {level === "VERY_AGGRESSIVE" && <Zap className="w-4 h-4 text-accent-purple" />}
                  </div>
                  <p className="text-[10px] text-text-secondary group-hover:text-text-primary transition-colors">
                    {level === "CONSERVATIVE" ? "Capital preservation is priority." :
                     level === "MODERATE" ? "Balance between growth and safety." :
                     level === "AGGRESSIVE" ? "Focus on long-term wealth creation." :
                     "Maximum exposure to high-growth assets."}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div className="card p-8 space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Target className="w-5 h-5 text-accent-emerald" /> Why Allocation Matters
            </h3>
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-bg-secondary border border-border">
                <p className="text-sm text-text-secondary leading-relaxed">
                  "Asset allocation is the most important decision in investing. It accounts for over 90% of your portfolio's return variability."
                </p>
              </div>
              <div className="p-4 rounded-xl bg-bg-secondary border border-border">
                <p className="text-sm text-text-secondary leading-relaxed">
                  "Diversification is the only free lunch in finance. By spreading your money across different assets, you reduce risk without necessarily sacrificing returns."
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="card p-8 flex flex-col items-center justify-center space-y-8">
            <h3 className="text-xl font-bold w-full text-left">Recommended Mix</h3>
            <div className="relative w-full h-[300px]">
              <Doughnut data={chartData} options={chartOptions} />
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <div className="text-text-muted text-xs uppercase tracking-widest">Risk Level</div>
                <div className="text-lg font-mono font-bold text-accent-gold">{riskLevel.replace("_", " ")}</div>
              </div>
            </div>
            <div className="space-y-4 w-full">
              {currentAllocation.map((item) => (
                <div key={item.label} className="flex items-center justify-between p-3 rounded-xl bg-bg-secondary border border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <div>
                      <div className="text-sm font-bold">{item.label}</div>
                      <div className="text-[10px] text-text-muted">{item.desc}</div>
                    </div>
                  </div>
                  <div className="text-lg font-mono font-bold text-accent-gold">{item.value}%</div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-accent-gold/5 border border-accent-gold/20 text-center">
            <p className="text-accent-gold font-medium italic">
              "Rebalance your portfolio at least once a year to maintain your target allocation!"
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
