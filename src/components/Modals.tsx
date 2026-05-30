import { useState } from "react";
import { motion } from "motion/react";
import { Check, ChevronRight, User } from "lucide-react";
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
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="card max-w-lg w-full p-8 space-y-6 text-left"
      >
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-display font-medium text-text-primary">
            Welcome to <span className="text-accent-gold italic font-semibold">WealthWise Elite</span>
          </h2>
          <p className="text-text-secondary text-sm font-light">Select your currency to personalize all global simulations.</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Object.entries(CURRENCIES).map(([code, config]) => (
            <button
              key={code}
              onClick={() => onSelect(code)}
              className={cn(
                "flex flex-col items-center justify-center gap-1.5 p-4 rounded-xl border relative transition-all duration-300",
                currentCurrency === code 
                  ? "bg-[#C5A880]/10 border-accent-gold/40 shadow-[0_0_20px_rgba(197,168,128,0.08)]" 
                  : "bg-white/[0.01] border-white/[0.04] hover:border-accent-gold/25 hover:bg-[#C5A880]/5 text-text-secondary hover:text-text-primary"
              )}
            >
              <span className="text-xl">{code === 'USD' ? '🇺🇸' : code === 'GBP' ? '🇬🇧' : code === 'EUR' ? '🇪🇺' : code === 'CAD' ? '🇨🇦' : code === 'AUD' ? '🇦🇺' : code === 'JPY' ? '🇯🇵' : code === 'SGD' ? '🇸🇬' : code === 'INR' ? '🇮🇳' : code === 'BRL' ? '🇧🇷' : code === 'ZAR' ? '🇿🇦' : code === 'AED' ? '🇦🇪' : '🇲🇽'}</span>
              <div className="flex flex-col items-center">
                <span className="text-xs font-bold uppercase tracking-wider">{code}</span>
                <span className="text-[9px] font-bold text-text-muted">{config.symbol}</span>
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
          className="btn-primary w-full flex items-center justify-center gap-1.5 py-3.5 text-xs font-bold uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Let's Go <ChevronRight className="w-4 h-4" />
        </button>
      </motion.div>
    </div>
  );
}

interface NameInputProps {
  isOpen: boolean;
  onComplete: (name: string, age: string, learningGoal: string) => void;
}

export function NameInput({ isOpen, onComplete }: NameInputProps) {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [learningGoal, setLearningGoal] = useState("");

  if (!isOpen) return null;

  const ageOptions = ["11-14", "15-17", "18-21", "22-25", "25+"];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-bg-void/90 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="card max-w-md w-full p-8 space-y-6 text-left"
      >
        <div className="text-center space-y-2">
          <div className="w-11 h-11 bg-white/[0.02] border border-white/[0.06] rounded-full flex items-center justify-center mx-auto mb-2 text-accent-gold shadow-sm">
            <User className="w-4 h-4" />
          </div>
          <h2 className="text-2xl font-display font-medium text-text-primary">Personalize Your Experience</h2>
          <p className="text-text-secondary text-xs font-light">We'll tailor your financial insights based on your learning goals.</p>
        </div>

        <div className="space-y-5">
          <div className="space-y-2">
            <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-text-secondary ml-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. John Doe"
              className="input-field w-full text-sm font-medium"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-text-secondary ml-1">Age Range</label>
            <div className="grid grid-cols-5 gap-2">
              {ageOptions.map(option => (
                <button
                  key={option}
                  onClick={() => setAge(option)}
                  className={cn(
                    "py-2.5 rounded-xl border text-[10px] font-bold uppercase tracking-wider transition-all duration-300",
                    age === option 
                      ? "bg-[#C5A880]/15 border-accent-gold/40 text-accent-gold shadow-sm" 
                      : "bg-white/[0.01] border-white/[0.04] hover:border-accent-gold/25 text-text-secondary hover:text-text-primary hover:bg-[#C5A880]/5"
                  )}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-text-secondary ml-1">Primary Financial Goal</label>
            <input
              type="text"
              value={learningGoal}
              onChange={(e) => setLearningGoal(e.target.value)}
              placeholder="e.g. Wealth Building, Investment Basics, Inflation Hedge"
              className="input-field w-full text-sm font-medium"
            />
          </div>

          <button
            onClick={() => name.trim() && age && learningGoal.trim() && onComplete(name.trim(), age, learningGoal.trim())}
            disabled={!name.trim() || !age || !learningGoal.trim()}
            className="btn-primary w-full flex items-center justify-center gap-1.5 py-3.5 text-xs font-bold uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Create Architecture <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
