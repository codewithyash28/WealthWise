import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Building2, 
  RefreshCw, 
  Zap, 
  ArrowDownRight, 
  ArrowUpRight, 
  ShieldCheck, 
  CheckCircle2, 
  CreditCard, 
  PlusCircle,
  Clock,
  Sparkles
} from "lucide-react";

interface Account {
  id: string;
  name: string;
  institution: string;
  type: "checking" | "savings" | "credit" | "investment";
  balance: number;
  accountNumber: string;
}

interface BankSyncSandboxProps {
  onTransactionSimulated?: (tx: any) => void;
}

const INITIAL_ACCOUNTS: Account[] = [
  { id: "acc_1", name: "Premier Checking", institution: "Chase Bank (Plaid Sandbox)", type: "checking", balance: 4820.50, accountNumber: "•••• 4821" },
  { id: "acc_2", name: "High-Yield Wealth Vault", institution: "Marcus / Goldman Sachs", type: "savings", balance: 12450.00, accountNumber: "•••• 9102" },
  { id: "acc_3", name: "Sapphire Reserve Card", institution: "Chase Credit", type: "credit", balance: -420.00, accountNumber: "•••• 3311" },
  { id: "acc_4", name: "Index Fund Portfolio", institution: "Vanguard Investments", type: "investment", balance: 32100.00, accountNumber: "•••• 8820" }
];

export const BankSyncSandbox: React.FC<BankSyncSandboxProps> = ({ onTransactionSimulated }) => {
  const [accounts, setAccounts] = useState<Account[]>(INITIAL_ACCOUNTS);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>("Just now");
  const [simulatedTxLog, setSimulatedTxLog] = useState<any[]>([]);

  const handleSyncAll = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setLastSyncTime(new Date().toLocaleTimeString());
    }, 1200);
  };

  const triggerSimulatedWebhook = (merchant: string, amount: number, category: string, accId: string) => {
    const targetAcc = accounts.find(a => a.id === accId) || accounts[0];
    
    // Update balance
    setAccounts(prev => prev.map(a => {
      if (a.id === targetAcc.id) {
        return { ...a, balance: a.type === "credit" ? a.balance - amount : a.balance - amount };
      }
      return a;
    }));

    const txPayload = {
      id: `tx_wh_${Date.now()}`,
      account_name: targetAcc.name,
      merchant,
      amount,
      category,
      timestamp: new Date().toLocaleTimeString(),
      source: "Plaid Sandbox Webhook Engine"
    };

    setSimulatedTxLog(prev => [txPayload, ...prev]);

    if (onTransactionSimulated) {
      onTransactionSimulated(txPayload);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-teal-400 font-bold text-sm">
            <Building2 className="w-4 h-4" />
            Plaid / Account Aggregator Bank Sync Sandbox
          </div>
          <p className="text-xs text-slate-400">
            Read-only financial data integration powering real-time automated Wexa agent execution on live webhooks.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[10px] font-mono text-slate-500">Last Sync: {lastSyncTime}</span>
          <button
            onClick={handleSyncAll}
            disabled={isSyncing}
            className="px-4 py-2 bg-teal-950 hover:bg-teal-900 border border-teal-700/50 text-teal-300 text-xs font-semibold rounded-xl transition-all flex items-center gap-2 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin text-teal-400" : ""}`} />
            {isSyncing ? "Syncing Webhooks..." : "Refresh Accounts"}
          </button>
        </div>
      </div>

      {/* Connected Accounts Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {accounts.map((acc) => (
          <div 
            key={acc.id}
            className="bg-slate-900/80 border border-slate-800 hover:border-teal-700/50 p-5 rounded-2xl space-y-3 transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-widest text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20">
                {acc.type}
              </span>
              <span className="text-[10px] font-mono text-slate-500">{acc.accountNumber}</span>
            </div>

            <div>
              <div className="text-xs text-slate-400">{acc.institution}</div>
              <div className="text-sm font-bold text-white">{acc.name}</div>
            </div>

            <div className="text-lg font-mono font-extrabold text-white pt-1">
              ${acc.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        ))}
      </div>

      {/* Webhook Injection Simulator (Judge Playground) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-teal-400 fill-teal-400" />
              Simulate Live Bank Webhook Event
            </h3>
            <p className="text-xs text-slate-400">
              Fire a simulated real-time transaction into the system to verify Wexa's autonomous detection & auto-execution.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            onClick={() => triggerSimulatedWebhook("Netflix Subscription", 15.99, "Subscriptions", "acc_3")}
            className="p-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-left transition-all cursor-pointer space-y-1"
          >
            <div className="text-xs font-bold text-slate-200">Netflix $15.99</div>
            <div className="text-[10px] text-slate-400">Triggers Subscription Shield</div>
          </button>

          <button
            onClick={() => triggerSimulatedWebhook("Whole Foods Market", 68.40, "Groceries", "acc_1")}
            className="p-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-left transition-all cursor-pointer space-y-1"
          >
            <div className="text-xs font-bold text-slate-200">Whole Foods $68.40</div>
            <div className="text-[10px] text-slate-400">Triggers Auto-Categorize</div>
          </button>

          <button
            onClick={() => triggerSimulatedWebhook("Bi-Weekly Salary Deposit", -1850.00, "Income", "acc_1")}
            className="p-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-left transition-all cursor-pointer space-y-1"
          >
            <div className="text-xs font-bold text-emerald-400">Salary Deposit +$1,850</div>
            <div className="text-[10px] text-slate-400">Triggers Auto-Sweep Surplus</div>
          </button>

          <button
            onClick={() => triggerSimulatedWebhook("Luxury Designer Store", 480.00, "Shopping", "acc_3")}
            className="p-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-left transition-all cursor-pointer space-y-1"
          >
            <div className="text-xs font-bold text-rose-400">Unusual Spend $480</div>
            <div className="text-[10px] text-slate-400">Triggers Over-Limit Push Alert</div>
          </button>
        </div>

        {/* Live Webhook Log Feed */}
        {simulatedTxLog.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-800 space-y-2">
            <div className="text-[11px] font-mono text-teal-400 uppercase tracking-widest">
              Live Webhook Processing Stream ({simulatedTxLog.length} Events Processed)
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {simulatedTxLog.map((tx) => (
                <div key={tx.id} className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="font-bold text-white">{tx.merchant}</span>
                    <span className="text-slate-400 font-mono text-[11px]">({tx.account_name})</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-teal-300">${Math.abs(tx.amount).toFixed(2)}</span>
                    <span className="text-[10px] font-mono text-slate-500">{tx.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
