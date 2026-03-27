export interface CurrencyConfig {
  symbol: string;
  name: string;
  locale: string;
  avgSalary: number;
  avgRent: number;
  avgFood: number;
  sipExample: number;
  emergencyTarget: number;
}

export interface UserProfile {
  uid: string;
  name: string;
  age: string;
  learningGoal: string;
  currency: string;
  joinDate: string;
  lastVisit: string;
  visitDates: string[];
  highScore: number;
  netWorth: {
    assets: number;
    liabilities: number;
  };
  portfolio?: Portfolio;
  goals?: FinancialGoal[];
}

export interface Portfolio {
  totalValue: number;
  change24h: number;
  allocation: {
    stocks: number;
    bonds: number;
    crypto: number;
    cash: number;
    realEstate: number;
  };
  holdings: {
    name: string;
    value: number;
    allocation: number;
    performance: number;
  }[];
}

export interface FinancialGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  category: "RETIREMENT" | "HOUSE" | "CAR" | "EDUCATION" | "OTHER";
}

export interface BudgetPlan {
  income: number;
  expenses: {
    housing: number;
    food: number;
    transport: number;
    health: number;
    entertainment: number;
    education: number;
    loans: number;
    other: number;
  };
  goals?: {
    housing?: number;
    food?: number;
    transport?: number;
    health?: number;
    entertainment?: number;
    education?: number;
    loans?: number;
    other?: number;
  };
  transactions?: {
    id: number;
    date: string;
    description: string;
    amount: number;
    category: string;
  }[];
  history?: {
    month: string;
    total: number;
  }[];
  timestamp: string;
}

export interface QuizQuestion {
  id: number;
  category: "EASY" | "MEDIUM" | "HARD";
  points: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface ChatMessage {
  role: "user" | "model";
  text: string;
  timestamp: string;
}
