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
        <motion.div
          animate={{ scale: [0.95, 1, 0.95] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 bg-accent-gold/25 rounded-full blur-md"
        />
        <motion.img
          src="/logo-designed.png"
          alt="WealthWise Elite Logo"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover rounded-full border border-accent-gold/30 shadow-2xl relative z-10 bg-bg-void"
          whileHover={{ scale: 1.08 }}
          transition={{ type: "spring", stiffness: 300, damping: 15 }}
        />
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
