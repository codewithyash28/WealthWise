import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  KeyRound, 
  Fingerprint, 
  Mail, 
  User, 
  Globe, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  ShieldCheck,
  Building2,
  Lock,
  Compass,
  X
} from "lucide-react";
import { useStytchAuth } from "../lib/stytchAuthContext";
import { CURRENCIES } from "../constants";

interface UniversalAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (userData: {
    uid: string;
    displayName: string;
    email: string | null;
    currency: string;
    learningGoal: string;
  }) => void;
}

export function UniversalAuthModal({ isOpen, onClose, onSuccess }: UniversalAuthModalProps) {
  const { 
    signInWithGooglePasskey, 
    signInPasswordless, 
    signInAsGuest, 
    loading: stytchLoading, 
    error: stytchError, 
    clearError 
  } = useStytchAuth();

  // Step 1: Authentication -> Step 2: Onboarding (Currency & Goal Preference)
  const [step, setStep] = useState<"auth" | "calibrate">("auth");
  
  // Auth Form Fields
  const [authName, setAuthName] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // Authenticated User Payload for Step 2
  const [authenticatedUser, setAuthenticatedUser] = useState<{
    uid: string;
    displayName: string;
    email: string | null;
  } | null>(null);

  // Calibration Form Fields (Currency & Learning Goal)
  const [selectedCurrency, setSelectedCurrency] = useState("INR");
  const [customCurrencyCode, setCustomCurrencyCode] = useState("");
  const [selectedGoal, setSelectedGoal] = useState("Wealth Building & Autonomous AI Rebalancing");
  const [customGoal, setCustomGoal] = useState("");

  if (!isOpen) return null;

  const popularCurrencies = [
    { code: "INR", symbol: "₹", flag: "🇮🇳", name: "Indian Rupee" },
    { code: "USD", symbol: "$", flag: "🇺🇸", name: "US Dollar" },
    { code: "EUR", symbol: "€", flag: "🇪🇺", name: "Euro" },
    { code: "GBP", symbol: "£", flag: "🇬🇧", name: "British Pound" },
    { code: "CAD", symbol: "$", flag: "🇨🇦", name: "Canadian Dollar" },
    { code: "AED", symbol: "AED", flag: "🇦🇪", name: "UAE Dirham" },
    { code: "SGD", symbol: "$", flag: "🇸🇬", name: "Singapore Dollar" },
    { code: "JPY", symbol: "¥", flag: "🇯🇵", name: "Japanese Yen" }
  ];

  const goalOptions = [
    "Wealth Building & Autonomous AI Rebalancing",
    "Stock Portfolio & Tax Optimization",
    "Real Estate: Rent vs Buy Decisioning",
    "DeFi Yield Farming & APY Compounding",
    "Financial Independence & Early Retirement (FIRE)"
  ];

  // 1. Handle Option 1: Stytch Passkey / Biometric Authentication
  const handleStytchPasskey = async () => {
    try {
      setIsSubmitting(true);
      setLocalError(null);
      clearError();
      const stytchUser = await signInWithGooglePasskey(
        authName.trim() || "Verified Investor",
        authEmail.trim() || "investor@wexa.ai"
      );
      setAuthenticatedUser({
        uid: stytchUser.userId,
        displayName: stytchUser.name || authName.trim() || "Verified Investor",
        email: stytchUser.email
      });
      // Advance to Calibration (Currency & Goal setup)
      setStep("calibrate");
    } catch (err: any) {
      console.error(err);
      setLocalError(err?.message || "Stytch Passkey sign-in failed. Please retry.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 2. Handle Option 1b: Stytch Magic Link OTP
  const handleStytchMagicLink = async () => {
    if (!authEmail.trim() || !authEmail.includes("@")) {
      setLocalError("Please enter a valid email address to authenticate with Stytch.");
      return;
    }
    try {
      setIsSubmitting(true);
      setLocalError(null);
      clearError();
      const stytchUser = await signInPasswordless(
        authEmail.trim(),
        authName.trim() || authEmail.split("@")[0]
      );
      setAuthenticatedUser({
        uid: stytchUser.userId,
        displayName: stytchUser.name || authName.trim() || authEmail.split("@")[0],
        email: stytchUser.email
      });
      setStep("calibrate");
    } catch (err: any) {
      console.error(err);
      setLocalError(err?.message || "Magic link verification failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. Handle Option 2: Instant Offline Sandbox / Guest Demo
  const handleSandboxGuest = async () => {
    try {
      setIsSubmitting(true);
      setLocalError(null);
      clearError();
      const guestUser = await signInAsGuest(authName.trim() || "Guest Investor");
      setAuthenticatedUser({
        uid: guestUser.userId,
        displayName: guestUser.name || "Guest Investor",
        email: null
      });
      setStep("calibrate");
    } catch (err: any) {
      console.error(err);
      setLocalError("Unable to initiate sandbox session.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 4. Finalize Onboarding & Open Sandbox / Dashboard
  const handleFinalizeOnboarding = () => {
    const finalCurrency = customCurrencyCode.trim().toUpperCase() || selectedCurrency;
    const finalGoal = customGoal.trim() || selectedGoal;
    const finalName = authenticatedUser?.displayName || authName.trim() || "Guest Investor";
    const finalUid = authenticatedUser?.uid || `usr_${Date.now()}`;

    onSuccess({
      uid: finalUid,
      displayName: finalName,
      email: authenticatedUser?.email || null,
      currency: finalCurrency,
      learningGoal: finalGoal
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-3 sm:p-4 bg-bg-void/90 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="card max-w-lg w-full p-6 sm:p-8 space-y-6 border-2 border-accent-gold/40 shadow-[0_0_50px_rgba(240,180,41,0.25)] rounded-3xl relative overflow-hidden bg-gradient-to-b from-bg-secondary via-bg-secondary to-bg-void text-left my-auto"
      >
        {/* Glow ambient background */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-accent-gold/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Modal Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-bg-void/80 border border-border/80 text-text-muted hover:text-text-primary transition-all cursor-pointer z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* STEP 1: AUTHENTICATION (Stytch Identity or Offline Sandbox) */}
        {step === "auth" && (
          <div className="space-y-5">
            <div className="space-y-1.5 pr-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-gold/15 border border-accent-gold/30 text-accent-gold text-[10px] font-mono font-bold uppercase tracking-widest">
                <KeyRound className="w-3.5 h-3.5" />
                Enterprise Access • Stytch Identity Engine
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-text-primary tracking-tight">
                Sign In to <span className="text-accent-gold">Wexa AI</span>
              </h2>
              <p className="text-xs text-text-secondary">
                Sign in with Stytch biometric passkey/magic link or launch an instant offline sandbox session.
              </p>
            </div>

            {(localError || stytchError) && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{localError || stytchError}</span>
                </div>
                <button
                  type="button"
                  onClick={() => { setLocalError(null); clearError(); }}
                  className="text-[10px] uppercase font-bold text-rose-300 hover:underline cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* User credentials input */}
            <div className="space-y-3 font-mono text-xs">
              <div>
                <label className="block text-[11px] font-bold text-text-secondary uppercase mb-1">
                  Your Full Name
                </label>
                <input
                  type="text"
                  value={authName}
                  onChange={(e) => setAuthName(e.target.value)}
                  placeholder="e.g. Yash Choubey"
                  className="w-full bg-bg-void border border-border focus:border-accent-gold rounded-xl px-3.5 py-2.5 text-xs text-text-primary outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-text-secondary uppercase mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  placeholder="investor@example.com"
                  className="w-full bg-bg-void border border-border focus:border-accent-gold rounded-xl px-3.5 py-2.5 text-xs text-text-primary outline-none transition-colors"
                />
              </div>
            </div>

            {/* Primary Stytch Sign-in Action Buttons */}
            <div className="space-y-2.5 pt-1">
              <button
                type="button"
                onClick={handleStytchPasskey}
                disabled={isSubmitting || stytchLoading}
                className="w-full py-3.5 px-4 rounded-xl bg-accent-gold hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.99] cursor-pointer disabled:opacity-50 font-mono uppercase tracking-wider"
              >
                <Fingerprint className="w-4 h-4" />
                <span>{isSubmitting ? "Authenticating Stytch..." : "Sign in with Stytch Passkey"}</span>
              </button>

              <button
                type="button"
                onClick={handleStytchMagicLink}
                disabled={isSubmitting || stytchLoading}
                className="w-full py-3 px-4 rounded-xl bg-bg-void hover:bg-bg-tertiary border border-accent-gold/40 text-accent-gold font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 font-mono"
              >
                <Mail className="w-4 h-4" />
                <span>Stytch Passwordless Magic Link</span>
              </button>
            </div>

            {/* Divider */}
            <div className="relative flex py-1 items-center">
              <div className="grow border-t border-border/60"></div>
              <span className="shrink mx-3 text-[10px] text-text-muted uppercase tracking-wider font-mono font-bold">
                Or Continue Offline
              </span>
              <div className="grow border-t border-border/60"></div>
            </div>

            {/* Secondary Option: Offline Sandbox Guest */}
            <button
              type="button"
              onClick={handleSandboxGuest}
              disabled={isSubmitting || stytchLoading}
              className="w-full py-3 px-4 rounded-xl bg-bg-void hover:bg-bg-tertiary border border-border hover:border-accent-gold/40 text-text-primary font-mono font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <User className="w-3.5 h-3.5 text-accent-gold" />
              <span>Launch Offline Sandbox Guest Mode</span>
            </button>
          </div>
        )}

        {/* STEP 2: ONBOARDING CALIBRATION (Pick Currency & What do you want to learn?) */}
        {step === "calibrate" && (
          <div className="space-y-5">
            <div className="space-y-1.5 pr-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-bold uppercase tracking-widest">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Authenticated as {authenticatedUser?.displayName || "Member"}
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-text-primary tracking-tight">
                Calibrate Your <span className="text-accent-gold">Wealth Profile</span>
              </h2>
              <p className="text-xs text-text-secondary">
                Select your national currency and primary financial goal to personalize your dashboard.
              </p>
            </div>

            {/* Currency Choice */}
            <div className="space-y-2">
              <label className="block text-[11px] font-mono font-bold text-accent-gold uppercase flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5" />
                1. Select Preferred Currency:
              </label>
              <div className="grid grid-cols-4 gap-2">
                {popularCurrencies.map((cur) => (
                  <button
                    key={cur.code}
                    type="button"
                    onClick={() => {
                      setSelectedCurrency(cur.code);
                      setCustomCurrencyCode("");
                    }}
                    className={`p-2 rounded-xl border text-center font-mono text-xs transition-all cursor-pointer flex flex-col items-center gap-0.5 ${
                      selectedCurrency === cur.code && !customCurrencyCode
                        ? "bg-accent-gold/20 border-accent-gold text-accent-gold font-bold shadow-sm scale-105"
                        : "bg-bg-void border-border text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    <span className="text-base">{cur.flag}</span>
                    <span className="font-bold">{cur.code}</span>
                    <span className="text-[10px] text-text-muted">{cur.symbol}</span>
                  </button>
                ))}
              </div>

              {/* Custom currency fallback */}
              <div className="pt-1">
                <input
                  type="text"
                  value={customCurrencyCode}
                  onChange={(e) => setCustomCurrencyCode(e.target.value.toUpperCase())}
                  placeholder="Other Currency (e.g. SAR, CHF, NZD, PKR)"
                  maxLength={6}
                  className="w-full bg-bg-void border border-border focus:border-accent-gold rounded-xl px-3 py-2 text-xs font-mono uppercase text-text-primary outline-none"
                />
              </div>
            </div>

            {/* Financial Goal & Learning Focus */}
            <div className="space-y-2">
              <label className="block text-[11px] font-mono font-bold text-accent-gold uppercase flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5" />
                2. What do you want to learn or accomplish?
              </label>
              <select
                value={selectedGoal}
                onChange={(e) => {
                  setSelectedGoal(e.target.value);
                  setCustomGoal("");
                }}
                className="w-full bg-bg-void border border-border focus:border-accent-gold rounded-xl px-3 py-2.5 text-xs text-text-primary font-sans outline-none"
              >
                {goalOptions.map((goal) => (
                  <option key={goal} value={goal}>
                    {goal}
                  </option>
                ))}
              </select>

              <input
                type="text"
                value={customGoal}
                onChange={(e) => setCustomGoal(e.target.value)}
                placeholder="Or write your custom financial objective..."
                className="w-full bg-bg-void border border-border focus:border-accent-gold rounded-xl px-3 py-2 text-xs text-text-primary font-sans outline-none"
              />
            </div>

            {/* Finalize button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleFinalizeOnboarding}
                className="w-full py-3.5 px-4 rounded-xl bg-accent-gold hover:bg-amber-400 text-slate-950 font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer active:scale-[0.99]"
              >
                <span>Launch Dashboard & Sandbox</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
