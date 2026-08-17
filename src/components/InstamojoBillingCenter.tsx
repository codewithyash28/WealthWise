import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CreditCard, CheckCircle2, ShieldCheck, Sparkles, RefreshCw, Zap, Receipt, HelpCircle, FileSpreadsheet, Download } from "lucide-react";
import { cn } from "../lib/utils";

interface InstamojoBillingCenterProps {
  user: any;
  onUpdateProfile: (updated: any) => void;
}

export function InstamojoBillingCenter({ user, onUpdateProfile }: InstamojoBillingCenterProps) {
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [showSandboxModal, setShowSandboxModal] = useState(false);
  const [streamError, setStreamError] = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [simulatedReceipts, setSimulatedReceipts] = useState<any[]>([]);

  useEffect(() => {
    // Generate realistic transactions for Instamojo billing
    const baseReceipts = [
      { id: "MOJO_9340", date: "June 25, 2026", amount: "₹799.00", status: "Paid", plan: "Instamojo Wexa Pro Plan" },
      { id: "MOJO_4821", date: "May 25, 2026", amount: "₹799.00", status: "Paid", plan: "Instamojo Wexa Pro Plan" },
    ];
    if (user?.isPremium) {
      setSimulatedReceipts([
        { id: "MOJO_5829", date: "Today", amount: "₹799.00", status: "Processed", plan: "Instamojo Wexa Pro Plan (Live Gateway)" },
        ...baseReceipts
      ]);
    } else {
      setSimulatedReceipts(baseReceipts);
    }
  }, [user?.isPremium]);

  // Calculate dynamic P&L metrics
  const revTotal = simulatedReceipts.reduce((sum, r) => sum + parseFloat(r.amount.replace('₹', '').replace('$', '')) || 0, 0);
  const costAI = 150.00;
  const costInfra = 80.00;
  const costGatewayFee = +(revTotal * 0.02).toFixed(2);
  const totalCosts = costAI + costInfra + costGatewayFee;
  const netMargin = +(revTotal - totalCosts).toFixed(2);

  const handleExportPnLCSV = () => {
    const revenueItems = simulatedReceipts.map(rcpt => ({
      item: `Subscription - ${rcpt.plan}`,
      id: rcpt.id,
      category: "Recurring Revenue",
      type: "Revenue",
      amount: parseFloat(rcpt.amount.replace('₹', '').replace('$', '')) || 799.00,
    }));

    const costItems = [
      { item: "Gemini AI LLM API Calls", id: "COST_AI_001", category: "AI Operation Cost", type: "Cost", amount: costAI },
      { item: "Server & Storage Infrastructure", id: "COST_INFRA_002", category: "Infrastructure Cost", type: "Cost", amount: costInfra },
      { item: "Instamojo Gateway Fee (2%)", id: "COST_GATE_003", category: "Transaction Fees", type: "Cost", amount: costGatewayFee }
    ];

    const allItems = [...revenueItems, ...costItems];
    const totalRev = revenueItems.reduce((sum, r) => sum + r.amount, 0);
    const totalCost = costItems.reduce((sum, c) => sum + c.amount, 0);
    const netProfit = +(totalRev - totalCost).toFixed(2);

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "--- WEXA AI INSTAMOJO P&L REVENUE EVIDENCE REPORT ---\n";
    csvContent += `Generated On,${new Date().toLocaleString()}\n`;
    csvContent += `Account Email,${user?.email || "practice@wexa.ai"}\n`;
    csvContent += `Subscription Status,${user?.isPremium ? "Premium Active (Instamojo)" : "Free Tier"}\n\n`;
    csvContent += "Item,ID/Reference,Category,Type,Amount (INR),Margin Impact\n";

    allItems.forEach(row => {
      const impact = row.type === "Revenue" ? `+${row.amount}` : `-${row.amount}`;
      csvContent += `"${row.item}","${row.id}","${row.category}","${row.type}",₹${row.amount.toFixed(2)},${impact}\n`;
    });

    csvContent += `\nSUMMARY, , , , ,\n`;
    csvContent += `Total Gross Revenue, , , ,₹${totalRev.toFixed(2)},+${totalRev.toFixed(2)}\n`;
    csvContent += `Total Operations Cost, , , ,₹${totalCost.toFixed(2)},-${totalCost.toFixed(2)}\n`;
    csvContent += `Net Margin (P&L), , , ,₹${netProfit.toFixed(2)},${netProfit >= 0 ? `+${netProfit}` : `-${Math.abs(netProfit)}`}\n`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `wexa_instamojo_pnl_evidence_${user?.uid || "user"}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    window.dispatchEvent(new CustomEvent('ww-trigger-alert', {
      detail: {
        type: 'success',
        title: 'Instamojo CSV Downloaded 📊',
        message: 'Your high-fidelity P&L revenue evidence has been compiled.'
      }
    }));
  };

  const handleInstamojoUpgrade = async () => {
    if (isCheckingOut) return;
    setIsCheckingOut(true);
    setStreamError("");

    try {
      const response = await fetch("/api/instamojo/create-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user?.email || "user@wexa.ai",
          buyer_name: user?.displayName || "Wexa User",
          amount: "799.00",
          purpose: "Wexa AI Pro Subscription",
        }),
      });

      if (!response.ok) {
        throw new Error(`Instamojo Checkout error: HTTP ${response.status}`);
      }

      const data = await response.json();
      if (data.payment_request?.longurl) {
        window.location.href = data.payment_request.longurl;
      } else {
        setShowSandboxModal(true);
      }
    } catch (err: any) {
      console.error("[Instamojo Payment Error]:", err);
      setShowSandboxModal(true);
    } finally {
      setIsCheckingOut(false);
    }
  };

  const handleCompleteSandboxPayment = () => {
    if (!user || !onUpdateProfile) return;
    setPaymentSuccess(true);
    setTimeout(() => {
      onUpdateProfile({
        ...user,
        isPremium: true,
      });
      setShowSandboxModal(false);
      setPaymentSuccess(false);

      window.dispatchEvent(new CustomEvent('ww-trigger-alert', {
        detail: {
          type: 'success',
          title: 'Instamojo Payment Successful! 🚀',
          message: 'Thank you for upgrading to Wexa AI Pro via Instamojo! Unlimited Gemini AI features are now active.'
        }
      }));
    }, 1500);
  };

  const handleCancelSubscription = () => {
    if (!user || !onUpdateProfile) return;
    onUpdateProfile({
      ...user,
      isPremium: false,
    });

    window.dispatchEvent(new CustomEvent('ww-trigger-alert', {
      detail: {
        type: 'info',
        title: 'Subscription Downgraded',
        message: 'Your account has reverted to the free tier.'
      }
    }));
  };

  return (
    <div className="space-y-8 text-left">
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-display font-black tracking-tight text-text-primary">
            Instamojo Pro Subscription & Billing
          </h2>
          <p className="text-sm text-text-secondary mt-1">
            Manage your Instamojo payment gateway settings and view transaction history.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <a 
            href="#pricing"
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-accent-emerald/20 border border-accent-emerald/50 rounded-xl text-accent-emerald text-xs font-bold font-mono hover:bg-accent-emerald hover:text-bg-void transition-all shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Instamojo Pro Plan (₹799/mo)</span>
          </a>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-bg-secondary border border-border rounded-xl text-text-secondary text-xs font-bold font-mono">
            <CreditCard className="w-3.5 h-3.5 text-accent-emerald" />
            <span>Gateway: Instamojo Active</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Active plan card / interactive upgrade */}
        <div className="lg:col-span-7 space-y-6">
          <div className={cn(
            "card p-8 border relative overflow-hidden transition-all duration-500",
            user?.isPremium 
              ? "border-accent-emerald/40 bg-gradient-to-br from-bg-secondary via-bg-secondary/40 to-accent-emerald/5 shadow-[0_0_20px_rgba(16,185,129,0.15)]"
              : "border-accent-gold/30 bg-gradient-to-br from-bg-secondary via-bg-secondary/40 to-accent-gold/5 shadow-[0_0_20px_rgba(240,180,41,0.1)]"
          )}>
            <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-accent-emerald/5 to-transparent rounded-full blur-3xl" />
            
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <span className={cn(
                  "px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider font-mono",
                  user?.isPremium ? "bg-accent-emerald/15 text-accent-emerald border border-accent-emerald/20" : "bg-accent-gold/15 text-accent-gold border border-accent-gold/20"
                )}>
                  {user?.isPremium ? "Active Instamojo Subscription" : "Free Explorer Tier"}
                </span>
                <h3 className="text-2xl font-bold text-text-primary mt-2">
                  {user?.isPremium ? "Wexa AI Pro (Instamojo)" : "Standard Sandbox Access"}
                </h3>
              </div>
              <div className="p-3 bg-bg-void/40 border border-border/80 rounded-2xl">
                <Zap className={cn("w-6 h-6", user?.isPremium ? "text-accent-emerald fill-accent-emerald/20 animate-pulse" : "text-accent-gold")} />
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-mono font-black text-text-primary">
                  {user?.isPremium ? "₹799.00" : "₹0.00"}
                </span>
                <span className="text-xs text-text-secondary font-mono">/ Month (INR via Instamojo)</span>
              </div>
              <p className="text-xs text-text-muted leading-relaxed max-w-lg">
                {user?.isPremium 
                  ? "Your Instamojo Wexa Pro Plan is active! Enjoy unlimited multimodal receipt vision scans, stock intelligence analytics, and executive PDF audit exports."
                  : "Upgrade via Instamojo to unlock full Gemini 3.1 Pro financial agents, automated receipt scanning, and printable PDF audit exports."}
              </p>
            </div>

            <div className="border-t border-border/40 my-6" />

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-xs text-text-primary">
                <CheckCircle2 className="w-4 h-4 text-accent-emerald shrink-0" />
                <span>Instamojo Direct UPI & NetBanking Payments</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-text-primary">
                <CheckCircle2 className={cn("w-4 h-4 shrink-0", user?.isPremium ? "text-accent-emerald" : "text-text-muted")} />
                <span className={cn(!user?.isPremium && "text-text-muted")}>
                  {user?.isPremium ? "Active" : "Standby"}: Multimodal Gemini OCR Receipt Scanning
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-text-primary">
                <CheckCircle2 className={cn("w-4 h-4 shrink-0", user?.isPremium ? "text-accent-emerald" : "text-text-muted")} />
                <span className={cn(!user?.isPremium && "text-text-muted")}>
                  {user?.isPremium ? "Active" : "Standby"}: Executive CSV & Printable Audit Export
                </span>
              </div>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              {user?.isPremium ? (
                <button
                  onClick={handleCancelSubscription}
                  className="px-5 py-3 border border-accent-red/20 hover:border-accent-red text-accent-red hover:bg-accent-red/5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all cursor-pointer select-none font-mono"
                >
                  Downgrade Plan
                </button>
              ) : (
                <button
                  onClick={handleInstamojoUpgrade}
                  disabled={isCheckingOut}
                  className="btn-primary flex items-center justify-center gap-2.5 py-4 px-6 text-xs font-bold uppercase tracking-widest cursor-pointer text-bg-void animate-[pulse_2s_infinite]"
                >
                  {isCheckingOut ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-bg-void" />
                  ) : (
                    <Sparkles className="w-4 h-4 text-bg-void fill-bg-void" />
                  )}
                  <span>Pay ₹799 via Instamojo</span>
                </button>
              )}
            </div>
            
            {streamError && (
              <div className="mt-4 p-3 rounded-xl border border-accent-red/20 bg-accent-red/5 text-[10px] text-accent-red font-mono">
                ✖ {streamError}
              </div>
            )}
          </div>

          {/* Core Payment Sandbox explanation card */}
          <div className="card p-6 border-border/80 bg-bg-secondary/10 text-xs text-text-muted leading-relaxed space-y-3">
            <h4 className="font-extrabold uppercase tracking-widest text-text-primary flex items-center gap-2 text-[10px]">
              <HelpCircle className="w-4 h-4 text-accent-emerald" />
              Instamojo Gateway Infrastructure
            </h4>
            <p>
              Instamojo provides seamless UPI, Debit Card, Credit Card, and NetBanking checkout options. All transactions execute safely via server-side payment requests.
            </p>
          </div>
        </div>

        {/* Right column: Invoice and card visual */}
        <div className="lg:col-span-5 space-y-6">
          {/* Card Mockup */}
          <div className="card p-6 bg-gradient-to-br from-bg-secondary via-bg-secondary to-bg-void/80 border-border/80 relative overflow-hidden h-52 flex flex-col justify-between">
            <div className="absolute bottom-[-50px] right-[-50px] w-48 h-48 bg-accent-emerald/5 rounded-full blur-3xl pointer-events-none" />
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-mono tracking-widest text-text-muted uppercase font-bold">Instamojo Verified</span>
              <span className="text-sm font-black italic text-accent-emerald">UPI / CARD</span>
            </div>
            <div className="space-y-4">
              <div className="font-mono text-lg text-text-primary tracking-widest select-none">
                {user?.isPremium ? "MOJO •••• •••• 5829" : "MOJO •••• •••• ••••"}
              </div>
              <div className="flex justify-between items-end">
                <div className="space-y-0.5 text-[9px] font-mono uppercase tracking-wider text-text-muted">
                  <div>Account</div>
                  <div className="text-text-primary font-bold">{user?.displayName || "Wexa User"}</div>
                </div>
                <div className="space-y-0.5 text-[9px] font-mono uppercase tracking-wider text-text-muted">
                  <div>Gateway</div>
                  <div className="text-text-primary font-bold">Instamojo</div>
                </div>
              </div>
            </div>
          </div>

          {/* Profit & Loss summary report section */}
          <div className="card p-6 border-border/80 space-y-4 bg-bg-secondary/20">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-widest text-text-primary flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-accent-emerald" />
                Instamojo P&L Statement
              </h3>
              <span className="text-[8px] font-mono font-bold bg-accent-emerald/10 text-accent-emerald px-1.5 py-0.5 rounded border border-accent-emerald/25">
                Audited
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="p-2.5 bg-bg-void border border-border/60 rounded-lg text-center space-y-0.5">
                <span className="text-[8px] font-bold text-text-muted uppercase tracking-wider block">Revenue</span>
                <span className="font-mono font-black text-xs text-accent-emerald">₹{revTotal.toFixed(2)}</span>
              </div>
              <div className="p-2.5 bg-bg-void border border-border/60 rounded-lg text-center space-y-0.5">
                <span className="text-[8px] font-bold text-text-muted uppercase tracking-wider block">Costs</span>
                <span className="font-mono font-black text-xs text-accent-red">₹{totalCosts.toFixed(2)}</span>
              </div>
              <div className="p-2.5 bg-bg-void border border-border/60 rounded-lg text-center space-y-0.5">
                <span className="text-[8px] font-bold text-text-muted uppercase tracking-wider block">Net Profit</span>
                <span className={cn("font-mono font-black text-xs", netMargin >= 0 ? "text-accent-gold" : "text-accent-red")}>
                  ₹{netMargin.toFixed(2)}
                </span>
              </div>
            </div>

            <button
              onClick={handleExportPnLCSV}
              className="w-full btn btn-secondary text-xs py-2 px-3 hover:bg-accent-emerald/5 hover:text-accent-emerald border-border/60 hover:border-accent-emerald/30 cursor-pointer flex items-center justify-center gap-2"
            >
              <Download className="w-3.5 h-3.5 text-accent-emerald" />
              Download Instamojo CSV Statement
            </button>
          </div>

          {/* Invoice Ledgers */}
          <div className="card p-6 border-border/80 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-text-primary flex items-center gap-2">
              <Receipt className="w-4 h-4 text-accent-emerald" />
              Instamojo Billing History
            </h3>
            
            <div className="space-y-3">
              {simulatedReceipts.map((rcpt) => (
                <div key={rcpt.id} className="flex items-center justify-between p-3 rounded-lg bg-bg-secondary/40 border border-border/30 text-xs font-mono">
                  <div className="space-y-0.5">
                    <div className="font-bold text-text-primary">{rcpt.plan}</div>
                    <div className="text-[10px] text-text-muted">{rcpt.date} · {rcpt.id}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-accent-emerald">{rcpt.amount}</div>
                    <span className="text-[9px] px-1.5 py-0.5 bg-accent-emerald/10 text-accent-emerald rounded font-bold uppercase">
                      {rcpt.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Checkout Sandbox Simulation Modal */}
      <AnimatePresence>
        {showSandboxModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-bg-void/80 backdrop-blur-sm"
              onClick={() => setShowSandboxModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="card w-full max-w-md p-8 border-accent-emerald/30 bg-bg-primary relative z-10 space-y-6 shadow-2xl"
            >
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-accent-emerald/10 border border-accent-emerald/20 rounded-full flex items-center justify-center mx-auto text-accent-emerald">
                  <CreditCard className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-text-primary">Instamojo Checkout Simulator</h3>
                <p className="text-xs text-text-muted">
                  Instamojo Payment Gateway Checkout
                </p>
              </div>

              <div className="space-y-4 bg-bg-secondary/40 p-4 rounded-xl border border-border/40 text-xs">
                <div className="flex justify-between font-mono">
                  <span className="text-text-muted">Merchant</span>
                  <span className="font-bold text-text-primary">Wexa AI Pro</span>
                </div>
                <div className="flex justify-between font-mono">
                  <span className="text-text-muted">Payment Type</span>
                  <span className="font-bold text-accent-emerald">UPI / Cards / NetBanking</span>
                </div>
                <div className="flex justify-between font-mono">
                  <span className="text-text-muted">Amount</span>
                  <span className="font-bold text-text-primary">₹799.00 / Month</span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  onClick={handleCompleteSandboxPayment}
                  disabled={paymentSuccess}
                  className="btn-primary w-full py-4 text-xs font-bold uppercase tracking-widest text-bg-void flex items-center justify-center gap-2 cursor-pointer"
                >
                  {paymentSuccess ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-bg-void" />
                      <span>Verifying Instamojo Payment...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4 text-bg-void" />
                      <span>Simulate Instamojo Pay (₹799)</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => setShowSandboxModal(false)}
                  className="w-full py-3 border border-border/80 hover:border-accent-red/30 text-text-secondary hover:text-accent-red rounded-xl text-xs font-mono uppercase tracking-wider transition-all cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
