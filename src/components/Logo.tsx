import { motion } from "motion/react";

export function Logo({ className = "", size = "md", iconOnly = false }: { className?: string; size?: "sm" | "md" | "lg" | "xl"; iconOnly?: boolean }) {
  const sizes = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-12 h-12",
    xl: "w-20 h-20"
  };

  const textSizes = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-4xl",
    xl: "text-6xl"
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`relative ${sizes[size]} flex items-center justify-center shrink-0`}>
        {/* Elegant Animated SVG Vector Shield + Graph */}
        <motion.svg
          viewBox="0 0 512 512"
          className="w-full h-full"
          initial="initial"
          animate="animate"
          whileHover="hover"
        >
          <defs>
            <radialGradient id="logo-bg-grad" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
              <stop offset="0%" stopColor="#0F172A" />
              <stop offset="100%" stopColor="#020617" />
            </radialGradient>
            
            <linearGradient id="logo-gold-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FCD34D" />
              <stop offset="50%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#D97706" />
            </linearGradient>

            <linearGradient id="logo-emerald-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#34D399" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
            
            <filter id="logo-gold-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Deep Obsidian Circular Background */}
          <motion.circle
            cx="256"
            cy="256"
            r="240"
            fill="url(#logo-bg-grad)"
            stroke="url(#logo-gold-grad)"
            strokeWidth="4"
            variants={{
              hover: { scale: 1.05 }
            }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
          />

          {/* Shield Outer Shape */}
          <motion.path
            d="M 256 100 
               C 340 100, 390 120, 390 180 
               C 390 280, 290 380, 256 410 
               C 222 380, 122 280, 122 180 
               C 122 120, 172 100, 256 100 Z" 
            fill="#020617" 
            stroke="url(#logo-gold-grad)" 
            strokeWidth="12" 
            strokeLinejoin="round"
            filter="url(#logo-gold-glow)"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            variants={{
              hover: { scale: 1.03 }
            }}
            transition={{ type: "spring", stiffness: 150, damping: 18 }}
          />

          {/* Inner Decorative Dashed Shield */}
          <motion.path
            d="M 256 125 
               C 320 125, 360 141, 360 185 
               C 360 260, 282 342, 256 370 
               C 230 342, 152 260, 152 185 
               C 152 141, 192 125, 256 125 Z" 
            fill="none" 
            stroke="url(#logo-gold-grad)" 
            strokeWidth="3" 
            strokeDasharray="8 6" 
            opacity="0.6"
            animate={{ strokeDashoffset: [0, -50] }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          />

          {/* Bullish Graph Trendline – dynamically draws on entrance */}
          <motion.path
            d="M 170 290 
               L 220 250 
               L 270 280 
               L 340 190" 
            fill="none" 
            stroke="url(#logo-emerald-grad)" 
            strokeWidth="14" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 0.4, duration: 1.2, ease: "easeInOut" }}
          />
          
          {/* Sparkle star at the peak */}
          <motion.path
            d="M 340 190 L 345 175 L 360 170 L 345 165 L 340 150 L 335 165 L 320 170 L 335 175 Z" 
            fill="#F59E0B"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.2, 1], opacity: [0, 1, 1] }}
            transition={{ delay: 1.2, duration: 0.4 }}
            whileHover={{ scale: 1.4, rotate: 18 }}
          />
        </motion.svg>
      </div>
      
      {!iconOnly && (
        <div className={`flex items-baseline font-serif ${textSizes[size]}`}>
          <span className="font-light text-text-primary tracking-tight">WealthWise</span>
          <span className="font-bold text-accent-gold ml-1.5 tracking-tighter">Elite</span>
        </div>
      )}
    </div>
  );
}
