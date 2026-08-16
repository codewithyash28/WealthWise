import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Check, ChevronRight, Globe, User, PlusCircle, Sparkles, Edit3 } from "lucide-react";
import { CURRENCIES } from "../constants";
import { cn } from "../lib/utils";

interface CurrencySelectorProps {
  isOpen: boolean;
  onSelect: (currency: string, customSymbol?: string) => void;
  currentCurrency?: string;
  onClose?: () => void;
}

export function CurrencySelector({ isOpen, onSelect, currentCurrency = "USD", onClose }: CurrencySelectorProps) {
  const [selectedCode, setSelectedCode] = useState<string>(currentCurrency || "USD");
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);
  const [customCode, setCustomCode] = useState<string>("");
  const [customSymbol, setCustomSymbol] = useState<string>("");

  useEffect(() => {
    if (currentCurrency) {
      if (CURRENCIES[currentCurrency]) {
        setSelectedCode(currentCurrency);
        setIsCustomMode(false);
      } else {
        setSelectedCode(currentCurrency);
        setCustomCode(currentCurrency);
        setIsCustomMode(true);
      }
    }
  }, [currentCurrency]);

  if (!isOpen) return null;

  const handleSelectStandard = (code: string) => {
    setSelectedCode(code);
    setIsCustomMode(false);
    onSelect(code);
  };

  const handleApplyCustom = () => {
    const cleanCode = customCode.trim().toUpperCase();
    if (!cleanCode) return;
    const cleanSymbol = customSymbol.trim() || cleanCode;
    setSelectedCode(cleanCode);
    onSelect(cleanCode, cleanSymbol);
  };

  const getFlag = (code: string) => {
    switch (code) {
      case "USD": return "🇺🇸";
      case "INR": return "🇮🇳";
      case "EUR": return "🇪🇺";
      case "GBP": return "🇬🇧";
      case "CAD": return "🇨🇦";
      case "AUD": return "🇦🇺";
      case "JPY": return "🇯🇵";
      case "SGD": return "🇸🇬";
      case "BRL": return "🇧🇷";
      case "ZAR": return "🇿🇦";
      case "AED": return "🇦🇪";
      case "MXN": return "🇲🇽";
      default: return "🌐";
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-bg-void/90 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="card max-w-xl w-full p-6 sm:p-8 space-y-6 border-2 border-accent-gold/40 shadow-[0_0_50px_rgba(240,180,41,0.2)] rounded-3xl relative overflow-hidden"
      >
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-accent-gold/10 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-gold/15 border border-accent-gold/30 text-accent-gold text-[10px] font-mono font-bold uppercase tracking-widest">
            <Globe className="w-3.5 h-3.5" />
            Global Currency Calibration
          </div>
          <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-text-primary tracking-tight">
            Choose Your <span className="text-accent-gold">Currency</span>
          </h2>
          <p className="text-text-secondary text-xs sm:text-sm max-w-md mx-auto">
            Select your preferred currency or enter your custom currency to personalize all portfolio allocations, budgets, and projections.
          </p>
        </div>

        {/* Currency Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {Object.entries(CURRENCIES).map(([code, config]) => {
            const isSelected = !isCustomMode && selectedCode === code;
            return (
              <button
                key={code}
                type="button"
                onClick={() => handleSelectStandard(code)}
                className={cn(
                  "flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl border transition-all duration-200 cursor-pointer relative",
                  isSelected
                    ? "bg-accent-gold/20 border-accent-gold text-text-primary shadow-[0_0_15px_rgba(240,180,41,0.25)] font-bold scale-[1.02]"
                    : "bg-bg-secondary/70 border-border hover:border-border-active hover:bg-bg-secondary text-text-secondary hover:text-text-primary"
                )}
              >
                <span className="text-2xl">{getFlag(code)}</span>
                <div className="flex flex-col items-center leading-tight">
                  <span className="text-xs font-mono font-bold uppercase">{code}</span>
                  <span className="text-[10px] font-mono text-accent-gold">{config.symbol}</span>
                </div>
                {isSelected && (
                  <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-accent-gold flex items-center justify-center text-bg-void shadow">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Custom Currency Section ("If your currency is not there, write your currency") */}
        <div className="p-4 rounded-2xl bg-bg-secondary/80 border border-border space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-text-primary flex items-center gap-1.5">
              <Edit3 className="w-3.5 h-3.5 text-accent-gold" />
              Currency Not Listed? Write Your Own:
            </span>
            <span className="text-[10px] font-mono text-accent-gold">Custom Code</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
            <div className="sm:col-span-5">
              <input
                type="text"
                value={customCode}
                onChange={(e) => {
                  setCustomCode(e.target.value.toUpperCase());
                  setIsCustomMode(true);
                }}
                placeholder="Code (e.g. SAR, CHF, NZD, PKR)"
                maxLength={6}
                className="input-field w-full text-xs py-2 px-3 uppercase font-mono font-bold border-accent-gold/40 focus:border-accent-gold"
              />
            </div>
            <div className="sm:col-span-4">
              <input
                type="text"
                value={customSymbol}
                onChange={(e) => {
                  setCustomSymbol(e.target.value);
                  setIsCustomMode(true);
                }}
                placeholder="Symbol (e.g. ﷼, Fr, NZ$, ₨)"
                maxLength={6}
                className="input-field w-full text-xs py-2 px-3 font-mono border-accent-gold/40 focus:border-accent-gold"
              />
            </div>
            <div className="sm:col-span-3">
              <button
                type="button"
                onClick={handleApplyCustom}
                disabled={!customCode.trim()}
                className="btn-secondary w-full py-2 text-xs font-mono font-bold uppercase disabled:opacity-40 cursor-pointer flex items-center justify-center gap-1"
              >
                <PlusCircle className="w-3.5 h-3.5" /> Apply
              </button>
            </div>
          </div>
          {isCustomMode && customCode.trim() && (
            <p className="text-[10px] text-accent-emerald flex items-center gap-1 font-mono">
              <Check className="w-3 h-3" /> Custom active: <strong>{customCode.trim().toUpperCase()} ({customSymbol.trim() || customCode.trim().toUpperCase()})</strong>
            </p>
          )}
        </div>

        {/* Enter App Action */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => {
              if (isCustomMode && customCode.trim()) {
                handleApplyCustom();
              } else if (selectedCode) {
                onSelect(selectedCode);
              }
            }}
            disabled={!selectedCode && (!isCustomMode || !customCode.trim())}
            className="btn-primary w-full py-3.5 flex items-center justify-center gap-2 font-mono font-bold text-sm uppercase tracking-wider cursor-pointer shadow-lg hover:scale-[1.01] transition-all"
          >
            Launch Wealth Dashboard <ChevronRight className="w-5 h-5" />
          </button>
        </div>
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
  const [customCurrencyText, setCustomCurrencyText] = useState("");
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-bg-void/90 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="card max-w-md w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto custom-scrollbar border-2 border-accent-gold/40 rounded-3xl"
      >
        <div className="text-center space-y-1">
          <div className="w-12 h-12 bg-accent-gold/10 rounded-full flex items-center justify-center mx-auto mb-2 border border-accent-gold/30">
            <User className="w-6 h-6 text-accent-gold" />
          </div>
          <h2 className="text-2xl font-display font-bold">Profile & Currency Setup</h2>
          <p className="text-text-secondary text-xs">Verify your details and currency to personalize all metrics</p>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted ml-0.5">Your Name / Handle</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Yash Choubey, Investor One"
              className="input-field w-full text-sm py-2.5 px-3 border-accent-gold/40 focus:border-accent-gold font-mono"
              autoFocus
            />
          </div>

          {/* Preferred Currency Selection */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted ml-0.5">Select Preferred Currency</label>
            <div className="grid grid-cols-4 gap-2">
              {currencies.map(c => (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => {
                    setSelectedCurrency(c.code);
                    setCustomCurrencyText("");
                  }}
                  className={cn(
                    "p-2 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center",
                    selectedCurrency === c.code && !customCurrencyText
                      ? "bg-accent-gold/20 border-accent-gold text-accent-gold font-bold shadow-sm"
                      : "bg-bg-secondary border-border hover:border-border-active text-text-secondary"
                  )}
                >
                  <span className="text-base">{c.flag}</span>
                  <span className="text-[10px] font-mono mt-0.5">{c.code} ({c.symbol})</span>
                </button>
              ))}
            </div>

            {/* Custom currency writing option in NameInput as well */}
            <div className="pt-2">
              <input
                type="text"
                value={customCurrencyText}
                onChange={(e) => {
                  const val = e.target.value.toUpperCase();
                  setCustomCurrencyText(val);
                  if (val) setSelectedCurrency(val);
                }}
                placeholder="Or write custom currency (e.g. SAR, CHF, NZD)..."
                className="input-field w-full text-xs py-2 px-3 uppercase font-mono border-border focus:border-accent-gold"
              />
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
            onClick={() => {
              const finalName = name.trim() || "Wexa Investor";
              const finalCur = (customCurrencyText.trim() || selectedCurrency || "USD").toUpperCase();
              onComplete(finalName, age || "Not specified", learningGoal.trim() || "Wealth Building", gitProvider, finalCur);
            }}
            type="button"
            className="btn-primary w-full py-3.5 flex items-center justify-center gap-2 text-xs font-mono font-bold uppercase tracking-wider cursor-pointer shadow-lg hover:scale-[1.01] transition-all"
          >
            Launch Wealth Dashboard <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}

