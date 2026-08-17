import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Star, 
  ThumbsUp, 
  CheckCircle2, 
  MessageSquarePlus, 
  Sparkles, 
  Filter, 
  Search, 
  TrendingUp, 
  ShieldCheck, 
  Award, 
  UserCheck, 
  X, 
  DollarSign, 
  Zap,
  ArrowRight,
  Flame,
  Globe,
  BadgeCheck
} from "lucide-react";
import { cn } from "../lib/utils";

export interface ReviewItem {
  id: string;
  author: string;
  role: string;
  avatarUrl?: string;
  wealthTier: "DIAMOND" | "PLATINUM" | "GOLD" | "SILVER";
  rating: number;
  category: "TAX_SHIELD" | "REBALANCING" | "DEBT_PAYOFF" | "EMERGENCY_BUFFER" | "WEALTH_TIER" | "AUTONOMOUS_AI" | "MACRO_STRESS";
  impactMetric: string;
  title: string;
  content: string;
  helpfulCount: number;
  timestamp: string;
  isVerified: boolean;
  location?: string;
}

const DEFAULT_REVIEWS: ReviewItem[] = [
  {
    id: "rev-1",
    author: "Elena Rostova",
    role: "Quantitative Analyst & Pro Member",
    wealthTier: "DIAMOND",
    rating: 5,
    category: "REBALANCING",
    impactMetric: "+$14,200 Alpha Yield via O(N) Matrix",
    title: "The Asset Rebalancer math is mathematically flawless",
    content: "As someone who evaluates financial algorithms daily, Wexa's real-time O(N) rebalancing matrix and Trinity 4% rule projections caught tax-drag slippage that my traditional brokerage tools missed completely.",
    helpfulCount: 42,
    timestamp: "2 days ago",
    isVerified: true,
    location: "Zurich, Switzerland"
  },
  {
    id: "rev-2",
    author: "Priya Sharma",
    role: "Tech Lead & Early Beta Tester",
    wealthTier: "PLATINUM",
    rating: 5,
    category: "EMERGENCY_BUFFER",
    impactMetric: "Built 6.2 Months Runway Buffer",
    title: "Emergency Fund widget transformed my cash discipline",
    content: "The dynamic 3-month floor vs 6-month optimal ceiling gauge made it crystal clear how much idle cash to keep liquid without suffering inflation drag. The receipt vision scanning is seamless.",
    helpfulCount: 28,
    timestamp: "4 days ago",
    isVerified: true,
    location: "Bengaluru, India"
  },
  {
    id: "rev-3",
    author: "Marcus Vance",
    role: "Startup Founder & YC Alum",
    wealthTier: "PLATINUM",
    rating: 5,
    category: "TAX_SHIELD",
    impactMetric: "$8,450 Annual Tax Shield Optimized",
    title: "Midnight Auditor caught runaway SaaS subscription drift",
    content: "The autonomous midnight audit surfaced $240/month in dormant recurring charges and recommended reallocating the savings directly into index funds. The AI execution traces provide total transparency.",
    helpfulCount: 35,
    timestamp: "1 week ago",
    isVerified: true,
    location: "San Francisco, USA"
  },
  {
    id: "rev-4",
    author: "David Chen",
    role: "Senior Software Engineer",
    wealthTier: "GOLD",
    rating: 5,
    category: "DEBT_PAYOFF",
    impactMetric: "14 Months Shaved off Student Debt",
    title: "Gamified leveling and interactive quizzes keep you hooked",
    content: "Leveling up from Novice Saver to Gold Allocator gave me genuine motivation to optimize my monthly budget. The interactive stress simulations made macroeconomic planning intuitive.",
    helpfulCount: 19,
    timestamp: "2 weeks ago",
    isVerified: true,
    location: "Toronto, Canada"
  },
  {
    id: "rev-5",
    author: "Dr. Siddharth Mukherjee",
    role: "Orthopedic Surgeon & Angel Investor",
    wealthTier: "DIAMOND",
    rating: 5,
    category: "MACRO_STRESS",
    impactMetric: "₹18.4 Lakhs Protected in Market Drawdown",
    title: "Macro Scenario Stress Tester gives institutional-level confidence",
    content: "Simulating the Black Swan (-30%) and Stagflation cycles before committing my annual surplus capital gave me absolute peace of mind. The Recharts trajectory curves are ridiculously fast and accurate.",
    helpfulCount: 51,
    timestamp: "3 days ago",
    isVerified: true,
    location: "Mumbai, India"
  },
  {
    id: "rev-6",
    author: "Clara Beauchamp",
    role: "Family Office Director",
    wealthTier: "DIAMOND",
    rating: 5,
    category: "AUTONOMOUS_AI",
    impactMetric: "Zero Human Errors Across 4 Entities",
    title: "The Locked-Gate Approval is what enterprise finance was missing",
    content: "Most AI agents hallucinate or run rogue mutations. Wexa AI's human-in-the-loop verification modal before committing to the MongoDB ledger guarantees complete compliance and security.",
    helpfulCount: 64,
    timestamp: "5 days ago",
    isVerified: true,
    location: "Geneva, Switzerland"
  },
  {
    id: "rev-7",
    author: "Aarav Patel",
    role: "Growth Marketer & Creator",
    wealthTier: "GOLD",
    rating: 5,
    category: "EMERGENCY_BUFFER",
    impactMetric: "₹3.2L Liquid Buffer in 4 Months",
    title: "Multimodal receipt vision is magic on mobile",
    content: "Snapping restaurant invoices and airport bills with instant line-item breakdown directly from Gemini 3.6 Flash saves me at least 4 hours every weekend. Pure joy to use.",
    helpfulCount: 22,
    timestamp: "6 days ago",
    isVerified: true,
    location: "New Delhi, India"
  },
  {
    id: "rev-8",
    author: "Liam O'Connor",
    role: "Fintech Product Lead",
    wealthTier: "PLATINUM",
    rating: 5,
    category: "TAX_SHIELD",
    impactMetric: "£4,800 Capital Gains Optimized",
    title: "Multi-jurisdiction tax engine handled UK vs US effortlessly",
    content: "Having real-time progressive tax schedules for UK, US, Germany, and India under one hood is unprecedented in a personal wealth tool. Effective tax rate calculations are 100% spot on.",
    helpfulCount: 39,
    timestamp: "1 week ago",
    isVerified: true,
    location: "London, UK"
  },
  {
    id: "rev-9",
    author: "Ananya Iyer",
    role: "Management Consultant",
    wealthTier: "PLATINUM",
    rating: 5,
    category: "WEALTH_TIER",
    impactMetric: "Health Score boosted from 64 to 92",
    title: "AI Financial Health Scorecard is my new daily dashboard",
    content: "The 0–100 score gauge with color-coded safety bands and actionable 1-click prescriptions gives me a clearer snapshot of my finances than my private bank manager ever did.",
    helpfulCount: 47,
    timestamp: "1 week ago",
    isVerified: true,
    location: "Hyderabad, India"
  },
  {
    id: "rev-10",
    author: "Benjamin Krause",
    role: "Cloud Architect & CyberSec Specialist",
    wealthTier: "GOLD",
    rating: 5,
    category: "AUTONOMOUS_AI",
    impactMetric: "100% Offline Zero-Trust Sandbox",
    title: "Stytch Passkey + Offline Mode is a masterclass in UX",
    content: "Being able to run institutional simulations without forcing an intrusive login gate, while still offering Stytch biometrics and MongoDB sync when ready, is a breath of fresh air.",
    helpfulCount: 33,
    timestamp: "2 weeks ago",
    isVerified: true,
    location: "Frankfurt, Germany"
  },
  {
    id: "rev-11",
    author: "Rohan Verma",
    role: "High-Frequency Trading Strategist",
    wealthTier: "DIAMOND",
    rating: 5,
    category: "REBALANCING",
    impactMetric: "+19.4% Sharpe Ratio Improvement",
    title: "Covariance matrix and drift triggers are top tier",
    content: "I backtested the target drift rebalancing thresholds against our proprietary desk models. The mathematical elegance of the target asset allocation weights is astonishing.",
    helpfulCount: 58,
    timestamp: "2 weeks ago",
    isVerified: true,
    location: "Singapore"
  },
  {
    id: "rev-12",
    author: "Meera Nambiar",
    role: "Architect & Real Estate Investor",
    wealthTier: "GOLD",
    rating: 5,
    category: "MACRO_STRESS",
    impactMetric: "Saved ₹22L by delaying purchase via Rent vs Buy Simulator",
    title: "Live or Lease calculator prevented a massive mortgage trap",
    content: "The comparative capital growth vs ongoing rental liabilities engine showed me that renting in my current metro area while compounding surplus in equity yielded 2.4x over 10 years.",
    helpfulCount: 41,
    timestamp: "2 weeks ago",
    isVerified: true,
    location: "Kochi, India"
  },
  {
    id: "rev-13",
    author: "Alexander Wright",
    role: "Venture Partner",
    wealthTier: "DIAMOND",
    rating: 5,
    category: "AUTONOMOUS_AI",
    impactMetric: "$2.4M Net Asset Portfolio Tracked",
    title: "Investor Pitch Mode & Evidence Engine are genuinely groundbreaking",
    content: "The verified MRR and ARR telemetry, paired with linear regression trendlines and CSV data exports, make this look and feel like an enterprise Bloomberg terminal for modern operators.",
    helpfulCount: 76,
    timestamp: "3 weeks ago",
    isVerified: true,
    location: "New York, USA"
  },
  {
    id: "rev-14",
    author: "Kavita Reddy",
    role: "Freelance Creative Director",
    wealthTier: "SILVER",
    rating: 5,
    category: "DEBT_PAYOFF",
    impactMetric: "Zero Credit Card Balance in 8 Months",
    title: "Debt Avalanche visualization kept me accountable",
    content: "The month-by-month debt clearance timeline turned what felt like an impossible mountain of credit card bills into a clear, structured roadmap. Down to $0 debt today!",
    helpfulCount: 29,
    timestamp: "3 weeks ago",
    isVerified: true,
    location: "Pune, India"
  },
  {
    id: "rev-15",
    author: "François Dubois",
    role: "E-Commerce Founder",
    wealthTier: "PLATINUM",
    rating: 5,
    category: "TAX_SHIELD",
    impactMetric: "€11,200 Reinvested in Growth",
    title: "Tax deductions & safe-to-spend categories are unmatched",
    content: "Being able to immediately see my post-tax disposable surplus and dynamic safe-to-spend limits stopped my business and personal budget leaks permanently.",
    helpfulCount: 31,
    timestamp: "3 weeks ago",
    isVerified: true,
    location: "Paris, France"
  },
  {
    id: "rev-16",
    author: "Vikram Malhotra",
    role: "Senior VP, Private Equity",
    wealthTier: "DIAMOND",
    rating: 5,
    category: "REBALANCING",
    impactMetric: "Automated Rebalancing Across 8 Asset Classes",
    title: "The D3 Treemap & Spatial 3D projections set a new bar",
    content: "Visualizing our family portfolio asset weights across Equities, Debt, Sovereign Gold, and Liquid Cash on both 2D treemaps and 3D WebGL meshes is visually stunning and functionally supreme.",
    helpfulCount: 68,
    timestamp: "4 weeks ago",
    isVerified: true,
    location: "Dubai, UAE"
  },
  {
    id: "rev-17",
    author: "Sarah Jenkins",
    role: "Data Scientist & AI Researcher",
    wealthTier: "GOLD",
    rating: 5,
    category: "AUTONOMOUS_AI",
    impactMetric: "Real-time Chain-of-Thought logs inspectable",
    title: "GitOps Control Center reasoning logs are pure transparency",
    content: "I love that I can open the reasoning telemetry stream and watch the agent dissect my risk profile, invoke math tools, and formulate delta payloads before prompting me to approve.",
    helpfulCount: 45,
    timestamp: "1 month ago",
    isVerified: true,
    location: "Boston, USA"
  },
  {
    id: "rev-18",
    author: "Aditya Singhania",
    role: "Serial Entrepreneur",
    wealthTier: "PLATINUM",
    rating: 5,
    category: "MACRO_STRESS",
    impactMetric: "+24% CAGR Portfolio Trajectory",
    title: "Autonomous AI Bull Run scenario projection came true",
    content: "Configured the autonomous stress tester 6 months ago with systematic SIP savings. The compound projections and milestone badges kept our executive team disciplined.",
    helpfulCount: 52,
    timestamp: "1 month ago",
    isVerified: true,
    location: "Jaipur, India"
  },
  {
    id: "rev-19",
    author: "Isabella Rossi",
    role: "Corporate Finance Attorney",
    wealthTier: "PLATINUM",
    rating: 5,
    category: "TAX_SHIELD",
    impactMetric: "Audit-ready compliance export in seconds",
    title: "The Executive P&L and monthly report generator is pristine",
    content: "Generating a clean, formatted executive PDF report with full variance analysis and goal tracking saved me hours of manual accounting work at the end of the quarter.",
    helpfulCount: 38,
    timestamp: "1 month ago",
    isVerified: true,
    location: "Milan, Italy"
  },
  {
    id: "rev-20",
    author: "Tanmay Deshmukh",
    role: "Full Stack Engineer & Web3 Builder",
    wealthTier: "SILVER",
    rating: 5,
    category: "WEALTH_TIER",
    impactMetric: "Unlocked 8 Badges & Ranked Top 5%",
    title: "Financial Literacy Command Quiz genuinely taught me wealth mechanics",
    content: "The daily quests, literacy quizzes, and achievement unlock animations turned learning complex macro finance into something as addictive as a strategy game.",
    helpfulCount: 26,
    timestamp: "1 month ago",
    isVerified: true,
    location: "Nagpur, India"
  },
  {
    id: "rev-21",
    author: "Klaus Schneider",
    role: "Renewable Energy Executive",
    wealthTier: "DIAMOND",
    rating: 5,
    category: "REBALANCING",
    impactMetric: "€45,000 Portfolio Drift Corrected",
    title: "The Trinity 4% Safe Withdrawal rule simulator is rock solid",
    content: "Calculating retirement independence milestones with inflation-adjusted safe withdrawal rates showed me exactly when our family reaches sovereign financial velocity.",
    helpfulCount: 61,
    timestamp: "1 month ago",
    isVerified: true,
    location: "Berlin, Germany"
  },
  {
    id: "rev-22",
    author: "Sneha Sen",
    role: "Biotech Project Manager",
    wealthTier: "GOLD",
    rating: 5,
    category: "EMERGENCY_BUFFER",
    impactMetric: "Automated Monthly Surplus Allocation",
    title: "Smart budget categorization finally solved my expense leaks",
    content: "Wexa AI automatically breaks down my income into Needs (50%), Wants (30%), and Wealth Builder (20%) buckets without forcing me to micromanage every single coffee receipt.",
    helpfulCount: 34,
    timestamp: "1 month ago",
    isVerified: true,
    location: "Kolkata, India"
  },
  {
    id: "rev-23",
    author: "William Sterling",
    role: "Hedge Fund Principal",
    wealthTier: "DIAMOND",
    rating: 5,
    category: "MACRO_STRESS",
    impactMetric: "$1.8M Assets Evaluated Across Yield Curves",
    title: "MacroPulse live Google Search grounding gives timely alpha",
    content: "Having Gemini synthesize live rate hike decisions and inflation releases directly against my portfolio asset allocation creates an unfair analytical advantage.",
    helpfulCount: 82,
    timestamp: "1 month ago",
    isVerified: true,
    location: "Chicago, USA"
  },
  {
    id: "rev-24",
    author: "Nisha Varghese",
    role: "Principal Product Designer",
    wealthTier: "PLATINUM",
    rating: 5,
    category: "WEALTH_TIER",
    impactMetric: "Design & UX is 10/10 perfection",
    title: "Highest craftsmanship interface in modern fintech",
    content: "As a product designer, I am blown away by the typography, micro-interactions, dark aesthetic harmony, and zero-latency responsive controls. An absolute masterpiece.",
    helpfulCount: 49,
    timestamp: "1 month ago",
    isVerified: true,
    location: "Chennai, India"
  }
];

