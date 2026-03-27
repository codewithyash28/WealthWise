import { motion } from "motion/react";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative w-8 h-8 flex items-end gap-[2px]">
        <motion.div 
          initial={{ height: 0 }}
          animate={{ height: "40%" }}
          className="w-1 bg-accent-gold/40 rounded-t-sm"
        />
        <motion.div 
          initial={{ height: 0 }}
          animate={{ height: "70%" }}
          transition={{ delay: 0.1 }}
          className="w-1 bg-accent-gold/60 rounded-t-sm"
        />
        <motion.div 
          initial={{ height: 0 }}
          animate={{ height: "50%" }}
          transition={{ delay: 0.2 }}
          className="w-1 bg-accent-gold/80 rounded-t-sm"
        />
        <motion.div 
          initial={{ height: 0 }}
          animate={{ height: "90%" }}
          transition={{ delay: 0.3 }}
          className="w-1 bg-accent-gold rounded-t-sm"
        />
        <motion.div 
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="absolute bottom-0 left-0 w-full h-full"
        >
          <svg viewBox="0 0 32 32" className="w-full h-full overflow-visible">
            <motion.path
              d="M2 28 L10 20 L18 24 L30 8 L30 16 M30 8 L22 8"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-accent-gold"
            />
          </svg>
        </motion.div>
      </div>
      <div className="flex items-baseline font-serif">
        <span className="text-2xl font-light text-text-primary">WealthWise</span>
        <span className="text-2xl font-semibold text-accent-gold ml-1">Elite</span>
      </div>
    </div>
  );
}
