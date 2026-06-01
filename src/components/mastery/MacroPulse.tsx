import { useState, useMemo } from "react";
import { motion } from "motion/react";
import { TrendingUp, Activity, DollarSign, PieChart, Info, AlertTriangle, GitBranch, Check, Terminal, RefreshCw, Send } from "lucide-react";
import { cn } from "../../lib/utils";
import { UserProfile } from "../../types";

interface MacroPulseProps {
  user?: UserProfile | null;
}

export function MacroPulse({ user }: MacroPulseProps) {
  const [inflation, setInflation] = useState(2.5);
  const [interestRate, setInterestRate] = useState(4.0);
  const [gdpGrowth, setGdpGrowth] = useState(2.1);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncLogs, setSyncLogs] = useState<string[]>([]);
  const [syncStatus, setSyncStatus] = useState<"idle" | "running" | "success">("idle");

  const gitProvider = user?.gitProvider || "github";

  const analysis = useMemo(() => {
    let status = "Stable";
    let color = "text-accent-emerald";
    let message = "The economy is in a healthy equilibrium. Growth is steady and inflation is under control.";
    
    if (inflation > 8) {
      status = "High Inflation";
      color = "text-accent-red";
      message = "Hyper-inflation risks are present. Purchasing power is eroding rapidly. Consider high-yield hedges.";
    } else if (inflation < 0) {
      status = "Deflationary Trap";
      color = "text-accent-blue";
      message = "Prices are falling, which can lead to reduced spending and economic stagnation.";
    } else if (inflation > 4 && gdpGrowth < 1) {
      status = "Stagflation";
      color = "text-accent-orange";
      message = "Double threat: high inflation combined with stagnant growth. A very challenging environment for investors.";
    }

    const purchasingPowerLoss = (100 * (1 - Math.pow(1 - inflation/100, 5))).toFixed(1);

    return { status, color, message, purchasingPowerLoss };
  }, [inflation, gdpGrowth]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-display font-bold">MacroPulse Engine</h2>
          <p className="text-text-secondary">Simulate global economic shifts and their impact on your wealth.</p>
        </div>
        <div className={cn("px-4 py-2 rounded-full border bg-bg-secondary font-bold text-sm flex items-center gap-2", analysis.color)}>
          <Activity className="w-4 h-4" /> economy: {analysis.status}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="card p-8 space-y-8">
          <h3 className="text-sm font-bold uppercase tracking-widest text-text-muted flex items-center gap-2">
            <TrendingUp className="w-4 h-4" /> Global Parameters
          </h3>
          
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between">
                <label className="text-sm font-medium">Inflation Rate</label>
                <span className="text-accent-gold font-mono font-bold">{inflation}%</span>
              </div>
              <input 
                type="range" min="-2" max="20" step="0.1" 
                value={inflation} onChange={(e) => setInflation(parseFloat(e.target.value))}
                className="w-full accent-accent-gold"
              />
            </div>

            <div className="space-y-4">
              <div className="flex justify-between">
                <label className="text-sm font-medium">Interest Rate (Fed)</label>
                <span className="text-accent-blue font-mono font-bold">{interestRate}%</span>
              </div>
              <input 
                type="range" min="0" max="15" step="0.25" 
                value={interestRate} onChange={(e) => setInterestRate(parseFloat(e.target.value))}
                className="w-full accent-accent-blue"
              />
            </div>

            <div className="space-y-4">
              <div className="flex justify-between">
                <label className="text-sm font-medium">GDP Growth</label>
                <span className="text-accent-emerald font-mono font-bold">{gdpGrowth}%</span>
              </div>
              <input 
                type="range" min="-5" max="10" step="0.5" 
                value={gdpGrowth} onChange={(e) => setGdpGrowth(parseFloat(e.target.value))}
                className="w-full accent-accent-emerald"
              />
            </div>
          </div>

          <div className="p-4 bg-bg-secondary/50 rounded-xl border border-border text-sm italic text-text-secondary">
            <Info className="w-4 h-4 inline mr-2 text-accent-gold" />
            Adjusting these sliders simulates how real-world policy shifts affect the markets.
          </div>
        </div>

        <div className="lg:col-span-2 space-y-8">
          <div className="card p-8 space-y-6 border-accent-gold/20">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-accent-gold/10 flex items-center justify-center text-accent-gold">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Impact Analysis</h3>
                <p className={cn("text-sm font-medium", analysis.color)}>{analysis.message}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              <div className="p-6 bg-bg-secondary rounded-2xl space-y-2 border border-border">
                <div className="text-[10px] text-text-muted uppercase tracking-widest font-bold font-mono">5yr Purchasing Power Loss</div>
                <div className="text-3xl font-display font-bold text-accent-red font-mono">-{analysis.purchasingPowerLoss}%</div>
                <p className="text-xs text-text-secondary">At {inflation}% inflation, simulated wealth is devaluating continuously.</p>
              </div>

              <div className="p-6 bg-bg-secondary rounded-2xl space-y-2 border border-border">
                <div className="text-[10px] text-text-muted uppercase tracking-widest font-bold font-mono">Recommended Policy</div>
                <div className="text-xl font-bold text-accent-gold">
                  {inflation > 5 ? "Aggressive Hikes" : inflation < 1 ? "Stimulus Package" : "Maintain Neutral"}
                </div>
                <p className="text-xs text-text-secondary">Suggested macro mitigation model for active portfolios.</p>
              </div>
            </div>

            {/* GitOps Policy Serialization Accordion/Box */}
            <div className="pt-6 border-t border-border/60 space-y-4 font-sans">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-bg-secondary/40 p-4 rounded-xl border border-border/80">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <GitBranch className="w-4 h-4 text-accent-gold animate-pulse" />
                    <span className="text-xs font-bold uppercase tracking-wider text-text-primary font-sans">Wealth-As-Code: Macro Buffer</span>
                  </div>
                  <p className="text-[10px] text-text-muted leading-relaxed font-sans">
                    Instantly compile these {inflation}% inflation levels into an automated target asset multiplier on <strong className="text-accent-gold uppercase font-mono">{gitProvider}</strong>.
                  </p>
                </div>
                
                <button
                  type="button"
                  onClick={async () => {
                    if (isSyncing) return;
                    setIsSyncing(true);
                    setSyncStatus("running");
                    setSyncLogs([]);
                    
                    const mLogs = [
                      `Initializing gitops commit daemon...`,
                      `Connecting user repository under active directory /wealth-policies...`,
                      `Writing "macro-buffer.json" config with inflationLimit: ${inflation}% & targetRate: ${interestRate}%...`,
                      `Packing payload to ${gitProvider.toUpperCase()} commit stream...`,
                      `SUCCESS: Policy file recorded on branch main. Commit ${Math.random().toString(16).substring(2,8).toUpperCase()} finalized.`
                    ];

                    for(let i=0; i<mLogs.length; i++){
                      await new Promise(r => setTimeout(r, i * 200 + 100));
                      setSyncLogs(prev => [...prev, `[GitOps] ${mLogs[i]}`]);
                    }
                    setSyncStatus("success");
                    setIsSyncing(false);
                  }}
                  disabled={isSyncing}
                  className="btn-primary text-[10px] font-bold uppercase tracking-widest py-2 px-4 flex items-center gap-2 shrink-0 self-center cursor-pointer"
                >
                  {isSyncing ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-bg-void" />
                  ) : syncStatus === "success" ? (
                    <Check className="w-3.5 h-3.5 text-bg-void" />
                  ) : (
                    <Send className="w-3.5 h-3.5 text-bg-void" />
                  )}
                  {isSyncing ? "Committing..." : syncStatus === "success" ? "Committed!" : `Commit to ${gitProvider}`}
                </button>
              </div>

              {syncLogs.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-bg-void border border-border p-4 rounded-xl font-mono text-[9px] leading-normal space-y-1 text-text-secondary select-none"
                >
                  <div className="flex items-center justify-between font-bold text-accent-gold border-b border-border/40 pb-1.5 mb-1.5">
                    <span className="flex items-center gap-1"><Terminal className="w-3 h-3 text-accent-emerald" /> CONSOLE OUTPUT</span>
                    <span className="text-[8px] uppercase font-mono">{gitProvider} repository terminal</span>
                  </div>
                  {syncLogs.map((l, li) => (
                    <div key={li} className={cn("font-mono", l.includes("SUCCESS") ? "text-accent-emerald font-bold" : "text-text-secondary")}>{l}</div>
                  ))}
                </motion.div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card p-6 bg-bg-secondary/30 border-border/40 text-center space-y-2">
              <DollarSign className="w-6 h-6 mx-auto text-accent-gold" />
              <div className="text-[10px] text-text-muted uppercase font-bold tracking-wider">Stock Market</div>
              <div className={cn("text-lg font-bold", interestRate > 7 ? "text-accent-red" : "text-accent-emerald")}>
                {interestRate > 7 ? "Bearish Pressure" : "Bullish Growth"}
              </div>
            </div>
            
            <div className="card p-6 bg-bg-secondary/30 border-border/40 text-center space-y-2">
              <PieChart className="w-6 h-6 mx-auto text-accent-blue" />
              <div className="text-[10px] text-text-muted uppercase font-bold tracking-wider">Real Estate</div>
              <div className={cn("text-lg font-bold", interestRate > 6 ? "text-accent-red" : "text-accent-emerald")}>
                {interestRate > 6 ? "Cooling Down" : "High Demand"}
              </div>
            </div>

            <div className="card p-6 bg-bg-secondary/30 border-border/40 text-center space-y-2">
              <Activity className="w-6 h-6 mx-auto text-accent-purple" />
              <div className="text-[10px] text-text-muted uppercase font-bold tracking-wider">Gold/Bitcoin</div>
              <div className={cn("text-lg font-bold", inflation > 6 ? "text-accent-gold" : "text-text-muted")}>
                {inflation > 6 ? "Hedge Mode" : "Neutral"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
