import { CurrencyConfig, QuizQuestion } from "./types";

export const CURRENCIES: Record<string, CurrencyConfig> = {
  USD: { symbol: "$", name: "US Dollar", locale: "en-US", avgSalary: 5000, avgRent: 1500, avgFood: 400, sipExample: 200, emergencyTarget: 15000 },
  GBP: { symbol: "£", name: "British Pound", locale: "en-GB", avgSalary: 3800, avgRent: 1200, avgFood: 300, sipExample: 150, emergencyTarget: 11400 },
  EUR: { symbol: "€", name: "Euro", locale: "de-DE", avgSalary: 3500, avgRent: 1000, avgFood: 280, sipExample: 150, emergencyTarget: 10500 },
  CAD: { symbol: "CA$", name: "Canadian Dollar", locale: "en-CA", avgSalary: 4500, avgRent: 1400, avgFood: 380, sipExample: 180, emergencyTarget: 13500 },
  AUD: { symbol: "A$", name: "Australian Dollar", locale: "en-AU", avgSalary: 5200, avgRent: 1600, avgFood: 420, sipExample: 200, emergencyTarget: 15600 },
  JPY: { symbol: "¥", name: "Japanese Yen", locale: "ja-JP", avgSalary: 280000, avgRent: 80000, avgFood: 30000, sipExample: 10000, emergencyTarget: 840000 },
  SGD: { symbol: "S$", name: "Singapore Dollar", locale: "en-SG", avgSalary: 4800, avgRent: 1800, avgFood: 500, sipExample: 200, emergencyTarget: 14400 },
  INR: { symbol: "₹", name: "Indian Rupee", locale: "en-IN", avgSalary: 50000, avgRent: 12000, avgFood: 8000, sipExample: 2000, emergencyTarget: 150000 },
  BRL: { symbol: "R$", name: "Brazilian Real", locale: "pt-BR", avgSalary: 4000, avgRent: 1200, avgFood: 600, sipExample: 200, emergencyTarget: 12000 },
  ZAR: { symbol: "R", name: "South African Rand", locale: "en-ZA", avgSalary: 25000, avgRent: 8000, avgFood: 3000, sipExample: 1000, emergencyTarget: 75000 },
  AED: { symbol: "د.إ", name: "UAE Dirham", locale: "ar-AE", avgSalary: 12000, avgRent: 4000, avgFood: 1500, sipExample: 500, emergencyTarget: 36000 },
  MXN: { symbol: "MX$", name: "Mexican Peso", locale: "es-MX", avgSalary: 18000, avgRent: 5000, avgFood: 3000, sipExample: 800, emergencyTarget: 54000 }
};

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  // EASY
  {
    id: 1, category: "EASY", points: 10,
    question: "What does 'compound interest' mean?",
    options: ["Interest only on the principal amount", "Interest on both principal AND accumulated interest", "A type of bank loan", "Government tax on savings"],
    correctAnswer: 1,
    explanation: "Compound interest is the engine of wealth building. Albert Einstein reportedly called it 'the 8th wonder of the world.' When your returns generate more returns, growth becomes exponential over time — this is why starting early is so powerful."
  },
  {
    id: 2, category: "EASY", points: 10,
    question: "What is a budget?",
    options: ["A list of things you want to buy", "A plan for how to earn more money", "A plan for managing income and expenses", "A government tax document"],
    correctAnswer: 2,
    explanation: "A budget is your financial roadmap. It tells your money where to go instead of wondering where it went. The simple act of budgeting increases savings rates by an average of 23% according to financial research."
  },
  {
    id: 3, category: "EASY", points: 10,
    question: "What does 'net worth' mean?",
    options: ["Your monthly take-home salary", "Total assets minus total liabilities", "The amount in your savings account", "Your credit score"],
    correctAnswer: 1,
    explanation: "Net worth = everything you own (assets: cash, investments, property) minus everything you owe (liabilities: loans, credit card debt). A positive and growing net worth is the true measure of financial health."
  },
  {
    id: 4, category: "EASY", points: 10,
    question: "What is an 'emergency fund'?",
    options: ["A fund for luxury vacations", "Money kept for stock market investment", "3-6 months of living expenses saved for unexpected events", "Your monthly salary savings target"],
    correctAnswer: 2,
    explanation: "Financial experts universally recommend keeping 3-6 months of expenses in an easily accessible account. This prevents you from taking on debt during emergencies like job loss, medical bills, or car repairs."
  },
  {
    id: 5, category: "EASY", points: 10,
    question: "What does 'diversification' mean in investing?",
    options: ["Investing all money in one strong company", "Spreading investments across different assets to reduce risk", "Changing your investment strategy every month", "Only investing in government bonds"],
    correctAnswer: 1,
    explanation: "'Don't put all your eggs in one basket.' Diversification means spreading risk across different asset classes (stocks, bonds, real estate), geographies, and sectors so one bad investment doesn't ruin your entire portfolio."
  },
  // MEDIUM
  {
    id: 6, category: "MEDIUM", points: 20,
    question: "You invest $1,000 at 8% compound interest for 10 years. What is the approximate final value?",
    options: ["$1,800", "$2,159", "$2,500", "$1,600"],
    correctAnswer: 1,
    explanation: "Using FV = 1000 × (1.08)^10 = $2,158.92. This illustrates compound growth — you earned $1,158.92 on a $1,000 investment without doing anything."
  },
  {
    id: 7, category: "MEDIUM", points: 20,
    question: "If inflation is 4% and your savings account earns 2%, what is your REAL return?",
    options: ["+6%", "+2%", "-2%", "0%"],
    correctAnswer: 2,
    explanation: "Real return = Nominal return - Inflation rate = 2% - 4% = -2%. Your money is actually LOSING purchasing power."
  },
  {
    id: 8, category: "MEDIUM", points: 20,
    question: "Which investment strategy does Warren Buffett recommend for most regular investors?",
    options: ["Actively trading stocks daily", "Investing in individual company bonds", "Low-cost index funds tracking the whole market", "Keeping money in high-yield savings accounts"],
    correctAnswer: 2,
    explanation: "Buffett recommends low-cost index funds for most investors as they provide market returns with minimal fees."
  },
  {
    id: 9, category: "MEDIUM", points: 20,
    question: "What is 'dollar-cost averaging'?",
    options: ["Converting your savings to US dollars", "Investing a fixed amount at regular intervals regardless of price", "Buying stocks only when prices are low", "A strategy to predict market movements"],
    correctAnswer: 1,
    explanation: "DCA involves investing a fixed amount regularly, which averages out your cost per share over time."
  },
  {
    id: 10, category: "MEDIUM", points: 20,
    question: "What is an 'expense ratio' in mutual funds?",
    options: ["The ratio of your expenses to your income", "The annual fee charged by the fund as a % of your investment", "The profit margin reported by the fund company", "Tax charged on fund withdrawals"],
    correctAnswer: 1,
    explanation: "The expense ratio is the annual fee charged by the fund manager to manage the fund."
  },
  // HARD
  {
    id: 11, category: "HARD", points: 30,
    question: "If an investment has a CAGR of 12% over 10 years, it has approximately multiplied by:",
    options: ["2.5x", "3.1x", "4.0x", "1.2x"],
    correctAnswer: 1,
    explanation: "CAGR formula: Final = Initial × (1 + 0.12)^10 = 3.106x."
  },
  {
    id: 12, category: "HARD", points: 30,
    question: "The 'Rule of 72' states that money doubles when:",
    options: ["You divide your return rate by 72", "You multiply years by 72", "You divide 72 by the annual return rate", "You add 72 to your interest rate"],
    correctAnswer: 2,
    explanation: "Rule of 72: Years to double = 72 ÷ Annual Return Rate."
  },
  {
    id: 13, category: "HARD", points: 30,
    question: "A bond with a face value of $1,000, 5% coupon, currently priced at $1,100 has what yield?",
    options: ["5%", "5.5%", "4.55%", "4%"],
    correctAnswer: 2,
    explanation: "Current yield = Annual coupon / Market price = $50 / $1,100 = 4.55%."
  },
  {
    id: 14, category: "HARD", points: 30,
    question: "What does a P/E ratio of 25 mean for a stock?",
    options: ["The stock has 25% annual returns", "Investors pay $25 for every $1 of annual earnings", "The company grew 25% last year", "The stock price is $25"],
    correctAnswer: 1,
    explanation: "Price-to-Earnings ratio = Share Price / Earnings Per Share. A P/E of 25 means investors pay $25 per $1 of profit."
  },
  {
    id: 15, category: "HARD", points: 30,
    question: "Which of these best describes 'sequence of returns risk'?",
    options: ["The risk of investing in foreign markets", "The risk that poor early returns in retirement devastate long-term outcomes", "The risk of returns coming in irregular sequences", "The risk of inflation outpacing returns"],
    correctAnswer: 1,
    explanation: "Sequence of returns risk is the danger that the timing of withdrawals from a portfolio coincides with a market downturn."
  }
];
