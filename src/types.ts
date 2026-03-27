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