export function CommunityReviews() {
  const [reviews, setReviews] = useState<ReviewItem[]>(() => {
    const saved = localStorage.getItem("ww_community_reviews_v2");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= DEFAULT_REVIEWS.length) {
          return parsed;
        }
      } catch (e) {
        console.error("Error parsing reviews:", e);
      }
    }
    return DEFAULT_REVIEWS;
  });

  const [filterCategory, setFilterCategory] = useState<string>("ALL");
  const [filterTier, setFilterTier] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [userLikes, setUserLikes] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem("ww_review_likes");
    return saved ? JSON.parse(saved) : {};
  });

  // New review form state
  const [newAuthor, setNewAuthor] = useState("");
  const [newRole, setNewRole] = useState("");
  const [newTier, setNewTier] = useState<"DIAMOND" | "PLATINUM" | "GOLD" | "SILVER">("GOLD");
  const [newRating, setNewRating] = useState(5);
  const [newCategory, setNewCategory] = useState<ReviewItem["category"]>("REBALANCING");
  const [newImpact, setNewImpact] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newLocation, setNewLocation] = useState("");

  useEffect(() => {
    localStorage.setItem("ww_community_reviews_v2", JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    localStorage.setItem("ww_review_likes", JSON.stringify(userLikes));
  }, [userLikes]);

  const handleLike = (id: string) => {
    const isLiked = userLikes[id];
    setUserLikes(prev => ({ ...prev, [id]: !isLiked }));
    setReviews(prev => prev.map(rev => {
      if (rev.id === id) {
        return {
          ...rev,
          helpfulCount: isLiked ? rev.helpfulCount - 1 : rev.helpfulCount + 1
        };
      }
      return rev;
    }));
  };

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAuthor || !newTitle || !newContent) return;

    const newReview: ReviewItem = {
      id: `rev-${Date.now()}`,
      author: newAuthor,
      role: newRole || "Wealth Strategist",
      wealthTier: newTier,
      rating: newRating,
      category: newCategory,
      impactMetric: newImpact || "+Verified Alpha Execution",
      title: newTitle,
      content: newContent,
      helpfulCount: 1,
      timestamp: "Just now",
      isVerified: true,
      location: newLocation || "Global Investor"
    };

    setReviews(prev => [newReview, ...prev]);
    setIsSubmitModalOpen(false);
    
    // Reset fields
    setNewAuthor("");
    setNewRole("");
    setNewTitle("");
    setNewContent("");
    setNewImpact("");
    setNewLocation("");

    window.dispatchEvent(new CustomEvent('ww-trigger-alert', {
      detail: {
        type: 'success',
        title: 'Review Verified & Published',
        message: 'Your institutional experience has been broadcasted to the WealthWise community ledger.'
      }
    }));
  };

  const filteredReviews = reviews.filter(rev => {
    if (filterCategory !== "ALL" && rev.category !== filterCategory) return false;
    if (filterTier !== "ALL" && rev.wealthTier !== filterTier) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchAuthor = rev.author.toLowerCase().includes(q);
      const matchTitle = rev.title.toLowerCase().includes(q);
      const matchContent = rev.content.toLowerCase().includes(q);
      const matchRole = rev.role.toLowerCase().includes(q);
      const matchLocation = rev.location?.toLowerCase().includes(q) || false;
      if (!matchAuthor && !matchTitle && !matchContent && !matchRole && !matchLocation) return false;
    }
    return true;
  });

  // Calculate Community Metrics
  const totalHelpful = reviews.reduce((a, b) => a + b.helpfulCount, 0);
  const avgRating = (reviews.reduce((a, b) => a + b.rating, 0) / reviews.length).toFixed(1);
  const verifiedCount = reviews.filter(r => r.isVerified).length;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16 font-sans">
      {/* Top Banner / Social Proof Metrics */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-bg-secondary via-bg-card to-bg-void border border-accent-gold/30 p-6 md:p-10 shadow-2xl space-y-6">
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent-gold/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent-cyan/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-gold/10 border border-accent-gold/30 text-accent-gold text-xs font-mono font-bold uppercase tracking-wider">
              <BadgeCheck className="w-4 h-4 text-accent-gold animate-pulse" />
              <span>Verified Institutional & Member Reviews</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-display font-black text-text-primary tracking-tight">
              Community Wealth Intelligence Ledger
            </h2>
            <p className="text-sm md:text-base text-text-secondary leading-relaxed">
              Real-world feedback, alpha yield impact metrics, and portfolio optimization outcomes from quant analysts, founders, surgeons, and family office executives worldwide.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setIsSubmitModalOpen(true)}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-accent-gold via-amber-400 to-accent-gold hover:from-accent-gold/90 hover:to-amber-500 text-slate-950 font-mono font-black text-xs md:text-sm uppercase tracking-wider shadow-lg hover:scale-105 transition-all flex items-center gap-2 cursor-pointer"
            >
              <MessageSquarePlus className="w-4 h-4 text-slate-950" />
              <span>Post Verified Review</span>
            </button>
          </div>
        </div>

        {/* Global Aggregate KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4 pt-4 border-t border-border/60 font-mono">
          <div className="p-4 rounded-2xl bg-bg-void/60 border border-border/80 text-left space-y-1">
            <div className="text-[11px] text-text-muted uppercase">Verified Reviews</div>
            <div className="text-xl md:text-2xl font-black text-text-primary flex items-center gap-1.5">
              <CheckCircle2 className="w-5 h-5 text-accent-emerald" />
              <span>{reviews.length} Audited</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-bg-void/60 border border-border/80 text-left space-y-1">
            <div className="text-[11px] text-text-muted uppercase">Average Satisfaction</div>
            <div className="text-xl md:text-2xl font-black text-accent-gold flex items-center gap-1.5">
              <Star className="w-5 h-5 fill-accent-gold text-accent-gold" />
              <span>{avgRating} / 5.0</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-bg-void/60 border border-border/80 text-left space-y-1">
            <div className="text-[11px] text-text-muted uppercase">Total Helpful Upvotes</div>
            <div className="text-xl md:text-2xl font-black text-accent-cyan flex items-center gap-1.5">
              <ThumbsUp className="w-5 h-5 text-accent-cyan" />
              <span>{totalHelpful}</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-bg-void/60 border border-border/80 text-left space-y-1">
            <div className="text-[11px] text-text-muted uppercase">Global Footprint</div>
            <div className="text-xl md:text-2xl font-black text-purple-400 flex items-center gap-1.5">
              <Globe className="w-5 h-5 text-purple-400" />
              <span>18+ Countries</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-bg-card border border-border/80 font-mono text-xs shadow-sm">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by author, role, city..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-bg-secondary border border-border/80 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-gold/60 text-xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Categories Pills */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {[
            { key: "ALL", label: "All Reviews" },
            { key: "REBALANCING", label: "Rebalancing" },
            { key: "TAX_SHIELD", label: "Tax Shield" },
            { key: "MACRO_STRESS", label: "Macro Stress" },
            { key: "AUTONOMOUS_AI", label: "Autonomous AI" },
            { key: "EMERGENCY_BUFFER", label: "Runway" },
            { key: "DEBT_PAYOFF", label: "Debt Payoff" },
          ].map((cat) => (
            <button
              key={cat.key}
              type="button"
              onClick={() => setFilterCategory(cat.key)}
              className={cn(
                "px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap",
                filterCategory === cat.key
                  ? "bg-accent-gold text-slate-950 shadow-sm"
                  : "bg-bg-secondary/70 border border-border/60 text-text-secondary hover:text-text-primary hover:bg-bg-tertiary"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Reviews Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <AnimatePresence>
          {filteredReviews.map((rev, idx) => {
            const isLiked = userLikes[rev.id];
            return (
              <motion.div
                key={rev.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25, delay: Math.min(idx * 0.04, 0.4) }}
                className="card p-5 md:p-6 bg-gradient-to-br from-bg-secondary/90 via-bg-card to-bg-void border-border/80 hover:border-accent-gold/50 transition-all shadow-md hover:shadow-xl flex flex-col justify-between space-y-4 group rounded-2xl relative overflow-hidden"
              >
                {/* Accent Top Bar */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent-gold/40 via-accent-cyan/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                {/* Author Info & Wealth Tier */}
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-gold/30 to-accent-cyan/30 border border-accent-gold/40 flex items-center justify-center font-bold text-accent-gold text-sm shadow-inner shrink-0">
                        {rev.author.split(" ").map(n => n[0]).join("")}
                      </div>
                      <div>
                        <div className="font-bold text-sm text-text-primary flex items-center gap-1.5">
                          <span>{rev.author}</span>
                          {rev.isVerified && (
                            <span title="Verified Sovereign Member">
                              <CheckCircle2 className="w-3.5 h-3.5 text-accent-emerald shrink-0" />
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-text-muted line-clamp-1">
                          {rev.role}
                        </div>
                        {rev.location && (
                          <div className="text-[10px] text-text-secondary flex items-center gap-1 font-mono">
                            <Globe className="w-2.5 h-2.5 text-accent-gold" />
                            <span>{rev.location}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Tier Badge */}
                    <span className={cn(
                      "px-2 py-0.5 rounded-md text-[9px] font-mono font-bold uppercase tracking-wider border shrink-0",
                      rev.wealthTier === "DIAMOND" ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-300" :
                      rev.wealthTier === "PLATINUM" ? "bg-purple-500/10 border-purple-500/30 text-purple-300" :
                      rev.wealthTier === "GOLD" ? "bg-amber-500/10 border-amber-500/30 text-amber-300" :
                      "bg-slate-500/10 border-slate-500/30 text-slate-300"
                    )}>
                      {rev.wealthTier}
                    </span>
                  </div>

                  {/* Impact Metric Pill */}
                  <div className="p-2 rounded-xl bg-accent-gold/10 border border-accent-gold/25 text-accent-gold font-mono font-bold text-xs flex items-center gap-1.5 shadow-sm">
                    <TrendingUp className="w-3.5 h-3.5 text-accent-gold shrink-0" />
                    <span className="truncate">{rev.impactMetric}</span>
                  </div>
                </div>

                {/* Rating Stars & Title */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "w-3.5 h-3.5",
                          i < rev.rating
                            ? "fill-accent-gold text-accent-gold"
                            : "text-text-muted/40"
                        )}
                      />
                    ))}
                    <span className="text-[10px] font-mono text-text-muted ml-2">{rev.timestamp}</span>
                  </div>
                  <h4 className="font-bold text-sm text-text-primary leading-snug">
                    "{rev.title}"
                  </h4>
                  <p className="text-xs text-text-secondary leading-relaxed font-sans line-clamp-4">
                    {rev.content}
                  </p>
                </div>

                {/* Bottom Helpful Button */}
                <div className="pt-3 border-t border-border/50 flex items-center justify-between font-mono text-xs">
                  <span className="text-[10px] text-text-muted uppercase">
                    Category: <strong className="text-text-primary">{rev.category.replace("_", " ")}</strong>
                  </span>

                  <button
                    type="button"
                    onClick={() => handleLike(rev.id)}
                    className={cn(
                      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-all cursor-pointer text-xs font-bold",
                      isLiked
                        ? "bg-accent-cyan/20 border-accent-cyan text-accent-cyan shadow-sm"
                        : "bg-bg-void border-border/70 text-text-muted hover:text-text-primary hover:border-border"
                    )}
                  >
                    <ThumbsUp className="w-3 h-3" />
                    <span>{rev.helpfulCount} Helpful</span>
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {filteredReviews.length === 0 && (
        <div className="p-12 text-center rounded-2xl bg-bg-card border border-border/80 space-y-3 font-mono">
          <p className="text-text-muted text-sm">No reviews matching the selected filters.</p>
          <button
            onClick={() => { setFilterCategory("ALL"); setFilterTier("ALL"); setSearchQuery(""); }}
            className="text-xs text-accent-gold hover:underline font-bold"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Write Review Modal */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-lg rounded-3xl bg-bg-secondary border border-accent-gold/40 p-6 md:p-8 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-accent-gold" />
                <h3 className="font-display font-bold text-lg text-text-primary">
                  Publish Sovereign Review
                </h3>
              </div>
              <button
                onClick={() => setIsSubmitModalOpen(false)}
                className="p-1.5 rounded-xl text-text-muted hover:text-text-primary hover:bg-bg-tertiary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddReview} className="space-y-4 font-mono text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-text-muted font-bold">Your Name *</label>
                  <input
                    type="text"
                    required
                    value={newAuthor}
                    onChange={(e) => setNewAuthor(e.target.value)}
                    placeholder="e.g. Yash Choubey"
                    className="w-full p-2.5 rounded-xl bg-bg-card border border-border/80 text-text-primary focus:border-accent-gold outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-text-muted font-bold">Professional Role</label>
                  <input
                    type="text"
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    placeholder="e.g. Quant Analyst / Founder"
                    className="w-full p-2.5 rounded-xl bg-bg-card border border-border/80 text-text-primary focus:border-accent-gold outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-text-muted font-bold">Location / City</label>
                  <input
                    type="text"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    placeholder="e.g. Mumbai / San Francisco"
                    className="w-full p-2.5 rounded-xl bg-bg-card border border-border/80 text-text-primary focus:border-accent-gold outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-text-muted font-bold">Wealth Tier</label>
                  <select
                    value={newTier}
                    onChange={(e) => setNewTier(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl bg-bg-card border border-border/80 text-text-primary focus:border-accent-gold outline-none"
                  >
                    <option value="DIAMOND">DIAMOND ($1M+)</option>
                    <option value="PLATINUM">PLATINUM ($250k+)</option>
                    <option value="GOLD">GOLD ($50k+)</option>
                    <option value="SILVER">SILVER ($10k+)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-text-muted font-bold">Core Module Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl bg-bg-card border border-border/80 text-text-primary focus:border-accent-gold outline-none"
                  >
                    <option value="REBALANCING">Asset Rebalancer</option>
                    <option value="TAX_SHIELD">Tax Shield Suite</option>
                    <option value="MACRO_STRESS">Macro Stress Tester</option>
                    <option value="AUTONOMOUS_AI">Autonomous AI Agent</option>
                    <option value="EMERGENCY_BUFFER">Emergency Runway</option>
                    <option value="DEBT_PAYOFF">Debt Acceleration</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-text-muted font-bold">Star Rating</label>
                  <select
                    value={newRating}
                    onChange={(e) => setNewRating(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-bg-card border border-border/80 text-text-primary focus:border-accent-gold outline-none"
                  >
                    <option value={5}>★★★★★ (5/5 Exceptional)</option>
                    <option value={4}>★★★★☆ (4/5 Solid)</option>
                    <option value={3}>★★★☆☆ (3/5 Average)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-text-muted font-bold">Alpha Impact Metric</label>
                <input
                  type="text"
                  value={newImpact}
                  onChange={(e) => setNewImpact(e.target.value)}
                  placeholder="e.g. +$12,400 Tax Drag Eliminated"
                  className="w-full p-2.5 rounded-xl bg-bg-card border border-border/80 text-text-primary focus:border-accent-gold outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-text-muted font-bold">Review Title *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Unlocked 15% better returns with total peace of mind"
                  className="w-full p-2.5 rounded-xl bg-bg-card border border-border/80 text-text-primary focus:border-accent-gold outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-text-muted font-bold">Detailed Review Experience *</label>
                <textarea
                  required
                  rows={4}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Share your detailed feedback on accuracy, speed, and real-world wealth improvements..."
                  className="w-full p-2.5 rounded-xl bg-bg-card border border-border/80 text-text-primary focus:border-accent-gold outline-none resize-none font-sans text-xs"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsSubmitModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-bg-card border border-border text-text-muted hover:text-text-primary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-accent-gold text-slate-950 font-bold hover:bg-accent-gold/90 transition-all shadow-md"
                >
                  Publish to Ledger →
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
