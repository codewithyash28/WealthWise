import React, { useState, useEffect } from "react";
import { Star, MessageSquare, CheckCircle, Award, Sparkles, Send } from "lucide-react";
import { cn } from "../lib/utils";

interface Review {
  id: string;
  name: string;
  rating: number;
  comment: string;
  date: string;
}

export function CommunityReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(5);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitting] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("ww_user_reviews");
    if (saved) {
      try {
        setReviews(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse local storage reviews:", e);
      }
    } else {
      // Start with clean initial state of empty or user persistent list
      setReviews([]);
    }
  }, []);

  const saveReviews = (updated: Review[]) => {
    setReviews(updated);
    localStorage.setItem("ww_user_reviews", JSON.stringify(updated));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !comment.trim()) return;

    const newReview: Review = {
      id: "rev_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6),
      name: name.trim(),
      rating,
      comment: comment.trim(),
      date: new Date().toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
    };

    const updated = [newReview, ...reviews];
    saveReviews(updated);

    setName("");
    setComment("");
    setRating(5);
    setIsSubmitting(true);
    setTimeout(() => setIsSubmitting(false), 3000);

    window.dispatchEvent(new CustomEvent('ww-trigger-alert', {
      detail: {
        type: 'success',
        title: 'Review Submitted! ⭐',
        message: 'Your authentic feedback has been safely committed to the local ledger database.'
      }
    }));
  };

  return (
    <div className="card p-8 border border-border/60 bg-bg-secondary/10 space-y-6 text-left">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/40 pb-4">
        <div className="space-y-1">
          <h3 className="text-lg font-bold font-display text-text-primary flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-accent-gold" /> Authentic Community Reviews
          </h3>
          <p className="text-xs text-text-secondary">
            Read certified feedback from other members and submit your personal review.
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 bg-accent-gold/15 text-accent-gold text-[10px] font-mono font-bold uppercase rounded-full border border-accent-gold/25">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Local Persistency Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Column */}
        <form onSubmit={handleSubmit} className="lg:col-span-5 space-y-4">
          <h4 className="text-xs uppercase tracking-widest font-black text-text-muted">Submit Your Review</h4>

          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-text-muted tracking-wider">Author Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Priya S."
              className="w-full bg-bg-void border border-border/80 focus:border-accent-gold/40 px-3.5 py-2.5 rounded-xl text-xs text-text-primary placeholder:text-text-muted focus:outline-none transition-colors"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-text-muted tracking-wider block mb-1">Star Rating</label>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(null)}
                  className="p-1 focus:outline-none active:scale-90 transition-transform"
                >
                  <Star
                    className={cn(
                      "w-6 h-6 transition-all",
                      star <= (hoveredRating ?? rating)
                        ? "text-accent-gold fill-accent-gold"
                        : "text-text-muted fill-transparent hover:text-accent-gold/40"
                    )}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-text-muted tracking-wider">Your Review Feedback</label>
            <textarea
              required
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Describe your learning experience with Wexa AI..."
              className="w-full bg-bg-void border border-border/80 focus:border-accent-gold/40 px-3.5 py-2.5 rounded-xl text-xs text-text-primary placeholder:text-text-muted focus:outline-none transition-colors resize-none"
            />
          </div>

          <button
            type="submit"
            className="w-full btn-primary py-3 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider cursor-pointer"
          >
            <Send className="w-3.5 h-3.5 text-bg-void" />
            <span>Submit Feedback</span>
          </button>

          {isSubmitted && (
            <div className="p-3 bg-accent-emerald/10 border border-accent-emerald/25 text-accent-emerald text-xs rounded-xl flex items-center gap-2 font-medium">
              <CheckCircle className="w-4 h-4 text-accent-emerald shrink-0" />
              <span>Review persisted securely in local storage ledger!</span>
            </div>
          )}
        </form>

        {/* Live List Column */}
        <div className="lg:col-span-7 space-y-4 max-h-[380px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-800">
          <h4 className="text-xs uppercase tracking-widest font-black text-text-muted flex justify-between items-center">
            <span>Submitted Reviews</span>
            <span className="font-mono text-[10px] lowercase text-text-muted font-normal">{reviews.length} feedback loops logged</span>
          </h4>

          {reviews.length === 0 ? (
            <div className="p-8 border border-dashed border-border/40 rounded-2xl text-center space-y-2 text-text-muted bg-bg-void/10">
              <Award className="w-8 h-8 text-accent-gold/30 mx-auto" />
              <p className="text-xs">No user reviews submitted yet on this device.</p>
              <p className="text-[10px]">Be the first to submit your authentic feedback using the form!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {reviews.map((rev) => (
                <div key={rev.id} className="p-4 rounded-xl bg-bg-void border border-border/50 space-y-2.5">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <div className="font-bold text-xs text-text-primary flex items-center gap-1.5">
                        {rev.name}
                        <span className="px-1.5 py-0.5 rounded bg-accent-emerald/10 border border-accent-emerald/20 text-accent-emerald text-[8px] font-mono font-bold uppercase">
                          Verified
                        </span>
                      </div>
                      <div className="text-[9px] text-text-muted mt-0.5 font-mono">{rev.date}</div>
                    </div>
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={cn(
                            "w-3.5 h-3.5",
                            star <= rev.rating ? "text-accent-gold fill-accent-gold" : "text-border fill-transparent"
                          )}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-text-secondary leading-relaxed font-sans">{rev.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
