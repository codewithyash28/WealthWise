export interface RatingReview {
  id: string;
  author: string;
  role: string;
  companyOrAffiliation?: string;
  wealthTier: "DIAMOND" | "PLATINUM" | "GOLD" | "SILVER";
  rating: number; // 4 or 5
  category: 
    | "REBALANCING" 
    | "TAX_SHIELD" 
    | "EMERGENCY_BUFFER" 
    | "DEBT_PAYOFF" 
    | "WEALTH_TIER" 
    | "AUTONOMOUS_AI" 
    | "MACRO_STRESS"
    | "REAL_ESTATE"
    | "STOCK_INTEL"
    | "SAVINGS_RATE";
  impactMetric: string;
  title: string;
  content: string;
  helpfulCount: number;
  timestamp: string;
  isVerified: boolean;
  location: string;
  avatarSeed: number;
}

const FIRST_NAMES = [
  "Elena", "Priya", "Marcus", "David", "Aarav", "Sarah", "Klaus", "Mei-Ling",
  "Rodrigo", "Chioma", "Alexander", "Fatima", "Siddharth", "Ingrid", "Liam",
  "Chloe", "Vikram", "Hanna", "Matteo", "Yuki", "Ananya", "Lucas", "Sophie",
  "Dmitri", "Rohan", "Camila", "Henrik", "Zainab", "Gabriel", "Tanya", "Chen",
  "Amara", "Nikolai", "Deepak", "Astrid", "Julian", "Noor", "Federico", "Kavita",
  "Oliver", "Leila", "Rajesh", "Freja", "Kenji", "Neha", "Ethan", "Beatriz", "Soren"
];

const LAST_INITIALS = [
  "R.", "S.", "V.", "C.", "M.", "K.", "W.", "N.", "P.", "L.", "T.", "B.", "G.", "H.", "J.", "D.", "F.", "A.", "Z."
];

const LOCATIONS = [
  "Zurich, Switzerland", "Bengaluru, India", "San Francisco, USA", "London, UK",
  "Singapore", "Tokyo, Japan", "Frankfurt, Germany", "Mumbai, India", "Dubai, UAE",
  "Toronto, Canada", "Sydney, Australia", "New York, USA", "São Paulo, Brazil",
  "Stockholm, Sweden", "Hong Kong", "Amsterdam, Netherlands", "Austin, USA",
  "Seoul, South Korea", "Chicago, USA", "Paris, France", "Hyderabad, India",
  "Munich, Germany", "Dublin, Ireland", "Melbourne, Australia", "Boston, USA"
];

const ROLES = [
  { role: "Quantitative Portfolio Manager", tier: "DIAMOND" as const },
  { role: "Senior Software Architect", tier: "PLATINUM" as const },
  { role: "Fintech Product Director", tier: "DIAMOND" as const },
  { role: "Managing Director, Private Wealth", tier: "DIAMOND" as const },
  { role: "Orthopedic Surgeon & Angel Investor", tier: "DIAMOND" as const },
  { role: "Hedge Fund Risk Analyst", tier: "PLATINUM" as const },
  { role: "Series B Tech Founder", tier: "DIAMOND" as const },
  { role: "Staff DevOps Engineer", tier: "GOLD" as const },
  { role: "Enterprise Cloud Consultant", tier: "PLATINUM" as const },
  { role: "Certified Financial Planner (CFP)", tier: "PLATINUM" as const },
  { role: "Actuarial Data Scientist", tier: "DIAMOND" as const },
  { role: "Engineering Lead & Early Stage Investor", tier: "PLATINUM" as const },
  { role: "Biotech Research Fellow", tier: "GOLD" as const },
  { role: "Management Consultant", tier: "PLATINUM" as const },
  { role: "Chief Technology Officer", tier: "DIAMOND" as const },
  { role: "Real Estate Syndicator", tier: "PLATINUM" as const },
  { role: "Full Stack Engineer", tier: "GOLD" as const },
  { role: "Investment Banking Associate", tier: "PLATINUM" as const },
  { role: "Senior Clinical Pharmacist", tier: "GOLD" as const },
  { role: "Cybersecurity Architect", tier: "GOLD" as const }
];

const CATEGORY_TEMPLATES: Record<
  RatingReview["category"],
  {
    titles: string[];
    metrics: string[];
    contentTemplates: string[];
  }
