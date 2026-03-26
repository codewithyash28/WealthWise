import { useState, useEffect, useMemo } from "react";
import { motion } from "motion/react";
import { TrendingUp, DollarSign, Calendar, Target, Info, ArrowRight, ChevronRight, Calculator, PieChart } from "lucide-react";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { formatCurrency, cn } from "../lib/utils";
import { CURRENCIES } from "../constants";
import { UserProfile } from "../types";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

interface InvestmentSimulatorProps {
  user: UserProfile;
}

export function InvestmentSimulator({ user }: InvestmentSimulatorProps) {
  const [activeTab, setActiveTab] = useState<"SIP" | "LUMP" | "GOAL">("SIP");
  const currency = CURRENCIES[user.currency] || CURRENCIES.USD;

  // SIP State
  const [sipMonthly, setSipMonthly] = useState(currency.sipExample);
  const [sipReturn, setSipReturn] = useState(10);
  const [sipPeriod, setSipPeriod] = useState(15);

  // Lump Sum State
  const [lumpAmount, setLumpAmount] = useState(currency.avgSalary * 2);
  const [lumpReturn, setLumpReturn] = useState(10);
  const [lumpPeriod, setLumpPeriod] = useState(15);

  // Goal State
  const [goalAmount, setGoalAmount] = useState(currency.emergencyTarget);
  const [goalPeriod, setGoalPeriod] = useState(5);
  const [goalReturn, setGoalReturn] = useState(10);

  const calculateSIP = () => {
    const r = sipReturn / 12 / 100;
    const n = sipPeriod * 12;
    const fv = sipMonthly * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
    const totalInvested = sipMonthly * n;
    const returns = fv - totalInvested;
    return { fv, totalInvested, returns, multiple: fv / totalInvested };
  };

  const calculateLump = () => {
    const r = lumpReturn / 100;
    const fv = lumpAmount * Math.pow(1 + r, lumpPeriod);
    const totalInvested = lumpAmount;
    const returns = fv - totalInvested;
    return { fv, totalInvested, returns, multiple: fv / totalInvested };
  };

  const calculateGoal = () => {
    const r = goalReturn / 12 / 100;
    const n = goalPeriod * 12;
    const monthlyNeeded = goalAmount * r / ((Math.pow(1 + r, n) - 1) * (1 + r));
    const lumpNeeded = goalAmount / Math.pow(1 + goalReturn / 100, goalPeriod);
    return { monthlyNeeded, lumpNeeded };
  };

  const sipResults = calculateSIP();
  const lumpResults = calculateLump();
  const goalResults = calculateGoal();

  const chartData = useMemo(() => {
    const labels = Array.from({ length: (activeTab === "SIP" ? sipPeriod : lumpPeriod) + 1 }, (_, i) => i);
    const investedData = [];
    const returnsData = [];

    if (activeTab === "SIP") {
      for (let i = 0; i <= sipPeriod; i++) {
        const r = sipReturn / 12 / 100;
        const n = i * 12;
        const fv = n === 0 ? 0 : sipMonthly * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
        const total = sipMonthly * n;
        investedData.push(total);
        returnsData.push(fv);
      }
    } else {
      for (let i = 0; i <= lumpPeriod; i++) {
        const r = lumpReturn / 100;
        const fv = lumpAmount * Math.pow(1 + r, i);
        investedData.push(lumpAmount);
        returnsData.push(fv);
      }
    }

    return {
      labels,
      datasets: [
        {
          label: 'Total Value',
          data: returnsData,
          borderColor: '#F0B429',
          backgroundColor: 'rgba(240, 180, 41, 0.1)',
          fill: true,
          tension: 0.4,
        },
        {
          label: 'Amount Invested',
          data: investedData,
          borderColor: '#3B82F6',
          backgroundColor: 'rgba(59, 130, 246, 0.2)',
          fill: true,
          tension: 0.4,
        }
      ],
    };
  }, [activeTab, sipMonthly, sipReturn, sipPeriod, lumpAmount, lumpReturn, lumpPeriod]);

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
          label: (context: any) => {
            return `${context.dataset.label}: ${formatCurrency(context.raw, user.currency, currency.locale)}`;
          }
        }
      }
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { family: 'Outfit' } } },
      y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { font: { family: 'Outfit' }, callback: (value: any) => formatCurrency(value, user.currency, currency.locale).split('.')[0] } }
    }
  };

  return (
    <div className="container mx-auto px-6 py-12 space-y-12">
      <div className="space-y-2">
        <h1 className="text-4xl font-display font-bold">Investment Simulator</h1>
        <p className="text-text-secondary">Discover the power of compound growth</p>
      </div>

      {/* Tabs */}
      <div className="flex p-1 bg-bg-secondary rounded-xl w-full max-w-2xl mx-auto">
        {(["SIP", "LUMP", "GOAL"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "flex-1 py-3 rounded-lg text-sm font-bold transition-all",
              activeTab === tab ? "bg-bg-card text-accent-gold shadow-lg" : "text-text-muted hover:text-text-secondary"
            )}
          >
            {tab === "SIP" ? "SIP / Monthly" : tab === "LUMP" ? "Lump Sum" : "Goal Planner"}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Inputs */}
        <div className="space-y-8">
          {activeTab === "SIP" && (
            <div className="card p-8 space-y-8">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium">Monthly Investment</label>
                  <span className="text-xl font-mono font-bold text-accent-gold">{formatCurrency(sipMonthly, user.currency, currency.locale)}</span>
                </div>
                <input type="range" min={currency.sipExample / 4} max={currency.sipExample * 20} step={currency.sipExample / 4} value={sipMonthly} onChange={(e) => setSipMonthly(Number(e.target.value))} className="w-full accent-accent-gold" />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium">Expected Annual Return (%)</label>
                  <span className="text-xl font-mono font-bold text-accent-emerald">{sipReturn}%</span>
                </div>
                <input type="range" min="1" max="30" step="0.5" value={sipReturn} onChange={(e) => setSipReturn(Number(e.target.value))} className="w-full accent-accent-emerald" />
                <div className="flex justify-between text-[10px] text-text-muted uppercase tracking-wider">
                  <span>Savings: 3-4%</span>
                  <span>Index: 10-12%</span>
                  <span>Growth: 15-20%</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium">Investment Period (Years)</label>
                  <span className="text-xl font-mono font-bold text-accent-blue">{sipPeriod} Years</span>
                </div>
                <input type="range" min="1" max="40" step="1" value={sipPeriod} onChange={(e) => setSipPeriod(Number(e.target.value))} className="w-full accent-accent-blue" />
              </div>
            </div>
          )}

          {activeTab === "LUMP" && (
            <div className="card p-8 space-y-8">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium">One-Time Investment</label>
                  <span className="text-xl font-mono font-bold text-accent-gold">{formatCurrency(lumpAmount, user.currency, currency.locale)}</span>
                </div>
                <input type="range" min={currency.avgSalary} max={currency.avgSalary * 50} step={currency.avgSalary} value={lumpAmount} onChange={(e) => setLumpAmount(Number(e.target.value))} className="w-full accent-accent-gold" />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium">Expected Annual Return (%)</label>
                  <span className="text-xl font-mono font-bold text-accent-emerald">{lumpReturn}%</span>
                </div>
                <input type="range" min="1" max="30" step="0.5" value={lumpReturn} onChange={(e) => setLumpReturn(Number(e.target.value))} className="w-full accent-accent-emerald" />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium">Period (Years)</label>
                  <span className="text-xl font-mono font-bold text-accent-blue">{lumpPeriod} Years</span>
                </div>
                <input type="range" min="1" max="40" step="1" value={lumpPeriod} onChange={(e) => setLumpPeriod(Number(e.target.value))} className="w-full accent-accent-blue" />
              </div>
            </div>
          )}

          {activeTab === "GOAL" && (
            <div className="card p-8 space-y-8">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium">Target Amount</label>
                  <span className="text-xl font-mono font-bold text-accent-gold">{formatCurrency(goalAmount, user.currency, currency.locale)}</span>
                </div>
                <input type="range" min={currency.emergencyTarget / 2} max={currency.emergencyTarget * 50} step={currency.emergencyTarget / 2} value={goalAmount} onChange={(e) => setGoalAmount(Number(e.target.value))} className="w-full accent-accent-gold" />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium">Years to Goal</label>
                  <span className="text-xl font-mono font-bold text-accent-blue">{goalPeriod} Years</span>
                </div>
                <input type="range" min="1" max="40" step="1" value={goalPeriod} onChange={(e) => setGoalPeriod(Number(e.target.value))} className="w-full accent-accent-blue" />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium">Expected Return (%)</label>
                  <span className="text-xl font-mono font-bold text-accent-emerald">{goalReturn}%</span>
                </div>
                <input type="range" min="1" max="30" step="0.5" value={goalReturn} onChange={(e) => setGoalReturn(Number(e.target.value))} className="w-full accent-accent-emerald" />
              </div>
            </div>
          )}

          {/* Result Cards */}
          <div className="grid grid-cols-2 gap-4">
            {activeTab !== "GOAL" ? (
              <>
                <div className="card p-4 bg-accent-blue/5 border-accent-blue/10">
                  <div className="text-[10px] text-text-muted uppercase tracking-wider mb-1">Total Invested</div>
                  <div className="text-lg font-mono font-bold text-accent-blue">{formatCurrency(activeTab === "SIP" ? sipResults.totalInvested : lumpResults.totalInvested, user.currency, currency.locale)}</div>
                </div>
                <div className="card p-4 bg-accent-emerald/5 border-accent-emerald/10">
                  <div className="text-[10px] text-text-muted uppercase tracking-wider mb-1">Est. Returns</div>
                  <div className="text-lg font-mono font-bold text-accent-emerald">{formatCurrency(activeTab === "SIP" ? sipResults.returns : lumpResults.returns, user.currency, currency.locale)}</div>
                </div>
                <div className="card p-4 col-span-2 bg-accent-gold/10 border-accent-gold/20">
                  <div className="text-[10px] text-text-muted uppercase tracking-wider mb-1">Final Value</div>
                  <div className="text-2xl font-mono font-bold text-accent-gold">{formatCurrency(activeTab === "SIP" ? sipResults.fv : lumpResults.fv, user.currency, currency.locale)}</div>
                  <div className="text-[10px] text-accent-gold/60 mt-1">That's {(activeTab === "SIP" ? sipResults.multiple : lumpResults.multiple).toFixed(2)}x your money!</div>
                </div>
              </>
            ) : (
              <>
                <div className="card p-6 col-span-2 bg-accent-gold/10 border-accent-gold/20 text-center space-y-2">
                  <div className="text-xs text-text-muted uppercase tracking-wider">Monthly Investment Needed</div>
                  <div className="text-3xl font-mono font-bold text-accent-gold">{formatCurrency(goalResults.monthlyNeeded, user.currency, currency.locale)}</div>
                  <div className="text-xs text-text-muted">Or a lump sum of {formatCurrency(goalResults.lumpNeeded, user.currency, currency.locale)} today</div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Visual Analysis */}
        <div className="space-y-8">
          {activeTab !== "GOAL" && (
            <div className="card p-8 h-[400px]">
              <Line data={chartData} options={chartOptions} />
            </div>
          )}

          <div className="card p-8 space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Info className="w-5 h-5 text-accent-gold" /> Investment Facts
            </h3>
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-bg-secondary border border-border">
                <p className="text-sm text-text-secondary leading-relaxed">
                  "The Rule of 72: Divide 72 by your return rate to find how many years to double your money. At 10%, it takes 7.2 years!"
                </p>
              </div>
              <div className="p-4 rounded-xl bg-bg-secondary border border-border">
                <p className="text-sm text-text-secondary leading-relaxed">
                  "Starting {formatCurrency(currency.sipExample, user.currency, currency.locale)} at age 25 vs age 35 (same total invested): age 25 ends with 2x more due to compounding!"
                </p>
              </div>
            </div>
          </div>

          {activeTab === "SIP" && (
            <div className="p-6 rounded-2xl bg-accent-gold/5 border border-accent-gold/20 text-center">
              <p className="text-accent-gold font-medium italic">
                "Your {formatCurrency(sipMonthly, user.currency, currency.locale)} per month becomes {formatCurrency(sipResults.fv, user.currency, currency.locale)} in {sipPeriod} years! 🚀"
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
