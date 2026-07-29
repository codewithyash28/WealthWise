import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Zap, 
  RotateCcw, 
  ShieldCheck, 
  Sliders, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRightLeft, 
  TrendingUp, 
  DollarSign, 
  Sparkles,
  Info,
  Clock,
  Play,
  PauseCircle,
  Tag,
  Bell
} from "lucide-react";

export interface WexaAction {
  id: string;
  action_type: "AUTO_CATEGORIZE" | "AUTO_TRANSFER_SAVINGS" | "AUTO_ADJUST_BUDGET" | "AUTO_PAUSE_SUBSCRIPTION" | "AUTO_ALERT_UNUSUAL_SPEND";
  amount: number;
  merchant: string;
  category: string;
  reason: string;
  timestamp: string;
  undo_available: boolean;
  undone: boolean;
}

interface WexaExecutionEngineProps {
  user?: any;
  onActionTriggered?: (action: WexaAction) => void;
}

const INITIAL_ACTIONS: WexaAction[] = [
  {
    id: "act_init_1",
    action_type: "AUTO_CATEGORIZE",
    amount: 14.99,
    merchant: "Spotify Music",
    category: "Subscriptions",
    reason: "Wexa Agent parsed transaction metadata. Auto-categorized as 'Subscriptions' and tagged for monthly audit.",
    timestamp: new Date(Date.now() - 1000 * 60 * 12).toLocaleTimeString(),
    undo_available: true,
    undone: false
  },
  {
    id: "act_init_2",
    action_type: "AUTO_TRANSFER_SAVINGS",
    amount: 45.00,
    merchant: "Emergency Savings Fund",
    category: "Savings",
    reason: "Wexa detected weekly dining budget was $45.00 under limit. Automatically swept surplus into Emergency Goal.",
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toLocaleTimeString(),
    undo_available: true,
    undone: false
  },
  {
    id: "act_init_3",
    action_type: "AUTO_ADJUST_BUDGET",
    amount: 50.00,
    merchant: "Groceries Category Limit",
    category: "Budget Rebalance",
    reason: "Wexa detected grocery spending pace +12% above monthly trend. Dynamically expanded grocery budget limit by $50 by reallocating unused entertainment buffer.",
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toLocaleTimeString(),
    undo_available: true,
    undone: false
  },
  {
    id: "act_init_4",
    action_type: "AUTO_PAUSE_SUBSCRIPTION",
    amount: 29.99,
    merchant: "Gym Pass Digital",
    category: "Subscriptions",
    reason: "Zero usage registered over 45 days. Wexa Subscription Shield flagged and auto-paused recurring invoice.",
    timestamp: new Date(Date.now() - 1000 * 60 * 300).toLocaleTimeString(),
    undo_available: true,
    undone: false
  }
];

