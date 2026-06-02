import { motion } from "motion/react";
import { TrendingUp, ShieldCheck, Target, BrainCircuit, ChevronRight, Sparkles, Wallet, PieChart, ArrowUpRight, ArrowDownRight, CheckCircle2, Info, Trophy, Settings, ChevronDown, Check, GitBranch, Download, Share2, FileJson, Copy, X } from "lucide-react";
import { UserProfile, BudgetPlan } from "../types";
import { formatCurrency, cn } from "../lib/utils";
import { jsPDF } from "jspdf";
import { CURRENCIES } from "../constants";
import { useMemo, useState } from "react";
import { generateWealthAudit } from "../lib/gemini";
import { WealthPathChart } from "./WealthPathChart";
import { MarketInsights } from "./MarketInsights";
import { GitOpsControlCenter } from "./GitOpsControlCenter";

interface WealthDashboardProps {
  user: UserProfile;
  budget: BudgetPlan | null;
  onUnlockAchievement: (id: string) => void;
  onUpdateGitProvider?: (provider: "gitlab" | "github" | "bitbucket") => void;
  gitProvider?: "gitlab" | "github" | "bitbucket";
}

export function WealthDashboard({ user, budget, onUnlockAchievement, onUpdateGitProvider, gitProvider = "github" }: WealthDashboardProps) {
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState<string | null>(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [isGitDropdownOpen, setIsGitDropdownOpen] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copiedShareLink, setCopiedShareLink] = useState(false);

  const currency = CURRENCIES[user.currency] || CURRENCIES.USD;

  const hasBudget = !!budget;
  const hasGoals = (user.goals || []).length > 0;
  const hasAudit = !!auditResult;

  const checklist = [
    { id: 'budget', label: 'Set Up Your Budget Architect', completed: hasBudget, hash: '#budget', desc: 'Define your income and primary expenditures.' },
    { id: 'goals', label: 'Define a Financial Goal', completed: hasGoals, hash: '#simulator', desc: 'What are you saving for?' },
    { id: 'audit', label: 'Run AI Wealth Audit', completed: hasAudit, hash: '#dashboard', desc: 'Get personalized AI insights.' },
  ];

  const isNewUser = !hasBudget || !hasGoals;

  const healthScore = useMemo(() => {
    let score = 0;
    
    // 1. Savings Rate (Max 40 points)
    if (budget) {
      const totalExpenses = Object.values(budget.expenses).reduce((a, b) => a + b, 0);
      const savingsRate = budget.income > 0 ? ((budget.income - totalExpenses) / budget.income) * 100 : 0;
      score += Math.min(40, (savingsRate / 20) * 40);
    }

    // 2. Financial Literacy (Max 30 points)
    score += Math.min(30, (user.highScore / 150) * 30);

    // 3. Emergency Fund (Max 15 points)
    const netWorth = user.netWorth.assets - user.netWorth.liabilities;
    const targetEF = currency.emergencyTarget;
    score += Math.min(15, (netWorth / targetEF) * 15);

    // 4. Debt Management (Max 15 points)
    const debtRatio = user.netWorth.assets > 0 ? user.netWorth.liabilities / user.netWorth.assets : 0;
    score += Math.max(0, 15 - (debtRatio * 30));

    return Math.round(score);
  }, [user, budget, currency]);

  const masteryTier = useMemo(() => {
    if (healthScore >= 80) return { label: 'Diamond', color: 'text-[#b9f2ff]', bg: 'bg-[#b9f2ff]/5', border: 'border-[#b9f2ff]/20' };
    if (healthScore >= 60) return { label: 'Platinum', color: 'text-[#e5e4e2]', bg: 'bg-[#e5e4e2]/5', border: 'border-[#e5e4e2]/20' };
    if (healthScore >= 40) return { label: 'Gold', color: 'text-accent-gold', bg: 'bg-accent-gold/5', border: 'border-accent-gold/20' };
    if (healthScore >= 20) return { label: 'Silver', color: 'text-[#c0c0c0]', bg: 'bg-[#c0c0c0]/5', border: 'border-[#c0c0c0]/20' };
    return { label: 'Bronze', color: 'text-[#cd7f32]', bg: 'bg-[#cd7f32]/5', border: 'border-[#cd7f32]/20' };
  }, [healthScore]);

  const handleRunAudit = async () => {
    setIsAuditing(true);
    try {
      const result = await generateWealthAudit(user, budget);
      setAuditResult(result);
      onUnlockAchievement('audit_elite');
    } catch (error) {
      console.error("Audit failed:", error);
    } finally {
      setIsAuditing(false);
    }
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    
    // Core document theme & header band
    doc.setFillColor(17, 24, 39); // Deep space dark
    doc.rect(0, 0, 210, 42, "F");
    
    // Header title
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(234, 179, 8); // Golden sun
    doc.text("WEALTHWISE ELITE", 20, 25);
    
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(156, 163, 175);
    doc.text("PORTABLE INTUITIVE FINANCIAL REPORT & WEALTH TRAJECTORY", 20, 33);
    
    // Section 1: Client Metadata & Portfolio Scores
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(17, 24, 39);
    doc.text("1. EXECUTIVE SUMMARY PROFILE", 20, 56);
    doc.line(20, 59, 190, 59);
    
    // Text rows
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(55, 65, 81);
    
    doc.text(`Client Full Name: ${user.name}`, 20, 68);
    doc.text(`Recorded Age: ${user.age} Years Old`, 20, 75);
    doc.text(`Reporting Currency: ${user.currency} (${currency.name})`, 20, 82);
    doc.text(`Platform Entry Date: ${new Date(user.joinDate).toLocaleDateString()}`, 20, 89);
    
    doc.text(`Financial Score: ${healthScore} / 100`, 110, 68);
    doc.text(`Verified Tier Rank: ${masteryTier.label} Status`, 110, 75);
    doc.text(`Core Learning Focus: ${user.learningGoal}`, 110, 82);
    
    // Section 2: Budget Policies
    if (budget) {
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(13);
      doc.text("2. ACTIVE MONTHLY BUDGET CONFIGURATION", 20, 105);
      doc.line(20, 108, 190, 108);
      
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(9.5);
      doc.text(`Allocated Monthly Income: ${currency.symbol} ${budget.income.toLocaleString()}`, 20, 118);
      
      let y = 125;
      Object.entries(budget.expenses).forEach(([category, val]) => {
        if (typeof val === 'number') {
          doc.text(`- ${category.toUpperCase()}: ${currency.symbol} ${val.toLocaleString()}`, 25, y);
          y += 7;
        }
      });
    }

    // Section 3: Registered Financial Goals
    const userGoals = user.goals || [];
    if (userGoals.length > 0) {
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(13);
      doc.text("3. ACTIVE SAVINGS & COMPOUND GOALS", 20, 185);
      doc.line(20, 188, 190, 188);

      doc.setFont("Helvetica", "normal");
      doc.setFontSize(9.5);
      let gY = 196;
      userGoals.slice(0, 5).forEach((goal, idx) => {
        doc.text(`${idx + 1}. ${goal.title} (${goal.category})`, 20, gY);
        doc.text(`Target: ${currency.symbol} ${goal.targetAmount.toLocaleString()} | Deadline: ${new Date(goal.deadline).toLocaleDateString()}`, 25, gY + 5);
        gY += 13;
      });
    }
    
    // Page 2: Generative Artificial Audit advice (if present)
    if (auditResult) {
      doc.addPage();
      
      // Page 2 Brand header
      doc.setFillColor(17, 24, 39);
      doc.rect(0, 0, 210, 20, "F");
      
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(234, 179, 8);
      doc.text("WEALTHWISE ELITE - COMPREHENSIVE FINANCIAL AUDIT REPORT", 20, 13);
      
      doc.setFontSize(13);
      doc.setTextColor(17, 24, 39);
      doc.text("4. DEEP GENERATIVE ARTIFICIAL AUDIT", 20, 32);
      doc.line(20, 35, 190, 35);
      
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(55, 65, 81);
      
      // Clean up audit text and split to sizes
      const cleanAudit = auditResult.replace(/[\*\#\`\-\_]/g, "");
      const lines = doc.splitTextToSize(cleanAudit, 170);
      
      let lineY = 44;
      lines.forEach((line: string) => {
        if (lineY > 280) {
          doc.addPage();
          
          doc.setFillColor(17, 24, 39);
          doc.rect(0, 0, 210, 20, "F");
          doc.setFont("Helvetica", "bold");
          doc.setFontSize(11);
          doc.setTextColor(234, 179, 8);
          doc.text("WEALTHWISE ELITE - COMPREHENSIVE FINANCIAL AUDIT REPORT", 20, 13);
          
          doc.setFont("Helvetica", "normal");
          doc.setFontSize(9.5);
          doc.setTextColor(55, 65, 81);
          lineY = 32;
        }
        doc.text(line, 20, lineY);
        lineY += 6.5;
      });
    }
    
    // Save generated PDF
    doc.save(`${user.name.replace(/\s+/g, "_")}_WealthWise_Executive_Audit.pdf`);
    
    // Trigger success achievement check
    onUnlockAchievement('pdf_downloaded');
  };

  const handleDownloadJSON = () => {
    const rawBias = localStorage.getItem("ww_market_bias") || "neutral";
    const dataToExport = {
      exportedAt: new Date().toISOString(),
      clientProfile: {
        name: user.name,
        age: user.age,
        currency: user.currency,
        joinDate: user.joinDate,
        learningFocus: user.learningGoal,
        netWorth: user.netWorth,
        netWorthHealthScore: healthScore,
        masteryTier: masteryTier.label
      },
      activeBudget: budget ? {
        monthlyIncome: budget.income,
        allocatedExpenses: budget.expenses,
        monthlyNetSurplus: budget.income - Object.values(budget.expenses).reduce((a, b) => a + b, 0)
      } : null,
      financialGoals: user.goals || [],
      simulationSettings: {
        activeMarketBias: rawBias,
        portfolioSafetyAlarmThreshold: parseFloat(localStorage.getItem("ww_portfolio_drop_threshold") || "5.0")
      },
      auditRecommendation: auditResult || "No active audit. Run One-Click AI Audit to generate expert analysis."
    };

    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(dataToExport, null, 2)
    )}`;
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", jsonString);
    downloadAnchor.setAttribute(
      "download",
      `${user.name.replace(/\s+/g, "_")}_WealthWise_Portfolio_Audit.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    // Trigger local Alert message for copy action consistency
    const event = new CustomEvent("ww-trigger-alert", {
      detail: {
        type: "success",
        title: "Simulation Data Exported",
        message: "Your current financial parameters, dynamic thresholds, and offline auditing metrics have been downloaded inside a structured JSON successfully."
      }
    });
    window.dispatchEvent(event);
    onUnlockAchievement("json_downloaded");
  };

  const shareSnippet = `I just analyzed my wealth statistics on WealthWise Elite! I scored a ${healthScore}/100 Financial Health score and achieved status of ${masteryTier.label} Status Tier! Check out your dynamic investment and budget roadmap rules:`;
  const shareLink = `${window.location.origin}/?invite=true&score=${healthScore}&tier=${masteryTier.label.toLowerCase()}&name=${encodeURIComponent(user.name)}`;

  const handleCopyShare = async () => {
    const fullSnippet = `${shareSnippet}\n👉 ${shareLink}`;
    try {
      await navigator.clipboard.writeText(fullSnippet);
      setCopiedShareLink(true);
      setTimeout(() => setCopiedShareLink(false), 2500);

      const event = new CustomEvent("ww-trigger-alert", {
        detail: {
          type: "success",
          title: "Share Snippet Copied",
          message: "The invitation snippet and net worth achievements score card have been copied, ready for the user offline."
        }
      });
      window.dispatchEvent(event);
    } catch (err) {
      console.error("Clipboard copy failed", err);
    }
  };

  return (
    <div className="container mx-auto px-6 py-12 space-y-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-4 border-b border-white/[0.04]">
        <div className="space-y-2 text-left">
          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-display font-medium tracking-tight flex flex-wrap items-center gap-3"
          >
            <span>Welcome back,</span>
            <span className="text-accent-gold italic font-semibold">{user.name}</span>
            <div className={cn("inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-[0.15em] border backdrop-blur-md shadow-sm", masteryTier.bg, masteryTier.color, masteryTier.border)}>
              <Trophy className="w-3 h-3" /> {masteryTier.label} Tier
            </div>
          </motion.h1>
          <div className="flex flex-wrap items-center gap-6">
            <p className="text-text-secondary text-lg">Your Personal Wealth Architect is ready.</p>
            
            {/* Custom GitOps Dropdown Selector */}
            <div className="relative z-40">
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-text-muted font-bold uppercase tracking-widest">Active GitOps Engine</span>
                <div className="relative">
                  <button
                    onClick={() => setIsGitDropdownOpen(!isGitDropdownOpen)}
                    type="button"
                    className="flex items-center gap-2 bg-bg-secondary border border-border/80 rounded-xl px-3 py-1.5 text-xs font-mono font-bold uppercase text-text-primary hover:border-accent-gold/40 transition-colors cursor-pointer select-none"
                  >
                    <GitBranch className="w-3.5 h-3.5 text-accent-gold" />
                    <span>{gitProvider}</span>
                    <ChevronDown className={cn("w-3.5 h-3.5 text-text-muted transition-transform duration-200", isGitDropdownOpen ? "rotate-180" : "")} />
                  </button>

                  {isGitDropdownOpen && (
                    <>
                      <div className="fixed inset-0" onClick={() => setIsGitDropdownOpen(false)} />
                      <div className="absolute top-full mt-2 left-0 w-64 bg-bg-void border border-border rounded-xl shadow-2xl p-2 space-y-1 backdrop-blur-md z-50">
                        <div className="px-2 py-1.5 text-[9px] uppercase font-bold text-text-muted tracking-wider border-b border-border/40 mb-1">
                          Select Version Control Engine
                        </div>
                        {(["github", "gitlab", "bitbucket"] as const).map((p) => {
                          const active = gitProvider === p;
                          const labels = {
                            github: { title: "GitHub", desc: "Fast imports & open-source sync." },
                            gitlab: { title: "GitLab", desc: "Strict policy compliance audits." },
                            bitbucket: { title: "Bitbucket", desc: "Corporate-grade policy tracking." }
                          };
                          return (
                            <button
                              key={p}
                              type="button"
                              onClick={() => {
                                onUpdateGitProvider?.(p);
                                setIsGitDropdownOpen(false);
                              }}
                              className={cn(
                                "w-full text-left p-2 rounded-lg flex items-center justify-between transition-colors cursor-pointer",
                                active 
                                  ? "bg-accent-gold/10 text-accent-gold font-bold" 
                                  : "text-text-secondary hover:bg-bg-secondary hover:text-text-primary"
                              )}
                            >
                              <div>
                                <span className="text-xs">{labels[p].title}</span>
                                <p className="text-[9px] text-text-muted leading-tight mt-0.5">{labels[p].desc}</p>
                              </div>
                              {active && <Check className="w-3.5 h-3.5 text-accent-gold" />}
                            </button>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>

                {/* Settings Gear Toggle Button */}
                <button
                  onClick={() => setShowSettingsModal(true)}
                  type="button"
                  title="Configure Wealth-As-Code Settings"
                  className="bg-bg-secondary hover:bg-bg-secondary/80 border border-border/80 rounded-xl p-1.5 text-text-secondary hover:text-accent-gold transition-colors cursor-pointer"
                >
                  <Settings className="w-4 h-4" />
                </button>
              </div>
            </div>
            <button 
              onClick={() => window.location.reload()} 
              className="text-[9px] text-accent-gold hover:underline font-bold uppercase tracking-widest"
            >
              Restart Tutorial
            </button>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 shrink-0 self-start sm:self-auto w-full sm:w-auto">
          {/* Share score card button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setShowShareModal(true);
              onUnlockAchievement("share_elite");
            }}
            type="button"
            title="Share Achievement Card"
            className="flex items-center justify-center h-12 w-12 border border-border/80 hover:border-accent-blue/40 text-text-secondary hover:text-accent-blue transition-all cursor-pointer rounded-xl bg-bg-secondary/20"
          >
            <Share2 className="w-5 h-5 text-accent-blue" />
          </motion.button>

          {/* New Offline JSON Download button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleDownloadJSON}
            type="button"
            title="Export Simulation Inputs & Results (JSON)"
            className="flex items-center justify-center h-12 w-12 border border-border/80 hover:border-accent-gold/40 text-text-secondary hover:text-accent-gold transition-all cursor-pointer rounded-xl bg-bg-secondary/20"
          >
            <FileJson className="w-5 h-5 text-accent-gold" />
          </motion.button>

          {/* Export Report PDF */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleDownloadPDF}
            className="btn-secondary flex items-center justify-center gap-2 px-5 py-3 text-xs font-bold border border-border hover:border-accent-gold/40 hover:text-accent-gold transition-all cursor-pointer rounded-xl bg-bg-secondary/20 text-text-secondary h-12"
          >
            <Download className="w-4 h-4 text-accent-gold" />
            <span>Export Report</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRunAudit}
            disabled={isAuditing}
            className="btn-primary flex items-center justify-center gap-2.5 px-6 py-3 text-xs group text-bg-void font-extrabold cursor-pointer h-12"
          >
            {isAuditing ? (
              <BrainCircuit className="w-4 h-4 animate-spin text-bg-void" />
            ) : (
              <Sparkles className="w-4 h-4 text-bg-void group-hover:animate-pulse" />
            )}
            {isAuditing ? "Analyzing..." : "One-Click AI Audit"}
          </motion.button>
        </div>
      </div>

      {/* Elite Status Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { label: "Overall Mastery", value: `${healthScore}%`, color: "text-accent-gold" },
          { label: "Savings Rate", value: budget ? `${Math.round(((budget.income - Object.values(budget.expenses).reduce((a, b) => a + b, 0)) / budget.income) * 100)}%` : "0%", color: "text-accent-emerald" },
          { label: "Elite Tier", value: masteryTier.label, color: masteryTier.color },
          { label: "Achievements", value: `${user.achievements?.length || 0}/6`, color: "text-accent-blue" }
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="card p-6 border-white/[0.04] bg-white/[0.01] hover:bg-white/[0.03] flex flex-col items-center text-center space-y-1 transition-all"
          >
            <div className="text-[9px] text-text-muted font-bold uppercase tracking-[0.15em]">{stat.label}</div>
            <div className={cn("text-2xl font-display font-semibold", stat.color)}>{stat.value}</div>
          </motion.div>
        ))}
      </div>

      {/* Getting Started Checklist for New Users */}
      {isNewUser && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-8 border-accent-gold/10 bg-accent-gold/[0.02] space-y-6"
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1 text-left">
              <h2 className="text-xl font-display font-medium flex items-center gap-2 text-text-primary">
                <Sparkles className="w-5 h-5 text-accent-gold" /> Your Path to Wealth Elite
              </h2>
              <p className="text-text-secondary text-xs">Complete these baseline tasks to unlock your personalized financial audit recommendations.</p>
            </div>
            <div className="px-3.5 py-1.5 rounded-full bg-accent-gold/5 border border-accent-gold/15 text-accent-gold text-[9px] font-bold uppercase tracking-widest">
              {checklist.filter(i => i.completed).length} / {checklist.length} Completed
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {checklist.map((item) => (
              <a 
                key={item.id}
                href={item.hash}
                className={cn(
                  "p-5 rounded-2xl border transition-all flex flex-col gap-3 group text-left",
                  item.completed 
                    ? "bg-accent-emerald/[0.02] border-accent-emerald/10 opacity-70 hover:opacity-100" 
                    : "bg-white/[0.01] border-white/[0.04] hover:border-accent-gold/20 hover:bg-accent-gold/[0.03]"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className={cn(
                    "w-7 h-7 rounded-lg flex items-center justify-center transition-all",
                    item.completed ? "bg-accent-emerald/10 text-accent-emerald" : "bg-bg-primary border border-white/[0.06] text-text-muted group-hover:border-accent-gold/30"
                  )}>
                    {item.completed ? <CheckCircle2 className="w-4 h-4" /> : <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />}
                  </div>
                </div>
                <div>
                  <div className={cn("font-bold text-xs uppercase tracking-wide", item.completed ? "line-through text-text-muted" : "text-text-primary")}>{item.label}</div>
                  <p className="text-[10px] text-text-secondary leading-relaxed mt-1">{item.desc}</p>
                </div>
              </a>
            ))}
          </div>
        </motion.div>
      )}

      {/* Achievements Section */}
      {(user.achievements || []).length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-secondary flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-accent-gold" /> Elite Achievements
            </h3>
            <div className="flex items-center gap-4">
              {user.achievements && user.achievements.length < 6 && (
                <span className="text-[9px] text-text-muted italic">Simulate more modules to unlock next achievements...</span>
              )}
              <span className="text-[10px] text-accent-gold font-bold">{user.achievements?.length} / 6 Earned</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            {user.achievements?.map((achievement) => (
              <div 
                key={achievement.id}
                title={`${achievement.title}: ${achievement.description}`}
                className="group relative"
              >
                <div className="w-11 h-11 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-accent-gold/30 flex items-center justify-center text-xl transition-all duration-300 hover:scale-105 hover:bg-accent-gold/5 cursor-help shadow-sm">
                  {achievement.icon}
                </div>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 bg-bg-secondary border border-white/[0.06] rounded-xl text-[10px] text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10 shadow-xl">
                  <div className="font-bold text-accent-gold uppercase tracking-wider">{achievement.title}</div>
                  <div className="text-text-secondary mt-1 text-[9px] leading-relaxed">{achievement.description}</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Insights and Projection Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="xl:col-span-2 card p-8 space-y-6"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-secondary flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-accent-gold" /> Strategic Wealth Pathing
            </h3>
            <div className="flex bg-white/[0.02] p-1 rounded-lg border border-white/[0.04]">
              <button className="px-3 py-1 text-[9px] font-bold bg-white/[0.04] text-accent-gold rounded-md shadow-sm uppercase tracking-wider">6M Projection</button>
            </div>
          </div>
          <WealthPathChart user={user} budget={budget} />
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
          className="space-y-8"
        >
          <MarketInsights />
        </motion.div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Health Score Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card p-8 flex flex-col items-center justify-center text-center space-y-6 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-4">
            <ShieldCheck className="w-6 h-6 text-accent-gold opacity-10" />
          </div>
          
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-secondary">Financial Health Score</h3>
          
          <div className="relative w-48 h-48 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <defs>
                <linearGradient id="goldGaugeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#E2C9A1" />
                  <stop offset="100%" stopColor="#9F8259" />
                </linearGradient>
              </defs>
              <circle
                cx="96"
                cy="96"
                r="84"
                stroke="currentColor"
                strokeWidth="4.5"
                fill="transparent"
                className="text-white/[0.02]"
              />
              <circle
                cx="96"
                cy="96"
                r="84"
                stroke="url(#goldGaugeGrad)"
                strokeWidth="5"
                fill="transparent"
                strokeDasharray={527.7}
                strokeDashoffset={527.7 - (527.7 * healthScore) / 100}
                className="transition-all duration-1000 ease-out"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-6xl font-display font-light text-text-primary tracking-tighter">{healthScore}</span>
              <span className="text-[8px] text-text-muted uppercase tracking-[0.2em] font-bold">Out of 100</span>
            </div>
          </div>

          <p className="text-xs text-text-secondary max-w-[200px] leading-relaxed">
            {healthScore > 80 ? "Outstanding architecture! You operate in the top decile of structured financial planners." : 
             healthScore > 60 ? "Solid framework. Fine-tuning your allocation rates could elevate your score." :
             "Let's focus on defining a budget baseline to strengthen your core foundation."}
          </p>
        </motion.div>

        {/* Wealth Summary Card */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
          <div className="card p-8 space-y-6 relative group overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-[0.02] group-hover:scale-105 group-hover:opacity-[0.05] transition-all duration-300">
              <Wallet className="w-14 h-14" />
            </div>
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-secondary">Net Worth</h3>
            <div className="space-y-1">
              <div className="text-4xl font-display font-light text-text-primary tracking-tight">
                {formatCurrency(user.netWorth.assets - user.netWorth.liabilities, user.currency, currency.locale)}
              </div>
              {budget && budget.history && budget.history.length > 1 && (
                <div className={cn(
                  "flex items-center gap-1 text-xs font-semibold uppercase tracking-wider",
                  budget.history[budget.history.length - 1].total < budget.history[budget.history.length - 2].total ? "text-accent-emerald" : "text-[#FF6B6B]"
                )}>
                  {budget.history[budget.history.length - 1].total < budget.history[budget.history.length - 2].total ? <TrendingUp className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                  <span>
                    {Math.abs(Math.round(((budget.history[budget.history.length - 1].total - budget.history[budget.history.length - 2].total) / budget.history[budget.history.length - 2].total) * 100))}% vs last month
                  </span>
                </div>
              )}
            </div>
            <div className="pt-6 border-t border-white/[0.04] grid grid-cols-2 gap-4">
              <div>
                <div className="text-[9px] text-text-muted uppercase tracking-wider font-bold">Total Assets</div>
                <div className="text-base font-mono font-bold text-text-primary">{formatCurrency(user.netWorth.assets, user.currency, currency.locale)}</div>
              </div>
              <div>
                <div className="text-[9px] text-text-muted uppercase tracking-wider font-bold">Total Liabilities</div>
                <div className="text-base font-mono font-bold text-[#FF6B6B]">{formatCurrency(user.netWorth.liabilities, user.currency, currency.locale)}</div>
              </div>
            </div>
          </div>

          <div className="card p-8 space-y-6 relative group overflow-hidden cursor-pointer hover:border-accent-gold/20" onClick={() => window.location.hash = "#portfolio"}>
            <div className="absolute top-0 right-0 p-6 opacity-[0.02] group-hover:scale-105 group-hover:opacity-[0.05] transition-all duration-300">
              <PieChart className="w-14 h-14" />
            </div>
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-secondary">Portfolio Allocation</h3>
            <div className="space-y-1">
              <div className="text-4xl font-display font-light text-accent-gold tracking-tight">
                {formatCurrency(user.portfolio?.totalValue || 0, user.currency, currency.locale)}
              </div>
              {user.portfolio && (
                <div className={cn(
                  "flex items-center gap-1 text-xs font-semibold uppercase tracking-wider",
                  user.portfolio.change24h >= 0 ? "text-accent-emerald" : "text-[#FF6B6B]"
                )}>
                  {user.portfolio.change24h >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                  <span>{user.portfolio.change24h >= 0 ? "+" : ""}{user.portfolio.change24h}% (24h)</span>
                </div>
              )}
            </div>
            <div className="pt-6 border-t border-white/[0.04] flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="text-[9px] text-text-muted uppercase tracking-wider font-bold">Simulated Alpha</div>
                <div className="text-base font-mono font-bold text-accent-emerald">
                  {user.portfolio && user.portfolio.holdings.length > 0 ? "+4.2%" : "--"}
                </div>
              </div>
              <div className="space-y-0.5 text-right">
                <div className="text-[9px] text-text-muted uppercase tracking-wider font-bold">Sharpe Ratio</div>
                <div className="text-base font-mono font-bold text-accent-gold">
                  {user.portfolio && user.portfolio.holdings.length > 0 ? "1.85" : "--"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* GitOps Policy Control Center */}
      <GitOpsControlCenter 
        user={user}
        budget={budget}
        gitProvider={gitProvider}
        onUnlockAchievement={onUnlockAchievement}
      />

      {/* Audit Result / Action Items */}
      {auditResult && (
        <motion.div 
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-8 border-accent-gold/15 bg-accent-gold/[0.01] space-y-8 text-left"
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-2xl bg-accent-gold/10 flex items-center justify-center shadow-inner">
                <Sparkles className="w-5 h-5 text-accent-gold" />
              </div>
              <div>
                <h2 className="text-xl font-display font-medium text-text-primary">AI Wealth Audit Insights</h2>
                <p className="text-text-secondary text-xs">Generated based on your local device datasets.</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleDownloadPDF}
                type="button"
                className="btn-secondary py-1.5 px-3.5 flex items-center gap-2 text-xs font-semibold text-text-primary bg-bg-secondary hover:bg-bg-secondary/80 rounded-xl border border-border/80 hover:border-accent-gold/30 hover:text-accent-gold transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-accent-gold" />
                <span>Export to PDF</span>
              </button>
              <button
                onClick={handleDownloadJSON}
                type="button"
                className="btn-secondary py-1.5 px-3.5 flex items-center gap-2 text-xs font-semibold text-text-primary bg-bg-secondary hover:bg-bg-secondary/80 rounded-xl border border-border/80 hover:border-accent-gold/30 hover:text-accent-gold transition-all cursor-pointer"
              >
                <FileJson className="w-3.5 h-3.5 text-accent-gold" />
                <span>Export to JSON</span>
              </button>
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-bg-secondary border border-border text-[10px] font-bold uppercase tracking-widest text-text-muted">
                <Info className="w-3 h-3" /> Educational Only
              </div>
            </div>
          </div>
          
          <div className="prose prose-invert max-w-none prose-p:text-text-secondary prose-p:text-xs prose-p:leading-relaxed prose-strong:text-accent-gold prose-headings:text-text-primary">
            {auditResult.split('\n').map((line, i) => (
              <p key={i} className="mb-2.5 font-light">{line}</p>
            ))}
          </div>

          <div className="pt-6 border-t border-white/[0.04]">
            <p className="text-[8px] text-text-muted italic text-center uppercase tracking-widest">
              Educational projection only. Not financial advice. Device local verification layer.
            </p>
          </div>
        </motion.div>
      )}

      {/* Quick Navigation / Mastery Modules */}
      <div className="space-y-4 text-left">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-secondary flex items-center gap-1.5">
          <BrainCircuit className="w-4 h-4 text-accent-gold" /> Core Mastery Modules
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { title: "MacroPulse Engine", desc: "Economic simulator", icon: <BrainCircuit />, hash: "#macropulse", color: "text-accent-gold" },
            { title: "TrendMarket", desc: "Pop-culture trading", icon: <TrendingUp />, hash: "#trendmarket", color: "text-accent-emerald" },
            { title: "LiveOrLease", desc: "Rent vs Buy engine", icon: <PieChart />, hash: "#liveorlease", color: "text-accent-blue" },
            { title: "MockYield DeFi", desc: "Staking mastery", icon: <Sparkles />, hash: "#mockyield", color: "text-[#E2C9A1]" },
          ].map((item, i) => (
            <motion.a
              key={i}
              href={item.hash}
              whileHover={{ y: -3, backgroundColor: "var(--color-bg-card-hover)" }}
              className="card p-6 flex flex-col gap-4 group border-white/[0.03] transition-all text-left"
            >
              <div className={cn("w-10 h-10 rounded-xl bg-white/[0.02] border border-white/[0.04] flex items-center justify-center group-hover:scale-105 transition-transform", item.color)}>
                {item.icon}
              </div>
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wide text-text-primary">{item.title}</h4>
                <p className="text-[9px] text-text-secondary uppercase tracking-widest mt-1">{item.desc}</p>
              </div>
              <div className="pt-2 flex items-center text-[9px] font-bold text-accent-gold opacity-0 group-hover:opacity-100 transition-opacity">
                ENTER MODULE <ChevronRight className="w-3 h-3 ml-0.5" />
              </div>
            </motion.a>
          ))}
        </div>
      </div>

      {/* Quick Navigation / Next Steps */}
      <div className="space-y-4 text-left">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-secondary flex items-center gap-1.5">
          <Target className="w-4 h-4 text-accent-gold" /> Strategic Management
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: "Portfolio Allocation", desc: "Balance your baseline assets and alpha triggers.", icon: <PieChart />, hash: "#portfolio" },
            { title: "Budget Architect", desc: "Optimize savings and trim redundant expenditures.", icon: <TrendingUp />, hash: "#budget" },
            { title: "Academic Quizzes", desc: "Complete literacy exercises to lift your health score.", icon: <Target />, hash: "#quiz" },
          ].map((item, i) => (
            <motion.a
              key={i}
              href={item.hash}
              whileHover={{ x: 3, backgroundColor: "var(--color-bg-card-hover)" }}
              className="card p-6 flex items-center justify-between group border-white/[0.03] transition-all text-left"
            >
              <div className="flex items-center gap-4">
                <div className="w-9 h-9 rounded-xl bg-white/[0.02] border border-white/[0.04] flex items-center justify-center text-accent-gold group-hover:scale-105 transition-transform">
                  {item.icon}
                </div>
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wide text-text-primary">{item.title}</h4>
                  <p className="text-[11px] text-text-secondary mt-0.5 font-light">{item.desc}</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-text-muted group-hover:text-accent-gold transition-colors" />
            </motion.a>
          ))}
        </div>
      </div>

      {/* GitOps Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-bg-void/90 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="card max-w-lg w-full p-8 space-y-6 relative border-accent-gold/30 shadow-[0_0_50px_rgba(234,179,8,0.1)] text-left"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 text-[9px] uppercase font-bold text-accent-gold tracking-widest bg-accent-gold/10 px-2.5 py-0.5 rounded-full border border-accent-gold/20">
                  <Settings className="w-3 h-3 text-accent-gold" /> Wealth-As-Code Engine
                </div>
                <h3 className="text-2xl font-bold font-display text-text-primary">GitOps Configuration</h3>
              </div>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="text-text-secondary hover:text-text-primary text-2xl font-normal leading-none cursor-pointer"
                type="button"
              >
                &times;
              </button>
            </div>

            <p className="text-text-secondary text-xs leading-relaxed">
              WealthWise Elite allows you to compile and track your entire wealth architecture (portfolios, simulations, budget laws, inflation buffers) using Git version control rules. Select your preferred provider below to dynamically adjust the AI agent's tracking logic.
            </p>

            <div className="grid grid-cols-1 gap-3">
              {[
                { id: "github" as const, name: "GitHub", subtitle: "Public Cloud Repos", desc: "Leverage standard GitHub workflows. The AI agent commits target system rules and log issues directly into your codebase.", color: "text-white border-white/10 bg-zinc-900/50 hover:bg-zinc-900" },
                { id: "gitlab" as const, name: "GitLab", subtitle: "DevOps & MCP Pipelines", desc: "Integrate into strict corporate Git plans. Features continuous deployment, compliance merge request reviews, and auditing.", color: "text-accent-gold border-accent-gold/20 bg-amber-500/5 hover:bg-amber-500/10" },
                { id: "bitbucket" as const, name: "Bitbucket", subtitle: "Atlassian Workspace", desc: "Align with professional enterprise policy databases. Secure and integrated directly with Atlassian task tracking.", color: "text-blue-400 border-blue-400/20 bg-blue-500/10 hover:bg-blue-500/20" }
              ].map((provider) => {
                const isSelected = gitProvider === provider.id;
                return (
                  <button
                    key={provider.id}
                    onClick={() => onUpdateGitProvider?.(provider.id)}
                    type="button"
                    className={cn(
                      "p-4 rounded-xl border text-left flex items-start justify-between transition-all relative cursor-pointer",
                      isSelected 
                        ? `${provider.color} border border-accent-gold shadow-[0_0_15px_rgba(234,179,8,0.05)]`
                        : "bg-bg-secondary border-border/40 hover:bg-bg-secondary/80 text-text-secondary"
                    )}
                  >
                    <div className="space-y-1 pr-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold">{provider.name}</span>
                        <span className="text-[8px] font-mono uppercase tracking-wider text-text-muted font-bold">({provider.subtitle})</span>
                      </div>
                      <p className="text-[10px] text-text-muted leading-relaxed">{provider.desc}</p>
                    </div>
                    {isSelected ? (
                      <div className="w-5 h-5 rounded-full bg-accent-gold text-bg-void flex items-center justify-center border border-accent-gold/40 shrink-0">
                        <Check className="w-3 h-3 stroke-[2.5]" />
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-full border border-border flex items-center justify-center shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowSettingsModal(false)}
                className="btn-primary py-2 px-6 text-xs font-bold uppercase tracking-widest cursor-pointer"
              >
                Apply & Close
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Share Score Card Dialog */}
      {showShareModal && (
        <div className="fixed inset-0 bg-bg-void/85 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-bg-primary border border-border p-8 rounded-2xl max-w-lg w-full space-y-6 shadow-[0_0_50px_rgba(59,130,246,0.1)] relative"
          >
            <div className="flex items-center justify-between border-b border-border/40 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-accent-blue/10 flex items-center justify-center text-accent-blue">
                  <Share2 className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold uppercase tracking-widest text-text-primary">Corporate Share Center</h3>
              </div>
              <button
                onClick={() => setShowShareModal(false)}
                className="text-text-secondary hover:text-text-primary cursor-pointer transition-colors p-1"
                type="button"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-text-secondary text-xs leading-relaxed text-left">
              Generate credentials verification invites and show off your elite performance directly to other professionals or clients. Anyone who uses this custom invite can baseline their models relative to your success indicators.
            </p>

            {/* Achievement Card Preview */}
            <div className="border border-accent-blue/20 bg-accent-blue/5 p-5 rounded-xl space-y-4 text-left">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider text-accent-blue font-bold">Credential Summary</span>
                <span className={cn("text-[9px] font-bold px-2 py-0.5 rounded uppercase font-mono border", masteryTier.border, masteryTier.bg, masteryTier.color)}>
                  {masteryTier.label} Status
                </span>
              </div>
              <div className="space-y-1">
                <h4 className="text-xl font-display font-black text-text-primary tracking-tight">{user.name}</h4>
                <p className="text-xs text-text-secondary">Overall Mastery Rating: <strong className="text-accent-gold">{healthScore}% / 100%</strong></p>
              </div>
              <p className="text-[11px] text-text-muted italic bg-bg-void/40 p-2.5 border border-border/40 rounded-lg select-all">
                "{shareSnippet}"
              </p>
            </div>

            {/* Action Group */}
            <div className="flex flex-col gap-2.5 pt-2">
              <button
                onClick={handleCopyShare}
                type="button"
                className="btn-primary w-full flex items-center justify-center gap-2 py-3 px-4 font-bold text-xs uppercase tracking-widest cursor-pointer text-bg-void"
              >
                {copiedShareLink ? <Check className="w-4 h-4 text-bg-void" /> : <Copy className="w-4 h-4 text-bg-void" />}
                <span>{copiedShareLink ? "Verified Snippet Copied!" : "Copy Snippet & Invite Link"}</span>
              </button>
              
              <div className="grid grid-cols-2 gap-2 font-sans font-bold">
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`${shareSnippet} ${shareLink}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary flex items-center justify-center gap-2 border border-border py-2.5 text-[10px] font-bold uppercase tracking-wider hover:border-accent-blue/30 hover:text-accent-blue rounded-xl select-none cursor-pointer bg-bg-secondary/10"
                >
                  Share on Twitter
                </a>
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareLink)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary flex items-center justify-center gap-2 border border-border py-2.5 text-[10px] font-bold uppercase tracking-wider hover:border-accent-blue/30 hover:text-accent-blue rounded-xl select-none cursor-pointer bg-bg-secondary/10"
                >
                  Share on LinkedIn
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
