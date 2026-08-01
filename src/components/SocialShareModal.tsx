import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Share2, 
  X, 
  Copy, 
  Check, 
  Trophy, 
  Sparkles, 
  Award, 
  Flame, 
  ExternalLink, 
  Send,
  Linkedin,
  MessageCircle,
  Twitter
} from "lucide-react";
import { UserProfile } from "../types";
import { WEALTH_TIERS, WealthTier } from "./LevelingSystem";
import { cn } from "../lib/utils";

interface SocialShareModalProps {
  user: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  currentTier?: WealthTier;
  totalXP?: number;
  latestBadge?: string;
}

export function SocialShareModal({
  user,
  isOpen,
  onClose,
  currentTier,
  totalXP = 1250,
  latestBadge = "3-Day Streak Master 🏆"
}: SocialShareModalProps) {
  const [copied, setCopied] = useState(false);

  const tier = currentTier || WEALTH_TIERS.find(t => totalXP >= t.minXP) || WEALTH_TIERS[0];
  const streak = user?.streak || 3;

  const shareText = `🚀 Just unlocked ${tier.badge} ${tier.name} (Tier ${tier.level}) on WealthWise Elite with ${totalXP.toLocaleString()} XP and a ${streak}-Day Streak! Building financial freedom with AI-driven intelligence. 💡💰 #WealthWiseElite #FinancialMastery #WealthTier`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);

    window.dispatchEvent(new CustomEvent("ww-trigger-alert", {
      detail: {
        type: "success",
        title: "📋 Copied to Clipboard",
        message: "Celebratory Wealth Tier share message copied to your clipboard!"
      }
    }));
  };

  const handleShareTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
    window.open(url, "_blank");
  };

  const handleShareLinkedIn = () => {
    const url = `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(shareText)}`;
    window.open(url, "_blank");
  };

  const handleShareWhatsApp = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(url, "_blank");
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bg-void/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="card p-6 sm:p-8 max-w-lg w-full border-2 border-accent-gold/50 bg-bg-secondary/95 shadow-2xl space-y-6 relative overflow-hidden"
        >
          {/* Background glow */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-accent-gold/15 rounded-full blur-3xl pointer-events-none" />

          {/* Top Bar Header */}
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-accent-gold/20 text-accent-gold border border-accent-gold/40">
                <Share2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold font-display text-text-primary">
                  Social Share Wealth Tier Progress
                </h3>
                <p className="text-[11px] text-text-secondary">
                  Export your latest rank unlock and achievements to common platforms.
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-text-muted hover:text-text-primary rounded-xl hover:bg-bg-primary transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Celebratory Badge Preview Card */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-bg-void via-bg-primary to-bg-secondary border-2 border-accent-gold/60 shadow-2xl space-y-4 text-center relative overflow-hidden">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-gold/20 text-accent-gold border border-accent-gold/40 font-mono text-[10px] font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" /> Official WealthWise Elite Certificate
            </div>

            <div className="space-y-1">
              <div className="text-4xl my-2">{tier.badge}</div>
              <span className="text-xs font-mono text-text-muted uppercase tracking-widest block">Level {tier.level} Achieved</span>
              <h4 className="text-2xl font-bold font-display text-text-primary tracking-tight">
                {tier.name}
              </h4>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/60 text-xs font-mono">
              <div className="p-2 rounded-xl bg-bg-secondary/80 border border-border/60">
                <span className="text-[9px] text-text-muted block uppercase">Total XP</span>
                <span className="font-bold text-accent-gold">{totalXP.toLocaleString()}</span>
              </div>
              <div className="p-2 rounded-xl bg-bg-secondary/80 border border-border/60">
                <span className="text-[9px] text-text-muted block uppercase">Streak</span>
                <span className="font-bold text-amber-400 flex items-center justify-center gap-1">
                  <Flame className="w-3 h-3 fill-amber-400" /> {streak}d
                </span>
              </div>
              <div className="p-2 rounded-xl bg-bg-secondary/80 border border-border/60">
                <span className="text-[9px] text-text-muted block uppercase">Rank</span>
                <span className="font-bold text-emerald-400">Top 5%</span>
              </div>
            </div>
          </div>

          {/* Pre-formatted Message Text Box */}
          <div className="space-y-2">
            <label className="text-xs font-mono font-bold text-text-muted uppercase tracking-wider block">
              Pre-Formatted Celebratory Message:
            </label>
            <div className="p-3 bg-bg-void border border-border rounded-xl font-mono text-xs text-text-primary leading-relaxed flex items-start justify-between gap-2">
              <p className="select-all">{shareText}</p>
              <button
                onClick={handleCopy}
                className="p-2 rounded-lg bg-bg-secondary border border-border hover:border-accent-gold text-accent-gold transition-all cursor-pointer shrink-0"
                title="Copy Message"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Social Platform Buttons */}
          <div className="space-y-2">
            <span className="text-xs font-mono font-bold text-text-muted uppercase tracking-wider block">
              Direct Export to Social Platforms:
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                onClick={handleShareTwitter}
                className="py-2.5 px-3 rounded-xl bg-[#1DA1F2]/15 hover:bg-[#1DA1F2] hover:text-white text-[#1DA1F2] border border-[#1DA1F2]/40 font-mono text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <Twitter className="w-4 h-4" />
                <span>Post on X</span>
              </button>

              <button
                onClick={handleShareLinkedIn}
                className="py-2.5 px-3 rounded-xl bg-[#0A66C2]/15 hover:bg-[#0A66C2] hover:text-white text-[#0A66C2] border border-[#0A66C2]/40 font-mono text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <Linkedin className="w-4 h-4" />
                <span>LinkedIn</span>
              </button>

              <button
                onClick={handleShareWhatsApp}
                className="py-2.5 px-3 rounded-xl bg-[#25D366]/15 hover:bg-[#25D366] hover:text-white text-[#25D366] border border-[#25D366]/40 font-mono text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
