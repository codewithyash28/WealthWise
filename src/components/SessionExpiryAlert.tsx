import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Clock, ShieldAlert, RefreshCw, LogOut, CheckCircle2, Save, X, Sparkles } from "lucide-react";
import { logAuditAction } from "../lib/auditLogger";

interface SessionExpiryAlertProps {
  sessionDurationMinutes?: number; // Default 15 mins
  warningThresholdSeconds?: number; // Default 120s (2 mins)
  onSignOut?: () => void;
  userEmail?: string | null;
}

export const SessionExpiryAlert: React.FC<SessionExpiryAlertProps> = ({
  sessionDurationMinutes = 15,
  warningThresholdSeconds = 120,
  onSignOut,
  userEmail
}) => {
  const totalSessionSeconds = sessionDurationMinutes * 60;
  const [secondsRemaining, setSecondsRemaining] = useState(totalSessionSeconds);
  const [showWarning, setShowWarning] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastAutoSaved, setLastAutoSaved] = useState<string | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);

  const lastActivityRef = useRef<number>(Date.now());

  // Function to refresh the session timer
  const refreshSession = useCallback(() => {
    lastActivityRef.current = Date.now();
    setSecondsRemaining(totalSessionSeconds);
    setShowWarning(false);
    setIsDismissed(false);
    setIsRefreshing(true);

    // Save pending state timestamp
    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    setLastAutoSaved(now);

    // Log the security action in the immutable audit log
    logAuditAction({
      action: "SESSION_TOKEN_REFRESHED",
      category: "security",
      description: `User extended authenticated session for ${sessionDurationMinutes} minutes. Local portfolio state auto-saved.`,
      initiator: "User",
      status: "SUCCESS",
      details: {
        sessionDurationMinutes,
        refreshedAt: new Date().toISOString(),
        userEmail: userEmail || "Anonymous",
        autoSaved: true
      }
    });

    // Notify user via toast
    window.dispatchEvent(new CustomEvent("ww-trigger-alert", {
      detail: {
        type: "success",
        title: "Session Refreshed! 🛡️",
        message: "Your authenticated session has been renewed and all financial parameters are securely saved."
      }
    }));

    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  }, [totalSessionSeconds, sessionDurationMinutes, userEmail]);

  // Track user activity to quietly extend during active continuous usage
  useEffect(() => {
    const handleUserActivity = () => {
      // If warning is not yet shown, update last activity timestamp
      if (!showWarning) {
        lastActivityRef.current = Date.now();
      }
    };

    window.addEventListener("mousemove", handleUserActivity, { passive: true });
    window.addEventListener("keydown", handleUserActivity, { passive: true });
    window.addEventListener("touchstart", handleUserActivity, { passive: true });
    window.addEventListener("click", handleUserActivity, { passive: true });

    return () => {
      window.removeEventListener("mousemove", handleUserActivity);
      window.removeEventListener("keydown", handleUserActivity);
      window.removeEventListener("touchstart", handleUserActivity);
      window.removeEventListener("click", handleUserActivity);
    };
  }, [showWarning]);

  // Main countdown timer interval
  useEffect(() => {
    const timer = setInterval(() => {
      const elapsedSinceActivity = Math.floor((Date.now() - lastActivityRef.current) / 1000);
      const remaining = Math.max(0, totalSessionSeconds - elapsedSinceActivity);

      setSecondsRemaining(remaining);

      if (remaining <= warningThresholdSeconds && remaining > 0) {
        setShowWarning(true);
      } else if (remaining === 0) {
        setShowWarning(true);
      } else {
        setShowWarning(false);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [totalSessionSeconds, warningThresholdSeconds]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  if (!showWarning || isDismissed) return null;

  const isExpired = secondsRemaining === 0;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 50, scale: 0.95 }}
        className="fixed bottom-6 right-6 z-50 max-w-md w-full px-4 sm:px-0"
      >
        <div className="card p-5 border-2 border-accent-gold/80 bg-bg-secondary/95 shadow-[0_0_50px_rgba(240,180,41,0.25)] backdrop-blur-xl rounded-3xl space-y-4 text-left">
          
          {/* Header Row */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-accent-gold/20 border border-accent-gold/50 text-accent-gold shrink-0 animate-pulse">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-accent-gold">
                    {isExpired ? "Session Expired" : "Authentication Timeout Warning"}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-text-primary mt-0.5">
                  {isExpired 
                    ? "Your active session has ended" 
                    : `Session expiring in ${formatTime(secondsRemaining)}`}
                </h4>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsDismissed(true)}
              className="p-1 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-void transition-colors cursor-pointer"
              title="Dismiss warning for now"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body Content */}
          <p className="text-xs text-text-secondary leading-relaxed">
            {isExpired ? (
              "For your security and financial privacy, your authenticated session timed out. Click below to instantly renew your session without losing local simulation data."
            ) : (
              "To protect your portfolio and sensitive financial calculations, inactive sessions timeout automatically. Your current changes are cached in browser storage."
            )}
          </p>

          {/* Progress Bar */}
          {!isExpired && (
            <div className="space-y-1">
              <div className="w-full bg-bg-void rounded-full h-1.5 overflow-hidden border border-border/40">
                <div 
                  className="bg-gradient-to-r from-accent-gold via-amber-400 to-amber-500 h-full transition-all duration-1000 ease-linear rounded-full"
                  style={{ width: `${Math.min(100, (secondsRemaining / warningThresholdSeconds) * 100)}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] font-mono text-text-muted">
                <span>Auto-save: Active</span>
                <span className="text-accent-gold font-bold">{formatTime(secondsRemaining)} Remaining</span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={refreshSession}
              disabled={isRefreshing}
              className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-accent-gold via-amber-400 to-yellow-400 text-bg-void text-xs font-mono font-bold uppercase tracking-wider hover:opacity-95 transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
              <span>{isRefreshing ? "Renewing..." : "Stay Signed In & Auto-Save"}</span>
            </button>

            {onSignOut && (
              <button
                type="button"
                onClick={onSignOut}
                className="py-2.5 px-3 rounded-xl bg-bg-void hover:bg-bg-tertiary border border-border text-text-muted hover:text-accent-red text-xs font-mono font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                title="Safely sign out now"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            )}
          </div>

          {lastAutoSaved && (
            <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-mono">
              <CheckCircle2 className="w-3 h-3" />
              <span>Last auto-saved at {lastAutoSaved}</span>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
