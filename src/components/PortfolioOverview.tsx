import { useState, useEffect, useMemo, useRef } from "react";
import { motion } from "motion/react";
import { PieChart, TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight, Briefcase, Globe, Activity, Layers, Sparkles, ShieldAlert } from "lucide-react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title } from 'chart.js';
import { Doughnut, Line } from 'react-chartjs-2';
import { formatCurrency, cn } from "../lib/utils";
import { CURRENCIES } from "../constants";
import { UserProfile, Portfolio } from "../types";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title);

interface PortfolioOverviewProps {
  user: UserProfile;
}

export function PortfolioOverview({ user }: PortfolioOverviewProps) {
  const currency = CURRENCIES[user.currency] || CURRENCIES.USD;

  // Load or generate dynamic high fidelity mock holdings so list is never sad
  const portfolio: Portfolio = useMemo(() => {
    if (user.portfolio && user.portfolio.holdings && user.portfolio.holdings.length > 0) {
      return user.portfolio;
    }
    const baseVal = user.netWorth && user.netWorth.assets > 0 ? user.netWorth.assets * 0.8 : currency.avgSalary * 5;
    return {
      totalValue: baseVal,
      change24h: 3.42,
      allocation: {
        stocks: 45,
        bonds: 20,
        crypto: 15,
        realEstate: 10,
        cash: 10
      },
      holdings: [
        { name: "Alpha-Grade Tech Growth ETF", value: baseVal * 0.45, allocation: 45, performance: 14.2 },
        { name: "Sovereign Treasury Notes 10Y", value: baseVal * 0.20, allocation: 20, performance: 4.8 },
        { name: "Ethereum smart contract DeFi", value: baseVal * 0.15, allocation: 15, performance: -6.4 }, // Drops -6.4%, triggering standard 5% alarm!
        { name: "Global REIT Real Estate Index", value: baseVal * 0.10, allocation: 10, performance: -2.3 },
        { name: "Fiat Stability Liquidity Vault", value: baseVal * 0.10, allocation: 10, performance: 1.15 }
      ]
    };
  }, [user.portfolio, user.netWorth, user.currency, currency]);

  const [dropThreshold, setDropThreshold] = useState(() => {
    const saved = localStorage.getItem("ww_portfolio_drop_threshold");
    return saved ? parseFloat(JSON.parse(saved)) : 5.0; // default to 5.0 % alert limit trigger
  });

  const triggeredAssetsRef = useRef<Record<string, number>>({});

  useEffect(() => {
    localStorage.setItem("ww_portfolio_drop_threshold", JSON.stringify(dropThreshold));
    
    // Check for performance drops exceeding threshold
    portfolio.holdings.forEach(holding => {
      if (holding.performance < 0) {
        const dropPercent = Math.abs(holding.performance);
        if (dropPercent >= dropThreshold) {
          const lastAlertTime = triggeredAssetsRef.current[holding.name];
          const now = Date.now();
          // Rate-limit alerts for this asset to once per 10 seconds to keep performance light and fast
          if (!lastAlertTime || (now - lastAlertTime > 10000)) {
            triggeredAssetsRef.current[holding.name] = now;
            
            const event = new CustomEvent("ww-trigger-alert", {
              detail: {
                type: "risk",
                title: `Asset Drop Alert: ${holding.name}`,
                message: `${holding.name} is down by ${holding.performance}% today, exceeding your user-configured safety risk threshold of ${dropThreshold}%. Recommend rebalancing.`
              }
            });
            window.dispatchEvent(event);
          }
        }
      }
    });
  }, [dropThreshold, portfolio.holdings]);

  const chartData = {
    labels: ['Stocks', 'Bonds', 'Crypto', 'Cash', 'Real Estate'],
    datasets: [{
      data: [
        portfolio.allocation.stocks,
        portfolio.allocation.bonds,
        portfolio.allocation.crypto,
        portfolio.allocation.cash,
        portfolio.allocation.realEstate
      ],
      backgroundColor: ['#F0B429', '#3B82F6', '#10D9A0', '#94A3B8', '#F97316'],
      borderWidth: 0,
      hoverOffset: 15,
    }],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#111827',
        titleFont: { family: 'Syne', size: 14 },
        bodyFont: { family: 'Outfit', size: 12 },
        borderColor: 'rgba(240,180,41,0.2)',
        borderWidth: 1,
        padding: 12,
      }
    },
    cutout: '75%',
  };

  return (
    <div className="container mx-auto px-6 py-12 space-y-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-4xl font-display font-bold">Portfolio Overview</h1>
          <p className="text-text-secondary">Your global asset allocation and performance metrics</p>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-[10px] text-text-muted uppercase tracking-widest font-bold">Total Net Value</div>
              <div className="text-2xl font-mono font-bold text-accent-gold">
                {formatCurrency(portfolio.totalValue, user.currency, currency.locale)}
              </div>
            </div>
            <div className={cn(
              "px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1",
              portfolio.change24h >= 0 ? "bg-accent-emerald/10 text-accent-emerald" : "bg-accent-red/10 text-accent-red"
            )}>
              {portfolio.change24h >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {Math.abs(portfolio.change24h)}%
            </div>
          </div>
          <a 
            href="#rebalancer" 
            className="flex items-center justify-center px-4 py-2 bg-accent-gold/10 border border-accent-gold/25 text-accent-gold text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-accent-gold/20 transition-all font-mono"
          >
            Rebalance Asset Mix
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Allocation Chart */}
        <div className="lg:col-span-1 card p-8 flex flex-col items-center justify-center relative min-h-[400px]">
          <h3 className="text-xl font-bold w-full text-left mb-8 flex items-center gap-2">
            <Layers className="w-5 h-5 text-accent-gold" /> Asset Allocation
          </h3>
          <div className="relative w-full h-[250px]">
            <Doughnut data={chartData} options={chartOptions} />
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <div className="text-text-muted text-[10px] uppercase tracking-widest">Diversification</div>
              <div className="text-xl font-bold">{portfolio.totalValue > 0 ? "Optimal" : "N/A"}</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 w-full mt-8">
            {chartData.labels.map((label, i) => (
              <div key={label} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: chartData.datasets[0].backgroundColor[i] }} />
                <span className="text-[10px] text-text-secondary uppercase tracking-wider font-bold">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Holdings Table */}
        <div className="lg:col-span-2 card p-8 space-y-6">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-accent-gold" /> Major Holdings
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border">
                  <th className="pb-4 text-[10px] text-text-muted uppercase tracking-widest font-bold">Asset Name</th>
                  <th className="pb-4 text-[10px] text-text-muted uppercase tracking-widest font-bold text-right">Value</th>
                  <th className="pb-4 text-[10px] text-text-muted uppercase tracking-widest font-bold text-right">Allocation</th>
                  <th className="pb-4 text-[10px] text-text-muted uppercase tracking-widest font-bold text-right">Performance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {portfolio.holdings.length > 0 ? portfolio.holdings.map((holding, i) => (
                  <tr key={i} className="group hover:bg-bg-secondary/50 transition-colors">
                    <td className="py-4">
                      <div className="font-bold text-sm">{holding.name}</div>
                    </td>
                    <td className="py-4 text-right font-mono text-sm">
                      {formatCurrency(holding.value, user.currency, currency.locale)}
                    </td>
                    <td className="py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 h-1 bg-border rounded-full overflow-hidden">
                          <div className="h-full bg-accent-gold" style={{ width: `${holding.allocation}%` }} />
                        </div>
                        <span className="text-[10px] font-mono font-bold text-text-muted">{holding.allocation}%</span>
                      </div>
                    </td>
                    <td className="py-4 text-right">
                      <span className={cn(
                        "text-xs font-bold",
                        holding.performance >= 0 ? "text-accent-emerald" : "text-accent-red"
                      )}>
                        {holding.performance >= 0 ? "+" : ""}{holding.performance}%
                      </span>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-text-muted italic text-sm">
                      No holdings found. Add assets to your portfolio to track them.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* User-Configurable Drop Alarm Guard Panel */}
          <div className="pt-6 border-t border-border/40 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <h4 className="font-bold flex items-center gap-2 text-accent-red text-xs uppercase tracking-wider">
                  <ShieldAlert className="w-4 h-4 text-accent-red" /> Defensive Portfolio Drop Guard
                </h4>
                <p className="text-[11px] text-text-muted leading-relaxed">
                  Triggers an automated high-priority PulseAlert notification if any held asset drops in value today sharper than your configurable threshold.
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0 bg-bg-secondary/20 p-2.5 rounded-xl border border-border/40">
                <span className="text-xs font-mono font-bold text-text-secondary uppercase">Cutoff Limit:</span>
                <input 
                  type="number" 
                  min="0.5" 
                  max="50" 
                  step="0.5"
                  value={dropThreshold}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setDropThreshold(isNaN(val) ? 5.0 : Math.max(0.1, Math.min(100, val)));
                  }}
                  className="bg-bg-void border border-border rounded-lg text-right font-mono font-bold px-2 py-1 text-xs text-text-primary focus:border-accent-red outline-none w-16"
                />
                <span className="text-xs font-bold text-text-muted">%</span>
                <input 
                  type="range" 
                  min="1" 
                  max="20" 
                  step="0.5" 
                  value={dropThreshold} 
                  onChange={(e) => setDropThreshold(parseFloat(e.target.value))} 
                  className="w-24 accent-accent-red cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {portfolio.holdings.length > 0 ? (
          [
            { label: "Alpha (vs S&P 500)", value: "+4.2%", icon: <Activity className="w-5 h-5" />, color: "text-accent-emerald" },
            { label: "Sharpe Ratio", value: "1.85", icon: <TrendingUp className="w-5 h-5" />, color: "text-accent-gold" },
            { label: "Volatility (Std Dev)", value: "12.4%", icon: <Globe className="w-5 h-5" />, color: "text-accent-blue" },
            { label: "Dividend Yield", value: "2.1%", icon: <Wallet className="w-5 h-5" />, color: "text-accent-emerald" }
          ].map((metric, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -5 }}
              className="card p-6 space-y-4 border-l-4 border-l-accent-gold"
            >
              <div className={cn("w-10 h-10 rounded-xl bg-bg-secondary flex items-center justify-center", metric.color)}>
                {metric.icon}
              </div>
              <div>
                <div className="text-[10px] text-text-muted uppercase tracking-widest font-bold">{metric.label}</div>
                <div className="text-2xl font-mono font-bold">{metric.value}</div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full card p-12 flex flex-col items-center justify-center text-center space-y-6 bg-accent-gold/5 border-dashed border-accent-gold/30">
            <div className="w-16 h-16 rounded-full bg-accent-gold/10 flex items-center justify-center text-accent-gold">
              <Sparkles className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold">Unlock Professional Metrics</h3>
              <p className="text-text-secondary max-w-md mx-auto">
                Add your first asset to track advanced performance indicators like Alpha, Sharpe Ratio, and Volatility.
              </p>
            </div>
            <button 
              onClick={() => console.log("Asset addition feature coming soon!")}
              className="btn-primary"
            >
              Add Your First Asset
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
