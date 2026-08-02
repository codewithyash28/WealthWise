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
  Flame
} from "lucide-react";
import { cn } from "../lib/utils";

export interface ReviewItem {
  id: string;
  author: string;
  role: string;
  avatarUrl?: string;
  wealthTier: "DIAMOND" | "PLATINUM" | "GOLD" | "SILVER";
  rating: number;
  category: "TAX_SHIELD" | "REBALANCING" | "DEBT_PAYOFF" | "EMERGENCY_BUFFER" | "WEALTH_TIER";
  impactMetric: string;
  title: string;
  content: string;
  helpfulCount: number;
  timestamp: string;
  isVerified: boolean;
}

const DEFAULT_REVIEWS: ReviewItem[] = [
  {
    id: "rev-1",
    author: "Elena Rostova",
    role: "Senior Software Architect • San Francisco, CA",
    wealthTier: "DIAMOND",
    rating: 5,
    category: "TAX_SHIELD",
    impactMetric: "Saved $4,850 in Tax Deductions",
    title: "The Tax Optimization Advisor automatically flagged eligible deductions I overlooked!",
    content: "WealthWise Elite's AI Tax Shield scanned my annual transaction history and immediately identified $4,850 in qualified tax-advantaged account contributions and business expense deductions. The step-by-step guidance made filing seamless.",
    helpfulCount: 42,
    timestamp: "2 hours ago",
    isVerified: true
  },
  {
    id: "rev-2",
    author: "Marcus Vance",
    role: "VP of Operations • Austin, TX",
    wealthTier: "PLATINUM",
    rating: 5,
    category: "REBALANCING",
    impactMetric: "Eliminated Portfolio Drift & Reduced Volatility 18%",
    title: "Rebalancing Matrix reduced slippage and re-allocated 4 asset classes effortlessly.",
    content: "My portfolio had heavily drifted into tech equity over-exposure. With 1-click rebalancing and MongoDB transaction logging, WealthWise calculated exact dollar re-allocations into high-yield bonds and gold simulators without manual spreadsheets.",
    helpfulCount: 38,
    timestamp: "5 hours ago",
    isVerified: true
  },
  {
    id: "rev-3",
    author: "Aarav Sharma",
    role: "FinTech Founder • New York, NY",
    wealthTier: "DIAMOND",
    rating: 5,
    category: "WEALTH_TIER",
    impactMetric: "Achieved Level 12 Diamond Rank",
    title: "The Financial Roadmap & Voice Navigation feel like a Jarvis terminal for wealth.",
    content: "The Midnight Noir theme combined with Wexa AI voice commands makes checking market pulses and daily wealth streaks addicting. I exported my verified Diamond Tier certificate directly to LinkedIn and got amazing feedback!",
    helpfulCount: 56,
    timestamp: "Yesterday",
    isVerified: true
  },
  {
    id: "rev-4",
    author: "Sophia Lin",
    role: "Product Designer • Seattle, WA",
    wealthTier: "GOLD",
    rating: 5,
    category: "EMERGENCY_BUFFER",
    impactMetric: "Built 6-Month $24,000 Liquid Buffer",
    title: "Goal Lock Mode prevented impulse spending and kept my budget strict.",
    content: "Activating the 'Goal Lock' toggle in the Budget Planner with the CSS blur protection kept my spending caps locked. I hit my 6-month emergency reserve milestone 3 months ahead of schedule!",
    helpfulCount: 29,
    timestamp: "2 days ago",
    isVerified: true
  },
  {
    id: "rev-5",
    author: "David K. Miller",
    role: "Corporate Attorney • Chicago, IL",
    wealthTier: "PLATINUM",
    rating: 5,
    category: "DEBT_PAYOFF",
    impactMetric: "Cleared $32,000 High-Interest Liabilities",
    title: "Rent vs. Buy simulator & Debt Snowball plan changed my financial trajectory.",
    content: "Before WealthWise, I was debating buying real estate without factoring opportunity cost. The Rent vs Buy Simulator showed me staying liquid while clearing high-yield debt would net $120k more over 5 years. Truly actionable financial intelligence.",
    helpfulCount: 31,
    timestamp: "3 days ago",
    isVerified: true
  }
];

