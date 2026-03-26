import { useState, useEffect, useCallback } from "react";
import { onAuthStateChanged, signInWithPopup, signOut, User } from "firebase/auth";
import { doc, onSnapshot, setDoc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { auth, db, googleProvider } from "./lib/firebase";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { LandingPage } from "./components/LandingPage";
import { Dashboard } from "./components/Dashboard";
import { BudgetPlanner } from "./components/BudgetPlanner";
import { InvestmentSimulator } from "./components/InvestmentSimulator";
import { FinancialQuiz } from "./components/FinancialQuiz";
import { AIAdvisor } from "./components/AIAdvisor";
import { Resources } from "./components/Resources";
import { AssetAllocation } from "./components/AssetAllocation";
import { CurrencySelector, NameInput } from "./components/Modals";
import { UserProfile, BudgetPlan } from "./types";
import { CURRENCIES } from "./constants";

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: any;
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [budget, setBudget] = useState<BudgetPlan | null>(null);
  const [currentHash, setCurrentHash] = useState(window.location.hash || "#home");
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const saved = localStorage.getItem("ww_theme");
    return (saved as "light" | "dark") || "dark";
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
  const [tempCurrency, setTempCurrency] = useState<string | null>(null);

  useEffect(() => {
    const handleHashChange = () => setCurrentHash(window.location.hash || "#home");
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setIsAuthReady(true);
      if (!firebaseUser) {
        setProfile(null);
        setBudget(null);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    const profileRef = doc(db, "users", user.uid);
    const unsubscribe = onSnapshot(profileRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as UserProfile;
        setProfile(data);
        
        // Update last visit and streak
        const today = new Date().toISOString().split('T')[0];
        if (!data.visitDates.includes(today)) {
          updateDoc(profileRef, {
            lastVisit: new Date().toISOString(),
            visitDates: arrayUnion(today)
          }).catch(err => handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`));
        }
      } else {
        // New user - trigger onboarding
        setShowCurrencySelector(true);
      }
    }, (err) => handleFirestoreError(err, OperationType.GET, `users/${user.uid}`));

    const budgetRef = doc(db, "budgets", user.uid);
    const unsubscribeBudget = onSnapshot(budgetRef, (snapshot) => {
      if (snapshot.exists()) {
        setBudget(snapshot.data() as BudgetPlan);
      }
    }, (err) => handleFirestoreError(err, OperationType.GET, `budgets/${user.uid}`));

    return () => {
      unsubscribe();
      unsubscribeBudget();
    };
  }, [user]);

  useEffect(() => {
    const keys: string[] = [];
    const konami = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
    
    const handleKeyDown = (e: KeyboardEvent) => {
      keys.push(e.key);
      if (keys.length > 10) keys.shift();
      if (keys.join(",") === konami.join(",")) {
        alert("🏆 You found the Easter Egg! Pro tip: The best investment is knowledge. You're already ahead of 90% by being here!");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleCurrencySelect = (currency: string) => {
    setTempCurrency(currency);
    setShowCurrencySelector(false);
    setShowNameInput(true);
  };

  const handleOnboardingComplete = async (name: string) => {
    if (!user || !tempCurrency) return;

    const newProfile: UserProfile = {
      uid: user.uid,
      name,
      currency: tempCurrency,
      joinDate: new Date().toISOString(),
      lastVisit: new Date().toISOString(),
      visitDates: [new Date().toISOString().split('T')[0]],
      highScore: 0,
      netWorth: { assets: 0, liabilities: 0 }
    };

    try {
      await setDoc(doc(db, "users", user.uid), newProfile);
      setShowNameInput(false);
      window.location.hash = "#dashboard";
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}`);
    }
  };

  const handleSaveBudget = async (plan: BudgetPlan) => {
    if (!user) return;
    try {
      await setDoc(doc(db, "budgets", user.uid), plan);
      alert("Budget plan saved successfully!");
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `budgets/${user.uid}`);
    }
  };

  const handleUpdateNetWorth = async (assets: number, liabilities: number) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, "users", user.uid), {
        "netWorth.assets": assets,
        "netWorth.liabilities": liabilities
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  const handleQuizComplete = async (score: number) => {
    if (!user || !profile) return;
    if (score > profile.highScore) {
      try {
        await updateDoc(doc(db, "users", user.uid), { highScore: score });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
      }
    }
  };

  const handleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error("Sign in error:", err);
    }
  };

  const renderContent = () => {
    if (currentHash === "#home") return <LandingPage />;
    
    if (!user) {
      return (
        <div className="container mx-auto px-6 py-32 flex flex-col items-center justify-center text-center space-y-8">
          <h2 className="text-4xl font-display font-bold">Sign in to unlock your dashboard</h2>
          <p className="text-text-secondary max-w-md">Your financial data is securely stored and synced across your devices.</p>
          <button onClick={handleSignIn} className="btn-primary text-lg px-10 py-4">Sign in with Google</button>
        </div>
      );
    }

    if (!profile) return <div className="py-32 text-center text-text-muted">Loading your profile...</div>;

    switch (currentHash) {
      case "#dashboard": return <Dashboard user={profile} budget={budget} onUpdateNetWorth={handleUpdateNetWorth} />;
      case "#budget": return <BudgetPlanner user={profile} onSave={handleSaveBudget} initialPlan={budget} />;
      case "#simulator": return <InvestmentSimulator user={profile} />;
      case "#quiz": return <FinancialQuiz onComplete={handleQuizComplete} bestScore={profile.highScore} />;
      case "#advisor": return <AIAdvisor />;
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
    </div>
  );
}
