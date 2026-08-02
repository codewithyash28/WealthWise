import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Trash2, ArrowRight, ShieldAlert, Sparkles, TrendingUp, DollarSign, Wallet, Scale, Info, CheckCircle2, Calculator, Zap, Gauge, Flame } from "lucide-react";
import { formatCurrency, cn } from "../lib/utils";
import { CURRENCIES } from "../constants";
import { UserProfile } from "../types";
import { DebtPayoffVisualization } from "./DebtPayoffVisualization";

interface Loan {
  id: string;
  name: string;
  balance: number;
  rate: number;
  minPayment: number;
}

interface DebtPayoffProps {
  user: UserProfile;
}

// Quick Loan Payoff Mini-Calculator Component with Impact Score
function QuickLoanPayoffCalculator({ user, currency, onApplyExtra }: { user: UserProfile; currency: any; onApplyExtra: (amt: number) => void }) {
  const [calcBalance, setCalcBalance] = useState(15000);
  const [calcRate, setCalcRate] = useState(14.5);
  const [calcMin, setCalcMin] = useState(300);
  const [extraPayment, setExtraPayment] = useState(150);

  const calcResults = useMemo(() => {
    if (calcBalance <= 0 || calcMin <= 0) {
      return { origMonths: 0, origInterest: 0, accelMonths: 0, accelInterest: 0, interestSaved: 0, monthsSaved: 0, impactScore: 0, impactLabel: "N/A" };
    }

    const r = (calcRate / 100) / 12;

    // Simulate Baseline (min payment only)
    let bBal = calcBalance;
    let bMonths = 0;
    let bInterest = 0;
    while (bBal > 0 && bMonths < 480) {
      bMonths++;
      const interest = bBal * r;
      bBal += interest;
      bInterest += interest;
      const pay = Math.min(bBal, calcMin);
      bBal -= pay;
    }

    // Simulate Accelerated (min + extra)
    let aBal = calcBalance;
    let aMonths = 0;
    let aInterest = 0;
    const accelPay = calcMin + extraPayment;
    while (aBal > 0 && aMonths < 480) {
      aMonths++;
      const interest = aBal * r;
      aBal += interest;
      aInterest += interest;
      const pay = Math.min(aBal, accelPay);
      aBal -= pay;
    }

    const interestSaved = Math.max(0, bInterest - aInterest);
    const monthsSaved = Math.max(0, bMonths - aMonths);

    // Calculate Impact Score (0 to 100)
    const interestRatio = bInterest > 0 ? interestSaved / bInterest : 0;
    const timeRatio = bMonths > 0 ? monthsSaved / bMonths : 0;
    const rawScore = (interestRatio * 60) + (timeRatio * 40);
    const impactScore = Math.min(100, Math.max(12, Math.round(rawScore)));

    let impactLabel = "Moderate Impact";
    let impactColor = "text-accent-gold border-accent-gold/40 bg-accent-gold/10";
    if (impactScore >= 80) {
      impactLabel = "TRANSFORMATIVE 🚀";
      impactColor = "text-emerald-400 border-emerald-500/40 bg-emerald-500/10";
    } else if (impactScore >= 50) {
      impactLabel = "HIGH IMPACT ⚡";
      impactColor = "text-amber-400 border-amber-500/40 bg-amber-500/10";
    } else {
      impactLabel = "STABLE BOOST 🌱";
      impactColor = "text-blue-400 border-blue-500/40 bg-blue-500/10";
    }

    return {
      origMonths: bMonths,
      origInterest: bInterest,
      accelMonths: aMonths,
      accelInterest: aInterest,
      interestSaved,
      monthsSaved,
      impactScore,
      impactLabel,
      impactColor
    };
  }, [calcBalance, calcRate, calcMin, extraPayment]);

  return (
    <div className="card p-6 border-accent-gold/30 bg-gradient-to-br from-bg-secondary/80 via-bg-primary to-bg-secondary/40 space-y-6 shadow-2xl relative overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-accent-gold/15 border border-accent-gold/30 text-accent-gold">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold font-display text-text-primary">Quick Loan Payoff Simulator</h3>
              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold uppercase border border-amber-500/30">
                Instant Impact Calculator
              </span>
            </div>
            <p className="text-xs text-text-secondary mt-0.5">Simulate extra monthly contributions and measure immediate time & interest savings.</p>
          </div>
        </div>

        {/* Impact Score Badge */}
        <div className={cn("px-4 py-2 rounded-2xl border flex items-center gap-2 self-start sm:self-auto font-mono", calcResults.impactColor)}>
          <Gauge className="w-5 h-5 shrink-0 animate-pulse" />
          <div>
            <div className="text-[9px] uppercase tracking-wider font-bold">Impact Score</div>
            <div className="text-lg font-black leading-none">{calcResults.impactScore} / 100</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Controls */}
        <div className="space-y-4 md:col-span-1 border-r-0 md:border-r border-border/40 pr-0 md:pr-6">
          <div className="space-y-1">
            <label className="text-[10px] font-mono text-text-muted uppercase tracking-wider font-bold block">
              Loan Balance ({currency.symbol})
            </label>
            <input
              type="number"
              value={calcBalance}
              onChange={(e) => setCalcBalance(Math.max(100, Number(e.target.value)))}
              className="input-field w-full text-xs font-mono font-bold"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-text-muted uppercase tracking-wider font-bold block">
                APR %
              </label>
              <input
                type="number"
                step="0.1"
                value={calcRate}
                onChange={(e) => setCalcRate(Math.max(0.1, Number(e.target.value)))}
                className="input-field w-full text-xs font-mono font-bold"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-text-muted uppercase tracking-wider font-bold block">
                Base Pay ({currency.symbol})
              </label>
              <input
                type="number"
                value={calcMin}
                onChange={(e) => setCalcMin(Math.max(10, Number(e.target.value)))}
                className="input-field w-full text-xs font-mono font-bold"
              />
            </div>
          </div>

          {/* Extra Monthly Payment Slider */}
          <div className="space-y-2 pt-2 border-t border-border/40">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-accent-gold font-bold flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-amber-400" /> Extra Monthly Boost:
              </span>
              <span className="text-emerald-400 font-bold text-sm">+{formatCurrency(extraPayment, user.currency, currency.locale)}</span>
            </div>
            <input
              type="range"
              min={0}
              max={1000}
              step={25}
              value={extraPayment}
              onChange={(e) => setExtraPayment(Number(e.target.value))}
              className="w-full accent-amber-400 cursor-pointer"
            />
            <div className="flex justify-between text-[9px] text-text-muted font-mono">
              <span>{formatCurrency(0, user.currency, currency.locale)}</span>
              <span>{formatCurrency(1000, user.currency, currency.locale)} / mo</span>
            </div>
          </div>

          <button
            onClick={() => {
              onApplyExtra(extraPayment);
              window.dispatchEvent(new CustomEvent('ww-trigger-alert', {
                detail: {
                  type: 'success',
                  title: 'Extra Payment Applied! 🚀',
                  message: `Injected +${formatCurrency(extraPayment, user.currency, currency.locale)} monthly extra payment into your global Debt Accelerator strategy.`
                }
              }));
            }}
            className="w-full py-2.5 bg-accent-gold text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg hover:bg-amber-400 transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Zap className="w-4 h-4" /> Apply To Global Strategy
          </button>
        </div>

        {/* Results & Visual Progress */}
        <div className="md:col-span-2 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-bg-void/80 border border-border/60 rounded-2xl space-y-1">
              <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider block">Total Interest Saved</span>
              <div className="text-2xl font-mono font-extrabold text-emerald-400">
                {formatCurrency(calcResults.interestSaved, user.currency, currency.locale)}
              </div>
              <span className="text-[10px] text-text-secondary block">
                Interest drops from {formatCurrency(calcResults.origInterest, user.currency, currency.locale)} down to {formatCurrency(calcResults.accelInterest, user.currency, currency.locale)}
              </span>
            </div>

            <div className="p-4 bg-bg-void/80 border border-border/60 rounded-2xl space-y-1">
              <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider block">Time Saved to Freedom</span>
              <div className="text-2xl font-mono font-extrabold text-amber-400">
                {calcResults.monthsSaved} Months Sooner
              </div>
              <span className="text-[10px] text-text-secondary block">
                Debt cleared in {calcResults.accelMonths} months instead of {calcResults.origMonths}
              </span>
            </div>
          </div>

          {/* Impact Gauge Visual Bar */}
          <div className="p-4 bg-bg-secondary/60 border border-border/60 rounded-2xl space-y-3 font-mono text-xs">
            <div className="flex justify-between items-center">
              <span className="text-text-secondary font-bold flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-accent-gold" /> Payoff Efficiency Gauge:
              </span>
              <span className="font-bold text-accent-gold">{calcResults.impactLabel}</span>
            </div>

            <div className="h-4 bg-bg-void rounded-full overflow-hidden border border-border p-0.5 relative">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${calcResults.impactScore}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-amber-500 via-emerald-400 to-teal-300 rounded-full shadow-lg"
              />
            </div>

            <div className="flex justify-between text-[10px] text-text-muted">
              <span>Baseline (Min Payments)</span>
              <span>50% Faster</span>
              <span>Optimal Debt Clearance</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function DebtPayoff({ user }: DebtPayoffProps) {
  const currency = CURRENCIES[user.currency] || CURRENCIES.USD;

  // Preloaded sample debts for premium UX
  const [loans, setLoans] = useState<Loan[]>(() => {
    return [
      { id: "1", name: "Premium Visa Credit Card", balance: 4500, rate: 19.9, minPayment: 150 },
      { id: "2", name: "Apex Federal Student Loan", balance: 18000, rate: 5.5, minPayment: 250 },
      { id: "3", name: "Luxury Auto Financing", balance: 12500, rate: 7.2, minPayment: 320 }
    ];
  });

  // Controls for adding debts
  const [newLoanName, setNewLoanName] = useState("");
  const [newLoanBalance, setNewLoanBalance] = useState("");
  const [newLoanRate, setNewLoanRate] = useState("");
  const [newLoanMin, setNewLoanMin] = useState("");

  const [payoffMethod, setPayoffMethod] = useState<"AVALANCHE" | "SNOWBALL">("AVALANCHE");
  const [extraPayment, setExtraPayment] = useState(() => {
    return currency.avgSalary > 5000 ? 500 : 200;
  });

  const handleAddLoan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLoanName) return;
    const balance = parseFloat(newLoanBalance) || 0;
    const rate = parseFloat(newLoanRate) || 0;
    const minPayment = parseFloat(newLoanMin) || Math.round(balance * 0.03);

    if (balance <= 0) return;

    const newObj: Loan = {
      id: Math.random().toString(),
      name: newLoanName,
      balance,
      rate,
      minPayment
    };

    setLoans(prev => [...prev, newObj]);
    setNewLoanName("");
    setNewLoanBalance("");
    setNewLoanRate("");
    setNewLoanMin("");
  };

  const handleDeleteLoan = (id: string) => {
    setLoans(prev => prev.filter(l => l.id !== id));
  };

  // Perform Month-by-Month debt amortization simulations for Snowball and Avalanche
  const simulationResults = useMemo(() => {
    if (loans.length === 0) {
      return {
        snowball: { months: 0, interest: 0, timeline: [] },
        avalanche: { months: 0, interest: 0, timeline: [] },
        totalPrincipal: 0,
        monthlyMinimumCommitment: 0
      };
    }

    const totalPrincipal = loans.reduce((sum, l) => sum + l.balance, 0);
    const monthlyMinimumCommitment = loans.reduce((sum, l) => sum + l.minPayment, 0);

    // Amortize simulation routine
    const simulate = (method: "AVALANCHE" | "SNOWBALL", customExtra: number = extraPayment) => {
      // Deep copy active loans
      const activeLoans = loans.map(l => ({ ...l }));
      let totalInterestPaid = 0;
      let month = 0;
      const history: { month: number; totalRemainingBalance: number; interestAccumulated: number }[] = [];
      const MAX_MONTHS = 360; // 30 year safety boundary

      const sortedDebtsOrder = () => {
        if (method === "AVALANCHE") {
          // Highest interest rate first
          return [...activeLoans].sort((a, b) => b.rate - a.rate);
        } else {
          // Snowball: Lowest balance first
          return [...activeLoans].sort((a, b) => a.balance - b.balance);
        }
      };

      while (activeLoans.some(l => l.balance > 0) && month < MAX_MONTHS) {
        month++;
        const totalBudget = monthlyMinimumCommitment + customExtra;
        let pool = totalBudget;

        // Apply interest first and check minimum payments
        let currentMonthInterest = 0;
        for (const loan of activeLoans) {
          if (loan.balance > 0) {
            // monthly interest rate
            const monthlyRate = (loan.rate / 100) / 12;
            const interest = loan.balance * monthlyRate;
            loan.balance += interest;
            totalInterestPaid += interest;
            currentMonthInterest += interest;
          }
        }

        // 1. Pay minimums first (or remaining balance if less than minimum)
        for (const loan of activeLoans) {
          if (loan.balance > 0) {
            const minToPay = Math.min(loan.balance, loan.minPayment);
            loan.balance -= minToPay;
            pool -= minToPay;
          }
        }

        // 2. Allocate remaining surplus pool to target debt according to Snowball / Avalanche hierarchy
        if (pool > 0) {
          // Sort remaining active loans
          const priorityLoans = sortedDebtsOrder().filter(l => l.balance > 0);
          for (const targetLoan of priorityLoans) {
            if (pool <= 0) break;
            const originalLoanInRef = activeLoans.find(l => l.id === targetLoan.id);
            if (originalLoanInRef) {
              const extraToPay = Math.min(originalLoanInRef.balance, pool);
              originalLoanInRef.balance -= extraToPay;
              pool -= extraToPay;
            }
          }
        }

        const totalRemainingBalance = activeLoans.reduce((sum, l) => sum + l.balance, 0);
        history.push({
          month,
          totalRemainingBalance,
          interestAccumulated: totalInterestPaid
        });

        if (totalRemainingBalance <= 0) break;
      }

      return {
        months: month,
        interest: totalInterestPaid,
        timeline: history
      };
    };

    const baselineRes = simulate(payoffMethod, 0); // Minimum payments only
    const avalancheRes = simulate("AVALANCHE");
    const snowballRes = simulate("SNOWBALL");
    const activeAccelerated = payoffMethod === "AVALANCHE" ? avalancheRes : snowballRes;

    const accelerationInterestSaved = Math.max(0, baselineRes.interest - activeAccelerated.interest);
    const accelerationMonthsSaved = Math.max(0, baselineRes.months - activeAccelerated.months);

    return {
      totalPrincipal,
      monthlyMinimumCommitment,
      baseline: baselineRes,
      avalanche: avalancheRes,
      snowball: snowballRes,
      accelerationInterestSaved,
      accelerationMonthsSaved
    };
  }, [loans, extraPayment]);

  const savingsDelta = useMemo(() => {
    const interestSaved = Math.max(0, simulationResults.snowball.interest - simulationResults.avalanche.interest);
    const monthsSaved = Math.max(0, simulationResults.snowball.months - simulationResults.avalanche.months);
    return {
      interestSaved,
      monthsSaved
    };
  }, [simulationResults]);

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-6">
        <div>
          <span className="text-[10px] uppercase font-bold font-mono tracking-wider text-accent-gold">ACCELERATED LIABILITIES DISINTEGRATOR</span>
          <h1 className="text-3xl sm:text-4xl font-display font-black tracking-tight text-text-primary mt-1">
            Debt Snowball vs. Avalanche Router
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Compare payoff methodologies, inject extra surplus, and visualize interest metrics on your path to financial freedom.
          </p>
        </div>
        <div className="p-3 bg-accent-gold/10 border border-accent-gold/20 rounded-2xl text-accent-gold self-start md:self-auto">
          <Scale className="w-8 h-8" />
        </div>
      </div>

      {/* Quick Loan Payoff Mini-Calculator */}
      <QuickLoanPayoffCalculator 
        user={user} 
        currency={currency} 
        onApplyExtra={(amt) => setExtraPayment(amt)} 
      />

      {/* Dynamic Debt Visualization Component with Countdown & Chart */}
      <DebtPayoffVisualization 
        user={user} 
        loans={loans} 
        initialExtraPayment={extraPayment} 
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left column: input and list (Col-5) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="card p-6 space-y-6">
            <h3 className="text-md font-bold text-text-primary tracking-wide">
              Active Debt Ledger
            </h3>

            {/* List of current loans */}
            <div className="space-y-3">
              {loans.length === 0 ? (
                <div className="text-xs text-text-muted font-mono text-center py-6 bg-bg-void rounded-xl border border-border/30">
                  No registered liabilities. Insert below to initiate simulator.
                </div>
              ) : (
                <div className="space-y-2">
                  {loans.map(loan => (
                    <div 
                      key={loan.id}
                      className="p-3 bg-bg-secondary border border-border rounded-xl flex items-center justify-between text-xs"
                    >
                      <div className="space-y-1">
                        <div className="font-bold text-text-primary font-sans leading-none">{loan.name}</div>
                        <div className="font-mono text-[10px] text-text-muted flex gap-2">
                          <span>Bal: <strong className="text-text-secondary">{formatCurrency(loan.balance, user.currency, currency.locale)}</strong></span>
                          <span>•</span>
                          <span>APR: <strong className="text-accent-gold">{loan.rate}%</strong></span>
                          <span>•</span>
                          <span>Min: <strong className="text-text-secondary">{formatCurrency(loan.minPayment, user.currency, currency.locale)}</strong></span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteLoan(loan.id)}
                        className="p-1.5 rounded-lg hover:bg-red-500/10 text-text-muted hover:text-accent-red cursor-pointer transition-colors"
                        title="Delete Loan"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Add Loan Form */}
            <form onSubmit={handleAddLoan} className="space-y-4 pt-4 border-t border-border/40">
              <span className="text-[10px] font-mono font-bold text-text-muted uppercase tracking-wider block">Add Debt Instrument</span>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Loan description (e.g., student debt)"
                  value={newLoanName}
                  onChange={(e) => setNewLoanName(e.target.value)}
                  className="input-field w-full text-xs"
                  required
                />
                <div className="grid grid-cols-3 gap-2">
                  <div className="relative">
                    <input
                      type="number"
                      placeholder="Balance"
                      value={newLoanBalance}
                      onChange={(e) => setNewLoanBalance(e.target.value)}
                      className="input-field w-full pl-6 pr-2 text-xs"
                      required
                    />
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 font-mono text-[10px] text-text-muted">
                      {currency.symbol}
                    </span>
                  </div>

                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      placeholder="APR %"
                      value={newLoanRate}
                      onChange={(e) => setNewLoanRate(e.target.value)}
                      className="input-field w-full pr-6 pl-2 text-xs"
                      required
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 font-mono text-[10px] text-text-muted">
                      %
                    </span>
                  </div>

                  <div className="relative">
                    <input
                      type="number"
                      placeholder="Min Pay"
                      value={newLoanMin}
                      onChange={(e) => setNewLoanMin(e.target.value)}
                      className="input-field w-full pl-6 pr-2 text-xs"
                    />
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 font-mono text-[10px] text-text-muted">
                      {currency.symbol}
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-bg-void hover:bg-bg-void/40 border border-border text-text-primary text-[10px] font-black uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Append Debt Source
              </button>
            </form>
          </div>

          {/* Payoff Optimizations toggling */}
          <div className="card p-6 space-y-4">
            <h3 className="text-md font-bold text-text-primary tracking-wide">
              Acceleration Settings
            </h3>

            {/* Extra Monthly Payment Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-text-secondary font-sans font-medium">Extra Monthly Payment</span>
                <span className="text-accent-gold font-bold">{formatCurrency(extraPayment, user.currency, currency.locale)}</span>
              </div>
              <input
                type="range"
                min={0}
                max={2000}
                step={50}
                value={extraPayment}
                onChange={(e) => setExtraPayment(Number(e.target.value))}
                className="w-full accent-accent-gold cursor-pointer"
              />
              <div className="flex justify-between text-[9px] text-text-muted font-mono">
                <span>{formatCurrency(0, user.currency, currency.locale)} (Minimums only)</span>
                <span>{formatCurrency(2000, user.currency, currency.locale)} / mo</span>
              </div>
            </div>

            {/* Strategy Toggles */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPayoffMethod("AVALANCHE")}
                className={cn(
                  "py-2 px-3 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all border text-center cursor-pointer",
                  payoffMethod === "AVALANCHE"
                    ? "bg-accent-gold/10 border-accent-gold/40 text-accent-gold"
                    : "bg-bg-void border-border text-text-secondary hover:text-text-primary"
                )}
              >
                Avalanche Method
              </button>
              <button
                type="button"
                onClick={() => setPayoffMethod("SNOWBALL")}
                className={cn(
                  "py-2 px-3 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all border text-center cursor-pointer",
                  payoffMethod === "SNOWBALL"
                    ? "bg-accent-gold/10 border-accent-gold/40 text-accent-gold"
                    : "bg-bg-void border-border text-text-secondary hover:text-text-primary"
                )}
              >
                Snowball Method
              </button>
            </div>
          </div>
        </div>

        {/* Right column: statistics and models (Col-7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="card p-6 space-y-6">
            <h3 className="text-md font-bold text-text-primary tracking-wide">
              Clearance Timelines & Projections
            </h3>

            {/* Overview Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-bg-secondary border border-border">
                <span className="text-[9px] font-mono text-text-muted uppercase tracking-wider block">Total Outstanding</span>
                <div className="text-xl font-mono font-bold mt-1 text-text-primary">
                  {formatCurrency(simulationResults.totalPrincipal, user.currency, currency.locale)}
                </div>
                <span className="text-[10px] text-text-muted block mt-0.5">{loans.length} active loans</span>
              </div>

              <div className={cn("p-4 rounded-xl bg-bg-secondary border", payoffMethod === "AVALANCHE" ? "border-accent-gold/25" : "border-border")}>
                <span className="text-[9px] font-mono text-text-muted uppercase tracking-wider block">Avalanche Cleared</span>
                <div className="text-xl font-mono font-bold mt-1 text-accent-emerald">
                  {simulationResults.avalanche.months} Months
                </div>
                <span className="text-[10px] text-text-muted block mt-0.5">Interest: {formatCurrency(simulationResults.avalanche.interest, user.currency, currency.locale)}</span>
              </div>

              <div className={cn("p-4 rounded-xl bg-bg-secondary border", payoffMethod === "SNOWBALL" ? "border-accent-gold/25" : "border-border")}>
                <span className="text-[9px] font-mono text-text-muted uppercase tracking-wider block">Snowball Cleared</span>
                <div className="text-xl font-mono font-bold mt-1 text-accent-emerald">
                  {simulationResults.snowball.months} Months
                </div>
                <span className="text-[10px] text-text-muted block mt-0.5">Interest: {formatCurrency(simulationResults.snowball.interest, user.currency, currency.locale)}</span>
              </div>
            </div>

            {/* Debt Acceleration Impact Banner */}
            {extraPayment > 0 && (
              <div className="p-5 border border-amber-500/40 bg-gradient-to-r from-amber-500/10 via-zinc-950 to-amber-500/5 rounded-2xl space-y-3 font-mono">
                <div className="flex items-center justify-between pb-2 border-b border-border/40">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
                    <span className="font-bold text-text-primary text-sm font-display">Debt Acceleration Acceleration Savings</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-bg-void text-[10px] font-bold uppercase tracking-wider">
                    +{formatCurrency(extraPayment, user.currency, currency.locale)} / Month Injected
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1">
                  <div className="p-3 rounded-xl bg-bg-void/80 border border-border/40 space-y-1">
                    <span className="text-[10px] text-text-muted uppercase block">Total Interest Saved</span>
                    <span className="text-xl font-bold text-emerald-400 block">
                      {formatCurrency(simulationResults.accelerationInterestSaved, user.currency, currency.locale)}
                    </span>
                    <span className="text-[10px] text-text-secondary block font-sans">
                      Compared to making minimum payments only
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-bg-void/80 border border-border/40 space-y-1">
                    <span className="text-[10px] text-text-muted uppercase block">Time Saved to Debt-Free</span>
                    <span className="text-xl font-bold text-amber-400 block">
                      {simulationResults.accelerationMonthsSaved} Months Sooner
                    </span>
                    <span className="text-[10px] text-text-secondary block font-sans">
                      Clearance in {simulationResults[payoffMethod === 'AVALANCHE' ? 'avalanche' : 'snowball'].months} months instead of {simulationResults.baseline.months}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Highlighted Strategy Savings Delta */}
            {savingsDelta.interestSaved > 0 && (
              <div className="p-4 border border-accent-emerald/30 bg-accent-emerald/5 rounded-xl flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-accent-emerald shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <div className="font-bold text-text-primary">Avalanche Payoff Optimization Benefit</div>
                  <p className="text-text-secondary leading-relaxed">
                    By choosing the mathematically optimal **Avalanche Method**, you reduce total interest expenditures by <strong className="text-accent-emerald">{formatCurrency(savingsDelta.interestSaved, user.currency, currency.locale)}</strong> and shave off <strong className="text-text-primary">{savingsDelta.monthsSaved} month(s)</strong> of repayment time!
                  </p>
                </div>
              </div>
            )}

            {/* Net Worth Impact Model */}
            <div className="p-5 bg-bg-void border border-border/80 rounded-xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-text-primary font-display">Net Worth Compound Elevation Chart</h4>
                  <span className="text-[9px] text-text-muted font-mono uppercase tracking-wider">CLEARANCE OF LIABILITY SLICES</span>
                </div>
                <TrendingUp className="w-5 h-5 text-accent-gold" />
              </div>

              {/* Graphical simulation of net worth elevation as debts drop */}
              <div className="space-y-3 pt-2">
                <div className="text-xs text-text-secondary flex justify-between font-mono">
                  <span>Start (Net Worth Dragged by Debt)</span>
                  <span>Fully Debt-Free</span>
                </div>

                <div className="h-20 bg-bg-secondary border border-border/40 rounded-xl p-3 flex items-end gap-1 overflow-hidden relative select-none">
                  {/* Backdrop label */}
                  <div className="absolute inset-0 flex items-center justify-center text-[10px] text-text-muted font-mono tracking-wider font-semibold opacity-30 select-none pointer-events-none">
                    NET WORTH ACCELERATOR SLOPE
                  </div>

                  {loans.length > 0 && Array.from({ length: 24 }).map((_, i) => {
                    // Simulate progressive elevation
                    const ratio = i / 23;
                    // Exponential wealth curve once liability pool decays
                    const debtComp = Math.max(0, 100 - (ratio * 100));
                    const assetComp = Math.pow(ratio, 1.8) * 90;
                    const computedHeight = 15 + (assetComp * 0.8) + ((100 - debtComp) * 0.15);

                    return (
                      <div 
                        key={i}
                        className="flex-1 rounded-t-sm transition-all duration-300 pointer-events-hover group relative"
                        style={{ 
                          height: `${Math.min(100, Math.max(10, computedHeight))}%`,
                          backgroundColor: i === 23 ? "var(--color-accent-gold)" : i > 12 ? "var(--color-accent-emerald)" : "rgba(255, 255, 255, 0.15)"
                        }}
                      >
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block bg-bg-void border border-border px-1.5 py-0.5 rounded text-[8px] font-mono text-text-primary whitespace-nowrap z-25">
                          NW Slope: +{computedHeight.toFixed(0)}%
                        </div>
                      </div>
                    );
                  })}
                </div>

                <p className="text-[10px] text-text-muted pl-1">
                  💡 Every dollar of liability extinguished represents an instantaneous 1:1 risk-free increase in your permanent Net Worth ledger. Once debt amortizes to zero, your previous debt-servicing budget compounds directly inside interest yield portfolios!
                </p>
              </div>
            </div>

            {/* Informational tip */}
            <div className="flex items-start gap-2 text-[10px] text-text-muted p-3 bg-bg-void/50 border border-border/40 rounded-lg font-sans">
              <Info className="w-4 h-4 text-accent-gold shrink-0 mt-0.5" />
              <span>
                <strong>Methodology details:</strong> Snowball allocates extra surplus to the smallest balance, creating rapid positive feedback psychology loops. Avalanche tackles the highest interest rate first, yielding optimal interest savings. We recommend launching Avalanche for financial precision, but switching to Snowball if immediate motivational tracking is required.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
