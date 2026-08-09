import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sparkles, 
  Check, 
  X, 
  Zap, 
  ShieldCheck, 
  FileSpreadsheet, 
  Crown, 
  CreditCard,
  Lock,
  ArrowRight
} from "lucide-react";
import { useClerkAuth } from "../lib/clerk";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureTitle?: string;
  onSuccess?: () => void;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({
  isOpen,
  onClose,
  featureTitle,
  onSuccess
}) => {
  const { user, isClerkActive } = useClerkAuth();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("annual");
  const [isSubscribing, setIsSubscribing] = useState(false);

  if (!isOpen) return null;

  const handleUpgrade = () => {
    setIsSubscribing(true);
    setTimeout(() => {
      setIsSubscribing(false);
      
      // Update local profile isPremium
      const savedProfile = localStorage.getItem("ww_profile");
      if (savedProfile) {
        try {
          const parsed = JSON.parse(savedProfile);
          parsed.isPremium = true;
          localStorage.setItem("ww_profile", JSON.stringify(parsed));
        } catch (e) {
          console.error(e);
        }
      }

      window.dispatchEvent(new CustomEvent('ww-trigger-alert', {
        detail: {
          type: 'success',
          title: 'Upgrade Successful! 🚀',
          message: `Welcome to Wexa AI Pro! Unlocked unlimited scans, D3 treemaps & Executive PDF exports.`
        }
      }));

      if (onSuccess) onSuccess();
      onClose();
    }, 1200);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-bg-void/85 backdrop-blur-md"
          onClick={onClose}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="card w-full max-w-xl p-6 sm:p-8 border-2 border-accent-gold/50 bg-gradient-to-b from-bg-secondary via-bg-secondary to-bg-void relative z-10 space-y-6 shadow-[0_0_50px_rgba(240,180,41,0.2)] rounded-3xl overflow-hidden text-left"
        >
          {/* Top Decorative Glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent-gold/10 rounded-full blur-3xl pointer-events-none" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl bg-bg-void/60 border border-border/80 text-text-muted hover:text-text-primary transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="space-y-2 pr-8">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-gold/15 border border-accent-gold/30 text-accent-gold text-[10px] font-mono font-bold uppercase tracking-widest">
              <Crown className="w-3.5 h-3.5" />
              Wexa AI Pro • Clerk Managed Plan
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-text-primary tracking-tight">
              Unlock <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-gold via-amber-300 to-yellow-200">Wexa AI Pro</span>
            </h2>

            {featureTitle ? (
              <p className="text-xs sm:text-sm text-accent-gold font-mono font-bold flex items-center gap-1.5">
                <Lock className="w-4 h-4" />
                '{featureTitle}' is an exclusive Pro feature. Upgrade to unlock instant access.
              </p>
            ) : (
              <p className="text-xs sm:text-sm text-text-secondary">
                Elevate your wealth management with institutional-grade AI, 24/7 rebalancing, and executive report downloads.
              </p>
            )}
          </div>

          {/* Pricing Toggle */}
          <div className="flex items-center justify-center pt-2">
            <div className="bg-bg-void p-1.5 rounded-2xl border border-border/80 inline-flex items-center gap-1 font-mono text-xs w-full max-w-md">
              <button
                type="button"
                onClick={() => setBillingCycle("monthly")}
                className={`flex-1 py-2.5 px-4 rounded-xl font-bold transition-all text-center cursor-pointer ${
                  billingCycle === "monthly" 
                    ? "bg-accent-gold text-bg-void shadow-lg" 
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                Monthly ($9/mo)
              </button>

              <button
                type="button"
                onClick={() => setBillingCycle("annual")}
                className={`flex-1 py-2.5 px-4 rounded-xl font-bold transition-all text-center relative cursor-pointer ${
                  billingCycle === "annual" 
                    ? "bg-accent-gold text-bg-void shadow-lg" 
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                Annual ($5/mo)
                <span className="ml-1.5 px-1.5 py-0.5 bg-emerald-500 text-bg-void text-[9px] font-extrabold rounded-full inline-block">
                  SAVE 44%
                </span>
              </button>
            </div>
          </div>

          {/* Pricing Display */}
          <div className="p-4 rounded-2xl bg-bg-void/80 border border-accent-gold/30 flex items-center justify-between">
            <div>
              <div className="text-[10px] font-mono text-text-muted uppercase font-bold">Selected Subscription Plan</div>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-3xl font-black text-text-primary font-mono">
                  {billingCycle === "annual" ? "$5.00" : "$9.00"}
                </span>
                <span className="text-xs font-mono text-accent-gold font-bold">
                  / month {billingCycle === "annual" ? "(Billed $60/yr)" : "(Billed monthly)"}
                </span>
              </div>
            </div>
            <div className="px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-bold">
              {billingCycle === "annual" ? "Best Value (Save 44%)" : "Cancel Anytime"}
            </div>
          </div>

          {/* Feature Highlights */}
          <div className="space-y-3 pt-2">
            <div className="text-xs font-mono font-bold uppercase tracking-wider text-text-muted">
              Included with Wexa AI Pro:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-text-primary">
              {[
                { icon: "⚡", text: "Unlimited Gemini AI Receipt Scans" },
                { icon: "📊", text: "D3 Portfolio Treemap & Rebalancer" },
                { icon: "📄", text: "Executive PDF Audit Exports" },
                { icon: "🌙", text: "24/7 Midnight Drift Auditor" },
                { icon: "🛡️", text: "Strict Goal Lock Guardrails" },
                { icon: "🔥", text: "Custom Macro Stress Testing" },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2 rounded-xl bg-bg-secondary/60 border border-border/50">
                  <span className="text-sm">{item.icon}</span>
                  <span className="font-medium text-[11px]">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="space-y-3 pt-2">
            <button
              onClick={handleUpgrade}
              disabled={isSubscribing}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-accent-gold via-amber-400 to-yellow-400 text-bg-void font-mono text-sm font-black uppercase tracking-wider hover:opacity-95 transition-all shadow-[0_0_30px_rgba(240,180,41,0.3)] flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubscribing ? (
                <>
                  <div className="w-4 h-4 border-2 border-bg-void border-t-transparent rounded-full animate-spin" />
                  <span>Activating Pro Plan via Clerk...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-bg-void fill-bg-void" />
                  <span>Upgrade to Wexa AI Pro 🚀</span>
                  <ArrowRight className="w-4 h-4 ml-1 text-bg-void" />
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 text-xs font-mono text-text-muted hover:text-text-primary transition-colors cursor-pointer text-center"
            >
              Continue with Free Tier
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
