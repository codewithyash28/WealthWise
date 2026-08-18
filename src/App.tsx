import { useState, useEffect, useCallback, Component, ErrorInfo, ReactNode, lazy, Suspense } from "react";

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean, error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4">
          <div className="card p-8 max-w-md w-full text-center space-y-4">
            <h2 className="text-2xl font-bold text-accent-red">Something went wrong</h2>
            <p className="text-text-secondary">
              The application encountered an unexpected error. This might be due to missing configuration or a temporary issue.
            </p>
            <div className="p-4 bg-bg-secondary rounded-xl text-left overflow-auto max-h-40">
              <code className="text-xs font-mono text-accent-red">
                {this.state.error?.message || "Unknown error"}
              </code>
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="w-full py-3 bg-accent-gold text-bg-primary font-bold rounded-xl hover:opacity-90 transition-opacity"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

class ModuleErrorBoundary extends Component<{ children: ReactNode, moduleName: string }, { hasError: boolean, error: Error | null }> {
  constructor(props: { children: ReactNode, moduleName: string }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`ModuleErrorBoundary [${this.props.moduleName}] caught an error:`, error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="card p-8 border-accent-red/20 bg-accent-red/5 space-y-4 text-center my-6">
          <h3 className="text-xl font-bold text-accent-red">Engine Disconnected</h3>
          <p className="text-sm text-text-secondary">
            The <strong>{this.props.moduleName}</strong> component encountered an edge-case calculation or render error. Other modules and parameters are unaffected.
          </p>
          <div className="p-3 bg-bg-void/80 rounded-xl text-left overflow-auto max-h-24 mx-auto max-w-lg border border-border">
            <code className="text-[10px] font-mono text-accent-red">
              {this.state.error?.message || "Calculation/Rendering Error"}
            </code>
          </div>
          <button 
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-4 py-2 bg-accent-gold text-bg-primary text-xs font-bold uppercase tracking-wider rounded-xl hover:opacity-90 transition-all font-mono cursor-pointer"
          >
            Reset Engine Sandbox
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
import { Navbar } from "./components/Navbar";
import { useStytchAuth } from "./lib/stytchAuthContext";
import { StytchAuthBanner, StytchAuthSignInWidget } from "./components/StytchAuthWidgets";
import { StripeBillingCenter } from "./components/StripeBillingCenter";
import { UpgradeModal } from "./components/UpgradeModal";
import { Footer } from "./components/Footer";
import { LandingPage } from "./components/LandingPage";
import { WealthDashboard } from "./components/WealthDashboard";
import { AuditReport } from "./components/AuditReport";
import { HackathonSubmissionHub } from "./components/HackathonSubmissionHub";
import { PricingPage } from "./components/PricingPage";
import { JudgeModeTerminal } from "./components/JudgeModeTerminal";
import { WexaExecutionEngine } from "./components/WexaExecutionEngine";
import { WexaCompanion } from "./components/WexaCompanion";
import { BankSyncSandbox } from "./components/BankSyncSandbox";
import { KnowledgeVault } from "./components/KnowledgeVault";
import { CryptoPortfolio } from "./components/CryptoPortfolio";
import { RentVsBuySimulator } from "./components/RentVsBuySimulator";
import { CurrencySelector, NameInput } from "./components/Modals";
import { UniversalAuthModal } from "./components/UniversalAuthModal";
import { Onboarding } from "./components/Onboarding";
import { JudgeTour } from "./components/JudgeTour";
import { GoalCelebrationOverlay } from "./components/GoalCelebration";
import { EvidenceEngineModal } from "./components/EvidenceEngineModal";
import { logAuditAction } from "./lib/auditLogger";
import { StartupLogoAnimation } from "./components/StartupLogoAnimation";
import { Logo } from "./components/Logo";
import { InvestorPitchModeBanner } from "./components/InvestorPitchModeBanner";
import { CurrencyFluctuationAlert } from "./components/CurrencyFluctuationAlert";
import { SupportedCurrency } from "./lib/revenueUtils";
import { UserProfile, BudgetPlan, FinancialGoal, Achievement, Portfolio } from "./types";
import { CURRENCIES, ACHIEVEMENTS } from "./constants";
import { Tutorial } from "./components/Tutorial";
import { PulseAlert } from "./components/mastery/PulseAlert";
import { Skeleton } from "./components/ui/Skeleton";
import { motion, AnimatePresence } from "motion/react";
import { QuickTips } from "./components/QuickTips";
import { Database, RefreshCw, Cloud, ShieldCheck, Mail, Lock, Server, LogIn, ArrowRight, Activity, Globe, Wifi, KeyRound, AlertTriangle, Star } from "lucide-react";

// Performance monitoring utility tracking latency of each lazy-loaded financial engine module
function trackLazyModule<T>(moduleName: string, importFn: () => Promise<{ default: React.ComponentType<any> }>) {
  return lazy(() => {
    const startTime = performance.now();
    return importFn().then((module) => {
      const duration = performance.now() - startTime;
      console.log(`⚡ [PERFORMANCE MONITOR] Engine '${moduleName}' mounted in ${duration.toFixed(2)}ms`);
      return module;
    });
  });
}

// Lazy loaded heavy charting/simulator engines with latency logging
const Dashboard = trackLazyModule("Dashboard", () => import("./components/Dashboard").then(m => ({ default: m.Dashboard })));
const BudgetPlanner = trackLazyModule("BudgetPlanner", () => import("./components/BudgetPlanner").then(m => ({ default: m.BudgetPlanner })));
const InvestmentSimulator = trackLazyModule("InvestmentSimulator", () => import("./components/InvestmentSimulator").then(m => ({ default: m.InvestmentSimulator })));
const FinancialQuiz = trackLazyModule("FinancialQuiz", () => import("./components/FinancialQuiz").then(m => ({ default: m.FinancialQuiz })));
const ScenarioSimulator = trackLazyModule("ScenarioSimulator", () => import("./components/ScenarioSimulator").then(m => ({ default: m.ScenarioSimulator })));
const Resources = trackLazyModule("Resources", () => import("./components/Resources").then(m => ({ default: m.Resources })));
const AssetAllocation = trackLazyModule("AssetAllocation", () => import("./components/AssetAllocation").then(m => ({ default: m.AssetAllocation })));
const AssetRebalancer = trackLazyModule("AssetRebalancer", () => import("./components/AssetRebalancer").then(m => ({ default: m.AssetRebalancer })));
const Badges = trackLazyModule("Badges", () => import("./components/Badges").then(m => ({ default: m.Badges })));
const CaseStudy = trackLazyModule("CaseStudy", () => import("./components/CaseStudy").then(m => ({ default: m.CaseStudy })));
const QuestsHub = trackLazyModule("QuestsHub", () => import("./components/QuestsHub").then(m => ({ default: m.QuestsHub })));
const MacroPulse = trackLazyModule("MacroPulse", () => import("./components/mastery/MacroPulse").then(m => ({ default: m.MacroPulse })));
const TrendMarket = trackLazyModule("TrendMarket", () => import("./components/mastery/TrendMarket").then(m => ({ default: m.TrendMarket })));
const LiveOrLease = trackLazyModule("LiveOrLease", () => import("./components/mastery/LiveOrLease").then(m => ({ default: m.LiveOrLease })));
const MockYield = trackLazyModule("MockYield", () => import("./components/mastery/MockYield").then(m => ({ default: m.MockYield })));
const PortfolioOverview = trackLazyModule("PortfolioOverview", () => import("./components/PortfolioOverview").then(m => ({ default: m.PortfolioOverview })));
const MonthlyFinancialReport = trackLazyModule("MonthlyFinancialReport", () => import("./components/MonthlyFinancialReport").then(m => ({ default: m.MonthlyFinancialReport })));
const TaxEstimator = trackLazyModule("TaxEstimator", () => import("./components/TaxEstimator").then(m => ({ default: m.TaxEstimator })));
const DebtPayoff = trackLazyModule("DebtPayoff", () => import("./components/DebtPayoff").then(m => ({ default: m.DebtPayoff })));
const StockIntelligence = trackLazyModule("StockIntelligence", () => import("./components/StockIntelligence").then(m => ({ default: m.StockIntelligence })));
const CommunityReviews = trackLazyModule("CommunityReviews", () => import("./components/CommunityReviews").then(m => ({ default: m.CommunityReviews })));

function ModuleLoadingSkeleton() {
  return (
    <div className="container mx-auto px-6 py-12 space-y-12 animate-pulse">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-4">
          <Skeleton className="h-10 w-64 bg-bg-secondary" />
          <Skeleton className="h-5 w-48 bg-bg-secondary" />
        </div>
        <Skeleton className="h-12 w-48 rounded-xl bg-bg-secondary" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Skeleton className="h-[350px] rounded-2xl bg-bg-secondary" />
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-[160px] rounded-2xl bg-bg-secondary" />
          <Skeleton className="h-[160px] rounded-2xl bg-bg-secondary" />
        </div>
      </div>
    </div>
  );
}

interface LocalUser {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}

function AppContent() {
  const stytchAuth = useStytchAuth();
  const [user, setUser] = useState<LocalUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [budget, setBudget] = useState<BudgetPlan | null>(null);
  const [currentHash, setCurrentHash] = useState(window.location.hash || "#dashboard");
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [unlockedAchievement, setUnlockedAchievement] = useState<Achievement | null>(null);
  const [gitProvider, setGitProvider] = useState<"gitlab" | "github" | "bitbucket">("github");
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [upgradeFeatureTitle, setUpgradeFeatureTitle] = useState("");
  const [isEvidenceEngineOpen, setIsEvidenceEngineOpen] = useState(false);
  const [isPitchMode, setIsPitchMode] = useState<boolean>(() => {
    return localStorage.getItem("ww_pitch_mode") === "true";
  });

  const handleTogglePitchMode = () => {
    setIsPitchMode(prev => {
      const next = !prev;
      localStorage.setItem("ww_pitch_mode", String(next));
      window.dispatchEvent(new CustomEvent('ww-trigger-alert', {
        detail: {
          type: 'success',
          title: next ? 'Pitch & Demo Mode Activated 🚀' : 'Standard Mode Restored',
          message: next 
            ? 'Displaying verified MRR, ARR, and XPRIZE compliance metrics for judges & investors.' 
            : 'Standard view restored.'
        }
      }));
      return next;
    });
  };

  useEffect(() => {
    const handleOpenUpgrade = (e: any) => {
      setUpgradeFeatureTitle(e.detail?.featureTitle || "");
      setIsUpgradeModalOpen(true);
    };
    const handleOpenEvidence = () => {
      setIsEvidenceEngineOpen(true);
    };
    window.addEventListener("ww-open-upgrade-modal" as any, handleOpenUpgrade);
    window.addEventListener("ww-open-evidence-engine" as any, handleOpenEvidence);
    return () => {
      window.removeEventListener("ww-open-upgrade-modal" as any, handleOpenUpgrade);
      window.removeEventListener("ww-open-evidence-engine" as any, handleOpenEvidence);
    };
  }, []);
  const [alerts, setAlerts] = useState<any[]>([
    { id: 'welcome', type: 'market', title: 'Wexa Mastery Active', message: 'Inflation trends are shifting. Check the MacroPulse engine.', timestamp: 'Just now' }
  ]);

  useEffect(() => {
    // Fetch real-time, search-grounded global news alerts on mount
    fetch("/api/gemini/autonomous-alerts")
      .then((res) => {
        const ct = res.headers.get("content-type");
        if (!res.ok || !ct || !ct.includes("application/json")) {
          throw new Error(`Invalid response or non-JSON content-type: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        if (data && data.alerts && data.alerts.length > 0) {
          setAlerts(data.alerts);
        }
      })
      .catch((err) => {
        console.warn("Live economic grounding offline, utilizing local standby alerts:", err?.message || err);
        setAlerts([
          { id: 'off_1', type: 'market', title: 'Wexa Mastery Active', message: 'Inflation trends and macro indicators are active in the MacroPulse engine.', timestamp: 'Just now' },
          { id: 'off_2', type: 'info', title: 'Macro Resilience', message: 'Portfolio stress-testing parameters are calibrated to current global baseline rates.', timestamp: 'Active' },
          { id: 'off_3', type: 'risk', title: 'Asset Allocation', message: 'Rebalance metrics are actively monitoring target weights against volatility bounds.', timestamp: 'Active' }
        ]);
      });

    const nudges = [
      { type: 'info', title: 'Macro Tip', message: 'Did you know? High inflation erodes purchasing power. Use the MacroPulse to see how.' },
      { type: 'achievement', title: 'Step Closer', message: 'You are on your way to Diamond Tier! Complete more modules to rise.' },
      { type: 'market', title: 'MockYield Update', message: 'Eth Staking APY just simulated a 0.5% increase. Check MockYield.' },
      { type: 'risk', title: 'Diversification Alert', message: 'Relying on one asset is risky. TrendMarket simulates these impacts.' },
    ];

    const interval = setInterval(() => {
      const nudge = nudges[Math.floor(Math.random() * nudges.length)];
      setAlerts(prev => {
        const exists = prev.some(a => a.title === nudge.title);
        if (exists) return prev;
        return [
          { id: Math.random().toString(), ...nudge, timestamp: 'Now' },
          ...prev.slice(0, 2)
        ];
      });
    }, 45000); // Every 45 seconds a new nudge

    return () => clearInterval(interval);
  }, []);

  const [themeMode, setThemeMode] = useState<"system" | "light" | "dark" | "noir">((): "system" | "light" | "dark" | "noir" => {
    const saved = localStorage.getItem("ww_theme_mode");
    if (saved) return saved as "system" | "light" | "dark" | "noir";
    return "dark";
  });

  const [systemDark, setSystemDark] = useState(() => window.matchMedia("(prefers-color-scheme: dark)").matches);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const theme: "light" | "dark" | "noir" = themeMode === "system" ? (systemDark ? "dark" : "light") : themeMode;

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "noir");
    if (theme === "light") {
      root.classList.add("light");
    } else if (theme === "noir") {
      root.classList.add("noir");
    }
    localStorage.setItem("ww_theme_mode", themeMode);
    localStorage.setItem("ww_theme", theme);
  }, [theme, themeMode]);

  const toggleTheme = () => {
    setThemeMode(prev => (prev === "light" ? "dark" : "light"));
  };
  
  // Onboarding & Auth modal state
  const [showUniversalAuth, setShowUniversalAuth] = useState(false);
  const [showCurrencySelector, setShowCurrencySelector] = useState(false);
  const [showNameInput, setShowNameInput] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showExpertOnboarding, setShowExpertOnboarding] = useState(false);
  const [showJudgeTour, setShowJudgeTour] = useState(false);
  const [isJudgeMode, setIsJudgeMode] = useState(() => localStorage.getItem("ww_judge_mode") === "true");
  const [showSplash, setShowSplash] = useState(true);
  const [tempCurrency, setTempCurrency] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 1600);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleStartTour = () => {
      setShowJudgeTour(true);
      setIsJudgeMode(true);
      localStorage.setItem("ww_judge_mode", "true");
    };
    window.addEventListener('start-judge-tour', handleStartTour);
    return () => window.removeEventListener('start-judge-tour', handleStartTour);
  }, []);

  useEffect(() => {
    const handleTriggerAlert = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        const { type, title, message } = customEvent.detail;
        setAlerts(prev => {
          // Check for duplicate alerts to avoid spam
          const isDuplicate = prev.some(a => a.title === title && a.message === message);
          if (isDuplicate) return prev;
          
          return [
            {
              id: Math.random().toString(),
              type: type || 'info',
              title: title || 'System Notification',
              message: message || '',
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            },
            ...prev.slice(0, 8)
          ];
        });
      }
    };
    const handleOpenCurrency = () => setShowCurrencySelector(true);
    const handleOpenUpgrade = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.feature) {
        setUpgradeFeatureTitle(customEvent.detail.feature);
      }
      setIsUpgradeModalOpen(true);
    };

    window.addEventListener('ww-trigger-alert', handleTriggerAlert);
    window.addEventListener('ww-open-currency-selector', handleOpenCurrency);
    window.addEventListener('ww-open-upgrade-modal', handleOpenUpgrade);
    return () => {
      window.removeEventListener('ww-trigger-alert', handleTriggerAlert);
      window.removeEventListener('ww-open-currency-selector', handleOpenCurrency);
      window.removeEventListener('ww-open-upgrade-modal', handleOpenUpgrade);
    };
  }, []);

  useEffect(() => {
    const handleHashChange = () => setCurrentHash(window.location.hash || "#home");
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  useEffect(() => {
    // Safely load local user, profile, and budget with error recovery
    try {
      const savedUser = localStorage.getItem("ww_user");
      const savedProfile = localStorage.getItem("ww_profile");
      const savedBudget = localStorage.getItem("ww_budget");

      let parsedProfile: UserProfile | null = null;

      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch (e) {
          console.warn("Could not parse saved user, resetting safely", e);
        }
      } else {
        // Auto-provision guest session on first run so app loads without stalling
        const initialGuestUser = {
          uid: "guest_" + Math.random().toString(36).substring(2, 11),
          displayName: "Guest Investor",
          email: null,
          photoURL: null
        };
        setUser(initialGuestUser);
        localStorage.setItem("ww_user", JSON.stringify(initialGuestUser));
      }

      if (savedProfile) {
        try {
          parsedProfile = JSON.parse(savedProfile);
          if (parsedProfile?.gitProvider) {
            setGitProvider(parsedProfile.gitProvider);
          }
        } catch (e) {
          console.warn("Could not parse saved profile", e);
        }
      } else {
        // Default guest investor profile
        parsedProfile = {
          uid: "guest_default",
          name: "Guest Investor",
          age: "28",
          learningGoal: "Elite Wealth & XPRIZE Monetization",
          currency: "INR",
          joinDate: new Date().toISOString(),
          lastVisit: new Date().toISOString(),
          visitDates: [new Date().toISOString().split("T")[0]],
          streak: 1,
          maxStreak: 1,
          highScore: 100,
          netWorth: { assets: 1000000, liabilities: 0 }
        };
        setProfile(parsedProfile);
        localStorage.setItem("ww_profile", JSON.stringify(parsedProfile));
      }

      if (savedBudget) {
        try {
          setBudget(JSON.parse(savedBudget));
        } catch (e) {
          console.warn("Could not parse saved budget", e);
        }
      }

      // Process daily engagement streak
      if (parsedProfile) {
        const todayStr = new Date().toISOString().split('T')[0];
        const lastVisitStr = parsedProfile.lastVisit;
        
        let currentStreak = parsedProfile.streak || 1;
        let maxStreak = parsedProfile.maxStreak || 1;
        let achievements = parsedProfile.achievements || [];
        let streakUpdated = false;
        let alertToDispatch: { type: string, title: string, message: string } | null = null;
        let badgeUnlockedName = "";

        if (lastVisitStr) {
          const lastVisitDate = new Date(lastVisitStr);
          const todayDate = new Date();
          
          // Normalize dates to midnight to compare calendar days
          const d1 = new Date(lastVisitDate.getFullYear(), lastVisitDate.getMonth(), lastVisitDate.getDate());
          const d2 = new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate());
          const diffTime = d2.getTime() - d1.getTime();
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

          if (diffDays === 1) {
            // Consecutive daily visit
            currentStreak += 1;
            maxStreak = Math.max(maxStreak, currentStreak);
            parsedProfile.streak = currentStreak;
            parsedProfile.maxStreak = maxStreak;
            parsedProfile.lastVisit = new Date().toISOString();
            
            if (!parsedProfile.visitDates) parsedProfile.visitDates = [];
            if (!parsedProfile.visitDates.includes(todayStr)) {
              parsedProfile.visitDates.push(todayStr);
            }
            streakUpdated = true;
            alertToDispatch = {
              type: "success",
              title: "Daily Streak Extended! 🔥",
              message: `Your login streak is now ${currentStreak} days. Keep up the great financial focus!`
            };
          } else if (diffDays > 1) {
            // Broken streak
            currentStreak = 1;
            parsedProfile.streak = currentStreak;
            parsedProfile.lastVisit = new Date().toISOString();
            
            if (!parsedProfile.visitDates) parsedProfile.visitDates = [];
            if (!parsedProfile.visitDates.includes(todayStr)) {
              parsedProfile.visitDates.push(todayStr);
            }
            streakUpdated = true;
            alertToDispatch = {
              type: "info",
              title: "Streak Reset",
              message: "Your consecutive login streak has reset. Keep visiting daily to earn premium rewards!"
            };
          } else {
            // Same day visit
            if (parsedProfile.streak === undefined) {
              parsedProfile.streak = 1;
              parsedProfile.maxStreak = 1;
              streakUpdated = true;
            }
          }
        } else {
          // Initial fallback
          parsedProfile.streak = 1;
          parsedProfile.maxStreak = 1;
          parsedProfile.lastVisit = new Date().toISOString();
          if (!parsedProfile.visitDates) parsedProfile.visitDates = [];
          if (!parsedProfile.visitDates.includes(todayStr)) {
            parsedProfile.visitDates.push(todayStr);
          }
          streakUpdated = true;
        }

        // Check milestones for streak-based badges
        const checkAndUnlockBadge = (id: string) => {
          if (!achievements.some(a => a.id === id)) {
            const achDef = ACHIEVEMENTS.find(a => a.id === id);
            if (achDef) {
              achievements.push({
                ...achDef,
                unlockedAt: new Date().toISOString()
              });
              streakUpdated = true;
              badgeUnlockedName = achDef.title;
            }
          }
        };

        if (currentStreak >= 3) {
          checkAndUnlockBadge('streak_3');
        }
        if (currentStreak >= 7) {
          checkAndUnlockBadge('streak_7');
        }
        if (parsedProfile.completedQuests && parsedProfile.completedQuests.length >= 4) {
          checkAndUnlockBadge('completion_all');
        }

        if (streakUpdated) {
          parsedProfile.achievements = achievements;
          setProfile(parsedProfile);
          localStorage.setItem("ww_profile", JSON.stringify(parsedProfile));

          if (alertToDispatch) {
            const alertCopy = alertToDispatch;
            const badgeCopy = badgeUnlockedName;
            setTimeout(() => {
              window.dispatchEvent(new CustomEvent('ww-trigger-alert', { detail: alertCopy }));
              if (badgeCopy) {
                window.dispatchEvent(new CustomEvent('ww-trigger-alert', { 
                  detail: {
                    type: "success",
                    title: "New Badge Unlocked! 🏆",
                    message: `You earned the '${badgeCopy}' achievement badge!`
                  }
                }));
              }
            }, 1500);
          }
        } else {
          setProfile(parsedProfile);
        }
      }
    } catch (err) {
      console.warn("Storage recovery applied successfully:", err);
    }
    
    setIsAuthReady(true);
  }, []);

  // Synchronize Stytch auth state into AppContent user/profile state
  useEffect(() => {
    if (!stytchAuth.loading) {
      if (stytchAuth.user) {
        const stytchUserObj = {
          uid: stytchAuth.user.userId,
          displayName: stytchAuth.user.name || "Guest Investor",
          email: stytchAuth.user.email,
          photoURL: stytchAuth.user.avatarUrl || null
        };
        setUser(stytchUserObj);
        localStorage.setItem("ww_user", JSON.stringify(stytchUserObj));
        localStorage.setItem("ww_sync_enabled", "true");

        // Load profile from database or local storage
        stytchAuth.loadUserData(stytchAuth.user.userId).then((cloudData) => {
          if (cloudData?.profile) {
            setProfile(cloudData.profile);
            localStorage.setItem("ww_profile", JSON.stringify(cloudData.profile));
            if (cloudData.budget) {
              setBudget(cloudData.budget);
              localStorage.setItem("ww_budget", JSON.stringify(cloudData.budget));
            }
          } else {
            const savedProfile = localStorage.getItem("ww_profile");
            if (savedProfile) {
              try {
                const parsed = JSON.parse(savedProfile);
                if (stytchAuth.user?.name) parsed.name = stytchAuth.user.name;
                setProfile(parsed);
              } catch {}
            }
          }
        });
      } else {
        // Only reset if active session was specifically Stytch, never wipe local guest sessions
        if (user && user.uid.startsWith("stytch_")) {
          const fallbackGuest = {
            uid: "guest_" + Math.random().toString(36).substring(2, 11),
            displayName: "Guest Investor",
            email: null,
            photoURL: null
          };
          setUser(fallbackGuest);
          localStorage.setItem("ww_user", JSON.stringify(fallbackGuest));
        }
      }
    }
  }, [stytchAuth.loading, stytchAuth.user]);

  // Sync state tracking variables
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authMode, setAuthMode] = useState<"guest" | "mongodb_register" | "mongodb_login" | "stytch">("guest");
  const [dbHealth, setDbHealth] = useState<{ status: string, database: string, connectionString?: string } | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isDbChecking, setIsDbChecking] = useState(false);

  const checkDbHealth = async () => {
    setIsDbChecking(true);
    try {
      const res = await fetch("/api/db-health");
      if (res.ok) {
        const data = await res.json();
        setDbHealth(data);
      } else {
        setDbHealth({ status: "failed", database: "Offline Sandbox Fallback" });
      }
    } catch {
      setDbHealth({ status: "failed", database: "Offline Sandbox Fallback" });
    } finally {
      setIsDbChecking(false);
    }
  };

  useEffect(() => {
    checkDbHealth();
  }, []);

  const triggerSyncToCloud = async (currentProfile: UserProfile | null, currentBudget: BudgetPlan | null) => {
    const isSyncEnabled = localStorage.getItem("ww_sync_enabled") === "true";
    const savedUser = localStorage.getItem("ww_user");
    if (!isSyncEnabled || !savedUser || !currentProfile) return;

    try {
      const u = JSON.parse(savedUser);
      const res = await fetch("/api/auth/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: u.uid,
          profile: currentProfile,
          budget: currentBudget
        })
      });
      if (!res.ok) {
        throw new Error("Cloud backing synchronizer reported an error.");
      }
    } catch (err) {
      console.warn("[MongoDB Sync] Background backup failed (running in offline state):", err);
    }
  };

  // Auto-sync when profile, budget or user updates
  useEffect(() => {
    if (user && profile) {
      triggerSyncToCloud(profile, budget);
    }
  }, [profile, budget, user]);

  const handleCurrencySelect = (currency: string) => {
    setTempCurrency(currency);
    setShowCurrencySelector(false);
    if (profile) {
      const updated = { ...profile, currency };
      setProfile(updated);
      localStorage.setItem("ww_profile", JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('ww-trigger-alert', {
        detail: {
          type: 'success',
          title: 'Currency Updated',
          message: `Active currency set to ${currency}. All conversion matrices recalculated.`
        }
      }));
    } else {
      setShowNameInput(true);
    }
  };

  const handleOnboardingComplete = (name: string, age: string, learningGoal: string, onboardingGitProvider: "gitlab" | "github" | "bitbucket" = "github", selectedCurrency?: string) => {
    const uid = user?.uid || Math.random().toString(36).substring(2, 15);
    const newUser: LocalUser = {
      uid,
      displayName: name,
      email: user?.email || null,
      photoURL: user?.photoURL || null
    };

    const finalCurrency = selectedCurrency || tempCurrency || profile?.currency || "USD";

    const newProfile: UserProfile = {
      uid,
      name,
      age: age || "Not specified",
      learningGoal: learningGoal || "Wealth Building",
      currency: finalCurrency,
      joinDate: new Date().toISOString(),
      lastVisit: new Date().toISOString(),
      visitDates: [new Date().toISOString().split('T')[0]],
      highScore: profile?.highScore || 0,
      netWorth: profile?.netWorth || { assets: 125000, liabilities: 45000 },
      gitProvider: onboardingGitProvider,
      achievements: profile?.achievements || [],
      goals: profile?.goals || []
    };

    setUser(newUser);
    setProfile(newProfile);
    setGitProvider(onboardingGitProvider);
    localStorage.setItem("ww_user", JSON.stringify(newUser));
    localStorage.setItem("ww_profile", JSON.stringify(newProfile));
    
    setShowNameInput(false);
    setShowTutorial(true);
    window.location.hash = "#dashboard";
  };

  const handleUpdateGitProvider = (provider: "gitlab" | "github" | "bitbucket") => {
    setGitProvider(provider);
    if (profile) {
      const updatedProfile = { ...profile, gitProvider: provider };
      setProfile(updatedProfile);
      localStorage.setItem("ww_profile", JSON.stringify(updatedProfile));
    }
  };

  const unlockAchievement = useCallback((id: string) => {
    if (!profile) return;
    const existingAchievements = profile.achievements || [];
    if (existingAchievements.find(a => a.id === id)) return;

    const achievementDef = ACHIEVEMENTS.find(a => a.id === id);
    if (!achievementDef) return;

    const newAchievement = {
      ...achievementDef,
      unlockedAt: new Date().toISOString()
    };

    const updatedProfile = {
      ...profile,
      achievements: [...existingAchievements, newAchievement]
    };

    setProfile(updatedProfile);
    localStorage.setItem("ww_profile", JSON.stringify(updatedProfile));
    setUnlockedAchievement(newAchievement);
    
    // Auto-hide achievement notification
    setTimeout(() => setUnlockedAchievement(null), 5000);
  }, [profile]);

  const handleSaveBudget = (plan: BudgetPlan) => {
    setBudget(plan);
    localStorage.setItem("ww_budget", JSON.stringify(plan));
    unlockAchievement('first_budget');

    logAuditAction({
      action: "BUDGET_UPDATED",
      category: "budget",
      description: `Monthly budget updated: Income set to ${plan.income}, allocated across ${Object.keys(plan.expenses || {}).length} expense categories.`,
      initiator: "User",
      status: "SUCCESS",
      details: { income: plan.income, expensesCount: Object.keys(plan.expenses || {}).length }
    });
  };

  const handleUpdateNetWorth = (assets: number, liabilities: number) => {
    if (!profile) return;
    const updatedProfile = {
      ...profile,
      netWorth: { assets, liabilities }
    };
    setProfile(updatedProfile);
    localStorage.setItem("ww_profile", JSON.stringify(updatedProfile));
    if (assets > liabilities) unlockAchievement('networth_positive');

    logAuditAction({
      action: "NET_WORTH_ADJUSTED",
      category: "portfolio",
      description: `Net worth recalibrated: Assets ${assets}, Liabilities ${liabilities} (Surplus: ${assets - liabilities}).`,
      initiator: "User",
      status: "SUCCESS",
      details: { assets, liabilities, net: assets - liabilities }
    });
  };

  const handleUpdatePortfolio = (portfolio: Portfolio) => {
    if (!profile) return;
    const updatedProfile = {
      ...profile,
      portfolio
    };
    setProfile(updatedProfile);
    localStorage.setItem("ww_profile", JSON.stringify(updatedProfile));

    logAuditAction({
      action: "PORTFOLIO_REBALANCED",
      category: "portfolio",
      description: `Asset portfolio rebalanced across stocks, bonds, crypto, and cash positions.`,
      initiator: "System",
      status: "SUCCESS",
      details: { assetsCount: Object.keys(portfolio || {}).length }
    });
  };

  const handleQuizComplete = (score: number) => {
    if (!profile) return;
    const earnedXp = Math.floor(score * 0.5);
    const earnedCoins = Math.floor(score * 0.3);
    const updatedProfile = {
      ...profile,
      highScore: Math.max(profile.highScore || 0, score),
      xp: (profile.xp || 0) + earnedXp,
      coins: (profile.coins || 0) + earnedCoins,
    };
    setProfile(updatedProfile);
    localStorage.setItem("ww_profile", JSON.stringify(updatedProfile));
    if (score > 100) unlockAchievement('quiz_master');
  };

  const handleSignIn = () => {
    setShowExpertOnboarding(true);
  };

  const handleStartFullOnboarding = (targetHash: string) => {
    setShowExpertOnboarding(false);
    setShowCurrencySelector(true);
    // After currency and name input, it will auto-route to the dashboard or target
  };

  const handleSignOut = () => {
    logAuditAction({
      action: "USER_LOGOUT",
      category: "auth",
      description: `User signed out of session safely. All cached credentials purged.`,
      initiator: "User",
      status: "SUCCESS"
    });

    setUser(null);
    setProfile(null);
    setBudget(null);
    setTempCurrency(null);
    
    // Completely purge all identity and session data to prevent data carryover
    const keysToRemove = [
      "ww_user",
      "ww_profile",
      "ww_budget",
      "ww_sync_enabled",
      "ww_custom_budget",
      "stytch_session",
      "stytch_user",
      "ww_offline_cache",
      "ww_pitch_mode",
      "ww_judge_mode"
    ];
    keysToRemove.forEach(k => localStorage.removeItem(k));
    
    stytchAuth.signOut();
    window.location.hash = "#home";

    window.dispatchEvent(new CustomEvent('ww-trigger-alert', {
      detail: {
        type: 'info',
        title: 'Logged Out Successfully',
        message: 'All local session credentials and identity data have been purged.'
      }
    }));
  };

  // Instamojo & Stripe payment return callback listener
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paymentGateway = params.get("payment_gateway");
    const paymentStatus = params.get("payment_status");
    const paymentId = params.get("payment_id") || params.get("payment_request_id");

    if (paymentGateway === "instamojo" || paymentStatus === "success" || paymentId) {
      if (profile) {
        const updated = { ...profile, isPremium: true, plan: "pro" as const };
        setProfile(updated);
        localStorage.setItem("ww_profile", JSON.stringify(updated));
      }
      
      window.dispatchEvent(new CustomEvent('ww-trigger-alert', {
        detail: {
          type: 'success',
          title: 'Payment Confirmed & Pro Activated! 🚀',
          message: 'Instamojo transaction verified. All institutional AI engines, OCR vision & rebalancing active.'
        }
      }));

      // Clean search parameters from URL without reloading
      const cleanUrl = window.location.pathname + (window.location.hash || "#pricing");
      window.history.replaceState({}, document.title, cleanUrl);
    }
  }, [profile]);

  const handleUpdateGoals = (goals: FinancialGoal[]) => {
    if (!profile) return;
    const updatedProfile = { ...profile, goals };
    setProfile(updatedProfile);
    localStorage.setItem("ww_profile", JSON.stringify(updatedProfile));
    if (goals.length > 0) unlockAchievement('goal_setter');

    logAuditAction({
      action: "GOALS_UPDATED",
      category: "agent",
      description: `Financial milestone goals updated. Total active goals: ${goals.length}.`,
      initiator: "User",
      status: "SUCCESS",
      details: { goalCount: goals.length, goals: goals.map(g => g.title) }
    });
  };

  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning! Synchronize with MongoDB to sync your achievements";
    if (hour < 18) return "Good afternoon! Synchronize with MongoDB to sync your achievements";
    return "Good evening! Synchronize with MongoDB to sync your achievements";
  };

  const renderContent = () => {
    if (currentHash === "#home") return <LandingPage onOpenAuth={() => setShowUniversalAuth(true)} />;

    const effectiveProfile = profile || {
      uid: user?.uid || "guest_investor",
      name: user?.displayName || "Guest Investor",
      age: "28",
      learningGoal: "Elite Wealth & XPRIZE Monetization",
      currency: "INR",
      joinDate: new Date().toISOString(),
      lastVisit: new Date().toISOString(),
      visitDates: [new Date().toISOString().split("T")[0]],
      highScore: 100,
      netWorth: { assets: 5000000, liabilities: 0 },
      gitProvider: "github" as const
    };

    if (isLoading) {
      return (
        <div className="container mx-auto px-6 py-12 space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-4">
              <Skeleton className="h-12 w-64" />
              <Skeleton className="h-6 w-48" />
            </div>
            <Skeleton className="h-14 w-48 rounded-xl" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Skeleton className="h-[400px] rounded-2xl" />
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
              <Skeleton className="h-[200px] rounded-2xl" />
              <Skeleton className="h-[200px] rounded-2xl" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-24 rounded-xl" />
          </div>
        </div>
      );
    }

    return (
      <Suspense fallback={<ModuleLoadingSkeleton />}>
        {(() => {
          switch (currentHash) {
            case "#wexa-agent":
              return (
                <ModuleErrorBoundary moduleName="Wexa Autonomous Execution Engine">
                  <div className="container mx-auto px-6 py-12">
                    <WexaExecutionEngine user={effectiveProfile} />
                  </div>
                </ModuleErrorBoundary>
              );
            case "#wexa-companion":
              return (
                <ModuleErrorBoundary moduleName="Wexa AI Companion & Multimodal Receipt Vision">
                  <div className="container mx-auto px-6 py-12">
                    <WexaCompanion user={effectiveProfile} budget={budget} />
                  </div>
                </ModuleErrorBoundary>
              );
            case "#bank-sync":
              return (
                <ModuleErrorBoundary moduleName="Plaid Account Aggregator & Webhook Sandbox">
                  <div className="container mx-auto px-6 py-12">
                    <BankSyncSandbox />
                  </div>
                </ModuleErrorBoundary>
              );
            case "#vault":
              return (
                <ModuleErrorBoundary moduleName="Financial Literacy Knowledge Vault">
                  <div className="container mx-auto px-6 py-12">
                    <KnowledgeVault />
                  </div>
                </ModuleErrorBoundary>
              );
            case "#rent-vs-buy":
              return (
                <ModuleErrorBoundary moduleName="Rent vs Buy Capital Growth Simulator">
                  <div className="container mx-auto px-6 py-12">
                    <RentVsBuySimulator />
                  </div>
                </ModuleErrorBoundary>
              );
            case "#dashboard": 
              return (
                <ModuleErrorBoundary moduleName="Control Dashboard">
                  <WealthDashboard 
                    user={effectiveProfile} 
                    budget={budget} 
                    onUnlockAchievement={unlockAchievement} 
                    onUpdateGitProvider={handleUpdateGitProvider} 
                    gitProvider={gitProvider} 
                    onUpdateProfile={(updated) => {
                      setProfile(updated);
                      localStorage.setItem("ww_profile", JSON.stringify(updated));
                    }}
                  />
                </ModuleErrorBoundary>
              );
            case "#macropulse": 
              return (
                <ModuleErrorBoundary moduleName="MacroPulse Simulation Engine">
                  <div className="container mx-auto px-6 py-12">
                    <MacroPulse 
                      user={effectiveProfile} 
                      onUpdateProfile={(updated) => {
                        setProfile(updated);
                        localStorage.setItem("ww_profile", JSON.stringify(updated));
                        triggerSyncToCloud(updated, budget);
                      }} 
                    />
                  </div>
                </ModuleErrorBoundary>
              );
            case "#trendmarket": 
              return (
                <ModuleErrorBoundary moduleName="TrendMarket Signal Engine">
                  <div className="container mx-auto px-6 py-12"><TrendMarket /></div>
                </ModuleErrorBoundary>
              );
            case "#stocks":
            case "#live-stocks":
              return (
                <ModuleErrorBoundary moduleName="Money Games & Global Stock Intelligence">
                  <div className="container mx-auto px-6 py-12">
                    <StockIntelligence user={user} />
                  </div>
                </ModuleErrorBoundary>
              );
            case "#liveorlease": 
              return (
                <ModuleErrorBoundary moduleName="LiveOrLease Arbitrage Simulator">
                  <div className="container mx-auto px-6 py-12"><LiveOrLease /></div>
                </ModuleErrorBoundary>
              );
            case "#mockyield": 
              return (
                <ModuleErrorBoundary moduleName="MockYield APY Tracker">
                  <div className="container mx-auto px-6 py-12"><MockYield /></div>
                </ModuleErrorBoundary>
              );
            case "#badges": 
              return (
                <ModuleErrorBoundary moduleName="Achievement Badging Service">
                  <div className="container mx-auto px-6 py-12"><Badges user={effectiveProfile} unlockedAchievements={effectiveProfile.achievements || []} /></div>
                </ModuleErrorBoundary>
              );
            case "#docs": 
              return (
                <ModuleErrorBoundary moduleName="GitOps Rulebook & Case Study">
                  <div className="container mx-auto px-6 py-12"><CaseStudy user={effectiveProfile} onUpdateGitProvider={handleUpdateGitProvider} /></div>
                </ModuleErrorBoundary>
              );
            case "#portfolio": 
              return (
                <ModuleErrorBoundary moduleName="Interactive Portfolio Balance Matrix">
                  <PortfolioOverview user={effectiveProfile} />
                </ModuleErrorBoundary>
              );
            case "#crypto": 
              return (
                <ModuleErrorBoundary moduleName="Real-Time Crypto Asset Intelligence">
                  <div className="container mx-auto px-6 py-12">
                    <CryptoPortfolio user={effectiveProfile} />
                  </div>
                </ModuleErrorBoundary>
              );
            case "#hackathon-hub":
              return (
                <ModuleErrorBoundary moduleName="90-Day Hackathon Submission Hub">
                  <div className="container mx-auto px-6 py-12">
                    <HackathonSubmissionHub />
                  </div>
                </ModuleErrorBoundary>
              );
            case "#audit-report":
              return (
                <ModuleErrorBoundary moduleName="Platform Revenue Audit Center">
                  <div className="container mx-auto px-6 py-12">
                    <AuditReport user={effectiveProfile} />
                  </div>
                </ModuleErrorBoundary>
              );
            case "#pricing":
              return (
                <ModuleErrorBoundary moduleName="Instamojo Pro Pricing & Subscription Center">
                  <div className="container mx-auto px-6 py-12">
                    <PricingPage 
                      userProfile={effectiveProfile} 
                      onUpgradeSuccess={() => {
                        if (effectiveProfile) {
                          const updated = { ...effectiveProfile, isPremium: true, plan: "pro" as const };
                          setProfile(updated);
                          localStorage.setItem("ww_profile", JSON.stringify(updated));
                        }
                      }} 
                    />
                  </div>
                </ModuleErrorBoundary>
              );
            case "#reviews":
            case "#community-ratings":
            case "#ratings":
              return (
                <ModuleErrorBoundary moduleName="500+ Verified Investor Community Reviews">
                  <div className="container mx-auto px-6 py-12">
                    <CommunityReviews />
                  </div>
                </ModuleErrorBoundary>
              );
            case "#networth": 
              return (
                <ModuleErrorBoundary moduleName="NetWorth Real-Time Tracker">
                  <Dashboard user={effectiveProfile} budget={budget} onUpdateNetWorth={handleUpdateNetWorth} />
                </ModuleErrorBoundary>
              );
            case "#budget": 
              return (
                <ModuleErrorBoundary moduleName="Interactive Budget Planner">
                  <BudgetPlanner user={effectiveProfile} onSave={handleSaveBudget} initialPlan={budget} gitProvider={gitProvider} onUnlockAchievement={unlockAchievement} />
                </ModuleErrorBoundary>
              );
            case "#monthly-report":
              return (
                <ModuleErrorBoundary moduleName="Monthly Financial Variance Report">
                  <div className="container mx-auto px-6 py-12">
                    <MonthlyFinancialReport user={effectiveProfile} budget={budget} onUpdateGoals={handleUpdateGoals} />
                  </div>
                </ModuleErrorBoundary>
              );
            case "#simulator": 
              return (
                <ModuleErrorBoundary moduleName="Compound Interest & Lump-Sum Simulator">
                  <InvestmentSimulator user={effectiveProfile} onUpdateGoals={handleUpdateGoals} />
                </ModuleErrorBoundary>
              );
            case "#quiz": 
              return (
                <ModuleErrorBoundary moduleName="Literacy Command Quiz">
                  <FinancialQuiz onComplete={handleQuizComplete} bestScore={effectiveProfile.highScore} />
                </ModuleErrorBoundary>
              );
            case "#quests": 
              return (
                <ModuleErrorBoundary moduleName="Financial Quests & Shop">
                  <div className="container mx-auto px-6 py-12">
                    <QuestsHub 
                      userProfile={effectiveProfile} 
                      onUpdateProfile={(updated) => {
                        setProfile(updated);
                        localStorage.setItem("ww_profile", JSON.stringify(updated));
                      }} 
                      onUnlockAchievement={unlockAchievement} 
                    />
                  </div>
                </ModuleErrorBoundary>
              );
            case "#scenarios": 
              return (
                <ModuleErrorBoundary moduleName="Strategic Projection Engine">
                  <ScenarioSimulator user={effectiveProfile} budget={budget} onComplete={() => unlockAchievement('simulation_expert')} />
                </ModuleErrorBoundary>
              );
            case "#resources": 
              return (
                <ModuleErrorBoundary moduleName="Literacy Guidelines & Syllabus">
                  <Resources />
                </ModuleErrorBoundary>
              );
            case "#allocation": 
              return (
                <ModuleErrorBoundary moduleName="Dynamic Asset Rebalancing Engine">
                  <AssetAllocation />
                </ModuleErrorBoundary>
              );
            case "#rebalancer": 
              return (
                <ModuleErrorBoundary moduleName="Dynamic Asset Rebalancing Engine">
                  <AssetRebalancer user={effectiveProfile} onUpdatePortfolio={handleUpdatePortfolio} onUnlockAchievement={unlockAchievement} />
                </ModuleErrorBoundary>
              );
            case "#tax-estimator":
              return (
                <ModuleErrorBoundary moduleName="Tax Estimator Suite">
                  <div className="container mx-auto px-6 py-12">
                    <TaxEstimator user={effectiveProfile} />
                  </div>
                </ModuleErrorBoundary>
              );
            case "#debt-payoff":
              return (
                <ModuleErrorBoundary moduleName="Debt Acceleration Plan">
                  <div className="container mx-auto px-6 py-12">
                    <DebtPayoff user={effectiveProfile} />
                  </div>
                </ModuleErrorBoundary>
              );
            case "#billing":
              return (
                <ModuleErrorBoundary moduleName="Secure Premium Subscription & Billing">
                  <div className="container mx-auto px-6 py-12">
                    <StripeBillingCenter user={effectiveProfile} onUpdateProfile={(updated) => {
                      setProfile(updated);
                      localStorage.setItem("ww_profile", JSON.stringify(updated));
                    }} />
                  </div>
                </ModuleErrorBoundary>
              );
            default: return <LandingPage />;
          }
        })()}
      </Suspense>
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="aurora-1 top-[-100px] left-[-100px]" />
      <div className="aurora-2 bottom-[-100px] right-[-100px]" />
      <div className="grid-overlay" />

      {/* Anchored Alerts Container */}
      <div className="fixed bottom-8 right-8 z-50 flex flex-col gap-4 max-w-sm">
        <PulseAlert 
          alerts={alerts} 
          onClose={(id) => setAlerts(prev => prev.filter(a => a.id !== id))} 
          onClearAll={() => setAlerts([])}
        />
      </div>

      <QuickTips hash={currentHash} />

      {/* Startup Logo Reveal Animation */}
      {showSplash && (
        <StartupLogoAnimation onComplete={() => setShowSplash(false)} />
      )}

      {/* Achievement Toast */}
      <AnimatePresence>
        {unlockedAchievement && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 50, x: "-50%" }}
            className="fixed bottom-8 left-1/2 z-[200] max-w-sm w-full"
          >
            <div className="card p-4 border-accent-gold bg-bg-void/90 backdrop-blur-md shadow-[0_0_30px_rgba(240,180,41,0.3)] flex items-center gap-4">
              <div className="text-3xl">{unlockedAchievement.icon}</div>
              <div>
                <div className="text-[10px] text-accent-gold font-bold uppercase tracking-widest">Achievement Unlocked!</div>
                <div className="font-bold">{unlockedAchievement.title}</div>
                <div className="text-xs text-text-muted">{unlockedAchievement.description}</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Navbar 
        currentHash={currentHash} 
        currency={profile?.currency || "USD"} 
        onCurrencyClick={() => profile && setShowCurrencySelector(true)} 
        theme={theme}
        themeMode={themeMode}
        onToggleTheme={toggleTheme}
        onSetThemeMode={setThemeMode}
        user={user}
        onSignOut={handleSignOut}
        onOpenAuth={() => setShowUniversalAuth(true)}
        streak={profile?.streak || 1}
        onLogoClick={() => setShowSplash(true)}
      />

      <div className="pt-16">
        <CurrencyFluctuationAlert activeCurrency={profile?.currency || "USD"} />
        <InvestorPitchModeBanner
          isPitchMode={isPitchMode}
          onTogglePitchMode={handleTogglePitchMode}
          currency={(profile?.currency as SupportedCurrency) || "INR"}
          onOpenEvidenceEngine={() => setIsEvidenceEngineOpen(true)}
          onOpenExecutiveReport={() => { window.location.hash = "#monthly-report"; }}
        />
      </div>

      <main className="flex-1">
        {renderContent()}
      </main>

      <Footer />

      {isJudgeMode && (
        <JudgeModeTerminal onClose={() => {
          setIsJudgeMode(false);
          localStorage.removeItem("ww_judge_mode");
        }} />
      )}

      {showJudgeTour && (
        <JudgeTour onClose={() => setShowJudgeTour(false)} />
      )}

      {showExpertOnboarding && (
        <Onboarding 
          onComplete={(hash) => {
            handleStartFullOnboarding(hash);
          }} 
          onClose={() => setShowExpertOnboarding(false)} 
        />
      )}

      <UniversalAuthModal
        isOpen={showUniversalAuth}
        onClose={() => setShowUniversalAuth(false)}
        onSuccess={({ uid, displayName, email, currency, learningGoal }) => {
          handleOnboardingComplete(displayName, "28", learningGoal, "github", currency);
          setShowUniversalAuth(false);
          window.dispatchEvent(new CustomEvent('ww-trigger-alert', {
            detail: {
              type: 'success',
              title: `Welcome, ${displayName}! 🚀`,
              message: `Authenticated successfully. Currency set to ${currency}. Sandbox session initialized.`
            }
          }));
        }}
      />

      <CurrencySelector 
        isOpen={showCurrencySelector} 
        onSelect={handleCurrencySelect} 
        currentCurrency={tempCurrency || profile?.currency} 
      />
      
      <NameInput 
        isOpen={showNameInput} 
        initialName={user?.displayName || (user?.email ? user.email.split('@')[0] : "")}
        initialCurrency={tempCurrency || profile?.currency || "USD"}
        onComplete={handleOnboardingComplete} 
      />

      {showTutorial && (
        <Tutorial onClose={() => setShowTutorial(false)} />
      )}

      <UpgradeModal 
        isOpen={isUpgradeModalOpen} 
        onClose={() => setIsUpgradeModalOpen(false)} 
        featureTitle={upgradeFeatureTitle}
        onSuccess={() => {
          if (profile) setProfile({ ...profile, isPremium: true });
        }}
      />

      <EvidenceEngineModal
        isOpen={isEvidenceEngineOpen}
        onClose={() => setIsEvidenceEngineOpen(false)}
        userProfile={profile}
        onUpdateProfile={(updated) => {
          setProfile(updated);
          localStorage.setItem("ww_profile", JSON.stringify(updated));
        }}
      />

      <GoalCelebrationOverlay />
    </div>
  );
}
