import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { 
  ClerkProvider as RealClerkProvider, 
  useUser as useRealUser, 
  useAuth as useRealAuth,
  useClerk as useRealClerkInstance
} from "@clerk/clerk-react";
import { shadcn } from "@clerk/ui/themes";
import { KeyRound, ShieldCheck, HelpCircle, LogIn, LogOut, User, Sparkles, Mail, Database, CreditCard, RefreshCw } from "lucide-react";

// Types matching application's user structure
export interface ClerkUserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  isPremium?: boolean;
}

interface ClerkAuthContextType {
  isClerkActive: boolean;
  isLoaded: boolean;
  isSignedIn: boolean;
  user: ClerkUserProfile | null;
  signIn: (email: string, displayName: string) => Promise<void>;
  signUp: (email: string, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
  syncWithAppProfile: (updateProfileFunc: any, updateBudgetFunc?: any) => Promise<void>;
}

const ClerkAuthContext = createContext<ClerkAuthContextType | undefined>(undefined);

const CLERK_PUBLISHABLE_KEY = (
  ((import.meta as any).env?.VITE_CLERK_PUBLISHABLE_KEY as string) || 
  "pk_test_dXAtZWxlcGhhbnQtNTYuY2xlcmsuYWNjb3VudHMuZGV2JA"
).trim();
const isClerkConfigured = typeof CLERK_PUBLISHABLE_KEY === "string" && 
  (CLERK_PUBLISHABLE_KEY.startsWith("pk_test_") || CLERK_PUBLISHABLE_KEY.startsWith("pk_live_"));

// Internal custom simulator provider used when Clerk publishable key is not set
function MockClerkProvider({ children }: { children: ReactNode }) {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [user, setUser] = useState<ClerkUserProfile | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Load simulated Clerk session from local storage if available
    const savedMockSession = localStorage.getItem("ww_clerk_mock_session");
    if (savedMockSession) {
      try {
        const parsed = JSON.parse(savedMockSession);
        setUser(parsed);
        setIsSignedIn(true);
      } catch (e) {
        console.error("Failed to parse mock clerk session", e);
      }
    }
    setIsLoaded(true);
  }, []);

  const signIn = async (email: string, displayName: string) => {
    const mockUser: ClerkUserProfile = {
      uid: "clerk_mock_" + Math.random().toString(36).substring(2, 11),
      displayName: displayName || "Socratic Elite Member",
      email: email,
      photoURL: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80` // Premium avatar
    };
    setUser(mockUser);
    setIsSignedIn(true);
    localStorage.setItem("ww_clerk_mock_session", JSON.stringify(mockUser));
    
    // Also dispatch notification to the global system
    window.dispatchEvent(new CustomEvent('ww-trigger-alert', {
      detail: {
        type: 'success',
        title: 'Clerk Sandbox: Logged In',
        message: `Welcome back, ${mockUser.displayName}! Simulated auth token granted.`
      }
    }));
  };

  const signUp = async (email: string, displayName: string) => {
    return signIn(email, displayName);
  };

  const signOut = async () => {
    setUser(null);
    setIsSignedIn(false);
    localStorage.removeItem("ww_clerk_mock_session");
    
    window.dispatchEvent(new CustomEvent('ww-trigger-alert', {
      detail: {
        type: 'info',
        title: 'Clerk Sandbox: Logged Out',
        message: 'Mock session keys successfully cleared.'
      }
    }));
  };

  const syncWithAppProfile = async (updateProfileFunc: any, updateBudgetFunc?: any) => {
    if (!user) return;
    // Keep local app state updated with Clerk attributes
    const appUserObj = {
      uid: user.uid,
      displayName: user.displayName,
      email: user.email,
      photoURL: user.photoURL
    };
    localStorage.setItem("ww_user", JSON.stringify(appUserObj));
    
    // Auto-create profile if missing
    const savedProfile = localStorage.getItem("ww_profile");
    if (!savedProfile) {
      const initialProfile = {
        uid: user.uid,
        name: user.displayName || user.email?.split("@")[0] || "User",
        age: "30",
        learningGoal: "Elite Wealth Preservation",
        currency: "USD",
        joinDate: new Date().toISOString(),
        lastVisit: new Date().toISOString(),
        visitDates: [new Date().toISOString().split('T')[0]],
        highScore: 0,
        netWorth: { assets: 0, liabilities: 0 },
        gitProvider: "github"
      };
      localStorage.setItem("ww_profile", JSON.stringify(initialProfile));
      updateProfileFunc(initialProfile);
    } else {
      const parsed = JSON.parse(savedProfile);
      const updatedProfile = {
        ...parsed,
        uid: user.uid,
        name: user.displayName || parsed.name
      };
      localStorage.setItem("ww_profile", JSON.stringify(updatedProfile));
      updateProfileFunc(updatedProfile);
    }
  };

  return (
    <ClerkAuthContext.Provider value={{
      isClerkActive: false,
      isLoaded,
      isSignedIn,
      user,
      signIn,
      signUp,
      signOut,
      syncWithAppProfile
    }}>
      {children}
    </ClerkAuthContext.Provider>
  );
}

// Wrapper for Real Clerk context mapping
function RealClerkContextAdapter({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn } = useRealAuth();
  const { user: realUser } = useRealUser();
  const clerk = useRealClerkInstance();
  const [mappedUser, setMappedUser] = useState<ClerkUserProfile | null>(null);

  useEffect(() => {
    if (isSignedIn && realUser) {
      setMappedUser({
        uid: realUser.id,
        displayName: realUser.fullName || realUser.username || "Clerk Member",
        email: realUser.primaryEmailAddress?.emailAddress || null,
        photoURL: realUser.imageUrl || null
      });
    } else {
      setMappedUser(null);
    }
  }, [isSignedIn, realUser]);

  const signIn = async () => {
    clerk?.openSignIn();
  };

  const signUp = async () => {
    clerk?.openSignUp();
  };

  const signOut = async () => {
    await clerk?.signOut();
  };

  const syncWithAppProfile = async (updateProfileFunc: any) => {
    if (!mappedUser) return;
    const appUserObj = {
      uid: mappedUser.uid,
      displayName: mappedUser.displayName,
      email: mappedUser.email,
      photoURL: mappedUser.photoURL
    };
    localStorage.setItem("ww_user", JSON.stringify(appUserObj));

    const savedProfile = localStorage.getItem("ww_profile");
    if (!savedProfile) {
      const initialProfile = {
        uid: mappedUser.uid,
        name: mappedUser.displayName || "User",
        age: "28",
        learningGoal: "Elite Compound Simulation",
        currency: "USD",
        joinDate: new Date().toISOString(),
        lastVisit: new Date().toISOString(),
        visitDates: [new Date().toISOString().split('T')[0]],
        highScore: 0,
        netWorth: { assets: 0, liabilities: 0 },
        gitProvider: "github"
      };
      localStorage.setItem("ww_profile", JSON.stringify(initialProfile));
      updateProfileFunc(initialProfile);
    } else {
      const parsed = JSON.parse(savedProfile);
      const updatedProfile = {
        ...parsed,
        uid: mappedUser.uid,
        name: mappedUser.displayName || parsed.name
      };
      localStorage.setItem("ww_profile", JSON.stringify(updatedProfile));
      updateProfileFunc(updatedProfile);
    }
  };

  return (
    <ClerkAuthContext.Provider value={{
      isClerkActive: true,
      isLoaded,
      isSignedIn,
      user: mappedUser,
      signIn,
      signUp,
      signOut,
      syncWithAppProfile
    }}>
      {children}
    </ClerkAuthContext.Provider>
  );
}

// Master Authentication Wrapper Component
export function MasterClerkProvider({ children }: { children: ReactNode }) {
  if (isClerkConfigured) {
    return (
      <RealClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY} appearance={{ theme: shadcn }}>
        <RealClerkContextAdapter>
          {children}
        </RealClerkContextAdapter>
      </RealClerkProvider>
    );
  } else {
    return <MockClerkProvider>{children}</MockClerkProvider>;
  }
}

// Custom Hook to access Clerk Context seamlessly
export function useClerkAuth() {
  const context = useContext(ClerkAuthContext);
  if (context === undefined) {
    throw new Error("useClerkAuth must be used inside a MasterClerkProvider");
  }
  return context;
}

// Stunning Info Widget showcasing Clerk State and configuration guidelines
export function ClerkStatusBanner() {
  const { isClerkActive, isSignedIn, user } = useClerkAuth();

  return (
    <div className="card p-6 border-accent-gold/20 bg-gradient-to-r from-bg-secondary via-bg-secondary/60 to-accent-gold/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-accent-gold/5 rounded-full blur-3xl pointer-events-none" />
      <div className="flex items-start gap-4">
        <div className="p-3 bg-accent-gold/10 rounded-2xl border border-accent-gold/20 text-accent-gold mt-0.5">
          <KeyRound className="w-6 h-6 animate-pulse" />
        </div>
        <div className="space-y-1 text-left">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-extrabold uppercase tracking-widest font-mono text-accent-gold">
              Clerk Auth Engine
            </h4>
            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${isClerkActive ? "bg-accent-emerald/10 text-accent-emerald border border-accent-emerald/20" : "bg-accent-gold/10 text-accent-gold border border-accent-gold/20"}`}>
              {isClerkActive ? "LIVE integration" : "high-fidelity sandbox"}
            </span>
          </div>
          <p className="text-xs text-text-muted max-w-xl leading-relaxed">
            {isClerkActive 
              ? `Authenticating real-time sessions. Currently logged in as ${user?.email || "Clerk User"}.`
              : "Currently operating in Sandbox Auth mode. To run a live Clerk server connection, declare your publishable key in the environment."}
          </p>
        </div>
      </div>
      
      {isClerkActive ? (
        <div className="flex flex-col gap-2 w-full md:w-auto">
          <div className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/30 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <code className="text-emerald-300 font-bold">VITE_CLERK_PUBLISHABLE_KEY</code>
            <span className="text-emerald-400/80">Configured (.env)</span>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2 w-full md:w-auto">
          <div className="text-[10px] font-mono text-text-muted bg-bg-void/60 px-3 py-1.5 rounded-lg border border-border flex items-center gap-1.5">
            <code className="text-accent-gold font-bold">VITE_CLERK_PUBLISHABLE_KEY</code>
            <span>is missing in .env</span>
          </div>
        </div>
      )}
    </div>
  );
}

