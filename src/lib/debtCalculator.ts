export interface Loan {
  id: string;
  name: string;
  balance: number;
  rate: number;
  minPayment: number;
}

export interface TimelineEntry {
  month: number;
  totalRemainingBalance: number;
  interestAccumulated: number;
}

export interface SimulationResult {
  months: number;
  interest: number;
  timeline: TimelineEntry[];
}

export interface DebtSimulationResults {
  totalPrincipal: number;
  monthlyMinimumCommitment: number;
  avalanche: SimulationResult;
  snowball: SimulationResult;
}

export interface SavingsDelta {
  interestSaved: number;
  monthsSaved: number;
}

export function simulateDebtPayoff(
  loans: Loan[],
  extraPayment: number
): DebtSimulationResults {
  if (loans.length === 0) {
    return {
      snowball: { months: 0, interest: 0, timeline: [] },
      avalanche: { months: 0, interest: 0, timeline: [] },
      totalPrincipal: 0,
      monthlyMinimumCommitment: 0
    };
  }

  const totalPrincipal = loans.reduce((sum, l) => sum + l.balance, 0);
  const monthlyMinimumCommitment = loans.reduce((sum, l) => sum + l.minPayment, 0);

  const simulate = (method: "AVALANCHE" | "SNOWBALL"): SimulationResult => {
    const activeLoans = loans.map(l => ({ ...l }));
    let totalInterestPaid = 0;
    let month = 0;
    const history: TimelineEntry[] = [];
    const MAX_MONTHS = 360;

    const sortedDebtsOrder = () => {
      if (method === "AVALANCHE") {
        return [...activeLoans].sort((a, b) => b.rate - a.rate);
      } else {
        return [...activeLoans].sort((a, b) => a.balance - b.balance);
      }
    };

    while (activeLoans.some(l => l.balance > 0) && month < MAX_MONTHS) {
      month++;
      const totalBudget = monthlyMinimumCommitment + extraPayment;
      let pool = totalBudget;

      for (const loan of activeLoans) {
        if (loan.balance > 0) {
          const monthlyRate = (loan.rate / 100) / 12;
          const interest = loan.balance * monthlyRate;
          loan.balance += interest;
          totalInterestPaid += interest;
        }
      }

      for (const loan of activeLoans) {
        if (loan.balance > 0) {
          const minToPay = Math.min(loan.balance, loan.minPayment);
          loan.balance -= minToPay;
          pool -= minToPay;
        }
      }

      if (pool > 0) {
        const priorityLoans = sortedDebtsOrder().filter(l => l.balance > 0);
        for (const targetLoan of priorityLoans) {
          if (pool <= 0) break;
          const originalLoanInRef = activeLoans.find(l => l.id === targetLoan.id);
          if (originalLoanInRef) {
            const extraToPay = Math.min(originalLoanInRef.balance, pool);
            originalLoanInRef.balance -= extraToPay;
            pool -= extraToPay;
          }
        }
      }

      const totalRemainingBalance = activeLoans.reduce((sum, l) => sum + l.balance, 0);
      history.push({
        month,
        totalRemainingBalance,
        interestAccumulated: totalInterestPaid
      });

      if (totalRemainingBalance <= 0) break;
    }

    return {
      months: month,
      interest: totalInterestPaid,
      timeline: history
    };
  };

  const avalancheRes = simulate("AVALANCHE");
  const snowballRes = simulate("SNOWBALL");

  return {
    totalPrincipal,
    monthlyMinimumCommitment,
    avalanche: avalancheRes,
    snowball: snowballRes
  };
}

export function calculateSavingsDelta(results: DebtSimulationResults): SavingsDelta {
  const interestSaved = Math.max(0, results.snowball.interest - results.avalanche.interest);
  const monthsSaved = Math.max(0, results.snowball.months - results.avalanche.months);
  return { interestSaved, monthsSaved };
}

export function validateLoanInput(
  name: string,
  balanceStr: string,
  rateStr: string,
  minPaymentStr: string
): Loan | null {
  if (!name) return null;
  const balance = parseFloat(balanceStr) || 0;
  const rate = parseFloat(rateStr) || 0;
  const minPayment = parseFloat(minPaymentStr) || Math.round(balance * 0.03);

  if (balance <= 0) return null;

  return {
    id: Math.random().toString(),
    name,
    balance,
    rate,
    minPayment
  };
}
