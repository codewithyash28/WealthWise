import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Target, CheckCircle2, Circle, Sparkles, Trophy, Flame, Plus, RotateCcw, Award } from "lucide-react";
import confetti from "canvas-confetti";
import { UserProfile } from "../types";
import { cn } from "../lib/utils";

interface DailyGoalTrackerProps {
  user: UserProfile;
  onUpdateProfile?: (profile: UserProfile) => void;
}

const PRESET_GOALS = [
  "Save $5 today into your emergency vault",
  "Read 1 financial literacy article in Knowledge Vault",
  "Log all expenses for the day in Budget Planner",
  "Skip ordering takeout or unnecessary subscriptions",
  "Review portfolio sector allocation for 2 minutes",
  "Check debt payoff acceleration status"
];

export function DailyGoalTracker({ user, onUpdateProfile }: DailyGoalTrackerProps) {
  const todayKey = new Date().toISOString().split("T")[0];

  const [goalText, setGoalText] = useState(() => {
    const saved = localStorage.getItem(`ww_daily_goal_text_${todayKey}`);
    return saved || PRESET_GOALS[0];
  });

  const [isCompleted, setIsCompleted] = useState(() => {
    const saved = localStorage.getItem(`ww_daily_goal_completed_${todayKey}`);
    return saved === "true";
  });

  const [customGoal, setCustomGoal] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    localStorage.setItem(`ww_daily_goal_text_${todayKey}`, goalText);
  }, [goalText, todayKey]);

  useEffect(() => {
    localStorage.setItem(`ww_daily_goal_completed_${todayKey}`, String(isCompleted));
  }, [isCompleted, todayKey]);

  const handleToggleComplete = () => {
    const nextState = !isCompleted;
    setIsCompleted(nextState);

    if (nextState) {
      // Trigger satisfying confetti blast
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.8 },
        colors: ["#f0b429", "#10d9a0", "#3b82f6"]
      });

      // Award XP & Coins to UserProfile
      const currentXP = user.xp || 150;
      const currentCoins = user.coins || 120;
      const currentStreak = (user.streak || 3) + 1;

      const updatedUser: UserProfile = {
        ...user,
        xp: currentXP + 50,
        coins: currentCoins + 25,
        streak: currentStreak,
        dailyIntent: {
          text: goalText,
          completed: true,
          date: todayKey
        }
      };

      if (onUpdateProfile) {
        onUpdateProfile(updatedUser);
      }

      // Dispatch alert
      window.dispatchEvent(new CustomEvent("ww-trigger-alert", {
        detail: {
          type: "success",
          title: "🎯 Micro-Goal Accomplished! (+50 XP)",
          message: `Awesome work! You completed today's micro-goal: "${goalText}". +50 XP and +25 Coins added to your Leveling System!`
        }
      }));
    }
  };

  const handleSelectPreset = (preset: string) => {
    setGoalText(preset);
    setIsEditing(false);
  };

  const handleAddCustomGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customGoal.trim()) return;
    setGoalText(customGoal.trim());
    setCustomGoal("");
    setIsEditing(false);
  };

  return (
    <div className="card p-6 border-accent-gold/30 bg-gradient-to-br from-bg-secondary/90 via-bg-primary to-bg-secondary/40 space-y-4 shadow-xl relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-accent-gold/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/50 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-accent-gold/20 text-accent-gold border border-accent-gold/40">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold font-display uppercase tracking-wider text-text-primary">
                Daily Financial Micro-Goal
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[9px] font-bold uppercase border border-emerald-500/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-400" /> +50 XP Reward
              </span>
            </div>
            <p className="text-[11px] text-text-secondary mt-0.5">
              Achieve 1 small financial discipline goal today to boost your Leveling System tier & streak.
            </p>
          </div>
        </div>

        {/* Streak counter */}
        <div className="flex items-center gap-2 text-xs font-mono self-start sm:self-auto bg-bg-void/80 px-3 py-1.5 rounded-xl border border-border/60">
          <Flame className="w-4 h-4 text-amber-400 animate-pulse" />
          <span className="text-text-muted">Streak:</span>
          <span className="font-bold text-amber-400">{user.streak || 3} Days</span>
        </div>
      </div>

      {/* Main Goal Checkbox Card */}
      <div className="space-y-3">
        <motion.div
          whileHover={{ scale: 1.01 }}
          onClick={handleToggleComplete}
          className={cn(
            "p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 select-none",
            isCompleted
              ? "bg-emerald-500/10 border-emerald-500/40 text-text-primary shadow-emerald-500/10 shadow-lg"
              : "bg-bg-void/80 border-border hover:border-accent-gold/40 text-text-primary"
          )}
        >
          <div className="flex items-center gap-3.5 flex-1">
            <motion.div
              whileTap={{ scale: 0.8 }}
              className="shrink-0"
            >
              {isCompleted ? (
                <CheckCircle2 className="w-7 h-7 text-emerald-400 fill-emerald-400/20" />
              ) : (
                <Circle className="w-7 h-7 text-text-muted hover:text-accent-gold transition-colors" />
              )}
            </motion.div>

            <div className="space-y-0.5">
              <span className={cn(
                "text-sm font-bold block transition-all",
                isCompleted ? "line-through text-text-muted" : "text-text-primary"
              )}>
                {goalText}
              </span>
              <span className="text-[10px] font-mono text-text-muted block">
                {isCompleted ? "✅ Goal Completed! +50 XP & +25 Coins Granted" : "Click box to complete and claim XP reward"}
              </span>
            </div>
          </div>

          {isCompleted && (
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              className="px-3 py-1 rounded-xl bg-emerald-500 text-slate-950 font-black text-[10px] uppercase tracking-wider shrink-0 shadow-md flex items-center gap-1"
            >
              <Award className="w-3.5 h-3.5" /> Done!
            </motion.div>
          )}
        </motion.div>

        {/* Change Goal options */}
        <div className="flex items-center justify-between text-xs font-mono pt-1">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="text-accent-gold hover:underline flex items-center gap-1 text-[11px] font-bold cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> {isEditing ? "Close presets" : "Change today's micro-goal"}
          </button>

          <span className="text-[10px] text-text-muted">
            Resets automatically at midnight
          </span>
        </div>

        {/* Presets dropdown / selector */}
        <AnimatePresence>
          {isEditing && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="p-3 bg-bg-void/90 border border-border rounded-xl space-y-3 overflow-hidden text-xs"
            >
              <span className="text-[10px] font-mono font-bold text-text-muted uppercase tracking-wider block">
                Select A Preset Micro-Goal:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {PRESET_GOALS.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectPreset(preset)}
                    className={cn(
                      "p-2 rounded-lg border text-left text-xs font-medium transition-all cursor-pointer truncate",
                      goalText === preset
                        ? "bg-accent-gold/15 border-accent-gold text-accent-gold font-bold"
                        : "bg-bg-secondary/60 border-border/40 text-text-secondary hover:text-text-primary hover:border-border"
                    )}
                  >
                    • {preset}
                  </button>
                ))}
              </div>

              <form onSubmit={handleAddCustomGoal} className="flex gap-2 pt-2 border-t border-border/40">
                <input
                  type="text"
                  placeholder="Or enter custom goal..."
                  value={customGoal}
                  onChange={(e) => setCustomGoal(e.target.value)}
                  className="input-field flex-1 text-xs"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-accent-gold text-slate-950 font-bold rounded-lg text-xs hover:bg-amber-400 cursor-pointer"
                >
                  Set Custom
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
