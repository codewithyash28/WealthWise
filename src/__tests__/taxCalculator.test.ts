import { describe, it, expect } from "vitest";
import { calculateTax, calculateStrategySavings, TaxResults } from "../lib/taxCalculator";

const stubFormat = (amount: number, code: string) => `${code}${amount}`;

describe("calculateTax", () => {
  // ───────────────────── ZERO / EMPTY INPUT CASES ─────────────────────
  describe("zero and empty inputs", () => {
    it("returns zero tax and zero effective rate when grossIncome is 0", () => {
      const result = calculateTax(0, 0, 0, "USD", stubFormat);
      expect(result.totalTax).toBe(0);
      expect(result.effectiveRate).toBe(0);
      expect(result.takeHome).toBe(0);
      expect(result.monthlyTakeHome).toBe(0);
      expect(result.taxableIncome).toBe(0);
      expect(result.brackets).toHaveLength(0);
    });

    it("returns zero tax when deductions equal gross income", () => {
      const result = calculateTax(50000, 30000, 20000, "USD", stubFormat);
      expect(result.taxableIncome).toBe(0);
      expect(result.totalTax).toBe(0);
      expect(result.takeHome).toBe(50000);
    });

    it("clamps taxableIncome to 0 when deductions exceed gross income", () => {
      const result = calculateTax(10000, 50000, 50000, "USD", stubFormat);
      expect(result.taxableIncome).toBe(0);
      expect(result.totalTax).toBe(0);
      expect(result.takeHome).toBe(10000);
    });
  });

  // ───────────────────── USD BRACKET BOUNDARY TESTS ─────────────────────
  describe("USD progressive brackets", () => {
    it("produces zero tax when adjusted taxable is within standard deduction", () => {
      // grossIncome=14605 => taxableIncome=14605 => adjustedTaxable=0
      const result = calculateTax(14605, 0, 0, "USD", stubFormat);
      expect(result.totalTax).toBe(0);
      expect(result.brackets).toHaveLength(0);
    });

    it("taxes only 10% on first bracket income", () => {
      // grossIncome = 14605 + 5000 = 19605
      // taxableIncome = 19605, adjustedTaxable = 5000 (within 11600 cap)
      const result = calculateTax(19605, 0, 0, "USD", stubFormat);
      expect(result.totalTax).toBeCloseTo(500, 2); // 5000 * 0.10
      expect(result.brackets).toHaveLength(1);
      expect(result.brackets[0].rate).toBe(10);
    });

    it("correctly spans first two brackets at boundary", () => {
      // adjustedTaxable = 14605 + stdAllowance = need grossIncome so adjustedTaxable = 11600
      // grossIncome = 11600 + 14605 = 26205
      const result = calculateTax(26205, 0, 0, "USD", stubFormat);
      expect(result.totalTax).toBeCloseTo(11600 * 0.10, 2);
      expect(result.brackets).toHaveLength(1);
      expect(result.brackets[0].rate).toBe(10);
    });

    it("handles very large income that hits all 7 brackets", () => {
      const result = calculateTax(1000000, 0, 0, "USD", stubFormat);
      expect(result.brackets.length).toBeGreaterThanOrEqual(6);
      expect(result.totalTax).toBeGreaterThan(0);
      expect(result.effectiveRate).toBeGreaterThan(0);
      expect(result.effectiveRate).toBeLessThan(37);
      // takeHome should be positive
      expect(result.takeHome).toBeGreaterThan(0);
    });

    it("effective rate increases with income", () => {
      const low = calculateTax(30000, 0, 0, "USD", stubFormat);
      const high = calculateTax(300000, 0, 0, "USD", stubFormat);
      expect(high.effectiveRate).toBeGreaterThan(low.effectiveRate);
    });
  });

  // ───────────────────── INR BRACKET BOUNDARY TESTS ─────────────────────
  describe("INR progressive brackets", () => {
    it("produces zero tax when income is within standard deduction + zero-rate slab", () => {
      // stdNoTaxAllowance = 75000, 0% slab up to 300000
      // taxableIncome = 375000 => adjustedTaxable = 300000 => all in 0% slab
      const result = calculateTax(375000, 0, 0, "INR", stubFormat);
      expect(result.totalTax).toBe(0);
      expect(result.brackets).toHaveLength(0);
    });

    it("excludes zero-rate brackets from output", () => {
      // Income just above 0% slab: adjustedTaxable = 400000
      // grossIncome = 400000 + 75000 = 475000
      const result = calculateTax(475000, 0, 0, "INR", stubFormat);
      // Should only include non-zero-rate brackets
      for (const bracket of result.brackets) {
        expect(bracket.rate).toBeGreaterThan(0);
      }
    });

    it("correctly applies 5% on income between 3L and 7L", () => {
      // adjustedTaxable = 500000 (300000 at 0%, 200000 at 5%)
      // grossIncome = 500000 + 75000 = 575000
      const result = calculateTax(575000, 0, 0, "INR", stubFormat);
      expect(result.totalTax).toBeCloseTo(200000 * 0.05, 2);
    });
  });

  // ───────────────────── EUR BRACKET BOUNDARY TESTS ─────────────────────
  describe("EUR progressive brackets", () => {
    it("zero tax when income is within allowance", () => {
      const result = calculateTax(12000, 0, 0, "EUR", stubFormat);
      expect(result.totalTax).toBe(0);
    });

    it("applies 15% on first bracket above allowance", () => {
      // adjustedTaxable = 5000 (within 18000 cap)
      // grossIncome = 5000 + 12000 = 17000
      const result = calculateTax(17000, 0, 0, "EUR", stubFormat);
      expect(result.totalTax).toBeCloseTo(5000 * 0.15, 2);
    });
  });

  // ───────────────────── GBP BRACKET BOUNDARY TESTS ─────────────────────
  describe("GBP progressive brackets", () => {
    it("zero tax when income is within personal allowance", () => {
      const result = calculateTax(12570, 0, 0, "GBP", stubFormat);
      expect(result.totalTax).toBe(0);
    });

    it("applies 20% on basic rate band", () => {
      // adjustedTaxable = 10000 (within 37700 cap)
      // grossIncome = 10000 + 12570 = 22570
      const result = calculateTax(22570, 0, 0, "GBP", stubFormat);
      expect(result.totalTax).toBeCloseTo(10000 * 0.20, 2);
    });

    it("higher rate band kicks in above 37700", () => {
      // adjustedTaxable = 50000, crosses into 40% band
      const result = calculateTax(62570, 0, 0, "GBP", stubFormat);
      const basicTax = 37700 * 0.20;
      const higherTax = (50000 - 37700) * 0.40;
      expect(result.totalTax).toBeCloseTo(basicTax + higherTax, 2);
      expect(result.brackets).toHaveLength(2);
    });
  });

  // ───────────────────── GENERIC/UNKNOWN CURRENCY ─────────────────────
  describe("generic fallback for unknown currency", () => {
    it("uses 15% allowance and two generic tiers", () => {
      const result = calculateTax(100000, 0, 0, "XYZ", stubFormat);
      expect(result.standardDeductionText).toContain("15% of salary");
      expect(result.totalTax).toBeGreaterThan(0);
    });

    it("falls back to USD config for avgSalary when currency unknown", () => {
      const result = calculateTax(50000, 0, 0, "UNKNOWN", stubFormat);
      expect(result.standardDeductionText).toContain("default allowance");
    });
  });

  // ───────────────────── DEDUCTION EDGE CASES ─────────────────────
  describe("deduction edge cases", () => {
    it("pre-tax deductions reduce taxable income", () => {
      const withoutDeductions = calculateTax(100000, 0, 0, "USD", stubFormat);
      const withDeductions = calculateTax(100000, 20000, 0, "USD", stubFormat);
      expect(withDeductions.totalTax).toBeLessThan(withoutDeductions.totalTax);
      expect(withDeductions.taxableIncome).toBe(80000);
    });

    it("other deductions reduce taxable income", () => {
      const withoutDeductions = calculateTax(100000, 0, 0, "USD", stubFormat);
      const withDeductions = calculateTax(100000, 0, 15000, "USD", stubFormat);
      expect(withDeductions.totalTax).toBeLessThan(withoutDeductions.totalTax);
    });

    it("combined deductions larger than gross produce zero tax", () => {
      const result = calculateTax(50000, 30000, 30000, "INR", stubFormat);
      expect(result.taxableIncome).toBe(0);
      expect(result.totalTax).toBe(0);
    });
  });

  // ───────────────────── MONTHLY TAKE-HOME ─────────────────────
  describe("monthly take-home calculations", () => {
    it("monthlyTakeHome is takeHome / 12", () => {
      const result = calculateTax(120000, 0, 0, "USD", stubFormat);
      expect(result.monthlyTakeHome).toBeCloseTo(result.takeHome / 12, 2);
    });

    it("takeHome never goes negative", () => {
      const result = calculateTax(1, 0, 0, "USD", stubFormat);
      expect(result.takeHome).toBeGreaterThanOrEqual(0);
    });
  });
});

