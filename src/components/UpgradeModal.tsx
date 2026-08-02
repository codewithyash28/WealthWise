import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, CheckCircle2, Sparkles, Zap, Shield, ToggleLeft, ToggleRight, ArrowRight } from "lucide-react";
import { cn } from "../lib/utils";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgradeComplete?: () => void;
}

export function UpgradeModal({ isOpen, onClose, onUpgradeComplete }: UpgradeModalProps) {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "annually">("annually");

  if (!isOpen) return null;

  const handleUpgradeClick = () => {
    // Simulated Clerk checkout trigger
    window.location.hash = "#billing";
    onClose();

    window.dispatchEvent(new CustomEvent('ww-trigger-alert', {
      detail: {
        type: 'info',
        title: 'Redirecting to Billing...',
        message: 'Clerk Stripe Secure gateway checkout initialized.'
      }
    }));
  };

  const features = [
    "Unlimited Gemini AI Receipt Scans",
    "D3 Portfolio Treemap & Rebalancing",
    "VC-Ready Executive Summary PDF Exports",
    "24/7 Autonomous Midnight Auditor Alerts",
    "Custom Macro Stress Testing"
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-bg-void/90 backdrop-blur-md"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="card max-w-lg w-full p-8 space-y-6 relative border-accent-gold/40 shadow-[0_0_50px_rgba(234,179,8,0.2)] bg-bg-primary text-left z-10 overflow-hidden"
        >
          {/* Animated Background Accent Glow */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-accent-gold/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-accent-gold/5 rounded-full blur-3xl pointer-events-none" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-lg text-text-muted hover:text-text-primary transition-colors cursor-pointer"
            aria-label="Close Upgrade Modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Title Header */}
          <div className="space-y-2 text-center">
            <div className="inline-flex items-center gap-1.5 text-[9px] uppercase font-bold text-accent-gold tracking-widest bg-accent-gold/15 px-3 py-1 rounded-full border border-accent-gold/25 animate-pulse">
              <Sparkles className="w-3.5 h-3.5 text-accent-gold" />
              <span>Unlock Wexa AI Pro</span>
            </div>
            <h2 className="text-3xl font-display font-black tracking-tight text-white">
              Upgrade Your Portfolio Core
            </h2>
            <p className="text-xs text-text-secondary max-w-sm mx-auto">
              Empower your wealth planning with autonomous multi-agent algorithms and real-time stress testing.
            </p>
          </div>

          {/* Pricing Toggle Switch */}
          <div className="flex justify-center items-center gap-3 pt-2">
            <span className={cn("text-xs font-bold transition-all", billingPeriod === "monthly" ? "text-accent-gold" : "text-text-muted")}>
              Monthly ($9/mo)
            </span>
            <button
              onClick={() => setBillingPeriod(prev => prev === "monthly" ? "annually" : "monthly")}
              className="text-accent-gold focus:outline-none focus:ring-0 active:scale-95 transition-transform"
            >
              {billingPeriod === "monthly" ? (
                <ToggleLeft className="w-10 h-10 stroke-1" />
              ) : (
                <ToggleRight className="w-10 h-10 stroke-1" />
              )}
            </button>
            <div className="flex items-center gap-2">
              <span className={cn("text-xs font-bold transition-all", billingPeriod === "annually" ? "text-accent-emerald" : "text-text-muted")}>
                Annually ($5/mo)
              </span>
              <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider bg-accent-emerald/10 border border-accent-emerald/20 text-accent-emerald">
                Save 44%
              </span>
            </div>
          </div>

          {/* Billed info */}
          <div className="bg-bg-secondary/40 p-4 rounded-xl border border-border/40 text-center font-mono text-xs">
            {billingPeriod === "annually" ? (
              <span className="text-text-secondary">
                Billed annually at <strong className="text-accent-emerald font-bold">$60.00 / Year</strong>
              </span>
            ) : (
              <span className="text-text-secondary">
                Billed monthly at <strong className="text-accent-gold font-bold">$9.00 / Month</strong>
              </span>
            )}
          </div>

          {/* Pro Features Checklist */}
          <div className="space-y-3 pt-2">
            <div className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Pro Tier Features</div>
            <div className="grid grid-cols-1 sm:grid-cols-1 gap-2.5">
              {features.map((feature, idx) => (
                <div key={idx} className="flex items-start gap-3 text-xs text-text-secondary">
                  <CheckCircle2 className="w-4 h-4 text-accent-emerald shrink-0 mt-0.5" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Call Button */}
          <div className="pt-4 flex flex-col gap-2.5">
            <button
              onClick={handleUpgradeClick}
              className="btn-primary w-full py-4 text-xs font-bold uppercase tracking-widest text-bg-void flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.02] shadow-xl hover:shadow-accent-gold/5"
            >
              <Zap className="w-4 h-4 text-bg-void fill-bg-void" />
              <span>Initiate Secure Checkout</span>
              <ArrowRight className="w-4 h-4 text-bg-void" />
            </button>
            <div className="flex items-center justify-center gap-1.5 text-[9px] font-mono text-text-muted uppercase tracking-wider">
              <Shield className="w-3.5 h-3.5 text-accent-emerald" />
              <span>Payments secured under SSL TLS v1.3</span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
