import { useState, useMemo, useEffect } from "react";
import { DeleteConfirmationDialog } from "./DeleteConfirmationDialog";
import { motion, AnimatePresence } from "motion/react";
import { 
  Scale, 
  RotateCcw, 
  Plus, 
  Trash2, 
  Download, 
  Copy, 
  Check, 
  ArrowRightLeft, 
  Info, 
  Layers, 
  TrendingUp, 
  ShieldAlert, 
  RefreshCw, 
  Flame, 
  Sparkles,
  HelpCircle
} from "lucide-react";
import { formatCurrency, cn } from "../lib/utils";
import { CURRENCIES } from "../constants";
import { UserProfile, Portfolio } from "../types";
import { UpgradeModal } from "./UpgradeModal";

interface AssetRebalancerProps {
  user: UserProfile;
  onUpdatePortfolio?: (portfolio: Portfolio) => void;
  onUnlockAchievement?: (id: string) => void;
}

type RiskPreset = "CONSERVATIVE" | "MODERATE" | "AGGRESSIVE" | "VERY_AGGRESSIVE" | "CUSTOM";

interface AssetClassConfig {
  key: keyof Portfolio["allocation"];
  label: string;
  color: string;
  desc: string;
}

const ASSET_CLASSES: AssetClassConfig[] = [
  { key: "stocks", label: "Stocks", color: "#F0B429", desc: "Equities, ETFs, Mutual Funds" },
  { key: "bonds", label: "Bonds", color: "#3B82F6", desc: "Government & Corporate debt" },
  { key: "crypto", label: "Crypto/Web3", color: "#10D9A0", desc: "Decentralized digital currencies" },
  { key: "realEstate", label: "Real Estate", color: "#F97316", desc: "REITs, properties, land" },
  { key: "cash", label: "Cash & Cash Equiv.", color: "#94A3B8", desc: "Fractions, high-yield savings" }
];

const PRESETS: Record<Exclude<RiskPreset, "CUSTOM">, Record<keyof Portfolio["allocation"], number>> = {
  CONSERVATIVE: { stocks: 20, bonds: 60, crypto: 0, realEstate: 10, cash: 10 },
  MODERATE: { stocks: 50, bonds: 35, crypto: 3, realEstate: 7, cash: 5 },
  AGGRESSIVE: { stocks: 75, bonds: 12, crypto: 6, realEstate: 4, cash: 3 },
  VERY_AGGRESSIVE: { stocks: 85, bonds: 0, crypto: 10, realEstate: 3, cash: 2 }
};

interface CustHolding {
  id: string;
  name: string;
  category: keyof Portfolio["allocation"];
  value: number;
}

