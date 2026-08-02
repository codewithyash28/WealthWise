import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Search, 
  Command, 
  PieChart, 
  Wallet, 
  BrainCircuit, 
  Scale, 
  TrendingDown, 
  Moon, 
  Activity, 
  Bot, 
  Target, 
  Receipt, 
  Edit, 
  ArrowRight,
  X,
  Sparkles,
  ShieldCheck
} from "lucide-react";
import { cn } from "../lib/utils";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenReceiptModal?: () => void;
  onOpenEditNetWorthModal?: () => void;
}

interface CommandItem {
  id: string;
  title: string;
  category: "Navigation" | "Quick Action" | "Tools";
  icon: React.ReactNode;
  action: () => void;
  badge?: string;
}

export function CommandPalette({
  isOpen,
  onClose,
  onOpenReceiptModal,
  onOpenEditNetWorthModal,
}: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const navigateToHash = (hash: string) => {
    onClose();
    const elem = document.querySelector(hash);
    if (elem) {
      elem.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      window.location.hash = hash;
    }
  };

  const commands: CommandItem[] = [
    {
      id: "portfolio",
      title: "Portfolio Overview & D3 Heatmap",
      category: "Navigation",
      icon: <PieChart className="w-4 h-4 text-emerald-400" />,
      action: () => navigateToHash("#portfolio"),
      badge: "Holdings",
    },
    {
      id: "budget",
      title: "Budget Planner & Auto-Save",
      category: "Navigation",
      icon: <Wallet className="w-4 h-4 text-amber-400" />,
      action: () => navigateToHash("#budget"),
      badge: "Income/Expense",
    },
    {
      id: "scenarios",
      title: "Scenario Simulator & Stress Test",
      category: "Navigation",
      icon: <BrainCircuit className="w-4 h-4 text-purple-400" />,
      action: () => navigateToHash("#scenarios"),
      badge: "Projections",
    },
    {
      id: "rebalance",
      title: "Asset Rebalancer Matrix",
      category: "Navigation",
      icon: <Scale className="w-4 h-4 text-blue-400" />,
      action: () => navigateToHash("#rebalance"),
      badge: "Allocation",
    },
    {
      id: "debt",
      title: "Debt Payoff Accelerator",
      category: "Navigation",
      icon: <TrendingDown className="w-4 h-4 text-rose-400" />,
      action: () => navigateToHash("#debt"),
      badge: "Loans",
    },
    {
      id: "audit",
      title: "Autonomous Midnight Auditor Scan",
      category: "Navigation",
      icon: <Moon className="w-4 h-4 text-indigo-400" />,
      action: () => navigateToHash("#audit"),
      badge: "3 AM Daily",
    },
    {
      id: "telemetry",
      title: "Growth & Agent Telemetry",
      category: "Navigation",
      icon: <Activity className="w-4 h-4 text-accent-gold" />,
      action: () => navigateToHash("#telemetry"),
      badge: "Real-Time",
    },
    {
      id: "wexa-agent",
      title: "Wexa Autonomous Agent Engine",
      category: "Navigation",
      icon: <Bot className="w-4 h-4 text-teal-400" />,
      action: () => navigateToHash("#wexa-agent"),
      badge: "Gemini 3",
    },
    {
      id: "goals",
      title: "Financial Goals Tracker",
      category: "Navigation",
      icon: <Target className="w-4 h-4 text-cyan-400" />,
      action: () => navigateToHash("#goals"),
      badge: "Milestones",
    },
    {
      id: "scan-receipt",
      title: "Scan Receipt via Gemini Vision",
      category: "Quick Action",
      icon: <Receipt className="w-4 h-4 text-amber-300" />,
      action: () => {
        onClose();
        if (onOpenReceiptModal) onOpenReceiptModal();
      },
      badge: "Multimodal AI",
    },
    {
      id: "edit-networth",
      title: "Quick Edit Net Worth",
      category: "Quick Action",
      icon: <Edit className="w-4 h-4 text-emerald-300" />,
      action: () => {
        onClose();
        if (onOpenEditNetWorthModal) onOpenEditNetWorthModal();
      },
      badge: "Assets/Debts",
    },
  ];

  const filteredCommands = commands.filter(
    (cmd) =>
      cmd.title.toLowerCase().includes(query.toLowerCase()) ||
      cmd.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredCommands.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % Math.max(1, filteredCommands.length));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        filteredCommands[selectedIndex].action();
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/70 backdrop-blur-md">
        {/* Backdrop Click Close */}
        <div className="absolute inset-0" onClick={onClose} />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-xl rounded-2xl bg-slate-950 border border-accent-gold/40 shadow-2xl overflow-hidden z-10 flex flex-col"
        >
          {/* Top Search Input Bar */}
          <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border/80 bg-bg-void">
            <Search className="w-5 h-5 text-accent-gold shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedIndex(0);
              }}
              onKeyDown={handleKeyDown}
              placeholder="Search WealthWise modules, tools, or actions... (Esc to cancel)"
              className="w-full bg-transparent text-sm font-mono text-text-primary placeholder:text-text-muted outline-none"
            />
            <span className="px-2 py-0.5 rounded bg-bg-secondary text-[10px] font-mono text-text-muted border border-border">
              ESC
            </span>
          </div>

          {/* Results List */}
          <div className="max-h-80 overflow-y-auto p-2 space-y-1 divide-y divide-border/20">
            {filteredCommands.length === 0 ? (
              <div className="p-8 text-center text-xs font-mono text-text-muted">
                No matching WealthWise commands found for "{query}".
              </div>
            ) : (
              filteredCommands.map((cmd, idx) => (
                <button
                  key={cmd.id}
                  type="button"
                  onClick={cmd.action}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={cn(
                    "w-full px-3.5 py-2.5 rounded-xl text-left flex items-center justify-between gap-3 transition-all cursor-pointer font-mono text-xs",
                    idx === selectedIndex
                      ? "bg-accent-gold/15 text-text-primary border border-accent-gold/30"
                      : "text-text-secondary hover:bg-bg-secondary/60"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-bg-void border border-border/80 shrink-0">
                      {cmd.icon}
                    </div>
                    <div>
                      <div className="font-bold text-text-primary">{cmd.title}</div>
                      <div className="text-[10px] text-text-muted">{cmd.category}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {cmd.badge && (
                      <span className="px-2 py-0.5 rounded bg-bg-void border border-border text-[9px] font-bold uppercase text-accent-gold">
                        {cmd.badge}
                      </span>
                    )}
                    <ArrowRight className="w-3.5 h-3.5 text-text-muted" />
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Command Palette Footer */}
          <div className="p-2.5 bg-bg-void border-t border-border/60 flex items-center justify-between text-[10px] font-mono text-text-muted">
            <span className="flex items-center gap-1.5">
              <Command className="w-3 h-3 text-accent-gold" />
              <span>Use <strong className="text-text-primary">↑↓</strong> to navigate, <strong className="text-text-primary">↵</strong> to jump</span>
            </span>
            <span>WealthWise Elite 2.0</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
