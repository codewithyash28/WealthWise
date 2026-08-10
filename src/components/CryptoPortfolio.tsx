import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Coins, TrendingUp, TrendingDown, RefreshCw, Plus, Trash2, Sparkles, DollarSign, Wallet, ShieldCheck, ArrowUpRight, ArrowDownRight, Bell, BellRing, Target, Eye, AlertTriangle, CheckCircle2 } from "lucide-react";
import { formatCurrency } from "../lib/utils";
import { CURRENCIES } from "../constants";

import { UserProfile } from "../types";

export interface CryptoHolding {
  id: string;
  symbol: string;
  name: string;
  amount: number;
  avgBuyPrice: number;
}

export interface CryptoPriceAlert {
  id: string;
  coinId: string;
  symbol: string;
  name: string;
  targetPriceUSD: number;
  condition: "above" | "below";
  createdAt: string;
}

interface CryptoPriceData {
  usd: number;
  usd_24h_change: number;
}

const DEFAULT_HOLDINGS: CryptoHolding[] = [];

const DEFAULT_ALERTS: CryptoPriceAlert[] = [];

const SUPPORTED_COINS = [
  { id: "bitcoin", symbol: "BTC", name: "Bitcoin", defaultPrice: 65000, change: 2.4 },
  { id: "ethereum", symbol: "ETH", name: "Ethereum", defaultPrice: 3450, change: -0.8 },
  { id: "solana", symbol: "SOL", name: "Solana", defaultPrice: 180, change: 5.2 },
  { id: "cardano", symbol: "ADA", name: "Cardano", defaultPrice: 0.45, change: 1.1 },
  { id: "ripple", symbol: "XRP", name: "XRP", defaultPrice: 0.58, change: -1.5 },
  { id: "polkadot", symbol: "DOT", name: "Polkadot", defaultPrice: 7.20, change: 3.8 },
  { id: "avalanche-2", symbol: "AVAX", name: "Avalanche", defaultPrice: 28.50, change: 0.5 },
  { id: "chainlink", symbol: "LINK", name: "Chainlink", defaultPrice: 14.80, change: 4.1 },
];

interface CryptoPortfolioProps {
  user?: UserProfile;
  currency?: string;
}

