import React, { useState } from "react";
import { useStytchAuth } from "../lib/stytchAuthContext";
import { 
  ShieldCheck, 
  Sparkles, 
  LogOut, 
  LogIn, 
  User, 
  CheckCircle2, 
  RefreshCw, 
  AlertCircle,
  KeyRound,
  Mail,
  Fingerprint,
  ArrowRight
} from "lucide-react";

export function StytchAuthBanner() {
  const { user, loading, error, clearError } = useStytchAuth();

  return (
    <div className="p-4 rounded-2xl bg-bg-void/90 border border-accent-gold/30 shadow-lg space-y-2 font-mono text-xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-accent-gold animate-pulse" />
          <span className="font-bold text-text-primary uppercase tracking-wider text-[11px]">
            Stytch Identity & Passkey Engine
          </span>
        </div>
        <span className="text-[10px] text-accent-gold px-2 py-0.5 rounded-full bg-accent-gold/10 border border-accent-gold/30">
          Stytch Active
        </span>
      </div>

      <p className="text-text-muted font-sans text-xs">
        Enterprise passwordless authentication, Magic Link OTPs, and WebAuthn Passkeys powered by Stytch.
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

export function StytchAuthSignInWidget({ onGuestSuccess }: { onGuestSuccess?: (userObj: any) => void }) {
  const { 
    user, 
    signInPasswordless, 
    signInWithGooglePasskey, 
    signInAsGuest, 
    signOut, 
    loading 
  } = useStytchAuth();

  const [emailInput, setEmailInput] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (user) {
    return (
      <div className="p-5 rounded-2xl bg-bg-void border border-accent-gold/40 space-y-4 font-mono text-xs shadow-md">
        <div className="flex items-center gap-3">
          {user.avatarUrl ? (
            <img 
              src={user.avatarUrl} 
              alt="Avatar" 
              className="w-12 h-12 rounded-xl object-cover border border-accent-gold/40 shadow-sm" 
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-accent-gold/15 border border-accent-gold/30 flex items-center justify-center text-accent-gold font-bold text-lg">
              {user.name ? user.name.charAt(0).toUpperCase() : "G"}
            </div>
          )}
          <div className="space-y-0.5 overflow-hidden">
            <div className="flex items-center gap-1.5 text-accent-gold font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Stytch Authenticated</span>
            </div>
            <div className="font-bold text-sm text-text-primary truncate">
              {user.name || "Guest Investor"}
            </div>
            <div className="text-[11px] text-text-muted truncate">
              {user.email || "guest@wexa.ai"} • {user.authMethod.toUpperCase()}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/60">
          <div className="p-2.5 rounded-xl bg-bg-secondary border border-border/80">
            <div className="text-[10px] text-text-muted">User ID</div>
            <div className="font-mono font-bold text-text-primary truncate text-[11px]">
              {user.userId}
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-bg-secondary border border-border/80">
            <div className="text-[10px] text-text-muted">Security Level</div>
            <div className="font-mono font-bold text-emerald-400 text-[11px] flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> FIDO2 Passkey
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={async () => {
            await signOut();
          }}
          className="w-full py-2 px-3 rounded-xl bg-bg-tertiary hover:bg-rose-500/10 hover:text-rose-400 border border-border text-text-muted transition-colors flex items-center justify-center gap-2 cursor-pointer font-mono text-xs"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Disconnect Stytch Identity</span>
        </button>
      </div>
    );
  }

  return (
    <div className="p-5 rounded-2xl bg-bg-void/95 border border-accent-gold/40 shadow-xl space-y-4 font-mono text-xs">
      <div className="space-y-1">
        <h4 className="font-bold text-sm text-text-primary flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-accent-gold" />
          <span>Stytch Passwordless & Passkey Auth</span>
        </h4>
        <p className="text-xs text-text-muted font-sans">
          One-click secure entry using your Stytch credentials or biometric passkey.
        </p>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-[11px] font-bold text-text-secondary uppercase mb-1">Your Name</label>
          <input
            type="text"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            className="w-full bg-bg-secondary border border-border focus:border-accent-gold rounded-xl px-3 py-2.5 text-xs text-text-primary font-sans outline-none"
            placeholder="e.g. Guest Investor"
          />
        </div>
        <div>
          <label className="block text-[11px] font-bold text-text-secondary uppercase mb-1">Email Address</label>
          <input
            type="email"
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            className="w-full bg-bg-secondary border border-border focus:border-accent-gold rounded-xl px-3 py-2.5 text-xs text-text-primary font-sans outline-none"
            placeholder="investor@example.com"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
        <button
          type="button"
          onClick={async () => {
            try {
              setIsSubmitting(true);
              await signInWithGooglePasskey(nameInput || "Guest Investor", emailInput || "investor@wexa.ai");
            } catch (e) {
              console.error("Passkey sign in failed", e);
            } finally {
              setIsSubmitting(false);
            }
          }}
          disabled={loading || isSubmitting}
          className="py-3 px-3 rounded-xl bg-accent-gold hover:bg-amber-400 text-slate-950 font-sans font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer disabled:opacity-50"
        >
          <Fingerprint className="w-4 h-4 shrink-0" />
          <span>{isSubmitting ? "Authenticating..." : "Stytch Passkey"}</span>
        </button>

        <button
          type="button"
          onClick={async () => {
            try {
              setIsSubmitting(true);
              await signInPasswordless(emailInput || "investor@wexa.ai", nameInput || "Guest Investor");
            } catch (e) {
              console.error("Passwordless sign in failed", e);
            } finally {
              setIsSubmitting(false);
            }
          }}
          disabled={loading || isSubmitting}
          className="py-3 px-3 rounded-xl bg-bg-secondary hover:bg-bg-tertiary border border-accent-gold/40 text-accent-gold font-sans font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
        >
          <Mail className="w-4 h-4 shrink-0" />
          <span>Magic Link Auth</span>
        </button>
      </div>

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
            const guestUser = await signInAsGuest(nameInput || "Guest Investor");
            if (onGuestSuccess) {
              onGuestSuccess({
                uid: guestUser.userId,
                displayName: guestUser.name,
                email: null,
                photoURL: null
              });
            }
          } catch (e) {
            console.error("Guest session error", e);
          } finally {
            setIsSubmitting(false);
          }
        }}
        disabled={loading || isSubmitting}
        className="w-full py-2.5 px-4 rounded-xl bg-bg-secondary hover:bg-bg-tertiary border border-border hover:border-accent-gold/40 text-text-primary text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
      >
        <User className="w-3.5 h-3.5 text-accent-gold" />
        <span>Instant Guest / Demo Session</span>
      </button>
    </div>
  );
}
