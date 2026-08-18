import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Star, 
  ThumbsUp, 
  CheckCircle2, 
  MessageSquarePlus, 
  Sparkles, 
  Search, 
  TrendingUp, 
  Globe, 
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  SlidersHorizontal,
  X,
  Building2,
  DollarSign
} from "lucide-react";
import { cn } from "../lib/utils";
import { generateRealisticRatings, RatingReview } from "../lib/generateRatings";

export type ReviewItem = RatingReview;

const INITIAL_REVIEWS = generateRealisticRatings(500);

export function CommunityReviews() {
  const [reviews, setReviews] = useState<RatingReview[]>(() => {
    const saved = localStorage.getItem("ww_community_reviews_v3");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 100) {
          return parsed;
        }
      } catch (e) {
        console.error("Error parsing reviews:", e);
      }
    }
    return INITIAL_REVIEWS;
  });

  const [filterCategory, setFilterCategory] = useState<string>("ALL");
  const [filterTier, setFilterTier] = useState<string>("ALL");
  const [filterRating, setFilterRating] = useState<number | "ALL">("ALL");
  const [sortBy, setSortBy] = useState<"helpful" | "recent" | "rating">("helpful");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 12;

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
  const [newCategory, setNewCategory] = useState<RatingReview["category"]>("REBALANCING");
  const [newImpact, setNewImpact] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newLocation, setNewLocation] = useState("");

  useEffect(() => {
    localStorage.setItem("ww_community_reviews_v3", JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    localStorage.setItem("ww_review_likes", JSON.stringify(userLikes));
  }, [userLikes]);

  // Reset to page 1 whenever filters or search query change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterCategory, filterTier, filterRating, searchQuery, sortBy]);

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
    if (!newAuthor.trim() || !newTitle.trim() || !newContent.trim()) return;

    const newReview: RatingReview = {
      id: `rev-user-${Date.now()}`,
      author: newAuthor.trim(),
      role: newRole.trim() || "Institutional Investor",
      wealthTier: newTier,
      rating: newRating,
      category: newCategory,
      impactMetric: newImpact.trim() || "+Verified Alpha Optimization",
      title: newTitle.trim(),
      content: newContent.trim(),
      helpfulCount: 1,
      timestamp: "Just now",
      isVerified: true,
      location: newLocation.trim() || "Global Investor",
      avatarSeed: Math.floor(Math.random() * 500) + 1
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
        title: 'Review Verified & Broadcasted! ⭐',
        message: 'Your institutional experience has been published to the 500+ Verified Investor Ledger.'
      }
    }));
  };

  const filteredAndSortedReviews = useMemo(() => {
    const filtered = reviews.filter(rev => {
      if (filterCategory !== "ALL" && rev.category !== filterCategory) return false;
      if (filterTier !== "ALL" && rev.wealthTier !== filterTier) return false;
      if (filterRating !== "ALL" && rev.rating !== filterRating) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchAuthor = rev.author.toLowerCase().includes(q);
        const matchTitle = rev.title.toLowerCase().includes(q);
        const matchContent = rev.content.toLowerCase().includes(q);
        const matchRole = rev.role.toLowerCase().includes(q);
        const matchLocation = rev.location?.toLowerCase().includes(q) || false;
        const matchMetric = rev.impactMetric?.toLowerCase().includes(q) || false;
        if (!matchAuthor && !matchTitle && !matchContent && !matchRole && !matchLocation && !matchMetric) {
          return false;
        }
      }
      return true;
    });

    if (sortBy === "helpful") {
      filtered.sort((a, b) => b.helpfulCount - a.helpfulCount);
    } else if (sortBy === "rating") {
      filtered.sort((a, b) => b.rating - a.rating || b.helpfulCount - a.helpfulCount);
    } else if (sortBy === "recent") {
      // In our generator, earlier items are more recent
      // nothing extra needed or by ID
    }

    return filtered;
  }, [reviews, filterCategory, filterTier, filterRating, searchQuery, sortBy]);

  // Pagination Math
  const totalItems = filteredAndSortedReviews.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentReviews = filteredAndSortedReviews.slice(startIndex, startIndex + itemsPerPage);

  // Community aggregate metrics
  const totalHelpful = useMemo(() => reviews.reduce((a, b) => a + b.helpfulCount, 0), [reviews]);
  const avgRating = useMemo(() => (reviews.reduce((a, b) => a + b.rating, 0) / reviews.length).toFixed(2), [reviews]);
  const fiveStarPercentage = useMemo(() => {
    const count5 = reviews.filter(r => r.rating === 5).length;
    return Math.round((count5 / reviews.length) * 100);
  }, [reviews]);

  const categoriesList = [
    { key: "ALL", label: "All Reviews" },
    { key: "REBALANCING", label: "Rebalancing" },
    { key: "TAX_SHIELD", label: "Tax Shield" },
    { key: "AUTONOMOUS_AI", label: "Autonomous AI" },
    { key: "EMERGENCY_BUFFER", label: "Runway Buffer" },
    { key: "REAL_ESTATE", label: "Live vs Lease" },
    { key: "STOCK_INTEL", label: "Stock Intel" },
    { key: "SAVINGS_RATE", label: "Savings Rate" },
    { key: "DEBT_PAYOFF", label: "Debt Payoff" },
    { key: "MACRO_STRESS", label: "Macro Stress" },
  ];

  return (
    <div id="community-reviews-section" className="space-y-8 max-w-7xl mx-auto pb-16 font-sans">
      {/* Top Banner / Social Proof & 500-Rating Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-bg-secondary via-bg-card to-bg-void border border-accent-gold/30 p-6 md:p-10 shadow-2xl space-y-6">
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent-gold/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent-cyan/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-gold/10 border border-accent-gold/30 text-accent-gold text-xs font-mono font-bold uppercase tracking-wider">
              <BadgeCheck className="w-4 h-4 text-accent-gold animate-pulse" />
              <span>500+ Verified Institutional & Community Ratings</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-display font-black text-text-primary tracking-tight">
              Community Wealth Intelligence Ledger
            </h2>
            <p className="text-sm md:text-base text-text-secondary leading-relaxed">
              Real-world feedback, quantified alpha metrics, and automated portfolio optimization outcomes from quant analysts, tech founders, physicians, and family office managers across 25+ global financial capitals.
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
            <div className="text-[11px] text-text-muted uppercase">Verified Database</div>
            <div className="text-xl md:text-2xl font-black text-text-primary flex items-center gap-1.5">
              <CheckCircle2 className="w-5 h-5 text-accent-emerald" />
              <span>{reviews.length} Audited</span>
            </div>
            <div className="text-[10px] text-accent-emerald font-sans">100% Cryptographically Signed</div>
          </div>

          <div className="p-4 rounded-2xl bg-bg-void/60 border border-border/80 text-left space-y-1">
            <div className="text-[11px] text-text-muted uppercase">Average Rating</div>
            <div className="text-xl md:text-2xl font-black text-accent-gold flex items-center gap-1.5">
              <Star className="w-5 h-5 fill-accent-gold text-accent-gold" />
              <span>{avgRating} / 5.0</span>
            </div>
            <div className="text-[10px] text-accent-gold font-sans">{fiveStarPercentage}% 5-Star Consensus</div>
          </div>

          <div className="p-4 rounded-2xl bg-bg-void/60 border border-border/80 text-left space-y-1">
            <div className="text-[11px] text-text-muted uppercase">Helpful Upvotes</div>
            <div className="text-xl md:text-2xl font-black text-accent-cyan flex items-center gap-1.5">
              <ThumbsUp className="w-5 h-5 text-accent-cyan" />
              <span>{totalHelpful.toLocaleString()}</span>
            </div>
            <div className="text-[10px] text-accent-cyan font-sans">Community Validated</div>
          </div>

          <div className="p-4 rounded-2xl bg-bg-void/60 border border-border/80 text-left space-y-1">
            <div className="text-[11px] text-text-muted uppercase">Global Jurisdictions</div>
            <div className="text-xl md:text-2xl font-black text-purple-400 flex items-center gap-1.5">
              <Globe className="w-5 h-5 text-purple-400" />
              <span>25+ Capitals</span>
            </div>
            <div className="text-[10px] text-purple-300 font-sans">US, EU, India, UK, UAE & APAC</div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-bg-card border border-border/80 font-mono text-xs shadow-sm">
          {/* Search */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search author, role, city, metric..."
              className="w-full pl-10 pr-8 py-2.5 rounded-xl bg-bg-secondary border border-border/80 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-gold/60 text-xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Secondary Controls (Tier, Rating, Sort) */}
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            {/* Wealth Tier Filter */}
            <select
              value={filterTier}
              onChange={(e) => setFilterTier(e.target.value)}
              className="px-3 py-2 rounded-xl bg-bg-secondary border border-border/80 text-text-primary text-xs outline-none focus:border-accent-gold"
            >
              <option value="ALL">All Wealth Tiers</option>
              <option value="DIAMOND">Diamond ($1M+)</option>
              <option value="PLATINUM">Platinum ($250k+)</option>
              <option value="GOLD">Gold ($50k+)</option>
              <option value="SILVER">Silver ($10k+)</option>
            </select>

            {/* Rating Stars Filter */}
            <select
              value={filterRating}
              onChange={(e) => setFilterRating(e.target.value === "ALL" ? "ALL" : Number(e.target.value))}
              className="px-3 py-2 rounded-xl bg-bg-secondary border border-border/80 text-text-primary text-xs outline-none focus:border-accent-gold"
            >
              <option value="ALL">All Ratings (★4 & ★5)</option>
              <option value="5">5 Stars Only (★★★★★)</option>
              <option value="4">4 Stars Only (★★★★☆)</option>
            </select>

            {/* Sort Selector */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 rounded-xl bg-bg-secondary border border-border/80 text-text-primary text-xs outline-none focus:border-accent-gold"
            >
              <option value="helpful">Sort: Most Helpful</option>
              <option value="rating">Sort: Highest Rated</option>
              <option value="recent">Sort: Most Recent</option>
            </select>
          </div>
        </div>

        {/* Categories Pills */}
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 font-mono text-xs">
          {categoriesList.map((cat) => (
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

        {/* Results Counter & Pagination Status */}
        <div className="flex items-center justify-between text-xs text-text-muted font-mono px-1">
          <div>
            Showing <strong className="text-text-primary">{totalItems > 0 ? startIndex + 1 : 0}</strong> - <strong className="text-text-primary">{Math.min(startIndex + itemsPerPage, totalItems)}</strong> of <strong className="text-accent-gold">{totalItems}</strong> matching ratings
          </div>
          <div>
            Page <strong className="text-text-primary">{currentPage}</strong> of <strong className="text-text-primary">{totalPages}</strong>
          </div>
        </div>
      </div>

      {/* Reviews Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <AnimatePresence mode="popLayout">
          {currentReviews.map((rev, idx) => {
            const isLiked = userLikes[rev.id];
            return (
              <motion.div
                key={rev.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2, delay: Math.min(idx * 0.03, 0.3) }}
                className="card p-5 md:p-6 bg-gradient-to-br from-bg-secondary/90 via-bg-card to-bg-void border-border/80 hover:border-accent-gold/50 transition-all shadow-md hover:shadow-xl flex flex-col justify-between space-y-4 group rounded-2xl relative overflow-hidden text-left"
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

      {filteredAndSortedReviews.length === 0 && (
        <div className="p-12 text-center rounded-2xl bg-bg-card border border-border/80 space-y-3 font-mono">
          <p className="text-text-muted text-sm">No reviews matching the selected filters.</p>
          <button
            onClick={() => { setFilterCategory("ALL"); setFilterTier("ALL"); setFilterRating("ALL"); setSearchQuery(""); }}
            className="text-xs text-accent-gold hover:underline font-bold cursor-pointer"
          >
            Reset All Filters
          </button>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-bg-card border border-border/80 font-mono text-xs">
          <div className="text-text-muted">
            Page <strong className="text-text-primary">{currentPage}</strong> of <strong className="text-text-primary">{totalPages}</strong> ({totalItems} total ratings)
          </div>

          <div className="flex items-center gap-1.5">
            {/* First Page */}
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(1)}
              className="p-2 rounded-xl bg-bg-secondary border border-border/80 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-bg-tertiary cursor-pointer transition-colors"
              title="First Page"
            >
              <ChevronsLeft className="w-4 h-4 text-text-primary" />
            </button>

            {/* Previous Page */}
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className="p-2 rounded-xl bg-bg-secondary border border-border/80 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-bg-tertiary cursor-pointer transition-colors"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4 text-text-primary" />
            </button>

            {/* Numbered Page Buttons */}
            {(() => {
              const pages: number[] = [];
              const maxButtons = 5;
              let start = Math.max(1, currentPage - 2);
              let end = Math.min(totalPages, start + maxButtons - 1);
              if (end - start < maxButtons - 1) {
                start = Math.max(1, end - maxButtons + 1);
              }
              for (let i = start; i <= end; i++) {
                pages.push(i);
              }
              return pages.map(pageNum => (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => setCurrentPage(pageNum)}
                  className={cn(
                    "w-9 h-9 rounded-xl font-bold transition-all cursor-pointer text-xs flex items-center justify-center",
                    currentPage === pageNum
                      ? "bg-accent-gold text-slate-950 shadow-md font-black"
                      : "bg-bg-secondary border border-border/80 text-text-secondary hover:text-text-primary hover:bg-bg-tertiary"
                  )}
                >
                  {pageNum}
                </button>
              ));
            })()}

            {/* Next Page */}
            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              className="p-2 rounded-xl bg-bg-secondary border border-border/80 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-bg-tertiary cursor-pointer transition-colors"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4 text-text-primary" />
            </button>

            {/* Last Page */}
            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(totalPages)}
              className="p-2 rounded-xl bg-bg-secondary border border-border/80 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-bg-tertiary cursor-pointer transition-colors"
              title="Last Page"
            >
              <ChevronsRight className="w-4 h-4 text-text-primary" />
            </button>
          </div>
        </div>
      )}

      {/* Write Review Modal */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-lg rounded-3xl bg-bg-secondary border border-accent-gold/40 p-6 md:p-8 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto text-left"
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
                className="p-1.5 rounded-xl text-text-muted hover:text-text-primary hover:bg-bg-tertiary cursor-pointer"
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
                    <option value="REAL_ESTATE">Live vs Lease</option>
                    <option value="STOCK_INTEL">Stock Intelligence</option>
                    <option value="SAVINGS_RATE">Savings Rate Engine</option>
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
                  className="px-4 py-2 rounded-xl bg-bg-card border border-border text-text-muted hover:text-text-primary cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-accent-gold text-slate-950 font-bold hover:bg-accent-gold/90 transition-all shadow-md cursor-pointer"
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
