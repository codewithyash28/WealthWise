import { useState, useMemo } from "react";
import { motion } from "motion/react";
import { Home, Key, TrendingUp, DollarSign, Calculator, Info, CheckCircle2 } from "lucide-react";
import { cn } from "../../lib/utils";

export function LiveOrLease() {
  const [propertyPrice, setPropertyPrice] = useState(5000000);
  const [monthlyRent, setMonthlyRent] = useState(25000);
  const [downPaymentPct, setDownPaymentPct] = useState(20);
  const [timeHorizon, setTimeHorizon] = useState(10);
  const [appreciationRate, setAppreciationRate] = useState(5);

  const analysis = useMemo(() => {
    // Basic Buy Calculations
    const downPayment = propertyPrice * (downPaymentPct / 100);
    const loanAmount = propertyPrice - downPayment;
    const interestRate = 0.085; // Fixed for simulation
    const monthlyInterestRate = interestRate / 12;
    const n = 20 * 12; // 20 year mortgage
    const monthlyEMI = loanAmount * (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, n)) / (Math.pow(1 + monthlyInterestRate, n) - 1);
    
    const propertyValueAfterX = propertyPrice * Math.pow(1 + appreciationRate / 100, timeHorizon);
    const totalPaidBuy = (monthlyEMI * 12 * timeHorizon) + downPayment;
    const netWealthBuy = propertyValueAfterX - (loanAmount * 0.5); // Simplified remaining principal

    // Basic Rent Calculations
    const initialInvested = downPayment;
    const investmentReturn = 0.12; // 12% equity market return
    const investedGrowth = initialInvested * Math.pow(1 + investmentReturn, timeHorizon);
    
    // Rent difference invested (if monthly rent < EMI)
    const monthlyDiff = Math.max(0, monthlyEMI - monthlyRent);
    const diffGrowth = monthlyDiff * ((Math.pow(1 + investmentReturn / 12, timeHorizon * 12) - 1) / (investmentReturn / 12));
    
    const netWealthRent = investedGrowth + diffGrowth;

    const winner = netWealthBuy > netWealthRent ? "Buying" : "Renting";
    const delta = Math.abs(netWealthBuy - netWealthRent);

    return { monthlyEMI, propertyValueAfterX, netWealthBuy, netWealthRent, winner, delta };
  }, [propertyPrice, monthlyRent, downPaymentPct, timeHorizon, appreciationRate]);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-display font-bold">LiveOrLease Simulator</h2>
        <p className="text-text-secondary">The ultimate Rent vs. Buy engine. Visualize long-term wealth projections for your next big move.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="card p-8 space-y-8">
          <h3 className="text-sm font-bold uppercase tracking-widest text-text-muted flex items-center gap-2">
            <Calculator className="w-4 h-4" /> Parameters
          </h3>
          
          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Property Price</label>
              <div className="flex items-center gap-2">
                 <span className="text-text-muted font-mono">₹</span>
                 <input 
                   type="number" 
                   value={propertyPrice} 
                   onChange={(e) => setPropertyPrice(parseInt(e.target.value) || 0)}
                   className="w-full bg-bg-secondary border border-border p-2 rounded-xl font-mono font-bold"
                 />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Monthly Rent</label>
              <div className="flex items-center gap-2">
                 <span className="text-text-muted font-mono">₹</span>
                 <input 
                   type="number" 
                   value={monthlyRent} 
                   onChange={(e) => setMonthlyRent(parseInt(e.target.value) || 0)}
                   className="w-full bg-bg-secondary border border-border p-2 rounded-xl font-mono font-bold"
                 />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Time Horizon</label>
                <span className="text-accent-gold font-bold">{timeHorizon} Years</span>
              </div>
              <input 
                type="range" min="1" max="30" 
                value={timeHorizon} onChange={(e) => setTimeHorizon(parseInt(e.target.value))}
                className="w-full accent-accent-gold"
              />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Annual Appreciation</label>
                <span className="text-accent-emerald font-bold">{appreciationRate}%</span>
              </div>
              <input 
                type="range" min="0" max="15" 
                value={appreciationRate} onChange={(e) => setAppreciationRate(parseInt(e.target.value))}
                className="w-full accent-accent-emerald"
              />
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-8">
           <div className="card p-8 border-accent-gold/20 overflow-hidden relative">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                 <Home className="w-48 h-48" />
              </div>
              
              <div className="relative z-10 space-y-8">
                 <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center font-bold text-bg-void",
                      analysis.winner === "Buying" ? "bg-accent-emerald" : "bg-accent-blue"
                    )}>
                       {analysis.winner === "Buying" ? <Home className="w-6 h-6" /> : <Key className="w-6 h-6" />}
                    </div>
                    <div>
                       <h3 className="text-2xl font-bold">Recommended Path: <span className={analysis.winner === "Buying" ? "text-accent-emerald" : "text-accent-blue"}>{analysis.winner}</span></h3>
                       <p className="text-text-secondary text-sm">Based on a {timeHorizon} year projection, {analysis.winner.toLowerCase()} results in ₹{Math.round(analysis.delta / 100000).toLocaleString()}L more wealth.</p>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                       <div className="flex items-center gap-2 text-accent-emerald font-bold text-sm uppercase tracking-widest">
                          <CheckCircle2 className="w-4 h-4" /> Why Buying?
                       </div>
                       <div className="space-y-3">
                          <div className="flex justify-between border-b border-border/50 pb-2">
                             <span className="text-text-secondary text-sm">Monthly EMI</span>
                             <span className="font-mono font-bold">₹{Math.round(analysis.monthlyEMI).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between border-b border-border/50 pb-2">
                             <span className="text-text-secondary text-sm">Future Property Value</span>
                             <span className="font-mono font-bold">₹{Math.round(analysis.propertyValueAfterX / 100000).toLocaleString()}L</span>
                          </div>
                          <div className="flex justify-between font-bold pt-2">
                             <span>Final Buy Wealth</span>
                             <span className="text-accent-emerald">₹{Math.round(analysis.netWealthBuy / 100000).toLocaleString()}L</span>
                          </div>
                       </div>
                    </div>

                    <div className="space-y-4">
                       <div className="flex items-center gap-2 text-accent-blue font-bold text-sm uppercase tracking-widest">
                          <TrendingUp className="w-4 h-4" /> Why Renting?
                       </div>
                       <div className="space-y-3">
                          <div className="flex justify-between border-b border-border/50 pb-2">
                             <span className="text-text-secondary text-sm">Invested Down Payment</span>
                             <span className="font-mono font-bold">₹{Math.round((propertyPrice * downPaymentPct / 100) / 100000).toLocaleString()}L</span>
                          </div>
                          <div className="flex justify-between border-b border-border/50 pb-2">
                             <span className="text-text-secondary text-sm">Investment Growth (12%)</span>
                             <span className="font-mono font-bold">₹{Math.round(analysis.netWealthRent / 100000).toLocaleString()}L</span>
                          </div>
                          <div className="flex justify-between font-bold pt-2">
                             <span>Final Rent Wealth</span>
                             <span className="text-accent-blue">₹{Math.round(analysis.netWealthRent / 100000).toLocaleString()}L</span>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="card p-6 bg-bg-secondary/50 border-border/60">
                 <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-accent-gold/10 flex items-center justify-center text-accent-gold">
                       <DollarSign className="w-5 h-5" />
                    </div>
                    <h4 className="font-bold">Tax Savings Insight</h4>
                 </div>
                 <p className="text-sm text-text-secondary leading-relaxed">
                    Buying a property allows you to deduct interest payments from your income tax. However, renting allows for HRA (House Rent Allowance) claims. WealthWise Elite automatically weights these for you.
                 </p>
              </div>

              <div className="card p-6 bg-bg-secondary/50 border-border/60">
                 <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-accent-purple/10 flex items-center justify-center text-accent-purple">
                       <Info className="w-5 h-5" />
                    </div>
                    <h4 className="font-bold">Market Volatility</h4>
                 </div>
                 <p className="text-sm text-text-secondary leading-relaxed">
                    Property is generally less volatile than the stock market. If you are risk-averse, the stability of owning "bricks and mortar" might outweigh the mathematical gains of renting and investing.
                 </p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
