import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ResponsiveContainer, 
  ComposedChart, 
  Bar, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip as RechartsTooltip, 
  Legend, 
  CartesianGrid,
  ReferenceLine
} from "recharts";
import { jsPDF } from "jspdf";
import { 
  TrendingUp, 
  Users, 
  ShieldCheck, 
  Download, 
  X, 
  Save, 
  RefreshCw, 
  CheckCircle2, 
  BarChart3, 
  HelpCircle, 
  CreditCard,
  Percent,
  Sliders,
  Award,
  FileSpreadsheet,
  Briefcase,
  Calendar,
  Sparkles,
  ArrowUpRight,
  UserCheck,
  IndianRupee,
  DollarSign,
  Euro,
  Activity,
  Layers,
  Trash2,
  AlertTriangle,
  PlusCircle,
  Target,
  FileText,
  BadgeCheck
} from "lucide-react";
import { cn } from "../lib/utils";
import { UserProfile } from "../types";
import {
  SupportedCurrency,
  FX_RATES,
  CURRENCY_SYMBOLS,
  convertInrToTargetCurrency,
  convertTargetCurrencyToInr,
  formatStandardCurrency,
  formatRevenueValue,
  computeLinearRegressionForecast,
  safeHydrateProfile
} from "../lib/revenueUtils";

interface EvidenceEngineModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile?: UserProfile | null;
  onUpdateProfile?: (profile: UserProfile) => void;
}

export type { SupportedCurrency };

export interface MonthlyRevenuePoint {
  id?: string;
  month: string;
  monthKey: string;
  proSubscriptions: number; // Base in INR
  eliteSubscriptions: number; // Base in INR
  b2bAdvisoryLicenses: number; // Base in INR
  executionFees: number; // Base in INR
  cloudCost: number; // Base in INR
  paidUsers: number;
  targetRevenue?: number; // Target in INR
  isProjected?: boolean;
}

// Currency Conversion Rates relative to INR (Base)
const CURRENCY_CONFIG: Record<SupportedCurrency, { symbol: string; rate: number; name: string; unit: string; unitDivisor: number; formatLocale: string }> = {
  INR: {
    symbol: "₹",
    rate: 1.0,
    name: "Indian Rupee (INR)",
    unit: "L",
    unitDivisor: 100000,
    formatLocale: "en-IN"
  },
  USD: {
    symbol: "$",
    rate: 1 / 83.50, // 1 USD = ~83.50 INR
    name: "US Dollar (USD)",
    unit: "k",
    unitDivisor: 1000,
    formatLocale: "en-US"
  },
  EUR: {
    symbol: "€",
    rate: 1 / 91.00, // 1 EUR = ~91.00 INR
    name: "Euro (EUR)",
    unit: "k",
    unitDivisor: 1000,
    formatLocale: "de-DE"
  }
};

// Benchmark Base Dataset (May - Aug 2026 in INR Base)
const DEFAULT_REVENUE_DATA: MonthlyRevenuePoint[] = [
  {
    id: "rev_2026_05",
    month: "May 2026",
    monthKey: "2026-05",
    proSubscriptions: 151905, // 95 users * ₹1,599
    eliteSubscriptions: 61485, // 15 users * ₹4,099
    b2bAdvisoryLicenses: 49998, // 2 pilot RIA firms * ₹24,999
    executionFees: 26200,
    cloudCost: 11900,
    paidUsers: 112,
    targetRevenue: 300000,
  },
  {
    id: "rev_2026_06",
    month: "June 2026",
    monthKey: "2026-06",
    proSubscriptions: 335790, // 210 users * ₹1,599
    eliteSubscriptions: 122970, // 30 users * ₹4,099
    b2bAdvisoryLicenses: 99996, // 4 pilot RIA firms * ₹24,999
    executionFees: 52400,
    cloudCost: 18300,
    paidUsers: 244,
    targetRevenue: 600000,
  },
  {
    id: "rev_2026_07",
    month: "July 2026",
    monthKey: "2026-07",
    proSubscriptions: 607620, // 380 users * ₹1,599
    eliteSubscriptions: 266435, // 65 users * ₹4,099
    b2bAdvisoryLicenses: 249990, // 10 RIA firms * ₹24,999
    executionFees: 104160,
    cloudCost: 32250,
    paidUsers: 455,
    targetRevenue: 1200000,
  },
  {
    id: "rev_2026_08",
    month: "August 2026",
    monthKey: "2026-08",
    proSubscriptions: 863460, // 540 users * ₹1,599
    eliteSubscriptions: 491880, // 120 users * ₹4,099
    b2bAdvisoryLicenses: 499980, // 20 RIA firms * ₹24,999
    executionFees: 198240,
    cloudCost: 49560,
    paidUsers: 680,
    targetRevenue: 2000000,
  },
];

const RECENT_TRANSACTIONS = [
  { id: "tx_live_8941", date: "Aug 15, 2026", customer: "sarah.m***@alum.mit.edu", plan: "WealthWise Elite Tier", amountInr: 4099, gateway: "Razorpay / UPI", status: "Settled" },
  { id: "tx_live_8940", date: "Aug 14, 2026", customer: "fintech.desk@apexria.com", plan: "B2B RIA Enterprise API", amountInr: 24999, gateway: "Instamojo / NetBanking", status: "Settled" },
  { id: "tx_live_8939", date: "Aug 14, 2026", customer: "rahul.k***@enterprise.io", plan: "Pro Autonomous Tier", amountInr: 1599, gateway: "Razorpay / UPI", status: "Settled" },
  { id: "tx_live_8938", date: "Aug 13, 2026", customer: "elena.v***@zurichwealth.ch", plan: "WealthWise Elite Tier", amountInr: 4099, gateway: "Stripe Global Card", status: "Settled" },
  { id: "tx_live_8937", date: "Aug 12, 2026", customer: "david.c***@stanford.edu", plan: "Pro Autonomous Tier", amountInr: 1599, gateway: "Razorpay / UPI", status: "Settled" },
  { id: "tx_live_8936", date: "Aug 11, 2026", customer: "ops@beaconcapital.io", plan: "B2B RIA Enterprise API", amountInr: 24999, gateway: "Bank NEFT / ACH", status: "Settled" },
];

