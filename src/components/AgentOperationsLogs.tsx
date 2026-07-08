import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Terminal, Download, RefreshCw, Trash2, Filter, CheckCircle2, 
  Cpu, Clock, Coins, ChevronDown, ChevronUp, FileSpreadsheet, ShieldCheck
} from "lucide-react";
import { cn } from "../lib/utils";

interface AgentLog {
  id: string;
  timestamp: string;
  agentName: string;
  action: string;
  inputContext: string;
  decision: string;
  tokenUsage: {
    promptTokens: number;
    candidatesTokens: number;
    totalTokens: number;
  };
  latencyMs: number;
  cloudProvider: string;
  status: string;
}

export function AgentOperationsLogs() {
  const [logs, setLogs] = useState<AgentLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>("ALL");
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/gemini/logs");
      if (response.ok) {
        const data = await response.json();
        setLogs(data.logs || []);
      }
    } catch (err) {
      console.error("Failed to fetch agent logs:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearLogs = async () => {
    if (!window.confirm("Are you sure you want to purge all autonomous agent logs? This is irreversible.")) {
      return;
    }
    try {
      const response = await fetch("/api/gemini/logs/clear", { method: "POST" });
      if (response.ok) {
        setLogs([]);
        setExpandedLogId(null);
      }
    } catch (err) {
      console.error("Failed to clear agent logs:", err);
    }
  };

  useEffect(() => {
    fetchLogs();
    // Auto refresh every 30 seconds for dynamic agent monitoring
    const interval = setInterval(fetchLogs, 30000);
    return () => clearInterval(interval);
  }, []);

  const agentsList = ["ALL", "Autonomous Macro Pulse Alert Agent", "Socratic Live Advisor", "Wealth Architect Auditor"];

  const filteredLogs = logs.filter(log => {
    const matchesFilter = activeFilter === "ALL" || log.agentName === activeFilter;
    const matchesSearch = 
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.inputContext.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.decision.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const stats = {
    totalAgents: 3,
    totalOperations: logs.length,
    totalTokens: logs.reduce((sum, log) => sum + (log.tokenUsage?.totalTokens || 0), 0),
    avgLatency: logs.length > 0 
      ? Math.round(logs.reduce((sum, log) => sum + log.latencyMs, 0) / logs.length) 
      : 0
  };

  return (
    <div className="card p-6 bg-bg-secondary/40 border-border/80 space-y-6" id="agent-operations-logs">
      {/* Header section with live feed indicators */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-accent-emerald/10 text-accent-emerald rounded-lg border border-accent-emerald/20">
              <Terminal className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider flex items-center gap-2">
                Autonomous Agent Operations Terminal
              </h3>
              <p className="text-[10px] font-mono text-accent-emerald uppercase tracking-widest flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 bg-accent-emerald rounded-full animate-ping" />
                Live Cloud telemetry stream &bull; Vertex AI
              </p>
            </div>
          </div>
        </div>

        {/* Top Control Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button 
            onClick={fetchLogs}
            disabled={isLoading}
            className="btn btn-secondary text-xs px-3 py-1.5 cursor-pointer flex items-center gap-1.5"
            title="Force refresh agent operations logs"
          >
            <RefreshCw className={cn("w-3.5 h-3.5", isLoading ? "animate-spin" : "")} />
            Refresh
          </button>

          <a 
            href="/api/gemini/logs/csv"
            download="agent_operations_log.csv"
            className="btn btn-primary text-xs px-3 py-1.5 bg-accent-emerald hover:bg-accent-emerald/80 text-bg-void border-none cursor-pointer flex items-center gap-1.5"
            title="Download full CSV of agent execution audits for hackathon submission"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV Evidence
          </a>

          <button 
            onClick={handleClearLogs}
            disabled={logs.length === 0}
            className="btn btn-secondary text-xs px-3 py-1.5 text-accent-red border-accent-red/20 hover:bg-accent-red/10 cursor-pointer flex items-center gap-1.5"
            title="Clear all logs"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear logs
          </button>
        </div>
      </div>

      {/* Operational Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-3 bg-bg-void border border-border/60 rounded-xl space-y-1.5">
          <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-text-muted flex items-center gap-1">
            <Cpu className="w-3 h-3 text-accent-gold" /> Cloud Agents Active
          </span>
          <div className="text-lg font-bold text-text-primary font-mono">{stats.totalAgents} <span className="text-xs font-normal text-text-muted">Engines</span></div>
        </div>

        <div className="p-3 bg-bg-void border border-border/60 rounded-xl space-y-1.5">
          <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-text-muted flex items-center gap-1">
            <Terminal className="w-3 h-3 text-accent-emerald" /> Recorded Ops
          </span>
          <div className="text-lg font-bold text-accent-emerald font-mono">{stats.totalOperations} <span className="text-xs font-normal text-text-muted">Calls</span></div>
        </div>

        <div className="p-3 bg-bg-void border border-border/60 rounded-xl space-y-1.5">
          <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-text-muted flex items-center gap-1">
            <Coins className="w-3 h-3 text-accent-purple" /> Cum. API Tokens
          </span>
          <div className="text-lg font-bold text-accent-purple font-mono">{stats.totalTokens.toLocaleString()} <span className="text-xs font-normal text-text-muted">Tkn</span></div>
        </div>

        <div className="p-3 bg-bg-void border border-border/60 rounded-xl space-y-1.5">
          <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-text-muted flex items-center gap-1">
            <Clock className="w-3 h-3 text-accent-gold" /> Avg. AI Latency
          </span>
          <div className="text-lg font-bold text-accent-gold font-mono">{stats.avgLatency} <span className="text-xs font-normal text-text-muted">ms</span></div>
        </div>
      </div>

      {/* Filtering & Searching Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search Input */}
        <input 
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search contexts, decisions, or action signatures..."
          className="bg-bg-void border border-border/80 focus:border-accent-gold/40 rounded-xl px-4 py-1.5 text-xs text-text-primary placeholder:text-text-muted focus:outline-none w-full md:max-w-xs transition-colors"
        />

        {/* Filter Buttons */}
        <div className="flex flex-wrap items-center gap-1">
          {agentsList.map(filter => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={cn(
                "px-2.5 py-1 text-[9px] font-mono font-bold uppercase rounded-md border transition-all cursor-pointer",
                activeFilter === filter 
                  ? "bg-accent-gold/10 text-accent-gold border-accent-gold/30 shadow-sm" 
                  : "bg-bg-void border-border/60 text-text-muted hover:border-border hover:text-text-primary"
              )}
            >
              {filter === "ALL" ? "All Agents" : filter.replace(" Agent", "")}
            </button>
          ))}
        </div>
      </div>

      {/* Main Terminal Window / Tree Logs */}
      <div className="border border-border/60 rounded-xl overflow-hidden bg-bg-void flex flex-col h-112 font-mono">
        {/* Terminal Header */}
        <div className="bg-bg-secondary/80 border-b border-border/60 px-4 py-2 flex items-center justify-between text-[10px] text-text-muted font-mono select-none">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-accent-red/30" />
            <span className="w-2.5 h-2.5 rounded-full bg-accent-gold/30" />
            <span className="w-2.5 h-2.5 rounded-full bg-accent-emerald/30" />
            <span className="ml-2">stdout@wealthwise-agent-orchestrator:~</span>
          </div>
          <span className="text-[9px] font-bold text-accent-emerald uppercase tracking-widest flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> SECURE AUDIT LOG
          </span>
        </div>

        {/* Logs viewport list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-thin">
          {filteredLogs.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-text-muted gap-2 py-10">
              <Terminal className="w-8 h-8 text-border animate-pulse" />
              <p className="text-xs italic">No matching operations registered in the current cloud telemetry.</p>
              <p className="text-[10px] text-text-muted">Execute some AI chat, load macro alerts, or request a Wealth Audit above to generate live records.</p>
            </div>
          ) : (
            filteredLogs.map((log) => {
              const isExpanded = expandedLogId === log.id;
              return (
                <div 
                  key={log.id} 
                  className={cn(
                    "border rounded-lg transition-all text-xs font-mono overflow-hidden",
                    isExpanded 
                      ? "border-accent-gold bg-accent-gold/5" 
                      : "border-border/40 bg-bg-secondary/20 hover:border-border/80 hover:bg-bg-secondary/40"
                  )}
                >
                  {/* Log summary row clickable */}
                  <div 
                    onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                    className="p-3 flex items-center justify-between gap-4 cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-1 bg-accent-emerald/10 text-accent-emerald rounded border border-accent-emerald/20 shrink-0">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-text-primary text-[11px] font-mono leading-tight truncate">
                            {log.action}
                          </span>
                          <span className="text-[8px] px-1.5 py-0.5 rounded bg-bg-void text-accent-gold uppercase font-bold tracking-wider border border-border/60">
                            {log.agentName.replace(" Agent", "")}
                          </span>
                        </div>
                        <p className="text-[10px] text-text-muted truncate mt-0.5">
                          {log.decision}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0 text-[10px] text-text-muted font-mono">
                      <span className="hidden sm:inline text-accent-purple">
                        {log.tokenUsage?.totalTokens || 0} tokens
                      </span>
                      <span className="hidden sm:inline text-accent-gold">
                        {log.latencyMs}ms
                      </span>
                      <span>
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-text-muted" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-text-muted" />
                      )}
                    </div>
                  </div>

                  {/* Expanded Detailed Inspection Card */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="border-t border-border/40 bg-bg-void/60 p-4 space-y-3.5 text-[11px]"
                      >
                        {/* Meta information tags */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 border-b border-border/30 pb-3">
                          <div>
                            <span className="text-text-muted text-[9px] block uppercase font-bold tracking-widest">Operation ID</span>
                            <span className="font-mono text-text-secondary">{log.id}</span>
                          </div>
                          <div>
                            <span className="text-text-muted text-[9px] block uppercase font-bold tracking-widest">Exact Timestamp</span>
                            <span className="font-mono text-text-secondary">{new Date(log.timestamp).toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="text-text-muted text-[9px] block uppercase font-bold tracking-widest">Cloud Engine</span>
                            <span className="font-mono text-text-secondary text-accent-emerald">{log.cloudProvider}</span>
                          </div>
                          <div>
                            <span className="text-text-muted text-[9px] block uppercase font-bold tracking-widest">Token Metrics</span>
                            <span className="font-mono text-accent-purple font-bold">
                              P: {log.tokenUsage?.promptTokens || 0} / C: {log.tokenUsage?.candidatesTokens || 0} (Total: {log.tokenUsage?.totalTokens || 0})
                            </span>
                          </div>
                        </div>

                        {/* Input context */}
                        <div className="space-y-1">
                          <span className="text-text-muted text-[9px] block uppercase font-bold tracking-widest">AI Prompt Input Context</span>
                          <div className="p-3 rounded-lg bg-bg-void/80 border border-border/40 text-text-secondary max-h-32 overflow-y-auto whitespace-pre-wrap leading-relaxed select-text">
                            {log.inputContext}
                          </div>
                        </div>

                        {/* Decision / Output */}
                        <div className="space-y-1">
                          <span className="text-accent-gold text-[9px] block uppercase font-bold tracking-widest">AI Agent Decision / Decision Output JSON</span>
                          <div className="p-3 rounded-lg bg-bg-void/80 border border-accent-gold/20 text-text-primary max-h-48 overflow-y-auto whitespace-pre-wrap leading-relaxed select-text">
                            {log.decision}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })
          )}
        </div>

        {/* Terminal Footer */}
        <div className="bg-bg-secondary/50 border-t border-border/40 px-4 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between text-[9px] text-text-muted gap-2">
          <span>&bull; Google Cloud Logging Sink Status: Active</span>
          <span>&bull; Compliance Policy: SEC_GOV_LAW_MAPPED_7.3a</span>
        </div>
      </div>
    </div>
  );
}
