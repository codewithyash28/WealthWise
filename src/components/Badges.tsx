import { motion } from "motion/react";
import { Award, Lock, CheckCircle2, Star, Target, ShieldCheck, Flame, Trophy, Sparkles, Coins, HelpCircle, Download, Share2 } from "lucide-react";
import { Achievement, UserProfile } from "../types";
import { ACHIEVEMENTS } from "../constants";
import { cn } from "../lib/utils";

interface BadgesProps {
  user?: UserProfile;
  unlockedAchievements: Achievement[];
}

// All possible badges including standard and Reward Shop badges
const ALL_BADGE_TEMPLATES = [
  ...ACHIEVEMENTS,
  { id: "badge_stagflation", title: "Stagflation Survivor", description: "Proving your absolute mastery over systemic contraction events.", icon: "🛡️", rarity: "Rare" },
  { id: "badge_defi_deg", title: "DeFi Degenerate", description: "Signaling advanced knowledge of smart contracts and APY leverage.", icon: "⚡", rarity: "Epic" },
  { id: "badge_fomo_slayer", title: "FOMO Slayer Elite", description: "Certifying a completely objective, non-emotional trading style.", icon: "⚔️", rarity: "Legendary" }
];

export function Badges({ user, unlockedAchievements }: BadgesProps) {
  // Check if standard or shop badges are unlocked
  const isUnlocked = (id: string) => {
    return unlockedAchievements.some(a => a.id === id) || (user?.purchasedItems || []).includes(id);
  };

  const getUnlockData = (id: string) => {
    const fromProfile = unlockedAchievements.find(a => a.id === id);
    if (fromProfile) return fromProfile;
    if (user?.purchasedItems?.includes(id)) {
      return { id, title: "", description: "", icon: "", unlockedAt: new Date().toISOString() };
    }
    return null;
  };

  // XP level calculation
  const currentXP = user?.xp || 0;
  const level = Math.floor(currentXP / 150) + 1;
  const nextLevelXp = level * 150;
  const prevLevelXp = (level - 1) * 150;
  const progressPercent = Math.min(100, Math.max(0, ((currentXP - prevLevelXp) / 150) * 100));

  const handleDownloadAchievementCard = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 1200;
    canvas.height = 700;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Background Gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 1200, 700);
    bgGrad.addColorStop(0, "#0B0F19");
    bgGrad.addColorStop(0.5, "#111827");
    bgGrad.addColorStop(1, "#030712");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1200, 700);

    // Decorative Gold Outer Frame
    ctx.strokeStyle = "rgba(240, 180, 41, 0.4)";
    ctx.lineWidth = 6;
    ctx.strokeRect(20, 20, 1160, 660);

    ctx.strokeStyle = "rgba(240, 180, 41, 0.15)";
    ctx.lineWidth = 1;
    ctx.strokeRect(32, 32, 1136, 636);

    // Header Title
    ctx.fillStyle = "#F0B429";
    ctx.font = "bold 14px monospace";
    ctx.fillText("WEALTHWISE ELITE • FINANCIAL ACHIEVEMENT CERTIFICATE", 60, 75);

    // User Name
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 36px sans-serif";
    ctx.fillText(user?.name || "Wealth Elite Practitioner", 60, 125);

    // Stats
    ctx.fillStyle = "#94A3B8";
    ctx.font = "16px sans-serif";
    ctx.fillText(`Level ${level} Scholar  •  ${currentXP} Total XP  •  ${user?.coins || 0} Gold Coins`, 60, 155);

    // Badges Grid
    const unlockedList = ALL_BADGE_TEMPLATES.filter(b => isUnlocked(b.id));
    const badgesToDraw = unlockedList.length > 0 ? unlockedList.slice(0, 6) : ALL_BADGE_TEMPLATES.slice(0, 6);

    const startX = 60;
    const startY = 200;
    const cardWidth = 340;
    const cardHeight = 130;

    badgesToDraw.forEach((badge, idx) => {
      const col = idx % 3;
      const row = Math.floor(idx / 3);
      const x = startX + col * (cardWidth + 20);
      const y = startY + row * (cardHeight + 20);

      const unlocked = isUnlocked(badge.id);

      // Card Box
      ctx.fillStyle = unlocked ? "rgba(240, 180, 41, 0.05)" : "rgba(255, 255, 255, 0.02)";
      ctx.beginPath();
      ctx.roundRect(x, y, cardWidth, cardHeight, 16);
      ctx.fill();

      ctx.strokeStyle = unlocked ? "rgba(240, 180, 41, 0.4)" : "rgba(148, 163, 184, 0.2)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Icon Box
      ctx.fillStyle = unlocked ? "rgba(240, 180, 41, 0.15)" : "rgba(148, 163, 184, 0.1)";
      ctx.beginPath();
      ctx.roundRect(x + 15, y + 25, 60, 60, 12);
      ctx.fill();

      ctx.font = "30px sans-serif";
      ctx.fillText(badge.icon || "🏆", x + 28, y + 67);

      // Title
      ctx.fillStyle = unlocked ? "#F0B429" : "#64748B";
      ctx.font = "bold 15px sans-serif";
      ctx.fillText(badge.title, x + 90, y + 45);

      // Description
      ctx.fillStyle = "#94A3B8";
      ctx.font = "11px sans-serif";
      const shortDesc = badge.description.length > 36 ? badge.description.slice(0, 33) + "..." : badge.description;
      ctx.fillText(shortDesc, x + 90, y + 70);

      // Status
      ctx.fillStyle = unlocked ? "#10B981" : "#64748B";
      ctx.font = "bold 10px monospace";
      ctx.fillText(unlocked ? "✓ UNLOCKED & VERIFIED" : "🔒 LOCKED MILESTONE", x + 90, y + 95);
    });

    // Verification Footer
    ctx.fillStyle = "rgba(240, 180, 41, 0.2)";
    ctx.fillRect(60, 580, 1080, 1);

    ctx.fillStyle = "#94A3B8";
    ctx.font = "12px monospace";
    ctx.fillText("VERIFIED BY WEXA AI GITOPS AGENT • GOOGLE AI STUDIO", 60, 615);

    ctx.fillStyle = "#F0B429";
    ctx.font = "bold 12px monospace";
    ctx.fillText(`ISSUED: ${new Date().toLocaleDateString()}`, 940, 615);

    // Download PNG
    const link = document.createElement("a");
    link.download = `wexa_financial_achievements_${user?.name?.replace(/\s+/g, '_') || "scholar"}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();

    window.dispatchEvent(
      new CustomEvent("ww-trigger-alert", {
        detail: {
          type: "success",
          title: "Achievement Card Downloaded! 📸",
          message: "Your financial achievement image card has been rendered and saved as a high-res PNG.",
        },
      })
    );
  };

  // Active Aura configuration
  const activeAura = user?.activeAura || "";
  const auraStyle = {
    "aura-gold": {
      container: "border-accent-gold/50 shadow-[0_0_30px_rgba(234,179,8,0.25)] bg-accent-gold/5",
      avatar: "ring-4 ring-accent-gold ring-offset-2 ring-offset-bg-void animate-pulse",
      badge: "bg-accent-gold/25 text-accent-gold border-accent-gold/40"
    },
    "aura-sapphire": {
      container: "border-accent-blue/50 shadow-[0_0_30px_rgba(59,130,246,0.25)] bg-accent-blue/5",
      avatar: "ring-4 ring-accent-blue ring-offset-2 ring-offset-bg-void",
      badge: "bg-accent-blue/25 text-accent-blue border-accent-blue/40"
    },
    "aura-cyber": {
      container: "border-accent-emerald/50 shadow-[0_0_30px_rgba(16,185,129,0.25)] bg-accent-emerald/5",
      avatar: "ring-4 ring-accent-emerald ring-offset-2 ring-offset-bg-void",
      badge: "bg-accent-emerald/25 text-accent-emerald border-accent-emerald/40"
    }
  }[activeAura] || {
    container: "border-border/60 bg-bg-secondary/20",
    avatar: "border-2 border-border",
    badge: "bg-bg-secondary text-text-muted border-border"
  };

  return (
    <div className="space-y-12 py-6">
      {/* Title Header */}
      <div className="text-center space-y-4">
        <h2 className="text-4xl md:text-5xl font-display font-black tracking-tight">
          Elite Profile & Achievements
        </h2>
        <p className="text-text-secondary max-w-xl mx-auto text-sm leading-relaxed">
          Manage your high-fidelity financial identity. Complete economic modules, optimize simulations, and display your acquired certifications in the prestigious cabinet.
        </p>
      </div>

      {/* User Profile Card */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn("card p-6 md:p-8 border grid grid-cols-1 md:grid-cols-12 gap-6 items-center backdrop-blur-xs relative overflow-hidden", auraStyle.container)}
      >
        {/* Glow effect on hover */}
        <div className="absolute inset-0 bg-linear-to-r from-accent-gold/0 via-accent-gold/5 to-accent-gold/0 opacity-0 hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

        {/* Column 1: Avatar with Aura outline */}
        <div className="md:col-span-3 flex flex-col items-center text-center space-y-3 z-10">
          <div className="relative">
            <div className={cn("w-24 h-24 rounded-full overflow-hidden flex items-center justify-center bg-bg-secondary", auraStyle.avatar)}>
              <span className="text-3xl font-black text-accent-gold font-display">
                {(user?.name || "U").charAt(0).toUpperCase()}
              </span>
            </div>
            {activeAura && (
              <div className="absolute -bottom-2 -right-2 bg-bg-void border border-accent-gold/40 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full shadow-lg text-accent-gold">
                {activeAura.replace("aura-", "")} aura
              </div>
            )}
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-bold font-display">{user?.name || "Wealth Elite Practitioner"}</h3>
            <span className={cn("inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full border", auraStyle.badge)}>
              <Trophy className="w-3 h-3" /> Level {level} Scholar
            </span>
          </div>
        </div>

        {/* Column 2: Level & XP Bar */}
        <div className="md:col-span-6 space-y-4 z-10 px-0 md:px-6">
          <div className="space-y-1">
            <div className="flex justify-between items-end text-xs">
              <span className="text-text-muted font-bold uppercase tracking-wider">Academic Progression (XP)</span>
              <span className="font-mono text-accent-gold font-black">{currentXP} <span className="text-text-muted font-normal">/ {nextLevelXp} XP</span></span>
            </div>
            <div className="h-4 bg-bg-void rounded-full overflow-hidden border border-border p-0.5 relative">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="h-full bg-linear-to-r from-accent-gold to-accent-orange rounded-full relative"
              >
                {/* Visual scanning line */}
                <div className="absolute inset-0 bg-linear-to-r from-white/0 via-white/20 to-white/0 animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
              </motion.div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="bg-bg-void/40 border border-border/40 rounded-xl p-3">
              <div className="text-[10px] text-text-muted uppercase tracking-wider font-bold">Quests Cleared</div>
              <div className="text-lg font-mono font-bold text-text-primary mt-0.5">
                {(user?.completedQuests || []).length} / 4 Modules
              </div>
            </div>
            <div className="bg-bg-void/40 border border-border/40 rounded-xl p-3">
              <div className="text-[10px] text-text-muted uppercase tracking-wider font-bold">Certifications</div>
              <div className="text-lg font-mono font-bold text-accent-emerald mt-0.5">
                {ALL_BADGE_TEMPLATES.filter(b => isUnlocked(b.id)).length} / {ALL_BADGE_TEMPLATES.length}
              </div>
            </div>
          </div>
        </div>

        {/* Column 3: Currency & Vault Stats */}
        <div className="md:col-span-3 flex flex-col items-center justify-center p-4 bg-bg-void/60 border border-border/60 rounded-xl space-y-3 z-10">
          <div className="flex items-center gap-1.5 text-xs font-bold text-text-muted uppercase tracking-wider">
            <Coins className="w-4 h-4 text-accent-gold" /> Gold Vault
          </div>
          <div className="text-3xl font-mono font-black text-accent-gold flex items-center gap-1">
            <span>🪙</span> {user?.coins || 0}
          </div>
          <a href="#quests" className="text-[10px] font-bold text-accent-gold hover:underline uppercase tracking-widest flex items-center gap-1">
            Browse Reward Shop <Sparkles className="w-3 h-3" />
          </a>
        </div>
      </motion.div>

      {/* Badge Cabinet (Interactive Badge Case) */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border/60 pb-3 gap-3">
          <h3 className="text-lg font-bold font-display flex items-center gap-2 text-text-primary">
            <Award className="w-5 h-5 text-accent-gold" /> Prestigious Achievements Cabinet
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadAchievementCard}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-accent-gold/20 to-amber-500/20 border border-accent-gold/40 hover:border-accent-gold text-accent-gold font-mono font-bold text-xs shadow-md transition-all cursor-pointer hover:scale-105"
            >
              <Download className="w-3.5 h-3.5" /> Download Badges Card (PNG)
            </button>
            <span className="text-xs font-mono text-text-muted uppercase tracking-widest bg-bg-secondary px-3 py-1.5 rounded-xl border hidden md:inline-block">
              Interactive Grid Cabinet
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-6" id="badge-case-grid">
          {ALL_BADGE_TEMPLATES.map((badge) => {
            const unlocked = isUnlocked(badge.id);
            const unlockData = getUnlockData(badge.id);
            const isShopBadge = badge.id.startsWith("badge_");
            const rarity = (badge as any).rarity || "Standard";

            const rarityColor = {
              "Standard": "border-border/60 text-text-muted",
              "Rare": "border-accent-blue/30 text-accent-blue bg-accent-blue/5",
              "Epic": "border-accent-purple/30 text-accent-purple bg-accent-purple/5",
              "Legendary": "border-accent-gold/30 text-accent-gold bg-accent-gold/5"
            }[rarity] || "border-border text-text-muted";

            return (
              <motion.div
                key={badge.id}
                whileHover={{ y: -6, scale: 1.02 }}
                className={cn(
                  "card p-6 flex flex-col items-center text-center gap-4 relative transition-all duration-300 group cursor-pointer border overflow-hidden",
                  unlocked 
                    ? "border-accent-gold/30 bg-bg-secondary/40 shadow-[0_0_20px_rgba(234,179,8,0.03)]" 
                    : "opacity-45 bg-bg-secondary/10 grayscale border-border/40"
                )}
              >
                {/* Rarity & Shop Tags */}
                <div className="absolute top-3 left-3 flex gap-1">
                  <span className={cn("text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border", rarityColor)}>
                    {rarity}
                  </span>
                  {isShopBadge && (
                    <span className="text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border border-accent-gold/20 bg-accent-gold/10 text-accent-gold">
                      Shop Premium
                    </span>
                  )}
                </div>

                {!unlocked && (
                  <div className="absolute top-3 right-3 text-text-muted">
                    <Lock className="w-3.5 h-3.5" />
                  </div>
                )}

                {/* Animated Background Aura for Unlocked Badges */}
                {unlocked && (
                  <div className="absolute -inset-10 bg-radial from-accent-gold/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                )}

                {/* Badge Icon Slot */}
                <div className={cn(
                  "w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-lg relative transition-all duration-300 group-hover:scale-110",
                  unlocked 
                    ? "bg-accent-gold/10 text-accent-gold border border-accent-gold/30 shadow-[0_4px_15px_rgba(234,179,8,0.1)]" 
                    : "bg-bg-secondary/50 border border-border text-text-muted"
                )}>
                  {unlocked ? (
                    <Trophy className="w-8 h-8 text-accent-gold group-hover:animate-bounce" />
                  ) : (
                    <Award className="w-8 h-8 text-text-muted" />
                  )}
                  {unlocked && (
                    <span className="absolute -bottom-1 -right-1 text-base">{badge.icon}</span>
                  )}
                </div>

                <div className="space-y-1 z-10 w-full">
                  <h4 className="font-bold text-sm text-text-primary font-display group-hover:text-accent-gold transition-colors">
                    {badge.title}
                  </h4>
                  {/* Hover-reveal detail drawer */}
                  <div className="opacity-0 max-h-0 group-hover:opacity-100 group-hover:max-h-[150px] transition-all duration-500 ease-in-out overflow-hidden flex flex-col items-center gap-3">
                    <p className="text-[11px] text-text-secondary leading-relaxed max-w-[200px] mx-auto pt-1">
                      {badge.description}
                    </p>
                    {unlocked ? (
                      <div className="text-[9px] font-mono font-bold text-accent-emerald uppercase tracking-widest flex items-center justify-center gap-1 bg-accent-emerald/10 border border-accent-emerald/20 px-2.5 py-0.5 rounded-full shadow-inner w-fit">
                        <CheckCircle2 className="w-3 h-3 text-accent-emerald" /> Unlocked {unlockData?.unlockedAt ? new Date(unlockData.unlockedAt).toLocaleDateString() : 'Active'}
                      </div>
                    ) : (
                      <div className="text-[9px] font-mono text-text-muted uppercase tracking-widest border border-dashed border-border px-2.5 py-0.5 rounded-full bg-bg-void/40 w-fit">
                        Locked
                      </div>
                    )}
                  </div>
                  {/* Subtle reveal hint indicator when not hovered */}
                  <div className="text-[8px] font-mono font-bold text-text-muted/40 uppercase tracking-widest group-hover:opacity-0 transition-opacity duration-300 pt-1">
                    [ Hover to Inspect ]
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Streak and Global Rank Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
        <div className="card p-8 bg-bg-secondary/40 border border-border/80 space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-accent-emerald/10 flex items-center justify-center text-accent-emerald border border-accent-emerald/20 shadow-inner">
              <Flame className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold font-display">Simulated Wealth Streak</h3>
              <p className="text-xs text-text-secondary">Commit to your daily financial focus to stack XP bonus multipliers.</p>
            </div>
          </div>
          
          <div className="grid grid-cols-7 gap-2" id="profile-streak-row">
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs transition-all",
                  i < (user?.activityLogs?.length || 3) % 7 + 1
                    ? "bg-accent-gold text-bg-void shadow-lg shadow-accent-gold/20" 
                    : "bg-bg-secondary text-text-muted border border-border"
                )}>
                  {i < (user?.activityLogs?.length || 3) % 7 + 1 ? <CheckCircle2 className="w-5 h-5" /> : day}
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-text-secondary italic border-t border-border/60 pt-4 leading-relaxed">
            "Defensive wealth compounding isn't a single transaction; it is a permanent daily ritual." — Maintain checking-in to unlock double XP.
          </p>
        </div>

        <div className="card p-8 bg-bg-secondary/40 border border-border/80 space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-accent-purple/10 flex items-center justify-center text-accent-purple border border-accent-purple/20 shadow-inner">
              <Target className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold font-display">Verified Rank & Index</h3>
              <p className="text-xs text-text-secondary">Your mathematical percentile relative to 50,000 active practitioners.</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-text-secondary">
                <span>Novice Builder</span>
                <span className="text-accent-gold underline">Pro - {level >= 4 ? "Platinum" : "Gold"} Tier</span>
                <span>Elite Sage</span>
              </div>
              <div className="h-4 bg-bg-void rounded-full overflow-hidden border border-border p-1 relative">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, Math.max(20, (level * 20)))}%` }}
                  className="h-full bg-linear-to-r from-accent-purple to-accent-gold rounded-full"
                />
              </div>
            </div>
            <p className="text-xs text-center text-text-secondary leading-relaxed">
              You are currently inside the **Top {Math.max(5, 45 - level * 8)}%** of simulated wealth architects. Expand your knowledge nodes!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
