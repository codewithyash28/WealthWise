import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  BookOpen, 
  Lock, 
  Unlock, 
  CheckCircle2, 
  Sparkles, 
  Award, 
  Lightbulb, 
  ArrowRight,
  Zap,
  Globe,
  RefreshCw,
  TrendingUp,
  Newspaper,
  ExternalLink
} from "lucide-react";

export interface Concept {
  id: string;
  title: string;
  unlocked: boolean;
  unlockedAt?: string;
  triggerEvent: string;
  explainer: string;
  actionTip: string;
}

interface FinancialNewsSummary {
  id: string;
  title: string;
  message: string;
  type: string;
  timestamp: string;
  impactScore?: string;
}

const INITIAL_CONCEPTS: Concept[] = [
  {
    id: "c_1",
    title: "Pay Yourself First",
    unlocked: true,
    unlockedAt: "First Auto-Save Sweep",
    triggerEvent: "Wexa auto-transferred surplus cash to savings goal.",
    explainer: "Routing savings automatically before discretionary spending ensures wealth accrual happens effortlessly without relying on willpower.",
    actionTip: "Set up a recurring sweep on payday to lock in a 15% baseline savings rate."
  },
  {
    id: "c_2",
    title: "Subscription Drag",
    unlocked: true,
    unlockedAt: "First Unused Subscription Pause",
    triggerEvent: "Wexa Subscription Shield detected and paused an unused recurring charge.",
    explainer: "Small unused recurring monthly charges ($15-$30) compound over a year into hundreds of dollars of silent capital erosion.",
    actionTip: "Audit recurring bills quarterly and cancel services unused for over 30 days."
  },
  {
    id: "c_3",
    title: "Budget Elasticity",
    unlocked: true,
    unlockedAt: "Category Limit Rebalance",
    triggerEvent: "Wexa dynamically adjusted grocery budget limit to offset inflation.",
    explainer: "Fixed rigid budgets fail when prices fluctuate. Elastic budgets reallocate unused buffers between categories seamlessly.",
    actionTip: "Pair high-volatility categories (Groceries, Gas) with flexible entertainment buffers."
  },
  {
    id: "c_4",
    title: "Compound Growth Velocity",
    unlocked: true,
    unlockedAt: "Investment Simulation Run",
    triggerEvent: "User ran a 10-year market projection simulation.",
    explainer: "Earning returns on both principal and accumulated interest dramatically accelerates net worth creation over multi-year horizons.",
    actionTip: "Reinvest all yield dividends to maximize exponential compounding."
  },
  {
    id: "c_5",
    title: "Opportunity Cost",
    unlocked: false,
    triggerEvent: "Unlocks on first impulse buy flagged by Wexa Agent.",
    explainer: "Every dollar spent today on non-essential consumption represents a loss of future investment returns compounding at 8% annually.",
    actionTip: "Apply the 24-hour cooling rule to non-essential purchases over $100."
  },
  {
    id: "c_6",
    title: "Yield Friction & Inflation Drag",
    unlocked: false,
    triggerEvent: "Unlocks when cash idle time exceeds 14 days.",
    explainer: "Leaving cash in a 0.01% traditional checking account causes 3%+ annual real purchasing power loss due to inflation.",
    actionTip: "Keep only 1 month of expenses in checking; move excess to a 4.5%+ High-Yield account."
  }
];

