import { useState, useMemo } from "react";
import { motion } from "motion/react";
import { Sparkles, ArrowRight, ShieldCheck, Wallet, Info, Activity, AlertCircle } from "lucide-react";
import { cn } from "../../lib/utils";

interface StakingOption {
  id: string;
  name: string;
  apy: number;
  risk: "Low" | "Medium" | "High";
  desc: string;
  lockPeriod: string;
}

const STAKING_OPTIONS: StakingOption[] = [
  { id: "stable", name: "StablePool (USDC)", apy: 5.2, risk: "Low", desc: "Minimal volatility, low rewards. Best for capital preservation.", lockPeriod: "None" },
  { id: "eth", name: "Liquid Eth (stETH)", apy: 12.4, risk: "Medium", desc: "Exposure to Ethereum price plus staking rewards.", lockPeriod: "7 Days" },
  { id: "degen", name: "Alpha Yield (DGEN)", apy: 45.8, risk: "High", desc: "Extremely high rewards with significant smart-contract risk.", lockPeriod: "30 Days" },
];

export function MockYield() {
  const [selectedOption, setSelectedOption] = useState<StakingOption>(STAKING_OPTIONS[0]);
  const [investAmount, setInvestAmount] = useState(1000);
  const [years, setYears] = useState(1);

  const projection = useMemo(() => {
    const total = investAmount * Math.pow(1 + selectedOption.apy / 100, years);
    const profit = total - investAmount;
    return { total, profit };
  }, [investAmount, selectedOption, years]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-display font-bold">MockYield DeFi Hub</h2>
          <p className="text-text-secondary">Master decentralized finance safely. Simulate staking strategies and yield projections.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-accent-purple/10 border border-accent-purple/20 rounded-full text-accent-purple text-xs font-bold uppercase tracking-widest">
          <Activity className="w-4 h-4" /> Live Yield Simulation
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-widest text-text-muted flex items-center gap-2">
            <Wallet className="w-4 h-4" /> Staking Prototypes
          </h3>
          {STAKING_OPTIONS.map((option) => (
            <motion.div
              key={option.id}
              onClick={() => setSelectedOption(option)}
              className={cn(
                "card p-6 cursor-pointer border-border/40 transition-all hover:border-accent-purple/40",
                selectedOption.id === option.id ? "bg-bg-secondary border-accent-purple/60" : "bg-bg-secondary/30"
              )}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="font-bold text-lg">{option.name}</span>
                <span className={cn(
                  "text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded",
                  option.risk === "Low" ? "bg-accent-emerald/10 text-accent-emerald" :
                  option.risk === "Medium" ? "bg-accent-gold/10 text-accent-gold" : "bg-accent-red/10 text-accent-red"
                )}>
                  {option.risk} Risk
                </span>
              </div>
              <div className="text-2xl font-display font-bold text-accent-purple">{option.apy}% APY</div>
              <p className="text-xs text-text-secondary mt-2 line-clamp-2">{option.desc}</p>
            </motion.div>
          ))}
        </div>

        <div className="lg:col-span-2 space-y-8">
          <div className="card p-8 border-accent-purple/20 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                 <div className="space-y-3">
                   <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Simulated Amount</label>
                   <div className="flex items-center gap-2">
                     <span className="text-text-muted font-mono">$</span>
                     <input 
                       type="number" 
                       value={investAmount}
                       onChange={(e) => setInvestAmount(parseInt(e.target.value) || 0)}
                       className="w-full bg-bg-secondary border border-border p-3 rounded-xl font-mono text-xl"
                     />
                   </div>
                 </div>

                 <div className="space-y-3">
                   <div className="flex justify-between">
                     <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Duration</label>
                     <span className="font-bold">{years} {years === 1 ? 'Year' : 'Years'}</span>
                   </div>
                   <input 
                     type="range" min="1" max="10" 
                     value={years} onChange={(e) => setYears(parseInt(e.target.value))}
                     className="w-full accent-accent-purple"
                   />
                 </div>
              </div>

              <div className="p-8 bg-bg-secondary/50 rounded-2xl border border-border flex flex-col justify-center items-center text-center space-y-2">
                <div className="text-[10px] text-text-muted uppercase tracking-widest font-bold">Estimated Yield</div>
                <div className="text-5xl font-display font-bold text-accent-purple">${Math.round(projection.total).toLocaleString()}</div>
                <div className="flex items-center gap-1 text-accent-emerald text-sm font-bold">
                  <ArrowRight className="w-4 h-4" rotate={-45} />
                  +${Math.round(projection.profit).toLocaleString()} profit
                </div>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-accent-red/10 border border-accent-red/20 rounded-xl">
               <AlertCircle className="w-5 h-5 text-accent-red shrink-0 mt-0.5" />
               <div className="space-y-1">
                 <div className="text-xs font-bold text-accent-red uppercase tracking-wider">Smart Contract Risk Warning</div>
                 <p className="text-xs text-text-secondary leading-relaxed">
                   High APY often compensates for "Smart Contract Risk" or "Impermanent Loss." If the underlying protocol is compromised, your total investment could go to zero (simulated).
                 </p>
               </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card p-6 bg-bg-secondary/40 border-border/40 space-y-4">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-accent-gold/10 flex items-center justify-center text-accent-gold">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold">What is APY?</h4>
               </div>
               <p className="text-sm text-text-secondary leading-relaxed italic">
                 "Annual Percentage Yield (APY) accounts for the effect of compound interest. Unlike APR, it reflects the actual return you'd get after 1 year if interest is reinvested."
               </p>
            </div>

            <div className="card p-6 bg-bg-secondary/40 border-border/40 space-y-4">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-accent-emerald/10 flex items-center justify-center text-accent-emerald">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold">Protocol Audits</h4>
               </div>
               <p className="text-sm text-text-secondary leading-relaxed">
                 Before investing in real DeFi, always check if the protocol has been audited by firms like Trail of Bits or OpenZeppelin. Audits significantly reduce (but don't eliminate) risk.
               </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
