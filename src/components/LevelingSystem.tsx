import React, { useState, useEffect, useMemo } from "react";
import { motion } from "motion/react";
import { 
  Trophy, 
  Sparkles, 
  Zap, 
  CheckCircle2, 
  Flame, 
  Award, 
  Crown, 
  ShieldCheck, 
  ChevronRight,
  Star,
  Layers,
  ArrowRight,
  Share2
} from "lucide-react";
import { cn } from "../lib/utils";
import { UserProfile } from "../types";
import { SocialShareModal } from "./SocialShareModal";

export interface WealthTier {
  level: number;
  name: string;
  minXP: number;
  maxXP: number;
  badge: string;
  color: string;
  reward: string;
}

export const WEALTH_TIERS: WealthTier[] = [
  { level: 1, name: "Novice Saver", minXP: 0, maxXP: 250, badge: "🌱", color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10", reward: "Basic Budget & Nudges" },
  { level: 2, name: "Bronze Investor", minXP: 250, maxXP: 600, badge: "🥉", color: "text-amber-400 border-amber-500/30 bg-amber-500/10", reward: "Scenario Simulator Unlocked" },
  { level: 3, name: "Silver Strategist", minXP: 600, maxXP: 1200, badge: "🥈", color: "text-slate-300 border-slate-400/30 bg-slate-400/10", reward: "Gemini Vision Receipt Auto-Categorization" },
  { level: 4, name: "Gold Allocator", minXP: 1200, maxXP: 2200, badge: "🥇", color: "text-accent-gold border-accent-gold/40 bg-accent-gold/15", reward: "Portfolio Rebalancer & Stress Test" },
  { level: 5, name: "Platinum Architect", minXP: 2200, maxXP: 3800, badge: "💎", color: "text-cyan-300 border-cyan-400/40 bg-cyan-500/15", reward: "Custom AI Advisor Personas" },
  { level: 6, name: "Diamond Wealth Titan", minXP: 3800, maxXP: 6000, badge: "👑", color: "text-purple-300 border-purple-400/40 bg-purple-500/15", reward: "MacroPulse Live Grounding" },
  { level: 7, name: "WealthWise Elite 2.0", minXP: 6000, maxXP: 10000, badge: "⚡", color: "text-yellow-300 border-yellow-400/50 bg-yellow-500/20", reward: "Infinity Mastery Status" }
];

interface LevelingSystemProps {
  user?: UserProfile;
}

export const LevelingSystem: React.FC<LevelingSystemProps> = ({ user }) => {
  const tasksList = useMemo(() => [
    { id: "task_streak", name: "Maintain 3-Day Active Streak", xp: 150, hash: "#dashboard" },
    { id: "task_budget", name: "Configure Monthly Budget Plan", xp: 150, hash: "#dashboard" },
    { id: "task_receipt", name: "Scan Paper Receipt in Wexa", xp: 100, hash: "#wexa-companion" },
    { id: "task_scenario", name: "Run Inflation Stress Test", xp: 150, hash: "#dashboard" },
    { id: "task_rebalance", name: "Calculate Portfolio Rebalance Delta", xp: 200, hash: "#rebalancer" },
  ], []);

  const [completedTasks, setCompletedTasks] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("ww_completed_xp_tasks_v2");
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return ["task_streak", "task_budget"];
  });

  // Calculate Quest XP dynamically from completed tasks
  const completedQuestXP = useMemo(() => {
    return completedTasks.reduce((sum, tid) => {
      const t = tasksList.find(item => item.id === tid);
      return sum + (t ? t.xp : 0);
    }, 0);
  }, [completedTasks, tasksList]);

  // Calculate Base System XP from real user telemetry & activity
  const baseXP = useMemo(() => {
    let xp = 0;
    
    // Streak XP: 50 XP per active streak day (e.g. 2 days = 100 XP)
    const streakDays = Math.max(1, user?.visitDates?.length || 2);
    xp += streakDays * 50;

    // Scanned Receipts XP: 100 XP per receipt scanned in session
    try {
      const savedReceipts = localStorage.getItem("ww_processed_receipts_v2");
      if (savedReceipts) {
        const parsed = JSON.parse(savedReceipts);
        if (Array.isArray(parsed)) {
          xp += parsed.length * 100;
        }
      }
    } catch (e) {}

    return xp;
  }, [user]);

  const totalXP = baseXP + completedQuestXP;

  // Determine Current Tier
  const currentTier = useMemo(() => {
    for (let i = WEALTH_TIERS.length - 1; i >= 0; i--) {
      if (totalXP >= WEALTH_TIERS[i].minXP) {
        return WEALTH_TIERS[i];
      }
    }
    return WEALTH_TIERS[0];
  }, [totalXP]);

  const nextTier = useMemo(() => {
    const currentIndex = WEALTH_TIERS.findIndex(t => t.level === currentTier.level);
    if (currentIndex < WEALTH_TIERS.length - 1) {
      return WEALTH_TIERS[currentIndex + 1];
    }
    return null; // Max level reached
  }, [currentTier]);

  // Calculate progress percentage to next tier
  const progressPct = useMemo(() => {
    if (!nextTier) return 100;
    const xpInCurrentTier = totalXP - currentTier.minXP;
    const tierRange = nextTier.minXP - currentTier.minXP;
    return Math.min(100, Math.max(0, Math.round((xpInCurrentTier / tierRange) * 100)));
  }, [totalXP, currentTier, nextTier]);

  const xpNeededForNextTier = nextTier ? nextTier.minXP - totalXP : 0;

  const handleCompleteTask = (taskId: string, rewardXP: number, taskName: string) => {
    if (completedTasks.includes(taskId)) return;

    const newTasks = [...completedTasks, taskId];
    setCompletedTasks(newTasks);
    localStorage.setItem("ww_completed_xp_tasks_v2", JSON.stringify(newTasks));

    window.dispatchEvent(new CustomEvent("ww-trigger-alert", {
      detail: {
        type: "achievement",
        title: `+${rewardXP} XP Earned! 🏆`,
        message: `Completed task '${taskName}'. Total XP is now ${totalXP + rewardXP}!`
      }
    }));
  };

  const [isShareOpen, setIsShareOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="card p-6 sm:p-7 border-accent-gold/40 bg-gradient-to-br from-bg-secondary/90 via-bg-primary to-bg-secondary/70 shadow-2xl space-y-6 relative overflow-hidden"
    >
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-accent-gold/15 border border-accent-gold/40 text-accent-gold shadow-lg shadow-amber-500/10">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold font-display text-text-primary">
                Wealth Tier Leveling System
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-accent-gold/20 border border-accent-gold/40 text-accent-gold text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Gamified Mastery
              </span>
            </div>
            <p className="text-xs text-text-secondary mt-0.5">
              Earn XP by scanning receipts, running stress tests, and maintaining daily active streaks.
            </p>
          </div>
        </div>

        {/* Current Rank Badge Pill + Social Share Button */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setIsShareOpen(true)}
            className="px-3.5 py-2 rounded-2xl bg-accent-gold hover:bg-amber-400 text-slate-950 font-mono text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-lg shadow-amber-500/20 cursor-pointer"
            title="Share Wealth Tier Progress on Social Media"
          >
            <Share2 className="w-4 h-4" />
            <span>Share Progress</span>
          </button>

          <div className={cn(
            "px-4 py-2 rounded-2xl border flex items-center gap-2 shadow-lg",
            currentTier.color
          )}>
            <span className="text-xl">{currentTier.badge}</span>
            <div>
              <div className="text-[10px] font-mono font-bold uppercase opacity-80">Current Rank</div>
              <div className="text-sm font-bold font-display tracking-tight">{currentTier.name}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar & Level Metrics */}
      <div className="space-y-3 bg-bg-void/80 p-5 rounded-2xl border border-border/80">
        <div className="flex items-baseline justify-between">
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-text-muted">Total Wealth XP</span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-3xl font-mono font-black text-accent-gold">{totalXP}</span>
              <span className="text-xs font-mono text-text-muted">XP</span>
            </div>
          </div>

          <div className="text-right">
            {nextTier ? (
              <>
                <span className="text-[10px] font-mono uppercase text-text-muted">Next Tier ({nextTier.name})</span>
                <div className="text-xs font-mono font-bold text-emerald-400 mt-0.5">
                  {xpNeededForNextTier} XP Needed
                </div>
              </>
            ) : (
              <span className="text-xs font-mono font-bold text-accent-gold flex items-center gap-1">
                <Crown className="w-4 h-4" /> Maximum Tier Achieved!
              </span>
            )}
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="space-y-1">
          <div className="h-3.5 w-full bg-bg-secondary border border-border rounded-full p-0.5 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="h-full rounded-full bg-gradient-to-r from-accent-gold via-amber-400 to-emerald-400 shadow-[0_0_15px_rgba(240,180,41,0.5)]"
            />
          </div>

          <div className="flex justify-between text-[10px] font-mono text-text-muted pt-0.5">
            <span>{currentTier.minXP} XP ({currentTier.name})</span>
            <span>{progressPct}% Completed</span>
            <span>{nextTier ? `${nextTier.minXP} XP (${nextTier.name})` : "Max Rank"}</span>
          </div>
        </div>

        <div className="pt-2 text-xs text-text-secondary flex items-center gap-1.5 font-medium">
          <Award className="w-4 h-4 text-accent-gold shrink-0" />
          <span>Next Unlocked Reward: <strong className="text-text-primary">{nextTier ? nextTier.reward : "Infinity Elite Status"}</strong></span>
        </div>
      </div>

      {/* Quests / Tasks for Gaining XP */}
      <div className="space-y-3">
        <div className="text-xs font-mono font-bold uppercase tracking-wider text-text-muted flex items-center justify-between">
          <span>Active Quests & Usage XP Tasks</span>
          <span className="text-accent-gold">{completedTasks.length}/{tasksList.length} Completed</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {tasksList.map((task) => {
            const isDone = completedTasks.includes(task.id);
            return (
              <div
                key={task.id}
                className={cn(
                  "p-3 rounded-xl border transition-all flex items-center justify-between gap-2",
                  isDone
                    ? "bg-emerald-950/20 border-emerald-500/40 text-emerald-300"
                    : "bg-bg-void border-border/80 text-text-primary hover:border-accent-gold/40"
                )}
              >
                <div className="space-y-0.5">
                  <div className="text-xs font-bold flex items-center gap-1.5">
                    {isDone ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> : <Zap className="w-3.5 h-3.5 text-accent-gold shrink-0" />}
                    <span className={isDone ? "line-through opacity-80" : ""}>{task.name}</span>
                  </div>
                  <div className="text-[10px] font-mono font-bold text-accent-gold">
                    +{task.xp} XP
                  </div>
                </div>

                {!isDone ? (
                  <button
                    type="button"
                    onClick={() => handleCompleteTask(task.id, task.xp, task.name)}
                    className="px-2.5 py-1 rounded-lg bg-accent-gold hover:bg-accent-gold/90 text-bg-void text-[10px] font-mono font-bold uppercase transition-all cursor-pointer shrink-0"
                  >
                    Claim XP
                  </button>
                ) : (
                  <span className="text-[10px] font-mono text-emerald-400 font-bold px-2 py-0.5 bg-emerald-500/20 rounded">
                    Claimed ✓
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Social Share Modal Overlay */}
      {user && (
        <SocialShareModal
          user={user}
          isOpen={isShareOpen}
          onClose={() => setIsShareOpen(false)}
          currentTier={currentTier}
          totalXP={totalXP}
        />
      )}
    </motion.div>
  );
};
