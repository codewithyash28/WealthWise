import { useState, useMemo } from "react";
import { motion } from "motion/react";
import { BrainCircuit, TrendingUp, Wallet, Car, Home, Briefcase, Zap, Info, ChevronRight, ArrowRight, Target } from "lucide-react";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { formatCurrency, cn } from "../lib/utils";
import { CURRENCIES } from "../constants";
import { UserProfile, BudgetPlan } from "../types";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

interface ScenarioSimulatorProps {
  user: UserProfile;
  budget: BudgetPlan | null;
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

export function ScenarioSimulator({ user, budget }: ScenarioSimulatorProps) {
  const currency = CURRENCIES[user.currency] || CURRENCIES.USD;
  const [selectedScenarios, setSelectedScenarios] = useState<string[]>([]);
  const [years, setYears] = useState(10);
  const [growthRate, setGrowthRate] = useState(7);

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

    // Add scenarios based on user goals
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
    setSelectedScenarios(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const projectionData = useMemo(() => {
    const labels = Array.from({ length: years + 1 }, (_, i) => i);
    const baseline = [];
    const scenario = [];

    let currentBaseline = user.netWorth.assets - user.netWorth.liabilities;
    let currentScenario = currentBaseline;

    const monthlySurplus = budget ? budget.income - Object.values(budget.expenses).reduce((a, b) => a + b, 0) : 1000;
    
    // Calculate scenario impacts
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

      // Baseline growth
      currentBaseline = (currentBaseline + (monthlySurplus * 12)) * (1 + growthRate / 100);
      // Scenario growth
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
    <div className="container mx-auto px-6 py-12 space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-display font-bold">Strategic Projection Simulator</h1>
          <p className="text-text-secondary">Analyze the long-term fiscal impact of significant life events and strategic decisions.</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Scenario Selection */}
        <div className="space-y-6">
          <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-text-muted">Scenario Selection</h3>
          <div className="grid grid-cols-1 gap-4">
            {scenarios.map((s) => (
              <button
                key={s.id}
                onClick={() => toggleScenario(s.id)}
                className={cn(
                  "card p-6 text-left transition-all duration-300 group relative overflow-hidden",
                  selectedScenarios.includes(s.id) 
                    ? "border-accent-gold bg-accent-gold/5 ring-1 ring-accent-gold/20" 
                    : "hover:border-border-active"
                )}
              >
                <div className="flex items-start gap-4">
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
                    selectedScenarios.includes(s.id) ? "bg-accent-gold text-bg-void" : "bg-bg-secondary text-text-secondary group-hover:text-accent-gold"
                  )}>
                    {s.icon}
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold">{s.title}</h4>
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

          <div className="card p-6 bg-accent-blue/5 border-accent-blue/20 space-y-4">
            <div className="flex items-center gap-2 text-accent-blue">
              <Info className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Pro Tip</span>
            </div>
            <p className="text-sm text-text-secondary leading-relaxed">
              Compounding works best over long horizons. Notice how small monthly changes (like a raise or frugality) create massive gaps after 20+ years.
            </p>
          </div>
        </div>

        {/* Chart and Analysis */}
        <div className="lg:col-span-2 space-y-8">
          <div className="card p-8 h-[500px] relative">
            <div className="absolute top-6 left-8 z-10">
              <h3 className="text-sm font-bold uppercase tracking-widest text-text-muted">Fiscal Projection</h3>
            </div>
            <Line data={projectionData} options={chartOptions} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card p-8 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-text-muted">Projected Net Worth (Year {years})</h4>
              <div className="space-y-2">
                <div className="flex items-end justify-between">
                  <span className="text-sm text-text-secondary">Baseline Projection</span>
                  <span className="text-xl font-mono font-bold text-text-muted">
                    {formatCurrency(projectionData.datasets[0].data[years], user.currency, currency.locale)}
                  </span>
                </div>
                <div className="flex items-end justify-between">
                  <span className="text-sm text-text-secondary">Scenario Projection</span>
                  <span className="text-3xl font-mono font-bold text-accent-gold">
                    {formatCurrency(projectionData.datasets[1].data[years], user.currency, currency.locale)}
                  </span>
                </div>
              </div>
              <div className="pt-4 border-t border-border flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-accent-emerald">Projected Variance</span>
                <span className="text-lg font-mono font-bold text-accent-emerald">
                  {formatCurrency(projectionData.datasets[1].data[years] - projectionData.datasets[0].data[years], user.currency, currency.locale)}
                </span>
              </div>
            </div>

            <div className="card p-8 flex flex-col justify-center space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent-gold/20 flex items-center justify-center">
                  <BrainCircuit className="w-5 h-5 text-accent-gold" />
                </div>
                <h4 className="font-bold">Strategic Insight</h4>
              </div>
              <p className="text-sm text-text-secondary leading-relaxed italic">
                {selectedScenarios.length === 0 
                  ? "Select a scenario to see how your life choices ripple through time."
                  : selectedScenarios.includes('car') && selectedScenarios.includes('raise')
                  ? "Your raise covers the car, but investing that raise instead would have yielded a much higher net worth. Is the luxury worth the opportunity cost?"
                  : selectedScenarios.includes('frugal')
                  ? "Extreme frugality is a powerful lever. You're accelerating your financial independence by years."
                  : "Every decision today is a trade-off with your future self. Choose wisely."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
