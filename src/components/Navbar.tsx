import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Menu, X, Globe, ChevronRight, Sun, Moon, Flame, Sparkles, Cloud } from "lucide-react";
import { Logo } from "./Logo";
import { CURRENCIES } from "../constants";

interface NavbarProps {
  currentHash: string;
  currency: string;
  onCurrencyClick: () => void;
  theme: "light" | "dark";
  onToggleTheme: () => void;
  user?: { displayName: string | null; photoURL: string | null; email?: string | null } | null;
  onSignOut?: () => void;
}

export function Navbar({ currentHash, currency, onCurrencyClick, theme, onToggleTheme, user, onSignOut }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 80);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Dashboard", hash: "#dashboard" },
    { name: "Portfolio", hash: "#portfolio" },
    { name: "Rebalancer", hash: "#rebalancer" },
    { name: "Debt Payoff", hash: "#debt-payoff" },
    { name: "Tax Estimator", hash: "#tax-estimator" },
    { name: "MacroPulse", hash: "#macropulse" },
    { name: "Quiz", hash: "#quiz" },
    { name: "Badges", hash: "#badges" },
  ];

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${isScrolled ? "glass py-3.5 shadow-[0_4px_30px_rgba(0,0,0,0.3)]" : "py-6"}`}>
      <div className="container mx-auto px-6 flex items-center justify-between">
        <a href="#home" className="hover:opacity-80 transition-opacity">
          <Logo size="sm" />
        </a>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-6">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.hash}
              className={`relative py-1 text-[10px] font-bold uppercase tracking-[0.15em] transition-colors duration-200 hover:text-accent-gold ${currentHash === link.hash ? "text-accent-gold" : "text-text-secondary"}`}
            >
              {link.name}
              {currentHash === link.hash && (
                <motion.div
                  layoutId="activeNavIndicator"
                  className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-[#E2C9A1] to-[#C5A880] rounded-full"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-4">
          {user && (
            <div className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 border rounded-full text-[10px] font-black tracking-wider uppercase font-mono ${user.email ? "bg-accent-emerald/10 border-accent-emerald/30 text-accent-emerald" : "bg-accent-gold/10 border-accent-gold/20 text-accent-gold"}`}>
              <Cloud className="w-3.5 h-3.5 text-current" />
              <span>{user.email ? "MongoDB Synced" : "Local Sandbox"}</span>
            </div>
          )}

          <div className="hidden lg:flex items-center gap-1 px-2.5 py-1.5 bg-accent-gold/10 border border-accent-gold/20 rounded-full text-accent-gold mr-2 animate-pulse">
            <Flame className="w-4 h-4 fill-accent-gold" />
            <span className="text-[10px] font-black tracking-tighter">7 DAY STREAK</span>
          </div>

          <button
            onClick={() => window.dispatchEvent(new CustomEvent('start-judge-tour'))}
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 bg-white/[0.02] border border-white/[0.08] hover:border-accent-gold/30 rounded-full text-accent-gold text-[9px] font-bold uppercase tracking-widest hover:bg-white/[0.04] transition-all duration-300"
          >
            <Sparkles className="w-3 h-3" /> Judge Mode
          </button>

          <button
            onClick={onToggleTheme}
            className="p-2 rounded-full hover:bg-white/[0.04] border border-transparent hover:border-white/[0.04] transition-all text-text-primary"
            title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
          >
            {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>

          <button
            onClick={onCurrencyClick}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.02] border border-white/[0.08] hover:border-accent-gold/30 hover:bg-white/[0.04] transition-all duration-300"
          >
            <span className="text-[10px] font-bold text-accent-gold">{CURRENCIES[currency]?.symbol || "$"}</span>
            <span className="text-[10px] font-bold uppercase tracking-wide">{currency}</span>
          </button>

          {user ? (
            <div className="hidden sm:flex items-center gap-3 ml-1.5">
              <div className="w-7 h-7 rounded-full overflow-hidden border border-white/[0.08] bg-bg-secondary flex items-center justify-center shadow-md">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || "User"} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <span className="text-[10px] font-bold text-accent-gold">
                    {(user.displayName || "U").charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <button onClick={onSignOut} className="text-[10px] text-text-secondary hover:text-text-primary uppercase tracking-wider font-bold transition-colors">
                Sign Out
              </button>
            </div>
          ) : (
            <a href="#dashboard" className="hidden sm:flex px-4 py-2 bg-white/[0.02] border border-white/[0.08] text-text-primary text-[9px] font-bold uppercase tracking-widest rounded-full hover:bg-white/[0.06] hover:border-accent-gold/30 transition-all duration-300">
              Sign In
            </a>
          )}

          <button
            className="lg:hidden text-text-primary"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
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
