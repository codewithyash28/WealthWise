import { UserProfile } from "../types";

export type SupportedCurrency = "INR" | "USD" | "EUR";

export const FX_RATES: Record<SupportedCurrency, number> = {
  INR: 1,       // Base
  USD: 83.50,   // 1 USD = 83.50 INR
  EUR: 91.00,   // 1 EUR = 91.00 INR
};

export const CURRENCY_SYMBOLS: Record<SupportedCurrency, string> = {
  INR: "₹",
  USD: "$",
  EUR: "€",
};

/**
 * Converts an INR base amount into the target currency.
 */
export function convertInrToTargetCurrency(amountInInr: number, targetCurrency: SupportedCurrency = "INR"): number {
  if (typeof amountInInr !== "number" || isNaN(amountInInr)) return 0;
  const rate = FX_RATES[targetCurrency] || 1;
  return amountInInr / rate;
}

/**
 * Converts an amount from a specified currency into INR base.
 */
export function convertTargetCurrencyToInr(amount: number, fromCurrency: SupportedCurrency = "INR"): number {
  if (typeof amount !== "number" || isNaN(amount)) return 0;
  const rate = FX_RATES[fromCurrency] || 1;
  return amount * rate;
}

/**
 * Standardized currency formatter with locale sensitivity and optional compact notation.
 */
export function formatStandardCurrency(
  amount: number,
  currency: SupportedCurrency = "INR",
  compact: boolean = false
): string {
  const safeAmount = typeof amount === "number" && !isNaN(amount) ? amount : 0;
  const symbol = CURRENCY_SYMBOLS[currency] || "₹";

  if (compact) {
    if (currency === "INR") {
      if (Math.abs(safeAmount) >= 10000000) {
        return `${symbol}${(safeAmount / 10000000).toFixed(2)} Cr`;
      }
      if (Math.abs(safeAmount) >= 100000) {
        return `${symbol}${(safeAmount / 100000).toFixed(2)} L`;
      }
      if (Math.abs(safeAmount) >= 1000) {
        return `${symbol}${(safeAmount / 1000).toFixed(1)}k`;
      }
    } else {
      if (Math.abs(safeAmount) >= 1000000) {
        return `${symbol}${(safeAmount / 1000000).toFixed(2)}M`;
      }
      if (Math.abs(safeAmount) >= 1000) {
        return `${symbol}${(safeAmount / 1000).toFixed(1)}k`;
      }
    }
  }

  const locale = currency === "INR" ? "en-IN" : currency === "EUR" ? "de-DE" : "en-US";
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currency,
      maximumFractionDigits: compact ? 1 : 0,
    }).format(safeAmount);
  } catch {
    return `${symbol}${Math.round(safeAmount).toLocaleString(locale)}`;
  }
}

/**
 * Formats an INR base value into the target currency with standardized symbol and conversion.
 */
export function formatRevenueValue(
  amountInInr: number,
  currency: SupportedCurrency = "INR",
  compact: boolean = false
): string {
  const converted = convertInrToTargetCurrency(amountInInr, currency);
  return formatStandardCurrency(converted, currency, compact);
}

/**
 * Computes linear regression parameters (slope m, intercept c) and returns forecast values.
 */
export function computeLinearRegressionForecast(
  historicalPoints: number[],
  forecastCount: number = 6
): { slope: number; intercept: number; forecastPoints: number[]; rSquared: number } {
  const n = historicalPoints.length;
  if (n < 2) {
    return {
      slope: 0,
      intercept: historicalPoints[0] || 0,
      forecastPoints: Array(forecastCount).fill(historicalPoints[0] || 0),
      rSquared: 1,
    };
  }

  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumX2 = 0;
  let sumY2 = 0;

  for (let i = 0; i < n; i++) {
    const x = i;
    const y = historicalPoints[i];
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumX2 += x * x;
    sumY2 += y * y;
  }

  const denominator = n * sumX2 - sumX * sumX;
  const slope = denominator !== 0 ? (n * sumXY - sumX * sumY) / denominator : 0;
  const intercept = (sumY - slope * sumX) / n;

  // Calculate R² (Goodness of fit)
  const yMean = sumY / n;
  let ssTot = 0;
  let ssRes = 0;
  for (let i = 0; i < n; i++) {
    const yActual = historicalPoints[i];
    const yPredicted = slope * i + intercept;
    ssTot += Math.pow(yActual - yMean, 2);
    ssRes += Math.pow(yActual - yPredicted, 2);
  }
  const rSquared = ssTot > 0 ? Math.max(0, Math.min(1, 1 - ssRes / ssTot)) : 1;

  const forecastPoints: number[] = [];
  for (let step = 0; step < forecastCount; step++) {
    const x = n + step;
    const projectedVal = Math.max(0, Math.round(slope * x + intercept));
    forecastPoints.push(projectedVal);
  }

  return { slope, intercept, forecastPoints, rSquared };
}

