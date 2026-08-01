import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Check, ChevronRight, Globe, User } from "lucide-react";
import { CURRENCIES } from "../constants";
import { cn } from "../lib/utils";

interface CurrencySelectorProps {
  isOpen: boolean;
  onSelect: (currency: string) => void;
  currentCurrency?: string;
}

export function CurrencySelector({ isOpen, onSelect, currentCurrency }: CurrencySelectorProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-bg-void/90 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="card max-w-lg w-full p-8 space-y-8"
      >
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-display font-bold text-accent-gold">🌍 Welcome to Wexa AI</h2>
          <p className="text-text-secondary">Select your currency to personalize all calculations</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {Object.entries(CURRENCIES).map(([code, config]) => (
            <button
              key={code}
              onClick={() => onSelect(code)}
              className={cn(
                "flex flex-col items-center justify-center gap-2 p-4 rounded-xl border transition-all duration-200",
                currentCurrency === code 
                  ? "bg-accent-gold/10 border-accent-gold shadow-[0_0_15px_rgba(240,180,41,0.2)]" 
                  : "bg-bg-secondary border-border hover:border-border-active"
              )}
            >
              <span className="text-2xl">{code === 'USD' ? '🇺🇸' : code === 'GBP' ? '🇬🇧' : code === 'EUR' ? '🇪🇺' : code === 'CAD' ? '🇨🇦' : code === 'AUD' ? '🇦🇺' : code === 'JPY' ? '🇯🇵' : code === 'SGD' ? '🇸🇬' : code === 'INR' ? '🇮🇳' : code === 'BRL' ? '🇧🇷' : code === 'ZAR' ? '🇿🇦' : code === 'AED' ? '🇦🇪' : '🇲🇽'}</span>
              <div className="flex flex-col items-center">
                <span className="text-xs font-bold uppercase">{code}</span>
                <span className="text-[10px] text-text-muted">{config.symbol}</span>
              </div>
              {currentCurrency === code && (
                <div className="absolute top-2 right-2">
                  <Check className="w-3 h-3 text-accent-gold" />
                </div>
              )}
            </button>
          ))}
        </div>

        <button
          onClick={() => currentCurrency && onSelect(currentCurrency)}
          disabled={!currentCurrency}
          className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Let's Go <ChevronRight className="w-5 h-5" />
        </button>
      </motion.div>
    </div>
  );
}

interface NameInputProps {
  isOpen: boolean;
  initialName?: string;
  initialCurrency?: string;
  onComplete: (name: string, age: string, learningGoal: string, gitProvider: "gitlab" | "github" | "bitbucket", currency?: string) => void;
}

export function NameInput({ isOpen, initialName = "", initialCurrency = "USD", onComplete }: NameInputProps) {
  const [name, setName] = useState(initialName);
  const [age, setAge] = useState("");
  const [selectedCurrency, setSelectedCurrency] = useState(initialCurrency);
  const [learningGoal, setLearningGoal] = useState("Wealth Building & Financial Independence");
  const [gitProvider, setGitProvider] = useState<"gitlab" | "github" | "bitbucket">("github");

  useEffect(() => {
    if (initialName) setName(initialName);
  }, [initialName]);

  useEffect(() => {
    if (initialCurrency) setSelectedCurrency(initialCurrency);
  }, [initialCurrency]);

  if (!isOpen) return null;

  const ageOptions = ["18-24", "25-34", "35-49", "50+", "Skip"];

  const currencies = [
    { code: "USD", symbol: "$", flag: "🇺🇸", name: "USD" },
    { code: "INR", symbol: "₹", flag: "🇮🇳", name: "INR" },
    { code: "EUR", symbol: "€", flag: "🇪🇺", name: "EUR" },
    { code: "GBP", symbol: "£", flag: "🇬🇧", name: "GBP" },
    { code: "CAD", symbol: "$", flag: "🇨🇦", name: "CAD" },
    { code: "AUD", symbol: "$", flag: "🇦🇺", name: "AUD" },
    { code: "JPY", symbol: "¥", flag: "🇯🇵", name: "JPY" },
    { code: "AED", symbol: "AED", flag: "🇦🇪", name: "AED" },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-bg-void/90 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="card max-w-md w-full p-8 space-y-6 max-h-[90vh] overflow-y-auto custom-scrollbar"
      >
        <div className="text-center space-y-1">
          <div className="w-12 h-12 bg-accent-gold/10 rounded-full flex items-center justify-center mx-auto mb-2 border border-accent-gold/30">
            <User className="w-6 h-6 text-accent-gold" />
          </div>
          <h2 className="text-2xl font-display font-bold">Offline Profile Setup</h2>
          <p className="text-text-secondary text-xs">Verify your name and customize currency settings for your dashboard</p>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted ml-0.5">Your Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name..."
              className="input-field w-full text-sm py-2.5 px-3 border-accent-gold/40 focus:border-accent-gold"
              autoFocus
            />
            {initialName && (
              <p className="text-[10px] text-accent-emerald flex items-center gap-1 font-mono">
                <Check className="w-3 h-3" /> Auto-detected from Google / Gmail Account
              </p>
            )}
          </div>

          {/* Preferred Currency Selection */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted ml-0.5">Preferred Currency</label>
            <div className="grid grid-cols-4 gap-2">
              {currencies.map(c => (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => setSelectedCurrency(c.code)}
                  className={cn(
                    "p-2 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center",
                    selectedCurrency === c.code 
                      ? "bg-accent-gold/15 border-accent-gold text-accent-gold font-bold shadow-sm"
                      : "bg-bg-secondary border-border hover:border-border-active text-text-secondary"
                  )}
                >
                  <span className="text-base">{c.flag}</span>
                  <span className="text-[10px] font-mono mt-0.5">{c.code} ({c.symbol})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Optional Age Selector */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted ml-0.5">Age Range</label>
              <span className="text-[9px] text-text-muted font-mono uppercase">(Optional)</span>
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {ageOptions.map(option => (
                <button
                  key={option}
                  onClick={() => setAge(option === "Skip" ? "" : option)}
                  type="button"
                  className={cn(
                    "py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer",
                    (age === option || (option === "Skip" && !age))
                      ? "bg-accent-gold/10 border-accent-gold text-accent-gold" 
                      : "bg-bg-secondary border-border hover:border-border-active text-text-secondary"
                  )}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted ml-0.5">Primary Financial Goal</label>
            <input
              type="text"
              value={learningGoal}
              onChange={(e) => setLearningGoal(e.target.value)}
              placeholder="e.g. Retirement, Investing, Wealth Building"
              className="input-field w-full text-xs py-2 px-3"
            />
          </div>

          <button
            onClick={() => name.trim() && onComplete(name.trim(), age || "Not specified", learningGoal.trim() || "Wealth Building", gitProvider, selectedCurrency)}
            disabled={!name.trim()}
            type="button"
            className="btn-primary w-full py-3 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-lg"
          >
            Launch Wealth Dashboard <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
