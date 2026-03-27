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
import { AIAdvisor } from "./components/AIAdvisor";
import { ScenarioSimulator } from "./components/ScenarioSimulator";
import { Resources } from "./components/Resources";
import { AssetAllocation } from "./components/AssetAllocation";
import { CurrencySelector, NameInput } from "./components/Modals";
import { UserProfile, BudgetPlan, FinancialGoal } from "./types";
import { CURRENCIES } from "./constants";
import { Tutorial } from "./components/Tutorial";
import { PortfolioOverview } from "./components/PortfolioOverview";
import { Skeleton } from "./components/ui/Skeleton";

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
  const [tempCurrency, setTempCurrency] = useState<string | null>(null);

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

  const handleSaveBudget = (plan: BudgetPlan) => {
    setBudget(plan);
    localStorage.setItem("ww_budget", JSON.stringify(plan));
  };

  const handleUpdateNetWorth = (assets: number, liabilities: number) => {
    if (!profile) return;
    const updatedProfile = {
      ...profile,
      netWorth: { assets, liabilities }
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
  };

  const handleSignIn = () => {
    setShowCurrencySelector(true);
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
      case "#dashboard": return <WealthDashboard user={profile} budget={budget} />;
      case "#portfolio": return <PortfolioOverview user={profile} />;
      case "#networth": return <Dashboard user={profile} budget={budget} onUpdateNetWorth={handleUpdateNetWorth} />;
      case "#budget": return <BudgetPlanner user={profile} onSave={handleSaveBudget} initialPlan={budget} />;
      case "#simulator": return <InvestmentSimulator user={profile} onUpdateGoals={handleUpdateGoals} />;
      case "#quiz": return <FinancialQuiz onComplete={handleQuizComplete} bestScore={profile.highScore} />;
      case "#scenarios": return <ScenarioSimulator user={profile} budget={budget} />;
      case "#advisor": return <AIAdvisor user={profile} />;
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
