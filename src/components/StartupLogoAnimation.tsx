import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ShieldCheck } from "lucide-react";

interface StartupLogoAnimationProps {
  onComplete?: () => void;
  forcePlay?: boolean;
}

export const StartupLogoAnimation: React.FC<StartupLogoAnimationProps> = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    // Total animation duration 1.35 seconds (< 1.5s performance budget)
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onComplete) onComplete();
    }, 1350);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.03 }}
          transition={{ duration: 0.35, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-slate-950 text-white overflow-hidden pointer-events-auto"
        >
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute w-[450px] h-[450px] bg-amber-500/15 rounded-full blur-3xl pointer-events-none animate-pulse" />
          <div className="absolute w-[280px] h-[280px] bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

          {/* Logo Animation Container - Subtle Scale-Up and Fade-In */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.85, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="relative flex flex-col items-center justify-center space-y-5 z-10 px-4"
          >
            {/* Logo Emblem Frame */}
            <div className="relative flex items-center justify-center">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: [0.9, 1.1, 1], opacity: [0, 0.6, 0.3] }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="absolute -inset-3 bg-gradient-to-tr from-amber-400/30 via-teal-400/20 to-amber-300/30 rounded-full blur-lg"
              />

              <div className="relative w-24 h-24 md:w-28 md:h-28 rounded-full p-1 bg-gradient-to-tr from-teal-400 via-amber-300 to-teal-200 shadow-[0_0_40px_rgba(20,184,166,0.35)] flex items-center justify-center">
                <div className="w-full h-full bg-slate-950 rounded-full flex items-center justify-center overflow-hidden p-2 border border-slate-800">
                  <img
                    src={imgError ? "/logo.svg" : "/wexa-avatar.jpg"}
                    alt="Wexa AI Logo"
                    onError={() => setImgError(true)}
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
              </div>
            </div>

            {/* Typography Reveal */}
            <div className="text-center space-y-1">
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="flex items-center justify-center gap-2 font-sans text-2xl md:text-3xl tracking-tight"
              >
                <span className="font-extrabold text-white">Wexa</span>
                <span className="font-extrabold bg-gradient-to-r from-teal-400 via-amber-300 to-teal-200 bg-clip-text text-transparent">
                  AI
                </span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 uppercase tracking-widest ml-1">
                  Agent
                </span>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35, duration: 0.4 }}
                className="text-xs font-mono text-slate-400 tracking-wider flex items-center justify-center gap-1.5"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                <span>Autonomous Financial Intelligence Core</span>
              </motion.p>
            </div>

            {/* Progress Bar under 1.5s */}
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 140, opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.95, ease: "easeInOut" }}
              className="h-1 bg-gradient-to-r from-amber-400 via-teal-300 to-amber-200 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.5)]"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

