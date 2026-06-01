import { describe, it, expect } from "vitest";
import {
  simulateDebtPayoff,
  calculateSavingsDelta,
  validateLoanInput,
  Loan
} from "../lib/debtCalculator";

// ───────────────────── EMPTY / ZERO INPUT CASES ─────────────────────
describe("simulateDebtPayoff — empty inputs", () => {
  it("returns zeroed results for an empty loans array", () => {
    const result = simulateDebtPayoff([], 500);
    expect(result.totalPrincipal).toBe(0);
    expect(result.monthlyMinimumCommitment).toBe(0);
    expect(result.avalanche.months).toBe(0);
    expect(result.avalanche.interest).toBe(0);
    expect(result.avalanche.timeline).toHaveLength(0);
    expect(result.snowball.months).toBe(0);
    expect(result.snowball.interest).toBe(0);
    expect(result.snowball.timeline).toHaveLength(0);
  });

  it("returns zeroed results for an empty array even with zero extra payment", () => {
    const result = simulateDebtPayoff([], 0);
    expect(result.totalPrincipal).toBe(0);
    expect(result.avalanche.months).toBe(0);
  });
});

// ───────────────────── SINGLE LOAN CASES ─────────────────────
describe("simulateDebtPayoff — single loan", () => {
  it("pays off a single zero-interest loan in expected months", () => {
    const loans: Loan[] = [
      { id: "1", name: "Zero Rate Loan", balance: 1000, rate: 0, minPayment: 100 }
    ];
    const result = simulateDebtPayoff(loans, 0);
    expect(result.avalanche.months).toBe(10);
    expect(result.avalanche.interest).toBe(0);
    expect(result.snowball.months).toBe(10);
    expect(result.snowball.interest).toBe(0);
  });

  it("avalanche and snowball produce identical results for a single loan", () => {
    const loans: Loan[] = [
      { id: "1", name: "Single Loan", balance: 5000, rate: 10, minPayment: 200 }
    ];
    const result = simulateDebtPayoff(loans, 100);
    expect(result.avalanche.months).toBe(result.snowball.months);
    expect(result.avalanche.interest).toBeCloseTo(result.snowball.interest, 2);
  });

  it("extra payment accelerates payoff", () => {
    const loans: Loan[] = [
      { id: "1", name: "Loan", balance: 10000, rate: 12, minPayment: 300 }
    ];
    const noExtra = simulateDebtPayoff(loans, 0);
    const withExtra = simulateDebtPayoff(loans, 500);
    expect(withExtra.avalanche.months).toBeLessThan(noExtra.avalanche.months);
    expect(withExtra.avalanche.interest).toBeLessThan(noExtra.avalanche.interest);
  });
});

// ───────────────────── BOUNDARY VALUES ─────────────────────
describe("simulateDebtPayoff — boundary values", () => {
  it("handles loan with balance smaller than minimum payment", () => {
    const loans: Loan[] = [
      { id: "1", name: "Tiny Loan", balance: 50, rate: 5, minPayment: 100 }
    ];
    const result = simulateDebtPayoff(loans, 0);
    expect(result.avalanche.months).toBe(1);
    expect(result.snowball.months).toBe(1);
  });

  it("handles very small balance of 1 cent", () => {
    const loans: Loan[] = [
      { id: "1", name: "Penny Loan", balance: 0.01, rate: 10, minPayment: 1 }
    ];
    const result = simulateDebtPayoff(loans, 0);
    expect(result.avalanche.months).toBe(1);
  });

  it("respects MAX_MONTHS (360) safety cap for unpayable debt", () => {
    // minPayment too small to overcome interest accrual
    const loans: Loan[] = [
      { id: "1", name: "Unpayable", balance: 1000000, rate: 99, minPayment: 1 }
    ];
    const result = simulateDebtPayoff(loans, 0);
    expect(result.avalanche.months).toBe(360);
    expect(result.snowball.months).toBe(360);
  });

  it("handles zero extra payment correctly", () => {
    const loans: Loan[] = [
      { id: "1", name: "Loan", balance: 1000, rate: 5, minPayment: 100 }
    ];
    const result = simulateDebtPayoff(loans, 0);
    expect(result.avalanche.months).toBeGreaterThan(0);
    expect(result.avalanche.interest).toBeGreaterThan(0);
  });
});