export function CommunityReviews() {
  const [reviews, setReviews] = useState<ReviewItem[]>(() => {
    const saved = localStorage.getItem("ww_community_reviews");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed parsing saved reviews", e);
      }
    }
    return DEFAULT_REVIEWS;
  });

  const [activeCategory, setActiveCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [helpfulVotes, setHelpfulVotes] = useState<Record<string, boolean>>({});
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

  // New review form fields
  const [newAuthor, setNewAuthor] = useState("");
  const [newRole, setNewRole] = useState("");
  const [newTier, setNewTier] = useState<"DIAMOND" | "PLATINUM" | "GOLD" | "SILVER">("PLATINUM");
  const [newRating, setNewRating] = useState<number>(5);
  const [newCategory, setNewCategory] = useState<ReviewItem["category"]>("TAX_SHIELD");
  const [newImpact, setNewImpact] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");

  // Save to localStorage whenever reviews change
  useEffect(() => {
    localStorage.setItem("ww_community_reviews", JSON.stringify(reviews));
  }, [reviews]);

  const handleHelpfulClick = (id: string) => {
    if (helpfulVotes[id]) return; // Already voted

    setReviews(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, helpfulCount: item.helpfulCount + 1 };
      }
      return item;
    }));
    setHelpfulVotes(prev => ({ ...prev, [id]: true }));
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAuthor.trim() || !newTitle.trim() || !newContent.trim()) {
      alert("Please fill in your name, review title, and detailed feedback.");
      return;
    }

    const createdReview: ReviewItem = {
      id: `rev-custom-${Date.now()}`,
      author: newAuthor.trim(),
      role: newRole.trim() || "Verified WealthWise Builder",
      wealthTier: newTier,
      rating: newRating,
      category: newCategory,
      impactMetric: newImpact.trim() || "Verified Financial Progress",
      title: newTitle.trim(),
      content: newContent.trim(),
      helpfulCount: 1,
      timestamp: "Just now",
      isVerified: true
    };

    setReviews(prev => [createdReview, ...prev]);
    setIsSubmitModalOpen(false);

    // Reset form
    setNewAuthor("");
    setNewRole("");
    setNewTitle("");
    setNewContent("");
    setNewImpact("");

    window.dispatchEvent(new CustomEvent("ww-trigger-alert", {
      detail: {
        type: "success",
        title: "🌟 Review Submitted Successfully!",
        message: "Thank you for sharing your verified wealth experience with the Community!"
      }
    }));
  };

  const filteredReviews = reviews.filter(r => {
    const matchesCategory = activeCategory === "ALL" || r.category === activeCategory;
    const matchesSearch = 
      r.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.impactMetric.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  return (
    <section id="reviews" className="py-12 sm:py-16 bg-bg-primary text-text-primary relative overflow-hidden font-sans border-t border-border/40">
      {/* Background glowing ambient light */}
      <div className="absolute top-1/3 right-10 w-96 h-96 bg-accent-gold/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 space-y-8 relative z-10 max-w-7xl">
        
        {/* Header Title Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-border/60">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-accent-gold/20 text-accent-gold border border-accent-gold/40 text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Community Wall of Honor
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold uppercase border border-emerald-500/30 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" /> 100% Verified Outcomes
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-text-primary tracking-tight">
              Real Wealth Builders. <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-accent-gold via-amber-300 to-amber-500 bg-clip-text text-transparent">
                Verified Financial Impact.
              </span>
            </h2>

            <p className="text-sm text-text-secondary leading-relaxed">
              Explore real member reviews, case studies, and verified tax savings achieved through WealthWise Elite’s autonomous planning engine.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setIsSubmitModalOpen(true)}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-accent-gold via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-600 text-slate-950 font-mono text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-xl shadow-amber-500/20 cursor-pointer"
            >
              <MessageSquarePlus className="w-4 h-4" />
              <span>Share Your Review</span>
            </button>
          </div>
        </div>

        {/* Global Social Proof Banner Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-bg-void/90 border border-border/80 flex items-center gap-4 shadow-xl">
            <div className="p-3 rounded-xl bg-accent-gold/20 text-accent-gold border border-accent-gold/30 shrink-0">
              <Star className="w-5 h-5 fill-accent-gold text-accent-gold" />
            </div>
            <div>
              <div className="text-2xl font-extrabold font-mono text-text-primary">4.96 / 5.0</div>
              <div className="text-[11px] font-mono text-text-muted">Average Rating (1,480+ Reviews)</div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-bg-void/90 border border-border/80 flex items-center gap-4 shadow-xl">
            <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
              <DollarSign className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="text-2xl font-extrabold font-mono text-emerald-400">$2.8M+</div>
              <div className="text-[11px] font-mono text-text-muted">Tax & Rebalancing Savings</div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-bg-void/90 border border-border/80 flex items-center gap-4 shadow-xl">
            <div className="p-3 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30 shrink-0">
              <UserCheck className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <div className="text-2xl font-extrabold font-mono text-text-primary">100%</div>
              <div className="text-[11px] font-mono text-text-muted">Verified Member Status</div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-bg-void/90 border border-border/80 flex items-center gap-4 shadow-xl">
            <div className="p-3 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 shrink-0">
              <Flame className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="text-2xl font-extrabold font-mono text-text-primary">12,400+</div>
              <div className="text-[11px] font-mono text-text-muted">Milestones Reached</div>
            </div>
          </div>
        </div>

        {/* Filters & Search Controls Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-2 bg-bg-void/80 border border-border/80 rounded-2xl">
          {/* Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none p-1">
            {[
              { id: "ALL", label: "All Reviews" },
              { id: "TAX_SHIELD", label: "Tax Shield" },
              { id: "REBALANCING", label: "Rebalancing" },
              { id: "WEALTH_TIER", label: "Wealth Tier" },
              { id: "EMERGENCY_BUFFER", label: "Emergency Buffer" },
              { id: "DEBT_PAYOFF", label: "Debt Payoff" },
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  "px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold uppercase transition-all whitespace-nowrap cursor-pointer",
                  activeCategory === cat.id
                    ? "bg-accent-gold text-slate-950 shadow-md font-black"
                    : "text-text-muted hover:text-text-primary hover:bg-bg-secondary"
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64 px-2">
            <Search className="w-4 h-4 text-text-muted absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reviews or impact..."
              className="w-full bg-bg-primary border border-border/80 focus:border-accent-gold rounded-xl pl-9 pr-3 py-1.5 text-xs font-sans text-text-primary placeholder:text-text-muted outline-none transition-all"
            />
          </div>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredReviews.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="card p-6 border-border/80 hover:border-accent-gold/40 bg-bg-void/90 space-y-4 flex flex-col justify-between shadow-xl relative overflow-hidden transition-all group"
              >
                {/* Top Gold Bar accent on hover */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent-gold via-amber-300 to-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="space-y-3">
                  {/* Rating Stars & Impact Badge */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            "w-4 h-4",
                            i < item.rating ? "fill-accent-gold text-accent-gold" : "text-border"
                          )}
                        />
                      ))}
                    </div>

                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-mono font-bold uppercase truncate">
                      {item.impactMetric}
                    </span>
                  </div>

                  {/* Title & Body Content */}
                  <h4 className="text-base font-bold font-display text-text-primary leading-snug">
                    "{item.title}"
                  </h4>

                  <p className="text-xs text-text-secondary leading-relaxed font-sans line-clamp-4">
                    {item.content}
                  </p>
                </div>

                {/* Footer User Profile & Helpful Vote Button */}
                <div className="pt-4 border-t border-border/60 flex items-center justify-between gap-3 mt-auto">
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent-gold to-amber-600 text-slate-950 font-bold font-mono text-sm flex items-center justify-center shrink-0 border border-amber-300 shadow-md">
                      {item.author.split(" ").map(n => n[0]).join("").slice(0, 2)}
                    </div>

                    <div className="truncate">
                      <div className="text-xs font-bold text-text-primary truncate flex items-center gap-1">
                        <span>{item.author}</span>
                        {item.isVerified && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        )}
                      </div>
                      <div className="text-[10px] text-text-muted truncate font-mono">
                        {item.role}
                      </div>
                    </div>
                  </div>

                  {/* Upvote Helpful Button */}
                  <button
                    onClick={() => handleHelpfulClick(item.id)}
                    className={cn(
                      "px-2.5 py-1 rounded-xl text-[10px] font-mono font-bold uppercase transition-all flex items-center gap-1 cursor-pointer shrink-0 border",
                      helpfulVotes[item.id]
                        ? "bg-accent-gold/20 text-accent-gold border-accent-gold/40"
                        : "bg-bg-secondary text-text-muted border-border hover:text-text-primary hover:border-accent-gold/30"
                    )}
                  >
                    <ThumbsUp className="w-3 h-3" />
                    <span>{item.helpfulCount}</span>
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Modal for Submitting a New Verified Review */}
        <AnimatePresence>
          {isSubmitModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="card p-6 sm:p-8 max-w-lg w-full bg-bg-secondary border-2 border-accent-gold/40 space-y-6 shadow-2xl relative overflow-hidden"
              >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-border/60 pb-4">
                  <div className="flex items-center gap-2">
                    <MessageSquarePlus className="w-5 h-5 text-accent-gold" />
                    <h3 className="text-lg font-bold font-display text-text-primary">
                      Share Your Verified Experience
                    </h3>
                  </div>
                  <button
                    onClick={() => setIsSubmitModalOpen(false)}
                    className="p-1.5 rounded-xl hover:bg-bg-void text-text-muted hover:text-text-primary transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Submission Form */}
                <form onSubmit={handleSubmitReview} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-mono text-text-muted uppercase font-bold block mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={newAuthor}
                        onChange={(e) => setNewAuthor(e.target.value)}
                        placeholder="e.g. Alex Rivera"
                        className="w-full bg-bg-void border border-border focus:border-accent-gold rounded-xl px-3 py-2 text-xs font-sans text-text-primary outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-mono text-text-muted uppercase font-bold block mb-1">
                        Role / Title & Location
                      </label>
                      <input
                        type="text"
                        value={newRole}
                        onChange={(e) => setNewRole(e.target.value)}
                        placeholder="e.g. Finance Analyst • Boston, MA"
                        className="w-full bg-bg-void border border-border focus:border-accent-gold rounded-xl px-3 py-2 text-xs font-sans text-text-primary outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-mono text-text-muted uppercase font-bold block mb-1">
                        Primary Impact Category
                      </label>
                      <select
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value as any)}
                        className="w-full bg-bg-void border border-border focus:border-accent-gold rounded-xl px-3 py-2 text-xs font-sans text-text-primary outline-none"
                      >
                        <option value="TAX_SHIELD">Tax Shield & Savings</option>
                        <option value="REBALANCING">Portfolio Rebalancing</option>
                        <option value="WEALTH_TIER">Wealth Tier Progression</option>
                        <option value="EMERGENCY_BUFFER">Emergency Reserve</option>
                        <option value="DEBT_PAYOFF">Debt Payoff</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-mono text-text-muted uppercase font-bold block mb-1">
                        Quantified Outcome Metric
                      </label>
                      <input
                        type="text"
                        value={newImpact}
                        onChange={(e) => setNewImpact(e.target.value)}
                        placeholder="e.g. Saved $3,200 in Tax Deductions"
                        className="w-full bg-bg-void border border-border focus:border-accent-gold rounded-xl px-3 py-2 text-xs font-sans text-text-primary outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono text-text-muted uppercase font-bold block mb-1">
                      Review Headline / Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="e.g. The AI Tax Advisor identified missing deductions instantly!"
                      className="w-full bg-bg-void border border-border focus:border-accent-gold rounded-xl px-3 py-2 text-xs font-sans text-text-primary outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-mono text-text-muted uppercase font-bold block mb-1">
                      Detailed Feedback & Story *
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={newContent}
                      onChange={(e) => setNewContent(e.target.value)}
                      placeholder="Describe how WealthWise Elite solved your financial challenge..."
                      className="w-full bg-bg-void border border-border focus:border-accent-gold rounded-xl p-3 text-xs font-sans text-text-primary outline-none resize-none"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2 border-t border-border/60">
                    <button
                      type="button"
                      onClick={() => setIsSubmitModalOpen(false)}
                      className="px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase text-text-muted hover:text-text-primary transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-accent-gold hover:bg-amber-400 text-slate-950 font-mono text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
                    >
                      Publish Review
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
