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
          <h2 className="text-3xl font-display font-bold text-accent-gold">🌍 Welcome to WealthWise</h2>
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
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="card max-w-md w-full p-8 space-y-8"
      >
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-accent-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-accent-gold" />
          </div>
          <h2 className="text-2xl font-display font-bold">Tell us about yourself</h2>
          <p className="text-text-secondary">We'll personalize your experience based on your profile</p>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-text-muted ml-1">Your Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name..."
              className="input-field w-full text-lg"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-text-muted ml-1">Your Age</label>
            <div className="grid grid-cols-3 gap-2">
              {ageOptions.map(option => (
                <button
                  key={option}
                  onClick={() => setAge(option)}
                  className={cn(
                    "py-2 rounded-xl border text-sm font-bold transition-all",
                    age === option 
                      ? "bg-accent-gold/10 border-accent-gold text-accent-gold" 
                      : "bg-bg-secondary border-border hover:border-border-active text-text-secondary"
                  )}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-text-muted ml-1">What do you want to learn?</label>
            <input
              type="text"
              value={learningGoal}
              onChange={(e) => setLearningGoal(e.target.value)}
              placeholder="e.g. Investing, Budgeting, Debt..."
              className="input-field w-full"
            />
          </div>

          <button
            onClick={() => name.trim() && age && learningGoal.trim() && onComplete(name.trim(), age, learningGoal.trim())}
            disabled={!name.trim() || !age || !learningGoal.trim()}
            className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Welcome to WealthWise <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
