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
          <h2 className="text-3xl font-display font-bold text-accent-gold">🌍 Welcome to WealthWise Elite</h2>
          <p className="text-text-secondary">Select your currency to personalize all calculations</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {Object.entries(CURRENCIES).map(([code, config]) => (
            <button
              key={code}
              type="button"
              onClick={() => onSelect(code)}
              className={cn(
                "flex flex-col items-center justify-center gap-2 p-4 rounded-xl border transition-all duration-200 relative",
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
          type="button"
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
  onComplete: (name: string, age: string, learningGoal: string, gitProvider: "gitlab" | "github" | "bitbucket") => void;
}

export function NameInput({ isOpen, onComplete }: NameInputProps) {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [learningGoal, setLearningGoal] = useState("");
  const [gitProvider, setGitProvider] = useState<"gitlab" | "github" | "bitbucket">("github");

  if (!isOpen) return null;

  const ageOptions = ["11-14", "15-17", "18-21", "22-25", "25+"];

  const gitProviders = [
    { id: "github" as const, name: "GitHub", subtitle: "Public Cloud Repos", desc: "Fast imports & open-source sync.", color: "text-white border-white/20 select-none bg-zinc-900/40" },
    { id: "gitlab" as const, name: "GitLab", subtitle: "DevOps & MCP Pipelines", desc: "Strict policy compliance audits.", color: "text-accent-gold border-accent-gold/20 bg-amber-500/5" },
    { id: "bitbucket" as const, name: "Bitbucket", subtitle: "Atlassian Workspace", desc: "Corporate-grade policy tracking.", color: "text-blue-400 border-blue-400/20 bg-blue-500/5" }
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-bg-void/90 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="card max-w-md w-full p-8 space-y-6"
      >
        <div className="text-center space-y-1">
          <div className="w-12 h-12 bg-accent-gold/10 rounded-full flex items-center justify-center mx-auto mb-2">
            <User className="w-6 h-6 text-accent-gold" />
          </div>
          <h2 className="text-2xl font-display font-bold">Personalize Your Experience</h2>
          <p className="text-text-secondary text-xs">We&apos;ll tailor your financial insights based on your profile</p>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted ml-0.5">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. John Doe"
              className="input-field w-full text-sm py-2 px-3"
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted ml-0.5">Age Range</label>
            <div className="grid grid-cols-5 gap-1.5">
              {ageOptions.map(option => (
                <button
                  key={option}
                  onClick={() => setAge(option)}
                  type="button"
                  className={cn(
                    "py-1.5 rounded-lg border text-xs font-bold transition-all",
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

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted ml-0.5">Primary Financial Goal</label>
            <input
              type="text"
              value={learningGoal}
              onChange={(e) => setLearningGoal(e.target.value)}
              placeholder="e.g. Retirement, Investing, Debt Management"
              className="input-field w-full text-xs py-2 px-3"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted ml-0.5">Preferred Git Provider (GitOps Manager)</label>
            <div className="grid grid-cols-1 gap-2">
              {gitProviders.map(provider => {
                const isSelected = gitProvider === provider.id;
                return (
                  <button
                    key={provider.id}
                    onClick={() => setGitProvider(provider.id)}
                    type="button"
                    className={cn(
                      "p-2.5 rounded-xl border text-left flex items-center justify-between transition-all relative cursor-pointer",
                      isSelected 
                        ? `${provider.color} border border-border-active shadow-[0_0_15px_rgba(255,255,255,0.05)]`
                        : "bg-bg-secondary border-border/40 hover:bg-bg-secondary/80 text-text-secondary"
                    )}
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold">{provider.name}</span>
                        <span className="text-[8px] font-mono uppercase tracking-wider text-text-muted">({provider.subtitle})</span>
                      </div>
                      <p className="text-[10px] text-text-muted leading-relaxed mt-0.5">{provider.desc}</p>
                    </div>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-accent-gold/20 flex items-center justify-center border border-accent-gold/40">
                        <Check className="w-3 h-3 text-accent-gold" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            onClick={() => name.trim() && age && learningGoal.trim() && onComplete(name.trim(), age, learningGoal.trim(), gitProvider)}
            disabled={!name.trim() || !age || !learningGoal.trim()}
            type="button"
            className="btn-primary w-full py-2.5 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Welcome to WealthWise Elite <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
