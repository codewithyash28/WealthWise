import { useState, useEffect, useMemo } from "react";
import { motion } from "motion/react";
import { PieChart, Home, Utensils, Car, HeartPulse, Gamepad2, GraduationCap, CreditCard, Package, Save, RotateCcw, Copy, ChevronRight, AlertTriangle, CheckCircle2, TrendingUp, Download, Target, BarChart3, LineChart, Trash2 } from "lucide-react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title } from 'chart.js';
import { Doughnut, Bar, Line } from 'react-chartjs-2';
import { formatCurrency, cn } from "../lib/utils";
import { CURRENCIES } from "../constants";
import { UserProfile, BudgetPlan } from "../types";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title);

interface BudgetPlannerProps {
  user: UserProfile;
  onSave: (plan: BudgetPlan) => void;
  initialPlan: BudgetPlan | null;
}

export function BudgetPlanner({ user, onSave, initialPlan }: BudgetPlannerProps) {
  const [income, setIncome] = useState(initialPlan?.income || 0);
  const [expenses, setExpenses] = useState(initialPlan?.expenses || {
    housing: 0,
    food: 0,
    transport: 0,
    health: 0,
    entertainment: 0,
    education: 0,
    loans: 0,
    other: 0,
  });
  const [goals, setGoals] = useState(initialPlan?.goals || {
    housing: 0,
    food: 0,
    transport: 0,
    health: 0,
    entertainment: 0,
    education: 0,
    loans: 0,
    other: 0,
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Input Form */}
        <div className="space-y-8">
          <div className="card p-8 space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-accent-gold" /> Monthly Income
            </h3>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted font-mono">{currency.symbol}</span>
              <input
                type="number"
                value={income || ""}
                onChange={(e) => setIncome(Number(e.target.value))}
                placeholder={`e.g. ${currency.avgSalary}`}
                className="input-field w-full pl-10 text-xl font-mono"
              />
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
                      onChange={(e) => setExpenses({ ...expenses, [cat.key]: Number(e.target.value) })}
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
              <button onClick={() => { setIncome(0); setExpenses({ housing: 0, food: 0, transport: 0, health: 0, entertainment: 0, education: 0, loans: 0, other: 0 }); setGoals({ housing: 0, food: 0, transport: 0, health: 0, entertainment: 0, education: 0, loans: 0, other: 0 }); }} className="btn-secondary px-4">
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
                      onChange={(e) => setGoals({ ...goals, [key]: Number(e.target.value) })}
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
    </div>
  );
}
