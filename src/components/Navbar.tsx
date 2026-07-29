import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Menu, X, Globe, ChevronRight, Sun, Moon, Flame, Sparkles, Cloud, Monitor, Palette, Check, Trophy } from "lucide-react";
import { Logo } from "./Logo";
import { CURRENCIES } from "../constants";

interface NavbarProps {
  currentHash: string;
  currency: string;
  onCurrencyClick: () => void;
  theme: "light" | "dark";
  themeMode?: "system" | "light" | "dark";
  onToggleTheme: () => void;
  onSetThemeMode?: (mode: "system" | "light" | "dark") => void;
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isThemePanelOpen, setIsThemePanelOpen] = useState(false);
  const themePanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 80);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (themePanelRef.current && !themePanelRef.current.contains(e.target as Node)) {
        setIsThemePanelOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navLinks = [
    { name: "Wexa Core", hash: "#wexa-agent" },
    { name: "Companion", hash: "#wexa-companion" },
    { name: "Bank Sync", hash: "#bank-sync" },
    { name: "Dashboard", hash: "#dashboard" },
    { name: "Rent vs Buy", hash: "#rent-vs-buy" },
    { name: "Vault", hash: "#vault" },
    { name: "Rebalancer", hash: "#rebalancer" },
    { name: "Submission Hub", hash: "#hackathon-hub" },
    { name: "Audit Log", hash: "#audit-report" },
    { name: "MacroPulse", hash: "#macropulse" },
    { name: "Pricing", hash: "#pricing" },
    { name: "Billing", hash: "#billing" },
  ];

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${isScrolled ? "glass py-2.5" : "py-4"}`}>
      <div className="container mx-auto px-6 relative flex items-center justify-between min-h-[52px]">
        
        {/* Left Side Navigation & Status */}
        <div className="flex items-center gap-6">
          <div className="hidden xl:flex items-center gap-5">
            {navLinks.slice(0, 4).map((link) => (
              <a
                key={link.name}
                href={link.hash}
                className={`text-xs font-semibold tracking-wide transition-colors hover:text-accent-gold ${currentHash === link.hash ? "text-accent-gold" : "text-text-secondary"}`}
              >
                {link.name}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/25 rounded-full text-[10px] font-bold tracking-wider uppercase font-mono text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span>{user?.email ? "MongoDB Active" : "Production Mode"}</span>
          </div>

          <div className="hidden lg:flex items-center gap-1 px-2.5 py-1 bg-accent-gold/10 border border-accent-gold/20 rounded-full text-accent-gold">
            <Flame className="w-3.5 h-3.5 fill-accent-gold" />
            <span className="text-[10px] font-black tracking-tighter">{streak} DAY STREAK</span>
          </div>
        </div>

        {/* Center Prominent Logo */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center pointer-events-auto">
          <a href="#home" onClick={onLogoClick} className="hover:scale-105 transition-transform flex items-center gap-2">
            <Logo size="md" onClick={onLogoClick} />
          </a>
        </div>

        {/* Right Side Navigation & Controls */}
        <div className="flex items-center gap-3">
          <div className="hidden xl:flex items-center gap-5 mr-2">
            {navLinks.slice(4, 7).map((link) => (
              <a
                key={link.name}
                href={link.hash}
                className={`text-xs font-semibold tracking-wide transition-colors hover:text-accent-gold ${currentHash === link.hash ? "text-accent-gold" : "text-text-secondary"}`}
              >
                {link.name}
              </a>
            ))}
          </div>

          <a
            href="#hackathon-hub"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-accent-gold/10 border border-accent-gold/30 rounded-xl text-accent-gold text-[10px] font-bold uppercase tracking-widest hover:border-accent-gold hover:bg-accent-gold/20 transition-all shadow-sm font-mono"
          >
            <Trophy className="w-3 h-3 text-accent-gold" /> Submission Hub
          </a>

          <button
            onClick={() => window.dispatchEvent(new CustomEvent('start-judge-tour'))}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-bg-secondary border border-accent-gold/30 rounded-xl text-accent-gold text-[10px] font-bold uppercase tracking-widest hover:border-accent-gold transition-all font-mono"
          >
            <Sparkles className="w-3 h-3" /> System Tour
          </button>

          {/* Theme Settings Panel Trigger */}
          <div className="relative" ref={themePanelRef}>
            <button
              onClick={() => setIsThemePanelOpen(!isThemePanelOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-bg-secondary border border-accent-gold/30 hover:border-accent-gold text-accent-gold transition-all cursor-pointer shadow-sm text-xs font-bold"
              title="Open Theme Settings Panel"
            >
              <Palette className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[10px] uppercase font-mono tracking-wider">
                {themeMode === "system" ? "System" : themeMode === "light" ? "Light" : "Dark"}
              </span>
            </button>

            {/* Theme Settings Dropdown Panel */}
            <AnimatePresence>
              {isThemePanelOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-64 bg-bg-secondary border border-border shadow-2xl rounded-2xl p-3 z-50 space-y-2 backdrop-blur-xl"
                >
                  <div className="flex items-center justify-between border-b border-border/50 pb-2 px-1">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-text-muted flex items-center gap-1">
                      <Palette className="w-3 h-3 text-accent-gold" /> Theme Settings
                    </span>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-accent-gold/10 text-accent-gold border border-accent-gold/20 font-bold">
                      Live Preview
                    </span>
                  </div>

                  <div className="space-y-1">
                    <button
                      onClick={() => {
                        onSetThemeMode?.("system");
                        setIsThemePanelOpen(false);
                      }}
                      className={`w-full flex items-center justify-between p-2 rounded-xl text-xs font-mono transition-all cursor-pointer ${
                        themeMode === "system"
                          ? "bg-accent-gold/15 border border-accent-gold/40 text-accent-gold font-bold"
                          : "hover:bg-bg-tertiary text-text-secondary border border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Monitor className="w-4 h-4" />
                        <span>System Default</span>
                      </div>
                      {themeMode === "system" && <Check className="w-3.5 h-3.5 text-accent-gold" />}
                    </button>

                    <button
                      onClick={() => {
                        onSetThemeMode?.("dark");
                        setIsThemePanelOpen(false);
                      }}
                      className={`w-full flex items-center justify-between p-2 rounded-xl text-xs font-mono transition-all cursor-pointer ${
                        themeMode === "dark"
                          ? "bg-accent-gold/15 border border-accent-gold/40 text-accent-gold font-bold"
                          : "hover:bg-bg-tertiary text-text-secondary border border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Moon className="w-4 h-4 text-accent-gold" />
                        <span>Dark Luxury Canvas</span>
                      </div>
                      {themeMode === "dark" && <Check className="w-3.5 h-3.5 text-accent-gold" />}
                    </button>

                    <button
                      onClick={() => {
                        onSetThemeMode?.("light");
                        setIsThemePanelOpen(false);
                      }}
                      className={`w-full flex items-center justify-between p-2 rounded-xl text-xs font-mono transition-all cursor-pointer ${
                        themeMode === "light"
                          ? "bg-accent-gold/15 border border-accent-gold/40 text-accent-gold font-bold"
                          : "hover:bg-bg-tertiary text-text-secondary border border-transparent"
                      }`}
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

          <button
            onClick={onCurrencyClick}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-bg-secondary border border-border hover:border-border-active transition-all"
          >
            <span className="text-xs font-bold text-accent-gold">{CURRENCIES[currency]?.symbol || "$"}</span>
            <span className="text-[11px] font-medium uppercase">{currency}</span>
          </button>

          {user ? (
            <div className="hidden sm:flex items-center gap-2.5 ml-1">
              <div className="w-7 h-7 rounded-full overflow-hidden border border-border bg-bg-secondary flex items-center justify-center">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || "User"} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <span className="text-[10px] font-bold text-accent-gold">
                    {(user.displayName || "U").charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <button onClick={onSignOut} className="text-[11px] text-text-secondary hover:text-text-primary transition-colors font-medium">
                Sign Out
              </button>
            </div>
          ) : (
            <a href="#dashboard" className="hidden sm:flex px-4 py-1.5 bg-bg-secondary border border-border text-text-primary text-[11px] font-bold uppercase tracking-widest rounded-xl hover:bg-bg-primary transition-all">
              Sign In
            </a>
          )}

          <button
            className="lg:hidden text-text-primary p-1"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 w-full glass border-t border-border lg:hidden"
          >
            <div className="flex flex-col p-6 gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.hash}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`text-lg font-medium ${currentHash === link.hash ? "text-accent-gold" : "text-text-secondary"}`}
                >
                  {link.name}
                </a>
              ))}
              <a href="#dashboard" onClick={() => setIsMobileMenuOpen(false)} className="btn-primary text-center">
                Get Started
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
