import { motion } from "motion/react";
import { useState } from "react";

export function Logo({ 
  className = "", 
  size = "md", 
  iconOnly = false,
  onClick
}: { 
  className?: string; 
  size?: "sm" | "md" | "lg" | "xl"; 
  iconOnly?: boolean;
  onClick?: () => void;
}) {
  const [imgError, setImgError] = useState(false);

  const sizes = {
    sm: "w-7 h-7",
    md: "w-10 h-10",
    lg: "w-14 h-14",
    xl: "w-22 h-22"
  };

  const textSizes = {
    sm: "text-base",
    md: "text-xl",
    lg: "text-3xl",
    xl: "text-5xl"
  };

  return (
    <div 
      onClick={onClick}
      className={`flex items-center gap-3 cursor-pointer group ${className}`}
    >
      <div className={`relative ${sizes[size]} flex items-center justify-center shrink-0`}>
        {/* Soft Ambient Glow Halo */}
        <motion.div
          animate={{ scale: [0.95, 1.1, 0.95], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -inset-1 bg-gradient-to-r from-teal-500 via-amber-400 to-teal-400 rounded-full blur-md"
        />
        
        {/* Main Logo Image Ring */}
        <motion.div
          whileHover={{ scale: 1.08, rotate: 3 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300, damping: 15 }}
          className="w-full h-full rounded-full p-[2px] bg-gradient-to-tr from-teal-400 via-amber-300 to-teal-200 shadow-xl relative z-10 overflow-hidden"
        >
          <img
            src={imgError ? "/logo.svg" : "/wexa-avatar.jpg"}
            alt="Wexa AI Logo"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover rounded-full bg-slate-950 border border-slate-900"
          />
        </motion.div>
      </div>
      
      {!iconOnly && (
        <div className={`flex items-baseline font-sans ${textSizes[size]}`}>
          <span className="font-extrabold text-white tracking-tight group-hover:text-teal-300 transition-colors">Wexa</span>
          <span className="font-extrabold bg-gradient-to-r from-teal-400 via-amber-300 to-teal-200 bg-clip-text text-transparent ml-1 tracking-tight">AI</span>
          <span className="text-[10px] font-mono font-bold text-teal-300 bg-teal-500/10 border border-teal-500/20 px-1.5 py-0.5 rounded-md ml-2 uppercase tracking-wider hidden sm:inline-block">
            Agent
          </span>
        </div>
      )}
    </div>
  );
}

