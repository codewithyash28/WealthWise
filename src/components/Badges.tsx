import { motion } from "motion/react";
import { Award, Lock, CheckCircle2, Star, Target, ShieldCheck, Flame, Trophy } from "lucide-react";
import { Achievement } from "../types";
import { ACHIEVEMENTS } from "../constants";
import { cn } from "../lib/utils";

interface BadgesProps {
  unlockedAchievements: Achievement[];
}

export function Badges({ unlockedAchievements }: BadgesProps) {
  const isUnlocked = (id: string) => unlockedAchievements.some(a => a.id === id);

  return (
    <div className="space-y-12 py-12">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-display font-bold">Your Achievements</h2>
        <p className="text-text-secondary max-w-xl mx-auto">Master the world of finance and unlock elite badges. Every simulation brings you closer to legendary status.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {ACHIEVEMENTS.map((badge) => {
          const unlocked = isUnlocked(badge.id);
          const unlockData = unlockedAchievements.find(a => a.id === badge.id);

          return (
            <motion.div
              key={badge.id}
              whileHover={{ y: -5 }}
              className={cn(
                "card p-6 flex flex-col items-center text-center gap-4 relative transition-all",
                unlocked ? "border-accent-gold/40 bg-accent-gold/5" : "opacity-60 bg-bg-secondary/30 grayscale"
              )}
            >
              {!unlocked && (
                <div className="absolute top-4 right-4 text-text-muted">
                  <Lock className="w-4 h-4" />
                </div>
              )}
              
              <div className={cn(
                "w-20 h-20 rounded-2xl flex items-center justify-center text-3xl shadow-lg",
                unlocked ? "bg-accent-gold/10 text-accent-gold" : "bg-bg-secondary text-text-muted"
              )}>
                {unlocked ? <Trophy className="w-10 h-10" /> : <Award className="w-10 h-10" />}
              </div>

              <div className="space-y-1">
                <h4 className="font-bold">{badge.title}</h4>
                <p className="text-xs text-text-secondary leading-relaxed">{badge.description}</p>
              </div>

              {unlocked && (
                <div className="mt-2 text-[10px] font-bold text-accent-emerald uppercase tracking-widest flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Unlocked {unlockData?.unlockedAt ? new Date(unlockData.unlockedAt).toLocaleDateString() : 'recently'}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8">
        <div className="card p-8 bg-bg-secondary/50 space-y-6">
           <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-accent-emerald/10 flex items-center justify-center text-accent-emerald">
                <Flame className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Daily Streak</h3>
                <p className="text-sm text-text-muted">Keep returning daily to build your wealth wisdom.</p>
              </div>
           </div>
           
           <div className="grid grid-cols-7 gap-2">
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs",
                    i < 3 ? "bg-accent-gold text-bg-primary" : "bg-bg-secondary text-text-muted border border-border"
                  )}>
                    {i < 3 ? <CheckCircle2 className="w-5 h-5" /> : day}
                  </div>
                </div>
              ))}
           </div>
           <p className="text-xs text-text-muted italic border-t border-border pt-4">
             "Financial freedom isn't a goal, it's a habit." — Building a 7-day streak unlocks the 'Consistency King' badge.
           </p>
        </div>

        <div className="card p-8 bg-bg-secondary/50 space-y-6">
           <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-accent-purple/10 flex items-center justify-center text-accent-purple">
                <Target className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Current Standing</h3>
                <p className="text-sm text-text-muted">Your rank compared to 50k global learners.</p>
              </div>
           </div>

           <div className="space-y-4">
             <div className="space-y-2">
               <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                 <span>Novice</span>
                 <span className="text-accent-gold underline">Pro - Diamond Tier</span>
                 <span>Elite</span>
               </div>
               <div className="h-4 bg-bg-secondary rounded-full overflow-hidden border border-border p-1">
                 <motion.div 
                   initial={{ width: 0 }}
                   animate={{ width: '75%' }}
                   className="h-full bg-linear-to-r from-accent-purple to-accent-gold rounded-full"
                 />
               </div>
             </div>
             <p className="text-xs text-center text-text-muted">
               You are in the **top 15%** of simulated wealth builders! 🚀
             </p>
           </div>
        </div>
      </div>
    </div>
  );
}