/**
 * Creates a robust default Guest Investor profile so state is NEVER null.
 */
export function createDefaultGuestProfile(customName?: string): UserProfile {
  const nowStr = new Date().toISOString();
  const todayStr = nowStr.split("T")[0];

  return {
    uid: "guest_investor_" + Math.random().toString(36).substring(2, 9),
    name: customName || "Guest Investor",
    age: "28",
    learningGoal: "Elite Wealth & XPRIZE Monetization",
    currency: "INR",
    joinDate: nowStr,
    lastVisit: nowStr,
    visitDates: [todayStr],
    highScore: 100,
    isPremium: true,
    riskProfile: "AGGRESSIVE_GROWTH",
    netWorth: {
      assets: 5000000,
      liabilities: 0,
    },
    streak: 1,
    maxStreak: 1,
    xp: 450,
    coins: 200,
    achievements: [
      {
        id: "elite_onboarding",
        title: "Sovereign Genesis",
        description: "Initialized WealthWise Elite sovereign AI wealth workstation.",
        icon: "ShieldCheck",
        unlockedAt: nowStr,
      },
    ],
    userRevenueData: {
      amount: 2053560,
      source: "Pro Subscriptions",
      frequency: "monthly",
      lastUpdated: nowStr,
      notes: "Default verified ARR baseline & sovereign AI enterprise distribution.",
    },
  };
}

/**
 * Safely parses and hydrates a user profile with fallback guarantees.
 */
export function safeHydrateProfile(storedProfileString: string | null | undefined): UserProfile {
  if (!storedProfileString) {
    return createDefaultGuestProfile();
  }

  try {
    const parsed = JSON.parse(storedProfileString);
    if (!parsed || typeof parsed !== "object") {
      return createDefaultGuestProfile();
    }

    return {
      uid: parsed.uid || "guest_" + Math.random().toString(36).substring(2, 9),
      name: parsed.name && parsed.name !== "Yash Choubey" ? parsed.name : "Guest Investor",
      age: parsed.age || "28",
      learningGoal: parsed.learningGoal || "Elite Wealth & XPRIZE Monetization",
      currency: parsed.currency || "INR",
      joinDate: parsed.joinDate || new Date().toISOString(),
      lastVisit: new Date().toISOString(),
      visitDates: Array.isArray(parsed.visitDates) ? parsed.visitDates : [new Date().toISOString().split("T")[0]],
      highScore: typeof parsed.highScore === "number" ? parsed.highScore : 100,
      isPremium: parsed.isPremium ?? true,
      riskProfile: parsed.riskProfile || "AGGRESSIVE_GROWTH",
      netWorth: parsed.netWorth && typeof parsed.netWorth.assets === "number" ? parsed.netWorth : { assets: 5000000, liabilities: 0 },
      achievements: Array.isArray(parsed.achievements) ? parsed.achievements : [],
      streak: typeof parsed.streak === "number" ? parsed.streak : 1,
      maxStreak: typeof parsed.maxStreak === "number" ? parsed.maxStreak : 1,
      xp: typeof parsed.xp === "number" ? parsed.xp : 450,
      coins: typeof parsed.coins === "number" ? parsed.coins : 200,
      userRevenueData: parsed.userRevenueData || {
        amount: 2053560,
        source: "Pro Subscriptions",
        frequency: "monthly",
        lastUpdated: new Date().toISOString(),
      },
    };
  } catch (e) {
    console.warn("safeHydrateProfile error, utilizing default fallback:", e);
    return createDefaultGuestProfile();
  }
}
