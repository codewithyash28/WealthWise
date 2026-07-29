import { useState, useEffect, useMemo } from "react";
import { motion } from "motion/react";
import { 
  GitBranch, Terminal, RefreshCw, Send, Check, AlertCircle, FileCode, CheckCircle, 
  HelpCircle, ExternalLink, ArrowRight, ShieldCheck, Cpu, ChevronDown, Download
} from "lucide-react";
import { UserProfile, BudgetPlan } from "../types";
import { cn } from "../lib/utils";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

interface GitOpsControlCenterProps {
  user: UserProfile;
  budget: BudgetPlan | null;
  gitProvider: "gitlab" | "github" | "bitbucket";
  onUnlockAchievement: (id: string) => void;
}

interface GitOpsLog {
  id: string;
  timestamp: string;
  provider: "gitlab" | "github" | "bitbucket";
  action: string;
  status: "success" | "pending" | "failed";
  branch: string;
  resourceId: string;
  description: string;
}

export function GitOpsControlCenter({ user, budget, gitProvider, onUnlockAchievement }: GitOpsControlCenterProps) {
  const [activeTab, setActiveTab] = useState<"profile" | "budget" | "pipeline">("profile");
  const [editedCode, setEditedCode] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [selectedActionIndex, setSelectedActionIndex] = useState<number | null>(null);
  const [history, setHistory] = useState<GitOpsLog[]>([]);

  // Toggle dropdown / selections states
  const [selectedBranch, setSelectedBranch] = useState<"main" | "staging" | "development">("main");
  const [isBranchDropdownOpen, setIsBranchDropdownOpen] = useState(false);
  const [customCommitMessage, setCustomCommitMessage] = useState("");

  // Generated dynamic files
  const dynamicProfileCode = JSON.stringify({
    "$schema": "https://wexa.ai/schemas/profile.v1.json",
    "owner": user.name,
    "currency": user.currency,
    "netWorthState": {
      "assets": user.netWorth?.assets || 100000,
      "liabilities": user.netWorth?.liabilities || 15000,
      "netWorth": (user.netWorth?.assets || 100000) - (user.netWorth?.liabilities || 15000)
    },
    "compliance": {
      "literacyScore": `${user.highScore}/150`,
      "gitopsActive": true,
      "targetEngine": gitProvider
    }
  }, null, 2);

  const dynamicBudgetCode = JSON.stringify({
    "$schema": "https://wexa.ai/schemas/budget.v2.json",
    "income": budget ? budget.income : 6500,
    "expenses": budget ? budget.expenses : {
      "housing": 2000,
      "essentials": 1200,
      "savings": 1500,
      "investments": 1000,
      "leisure": 800
    },
    "complianceMetrics": {
      "savingsRate": budget 
        ? `${Math.round(((budget.income - Object.values(budget.expenses).reduce((a, b) => a + b, 0)) / budget.income) * 100)}%` 
        : "23%",
      "debtToAssetRatio": user.netWorth?.assets > 0 
        ? (user.netWorth?.liabilities / user.netWorth?.assets).toFixed(2) 
        : "0.15",
      "status": "APPROVED_BY_AGENT"
    }
  }, null, 2);

  const dynamicPipelineCode = `name: Wealth-As-Code Financial Compliance Pipeline

on:
  push:
    paths:
      - 'wealth-policies/**'

jobs:
  financial-compliance:
    runs-on: self-hosted-gitops-runner
    steps:
      - name: Checkout Active Policies
        uses: actions/checkout@v4
      
      - name: Verify NetWorth Debt Constraints
        run: |
          node -e "
            const profile = require('./wealth-policies/user-profile.json');
            const ratio = profile.netWorthState.liabilities / profile.netWorthState.assets;
            if (ratio > 0.45) {
              console.error('ERROR: Debt ratio ' + ratio.toFixed(2) + ' exceeds 45% policy laws!');
              process.exit(1);
            }
            console.log('SUCCESS: Debt ratio of ' + ratio.toFixed(2) + ' is compliant.');
          "
      
      - name: Simulation Stress-Test Audit
        run: |
          wexa-agent --stress-inflation 6.5 --profile ./wealth-policies/user-profile.json
          echo "Sync State: COMPLIANT WITH ${gitProvider.toUpperCase()}"`;

  // Update editor content when tabs/user details load
  useEffect(() => {
    if (activeTab === "profile") {
      setEditedCode(dynamicProfileCode);
    } else if (activeTab === "budget") {
      setEditedCode(dynamicBudgetCode);
    } else {
      setEditedCode(dynamicPipelineCode);
    }
  }, [activeTab, user, budget, gitProvider]);

  // Load history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("ww_gitops_history");
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const providerDetails = {
    github: {
      name: "GitHub",
      mcpServer: "github_mcp_server",
      branchPrefix: "wealthops/main",
      colorClass: "text-white bg-zinc-950 border-zinc-800 focus:border-zinc-700",
      accentText: "text-accent-emerald",
      accentBg: "bg-accent-emerald/10 border-accent-emerald/20",
      actions: [
        { title: "Commit Rules", type: "push", branch: "main", desc: "Commit dynamic policy files safely to the active branch." },
        { title: "Create Issue", type: "issue", branch: "issues/risk-profile", desc: "Log a security and net worth safety issue for review." },
        { title: "Draft Pull Request", type: "pr", branch: "wealthops/rebalance-profile", desc: "Create a PR proposal updating allocation criteria." }
      ]
    },
    gitlab: {
      name: "GitLab",
      mcpServer: "gitlab_mcp_server",
      branchPrefix: "wealthops/pipeline",
      colorClass: "text-accent-gold bg-amber-500/5 border-amber-500/20",
      accentText: "text-accent-gold",
      accentBg: "bg-accent-gold/10 border-accent-gold/20",
      actions: [
        { title: "Push Policy Rules", type: "push", branch: "master", desc: "Push direct JSON criteria to root repository config." },
        { title: "Deploy Incident Alert", type: "issue", branch: "incidents/inflation-warning", desc: "Instantly create a GitLab compliance incident alert." },
        { title: "Draft Merge Request", type: "pr", branch: "wealthops/audit-rebalancing", desc: "Compile a compliance MR for budget law revision." }
      ]
    },
    bitbucket: {
      name: "Bitbucket",
      mcpServer: "bitbucket_mcp_server",
      branchPrefix: "wealthops/workspace",
      colorClass: "text-blue-400 bg-blue-500/5 border-blue-500/20",
      accentText: "text-blue-400",
      accentBg: "bg-blue-500/10 border-blue-500/20",
      actions: [
        { title: "Deploy configuration", type: "push", branch: "deployment", desc: "Publish settings directly via Bitbucket Pipelines." },
        { title: "Create Jira Ticket", type: "issue", branch: "jira/balance-liabilities", desc: "Raise structured Jira tickets to optimize asset balance." },
        { title: "Submit Pull Request", type: "pr", branch: "wealthops/debt-optimization", desc: "Raise branch pull requests to reduce high liabilities." }
      ]
    }
  };

  const details = providerDetails[gitProvider];

  const triggerGitopsAction = async (actionIndex: number) => {
    if (isSyncing) return;
    setIsSyncing(true);
    setSelectedActionIndex(actionIndex);
    
    const action = details.actions[actionIndex];
    const timestamp = new Date().toLocaleTimeString();
    
    // Determine branch based on user selection or config fallback
    const branchToUse = action.type === "push" ? selectedBranch : action.branch;
    const commitMessageToUse = customCommitMessage.trim() || `chore(wealth-as-code): sync structural policy configuration from Wexa console`;

    // Simulate terminal outputs line-by-line
    const mockTerminalLogs = [
      `[${timestamp}] INFO: Requesting GitOps sync via Multi-Step LLM agent...`,
      `[${timestamp}] MCP: Connecting to MCP server daemon: "${details.mcpServer}"...`,
      `[${timestamp}] MCP: Connection established securely. Active tokens validated.`,
      `[${timestamp}] TARGET: Inspecting repo path: "wealth-policies/${activeTab === 'profile' ? 'user-profile.json' : activeTab === 'budget' ? 'budget-laws.json' : 'wealth-pipeline.yml'}"`,
      `[${timestamp}] GIT: Checking tree state on branch "${branchToUse}"...`,
    ];

    if (customCommitMessage.trim()) {
      mockTerminalLogs.push(`[${timestamp}] INFO: Custom note attached: "${commitMessageToUse}"`);
    }

    if (action.type === "push") {
      mockTerminalLogs.push(
        `[${timestamp}] LOCAL: Serialization successful. Preparing commit payload.`,
        `[${timestamp}] AUTH: Sign off verified for key pair "Agent_Gemini_3_Secure".`,
        `[${timestamp}] GIT: git commit -m "${commitMessageToUse}"`,
        `[${timestamp}] GIT: git push origin ${branchToUse}...`,
        `[${timestamp}] SUCCESS: Modified 1 file. Policy rules deployed cleanly to ${branchToUse}. Commit Hash: ${Math.random().toString(16).substring(2, 9).toUpperCase()}`
      );
    } else if (action.type === "issue") {
      const issueRef = Math.floor(Math.random() * 200) + 10;
      mockTerminalLogs.push(
        `[${timestamp}] ANALYSIS: Scanning parameters for risk markers...`,
        `[${timestamp}] DETECTED: Assets to Liabilities ratio looks secure. Writing issue audit context.`,
        `[${timestamp}] API: Dispatched POST to create issue tracking ticket. Title: "Compliance Warning: ${commitMessageToUse}"`,
        `[${timestamp}] SUCCESS: Created ticket reference #${issueRef} under long-term planning workspace. Status: Open.`
      );
    } else {
      const prRef = Math.floor(Math.random() * 50) + 1;
      mockTerminalLogs.push(
        `[${timestamp}] GIT: Creating feature branch "${branchToUse}" from HEAD...`,
        `[${timestamp}] GIT: Modifying "wealth-policies/" configs...`,
        `[${timestamp}] GIT: git push origin ${branchToUse}`,
        `[${timestamp}] API: Instantiating compliance ${gitProvider === 'gitlab' ? 'Merge Request' : 'Pull Request'} against master/main...`,
        `[${timestamp}] SUCCESS: Created ${gitProvider === 'gitlab' ? 'Merge Request' : 'Pull Request'} #${prRef}. Ready for manual engineering sign-off.`
      );
    }

    setLogs([]);
    
    // Staggered log output
    for (let i = 0; i < mockTerminalLogs.length; i++) {
      await new Promise(resolve => setTimeout(resolve, i === 0 ? 100 : i * 150));
      setLogs(prev => [...prev, mockTerminalLogs[i]]);
    }

    // Capture run log
    const newLog: GitOpsLog = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
      provider: gitProvider,
      action: action.type === "push" ? `Push (${commitMessageToUse.substring(0, 16)}...)` : action.title,
      status: "success",
      branch: branchToUse,
      resourceId: action.type === "push" 
        ? `Commit: ${Math.random().toString(16).substring(2, 8).toUpperCase()}`
        : action.type === "issue" ? `Ticket: #${Math.floor(Math.random() * 200) + 10}` : `PR/MR: #${Math.floor(Math.random() * 50) + 1}`,
      description: action.desc
    };

    const updatedHistory = [newLog, ...history].slice(0, 5);
    setHistory(updatedHistory);
    localStorage.setItem("ww_gitops_history", JSON.stringify(updatedHistory));

    // Unlock achievement
    onUnlockAchievement("git_master");
    setIsSyncing(false);
  };

  // Export JSON history log file
  const handleExportHistory = () => {
    if (history.length === 0) return;
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(history, null, 2)
    )}`;
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", jsonString);
    downloadAnchor.setAttribute("download", `wealthops_history_${gitProvider}_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Recharts success rate calculation
  const chartData = useMemo(() => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    
    // Base pre-populated values for visual feedback
    const baseStats: Record<string, { successful: number; failed: number }> = {
      "Mon": { successful: 4, failed: 0 },
      "Tue": { successful: 2, failed: 1 },
      "Wed": { successful: 5, failed: 0 },
      "Thu": { successful: 1, failed: 2 },
      "Fri": { successful: 6, failed: 0 },
      "Sat": { successful: 3, failed: 1 },
      "Sun": { successful: 2, failed: 0 }
    };

    // Integrate real-time logs from history state
    history.forEach(log => {
      const logDate = new Date(log.timestamp);
      const dayName = logDate.toLocaleDateString("en-US", { weekday: "short" });
      if (baseStats[dayName]) {
        if (log.status === "success") {
          baseStats[dayName].successful += 1;
        } else {
          baseStats[dayName].failed += 1;
        }
      }
    });

    return days.map(day => ({
      day,
      successful: baseStats[day].successful,
      failed: baseStats[day].failed
    }));
  }, [history]);

  return (
    <div id="gitops-center" className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-[9px] uppercase font-bold text-accent-emerald tracking-widest bg-accent-emerald/10 px-2.5 py-0.5 rounded-full border border-accent-emerald/20">
            <Cpu className="w-3 h-3 text-accent-emerald animate-pulse" /> Local State-As-Code engine
          </div>
          <h3 className="text-xl font-bold font-display text-text-primary">Wealth-As-Code Policy Sync</h3>
        </div>

        {/* Dynamic selectors layout */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Branch selector dropdown */}
          <div className="relative z-30">
            <button
              onClick={() => setIsBranchDropdownOpen(!isBranchDropdownOpen)}
              type="button"
              className="flex items-center gap-1.5 bg-bg-secondary border border-border/80 hover:border-accent-gold/40 rounded-xl px-3 py-1.5 text-xs font-mono font-bold uppercase text-text-primary transition-colors cursor-pointer select-none"
            >
              <GitBranch className="w-3.5 h-3.5 text-accent-gold" />
              <span>Branch: {selectedBranch}</span>
              <ChevronDown className={cn("w-3.5 h-3.5 text-text-muted transition-transform", isBranchDropdownOpen ? "rotate-180" : "")} />
            </button>

            {isBranchDropdownOpen && (
              <>
                <div className="fixed inset-0" onClick={() => setIsBranchDropdownOpen(false)} />
                <div className="absolute top-full mt-2 right-0 w-44 bg-bg-void border border-border rounded-xl shadow-2xl p-1.5 space-y-0.5 z-40 backdrop-blur-md">
                  <div className="px-2 py-1 text-[8px] uppercase font-bold text-text-muted tracking-wider border-b border-border/40 mb-1">
                    Select Policy Branch
                  </div>
                  {(["main", "staging", "development"] as const).map((b) => {
                    const active = selectedBranch === b;
                    return (
                      <button
                        key={b}
                        type="button"
                        onClick={() => {
                          setSelectedBranch(b);
                          setIsBranchDropdownOpen(false);
                        }}
                        className={cn(
                          "w-full text-left px-2 py-1.5 rounded-lg flex items-center justify-between text-xs font-mono transition-colors cursor-pointer",
                          active 
                            ? "bg-accent-gold/10 text-accent-gold font-bold" 
                            : "text-text-secondary hover:bg-bg-secondary hover:text-text-primary"
                        )}
                      >
                        <span>{b}</span>
                        {active && <Check className="w-3.5 h-3.5 text-accent-gold" />}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-text-muted font-mono">Control Mode:</span>
            <span className={cn("px-2.5 py-1.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider border", details.accentBg, details.accentText)}>
              {details.name} MCP Active
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left column: Code editor & Tab controls */}
        <div className="xl:col-span-12 lg:xl:col-span-7 card bg-zinc-950 p-6 border-border/60 flex flex-col space-y-4">
          <div className="flex items-center justify-between border-b border-border/40 pb-3">
            <div className="flex items-center gap-2">
              <FileCode className="w-4 h-4 text-accent-gold" />
              <span className="text-xs font-bold uppercase tracking-wider text-text-primary">Wealth Policies</span>
            </div>
            
            {/* Tab Selectors */}
            <div className="flex bg-bg-secondary p-0.5 rounded-lg border border-border/40 text-[10px]">
              {(["profile", "budget", "pipeline"] as const).map(tab => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "px-2.5 py-1 font-bold uppercase rounded-md transition-colors cursor-pointer",
                    activeTab === tab 
                      ? "bg-bg-void text-accent-gold border border-border/40" 
                      : "text-text-muted hover:text-text-primary"
                  )}
                >
                  {tab === 'profile' ? 'user-profile.json' : tab === 'budget' ? 'budget-laws.json' : 'compliance.yml'}
                </button>
              ))}
            </div>
          </div>

          {/* Policy interactive code editor preview */}
          <div className="relative font-mono text-[11px] leading-relaxed">
            <textarea
              className="w-full h-82 bg-bg-void border border-border rounded-xl p-4 font-mono text-xs text-text-primary focus:outline-none focus:border-accent-gold/40 resize-none selection:bg-accent-gold/20 scrollbar-thin"
              value={editedCode}
              onChange={(e) => setEditedCode(e.target.value)}
              spellCheck={false}
            />
            <div className="absolute bottom-2 right-4 text-[9px] text-text-muted uppercase tracking-widest bg-bg-void/80 px-2 py-0.5 rounded-sm border border-border/40 select-none">
              interactive sandbox. feel free to edit configs
            </div>
          </div>

          <div className="text-xs text-text-muted leading-relaxed flex items-start gap-2 bg-bg-secondary/40 p-3 rounded-lg border border-border/40">
            <HelpCircle className="w-4 h-4 text-accent-gold shrink-0 mt-0.5" />
            <p>
              This code block dynamically serializes your net worth, liabilities, income structure, and savings safety score into Git-friendly states. The AI agent reads these parameters to track, log, and rebalance your files.
            </p>
          </div>
        </div>

        {/* Right column: Action Dispatcher & Live Log terminal */}
        <div className="xl:col-span-12 lg:xl:col-span-5 space-y-6">
          
          {/* Action Cards Grid */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-text-muted">Available GitOps Dispatches</h4>
            
            {/* Custom Personalized Commit Input */}
            <div className="space-y-1.5 p-3 rounded-xl bg-bg-secondary/40 border border-border/60">
              <label htmlFor="custom-commit-msg" className="text-[9px] font-bold uppercase tracking-widest text-text-muted">
                Personalized Operation or Commit Message
              </label>
              <input
                id="custom-commit-msg"
                type="text"
                value={customCommitMessage}
                onChange={(e) => setCustomCommitMessage(e.target.value)}
                placeholder="e.g. feat: sync user liability structures & targets"
                className="w-full bg-bg-void border border-border/80 focus:border-accent-gold/40 rounded-xl px-3 py-1.5 text-xs text-text-primary placeholder:text-text-muted focus:outline-none transition-colors"
                spellCheck={false}
              />
            </div>

            <div className="grid grid-cols-1 gap-2">
              {details.actions.map((act, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => triggerGitopsAction(idx)}
                  disabled={isSyncing}
                  className={cn(
                    "card p-4 text-left transition-all relative flex items-start justify-between group cursor-pointer",
                    isSyncing && selectedActionIndex === idx
                      ? "border-accent-gold bg-accent-gold/5"
                      : "bg-bg-secondary border-border/60 hover:border-accent-gold/40 hover:bg-bg-secondary/80",
                    isSyncing && selectedActionIndex !== idx ? "opacity-40 cursor-not-allowed" : ""
                  )}
                >
                  <div className="space-y-1 pr-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-text-primary group-hover:text-accent-gold transition-colors">{act.title}</span>
                      <span className="text-[8px] font-mono uppercase tracking-wider text-text-muted bg-bg-void px-2 py-0.5 rounded border border-border/60">
                        branch: {act.type === "push" ? selectedBranch : act.branch}
                      </span>
                    </div>
                    <p className="text-[10px] text-text-muted leading-relaxed">{act.desc}</p>
                  </div>
                  <div>
                    {isSyncing && selectedActionIndex === idx ? (
                      <RefreshCw className="w-4 h-4 text-accent-gold animate-spin shrink-0" />
                    ) : (
                      <Send className="w-4 h-4 text-text-secondary group-hover:text-accent-gold group-hover:translate-x-0.5 transition-all shrink-0" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Live terminal output console logs */}
          <div className="card bg-bg-void border border-border font-mono text-[11px] h-48 flex flex-col overflow-hidden select-none">
            <div className="bg-bg-secondary/80 border-b border-border px-3 py-1.5 flex items-center justify-between text-[10px] text-text-muted uppercase tracking-wider font-bold shrink-0">
              <span className="flex items-center gap-1.5 leading-none">
                <Terminal className="w-3.5 h-3.5 text-accent-emerald" /> {gitProvider.toUpperCase()} MCP Server Log Output
              </span>
              <span className="text-accent-emerald animate-pulse">&#9679; STDLINKED</span>
            </div>
            
            <div className="p-4 flex-1 overflow-y-auto space-y-1.5 font-mono leading-relaxed bg-bg-void">
              {logs.length === 0 ? (
                <div className="h-full flex items-center justify-center text-text-muted text-[10px] italic">
                  Select a GitOps action above to dispatch simulated repository transactions...
                </div>
              ) : (
                logs.map((logLine, li) => (
                  <div 
                    key={li} 
                    className={cn(
                      "font-mono transition-opacity duration-300",
                      logLine.includes("SUCCESS") ? "text-accent-emerald font-bold" :
                      logLine.includes("ERROR") ? "text-accent-red font-bold" :
                      logLine.includes("MCP:") ? "text-accent-purple" : 
                      logLine.includes("GIT:") ? "text-accent-gold" : "text-text-secondary"
                    )}
                  >
                    {logLine}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recharts Simple Progress Chart */}
          <div className="card p-5 bg-bg-secondary/20 border-border/40 space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <h5 className="text-[9px] uppercase font-bold tracking-widest text-text-muted">Repository Diagnostics</h5>
                <h6 className="text-xs font-bold text-text-primary">Policy Operations Statistics</h6>
              </div>
              <span className="text-[10px] font-mono text-accent-emerald bg-accent-emerald/10 px-2 py-0.5 rounded border border-accent-emerald/20">
                Weekly History
              </span>
            </div>

            <div className="h-40 w-full select-none text-[10px] font-mono pt-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
                  <XAxis dataKey="day" stroke="var(--color-text-muted, #71717a)" fontSize={9} tickLine={false} />
                  <YAxis stroke="var(--color-text-muted, #71717a)" fontSize={9} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#09090b", borderColor: "rgba(255, 255, 255, 0.1)" }}
                    labelStyle={{ color: "#fafafa", fontSize: 10, fontWeight: "bold" }}
                    itemStyle={{ fontSize: 10 }}
                  />
                  <Legend verticalAlign="top" height={24} iconSize={8} wrapperStyle={{ fontSize: 9 }} />
                  <Bar dataKey="successful" name="Successful" fill="#10B981" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="failed" name="Failed" fill="#EF4444" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Local synchronization History with Export & Clear */}
          <div className="card p-5 bg-bg-secondary/20 border-border/40 space-y-3">
            <div className="flex items-center justify-between">
              <h5 className="text-[10px] uppercase font-bold tracking-widest text-text-muted">Repository Sync History</h5>
              
              <div className="flex items-center gap-3">
                {history.length > 0 && (
                  <button
                    onClick={handleExportHistory}
                    className="text-[9px] uppercase font-bold text-accent-emerald hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <Download className="w-3 h-3" /> Export JSON
                  </button>
                )}
                <button 
                  onClick={() => {
                    setHistory([]);
                    localStorage.removeItem("ww_gitops_history");
                  }}
                  className="text-[9px] uppercase font-bold text-accent-red hover:underline cursor-pointer"
                >
                  Clear Logs
                </button>
              </div>
            </div>

            {history.length === 0 ? (
              <p className="text-[10px] text-text-muted italic">No repository sync commands logged yet. Try committing policies above.</p>
            ) : (
              <div className="space-y-2">
                {history.map((h) => (
                  <div key={h.id} className="flex items-center justify-between p-2 rounded-lg bg-bg-secondary/40 border border-border/40 text-[10px] font-mono">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-accent-emerald" />
                      <div>
                        <span className="text-text-primary text-xs font-bold leading-normal">{h.action}</span>
                        <div className="text-text-muted flex items-center gap-1.5 mt-0.5">
                          <span className="uppercase text-[8px] font-bold text-accent-gold">{h.provider}</span>
                          <span>&bull;</span>
                          <span>Branch: {h.branch}</span>
                          <span>&bull;</span>
                          <span>{h.resourceId}</span>
                        </div>
                      </div>
                    </div>
                    <span className="text-[9px] text-text-muted">{new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
