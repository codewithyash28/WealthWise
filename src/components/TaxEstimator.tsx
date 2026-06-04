import { useState, useMemo, useEffect } from "react";
import { motion } from "motion/react";
import { Calculator, Percent, DollarSign, Wallet, HelpCircle, FileText, CheckCircle2 } from "lucide-react";
import { formatCurrency, cn } from "../lib/utils";
import { CURRENCIES } from "../constants";
import { UserProfile } from "../types";

interface TaxEstimatorProps {
  user: UserProfile;
}

export function TaxEstimator({ user }: TaxEstimatorProps) {
  const currency = CURRENCIES[user.currency] || CURRENCIES.USD;
  const initialSalary = currency.avgSalary * 1.5;

  const [grossIncome, setGrossIncome] = useState(() => {
    const saved = localStorage.getItem("ww_tax_gross_income");
    return saved ? Number(saved) : initialSalary;
  });

  const [preTaxDeduction, setPreTaxDeduction] = useState(() => {
    const saved = localStorage.getItem("ww_tax_pre_tax_deduction");
    return saved ? Number(saved) : Math.round(initialSalary * 0.08);
  });

  const [otherDeductions, setOtherDeductions] = useState(() => {
    const saved = localStorage.getItem("ww_tax_other_deductions");
    return saved ? Number(saved) : 0;
  });

  // Persist to local storage to ensure stability even without backend
  useEffect(() => {
    localStorage.setItem("ww_tax_gross_income", grossIncome.toString());
  }, [grossIncome]);

  useEffect(() => {
    localStorage.setItem("ww_tax_pre_tax_deduction", preTaxDeduction.toString());
  }, [preTaxDeduction]);

  useEffect(() => {
    localStorage.setItem("ww_tax_other_deductions", otherDeductions.toString());
  }, [otherDeductions]);

  // Advanced calculation based on progressive tax brackets depending on selected currency
  const taxResults = useMemo(() => {
    const taxableIncome = Math.max(0, grossIncome - preTaxDeduction - otherDeductions);
    let totalTax = 0;
    let standardDeductionText = "";
    const brackets: { rate: number; amount: number; bounds: string }[] = [];

    if (user.currency === "USD") {
      // 2024–2025 US Federal brackets (Single Filer approximation)
      const stdAllowance = 14605;
      const adjustedTaxable = Math.max(0, taxableIncome - stdAllowance);
      standardDeductionText = `Includes standard Single allowance of $14,605.`;

      const tiers = [
        { rate: 0.10, cap: 11600 },
        { rate: 0.12, cap: 47150 },
        { rate: 0.22, cap: 100525 },
        { rate: 0.24, cap: 191950 },
        { rate: 0.32, cap: 243725 },
        { rate: 0.35, cap: 609350 },
        { rate: 0.37, cap: Infinity }
      ];

      let temp = adjustedTaxable;
      let prevCap = 0;
      for (const tier of tiers) {
        if (temp <= 0) break;
        const currentTierSpan = tier.cap - prevCap;
        const fullyTaxableInThisTier = Math.min(temp, currentTierSpan);
        const taxInTier = fullyTaxableInThisTier * tier.rate;
        totalTax += taxInTier;
        brackets.push({
          rate: tier.rate * 100,
          amount: taxInTier,
          bounds: `${formatCurrency(prevCap + 1, "USD")} - ${tier.cap === Infinity ? "∞" : formatCurrency(tier.cap, "USD")}`
        });
        prevCap = tier.cap;
        temp -= fullyTaxableInThisTier;
      }
    } else if (user.currency === "INR") {
      // New Tax Regime India (FY 2024-25 approximation)
      // Standard deduction of INR 75,000 in budget-2024 regime
      const stdNoTaxAllowance = 75000;
      const adjustedTaxable = Math.max(0, taxableIncome - stdNoTaxAllowance);
      standardDeductionText = `Includes New Regime Standard Deduction of ₹75,000.`;

      const tiers = [
        { rate: 0.00, cap: 300000 },
        { rate: 0.05, cap: 700000 },
        { rate: 0.10, cap: 1000000 },
        { rate: 0.15, cap: 1200000 },
        { rate: 0.20, cap: 1500000 },
        { rate: 0.30, cap: Infinity }
      ];

      let temp = adjustedTaxable;
      let prevCap = 0;
      for (const tier of tiers) {
        if (temp <= 0) break;
        const currentTierSpan = tier.cap - prevCap;
        const fullyTaxableInThisTier = Math.min(temp, currentTierSpan);
        const taxInTier = fullyTaxableInThisTier * tier.rate;
        totalTax += taxInTier;
        if (tier.rate > 0) {
          brackets.push({
            rate: tier.rate * 100,
            amount: taxInTier,
            bounds: `${formatCurrency(prevCap + 1, "INR")} - ${tier.cap === Infinity ? "∞" : formatCurrency(tier.cap, "INR")}`
          });
        }
        prevCap = tier.cap;
        temp -= fullyTaxableInThisTier;
      }
    } else if (user.currency === "EUR") {
      // European average simulated progressive system
      const allowance = 12000;
      const adjustedTaxable = Math.max(0, taxableIncome - allowance);
      standardDeductionText = `Includes flat basic allowance of €12,000.`;

      const tiers = [
        { rate: 0.15, cap: 18000 },
        { rate: 0.25, cap: 42000 },
        { rate: 0.38, cap: 80000 },
        { rate: 0.45, cap: Infinity }
      ];

      let temp = adjustedTaxable;
      let prevCap = 0;
      for (const tier of tiers) {
        if (temp <= 0) break;
        const currentTierSpan = tier.cap - prevCap;
        const fullyTaxableInThisTier = Math.min(temp, currentTierSpan);
        const taxInTier = fullyTaxableInThisTier * tier.rate;
        totalTax += taxInTier;
        brackets.push({
          rate: tier.rate * 100,
          amount: taxInTier,
          bounds: `${formatCurrency(prevCap + 1, "EUR")} - ${tier.cap === Infinity ? "∞" : formatCurrency(tier.cap, "EUR")}`
        });
        prevCap = tier.cap;
        temp -= fullyTaxableInThisTier;
      }
    } else if (user.currency === "GBP") {
      // UK Personal Allowance band (£12,570)
      const allowance = 12570;
      const adjustedTaxable = Math.max(0, taxableIncome - allowance);
      standardDeductionText = `Includes UK Personal Allowance allowance of £12,570.`;

      const tiers = [
        { rate: 0.20, cap: 37700 }, // £12k to £50,270
        { rate: 0.40, cap: 112570 }, // £50k to £125,140
        { rate: 0.45, cap: Infinity }
      ];

      let temp = adjustedTaxable;
      let prevCap = 0;
      for (const tier of tiers) {
        if (temp <= 0) break;
        const currentTierSpan = tier.cap - prevCap;
        const fullyTaxableInThisTier = Math.min(temp, currentTierSpan);
        const taxInTier = fullyTaxableInThisTier * tier.rate;
        totalTax += taxInTier;
        brackets.push({
          rate: tier.rate * 100,
          amount: taxInTier,
          bounds: `${formatCurrency(prevCap + 1, "GBP")} - ${tier.cap === Infinity ? "∞" : formatCurrency(tier.cap, "GBP")}`
        });
        prevCap = tier.cap;
        temp -= fullyTaxableInThisTier;
      }
    } else {
      // Universal generic template
      const allowance = Math.round(grossIncome * 0.15);
      const adjustedTaxable = Math.max(0, taxableIncome - allowance);
      standardDeductionText = `Includes standard default allowance (15% of salary).`;

      const tiers = [
        { rate: 0.15, cap: currency.avgSalary },
        { rate: 0.28, cap: Infinity }
      ];

      let temp = adjustedTaxable;
      let prevCap = 0;
      for (const tier of tiers) {
        if (temp <= 0) break;
        const currentTierSpan = tier.cap - prevCap;
        const fullyTaxableInThisTier = Math.min(temp, currentTierSpan);
        const taxInTier = fullyTaxableInThisTier * tier.rate;
        totalTax += taxInTier;
        brackets.push({
          rate: tier.rate * 100,
          amount: taxInTier,
          bounds: `${formatCurrency(prevCap + 1, user.currency)} - ${tier.cap === Infinity ? "∞" : formatCurrency(tier.cap, user.currency)}`
        });
        prevCap = tier.cap;
        temp -= fullyTaxableInThisTier;
      }
    }

    const takeHome = Math.max(0, grossIncome - totalTax);
    const effectiveRate = grossIncome > 0 ? (totalTax / grossIncome) * 100 : 0;
    const monthlyTakeHome = takeHome / 12;

    return {
      taxableIncome,
      totalTax,
      takeHome,
      effectiveRate,
      monthlyTakeHome,
      standardDeductionText,
      brackets
    };
  }, [grossIncome, preTaxDeduction, otherDeductions, user.currency]);

  // Strategy projection text based on contributions
  const strategySaving = useMemo(() => {
    const additionalPreTax = Math.round(grossIncome * 0.05); // Simulated $ add
    const currentTaxable = Math.max(0, grossIncome - preTaxDeduction - otherDeductions);
    const simulatedTaxable = Math.max(0, currentTaxable - additionalPreTax);
    
    // Quick estimation of savings by finding current max marginal rate
    let maxRate = 15;
    if (taxResults.brackets.length > 0) {
      maxRate = Math.max(...taxResults.brackets.map(b => b.rate));
    }
    const annualSavings = (additionalPreTax * maxRate) / 100;
    
    return {
      additionalPreTax,
      annualSavings,
      maxRate
    };
  }, [grossIncome, preTaxDeduction, otherDeductions, taxResults]);

  return (
    <div className="space-y-12">
      {/* Header Band */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-6">
        <div>
          <span className="text-[10px] uppercase font-bold font-mono tracking-wider text-accent-gold">TACTICAL FISCAL MODELING</span>
          <h1 className="text-3xl sm:text-4xl font-display font-black tracking-tight text-text-primary mt-1">
            Progressive Tax Estimator
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Analyze your progressive tax liability, deductions, and optimize your actual monthly net take-home pay.
          </p>
        </div>
        <div className="p-3 bg-accent-gold/10 border border-accent-gold/20 rounded-2xl text-accent-gold self-start md:self-auto">
          <Calculator className="w-8 h-8" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Input Parameters: Left Side (Col-5) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="card p-6 space-y-6">
            <h3 className="text-md font-bold text-text-primary tracking-wide">
              Taxable Income Parameters
            </h3>

            {/* Income slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <label className="text-text-secondary font-medium" htmlFor="gross-income-input">Gross Annual Salary</label>
                <span className="text-accent-gold font-mono font-black">
                  {formatCurrency(grossIncome, user.currency, currency.locale)}
                </span>
              </div>
              <input
                id="gross-income-input"
                type="range"
                min={Math.round(currency.avgSalary / 3)}
                max={Math.round(currency.avgSalary * 5)}
                step={500}
                value={grossIncome}
                onChange={(e) => setGrossIncome(Number(e.target.value))}
                className="w-full accent-accent-gold cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-text-muted font-mono">
                <span>{formatCurrency(Math.round(currency.avgSalary / 3), user.currency, currency.locale)}</span>
                <span>Average Salary: {formatCurrency(currency.avgSalary, user.currency, currency.locale)}</span>
                <span>{formatCurrency(Math.round(currency.avgSalary * 5), user.currency, currency.locale)}</span>
              </div>
            </div>

            {/* Pre-tax deductions slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <label className="text-text-secondary font-medium" htmlFor="pretax-deduction-input">Pre-Tax Retirement Contributions</label>
                <span className="text-accent-emerald font-mono font-semibold">
                  {formatCurrency(preTaxDeduction, user.currency, currency.locale)}
                </span>
              </div>
              <input
                id="pretax-deduction-input"
                type="range"
                min={0}
                max={Math.round(grossIncome * 0.3)}
                step={250}
                value={preTaxDeduction}
                onChange={(e) => setPreTaxDeduction(Number(e.target.value))}
                className="w-full accent-accent-emerald cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-text-muted font-mono">
                <span>0%</span>
                <span>Savings (e.g., 401k / EPF / Pension)</span>
                <span>30% limit</span>
              </div>
            </div>

            {/* Other deductions input */}
            <div className="space-y-2">
              <label className="text-xs text-text-secondary font-medium block" htmlFor="other-deductions-input">
                Additional Exemptions / Capital Deductions
              </label>
              <div className="relative">
                <input
                  id="other-deductions-input"
                  type="number"
                  value={otherDeductions === 0 ? "" : otherDeductions}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setOtherDeductions(isNaN(val) ? 0 : Math.max(0, val));
                  }}
                  placeholder="Enter custom allowances (e.g., HRA, charity)"
                  className="input-field w-full pl-9 pr-4 text-sm"
                />
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted text-xs font-bold leading-none">
                  {currency.symbol}
                </span>
              </div>
              <p className="text-[10px] text-text-muted leading-relaxed font-mono">
                {taxResults.standardDeductionText}
              </p>
            </div>
          </div>

          {/* Slashed pre-tax optimization card */}
          <div className="p-5 border border-accent-gold/20 bg-accent-gold/5 rounded-2xl space-y-3">
            <h4 className="text-xs font-bold tracking-wider uppercase text-accent-gold flex items-center gap-1.5 font-mono">
              <Percent className="w-3.5 h-3.5" /> Elite Pre-Tax Optimization Strategy
            </h4>
            <p className="text-xs text-text-secondary leading-relaxed">
              Contributing an extra <strong className="text-text-primary">{formatCurrency(strategySaving.additionalPreTax, user.currency, currency.locale)}</strong> pre-tax reduces your taxable income, saving you approximately <strong className="text-accent-emerald font-semibold">{formatCurrency(strategySaving.annualSavings, user.currency, currency.locale)}</strong> annually based on a projected marginal tax rate of <span className="font-mono">{strategySaving.maxRate}%</span>!
            </p>
          </div>
        </div>

        {/* Results Overview: Right Side (Col-7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="card p-6 space-y-6">
            <h3 className="text-md font-bold text-text-primary tracking-wide">
              Annual Take-Home Payload Distribution
            </h3>

            {/* Big Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-bg-secondary border border-border">
                <span className="text-[10px] font-mono font-bold text-text-muted uppercase tracking-wider block">Net Monthly Take-Home</span>
                <div className="text-2xl font-mono font-bold text-accent-emerald mt-1">
                  {formatCurrency(taxResults.monthlyTakeHome, user.currency, currency.locale)}
                </div>
                <span className="text-[10px] text-text-muted block mt-0.5">{formatCurrency(taxResults.takeHome, user.currency, currency.locale)} / Year</span>
              </div>

              <div className="p-4 rounded-xl bg-bg-secondary border border-border">
                <span className="text-[10px] font-mono font-bold text-text-muted uppercase tracking-wider block">Effective Tax Rate</span>
                <div className="text-2xl font-mono font-bold text-accent-gold mt-1">
                  {taxResults.effectiveRate.toFixed(1)}%
                </div>
                <span className="text-[10px] text-text-muted block mt-0.5">Total Paid: {formatCurrency(taxResults.totalTax, user.currency, currency.locale)}</span>
              </div>
            </div>

            {/* Visual Progress Bar */}
            <div className="space-y-2 pt-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-accent-emerald">Take-Home: {((taxResults.takeHome / (grossIncome || 1)) * 100).toFixed(0)}%</span>
                <span className="text-accent-gold">Tax Burden: {taxResults.effectiveRate.toFixed(0)}%</span>
              </div>
              <div className="h-5 rounded-full bg-border overflow-hidden flex">
                <div 
                  className="bg-accent-emerald h-full flex items-center justify-center text-[10px] font-bold text-bg-void"
                  style={{ width: `${Math.max(10, (taxResults.takeHome / (grossIncome || 1)) * 100)}%` }}
                >
                  {((taxResults.takeHome / (grossIncome || 1)) * 100).toFixed(0)}%
                </div>
                {taxResults.totalTax > 0 && (
                  <div 
                    className="bg-accent-gold h-full flex items-center justify-center text-[10px] font-bold text-bg-void"
                    style={{ width: `${(taxResults.totalTax / (grossIncome || 1)) * 100}%` }}
                  >
                    {taxResults.effectiveRate.toFixed(0)}%
                  </div>
                )}
              </div>
            </div>

            {/* Slab Table Breakdown */}
            <div className="space-y-3 pt-3">
              <span className="text-xs uppercase font-bold font-mono tracking-wider text-text-secondary block">
                Progressive Bracket Amortization Table
              </span>

              {taxResults.brackets.length === 0 ? (
                <div className="text-xs font-mono text-center text-text-muted p-4 bg-bg-void rounded-xl border border-border/30">
                  Tax bracket calculations active. Enter gross income to view tier distribution.
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-thin">
                  {taxResults.brackets.map((b, i) => (
                    <div 
                      key={i}
                      className="p-3 bg-bg-void border border-border/40 rounded-xl flex items-center justify-between text-xs font-mono hover:border-border transition-colors"
                    >
                      <div className="space-y-0.5">
                        <div className="text-text-primary flex items-center gap-2">
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-accent-gold/10 text-accent-gold border border-accent-gold/20 leading-none">
                            {b.rate}%
                          </span>
                          <span className="font-medium text-text-secondary font-sans">
                            {b.bounds}
                          </span>
                        </div>
                      </div>
                      <div className="text-text-primary font-bold">
                        {b.amount === 0 ? "—" : formatCurrency(b.amount, user.currency, currency.locale)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Disclaimer alerts */}
            <div className="rounded-xl bg-bg-void border border-border p-3 flex items-start gap-2.5">
              <FileText className="w-4 h-4 text-accent-gold shrink-0 mt-0.5" />
              <div className="text-[10px] text-text-muted leading-relaxed font-sans">
                These estimates use approximate progressive tax schedules. Tax laws vary dramatically based on exact municipal zones, joint filers, and corporate deductions. Treat this projection strictly as a strategic planning benchmark.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
