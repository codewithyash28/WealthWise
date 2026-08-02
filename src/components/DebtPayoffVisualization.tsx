import { useState, useMemo, useEffect } from "react";
import { motion } from "motion/react";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend 
} from "recharts";
import { 
  Flame, 
  Sparkles, 
  TrendingUp, 
  Clock, 
  Zap, 
  ShieldCheck, 
  CheckCircle2, 
  DollarSign, 
  Scale, 
  Info, 
  Calculator,
  Calendar,
  Timer,
  Download
} from "lucide-react";
import { jsPDF } from "jspdf";
import { formatCurrency, cn } from "../lib/utils";
import { CURRENCIES } from "../constants";
import { UserProfile } from "../types";

interface DebtPayoffVisualizationProps {
  user: UserProfile;
  initialBalance?: number;
  initialRate?: number;
  initialMinPayment?: number;
  initialExtraPayment?: number;
  loans?: Array<{ id: string; name: string; balance: number; rate: number; minPayment: number }>;
}

export function DebtPayoffVisualization({
  user,
  initialBalance = 35000,
  initialRate = 12.5,
  initialMinPayment = 720,
  initialExtraPayment = 300,
  loans
}: DebtPayoffVisualizationProps) {
  const currency = CURRENCIES[user.currency] || CURRENCIES.USD;

  const [extraPayment, setExtraPayment] = useState(initialExtraPayment);
  const [payoffStrategy, setPayoffStrategy] = useState<"AVALANCHE" | "SNOWBALL">("AVALANCHE");

  // Calculate active loans or single loan aggregate
  const activeLoansList = useMemo(() => {
    if (loans && loans.length > 0) return loans;
    return [
      { id: "1", name: "Credit Card Liability", balance: 8500, rate: 19.5, minPayment: 220 },
      { id: "2", name: "Student Education Loan", balance: 16500, rate: 5.8, minPayment: 250 },
      { id: "3", name: "Auto Loan", balance: 10000, rate: 7.2, minPayment: 250 }
    ];
  }, [loans]);

  // Compute month-by-month trajectory for baseline vs accelerated
  const simulationData = useMemo(() => {
    const totalPrincipal = activeLoansList.reduce((sum, l) => sum + l.balance, 0);
    const totalMinPayment = activeLoansList.reduce((sum, l) => sum + l.minPayment, 0);

    const runSimulation = (extra: number, strategy: "AVALANCHE" | "SNOWBALL") => {
      const active = activeLoansList.map(l => ({ ...l }));
      let totalInterest = 0;
      let month = 0;
      const history: Array<{ month: number; yearLabel: string; remainingBalance: number; interestAccumulated: number }> = [];

      const sortLoans = () => {
        if (strategy === "AVALANCHE") {
          return [...active].sort((a, b) => b.rate - a.rate);
        }
        return [...active].sort((a, b) => a.balance - b.balance);
      };

      const startDate = new Date();

      while (active.some(l => l.balance > 0) && month < 360) {
        month++;
        let pool = totalMinPayment + extra;

        // Apply monthly interest
        for (const loan of active) {
          if (loan.balance > 0) {
            const mRate = (loan.rate / 100) / 12;
            const interest = loan.balance * mRate;
            loan.balance += interest;
            totalInterest += interest;
          }
        }

        // Minimum payments first
        for (const loan of active) {
          if (loan.balance > 0) {
            const pay = Math.min(loan.balance, loan.minPayment);
            loan.balance -= pay;
            pool -= pay;
          }
        }

        // Extra pool to priority debt
        if (pool > 0) {
          const priorityList = sortLoans().filter(l => l.balance > 0);
          for (const target of priorityList) {
            if (pool <= 0) break;
            const original = active.find(l => l.id === target.id);
            if (original) {
              const extraPay = Math.min(original.balance, pool);
              original.balance -= extraPay;
              pool -= extraPay;
            }
          }
        }

        const remainingBalance = Math.max(0, active.reduce((sum, l) => sum + l.balance, 0));
        const curDate = new Date(startDate.getFullYear(), startDate.getMonth() + month, 1);
        const yearLabel = `M${month} (${curDate.toLocaleDateString('default', { month: 'short', year: '2-digit' })})`;

        history.push({
          month,
          yearLabel,
          remainingBalance: Math.round(remainingBalance),
          interestAccumulated: Math.round(totalInterest)
        });

        if (remainingBalance <= 0) break;
      }

      return {
        months: month,
        totalInterest: Math.round(totalInterest),
        history
      };
    };

    const baseline = runSimulation(0, payoffStrategy);
    const accelerated = runSimulation(extraPayment, payoffStrategy);

    // Merge baseline and accelerated history for recharts area chart
    const maxMonths = Math.max(baseline.months, accelerated.months);
    const chartPoints = [];

    const startDate = new Date();

    for (let m = 0; m <= maxMonths; m += Math.max(1, Math.floor(maxMonths / 24))) {
      const curDate = new Date(startDate.getFullYear(), startDate.getMonth() + m, 1);
      const label = m === 0 ? "Now" : `M${m} (${curDate.toLocaleDateString('default', { month: 'short', year: '2-digit' })})`;

      const basePoint = baseline.history.find(h => h.month === m) || (m > baseline.months ? { remainingBalance: 0 } : baseline.history[baseline.history.length - 1]);
      const accelPoint = accelerated.history.find(h => h.month === m) || (m > accelerated.months ? { remainingBalance: 0 } : accelerated.history[accelerated.history.length - 1]);

      chartPoints.push({
        month: m,
        label,
        BaselineBalance: basePoint ? basePoint.remainingBalance : 0,
        AcceleratedBalance: accelPoint ? accelPoint.remainingBalance : 0
      });
    }

    const interestSaved = Math.max(0, baseline.totalInterest - accelerated.totalInterest);
    const monthsSaved = Math.max(0, baseline.months - accelerated.months);

    // Calculate Target Debt-Free Date
    const debtFreeDate = new Date();
    debtFreeDate.setMonth(debtFreeDate.getMonth() + accelerated.months);

    return {
      totalPrincipal,
      totalMinPayment,
      baseline,
      accelerated,
      chartPoints,
      interestSaved,
      monthsSaved,
      debtFreeDate
    };
  }, [activeLoansList, extraPayment, payoffStrategy]);

  // Live countdown timer state to Debt-Free Date
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const updateCountdown = () => {
      const targetTime = simulationData.debtFreeDate.getTime();
      const now = new Date().getTime();
      const difference = Math.max(0, targetTime - now);

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [simulationData.debtFreeDate]);

  const handleExportDebtPDF = () => {
    try {
      const doc = new jsPDF();
      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, 210, 36, "F");

      doc.setTextColor(240, 180, 41);
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text("WEALTHWISE ELITE — DEBT FREEDOM & AMORTIZATION REPORT", 14, 18);

      doc.setFontSize(9);
      doc.setTextColor(148, 163, 184);
      doc.setFont("helvetica", "normal");
      doc.text(`Strategy: ${payoffStrategy} | Accelerated Monthly Extra: $${extraPayment} | Client: ${user.name}`, 14, 26);

      doc.setTextColor(30, 41, 59);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("1. DEBT-FREE TIMELINE & INTEREST SAVINGS SUMMARY", 14, 46);

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Estimated Debt Freedom Date: ${simulationData.debtFreeDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}`, 14, 54);
      doc.text(`Accelerated Payoff Duration: ${simulationData.accelerated.months} Months`, 14, 61);
      doc.text(`Months Saved vs Baseline: ${simulationData.monthsSaved} Months Sooner`, 14, 68);
      doc.text(`Total Interest Saved: $${simulationData.interestSaved.toLocaleString()}`, 14, 75);

      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("2. ACTIVE LIABILITIES BREAKDOWN", 14, 88);

      let y = 96;
      activeLoansList.forEach(l => {
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.text(`${l.name}: Balance $${l.balance.toLocaleString()} | Interest Rate: ${l.rate}% | Min Pay: $${l.minPayment}/mo`, 14, y);
        y += 7;
      });

      doc.save(`${user.name.replace(/\s+/g, "_")}_Debt_Freedom_Report.pdf`);

      window.dispatchEvent(new CustomEvent("ww-trigger-alert", {
        detail: {
          type: "success",
          title: "Debt Report PDF Generated! 📄",
          message: "Downloaded printable Debt Freedom & Amortization Report."
        }
      }));
    } catch (err) {
      console.error("Debt PDF Export Error:", err);
    }
  };

  // Progress ring calculation (assume total liabilities vs paid off)
  const totalPrincipal = activeLoansList.reduce((sum, l) => sum + l.balance, 0);
  const baselineMonths = simulationData.baseline.months;
  const currentAcceleratedMonths = simulationData.accelerated.months;
  const payoffProgressPct = Math.min(100, Math.max(10, Math.round(((baselineMonths - currentAcceleratedMonths) / baselineMonths) * 100) + 35));

  return (
    <div className="card p-6 border-accent-gold/40 bg-bg-secondary/90 space-y-6 shadow-2xl relative overflow-hidden font-sans">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border/60">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-accent-gold/20 text-accent-gold border border-accent-gold/30 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-300" /> Dynamic Debt Visualization Engine
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-bold uppercase">
              Real-Time Projection
            </span>
          </div>
          <h3 className="text-xl font-extrabold font-display text-text-primary tracking-tight mt-1">
            Debt-Free Countdown & Interest Savings Projection
          </h3>
          <p className="text-xs text-text-secondary mt-0.5">
            Visualize total liability decay trajectory and track your exact debt-free countdown timestamp.
          </p>
        </div>

        {/* Strategy Toggles & PDF Export Button */}
        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          <button
            type="button"
            onClick={handleExportDebtPDF}
            className="px-3 py-1.5 rounded-xl bg-accent-gold/20 hover:bg-accent-gold/30 border border-accent-gold/40 text-accent-gold text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
            title="Generate printable PDF report of debt payoff trajectory"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export PDF</span>
          </button>

          <button
            type="button"
            onClick={() => setPayoffStrategy("AVALANCHE")}
            className={cn(
              "px-3 py-1.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all border cursor-pointer",
              payoffStrategy === "AVALANCHE"
                ? "bg-accent-gold text-slate-950 border-accent-gold shadow-md"
                : "bg-bg-void border-border text-text-muted hover:text-text-primary"
            )}
          >
            Avalanche
          </button>
          <button
            type="button"
            onClick={() => setPayoffStrategy("SNOWBALL")}
            className={cn(
              "px-3 py-1.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all border cursor-pointer",
              payoffStrategy === "SNOWBALL"
                ? "bg-accent-gold text-slate-950 border-accent-gold shadow-md"
                : "bg-bg-void border-border text-text-muted hover:text-text-primary"
            )}
          >
            Snowball
          </button>
        </div>
      </div>

      {/* Countdown & Dynamic SVG Progress Ring Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Countdown Banner */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-zinc-950 to-emerald-900/60 border-2 border-emerald-500/50 shadow-2xl relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
            <div className="space-y-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 text-emerald-400 font-mono text-xs font-bold uppercase tracking-wider">
                <Timer className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span>Target Debt-Free Countdown</span>
              </div>

              <div className="text-2xl sm:text-3xl font-extrabold font-display text-text-primary">
                Estimated Freedom:{" "}
                <span className="text-emerald-300">
                  {simulationData.debtFreeDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                </span>
              </div>

              <p className="text-xs text-text-secondary">
                Based on {formatCurrency(simulationData.totalMinPayment + extraPayment, user.currency, currency.locale)} / mo total payment commitment.
              </p>
            </div>

            {/* Live Clock Digital Display */}
            <div className="grid grid-cols-4 gap-2 sm:gap-3 text-center shrink-0">
              <div className="p-3 bg-bg-void/90 border border-emerald-500/40 rounded-xl min-w-[60px]">
                <div className="text-xl font-black font-mono text-emerald-400">{timeLeft.days}</div>
                <div className="text-[8px] font-mono text-text-muted uppercase font-bold">Days</div>
              </div>
              <div className="p-3 bg-bg-void/90 border border-emerald-500/40 rounded-xl min-w-[60px]">
                <div className="text-xl font-black font-mono text-emerald-300">{timeLeft.hours}</div>
                <div className="text-[8px] font-mono text-text-muted uppercase font-bold">Hours</div>
              </div>
              <div className="p-3 bg-bg-void/90 border border-emerald-500/40 rounded-xl min-w-[60px]">
                <div className="text-xl font-black font-mono text-emerald-300">{timeLeft.minutes}</div>
                <div className="text-[8px] font-mono text-text-muted uppercase font-bold">Mins</div>
              </div>
              <div className="p-3 bg-bg-void/90 border border-emerald-500/40 rounded-xl min-w-[60px]">
                <div className="text-xl font-black font-mono text-amber-300">{timeLeft.seconds}</div>
                <div className="text-[8px] font-mono text-text-muted uppercase font-bold">Secs</div>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Circular SVG Progress Ring Widget */}
        <div className="p-6 rounded-2xl bg-bg-void border border-emerald-500/40 flex flex-col items-center justify-center text-center space-y-3 shadow-xl relative">
          <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Dynamic Freedom Progress
          </span>

          <div className="relative w-32 h-32 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              {/* Background ring */}
              <circle
                cx="50"
                cy="50"
                r="40"
                className="stroke-slate-800"
                strokeWidth="10"
                fill="transparent"
              />
              {/* Animated Progress ring */}
              <circle
                cx="50"
                cy="50"
                r="40"
                className="stroke-emerald-400 transition-all duration-1000 ease-out"
                strokeWidth="10"
                strokeDasharray={251.2}
                strokeDashoffset={251.2 - (251.2 * payoffProgressPct) / 100}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-black font-mono text-emerald-300">{payoffProgressPct}%</span>
              <span className="text-[8px] font-mono text-text-muted uppercase font-bold">Debt Free</span>
            </div>
          </div>

          <p className="text-[10px] font-mono text-text-muted">
            Remaining Principal: <span className="text-accent-gold font-bold">{formatCurrency(totalPrincipal, user.currency, currency.locale)}</span>
          </p>
        </div>
      </div>

      {/* Extra Monthly Payment Slider Control */}
      <div className="p-4 bg-bg-void border border-border/80 rounded-2xl space-y-3">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-text-primary font-bold flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-amber-400" /> Extra Monthly Debt Ingress:
          </span>
          <span className="text-accent-gold font-extrabold text-sm">
            +{formatCurrency(extraPayment, user.currency, currency.locale)} / mo
          </span>
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

        <div className="flex justify-between text-[10px] text-text-muted font-mono">
          <span>{formatCurrency(0, user.currency, currency.locale)} (Minimums Only)</span>
          <span>+{formatCurrency(1000, user.currency, currency.locale)}</span>
          <span>+{formatCurrency(2000, user.currency, currency.locale)} / mo</span>
        </div>
      </div>

      {/* Amortization Decay Chart */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold font-display text-text-primary flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-accent-gold" /> Total Outstanding Debt Balance Decay Trajectory
          </h4>
          <span className="text-[10px] font-mono text-text-muted">
            Minimum Pay vs. Accelerated (+{formatCurrency(extraPayment, user.currency, currency.locale)}/mo)
          </span>
        </div>

        <div className="h-72 w-full bg-bg-void/80 border border-border/80 rounded-2xl p-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={simulationData.chartPoints} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="baselineColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="accelColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.5} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
              <XAxis dataKey="label" stroke="#94a3b8" fontSize={10} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} tickFormatter={(v) => `$${v}`} />
              <Tooltip
                contentStyle={{ backgroundColor: "#0f172a", borderColor: "rgba(255,255,255,0.2)", borderRadius: "12px" }}
                formatter={(val: any) => [formatCurrency(Number(val) || 0, user.currency, currency.locale), "Balance"]}
              />
              <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }} />
              <Area
                type="monotone"
                dataKey="BaselineBalance"
                name="Baseline (Minimums Only)"
                stroke="#ef4444"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#baselineColor)"
              />
              <Area
                type="monotone"
                dataKey="AcceleratedBalance"
                name="Accelerated Trajectory"
                stroke="#10b981"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#accelColor)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Impact Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-bg-void border border-border/80 space-y-1">
          <span className="text-[10px] font-mono text-text-muted uppercase font-bold">Total Interest Saved</span>
          <div className="text-2xl font-extrabold font-mono text-emerald-400">
            {formatCurrency(simulationData.interestSaved, user.currency, currency.locale)}
          </div>
          <span className="text-[11px] text-text-secondary">Direct cash stay in your pocket</span>
        </div>

        <div className="p-4 rounded-2xl bg-bg-void border border-border/80 space-y-1">
          <span className="text-[10px] font-mono text-text-muted uppercase font-bold">Time Saved to Freedom</span>
          <div className="text-2xl font-extrabold font-mono text-amber-300">
            {simulationData.monthsSaved} Months Sooner
          </div>
          <span className="text-[11px] text-text-secondary">Shaved off baseline timeline</span>
        </div>

        <div className="p-4 rounded-2xl bg-bg-void border border-border/80 space-y-1">
          <span className="text-[10px] font-mono text-text-muted uppercase font-bold">Accelerated Duration</span>
          <div className="text-2xl font-extrabold font-mono text-text-primary">
            {simulationData.accelerated.months} Months
          </div>
          <span className="text-[11px] text-text-secondary">Until zero debt balance</span>
        </div>
      </div>
    </div>
  );
}