export function AssetRebalancer({ user, onUpdatePortfolio, onUnlockAchievement }: AssetRebalancerProps) {
  const currency = CURRENCIES[user.currency] || CURRENCIES.USD;
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  
  // 1. Target Allocations State
  const [riskPreset, setRiskPreset] = useState<RiskPreset>("MODERATE");
  const [targets, setTargets] = useState<Record<keyof Portfolio["allocation"], number>>({ ...PRESETS.MODERATE });

  // Deletion logic states
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState<{ id: string; name: string } | null>(null);

  // 2. Custom Holdings State
  const [holdings, setHoldings] = useState<CustHolding[]>(() => {
    // Attempt to load from user props first, otherwise fallback to local storage or templates
    const saved = localStorage.getItem(`ww_rebalancer_holdings_${user.uid}`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
         console.error(e);
      }
    }

    if (user.portfolio && user.portfolio.holdings && user.portfolio.holdings.length > 0) {
      return user.portfolio.holdings.map((h, i) => {
        let cat: keyof Portfolio["allocation"] = "stocks";
        const n = h.name.toLowerCase();
        if (n.includes("bond") || n.includes("treasury") || n.includes("notes")) cat = "bonds";
        else if (n.includes("defi") || n.includes("ethereum") || n.includes("crypto") || n.includes("btc")) cat = "crypto";
        else if (n.includes("reit") || n.includes("estate") || n.includes("property")) cat = "realEstate";
        else if (n.includes("vault") || n.includes("cash") || n.includes("stability") || n.includes("fiat")) cat = "cash";

        return {
          id: Math.random().toString(),
          name: h.name,
          category: cat,
          value: h.value
        };
      });
    }

    // Default holdings fallback matching portfolio overview values
    const baseVal = user.netWorth && user.netWorth.assets > 0 ? user.netWorth.assets * 0.8 : currency.avgSalary * 5;
    return [
      { id: "h1", name: "Alpha-Grade Tech Growth ETF", category: "stocks", value: baseVal * 0.45 },
      { id: "h2", name: "Sovereign Treasury Notes 10Y", category: "bonds", value: baseVal * 0.20 },
      { id: "h3", name: "Ethereum smart contract DeFi", category: "crypto", value: baseVal * 0.15 },
      { id: "h4", name: "Global REIT Real Estate Index", category: "realEstate", value: baseVal * 0.10 },
      { id: "h5", name: "Fiat Stability Liquidity Vault", category: "cash", value: baseVal * 0.10 }
    ];
  });

  // Simple inputs for adding new asset
  const [newAssetName, setNewAssetName] = useState("");
  const [newAssetCategory, setNewAssetCategory] = useState<keyof Portfolio["allocation"]>("stocks");
  const [newAssetValue, setNewAssetValue] = useState("");

  // Visual UI state
  const [copiedScript, setCopiedScript] = useState(false);
  const [adviceAI, setAdviceAI] = useState<string | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [showAutoRebalanceConfirm, setShowAutoRebalanceConfirm] = useState(false);

  // Sync targets on preset change
  useEffect(() => {
    if (riskPreset !== "CUSTOM") {
      setTargets({ ...PRESETS[riskPreset] });
    }
  }, [riskPreset]);

  // Persist custom holdings
  useEffect(() => {
    localStorage.setItem(`ww_rebalancer_holdings_${user.uid}`, JSON.stringify(holdings));
  }, [holdings, user.uid]);

  // Calculations
  const targetSum = useMemo(() => {
    return Object.values(targets).reduce((sum, val) => sum + val, 0);
  }, [targets]);

  const totalCurrentValue = useMemo(() => {
    return holdings.reduce((sum, h) => sum + h.value, 0);
  }, [holdings]);

  // Group holdings by category
  const categoryValues = useMemo(() => {
    const values: Record<keyof Portfolio["allocation"], number> = {
      stocks: 0,
      bonds: 0,
      crypto: 0,
      realEstate: 0,
      cash: 0
    };
    holdings.forEach(h => {
      values[h.category] += h.value;
    });
    return values;
  }, [holdings]);

  const categoryPercentages = useMemo(() => {
    const percentages: Record<keyof Portfolio["allocation"], number> = {
      stocks: 0,
      bonds: 0,
      crypto: 0,
      realEstate: 0,
      cash: 0
    };
    if (totalCurrentValue === 0) return percentages;
    ASSET_CLASSES.forEach(ac => {
      percentages[ac.key] = Math.round((categoryValues[ac.key] / totalCurrentValue) * 100);
    });
    return percentages;
  }, [categoryValues, totalCurrentValue]);

  // Calculate Drift / Deviation Score
  const driftScore = useMemo(() => {
    if (totalCurrentValue === 0 || targetSum === 0) return 0;
    let absoluteDiffs = 0;
    ASSET_CLASSES.forEach(ac => {
      const currentPct = (categoryValues[ac.key] / totalCurrentValue) * 100;
      const targetPct = targets[ac.key];
      absoluteDiffs += Math.abs(currentPct - targetPct);
    });
    // Divide by 2 so that complete drift is 100%
    return Math.min(100, Math.round(absoluteDiffs / 2));
  }, [categoryValues, totalCurrentValue, targets, targetSum]);

  // Actions analysis table data rows
  const analysisRows = useMemo(() => {
    return ASSET_CLASSES.map(ac => {
      const targetPct = targets[ac.key];
      const targetVal = (totalCurrentValue * targetPct) / 100;
      const currentVal = categoryValues[ac.key];
      const currentPct = totalCurrentValue > 0 ? (currentVal / totalCurrentValue) * 100 : 0;
      const differenceVal = currentVal - targetVal;
      const differencePct = currentPct - targetPct;

      return {
        ...ac,
        targetPct,
        targetVal,
        currentVal,
        currentPct,
        differenceVal,
        differencePct
      };
    });
  }, [targets, categoryValues, totalCurrentValue]);

  // Suggest actions
  const tradeActions = useMemo(() => {
    return analysisRows
      .filter(row => Math.abs(row.differenceVal) >= 1) // Ignore small differences less than 1 unit
      .map(row => {
        const isSell = row.differenceVal > 0;
        const absDiff = Math.abs(row.differenceVal);
        return {
          category: row.label,
          key: row.key,
          isSell,
          amount: absDiff,
          percentage: Math.abs(row.differencePct)
        };
      })
      .sort((a, b) => b.amount - a.amount);
  }, [analysisRows]);

  // Apply manual target shift
  const handleSliderChange = (key: keyof Portfolio["allocation"], value: number) => {
    setRiskPreset("CUSTOM");
    setTargets(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Autoreset targets so they add up to 100% proportionately
  const handleNormalizeTargets = () => {
    if (targetSum === 0) {
      setTargets({ stocks: 40, bonds: 30, crypto: 5, realEstate: 15, cash: 10 });
      return;
    }
    const factor = 100 / targetSum;
    const normalized = { ...targets };
    let sum = 0;
    ASSET_CLASSES.forEach(ac => {
      normalized[ac.key] = Math.round(targets[ac.key] * factor);
      sum += normalized[ac.key];
    });

    const diff = 100 - sum;
    if (diff !== 0) {
      normalized.stocks += diff; // adjust slightly to make sure precise 100% sum
    }
    setTargets(normalized);
  };

  const handleAddAsset = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(newAssetValue);
    if (!newAssetName.trim() || isNaN(val) || val <= 0) {
      // Trigger a warning
      const ev = new CustomEvent("ww-trigger-alert", {
        detail: { type: "risk", title: "Invalid Asset Details", message: "Please specify a relevant asset name and positive value." }
      });
      window.dispatchEvent(ev);
      return;
    }

    const newObj: CustHolding = {
      id: Math.random().toString(),
      name: newAssetName.trim(),
      category: newAssetCategory,
      value: val
    };

    setHoldings(prev => [...prev, newObj]);
    setNewAssetName("");
    setNewAssetValue("");

    const ev = new CustomEvent("ww-trigger-alert", {
      detail: { type: "success", title: "Asset Added", message: `Successfully added ${newObj.name} to your Portfolio.` }
    });
    window.dispatchEvent(ev);
  };

  const handleDeleteAsset = (id: string, name: string) => {
    setAssetToDelete({ id, name });
    setDeleteConfirmOpen(true);
  };

  const executeDeleteAsset = () => {
    if (!assetToDelete) return;
    const { id, name } = assetToDelete;
    setHoldings(prev => prev.filter(h => h.id !== id));
    const ev = new CustomEvent("ww-trigger-alert", {
      detail: { type: "info", title: "Asset Disposed", message: `Removed ${name} from active holdings ledger.` }
    });
    window.dispatchEvent(ev);
    setAssetToDelete(null);
  };

  // Simulations & downloads
  const handleDownloadRecipe = () => {
    if (tradeActions.length === 0) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(
      JSON.stringify({
        auditDate: new Date().toISOString(),
        currency: user.currency,
        totalAssetPool: totalCurrentValue,
        driftIndex: `${driftScore}%`,
        targetAllocations: targets,
        prescribedTrades: tradeActions.map(t => ({
          action: t.isSell ? "SELL" : "BUY",
          assetClass: t.category,
          amountValue: parseFloat(t.amount.toFixed(2)),
          driftPercentChange: `${t.percentage.toFixed(1)}%`
        }))
      }, null, 2)
    );
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", `wexa_rebalance_blueprint_${riskPreset.toLowerCase()}.json`);
    document.body.appendChild(dlAnchor);
    dlAnchor.click();
    dlAnchor.remove();

    if (onUnlockAchievement) {
      onUnlockAchievement("rebalancer_expert");
    }
  };

  const handleCopyScript = () => {
    if (!user.isPremium) {
      setShowUpgradeModal(true);
      return;
    }
    if (tradeActions.length === 0) return;
    const bullets = tradeActions.map(t => {
      return `[${t.isSell ? "SELL 🚨" : "BUY  🟢"}] ${formatCurrency(t.amount, user.currency)} of ${t.category} (${t.percentage.toFixed(1)}% drift deviation)`;
    }).join("\n");

    const fullText = `### WEXA AI CLASSIC REBALANCE RECIPE ###\nDrift Deviation Index: ${driftScore}%\nTotal Liquidity Base: ${formatCurrency(totalCurrentValue, user.currency)}\nPreset Profile: ${riskPreset}\n\nPrescribed Trade Operations:\n${bullets}\n\nGenerated secure offline via Wexa personal architecture.`;

    navigator.clipboard.writeText(fullText).then(() => {
      setCopiedScript(true);
      setTimeout(() => setCopiedScript(false), 2500);
      const ev = new CustomEvent("ww-trigger-alert", {
        detail: { type: "success", title: "Trade Recipe Copied", message: "Formatted copy-pasteable script of buy/sell steps created successfully." }
      });
      window.dispatchEvent(ev);
    });
  };

  // Perform fully simulated auto-rebalance instantly so user achieves absolute target alignment
  const handleApplySimulatedRebalance = () => {
    if (targetSum !== 100) {
      const ev = new CustomEvent("ww-trigger-alert", {
        detail: { type: "risk", title: "Target Mismatch", message: "Target levels must sum up to exactly 100% to simulate automatic rebalancing." }
      });
      window.dispatchEvent(ev);
      return;
    }

    if (totalCurrentValue === 0) {
      const ev = new CustomEvent("ww-trigger-alert", {
        detail: { type: "risk", title: "Liquidity Depleted", message: "Please input asset values to compute allocations." }
      });
      window.dispatchEvent(ev);
      return;
    }

    // Allocate the total value cleanly among the target classes
    const updatedHoldings: CustHolding[] = ASSET_CLASSES.map(ac => {
      const targetPct = targets[ac.key];
      const targetVal = (totalCurrentValue * targetPct) / 100;
      return {
        id: Math.random().toString(),
        name: `${ac.label} Rebalance Core Fund`,
        category: ac.key,
        value: targetVal
      };
    }).filter(h => h.value > 0);

    setHoldings(updatedHoldings);
    setShowAutoRebalanceConfirm(false);

    // Build standard high-fidelity portfolio object back to parent components
    if (onUpdatePortfolio) {
      onUpdatePortfolio({
        totalValue: totalCurrentValue,
        change24h: 1.15,
        allocation: { ...targets },
        holdings: updatedHoldings.map(h => ({
          name: h.name,
          value: h.value,
          allocation: Math.round((h.value / totalCurrentValue) * 100),
          performance: 0.25
        }))
      });
    }

    const event = new CustomEvent("ww-trigger-alert", {
      detail: {
        type: "success",
        title: "Rebalancing Instantly Applied",
        message: "Simulated portfolio has been balanced to match your risk profile successfully."
      }
    });
    window.dispatchEvent(event);

    if (onUnlockAchievement) {
      onUnlockAchievement("allocation_master");
    }
  };

  // Ask server/AI for strategic wisdom on allocation
  const handleFetchAIAdvice = async () => {
    setLoadingAI(true);
    setAdviceAI(null);
    try {
      const holdingsSummary = holdings.map(h => `- ${h.name} (${h.category}): ${formatCurrency(h.value, user.currency)}`).join("\n");
      const targetSummary = ASSET_CLASSES.map(ac => `- ${ac.label}: Target ${targets[ac.key]}%, Current ${categoryPercentages[ac.key]}%`).join("\n");
      const prompt = `As a world-class strategic wealth architect, analyze my portfolio rebalancing metrics and provide 3 concise bullet points of strategic advice:
      
Client Metrics:
Uid: ${user.uid}
Age: ${user.age}
Goal: ${user.learningGoal}
Selected Profile Preset: ${riskPreset}
Drift Score: ${driftScore}% (Total drift index, higher means they have strayed from plan)
Total Value: ${formatCurrency(totalCurrentValue, user.currency)}

Assets currently held:
${holdingsSummary}

Asset allocations and target comparisons:
${targetSummary}

Provide a crisp, professional, high-performance financial commentary! Limit to exactly 150 words.`;

      const response = await fetch("/api/gemini/insight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt })
      });
      const data = await response.json();
      setAdviceAI(data.text || "AI Advisor temporarily unavailable. Maintain consistent diversification guides.");
    } catch (err) {
      console.error(err);
      setAdviceAI("Failed to proxy AI rebalance insights. Continue with system heuristic guidelines.");
    } finally {
      setLoadingAI(false);
    }
  };

  return (
    <div className="container mx-auto px-6 py-12 space-y-12">
      {/* Title block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border/40 pb-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent-gold/10 text-accent-gold flex items-center justify-center">
              <Scale className="w-5 h-5" />
            </div>
            <h1 className="text-4xl font-display font-bold">Dynamic Portfolio Rebalancer</h1>
          </div>
          <p className="text-text-secondary">Compare your current asset holdings with recommended targets to calculate exact trade operations.</p>
        </div>
        
        {/* Drift Index Tracker */}
        <div className="p-4 rounded-2xl bg-bg-secondary border border-border flex items-center gap-4">
          <div className="relative w-16 h-16 flex items-center justify-center">
            {/* Absolute radial tracking widget */}
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="32"
                cy="32"
                r="28"
                className="stroke-bg-void"
                strokeWidth="6"
                fill="transparent"
              />
              <circle
                cx="32"
                cy="32"
                r="28"
                className={cn(
                  "transition-all duration-1000 stroke-current",
                  driftScore > 20 ? "text-accent-red" : driftScore > 8 ? "text-accent-gold" : "text-accent-emerald"
                )}
                strokeWidth="6"
                fill="transparent"
                strokeDasharray={2 * Math.PI * 28}
                strokeDashoffset={2 * Math.PI * 28 * (1 - driftScore / 100)}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center flex-col">
              <span className="text-[14px] font-mono font-black">{driftScore}%</span>
            </div>
          </div>
          <div>
            <div className="text-[10px] text-text-muted uppercase tracking-widest font-black">Drift Index</div>
            <div className={cn(
              "text-xs font-bold",
              driftScore > 20 ? "text-accent-red" : driftScore > 8 ? "text-accent-gold" : "text-accent-emerald"
            )}>
              {driftScore > 20 ? "Critical Drift" : driftScore > 8 ? "Moderate Drift" : "Optimal Alignment"}
            </div>
            <div className="text-[9px] text-text-muted mt-0.5">Asset divergence index</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Column Left (Target Settings) */}
        <div className="lg:col-span-12 xl:col-span-5 space-y-6">
          <div className="card p-6 space-y-6">
            <h2 className="text-lg font-bold flex items-center gap-2 text-text-primary">
              <Layers className="w-5 h-5 text-accent-gold" /> Step 1: Set Target Allocations
            </h2>
            <p className="text-text-secondary text-xs">Define what portion of your assets should dwell in each asset class.</p>

            {/* Presets Grid */}
            <div className="grid grid-cols-2 gap-2.5">
              {(Object.keys(PRESETS) as Exclude<RiskPreset, "CUSTOM">[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setRiskPreset(p)}
                  className={cn(
                    "p-3 rounded-lg border text-left transition-all",
                    riskPreset === p
                      ? "bg-accent-gold/10 border-accent-gold text-accent-gold"
                      : "bg-bg-secondary border-border hover:border-border-active cursor-pointer"
                  )}
                >
                  <span className="text-[10px] uppercase font-black tracking-widest font-mono">
                    {p.replace("_", " ")}
                  </span>
                </button>
              ))}
              <button
                onClick={() => setRiskPreset("CUSTOM")}
                className={cn(
                  "col-span-2 p-3 rounded-lg border text-center transition-all text-xs font-bold uppercase tracking-widest font-mono",
                  riskPreset === "CUSTOM"
                    ? "bg-accent-purple/10 border-accent-purple text-accent-purple"
                    : "bg-bg-secondary border-border hover:border-border-active cursor-pointer"
                )}
              >
                Custom Allocation Sliders
              </button>
            </div>

            {/* Manual Sliders */}
            <div className="space-y-4 pt-3 border-t border-border/40">
              {ASSET_CLASSES.map((ac) => {
                const targetVal = targets[ac.key] || 0;
                return (
                  <div key={ac.key} className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: ac.color }} />
                        <span className="text-xs font-bold text-text-primary">{ac.label}</span>
                      </div>
                      <div className="flex items-center gap-1.5 font-mono">
                        <span className="text-xs text-text-muted">Target:</span>
                        <span className="text-xs font-bold text-accent-gold">{targetVal}%</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="1"
                        value={targetVal}
                        onChange={(e) => handleSliderChange(ac.key, parseInt(e.target.value) || 0)}
                        className="w-full h-1 bg-border rounded-lg appearance-none cursor-pointer accent-accent-gold"
                      />
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={targetVal}
                        onChange={(e) => handleSliderChange(ac.key, Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                        className="bg-bg-secondary border border-border rounded-lg text-center font-mono font-bold text-[10px] w-12 text-text-primary outline-none focus:border-accent-gold"
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Sum Warning Flag */}
            <div className={cn(
              "flex items-center justify-between p-3.5 rounded-xl text-xs",
              targetSum === 100 
                ? "bg-accent-emerald/10 text-accent-emerald border border-accent-emerald/25" 
                : "bg-accent-red/10 text-accent-red border border-accent-red/25"
            )}>
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 shrink-0" />
                <span className="font-bold">
                  {targetSum === 100 
                    ? "Targets validated: precisely 100%" 
                    : `Allocation sum is ${targetSum}% (Must equal 100%)`}
                </span>
              </div>
              {targetSum !== 100 && (
                <button
                  type="button"
                  onClick={handleNormalizeTargets}
                  className="px-2.5 py-1 bg-accent-red text-bg-primary uppercase text-[9px] font-black tracking-widest rounded-lg hover:opacity-95 transition-opacity cursor-pointer font-mono"
                >
                  Auto-Balance
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Column Right (Asset Entries Management Ledger) */}
        <div className="lg:col-span-12 xl:col-span-7 space-y-6">
          <div className="card p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-border/40 pb-4">
              <h2 className="text-lg font-bold flex items-center gap-2 text-text-primary">
                <Layers className="w-5 h-5 text-accent-gold" /> Step 2: Manage Current Holdings
              </h2>
              <span className="text-[10px] font-bold font-mono text-accent-gold bg-accent-gold/10 border border-accent-gold/20 px-2.5 py-1 rounded-full uppercase">
                Liquidity Pool: {formatCurrency(totalCurrentValue, user.currency)}
              </span>
            </div>

            {/* Add Asset Inline Form */}
            <form onSubmit={handleAddAsset} className="grid grid-cols-1 sm:grid-cols-12 gap-3 bg-bg-secondary/40 p-4 rounded-xl border border-border/60">
              <div className="sm:col-span-5 space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-text-muted">Asset Name</label>
                <input
                  type="text"
                  placeholder="e.g. S&P 500 Equity Fund"
                  value={newAssetName}
                  onChange={(e) => setNewAssetName(e.target.value)}
                  className="w-full bg-bg-void border border-border hover:border-border-active rounded-xl px-3 py-2 text-xs focus:border-accent-gold outline-none text-text-primary placeholder:text-text-muted"
                />
              </div>
              
              <div className="sm:col-span-4 space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-text-muted">Asset Category</label>
                <select
                  value={newAssetCategory}
                  onChange={(e) => setNewAssetCategory(e.target.value as keyof Portfolio["allocation"])}
                  className="w-full bg-bg-void border border-border hover:border-border-active rounded-xl px-2 py-2 text-xs focus:border-accent-gold outline-none text-text-primary cursor-pointer"
                >
                  {ASSET_CLASSES.map(ac => (
                    <option key={ac.key} value={ac.key}>{ac.label}</option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-3 space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-text-muted">Value ({currency.symbol})</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="0.1"
                    step="any"
                    placeholder="15000"
                    value={newAssetValue}
                    onChange={(e) => setNewAssetValue(e.target.value)}
                    className="w-full bg-bg-void border border-border hover:border-border-active rounded-xl px-3 py-2 text-xs text-right focus:border-accent-gold outline-none font-mono text-text-primary placeholder:text-text-muted"
                  />
                  <button
                    type="submit"
                    className="p-2.5 bg-accent-gold text-bg-primary rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center shrink-0 cursor-pointer"
                    title="Add Asset"
                  >
                    <Plus className="w-4 h-4 text-bg-void font-bold" />
                  </button>
                </div>
              </div>
            </form>

            {/* Holdings Ledger Table */}
            <div className="overflow-x-auto max-h-[290px] overflow-y-auto pr-1">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-border">
                    <th className="pb-2.5 text-[9px] uppercase tracking-widest text-text-muted font-bold">Asset Name</th>
                    <th className="pb-2.5 text-[9px] uppercase tracking-widest text-text-muted font-bold">Category</th>
                    <th className="pb-2.5 text-[10px] uppercase tracking-widest text-text-muted font-bold text-right">Current Value</th>
                    <th className="pb-2.5 text-[10px] uppercase tracking-widest text-text-muted font-bold text-right w-16">Dispose</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {holdings.length > 0 ? holdings.map((h) => {
                    const matchedClass = ASSET_CLASSES.find(ac => ac.key === h.category);
                    return (
                      <tr key={h.id} className="group hover:bg-bg-secondary/20 transition-colors">
                        <td className="py-3 font-bold text-xs max-w-[200px] truncate" title={h.name}>{h.name}</td>
                        <td className="py-3 text-xs">
                          <span 
                            className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full"
                            style={{ backgroundColor: `${matchedClass?.color}15`, color: matchedClass?.color }}
                          >
                            {matchedClass?.label || h.category}
                          </span>
                        </td>
                        <td className="py-3 text-right font-mono text-xs font-bold text-text-primary">
                          {formatCurrency(h.value, user.currency)}
                        </td>
                        <td className="py-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleDeleteAsset(h.id, h.name)}
                            className="p-1 px-2.5 text-text-muted hover:text-accent-red bg-bg-secondary hover:bg-accent-red/10 rounded-lg transition-all cursor-pointer"
                            title="Remove asset"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  }) : (
                    <tr>
                      <td colSpan={4} className="py-12 text-center text-xs italic text-text-secondary bg-bg-secondary/10 rounded-xl">
                        Your holdings ledger is empty. Add assets using the simple form above to construct your audit.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            <div className="flex justify-between items-center pt-3 border-t border-border/40 text-[11px] text-text-muted">
              <span>Enter real wealth indicators to compare accurately.</span>
              <span>Total ledger records: <strong>{holdings.length}</strong></span>
            </div>
          </div>
        </div>

      </div>

      {/* COMPARISON CHART GAUGE / SIDE-BY-SIDE */}
      <div className="col-span-12 card p-8 space-y-6">
        <h2 className="text-xl font-bold flex items-center gap-2 text-text-primary">
          <ArrowRightLeft className="w-5 h-5 text-accent-gold" /> Step 3: Current vs. Target Allocation Breakdown
        </h2>

        {/* Side-by-Side Horizontal Stacked Chart Gauges */}
        <div className="space-y-6 bg-bg-secondary/30 p-6 rounded-2xl border border-border/60">
          
          {/* Current Chart Stack */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-text-primary uppercase tracking-widest text-[10px] font-black">Current Allocation Breakdown</span>
              <span className="font-mono text-accent-gold">Total: {formatCurrency(totalCurrentValue, user.currency)}</span>
            </div>
            <div className="w-full h-8 bg-bg-void rounded-xl border border-border overflow-hidden flex">
              {totalCurrentValue > 0 ? (
                ASSET_CLASSES.map(ac => {
                  const pct = (categoryValues[ac.key] / totalCurrentValue) * 100;
                  if (pct <= 0) return null;
                  return (
                    <div 
                      key={ac.key}
                      style={{ width: `${pct}%`, backgroundColor: ac.color }}
                      className="h-full relative group transition-all"
                      title={`${ac.label}: ${pct.toFixed(1)}%`}
                    >
                      {pct >= 6 && (
                        <span className="absolute inset-0 flex items-center justify-center text-[10px] font-mono text-bg-void font-bold select-none truncate px-1">
                          {pct.toFixed(0)}%
                        </span>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="w-full h-full flex items-center justify-center text-text-secondary uppercase tracking-widest text-[9px] font-black">
                  No allocation yet - Add holdings to review
                </div>
              )}
            </div>
          </div>

          {/* Target Chart Stack */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-text-primary uppercase tracking-widest text-[10px] font-black">Target Allocation Breakdown ({riskPreset.replace("_", " ")})</span>
              <span className="font-mono text-accent-gold">Total Target: {targetSum}%</span>
            </div>
            <div className="w-full h-8 bg-bg-void rounded-xl border border-border overflow-hidden flex">
              {targetSum > 0 ? (
                ASSET_CLASSES.map(ac => {
                  const pct = targets[ac.key] || 0;
                  if (pct <= 0) return null;
                  return (
                    <div 
                      key={ac.key}
                      style={{ width: `${pct}%`, backgroundColor: ac.color }}
                      className="h-full relative group opacity-90 hover:opacity-100 transition-all border-r border-bg-void/15"
                      title={`${ac.label}: ${pct}%`}
                    >
                      {pct >= 6 && (
                        <span className="absolute inset-0 flex items-center justify-center text-[10px] font-mono text-bg-void font-bold select-none truncate px-1">
                          {pct}%
                        </span>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="w-full h-full flex items-center justify-center text-text-secondary uppercase tracking-widest text-[9px] font-black">
                  No targets configured
                </div>
              )}
            </div>
          </div>

          {/* Chart Legends */}
          <div className="flex flex-wrap items-center justify-center gap-6 pt-2 font-mono text-[10px] uppercase font-black text-text-muted">
            {ASSET_CLASSES.map(ac => (
              <div key={ac.key} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-md" style={{ backgroundColor: ac.color }} />
                <span>{ac.label}</span>
              </div>
            ))}
          </div>

        </div>

        {/* DETAILED RESULTS TABLE AND EXACT ACTIONS */}
        <div className="overflow-x-auto pt-4">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border">
                <th className="pb-3 text-[10px] text-text-muted uppercase tracking-widest font-black">Asset Class</th>
                <th className="pb-3 text-[10px] text-text-muted uppercase tracking-widest font-black text-right">Current Value</th>
                <th className="pb-3 text-[10px] text-text-muted uppercase tracking-widest font-black text-right">Current %</th>
                <th className="pb-3 text-[10px] text-text-muted uppercase tracking-widest font-black text-right">Target %</th>
                <th className="pb-3 text-[10px] text-text-muted uppercase tracking-widest font-black text-right">Difference %</th>
                <th className="pb-3 text-[10px] text-text-muted uppercase tracking-widest font-black text-right">Prescribed Trade Operation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {analysisRows.map((row) => {
                const diffPct = row.differencePct;
                const recVal = row.differenceVal;
                const recAction = recVal === 0 
                  ? "Balanced"
                  : recVal > 0 
                    ? `SELL ${formatCurrency(Math.abs(recVal), user.currency)}`
                    : `BUY ${formatCurrency(Math.abs(recVal), user.currency)}`;

                return (
                  <tr key={row.key} className="group hover:bg-bg-secondary/40 transition-colors">
                    <td className="py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: row.color }} />
                        <span className="font-bold text-xs uppercase text-text-primary">{row.label}</span>
                      </div>
                    </td>
                    <td className="py-3.5 text-right font-mono text-xs font-bold text-text-primary">
                      {formatCurrency(row.currentVal, user.currency)}
                    </td>
                    <td className="py-3.5 text-right font-mono text-xs text-text-secondary">
                      {row.currentPct.toFixed(1)}%
                    </td>
                    <td className="py-3.5 text-right font-mono text-xs font-black text-accent-gold">
                      {row.targetPct}%
                    </td>
                    <td className={cn(
                      "py-3.5 text-right font-mono text-xs font-bold",
                      diffPct > 2 ? "text-accent-red" : diffPct < -2 ? "text-accent-emerald" : "text-text-muted"
                    )}>
                      {diffPct > 0 ? "+" : ""}{diffPct.toFixed(1)}%
                    </td>
                    <td className="py-3.5 text-right">
                      {Math.abs(recVal) < 1 ? (
                        <span className="text-[10px] uppercase font-bold text-text-muted py-1 px-3 bg-bg-secondary rounded-full font-mono border border-border/40">
                          Balanced
                        </span>
                      ) : (
                        <span className={cn(
                          "text-[10px] uppercase font-black px-3.5 py-1.5 rounded-xl font-mono border",
                          recVal > 0
                            ? "bg-accent-red/10 border-accent-red/20 text-accent-red"
                            : "bg-accent-emerald/10 border-accent-emerald/20 text-accent-emerald"
                        )}>
                          {recAction}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* BLUEPRINT RECOMMENDATIONS ACTIONS CHEST */}
        <div className="pt-6 border-t border-border/40 flex flex-col md:flex-row items-center gap-4 justify-between">
          <div className="space-y-1 text-center md:text-left">
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-primary">Trade Recipe Toolkit</h4>
            <p className="text-[11px] text-text-muted">Export trade formulas securely to rebalance your external accounts.</p>
          </div>
          
          <div className="flex flex-wrap gap-2 justify-center">
            {tradeActions.length > 0 && (
              <>
                <button
                  type="button"
                  disabled={targetSum !== 100}
                  onClick={() => {
                    if (!user.isPremium) {
                      setShowUpgradeModal(true);
                      return;
                    }
                    handleDownloadRecipe();
                  }}
                  className="btn-secondary flex items-center gap-2 py-2.5 px-4 text-[10px] uppercase font-black tracking-widest cursor-pointer hover:border-accent-gold transition-all relative"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download blueprint JSON</span>
                  {!user.isPremium && (
                    <span className="absolute -top-1 -right-1 bg-accent-gold text-[7px] text-bg-void px-1 rounded-full font-black border border-bg-void shadow">
                      PRO
                    </span>
                  )}
                </button>
                
                <button
                  type="button"
                  disabled={targetSum !== 100}
                  onClick={handleCopyScript}
                  className="btn-secondary flex items-center gap-2 py-2.5 px-4 text-[10px] uppercase font-black tracking-widest cursor-pointer hover:border-accent-gold transition-all relative"
                >
                  {copiedScript ? <Check className="w-3.5 h-3.5 text-accent-emerald" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedScript ? "Recipe Copied!" : "Copy Trades script"}</span>
                  {!user.isPremium && (
                    <span className="absolute -top-1 -right-1 bg-accent-gold text-[7px] text-bg-void px-1 rounded-full font-black border border-bg-void shadow">
                      PRO
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  disabled={targetSum !== 100}
                  onClick={() => {
                    if (!user.isPremium) {
                      setShowUpgradeModal(true);
                      return;
                    }
                    setShowAutoRebalanceConfirm(true);
                  }}
                  className="btn-primary flex items-center gap-2 py-2.5 px-4 text-[10px] uppercase font-black tracking-widest cursor-pointer relative"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-bg-void" />
                  <span>Simulate instant auto-rebalance</span>
                  {!user.isPremium && (
                    <span className="absolute -top-1 -right-1 bg-accent-gold text-[7px] text-bg-void px-1 rounded-full font-black border border-bg-void shadow">
                      PRO
                    </span>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* SECURE AI STRATEGIC ALIGNED INSIGHTS */}
      <div className="card p-8 bg-bg-secondary/40 border border-border/60 rounded-2xl space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-lg font-bold flex items-center gap-2 text-text-primary">
              <Sparkles className="w-4 h-4 text-accent-gold" /> AI Strategic Rebalancing Consultation
            </h3>
            <p className="text-text-secondary text-xs">Request elite personal advice specifically aligned to your learning parameters.</p>
          </div>
          <button
            type="button"
            disabled={loadingAI}
            onClick={handleFetchAIAdvice}
            className="px-5 py-3 bg-accent-gold/10 border border-accent-gold/25 hover:border-accent-gold/60 text-accent-gold rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2.5 cursor-pointer disabled:opacity-50 transition-all font-mono"
          >
            {loadingAI ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 fill-accent-gold animate-bounce" />}
            <span>{loadingAI ? "Consulting AI..." : "Consult AI Advisor"}</span>
          </button>
        </div>

        {/* Insight Box */}
        <AnimatePresence mode="wait">
          {adviceAI && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="p-5 rounded-2xl bg-bg-void border border-accent-gold/20 leading-relaxed text-xs text-text-secondary font-sans relative"
            >
              <div className="absolute right-4 top-4 text-[10px] font-mono text-accent-gold font-bold uppercase tracking-wider bg-accent-gold/10 px-2 py-0.5 rounded-full">
                AI Active
              </div>
              <p className="whitespace-pre-line leading-relaxed italic">{adviceAI}</p>
              <div className="mt-4 pt-3 border-t border-border/40 text-[9px] text-text-muted flex justify-between items-center font-mono">
                <span>Disclaimers apply. Educational strategy only.</span>
                <span>Model index: Gemini Large Heuristic API Proxy</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* CONFIRMATION OVERLAY DRAWER */}
      <AnimatePresence>
        {showAutoRebalanceConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAutoRebalanceConfirm(false)}
              className="absolute inset-0 bg-bg-void/80 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-bg-secondary border border-border rounded-3xl max-w-md w-full p-8 shadow-2xl space-y-6"
            >
              <span className="w-12 h-12 bg-accent-gold/10 text-accent-gold rounded-full flex items-center justify-center mx-auto text-xl">
                <ArrowRightLeft className="w-6 h-6" />
              </span>
              <div className="text-center space-y-2">
                <h3 className="text-xl font-bold text-text-primary">Simulate Full Rebalancing?</h3>
                <p className="text-xs text-text-muted leading-relaxed">
                  This will automatically execute buy and sell operations across your assets to match the target allocations exactly. This operation will override the assets ledger.
                </p>
              </div>

              <div className="p-4 bg-bg-void rounded-xl border border-border/40 text-left font-mono space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-text-muted">Total Balanced Pool:</span>
                  <span className="text-text-primary font-bold">{formatCurrency(totalCurrentValue, user.currency)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-text-muted">Target Strategy Profile:</span>
                  <span className="text-accent-gold font-bold">{riskPreset}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAutoRebalanceConfirm(false)}
                  className="py-3 px-4 bg-bg-void border border-border text-text-secondary text-xs uppercase font-black tracking-widest rounded-xl hover:border-border-active transition-all font-mono cursor-pointer"
                >
                  Abstain / Cancel
                </button>
                <button
                  type="button"
                  onClick={handleApplySimulatedRebalance}
                  className="py-3 px-4 bg-accent-gold text-bg-primary text-xs uppercase font-black tracking-widest rounded-xl hover:opacity-90 transition-all font-mono cursor-pointer"
                >
                  Verify & Execute
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <DeleteConfirmationDialog 
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={executeDeleteAsset}
        itemName={assetToDelete?.name || ""}
        itemType="asset"
      />

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
      />
    </div>
  );
}