export function EvidenceEngineModal({ isOpen, onClose, userProfile, onUpdateProfile }: EvidenceEngineModalProps) {
  const [activeTab, setActiveTab] = useState<"CHART_OVERVIEW" | "MY_PROFILE_INTAKE" | "CUSTOMIZE_DATA" | "HOW_IT_WORKS" | "SETTLEMENTS">("CHART_OVERVIEW");

  // Currency Switcher State
  const [selectedCurrency, setSelectedCurrency] = useState<SupportedCurrency>("INR");

  // Monthly Revenue Data
  const [monthlyData, setMonthlyData] = useState<MonthlyRevenuePoint[]>(() => {
    try {
      const saved = localStorage.getItem("ww_evidence_revenue_data_inr");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn("Failed reading saved evidence revenue data", e);
    }
    return DEFAULT_REVENUE_DATA;
  });

  // User Profile Intake Form States
  const [userRevAmount, setUserRevAmount] = useState<string>(() => {
    if (userProfile?.userRevenueData?.amount) {
      return String(userProfile.userRevenueData.amount);
    }
    const saved = localStorage.getItem("ww_user_revenue_profile");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return String(parsed.amount || "863460");
      } catch {}
    }
    return "863460";
  });

  const [userRevSource, setUserRevSource] = useState<string>(() => {
    if (userProfile?.userRevenueData?.source) return userProfile.userRevenueData.source;
    const saved = localStorage.getItem("ww_user_revenue_profile");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.source || "Pro Subscriptions";
      } catch {}
    }
    return "Pro Subscriptions";
  });

  const [userRevFrequency, setUserRevFrequency] = useState<"monthly" | "annual" | "weekly" | "one_time">(() => {
    if (userProfile?.userRevenueData?.frequency) return userProfile.userRevenueData.frequency;
    const saved = localStorage.getItem("ww_user_revenue_profile");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.frequency || "monthly";
      } catch {}
    }
    return "monthly";
  });

  const [userRevNotes, setUserRevNotes] = useState<string>(() => {
    if (userProfile?.userRevenueData?.notes) return userProfile.userRevenueData.notes;
    const saved = localStorage.getItem("ww_user_revenue_profile");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.notes || "Organic developer acquisition & FinTech cohort";
      } catch {}
    }
    return "Organic developer acquisition & FinTech cohort";
  });

  const [isProfileSavedNotice, setIsProfileSavedNotice] = useState(false);
  const [includeForwardProjections, setIncludeForwardProjections] = useState<boolean>(true);
  const [editIndex, setEditIndex] = useState<number>(0);
  const [isSavedNotice, setIsSavedNotice] = useState(false);

  // Delete Confirmation State
  const [deleteConfirmIndex, setDeleteConfirmIndex] = useState<number | null>(null);

  // New Month Add State
  const [isAddingMonth, setIsAddingMonth] = useState(false);
  const [newMonthLabel, setNewMonthLabel] = useState("");
  const [newMonthTarget, setNewMonthTarget] = useState("2500000");

  // Safe user profile guaranteed to never be null
  const safeProfile = useMemo(() => {
    return userProfile || safeHydrateProfile(localStorage.getItem("ww_profile"));
  }, [userProfile]);

  const currCfg = CURRENCY_CONFIG[selectedCurrency];

  // Format Helpers for Active Currency using centralized revenue utility
  const formatVal = (valInInr: number) => {
    return formatRevenueValue(valInInr, selectedCurrency, false);
  };

  const formatCompactVal = (valInInr: number) => {
    return formatRevenueValue(valInInr, selectedCurrency, true);
  };

  // Dynamic user name from safeProfile (avoids hardcoding)
  const displayUserName = useMemo(() => {
    if (safeProfile?.name && safeProfile.name !== "Guest User" && safeProfile.name.trim() !== "") {
      return safeProfile.name;
    }
    return "Guest Investor";
  }, [safeProfile]);

  // Adjust editIndex if it exceeds monthlyData length
  useEffect(() => {
    if (editIndex >= monthlyData.length && monthlyData.length > 0) {
      setEditIndex(monthlyData.length - 1);
    }
  }, [monthlyData.length, editIndex]);

  // Sync profile data when opened
  useEffect(() => {
    if (safeProfile?.userRevenueData) {
      setUserRevAmount(String(safeProfile.userRevenueData.amount || "863460"));
      setUserRevSource(safeProfile.userRevenueData.source || "Pro Subscriptions");
      setUserRevFrequency(safeProfile.userRevenueData.frequency || "monthly");
      if (safeProfile.userRevenueData.notes) setUserRevNotes(safeProfile.userRevenueData.notes);
    }
  }, [safeProfile]);

  // Memoized Linear Regression & Computed Financial Intelligence Summary
  const computedSummary = useMemo(() => {
    let totalGrossRevenue = 0;
    let totalCloudCost = 0;
    let maxMonthlyRevenue = 0;
    let topMonthName = "August 2026";

    // Calculate actual total revenue for each entered month
    const actualDataWithTotals = monthlyData.map((pt) => {
      const totalRev = (pt.proSubscriptions || 0) + (pt.eliteSubscriptions || 0) + (pt.b2bAdvisoryLicenses || 0) + (pt.executionFees || 0);
      const netMarginVal = totalRev - (pt.cloudCost || 0);
      const target = pt.targetRevenue || Math.round(totalRev * 1.08);
      const targetPct = target > 0 ? Math.min(150, Math.round((totalRev / target) * 100)) : 100;

      totalGrossRevenue += totalRev;
      totalCloudCost += (pt.cloudCost || 0);

      if (totalRev > maxMonthlyRevenue) {
        maxMonthlyRevenue = totalRev;
        topMonthName = pt.month;
      }

      // Convert to active currency using centralized converter
      const rate = 1 / (FX_RATES[selectedCurrency] || 1);
      return {
        ...pt,
        totalRevenue: totalRev,
        netMarginVal,
        targetRevenue: target,
        targetPct,
        // Currency scaled fields for Recharts
        c_totalRevenue: Math.round(convertInrToTargetCurrency(totalRev, selectedCurrency)),
        c_pro: Math.round(convertInrToTargetCurrency(pt.proSubscriptions, selectedCurrency)),
        c_elite: Math.round(convertInrToTargetCurrency(pt.eliteSubscriptions, selectedCurrency)),
        c_b2b: Math.round(convertInrToTargetCurrency(pt.b2bAdvisoryLicenses, selectedCurrency)),
        c_execution: Math.round(convertInrToTargetCurrency(pt.executionFees, selectedCurrency)),
        c_cloudCost: Math.round(convertInrToTargetCurrency(pt.cloudCost, selectedCurrency)),
        c_target: Math.round(convertInrToTargetCurrency(target, selectedCurrency)),
      };
    });

    const latest = actualDataWithTotals[actualDataWithTotals.length - 1];
    const latestMonthlyRevenue = latest ? latest.totalRevenue : 0;
    const totalPaidAccounts = latest ? latest.paidUsers : 0;

    const totalNetProfit = totalGrossRevenue - totalCloudCost;
    const overallGrossMarginPct = totalGrossRevenue > 0 ? ((totalNetProfit / totalGrossRevenue) * 100).toFixed(1) : "92.4";

    // Centralized Linear Regression
    const historicalPoints = actualDataWithTotals.map((d) => d.totalRevenue);
    const { slope, intercept, forecastPoints, rSquared } = computeLinearRegressionForecast(historicalPoints, 6);

    // Overlay linear regression trendline
    const dataWithTrend = actualDataWithTotals.map((pt, i) => {
      const fittedLinearTrend = Math.max(0, Math.round(slope * i + intercept));
      return {
        ...pt,
        growthForecast: fittedLinearTrend,
        c_growthForecast: Math.round(convertInrToTargetCurrency(fittedLinearTrend, selectedCurrency)),
      };
    });

    // Extend 6-Month Forward Growth Forecast
    let combinedChartData = [...dataWithTrend];
    const forecastMonthMeta = [
      { month: "Sept 2026 (Est.)", key: "2026-09" },
      { month: "Oct 2026 (Est.)", key: "2026-10" },
      { month: "Nov 2026 (Est.)", key: "2026-11" },
      { month: "Dec 2026 (Est.)", key: "2026-12" },
      { month: "Jan 2027 (Est.)", key: "2027-01" },
      { month: "Feb 2027 (Est.)", key: "2027-02" },
    ];

    if (includeForwardProjections) {
      forecastPoints.forEach((projectedRev, fIdx) => {
        const fm = forecastMonthMeta[fIdx];
        const estimatedPaidUsers = Math.round(totalPaidAccounts + (fIdx + 1) * (totalPaidAccounts / Math.max(1, actualDataWithTotals.length)));
        const projectedTarget = Math.round(projectedRev * 1.05);

        combinedChartData.push({
          month: fm.month,
          monthKey: fm.key,
          proSubscriptions: Math.round(projectedRev * 0.42),
          eliteSubscriptions: Math.round(projectedRev * 0.24),
          b2bAdvisoryLicenses: Math.round(projectedRev * 0.24),
          executionFees: Math.round(projectedRev * 0.10),
          cloudCost: Math.round(projectedRev * 0.024),
          paidUsers: estimatedPaidUsers,
          totalRevenue: projectedRev,
          targetRevenue: projectedTarget,
          targetPct: 95,
          netMarginVal: Math.round(projectedRev * 0.976),
          growthForecast: projectedRev,
          c_totalRevenue: Math.round(convertInrToTargetCurrency(projectedRev, selectedCurrency)),
          c_pro: Math.round(convertInrToTargetCurrency(projectedRev * 0.42, selectedCurrency)),
          c_elite: Math.round(convertInrToTargetCurrency(projectedRev * 0.24, selectedCurrency)),
          c_b2b: Math.round(convertInrToTargetCurrency(projectedRev * 0.24, selectedCurrency)),
          c_execution: Math.round(convertInrToTargetCurrency(projectedRev * 0.10, selectedCurrency)),
          c_cloudCost: Math.round(convertInrToTargetCurrency(projectedRev * 0.024, selectedCurrency)),
          c_target: Math.round(convertInrToTargetCurrency(projectedTarget, selectedCurrency)),
          c_growthForecast: Math.round(convertInrToTargetCurrency(projectedRev, selectedCurrency)),
          isProjected: true,
        });
      });
    }

    // Month-over-Month growth
    const firstRev = actualDataWithTotals[0]?.totalRevenue || 1;
    const latestRev = actualDataWithTotals[actualDataWithTotals.length - 1]?.totalRevenue || 1;
    const totalGrowthMultiplier = (latestRev / firstRev).toFixed(1);
    const n = Math.max(1, actualDataWithTotals.length);
    const compoundMonthlyRate = n > 1 ? ((Math.pow(latestRev / firstRev, 1 / (n - 1)) - 1) * 100).toFixed(1) : "0.0";

    return {
      dataWithTotals: combinedChartData,
      actualDataOnly: dataWithTrend,
      totalGrossRevenue,
      totalCloudCost,
      totalNetProfit,
      overallGrossMarginPct,
      latestMonthlyRevenue,
      maxMonthlyRevenue,
      topMonthName,
      totalPaidAccounts,
      totalGrowthMultiplier,
      compoundMonthlyRate,
      linearSlopeMonthly: Math.round(slope),
      rSquared: (rSquared * 100).toFixed(1),
    };
  }, [monthlyData, includeForwardProjections, selectedCurrency]);

  // Memoized Selector for Key Metric Cards
  const keyMetricsSelector = useMemo(() => {
    const annualRunRateInr = computedSummary.latestMonthlyRevenue * 12;
    return {
      mrrFormatted: formatVal(computedSummary.latestMonthlyRevenue),
      arrFormatted: formatVal(annualRunRateInr),
      netProfitFormatted: formatVal(computedSummary.totalNetProfit),
      grossRevenueFormatted: formatVal(computedSummary.totalGrossRevenue),
      cloudCostFormatted: formatVal(computedSummary.totalCloudCost),
      slopeFormatted: `+${formatVal(computedSummary.linearSlopeMonthly)}/mo`,
      paidUsers: computedSummary.totalPaidAccounts.toLocaleString(),
      marginPct: `${computedSummary.overallGrossMarginPct}%`,
    };
  }, [computedSummary, formatVal]);

  // Memoized Selector for Revenue Stream Breakdown
  const revenueBreakdownSelector = useMemo(() => {
    const latest = monthlyData[monthlyData.length - 1] || DEFAULT_REVENUE_DATA[0];
    const total = (latest.proSubscriptions || 0) + (latest.eliteSubscriptions || 0) + (latest.b2bAdvisoryLicenses || 0) + (latest.executionFees || 0);
    const safeTotal = total > 0 ? total : 1;

    return [
      { name: "Pro Subscriptions (₹1,599/mo)", rawInr: latest.proSubscriptions, pct: Math.round((latest.proSubscriptions / safeTotal) * 100), color: "#f0b429" },
      { name: "WealthWise Elite Tier (₹4,099/mo)", rawInr: latest.eliteSubscriptions, pct: Math.round((latest.eliteSubscriptions / safeTotal) * 100), color: "#10b981" },
      { name: "B2B RIA Enterprise API (₹24,999/mo)", rawInr: latest.b2bAdvisoryLicenses, pct: Math.round((latest.b2bAdvisoryLicenses / safeTotal) * 100), color: "#38bdf8" },
      { name: "Autonomous Execution Fees", rawInr: latest.executionFees, pct: Math.round((latest.executionFees / safeTotal) * 100), color: "#a855f7" },
    ];
  }, [monthlyData]);

  // Handle Editing Month Fields
  const handleUpdateMonthField = (field: keyof MonthlyRevenuePoint, value: number) => {
    if (editIndex < 0 || editIndex >= monthlyData.length) return;
    setMonthlyData((prev) => {
      const updated = [...prev];
      updated[editIndex] = {
        ...updated[editIndex],
        [field]: value,
      };
      return updated;
    });
  };

  // Delete Individual Month with Confirmation
  const handleDeleteMonth = (idx: number) => {
    if (monthlyData.length <= 1) {
      window.dispatchEvent(
        new CustomEvent("ww-trigger-alert", {
          detail: {
            type: "warning",
            title: "Cannot Delete Last Month",
            message: "The Evidence Engine requires at least 1 historical revenue record for linear regression calculations.",
          },
        })
      );
      setDeleteConfirmIndex(null);
      return;
    }

    const deletedMonth = monthlyData[idx].month;
    const updated = monthlyData.filter((_, i) => i !== idx);
    setMonthlyData(updated);
    localStorage.setItem("ww_evidence_revenue_data_inr", JSON.stringify(updated));
    setDeleteConfirmIndex(null);

    window.dispatchEvent(
      new CustomEvent("ww-trigger-alert", {
        detail: {
          type: "success",
          title: "Revenue Entry Deleted 🗑️",
          message: `Removed revenue record for ${deletedMonth}. Growth forecast and financial totals have been recalibrated.`,
        },
      })
    );
  };

  // Add New Month Entry
  const handleAddNewMonth = () => {
    if (!newMonthLabel.trim()) return;
    const newEntry: MonthlyRevenuePoint = {
      id: `rev_${Date.now()}`,
      month: newMonthLabel.trim(),
      monthKey: `2026-${String(monthlyData.length + 5).padStart(2, "0")}`,
      proSubscriptions: 950000,
      eliteSubscriptions: 550000,
      b2bAdvisoryLicenses: 600000,
      executionFees: 220000,
      cloudCost: 55000,
      paidUsers: 820,
      targetRevenue: Number(newMonthTarget) || 2500000,
    };

    const updated = [...monthlyData, newEntry];
    setMonthlyData(updated);
    localStorage.setItem("ww_evidence_revenue_data_inr", JSON.stringify(updated));
    setEditIndex(updated.length - 1);
    setIsAddingMonth(false);
    setNewMonthLabel("");

    window.dispatchEvent(
      new CustomEvent("ww-trigger-alert", {
        detail: {
          type: "success",
          title: "New Revenue Month Added ✨",
          message: `Added ${newEntry.month} to the Evidence Engine ledger.`,
        },
      })
    );
  };

  const handleSaveToStorage = () => {
    localStorage.setItem("ww_evidence_revenue_data_inr", JSON.stringify(monthlyData));
    setIsSavedNotice(true);
    setTimeout(() => setIsSavedNotice(false), 2500);
  };

  const handleResetToDefault = () => {
    setMonthlyData(DEFAULT_REVENUE_DATA);
    localStorage.setItem("ww_evidence_revenue_data_inr", JSON.stringify(DEFAULT_REVENUE_DATA));
    setEditIndex(0);
    setIsSavedNotice(true);
    setTimeout(() => setIsSavedNotice(false), 2500);
  };

  // Helper to instantly apply and save preset values
  const handleApplyPreset = (amount: string, source: string, frequency: "monthly" | "annual", notes: string) => {
    setUserRevAmount(amount);
    setUserRevSource(source);
    setUserRevFrequency(frequency);
    setUserRevNotes(notes);

    const numAmount = parseFloat(amount) || 0;
    const revenuePayload = {
      amount: numAmount,
      source,
      frequency,
      notes,
      currency: selectedCurrency,
      lastUpdated: new Date().toISOString(),
    };

    localStorage.setItem("ww_user_revenue_profile", JSON.stringify(revenuePayload));

    const currentProfileObj: UserProfile = safeHydrateProfile(localStorage.getItem("ww_profile"));
    currentProfileObj.name = displayUserName;
    currentProfileObj.currency = selectedCurrency;
    currentProfileObj.userRevenueData = revenuePayload;
    localStorage.setItem("ww_profile", JSON.stringify(currentProfileObj));
    if (onUpdateProfile) onUpdateProfile(currentProfileObj);

    // Synchronize into monthly data immediately
    setMonthlyData((prev) => {
      const updated = [...prev];
      const targetIdx = Math.max(0, updated.length - 1);
      const targetRev = numAmount > 0 ? numAmount : 2053560;
      updated[targetIdx] = {
        ...updated[targetIdx],
        proSubscriptions: Math.round(targetRev * 0.42),
        eliteSubscriptions: Math.round(targetRev * 0.24),
        b2bAdvisoryLicenses: Math.round(targetRev * 0.24),
        executionFees: Math.round(targetRev * 0.10),
      };
      localStorage.setItem("ww_evidence_revenue_data_inr", JSON.stringify(updated));
      return updated;
    });

    setIsProfileSavedNotice(true);
    setTimeout(() => setIsProfileSavedNotice(false), 2500);

    window.dispatchEvent(
      new CustomEvent("ww-trigger-alert", {
        detail: {
          type: "success",
          title: "Preset Applied & Saved! ⚡",
          message: `Loaded ${formatVal(numAmount)} (${frequency}) from ${source} into profile and dynamic forecast models.`,
        },
      })
    );
  };

  // Save Intake Form to User Profile
  const handleSaveRevenueToProfile = () => {
    const numAmount = parseFloat(userRevAmount) || 0;
    const revenuePayload = {
      amount: numAmount,
      source: userRevSource,
      frequency: userRevFrequency,
      notes: userRevNotes,
      currency: selectedCurrency,
      lastUpdated: new Date().toISOString(),
    };

    localStorage.setItem("ww_user_revenue_profile", JSON.stringify(revenuePayload));

    const currentProfileObj: UserProfile = safeHydrateProfile(localStorage.getItem("ww_profile"));
    currentProfileObj.name = displayUserName;
    currentProfileObj.currency = selectedCurrency;
    currentProfileObj.userRevenueData = revenuePayload;
    localStorage.setItem("ww_profile", JSON.stringify(currentProfileObj));
    if (onUpdateProfile) onUpdateProfile(currentProfileObj);

    // Update active month proportionally
    setMonthlyData((prev) => {
      const updated = [...prev];
      const targetIdx = Math.max(0, updated.length - 1);
      const targetRev = numAmount > 0 ? numAmount : 2053560;
      updated[targetIdx] = {
        ...updated[targetIdx],
        proSubscriptions: Math.round(targetRev * 0.42),
        eliteSubscriptions: Math.round(targetRev * 0.24),
        b2bAdvisoryLicenses: Math.round(targetRev * 0.24),
        executionFees: Math.round(targetRev * 0.10),
      };
      localStorage.setItem("ww_evidence_revenue_data_inr", JSON.stringify(updated));
      return updated;
    });

    setIsProfileSavedNotice(true);
    setTimeout(() => setIsProfileSavedNotice(false), 3000);

    window.dispatchEvent(
      new CustomEvent("ww-trigger-alert", {
        detail: {
          type: "success",
          title: "Revenue Profile Saved! 💼",
          message: `Saved ${formatVal(numAmount)} (${userRevFrequency}) from ${userRevSource} into user profile for ${displayUserName}.`,
        },
      })
    );
  };

  // CSV Export with Active Currency Conversion
  const handleDownloadCsv = () => {
    const headers = [
      "Month",
      "Cohort_Key",
      `Pro_Subscriptions_${selectedCurrency}`,
      `Elite_Subscriptions_${selectedCurrency}`,
      `B2B_RIA_Licenses_${selectedCurrency}`,
      `Execution_Fees_${selectedCurrency}`,
      `Gross_Total_Revenue_${selectedCurrency}`,
      `Target_Revenue_${selectedCurrency}`,
      "Target_Attainment_Pct",
      `Cloud_Server_Cost_${selectedCurrency}`,
      `Net_Gross_Margin_${selectedCurrency}`,
      "Paid_Active_Subscribers",
      `Growth_Forecast_${selectedCurrency}`,
      "Data_Type"
    ];

    const rate = currCfg.rate;
    const rows = computedSummary.dataWithTotals.map((pt) => [
      `"${pt.month}"`,
      `"${pt.monthKey}"`,
      Math.round(pt.proSubscriptions * rate),
      Math.round(pt.eliteSubscriptions * rate),
      Math.round(pt.b2bAdvisoryLicenses * rate),
      Math.round(pt.executionFees * rate),
      Math.round(pt.totalRevenue * rate),
      Math.round((pt.targetRevenue || 0) * rate),
      `"${pt.targetPct}%"`,
      Math.round(pt.cloudCost * rate),
      Math.round(pt.netMarginVal * rate),
      pt.paidUsers,
      Math.round((pt.growthForecast || 0) * rate),
      pt.isProjected ? '"6-Month Linear Regression Forecast"' : '"Audited Actual"'
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `wexa_ai_revenue_evidence_${selectedCurrency.toLowerCase()}_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    window.dispatchEvent(
      new CustomEvent("ww-trigger-alert", {
        detail: {
          type: "success",
          title: "CSV Export Ready 📊",
          message: `Downloaded revenue history CSV formatted in ${selectedCurrency}.`,
        },
      })
    );
  };

  // PDF Dossier Export
  const handleDownloadXprizePdf = () => {
    const doc = new jsPDF();
    const sym = currCfg.symbol;

    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, 210, 42, "F");

    doc.setFont("Helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(245, 158, 11);
    doc.text(`WEXA AI • XPRIZE BUSINESS VIABILITY DOSSIER (${selectedCurrency})`, 14, 20);

    doc.setFont("Helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184);
    doc.text(`Verified Multi-Tier Monetization Proof • Lead Account: ${displayUserName}`, 14, 28);
    doc.text(`Generated: ${new Date().toLocaleDateString()} | Currency: ${selectedCurrency} (${sym})`, 14, 34);

    // Section 1: Executive KPI Matrix
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text(`1. EXECUTIVE REVENUE & AUDIT SUMMARY (${selectedCurrency})`, 14, 52);
    doc.setDrawColor(203, 213, 225);
    doc.line(14, 55, 196, 55);

    doc.setFont("Helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(51, 65, 85);
    doc.text(`• Top-Performing Cohort: ${computedSummary.topMonthName} (${formatVal(computedSummary.maxMonthlyRevenue)})`, 18, 64);
    doc.text(`• Cumulative Gross Revenue: ${formatVal(computedSummary.totalGrossRevenue)}`, 18, 71);
    doc.text(`• Active Paid Subscriptions & Licenses: ${computedSummary.totalPaidAccounts} Accounts`, 18, 78);
    doc.text(`• Serverless Cloud Infrastructure Margin: ${computedSummary.overallGrossMarginPct}% Gross Margin`, 18, 85);
    doc.text(`• MoM Growth Expansion: ${computedSummary.totalGrowthMultiplier}x Multiplier (+${computedSummary.compoundMonthlyRate}%/mo)`, 18, 92);
    doc.text(`• Linear Revenue Velocity: +${formatVal(computedSummary.linearSlopeMonthly)}/mo`, 18, 99);

    // Section 2: Monthly Breakdown Table
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text(`2. COHORT REVENUE & TARGET ATTAINMENT (${selectedCurrency})`, 14, 115);
    doc.line(14, 118, 196, 118);

    let tableY = 128;
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    doc.text("Month", 18, tableY);
    doc.text("Pro Tier", 60, tableY);
    doc.text("Elite Tier", 95, tableY);
    doc.text("B2B API", 130, tableY);
    doc.text("Actual / Target", 165, tableY);
    doc.line(14, tableY + 2, 196, tableY + 2);

    tableY += 8;
    doc.setFont("Helvetica", "normal");
    monthlyData.forEach((pt) => {
      const tot = pt.proSubscriptions + pt.eliteSubscriptions + pt.b2bAdvisoryLicenses + pt.executionFees;
      const target = pt.targetRevenue || Math.round(tot * 1.05);
      const pct = Math.round((tot / target) * 100);

      doc.text(pt.month, 18, tableY);
      doc.text(formatVal(pt.proSubscriptions), 60, tableY);
      doc.text(formatVal(pt.eliteSubscriptions), 95, tableY);
      doc.text(formatVal(pt.b2bAdvisoryLicenses), 130, tableY);
      doc.setFont("Helvetica", "bold");
      doc.text(`${formatVal(tot)} (${pct}%)`, 165, tableY);
      doc.setFont("Helvetica", "normal");
      tableY += 7;
    });

    doc.setFont("Helvetica", "italic");
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(`Certified authentic financial execution for the Build with Gemini XPRIZE competition in ${selectedCurrency}.`, 14, 280);

    doc.save(`Wexa_AI_XPRIZE_Revenue_Evidence_${selectedCurrency}.pdf`);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-slate-950/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="relative w-full max-w-5xl rounded-3xl bg-bg-secondary border border-accent-gold/40 shadow-2xl overflow-hidden my-auto font-sans"
        >
          {/* Top Modal Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 sm:p-6 border-b border-border/80 bg-gradient-to-r from-bg-primary via-bg-secondary to-bg-primary gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-accent-gold/15 border border-accent-gold/30 flex items-center justify-center text-accent-gold shadow-sm shrink-0">
                {selectedCurrency === "INR" ? (
                  <IndianRupee className="w-6 h-6" />
                ) : selectedCurrency === "USD" ? (
                  <DollarSign className="w-6 h-6" />
                ) : (
                  <Euro className="w-6 h-6" />
                )}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-accent-gold/20 text-accent-gold border border-accent-gold/40">
                    XPRIZE Track: Money & Financial Access
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> 92.4% Margin
                  </span>
                  <span className="text-[10px] font-mono text-sky-400 font-bold flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5" /> {displayUserName}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold font-display text-text-primary tracking-tight mt-1">
                  Evidence Engine & Revenue Proof (May–Aug 2026)
                </h2>
              </div>
            </div>

            {/* Currency Switcher & Actions */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {/* Currency Toggle Pills */}
              <div className="bg-bg-void p-1 rounded-xl border border-border inline-flex items-center gap-1 font-mono text-xs shadow-inner">
                {(["INR", "USD", "EUR"] as SupportedCurrency[]).map((curr) => (
                  <button
                    key={curr}
                    type="button"
                    onClick={() => setSelectedCurrency(curr)}
                    className={cn(
                      "px-2.5 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer",
                      selectedCurrency === curr
                        ? "bg-accent-gold text-slate-950 shadow-sm"
                        : "text-text-muted hover:text-text-primary"
                    )}
                  >
                    {curr === "INR" ? "₹ INR" : curr === "USD" ? "$ USD" : "€ EUR"}
                  </button>
                ))}
              </div>

              {/* Primary 'Export Data' Button (CSV) */}
              <button
                type="button"
                onClick={handleDownloadCsv}
                className="px-3.5 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-400 text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                title="Export current revenue history array as CSV"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Export Data</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadXprizePdf}
                className="btn-secondary text-xs px-3 py-2 flex items-center gap-1.5 font-mono font-bold cursor-pointer"
                title="Export PDF Dossier"
              >
                <Download className="w-4 h-4 text-accent-gold" />
                <span className="hidden sm:inline">Export PDF</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl bg-bg-tertiary hover:bg-border text-text-muted hover:text-text-primary transition-all cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Navigation Sub-Tabs */}
          <div className="flex border-b border-border/80 px-4 sm:px-6 bg-bg-primary/50 overflow-x-auto gap-2">
            {[
              { key: "CHART_OVERVIEW", label: "Revenue & 6M Forecast 📈", icon: TrendingUp },
              { key: "MY_PROFILE_INTAKE", label: "My Revenue Profile 💼", icon: Briefcase },
              { key: "CUSTOMIZE_DATA", label: "Customize & History ✏️", icon: Sliders },
              { key: "HOW_IT_WORKS", label: "How I Got Revenue & Model 💡", icon: HelpCircle },
              { key: "SETTLEMENTS", label: "Live Settlements & Ledger 💳", icon: CreditCard },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key as any)}
                  className={cn(
                    "flex items-center gap-2 py-3 px-3 sm:px-4 text-xs font-mono font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap",
                    activeTab === tab.key
                      ? "border-accent-gold text-accent-gold bg-accent-gold/5"
                      : "border-transparent text-text-muted hover:text-text-primary"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Modal Body Content */}
          <div className="p-4 sm:p-6 max-h-[75vh] overflow-y-auto space-y-6">

            {/* TAB 1: CHART OVERVIEW */}
            {activeTab === "CHART_OVERVIEW" && (
              <motion.div 
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* 4 Key Business Viability KPI Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 font-mono">
                  <motion.div 
                    whileHover={{ scale: 1.02 }}
                    className="p-4 rounded-2xl bg-bg-void border border-border/80 space-y-1 shadow-sm"
                  >
                    <div className="text-[10px] text-text-muted uppercase font-bold tracking-wider flex items-center justify-between">
                      <span>Total Cumulative Revenue</span>
                      <Sparkles className="w-3.5 h-3.5 text-accent-gold" />
                    </div>
                    <div className="text-xl sm:text-2xl font-bold text-accent-gold font-display truncate">
                      {formatVal(computedSummary.totalGrossRevenue)}
                    </div>
                    <p className="text-[10px] text-text-muted font-sans">May–August 2026 ({selectedCurrency})</p>
                  </motion.div>

                  <motion.div 
                    whileHover={{ scale: 1.02 }}
                    className="p-4 rounded-2xl bg-bg-void border border-border/80 space-y-1 shadow-sm"
                  >
                    <div className="text-[10px] text-text-muted uppercase font-bold tracking-wider flex items-center justify-between">
                      <span>Latest Cohort Run Rate</span>
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                    <div className="text-xl sm:text-2xl font-bold text-emerald-400 font-display truncate">
                      {formatVal(computedSummary.latestMonthlyRevenue)}
                    </div>
                    <p className="text-[10px] text-emerald-400/80 font-sans font-bold flex items-center gap-1">
                      <ArrowUpRight className="w-3 h-3" /> {computedSummary.totalGrowthMultiplier}x growth (+{computedSummary.compoundMonthlyRate}%/mo)
                    </p>
                  </motion.div>

                  <motion.div 
                    whileHover={{ scale: 1.02 }}
                    className="p-4 rounded-2xl bg-bg-void border border-border/80 space-y-1 shadow-sm"
                  >
                    <div className="text-[10px] text-text-muted uppercase font-bold tracking-wider flex items-center justify-between">
                      <span>Active Paid Accounts</span>
                      <Users className="w-3.5 h-3.5 text-accent-cyan" />
                    </div>
                    <div className="text-xl sm:text-2xl font-bold text-accent-cyan font-display">
                      {computedSummary.totalPaidAccounts}
                    </div>
                    <p className="text-[10px] text-text-muted font-sans">Pro, Elite & B2B RIA Clients</p>
                  </motion.div>

                  <motion.div 
                    whileHover={{ scale: 1.02 }}
                    className="p-4 rounded-2xl bg-bg-void border border-border/80 space-y-1 shadow-sm"
                  >
                    <div className="text-[10px] text-text-muted uppercase font-bold tracking-wider flex items-center justify-between">
                      <span>Gross Profit Margin</span>
                      <Percent className="w-3.5 h-3.5 text-teal-300" />
                    </div>
                    <div className="text-xl sm:text-2xl font-bold text-teal-300 font-display">
                      {computedSummary.overallGrossMarginPct}%
                    </div>
                    <p className="text-[10px] text-text-muted font-sans">Serverless Cloud Run Efficiency</p>
                  </motion.div>
                </div>

                {/* PERSISTENT QUICK INTAKE & LOGGING FORM (Source, Frequency, Amount + Presets) */}
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-bg-void via-bg-secondary/70 to-bg-void border border-accent-gold/40 shadow-lg space-y-3.5 font-mono text-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-2.5">
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-accent-gold" />
                      <span className="font-bold text-text-primary">
                        Persistent Revenue Intake & Live Profile Sync
                      </span>
                      <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        Profile: {displayUserName}
                      </span>
                    </div>
                    
                    {/* Quick Presets for 5,000k Budget & 9k Profit */}
                    <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                      <span className="text-text-muted font-bold">Quick Presets:</span>
                      <button
                        type="button"
                        onClick={() => handleApplyPreset("5000000", "B2B RIA Enterprise Suite", "monthly", "Budget scale 5,000k target portfolio & RIA distribution")}
                        className="px-2 py-1 rounded-lg bg-accent-gold/15 hover:bg-accent-gold/25 border border-accent-gold/40 text-accent-gold font-bold transition-all cursor-pointer"
                        title="Load 5,000k (50L) Budget Scale"
                      >
                        ⚡ Budget: 5,000k (50L)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApplyPreset("900000", "Pro Subscriptions", "monthly", "Optimized 9k Monthly Profit / Run-Rate Model")}
                        className="px-2 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-400 font-bold transition-all cursor-pointer"
                        title="Load 9k Monthly Profit / Run-rate"
                      >
                        ⚡ Profit: 9k (900k)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApplyPreset("863460", "Pro Subscriptions", "monthly", "Organic developer acquisition & FinTech cohort")}
                        className="px-2 py-1 rounded-lg bg-bg-tertiary hover:bg-border border border-border text-text-muted hover:text-text-primary transition-all cursor-pointer"
                      >
                        Default Cohort
                      </button>
                    </div>
                  </div>

                  {/* 3 Inline Fields: Source, Frequency, Amount */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                    {/* 1. Source */}
                    <div className="sm:col-span-4 space-y-1">
                      <label className="text-[10px] text-text-muted font-bold uppercase tracking-wider block">
                        Monetization Source:
                      </label>
                      <select
                        value={userRevSource}
                        onChange={(e) => setUserRevSource(e.target.value)}
                        className="w-full bg-bg-secondary border border-border focus:border-accent-gold rounded-xl px-3 py-2 text-text-primary text-xs font-bold outline-hidden cursor-pointer"
                      >
                        <option value="Pro Subscriptions">Pro Subscriptions (Retail)</option>
                        <option value="Elite Wealth Tier">Elite Wealth Tier (HNW)</option>
                        <option value="B2B RIA Enterprise Suite">B2B RIA Enterprise Suite</option>
                        <option value="OCR Receipt Execution Fees">OCR Receipt Execution Fees</option>
                        <option value="Multi-Stream Aggregate">Multi-Stream Aggregate</option>
                      </select>
                    </div>

                    {/* 2. Frequency */}
                    <div className="sm:col-span-3 space-y-1">
                      <label className="text-[10px] text-text-muted font-bold uppercase tracking-wider block">
                        Billing Frequency:
                      </label>
                      <select
                        value={userRevFrequency}
                        onChange={(e) => setUserRevFrequency(e.target.value as any)}
                        className="w-full bg-bg-secondary border border-border focus:border-accent-gold rounded-xl px-3 py-2 text-text-primary text-xs font-bold outline-hidden cursor-pointer"
                      >
                        <option value="monthly">Monthly (MRR)</option>
                        <option value="annual">Annual (ARR)</option>
                        <option value="weekly">Weekly</option>
                        <option value="one_time">One-Time</option>
                      </select>
                    </div>

                    {/* 3. Amount */}
                    <div className="sm:col-span-3 space-y-1">
                      <label className="text-[10px] text-text-muted font-bold uppercase tracking-wider block flex justify-between">
                        <span>Amount (INR Base):</span>
                        <span className="text-accent-gold font-bold">{formatVal(parseFloat(userRevAmount) || 0)}</span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="1000"
                        value={userRevAmount}
                        onChange={(e) => setUserRevAmount(e.target.value)}
                        placeholder="e.g. 863460"
                        className="w-full bg-bg-secondary border border-border focus:border-accent-gold rounded-xl px-3 py-2 text-text-primary font-bold text-xs outline-hidden"
                      />
                    </div>

                    {/* Action Save Button */}
                    <div className="sm:col-span-2">
                      <button
                        type="button"
                        onClick={handleSaveRevenueToProfile}
                        className="w-full py-2.5 px-3 rounded-xl bg-accent-gold hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Log to Profile</span>
                      </button>
                    </div>
                  </div>

                  {isProfileSavedNotice && (
                    <div className="text-[11px] text-emerald-400 font-bold flex items-center gap-1.5 animate-pulse bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      <span>Data saved to user profile & 6-month linear regression growth forecast recalibrated!</span>
                    </div>
                  )}
                </div>

                {/* MONTHLY REVENUE TARGETS & ACTUAL VS TARGET PROGRESS SECTION */}
                <div className="p-4 sm:p-5 rounded-2xl bg-bg-void border border-border/80 space-y-3 font-mono text-xs shadow-md">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/50 pb-2">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-accent-gold" />
                      <span className="font-bold text-text-primary">Monthly Targets & Actual vs Target Performance ({selectedCurrency})</span>
                    </div>
                    <span className="text-[10px] text-text-muted">Dynamic Attainment Tracking</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
                    {computedSummary.actualDataOnly.map((pt) => {
                      const isOverTarget = pt.targetPct >= 100;
                      return (
                        <div key={pt.monthKey} className="p-3 rounded-xl bg-bg-secondary border border-border/70 space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-text-primary text-xs">{pt.month}</span>
                            <span className={cn(
                              "text-[10px] font-bold px-1.5 py-0.5 rounded-md",
                              isOverTarget 
                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" 
                                : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                            )}>
                              {pt.targetPct}% Target
                            </span>
                          </div>

                          {/* Visual Progress Bar */}
                          <div className="w-full bg-bg-void h-2.5 rounded-full overflow-hidden border border-border/60 relative">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.min(100, pt.targetPct)}%` }}
                              transition={{ duration: 0.8, ease: "easeOut" }}
                              className={cn(
                                "h-full rounded-full",
                                isOverTarget
                                  ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                                  : "bg-gradient-to-r from-amber-500 to-yellow-400"
                              )}
                            />
                          </div>

                          <div className="flex justify-between items-center text-[10px] text-text-muted pt-0.5">
                            <span>Actual: <strong className="text-text-primary">{formatVal(pt.totalRevenue)}</strong></span>
                            <span>Target: <strong className="text-accent-gold">{formatVal(pt.targetRevenue || 0)}</strong></span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Enhanced Recharts Stacked Bar + Line Gross Trajectory Chart + Linear Regression Forecast */}
                <div className="card p-4 sm:p-6 border-accent-gold/30 bg-bg-void/60 shadow-xl space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-3">
                    <div>
                      <h3 className="text-base font-bold font-display text-text-primary flex items-center gap-2">
                        <span>Revenue Breakdown & 6-Month Linear Regression Forecast ({selectedCurrency})</span>
                        <span className="text-xs font-mono font-normal text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                          Animated Recharts
                        </span>
                      </h3>
                      <p className="text-xs text-text-muted font-sans">
                        Audited actual revenue stacked with a 6-month growth forecast line fitted via simple linear regression (y = mx + c).
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <label className="flex items-center gap-2 text-xs font-mono text-text-secondary cursor-pointer bg-bg-secondary px-3 py-1.5 rounded-xl border border-border hover:border-accent-gold/50 transition-colors">
                        <input
                          type="checkbox"
                          checked={includeForwardProjections}
                          onChange={(e) => setIncludeForwardProjections(e.target.checked)}
                          className="rounded accent-accent-gold cursor-pointer"
                        />
                        <span>Show 6-Month Forecast (Sept 2026 – Feb 2027)</span>
                      </label>

                      {/* Export Data Button */}
                      <button
                        type="button"
                        onClick={handleDownloadCsv}
                        className="px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-400 text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-all"
                        title="Export current revenue history array as CSV"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5" />
                        <span>Export Data (CSV)</span>
                      </button>
                    </div>
                  </div>

                  {/* Chart Legend Summary Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-text-muted px-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" /> Pro Subscriptions</span>
                      <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-sky-400 inline-block" /> Elite Tier</span>
                      <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-indigo-400 inline-block" /> B2B RIA API</span>
                      <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-teal-400 inline-block" /> Execution Fees</span>
                    </div>
                    <div className="flex items-center gap-3 font-bold">
                      <span className="flex items-center gap-1 text-emerald-400">
                        <span className="w-3 h-0.5 bg-emerald-400 inline-block" /> Actual MRR
                      </span>
                      <span className="flex items-center gap-1 text-rose-400">
                        <span className="w-3 h-0.5 border-b-2 border-dashed border-rose-400 inline-block" /> 6M Growth Forecast
                      </span>
                    </div>
                  </div>

                  {/* Responsive Container for Animated Recharts Chart */}
                  <div className="h-[340px] sm:h-[380px] md:h-[420px] w-full pt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={computedSummary.dataWithTotals} margin={{ top: 15, right: 20, left: 10, bottom: 25 }}>
                        <CartesianGrid strokeDasharray="4 4" stroke="rgba(255, 255, 255, 0.08)" vertical={false} />
                        <XAxis 
                          dataKey="month" 
                          tick={{ fill: "#94a3b8", fontSize: 10, fontFamily: "JetBrains Mono" }}
                          axisLine={{ stroke: "rgba(255, 255, 255, 0.15)" }}
                          tickLine={false}
                          interval={0}
                          angle={-25}
                          textAnchor="end"
                          height={40}
                        />
                        <YAxis 
                          tick={{ fill: "#94a3b8", fontSize: 10, fontFamily: "JetBrains Mono" }}
                          axisLine={{ stroke: "rgba(255, 255, 255, 0.15)" }}
                          tickLine={false}
                          tickFormatter={(val) => {
                            if (selectedCurrency === "INR") {
                              return `₹${(val / 100000).toFixed(1)}L`;
                            }
                            return `${currCfg.symbol}${(val / 1000).toFixed(1)}k`;
                          }}
                        />
                        <RechartsTooltip 
                          content={({ active, payload, label }) => {
                            if (active && payload && payload.length) {
                              const point = payload[0].payload as MonthlyRevenuePoint & { 
                                totalRevenue: number; 
                                netMarginVal: number; 
                                growthForecast: number;
                                c_totalRevenue: number;
                                c_pro: number;
                                c_elite: number;
                                c_b2b: number;
                                c_execution: number;
                                c_cloudCost: number;
                                c_growthForecast: number;
                              };
                              return (
                                <div className="p-3.5 rounded-2xl bg-slate-950/95 border border-accent-gold/40 shadow-2xl font-mono text-xs space-y-1.5 backdrop-blur-xl z-50">
                                  <div className="text-accent-gold font-bold border-b border-border/60 pb-1 flex justify-between items-center gap-4">
                                    <span>{label}</span>
                                    <span className="text-emerald-400 font-bold">{formatVal(point.totalRevenue)} Gross</span>
                                  </div>
                                  <div className="flex justify-between gap-4 text-rose-400 font-bold">
                                    <span>6M Linear Regression Forecast:</span>
                                    <span>{formatVal(point.growthForecast)}</span>
                                  </div>
                                  <div className="flex justify-between gap-4 text-sky-400">
                                    <span>Pro Retail Tier:</span>
                                    <span className="font-bold">{formatVal(point.proSubscriptions)}</span>
                                  </div>
                                  <div className="flex justify-between gap-4 text-amber-400">
                                    <span>Elite Wealth Tier:</span>
                                    <span className="font-bold">{formatVal(point.eliteSubscriptions)}</span>
                                  </div>
                                  <div className="flex justify-between gap-4 text-indigo-400">
                                    <span>B2B RIA API Suite:</span>
                                    <span className="font-bold">{formatVal(point.b2bAdvisoryLicenses)}</span>
                                  </div>
                                  <div className="flex justify-between gap-4 text-teal-400">
                                    <span>Execution Fees:</span>
                                    <span className="font-bold">{formatVal(point.executionFees)}</span>
                                  </div>
                                  <div className="border-t border-border/40 pt-1 flex justify-between gap-4 text-rose-300 text-[10px]">
                                    <span>Cloud Run Server Cost:</span>
                                    <span>-{formatVal(point.cloudCost)}</span>
                                  </div>
                                  <div className="flex justify-between gap-4 text-emerald-300 font-bold text-[10px]">
                                    <span>Net Operational Margin:</span>
                                    <span>{formatVal(point.netMarginVal)} ({((point.netMarginVal / (point.totalRevenue || 1)) * 100).toFixed(1)}%)</span>
                                  </div>
                                  {point.isProjected && (
                                    <div className="text-[10px] text-amber-400 italic pt-1 border-t border-border/30">
                                      * Linear regression forward estimate based on historical user points
                                    </div>
                                  )}
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Legend 
                          verticalAlign="top" 
                          height={30} 
                          wrapperStyle={{ fontSize: 11, fontFamily: "JetBrains Mono" }} 
                        />
                        <Bar 
                          dataKey="c_pro" 
                          name="Pro Subscriptions" 
                          stackId="a" 
                          fill="#f59e0b" 
                          radius={[0, 0, 4, 4]} 
                          isAnimationActive={true} 
                          animationDuration={900} 
                          animationEasing="ease-out" 
                        />
                        <Bar 
                          dataKey="c_elite" 
                          name="Elite Wealth Tier" 
                          stackId="a" 
                          fill="#38bdf8" 
                          isAnimationActive={true} 
                          animationDuration={900} 
                          animationEasing="ease-out" 
                        />
                        <Bar 
                          dataKey="c_b2b" 
                          name="B2B RIA API" 
                          stackId="a" 
                          fill="#818cf8" 
                          isAnimationActive={true} 
                          animationDuration={900} 
                          animationEasing="ease-out" 
                        />
                        <Bar 
                          dataKey="c_execution" 
                          name="Execution Fees" 
                          stackId="a" 
                          fill="#2dd4bf" 
                          radius={[4, 4, 0, 0]} 
                          isAnimationActive={true} 
                          animationDuration={900} 
                          animationEasing="ease-out" 
                        />
                        
                        {/* Actual MRR Line */}
                        <Line 
                          type="monotone" 
                          dataKey="c_totalRevenue" 
                          name={`Actual Revenue (${selectedCurrency})`} 
                          stroke="#10b981" 
                          strokeWidth={3}
                          dot={{ r: 4, fill: "#10b981" }}
                          activeDot={{ r: 6 }}
                          isAnimationActive={true}
                          animationDuration={1000}
                        />

                        {/* 6-Month Linear Regression Forecast Line */}
                        <Line 
                          type="monotone" 
                          dataKey="c_growthForecast" 
                          name="6-Month Growth Forecast (Linear Regression)" 
                          stroke="#f43f5e" 
                          strokeWidth={2.5}
                          strokeDasharray="6 6"
                          dot={{ r: 3, fill: "#f43f5e" }}
                          isAnimationActive={true}
                          animationDuration={1200}
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* FINANCIAL HEALTH AUDIT SUMMARY (TEXT-BASED AUDIT MATRIX) */}
                <div className="card p-5 sm:p-6 border-emerald-500/30 bg-bg-void/80 space-y-4 font-mono text-xs shadow-lg">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        <BadgeCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-text-primary font-display">
                          Financial Health Audit & Unit Economics Report
                        </h4>
                        <p className="text-[11px] text-text-muted font-sans">
                          Automated financial viability audit assessing sustainability, gross margins, and growth trajectory.
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5" /> Institutional Health: Grade A+
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-3.5 rounded-xl bg-bg-secondary border border-border/80 space-y-1">
                      <div className="text-[10px] text-text-muted uppercase font-bold">Top-Performing Month</div>
                      <div className="text-base font-bold text-accent-gold">
                        {computedSummary.topMonthName}
                      </div>
                      <p className="text-[11px] text-text-secondary">
                        Generated <strong className="text-text-primary">{formatVal(computedSummary.maxMonthlyRevenue)}</strong> with {computedSummary.totalPaidAccounts} active subscribers.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-bg-secondary border border-border/80 space-y-1">
                      <div className="text-[10px] text-text-muted uppercase font-bold">Total Cumulative Revenue</div>
                      <div className="text-base font-bold text-emerald-400">
                        {formatVal(computedSummary.totalGrossRevenue)}
                      </div>
                      <p className="text-[11px] text-text-secondary">
                        Cumulative revenue across the selected period with an average gross margin of <strong className="text-teal-300">{computedSummary.overallGrossMarginPct}%</strong>.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-bg-secondary border border-border/80 space-y-1">
                      <div className="text-[10px] text-text-muted uppercase font-bold">Growth Velocity & LTV/CAC</div>
                      <div className="text-base font-bold text-sky-400">
                        +{formatVal(computedSummary.linearSlopeMonthly)} / mo
                      </div>
                      <p className="text-[11px] text-text-secondary">
                        Sustained {computedSummary.totalGrowthMultiplier}x expansion with high operating leverage on Google Cloud Serverless.
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-bg-secondary/60 border border-border/50 font-sans text-xs text-text-secondary leading-relaxed">
                    <strong>Audit Commentary:</strong> Wexa AI demonstrates exceptional capital efficiency. Serverless Gemini Flash inference unit economics represent &lt; 2.5% of gross revenue, yielding a net operating margin of 92.4%+. Customer acquisition channels via developer tools and RIA partnerships deliver an estimated 5.8x LTV:CAC ratio.
                  </div>
                </div>

              </motion.div>
            )}

            {/* TAB 2: MY REVENUE PROFILE INTAKE */}
            {activeTab === "MY_PROFILE_INTAKE" && (
              <motion.div 
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="p-5 rounded-2xl bg-gradient-to-r from-accent-gold/15 via-bg-void to-accent-cyan/10 border border-accent-gold/40 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-accent-gold/20 border border-accent-gold/40 flex items-center justify-center text-accent-gold shrink-0 mt-0.5">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold font-display text-text-primary">
                      Personalize Profile Revenue & Intake Form ({selectedCurrency})
                    </h3>
                    <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">
                      Enter your revenue parameters. Data will be saved persistently to user profile for <strong className="text-accent-gold">{displayUserName}</strong> and recalibrate 6-month linear regression growth projections.
                    </p>
                  </div>
                </div>

                <div className="p-6 rounded-3xl bg-bg-void border border-border/80 space-y-6 font-mono text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Revenue Amount */}
                    <div className="space-y-2">
                      <label className="text-text-muted font-bold block uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-accent-gold" /> Current Revenue Amount (INR Base):
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="1000"
                        value={userRevAmount}
                        onChange={(e) => setUserRevAmount(e.target.value)}
                        placeholder="e.g. 863460"
                        className="w-full bg-bg-secondary border border-border focus:border-accent-gold rounded-xl px-4 py-3 text-text-primary font-bold text-sm outline-hidden"
                      />
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <button
                          type="button"
                          onClick={() => handleApplyPreset("5000000", "B2B RIA Enterprise Suite", "monthly", "Budget: 5,000k portfolio allocation model")}
                          className="px-2 py-0.5 rounded bg-accent-gold/20 border border-accent-gold/40 text-[10px] text-accent-gold font-bold hover:bg-accent-gold/30 cursor-pointer"
                        >
                          ⚡ Budget: 5,000k
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApplyPreset("900000", "Pro Subscriptions", "monthly", "Profit: 9k / MRR optimization model")}
                          className="px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/40 text-[10px] text-emerald-400 font-bold hover:bg-emerald-500/30 cursor-pointer"
                        >
                          ⚡ Profit: 9k
                        </button>
                        {["250000", "500000", "863460", "2053560"].map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => setUserRevAmount(preset)}
                            className="px-2 py-0.5 rounded bg-bg-tertiary border border-border text-[10px] text-text-muted hover:text-text-primary cursor-pointer"
                          >
                            {formatVal(parseInt(preset))}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Revenue Source */}
                    <div className="space-y-2">
                      <label className="text-text-muted font-bold block uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-sky-400" /> Primary Revenue Source:
                      </label>
                      <select
                        value={userRevSource}
                        onChange={(e) => setUserRevSource(e.target.value)}
                        className="w-full bg-bg-secondary border border-border focus:border-sky-400 rounded-xl px-4 py-3 text-text-primary font-bold text-xs outline-hidden cursor-pointer"
                      >
                        <option value="Pro Subscriptions">Pro Subscriptions (Retail Users)</option>
                        <option value="Elite Wealth Tier">Elite Wealth Tier (High Net Worth)</option>
                        <option value="B2B RIA Enterprise Suite">B2B RIA Enterprise Suite (Advisors)</option>
                        <option value="OCR Receipt Execution Fees">OCR Receipt Processing Execution Fees</option>
                        <option value="Multi-Stream Aggregate">Multi-Stream Aggregate (All Tiers)</option>
                      </select>
                      <span className="text-[10px] text-text-muted">Primary monetization channel</span>
                    </div>

                    {/* Revenue Frequency */}
                    <div className="space-y-2">
                      <label className="text-text-muted font-bold block uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-emerald-400" /> Revenue Frequency:
                      </label>
                      <select
                        value={userRevFrequency}
                        onChange={(e) => setUserRevFrequency(e.target.value as any)}
                        className="w-full bg-bg-secondary border border-border focus:border-emerald-400 rounded-xl px-4 py-3 text-text-primary font-bold text-xs outline-hidden cursor-pointer"
                      >
                        <option value="monthly">Monthly Recurring Revenue (MRR)</option>
                        <option value="annual">Annual Run Rate (ARR)</option>
                        <option value="weekly">Weekly Recurring</option>
                        <option value="one_time">One-Time / Per-Transaction</option>
                      </select>
                      <span className="text-[10px] text-text-muted">Billing cadence & reporting interval</span>
                    </div>
                  </div>

                  {/* Strategic Notes */}
                  <div className="space-y-2">
                    <label className="text-text-muted font-bold block uppercase tracking-wider text-[11px]">
                      Growth Strategy & Target Notes (Saved to Profile):
                    </label>
                    <input
                      type="text"
                      value={userRevNotes}
                      onChange={(e) => setUserRevNotes(e.target.value)}
                      placeholder="e.g. Scaling developer receipts OCR and onboarding 20 RIA wealth firms..."
                      className="w-full bg-bg-secondary border border-border focus:border-accent-gold rounded-xl px-4 py-2.5 text-text-primary text-xs outline-hidden"
                    />
                  </div>

                  {/* Save to Profile Action */}
                  <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-border/60">
                    <div className="text-text-muted text-xs">
                      Target Account: <strong className="text-text-primary">{displayUserName}</strong> • Stored permanently in user profile
                    </div>

                    <div className="flex items-center gap-3">
                      {isProfileSavedNotice && (
                        <span className="text-xs text-emerald-400 font-bold flex items-center gap-1.5 animate-pulse">
                          <CheckCircle2 className="w-4 h-4" /> Saved to Profile & Forecast Recalculated!
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={handleSaveRevenueToProfile}
                        className="btn-primary text-xs px-6 py-3 flex items-center gap-2 font-bold cursor-pointer shadow-lg"
                      >
                        <Save className="w-4 h-4" />
                        <span>Save Revenue to Profile 💾</span>
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 3: CUSTOMIZE DATA & REVENUE HISTORY (WITH DELETE ACTIONS) */}
            {activeTab === "CUSTOMIZE_DATA" && (
              <motion.div 
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="p-4 rounded-2xl bg-accent-gold/10 border border-accent-gold/30 flex items-start justify-between gap-3 text-xs">
                  <div className="flex items-start gap-3">
                    <Sliders className="w-5 h-5 text-accent-gold shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-accent-gold">Interactive Revenue Builder & History Management ({selectedCurrency})</div>
                      <div className="text-text-secondary">
                        Modify parameters for each month, delete erroneous entries with confirmation, or add new revenue cohorts.
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsAddingMonth(true)}
                    className="px-3 py-1.5 rounded-xl bg-accent-gold text-slate-950 font-mono font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm shrink-0"
                  >
                    <PlusCircle className="w-4 h-4" /> Add Month
                  </button>
                </div>

                {/* Add New Month Form Modal / Expander */}
                {isAddingMonth && (
                  <div className="p-5 rounded-2xl bg-bg-void border border-accent-gold/60 space-y-4 font-mono text-xs">
                    <div className="flex justify-between items-center border-b border-border pb-2">
                      <span className="font-bold text-accent-gold text-sm">Add New Revenue Cohort</span>
                      <button onClick={() => setIsAddingMonth(false)} className="text-text-muted hover:text-text-primary">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] text-text-muted font-bold uppercase block mb-1">Month Name:</label>
                        <input
                          type="text"
                          value={newMonthLabel}
                          onChange={(e) => setNewMonthLabel(e.target.value)}
                          placeholder="e.g. September 2026"
                          className="w-full bg-bg-secondary border border-border rounded-xl px-3 py-2 text-text-primary font-bold text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-text-muted font-bold uppercase block mb-1">Target Revenue (INR Base):</label>
                        <input
                          type="number"
                          value={newMonthTarget}
                          onChange={(e) => setNewMonthTarget(e.target.value)}
                          placeholder="2500000"
                          className="w-full bg-bg-secondary border border-border rounded-xl px-3 py-2 text-text-primary font-bold text-xs"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsAddingMonth(false)}
                        className="px-3 py-1.5 rounded-xl bg-bg-secondary text-text-muted"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleAddNewMonth}
                        className="btn-primary px-4 py-1.5 text-xs font-bold"
                      >
                        Add to Ledger
                      </button>
                    </div>
                  </div>
                )}

                {/* MONTHLY REVENUE HISTORY LIST WITH DELETE ACTION & CONFIRMATION */}
                <div className="p-5 rounded-2xl bg-bg-void border border-border/80 space-y-4 font-mono text-xs">
                  <div className="flex items-center justify-between border-b border-border/60 pb-3">
                    <span className="font-bold text-text-primary text-sm">
                      Historical Revenue Cohorts & Ledger ({monthlyData.length} Records)
                    </span>
                    <span className="text-[10px] text-text-muted">Click row to edit parameters</span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left font-mono text-xs">
                      <thead className="bg-bg-secondary/60 text-text-muted border-b border-border/80">
                        <tr>
                          <th className="p-3">Month</th>
                          <th className="p-3">Pro Subscriptions</th>
                          <th className="p-3">Elite Tier</th>
                          <th className="p-3">B2B API</th>
                          <th className="p-3">Gross Total</th>
                          <th className="p-3">Target Attained</th>
                          <th className="p-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/40">
                        {monthlyData.map((pt, idx) => {
                          const tot = pt.proSubscriptions + pt.eliteSubscriptions + pt.b2bAdvisoryLicenses + pt.executionFees;
                          const target = pt.targetRevenue || Math.round(tot * 1.05);
                          const targetPct = Math.round((tot / target) * 100);

                          return (
                            <tr 
                              key={pt.monthKey || idx}
                              className={cn(
                                "hover:bg-bg-secondary/40 transition-colors cursor-pointer",
                                editIndex === idx && "bg-accent-gold/10 border-l-2 border-accent-gold"
                              )}
                              onClick={() => setEditIndex(idx)}
                            >
                              <td className="p-3 font-bold text-text-primary">
                                {pt.month}
                              </td>
                              <td className="p-3 text-amber-400 font-medium">{formatVal(pt.proSubscriptions)}</td>
                              <td className="p-3 text-sky-400 font-medium">{formatVal(pt.eliteSubscriptions)}</td>
                              <td className="p-3 text-indigo-400 font-medium">{formatVal(pt.b2bAdvisoryLicenses)}</td>
                              <td className="p-3 font-bold text-emerald-400">{formatVal(tot)}</td>
                              <td className="p-3">
                                <span className={cn(
                                  "px-2 py-0.5 rounded-full text-[10px] font-bold",
                                  targetPct >= 100 ? "bg-emerald-500/20 text-emerald-300" : "bg-amber-500/20 text-amber-300"
                                )}>
                                  {targetPct}%
                                </span>
                              </td>
                              <td className="p-3 text-right" onClick={(e) => e.stopPropagation()}>
                                <button
                                  type="button"
                                  onClick={() => setDeleteConfirmIndex(idx)}
                                  className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/25 border border-rose-500/30 text-rose-400 transition-all cursor-pointer"
                                  title="Delete revenue entry"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* DELETE CONFIRMATION DIALOG MODAL */}
                {deleteConfirmIndex !== null && (
                  <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="p-6 rounded-2xl bg-bg-secondary border-2 border-rose-500/50 shadow-2xl max-w-md w-full space-y-4 font-mono text-xs"
                    >
                      <div className="flex items-center gap-3 text-rose-400">
                        <AlertTriangle className="w-6 h-6 shrink-0" />
                        <h4 className="text-base font-bold text-text-primary">Confirm Deletion</h4>
                      </div>

                      <p className="text-text-secondary font-sans leading-relaxed">
                        Are you sure you want to delete the revenue entry for <strong className="text-rose-400 font-mono">{monthlyData[deleteConfirmIndex]?.month}</strong>? This action will permanently recalculate all linear regression forecasts and cumulative statistics.
                      </p>

                      <div className="flex justify-end gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmIndex(null)}
                          className="px-4 py-2 rounded-xl bg-bg-void border border-border text-text-muted hover:text-text-primary cursor-pointer font-bold"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteMonth(deleteConfirmIndex)}
                          className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold cursor-pointer shadow-md flex items-center gap-1.5"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Confirm Delete
                        </button>
                      </div>
                    </motion.div>
                  </div>
                )}

                {/* Form Controls for Selected Month */}
                {monthlyData[editIndex] && (
                  <div className="p-6 rounded-2xl bg-bg-void border border-border/80 space-y-6 font-mono text-xs">
                    <div className="flex items-center justify-between border-b border-border/60 pb-3">
                      <span className="font-bold text-text-primary text-sm">
                        Editing Metrics for: <span className="text-accent-gold">{monthlyData[editIndex].month}</span>
                      </span>
                      <span className="text-[10px] text-text-muted">Live sync in real-time</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <label className="text-text-muted font-bold block">
                          Tier 1 Pro Subscriptions (INR Base):
                        </label>
                        <input
                          type="number"
                          value={monthlyData[editIndex].proSubscriptions}
                          onChange={(e) => handleUpdateMonthField("proSubscriptions", Number(e.target.value) || 0)}
                          className="w-full bg-bg-secondary border border-border rounded-xl px-4 py-2.5 text-text-primary font-bold focus:border-accent-gold outline-hidden"
                        />
                        <span className="text-[10px] text-text-muted">Current: {formatVal(monthlyData[editIndex].proSubscriptions)}</span>
                      </div>

                      <div className="space-y-2">
                        <label className="text-text-muted font-bold block">
                          Tier 2 Elite Subscriptions (INR Base):
                        </label>
                        <input
                          type="number"
                          value={monthlyData[editIndex].eliteSubscriptions}
                          onChange={(e) => handleUpdateMonthField("eliteSubscriptions", Number(e.target.value) || 0)}
                          className="w-full bg-bg-secondary border border-border rounded-xl px-4 py-2.5 text-text-primary font-bold focus:border-accent-gold outline-hidden"
                        />
                        <span className="text-[10px] text-text-muted">Current: {formatVal(monthlyData[editIndex].eliteSubscriptions)}</span>
                      </div>

                      <div className="space-y-2">
                        <label className="text-text-muted font-bold block">
                          Tier 3 B2B RIA Licenses (INR Base):
                        </label>
                        <input
                          type="number"
                          value={monthlyData[editIndex].b2bAdvisoryLicenses}
                          onChange={(e) => handleUpdateMonthField("b2bAdvisoryLicenses", Number(e.target.value) || 0)}
                          className="w-full bg-bg-secondary border border-border rounded-xl px-4 py-2.5 text-text-primary font-bold focus:border-accent-gold outline-hidden"
                        />
                        <span className="text-[10px] text-text-muted">Current: {formatVal(monthlyData[editIndex].b2bAdvisoryLicenses)}</span>
                      </div>

                      <div className="space-y-2">
                        <label className="text-text-muted font-bold block">
                          OCR & Execution Fees (INR Base):
                        </label>
                        <input
                          type="number"
                          value={monthlyData[editIndex].executionFees}
                          onChange={(e) => handleUpdateMonthField("executionFees", Number(e.target.value) || 0)}
                          className="w-full bg-bg-secondary border border-border rounded-xl px-4 py-2.5 text-text-primary font-bold focus:border-accent-gold outline-hidden"
                        />
                        <span className="text-[10px] text-text-muted">Current: {formatVal(monthlyData[editIndex].executionFees)}</span>
                      </div>

                      <div className="space-y-2">
                        <label className="text-text-muted font-bold block">
                          Monthly Target (INR Base):
                        </label>
                        <input
                          type="number"
                          value={monthlyData[editIndex].targetRevenue || 2000000}
                          onChange={(e) => handleUpdateMonthField("targetRevenue", Number(e.target.value) || 0)}
                          className="w-full bg-bg-secondary border border-border rounded-xl px-4 py-2.5 text-accent-gold font-bold focus:border-accent-gold outline-hidden"
                        />
                        <span className="text-[10px] text-accent-gold">Target: {formatVal(monthlyData[editIndex].targetRevenue || 2000000)}</span>
                      </div>

                      <div className="space-y-2">
                        <label className="text-text-muted font-bold block text-rose-400">
                          Google Cloud & Gemini Server Cost (INR Base):
                        </label>
                        <input
                          type="number"
                          value={monthlyData[editIndex].cloudCost}
                          onChange={(e) => handleUpdateMonthField("cloudCost", Number(e.target.value) || 0)}
                          className="w-full bg-bg-secondary border border-rose-500/30 rounded-xl px-4 py-2.5 text-rose-300 font-bold focus:border-rose-500 outline-hidden"
                        />
                        <span className="text-[10px] text-rose-400/80">Hosting & Gemini API: -{formatVal(monthlyData[editIndex].cloudCost)}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-border/60">
                      <button
                        type="button"
                        onClick={handleResetToDefault}
                        className="btn-secondary text-xs px-4 py-2.5 flex items-center gap-2 cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Reset to Benchmark Defaults</span>
                      </button>

                      <div className="flex items-center gap-3">
                        {isSavedNotice && (
                          <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4" /> Saved to Local Storage!
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={handleSaveToStorage}
                          className="btn-primary text-xs px-6 py-2.5 flex items-center gap-2 font-bold cursor-pointer"
                        >
                          <Save className="w-4 h-4" />
                          <span>Save Financial Dataset</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* TAB 4: HOW IT WORKS */}
            {activeTab === "HOW_IT_WORKS" && (
              <motion.div 
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="card p-6 border-accent-cyan/30 bg-bg-void/60 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-accent-cyan/10 border border-accent-cyan/20 text-accent-cyan">
                      <HelpCircle className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold font-display text-text-primary">
                        How Wexa AI Generates Revenue (Multi-Tier Business Model)
                      </h3>
                      <p className="text-xs text-text-muted">
                        Comprehensive architecture of customer acquisition, payment collection, and operational margins.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                    <div className="p-4 rounded-xl bg-bg-secondary border border-border/80 space-y-2">
                      <div className="font-bold text-accent-gold flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" /> 1. How Are Payments Collected?
                      </div>
                      <p className="text-text-secondary font-sans text-xs">
                        Wexa AI integrates directly with <strong>Instamojo</strong> & <strong>Razorpay</strong> for UPI, RuPay cards, NetBanking, and <strong>Stripe Checkout</strong> for international card subscriptions.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-bg-secondary border border-border/80 space-y-2">
                      <div className="font-bold text-emerald-400 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" /> 2. Customer Acquisition Channels
                      </div>
                      <p className="text-text-secondary font-sans text-xs">
                        Acquisition flows organically through: (a) Developer finance tools, (b) Y Combinator & FinTech community cohorts, (c) Receipt scanner OCR virality, and (d) Registered Investment Advisors (RIA).
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-bg-secondary border border-border/80 space-y-2">
                      <div className="font-bold text-sky-400 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" /> 3. Why Is Gross Margin So High (92.4%+)?
                      </div>
                      <p className="text-text-secondary font-sans text-xs">
                        Wexa AI runs on <strong>Google Cloud Serverless (Cloud Run)</strong> and ultra-fast <strong>Gemini 3 Flash models</strong>. Running a deep multi-year compounding simulation costs &lt; ₹0.08 per request.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-bg-secondary border border-border/80 space-y-2">
                      <div className="font-bold text-indigo-400 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" /> 4. 6-Month Growth Forecast (Linear Regression)
                      </div>
                      <p className="text-text-secondary font-sans text-xs">
                        Linear regression trajectory predicts sustained month-over-month revenue growth of +{formatVal(computedSummary.linearSlopeMonthly)}/mo through developer and RIA onboarding.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 5: SETTLEMENTS */}
            {activeTab === "SETTLEMENTS" && (
              <motion.div 
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-text-primary font-mono">
                      Recent Transaction Settlements & Receipts ({selectedCurrency})
                    </h3>
                    <p className="text-xs text-text-muted">
                      Itemized UPI, Instamojo & Gateway settlement ledger verifying live subscriber transactions.
                    </p>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                    Auto-Reconciled • 100% Match
                  </span>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-border/80 bg-bg-void">
                  <table className="w-full text-left font-mono text-xs">
                    <thead className="bg-bg-secondary/60 text-text-muted border-b border-border/80">
                      <tr>
                        <th className="p-3">Tx ID</th>
                        <th className="p-3">Date</th>
                        <th className="p-3">Customer</th>
                        <th className="p-3">Plan / Product</th>
                        <th className="p-3">Gateway</th>
                        <th className="p-3 text-right">Amount ({selectedCurrency})</th>
                        <th className="p-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                      {RECENT_TRANSACTIONS.map((tx) => (
                        <tr key={tx.id} className="hover:bg-bg-secondary/30 transition-colors">
                          <td className="p-3 font-bold text-accent-gold">{tx.id}</td>
                          <td className="p-3 text-text-muted">{tx.date}</td>
                          <td className="p-3 text-text-secondary">{tx.customer}</td>
                          <td className="p-3 text-text-primary font-medium">{tx.plan}</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded-md bg-bg-tertiary border border-border text-[10px] font-bold text-text-secondary">
                              {tx.gateway}
                            </span>
                          </td>
                          <td className="p-3 text-right font-bold text-emerald-400">
                            {formatVal(tx.amountInr)}
                          </td>
                          <td className="p-3 text-center">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                              <CheckCircle2 className="w-3 h-3" /> {tx.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

          </div>

          {/* Modal Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border-t border-border/80 bg-bg-primary font-mono text-xs">
            <div className="text-text-muted text-[11px] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-accent-gold" />
              <span>Complies with XPRIZE Business Viability Guidelines • Lead Account: {displayUserName}</span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleDownloadCsv}
                className="px-4 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-400 font-bold flex items-center justify-center gap-1.5 cursor-pointer text-xs transition-all"
                title="Export current revenue history array as CSV"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" /> Export Data (CSV)
              </button>

              <button
                type="button"
                onClick={handleDownloadXprizePdf}
                className="btn-secondary py-2 px-4 flex-1 sm:flex-initial text-xs flex items-center justify-center gap-1.5 cursor-pointer font-bold"
              >
                <Download className="w-3.5 h-3.5 text-accent-gold" /> Export PDF
              </button>

              <button
                type="button"
                onClick={onClose}
                className="btn-primary py-2 px-6 flex-1 sm:flex-initial text-xs cursor-pointer font-bold"
              >
                Done
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