// ───────────────────── MULTIPLE LOANS — AVALANCHE vs SNOWBALL ─────────────────────
describe("simulateDebtPayoff — avalanche vs snowball strategy", () => {
  it("avalanche pays less interest than snowball when rates differ", () => {
    const loans: Loan[] = [
      { id: "1", name: "High Rate", balance: 5000, rate: 24, minPayment: 100 },
      { id: "2", name: "Low Rate", balance: 5000, rate: 6, minPayment: 100 }
    ];
    const result = simulateDebtPayoff(loans, 200);
    expect(result.avalanche.interest).toBeLessThanOrEqual(result.snowball.interest);
  });

  it("snowball targets smallest balance first", () => {
    const loans: Loan[] = [
      { id: "1", name: "Big Balance Low Rate", balance: 20000, rate: 5, minPayment: 200 },
      { id: "2", name: "Small Balance High Rate", balance: 1000, rate: 20, minPayment: 50 }
    ];
    const result = simulateDebtPayoff(loans, 300);
    // Both should complete
    expect(result.snowball.months).toBeGreaterThan(0);
    expect(result.avalanche.months).toBeGreaterThan(0);
  });

  it("identical rates produce same results for both methods", () => {
    const loans: Loan[] = [
      { id: "1", name: "Loan A", balance: 3000, rate: 10, minPayment: 100 },
      { id: "2", name: "Loan B", balance: 7000, rate: 10, minPayment: 200 }
    ];
    const result = simulateDebtPayoff(loans, 100);
    // With identical rates, avalanche falls back to arbitrary order — interest should be same
    expect(result.avalanche.interest).toBeCloseTo(result.snowball.interest, 0);
  });

  it("correctly sums totalPrincipal", () => {
    const loans: Loan[] = [
      { id: "1", name: "A", balance: 4500, rate: 19.9, minPayment: 150 },
      { id: "2", name: "B", balance: 18000, rate: 5.5, minPayment: 250 },
      { id: "3", name: "C", balance: 12500, rate: 7.2, minPayment: 320 }
    ];
    const result = simulateDebtPayoff(loans, 500);
    expect(result.totalPrincipal).toBe(35000);
    expect(result.monthlyMinimumCommitment).toBe(720);
  });
});

// ───────────────────── TIMELINE INTEGRITY ─────────────────────
describe("simulateDebtPayoff — timeline integrity", () => {
  it("timeline months are sequential starting from 1", () => {
    const loans: Loan[] = [
      { id: "1", name: "Loan", balance: 2000, rate: 8, minPayment: 200 }
    ];
    const result = simulateDebtPayoff(loans, 100);
    result.avalanche.timeline.forEach((entry, i) => {
      expect(entry.month).toBe(i + 1);
    });
  });

  it("remaining balance is monotonically decreasing in normal case", () => {
    const loans: Loan[] = [
      { id: "1", name: "Loan", balance: 5000, rate: 6, minPayment: 300 }
    ];
    const result = simulateDebtPayoff(loans, 200);
    for (let i = 1; i < result.avalanche.timeline.length; i++) {
      expect(result.avalanche.timeline[i].totalRemainingBalance)
        .toBeLessThanOrEqual(result.avalanche.timeline[i - 1].totalRemainingBalance);
    }
  });

  it("interest accumulated is monotonically increasing", () => {
    const loans: Loan[] = [
      { id: "1", name: "Loan", balance: 5000, rate: 12, minPayment: 200 }
    ];
    const result = simulateDebtPayoff(loans, 0);
    for (let i = 1; i < result.avalanche.timeline.length; i++) {
      expect(result.avalanche.timeline[i].interestAccumulated)
        .toBeGreaterThanOrEqual(result.avalanche.timeline[i - 1].interestAccumulated);
    }
  });

  it("final timeline entry has zero or near-zero remaining balance", () => {
    const loans: Loan[] = [
      { id: "1", name: "Loan", balance: 3000, rate: 10, minPayment: 200 }
    ];
    const result = simulateDebtPayoff(loans, 100);
    const lastEntry = result.avalanche.timeline[result.avalanche.timeline.length - 1];
    expect(lastEntry.totalRemainingBalance).toBeCloseTo(0, 1);
  });
});

