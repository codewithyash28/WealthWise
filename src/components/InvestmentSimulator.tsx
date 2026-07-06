import { useState, useEffect, useMemo } from "react";
import { ConfirmationDialog } from "./ConfirmationDialog";
import { Simulation3DScene } from "./Simulation3DScene";
import { motion } from "motion/react";
import { 
  TrendingUp, 
  ShieldAlert, 
  Zap, 
  Calculator, 
  Target, 
  Info, 
  Plus, 
  Trash2, 
  Sparkles,
  Calendar,
  DollarSign
} from "lucide-react";
import { formatCurrency, cn } from "../lib/utils";
import { CURRENCIES } from "../constants";
import { UserProfile, FinancialGoal } from "../types";

interface InvestmentSimulatorProps {
  user: UserProfile;
  onUpdateGoals?: (goals: FinancialGoal[]) => void;
}

export function InvestmentSimulator({ user, onUpdateGoals }: InvestmentSimulatorProps) {
  // Tabs: WEALTH, INFLATION, STARTUP, LOAN
  const [activeTab, setActiveTab] = useState<"WEALTH" | "INFLATION" | "STARTUP" | "LOAN">("WEALTH");
  const currency = CURRENCIES[user.currency] || CURRENCIES.USD;

  // Deletion logic states using universal ConfirmationDialog
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [goalToDelete, setGoalToDelete] = useState<{ id: string; title: string } | null>(null);

  // 1. Wealth Growth State
  const [sipMonthly, setSipMonthly] = useState(() => {
    const saved = localStorage.getItem("ww_sim_sip_monthly");
    return saved ? Math.max(0, Number(JSON.parse(saved))) : currency.sipExample;
  });
  const [sipReturn, setSipReturn] = useState(() => {
    const saved = localStorage.getItem("ww_sim_sip_return");
    return saved ? Math.max(0, Number(JSON.parse(saved))) : 10;
  });
  const [sipPeriod, setSipPeriod] = useState(() => {
    const saved = localStorage.getItem("ww_sim_sip_period");
    return saved ? Math.max(1, Number(JSON.parse(saved))) : 15;
  });

  // 2. Inflation State
  const [inflationCapital, setInflationCapital] = useState(() => {
    const saved = localStorage.getItem("ww_sim_inf_capital");
    return saved ? Math.max(0, Number(JSON.parse(saved))) : 100000;
  });
  const [inflationRate, setInflationRate] = useState(() => {
    const saved = localStorage.getItem("ww_sim_inf_rate");
    return saved ? Math.max(0, Number(JSON.parse(saved))) : 4.5;
  });
  const [inflationPeriod, setInflationPeriod] = useState(() => {
    const saved = localStorage.getItem("ww_sim_inf_period");
    return saved ? Math.max(1, Number(JSON.parse(saved))) : 15;
  });

  // 3. Startup Planner State
  const [startupSeed, setStartupSeed] = useState(() => {
    const saved = localStorage.getItem("ww_sim_start_seed");
    return saved ? Math.max(0, Number(JSON.parse(saved))) : 500000;
  });
  const [startupBurn, setStartupBurn] = useState(() => {
    const saved = localStorage.getItem("ww_sim_start_burn");
    return saved ? Math.max(0, Number(JSON.parse(saved))) : 30000;
  });
  const [startupRevenue, setStartupRevenue] = useState(() => {
    const saved = localStorage.getItem("ww_sim_start_rev");
    return saved ? Math.max(0, Number(JSON.parse(saved))) : 12000;
  });

  // 4. Loan Calculator State
  const [loanPrincipal, setLoanPrincipal] = useState(() => {
    const saved = localStorage.getItem("ww_sim_loan_pr");
    return saved ? Math.max(0, Number(JSON.parse(saved))) : 250000;
  });
  const [loanRate, setLoanRate] = useState(() => {
    const saved = localStorage.getItem("ww_sim_loan_rate");
    return saved ? Math.max(0, Number(JSON.parse(saved))) : 6.5;
  });
  const [loanTenure, setLoanTenure] = useState(() => {
    const saved = localStorage.getItem("ww_sim_loan_ten");
    return saved ? Math.max(1, Number(JSON.parse(saved))) : 20;
  });

  // Saved Goals States
  const [savedGoals, setSavedGoals] = useState<FinancialGoal[]>(user.goals || []);
  const [goalTitle, setGoalTitle] = useState("");
  const [goalCategory, setGoalCategory] = useState<"RETIREMENT" | "HOUSE" | "CAR" | "EDUCATION" | "OTHER">("OTHER");
  const [customDeadline, setCustomDeadline] = useState(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 5);
    return d.toISOString().split("T")[0];
  });

  // Persists states automatically
  useEffect(() => {
    localStorage.setItem("ww_sim_sip_monthly", JSON.stringify(sipMonthly));
    localStorage.setItem("ww_sim_sip_return", JSON.stringify(sipReturn));
    localStorage.setItem("ww_sim_sip_period", JSON.stringify(sipPeriod));
    
    localStorage.setItem("ww_sim_inf_capital", JSON.stringify(inflationCapital));
    localStorage.setItem("ww_sim_inf_rate", JSON.stringify(inflationRate));
    localStorage.setItem("ww_sim_inf_period", JSON.stringify(inflationPeriod));

    localStorage.setItem("ww_sim_start_seed", JSON.stringify(startupSeed));
    localStorage.setItem("ww_sim_start_burn", JSON.stringify(startupBurn));
    localStorage.setItem("ww_sim_start_rev", JSON.stringify(startupRevenue));

    localStorage.setItem("ww_sim_loan_pr", JSON.stringify(loanPrincipal));
    localStorage.setItem("ww_sim_loan_rate", JSON.stringify(loanRate));
    localStorage.setItem("ww_sim_loan_ten", JSON.stringify(loanTenure));
  }, [
    sipMonthly, sipReturn, sipPeriod,
    inflationCapital, inflationRate, inflationPeriod,
    startupSeed, startupBurn, startupRevenue,
    loanPrincipal, loanRate, loanTenure
  ]);

  // Calculations for each simulation
  const wealthResults = useMemo(() => {
    const r = sipReturn / 12 / 100;
    const n = sipPeriod * 12;
    const fv = n === 0 ? 0 : sipMonthly * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
    const totalInvested = sipMonthly * n;
    const returns = fv - totalInvested;
    return { fv, totalInvested, returns, multiple: totalInvested > 0 ? fv / totalInvested : 1 };
  }, [sipMonthly, sipReturn, sipPeriod]);

  const inflationResults = useMemo(() => {
    const realValue = inflationCapital / Math.pow(1 + inflationRate / 100, inflationPeriod);
    const lostValue = inflationCapital - realValue;
    return { realValue, lostValue };
  }, [inflationCapital, inflationRate, inflationPeriod]);

  const startupResults = useMemo(() => {
    const netBurn = startupBurn - startupRevenue;
    const runway = netBurn <= 0 ? 999 : startupSeed / netBurn;
    return { netBurn, runway };
  }, [startupSeed, startupBurn, startupRevenue]);

  const loanResults = useMemo(() => {
    const r = loanRate / 12 / 100;
    const n = loanTenure * 12;
    const emi = (loanPrincipal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const totalRepay = emi * n;
    const totalInterest = totalRepay - loanPrincipal;
    return { emi, totalRepay, totalInterest };
  }, [loanPrincipal, loanRate, loanTenure]);

  // Goal logic synchronization
  useEffect(() => {
    if (user.goals) {
      setSavedGoals(user.goals);
    }
  }, [user.goals]);

  const handleSaveGoal = () => {
    let targetAmt = 0;
    if (activeTab === "WEALTH") targetAmt = wealthResults.fv;
    else if (activeTab === "INFLATION") targetAmt = inflationResults.realValue;
    else if (activeTab === "STARTUP") targetAmt = startupSeed;
    else if (activeTab === "LOAN") targetAmt = loanPrincipal;

    const finalTitle = goalTitle.trim() || `${activeTab} Goal Plan`;
    const newGoal: FinancialGoal = {
      id: Math.random().toString(36).substr(2, 9),
      title: finalTitle,
      targetAmount: Math.round(targetAmt),
      currentAmount: 0,
      deadline: customDeadline,
      category: goalCategory,
    };
    const updated = [...savedGoals, newGoal];
    setSavedGoals(updated);
    onUpdateGoals?.(updated);
    setGoalTitle("");
  };

  const handleDeleteGoal = (id: string) => {
    const goal = savedGoals.find((g) => g.id === id);
    if (!goal) return;
    setGoalToDelete({ id, title: goal.title });
    setDeleteConfirmOpen(true);
  };

  const executeDeleteGoal = () => {
    if (!goalToDelete) return;
    const updated = savedGoals.filter((g) => g.id !== goalToDelete.id);
    setSavedGoals(updated);
    onUpdateGoals?.(updated);
    setGoalToDelete(null);
  };

  // Auto delete completed goals
  useEffect(() => {
    const completed = savedGoals.filter((g) => g.currentAmount >= g.targetAmount && g.targetAmount > 0);
    if (completed.length > 0) {
      const remaining = savedGoals.filter((g) => g.currentAmount < g.targetAmount || g.targetAmount === 0);
      setSavedGoals(remaining);
      onUpdateGoals?.(remaining);
    }
  }, [savedGoals]);

  return (
    <div className="container mx-auto px-6 py-12 space-y-12">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-border/40">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-accent-gold">
            <Sparkles className="w-5 h-5 animate-pulse" />
            <span className="text-xs font-mono font-bold uppercase tracking-widest">Premium Workspace</span>
          </div>
          <h1 className="text-4xl font-display font-bold text-text-primary tracking-tight">Interactive 3D Simulation Suite</h1>
          <p className="text-sm text-text-secondary">Simulate asset projection curves and macroeconomic metrics inside a live ThreeJS viewport.</p>
        </div>
      </div>

      {/* Goal Progress Section */}
      {savedGoals.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-text-muted">My Active Financial Goals</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedGoals.map((goal) => {
              const progress = Math.min(100, (goal.currentAmount / goal.targetAmount) * 100);
              const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
              const yearsLeft = Math.ceil(
                (new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24 * 365)
              );

              return (
                <motion.div
                  key={goal.id}
                  whileHover={{ y: -4 }}
                  className="card p-6 space-y-4 border-l-4 border-l-accent-gold relative group"
                >
                  <button
                    onClick={() => handleDeleteGoal(goal.id)}
                    className="absolute top-4 right-4 p-1.5 rounded-lg text-text-muted hover:text-accent-red hover:bg-bg-secondary opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-accent-gold/10 flex items-center justify-center text-accent-gold">
                        <Target className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-text-primary">{goal.title}</h3>
                        <p className="text-[9px] text-text-muted uppercase tracking-widest font-bold">{goal.category}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-text-muted">Progress</span>
                      <span className="text-accent-gold">{progress.toFixed(1)}%</span>
                    </div>
                    <div className="h-1.5 bg-border rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        className="h-full bg-accent-gold"
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-text-muted font-mono">
                      <span>{formatCurrency(goal.currentAmount, user.currency, currency.locale)}</span>
                      <span>{formatCurrency(goal.targetAmount, user.currency, currency.locale)}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-border/40 flex items-center justify-between text-xs">
                    <div>
                      <div className="text-[9px] text-text-muted uppercase tracking-widest font-bold">Remaining</div>
                      <div className="font-mono font-bold text-text-secondary">
                        {formatCurrency(remaining, user.currency, currency.locale)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[9px] text-text-muted uppercase tracking-widest font-bold">Remaining Term</div>
                      <div className="font-bold text-accent-emerald">
                        {yearsLeft <= 0 ? "Due now" : `${yearsLeft} Years`}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Mode Select Tabs */}
      <div className="flex p-1.5 bg-bg-secondary border border-border/40 rounded-2xl w-full max-w-4xl mx-auto">
        {[
          { id: "WEALTH" as const, label: "Wealth Growth", icon: <TrendingUp className="w-4 h-4" /> },
          { id: "INFLATION" as const, label: "Inflation Impact", icon: <ShieldAlert className="w-4 h-4" /> },
          { id: "STARTUP" as const, label: "Startup Planner", icon: <Zap className="w-4 h-4" /> },
          { id: "LOAN" as const, label: "Loan Calculator", icon: <Calculator className="w-4 h-4" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex-1 py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer",
              activeTab === tab.id
                ? "bg-bg-card text-accent-gold shadow-lg border border-border/40"
                : "text-text-muted hover:text-text-secondary"
            )}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Main Control Panel and 3D Viewport Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Column: Form Parameters (4 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* WEALTH GROWTH TAB */}
          {activeTab === "WEALTH" && (
            <div className="card p-8 space-y-6">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-accent-gold" /> Compound Wealth Parameters
              </h3>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold uppercase tracking-wider text-text-muted">Monthly SIP Savings</label>
                  <span className="text-sm font-mono font-bold text-accent-gold">
                    {formatCurrency(sipMonthly, user.currency, currency.locale)}
                  </span>
                </div>
                <input
                  type="range"
                  min={currency.sipExample / 4}
                  max={currency.sipExample * 15}
                  step={currency.sipExample / 4}
                  value={sipMonthly}
                  onChange={(e) => setSipMonthly(Number(e.target.value))}
                  className="w-full accent-accent-gold h-1 bg-border rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold uppercase tracking-wider text-text-muted">Est. Annual Return</label>
                  <span className="text-sm font-mono font-bold text-accent-emerald">{sipReturn}%</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="25"
                  step="0.5"
                  value={sipReturn}
                  onChange={(e) => setSipReturn(Number(e.target.value))}
                  className="w-full accent-accent-emerald h-1 bg-border rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold uppercase tracking-wider text-text-muted">Investment Horizon</label>
                  <span className="text-sm font-mono font-bold text-accent-blue">{sipPeriod} Years</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="40"
                  step="1"
                  value={sipPeriod}
                  onChange={(e) => setSipPeriod(Number(e.target.value))}
                  className="w-full accent-accent-blue h-1 bg-border rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* INFLATION IMPACT TAB */}
          {activeTab === "INFLATION" && (
            <div className="card p-8 space-y-6">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-accent-gold" /> Purchasing Power Decay
              </h3>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold uppercase tracking-wider text-text-muted">Starting Cash Capital</label>
                  <span className="text-sm font-mono font-bold text-accent-gold">
                    {formatCurrency(inflationCapital, user.currency, currency.locale)}
                  </span>
                </div>
                <input
                  type="range"
                  min="10000"
                  max="1000000"
                  step="10000"
                  value={inflationCapital}
                  onChange={(e) => setInflationCapital(Number(e.target.value))}
                  className="w-full accent-accent-gold h-1 bg-border rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold uppercase tracking-wider text-text-muted">Average Inflation Rate</label>
                  <span className="text-sm font-mono font-bold text-[#EA580C]">{inflationRate}%</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="15"
                  step="0.1"
                  value={inflationRate}
                  onChange={(e) => setInflationRate(Number(e.target.value))}
                  className="w-full accent-[#EA580C] h-1 bg-border rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold uppercase tracking-wider text-text-muted">Time Horizon</label>
                  <span className="text-sm font-mono font-bold text-accent-blue">{inflationPeriod} Years</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="40"
                  step="1"
                  value={inflationPeriod}
                  onChange={(e) => setInflationPeriod(Number(e.target.value))}
                  className="w-full accent-accent-blue h-1 bg-border rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* STARTUP PLANNER TAB */}
          {activeTab === "STARTUP" && (
            <div className="card p-8 space-y-6">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Zap className="w-5 h-5 text-accent-gold" /> Runway & Burn Rate Analysis
              </h3>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold uppercase tracking-wider text-text-muted">Seed Funding Raised</label>
                  <span className="text-sm font-mono font-bold text-accent-gold">
                    {formatCurrency(startupSeed, user.currency, currency.locale)}
                  </span>
                </div>
                <input
                  type="range"
                  min="50000"
                  max="1500000"
                  step="50000"
                  value={startupSeed}
                  onChange={(e) => setStartupSeed(Number(e.target.value))}
                  className="w-full accent-accent-gold h-1 bg-border rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold uppercase tracking-wider text-text-muted">Monthly Burn Cost</label>
                  <span className="text-sm font-mono font-bold text-accent-red">
                    {formatCurrency(startupBurn, user.currency, currency.locale)}
                  </span>
                </div>
                <input
                  type="range"
                  min="5000"
                  max="100000"
                  step="5000"
                  value={startupBurn}
                  onChange={(e) => setStartupBurn(Number(e.target.value))}
                  className="w-full accent-accent-red h-1 bg-border rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold uppercase tracking-wider text-text-muted">Monthly Cash Revenue</label>
                  <span className="text-sm font-mono font-bold text-accent-emerald">
                    {formatCurrency(startupRevenue, user.currency, currency.locale)}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="80000"
                  step="2000"
                  value={startupRevenue}
                  onChange={(e) => setStartupRevenue(Number(e.target.value))}
                  className="w-full accent-accent-emerald h-1 bg-border rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* LOAN CALCULATOR TAB */}
          {activeTab === "LOAN" && (
            <div className="card p-8 space-y-6">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Calculator className="w-5 h-5 text-accent-gold" /> Loan Amortization Schedule
              </h3>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold uppercase tracking-wider text-text-muted">Loan Principal</label>
                  <span className="text-sm font-mono font-bold text-accent-gold">
                    {formatCurrency(loanPrincipal, user.currency, currency.locale)}
                  </span>
                </div>
                <input
                  type="range"
                  min="10000"
                  max="1000000"
                  step="10000"
                  value={loanPrincipal}
                  onChange={(e) => setLoanPrincipal(Number(e.target.value))}
                  className="w-full accent-accent-gold h-1 bg-border rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold uppercase tracking-wider text-text-muted">Annual Interest Rate</label>
                  <span className="text-sm font-mono font-bold text-accent-emerald">{loanRate}%</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="15"
                  step="0.1"
                  value={loanRate}
                  onChange={(e) => setLoanRate(Number(e.target.value))}
                  className="w-full accent-accent-emerald h-1 bg-border rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold uppercase tracking-wider text-text-muted">Repayment Term</label>
                  <span className="text-sm font-mono font-bold text-accent-blue">{loanTenure} Years</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="30"
                  step="1"
                  value={loanTenure}
                  onChange={(e) => setLoanTenure(Number(e.target.value))}
                  className="w-full accent-accent-blue h-1 bg-border rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* Dynamic Calculated Cards Grid */}
          <div className="grid grid-cols-2 gap-4">
            {activeTab === "WEALTH" && (
              <>
                <div className="card p-4 bg-accent-blue/5 border-accent-blue/10">
                  <div className="text-[9px] text-text-muted uppercase tracking-wider mb-1">Total Savings</div>
                  <div className="text-base font-mono font-bold text-accent-blue">
                    {formatCurrency(wealthResults.totalInvested, user.currency, currency.locale)}
                  </div>
                </div>
                <div className="card p-4 bg-accent-emerald/5 border-accent-emerald/10">
                  <div className="text-[9px] text-text-muted uppercase tracking-wider mb-1">Compound Yield</div>
                  <div className="text-base font-mono font-bold text-accent-emerald">
                    {formatCurrency(wealthResults.returns, user.currency, currency.locale)}
                  </div>
                </div>
                <div className="card p-5 col-span-2 bg-accent-gold/10 border-accent-gold/20 flex flex-col justify-center relative overflow-hidden">
                  <div className="text-[9px] text-text-muted uppercase tracking-wider mb-1">Final Asset Value</div>
                  <div className="text-2xl font-mono font-black text-accent-gold">
                    {formatCurrency(wealthResults.fv, user.currency, currency.locale)}
                  </div>
                  <div className="text-[9px] text-accent-gold/60 mt-1 font-bold">
                    Returns represent a {wealthResults.multiple.toFixed(2)}x asset multiplier!
                  </div>
                </div>
              </>
            )}

            {activeTab === "INFLATION" && (
              <>
                <div className="card p-4 bg-accent-blue/5 border-accent-blue/10">
                  <div className="text-[9px] text-text-muted uppercase tracking-wider mb-1">Original Capital</div>
                  <div className="text-base font-mono font-bold text-accent-blue">
                    {formatCurrency(inflationCapital, user.currency, currency.locale)}
                  </div>
                </div>
                <div className="card p-4 bg-accent-red/5 border border-accent-red/10">
                  <div className="text-[9px] text-text-muted uppercase tracking-wider mb-1 font-bold">Lost Power</div>
                  <div className="text-base font-mono font-bold text-accent-red">
                    {formatCurrency(inflationResults.lostValue, user.currency, currency.locale)}
                  </div>
                </div>
                <div className="card p-5 col-span-2 bg-[#EA580C]/10 border border-[#EA580C]/20 flex flex-col justify-center">
                  <div className="text-[9px] text-text-muted uppercase tracking-wider mb-1">Real Buying Power</div>
                  <div className="text-2xl font-mono font-black text-[#EA580C]">
                    {formatCurrency(inflationResults.realValue, user.currency, currency.locale)}
                  </div>
                  <div className="text-[9px] text-text-muted mt-1">
                    Your money loses {((inflationResults.lostValue / inflationCapital) * 100).toFixed(1)}% of its utility.
                  </div>
                </div>
              </>
            )}

            {activeTab === "STARTUP" && (
              <>
                <div className="card p-4 bg-accent-blue/5 border-accent-blue/10">
                  <div className="text-[9px] text-text-muted uppercase tracking-wider mb-1">Net Monthly Burn</div>
                  <div className="text-base font-mono font-bold text-accent-blue">
                    {formatCurrency(startupResults.netBurn, user.currency, currency.locale)}
                  </div>
                </div>
                <div className="card p-4 bg-accent-emerald/5 border border-accent-emerald/10">
                  <div className="text-[9px] text-text-muted uppercase tracking-wider mb-1">Initial Reserve</div>
                  <div className="text-base font-mono font-bold text-accent-emerald">
                    {formatCurrency(startupSeed, user.currency, currency.locale)}
                  </div>
                </div>
                <div className="card p-5 col-span-2 bg-accent-gold/10 border-accent-gold/20 flex flex-col justify-center">
                  <div className="text-[9px] text-text-muted uppercase tracking-wider mb-1">Runway Projection</div>
                  <div className="text-2xl font-mono font-black text-accent-gold">
                    {startupResults.netBurn <= 0 ? "∞ Infinite" : `${startupResults.runway.toFixed(1)} Months`}
                  </div>
                  <div className="text-[9px] text-text-muted mt-1">
                    {startupResults.netBurn <= 0 
                      ? "Congratulations! Your startup is Cash Flow Positive (Break-even)."
                      : `Company will crash in ${(startupResults.runway / 12).toFixed(1)} years without seed top-ups.`}
                  </div>
                </div>
              </>
            )}

            {activeTab === "LOAN" && (
              <>
                <div className="card p-4 bg-accent-blue/5 border-accent-blue/10">
                  <div className="text-[9px] text-text-muted uppercase tracking-wider mb-1">Monthly Payment</div>
                  <div className="text-base font-mono font-bold text-accent-blue">
                    {formatCurrency(loanResults.emi, user.currency, currency.locale)}
                  </div>
                </div>
                <div className="card p-4 bg-accent-red/5 border border-accent-red/10">
                  <div className="text-[9px] text-text-muted uppercase tracking-wider mb-1">Interest Cost</div>
                  <div className="text-base font-mono font-bold text-accent-red">
                    {formatCurrency(loanResults.totalInterest, user.currency, currency.locale)}
                  </div>
                </div>
                <div className="card p-5 col-span-2 bg-accent-gold/10 border-accent-gold/20 flex flex-col justify-center">
                  <div className="text-[9px] text-text-muted uppercase tracking-wider mb-1">Total Repayment</div>
                  <div className="text-2xl font-mono font-black text-accent-gold">
                    {formatCurrency(loanResults.totalRepay, user.currency, currency.locale)}
                  </div>
                  <div className="text-[9px] text-text-muted mt-1">
                    Interest represents {((loanResults.totalInterest / loanResults.totalRepay) * 100).toFixed(1)}% of total amortization.
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Goal Creator Box */}
          <div className="card p-6 space-y-4">
            <h4 className="text-sm font-bold flex items-center gap-1.5 text-text-primary">
              <Target className="w-4.5 h-4.5 text-accent-gold" /> Convert Plan to Goal
            </h4>
            
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Name your goal (e.g., Retirement Fund)"
                value={goalTitle}
                onChange={(e) => setGoalTitle(e.target.value)}
                className="w-full bg-bg-secondary text-text-primary border border-border/80 focus:border-accent-gold rounded-xl px-4 py-2.5 text-xs placeholder-text-muted outline-none transition-colors"
              />

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[9px] font-bold text-text-muted uppercase tracking-wider">Goal Category</label>
                  <select
                    value={goalCategory}
                    onChange={(e) => setGoalCategory(e.target.value as any)}
                    className="w-full bg-bg-secondary text-text-primary border border-border rounded-xl px-3 py-2 text-xs focus:border-accent-gold outline-none mt-1 cursor-pointer"
                  >
                    <option value="RETIREMENT">Retirement</option>
                    <option value="HOUSE">Real Estate</option>
                    <option value="CAR">Vehicle</option>
                    <option value="EDUCATION">Education</option>
                    <option value="OTHER">General / Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-[9px] font-bold text-text-muted uppercase tracking-wider">Target Deadline</label>
                  <input
                    type="date"
                    value={customDeadline}
                    onChange={(e) => e.target.value && setCustomDeadline(e.target.value)}
                    className="w-full bg-bg-secondary text-text-primary border border-border rounded-xl px-3 py-2 text-xs focus:border-accent-gold outline-none mt-1"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleSaveGoal}
                className="w-full btn-primary py-2.5 flex items-center justify-center gap-1.5 text-xs uppercase tracking-wider font-bold mt-2"
              >
                <Plus className="w-3.5 h-3.5" /> Commit Goal Matrix
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive 3D Canvas Viewport (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="space-y-2">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-accent-gold" /> Real-Time 3D Projection Model
            </h3>
            
            {/* The high-end 3D Scene Wrapper */}
            <Simulation3DScene
              activeTab={activeTab}
              wealthData={{
                sipMonthly,
                sipReturn,
                sipPeriod,
                sipResults: wealthResults,
              }}
              inflationData={{
                capital: inflationCapital,
                rate: inflationRate,
                period: inflationPeriod,
                realValue: inflationResults.realValue,
                lostValue: inflationResults.lostValue,
              }}
              startupData={{
                seed: startupSeed,
                burn: startupBurn,
                revenue: startupRevenue,
                runway: startupResults.runway,
              }}
              loanData={{
                principal: loanPrincipal,
                rate: loanRate,
                tenure: loanTenure,
                emi: loanResults.emi,
                totalInterest: loanResults.totalInterest,
              }}
            />
          </div>

          {/* Theoretical Insights Box */}
          <div className="card p-6 space-y-4">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <Info className="w-4 h-4 text-accent-gold" /> Simulator Academic Factsheets
            </h3>
            <div className="space-y-3 text-xs leading-relaxed text-text-secondary">
              <p>
                {activeTab === "WEALTH" && (
                  `Compounding multipliers are deeply dependent on the investment duration. For example, maintaining your savings at ${formatCurrency(sipMonthly, user.currency, currency.locale)} for ${sipPeriod} years at a ${sipReturn}% growth profile transforms into a total wealth volume of ${formatCurrency(wealthResults.fv, user.currency, currency.locale)}!`
                )}
                {activeTab === "INFLATION" && (
                  `Inflation represents an invisible systemic tax on uninvested liquid cash capital. Under a baseline inflation rate of ${inflationRate}%, a starting reserve of ${formatCurrency(inflationCapital, user.currency, currency.locale)} decays to a purchasing utility of ${formatCurrency(inflationResults.realValue, user.currency, currency.locale)} after ${inflationPeriod} years.`
                )}
                {activeTab === "STARTUP" && (
                  `Runway tracking is the absolute lifetime metrics of pre-revenue corporate structures. Your current monthly operational net-loss is calculated at ${formatCurrency(startupResults.netBurn, user.currency, currency.locale)}, projecting a maximum operational life-support timeline of ${startupResults.netBurn <= 0 ? "Infinite (Break-even secured)" : `${startupResults.runway.toFixed(1)} Months`}.`
                )}
                {activeTab === "LOAN" && (
                  `Loan interest structures are heavily front-loaded inside traditional amortizations. Paying a principal sum of ${formatCurrency(loanPrincipal, user.currency, currency.locale)} over ${loanTenure} years results in paying ${formatCurrency(loanResults.totalInterest, user.currency, currency.locale)} in separate bank financing overheads.`
                )}
              </p>
              <div className="p-3 bg-bg-secondary border border-border/60 rounded-xl font-mono text-[10px] text-text-muted flex items-center gap-2">
                <span className="text-accent-gold">✔ Academic Guidance:</span>
                <span>Portfolios should target out-performing the current inflation benchmark by at least 3.5% annually.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Universal Goal Deletion ConfirmationDialog modal */}
      <ConfirmationDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={executeDeleteGoal}
        title="Delete Financial Goal"
        message={`Are you sure you want to permanently delete the financial goal "${goalToDelete?.title || ""}"? This operation is completely irreversible and will clean all tracking progress from your client profile.`}
        confirmText="Confirm Delete"
        type="danger"
      />
    </div>
  );
}
