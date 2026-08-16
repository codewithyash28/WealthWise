import React, { useState } from "react";
import { useFirebaseAuth } from "../lib/firebaseAuthContext";
import { 
  ShieldCheck, 
  Sparkles, 
  LogOut, 
  LogIn, 
  User, 
  CheckCircle2, 
  RefreshCw, 
  AlertCircle,
  Database,
  Lock
} from "lucide-react";

export function FirebaseAuthBanner() {
  const { user, loading, error, clearError } = useFirebaseAuth();

  if (loading) {
    return (
      <div className="p-3 rounded-2xl bg-bg-void/80 border border-border flex items-center gap-2 text-xs font-mono text-text-muted">
        <RefreshCw className="w-3.5 h-3.5 animate-spin text-accent-gold" />
        <span>Authenticating with Firebase Auth & Cloud Firestore...</span>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-2xl bg-bg-void/90 border border-accent-gold/30 shadow-lg space-y-2 font-mono text-xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-bold text-text-primary uppercase tracking-wider text-[11px]">
            Firebase Cloud Security Engine
          </span>
        </div>
        <span className="text-[10px] text-accent-gold px-2 py-0.5 rounded-full bg-accent-gold/10 border border-accent-gold/30">
          Firestore Active
        </span>
      </div>

      <p className="text-text-muted font-sans text-xs">
        Secure OAuth2 Google Authentication with real-time multi-device cloud synchronization powered by Google Firebase.
      </p>

      {error && (
        <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button 
            onClick={clearError}
            className="text-[10px] uppercase font-bold text-rose-300 hover:underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
}

export function FirebaseAuthSignInWidget({ onGuestSuccess }: { onGuestSuccess?: (userObj: any) => void }) {
  const { user, signInWithGoogle, signInAsGuest, signOut, loading, error } = useFirebaseAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (user) {
    return (
      <div className="p-5 rounded-2xl bg-bg-void border border-emerald-500/40 space-y-4 font-mono text-xs shadow-md">
        <div className="flex items-center gap-3">
          {user.photoURL ? (
            <img 
              src={user.photoURL} 
              alt="Avatar" 
              className="w-12 h-12 rounded-xl object-cover border border-emerald-500/40 shadow-sm" 
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-lg">
              {user.displayName ? user.displayName.charAt(0).toUpperCase() : "U"}
            </div>
          )}
          <div className="space-y-0.5 overflow-hidden">
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Firebase Authenticated</span>
            </div>
            <div className="font-bold text-sm text-text-primary truncate">
              {user.displayName || "Yash Choubey"}
            </div>
            <div className="text-[11px] text-text-muted truncate">
              {user.email || (user.isAnonymous ? "Anonymous Cloud Guest" : "Authorized User")}
            </div>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-bg-secondary border border-border/80 text-[11px] text-text-secondary space-y-1">
          <div className="flex items-center justify-between text-text-muted">
            <span>Firebase UID:</span>
            <span className="font-mono text-text-primary select-all text-[10px]">{user.uid.substring(0, 16)}...</span>
          </div>
          <div className="flex items-center justify-between text-text-muted">
            <span>Persistence:</span>
            <span className="text-emerald-400 font-bold">Google Cloud Firestore</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => signOut()}
          disabled={loading}
          className="w-full py-2.5 rounded-xl border border-rose-500/30 hover:border-rose-500 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out from Firebase</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 font-mono text-xs">
      <div className="text-center space-y-1">
        <h4 className="font-display text-base font-bold text-text-primary flex items-center justify-center gap-2">
          <ShieldCheck className="w-5 h-5 text-accent-gold" />
          <span>One-Click Cloud Sign-In</span>
        </h4>
        <p className="text-xs text-text-muted font-sans">
          Sign in with your Google account to automatically synchronize your balance sheet and AI wealth models.
        </p>
      </div>

      <button
        type="button"
        onClick={async () => {
          try {
            setIsSubmitting(true);
            await signInWithGoogle();
          } catch (e) {
            console.error("Google sign in trigger failed", e);
          } finally {
            setIsSubmitting(false);
          }
        }}
        disabled={loading || isSubmitting}
        className="w-full py-3.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-sans font-bold text-sm flex items-center justify-center gap-3 transition-all shadow-lg hover:shadow-xl active:scale-95 cursor-pointer disabled:opacity-50"
      >
        <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>
        <span>{isSubmitting || loading ? "Connecting Google Account..." : "Continue with Google (Firebase)"}</span>
      </button>

      <div className="relative flex py-2 items-center">
        <div className="grow border-t border-border/60"></div>
        <span className="shrink mx-3 text-[10px] text-text-muted uppercase tracking-wider font-bold">Or</span>
        <div className="grow border-t border-border/60"></div>
      </div>

      <button
        type="button"
        onClick={async () => {
          try {
            setIsSubmitting(true);
            await signInAsGuest("Yash Choubey");
            if (onGuestSuccess) {
              onGuestSuccess({
                uid: "firebase_guest_" + Math.random().toString(36).substring(2, 9),
                displayName: "Yash Choubey",
                email: null,
                photoURL: null
              });
            }
          } catch (e) {
            console.error("Guest sign in error", e);
          } finally {
            setIsSubmitting(false);
          }
        }}
        disabled={loading || isSubmitting}
        className="w-full py-2.5 px-4 rounded-xl bg-bg-secondary hover:bg-bg-tertiary border border-border hover:border-accent-gold/40 text-text-primary text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
      >
        <User className="w-3.5 h-3.5 text-accent-gold" />
        <span>Instant Guest / Demo Session (Yash Choubey)</span>
      </button>
    </div>
  );
}
