import { CURRENCIES } from "../constants";

interface TaxBracket {
  rate: number;
  amount: number;
  bounds: string;
}

export interface TaxResults {
  taxableIncome: number;
  totalTax: number;
  takeHome: number;
  effectiveRate: number;
  monthlyTakeHome: number;
  standardDeductionText: string;
  brackets: TaxBracket[];
}

export interface TaxStrategySavings {
  additionalPreTax: number;
  annualSavings: number;
  maxRate: number;
}

interface Tier {
  rate: number;
  cap: number;
}

function applyBrackets(
  adjustedTaxable: number,
  tiers: Tier[],
  currencyCode: string,
  formatCurrencyFn: (amount: number, code: string) => string,
  includeZeroRate: boolean = true
): { totalTax: number; brackets: TaxBracket[] } {
  let totalTax = 0;
  const brackets: TaxBracket[] = [];
  let temp = adjustedTaxable;
  let prevCap = 0;

  for (const tier of tiers) {
    if (temp <= 0) break;
    const currentTierSpan = tier.cap - prevCap;
    const fullyTaxableInThisTier = Math.min(temp, currentTierSpan);
    const taxInTier = fullyTaxableInThisTier * tier.rate;
    totalTax += taxInTier;
    if (includeZeroRate || tier.rate > 0) {
      brackets.push({
        rate: tier.rate * 100,
        amount: taxInTier,
        bounds: `${formatCurrencyFn(prevCap + 1, currencyCode)} - ${tier.cap === Infinity ? "\u221e" : formatCurrencyFn(tier.cap, currencyCode)}`
      });
    }
    prevCap = tier.cap;
    temp -= fullyTaxableInThisTier;
  }

  return { totalTax, brackets };
}

export function calculateTax(
  grossIncome: number,
  preTaxDeduction: number,
  otherDeductions: number,
  currencyCode: string,
  formatCurrencyFn: (amount: number, code: string) => string
): TaxResults {
  const taxableIncome = Math.max(0, grossIncome - preTaxDeduction - otherDeductions);
  let totalTax = 0;
  let standardDeductionText = "";
  let brackets: TaxBracket[] = [];

  if (currencyCode === "USD") {
    const stdAllowance = 14605;
    const adjustedTaxable = Math.max(0, taxableIncome - stdAllowance);
    standardDeductionText = `Includes standard Single allowance of $14,605.`;

    const tiers: Tier[] = [
      { rate: 0.10, cap: 11600 },
      { rate: 0.12, cap: 47150 },
      { rate: 0.22, cap: 100525 },
      { rate: 0.24, cap: 191950 },
      { rate: 0.32, cap: 243725 },
      { rate: 0.35, cap: 609350 },
      { rate: 0.37, cap: Infinity }
    ];

    const result = applyBrackets(adjustedTaxable, tiers, "USD", formatCurrencyFn);
    totalTax = result.totalTax;
    brackets = result.brackets;
  } else if (currencyCode === "INR") {
    const stdNoTaxAllowance = 75000;
    const adjustedTaxable = Math.max(0, taxableIncome - stdNoTaxAllowance);
    standardDeductionText = `Includes New Regime Standard Deduction of \u20b975,000.`;

    const tiers: Tier[] = [
      { rate: 0.00, cap: 300000 },
      { rate: 0.05, cap: 700000 },
      { rate: 0.10, cap: 1000000 },
      { rate: 0.15, cap: 1200000 },
      { rate: 0.20, cap: 1500000 },
      { rate: 0.30, cap: Infinity }
    ];

    const result = applyBrackets(adjustedTaxable, tiers, "INR", formatCurrencyFn, false);
    totalTax = result.totalTax;
    brackets = result.brackets;
  } else if (currencyCode === "EUR") {
    const allowance = 12000;
    const adjustedTaxable = Math.max(0, taxableIncome - allowance);
    standardDeductionText = `Includes flat basic allowance of \u20ac12,000.`;

    const tiers: Tier[] = [
      { rate: 0.15, cap: 18000 },
      { rate: 0.25, cap: 42000 },
      { rate: 0.38, cap: 80000 },
      { rate: 0.45, cap: Infinity }
    ];

    const result = applyBrackets(adjustedTaxable, tiers, "EUR", formatCurrencyFn);
    totalTax = result.totalTax;
    brackets = result.brackets;
  } else if (currencyCode === "GBP") {
    const allowance = 12570;
    const adjustedTaxable = Math.max(0, taxableIncome - allowance);
    standardDeductionText = `Includes UK Personal Allowance allowance of \u00a312,570.`;

    const tiers: Tier[] = [
      { rate: 0.20, cap: 37700 },
      { rate: 0.40, cap: 112570 },
      { rate: 0.45, cap: Infinity }
    ];

    const result = applyBrackets(adjustedTaxable, tiers, "GBP", formatCurrencyFn);
    totalTax = result.totalTax;
    brackets = result.brackets;
  } else {
    const currency = CURRENCIES[currencyCode] || CURRENCIES.USD;
    const allowance = Math.round(grossIncome * 0.15);
    const adjustedTaxable = Math.max(0, taxableIncome - allowance);
    standardDeductionText = `Includes standard default allowance (15% of salary).`;

    const tiers: Tier[] = [
      { rate: 0.15, cap: currency.avgSalary },
      { rate: 0.28, cap: Infinity }
    ];

    const result = applyBrackets(adjustedTaxable, tiers, currencyCode, formatCurrencyFn);
    totalTax = result.totalTax;
    brackets = result.brackets;
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
}

export function calculateStrategySavings(
  grossIncome: number,
  preTaxDeduction: number,
  otherDeductions: number,
  taxResults: TaxResults
): TaxStrategySavings {
  const additionalPreTax = Math.round(grossIncome * 0.05);
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
}
