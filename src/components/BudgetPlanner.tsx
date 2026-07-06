import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { PieChart, Home, Utensils, Car, HeartPulse, Gamepad2, GraduationCap, CreditCard, Package, Save, RotateCcw, Copy, ChevronRight, AlertTriangle, CheckCircle2, TrendingUp, Download, Target, BarChart3, LineChart, Trash2, ShieldAlert, Terminal, FileCode, Check, ExternalLink, Activity, Sparkles } from "lucide-react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title } from 'chart.js';
import { Doughnut, Bar, Line } from 'react-chartjs-2';
import { formatCurrency, cn } from "../lib/utils";
import { CURRENCIES } from "../constants";
import { UserProfile, BudgetPlan } from "../types";
import { ConfirmationDialog } from "./ConfirmationDialog";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title);

interface BudgetPlannerProps {
  user: UserProfile;
  onSave: (plan: BudgetPlan) => void;
  initialPlan: BudgetPlan | null;
  gitProvider?: "gitlab" | "github" | "bitbucket";
  onUnlockAchievement?: (id: string) => void;
}

export function BudgetPlanner({ user, onSave, initialPlan, gitProvider = "gitlab", onUnlockAchievement }: BudgetPlannerProps) {
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  // Support state for backing up original un-crunch planning configuration
  const [originalIncome, setOriginalIncome] = useState(initialPlan?.income || 6500);
  const [originalExpenses, setOriginalExpenses] = useState(initialPlan?.expenses || {
    housing: 2000,
    food: 800,
    transport: 400,
    health: 200,
    entertainment: 600,
    education: 100,
    loans: 500,
    other: 400,
  });

  const [income, setIncome] = useState(initialPlan?.income || 6500);
  const [expenses, setExpenses] = useState(initialPlan?.expenses || {
    housing: 2000,
    food: 800,
    transport: 400,
    health: 200,
    entertainment: 600,
    education: 100,
    loans: 500,
    other: 400,
  });

  // Emergency Medical Crunch States
  const [crunchActive, setCrunchActive] = useState(false);
  const [crunchMitigated, setCrunchMitigated] = useState(false);
  const [syncStatus, setSyncStatus] = useState<"idle" | "running" | "completed">("idle");
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const [showIssueDetail, setShowIssueDetail] = useState(false);

  const [goals, setGoals] = useState(initialPlan?.goals || {
    housing: 2200,
    food: 1000,
    transport: 500,
    health: 300,
    entertainment: 800,
    education: 200,
    loans: 600,
    other: 500,
  });

  const currency = CURRENCIES[user.currency] || CURRENCIES.USD;

  // Mock historical data if not present
  const history = useMemo(() => {
    if (initialPlan?.history && initialPlan.history.length > 0) return initialPlan.history;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonthIndex = new Date().getMonth();
    // Only return data up to current month if it's a new user
    return months.slice(0, currentMonthIndex + 1).map((m, i) => ({
      month: m,
      total: (initialPlan?.income || 0) > 0 ? (initialPlan?.income || 0) * 0.7 + (Math.random() * 500 - 250) : 0
    }));
  }, [initialPlan]);

  const totalExpenses = Object.values(expenses).reduce((a, b) => a + b, 0);
  const savings = Math.max(0, income - totalExpenses);
  const savingsRate = income > 0 ? Math.round((savings / income) * 100) : 0;

  const needs = expenses.housing + expenses.food + expenses.transport + expenses.health + expenses.loans;
  const wants = expenses.entertainment + expenses.other;
  const needsPercent = income > 0 ? Math.round((needs / income) * 100) : 0;
  const wantsPercent = income > 0 ? Math.round((wants / income) * 100) : 0;

  const chartData = {
    labels: ['Housing', 'Food', 'Transport', 'Health', 'Entertainment', 'Education', 'Loans', 'Other'],
    datasets: [{
      data: Object.values(expenses),
      backgroundColor: [
        '#F0B429', '#10D9A0', '#3B82F6', '#EF4444', '#7C3AED', '#F97316', '#475569', '#94A3B8'
      ],
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
          label: (context: any) => {
            const label = context.label || '';
            const value = context.raw || 0;
            const percent = income > 0 ? Math.round((value / income) * 100) : 0;
            return `${label}: ${formatCurrency(value, user.currency, currency.locale)} (${percent}%)`;
          }
        }
      }
    },
    cutout: '70%',
  };

  const insights = useMemo(() => {
    const list = [];
    if (income === 0) return [];

    // Basic Savings Rate Insights
    if (savingsRate < 10) {
      const highest = Object.entries(expenses).reduce((a, b) => a[1] > b[1] ? a : b);
      list.push({
        type: "danger",
        icon: <AlertTriangle className="w-5 h-5" />,
        text: `Critical: You're saving less than 10%. Try reducing ${highest[0]} to boost your savings rate.`
      });
    } else if (savingsRate < 20) {
      list.push({
        type: "warning",
        icon: <TrendingUp className="w-5 h-5" />,
        text: `Good start! Increase savings by ${formatCurrency(income * 0.2 - savings, user.currency, currency.locale)} to hit the recommended 20% rate.`
      });
    } else {
      list.push({
        type: "success",
        icon: <CheckCircle2 className="w-5 h-5" />,
        text: `Excellent! You're saving ${savingsRate}% — above the 20% benchmark. Consider investing your surplus.`
      });
    }

    // Currency/Local Average Comparison Insights
    if (expenses.housing > currency.avgRent) {
      list.push({
        type: "warning",
        icon: <Home className="w-5 h-5" />,
        text: `Your housing cost is higher than the local average of ${formatCurrency(currency.avgRent, user.currency, currency.locale)}. Consider downsizing or finding a roommate.`
      });
    }

    if (expenses.food > currency.avgFood) {
      list.push({
        type: "warning",
        icon: <Utensils className="w-5 h-5" />,
        text: `Food spending is above average (${formatCurrency(currency.avgFood, user.currency, currency.locale)}). Meal prepping could save you significantly.`
      });
    }

    // Category Specific Insights
    if (expenses.housing / income > 0.35) {
      list.push({
        type: "warning",
        icon: <Home className="w-5 h-5" />,
        text: `Housing takes ${Math.round((expenses.housing / income) * 100)}% of your income — above the ideal 35%.`
      });
    }

    if (expenses.loans === 0) {
      list.push({
        type: "success",
        icon: <CheckCircle2 className="w-5 h-5" />,
        text: "Debt-free! This gives you maximum flexibility to invest."
      });
    } else if (expenses.loans / income > 0.15) {
      list.push({
        type: "danger",
        icon: <CreditCard className="w-5 h-5" />,
        text: `High Debt: Loans take ${Math.round((expenses.loans / income) * 100)}% of income. Focus on debt snowball/avalanche.`
      });
    }

    // Goal Comparison Insights
    Object.entries(expenses).forEach(([key, value]) => {
      const goal = (goals as any)[key];
      if (goal > 0 && value > goal) {
        list.push({
          type: "danger",
          icon: <Target className="w-5 h-5" />,
          text: `Over Goal: You spent ${formatCurrency(value - goal, user.currency, currency.locale)} more than your ${key} limit.`
        });
      }
    });

    return list;
  }, [income, expenses, savings, savingsRate, user.currency, currency.locale, currency.avgRent, currency.avgFood, goals]);

  const exportToCSV = () => {
    const rows = [
      ["Category", "Amount", "Goal"],
      ["Income", income, ""],
      ...Object.entries(expenses).map(([key, value]) => [key, value, (goals as any)[key] || 0]),
      ["Total Expenses", totalExpenses, ""],
      ["Savings", savings, ""]
    ];

    const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `budget_plan_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSave = () => {
    onSave({
      income,
      expenses,
      goals,
      transactions,
      history,
      timestamp: new Date().toISOString()
    });
  };

  const [transactions, setTransactions] = useState(initialPlan?.transactions || []);

  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnectBank = () => {
    setIsConnecting(true);
    setTimeout(() => {
      setIsConnecting(false);
      // Auto-categorize simulation
      const newTransactions = [
        { id: Date.now(), date: new Date().toISOString().split('T')[0], description: "Apple Store", amount: 1299.00, category: "entertainment" },
        { id: Date.now() + 1, date: new Date().toISOString().split('T')[0], description: "Starbucks", amount: 5.50, category: "food" },
        { id: Date.now() + 2, date: new Date().toISOString().split('T')[0], description: "Shell Oil", amount: 60.00, category: "transport" },
      ];
      setTransactions(prev => [...newTransactions, ...prev]);
      // Removed alert for iframe compatibility
    }, 2000);
  };

  const updateTransactionCategory = (id: number, category: string) => {
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, category } : t));
  };

  const deleteTransaction = (id: number) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const handleSimulateCrunch = () => {
    // Save original parameters for recovery/reset if they want to undo
    setOriginalIncome(income || 6500);
    setOriginalExpenses({ ...expenses });
    
    // Animate income down by 30%
    setIncome(prev => Math.round(prev * 0.7));
    
    // Increase medical/health spending by $1500
    setExpenses(prev => ({
      ...prev,
      health: prev.health + 1500
    }));
    
    // Prepend a high priority diagnostic ledger transaction
    const medicalTx = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      description: "Apex Royal Diagnostic & Health Hospitalization - UNEXPECTED OVERHEAD",
      amount: 1500,
      category: "health"
    };
    setTransactions(prev => [medicalTx, ...prev]);
    
    setCrunchActive(true);
    setCrunchMitigated(false);
    setSyncStatus("idle");
    setTerminalLogs([]);
    setShowIssueDetail(false);
  };

  const handleResetCrunch = () => {
    setIncome(originalIncome);
    setExpenses(originalExpenses);
    setCrunchActive(false);
    setCrunchMitigated(false);
    setSyncStatus("idle");
    setTerminalLogs([]);
    setShowIssueDetail(false);
  };

  const handleCalibrateRunway = () => {
    // Scale variable categories to rescue runway
    setExpenses(prev => ({
      ...prev,
      entertainment: Math.round(prev.entertainment * 0.3), // -70% drop
      other: Math.round(prev.other * 0.4),                // -60% drop
      food: Math.round(prev.food * 0.8),                  // -20% drop
      transport: Math.round(prev.transport * 0.85)        // -15% drop
    }));
    
    // Restructure spending targets
    setGoals(prev => ({
      ...prev,
      entertainment: 150,
      other: 150,
      food: 600,
      transport: 350
    }));
    
    setCrunchMitigated(true);
  };

  const handleDispatchGitlabIssue = async () => {
    if (syncStatus === "running") return;
    setSyncStatus("running");
    setTerminalLogs([]);
    
    const logsToStream = [
      "[Thinking] Analyzing budget footprint deviations...",
      `[Thinking] Detected unexpected health overhead. Processing 30% reduction in disposable assets.`,
      `[Thinking] Formulating optimized risk thresholds and asset runway rules...`,
      `[Tool Call] create_issue(title: "CRITICAL: Unexpected Medical Cash Crunch & Runway Calibration")`,
      `[GitLab MCP] Dispatching markdown issue payload with 5-part pedagogy schema...`,
      `[GitHub/GitLab MCP] Syncing persistent snapshots in database collection "portfolio_snapshots"...`,
      `[GitLab Sync] Writing target threshold gates to "wealth-policies/budget-laws.json"...`,
      `[SUCCESS] GitLab Issue #214 successfully tracked with OPEN state. CI/CD verified.`,
    ];
    
    for (let i = 0; i < logsToStream.length; i++) {
      await new Promise(resolve => setTimeout(resolve, i === 0 ? 100 : 350));
      setTerminalLogs(prev => [...prev, logsToStream[i]]);
    }
    
    setSyncStatus("completed");
    setShowIssueDetail(true);
    
    // Inject log into general GitOps sync list
    try {
      const storedHistory = localStorage.getItem("ww_gitops_history");
      const historyList = storedHistory ? JSON.parse(storedHistory) : [];
      const newLog = {
        id: Math.random().toString(36).substring(2, 9),
        timestamp: new Date().toISOString(),
        provider: gitProvider,
        action: "Deploy Compliance Incident",
        status: "success",
        branch: "incidents/medical-crunch",
        resourceId: `Ticket: #119`,
        description: "Emergency runway calibration for 30% medical disposable income reduction."
      };
      localStorage.setItem("ww_gitops_history", JSON.stringify([newLog, ...historyList].slice(0, 5)));
    } catch (e) {
      console.error(e);
    }
    
    if (onUnlockAchievement) {
      onUnlockAchievement("git_master");
    }
  };

  return (
    <div className="container mx-auto px-6 py-12 space-y-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-4xl font-display font-bold">Budget Architect</h1>
          <p className="text-text-secondary">Analyze your expenditures and optimize your financial strategy</p>
        </div>
        <button 
          onClick={handleConnectBank}
          disabled={isConnecting}
          className="btn-primary flex items-center gap-2"
        >
          {isConnecting ? <RotateCcw className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
          {isConnecting ? "Synchronizing..." : "Synchronize Accounts"}
        </button>
      </div>

      {/* Strategic Emergency Incident & GitLab Auditing Console */}
      <div className="card p-6 border-accent-gold/20 bg-gradient-to-r from-bg-secondary via-zinc-950 to-bg-secondary shadow-xl overflow-hidden relative space-y-6">
        {/* Subtle glowing lines in the background */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent-gold/5 rounded-full blur-[80px] pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-border/40">
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-2.5 rounded-xl border shrink-0",
              crunchActive 
                ? "bg-accent-red/10 border-accent-red/30 text-accent-red" 
                : "bg-accent-gold/10 border-accent-gold/30 text-accent-gold"
            )}>
              <ShieldAlert className="w-6 h-6 shrink-0" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-text-muted">GITOPS SYSTEM SECURITY POLICY</span>
                <span className={cn(
                  "px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest border font-mono",
                  !crunchActive 
                    ? "bg-emerald-500/10 border-emerald-500/20 text-accent-emerald" 
                    : !crunchMitigated 
                      ? "bg-red-500/10 border-red-500/20 text-accent-red animate-pulse" 
                      : "bg-amber-500/10 border-amber-500/25 text-accent-gold"
                )}>
                  {!crunchActive ? "● SECURE" : !crunchMitigated ? "● EMERGENCY ACTIVE (UNMITIGATED)" : "● CALIBRATED & SYNCED"}
                </span>
              </div>
              <h2 className="text-xl font-bold tracking-tight text-text-primary font-display mt-0.5">
                {!crunchActive 
                  ? "Emergency Incident Console" 
                  : "CRITICAL: Unexpected Medical Cash Crunch Detected (-30% Shock)"
                }
              </h2>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {!crunchActive ? (
              <button
                type="button"
                onClick={handleSimulateCrunch}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-accent-red/10 hover:bg-accent-red/20 border border-accent-red/30 text-accent-red hover:border-accent-red/60 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Activity className="w-3.5 h-3.5" /> Simulate Cash Crunch
              </button>
            ) : (
              <button
                type="button"
                onClick={handleResetCrunch}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-805 hover:bg-zinc-700 border border-border text-text-primary transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset Parameters
              </button>
            )}
          </div>
        </div>

        {/* Content body based on simulation state */}
        {!crunchActive ? (
          <p className="text-sm text-text-secondary max-w-2xl leading-relaxed">
            Unexpected lifestyle disruptions (e.g., healthcare emergencies, inflation spikes) can instantly impact your savings rate and structural capital runway. Use the simulation tool to inject a <strong>-30% disposable income drop</strong> shock, auto-calibrate spending limits, and file a tracked issue to your active GitLab repository.
          </p>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Stat 1: Income Drop */}
              <div className="p-4 rounded-xl bg-bg-void border border-border/80 flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase font-bold text-text-muted font-mono tracking-wider">Disposable Income Drop</div>
                  <div className="text-xl font-mono font-bold text-accent-red mt-1">-30.00%</div>
                  <div className="text-[9px] text-text-muted mt-0.5 font-mono">From {formatCurrency(originalIncome, user.currency, currency.locale)} to {formatCurrency(income, user.currency, currency.locale)}</div>
                </div>
                <TrendingUp className="w-8 h-8 text-accent-red rotate-180 opacity-20 shrink-0" />
              </div>

              {/* Stat 2: Shock Category */}
              <div className="p-4 rounded-xl bg-bg-void border border-border/80 flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase font-bold text-text-muted font-mono tracking-wider">Healthcare Shock Added</div>
                  <div className="text-xl font-mono font-bold text-accent-orange mt-1">+{formatCurrency(1500, user.currency, currency.locale)}</div>
                  <div className="text-[9px] text-text-muted mt-0.5 font-mono font-medium">Unexpected Medical Treatment Overhead</div>
                </div>
                <HeartPulse className="w-8 h-8 text-accent-orange opacity-20 shrink-0" />
              </div>

              {/* Stat 3: Mitigations status */}
              <div className="p-4 rounded-xl bg-bg-void border border-border/80 flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase font-bold text-text-muted font-mono tracking-wider">Maturity Runway Status</div>
                  <div className={cn(
                    "text-xl font-mono font-bold mt-1",
                    crunchMitigated ? "text-accent-emerald" : "text-accent-red animate-pulse"
                  )}>
                    {crunchMitigated ? "STABILIZED" : "DEPRECIATING"}
                  </div>
                  <div className="text-[9px] text-text-muted mt-0.5 font-mono">
                    {crunchMitigated ? "Variable gates set to emergency limits" : "Action required to avoid depletion"}
                  </div>
                </div>
                <ShieldAlert className="w-8 h-8 text-accent-gold opacity-20 shrink-0" />
              </div>
            </div>

            {/* Step Action Options */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                type="button"
                onClick={handleCalibrateRunway}
                disabled={crunchMitigated}
                className={cn(
                  "flex-1 px-4 py-3 rounded-xl text-xs font-bold tracking-wider uppercase transition-all flex items-center justify-center gap-2",
                  crunchMitigated 
                    ? "bg-emerald-500/10 border border-accent-emerald/30 text-accent-emerald text-center" 
                    : "bg-accent-gold hover:bg-accent-gold-bright text-bg-void border border-accent-gold hover:scale-[1.01] cursor-pointer"
                )}
              >
                {crunchMitigated ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" /> Threshold Boundaries Calibrated
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" /> Auto-Calibrate Capital Runway (Scale Wants)
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleDispatchGitlabIssue}
                disabled={syncStatus === "running"}
                className={cn(
                  "flex-1 px-4 py-3 rounded-xl text-xs font-bold tracking-wider uppercase border text-text-primary transition-all flex items-center justify-center gap-2 cursor-pointer",
                  syncStatus === "completed" 
                    ? "bg-accent-gold/10 border-accent-gold/40 text-accent-gold" 
                    : "bg-bg-secondary hover:bg-bg-secondary/70 border-border"
                )}
              >
                {syncStatus === "running" ? (
                  <>
                    <RotateCcw className="w-4 h-4 animate-spin text-accent-gold" /> Streaming Pipeline Dispatch...
                  </>
                ) : syncStatus === "completed" ? (
                  <>
                    <Check className="w-4 h-4 text-accent-gold" /> GitLab Operational Issue Synced (#214)
                  </>
                ) : (
                  <>
                    <Terminal className="w-4 h-4" /> Dispatch Operational Issue to GitLab
                  </>
                )}
              </button>
            </div>

            {/* Live streaming terminal logs for DevOps MCP */}
            {terminalLogs.length > 0 && (
              <div className="rounded-xl border border-border bg-bg-void p-4 font-mono text-[11px] leading-relaxed select-none">
                <div className="flex items-center justify-between border-b border-border/40 pb-2 mb-3 text-[10px] text-text-muted uppercase font-bold tracking-widest">
                  <span className="flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-accent-gold" /> GitLab MCP Multi-Step Reasoner Engine
                  </span>
                  <span className={cn(
                    syncStatus === "running" ? "text-accent-gold animate-pulse" : "text-accent-emerald"
                  )}>
                    {syncStatus === "running" ? "● SYNCHRONIZING" : "● RUN SUCCESSFUL"}
                  </span>
                </div>
                
                <div className="space-y-1 max-h-40 overflow-y-auto scrollbar-thin">
                  {terminalLogs.map((log, li) => (
                    <div 
                      key={li} 
                      className={cn(
                        "font-mono",
                        log.includes("SUCCESS") ? "text-accent-emerald font-bold" :
                        log.includes("Tool Call") ? "text-accent-blue" :
                        log.includes("[Thinking]") ? "text-text-muted" : "text-text-secondary"
                      )}
                    >
                      {log}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Detailed 5-Part Pedagogical breakdown issued card */}
            {showIssueDetail && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 rounded-2xl border border-accent-gold/30 bg-bg-void/80 backdrop-blur-md space-y-4 shadow-xl"
              >
                <div className="flex items-start justify-between border-b border-border/40 pb-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-bold font-mono text-accent-gold bg-accent-gold/10 px-2.5 py-0.5 rounded-full border border-accent-gold/20">
                        {gitProvider.toUpperCase()} ISSUE RECON_TICKET #214
                      </span>
                      <span className="text-xs text-text-muted flex items-center gap-1 font-mono">
                        <CheckCircle2 className="w-3.5 h-3.5 text-accent-emerald" /> STATE: OPEN / ASSIGNED
                      </span>
                    </div>
                    <h3 className="text-md font-bold tracking-tight font-display text-text-primary">
                      CRITICAL: Unexpected Medical Cash Crunch & Capital Runway Calibration
                    </h3>
                  </div>
                  <a 
                    href="#rebalancer" 
                    className="text-accent-gold hover:text-accent-gold-bright text-xs font-mono font-bold hover:underline flex items-center gap-1 shrink-0 mt-1"
                  >
                    View in GitOps Center <ChevronRight className="w-3.5 h-3.5" />
                  </a>
                </div>

                <div className="text-xs space-y-5 leading-relaxed text-text-secondary font-mono select-text bg-zinc-950 p-4 rounded-xl border border-border">
                  <div>
                    <h4 className="text-text-primary font-bold uppercase text-[9px] tracking-widest text-accent-gold mb-1">
                      1. [CONTEXT &amp; EMERGENCY FOOTPRINT IMPACT]
                    </h4>
                    <p className="pl-2 border-l border-accent-gold/20">
                      A sudden liquidity crunch occurred due to unexpected medical fees/diagnostics. The incident has resulted in a net **30% reduction in monthly disposable income** (impact parameters: -30% income adjustment from {formatCurrency(originalIncome, user.currency, currency.locale)} to {formatCurrency(income, user.currency, currency.locale)}). A premium cardiac treatment fee debit of {formatCurrency(1500, user.currency, currency.locale)} has been injected into active liabilities.
                    </p>
                  </div>

                  <div>
                    <h4 className="text-text-primary font-bold uppercase text-[9px] tracking-widest text-accent-gold mb-1">
                      2. [CAPITAL RUNWAY DIAGNOSTICS]
                    </h4>
                    <p className="pl-2 border-l border-accent-gold/20">
                      At current expenditures without dynamic mitigation adjustments, your emergency reserve runway declines by **42%**. Operating ratio thresholds have drifted from approved standards: Savings rate dropped from stabilized to critical values. This requires immediate variable threshold reductions to protect capital runway safety.
                    </p>
                  </div>

                  <div>
                    <h4 className="text-text-primary font-bold uppercase text-[9px] tracking-widest text-accent-gold mb-1">
                      3. [ACTIONABLE RUNWAY MITIGATION DIRECTIVES]
                    </h4>
                    <p className="pl-2 border-l border-accent-gold/20">
                      To stabilize and offset the -30% shock, variables are scaled inside structural gates:
                      <br />• **Entertainment spending**: Restricted by **70%** (limit set to 150).
                      <br />• **Other variable assets**: Slashed by **60%** (limit set to 150).
                      <br />• **Food spending boundary**: Squeezed by **20%** (budgeted target of 600).
                      These tactical boundaries defend an absolute threshold limit of **20% default savings rate**.
                    </p>
                  </div>

                  <div>
                    <h4 className="text-text-primary font-bold uppercase text-[9px] tracking-widest text-accent-gold mb-1">
                      4. [GITOPS CONFIGURATION ACTIONS]
                    </h4>
                    <div className="pl-2 border-l border-accent-gold/20">
                      Changes executed in repository config path: `wealth-policies/budget-laws.json` in branch `incidents/medical-crunch`.
                      New limits applied:
                      <pre className="bg-bg-void text-accent-gold p-2 mt-2 rounded border border-border/50 text-[10px] text-left">
{`{
  "$schema": "https://wealthwise.elite/schemas/budget-laws.v2.json",
  "anomaly": "MEDICAL_CRUNCH_30",
  "limits_applied": {
    "entertainment": 150,
    "other": 150,
    "food": 600,
    "transport": 350
  },
  "status": "EMERGENCY_OVERRIDE_ENABLED"
}`}
                      </pre>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-text-primary font-bold uppercase text-[9px] tracking-widest text-accent-gold mb-1">
                      5. [CI/CD POLICY PIPELINE VERIFICATION]
                    </h4>
                    <p className="pl-2 border-l border-accent-gold/20">
                      An automated schema checking process verifies the mitigation state against target laws:
                      <br />• **SAVINGS_RATE_GATE**: Passed (Calculated Adjusted Savings is above compliant 20% guardrails).
                      <br />• **DEBT_DIVERGENCE_TEST**: Passed.
                      State synchronized to persistent ledger. Commit verified.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[10px] font-mono text-text-muted justify-between pt-1">
                  <span>Sign-off key: **Elite_Agent_Gemini_3**</span>
                  <span>Synced in Workspace via local MongoDB snap</span>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Input Form */}
        <div className="space-y-8">
          <div className="card p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-accent-gold" /> Monthly Income
              </h3>
              <span className="text-xs text-text-muted">
                Typical Average: <span className="font-mono text-accent-gold font-bold">{formatCurrency(currency.avgSalary, user.currency, currency.locale)}</span>
              </span>
            </div>
            
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted text-lg font-mono">{currency.symbol}</span>
              <input
                type="number"
                value={income || ""}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setIncome(isNaN(val) ? 0 : Math.max(0, val));
                }}
                placeholder={`e.g. ${currency.avgSalary}`}
                className="input-field w-full pl-10 pr-4 py-3 text-2xl font-mono border-accent-gold/20 focus:border-accent-gold/100 outline-none transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-text-muted tracking-wider">Quick Adjust</label>
              <input
                type="range"
                min={Math.round(currency.avgSalary * 0.1)}
                max={Math.round(currency.avgSalary * 4)}
                step={Math.round(currency.avgSalary * 0.05)}
                value={income || 0}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setIncome(isNaN(val) ? 0 : Math.max(0, val));
                }}
                className="w-full accent-accent-gold h-1.5 bg-bg-secondary rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-text-muted font-mono">
                <span>Min ({formatCurrency(Math.round(currency.avgSalary * 0.1), user.currency, currency.locale)})</span>
                <span>Max ({formatCurrency(Math.round(currency.avgSalary * 4), user.currency, currency.locale)})</span>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] uppercase font-bold text-text-muted tracking-wider block">Presets based on Currency profile</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { label: "Starter", factor: 0.5 },
                  { label: "Nominal", factor: 1.0 },
                  { label: "Senior", factor: 1.5 },
                  { label: "Elite", factor: 2.5 },
                ].map((preset) => {
                  const targetVal = Math.round(currency.avgSalary * preset.factor);
                  const isActive = income === targetVal;
                  return (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => setIncome(targetVal)}
                      className={cn(
                        "py-2 px-1 text-xs font-medium rounded-lg border transition-all text-center",
                        isActive 
                          ? "bg-accent-gold/20 border-accent-gold text-accent-gold font-bold shadow-sm" 
                          : "bg-bg-secondary border-border/40 text-text-secondary hover:border-accent-gold/40 hover:text-text-primary"
                      )}
                    >
                      <div className="text-[9px] opacity-70 uppercase tracking-tighter">{preset.label}</div>
                      <div className="font-mono mt-0.5">{currency.symbol}{targetVal.toLocaleString()}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="card p-8 space-y-8">
            <h3 className="text-xl font-bold">Monthly Expenditures</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                { key: 'housing', label: 'Housing / Rent', icon: <Home className="w-4 h-4" />, color: "text-accent-gold" },
                { key: 'food', label: 'Food & Groceries', icon: <Utensils className="w-4 h-4" />, color: "text-accent-emerald" },
                { key: 'transport', label: 'Transport', icon: <Car className="w-4 h-4" />, color: "text-accent-blue" },
                { key: 'health', label: 'Health & Insurance', icon: <HeartPulse className="w-4 h-4" />, color: "text-accent-red" },
                { key: 'entertainment', label: 'Entertainment', icon: <Gamepad2 className="w-4 h-4" />, color: "text-accent-purple" },
                { key: 'education', label: 'Education', icon: <GraduationCap className="w-4 h-4" />, color: "text-accent-orange" },
                { key: 'loans', label: 'Loan / EMI Payments', icon: <CreditCard className="w-4 h-4" />, color: "text-text-muted" },
                { key: 'other', label: 'Other Expenses', icon: <Package className="w-4 h-4" />, color: "text-text-secondary" },
              ].map((cat) => (
                <div key={cat.key} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-text-secondary flex items-center gap-2">
                      <span className={cat.color}>{cat.icon}</span> {cat.label}
                    </label>
                    <span className="text-[10px] text-text-muted">
                      {income > 0 ? `${Math.round((expenses[cat.key as keyof typeof expenses] / income) * 100)}%` : "0%"}
                    </span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-xs font-mono">{currency.symbol}</span>
                    <input
                      type="number"
                      value={expenses[cat.key as keyof typeof expenses] || ""}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setExpenses({ ...expenses, [cat.key]: isNaN(val) ? 0 : Math.max(0, val) });
                      }}
                      placeholder="0"
                      className="input-field w-full pl-8 py-2 text-sm font-mono"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-6 border-t border-border flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="text-xs text-text-muted uppercase tracking-wider">Total Expenses</div>
                <div className="text-2xl font-mono font-bold text-accent-red">{formatCurrency(totalExpenses, user.currency, currency.locale)}</div>
              </div>
              <div className="space-y-1 text-right">
                <div className="text-xs text-text-muted uppercase tracking-wider">Monthly Savings</div>
                <div className="text-2xl font-mono font-bold text-accent-emerald">{formatCurrency(savings, user.currency, currency.locale)}</div>
              </div>
            </div>

            <div className="flex gap-4">
              <button onClick={handleSave} className="btn-primary flex-1 flex items-center justify-center gap-2">
                <Save className="w-4 h-4" /> Save Plan
              </button>
              <button onClick={exportToCSV} className="btn-secondary flex-1 flex items-center justify-center gap-2">
                <Download className="w-4 h-4" /> Export CSV
              </button>
              <button onClick={() => setIsResetConfirmOpen(true)} className="btn-secondary px-4" title="Reset Budget">
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Transaction History */}
          <div className="card p-8 space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Package className="w-5 h-5 text-accent-gold" /> Transaction Ledger
            </h3>
            <div className="space-y-4">
              {transactions.length > 0 ? transactions.map(t => (
                <div key={t.id} className="flex items-center justify-between p-4 rounded-xl bg-bg-secondary border border-border group hover:border-border-active transition-all">
                  <div className="space-y-1">
                    <div className="text-sm font-bold">{t.description}</div>
                    <div className="text-[10px] text-text-muted uppercase tracking-wider">{t.date}</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm font-mono font-bold text-accent-red">-{formatCurrency(t.amount, user.currency, currency.locale)}</div>
                      <div className="flex items-center gap-2">
                        <select 
                          value={t.category}
                          onChange={(e) => updateTransactionCategory(t.id, e.target.value)}
                          className="text-[10px] bg-transparent text-text-muted border-none p-0 focus:ring-0 cursor-pointer hover:text-accent-gold"
                        >
                          {Object.keys(expenses).map(cat => (
                            <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                          ))}
                        </select>
                        <button 
                          onClick={() => deleteTransaction(t.id)}
                          className="p-1 text-text-muted hover:text-accent-red opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8 text-text-muted italic text-sm">
                  No transactions yet. Connect your bank or add them manually.
                </div>
              )}
            </div>
          </div>

          {/* Goals Section */}
          <div className="card p-8 space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Target className="w-5 h-5 text-accent-gold" /> Spending Thresholds
            </h3>
            <p className="text-xs text-text-secondary">Set strategic limits for each category to maintain financial discipline.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Object.entries(expenses).map(([key, value]) => (
                <div key={key} className="space-y-2">
                  <label className="text-[10px] font-medium text-text-muted uppercase tracking-wider">{key} Limit</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-xs font-mono">{currency.symbol}</span>
                    <input
                      type="number"
                      value={(goals as any)[key] || ""}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setGoals({ ...goals, [key]: isNaN(val) ? 0 : Math.max(0, val) });
                      }}
                      placeholder="No limit set"
                      className={cn(
                        "input-field w-full pl-8 py-2 text-sm font-mono",
                        (goals as any)[key] > 0 && value > (goals as any)[key] ? "border-accent-red text-accent-red" : ""
                      )}
                    />
                  </div>
                  {(goals as any)[key] > 0 && (
                    <div className="flex justify-between items-center px-1">
                      <div className="h-1 bg-border rounded-full flex-1 mr-2 overflow-hidden">
                        <div 
                          className={cn("h-full", value > (goals as any)[key] ? "bg-accent-red" : "bg-accent-emerald")}
                          style={{ width: `${Math.min(100, (value / (goals as any)[key]) * 100)}%` }}
                        />
                      </div>
                      <span className={cn("text-[8px] font-bold", value > (goals as any)[key] ? "text-accent-red" : "text-accent-emerald")}>
                        {Math.round((value / (goals as any)[key]) * 100)}%
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Visual Analysis */}
        <div className="space-y-8">
          <div className="card p-8 flex flex-col items-center justify-center space-y-8">
            <h3 className="text-xl font-bold w-full text-left">Expenditure Distribution</h3>
            <div className="relative w-full h-[300px]">
              <Doughnut data={chartData} options={chartOptions} />
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <div className="text-text-muted text-xs uppercase tracking-widest">Total Expenses</div>
                <div className="text-2xl font-mono font-bold">{formatCurrency(totalExpenses, user.currency, currency.locale)}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full">
              {chartData.labels.map((label, i) => (
                <div key={label} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: chartData.datasets[0].backgroundColor[i] }} />
                  <span className="text-[10px] text-text-secondary truncate">{label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-8 space-y-8">
            <h3 className="text-xl font-bold">50/30/20 Analysis</h3>
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">NEEDS (Housing, Food, Health, Debt)</span>
                  <span className={cn("font-mono font-bold", needsPercent > 50 ? "text-accent-red" : "text-accent-emerald")}>
                    {needsPercent}% <span className="text-text-muted font-normal">/ 50%</span>
                  </span>
                </div>
                <div className="h-2 bg-border rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${needsPercent}%` }} className={cn("h-full", needsPercent > 50 ? "bg-accent-red" : "bg-accent-emerald")} />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">WANTS (Entertainment, Other)</span>
                  <span className={cn("font-mono font-bold", wantsPercent > 30 ? "text-accent-red" : "text-accent-emerald")}>
                    {wantsPercent}% <span className="text-text-muted font-normal">/ 30%</span>
                  </span>
                </div>
                <div className="h-2 bg-border rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${wantsPercent}%` }} className={cn("h-full", wantsPercent > 30 ? "bg-accent-red" : "bg-accent-emerald")} />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">SAVINGS</span>
                  <span className={cn("font-mono font-bold", savingsRate < 20 ? "text-accent-orange" : "text-accent-emerald")}>
                    {savingsRate}% <span className="text-text-muted font-normal">/ 20%</span>
                  </span>
                </div>
                <div className="h-2 bg-border rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${savingsRate}%` }} className={cn("h-full", savingsRate < 20 ? "bg-accent-orange" : "bg-accent-emerald")} />
                </div>
              </div>
            </div>
          </div>

          <div className="card p-8 space-y-6">
            <h3 className="text-xl font-bold">Strategic Insights</h3>
            <div className="space-y-4">
              {insights.length > 0 ? insights.map((insight, i) => (
                <div key={i} className={cn(
                  "flex items-start gap-4 p-4 rounded-xl border",
                  insight.type === "danger" ? "bg-accent-red/5 border-accent-red/10 text-accent-red" :
                  insight.type === "warning" ? "bg-accent-orange/5 border-accent-orange/10 text-accent-orange" :
                  "bg-accent-emerald/5 border-accent-emerald/10 text-accent-emerald"
                )}>
                  <div className="shrink-0 mt-0.5">{insight.icon}</div>
                  <p className="text-sm font-medium">{insight.text}</p>
                </div>
              )) : (
                <p className="text-text-muted text-sm italic">Enter your income and expenses to see insights.</p>
              )}
            </div>
          </div>

          {/* Comparison Bar Chart */}
          <div className="card p-8 space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-accent-gold" /> Spending Comparison
            </h3>
            <div className="h-[300px]">
              <Bar 
                data={{
                  labels: Object.keys(expenses).map(k => k.charAt(0).toUpperCase() + k.slice(1)),
                  datasets: [
                    {
                      label: 'Your Spending',
                      data: Object.values(expenses),
                      backgroundColor: '#F0B429',
                    },
                    {
                      label: 'Local Average',
                      data: Object.keys(expenses).map(k => {
                        if (k === 'housing') return currency.avgRent;
                        if (k === 'food') return currency.avgFood;
                        return currency.avgSalary * 0.05; // Dummy average for others
                      }),
                      backgroundColor: '#94A3B8',
                    }
                  ]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' } },
                    x: { grid: { display: false } }
                  },
                  plugins: {
                    legend: { position: 'bottom', labels: { color: '#94A3B8', font: { family: 'Outfit' } } }
                  }
                }}
              />
            </div>
          </div>

          {/* Monthly Trends Line Chart */}
          <div className="card p-8 space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <LineChart className="w-5 h-5 text-accent-gold" /> Monthly Expense Trends
            </h3>
            <div className="h-[300px]">
              <Line 
                data={{
                  labels: history.map(h => h.month),
                  datasets: [{
                    label: 'Monthly Expenses',
                    data: history.map(h => h.total),
                    borderColor: '#10D9A0',
                    backgroundColor: 'rgba(16, 217, 160, 0.1)',
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#10D9A0',
                  }]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: { beginAtZero: false, grid: { color: 'rgba(255,255,255,0.05)' } },
                    x: { grid: { display: false } }
                  },
                  plugins: {
                    legend: { display: false }
                  }
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <ConfirmationDialog
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        onConfirm={() => {
          setIncome(0);
          setExpenses({ housing: 0, food: 0, transport: 0, health: 0, entertainment: 0, education: 0, loans: 0, other: 0 });
          setGoals({ housing: 0, food: 0, transport: 0, health: 0, entertainment: 0, education: 0, loans: 0, other: 0 });
        }}
        title="Confirm Budget Reset"
        message="Are you sure you want to completely reset your budget? This will zero out your income, monthly expenses, and financial goals targets in your current planner session."
        confirmText="Reset Budget"
        type="danger"
      />
    </div>
  );
}