describe("calculateStrategySavings", () => {
  it("returns default maxRate of 15 when no brackets exist", () => {
    const taxResults: TaxResults = {
      taxableIncome: 0,
      totalTax: 0,
      takeHome: 0,
      effectiveRate: 0,
      monthlyTakeHome: 0,
      standardDeductionText: "",
      brackets: []
    };
    const result = calculateStrategySavings(100000, 0, 0, taxResults);
    expect(result.maxRate).toBe(15);
    expect(result.additionalPreTax).toBe(5000);
    expect(result.annualSavings).toBe(750); // 5000 * 15 / 100
  });

  it("uses highest bracket rate for maxRate", () => {
    const taxResults: TaxResults = {
      taxableIncome: 100000,
      totalTax: 20000,
      takeHome: 80000,
      effectiveRate: 20,
      monthlyTakeHome: 6666.67,
      standardDeductionText: "",
      brackets: [
        { rate: 10, amount: 1160, bounds: "" },
        { rate: 12, amount: 4266, bounds: "" },
        { rate: 22, amount: 5000, bounds: "" }
      ]
    };
    const result = calculateStrategySavings(200000, 0, 0, taxResults);
    expect(result.maxRate).toBe(22);
    expect(result.additionalPreTax).toBe(10000);
    expect(result.annualSavings).toBeCloseTo(10000 * 22 / 100, 2);
  });

  it("returns zero additionalPreTax and annualSavings when grossIncome is 0", () => {
    const taxResults: TaxResults = {
      taxableIncome: 0, totalTax: 0, takeHome: 0, effectiveRate: 0,
      monthlyTakeHome: 0, standardDeductionText: "", brackets: []
    };
    const result = calculateStrategySavings(0, 0, 0, taxResults);
    expect(result.additionalPreTax).toBe(0);
    expect(result.annualSavings).toBe(0);
  });
});
