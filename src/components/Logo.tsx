import { motion } from "motion/react";
import { ShieldCheck, TrendingUp } from "lucide-react";

export function Logo({ className = "", size = "md" }: { className?: string; size?: "sm" | "md" | "lg" | "xl" }) {
  const sizes = {
    sm: "h-6",
    md: "h-8",
    lg: "h-12",
    xl: "h-20"
  };

  const iconSizes = {
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
      <div className={`relative ${iconSizes[size]} flex items-center justify-center`}>
        {/* Shield Background */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="absolute inset-0 bg-accent-gold/10 rounded-xl border border-accent-gold/20"
        />
        
        {/* Animated Graph Icon */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="relative z-10 text-accent-gold"
        >
          <TrendingUp className="w-full h-full p-[20%]" strokeWidth={2.5} />
        </motion.div>

        {/* Glow Effect */}
        <motion.div
          animate={{ 
            opacity: [0.2, 0.4, 0.2],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute inset-0 bg-accent-gold/30 blur-xl rounded-full -z-10"
        />
      </div>
      
      <div className={`flex items-baseline font-serif ${textSizes[size]}`}>
        <span className="font-light text-text-primary tracking-tight">WealthWise</span>
        <span className="font-bold text-accent-gold ml-1.5 tracking-tighter">Elite</span>
      </div>
    </div>
  );
}
