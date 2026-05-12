import { useState, useEffect, useCallback, Component, ErrorInfo, ReactNode } from "react";

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
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { LandingPage } from "./components/LandingPage";
import { Dashboard } from "./components/Dashboard";
import { WealthDashboard } from "./components/WealthDashboard";
import { BudgetPlanner } from "./components/BudgetPlanner";
import { InvestmentSimulator } from "./components/InvestmentSimulator";
import { FinancialQuiz } from "./components/FinancialQuiz";
import { ScenarioSimulator } from "./components/ScenarioSimulator";
import { Resources } from "./components/Resources";
import { AssetAllocation } from "./components/AssetAllocation";
import { CurrencySelector, NameInput } from "./components/Modals";
import { Onboarding } from "./components/Onboarding";
import { Badges } from "./components/Badges";
import { CaseStudy } from "./components/CaseStudy";
import { JudgeTour } from "./components/JudgeTour";
import { Logo } from "./components/Logo";
import { UserProfile, BudgetPlan, FinancialGoal, Achievement } from "./types";
import { CURRENCIES, ACHIEVEMENTS } from "./constants";
import { Tutorial } from "./components/Tutorial";
import { MacroPulse } from "./components/mastery/MacroPulse";
import { TrendMarket } from "./components/mastery/TrendMarket";
import { LiveOrLease } from "./components/mastery/LiveOrLease";
import { MockYield } from "./components/mastery/MockYield";
import { PulseAlert } from "./components/mastery/PulseAlert";
import { PortfolioOverview } from "./components/PortfolioOverview";
import { Skeleton } from "./components/ui/Skeleton";
import { motion, AnimatePresence } from "motion/react";

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
      setProfile(JSON.parse(savedProfile));
    }
    if (savedBudget) {
      setBudget(JSON.parse(savedBudget));
    }
    
    setIsAuthReady(true);
  }, []);

  const handleCurrencySelect = (currency: string) => {
    setTempCurrency(currency);
    setShowCurrencySelector(false);
    setShowNameInput(true);
  };

  const handleOnboardingComplete = (name: string, age: string, learningGoal: string) => {
    const uid = Math.random().toString(36).substring(2, 15);
    const newUser: LocalUser = {
      uid,
      displayName: name,
      email: null,
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
      highScore: 0,
      netWorth: { assets: 0, liabilities: 0 }
    };

    setUser(newUser);
    setProfile(newProfile);
    localStorage.setItem("ww_user", JSON.stringify(newUser));
    localStorage.setItem("ww_profile", JSON.stringify(newProfile));
    
    setShowNameInput(false);
    setShowTutorial(true);
    window.location.hash = "#dashboard";
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
    if (hour < 12) return "Good morning! Sign in to unlock your dashboard";
    if (hour < 18) return "Good afternoon! Sign in to unlock your dashboard";
    return "Good evening! Sign in to unlock your dashboard";
  };

  const renderContent = () => {
    if (currentHash === "#home") return <LandingPage />;
    
    if (!user) {
      return (
        <div className="container mx-auto px-6 py-32 flex flex-col items-center justify-center text-center space-y-8">
          <h2 className="text-4xl font-display font-bold">{getWelcomeMessage()}</h2>
          <p className="text-text-secondary max-w-md">Your financial data is securely stored locally on your device.</p>
          <button onClick={handleSignIn} className="btn-primary text-lg px-10 py-4">Get Started</button>
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

    switch (currentHash) {
      case "#dashboard": return <WealthDashboard user={profile} budget={budget} onUnlockAchievement={unlockAchievement} />;
      case "#macropulse": return <div className="container mx-auto px-6 py-12"><MacroPulse /></div>;
      case "#trendmarket": return <div className="container mx-auto px-6 py-12"><TrendMarket /></div>;
      case "#liveorlease": return <div className="container mx-auto px-6 py-12"><LiveOrLease /></div>;
      case "#mockyield": return <div className="container mx-auto px-6 py-12"><MockYield /></div>;
      case "#badges": return <div className="container mx-auto px-6 py-12"><Badges unlockedAchievements={profile.achievements || []} /></div>;
      case "#docs": return <div className="container mx-auto px-6 py-12"><CaseStudy /></div>;
      case "#portfolio": return <PortfolioOverview user={profile} />;
      case "#networth": return <Dashboard user={profile} budget={budget} onUpdateNetWorth={handleUpdateNetWorth} />;
      case "#budget": return <BudgetPlanner user={profile} onSave={handleSaveBudget} initialPlan={budget} />;
      case "#simulator": return <InvestmentSimulator user={profile} onUpdateGoals={handleUpdateGoals} />;
      case "#quiz": return <FinancialQuiz onComplete={handleQuizComplete} bestScore={profile.highScore} />;
      case "#scenarios": return <ScenarioSimulator user={profile} budget={budget} onComplete={() => unlockAchievement('simulation_expert')} />;
      case "#resources": return <Resources />;
      case "#allocation": return <AssetAllocation />;
      default: return <LandingPage />;
    }
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
