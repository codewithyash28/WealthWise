import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Calendar as CalendarIcon, Flame, Plus, DollarSign, TrendingUp, Sparkles, X, ChevronLeft, ChevronRight, Info } from "lucide-react";
import { formatCurrency, cn } from "../lib/utils";
import { CURRENCIES } from "../constants";
import { UserProfile } from "../types";

interface SpendingHeatmapProps {
  user: UserProfile;
  monthlyIncome: number;
  totalMonthlyExpenses: number;
}

interface DailySpendRecord {
  day: number;
  dateStr: string;
  amount: number;
  category?: string;
  note?: string;
}

export function SpendingHeatmap({ user, monthlyIncome, totalMonthlyExpenses }: SpendingHeatmapProps) {
  const currency = CURRENCIES[user.currency] || CURRENCIES.USD;
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();

  const monthName = new Date(currentYear, currentMonth, 1).toLocaleString("en-US", { month: "long" });

  // Initialize or load daily spend map
  const [dailySpends, setDailySpends] = useState<Record<number, DailySpendRecord>>(() => {
    const saved = localStorage.getItem(`ww_daily_spending_${user.uid}_${currentYear}_${currentMonth}`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }

    // Default realistic daily distribution for user
    const records: Record<number, DailySpendRecord> = {};
    const avgDaily = totalMonthlyExpenses > 0 ? totalMonthlyExpenses / daysInMonth : 120;

    for (let day = 1; day <= daysInMonth; day++) {
      let val = 0;
      const date = new Date(currentYear, currentMonth, day);
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;

      if (day === 1) {
        val = Math.round(avgDaily * 4.5); // Rent / Mortgage on 1st
      } else if (day % 7 === 2) {
        val = Math.round(avgDaily * 2.2); // Weekly Groceries
      } else if (isWeekend) {
        val = Math.round(avgDaily * 1.6); // Weekend dining/fun
      } else if (day % 4 === 0) {
        val = Math.round(avgDaily * 0.8); // Utilities / Subscriptions
      } else if (day % 3 === 0) {
        val = Math.round(avgDaily * 0.4); // Fuel / Coffee
      } else {
        val = 0; // Zero spend days
      }

      records[day] = {
        day,
        dateStr: date.toISOString().split("T")[0],
        amount: val,
        category: day === 1 ? "Housing" : isWeekend ? "Entertainment" : "General",
        note: day === 1 ? "Primary Rent & Mortgage" : isWeekend ? "Weekend Leisure" : ""
      };
    }
    return records;
  });

  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [editAmount, setEditAmount] = useState<string>("");
  const [editNote, setEditNote] = useState<string>("");

  useEffect(() => {
    localStorage.setItem(`ww_daily_spending_${user.uid}_${currentYear}_${currentMonth}`, JSON.stringify(dailySpends));
  }, [dailySpends, user.uid, currentYear, currentMonth]);

  const totalSpentSoFar = useMemo(() => {
    return Object.values(dailySpends).reduce((sum, d) => sum + (d.amount || 0), 0);
  }, [dailySpends]);

  const zeroSpendDaysCount = useMemo(() => {
    return Object.values(dailySpends).filter((d) => (d.amount || 0) === 0).length;
  }, [dailySpends]);

  const maxSpendingDay = useMemo(() => {
    let max = { day: 1, amount: 0 };
    Object.values(dailySpends).forEach((d) => {
      if (d.amount > max.amount) {
        max = { day: d.day, amount: d.amount };
      }
    });
    return max;
  }, [dailySpends]);

  const handleDayClick = (day: number) => {
    setSelectedDay(day);
    const rec = dailySpends[day];
    setEditAmount(rec ? rec.amount.toString() : "0");
    setEditNote(rec ? rec.note || "" : "");
  };

  const handleSaveDailySpend = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDay === null) return;

    const amt = Math.max(0, parseFloat(editAmount) || 0);
    setDailySpends((prev) => ({
      ...prev,
      [selectedDay]: {
        ...prev[selectedDay],
        amount: amt,
        note: editNote.trim()
      }
    }));

    setSelectedDay(null);
  };

  // Color intensity helper
  const getIntensityClass = (amount: number) => {
    if (amount === 0) return "bg-zinc-900/60 border-zinc-800/80 text-zinc-500 hover:border-zinc-600";
    if (amount < 50) return "bg-emerald-500/15 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/25";
    if (amount < 150) return "bg-amber-500/20 border-amber-500/50 text-amber-300 hover:bg-amber-500/30";
    return "bg-rose-500/25 border-rose-500/60 text-rose-300 hover:bg-rose-500/35 animate-pulse";
  };

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="card p-6 sm:p-8 space-y-6 border-accent-gold/20 shadow-xl relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-[80px] pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/40">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-400" />
            <h3 className="text-xl font-bold font-display text-text-primary">Monthly Daily Spending Heatmap</h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 font-bold uppercase">
              Intensity Matrix
            </span>
          </div>
          <p className="text-xs text-text-secondary">
            Calendar velocity visualization of daily outlay for {monthName} {currentYear}
          </p>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-zinc-800 border border-zinc-700"></span>
            <span className="text-[10px] text-text-muted">$0</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-emerald-500/40 border border-emerald-500/60"></span>
            <span className="text-[10px] text-text-muted">&lt;$50</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-amber-500/50 border border-amber-500/70"></span>
            <span className="text-[10px] text-text-muted">$50-$150</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-rose-500/60 border border-rose-500/80"></span>
            <span className="text-[10px] text-text-muted">&gt;$150</span>
          </div>
        </div>
      </div>

      {/* Top Metrics Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-bg-secondary/60 border border-border/40 font-mono text-xs">
        <div>
          <span className="text-text-muted text-[10px] uppercase tracking-wider block">Total Spent This Month</span>
          <span className="text-lg font-bold text-amber-400">{formatCurrency(totalSpentSoFar, user.currency, currency.locale)}</span>
        </div>
        <div>
          <span className="text-text-muted text-[10px] uppercase tracking-wider block">Zero Spend Days</span>
          <span className="text-lg font-bold text-emerald-400">{zeroSpendDaysCount} Days</span>
        </div>
        <div>
          <span className="text-text-muted text-[10px] uppercase tracking-wider block">Peak Daily Outlay</span>
          <span className="text-lg font-bold text-rose-400">
            Day {maxSpendingDay.day} ({formatCurrency(maxSpendingDay.amount, user.currency, currency.locale)})
          </span>
        </div>
        <div>
          <span className="text-text-muted text-[10px] uppercase tracking-wider block">Avg Daily Burn</span>
          <span className="text-lg font-bold text-text-primary">
            {formatCurrency(Math.round(totalSpentSoFar / daysInMonth), user.currency, currency.locale)}
          </span>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="space-y-2">
        {/* Day of Week Headers */}
        <div className="grid grid-cols-7 gap-2 font-mono text-center text-[10px] text-text-muted uppercase font-bold tracking-wider">
          {daysOfWeek.map((day) => (
            <div key={day} className="py-1">{day}</div>
          ))}
        </div>

        {/* Days Matrix */}
        <div className="grid grid-cols-7 gap-2">
          {/* Empty lead padding slots */}
          {Array.from({ length: firstDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} className="h-16 sm:h-20 rounded-xl bg-bg-secondary/20 border border-border/10" />
          ))}

          {/* Actual Month Days */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const rec: { day: number; amount: number; note?: string } = dailySpends[dayNum] || { day: dayNum, amount: 0 };
            const isToday = dayNum === today.getDate();

            return (
              <motion.button
                key={dayNum}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleDayClick(dayNum)}
                className={cn(
                  "h-16 sm:h-20 p-2 rounded-xl border flex flex-col justify-between text-left transition-all cursor-pointer font-mono relative overflow-hidden",
                  getIntensityClass(rec.amount),
                  isToday && "ring-2 ring-accent-gold shadow-lg shadow-accent-gold/20"
                )}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-bold font-mono text-text-primary">{dayNum}</span>
                  {isToday && (
                    <span className="text-[8px] bg-accent-gold text-bg-void px-1 rounded font-bold uppercase">
                      Today
                    </span>
                  )}
                </div>

                <div>
                  <span className="text-[11px] font-bold block truncate">
                    {rec.amount > 0 ? `${currency.symbol}${Math.round(rec.amount)}` : "$0"}
                  </span>
                  {rec.note && (
                    <span className="text-[9px] text-text-muted block truncate font-sans">
                      {rec.note}
                    </span>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Edit Day Spend Modal */}
      <AnimatePresence>
        {selectedDay !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bg-void/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-bg-secondary border border-border rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl relative font-mono text-xs"
            >
              <div className="flex items-center justify-between pb-2 border-b border-border/40">
                <h4 className="font-bold text-text-primary text-sm flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-amber-400" />
                  Day {selectedDay} Spending ({monthName} {selectedDay})
                </h4>
                <button
                  onClick={() => setSelectedDay(null)}
                  className="p-1 rounded-lg text-text-muted hover:text-text-primary cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveDailySpend} className="space-y-3">
                <div>
                  <label className="text-[10px] text-text-muted uppercase block mb-1">
                    Daily Total Expenditure ({user.currency})
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={editAmount}
                    onChange={(e) => setEditAmount(e.target.value)}
                    placeholder="e.g. 150"
                    className="w-full bg-bg-void border border-border rounded-xl px-3 py-2 text-text-primary font-bold focus:border-amber-400 outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-text-muted uppercase block mb-1">
                    Note / Description
                  </label>
                  <input
                    type="text"
                    value={editNote}
                    onChange={(e) => setEditNote(e.target.value)}
                    placeholder="e.g. Grocery restock, Dining out"
                    className="w-full bg-bg-void border border-border rounded-xl px-3 py-2 text-text-primary focus:border-amber-400 outline-none font-sans"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedDay(null)}
                    className="px-3 py-1.5 rounded-xl border border-border text-text-muted hover:text-text-primary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-bg-void font-bold shadow-md"
                  >
                    Save Entry
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
