import React, { useState, useMemo } from "react";
import { motion } from "motion/react";
import { 
  Calculator, 
  Home, 
  Building, 
  TrendingUp, 
  HelpCircle, 
  CheckCircle2, 
  Sliders, 
  DollarSign, 
  Percent, 
  Sparkles,
  Info
} from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export const RentVsBuySimulator: React.FC = () => {
  // Inputs
  const [homePrice, setHomePrice] = useState<number>(450000);
  const [downPaymentPct, setDownPaymentPct] = useState<number>(20);
  const [mortgageRate, setMortgageRate] = useState<number>(6.5);
  const [appreciationRate, setAppreciationRate] = useState<number>(4.0);
  
  const [monthlyRent, setMonthlyRent] = useState<number>(2200);
  const [rentInflation, setRentInflation] = useState<number>(3.5);
  const [investmentReturn, setInvestmentReturn] = useState<number>(7.5);
  const [years, setYears] = useState<number>(10);

  // Math Calculations
  const simulationData = useMemo(() => {
    const downPayment = (homePrice * downPaymentPct) / 100;
    const loanAmount = homePrice - downPayment;
    const monthlyMortgageRate = mortgageRate / 100 / 12;
    const numPayments = 30 * 12;
    
    // Monthly Principal & Interest Payment
    const monthlyMortgagePayment =
      monthlyMortgageRate > 0
        ? (loanAmount * (monthlyMortgageRate * Math.pow(1 + monthlyMortgageRate, numPayments))) /
          (Math.pow(1 + monthlyMortgageRate, numPayments) - 1)
        : loanAmount / numPayments;

    const propertyTaxMonthly = (homePrice * 0.012) / 12;
    const homeInsuranceMonthly = 120;
    const totalMonthlyBuyCost = monthlyMortgagePayment + propertyTaxMonthly + homeInsuranceMonthly;

    const yearlyData = [];
    let currentHomeVal = homePrice;
    let currentRent = monthlyRent;
    let currentLoanBalance = loanAmount;
    
    // Rent & Invest Scenario: Renter starts with down payment invested in market
    let renterInvestments = downPayment;

    for (let yr = 1; yr <= years; yr++) {
      // Home appreciation over year
      currentHomeVal *= (1 + appreciationRate / 100);

      // Amortization (rough annual approximation)
      for (let m = 0; m < 12; m++) {
        const interestPaid = currentLoanBalance * monthlyMortgageRate;
        const principalPaid = monthlyMortgagePayment - interestPaid;
        currentLoanBalance = Math.max(0, currentLoanBalance - principalPaid);
      }

      // Buyer Home Equity
      const buyerEquity = currentHomeVal - currentLoanBalance;

      // Renter Investment Growth
      renterInvestments *= (1 + investmentReturn / 100);

      // Monthly difference invested by renter if rent < buy cost
      const annualBuyExpense = totalMonthlyBuyCost * 12;
      const annualRentExpense = currentRent * 12;
      const monthlySavingsToInvest = Math.max(0, (annualBuyExpense - annualRentExpense));
      renterInvestments += monthlySavingsToInvest;

      // Rent inflation for next year
      currentRent *= (1 + rentInflation / 100);

      yearlyData.push({
        year: `Yr ${yr}`,
        buyerNetWorth: Math.round(buyerEquity),
        renterNetWorth: Math.round(renterInvestments)
      });
    }

    const finalBuyerNW = yearlyData[yearlyData.length - 1]?.buyerNetWorth || 0;
    const finalRenterNW = yearlyData[yearlyData.length - 1]?.renterNetWorth || 0;
    const delta = Math.abs(finalBuyerNW - finalRenterNW);
    const winner = finalBuyerNW > finalRenterNW ? "Buying" : "Renting & Investing";

    return {
      monthlyMortgagePayment,
      totalMonthlyBuyCost,
      downPayment,
      yearlyData,
      finalBuyerNW,
      finalRenterNW,
      delta,
      winner
    };
  }, [homePrice, downPaymentPct, mortgageRate, appreciationRate, monthlyRent, rentInflation, investmentReturn, years]);

  const chartData = {
    labels: simulationData.yearlyData.map(d => d.year),
    datasets: [
      {
        label: 'Buying (Home Equity Net Worth)',
        data: simulationData.yearlyData.map(d => d.buyerNetWorth),
        borderColor: '#0d9488',
        backgroundColor: 'rgba(13, 148, 136, 0.15)',
        fill: true,
        tension: 0.3
      },
      {
        label: 'Renting & Investing Down Payment',
        data: simulationData.yearlyData.map(d => d.renterNetWorth),
        borderColor: '#f59e0b',
        backgroundColor: 'rgba(245, 158, 11, 0.15)',
        fill: true,
        tension: 0.3
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#cbd5e1',
          font: { family: 'sans-serif', size: 11 }
        }
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(255,255,255,0.05)' },
        ticks: { color: '#94a3b8' }
      },
      y: {
        grid: { color: 'rgba(255,255,255,0.05)' },
        ticks: { 
          color: '#94a3b8',
          callback: (value: any) => `$${(value / 1000).toFixed(0)}k`
        }
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-teal-400 font-bold text-xs uppercase tracking-wider">
            <Calculator className="w-4 h-4" />
            Transparent What-If Simulator
          </div>
          <h2 className="text-xl font-extrabold text-white">
            Rent vs. Buy Capital Growth Simulator
          </h2>
          <p className="text-xs text-slate-400 max-w-xl">
            Compare long-term wealth creation between purchasing a home vs. renting and investing the down payment surplus into index funds.
          </p>
        </div>

        {/* Winner Highlight Card */}
        <div className="bg-slate-950 border border-teal-800/50 p-4 rounded-xl shrink-0 text-right">
          <div className="text-[10px] font-mono uppercase text-slate-400">10-Year Wealth Winner</div>
          <div className="text-base font-extrabold text-teal-300 flex items-center justify-end gap-1.5">
            <Sparkles className="w-4 h-4 text-teal-400 animate-pulse" />
            {simulationData.winner}
          </div>
          <div className="text-xs font-mono text-emerald-400 font-bold">
            +${simulationData.delta.toLocaleString()} Net Worth Advantage
          </div>
        </div>
      </div>

      {/* Input Controls & Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Controls Column */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
            <Sliders className="w-4 h-4 text-teal-400" />
            Simulation Parameters
          </div>

          {/* Home Purchase Inputs */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-teal-300 flex items-center gap-1.5">
              <Home className="w-3.5 h-3.5" /> Buying Parameters
            </div>
            
            <div className="space-y-1">
              <label className="text-[11px] text-slate-400 flex justify-between">
                <span>Target Home Price</span>
                <span className="font-mono text-white">${homePrice.toLocaleString()}</span>
              </label>
              <input 
                type="range" 
                min={150000} 
                max={1500000} 
                step={25000}
                value={homePrice} 
                onChange={(e) => setHomePrice(Number(e.target.value))}
                className="w-full accent-teal-400 cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-slate-400">Down Payment ({downPaymentPct}%)</label>
                <div className="text-xs font-mono font-bold text-slate-200">${simulationData.downPayment.toLocaleString()}</div>
              </div>
              <div>
                <label className="text-[10px] text-slate-400">Mortgage Rate</label>
                <div className="text-xs font-mono font-bold text-slate-200">{mortgageRate}%</div>
              </div>
            </div>
          </div>

          {/* Rent Inputs */}
          <div className="space-y-3 pt-3 border-t border-slate-800">
            <div className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5" /> Renting & Investing Parameters
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-slate-400 flex justify-between">
                <span>Monthly Rent</span>
                <span className="font-mono text-white">${monthlyRent.toLocaleString()}/mo</span>
              </label>
              <input 
                type="range" 
                min={800} 
                max={6000} 
                step={100}
                value={monthlyRent} 
                onChange={(e) => setMonthlyRent(Number(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-slate-400">Annual Rent Inflation</label>
                <div className="text-xs font-mono font-bold text-slate-200">{rentInflation}%</div>
              </div>
              <div>
                <label className="text-[10px] text-slate-400">Index Fund Return</label>
                <div className="text-xs font-mono font-bold text-slate-200">{investmentReturn}%</div>
              </div>
            </div>
          </div>
        </div>

        {/* Chart Column */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-6 flex flex-col justify-between shadow-xl">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-teal-400" />
                10-Year Compounded Net Worth Projection
              </h3>
              <div className="text-xs font-mono text-slate-400">
                Monthly Buy Total: <span className="text-teal-300 font-bold">${Math.round(simulationData.totalMonthlyBuyCost)}</span>
              </div>
            </div>
            
            <div className="h-72 w-full pt-2">
              <Line data={chartData} options={chartOptions} />
            </div>
          </div>

          {/* Breakdown summary cards */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800">
            <div className="p-4 bg-slate-950 border border-teal-800/40 rounded-xl space-y-1">
              <div className="text-[10px] font-mono uppercase text-teal-400">Homeowner Final Equity</div>
              <div className="text-lg font-mono font-extrabold text-white">
                ${simulationData.finalBuyerNW.toLocaleString()}
              </div>
              <div className="text-[10px] text-slate-400">Home Appreciation + Principal Paid Off</div>
            </div>

            <div className="p-4 bg-slate-950 border border-amber-800/40 rounded-xl space-y-1">
              <div className="text-[10px] font-mono uppercase text-amber-400">Renter Final Portfolio</div>
              <div className="text-lg font-mono font-extrabold text-white">
                ${simulationData.finalRenterNW.toLocaleString()}
              </div>
              <div className="text-[10px] text-slate-400">Down Payment Invested in Index Funds</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