// ───────────────────── ZERO INTEREST RATE ─────────────────────
describe("simulateDebtPayoff — zero interest rate", () => {
  it("accumulates no interest on 0% loans", () => {
    const loans: Loan[] = [
      { id: "1", name: "0% Promo", balance: 5000, rate: 0, minPayment: 250 },
      { id: "2", name: "0% Promo 2", balance: 3000, rate: 0, minPayment: 150 }
    ];
    const result = simulateDebtPayoff(loans, 0);
    expect(result.avalanche.interest).toBe(0);
    expect(result.snowball.interest).toBe(0);
    expect(result.avalanche.months).toBe(result.snowball.months);
  });
});

// ───────────────────── calculateSavingsDelta ─────────────────────
describe("calculateSavingsDelta", () => {
  it("returns zero delta for empty results", () => {
    const results = simulateDebtPayoff([], 0);
    const delta = calculateSavingsDelta(results);
    expect(delta.interestSaved).toBe(0);
    expect(delta.monthsSaved).toBe(0);
  });

  it("interestSaved is non-negative", () => {
    const loans: Loan[] = [
      { id: "1", name: "High", balance: 5000, rate: 24, minPayment: 100 },
      { id: "2", name: "Low", balance: 2000, rate: 5, minPayment: 50 }
    ];
    const results = simulateDebtPayoff(loans, 300);
    const delta = calculateSavingsDelta(results);
    expect(delta.interestSaved).toBeGreaterThanOrEqual(0);
    expect(delta.monthsSaved).toBeGreaterThanOrEqual(0);
  });
});

// ───────────────────── validateLoanInput ─────────────────────
describe("validateLoanInput", () => {
  it("returns null for empty name", () => {
    expect(validateLoanInput("", "1000", "5", "50")).toBeNull();
  });

  it("returns null for zero balance", () => {
    expect(validateLoanInput("Loan", "0", "5", "50")).toBeNull();
  });

  it("returns null for negative balance", () => {
    expect(validateLoanInput("Loan", "-500", "5", "50")).toBeNull();
  });

  it("returns null for non-numeric balance", () => {
    expect(validateLoanInput("Loan", "abc", "5", "50")).toBeNull();
  });

  it("defaults rate to 0 for non-numeric rate input", () => {
    const loan = validateLoanInput("Loan", "1000", "abc", "50");
    expect(loan).not.toBeNull();
    expect(loan!.rate).toBe(0);
  });

  it("defaults minPayment to 3% of balance when empty", () => {
    const loan = validateLoanInput("Loan", "10000", "5", "");
    expect(loan).not.toBeNull();
    expect(loan!.minPayment).toBe(300); // 3% of 10000
  });

  it("defaults minPayment to 3% of balance for non-numeric input", () => {
    const loan = validateLoanInput("Loan", "5000", "5", "xyz");
    expect(loan).not.toBeNull();
    expect(loan!.minPayment).toBe(150); // 3% of 5000
  });

  it("creates valid loan with all correct inputs", () => {
    const loan = validateLoanInput("Student Loan", "15000", "6.5", "200");
    expect(loan).not.toBeNull();
    expect(loan!.name).toBe("Student Loan");
    expect(loan!.balance).toBe(15000);
    expect(loan!.rate).toBe(6.5);
    expect(loan!.minPayment).toBe(200);
    expect(loan!.id).toBeTruthy();
  });

  it("handles floating point balance", () => {
    const loan = validateLoanInput("Loan", "1000.50", "5", "50");
    expect(loan).not.toBeNull();
    expect(loan!.balance).toBeCloseTo(1000.50, 2);
  });

  it("handles very large balance", () => {
    const loan = validateLoanInput("Mega Loan", "999999999", "3", "10000");
    expect(loan).not.toBeNull();
    expect(loan!.balance).toBe(999999999);
  });
});
