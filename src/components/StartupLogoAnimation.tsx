import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ShieldCheck, Cpu, Sparkles, CheckCircle2 } from "lucide-react";

interface StartupLogoAnimationProps {
  onComplete?: () => void;
  forcePlay?: boolean;
}

export const StartupLogoAnimation: React.FC<StartupLogoAnimationProps> = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [imgIdx, setImgIdx] = useState(0);
  const [statusStep, setStatusStep] = useState(0);

  const imageSources = ["/logo-designed.png", "/logo.svg", "/wexa-avatar.jpg", "/app-icon.png"];

  const handleImgError = () => {
    if (imgIdx < imageSources.length - 1) {
      setImgIdx(prev => prev + 1);
    }
  };

  const statusMessages = [
    "Initializing Autonomous Wealth Core...",
    "Connecting Real-Time Market Signals...",
    "Synchronizing MongoDB Ledger System...",
    "WealthWise Elite Engine Ready!"
  ];

  useEffect(() => {
    // Increment status message step
    const stepInterval = setInterval(() => {
      setStatusStep((prev) => (prev < statusMessages.length - 1 ? prev + 1 : prev));
    }, 400);

    // Auto dismiss after 1.6s
    const dismissTimer = setTimeout(() => {
      setIsVisible(false);
      if (onComplete) onComplete();
    }, 1650);

    return () => {
      clearInterval(stepInterval);
      clearTimeout(dismissTimer);
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.04, filter: "blur(4px)" }}
          transition={{ duration: 0.45, ease: "easeInOut" }}
          onClick={() => {
            setIsVisible(false);
            if (onComplete) onComplete();
          }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-slate-950 text-white overflow-hidden cursor-pointer select-none"
        >
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute w-[500px] h-[500px] bg-amber-500/15 rounded-full blur-3xl pointer-events-none animate-pulse" />
          <div className="absolute w-[320px] h-[320px] bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

          {/* Grid lines background pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

          {/* Logo Animation Container */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.85, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="relative flex flex-col items-center justify-center space-y-6 z-10 px-6 max-w-md w-full text-center"
          >
            {/* Logo Emblem Frame */}
            <div className="relative flex items-center justify-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: [0.85, 1.12, 1], opacity: [0, 0.7, 0.35] }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="absolute -inset-4 bg-gradient-to-tr from-amber-400/40 via-teal-400/30 to-amber-300/40 rounded-full blur-xl"
              />

              <div className="relative w-28 h-28 md:w-32 md:h-32 rounded-full p-1 bg-gradient-to-tr from-teal-400 via-amber-300 to-teal-200 shadow-[0_0_50px_rgba(20,184,166,0.4)] flex items-center justify-center">
                <div className="w-full h-full bg-slate-950 rounded-full flex items-center justify-center overflow-hidden p-2 border border-slate-800">
                  <img
                    src={imageSources[imgIdx]}
                    alt="Wexa AI Logo"
                    onError={handleImgError}
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
              </div>
            </div>

            {/* Typography & Branding */}
            <div className="space-y-2">
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="flex items-center justify-center gap-2 font-sans text-3xl md:text-4xl tracking-tight"
              >
                <span className="font-black text-white">Wexa</span>
                <span className="font-black bg-gradient-to-r from-teal-400 via-amber-300 to-teal-200 bg-clip-text text-transparent">
                  AI
                </span>
                <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 uppercase tracking-widest ml-1">
                  Agent
                </span>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35, duration: 0.4 }}
                className="text-xs font-mono text-slate-400 tracking-wider flex items-center justify-center gap-1.5"
              >
                <ShieldCheck className="w-4 h-4 text-teal-400" />
                <span>Autonomous Wealth & Financial Intelligence Engine</span>
              </motion.p>
            </div>

            {/* Live Loading Bar */}
            <div className="w-full space-y-2 pt-2">
              <div className="h-1.5 w-full bg-slate-800/80 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
                <motion.div
                  initial={{ width: "0%" }}
                  animate={{ width: `${((statusStep + 1) / statusMessages.length) * 100}%` }}
                  transition={{ duration: 0.35, ease: "easeInOut" }}
                  className="h-full bg-gradient-to-r from-teal-400 via-amber-300 to-emerald-400 rounded-full shadow-[0_0_12px_rgba(245,158,11,0.6)]"
                />
              </div>

              {/* Status Message */}
              <motion.div
                key={statusStep}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="text-[11px] font-mono text-teal-300/90 flex items-center justify-center gap-1.5 h-5"
              >
                {statusStep === statusMessages.length - 1 ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Cpu className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                )}
                <span>{statusMessages[statusStep]}</span>
              </motion.div>
            </div>

            <p className="text-[10px] font-mono text-slate-500 tracking-widest uppercase pt-2">
              Click anywhere to skip
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};