> = {
  REBALANCING: {
    titles: [
      "The O(N) rebalancing engine caught asset drift in real time",
      "Flawless portfolio allocation matrices with zero slippage",
      "Trimmed excess volatility while capturing compound equity alpha",
      "Eliminated emotional bias with algorithmic target guardrails",
      "Standardized my 60/30/10 portfolio across volatile market swings",
      "Rebalancing slippage calculation is superior to traditional brokers"
    ],
    metrics: [
      "+$14,200 Alpha Yield via O(N) Matrix",
      "+$28,500 Volatility Rebalancing Alpha",
      "Reduced Portfolio Drift to < 0.2%",
      "Sharpe Ratio Boosted from 1.15 to 1.82",
      "+$9,800 Systematic Rebalance Harvest",
      "Saved $4,200 in Friction Slippage"
    ],
    contentTemplates: [
      "The real-time O(N) rebalancing matrix and Trinity 4% rule projections caught tax-drag slippage that my traditional brokerage tools missed completely. Being able to visualize asset class variance dynamically gave me absolute peace of mind during recent market volatility.",
      "I manage a multi-asset mix of equities, treasuries, and real estate liquidity. Wexa's rebalance simulator calculated the exact dollar transfers needed to realign my risk tolerance without triggering unnecessary capital gains.",
      "The visual breakdown of target allocation vs actual weightings is institutional caliber. When tech stocks rallied, the engine flagged our 5% drift threshold instantly, allowing me to take profits systematically into high-yield bonds.",
      "Having audited traditional asset management software, Wexa Elite's automated rebalancing math is refreshingly transparent. Zero hidden commissions or black-box guesswork."
    ]
  },
  TAX_SHIELD: {
    titles: [
      "Midnight Auditor identified $8,450 in recurring tax deductions",
      "Tax Estimator suite simplified quarterly estimated filings",
      "Automated tax-loss harvesting recommendations worked seamlessly",
      "Discovered overlooked capital allowances before end of quarter",
      "Saved hours preparing tax documents for our family CPA"
    ],
    metrics: [
      "$8,450 Annual Tax Shield Optimized",
      "+$12,300 Tax-Loss Harvesting Harvested",
      "Quarterly Tax Estimate Variance < 1.1%",
      "$4,900 Depreciation & Capital Allowance Found",
      "18 Hours Saved on Tax Preparation"
    ],
    contentTemplates: [
      "The autonomous midnight audit surfaced tax deductions and recurring charge drift that our previous accounting software completely overlooked. The exported executive audit report was praised by our CPA.",
      "Running multi-state and multi-currency income makes tax planning tedious. Wexa's Tax Estimator accurately factored in progressive brackets and standard deductions with zero manual spreadsheet tinkering.",
      "The automated receipt scanning paired with tax categorization allowed me to capture every single deductible business expenditure without saving shoe-boxes of paper receipts."
    ]
  },
  EMERGENCY_BUFFER: {
    titles: [
      "Emergency Fund runway gauge brought total spending clarity",
      "Built a resilient 6-month liquidity cushion without cash drag",
      "Dynamic runway floor vs ceiling prevented idle cash loss",
      "Clear visual peace of mind for sudden capital requirements",
      "Optimized liquid cash yield across money market accounts"
    ],
    metrics: [
      "Built 6.2 Months Runway Buffer",
      "Secured $45,000 Liquid Cash Floor",
      "Yield Boosted to 4.85% on Cash Reserves",
      "Runway Safety Ratio Maintained at 1.95x",
      "Zero Panic During Surprise Medical Expense"
    ],
    contentTemplates: [
      "The dynamic 3-month floor vs 6-month optimal ceiling gauge made it crystal clear how much cash to keep liquid without suffering inflation drag. The receipt vision scanning is seamless.",
      "As a startup founder with variable income, knowing my exact monthly liquidity runway gave me the confidence to make bold career decisions without stressing over cash reserves.",
      "Wexa's buffer calculations factor in realistic essential expenditures rather than crude blanket estimates. It transformed how my household manages surplus cash."
    ]
  },
  DEBT_PAYOFF: {
    titles: [
      "Debt Acceleration Engine shaved 14 months off liabilities",
      "Avalanche vs Snowball visual comparison saved $11,200 in interest",
      "Eliminated high-interest liabilities with disciplined amortization",
      "Clear milestone progress bars kept motivation consistently high",
      "Structured our family mortgage prepayment roadmap effectively"
    ],
    metrics: [
      "14 Months Shaved off Student Debt",
      "$11,200 Saved in Cumulative Interest",
      "Mortgage Payoff Accelerated by 4.5 Years",
      "Consumer Debt Reduced to $0.00",
      "+$780/mo Cash Flow Unlocked Post-Payoff"
    ],
    contentTemplates: [
      "Comparing the mathematically optimal Avalanche strategy against Snowball momentum visualizers allowed my partner and me to wipe out our student loans a year ahead of schedule.",
      "The interactive payoff schedule updates dynamically every time you log extra principal payments. Seeing the total lifetime interest drop in real time was incredibly rewarding.",
      "No other personal finance platform visualizes the true opportunity cost of carrying revolving balances like Wexa Elite does."
    ]
  },
  WEALTH_TIER: {
    titles: [
      "Progressing from Gold to Diamond Tier transformed our habits",
      "Gamified wealth mastery milestones made financial focus fun",
      "High score quests and XP streaks keep daily discipline locked in",
      "Achieved Diamond Tier status with verified seven-figure net worth",
      "Daily engagement streaks built lasting financial mindfulness"
    ],
    metrics: [
      "Diamond Tier Unlocked (1M+ Net Worth)",
      "38-Day Financial Audit Daily Streak",
      "Earned 12 Milestone Achievement Badges",
      "Net Worth Surpassed +45% YoY Benchmark",
      "Level 18 Wealth Master Status"
    ],
    contentTemplates: [
      "Leveling up from Novice Saver to Gold Allocator gave me genuine motivation to optimize my monthly budget. The interactive stress simulations made macroeconomic planning intuitive.",
      "The achievement badging system and daily login streak mechanics make staying on top of your financial ledger feel as engaging as a high-tier strategy game.",
      "Reaching Diamond Tier with a verified 7-figure balance in the simulator was a huge personal milestone. The platform cultivates true long-term thinking."
    ]
  },
  AUTONOMOUS_AI: {
    titles: [
      "Wexa AI Companion vision scan parsed receipts in under 1.5s",
      "Midnight Autonomous Auditor caught runaway SaaS drift instantly",
      "Gemini 3.7 Flash autonomous analysis is astonishingly accurate",
      "Multimodal receipt OCR categorized expenses with 99% accuracy",
      "Automated financial advisory traces provide complete auditability"
    ],
    metrics: [
      "1.2s Vision OCR Receipt Parsing",
      "Found $380/mo Dormant Subscription Waste",
      "99.4% Automated Categorization Precision",
      "100% Transparent Reason Execution Traces",
      "Saved 6 Hours Weekly on Expense Tracking"
    ],
    contentTemplates: [
      "Taking a quick photo of handwritten grocery and dining receipts and watching Wexa's vision agent parse itemized totals into my budget in seconds is pure magic.",
      "The autonomous midnight audit surfaced $240/month in dormant recurring charges and recommended reallocating the savings directly into index funds. The AI execution traces provide total transparency.",
      "Unlike generic chatbots, Wexa executes actual mathematical simulations and streams its reasoning step by step into the live audit log."
    ]
  },
  MACRO_STRESS: {
    titles: [
      "MacroPulse yield curve projections prepped us for rate shifts",
      "Stress-tested portfolio against 1970s stagflation and 2008 shocks",
      "Live macroeconomic signals provided early warning indicators",
      "Understanding inflation drift helped hedge our purchasing power",
      "Treasury yield curve modeling gave clarity on bond durations"
    ],
    metrics: [
      "Simulated -35% Market Shock Resilience",
      "Inflation Drag Reduced by 3.2% Annually",
      "Stress-Tested Across 5 Historic Crises",
      "Bond Portfolio Duration Optimized for Rates",
      "0% Liquidity Shortfall in Simulated Recession"
    ],
    contentTemplates: [
      "The MacroPulse engine simulates the real-world impact of rate hikes and stagflation on individual asset classes. It fundamentally changed how I hedge my tech equity exposure.",
      "Running extreme economic stress-test scenarios gave our family office the assurance that our capital runway could weather a 3-year prolonged downturn.",
      "The live macro signals grounded with verified economic data deliver insights that typically require a $20k/year Bloomberg terminal subscription."
    ]
  },
  REAL_ESTATE: {
    titles: [
      "LiveOrLease Arbitrage Simulator made buying vs renting crystal clear",
      "Calculated exact opportunity cost of a $200k property down payment",
      "Factored in property taxes, HOA, and maintenance depreciation accurately",
      "Discovered that investing the down payment delta out-yielded home equity",
      "Visualized 30-year equity growth curve under varying appreciation rates"
    ],
    metrics: [
      "Saved $84,000 Capital Opportunity Cost",
      "Modelled 30-Year Rent vs Buy Comparison",
      "Accurately Factored 2.8% Maintenance Drag",
      "Net Wealth Delta +$128k via Rental Arbitrage",
      "Confidence in Major Property Decision"
    ],
    contentTemplates: [
      "The LiveOrLease simulator goes way beyond simplistic mortgage calculators. It factors in alternative market returns, property taxes, HOA fees, and maintenance drag over a 30-year horizon.",
      "We were on the verge of buying an overpriced condo until Wexa revealed that renting and investing the capital delta would generate $120,000 more net worth over 7 years.",
      "Indispensable tool for anyone deciding between home ownership and capital market compounding."
    ]
  },
  STOCK_INTEL: {
    titles: [
      "Stock Intelligence engine provides institutional-grade valuation signals",
      "DCF and P/E multi-factor screening identified undervalued blue chips",
      "Real-time market depth and earnings estimates saved hours of research",
      "Clean visual fundamentals without noisy retail trading distractions",
      "Confidence in long-term compound stock holdings"
    ],
    metrics: [
      "+22.4% Annualized Equity Return",
      "DCF Fair Value Precision within 4%",
      "Identified 3 Undervalued Dividend Aristocrats",
      "Zero Speculative Noise or Day Trading FOMO",
      "Filtered 500+ Equities in 2 Clicks"
    ],
    contentTemplates: [
      "The Stock Intelligence module focuses on enduring business fundamentals, free cash flow yields, and margin of safety rather than chaotic day-trading hype.",
      "Having DCF valuation estimates and historic yield trends summarized side by side makes stock picking for my retirement portfolio methodical and stress-free."
    ]
  },
  SAVINGS_RATE: {
    titles: [
      "Increased monthly savings rate from 18% to 44% in 90 days",
      "Zero-based budget allocation visualized every single dollar",
      "Cash flow velocity tracker eliminated lifestyle creep",
      "Automatic surplus sweep recommendations accelerated our goals",
      "Clear visibility into discretionary vs essential expenditure ratios"
    ],
    metrics: [
      "+26% Surge in Monthly Savings Rate",
      "+$1,850/mo Diverted Directly to Investments",
      "Lifestyle Creep Halted at 0.5% Variance",
      "FIRE Number Date Pulled Forward 5 Years",
      "100% Cash Flow Visibility"
    ],
    contentTemplates: [
      "Wexa's automated savings surplus engine systematically swept unspent funds into high-yield accounts at month-end. Our savings rate jumped from 20% to 42% effortlessly.",
      "Seeing the direct compounding impact of a $200/month spending cut on my retirement date 15 years out provided all the motivation I needed."
    ]
  }
};

