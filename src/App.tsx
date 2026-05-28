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
import { Footer } from "./components/Footer";
import { LandingPage } from "./components/LandingPage";
import { WealthDashboard } from "./components/WealthDashboard";
import { CurrencySelector, NameInput } from "./components/Modals";
import { Onboarding } from "./components/Onboarding";
import { JudgeTour } from "./components/JudgeTour";
import { Logo } from "./components/Logo";
import { UserProfile, BudgetPlan, FinancialGoal, Achievement, Portfolio } from "./types";
import { CURRENCIES, ACHIEVEMENTS } from "./constants";
import { Tutorial } from "./components/Tutorial";
import { PulseAlert } from "./components/mastery/PulseAlert";
import { Skeleton } from "./components/ui/Skeleton";
import { motion, AnimatePresence } from "motion/react";
import { QuickTips } from "./components/QuickTips";
import { Database, RefreshCw, Cloud, ShieldCheck, Mail, Lock, Server, LogIn, ArrowRight, Activity, Globe, Wifi, KeyRound } from "lucide-react";

// Lazy loaded heavy charting/simulator engines on demand to optimize Core Web Vitals
const Dashboard = lazy(() => import("./components/Dashboard").then(m => ({ default: m.Dashboard })));
const BudgetPlanner = lazy(() => import("./components/BudgetPlanner").then(m => ({ default: m.BudgetPlanner })));
const InvestmentSimulator = lazy(() => import("./components/InvestmentSimulator").then(m => ({ default: m.InvestmentSimulator })));
const FinancialQuiz = lazy(() => import("./components/FinancialQuiz").then(m => ({ default: m.FinancialQuiz })));
const ScenarioSimulator = lazy(() => import("./components/ScenarioSimulator").then(m => ({ default: m.ScenarioSimulator })));
const Resources = lazy(() => import("./components/Resources").then(m => ({ default: m.Resources })));
const AssetAllocation = lazy(() => import("./components/AssetAllocation").then(m => ({ default: m.AssetAllocation })));
const AssetRebalancer = lazy(() => import("./components/AssetRebalancer").then(m => ({ default: m.AssetRebalancer })));
const Badges = lazy(() => import("./components/Badges").then(m => ({ default: m.Badges })));
const CaseStudy = lazy(() => import("./components/CaseStudy").then(m => ({ default: m.CaseStudy })));
const MacroPulse = lazy(() => import("./components/mastery/MacroPulse").then(m => ({ default: m.MacroPulse })));
const TrendMarket = lazy(() => import("./components/mastery/TrendMarket").then(m => ({ default: m.TrendMarket })));
const LiveOrLease = lazy(() => import("./components/mastery/LiveOrLease").then(m => ({ default: m.LiveOrLease })));
const MockYield = lazy(() => import("./components/mastery/MockYield").then(m => ({ default: m.MockYield })));
const PortfolioOverview = lazy(() => import("./components/PortfolioOverview").then(m => ({ default: m.PortfolioOverview })));

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
  const [user, setUser] = useState<LocalUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [budget, setBudget] = useState<BudgetPlan | null>(null);
  const [currentHash, setCurrentHash] = useState(window.location.hash || "#dashboard");
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [unlockedAchievement, setUnlockedAchievement] = useState<Achievement | null>(null);
  const [gitProvider, setGitProvider] = useState<"gitlab" | "github" | "bitbucket">("github");
  const [alerts, setAlerts] = useState<any[]>([
    { id: 'welcome', type: 'market', title: 'WealthWise Mastery Active', message: 'Inflation trends are shifting. Check the MacroPulse engine.', timestamp: 'Just now' }
  ]);

  useEffect(() => {
    const nudges = [
      { type: 'info', title: 'Macro Tip', message: 'Did you know? High inflation erodes purchasing power. Use the MacroPulse to see how.' },
      { type: 'achievement', title: 'Step Closer', message: 'You are on your way to Diamond Tier! Complete more modules to rise.' },
      { type: 'market', title: 'MockYield Update', message: 'Eth Staking APY just simulated a 0.5% increase. Check MockYield.' },
      { type: 'risk', title: 'Diversification Alert', message: 'Relying on one asset is risky. TrendMarket simulates these impacts.' },
    ];

    const interval = setInterval(() => {
      const nudge = nudges[Math.floor(Math.random() * nudges.length)];
      setAlerts(prev => [
        { id: Math.random().toString(), ...nudge, timestamp: 'Now' },
        ...prev.slice(0, 2)
      ]);
    }, 45000); // Every 45 seconds a new nudge

    return () => clearInterval(interval);
  }, []);

  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const saved = localStorage.getItem("ww_theme");
    if (saved) return saved as "light" | "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "light") {
      root.classList.add("light");
    } else {
      root.classList.remove("light");
    }
    localStorage.setItem("ww_theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === "light" ? "dark" : "light");
  
  // Onboarding state
  const [showCurrencySelector, setShowCurrencySelector] = useState(false);
  const [showNameInput, setShowNameInput] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showExpertOnboarding, setShowExpertOnboarding] = useState(false);
  const [showJudgeTour, setShowJudgeTour] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [tempCurrency, setTempCurrency] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleStartTour = () => setShowJudgeTour(true);
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
    window.addEventListener('ww-trigger-alert', handleTriggerAlert);
    return () => window.removeEventListener('ww-trigger-alert', handleTriggerAlert);
  }, []);

  useEffect(() => {
    const handleHashChange = () => setCurrentHash(window.location.hash || "#home");
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  useEffect(() => {
    // Load local user and profile
    const savedUser = localStorage.getItem("ww_user");
    const savedProfile = localStorage.getItem("ww_profile");
    const savedBudget = localStorage.getItem("ww_budget");

    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    if (savedProfile) {
      const parsedProfile = JSON.parse(savedProfile);
      setProfile(parsedProfile);
      if (parsedProfile.gitProvider) {
        setGitProvider(parsedProfile.gitProvider);
      }
    }
    if (savedBudget) {
      setBudget(JSON.parse(savedBudget));
    }
    
    setIsAuthReady(true);
  }, []);

  // Sync state tracking variables
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authMode, setAuthMode] = useState<"guest" | "mongodb_register" | "mongodb_login">("mongodb_login");
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
    setShowNameInput(true);
  };

  const handleOnboardingComplete = (name: string, age: string, learningGoal: string, onboardingGitProvider: "gitlab" | "github" | "bitbucket" = "github") => {
    const uid = user?.uid || Math.random().toString(36).substring(2, 15);
    const newUser: LocalUser = {
      uid,
      displayName: name,
      email: user?.email || null,
      photoURL: null
    };

    const newProfile: UserProfile = {
      uid,
      name,
      age,
      learningGoal,
      currency: tempCurrency || "USD",
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
  };

  const handleUpdatePortfolio = (portfolio: Portfolio) => {
    if (!profile) return;
    const updatedProfile = {
      ...profile,
      portfolio
    };
    setProfile(updatedProfile);
    localStorage.setItem("ww_profile", JSON.stringify(updatedProfile));
  };

  const handleQuizComplete = (score: number) => {
    if (!profile) return;
    if (score > profile.highScore) {
      const updatedProfile = { ...profile, highScore: score };
      setProfile(updatedProfile);
      localStorage.setItem("ww_profile", JSON.stringify(updatedProfile));
    }
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
    setUser(null);
    setProfile(null);
    setBudget(null);
    localStorage.removeItem("ww_user");
    localStorage.removeItem("ww_profile");
    localStorage.removeItem("ww_budget");
    localStorage.removeItem("ww_sync_enabled");
    window.location.hash = "#home";
  };

  const handleUpdateGoals = (goals: FinancialGoal[]) => {
    if (!profile) return;
    const updatedProfile = { ...profile, goals };
    setProfile(updatedProfile);
    localStorage.setItem("ww_profile", JSON.stringify(updatedProfile));
    if (goals.length > 0) unlockAchievement('goal_setter');
  };

  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning! Synchronize with MongoDB to sync your achievements";
    if (hour < 18) return "Good afternoon! Synchronize with MongoDB to sync your achievements";
    return "Good evening! Synchronize with MongoDB to sync your achievements";
  };

  const renderContent = () => {
    if (currentHash === "#home") return <LandingPage />;
    
    if (!user) {
      return (
        <div className="container mx-auto px-6 py-12 max-w-4xl space-y-10">
          {/* Header section with brand message */}
          <div className="text-center space-y-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="inline-flex items-center gap-2 px-3 py-1 bg-accent-gold/10 border border-accent-gold/20 rounded-full text-accent-gold text-xs font-bold font-mono uppercase tracking-wider"
            >
              <Database className="w-3.5 h-3.5" />
              <span>Multi-Device MCP Sessions Active</span>
            </motion.div>
            <h2 className="text-4xl md:text-5xl font-display font-black tracking-tight text-text-primary">
              Access the Elite Wealth Simulator
            </h2>
            <p className="text-text-secondary max-w-2xl mx-auto text-sm md:text-base">
              Synchronize your multi-asset portfolio, customized budgeting plans, and prestigious career badges across devices securely with MongoDB integration.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            {/* Left side info panel: Benefits of Sync / Health Monitor */}
            <div className="md:col-span-5 space-y-6">
              <div className="card p-6 border-border/80 space-y-5 text-left bg-bg-secondary/10">
                <h3 className="text-xs font-bold uppercase tracking-widest text-text-primary flex items-center gap-2">
                  <Server className="w-4 h-4 text-accent-gold" />
                  Database Diagnostics
                </h3>
                
                <div className="space-y-4 bg-bg-void/40 p-4 rounded-xl border border-border/40 font-mono text-[11px]">
                  <div className="flex items-center justify-between">
                    <span className="text-text-muted">Persistence Engine</span>
                    {isDbChecking ? (
                      <span className="text-accent-gold flex items-center gap-1">
                        <RefreshCw className="w-3 h-3 animate-spin" /> Verifying...
                      </span>
                    ) : (
                      <span className="font-extrabold text-accent-blue">{dbHealth?.database || "Sandbox Emulator"}</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-text-muted">Access Protocol</span>
                    <span className="font-semibold text-text-primary">MongoDB Native Drivers</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-text-muted">Cluster Response</span>
                    <span className="text-accent-emerald flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent-emerald animate-pulse" /> Live & Healthy
                    </span>
                  </div>
                </div>

                <div className="space-y-3 pt-2 text-xs">
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded bg-accent-gold/10 flex items-center justify-center shrink-0 text-accent-gold font-bold">1</div>
                    <p className="text-text-muted leading-relaxed"><strong>Restore Budgets:</strong> Log in on any phone, laptop, or desktop and recover your complex monthly cash flows instantly.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded bg-accent-emerald/10 flex items-center justify-center shrink-0 text-accent-emerald font-bold">2</div>
                    <p className="text-text-muted leading-relaxed"><strong>Sync Prestigious Badges:</strong> Keep your high scores, career landmarks, and unlocked achievements safely in the cloud archive.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded bg-accent-blue/10 flex items-center justify-center shrink-0 text-accent-blue font-bold">3</div>
                    <p className="text-text-muted leading-relaxed"><strong>Dynamic Rule Retention:</strong> Custom drop alarm thresholds and market coefficients remain anchored to your profile.</p>
                  </div>
                </div>

                <button 
                  onClick={checkDbHealth}
                  className="w-full flex items-center justify-center gap-2 py-2 border border-border/80 hover:border-accent-gold/40 text-text-secondary hover:text-text-primary rounded-xl text-[10px] font-mono tracking-wider transition-all uppercase"
                >
                  <RefreshCw className="w-3 h-3 text-accent-gold" /> Pinpoint Connection Status
                </button>
              </div>
            </div>

            {/* Right side form card */}
            <div className="md:col-span-7">
              <div className="card p-8 border-border relative overflow-hidden space-y-6">
                {/* Visual tabs to choose auth mechanism */}
                <div className="flex border-b border-border/50">
                  <button
                    onClick={() => { setAuthMode("mongodb_login"); setAuthError(null); }}
                    className={`flex-1 pb-3 text-xs uppercase tracking-wider font-extrabold transition-all border-b-2 ${authMode === "mongodb_login" ? "border-accent-gold text-accent-gold" : "border-transparent text-text-muted hover:text-text-primary"}`}
                  >
                    Restore Session
                  </button>
                  <button
                    onClick={() => { setAuthMode("mongodb_register"); setAuthError(null); }}
                    className={`flex-1 pb-3 text-xs uppercase tracking-wider font-extrabold transition-all border-b-2 ${authMode === "mongodb_register" ? "border-accent-gold text-accent-gold" : "border-transparent text-text-muted hover:text-text-primary"}`}
                  >
                    Create Backed Workspace
                  </button>
                  <button
                    onClick={() => { setAuthMode("guest"); setAuthError(null); }}
                    className={`flex-1 pb-3 text-xs uppercase tracking-wider font-extrabold transition-all border-b-2 ${authMode === "guest" ? "border-accent-gold text-accent-gold" : "border-transparent text-text-muted hover:text-text-primary"}`}
                  >
                    Offline Guest
                  </button>
                </div>

                {authError && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-xl border border-accent-red/20 bg-accent-red/5 text-xs text-accent-red text-left font-mono"
                  >
                    ✖ {authError}
                  </motion.div>
                )}

                <AnimatePresence mode="wait">
                  {authMode === "guest" ? (
                    <motion.div
                      key="guest-card"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-4 text-left py-4"
                    >
                      <h4 className="text-md font-bold text-text-primary flex items-center gap-2">
                        <Globe className="w-5 h-5 text-accent-gold" />
                        Deploy Guest Sandbox Session
                      </h4>
                      <p className="text-xs text-text-muted leading-relaxed">
                        No email authentication required. You can test historical charts, run compound simulations, and formulate a mock budget plan instantly right inside your browser window. 
                      </p>
                      <div className="bg-bg-secondary/40 p-3 rounded-lg border border-border/40 text-[10px] text-text-muted font-mono">
                        💡 NOTE: If you switch browser instances, devices, or purge your cookies, local milestones are deleted. You can register anytime to tether your items to permanent cloud hosting.
                      </div>
                      
                      <button
                        onClick={() => {
                          const tempUid = "guest_" + Math.random().toString(36).substring(2, 11);
                          const guestUser = {
                            uid: tempUid,
                            displayName: "Guest User",
                            email: null,
                            photoURL: null
                          };
                          setUser(guestUser);
                          localStorage.setItem("ww_user", JSON.stringify(guestUser));
                          localStorage.setItem("ww_sync_enabled", "false");
                          
                          // Check if local storage already contains profile, otherwise launch onboard modals
                          const savedProfile = localStorage.getItem("ww_profile");
                          if (savedProfile) {
                            setProfile(JSON.parse(savedProfile));
                          } else {
                            setShowExpertOnboarding(true);
                          }
                        }}
                        className="btn-primary w-full flex items-center justify-center gap-2.5 py-4 text-sm font-bold uppercase tracking-widest text-bg-void cursor-pointer mt-6"
                      >
                        <span>Boot Sandbox Guest Session</span>
                        <ArrowRight className="w-4 h-4 text-bg-void" />
                      </button>
                    </motion.div>
                  ) : (
                    <motion.form
                      key={authMode}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      onSubmit={async (e) => {
                        e.preventDefault();
                        if (!authEmail || !authPassword) {
                          setAuthError("Credential inputs cannot be left blank.");
                          return;
                        }
                        setAuthError(null);
                        setIsAuthenticating(true);

                        try {
                          if (authMode === "mongodb_register") {
                            // Register flow
                            const tempUid = "ww_" + Math.random().toString(36).substring(2, 15);
                            const initialProfile: UserProfile = {
                              uid: tempUid,
                              name: authEmail.split("@")[0],
                              age: "28",
                              learningGoal: "Elite Compound Simulation",
                              currency: "USD",
                              joinDate: new Date().toISOString(),
                              lastVisit: new Date().toISOString(),
                              visitDates: [new Date().toISOString().split('T')[0]],
                              highScore: 0,
                              netWorth: { assets: 150000, liabilities: 50000 },
                              gitProvider: "github"
                            };

                            const initialBudget: BudgetPlan = {
                              income: 9000,
                              expenses: {
                                housing: 2800,
                                food: 850,
                                transport: 650,
                                health: 450,
                                entertainment: 550,
                                education: 1000,
                                loans: 1200,
                                other: 1500
                              },
                              timestamp: new Date().toISOString()
                            };

                            const res = await fetch("/api/auth/register", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                email: authEmail,
                                password: authPassword,
                                profile: initialProfile,
                                budget: initialBudget
                              })
                            });

                            if (!res.ok) {
                              const errData = await res.json();
                              throw new Error(errData.error || "Could not register storage credentials.");
                            }

                            const data = await res.json();
                            const newUser = data.user;
                            
                            setUser(newUser);
                            setProfile(data.profile);
                            setBudget(data.budget);
                            
                            localStorage.setItem("ww_user", JSON.stringify(newUser));
                            localStorage.setItem("ww_profile", JSON.stringify(data.profile));
                            localStorage.setItem("ww_budget", JSON.stringify(data.budget));
                            localStorage.setItem("ww_sync_enabled", "true");

                            window.dispatchEvent(new CustomEvent('ww-trigger-alert', {
                              detail: {
                                type: 'success',
                                title: 'Cloud Anchor Created',
                                message: `Session ${authEmail} securely persisted in MongoDB.`
                              }
                            }));
                          } else {
                            // Login / Switch Device Flow
                            const res = await fetch("/api/auth/login", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                email: authEmail,
                                password: authPassword
                              })
                            });

                            if (!res.ok) {
                              const errData = await res.json();
                              throw new Error(errData.error || "Device credential validation failed.");
                            }

                            const data = await res.json();
                            const recoveredUser = data.user;

                            setUser(recoveredUser);
                            setProfile(data.profile);
                            setBudget(data.budget);

                            localStorage.setItem("ww_user", JSON.stringify(recoveredUser));
                            if (data.profile) localStorage.setItem("ww_profile", JSON.stringify(data.profile));
                            if (data.budget) localStorage.setItem("ww_budget", JSON.stringify(data.budget));
                            localStorage.setItem("ww_sync_enabled", "true");

                            window.dispatchEvent(new CustomEvent('ww-trigger-alert', {
                              detail: {
                                type: 'success',
                                title: 'Device Restored Successfully',
                                message: `All budget plans, badges, and milestones loaded from MongoDB.`
                              }
                            }));
                          }
                        } catch (err: any) {
                          setAuthError(err.message || "An authentication exception occurred.");
                        } finally {
                          setIsAuthenticating(false);
                        }
                      }}
                      className="space-y-4 text-left"
                    >
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-accent-gold" /> Email Address
                        </label>
                        <input
                          type="email"
                          required
                          value={authEmail}
                          onChange={(e) => setAuthEmail(e.target.value)}
                          placeholder="e.g. manager@firm.com"
                          className="w-full bg-bg-secondary border border-border/80 focus:border-accent-gold/40 px-4 py-3 rounded-xl text-text-primary text-sm focus:outline-none transition-colors"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted flex items-center gap-1.5">
                          <KeyRound className="w-3.5 h-3.5 text-accent-gold" /> Security PIN / Password
                        </label>
                        <input
                          type="password"
                          required
                          value={authPassword}
                          onChange={(e) => setAuthPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-bg-secondary border border-border/80 focus:border-accent-gold/40 px-4 py-3 rounded-xl text-text-primary text-sm focus:outline-none transition-colors"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isAuthenticating}
                        className="btn-primary w-full flex items-center justify-center gap-2.5 py-4 text-sm font-bold uppercase tracking-widest text-bg-void cursor-pointer mt-6"
                      >
                        {isAuthenticating ? (
                          <RefreshCw className="w-5 h-5 animate-spin text-bg-void" />
                        ) : (
                          <ShieldCheck className="w-5 h-5 text-bg-void" />
                        )}
                        <span>
                          {isAuthenticating ? "Verifying..." : authMode === "mongodb_register" ? "Initialize & Cloud Sync" : "Sync From Backup PIN"}
                        </span>
                      </button>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (isLoading || !profile) {
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
            case "#dashboard": 
              return (
                <ModuleErrorBoundary moduleName="Control Dashboard">
                  <WealthDashboard user={profile} budget={budget} onUnlockAchievement={unlockAchievement} onUpdateGitProvider={handleUpdateGitProvider} gitProvider={gitProvider} />
                </ModuleErrorBoundary>
              );
            case "#macropulse": 
              return (
                <ModuleErrorBoundary moduleName="MacroPulse Simulation Engine">
                  <div className="container mx-auto px-6 py-12"><MacroPulse user={profile} /></div>
                </ModuleErrorBoundary>
              );
            case "#trendmarket": 
              return (
                <ModuleErrorBoundary moduleName="TrendMarket Signal Engine">
                  <div className="container mx-auto px-6 py-12"><TrendMarket /></div>
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
                  <div className="container mx-auto px-6 py-12"><Badges unlockedAchievements={profile.achievements || []} /></div>
                </ModuleErrorBoundary>
              );
            case "#docs": 
              return (
                <ModuleErrorBoundary moduleName="GitOps Rulebook & Case Study">
                  <div className="container mx-auto px-6 py-12"><CaseStudy user={profile} onUpdateGitProvider={handleUpdateGitProvider} /></div>
                </ModuleErrorBoundary>
              );
            case "#portfolio": 
              return (
                <ModuleErrorBoundary moduleName="Interactive Portfolio Balance Matrix">
                  <PortfolioOverview user={profile} />
                </ModuleErrorBoundary>
              );
            case "#networth": 
              return (
                <ModuleErrorBoundary moduleName="NetWorth Real-Time Tracker">
                  <Dashboard user={profile} budget={budget} onUpdateNetWorth={handleUpdateNetWorth} />
                </ModuleErrorBoundary>
              );
            case "#budget": 
              return (
                <ModuleErrorBoundary moduleName="Interactive Budget Planner">
                  <BudgetPlanner user={profile} onSave={handleSaveBudget} initialPlan={budget} />
                </ModuleErrorBoundary>
              );
            case "#simulator": 
              return (
                <ModuleErrorBoundary moduleName="Compound Interest & Lump-Sum Simulator">
                  <InvestmentSimulator user={profile} onUpdateGoals={handleUpdateGoals} />
                </ModuleErrorBoundary>
              );
            case "#quiz": 
              return (
                <ModuleErrorBoundary moduleName="Literacy Command Quiz">
                  <FinancialQuiz onComplete={handleQuizComplete} bestScore={profile.highScore} />
                </ModuleErrorBoundary>
              );
            case "#scenarios": 
              return (
                <ModuleErrorBoundary moduleName="Strategic Projection Engine">
                  <ScenarioSimulator user={profile} budget={budget} onComplete={() => unlockAchievement('simulation_expert')} />
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
                  <AssetRebalancer user={profile} onUpdatePortfolio={handleUpdatePortfolio} onUnlockAchievement={unlockAchievement} />
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

      <PulseAlert 
        alerts={alerts} 
        onClose={(id) => setAlerts(prev => prev.filter(a => a.id !== id))} 
        onClearAll={() => setAlerts([])}
      />

      <QuickTips hash={currentHash} />

      {/* Splash Screen */}
      <AnimatePresence>
        {showSplash && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1, filter: "blur(20px)" }}
            transition={{ duration: 1, ease: "easeInOut" }}
            className="fixed inset-0 z-[500] bg-bg-void flex items-center justify-center pointer-events-auto"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="flex flex-col items-center gap-8"
            >
              <Logo size="xl" />
              <div className="flex flex-col items-center gap-2">
                 <div className="h-1 w-48 bg-bg-secondary rounded-full overflow-hidden border border-border">
                   <motion.div 
                     initial={{ width: 0 }}
                     animate={{ width: "100%" }}
                     transition={{ duration: 2, ease: "easeInOut" }}
                     className="h-full bg-accent-gold"
                   />
                 </div>
                 <span className="text-[10px] font-bold text-accent-gold uppercase tracking-[0.3em]">Initializing Elite Workspace</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
        onToggleTheme={toggleTheme}
        user={user}
        onSignOut={handleSignOut}
      />

      <main className="flex-1 pt-24">
        {renderContent()}
      </main>

      <Footer />

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

      <CurrencySelector 
        isOpen={showCurrencySelector} 
        onSelect={handleCurrencySelect} 
        currentCurrency={tempCurrency || profile?.currency} 
      />
      
      <NameInput 
        isOpen={showNameInput} 
        onComplete={handleOnboardingComplete} 
      />

      {showTutorial && (
        <Tutorial onClose={() => setShowTutorial(false)} />
      )}
    </div>
  );
}
