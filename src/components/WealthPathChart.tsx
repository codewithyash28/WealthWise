import { useState, useMemo, useEffect } from "react";
import { Line } from "react-chartjs-2";
import { ResponsiveChartContainer } from "./ui/ResponsiveChartContainer";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { UserProfile, BudgetPlan } from "../types";
import { CURRENCIES } from "../constants";
import { ArrowUpRight, ShieldAlert, Sparkles, TrendingUp, TrendingDown, Info } from "lucide-react";
import { cn } from "../lib/utils";
import { motion } from "motion/react";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

interface WealthPathChartProps {
  user: UserProfile;
  budget: BudgetPlan | null;
}

type ScenarioType = "yield" | "market" | "inflation";

export function WealthPathChart({ user, budget }: WealthPathChartProps) {
  const [selectedScenario, setSelectedScenario] = useState<ScenarioType>("yield");
  const currency = CURRENCIES[user.currency] || CURRENCIES.USD;

  // Track systematic market bias pushed from MarketInsights component
  const [marketBias, setMarketBias] = useState<"neutral" | "bull" | "bear">(() => {
    const saved = localStorage.getItem("ww_market_bias");
    return (saved as "neutral" | "bull" | "bear") || "neutral";
  });

  useEffect(() => {
    const handleBiasChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && customEvent.detail.bias) {
        setMarketBias(customEvent.detail.bias);
      }
    };
    window.addEventListener("ww-market-bias", handleBiasChange);
    return () => window.removeEventListener("ww-market-bias", handleBiasChange);
  }, []);

  const scenarios = [
    {
      id: "yield" as const,
      name: "MockYield DeFi Staking",
      desc: "Simulates high-yield stablecoin staking and smart-contract yield generation (+12% APY compound).",
      icon: <Sparkles className="w-3.5 h-3.5 text-accent-emerald" />,
      color: "#10b981",
      bgColor: "rgba(16, 185, 129, 0.05)",
      borderColor: "border-accent-emerald/20",
      activeBg: "bg-accent-emerald/10",
      activeBorder: "border-accent-emerald"
    },
    {
      id: "market" as const,
      name: "TrendMarket Premium Bull Run",
      desc: "Leverages active pop-culture index funds and sentiment momentum swing trading (+22% APY project).",
      icon: <TrendingUp className="w-3.5 h-3.5 text-accent-gold" />,
      color: "#f59e0b",
      bgColor: "rgba(245, 158, 11, 0.05)",
      borderColor: "border-accent-gold/20",
      activeBg: "bg-accent-gold/10",
      activeBorder: "border-accent-gold"
    },
    {
      id: "inflation" as const,
      name: "MacroPulse High-CPI Erosion",
      desc: "Stress-tests your cash holdings against severe 7.5% global inflation devaluations.",
      icon: <ShieldAlert className="w-3.5 h-3.5 text-accent-red" />,
      color: "#f87171",
      bgColor: "rgba(248, 113, 113, 0.05)",
      borderColor: "border-accent-red/20",
      activeBg: "bg-accent-red/10",
      activeBorder: "border-accent-red"
    }
  ];

  const currentScenarioDetails = scenarios.find(s => s.id === selectedScenario)!;

  const chartData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonthIndex = new Date().getMonth();
    const labels: string[] = [];
    const historicalValues: (number | null)[] = [];
    const baselineValues: (number | null)[] = [];
    const scenarioValues: (number | null)[] = [];

    const netWorth = user.netWorth.assets - user.netWorth.liabilities;
    const monthlySavings = budget ? budget.income - Object.values(budget.expenses).reduce((a, b) => a + b, 0) : 0;
    
    // 1. Past 6 months (simulated historical data)
    for (let i = 5; i >= 0; i--) {
      const monthIdx = (currentMonthIndex - i + 12) % 12;
      labels.push(months[monthIdx]);
      // Mock past net worth growth trajectory (subtle upwards progression ending at active net worth)
      const factor = 1 - (i * 0.035);
      historicalValues.push(netWorth * factor);
      baselineValues.push(null);
      scenarioValues.push(null);
    }

    // Connect past with projection at "Now" (index 5)
    labels[labels.length - 1] = labels[labels.length - 1] + " (Now)";
    baselineValues[historicalValues.length - 1] = historicalValues[historicalValues.length - 1]; 
    scenarioValues[historicalValues.length - 1] = historicalValues[historicalValues.length - 1];

    // Selected Scenario Projection Modifiers based on active structural Market Feed Bias
    let multiplier = 1.0;
    if (marketBias === "bull") multiplier = 1.35; // Boost compound yields 35%
    if (marketBias === "bear") multiplier = 0.55; // Diminish interest rates by 45% due to systemic contraction

    // 2. Future 6 months (Projections)
    for (let i = 1; i <= 6; i++) {
      const monthIdx = (currentMonthIndex + i) % 12;
      labels.push(months[monthIdx]);
      historicalValues.push(null);

      // Baseline Projection (standard passive bank savings or standard index investing rate)
      const baselineVal = netWorth + (monthlySavings * i) * 1.008; // 0.8% organic monthly interest rate
      baselineValues.push(baselineVal);

      // Selected Scenario Projection
      let scenarioVal = netWorth;
      if (selectedScenario === "yield") {
        // High Yield APY compound simulations (DeFi stable staking)
        const yieldRate = 1 + (0.025 * multiplier);
        scenarioVal = netWorth + (monthlySavings * i) * yieldRate; 
      } else if (selectedScenario === "market") {
        // Active Trend Trading growth projections
        const marketRate = 1 + (0.045 * multiplier);
        scenarioVal = netWorth + (monthlySavings * i) * marketRate; 
      } else if (selectedScenario === "inflation") {
        // High inflation hits even harder during bearing conditions
        const inflationErosion = 0.012 * (marketBias === "bear" ? 1.4 : marketBias === "bull" ? 0.7 : 1.0);
        scenarioVal = (netWorth + (monthlySavings * i)) * (1 - (inflationErosion * i)); 
      }
      scenarioValues.push(scenarioVal);
    }

    return {
      labels,
      datasets: [
        {
          label: 'Historical Net Worth',
          data: historicalValues,
          borderColor: '#f0b429', // Premium Gold
          backgroundColor: 'rgba(240, 180, 41, 0.1)',
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 6,
          borderWidth: 3,
        },
        {
          label: 'Baseline Projection',
          data: baselineValues,
          borderColor: '#38bdf8', // Blue/Sky
          borderDash: [5, 5],
          backgroundColor: 'rgba(56, 189, 248, 0.02)',
          fill: false,
          tension: 0.4,
          pointRadius: 3,
          pointHoverRadius: 5,
          borderWidth: 2,
        },
        {
          label: `Scenario: ${currentScenarioDetails.name}`,
          data: scenarioValues,
          borderColor: currentScenarioDetails.color,
          borderDash: [3, 3],
          backgroundColor: currentScenarioDetails.bgColor,
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 6,
          borderWidth: 3,
        }
      ]
    };
  }, [user, budget, selectedScenario, currentScenarioDetails, marketBias]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        labels: {
          color: '#8e8e93',
          font: { size: 10, family: 'Inter', weight: 'bold' as const },
          usePointStyle: true,
          pointStyle: 'circle' as const,
          padding: 15,
        }
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: '#090d16',
        titleColor: '#fcd34d',
        bodyColor: '#ffffff',
        borderColor: '#1e293b',
        borderWidth: 1,
        padding: 12,
        titleFont: { family: 'Inter', size: 11, weight: 'bold' as const },
        bodyFont: { family: 'Inter', size: 11 },
        callbacks: {
          label: (context: any) => {
            let label = context.dataset.label || '';
            if (label) label += ': ';
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat(currency.locale, { style: 'currency', currency: user.currency, maximumFractionDigits: 0 }).format(context.parsed.y);
            }
            return label;
          }
        }
      }
    },
    scales: {
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.04)' },
        ticks: { 
          color: '#94a3b8',
          font: { size: 10, family: 'JetBrains Mono' },
          callback: (value: any) => {
            if (value >= 1000000) return currency.symbol + (value / 1000000).toFixed(1) + 'M';
            if (value >= 1000) return currency.symbol + (value / 1000).toFixed(0) + 'K';
            return currency.symbol + value;
          }
        }
      },
      x: {
        grid: { display: false },
        ticks: { color: '#94a3b8', font: { size: 10, family: 'Inter' } }
      }
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="space-y-6"
    >
      {/* Interactive Scenario Selection Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {scenarios.map((scenario) => {
          const isSelected = selectedScenario === scenario.id;
          return (
            <button
              key={scenario.id}
              onClick={() => setSelectedScenario(scenario.id)}
              className={cn(
                "p-4 rounded-xl border text-left transition-all relative flex flex-col gap-1.5 cursor-pointer hover:border-border-active",
                isSelected 
                  ? `${scenario.activeBg} ${scenario.activeBorder} shadow-sm` 
                  : "bg-bg-secondary/40 border-border/40 hover:bg-bg-secondary/80"
              )}
            >
              <div className="flex items-center gap-2">
                <div className="p-1 rounded bg-bg-void/60 border border-border/30">
                  {scenario.icon}
                </div>
                <span className={cn("text-xs font-bold leading-none", isSelected ? "text-text-primary font-black" : "text-text-secondary")}>
                  {scenario.id === "yield" ? "DeFi Yield" : scenario.id === "market" ? "Trend Bull" : "High Inflation"}
                </span>
                {isSelected && (
                  <span className="absolute top-2 right-2 flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: scenario.color }}></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5" style={{ backgroundColor: scenario.color }}></span>
                  </span>
                )}
              </div>
              <p className="text-[10px] text-text-muted leading-relaxed line-clamp-2">
                {scenario.desc}
              </p>
            </button>
          );
        })}
      </div>

      {/* Bias Influence Indicator Alert */}
      {marketBias !== "neutral" && (
        <motion.div 
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "p-3 rounded-xl flex items-center justify-between text-xs font-bold border",
            marketBias === "bull" 
              ? "bg-accent-emerald/5 border-accent-emerald/20 text-accent-emerald" 
              : "bg-accent-red/5 border-accent-red/20 text-accent-red"
          )}
        >
          <span className="flex items-center gap-2">
            {marketBias === "bull" ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            <span>
              {marketBias === "bull" 
                ? "Active Bias: Bull Run compounds investment scenario projections by an extra +35% dynamic yield!" 
                : "Active Bias: Bear Correction shrinks investment scenario interest returns by -45%!"
              }
            </span>
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded bg-bg-void/40 border border-current opacity-80 font-mono uppercase tracking-widest uppercase">Bias Active</span>
        </motion.div>
      )}

      {/* Main Chart Rendering Container with Bulletproof Responsive Scaling */}
      <div className="h-[310px] w-full bg-bg-secondary/10 p-4 rounded-2xl border border-border/20">
        <ResponsiveChartContainer>
          {() => (
            <Line data={chartData} options={options} />
          )}
        </ResponsiveChartContainer>
      </div>

      {/* Actionable Scenario Comparison Insights Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-bg-secondary/20 border border-border/30 text-xs">
        <div className="flex items-center gap-2 text-text-secondary">
          <Info className="w-4 h-4 text-accent-gold" />
          <span>
            Current Projections: <strong className="text-text-primary uppercase">{selectedScenario} mode</strong> {marketBias !== "neutral" && `under ${marketBias} market pressure`}
          </span>
        </div>
        <div className="text-[10px] text-text-muted uppercase tracking-wider font-mono">
          Interactive Evaluation Simulator Mode
        </div>
      </div>
    </motion.div>
  );
}

