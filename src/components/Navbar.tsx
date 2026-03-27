import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Menu, X, Globe, ChevronRight, Sun, Moon, LogOut, User } from "lucide-react";
import { Logo } from "./Logo";
import { CURRENCIES } from "../constants";
import { UserProfile } from "../types";

interface NavbarProps {
  currentHash: string;
  user: UserProfile | null;
  onSignOut: () => void;
  currency: string;
  onCurrencyClick: () => void;
  theme: "light" | "dark";
  onToggleTheme: () => void;
}

export function Navbar({ currentHash, user, onSignOut, currency, onCurrencyClick, theme, onToggleTheme }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 80);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", hash: "#home" },
    { name: "Dashboard", hash: "#dashboard" },
    { name: "Learn", hash: "#resources" },
    { name: "Simulate", hash: "#simulator" },
    { name: "Allocation", hash: "#allocation" },
    { name: "Quiz", hash: "#quiz" },
    { name: "AI Advisor", hash: "#advisor" },
  ];

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${isScrolled ? "glass py-3" : "py-6"}`}>
      <div className="container mx-auto px-6 flex items-center justify-between">
        <a href="#home" className="hover:opacity-80 transition-opacity">
          <Logo />
        </a>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.hash}
              className={`text-sm font-medium transition-colors hover:text-accent-gold ${currentHash === link.hash ? "text-accent-gold" : "text-text-secondary"}`}
            >
              {link.name}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-full hover:bg-bg-secondary transition-colors text-text-primary"
            title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
          >
            {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </button>

          <button
            onClick={onCurrencyClick}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-bg-secondary border border-border hover:border-border-active transition-all"
          >
            <span className="text-xs font-bold text-accent-gold">{CURRENCIES[currency]?.symbol}</span>
            <span className="text-xs font-medium uppercase">{currency}</span>
          </button>

          {user ? (
            <div className="hidden sm:flex items-center gap-3">
              <div className="flex flex-col items-end">
                <span className="text-xs font-bold text-text-primary">{user.name}</span>
                <button onClick={onSignOut} className="text-[10px] text-text-muted hover:text-accent-red flex items-center gap-1 transition-colors">
                  <LogOut className="w-3 h-3" /> Sign Out
                </button>
              </div>
              <div className="w-8 h-8 rounded-full bg-accent-gold/20 flex items-center justify-center text-accent-gold border border-accent-gold/30 font-bold text-xs">
                {user.name[0]}
              </div>
            </div>
          ) : (
            <a href="#dashboard" className="hidden sm:flex btn-primary !py-2 !px-4 text-sm">
              Get Started <ChevronRight className="w-4 h-4 ml-1" />
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