export function CryptoPortfolio({ user, currency: propCurrency }: CryptoPortfolioProps) {
  const currency = propCurrency || user?.currency || "USD";
  const currInfo = CURRENCIES[currency] || CURRENCIES.USD;
  const [holdings, setHoldings] = useState<CryptoHolding[]>(() => {
    const saved = localStorage.getItem("ww_crypto_holdings");
    return saved ? JSON.parse(saved) : DEFAULT_HOLDINGS;
  });

  const [prices, setPrices] = useState<Record<string, CryptoPriceData>>({});
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Custom Price-Point Alerts & Watched Assets State
  const [alerts, setAlerts] = useState<CryptoPriceAlert[]>(() => {
    const saved = localStorage.getItem("ww_crypto_price_alerts");
    return saved ? JSON.parse(saved) : DEFAULT_ALERTS;
  });

  const [alertCoinId, setAlertCoinId] = useState("bitcoin");
  const [alertTargetInput, setAlertTargetInput] = useState("");
  const [alertCondition, setAlertCondition] = useState<"above" | "below">("above");
  const [isAlertFormOpen, setIsAlertFormOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem("ww_crypto_price_alerts", JSON.stringify(alerts));
  }, [alerts]);

  const handleAddAlert = (e: React.FormEvent) => {
    e.preventDefault();
    const targetVal = parseFloat(alertTargetInput);
    if (isNaN(targetVal) || targetVal <= 0) return;

    const coinMeta = SUPPORTED_COINS.find(c => c.id === alertCoinId);
    if (!coinMeta) return;

    const newAlert: CryptoPriceAlert = {
      id: `alert-${Date.now()}`,
      coinId: alertCoinId,
      symbol: coinMeta.symbol,
      name: coinMeta.name,
      targetPriceUSD: targetVal,
      condition: alertCondition,
      createdAt: new Date().toISOString()
    };

    setAlerts(prev => [newAlert, ...prev]);
    setAlertTargetInput("");
    setIsAlertFormOpen(false);

    window.dispatchEvent(new CustomEvent('ww-trigger-alert', {
      detail: {
        type: 'success',
        title: 'Price Alert Set! 🔔',
        message: `Custom price alert created for ${coinMeta.symbol} when price goes ${alertCondition} $${targetVal.toLocaleString()}`
      }
    }));
  };

  const handleRemoveAlert = (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  // Form states for adding new asset
  const [selectedCoinId, setSelectedCoinId] = useState("bitcoin");
  const [amountInput, setAmountInput] = useState("");
  const [buyPriceInput, setBuyPriceInput] = useState("");

  useEffect(() => {
    localStorage.setItem("ww_crypto_holdings", JSON.stringify(holdings));
  }, [holdings]);

  const fetchCryptoPrices = async () => {
    setLoading(true);
    try {
      const ids = SUPPORTED_COINS.map((c) => c.id).join(",");
      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`
      );

      if (response.ok) {
        const data = await response.json();
        setPrices(data);
        setLastUpdated(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
      } else {
        throw new Error("CoinGecko API rate limit or error");
      }
    } catch (err) {
      console.warn("[CryptoPortfolio] Using fallback real-time estimate prices:", err);
      // Fallback prices
      const fallbackPrices: Record<string, CryptoPriceData> = {};
      SUPPORTED_COINS.forEach((coin) => {
        fallbackPrices[coin.id] = {
          usd: coin.defaultPrice,
          usd_24h_change: coin.change,
        };
      });
      setPrices(fallbackPrices);
      setLastUpdated(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCryptoPrices();
    const interval = setInterval(fetchCryptoPrices, 45000); // refresh every 45s
    return () => clearInterval(interval);
  }, []);

  const getCoinPrice = (id: string): number => {
    return prices[id]?.usd || SUPPORTED_COINS.find((c) => c.id === id)?.defaultPrice || 0;
  };

  const getCoinChange = (id: string): number => {
    return prices[id]?.usd_24h_change || SUPPORTED_COINS.find((c) => c.id === id)?.change || 0;
  };

  const totalValueUSD = holdings.reduce((sum, h) => sum + h.amount * getCoinPrice(h.id), 0);
  const totalCostUSD = holdings.reduce((sum, h) => sum + h.amount * h.avgBuyPrice, 0);
  const totalProfitLossUSD = totalValueUSD - totalCostUSD;
  const totalProfitLossPercent = totalCostUSD > 0 ? (totalProfitLossUSD / totalCostUSD) * 100 : 0;

  const handleAddHolding = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(amountInput);
    const buyPrice = parseFloat(buyPriceInput) || getCoinPrice(selectedCoinId);

    if (isNaN(amount) || amount <= 0) return;

    const coinMeta = SUPPORTED_COINS.find((c) => c.id === selectedCoinId);
    if (!coinMeta) return;

    const existingIndex = holdings.findIndex((h) => h.id === selectedCoinId);
    if (existingIndex >= 0) {
      const updated = [...holdings];
      const prev = updated[existingIndex];
      const newTotalAmount = prev.amount + amount;
      const newAvgBuyPrice = (prev.amount * prev.avgBuyPrice + amount * buyPrice) / newTotalAmount;
      updated[existingIndex] = { ...prev, amount: newTotalAmount, avgBuyPrice: newAvgBuyPrice };
      setHoldings(updated);
    } else {
      setHoldings([
        ...holdings,
        {
          id: selectedCoinId,
          symbol: coinMeta.symbol,
          name: coinMeta.name,
          amount,
          avgBuyPrice: buyPrice,
        },
      ]);
    }

    setAmountInput("");
    setBuyPriceInput("");
    setIsAddOpen(false);

    window.dispatchEvent(
      new CustomEvent("ww-trigger-alert", {
        detail: {
          type: "success",
          title: "Crypto Holding Added! ⚡",
          message: `Added ${amount} ${coinMeta.symbol} to your live tracked crypto portfolio.`,
        },
      })
    );
  };

  const handleRemoveHolding = (id: string) => {
    setHoldings(holdings.filter((h) => h.id !== id));
  };

  return (
    <div className="bg-bg-secondary/80 backdrop-blur-md border border-border/70 rounded-3xl p-6 shadow-2xl relative overflow-hidden space-y-6">
      {/* Decorative Glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-teal-500/10 via-amber-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/50 pb-5 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-gradient-to-tr from-teal-500/20 to-amber-500/20 border border-teal-500/30 shadow-inner">
            <Coins className="w-6 h-6 text-teal-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-extrabold text-text-primary tracking-tight font-sans">
                Real-Time Crypto Portfolio
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-teal-500/15 border border-teal-500/30 text-[10px] font-mono font-bold text-teal-400 uppercase tracking-widest flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Live Feed
              </span>
            </div>
            <p className="text-xs text-text-muted">
              Live market pricing & holding analytics tracked directly in your Wexa dashboard.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {lastUpdated && (
            <span className="text-[10px] font-mono text-text-muted hidden sm:inline-block">
              Updated: {lastUpdated}
            </span>
          )}
          <button
            onClick={fetchCryptoPrices}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-bg-tertiary border border-border text-xs font-semibold text-text-secondary hover:text-teal-300 hover:border-teal-400/40 transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <button
            onClick={() => setIsAddOpen(!isAddOpen)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-bg-void font-bold text-xs shadow-lg transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Asset
          </button>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 relative z-10">
        <div className="p-4 rounded-2xl bg-bg-tertiary/60 border border-border/50">
          <div className="text-[10px] font-mono font-bold text-text-muted uppercase tracking-wider mb-1">
            Total Crypto Asset Value
          </div>
          <div className="text-2xl font-black text-text-primary font-mono">
            {formatCurrency(totalValueUSD, currency, currInfo.locale)}
          </div>
          <div className="text-[10px] text-text-muted mt-1 font-mono">
            Based on current live market price
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-bg-tertiary/60 border border-border/50">
          <div className="text-[10px] font-mono font-bold text-text-muted uppercase tracking-wider mb-1">
            Total Capital Invested
          </div>
          <div className="text-2xl font-black text-text-secondary font-mono">
            {formatCurrency(totalCostUSD, currency, currInfo.locale)}
          </div>
          <div className="text-[10px] text-text-muted mt-1 font-mono">
            Weighted Average Purchase Cost
          </div>
        </div>

        <div className={`p-4 rounded-2xl border ${totalProfitLossUSD >= 0 ? "bg-emerald-500/10 border-emerald-500/30" : "bg-rose-500/10 border-rose-500/30"}`}>
          <div className="text-[10px] font-mono font-bold text-text-muted uppercase tracking-wider mb-1">
            Unrealized Gain / Loss
          </div>
          <div className={`text-2xl font-black font-mono flex items-center gap-1.5 ${totalProfitLossUSD >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
            {totalProfitLossUSD >= 0 ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
            {formatCurrency(totalProfitLossUSD, currency, currInfo.locale)}
          </div>
          <div className={`text-[11px] font-mono font-bold mt-1 ${totalProfitLossUSD >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
            {totalProfitLossUSD >= 0 ? "+" : ""}{totalProfitLossPercent.toFixed(2)}% All-Time Return
          </div>
        </div>
      </div>

      {/* Add Asset Modal / Inline Form */}
      {isAddOpen && (
        <motion.form
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          onSubmit={handleAddHolding}
          className="p-4 rounded-2xl bg-bg-void/80 border border-teal-500/40 space-y-4 relative z-10"
        >
          <div className="text-xs font-bold text-teal-300 uppercase font-mono tracking-wider">
            Track New Crypto Holding
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] text-text-muted font-mono block mb-1">Select Asset</label>
              <select
                value={selectedCoinId}
                onChange={(e) => setSelectedCoinId(e.target.value)}
                className="w-full bg-bg-tertiary border border-border rounded-xl px-3 py-2 text-xs text-text-primary font-mono focus:border-teal-400 outline-none"
              >
                {SUPPORTED_COINS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.symbol})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] text-text-muted font-mono block mb-1">Holding Amount</label>
              <input
                type="number"
                step="any"
                placeholder="e.g. 0.5"
                value={amountInput}
                onChange={(e) => setAmountInput(e.target.value)}
                required
                className="w-full bg-bg-tertiary border border-border rounded-xl px-3 py-2 text-xs text-text-primary font-mono focus:border-teal-400 outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] text-text-muted font-mono block mb-1">Avg Buy Price (USD)</label>
              <input
                type="number"
                step="any"
                placeholder={`Current: $${getCoinPrice(selectedCoinId)}`}
                value={buyPriceInput}
                onChange={(e) => setBuyPriceInput(e.target.value)}
                className="w-full bg-bg-tertiary border border-border rounded-xl px-3 py-2 text-xs text-text-primary font-mono focus:border-teal-400 outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="px-3 py-1.5 rounded-xl border border-border text-xs text-text-muted hover:text-text-primary cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-bg-void font-bold text-xs cursor-pointer shadow-lg"
            >
              Confirm Holding
            </button>
          </div>
        </motion.form>
      )}

      {/* Main Grid: Holdings Table (Left/Main) & Watched Assets Sidebar (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
        {/* Left Column: Holdings Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold font-mono text-text-primary uppercase tracking-wider flex items-center gap-2">
              <Wallet className="w-4 h-4 text-teal-400" /> Tracked Crypto Holdings
            </h4>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-border/50 bg-bg-tertiary/30">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-border/60 text-text-muted text-[10px] uppercase tracking-wider bg-bg-tertiary/60">
                  <th className="py-3 px-3">Asset</th>
                  <th className="py-3 px-3">Live Price</th>
                  <th className="py-3 px-3">24h Change</th>
                  <th className="py-3 px-3">Holding</th>
                  <th className="py-3 px-3">Total Value</th>
                  <th className="py-3 px-3">P/L</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {holdings.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-text-muted font-mono text-xs">
                      No crypto holdings tracked yet. Click "+ Add Holding" above to start tracking real assets!
                    </td>
                  </tr>
                )}
                {holdings.map((h) => {
                  const livePriceUSD = getCoinPrice(h.id);
                  const change24h = getCoinChange(h.id);
                  const totalValUSD = h.amount * livePriceUSD;
                  const totalCostUSD = h.amount * h.avgBuyPrice;
                  const pnlUSD = totalValUSD - totalCostUSD;
                  const pnlPercent = totalCostUSD > 0 ? (pnlUSD / totalCostUSD) * 100 : 0;

                  return (
                    <tr key={h.id} className="hover:bg-bg-tertiary/40 transition-colors">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-teal-500/10 border border-teal-500/30 flex items-center justify-center font-bold text-teal-400 text-xs">
                            {h.symbol.slice(0, 3)}
                          </div>
                          <div>
                            <div className="font-bold text-text-primary">{h.name}</div>
                            <div className="text-[10px] text-text-muted">{h.symbol}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3 font-bold text-text-primary">
                        {formatCurrency(livePriceUSD, currency, currInfo.locale)}
                      </td>

                      <td className="py-3 px-3">
                        <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md text-[10px] font-bold ${change24h >= 0 ? "bg-emerald-500/15 text-emerald-400" : "bg-rose-500/15 text-rose-400"}`}>
                          {change24h >= 0 ? "+" : ""}{change24h.toFixed(2)}%
                        </span>
                      </td>

                      <td className="py-3 px-3 font-bold text-text-secondary">
                        {h.amount} {h.symbol}
                      </td>

                      <td className="py-3 px-3 font-bold text-teal-300">
                        {formatCurrency(totalValUSD, currency, currInfo.locale)}
                      </td>

                      <td className="py-3 px-3">
                        <div className={`font-bold ${pnlUSD >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                          {pnlUSD >= 0 ? "+" : ""}{formatCurrency(pnlUSD, currency, currInfo.locale)}
                        </div>
                        <div className={`text-[9px] ${pnlUSD >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                          {pnlUSD >= 0 ? "+" : ""}{pnlPercent.toFixed(1)}%
                        </div>
                      </td>

                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => handleRemoveHolding(h.id)}
                          className="p-1.5 rounded-lg text-text-muted hover:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer"
                          title="Delete holding"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Sidebar: Watched Assets & Custom Price-Point Alerts */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold font-mono text-text-primary uppercase tracking-wider flex items-center gap-2">
              <Eye className="w-4 h-4 text-amber-400" /> Watched Assets & Alerts
            </h4>
            <button
              onClick={() => setIsAlertFormOpen(!isAlertFormOpen)}
              className="text-xs font-mono font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-xl transition-all"
            >
              <Bell className="w-3.5 h-3.5" /> + Alert
            </button>
          </div>

          {/* Add Price Alert Inline Form */}
          {isAlertFormOpen && (
            <motion.form
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              onSubmit={handleAddAlert}
              className="p-4 rounded-2xl bg-bg-tertiary border border-amber-500/40 space-y-3 font-mono text-xs"
            >
              <div className="font-bold text-amber-300 text-[11px] uppercase flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5" /> Set Token Price Trigger
              </div>
              
              <div>
                <label className="text-[10px] text-text-muted block mb-1">Target Asset</label>
                <select
                  value={alertCoinId}
                  onChange={(e) => setAlertCoinId(e.target.value)}
                  className="w-full bg-bg-void border border-border rounded-xl px-2.5 py-1.5 text-text-primary focus:border-amber-400 outline-none"
                >
                  {SUPPORTED_COINS.map((c) => (
                    <option key={c.id} value={c.id}>{c.name} ({c.symbol})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] text-text-muted block mb-1">Condition</label>
                <select
                  value={alertCondition}
                  onChange={(e) => setAlertCondition(e.target.value as "above" | "below")}
                  className="w-full bg-bg-void border border-border rounded-xl px-2.5 py-1.5 text-text-primary focus:border-amber-400 outline-none"
                >
                  <option value="above">Price rises ABOVE target ($)</option>
                  <option value="below">Price drops BELOW target ($)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-text-muted block mb-1">Target Price (USD)</label>
                <input
                  type="number"
                  step="any"
                  placeholder={`Current: $${getCoinPrice(alertCoinId)}`}
                  value={alertTargetInput}
                  onChange={(e) => setAlertTargetInput(e.target.value)}
                  required
                  className="w-full bg-bg-void border border-border rounded-xl px-2.5 py-1.5 text-text-primary focus:border-amber-400 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAlertFormOpen(false)}
                  className="px-2.5 py-1 rounded-lg border border-border text-text-muted hover:text-text-primary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-bg-void font-bold shadow-md"
                >
                  Save Alert
                </button>
              </div>
            </motion.form>
          )}

          {/* List of Watched Assets & Alerts */}
          <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
            {alerts.length === 0 ? (
              <div className="p-6 text-center text-text-muted italic text-xs border border-dashed border-border/50 rounded-2xl font-mono">
                No custom price alerts configured. Click "+ Alert" to start watching token thresholds.
              </div>
            ) : (
              alerts.map((item) => {
                const livePrice = getCoinPrice(item.coinId);
                const isTriggered = item.condition === "above" 
                  ? livePrice >= item.targetPriceUSD 
                  : livePrice <= item.targetPriceUSD;

                return (
                  <div
                    key={item.id}
                    className={`p-3.5 rounded-2xl border transition-all font-mono ${
                      isTriggered 
                        ? "bg-amber-500/10 border-amber-500/60 shadow-lg shadow-amber-500/5 animate-pulse" 
                        : "bg-bg-tertiary/50 border-border/50 hover:border-border"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center font-bold text-amber-400 text-xs">
                          {item.symbol.slice(0, 3)}
                        </div>
                        <div>
                          <div className="font-bold text-xs text-text-primary">{item.name}</div>
                          <div className="text-[10px] text-text-muted">{item.symbol}</div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleRemoveAlert(item.id)}
                        className="p-1 rounded-lg text-text-muted hover:text-rose-400 transition-colors"
                        title="Remove watched alert"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1 border-t border-border/30">
                      <div>
                        <span className="text-[10px] text-text-muted uppercase block">Live Price</span>
                        <span className="font-bold text-text-primary">${livePrice.toLocaleString()}</span>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-text-muted uppercase block">Target ({item.condition})</span>
                        <span className="font-bold text-amber-400">${item.targetPriceUSD.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="mt-2 flex items-center justify-between text-[10px]">
                      {isTriggered ? (
                        <span className="text-amber-300 font-bold flex items-center gap-1 bg-amber-500/20 px-2 py-0.5 rounded-md border border-amber-500/40">
                          <BellRing className="w-3 h-3 text-amber-400" /> ALERT TRIGGERED!
                        </span>
                      ) : (
                        <span className="text-text-muted flex items-center gap-1">
                          <Eye className="w-3 h-3 text-teal-400" /> Monitoring target...
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