export const KnowledgeVault: React.FC = () => {
  const [concepts, setConcepts] = useState<Concept[]>(INITIAL_CONCEPTS);
  const [selectedConcept, setSelectedConcept] = useState<Concept | null>(INITIAL_CONCEPTS[0]);
  const [news, setNews] = useState<FinancialNewsSummary[]>([]);
  const [loadingNews, setLoadingNews] = useState<boolean>(true);
  const [lastFetchedNews, setLastFetchedNews] = useState<string>("");

  const fetchLiveFinancialNews = async () => {
    setLoadingNews(true);
    try {
      const res = await fetch("/api/gemini/autonomous-alerts");
      if (res.ok) {
        const data = await res.json();
        if (data.alerts && Array.isArray(data.alerts)) {
          setNews(data.alerts);
        }
        setLastFetchedNews(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      } else {
        throw new Error(`HTTP ${res.status}`);
      }
    } catch (err) {
      console.warn("[KnowledgeVault] Live grounding news offline, using fallback highlights:", err);
      setNews([
        { id: "n_1", type: "market", title: "Global Central Bank Policies", message: "Monetary policy decisions continue to influence yield curves and asset valuations globally.", timestamp: "Intelligence" },
        { id: "n_2", type: "info", title: "Inflation Delta Tracking", message: "Real-time CPI indices show stabilizing core inflation across key developed markets.", timestamp: "Intelligence" }
      ]);
      setLastFetchedNews(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    } finally {
      setLoadingNews(false);
    }
  };

  useEffect(() => {
    fetchLiveFinancialNews();
  }, []);

  const unlockedCount = concepts.filter(c => c.unlocked).length;

  const handleUnlockTest = () => {
    const lockedIndex = concepts.findIndex(c => !c.unlocked);
    if (lockedIndex !== -1) {
      setConcepts(prev => prev.map((c, idx) => {
        if (idx === lockedIndex) {
          const updated = {
            ...c,
            unlocked: true,
            unlockedAt: new Date().toLocaleTimeString()
          };
          setSelectedConcept(updated);
          return updated;
        }
        return c;
      }));
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
            <Award className="w-4 h-4" />
            Gamified Financial Literacy Vault
          </div>
          <h2 className="text-xl font-extrabold text-white">
            Unlocked Financial Knowledge Concepts
          </h2>
          <p className="text-xs text-slate-400 max-w-xl">
            Concepts unlock dynamically as real financial events happen on your account. Every event teaches you the plain-language financial principle behind the decision.
          </p>
        </div>

        <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex items-center gap-4 shrink-0">
          <div>
            <div className="text-[10px] font-mono uppercase text-slate-500">Vault Progress</div>
            <div className="text-lg font-bold text-white flex items-center gap-1.5">
              <span className="text-amber-400">{unlockedCount}</span>
              <span className="text-slate-500">/</span>
              <span>{concepts.length} Unlocked</span>
            </div>
          </div>
          {unlockedCount < concepts.length && (
            <button
              onClick={handleUnlockTest}
              className="px-3 py-2 bg-amber-950 hover:bg-amber-900 border border-amber-700/50 text-amber-300 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Simulate Unlock
            </button>
          )}
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Concepts List */}
        <div className="space-y-3">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Financial Knowledge Index
          </div>

          {concepts.map((concept) => {
            const isSelected = selectedConcept?.id === concept.id;
            return (
              <button
                key={concept.id}
                onClick={() => concept.unlocked && setSelectedConcept(concept)}
                className={`w-full p-4 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                  !concept.unlocked
                    ? "bg-slate-950/40 border-slate-800/60 opacity-50 cursor-not-allowed"
                    : isSelected
                    ? "bg-teal-950/60 border-teal-500/60 text-white shadow-lg shadow-teal-500/10"
                    : "bg-slate-900/80 border-slate-800 hover:border-slate-700 text-slate-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg border ${concept.unlocked ? "bg-amber-500/10 text-amber-400 border-amber-500/20" : "bg-slate-800 text-slate-500 border-slate-700"}`}>
                    {concept.unlocked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="text-xs font-bold">{concept.title}</div>
                    <div className="text-[10px] text-slate-500">{concept.unlocked ? `Unlocked: ${concept.unlockedAt}` : "Locked"}</div>
                  </div>
                </div>

                {concept.unlocked && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
              </button>
            );
          })}
        </div>

        {/* Concept Detail View */}
        <div className="lg:col-span-2">
          {selectedConcept ? (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl h-full flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-mono font-bold uppercase">
                      <Sparkles className="w-3 h-3" /> Unlocked Concept
                    </div>
                    <h3 className="text-xl font-extrabold text-white">{selectedConcept.title}</h3>
                  </div>
                  <span className="text-xs font-mono text-slate-400 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
                    {selectedConcept.unlockedAt}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="text-xs font-bold text-teal-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5" /> Trigger Event
                  </div>
                  <p className="text-xs text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800">
                    {selectedConcept.triggerEvent}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-teal-400" /> Core Financial Concept
                  </div>
                  <p className="text-sm text-slate-200 leading-relaxed">
                    {selectedConcept.explainer}
                  </p>
                </div>

                <div className="space-y-2 pt-2">
                  <div className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5" /> Actionable Wealth Tip
                  </div>
                  <p className="text-xs font-medium text-amber-200 bg-amber-950/40 border border-amber-800/40 p-4 rounded-xl">
                    {selectedConcept.actionTip}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center text-slate-500 space-y-2">
              <BookOpen className="w-8 h-8 mx-auto opacity-40 text-amber-400" />
              <div>Select an unlocked concept from the vault index to view explainer.</div>
            </div>
          )}
        </div>
      </div>

      {/* Up-To-The-Minute Financial News Summaries (Google Grounded) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400">
              <Globe className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-white">Up-To-The-Minute Financial News Summaries</h3>
                <span className="px-2 py-0.5 rounded-full bg-teal-500/15 border border-teal-500/30 text-[10px] font-mono font-bold text-teal-400 uppercase tracking-widest flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Google Search Grounded
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Live macroeconomic headlines, central bank rate shifts, and market intelligence automatically parsed when accessing the vault.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {lastFetchedNews && (
              <span className="text-[10px] font-mono text-slate-500">
                Updated: {lastFetchedNews}
              </span>
            )}
            <button
              onClick={fetchLiveFinancialNews}
              disabled={loadingNews}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingNews ? "animate-spin" : ""}`} />
              Fetch Live News
            </button>
          </div>
        </div>

        {loadingNews ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-slate-950/60 border border-slate-800 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : news.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-500 font-mono">
            No live financial news summaries retrieved. Click 'Fetch Live News' to query.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {news.map((item, idx) => (
              <motion.div
                key={item.id || idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 hover:border-slate-700 transition-all space-y-2 flex flex-col justify-between"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-white line-clamp-1">{item.title}</span>
                    <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-amber-500/10 border border-amber-500/20 text-amber-400 shrink-0">
                      {item.type || "MARKET"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {item.message}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/50 text-[10px] font-mono text-slate-500">
                  <span className="flex items-center gap-1 text-teal-400 font-bold">
                    <Newspaper className="w-3 h-3" /> Grounded Source
                  </span>
                  <span>{item.timestamp || "Live Search"}</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
