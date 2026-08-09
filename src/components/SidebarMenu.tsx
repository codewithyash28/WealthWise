import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  X, Bot, ShieldCheck, TrendingUp, Zap, PieChart, Globe, Target, 
  Trophy, DollarSign, Building2, FileText, Award, ArrowRight
} from "lucide-react";
import { Logo } from "./Logo";

interface SidebarMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (hash: string) => void;
}

export const SidebarMenu: React.FC<SidebarMenuProps> = ({ isOpen, onClose, onNavigate }) => {
  const drawerSections = [
    {
      title: "🤖 AI TOOLS",
      items: [
        { name: "Gemini Vision Receipt Scanner", hash: "#wexa-companion", icon: Bot, desc: "AI OCR for receipts & tax deductions" },
        { name: "Autonomous Midnight Auditor", hash: "#audit-report", icon: ShieldCheck, desc: "Real-time drift detection & modal locking" },
      ]
    },
    {
      title: "📊 MARKET & WEALTH ENGINES",
      items: [
        { name: "MacroPulse Volatility Stress Test", hash: "#macropulse", icon: TrendingUp, desc: "Macro inflation & yield stress testing" },
        { name: "TrendMarket Live Signals", hash: "#trendmarket", icon: Zap, desc: "Live market trends & volatility heatmaps" },
        { name: "D3 Portfolio Heatmap & Rebalancing", hash: "#rebalancer", icon: PieChart, desc: "Slippage-free asset reallocation matrix" },
        { name: "Global News & Portfolio Impact", hash: "#intelligence", icon: Globe, desc: "Grounding news with direct asset delta" },
      ]
    },
    {
      title: "🎯 BUDGET & DEBT",
      items: [
        { name: "Traffic-Light Budget Auditor", hash: "#budget", icon: Target, desc: "Green/Yellow/Red safe-to-spend tracking" },
        { name: "Goal Lock Guardrails", hash: "#goals", icon: Trophy, desc: "CSS blur-lock discipline for savings goals" },
        { name: "Snowball & Avalanche Debt Payoff", hash: "#debt", icon: DollarSign, desc: "High-yield liability elimination strategy" },
      ]
    },
    {
      title: "🛡️ COMPANY & AUDITS",
      items: [
        { name: "Platform Transparency Hub", hash: "#hackathon-hub", icon: Building2, desc: "Real P&L Manager & Investor Portal" },
        { name: "Structured PDF Report Exporter", hash: "#monthly-report", icon: FileText, desc: "Export audited monthly financial statements" },
        { name: "7-Tier Gamified Wealth Leveling", hash: "#badges", icon: Award, desc: "Level 1 to 12 Diamond rank milestones" },
      ]
    }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md cursor-pointer"
          />

          {/* Slide-out Drawer Container */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 220 }}
            className="absolute top-0 right-0 h-full w-full max-w-md bg-slate-950 border-l border-accent-gold/40 shadow-2xl flex flex-col justify-between overflow-y-auto text-text-primary"
          >
            {/* Drawer Header */}
            <div className="p-6 border-b border-border/80 flex items-center justify-between bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 sticky top-0 z-10">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-accent-gold/20 border border-accent-gold/40 text-accent-gold">
                  <Logo size="sm" />
                </div>
                <div>
                  <h3 className="text-base font-black font-display text-white flex items-center gap-1.5">
                    Wexa AI Engine Navigator <span className="text-accent-gold">🚀</span>
                  </h3>
                  <p className="text-[10px] font-mono text-emerald-400 font-bold uppercase">
                    All Production Modules
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-bg-secondary hover:bg-slate-800 text-text-muted hover:text-text-primary font-bold text-sm transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Body - Grouped Sections */}
            <div className="p-6 space-y-6 flex-1 font-mono">

              {drawerSections.map((section, idx) => (
                <div key={idx} className="space-y-2.5">
                  <h4 className="text-xs font-bold text-accent-gold uppercase tracking-wider flex items-center gap-2 border-b border-border/50 pb-1.5">
                    <span>{section.title}</span>
                  </h4>

                  <div className="space-y-1.5">
                    {section.items.map((item, itemIdx) => {
                      const ItemIcon = item.icon;
                      return (
                        <div
                          key={itemIdx}
                          onClick={() => {
                            onNavigate(item.hash);
                            onClose();
                          }}
                          className="p-3 rounded-xl bg-bg-void/80 hover:bg-slate-900 border border-border/70 hover:border-accent-gold/40 transition-all cursor-pointer flex items-center justify-between group"
                        >
                          <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-bg-secondary text-accent-gold group-hover:bg-accent-gold group-hover:text-slate-950 transition-colors shrink-0">
                              <ItemIcon className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="text-xs font-bold text-text-primary group-hover:text-accent-gold transition-colors">
                                {item.name}
                              </div>
                              <div className="text-[10px] text-text-muted font-sans mt-0.5">
                                {item.desc}
                              </div>
                            </div>
                          </div>

                          <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-accent-gold group-hover:translate-x-1 transition-all shrink-0 ml-2" />
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}

            </div>

            {/* Drawer Footer */}
            <div className="p-6 border-t border-border/80 bg-slate-950 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between text-text-muted text-[11px]">
                <span>Environment: <strong className="text-emerald-400">Google Cloud Run</strong></span>
                <span>Port: <strong className="text-cyan-400">3000</strong></span>
              </div>

              <button
                onClick={() => {
                  onNavigate("#hackathon-hub");
                  onClose();
                }}
                className="w-full py-3 rounded-xl bg-accent-gold text-slate-950 font-bold uppercase tracking-wider hover:bg-amber-400 transition-all text-center flex items-center justify-center gap-2 shadow-xl cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" /> Open Transparency Hub
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