export const WexaExecutionEngine: React.FC<WexaExecutionEngineProps> = ({ user, onActionTriggered }) => {
  const [actions, setActions] = useState<WexaAction[]>(INITIAL_ACTIONS);
  const [autoExecuteLimit, setAutoExecuteLimit] = useState<number>(250);
  const [autoCategorizeEnabled, setAutoCategorizeEnabled] = useState<boolean>(true);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState<boolean>(true);
  const [subscriptionShieldEnabled, setSubscriptionShieldEnabled] = useState<boolean>(true);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [filterType, setFilterType] = useState<string>("ALL");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleUndo = async (id: string) => {
    setActions(prev => prev.map(a => {
      if (a.id === id) {
        showToast(`Undone: ${a.action_type} for ${a.merchant} ($${a.amount.toFixed(2)}) has been reverted.`);
        return { ...a, undone: true, undo_available: false };
      }
      return a;
    }));

    try {
      await fetch("/api/wexa/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action_type: "UNDO_ACTION",
          amount: 0,
          merchant: "Reverted Action",
          reason: `User executed 1-tap UNDO on action ${id}.`,
          user_id: user?.email || "guest"
        })
      });
    } catch (err) {
      console.warn("Undo server log error:", err);
    }
  };

  const executeAction = async (
    type: WexaAction["action_type"],
    amount: number,
    merchant: string,
    category: string,
    reason: string
  ) => {
    setIsSimulating(true);

    const newAction: WexaAction = {
      id: `wexa_act_${Date.now()}`,
      action_type: type,
      amount,
      merchant,
      category,
      reason,
      timestamp: new Date().toLocaleTimeString(),
      undo_available: true,
      undone: false
    };

    try {
      const res = await fetch("/api/wexa/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action_type: type,
          amount,
          merchant,
          category,
          reason,
          user_id: user?.email || "guest"
        })
      });
      const data = await res.json();
      if (data.action) {
        newAction.id = data.action.id;
      }
    } catch (err) {
      console.warn("Wexa execute fetch error:", err);
    }

    setActions(prev => [newAction, ...prev]);
    setIsSimulating(false);
    showToast(`Wexa Executed: ${type} ($${amount.toFixed(2)}) for ${merchant}`);
    if (onActionTriggered) onActionTriggered(newAction);
  };

  const filteredActions = actions.filter(a => {
    if (filterType === "ALL") return true;
    return a.action_type === filterType;
  });

  return (
    <div className="space-y-8">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-6 z-50 bg-teal-950 border border-teal-500/40 text-teal-200 px-5 py-3.5 rounded-xl shadow-2xl flex items-center gap-3 backdrop-blur-md"
          >
            <Sparkles className="w-5 h-5 text-teal-400 animate-pulse" />
            <span className="text-xs font-semibold tracking-wide">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-teal-950 via-slate-900 to-teal-900 border border-teal-800/40 p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-mono font-bold uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5 text-teal-400 fill-teal-400" />
              XPRIZE AI Agent Execution Core
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Wexa Autonomous Financial Agent
            </h1>
            <p className="text-sm text-teal-100/80 leading-relaxed">
              "The AI that runs your money, not just shows it to you." Wexa continuously monitors connected accounts, automatically categorizes transactions, sweeps surplus into savings, rebalances category budgets, and shields you from unused subscriptions — fully logged with 1-tap UNDO protection.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 bg-slate-900/80 border border-teal-700/30 p-4 rounded-xl backdrop-blur-md">
            <div className="text-center sm:text-right">
              <div className="text-[10px] uppercase font-bold text-teal-400 tracking-widest">Agent Status</div>
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                Active & Protecting
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Agent Permission Limits & Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Pre-Approved Execution Limit */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-teal-400 font-bold text-sm">
              <ShieldCheck className="w-4 h-4" />
              Pre-Approved Execution Limit
            </div>
            <span className="text-xs font-mono font-bold text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-md border border-amber-400/20">
              ${autoExecuteLimit.toFixed(2)}
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Wexa will automatically execute financial optimizations up to this amount without requiring manual confirmation.
          </p>
          <input 
            type="range" 
            min={50} 
            max={1000} 
            step={25}
            value={autoExecuteLimit}
            onChange={(e) => setAutoExecuteLimit(Number(e.target.value))}
            className="w-full accent-teal-400 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] font-mono text-slate-500">
            <span>$50 (Conservative)</span>
            <span>$500</span>
            <span>$1,000 (Aggressive)</span>
          </div>
        </div>

        {/* Autonomous Toggles */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-3">
          <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Sliders className="w-4 h-4 text-teal-400" />
            Autonomous Permission Guardrails
          </div>
          <div className="space-y-2 pt-1">
            <label className="flex items-center justify-between text-xs text-slate-300 cursor-pointer">
              <span>Auto-Categorize Transactions</span>
              <input 
                type="checkbox" 
                checked={autoCategorizeEnabled} 
                onChange={(e) => setAutoCategorizeEnabled(e.target.checked)}
                className="w-4 h-4 rounded accent-teal-500 cursor-pointer"
              />
            </label>
            <label className="flex items-center justify-between text-xs text-slate-300 cursor-pointer">
              <span>Auto-Sweep Surplus to Savings</span>
              <input 
                type="checkbox" 
                checked={autoSaveEnabled} 
                onChange={(e) => setAutoSaveEnabled(e.target.checked)}
                className="w-4 h-4 rounded accent-teal-500 cursor-pointer"
              />
            </label>
            <label className="flex items-center justify-between text-xs text-slate-300 cursor-pointer">
              <span>Subscription Shield (Auto-Pause Unused)</span>
              <input 
                type="checkbox" 
                checked={subscriptionShieldEnabled} 
                onChange={(e) => setSubscriptionShieldEnabled(e.target.checked)}
                className="w-4 h-4 rounded accent-teal-500 cursor-pointer"
              />
            </label>
          </div>
        </div>

        {/* Real-time Interactive Test Triggers (Judge Playground) */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-3">
          <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Play className="w-4 h-4 text-emerald-400 fill-emerald-400" />
            Judge Live Execution Triggers
          </div>
          <p className="text-[11px] text-slate-400">
            Test Wexa's autonomous agent decision pipeline in real-time:
          </p>
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button 
              onClick={() => executeAction("AUTO_TRANSFER_SAVINGS", 35.00, "High Yield Emergency Fund", "Savings", "Wexa detected $35 surplus in dining budget. Auto-moved to high-yield savings.")}
              disabled={isSimulating}
              className="px-2.5 py-2 bg-teal-950/80 hover:bg-teal-900/80 border border-teal-700/40 rounded-lg text-[11px] font-medium text-teal-300 text-left transition-all cursor-pointer flex items-center gap-1.5"
            >
              <TrendingUp className="w-3.5 h-3.5 text-teal-400 shrink-0" />
              Auto-Save Surplus
            </button>

            <button 
              onClick={() => executeAction("AUTO_PAUSE_SUBSCRIPTION", 19.99, "HBO Max Streaming", "Subscriptions", "Wexa Subscription Shield flagged 60 days zero usage. Auto-paused monthly billing.")}
              disabled={isSimulating}
              className="px-2.5 py-2 bg-amber-950/80 hover:bg-amber-900/80 border border-amber-700/40 rounded-lg text-[11px] font-medium text-amber-300 text-left transition-all cursor-pointer flex items-center gap-1.5"
            >
              <PauseCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              Pause Sub Shield
            </button>

            <button 
              onClick={() => executeAction("AUTO_ADJUST_BUDGET", 40.00, "Transportation Budget", "Budget Rebalance", "Wexa re-allocated $40 unused entertainment buffer into gas category due to price spike.")}
              disabled={isSimulating}
              className="px-2.5 py-2 bg-indigo-950/80 hover:bg-indigo-900/80 border border-indigo-700/40 rounded-lg text-[11px] font-medium text-indigo-300 text-left transition-all cursor-pointer flex items-center gap-1.5"
            >
              <ArrowRightLeft className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              Rebalance Limit
            </button>

            <button 
              onClick={() => executeAction("AUTO_ALERT_UNUSUAL_SPEND", 320.00, "Luxury Goods Online", "Unusual Activity", "Wexa flagged transaction exceeding 30-day baseline average by 240%. Alert dispatched.")}
              disabled={isSimulating}
              className="px-2.5 py-2 bg-rose-950/80 hover:bg-rose-900/80 border border-rose-700/40 rounded-lg text-[11px] font-medium text-rose-300 text-left transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Bell className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              Unusual Spend Alert
            </button>
          </div>
        </div>
      </div>

      {/* Agent Execution Logs Feed */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-teal-400" />
              Autonomous Agent Execution Stream
            </h2>
            <p className="text-xs text-slate-400">
              Live audit record of every automated action executed by Wexa with instant 1-tap undo capability.
            </p>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {["ALL", "AUTO_CATEGORIZE", "AUTO_TRANSFER_SAVINGS", "AUTO_ADJUST_BUDGET", "AUTO_PAUSE_SUBSCRIPTION"].map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  filterType === t 
                    ? "bg-teal-500 text-slate-950 shadow-md" 
                    : "bg-slate-800/80 text-slate-400 hover:text-white"
                }`}
              >
                {t === "ALL" ? "All Actions" : t.replace("AUTO_", "")}
              </button>
            ))}
          </div>
        </div>

        {/* Log Entries List */}
        <div className="space-y-3">
          <AnimatePresence>
            {filteredActions.map((act) => {
              const isUndone = act.undone;
              let badgeColor = "bg-teal-500/10 text-teal-400 border-teal-500/30";
              if (act.action_type === "AUTO_PAUSE_SUBSCRIPTION") badgeColor = "bg-amber-500/10 text-amber-400 border-amber-500/30";
              if (act.action_type === "AUTO_ADJUST_BUDGET") badgeColor = "bg-indigo-500/10 text-indigo-400 border-indigo-500/30";
              if (act.action_type === "AUTO_ALERT_UNUSUAL_SPEND") badgeColor = "bg-rose-500/10 text-rose-400 border-rose-500/30";

              return (
                <motion.div
                  key={act.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`p-4 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    isUndone 
                      ? "bg-slate-950/60 border-slate-800/60 opacity-60" 
                      : "bg-slate-900/60 border-slate-800/80 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <div className={`mt-0.5 p-2 rounded-lg border ${badgeColor}`}>
                      <Zap className="w-4 h-4 fill-current" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${badgeColor}`}>
                          {act.action_type.replace("AUTO_", "")}
                        </span>
                        <span className="text-sm font-bold text-white">
                          {act.merchant}
                        </span>
                        <span className="text-xs font-mono font-bold text-teal-300">
                          ${act.amount.toFixed(2)}
                        </span>
                        {isUndone && (
                          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-rose-400 bg-rose-950/60 border border-rose-800 px-2 py-0.5 rounded">
                            Reverted (Undone)
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {act.reason}
                      </p>
                      <div className="text-[10px] font-mono text-slate-500 flex items-center gap-2">
                        <span>Executed: {act.timestamp}</span>
                        <span>•</span>
                        <span>Category: {act.category}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                    {!isUndone ? (
                      <button
                        onClick={() => handleUndo(act.id)}
                        className="px-3.5 py-1.5 bg-slate-800 hover:bg-rose-950 hover:text-rose-300 border border-slate-700 hover:border-rose-700 text-slate-300 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        1-Tap Undo
                      </button>
                    ) : (
                      <div className="text-xs text-slate-500 flex items-center gap-1 font-mono">
                        <CheckCircle2 className="w-3.5 h-3.5 text-slate-500" />
                        Action Reverted
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
