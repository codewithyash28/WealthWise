import React, { useState, useMemo } from "react";
import { formatCurrency, cn } from "../lib/utils";
import { CURRENCIES } from "../constants";
import { UserProfile } from "../types";
import { RefreshCw, Zap, CheckCircle2, AlertCircle, Plus, Trash2, Calendar, ShieldCheck, Tag } from "lucide-react";

interface TransactionItem {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
}

interface FixedExpensesSummaryProps {
  user: UserProfile;
  income: number;
  expenses: Record<string, number>;
  transactions: TransactionItem[];
}

interface RecurringExpenseItem {
  id: string;
  title: string;
  category: string;
  amount: number;
  frequency: string;
  source: "Detected from Statement" | "Budget Base";
  confidence: "High" | "Medium";
}

const RECURRING_KEYWORDS = [
  "rent", "lease", "mortgage", "netflix", "spotify", "hulu", "gym", "fitness",
  "utility", "power", "electric", "water", "gas", "insurance", "loan", "emi",
  "subscription", "prime", "disney", "icloud", "dropbox", "apple", "google",
  "internet", "wifi", "comcast", "verizon", "att", "t-mobile", "tuition"
];

export function FixedExpensesSummary({
  user,
  income,
  expenses,
  transactions,
}: FixedExpensesSummaryProps) {
  const currency = CURRENCIES[user.currency] || CURRENCIES.USD;

  // Custom added fixed expenses state
  const [customFixedList, setCustomFixedList] = useState<RecurringExpenseItem[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [newCategory, setNewCategory] = useState("housing");
  const [showAddModal, setShowAddModal] = useState(false);

  // Pattern detection algorithm for recurring items
  const detectedFixedExpenses = useMemo(() => {
    const list: RecurringExpenseItem[] = [];
    const seenTitles = new Set<string>();

    // 1. Scan transactions for recurring pattern keywords
    transactions.forEach((t) => {
      const descLower = t.description.toLowerCase();
      const isMatched = RECURRING_KEYWORDS.some((k) => descLower.includes(k));

      if (isMatched && !seenTitles.has(t.description.toLowerCase())) {
        seenTitles.add(t.description.toLowerCase());
        list.push({
          id: `det-${t.id}`,
          title: t.description,
          category: t.category,
          amount: Math.abs(t.amount),
          frequency: "Monthly",
          source: "Detected from Statement",
          confidence: "High",
        });
      }
    });

    // 2. Fallback base fixed categories if empty or minimal
    if (list.length === 0) {
      if (expenses.housing > 0) {
        list.push({
          id: "base-housing",
          title: "Primary Rent & Housing Lease",
          category: "housing",
          amount: expenses.housing,
          frequency: "Monthly",
          source: "Budget Base",
          confidence: "High",
        });
      }
      if (expenses.loans > 0) {
        list.push({
          id: "base-loans",
          title: "Loan Repayments & EMI Schedule",
          category: "loans",
          amount: expenses.loans,
          frequency: "Monthly",
          source: "Budget Base",
          confidence: "High",
        });
      }
      if (expenses.health > 0) {
        list.push({
          id: "base-health",
          title: "Health & Medical Insurance Premium",
          category: "health",
          amount: Math.round(expenses.health * 0.7),
          frequency: "Monthly",
          source: "Budget Base",
          confidence: "Medium",
        });
      }
    }

    return list;
  }, [transactions, expenses]);

  const allFixedExpenses = [...detectedFixedExpenses, ...customFixedList];

  const totalFixedMonthly = useMemo(() => {
    return allFixedExpenses.reduce((sum, item) => sum + item.amount, 0);
  }, [allFixedExpenses]);

  const fixedPercentageOfIncome = useMemo(() => {
    if (income <= 0) return 0;
    return Math.min(100, Math.round((totalFixedMonthly / income) * 100));
  }, [totalFixedMonthly, income]);

  const handleAddCustomFixed = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newAmount) return;

    const newItem: RecurringExpenseItem = {
      id: `custom-${Date.now()}`,
      title: newTitle.trim(),
      category: newCategory,
      amount: Math.max(0, parseFloat(newAmount) || 0),
      frequency: "Monthly",
      source: "Budget Base",
      confidence: "High",
    };

    setCustomFixedList((prev) => [...prev, newItem]);
    setNewTitle("");
    setNewAmount("");
    setShowAddModal(false);
  };

  const handleRemoveCustomFixed = (id: string) => {
    setCustomFixedList((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="card p-6 sm:p-8 space-y-6 border-accent-gold/20 shadow-xl relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/40">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-accent-gold animate-spin-slow" />
            <h3 className="text-xl font-bold font-display text-text-primary">
              Fixed Expenses & Subscriptions Matrix
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 font-bold uppercase">
              Auto Pattern Engine
            </span>
          </div>
          <p className="text-xs text-text-secondary">
            Algorithmic detection of recurring monthly subscriptions and fixed operational commitments
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-accent-gold/15 text-accent-gold border border-accent-gold/30 text-xs font-mono font-bold hover:bg-accent-gold/25 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Add Fixed Cost
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-bg-secondary/60 border border-border/40 font-mono text-xs">
        <div>
          <span className="text-text-muted text-[10px] uppercase tracking-wider block">
            Total Fixed Commitments
          </span>
          <span className="text-2xl font-bold text-accent-gold mt-1 block">
            {formatCurrency(totalFixedMonthly, user.currency, currency.locale)} / mo
          </span>
        </div>

        <div>
          <span className="text-text-muted text-[10px] uppercase tracking-wider block">
            Income Share Committed
          </span>
          <div className="flex items-center gap-2 mt-1">
            <span
              className={cn(
                "text-2xl font-bold",
                fixedPercentageOfIncome > 50 ? "text-rose-400" : "text-emerald-400"
              )}
            >
              {fixedPercentageOfIncome}%
            </span>
            <span className="text-[10px] text-text-muted">of net income</span>
          </div>
        </div>

        <div>
          <span className="text-text-muted text-[10px] uppercase tracking-wider block">
            Flagged Subscriptions
          </span>
          <span className="text-2xl font-bold text-text-primary mt-1 block">
            {allFixedExpenses.length} Recurring Items
          </span>
        </div>
      </div>

      {/* Recurring Items List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-mono text-text-muted uppercase tracking-wider font-bold">
          <span>Detected Fixed Line Items ({allFixedExpenses.length})</span>
          <span>Monthly Cost</span>
        </div>

        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {allFixedExpenses.map((item) => (
            <div
              key={item.id}
              className="p-3.5 rounded-2xl bg-bg-secondary/80 border border-border/60 hover:border-accent-gold/40 transition-all flex items-center justify-between font-mono text-xs"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 shrink-0">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-text-primary flex items-center gap-2">
                    {item.title}
                    <span className="px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-400 border border-zinc-700 text-[9px] uppercase font-bold">
                      {item.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-text-muted mt-0.5">
                    <span className="text-emerald-400 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> {item.source}
                    </span>
                    <span>•</span>
                    <span>Frequency: {item.frequency}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-amber-400">
                  {formatCurrency(item.amount, user.currency, currency.locale)}
                </span>
                {item.id.startsWith("custom-") && (
                  <button
                    onClick={() => handleRemoveCustomFixed(item.id)}
                    className="p-1 text-text-muted hover:text-rose-400 transition-colors cursor-pointer"
                    title="Remove custom fixed expense"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal to add custom fixed cost */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bg-void/80 backdrop-blur-sm">
          <div className="bg-bg-secondary border border-border rounded-2xl p-6 max-w-sm w-full space-y-4 font-mono text-xs shadow-2xl">
            <h4 className="font-bold text-text-primary text-sm pb-2 border-b border-border/40 flex items-center gap-2">
              <Plus className="w-4 h-4 text-amber-400" /> Add Custom Fixed Expense
            </h4>

            <form onSubmit={handleAddCustomFixed} className="space-y-3">
              <div>
                <label className="text-[10px] text-text-muted uppercase block mb-1">
                  Expense Description / Subscription Title
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Disney+ Bundle, Health Insurance"
                  className="w-full bg-bg-void border border-border rounded-xl px-3 py-2 text-text-primary focus:border-amber-400 outline-none font-sans"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] text-text-muted uppercase block mb-1">
                  Monthly Outlay Amount ({user.currency})
                </label>
                <input
                  type="number"
                  step="any"
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                  placeholder="e.g. 19.99"
                  className="w-full bg-bg-void border border-border rounded-xl px-3 py-2 text-text-primary font-bold focus:border-amber-400 outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] text-text-muted uppercase block mb-1">
                  Category
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full bg-bg-void border border-border rounded-xl px-3 py-2 text-text-primary focus:border-amber-400 outline-none font-sans cursor-pointer"
                >
                  <option value="housing">Housing / Rent</option>
                  <option value="entertainment">Entertainment / Subscriptions</option>
                  <option value="health">Health & Insurance</option>
                  <option value="loans">Loans & Debt</option>
                  <option value="transport">Transport</option>
                  <option value="other">Other Fixed Costs</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded-xl border border-border text-text-muted hover:text-text-primary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-bg-void font-bold shadow-md"
                >
                  Save Fixed Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
