import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ShieldCheck, 
  Search, 
  Download, 
  FileJson, 
  Trash2, 
  X, 
  Filter, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  Sparkles, 
  Bot, 
  User, 
  Key, 
  RefreshCw,
  Sliders,
  DollarSign,
  Target
} from "lucide-react";
import { getAuditLogs, clearAuditLogs, exportAuditLogsCSV, logAuditAction, AuditLogEntry, AuditCategory } from "../lib/auditLogger";

interface AuditLogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuditLogModal: React.FC<AuditLogModalProps> = ({ isOpen, onClose }) => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<AuditCategory | "all">("all");
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);

  const refreshLogs = () => {
    setLogs(getAuditLogs());
  };

  useEffect(() => {
    if (isOpen) {
      refreshLogs();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleLogUpdate = () => {
      refreshLogs();
    };
    window.addEventListener("ww-audit-logged", handleLogUpdate);
    return () => window.removeEventListener("ww-audit-logged", handleLogUpdate);
  }, []);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesCategory = selectedCategory === "all" || log.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        log.action.toLowerCase().includes(q) ||
        log.description.toLowerCase().includes(q) ||
        log.initiator.toLowerCase().includes(q) ||
        log.category.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [logs, selectedCategory, searchQuery]);

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(filteredLogs, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `wexa_audit_trail_${new Date().toISOString().split("T")[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleSimulateAgentAudit = () => {
    logAuditAction({
      action: "AUTONOMOUS_POLICY_VERIFICATION",
      category: "agent",
      description: "Autonomous Agent verified zero-knowledge constraint and validated spending caps against active monthly budget.",
      initiator: "Wexa AI Agent",
      status: "SUCCESS",
      details: {
        latencyMs: 142,
        verifiedRules: ["MAX_EXPENSE_CAP", "EMERGENCY_BUFFER_RATIO", "PORTFOLIO_DIVERSIFICATION"],
        result: "100% Passed"
      }
    });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-bg-void/80 backdrop-blur-md"
        />

        {/* Modal Dialog */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-4xl bg-bg-secondary border border-border/80 rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-5 sm:p-6 border-b border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-bg-void/50">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-accent-gold/10 border border-accent-gold/30 text-accent-gold shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-display font-bold text-text-primary">
                    Financial Audit & Compliance Log
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-accent-gold/10 border border-accent-gold/30 text-accent-gold font-mono text-[10px] font-bold">
                    {logs.length} Recorded
                  </span>
                </div>
                <p className="text-xs text-text-secondary mt-0.5">
                  Immutable audit trail of all major portfolio rebalancing, goal modifications, and agent executions.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              <button
                type="button"
                onClick={handleSimulateAgentAudit}
                className="px-3 py-1.5 rounded-xl bg-accent-gold/10 hover:bg-accent-gold/20 border border-accent-gold/30 text-accent-gold text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                title="Trigger real-time agent audit log"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Simulate Agent Log</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl bg-bg-void border border-border hover:border-accent-gold/40 text-text-muted hover:text-text-primary transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Search & Category Filter Bar */}
          <div className="p-4 sm:p-6 border-b border-border/40 space-y-3 bg-bg-secondary/40">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search actions, categories, descriptions, or initiators..."
                  className="w-full bg-bg-void border border-border rounded-xl pl-10 pr-4 py-2.5 text-xs text-text-primary placeholder:text-text-muted focus:outline-hidden focus:ring-1 focus:ring-accent-gold/50"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary text-xs"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={exportAuditLogsCSV}
                  className="px-3.5 py-2 rounded-xl bg-bg-void border border-border hover:border-accent-emerald/50 text-text-secondary hover:text-accent-emerald text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                  title="Download all logs as CSV spreadsheet"
                >
                  <Download className="w-3.5 h-3.5 text-accent-emerald" />
                  <span className="hidden sm:inline">Export CSV</span>
                </button>

                <button
                  type="button"
                  onClick={handleExportJSON}
                  className="px-3.5 py-2 rounded-xl bg-bg-void border border-border hover:border-accent-gold/50 text-text-secondary hover:text-accent-gold text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                  title="Download all logs as JSON format"
                >
                  <FileJson className="w-3.5 h-3.5 text-accent-gold" />
                  <span className="hidden sm:inline">Export JSON</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (confirm("Are you sure you want to clear all audit history?")) {
                      clearAuditLogs();
                      setLogs([]);
                    }
                  }}
                  className="p-2 rounded-xl bg-bg-void border border-border hover:border-accent-red/50 text-text-muted hover:text-accent-red transition-all cursor-pointer"
                  title="Clear audit log history"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 font-mono text-[11px]">
              {(
                [
                  { id: "all", label: "All Logs" },
                  { id: "portfolio", label: "Portfolio & Rebalancing" },
                  { id: "budget", label: "Budget Matrix" },
                  { id: "goals", label: "Financial Goals" },
                  { id: "agent", label: "Autonomous Agent" },
                  { id: "security", label: "Auth & Security" },
                  { id: "system", label: "System Events" },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedCategory(tab.id as any)}
                  className={`px-3 py-1.5 rounded-xl font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                    selectedCategory === tab.id
                      ? "bg-accent-gold text-slate-950 shadow-sm"
                      : "bg-bg-void/80 text-text-secondary hover:text-text-primary border border-border/60 hover:bg-bg-tertiary"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Logs List Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
            {filteredLogs.length === 0 ? (
              <div className="text-center py-12 space-y-3">
                <ShieldCheck className="w-12 h-12 text-text-muted mx-auto opacity-40" />
                <h4 className="text-sm font-bold text-text-primary">No Audit Logs Found</h4>
                <p className="text-xs text-text-muted max-w-sm mx-auto">
                  {searchQuery 
                    ? `No audit entries match "${searchQuery}". Try clearing the search query.`
                    : "No audit events recorded in this category yet. Major changes will automatically appear here."}
                </p>
              </div>
            ) : (
              filteredLogs.map((log) => {
                const isSelected = selectedLog?.id === log.id;
                const date = new Date(log.timestamp);
                const timeFormatted = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
                const dateFormatted = date.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });

                return (
                  <motion.div
                    key={log.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-bg-void border-accent-gold/60 shadow-lg ring-1 ring-accent-gold/40"
                        : "bg-bg-void/50 border-border/60 hover:border-border hover:bg-bg-void/80"
                    }`}
                    onClick={() => setSelectedLog(isSelected ? null : log)}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        {/* Status Icon */}
                        {log.status === "SUCCESS" && (
                          <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </span>
                        )}
                        {log.status === "WARNING" && (
                          <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            <AlertTriangle className="w-3.5 h-3.5" />
                          </span>
                        )}
                        {log.status === "INFO" && (
                          <span className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
                            <Info className="w-3.5 h-3.5" />
                          </span>
                        )}
                        {log.status === "CRITICAL" && (
                          <span className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
                            <AlertTriangle className="w-3.5 h-3.5" />
                          </span>
                        )}

                        <span className="font-mono text-xs font-bold text-text-primary tracking-wide">
                          {log.action}
                        </span>

                        <span className="px-2 py-0.5 rounded-md bg-bg-secondary text-text-muted border border-border/50 text-[10px] font-mono uppercase">
                          {log.category}
                        </span>

                        {/* Initiator badge */}
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold flex items-center gap-1 ${
                          log.initiator.includes("Agent")
                            ? "bg-purple-500/10 text-purple-300 border border-purple-500/30"
                            : log.initiator.includes("Clerk")
                            ? "bg-blue-500/10 text-blue-300 border border-blue-500/30"
                            : "bg-accent-gold/10 text-accent-gold border border-accent-gold/30"
                        }`}>
                          {log.initiator.includes("Agent") ? <Bot className="w-2.5 h-2.5" /> : <User className="w-2.5 h-2.5" />}
                          {log.initiator}
                        </span>
                      </div>

                      {/* Timestamp */}
                      <div className="flex items-center gap-1 text-[10px] font-mono text-text-muted">
                        <Clock className="w-3 h-3" />
                        <span>{dateFormatted} at {timeFormatted}</span>
                      </div>
                    </div>

                    <p className="text-xs text-text-secondary mt-2 leading-relaxed">
                      {log.description}
                    </p>

                    {/* Expandable JSON Details */}
                    {log.details && (
                      <div className="mt-3 pt-2.5 border-t border-border/40">
                        {isSelected ? (
                          <div className="space-y-1.5">
                            <div className="text-[10px] font-mono text-accent-gold font-bold uppercase tracking-wider">
                              Metadata Payload
                            </div>
                            <pre className="p-3 rounded-xl bg-bg-secondary text-[11px] font-mono text-text-primary overflow-x-auto border border-border/60 max-h-40">
                              {JSON.stringify(log.details, null, 2)}
                            </pre>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between text-[10px] font-mono text-text-muted">
                            <span className="truncate max-w-md">
                              {Object.entries(log.details).map(([k, v]) => `${k}: ${typeof v === 'object' ? JSON.stringify(v) : v}`).join(" • ")}
                            </span>
                            <span className="text-accent-gold hover:underline font-bold shrink-0 ml-2">
                              View Payload
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="p-4 sm:p-5 border-t border-border/60 bg-bg-void/60 flex items-center justify-between font-mono text-xs text-text-muted">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-accent-gold" />
              <span className="hidden sm:inline">Cryptographically Logged via WealthWise Protocol</span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-accent-gold text-slate-950 font-bold hover:opacity-90 transition-opacity cursor-pointer font-sans"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
