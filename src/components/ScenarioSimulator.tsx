import { useState, useMemo } from "react";
import { motion } from "motion/react";
import { BrainCircuit, TrendingUp, Wallet, Car, Home, Briefcase, Zap, Info, ChevronRight, ArrowRight, Target, PiggyBank, Calendar, DollarSign, Sparkles, AlertCircle, ShieldCheck, ShieldAlert, AlertTriangle, TrendingDown, Activity, Sliders, RefreshCw } from "lucide-react";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { formatCurrency, cn } from "../lib/utils";
import { CURRENCIES } from "../constants";
import { UserProfile, BudgetPlan } from "../types";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

interface ScenarioSimulatorProps {
  user: UserProfile;
  budget: BudgetPlan | null;
  onComplete?: () => void;
}

type Scenario = {
  id: string;
  title: string;
  icon: React.ReactNode;
  description: string;
  impact: {
    assets?: number;
    liabilities?: number;
    monthlyIncome?: number;
    monthlyExpenses?: number;
  };
};

export function ScenarioSimulator({ user, budget, onComplete }: ScenarioSimulatorProps) {
  const currency = CURRENCIES[user.currency] || CURRENCIES.USD;
  const [activeTab, setActiveTab] = useState<"life" | "retirement" | "stresstest" | "history">("retirement");

  // Simulation History State
  const [savedSimulations, setSavedSimulations] = useState<Array<{
    id: string;
    savedAt: string;
    title: string;
    type: "Retirement" | "Stress Test" | "Life Event";
    summaryText: string;
    projectedWealth: number;
    parameters: Record<string, any>;
  }>>(() => {
    try {
      const saved = localStorage.getItem("ww_saved_simulations");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn("Failed reading saved simulations", e);
    }
    return [
      {
        id: "sim-sample-1",
        savedAt: "Yesterday, 4:15 PM",
        title: "FIRE Retirement at Age 55",
        type: "Retirement",
        summaryText: "Monthly contribution $1,200 for 25 years at 8.0% APY.",
        projectedWealth: 1148200,
        parameters: { years: 25, monthlyContribution: 1200, apy: 8 }
      },
      {
        id: "sim-sample-2",
        savedAt: "3 days ago",
        title: "Stagflation Stress Test (-20% Equity, +9% Inflation)",
        type: "Stress Test",
        summaryText: "Immediate wealth loss -$24,000, 20-year capital gap -$180,000.",
        projectedWealth: 620000,
        parameters: { equityShock: -20, inflation: 9, incomeShock: -10 }
      }
    ];
  });

  const saveCurrentSimulation = (
    type: "Retirement" | "Stress Test" | "Life Event",
    title: string,
    summaryText: string,
    projectedWealth: number,
    parameters: Record<string, any>
  ) => {
    const newSim = {
      id: "sim-" + Date.now(),
      savedAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
      title,
      type,
      summaryText,
      projectedWealth,
      parameters
    };
    const updated = [newSim, ...savedSimulations];
    setSavedSimulations(updated);
    localStorage.setItem("ww_saved_simulations", JSON.stringify(updated));

    window.dispatchEvent(
      new CustomEvent("ww-trigger-alert", {
        detail: {
          type: "success",
          title: "Simulation Saved!",
          message: `Saved "${title}" to your Simulation History dashboard.`
        }
      })
    );
  };

  const deleteSavedSimulation = (id: string) => {
    const updated = savedSimulations.filter(s => s.id !== id);
    setSavedSimulations(updated);
    localStorage.setItem("ww_saved_simulations", JSON.stringify(updated));
  };

  // Stress Test Shock State
  const [selectedShockPreset, setSelectedShockPreset] = useState<"stagflation" | "crash" | "rate_spike" | "recession" | "custom">("stagflation");
  const [stressEquityShock, setStressEquityShock] = useState<number>(-20);
  const [stressInflation, setStressInflation] = useState<number>(9);
  const [stressIncomeShock, setStressIncomeShock] = useState<number>(-10);
  const [stressLiabilityShock, setStressLiabilityShock] = useState<number>(15);

  const applyStressPreset = (preset: "stagflation" | "crash" | "rate_spike" | "recession") => {
    setSelectedShockPreset(preset);
    if (preset === "stagflation") {
      setStressEquityShock(-20);
      setStressInflation(9);
      setStressIncomeShock(-10);
      setStressLiabilityShock(15);
    } else if (preset === "crash") {
      setStressEquityShock(-35);
      setStressInflation(3);
      setStressIncomeShock(0);
      setStressLiabilityShock(0);
    } else if (preset === "rate_spike") {
      setStressEquityShock(-12);
      setStressInflation(5);
      setStressIncomeShock(0);
      setStressLiabilityShock(25);
    } else if (preset === "recession") {
      setStressEquityShock(-18);
      setStressInflation(2);
      setStressIncomeShock(-30);
      setStressLiabilityShock(5);
    }
  };

  // Stress Test Calculation Roadmap
  const stressTestRoadmap = useMemo(() => {
    const horizonYears = 20;
    const labels = [];
    const baselineSeries = [];
    const stressedSeries = [];

    const baseAssets = user.netWorth?.assets || 100000;
    const baseLiabilities = user.netWorth?.liabilities || 20000;
    const baseMonthlySurplus = budget ? Math.max(0, budget.income - Object.values(budget.expenses).reduce((a, b) => a + b, 0)) : 1000;

    // Immediate initial shock
    const shockedAssets = baseAssets * (1 + stressEquityShock / 100);
    const shockedLiabilities = baseLiabilities * (1 + stressLiabilityShock / 100);
    const shockedMonthlySurplus = Math.max(0, baseMonthlySurplus * (1 + stressIncomeShock / 100));

    let currentBaseline = baseAssets - baseLiabilities;
    let currentStressed = shockedAssets - shockedLiabilities;

    for (let yr = 0; yr <= horizonYears; yr++) {
      labels.push(`Yr ${yr}`);
      baselineSeries.push(Math.round(currentBaseline));
      stressedSeries.push(Math.round(currentStressed));

      // Unstressed growth (7% return, 3% inflation)
      currentBaseline = (currentBaseline + baseMonthlySurplus * 12) * 1.07;

      // Stressed growth (Reduced return under inflation shock)
      const netReturn = Math.max(-0.05, 0.07 - (stressInflation - 3) * 0.015);
      currentStressed = (currentStressed + shockedMonthlySurplus * 12) * (1 + netReturn);
    }

    const initialLoss = Math.round((baseAssets - baseLiabilities) - (shockedAssets - shockedLiabilities));
    const final20YrBaseline = baselineSeries[baselineSeries.length - 1] || 0;
    const final20YrStressed = stressedSeries[stressedSeries.length - 1] || 0;
    const finalGap = final20YrBaseline - final20YrStressed;

    return {
      labels,
      baselineSeries,
      stressedSeries,
      initialLoss,
      final20YrBaseline,
      final20YrStressed,
      finalGap,
      shockedMonthlySurplus
    };
  }, [user.netWorth, budget, stressEquityShock, stressInflation, stressIncomeShock, stressLiabilityShock]);

  const stressChartData = {
    labels: stressTestRoadmap.labels,
    datasets: [
      {
        label: 'Unstressed Baseline Roadmap',
        data: stressTestRoadmap.baselineSeries,
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: false,
        tension: 0.3,
      },
      {
        label: 'Stressed Roadmap Under Shock',
        data: stressTestRoadmap.stressedSeries,
        borderColor: '#EF4444',
        borderDash: [4, 4],
        backgroundColor: 'rgba(239, 68, 68, 0.15)',
        fill: true,
        tension: 0.3,
      }
    ]
  };

  // Life Scenarios State
  const [selectedScenarios, setSelectedScenarios] = useState<string[]>([]);
  const [years, setYears] = useState(10);
  const [growthRate, setGrowthRate] = useState(7);

  // Retirement Simulator State (Age is explicitly OPTIONAL)
  const [userAgeInput, setUserAgeInput] = useState<string>(() => user.age ? String(user.age) : "");
  const [targetRetirementAge, setTargetRetirementAge] = useState<number>(60);
  const [annualContribution, setAnnualContribution] = useState<number>(() => {
    const surplus = budget ? Math.max(0, budget.income - Object.values(budget.expenses).reduce((a, b) => a + b, 0)) * 12 : 12000;
    return surplus > 0 ? Math.round(surplus) : 12000;
  });
  const [targetRetirementGoal, setTargetRetirementGoal] = useState<number>(1000000);
  const [retirementReturnRate, setRetirementReturnRate] = useState<number>(8);
  const [inflationRate, setInflationRate] = useState<number>(3);

  // Age calculation helper (Age is optional)
  const numericCurrentAge = useMemo(() => {
    const parsed = parseInt(userAgeInput, 10);
    return !isNaN(parsed) && parsed > 0 ? parsed : null;
  }, [userAgeInput]);

  const investmentYears = useMemo(() => {
    if (numericCurrentAge !== null) {
      return Math.max(1, targetRetirementAge - numericCurrentAge);
    }
    return 30; // Default horizon when age is not provided
  }, [numericCurrentAge, targetRetirementAge]);

  // Retirement accumulation calculations
  const retirementAccumulationData = useMemo(() => {
    const labels = [];
    const nominalValues = [];
    const realValues = [];
    const totalContributed = [];

    let currentWealth = user.netWorth.assets - user.netWorth.liabilities;
    let accumulatedContributions = currentWealth;

    const startAge = numericCurrentAge !== null ? numericCurrentAge : 30;

    for (let yr = 0; yr <= investmentYears; yr++) {
      const displayLabel = numericCurrentAge !== null ? `Age ${startAge + yr}` : `Year ${yr}`;
      labels.push(displayLabel);

      nominalValues.push(Math.round(currentWealth));
      totalContributed.push(Math.round(accumulatedContributions));

      // Inflation adjustment factor
      const realDiscount = Math.pow(1 + inflationRate / 100, yr);
      realValues.push(Math.round(currentWealth / realDiscount));

      // Apply annual compounding
      currentWealth = (currentWealth + annualContribution) * (1 + retirementReturnRate / 100);
      accumulatedContributions += annualContribution;
    }

    const finalNominalWealth = nominalValues[nominalValues.length - 1] || 0;
    const finalRealWealth = realValues[realValues.length - 1] || 0;
    const totalDeposited = totalContributed[totalContributed.length - 1] || 0;
    const compoundInterestEarned = Math.max(0, finalNominalWealth - totalDeposited);
    const monthlySafeWithdrawal = Math.round((finalNominalWealth * 0.04) / 12);
    const goalAchievementPct = Math.min(100, Math.round((finalNominalWealth / targetRetirementGoal) * 100));

    return {
      labels,
      nominalValues,
      realValues,
      totalContributed,
      finalNominalWealth,
      finalRealWealth,
      totalDeposited,
      compoundInterestEarned,
      monthlySafeWithdrawal,
      goalAchievementPct
    };
  }, [numericCurrentAge, investmentYears, user.netWorth, annualContribution, retirementReturnRate, inflationRate, targetRetirementGoal]);

  const retirementChartData = {
    labels: retirementAccumulationData.labels,
    datasets: [
      {
        label: 'Total Accumulated Wealth',
        data: retirementAccumulationData.nominalValues,
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.15)',
        fill: true,
        tension: 0.3,
      },
      {
        label: 'Inflation-Adjusted Real Value',
        data: retirementAccumulationData.realValues,
        borderColor: '#06B6D4',
        borderDash: [4, 4],
        backgroundColor: 'transparent',
        tension: 0.3,
      },
      {
        label: 'Total Out-of-Pocket Contributions',
        data: retirementAccumulationData.totalContributed,
        borderColor: '#94A3B8',
        borderDash: [2, 2],
        backgroundColor: 'transparent',
        tension: 0,
      }
    ]
  };

  const scenarios: Scenario[] = useMemo(() => {
    const baseScenarios: Scenario[] = [
      {
        id: "raise",
        title: "15% Salary Increment",
        icon: <Briefcase />,
        description: "Secure a strategic promotion and salary adjustment.",
        impact: { monthlyIncome: (budget?.income || 5000) * 0.15 }
      },
      {
        id: "frugal",
        title: "Optimized Expenditure",
        icon: <Zap />,
        description: "Reduce non-essential expenditures by 40%.",
        impact: { monthlyExpenses: -(budget?.income || 5000) * 0.2 }
      }
    ];

    const goalScenarios: Scenario[] = (user.goals || []).map(goal => ({
      id: `goal-${goal.id}`,
      title: `Achieve: ${goal.title}`,
      icon: goal.category === "HOUSE" ? <Home /> : goal.category === "CAR" ? <Car /> : <Target />,
      description: `Commit to reaching your ${formatCurrency(goal.targetAmount, user.currency, currency.locale)} target.`,
      impact: { 
        liabilities: goal.category === "HOUSE" || goal.category === "CAR" ? goal.targetAmount * 0.8 : 0,
        assets: goal.targetAmount,
        monthlyExpenses: goal.category === "HOUSE" ? 500 : goal.category === "CAR" ? 300 : 0
      }
    }));

    return [...baseScenarios, ...goalScenarios];
  }, [user.goals, budget?.income, user.currency, currency.locale]);

  const toggleScenario = (id: string) => {
    setSelectedScenarios(prev => {
      const isSelecting = !prev.includes(id);
      if (isSelecting && onComplete) onComplete();
      return isSelecting ? [...prev, id] : prev.filter(s => s !== id);
    });
  };

  const projectionData = useMemo(() => {
    const labels = Array.from({ length: years + 1 }, (_, i) => i);
    const baseline = [];
    const scenario = [];

    let currentBaseline = user.netWorth.assets - user.netWorth.liabilities;
    let currentScenario = currentBaseline;

    const monthlySurplus = budget ? budget.income - Object.values(budget.expenses).reduce((a, b) => a + b, 0) : 1000;
    
    let scenarioMonthlyImpact = 0;
    let scenarioInitialImpact = 0;
    
    selectedScenarios.forEach(sid => {
      const s = scenarios.find(sc => sc.id === sid);
      if (s) {
        scenarioMonthlyImpact += (s.impact.monthlyIncome || 0) - (s.impact.monthlyExpenses || 0);
        scenarioInitialImpact += (s.impact.assets || 0) - (s.impact.liabilities || 0);
      }
    });

    currentScenario += scenarioInitialImpact;

    for (let i = 0; i <= years; i++) {
      baseline.push(currentBaseline);
      scenario.push(currentScenario);

      currentBaseline = (currentBaseline + (monthlySurplus * 12)) * (1 + growthRate / 100);
      currentScenario = (currentScenario + ((monthlySurplus + scenarioMonthlyImpact) * 12)) * (1 + growthRate / 100);
    }

    return {
      labels,
      datasets: [
        {
          label: 'Baseline Projection',
          data: baseline,
          borderColor: '#94A3B8',
          borderDash: [5, 5],
          backgroundColor: 'transparent',
          tension: 0.4,
        },
        {
          label: 'Scenario Projection',
          data: scenario,
          borderColor: '#D4AF37',
          backgroundColor: 'rgba(212, 175, 55, 0.1)',
          fill: true,
          tension: 0.4,
        }
      ],
    };
  }, [user, budget, selectedScenarios, years, growthRate]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' as const, labels: { color: '#94A3B8', font: { family: 'Outfit' } } },
      tooltip: {
        backgroundColor: '#050812',
        titleFont: { family: 'Syne', size: 14 },
        bodyFont: { family: 'Outfit', size: 12 },
        borderColor: 'rgba(212, 175, 55, 0.2)',
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label: (context: any) => {
            return `${context.dataset.label}: ${formatCurrency(context.raw, user.currency, currency.locale)}`;
          }
        }
      }
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#475569' } },
      y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#475569', callback: (value: any) => formatCurrency(value, user.currency, currency.locale).split('.')[0] } }
    }
  };

  return (
    <div className="container mx-auto px-6 py-12 space-y-10">
      {/* Module Title & Mode Switcher */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-border/60 pb-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-gold/10 border border-accent-gold/30 text-accent-gold text-xs font-mono font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> Financial Freedom Engine
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold">Strategic Projection & Retirement Simulator</h1>
          <p className="text-text-secondary text-sm">Calculate long-term compounding, simulate retirement wealth goals, and test life decisions.</p>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex flex-wrap items-center gap-2 p-1.5 bg-bg-secondary rounded-2xl border border-border/80">
          <button
            type="button"
            onClick={() => setActiveTab("retirement")}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer",
              activeTab === "retirement" 
                ? "bg-accent-emerald text-bg-void shadow-lg shadow-accent-emerald/20" 
                : "text-text-muted hover:text-text-primary"
            )}
          >
            <PiggyBank className="w-4 h-4" />
            <span>Retirement Goal Planner</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("stresstest")}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer",
              activeTab === "stresstest" 
                ? "bg-accent-red text-white shadow-lg shadow-accent-red/20" 
                : "text-text-muted hover:text-text-primary"
            )}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Economic Shock Stress Test</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("life")}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer",
              activeTab === "life" 
                ? "bg-accent-gold text-bg-void shadow-lg shadow-accent-gold/20" 
                : "text-text-muted hover:text-text-primary"
            )}
          >
            <BrainCircuit className="w-4 h-4" />
            <span>Life Event Scenarios</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("history")}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer",
              activeTab === "history" 
                ? "bg-accent-cyan text-bg-void shadow-lg shadow-accent-cyan/20" 
                : "text-text-muted hover:text-text-primary"
            )}
          >
            <Calendar className="w-4 h-4" />
            <span>Simulation History ({savedSimulations.length})</span>
          </button>
        </div>
      </div>

      {/* TAB: STRESS TEST MODE */}
      {activeTab === "stresstest" && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-8"
        >
          {/* Explanation Banner */}
          <div className="card p-6 bg-gradient-to-r from-red-500/10 via-amber-500/5 to-transparent border-accent-red/30 relative overflow-hidden">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-accent-red/20 flex items-center justify-center shrink-0 text-accent-red">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-accent-red flex items-center gap-2">
                  <span>Economic Shock & Macro Volatility Stress Test</span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-accent-red/20 text-accent-red border border-accent-red/30 uppercase">Actuarial Engine</span>
                </h3>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Simulate severe macro shocks (high inflation spikes, market crashes, interest rate spikes) to analyze immediate wealth erosion, gap on long-term compound trajectory, and required hedging strategies.
                </p>
              </div>
            </div>
          </div>

          {/* Preset Buttons */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-text-muted">Select Macro Shock Scenario</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { id: "stagflation", name: "Stagflation Shock", icon: "🔴", desc: "10% Inflation, Equity -20%, Income -10%" },
                { id: "crash", name: "Severe Market Crash", icon: "📉", desc: "Equity -35%, Real Estate -15%" },
                { id: "rate_spike", name: "Rate Hike Spike", icon: "⚡", desc: "Fed Rates +600 bps, Liabilities +25%" },
                { id: "recession", name: "Global Recession", icon: "🛑", desc: "Income -30%, Emergency Reserves Depleted" }
              ].map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => applyStressPreset(preset.id as any)}
                  className={cn(
                    "p-4 rounded-2xl border text-left space-y-1.5 transition-all cursor-pointer font-mono",
                    selectedShockPreset === preset.id
                      ? "bg-accent-red/15 border-accent-red text-white shadow-lg"
                      : "bg-bg-secondary/60 border-border/60 hover:bg-bg-secondary text-text-secondary"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{preset.icon}</span>
                    <span className="text-xs font-bold text-text-primary">{preset.name}</span>
                  </div>
                  <p className="text-[10px] text-text-muted leading-tight">{preset.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Custom Sliders */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-bg-void/50 rounded-2xl border border-border/80">
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-mono">
                <label className="text-text-muted font-bold uppercase">Equity Asset Shock</label>
                <span className={cn("font-bold text-sm", stressEquityShock < 0 ? "text-accent-red" : "text-accent-emerald")}>
                  {stressEquityShock}%
                </span>
              </div>
              <input
                type="range"
                min="-50"
                max="20"
                step="1"
                value={stressEquityShock}
                onChange={(e) => {
                  setSelectedShockPreset("custom");
                  setStressEquityShock(Number(e.target.value));
                }}
                className="w-full accent-accent-red cursor-pointer"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-mono">
                <label className="text-text-muted font-bold uppercase">Annual Inflation Rate</label>
                <span className="font-bold text-sm text-amber-400">{stressInflation}%</span>
              </div>
              <input
                type="range"
                min="2"
                max="15"
                step="0.5"
                value={stressInflation}
                onChange={(e) => {
                  setSelectedShockPreset("custom");
                  setStressInflation(Number(e.target.value));
                }}
                className="w-full accent-amber-400 cursor-pointer"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-mono">
                <label className="text-text-muted font-bold uppercase">Income Reduction Impact</label>
                <span className={cn("font-bold text-sm", stressIncomeShock < 0 ? "text-accent-red" : "text-text-muted")}>
                  {stressIncomeShock}%
                </span>
              </div>
              <input
                type="range"
                min="-40"
                max="10"
                step="5"
                value={stressIncomeShock}
                onChange={(e) => {
                  setSelectedShockPreset("custom");
                  setStressIncomeShock(Number(e.target.value));
                }}
                className="w-full accent-accent-red cursor-pointer"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-mono">
                <label className="text-text-muted font-bold uppercase">Liability Servicing Cost Increase</label>
                <span className="font-bold text-sm text-accent-red">+{stressLiabilityShock}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="35"
                step="1"
                value={stressLiabilityShock}
                onChange={(e) => {
                  setSelectedShockPreset("custom");
                  setStressLiabilityShock(Number(e.target.value));
                }}
                className="w-full accent-accent-red cursor-pointer"
              />
            </div>
          </div>

          {/* Stress Test Roadmap Chart & Impact Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 card p-6 h-[420px] relative">
              <div className="flex items-center justify-between pb-4 border-b border-border/40">
                <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-text-muted flex items-center gap-2">
                  <Activity className="w-4 h-4 text-accent-red" /> 20-Year Baseline vs Stressed Capital Roadmap
                </h3>
              </div>
              <div className="pt-4 h-[330px]">
                <Line data={stressChartData} options={chartOptions} />
              </div>
            </div>

            <div className="space-y-6">
              <div className="card p-6 space-y-4 border-accent-red/30 bg-bg-secondary/40">
                <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-accent-red flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" /> Immediate Shock Impact
                </h4>
                <div className="space-y-3">
                  <div className="p-3 bg-bg-void/60 rounded-xl border border-border/60">
                    <div className="text-[10px] text-text-muted uppercase font-mono">Immediate Wealth Loss</div>
                    <div className="text-xl font-mono font-bold text-accent-red">
                      -{formatCurrency(stressTestRoadmap.initialLoss, user.currency, currency.locale)}
                    </div>
                  </div>

                  <div className="p-3 bg-bg-void/60 rounded-xl border border-border/60">
                    <div className="text-[10px] text-text-muted uppercase font-mono">20-Year Cumulative Capital Gap</div>
                    <div className="text-xl font-mono font-bold text-amber-400">
                      -{formatCurrency(stressTestRoadmap.finalGap, user.currency, currency.locale)}
                    </div>
                  </div>

                  <div className="p-3 bg-bg-void/60 rounded-xl border border-border/60">
                    <div className="text-[10px] text-text-muted uppercase font-mono">Stressed Monthly Surplus</div>
                    <div className="text-xl font-mono font-bold text-accent-blue">
                      {formatCurrency(stressTestRoadmap.shockedMonthlySurplus, user.currency, currency.locale)}/mo
                    </div>
                  </div>
                </div>
              </div>

              <div className="card p-6 space-y-3 border-accent-gold/30 bg-accent-gold/5">
                <div className="flex items-center gap-2 text-accent-gold font-mono font-bold text-xs uppercase">
                  <ShieldCheck className="w-4 h-4" /> Strategic Hedging Plan
                </div>
                <p className="text-xs text-text-secondary leading-relaxed">
                  To hedge against a <strong>{stressInflation}% inflation shock</strong> and <strong>{stressEquityShock}% asset drop</strong>, shift 15% into short-duration Treasury inflation-protected securities (TIPS) and maintain a 6-month high-yield cash buffer.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* TAB 1: RETIREMENT SIMULATOR */}
      {activeTab === "retirement" && (
        <div className="space-y-8">
          {/* Simple Explanation banner */}
          <div className="card p-6 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent border-accent-emerald/30 relative overflow-hidden">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-accent-emerald/20 flex items-center justify-center shrink-0 text-accent-emerald">
                <PiggyBank className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-accent-emerald">How Retirement Wealth Compounding Works</h3>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Enter your savings targets below. Age is completely <strong>optional</strong> — if you leave age empty, we build a customized {investmentYears}-year growth timeline for you!
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Input Controls Card */}
            <div className="card p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <h3 className="text-sm font-bold font-mono uppercase tracking-wider text-accent-gold flex items-center gap-2">
                  <Target className="w-4 h-4" /> Retirement Parameters
                </h3>
                <span className="text-[10px] font-mono text-text-muted bg-bg-secondary px-2 py-0.5 rounded border border-border">
                  Age Optional
                </span>
              </div>

              {/* Age Inputs (Age explicitly optional) */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-bold text-text-muted uppercase flex items-center justify-between">
                    <span>Current Age</span>
                    <span className="text-[9px] text-accent-gold lowercase font-normal">(optional)</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={userAgeInput}
                    onChange={(e) => setUserAgeInput(e.target.value)}
                    placeholder="e.g. 30"
                    className="input-field w-full text-xs py-2 px-3 font-mono font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-bold text-text-muted uppercase">
                    Target Retirement
                  </label>
                  <input
                    type="number"
                    min="20"
                    max="100"
                    value={targetRetirementAge}
                    onChange={(e) => setTargetRetirementAge(Number(e.target.value))}
                    className="input-field w-full text-xs py-2 px-3 font-mono font-bold"
                  />
                </div>
              </div>

              {/* Annual Contribution */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold text-text-muted uppercase flex items-center justify-between">
                  <span>Annual Contribution ({currency.symbol})</span>
                  <span className="text-accent-emerald font-bold">{formatCurrency(annualContribution, user.currency, currency.locale)}/yr</span>
                </label>
                <input
                  type="number"
                  step="100"
                  min="0"
                  value={annualContribution}
                  onChange={(e) => setAnnualContribution(Number(e.target.value))}
                  className="input-field w-full text-xs py-2 px-3 font-mono font-bold"
                />
              </div>

              {/* Target Retirement Nest Egg Goal */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold text-text-muted uppercase flex items-center justify-between">
                  <span>Target Retirement Goal ({currency.symbol})</span>
                  <span className="text-accent-gold font-bold">{formatCurrency(targetRetirementGoal, user.currency, currency.locale)}</span>
                </label>
                <input
                  type="number"
                  step="10000"
                  min="10000"
                  value={targetRetirementGoal}
                  onChange={(e) => setTargetRetirementGoal(Number(e.target.value))}
                  className="input-field w-full text-xs py-2 px-3 font-mono font-bold"
                />
              </div>

              {/* Return Rate Slider */}
              <div className="space-y-2 pt-2 border-t border-border/40">
                <div className="flex justify-between text-xs font-mono font-bold">
                  <span className="text-text-muted uppercase">Expected Return Rate</span>
                  <span className="text-accent-emerald">{retirementReturnRate}% / year</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="15"
                  step="0.5"
                  value={retirementReturnRate}
                  onChange={(e) => setRetirementReturnRate(Number(e.target.value))}
                  className="w-full accent-accent-emerald cursor-pointer"
                />
              </div>

              {/* Inflation Rate Slider */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono font-bold">
                  <span className="text-text-muted uppercase">Inflation Rate</span>
                  <span className="text-accent-cyan">{inflationRate}% / year</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="0.5"
                  value={inflationRate}
                  onChange={(e) => setInflationRate(Number(e.target.value))}
                  className="w-full accent-accent-cyan cursor-pointer"
                />
              </div>
            </div>

            {/* Results & Chart Area */}
            <div className="lg:col-span-2 space-y-6">
              {/* Summary Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="card p-5 space-y-2 border-accent-emerald/30 bg-accent-emerald/5">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted">Accumulated Nest Egg</span>
                  <div className="text-2xl font-mono font-bold text-accent-emerald">
                    {formatCurrency(retirementAccumulationData.finalNominalWealth, user.currency, currency.locale)}
                  </div>
                  <span className="text-[10px] text-text-muted block">In {investmentYears} Years Timeline</span>
                </div>

                <div className="card p-5 space-y-2 border-accent-cyan/30 bg-accent-cyan/5">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted">Monthly Drawdown (4% Rule)</span>
                  <div className="text-2xl font-mono font-bold text-accent-cyan">
                    {formatCurrency(retirementAccumulationData.monthlySafeWithdrawal, user.currency, currency.locale)}/mo
                  </div>
                  <span className="text-[10px] text-text-muted block">Lifetime Safe Income</span>
                </div>

                <div className="card p-5 space-y-2 border-accent-gold/30 bg-accent-gold/5">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted">Goal Progress</span>
                  <div className="text-2xl font-mono font-bold text-accent-gold">
                    {retirementAccumulationData.goalAchievementPct}%
                  </div>
                  <div className="h-2 w-full bg-bg-primary rounded-full overflow-hidden border border-border/60">
                    <div 
                      className="h-full bg-accent-gold rounded-full" 
                      style={{ width: `${retirementAccumulationData.goalAchievementPct}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Chart */}
              <div className="card p-6 h-[380px] relative">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-text-muted flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-accent-emerald" /> {investmentYears}-Year Wealth Accumulation Curve
                  </h3>
                  <span className="text-[10px] font-mono text-accent-emerald bg-accent-emerald/10 border border-accent-emerald/20 px-2 py-0.5 rounded-full font-bold">
                    Compound Interest: +{formatCurrency(retirementAccumulationData.compoundInterestEarned, user.currency, currency.locale)}
                  </span>
                </div>
                <div className="h-[300px] w-full">
                  <Line data={retirementChartData} options={chartOptions} />
                </div>
              </div>

              {/* 5-Year Old Friendly Summary Box with Save Simulation button */}
              <div className="card p-6 bg-bg-secondary/60 border-border/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-accent-gold">
                    <Sparkles className="w-4 h-4" />
                    <span className="text-xs font-mono font-bold uppercase tracking-wider">Super Simple Summary</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => saveCurrentSimulation(
                      "Retirement",
                      `Retirement Goal: ${investmentYears} Yr Plan`,
                      `Save ${formatCurrency(annualContribution, user.currency, currency.locale)}/yr for ${investmentYears} yrs.`,
                      retirementAccumulationData.finalNominalWealth,
                      { investmentYears, annualContribution, expectedReturn: retirementReturnRate }
                    )}
                    className="px-3.5 py-1.5 bg-accent-gold hover:bg-accent-gold/90 text-bg-void text-xs font-mono font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <PiggyBank className="w-3.5 h-3.5" /> Save Simulation
                  </button>
                </div>
                <p className="text-sm text-text-primary leading-relaxed">
                  If you save <strong className="text-accent-emerald">{formatCurrency(annualContribution, user.currency, currency.locale)}</strong> every year for <strong className="text-accent-gold">{investmentYears} years</strong>, your money will grow to <strong className="text-accent-emerald">{formatCurrency(retirementAccumulationData.finalNominalWealth, user.currency, currency.locale)}</strong>! 
                  That will give you <strong className="text-accent-cyan">{formatCurrency(retirementAccumulationData.monthlySafeWithdrawal, user.currency, currency.locale)} every single month</strong> in retirement without ever running out of money! 🎉
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LIFE EVENT SCENARIOS */}
      {activeTab === "life" && (
        <div className="space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-start gap-6">
            <div className="space-y-1">
              <h2 className="text-2xl font-display font-bold">Life Event Scenarios</h2>
              <p className="text-text-secondary text-xs">Analyze how promotions, frugal choices, and big purchases change your wealth trajectory.</p>
            </div>
            
            <div className="flex items-center gap-4 bg-bg-secondary p-2 rounded-2xl border border-border">
              <div className="px-4 py-2">
                <div className="text-[10px] text-text-muted uppercase tracking-widest">Growth Rate</div>
                <div className="flex items-center gap-2">
                  <input 
                    type="range" min="1" max="15" value={growthRate} 
                    onChange={(e) => setGrowthRate(Number(e.target.value))}
                    className="w-24 accent-accent-gold"
                  />
                  <span className="font-mono font-bold text-accent-gold">{growthRate}%</span>
                </div>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="px-4 py-2">
                <div className="text-[10px] text-text-muted uppercase tracking-widest">Horizon</div>
                <select 
                  value={years} 
                  onChange={(e) => setYears(Number(e.target.value))}
                  className="bg-transparent font-mono font-bold text-text-primary outline-none cursor-pointer"
                >
                  {[5, 10, 20, 30, 40].map(y => <option key={y} value={y}>{y} Years</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Scenario Selection */}
            <div className="space-y-6">
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-text-muted">Select Event Scenarios</h3>
              <div className="grid grid-cols-1 gap-4">
                {scenarios.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => toggleScenario(s.id)}
                    className={cn(
                      "card p-5 text-left transition-all duration-300 group relative overflow-hidden cursor-pointer",
                      selectedScenarios.includes(s.id) 
                        ? "border-accent-gold bg-accent-gold/5 ring-1 ring-accent-gold/20" 
                        : "hover:border-border-active"
                    )}
                  >
                    <div className="flex items-start gap-4">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center transition-colors shrink-0",
                        selectedScenarios.includes(s.id) ? "bg-accent-gold text-bg-void" : "bg-bg-secondary text-text-secondary group-hover:text-accent-gold"
                      )}>
                        {s.icon}
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-bold text-sm">{s.title}</h4>
                        <p className="text-xs text-text-muted leading-relaxed">{s.description}</p>
                      </div>
                    </div>
                    {selectedScenarios.includes(s.id) && (
                      <motion.div 
                        layoutId="active-indicator"
                        className="absolute top-2 right-2 w-2 h-2 rounded-full bg-accent-gold"
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Chart and Analysis */}
            <div className="lg:col-span-2 space-y-6">
              <div className="card p-6 h-[400px] relative">
                <div className="absolute top-4 left-6 z-10">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-text-muted">Fiscal Projection Line Chart</h3>
                </div>
                <div className="pt-6 h-full">
                  <Line data={projectionData} options={chartOptions} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="card p-6 space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-text-muted">Projected Net Worth (Year {years})</h4>
                  <div className="space-y-2">
                    <div className="flex items-end justify-between">
                      <span className="text-xs text-text-secondary">Baseline</span>
                      <span className="text-lg font-mono font-bold text-text-muted">
                        {formatCurrency(projectionData.datasets[0].data[years], user.currency, currency.locale)}
                      </span>
                    </div>
                    <div className="flex items-end justify-between">
                      <span className="text-xs text-text-secondary">With Scenarios</span>
                      <span className="text-2xl font-mono font-bold text-accent-gold">
                        {formatCurrency(projectionData.datasets[1].data[years], user.currency, currency.locale)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="card p-6 flex flex-col justify-between space-y-3">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-accent-gold/20 flex items-center justify-center">
                        <BrainCircuit className="w-4 h-4 text-accent-gold" />
                      </div>
                      <h4 className="font-bold text-sm">Strategic Insight</h4>
                    </div>
                    <p className="text-xs text-text-secondary leading-relaxed italic">
                      {selectedScenarios.length === 0 
                        ? "Select a scenario to see how your life choices ripple through time."
                        : selectedScenarios.includes('car') && selectedScenarios.includes('raise')
                        ? "Your raise covers the car, but investing that raise instead would have yielded a much higher net worth. Is the luxury worth the opportunity cost?"
                        : selectedScenarios.includes('frugal')
                        ? "Extreme frugality is a powerful lever. You're accelerating your financial independence by years."
                        : "Every decision today is a trade-off with your future self. Choose wisely."}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => saveCurrentSimulation(
                      "Life Event",
                      `Life Event Scenario (${years} Yrs)`,
                      `Selected ${selectedScenarios.length} events: ${selectedScenarios.join(", ")}`,
                      projectionData.datasets[1].data[years] || 0,
                      { years, growthRate, selectedScenarios }
                    )}
                    className="w-full py-2 bg-accent-gold text-bg-void text-xs font-mono font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <BrainCircuit className="w-3.5 h-3.5" /> Save Life Event Simulation
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SIMULATION HISTORY */}
      {activeTab === "history" && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-border/60">
            <div>
              <h2 className="text-2xl font-display font-bold">Saved Simulation History</h2>
              <p className="text-text-secondary text-xs">Review past financial projections, stress tests, and retirement models.</p>
            </div>
            <div className="px-3 py-1 rounded-xl bg-accent-cyan/10 border border-accent-cyan/30 text-accent-cyan font-mono text-xs font-bold">
              {savedSimulations.length} Saved Record{savedSimulations.length !== 1 ? "s" : ""}
            </div>
          </div>

          {savedSimulations.length === 0 ? (
            <div className="card p-12 text-center space-y-4 border-dashed border-border">
              <Calendar className="w-10 h-10 text-text-muted mx-auto" />
              <div className="space-y-1">
                <h3 className="font-bold text-base">No Saved Simulations Yet</h3>
                <p className="text-xs text-text-muted">Run a Retirement, Stress Test, or Life Event simulation and click "Save Simulation" to record it here.</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedSimulations.map((sim) => (
                <div key={sim.id} className="card p-6 space-y-4 border-accent-gold/30 bg-bg-secondary/60 hover:border-accent-gold/60 transition-all shadow-md relative group">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <span className={cn(
                        "px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border",
                        sim.type === "Retirement" && "bg-emerald-500/15 border-emerald-500/30 text-emerald-300",
                        sim.type === "Stress Test" && "bg-rose-500/15 border-rose-500/30 text-rose-300",
                        sim.type === "Life Event" && "bg-amber-500/15 border-amber-500/30 text-amber-300"
                      )}>
                        {sim.type}
                      </span>
                      <h4 className="font-bold text-sm text-text-primary pt-1">{sim.title}</h4>
                      <div className="text-[10px] text-text-muted font-mono">{sim.savedAt}</div>
                    </div>

                    <button
                      type="button"
                      onClick={() => deleteSavedSimulation(sim.id)}
                      className="text-text-muted hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/10 transition-colors cursor-pointer"
                      title="Delete Saved Simulation"
                    >
                      <AlertCircle className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-xs text-text-secondary leading-relaxed bg-bg-void/60 p-3 rounded-xl border border-border/60 font-mono">
                    {sim.summaryText}
                  </p>

                  <div className="pt-2 border-t border-border/40 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-text-muted uppercase">Projected Net Wealth</span>
                    <span className="text-lg font-mono font-bold text-accent-gold">
                      {formatCurrency(sim.projectedWealth, user.currency, currency.locale)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

