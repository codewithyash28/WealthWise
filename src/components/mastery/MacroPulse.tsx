import { useState, useMemo } from "react";
import { motion } from "motion/react";
import { TrendingUp, Activity, DollarSign, PieChart, Info, AlertTriangle } from "lucide-react";
import { cn } from "../../lib/utils";

export function MacroPulse() {
  const [inflation, setInflation] = useState(2.5);
  const [interestRate, setInterestRate] = useState(4.0);
  const [gdpGrowth, setGdpGrowth] = useState(2.1);

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
                <div className="text-[10px] text-text-muted uppercase tracking-widest font-bold">5yr Purchasing Power Loss</div>
                <div className="text-3xl font-display font-bold text-accent-red">-{analysis.purchasingPowerLoss}%</div>
                <p className="text-xs text-text-secondary">At {inflation}% inflation, ₹100,000 will be worth ₹{(100 - parseFloat(analysis.purchasingPowerLoss)).toFixed(1)}k in 5 years.</p>
              </div>

              <div className="p-6 bg-bg-secondary rounded-2xl space-y-2 border border-border">
                <div className="text-[10px] text-text-muted uppercase tracking-widest font-bold">Recommended Policy</div>
                <div className="text-xl font-bold text-accent-gold">
                  {inflation > 5 ? "Aggressive Hikes" : inflation < 1 ? "Stimulus Package" : "Maintain Neutral"}
                </div>
                <p className="text-xs text-text-secondary">Based on current simulated parameters for optimal growth.</p>
              </div>
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
