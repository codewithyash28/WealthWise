import { motion } from "motion/react";
import { TrendingUp, ShieldCheck, Target, BrainCircuit, ChevronRight, Sparkles, Wallet, PieChart, ArrowUpRight, ArrowDownRight, CheckCircle2, Info, Trophy, Settings, ChevronDown, Check, GitBranch, Download, Share2, FileJson, Copy, X, Calendar, Lock, Flame, Sliders, BookOpen, Coins, Star, ShoppingBag } from "lucide-react";
import { UserProfile, BudgetPlan } from "../types";
import { formatCurrency, cn } from "../lib/utils";
import { Logo } from "./Logo";
import { jsPDF } from "jspdf";
import { CURRENCIES } from "../constants";
import { useMemo, useState } from "react";
import { generateWealthAudit } from "../lib/gemini";
import { WealthPathChart } from "./WealthPathChart";
import { MarketInsights } from "./MarketInsights";
import { GitOpsControlCenter } from "./GitOpsControlCenter";
import { AgentOperationsLogs } from "./AgentOperationsLogs";
import { SHOP_ITEMS, ShopItem } from "./QuestsHub";

interface WealthDashboardProps {
  user: UserProfile;
  budget: BudgetPlan | null;
  onUnlockAchievement: (id: string) => void;
  onUpdateGitProvider?: (provider: "gitlab" | "github" | "bitbucket") => void;
  gitProvider?: "gitlab" | "github" | "bitbucket";
  onUpdateProfile?: (profile: UserProfile) => void;
}

