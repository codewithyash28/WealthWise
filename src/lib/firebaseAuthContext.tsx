import React, { createContext, useContext, useState, useEffect } from "react";
import { 
  auth, 
  db, 
  googleProvider, 
  signInWithPopup, 
  firebaseSignOut, 
  onAuthStateChanged,
  signInAnonymously,
  doc, 
  setDoc, 
  getDoc,
  FirebaseUser 
} from "./firebase";
import { UserProfile, BudgetPlan } from "../types";

export interface FirebaseAuthContextType {
  user: FirebaseUser | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInAsGuest: (name?: string) => Promise<void>;
  signOut: () => Promise<void>;
  saveUserDataToFirestore: (profile: UserProfile, budget?: BudgetPlan | null) => Promise<void>;
  loadUserDataFromFirestore: (uid: string) => Promise<{ profile?: UserProfile; budget?: BudgetPlan } | null>;
  error: string | null;
  clearError: () => void;
}

const FirebaseAuthContext = createContext<FirebaseAuthContextType | null>(null);

export function FirebaseAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    }, (err) => {
      console.warn("Firebase auth state change error:", err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      setError(null);
      setLoading(true);
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.error("Firebase Google Sign-In error:", err);
      // If popup is blocked in iframe, notify user
      if (err.code === "auth/popup-blocked" || err.code === "auth/cancelled-popup-request") {
        setError("Sign-in popup was blocked by browser. Please allow popups or use guest/PIN mode.");
      } else if (err.code === "auth/unauthorized-domain") {
        setError("Domain not authorized in Firebase Console yet. You can also sign in via PIN/Guest!");
      } else {
        setError(err.message || "Failed to sign in with Google.");
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signInAsGuest = async (name: string = "Yash Choubey") => {
    try {
      setError(null);
      setLoading(true);
      await signInAnonymously(auth);
    } catch (err: any) {
      console.error("Firebase anonymous sign-in error:", err);
      setError(err.message || "Failed to initialize guest session.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      await firebaseSignOut(auth);
      localStorage.removeItem("ww_profile");
      localStorage.removeItem("ww_budget");
    } catch (err: any) {
      console.error("Firebase sign out error:", err);
    } finally {
      setLoading(false);
    }
  };

  const saveUserDataToFirestore = async (profile: UserProfile, budget?: BudgetPlan | null) => {
    if (!user) return;
    try {
      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, {
        profile,
        budget: budget || null,
        updatedAt: new Date().toISOString(),
        email: user.email || null,
        displayName: user.displayName || profile.name || "Yash Choubey"
      }, { merge: true });
    } catch (err) {
      console.warn("Firestore sync write failed (will use local fallback):", err);
    }
  };

  const loadUserDataFromFirestore = async (uid: string) => {
    try {
      const userRef = doc(db, "users", uid);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        const data = snap.data();
        return {
          profile: data.profile as UserProfile,
          budget: data.budget as BudgetPlan
        };
      }
      return null;
    } catch (err) {
      console.warn("Firestore read failed:", err);
      return null;
    }
  };

  return (
    <FirebaseAuthContext.Provider
      value={{
        user,
        loading,
        signInWithGoogle,
        signInAsGuest,
        signOut,
        saveUserDataToFirestore,
        loadUserDataFromFirestore,
        error,
        clearError: () => setError(null)
      }}
    >
      {children}
    </FirebaseAuthContext.Provider>
  );
}

export function useFirebaseAuth() {
  const context = useContext(FirebaseAuthContext);
  if (!context) {
    throw new Error("useFirebaseAuth must be used within a FirebaseAuthProvider");
  }
  return context;
}