// Interactive Clerk Sign In and Sign Up Form widget
export function ClerkSignInWidget() {
  const clerkAuth = useClerkAuth();
  const [emailInput, setEmailInput] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (clerkAuth.isSignedIn && clerkAuth.user) {
    return (
      <div className="card p-6 border-accent-emerald/20 bg-accent-emerald/5 space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full overflow-hidden border border-accent-emerald/30">
            {clerkAuth.user.photoURL ? (
              <img src={clerkAuth.user.photoURL} alt="Clerk Avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-accent-emerald/10 flex items-center justify-center text-accent-emerald font-bold">
                C
              </div>
            )}
          </div>
          <div className="text-left space-y-0.5">
            <h4 className="text-md font-bold text-text-primary flex items-center gap-1.5">
              {clerkAuth.user.displayName}
              <span className="text-accent-emerald text-xs font-mono">● Active Session</span>
            </h4>
            <p className="text-xs text-text-muted">{clerkAuth.user.email}</p>
          </div>
        </div>
        
        <div className="bg-bg-void/60 p-4 rounded-xl border border-border space-y-2 text-xs font-mono">
          <div className="flex justify-between">
            <span className="text-text-muted">Federated ID:</span>
            <span className="text-text-primary select-all">{clerkAuth.user.uid}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-muted">Auth Provider:</span>
            <span className="text-accent-gold">Clerk SSO Engine</span>
          </div>
        </div>

        <button
          onClick={() => clerkAuth.signOut()}
          className="w-full py-3 border border-accent-red/20 hover:border-accent-red text-accent-red hover:bg-accent-red/5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all font-mono cursor-pointer"
        >
          Disconnect Clerk Session
        </button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput) return;
    setIsSubmitting(true);
    try {
      if (clerkAuth.isClerkActive) {
        await clerkAuth.signIn(emailInput, nameInput);
      } else {
        await clerkAuth.signIn(emailInput, nameInput || "Socratic Scholar");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-left">
      <div className="space-y-1.5">
        <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted flex items-center gap-1.5">
          <Mail className="w-3.5 h-3.5 text-accent-gold" /> Email Address
        </label>
        <input
          type="email"
          required
          value={emailInput}
          onChange={(e) => setEmailInput(e.target.value)}
          placeholder="Enter Clerk federated email..."
          className="w-full bg-bg-secondary border border-border/80 focus:border-accent-gold/40 px-4 py-3 rounded-xl text-text-primary text-sm focus:outline-none transition-colors"
        />
      </div>

      {!clerkAuth.isClerkActive && (
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-accent-gold" /> Full Name / Display Title
          </label>
          <input
            type="text"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            placeholder="e.g. Yash Vardhan"
            className="w-full bg-bg-secondary border border-border/80 focus:border-accent-gold/40 px-4 py-3 rounded-xl text-text-primary text-sm focus:outline-none transition-colors"
          />
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="btn-primary w-full flex items-center justify-center gap-2.5 py-4 text-sm font-bold uppercase tracking-widest text-bg-void cursor-pointer mt-6"
      >
        {isSubmitting ? (
          <RefreshCw className="w-5 h-5 animate-spin text-bg-void" />
        ) : (
          <LogIn className="w-5 h-5 text-bg-void" />
        )}
        <span>
          {clerkAuth.isClerkActive ? "Trigger Clerk Secure Popup" : "Authorize Clerk Sandbox Identity"}
        </span>
      </button>

      {clerkAuth.isClerkActive && (
        <div className="p-3.5 rounded-xl border border-accent-gold/20 bg-accent-gold/5 text-xs text-text-muted space-y-2 mt-4 font-mono">
          <div className="flex items-center gap-2 text-accent-gold font-bold">
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>Clerk Waitlist / Access Note</span>
          </div>
          <p className="text-[11px] leading-relaxed">
            If Clerk says <em>"Sign-ups are currently unavailable. Join the waitlist..."</em>, it means new sign-ups are restricted on this Clerk test key.
          </p>
          <div className="pt-1.5 border-t border-accent-gold/10 flex flex-wrap gap-2 text-[11px]">
            <span className="text-text-primary">Alternatives:</span>
            <span className="text-accent-gold font-bold">1. Use Sign In (if registered)</span>
            <span>•</span>
            <span className="text-accent-emerald font-bold">2. Switch to 'Sign In / Restore' tab</span>
            <span>•</span>
            <span className="text-accent-blue font-bold">3. Switch to 'Offline Guest' tab</span>
          </div>
        </div>
      )}
    </form>
  );
}

