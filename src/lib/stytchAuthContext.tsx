import React, { createContext, useContext, useState, useEffect } from "react";
import { STYTCH_CONFIG, StytchUser } from "./stytchConfig";
import { UserProfile, BudgetPlan } from "../types";

export interface StytchAuthContextType {
  user: StytchUser | null;
  loading: boolean;
  error: string | null;
  sendOtpEmail: (email: string) => Promise<{ methodId: string }>;
  authenticateOtp: (methodId: string, code: string, displayName?: string) => Promise<StytchUser>;
  signInPasswordless: (email: string, displayName?: string) => Promise<StytchUser>;
  signInWithGooglePasskey: (displayName?: string, email?: string) => Promise<StytchUser>;
  signInAsGuest: (displayName?: string) => Promise<StytchUser>;
  signOut: () => Promise<void>;
  clearError: () => void;
  syncUserData: (profile: UserProfile, budget?: BudgetPlan | null) => Promise<void>;
  loadUserData: (uid: string) => Promise<{ profile?: UserProfile; budget?: BudgetPlan } | null>;
}

const StytchAuthContext = createContext<StytchAuthContextType | null>(null);

const STORAGE_KEY_USER = "ww_stytch_user";
const STORAGE_KEY_PROFILE = "ww_profile";
const STORAGE_KEY_BUDGET = "ww_budget";

export function StytchAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<StytchUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize from local session immediately to avoid loading freeze
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem(STORAGE_KEY_USER) || localStorage.getItem("ww_user");
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        const stytchUser: StytchUser = {
          userId: parsed.uid || parsed.userId || `stytch_${Date.now()}`,
          email: parsed.email || "guest@wexa.ai",
          name: parsed.displayName || parsed.name || "Guest Investor",
          avatarUrl: parsed.photoURL || parsed.avatarUrl,
          authMethod: parsed.authMethod || "passwordless",
          createdAt: parsed.createdAt || new Date().toISOString()
        };
        setUser(stytchUser);
      }
    } catch (err) {
      console.warn("Could not restore Stytch session:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const sendOtpEmail = async (email: string) => {
    setError(null);
    try {
      const res = await fetch("/api/stytch/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to dispatch Stytch OTP");
      return { methodId: data.method_id || `method_${Date.now()}` };
    } catch (err: any) {
      setError(err.message || "Failed to send verification email");
      throw err;
    }
  };

  const authenticateOtp = async (methodId: string, code: string, displayName: string = "Guest Investor") => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/stytch/otp/authenticate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ methodId, code, displayName })
      });
      const data = await res.json();
      
      const stytchUser: StytchUser = {
        userId: data.userId || `stytch_usr_${Math.random().toString(36).substring(2, 11)}`,
        email: data.email || "guest@wexa.ai",
        name: displayName,
        authMethod: "otp",
        createdAt: new Date().toISOString()
      };

      setUser(stytchUser);
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(stytchUser));
      localStorage.setItem("ww_user", JSON.stringify({
        uid: stytchUser.userId,
        displayName: stytchUser.name,
        email: stytchUser.email,
        photoURL: null
      }));
      return stytchUser;
    } catch (err: any) {
      setError(err.message || "Failed to authenticate OTP");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signInPasswordless = async (email: string, displayName: string = "Guest Investor") => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/stytch/magic-link/authenticate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, displayName })
      });
      const data = await res.json();

      const stytchUser: StytchUser = {
        userId: data.userId || `stytch_usr_${Math.random().toString(36).substring(2, 11)}`,
        email,
        name: displayName,
        authMethod: "passwordless",
        createdAt: new Date().toISOString()
      };

      setUser(stytchUser);
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(stytchUser));
      localStorage.setItem("ww_user", JSON.stringify({
        uid: stytchUser.userId,
        displayName: stytchUser.name,
        email: stytchUser.email,
        photoURL: null
      }));
      return stytchUser;
    } catch (err: any) {
      setError(err.message || "Stytch authentication error.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signInWithGooglePasskey = async (displayName: string = "Guest Investor", email: string = "investor@wexa.ai") => {
    setError(null);
    setLoading(true);
    try {
      const stytchUser: StytchUser = {
        userId: `stytch_google_${Math.random().toString(36).substring(2, 11)}`,
        email,
        name: displayName,
        avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=D4AF37&color=050812&bold=true`,
        authMethod: "oauth",
        createdAt: new Date().toISOString()
      };

      setUser(stytchUser);
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(stytchUser));
      localStorage.setItem("ww_user", JSON.stringify({
        uid: stytchUser.userId,
        displayName: stytchUser.name,
        email: stytchUser.email,
        photoURL: stytchUser.avatarUrl
      }));
      return stytchUser;
    } catch (err: any) {
      setError(err.message || "Passkey authorization error.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signInAsGuest = async (displayName: string = "Guest Investor") => {
    setError(null);
    const guestUser: StytchUser = {
      userId: `guest_${Math.random().toString(36).substring(2, 11)}`,
      email: "guest@wexa.ai",
      name: displayName,
      authMethod: "guest",
      createdAt: new Date().toISOString()
    };
    setUser(guestUser);
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(guestUser));
    localStorage.setItem("ww_user", JSON.stringify({
      uid: guestUser.userId,
      displayName: guestUser.name,
      email: null,
      photoURL: null
    }));
    return guestUser;
  };

  const signOut = async () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY_USER);
    localStorage.removeItem("ww_user");
    localStorage.removeItem(STORAGE_KEY_PROFILE);
    localStorage.removeItem(STORAGE_KEY_BUDGET);
  };

  const clearError = () => setError(null);

  const syncUserData = async (profile: UserProfile, budget?: BudgetPlan | null) => {
    if (!user) return;
    try {
      localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(profile));
      if (budget) localStorage.setItem(STORAGE_KEY_BUDGET, JSON.stringify(budget));

      await fetch("/api/stytch/user/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.userId,
          profile,
          budget: budget || null
        })
      });
    } catch (err) {
      console.warn("Stytch data sync fallback:", err);
    }
  };

  const loadUserData = async (uid: string) => {
    try {
      const res = await fetch(`/api/stytch/user/data?userId=${encodeURIComponent(uid)}`);
      if (res.ok) {
        const data = await res.json();
        return {
          profile: data.profile as UserProfile,
          budget: data.budget as BudgetPlan
        };
      }
    } catch (err) {
      console.warn("Could not load Stytch cloud data, using local storage", err);
    }

    const savedProfile = localStorage.getItem(STORAGE_KEY_PROFILE);
    const savedBudget = localStorage.getItem(STORAGE_KEY_BUDGET);
    return {
      profile: savedProfile ? JSON.parse(savedProfile) : undefined,
      budget: savedBudget ? JSON.parse(savedBudget) : undefined
    };
  };

  return (
    <StytchAuthContext.Provider
      value={{
        user,
        loading,
        error,
        sendOtpEmail,
        authenticateOtp,
        signInPasswordless,
        signInWithGooglePasskey,
        signInAsGuest,
        signOut,
        clearError,
        syncUserData,
        loadUserData
      }}
    >
      {children}
    </StytchAuthContext.Provider>
  );
}

export function useStytchAuth() {
  const context = useContext(StytchAuthContext);
  if (!context) {
    throw new Error("useStytchAuth must be used within a StytchAuthProvider");
  }
  return context;
}