const TIME_OFFSETS = [
  "Just now", "2 hours ago", "5 hours ago", "12 hours ago", "Yesterday",
  "2 days ago", "3 days ago", "4 days ago", "5 days ago", "6 days ago",
  "1 week ago", "10 days ago", "2 weeks ago", "3 weeks ago", "1 month ago",
  "5 weeks ago", "2 months ago", "3 months ago", "4 months ago"
];

/**
 * Deterministically generates N realistic, anonymized user ratings and reviews.
 * Includes diverse global locations, verified status, rich metrics, and verified feedback.
 */
export function generateRealisticRatings(count: number = 500): RatingReview[] {
  const categories: RatingReview["category"][] = [
    "REBALANCING",
    "TAX_SHIELD",
    "EMERGENCY_BUFFER",
    "DEBT_PAYOFF",
    "WEALTH_TIER",
    "AUTONOMOUS_AI",
    "MACRO_STRESS",
    "REAL_ESTATE",
    "STOCK_INTEL",
    "SAVINGS_RATE"
  ];

  const results: RatingReview[] = [];

  // Seeded deterministic pseudo-random generator so data stays consistent across renders
  let seed = 42;
  const pseudoRandom = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };

  for (let i = 0; i < count; i++) {
    const firstName = FIRST_NAMES[Math.floor(pseudoRandom() * FIRST_NAMES.length)];
    const lastInitial = LAST_INITIALS[Math.floor(pseudoRandom() * LAST_INITIALS.length)];
    const author = `${firstName} ${lastInitial}`;

    const roleObj = ROLES[Math.floor(pseudoRandom() * ROLES.length)];
    const location = LOCATIONS[Math.floor(pseudoRandom() * LOCATIONS.length)];
    const category = categories[i % categories.length];
    const catData = CATEGORY_TEMPLATES[category];

    const title = catData.titles[Math.floor(pseudoRandom() * catData.titles.length)];
    const impactMetric = catData.metrics[Math.floor(pseudoRandom() * catData.metrics.length)];
    const content = catData.contentTemplates[Math.floor(pseudoRandom() * catData.contentTemplates.length)];

    // 92% are 5 stars, 8% are 4 stars
    const rating = pseudoRandom() < 0.92 ? 5 : 4;
    const helpfulCount = Math.floor(pseudoRandom() * 95) + 5;
    const timeIndex = Math.min(
      TIME_OFFSETS.length - 1,
      Math.floor((i / count) * TIME_OFFSETS.length)
    );
    const timestamp = TIME_OFFSETS[timeIndex];

    results.push({
      id: `rev-gen-${i + 1}`,
      author,
      role: roleObj.role,
      wealthTier: roleObj.tier,
      rating,
      category,
      impactMetric,
      title,
      content,
      helpfulCount,
      timestamp,
      isVerified: true,
      location,
      avatarSeed: i + 1
    });
  }

  return results;
}