export function WealthDashboard({ user, budget, onUnlockAchievement, onUpdateGitProvider, gitProvider = "github", onUpdateProfile }: WealthDashboardProps) {
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState<string | null>(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [isGitDropdownOpen, setIsGitDropdownOpen] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copiedShareLink, setCopiedShareLink] = useState(false);
  const [intentInput, setIntentInput] = useState("");

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
    if (healthScore >= 80) return { label: 'Diamond', color: 'text-[#b9f2ff]', bg: 'bg-[#b9f2ff]/10', border: 'border-[#b9f2ff]/20' };
    if (healthScore >= 60) return { label: 'Platinum', color: 'text-[#e5e4e2]', bg: 'bg-[#e5e4e2]/10', border: 'border-[#e5e4e2]/20' };
    if (healthScore >= 40) return { label: 'Gold', color: 'text-accent-gold', bg: 'bg-accent-gold/10', border: 'border-accent-gold/20' };
    if (healthScore >= 20) return { label: 'Silver', color: 'text-[#c0c0c0]', bg: 'bg-[#c0c0c0]/10', border: 'border-[#c0c0c0]/20' };
    return { label: 'Bronze', color: 'text-[#cd7f32]', bg: 'bg-[#cd7f32]/10', border: 'border-[#cd7f32]/20' };
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
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3 flex-wrap">
            <Logo size="md" iconOnly />
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl font-display font-bold tracking-tight flex flex-wrap items-center gap-3"
            >
              Welcome back, <span className="text-accent-gold">{user.name}</span>
              <div className={cn("inline-flex items-center gap-1.5 ml-1 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border", masteryTier.bg, masteryTier.color, masteryTier.border)}>
                <Trophy className="w-3 h-3" /> {masteryTier.label} Tier
              </div>
            </motion.h1>
          </div>
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
              onClick={() => window.location.reload()} // Simple way to trigger tutorial if we add a check for it, or I can just add a state
              className="text-xs text-accent-gold hover:underline font-bold uppercase tracking-widest"
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: "Overall Mastery", value: `${healthScore}%`, color: "text-accent-gold" },
          { label: "Savings Rate", value: budget ? `${Math.round(((budget.income - Object.values(budget.expenses).reduce((a, b) => a + b, 0)) / budget.income) * 100)}%` : "0%", color: "text-accent-emerald" },
          { label: "Elite Tier", value: masteryTier.label, color: masteryTier.color },
          { label: "Achievements", value: `${user.achievements?.length || 0}/6`, color: "text-accent-blue" }
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="card p-6 border-border/40 bg-bg-secondary/20 flex flex-col items-center text-center space-y-1"
          >
            <div className="text-[10px] text-text-muted font-bold uppercase tracking-widest">{stat.label}</div>
            <div className={cn("text-2xl font-display font-bold", stat.color)}>{stat.value}</div>
          </motion.div>
        ))}
      </div>

      {/* Daily Financial Intent & Consistency Calendar Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Daily Financial Intent Input Card */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6 border-border/60 bg-bg-secondary/20 space-y-4"
        >
          <div className="flex items-center gap-2 border-b border-border/40 pb-3">
            <Calendar className="w-5 h-5 text-accent-gold" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-text-primary flex items-center gap-1.5">
              Daily Financial Intent <span className="animate-pulse text-[10px] bg-accent-gold/10 text-accent-gold border border-accent-gold/20 px-2.5 py-0.5 rounded-full font-mono font-bold uppercase">Focus</span>
            </h3>
          </div>

          {(!user.dailyIntent || !user.dailyIntent.text || user.dailyIntent.date !== new Date().toLocaleDateString()) ? (
            <div className="space-y-4">
              <p className="text-xs text-text-secondary leading-relaxed">
                Set a small, actionable focus for today. Consistently honoring your intent increases your academic level and awards gold coins.
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={intentInput}
                  onChange={(e) => setIntentInput(e.target.value)}
                  placeholder="e.g., Read 1 economics node, skip takeout, review budget..."
                  className="flex-1 bg-bg-void border border-border rounded-xl px-4 py-2.5 text-xs text-text-primary placeholder:text-text-muted focus:outline-hidden focus:ring-1 focus:ring-accent-gold/50"
                />
                <button
                  onClick={() => {
                    if (!intentInput.trim()) return;
                    const updated = {
                      ...user,
                      dailyIntent: {
                        text: intentInput,
                        completed: false,
                        date: new Date().toLocaleDateString()
                      }
                    };
                    onUpdateProfile?.(updated);
                    setIntentInput("");
                    window.dispatchEvent(new CustomEvent('ww-trigger-alert', {
                      detail: {
                        type: 'info',
                        title: 'Focus Committed! 🎯',
                        message: `Today's intent set: "${intentInput}". Honor it to earn rewards!`
                      }
                    }));
                  }}
                  className="btn-primary px-4 py-2.5 text-xs font-bold text-bg-void whitespace-nowrap cursor-pointer rounded-xl"
                >
                  Commit Focus
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4 p-4 rounded-xl bg-bg-void/40 border border-border/40">
                <div className="space-y-1">
                  <div className="text-[10px] text-text-muted font-bold uppercase tracking-widest font-mono">Today's Discipline Focus</div>
                  <div className={cn("text-xs font-bold leading-relaxed", user.dailyIntent.completed ? "line-through text-text-muted" : "text-text-primary")}>
                    {user.dailyIntent.text}
                  </div>
                </div>
                {!user.dailyIntent.completed ? (
                  <button
                    onClick={() => {
                      const todayStr = new Date().toLocaleDateString();
                      const currentLogs = user.activityLogs || [];
                      const updatedLogs = currentLogs.includes(todayStr) ? currentLogs : [...currentLogs, todayStr];
                      
                      const updated = {
                        ...user,
                        xp: (user.xp || 0) + 15,
                        coins: (user.coins || 0) + 10,
                        activityLogs: updatedLogs,
                        dailyIntent: {
                          ...user.dailyIntent!,
                          completed: true
                        }
                      };
                      onUpdateProfile?.(updated);
                      window.dispatchEvent(new CustomEvent('ww-trigger-alert', {
                        detail: {
                          type: 'success',
                          title: 'Intent Honored! 🎉',
                          message: 'Exceptional self-discipline! You earned +15 XP and +10 Gold Coins.'
                        }
                      }));
                    }}
                    className="flex items-center gap-1 bg-accent-gold/10 hover:bg-accent-gold/25 border border-accent-gold/30 hover:border-accent-gold text-accent-gold px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-sm"
                  >
                    <Check className="w-3.5 h-3.5" /> Mark Honored
                  </button>
                ) : (
                  <div className="flex items-center gap-1.5 bg-accent-emerald/10 border border-accent-emerald/20 text-accent-emerald px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider">
                    <CheckCircle2 className="w-4 h-4 text-accent-emerald" /> Honored (+15 XP)
                  </div>
                )}
              </div>
              <button
                onClick={() => {
                  const updated = {
                    ...user,
                    dailyIntent: undefined
                  };
                  onUpdateProfile?.(updated);
                }}
                className="text-[10px] text-text-muted hover:text-accent-gold font-bold uppercase tracking-wider underline cursor-pointer block"
              >
                Change Today's Intent Focus
              </button>
            </div>
          )}
        </motion.div>

        {/* Contribution Calendar component */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6 border-border/60 bg-bg-secondary/20 space-y-4"
        >
          <div className="flex items-center justify-between border-b border-border/40 pb-3">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-accent-gold animate-pulse" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-text-primary flex items-center gap-1.5">
                Consistency Heatmap <span className="text-[10px] text-accent-emerald bg-accent-emerald/10 border border-accent-emerald/20 px-2.5 py-0.5 rounded-full font-mono font-bold uppercase">Active logs</span>
              </h3>
            </div>
            <button
              onClick={() => {
                const todayStr = new Date().toLocaleDateString();
                const currentLogs = user.activityLogs || [];
                if (currentLogs.includes(todayStr)) {
                  window.dispatchEvent(new CustomEvent('ww-trigger-alert', {
                    detail: {
                      type: 'info',
                      title: 'Already Logged Today 📅',
                      message: 'Your activity has already been logged. Keep up the consistent ritual!'
                    }
                  }));
                  return;
                }
                const updated = {
                  ...user,
                  xp: (user.xp || 0) + 15,
                  coins: (user.coins || 0) + 10,
                  activityLogs: [...currentLogs, todayStr]
                };
                onUpdateProfile?.(updated);
                window.dispatchEvent(new CustomEvent('ww-trigger-alert', {
                  detail: {
                    type: 'success',
                    title: 'Check-In Complete! ⚡',
                    message: 'Daily consistency ledger updated. +15 XP and +10 Gold Coins secured.'
                  }
                }));
              }}
              className="flex items-center gap-1.5 bg-bg-void hover:bg-bg-primary border border-border hover:border-accent-gold/40 text-text-primary px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
            >
              <Check className="w-3.5 h-3.5 text-accent-gold" /> Daily Check-In
            </button>
          </div>

          <div className="space-y-3">
            {/* 56 days contribution grid */}
            <div className="flex items-center gap-2 overflow-x-auto py-1">
              <div className="grid grid-flow-col grid-rows-7 gap-1 p-1 rounded-lg bg-bg-void/40">
                {(() => {
                  const daysList = [];
                  for (let i = 55; i >= 0; i--) {
                    const d = new Date();
                    d.setDate(d.getDate() - i);
                    daysList.push(d);
                  }
                  return daysList.map((day, idx) => {
                    const dateStr = day.toLocaleDateString();
                    const active = (user.activityLogs || []).includes(dateStr);
                    return (
                      <div
                        key={idx}
                        title={`${day.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}: ${active ? 'Active Log' : 'No Log'}`}
                        className={cn(
                          "w-2.5 h-2.5 rounded-2xs transition-colors cursor-help",
                          active 
                            ? "bg-accent-gold shadow-[0_0_8px_rgba(234,179,8,0.35)] border border-accent-gold/30" 
                            : "bg-bg-secondary hover:bg-border/60 border border-border/20"
                        )}
                      />
                    );
                  });
                })()}
              </div>
            </div>

            <div className="flex justify-between items-center text-[10px] text-text-muted font-mono uppercase tracking-wider">
              <span className="flex items-center gap-1">Less Consistency <span className="w-2 h-2 bg-bg-secondary border border-border/40 rounded-2xs"></span></span>
              <span className="font-bold text-accent-gold">Current Streak: {user.streak || 1} Days</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 bg-accent-gold rounded-2xs"></span> High Consistency</span>
            </div>

            {/* Gamified Milestone Rewards Section */}
            <div className="border-t border-border/40 pt-4 mt-4 space-y-3">
              <div className="flex justify-between items-center">
                <div className="text-[11px] font-bold text-accent-gold uppercase tracking-wider font-mono">Streak & Module Milestones</div>
                <div className="text-[10px] font-mono text-text-muted">Unlock rewards instantly</div>
              </div>
              
              <div className="grid grid-cols-3 gap-3">
                {[
                  { 
                    id: 'streak_3', 
                    title: '3-Day Streak', 
                    desc: 'Daily Disciple', 
                    icon: '🔥', 
                    unlocked: (user.streak || 1) >= 3 || (user.achievements || []).some(a => a.id === 'streak_3')
                  },
                  { 
                    id: 'streak_7', 
                    title: '7-Day Streak', 
                    desc: 'Habit Warrior', 
                    icon: '⚡', 
                    unlocked: (user.streak || 1) >= 7 || (user.achievements || []).some(a => a.id === 'streak_7')
                  },
                  { 
                    id: 'completion_all', 
                    title: 'All Quests', 
                    desc: 'Socratic Sage', 
                    icon: '👑', 
                    unlocked: (user.completedQuests || []).length >= 4 || (user.achievements || []).some(a => a.id === 'completion_all')
                  }
                ].map((m) => (
                  <div 
                    key={m.id} 
                    className={cn(
                      "p-2.5 rounded-xl border text-center relative overflow-hidden transition-all duration-300",
                      m.unlocked 
                        ? "bg-accent-gold/5 border-accent-gold/30 text-text-primary shadow-[0_0_12px_rgba(234,179,8,0.05)]" 
                        : "bg-bg-void/40 border-border/40 text-text-muted"
                    )}
                  >
                    <div className="text-xl mb-1">{m.icon}</div>
                    <div className="text-[10px] font-black truncate">{m.title}</div>
                    <div className="text-[9px] text-text-secondary truncate">{m.desc}</div>
                    <div className="mt-1.5 flex justify-center">
                      <span className={cn(
                        "text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-sm font-mono border",
                        m.unlocked 
                          ? "bg-accent-emerald/15 border-accent-emerald/20 text-accent-emerald" 
                          : "bg-bg-secondary/40 border-border/40 text-text-muted"
                      )}>
                        {m.unlocked ? "Unlocked" : "Locked"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Stats overview breakdown panel */}
              <div className="bg-bg-void/40 p-3 rounded-xl border border-border/40 text-[11px] space-y-1.5">
                <div className="flex justify-between font-mono">
                  <span className="text-text-secondary">Current Login Streak:</span>
                  <span className="font-bold text-accent-gold">{user.streak || 1} { (user.streak || 1) === 1 ? 'Day' : 'Days' }</span>
                </div>
                <div className="flex justify-between font-mono">
                  <span className="text-text-secondary">Consecutive Max Streak:</span>
                  <span className="font-bold text-text-primary">{user.maxStreak || user.streak || 1} Days</span>
                </div>
                <div className="flex justify-between font-mono">
                  <span className="text-text-secondary">Module Progress:</span>
                  <span className="font-bold text-accent-emerald">{(user.completedQuests || []).length} / 4 Cleared</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Getting Started Checklist for New Users */}
      {isNewUser && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-8 border-accent-gold/30 bg-accent-gold/5 space-y-6"
        >
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-2xl font-display font-bold flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-accent-gold" /> Your Path to Wealth Elite
              </h2>
              <p className="text-text-secondary text-sm">Complete these steps to unlock the full power of your Wealth Architect.</p>
            </div>
            <div className="hidden sm:block px-4 py-2 rounded-full bg-accent-gold/10 border border-accent-gold/20 text-accent-gold text-xs font-bold uppercase tracking-widest">
              {checklist.filter(i => i.completed).length} / {checklist.length} Completed
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {checklist.map((item) => (
              <a 
                key={item.id}
                href={item.hash}
                className={cn(
                  "p-4 rounded-xl border transition-all flex flex-col gap-3 group",
                  item.completed 
                    ? "bg-accent-emerald/5 border-accent-emerald/20 opacity-80" 
                    : "bg-bg-secondary border-border hover:border-accent-gold/50 hover:bg-accent-gold/5"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center",
                    item.completed ? "bg-accent-emerald/20 text-accent-emerald" : "bg-bg-primary text-text-muted"
                  )}>
                    {item.completed ? <CheckCircle2 className="w-5 h-5" /> : <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                  </div>
                </div>
                <div>
                  <div className={cn("font-bold text-sm", item.completed && "line-through text-text-muted")}>{item.label}</div>
                  <p className="text-[10px] text-text-muted uppercase tracking-wider mt-1">{item.desc}</p>
                </div>
              </a>
            ))}
          </div>
        </motion.div>
      )}

      {/* Achievements Section */}
      {(user.achievements || []).length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-widest text-text-muted flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" /> Elite Achievements
            </h3>
            <div className="flex items-center gap-4">
              {user.achievements && user.achievements.length < 6 && (
                <span className="text-[10px] text-text-muted italic">Next Milestone: Keep exploring to unlock more...</span>
              )}
              <span className="text-[10px] text-accent-gold font-bold">{user.achievements?.length} / 6 Unlocked</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-4">
            {user.achievements?.map((achievement) => (
              <div 
                key={achievement.id}
                title={`${achievement.title}: ${achievement.description}`}
                className="group relative"
              >
                <div className="w-12 h-12 rounded-xl bg-accent-gold/10 border border-accent-gold/20 flex items-center justify-center text-2xl transition-all hover:scale-110 hover:bg-accent-gold/20 cursor-help">
                  {achievement.icon}
                </div>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-bg-void border border-border rounded-lg text-[10px] text-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-xl">
                  <div className="font-bold text-accent-gold">{achievement.title}</div>
                  <div className="text-text-muted mt-1">{achievement.description}</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Reward Shop Preview Panel */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        className="card p-8 border-border/60 bg-bg-secondary/10 space-y-6"
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/40 pb-4">
          <div className="space-y-1">
            <h3 className="text-lg font-bold font-display text-text-primary flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-accent-gold" /> Cosmic Reward Cabinet & Shop
            </h3>
            <p className="text-xs text-text-secondary">Spend your hard-earned gold coins to unlock exclusive visual profile auras and rare accolades.</p>
          </div>
          <div className="flex items-center gap-2 bg-bg-void border border-border px-4 py-2 rounded-xl">
            <span className="text-xs font-mono text-text-muted">Vault Balance:</span>
            <span className="text-base font-mono font-black text-accent-gold flex items-center gap-1">🪙 {user.coins || 0}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {SHOP_ITEMS.map((item) => {
            const owned = (user.purchasedItems || []).includes(item.id);
            const active = user.activeAura === item.value;

            return (
              <div 
                key={item.id}
                className={cn(
                  "p-5 rounded-2xl border transition-all relative overflow-hidden flex flex-col justify-between h-[190px]",
                  owned 
                    ? "border-accent-gold/25 bg-accent-gold/5" 
                    : "border-border/60 bg-bg-secondary/40 hover:border-border/100"
                )}
              >
                <div className="space-y-2.5">
                  <div className="flex justify-between items-center">
                    <span className="text-2xl">{item.icon}</span>
                    <span className={cn(
                      "text-[9px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full border",
                      item.type === "THEME" ? "bg-accent-blue/10 border-accent-blue/25 text-accent-blue" : "bg-accent-purple/10 border-accent-purple/25 text-accent-purple"
                    )}>
                      {item.type}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-sm text-text-primary font-display">{item.title}</h4>
                    <p className="text-xs text-text-secondary leading-relaxed line-clamp-2">{item.description}</p>
                  </div>
                </div>

                <div className="border-t border-border/40 pt-3 flex items-center justify-between">
                  <div className="text-xs font-mono font-bold text-accent-gold">
                    {owned ? "Owned" : `🪙 ${item.cost}`}
                  </div>
                  {owned ? (
                    item.type === "THEME" ? (
                      <button
                        onClick={() => {
                          const updated = {
                            ...user,
                            activeAura: active ? "" : item.value
                          };
                          onUpdateProfile?.(updated);
                          window.dispatchEvent(new CustomEvent('ww-trigger-alert', {
                            detail: {
                              type: 'success',
                              title: active ? 'Aura Deactivated' : 'Aura Equipped! ✨',
                              message: active ? 'Aura theme removed from profile.' : `Successfully activated the "${item.title}" halo.`
                            }
                          }));
                        }}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer",
                          active ? "bg-accent-gold text-bg-void" : "bg-bg-void hover:bg-bg-primary border border-border"
                        )}
                      >
                        {active ? "Active" : "Equip"}
                      </button>
                    ) : (
                      <span className="text-[10px] font-bold uppercase text-accent-emerald bg-accent-emerald/10 border border-accent-emerald/20 px-2.5 py-1 rounded-lg">
                        Unlocked
                      </span>
                    )
                  ) : (
                    <button
                      onClick={() => {
                        const currentCoins = user.coins || 0;
                        if (currentCoins < item.cost) {
                          window.dispatchEvent(new CustomEvent('ww-trigger-alert', {
                            detail: {
                              type: 'risk',
                              title: 'Insufficient Coins 🪙',
                              message: `You need ${item.cost - currentCoins} more gold coins to unlock this item. Play more quests!`
                            }
                          }));
                          return;
                        }

                        const updatedPurchased = [...(user.purchasedItems || []), item.id];
                        let updatedAchievements = [...(user.achievements || [])];

                        if (item.type === "BADGE") {
                          const isAlreadyUnlocked = updatedAchievements.some(a => a.id === item.id);
                          if (!isAlreadyUnlocked) {
                            updatedAchievements.push({
                              id: item.id,
                              title: item.title,
                              description: item.description,
                              icon: item.icon,
                              unlockedAt: new Date().toISOString()
                            });
                          }
                        }

                        const updated = {
                          ...user,
                          coins: currentCoins - item.cost,
                          purchasedItems: updatedPurchased,
                          achievements: updatedAchievements,
                          activeAura: item.type === "THEME" ? item.value : user.activeAura
                        };

                        onUpdateProfile?.(updated);
                        window.dispatchEvent(new CustomEvent('ww-trigger-alert', {
                          detail: {
                            type: 'success',
                            title: 'Upgrade Acquired! 🛍️',
                            message: `Successfully unlocked "${item.title}"!`
                          }
                        }));
                      }}
                      className="bg-accent-gold/10 hover:bg-accent-gold/25 border border-accent-gold/30 hover:border-accent-gold text-accent-gold px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer"
                    >
                      Unlock Item
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

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
            <h3 className="text-sm font-bold uppercase tracking-widest text-text-muted flex items-center gap-2">
              <TrendingUp className="w-4 h-4" /> Strategic Wealth Pathing
            </h3>
            <div className="flex bg-bg-secondary p-1 rounded-lg border border-border">
              <button className="px-3 py-1 text-[10px] font-bold bg-bg-primary rounded-md shadow-sm">6M Projection</button>
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
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card p-8 flex flex-col items-center justify-center text-center space-y-6 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-4">
            <ShieldCheck className="w-6 h-6 text-accent-gold opacity-20" />
          </div>
          
          <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-text-muted">Financial Health Score</h3>
          
          <div className="relative w-48 h-48 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="96"
                cy="96"
                r="88"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-border"
              />
              <circle
                cx="96"
                cy="96"
                r="88"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={552.92}
                strokeDashoffset={552.92 - (552.92 * healthScore) / 100}
                className="text-accent-gold transition-all duration-1000 ease-out"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-6xl font-display font-bold">{healthScore}</span>
              <span className="text-xs text-text-muted uppercase tracking-widest">Out of 100</span>
            </div>
          </div>

          <p className="text-sm text-text-secondary max-w-[200px]">
            {healthScore > 80 ? "Excellent! You're in the top 5% of financial planners." : 
             healthScore > 60 ? "Good progress. A few tweaks could boost your score." :
             "Let's focus on building your foundation."}
          </p>
        </motion.div>

        {/* Wealth Summary Card */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card p-8 space-y-6 relative group overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
              <Wallet className="w-12 h-12" />
            </div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-text-muted">Net Worth</h3>
            <div className="space-y-1">
              <div className="text-4xl font-display font-bold">
                {formatCurrency(user.netWorth.assets - user.netWorth.liabilities, user.currency, currency.locale)}
              </div>
              {budget && budget.history && budget.history.length > 1 && (
                <div className={cn(
                  "flex items-center gap-2 text-sm font-medium",
                  budget.history[budget.history.length - 1].total < budget.history[budget.history.length - 2].total ? "text-accent-emerald" : "text-accent-red"
                )}>
                  {budget.history[budget.history.length - 1].total < budget.history[budget.history.length - 2].total ? <TrendingUp className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                  <span>
                    {Math.abs(Math.round(((budget.history[budget.history.length - 1].total - budget.history[budget.history.length - 2].total) / budget.history[budget.history.length - 2].total) * 100))}% vs last month
                  </span>
                </div>
              )}
            </div>
            <div className="pt-6 border-t border-border grid grid-cols-2 gap-4">
              <div>
                <div className="text-[10px] text-text-muted uppercase tracking-wider">Assets</div>
                <div className="text-lg font-mono font-bold">{formatCurrency(user.netWorth.assets, user.currency, currency.locale)}</div>
              </div>
              <div>
                <div className="text-[10px] text-text-muted uppercase tracking-wider">Liabilities</div>
                <div className="text-lg font-mono font-bold text-accent-red">{formatCurrency(user.netWorth.liabilities, user.currency, currency.locale)}</div>
              </div>
            </div>
          </div>

          <div className="card p-8 space-y-6 relative group overflow-hidden cursor-pointer" onClick={() => window.location.hash = "#portfolio"}>
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
              <PieChart className="w-12 h-12" />
            </div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-text-muted">Portfolio Performance</h3>
            <div className="space-y-1">
              <div className="text-4xl font-display font-bold text-accent-gold">
                {formatCurrency(user.portfolio?.totalValue || 0, user.currency, currency.locale)}
              </div>
              {user.portfolio && (
                <div className={cn(
                  "flex items-center gap-2 text-sm font-medium",
                  user.portfolio.change24h >= 0 ? "text-accent-emerald" : "text-accent-red"
                )}>
                  {user.portfolio.change24h >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                  <span>{user.portfolio.change24h >= 0 ? "+" : ""}{user.portfolio.change24h}% (24h)</span>
                </div>
              )}
            </div>
            <div className="pt-6 border-t border-border flex items-center justify-between">
              <div className="space-y-1">
                <div className="text-xs text-text-muted uppercase tracking-widest font-bold">Alpha</div>
                <div className="text-xl font-mono font-bold text-accent-emerald">
                  {user.portfolio && user.portfolio.holdings.length > 0 ? "+4.2%" : "--"}
                </div>
              </div>
              <div className="space-y-1 text-right">
                <div className="text-xs text-text-muted uppercase tracking-widest font-bold">Sharpe</div>
                <div className="text-xl font-mono font-bold text-accent-gold">
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

      {/* Autonomous Agent Operations Log Terminal */}
      <AgentOperationsLogs />

      {/* Audit Result / Action Items */}
      {auditResult && (
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-8 border-accent-gold/20 bg-accent-gold/5 space-y-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-accent-gold/20 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-accent-gold" />
              </div>
              <div>
                <h2 className="text-2xl font-display font-bold">AI Wealth Audit Results</h2>
                <p className="text-text-secondary text-sm">Generated just now based on your real-time data.</p>
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
          
          <div className="prose prose-invert max-w-none prose-p:text-text-secondary prose-strong:text-accent-gold prose-headings:text-text-primary">
            {auditResult.split('\n').map((line, i) => (
              <p key={i} className="mb-2">{line}</p>
            ))}
          </div>

          <div className="pt-6 border-t border-border/50">
            <p className="text-[10px] text-text-muted italic text-center">
              Disclaimer: This audit is generated by AI for educational purposes only and does not constitute professional financial advice. 
              WealthWise Elite does not store your sensitive financial documents.
            </p>
          </div>
        </motion.div>
      )}

      {/* Quick Navigation / Mastery Modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: "MacroPulse Engine", desc: "Economic simulator", icon: <BrainCircuit />, hash: "#macropulse", color: "text-accent-gold" },
          { title: "TrendMarket", desc: "Pop-culture trading", icon: <TrendingUp />, hash: "#trendmarket", color: "text-accent-emerald" },
          { title: "LiveOrLease", desc: "Rent vs Buy engine", icon: <PieChart />, hash: "#liveorlease", color: "text-accent-blue" },
          { title: "MockYield DeFi", desc: "Staking mastery", icon: <Sparkles />, hash: "#mockyield", color: "text-accent-purple" },
        ].map((item, i) => (
          <motion.a
            key={i}
            href={item.hash}
            whileHover={{ y: -5, backgroundColor: "var(--bg-card-hover)" }}
            className="card p-6 flex flex-col gap-3 group border-border/40"
          >
            <div className={cn("w-12 h-12 rounded-xl bg-bg-secondary flex items-center justify-center group-hover:scale-110 transition-transform", item.color)}>
              {item.icon}
            </div>
            <div>
              <h4 className="font-bold text-sm">{item.title}</h4>
              <p className="text-[10px] text-text-muted uppercase tracking-wider">{item.desc}</p>
            </div>
            <div className="pt-2 flex items-center text-[10px] font-bold text-accent-gold opacity-0 group-hover:opacity-100 transition-opacity">
              ENTER MODULE <ChevronRight className="w-3 h-3 ml-1" />
            </div>
          </motion.a>
        ))}
      </div>

      {/* Quick Navigation / Next Steps */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { title: "Portfolio Overview", desc: "Track your global asset allocation.", icon: <PieChart />, hash: "#portfolio" },
          { title: "Budget Architect", desc: "Find hidden savings in your expenditures.", icon: <TrendingUp />, hash: "#budget" },
          { title: "Test Literacy", desc: "Boost your score with a quick quiz.", icon: <Target />, hash: "#quiz" },
          { title: "Strategic Projection", desc: "See how your wealth grows over time.", icon: <BrainCircuit />, hash: "#simulator" },
        ].map((item, i) => (
          <motion.a
            key={i}
            href={item.hash}
            whileHover={{ x: 5, backgroundColor: "var(--bg-card-hover)" }}
            className="card p-6 flex items-center justify-between group"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-bg-secondary flex items-center justify-center text-accent-gold group-hover:scale-110 transition-transform">
                {item.icon}
              </div>
              <div>
                <h4 className="font-bold text-sm">{item.title}</h4>
                <p className="text-xs text-text-muted">{item.desc}</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-text-muted group-hover:text-accent-gold transition-colors" />
          </motion.a>
        ))}
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
              <div className="flex items-center gap-3">
                <Logo size="md" iconOnly />
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 text-[9px] uppercase font-bold text-accent-gold tracking-widest bg-accent-gold/10 px-2.5 py-0.5 rounded-full border border-accent-gold/20">
                    <Settings className="w-3 h-3 text-accent-gold" /> Wealth-As-Code Engine
                  </div>
                  <h3 className="text-2xl font-bold font-display text-text-primary">GitOps Configuration</h3>
                </div>
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
