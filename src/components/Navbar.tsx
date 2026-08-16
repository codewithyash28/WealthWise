import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Menu, X, Sun, Moon, Flame, Sparkles, Cloud, Check, Trophy, 
  Bot, TrendingUp, BarChart2, PieChart, Globe, ShieldCheck, Target, 
  DollarSign, Award, FileText, Building2, Zap, User, ArrowRight, Palette, Monitor, LogOut, ChevronDown, Crown
} from "lucide-react";
import { NotificationCenter } from "./NotificationCenter";
import { Logo } from "./Logo";
import { CURRENCIES } from "../constants";
import { cn } from "../lib/utils";

interface NavbarProps {
  currentHash: string;
  currency: string;
  onCurrencyClick: () => void;
  theme: "light" | "dark" | "noir";
  themeMode?: "system" | "light" | "dark" | "noir";
  onToggleTheme: () => void;
  onSetThemeMode?: (mode: "system" | "light" | "dark" | "noir") => void;
  user?: { displayName: string | null; photoURL: string | null; email?: string | null } | null;
  onSignOut?: () => void;
  streak?: number;
  onLogoClick?: () => void;
}

export function Navbar({ 
  currentHash, 
  currency, 
  onCurrencyClick, 
  theme, 
  themeMode = "dark",
  onToggleTheme, 
  onSetThemeMode,
  user, 
  onSignOut, 
  streak = 1, 
  onLogoClick 
}: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isThemePanelOpen, setIsThemePanelOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>("Just now");
  const themePanelRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleSyncStart = () => setIsSyncing(true);
    const handleSyncComplete = () => {
      setIsSyncing(false);
      setLastSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };

    window.addEventListener("ww-cloud-sync-start", handleSyncStart);
    window.addEventListener("ww-cloud-sync-complete", handleSyncComplete);

    return () => {
      window.removeEventListener("ww-cloud-sync-start", handleSyncStart);
      window.removeEventListener("ww-cloud-sync-complete", handleSyncComplete);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (themePanelRef.current && !themePanelRef.current.contains(e.target as Node)) {
        setIsThemePanelOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Main feature tabs displayed in center header bar
  const mainTabs = [
    { name: "Market Weather 🌤️", hash: "#macropulse", icon: TrendingUp },
    { name: "TrendMarket 📈", hash: "#trendmarket", icon: Zap },
    { name: "Evidence Engine 📊", hash: "#evidence-engine", icon: BarChart2, highlight: true },
    { name: "💎 Pro / Pricing", hash: "#pricing", icon: Crown },
    { name: "Platform Transparency Hub 🛡️", hash: "#hackathon-hub", icon: ShieldCheck },
  ];

  // Drawer grouped into simple sections
  const drawerSections = [
    {
      title: "💎 PLANS & UPGRADES",
      items: [
        { name: "Wexa AI Pro ($19/mo) 💎", hash: "#pricing", icon: Crown, desc: "Global Stripe/Razorpay payments, unlimited OCR & autonomous AI rebalancing" },
      ]
    },
    {
      title: "📸 MAGIC TOOLS",
      items: [
        { name: "Magic Bill Reader 📸", hash: "#wexa-companion", icon: Bot, desc: "AI OCR for receipts & instant expense logging" },
        { name: "Daily Money Helper 🌅", hash: "#audit-report", icon: ShieldCheck, desc: "Autonomous Auditor & drift detection" },
      ]
    },
    {
      title: "🌤️ MARKET WEATHER",
      items: [
        { name: "Market Weather 🌤️", hash: "#macropulse", icon: TrendingUp, desc: "Macro inflation & yield stress testing" },
        { name: "Money Games & Stocks 📈", hash: "#stocks", icon: BarChart2, desc: "Live global stock quotes & AI sentiment" },
        { name: "TrendMarket Signals 📈", hash: "#trendmarket", icon: Zap, desc: "Live market trends & volatility heatmaps" },
      ]
    },
    {
      title: "🐷 MY PIGGY BANK",
      items: [
        { name: "Easy Budgeter 🐷", hash: "#budget", icon: Target, desc: "Green/Yellow/Red safe-to-spend tracking" },
        { name: "Debt Payoff 💳", hash: "#debt", icon: DollarSign, desc: "High-yield liability elimination strategy" },
        { name: "Goal Guardrails 🎯", hash: "#goals", icon: Trophy, desc: "Lock discipline for savings targets" },
      ]
    },
    {
      title: "🛡️ COMPANY, AUDITS & XPRIZE",
      items: [
        { name: "Evidence Engine & Revenue Proof 📊", hash: "#evidence-engine", icon: TrendingUp, desc: "XPRIZE Monthly Revenue & Business Viability Engine (May–Aug 2026)" },
        { name: "Platform Transparency Hub 🛡️", hash: "#hackathon-hub", icon: Building2, desc: "Real P&L Manager & Investor Portal" },
        { name: "Executive Report Exporter 📄", hash: "#monthly-report", icon: FileText, desc: "Export audited monthly financial statements" },
      ]
    }
  ];

  const handleNavClick = (hash: string) => {
    setIsDrawerOpen(false);
    if (hash === "#evidence-engine") {
      window.dispatchEvent(new CustomEvent("ww-open-evidence-engine"));
      return;
    }
    window.location.hash = hash;
  };

  return (
    <>
      <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${isScrolled ? "glass py-2 shadow-2xl backdrop-blur-xl" : "py-3 bg-bg-primary/90"}`}>
        <div className="container mx-auto px-4 md:px-6 flex items-center justify-between min-h-[52px]">
          
          {/* FAR LEFT: App Brand 'Wexa AI 🚀' */}
          <div className="flex items-center gap-3">
            <a 
              href="#home" 
              onClick={onLogoClick} 
              className="flex items-center gap-2 hover:scale-105 transition-transform cursor-pointer"
            >
              <Logo size="md" onClick={onLogoClick} />
              <div className="flex flex-col">
                <span className="font-display font-black text-base md:text-lg text-text-primary tracking-tight flex items-center gap-1.5">
                  Wexa AI <span className="text-accent-gold">🚀</span>
                </span>
                <span className="text-[9px] font-mono text-emerald-400 font-bold uppercase tracking-widest hidden sm:inline-block">
                  Autonomous Wealth
                </span>
              </div>
            </a>
          </div>

          {/* MIDDLE SECTION: Main feature category tabs */}
          <div className="hidden lg:flex items-center gap-1 xl:gap-2 px-3 py-1 rounded-2xl bg-bg-secondary/80 border border-border/80 shadow-inner">
            {mainTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = currentHash === tab.hash;
              return (
                <a
                  key={tab.name}
                  href={tab.hash}
                  onClick={(e) => {
                    if (tab.hash === "#evidence-engine") {
                      e.preventDefault();
                      window.dispatchEvent(new CustomEvent("ww-open-evidence-engine"));
                    }
                  }}
                  className={cn(
                    "px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer",
                    isActive
                      ? "bg-accent-gold text-slate-950 shadow-md font-black"
                      : tab.highlight
                      ? "text-accent-gold hover:bg-accent-gold/15 bg-accent-gold/10 border border-accent-gold/30"
                      : "text-text-secondary hover:text-text-primary hover:bg-bg-tertiary"
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.name}</span>
                </a>
              );
            })}
          </div>

          {/* FAR RIGHT END: Controls in order -> User Profile Icon (YC) -> Dark/Light Mode -> Currency -> Hamburger Menu (☰) */}
          <div className="flex items-center gap-2.5">
            
            {/* 1. USER PROFILE ICON & DROPDOWN MENU */}
            <div className="relative" ref={userMenuRef}>
              {user ? (
                <button
                  type="button"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-1.5 p-1 pr-2 rounded-xl bg-bg-secondary border border-border hover:border-accent-gold/50 transition-all cursor-pointer shadow-sm"
                  title={`Account options for ${user.displayName || user.email || "User"}`}
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-gold to-amber-600 text-slate-950 font-black font-mono text-xs flex items-center justify-center border border-amber-300 shadow-sm shrink-0">
                    {user.photoURL ? (
                      <img src={user.photoURL} alt="User Avatar" className="w-full h-full object-cover rounded-lg" referrerPolicy="no-referrer" />
                    ) : (
                      (user.displayName || user.email || "YC").slice(0, 2).toUpperCase()
                    )}
                  </div>
                  <span className="hidden sm:inline-block text-xs font-bold text-text-primary max-w-[80px] truncate font-mono">
                    {user.displayName?.split(" ")[0] || "Account"}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-text-muted" />
                </button>
              ) : (
                <button 
                  type="button"
                  onClick={() => handleNavClick("#dashboard")}
                  className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-accent-gold text-slate-950 font-black font-mono text-xs flex items-center justify-center border border-amber-300 shadow-sm cursor-pointer hover:scale-105 transition-all"
                  title="YC Investor / Verified Member"
                >
                  YC
                </button>
              )}

              {/* User Dropdown Menu */}
              <AnimatePresence>
                {isUserMenuOpen && user && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-64 bg-bg-secondary border border-border shadow-2xl rounded-2xl p-3 z-50 space-y-3 backdrop-blur-xl font-mono text-xs"
                  >
                    <div className="p-2 rounded-xl bg-bg-tertiary border border-border/60">
                      <div className="font-bold text-text-primary truncate">{user.displayName || "Active User"}</div>
                      {user.email && <div className="text-[10px] text-text-muted truncate mt-0.5">{user.email}</div>}
                      <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-bold uppercase">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        Authenticated Session
                      </div>
                    </div>

                    <div className="space-y-1">
                      <button
                        onClick={() => { setIsUserMenuOpen(false); handleNavClick("#badges"); }}
                        className="w-full flex items-center gap-2 p-2 rounded-xl hover:bg-bg-tertiary text-text-secondary hover:text-text-primary transition-all cursor-pointer"
                      >
                        <Trophy className="w-4 h-4 text-accent-gold" />
                        <span>Badges & Achievements</span>
                      </button>

                      <button
                        onClick={() => { setIsUserMenuOpen(false); handleNavClick("#hackathon-hub"); }}
                        className="w-full flex items-center gap-2 p-2 rounded-xl hover:bg-bg-tertiary text-text-secondary hover:text-text-primary transition-all cursor-pointer"
                      >
                        <ShieldCheck className="w-4 h-4 text-accent-emerald" />
                        <span>Platform Transparency Hub</span>
                      </button>
                    </div>

                    <div className="pt-2 border-t border-border/60">
                      <button
                        type="button"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          if (onSignOut) onSignOut();
                        }}
                        className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl bg-accent-red/10 border border-accent-red/30 hover:bg-accent-red/20 text-accent-red font-bold transition-all cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out Session</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 2. DARK/LIGHT MODE TOGGLE */}
            <div className="relative" ref={themePanelRef}>
              <button
                onClick={() => setIsThemePanelOpen(!isThemePanelOpen)}
                className="p-2 rounded-xl bg-bg-secondary border border-border hover:border-accent-gold/50 text-accent-gold transition-all cursor-pointer shadow-sm text-xs font-bold flex items-center justify-center"
                title="Toggle Dark / Light / Midnight Theme"
              >
                {themeMode === "light" ? (
                  <Sun className="w-4 h-4 text-amber-500" />
                ) : themeMode === "noir" ? (
                  <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                ) : (
                  <Moon className="w-4 h-4 text-accent-gold" />
                )}
              </button>

              {/* Theme Dropdown Panel */}
              <AnimatePresence>
                {isThemePanelOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-60 bg-bg-secondary border border-border shadow-2xl rounded-2xl p-3 z-50 space-y-2 backdrop-blur-xl"
                  >
                    <div className="flex items-center justify-between border-b border-border/50 pb-2 px-1">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-text-muted flex items-center gap-1">
                        <Palette className="w-3 h-3 text-accent-gold" /> Theme Mode
                      </span>
                    </div>

                    <div className="space-y-1 font-mono text-xs">
                      <button
                        onClick={() => { onSetThemeMode?.("dark"); setIsThemePanelOpen(false); }}
                        className={`w-full flex items-center justify-between p-2 rounded-xl transition-all cursor-pointer ${themeMode === "dark" ? "bg-accent-gold/15 border border-accent-gold/40 text-accent-gold font-bold" : "hover:bg-bg-tertiary text-text-secondary"}`}
                      >
                        <div className="flex items-center gap-2">
                          <Moon className="w-4 h-4 text-accent-gold" />
                          <span>Dark Luxury Canvas</span>
                        </div>
                        {themeMode === "dark" && <Check className="w-3.5 h-3.5 text-accent-gold" />}
                      </button>

                      <button
                        onClick={() => { onSetThemeMode?.("noir"); setIsThemePanelOpen(false); }}
                        className={`w-full flex items-center justify-between p-2 rounded-xl transition-all cursor-pointer ${themeMode === "noir" ? "bg-amber-400/20 border border-amber-300 text-amber-300 font-bold" : "hover:bg-bg-tertiary text-text-secondary"}`}
                      >
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-amber-300" />
                          <span className="text-amber-300 font-bold">Midnight Noir 🌙</span>
                        </div>
                        {themeMode === "noir" && <Check className="w-3.5 h-3.5 text-amber-300" />}
                      </button>

                      <button
                        onClick={() => { onSetThemeMode?.("light"); setIsThemePanelOpen(false); }}
                        className={`w-full flex items-center justify-between p-2 rounded-xl transition-all cursor-pointer ${themeMode === "light" ? "bg-accent-gold/15 border border-accent-gold/40 text-accent-gold font-bold" : "hover:bg-bg-tertiary text-text-secondary"}`}
                      >
                        <div className="flex items-center gap-2">
                          <Sun className="w-4 h-4 text-amber-500" />
                          <span>Light Precision Canvas</span>
                        </div>
                        {themeMode === "light" && <Check className="w-3.5 h-3.5 text-accent-gold" />}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 3. CURRENCY SELECTOR (₹ INR / $ USD) */}
            <button
              onClick={onCurrencyClick}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-bg-secondary border border-border hover:border-accent-gold/50 transition-all font-mono text-xs font-bold text-accent-gold cursor-pointer"
              title="Change Global Currency (e.g. ₹ INR, $ USD)"
            >
              <span>{CURRENCIES[currency]?.symbol || "₹"}</span>
              <span className="uppercase text-[10px] text-text-primary">{currency}</span>
            </button>

            {/* 4. HAMBURGER MENU ICON (☰ SLIDE-OUT DRAWER) */}
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="p-2.5 rounded-xl bg-accent-gold text-slate-950 hover:bg-amber-400 font-black transition-all cursor-pointer shadow-lg hover:scale-105 flex items-center justify-center"
              title="Open Feature Menu (☰)"
            >
              <Menu className="w-5 h-5" />
            </button>

          </div>
        </div>
      </nav>

      {/* HAMBURGER MENU (☰ SLIDE-OUT DRAWER) */}
      <AnimatePresence>
        {isDrawerOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
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
                  onClick={() => setIsDrawerOpen(false)}
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
                            onClick={() => handleNavClick(item.hash)}
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
                {user && (
                  <div className="p-3 rounded-xl bg-slate-900 border border-border/60 flex items-center justify-between">
                    <div className="truncate pr-2">
                      <div className="text-xs font-bold text-text-primary truncate">{user.displayName || "Active Session"}</div>
                      {user.email && <div className="text-[10px] text-text-muted truncate">{user.email}</div>}
                    </div>
                    {onSignOut && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsDrawerOpen(false);
                          onSignOut();
                        }}
                        className="px-3 py-1.5 rounded-lg bg-accent-red/15 hover:bg-accent-red/25 border border-accent-red/30 text-accent-red font-bold text-[11px] flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
                        title="Sign Out Session"
                      >
                        <LogOut className="w-3.5 h-3.5" /> Sign Out
                      </button>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between text-text-muted text-[11px]">
                  <span>Environment: <strong className="text-emerald-400">Google Cloud Run</strong></span>
                  <span>Port: <strong className="text-cyan-400">3000</strong></span>
                </div>

                <a
                  href="#hackathon-hub"
                  onClick={() => setIsDrawerOpen(false)}
                  className="w-full py-3 rounded-xl bg-accent-gold text-slate-950 font-bold uppercase tracking-wider hover:bg-amber-400 transition-all text-center flex items-center justify-center gap-2 shadow-xl"
                >
                  <ShieldCheck className="w-4 h-4" /> Open Transparency Hub
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
