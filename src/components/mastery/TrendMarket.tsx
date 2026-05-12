import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { TrendingUp, TrendingDown, ShoppingCart, Wallet, Info, Sparkles, RefreshCw } from "lucide-react";
import { cn } from "../../lib/utils";

interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  history: number[];
  category: string;
}

const INITIAL_STOCKS: Stock[] = [
  { symbol: "DRIP", name: "DRIP Shoes", price: 145.20, change: 2.4, history: [140, 142, 141, 144, 145.2], category: "Fashion" },
  { symbol: "NEO", name: "NEO Tech", price: 89.50, change: -1.2, history: [92, 91, 90, 88, 89.5], category: "Tech" },
  { symbol: "CYBR", name: "CyberWear", price: 210.15, change: 5.6, history: [195, 200, 205, 208, 210.15], category: "Fashion" },
  { symbol: "SOL", name: "SolEnergy", price: 54.30, change: 0.8, history: [53, 53.5, 54, 54.1, 54.3], category: "Energy" },
  { symbol: "META", name: "MetaVision", price: 320.45, change: -4.3, history: [340, 335, 330, 325, 320.45], category: "Tech" },
];

export function TrendMarket() {
  const [stocks, setStocks] = useState<Stock[]>(INITIAL_STOCKS);
  const [balance, setBalance] = useState(10000);
  const [portfolio, setPortfolio] = useState<{ [key: string]: number }>({});
  const [selectedStock, setSelectedStock] = useState<Stock | null>(stocks[0]);
  const [isSimulating, setIsSimulating] = useState(true);

  useEffect(() => {
    if (!isSimulating) return;
    const interval = setInterval(() => {
      setStocks(current => current.map(stock => {
        const volatility = 0.02;
        const change = (Math.random() - 0.5) * 2 * volatility;
        const newPrice = stock.price * (1 + change);
        const newHistory = [...stock.history.slice(-9), newPrice];
        return {
          ...stock,
          price: parseFloat(newPrice.toFixed(2)),
          change: parseFloat(((newPrice / stock.history[0] - 1) * 100).toFixed(2)),
          history: newHistory
        };
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, [isSimulating]);

  const handleBuy = (stock: Stock) => {
    if (balance >= stock.price) {
      setBalance(prev => prev - stock.price);
      setPortfolio(prev => ({
        ...prev,
        [stock.symbol]: (prev[stock.symbol] || 0) + 1
      }));
    }
  };

  const handleSell = (stock: Stock) => {
    if (portfolio[stock.symbol] && portfolio[stock.symbol] > 0) {
      setBalance(prev => prev + stock.price);
      setPortfolio(prev => ({
        ...prev,
        [stock.symbol]: prev[stock.symbol] - 1
      }));
    }
  };

  const totalWealth = balance + stocks.reduce((acc, s) => acc + (portfolio[s.symbol] || 0) * s.price, 0);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-display font-bold">TrendMarket</h2>
          <p className="text-text-secondary">Gamified Pop-Culture Trading. Master market psychology with zero risk.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="card px-6 py-3 bg-accent-gold/10 border-accent-gold/20 flex flex-col items-end">
            <div className="text-[10px] text-accent-gold font-bold uppercase tracking-widest leading-none mb-1">Virtual Balance</div>
            <div className="text-2xl font-mono font-bold text-accent-gold">₹{balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
          </div>
          <button 
            onClick={() => setIsSimulating(!isSimulating)}
            className={cn("p-4 rounded-xl border transition-all", isSimulating ? "bg-accent-emerald/10 text-accent-emerald border-accent-emerald/20" : "bg-bg-secondary text-text-muted border-border")}
          >
            <RefreshCw className={cn("w-6 h-6", isSimulating && "animate-spin-slow")} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stocks.map((stock) => (
              <motion.div 
                key={stock.symbol}
                onClick={() => setSelectedStock(stock)}
                layout
                className={cn(
                  "card p-6 cursor-pointer transition-all border-border/40 hover:border-accent-gold/40 relative overflow-hidden group",
                  selectedStock?.symbol === stock.symbol ? "border-accent-gold bg-bg-secondary" : "bg-bg-secondary/40"
                )}
              >
                <div className="flex justify-between items-start relative z-10">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                       <span className="text-[10px] font-bold bg-bg-primary px-2 py-0.5 rounded border border-border text-text-muted">{stock.symbol}</span>
                       <span className="font-bold">{stock.name}</span>
                    </div>
                    <div className="text-2xl font-mono font-bold">₹{stock.price.toFixed(2)}</div>
                  </div>
                  <div className={cn(
                    "flex items-center gap-1 text-sm font-bold px-2 py-1 rounded-lg",
                    stock.change >= 0 ? "text-accent-emerald bg-accent-emerald/10" : "text-accent-red bg-accent-red/10"
                  )}>
                    {stock.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {stock.change}%
                  </div>
                </div>

                {/* Sparkchart Preview */}
                <div className="mt-4 h-12 flex items-end gap-1 opacity-50">
                  {stock.history.map((h, i) => (
                    <div 
                      key={i} 
                      className={cn("flex-1 rounded-t-sm", stock.change >= 0 ? "bg-accent-emerald" : "bg-accent-red")}
                      style={{ height: `${((h - Math.min(...stock.history)) / (Math.max(...stock.history) - Math.min(...stock.history)) * 100) + 10}%` }}
                    />
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          {selectedStock && (
            <div className="card p-8 bg-bg-secondary/30 border-accent-gold/20 space-y-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-bg-primary border border-border flex items-center justify-center text-3xl font-bold text-accent-gold">
                    {selectedStock.symbol[0]}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">{selectedStock.name}</h3>
                    <p className="text-text-secondary text-sm">{selectedStock.category} • Global Market Leader</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-mono font-bold tracking-tight">₹{selectedStock.price.toFixed(2)}</div>
                  <div className={cn("text-sm font-bold flex items-center justify-end gap-1", selectedStock.change >= 0 ? "text-accent-emerald" : "text-accent-red")}>
                     {selectedStock.change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                     {selectedStock.change}% Today
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => handleBuy(selectedStock)}
                  disabled={balance < selectedStock.price}
                  className="flex-1 py-4 bg-accent-emerald text-bg-void font-bold rounded-xl hover:opacity-90 disabled:opacity-50 disabled:grayscale transition-all flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-5 h-5" /> Buy Share
                </button>
                <button 
                  onClick={() => handleSell(selectedStock)}
                  disabled={!portfolio[selectedStock.symbol] || portfolio[selectedStock.symbol] <= 0}
                  className="flex-1 py-4 bg-accent-red text-bg-void font-bold rounded-xl hover:opacity-90 disabled:opacity-50 disabled:grayscale transition-all flex items-center justify-center gap-2"
                >
                  <TrendingDown className="w-5 h-5" /> Sell Share
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-8">
          <div className="card p-8 space-y-6">
             <h3 className="text-sm font-bold uppercase tracking-widest text-text-muted flex items-center gap-2">
               <Wallet className="w-4 h-4" /> Your Portfolio
             </h3>
             <div className="space-y-4">
                <div className="flex justify-between items-end">
                   <span className="text-text-secondary text-sm">Portfolio Value</span>
                   <span className="text-2xl font-bold font-mono">₹{totalWealth.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="h-1.5 w-full bg-bg-secondary rounded-full overflow-hidden">
                   <motion.div 
                     initial={{ width: 0 }}
                     animate={{ width: `${(totalWealth / 10000) * 100}%` }}
                     className="h-full bg-accent-gold"
                   />
                </div>
                <div className="text-[10px] text-text-muted italic">Initial Budget: ₹10,000.00</div>
             </div>

             <div className="space-y-3 pt-4">
               {Object.entries(portfolio).map(([symbol, count]) => {
                 if (count === 0) return null;
                 const stock = stocks.find(s => s.symbol === symbol);
                 if (!stock) return null;
                 return (
                   <div key={symbol} className="flex items-center justify-between p-3 bg-bg-secondary/50 rounded-xl border border-border">
                     <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-lg bg-bg-primary flex items-center justify-center text-xs font-bold font-mono border border-border">
                         {symbol}
                       </div>
                       <div>
                         <div className="text-xs font-bold">{stock.name}</div>
                         <div className="text-[10px] text-text-muted">{count} Shares</div>
                       </div>
                     </div>
                     <div className="text-right">
                        <div className="text-xs font-mono font-bold">₹{(count * stock.price).toFixed(2)}</div>
                        <div className="text-[10px] text-accent-emerald font-bold">In Profit</div>
                     </div>
                   </div>
                 );
               })}
               {Object.values(portfolio).every(v => v === 0) && (
                 <div className="text-center py-8 text-text-muted text-sm space-y-2">
                   <Sparkles className="w-8 h-8 mx-auto opacity-20" />
                   <p>No investments yet.<br/>Start by buying your first share!</p>
                 </div>
               )}
             </div>
          </div>

          <div className="card p-6 bg-accent-purple/10 border-accent-purple/20 space-y-4">
             <div className="flex items-center gap-2 text-accent-purple font-bold text-sm uppercase tracking-widest">
               <Info className="w-4 h-4" /> Market Psychology
             </div>
             <p className="text-sm text-text-primary leading-relaxed">
               Did you know? Prices are often driven by <span className="font-bold italic">sentiment</span> rather than logic. When many people buy, prices rise—fueling FOMO (Fear Of Missing Out).
             </p>
             <div className="pt-2">
                <div className="text-[10px] text-text-muted font-bold uppercase tracking-wider mb-2">Insight Unlocked</div>
                <div className="px-3 py-1 bg-accent-purple/10 border border-accent-purple/20 rounded-full inline-block text-[10px] font-bold text-accent-purple">
                  Understanding Bull Traps
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
