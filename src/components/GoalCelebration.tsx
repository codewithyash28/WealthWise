import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Trophy, Sparkles, PartyPopper, CheckCircle2, Star, Award, X } from "lucide-react";

export function GoalCelebrationOverlay() {
  const [eventData, setEventData] = useState<{ title: string; message: string; targetAmount?: number } | null>(null);

  useEffect(() => {
    const handleCelebration = (e: any) => {
      if (e.detail) {
        setEventData({
          title: e.detail.title || "Goal Reached! 🎉",
          message: e.detail.message || "Congratulations on reaching your financial milestone!",
          targetAmount: e.detail.targetAmount
        });

        // Trigger confetti particle explosion
        triggerCanvasConfetti();
      }
    };

    window.addEventListener("ww-trigger-celebration", handleCelebration);
    return () => window.removeEventListener("ww-trigger-celebration", handleCelebration);
  }, []);

  const triggerCanvasConfetti = () => {
    const canvas = document.createElement("canvas");
    canvas.style.position = "fixed";
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.style.width = "100vw";
    canvas.style.height = "100vh";
    canvas.style.pointerEvents = "none";
    canvas.style.zIndex = "99999";
    document.body.appendChild(canvas);

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      rotation: number;
      vRot: number;
      alpha: number;
    }> = [];

    const colors = ["#f0b429", "#10b981", "#3b82f6", "#ec4899", "#8b5cf6", "#f59e0b", "#06b6d4"];

    for (let i = 0; i < 150; i++) {
      particles.push({
        x: canvas.width / 2,
        y: canvas.height / 2 - 50,
        vx: (Math.random() - 0.5) * 18,
        vy: (Math.random() - 0.7) * 18,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        vRot: (Math.random() - 0.5) * 10,
        alpha: 1,
      });
    }

    let animationFrameId: number;
    let startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.25; // gravity
        p.rotation += p.vRot;
        if (elapsed > 1500) p.alpha -= 0.02;

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      });

      if (elapsed < 3000) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        if (document.body.contains(canvas)) {
          document.body.removeChild(canvas);
        }
      }
    };

    animate();
  };

  if (!eventData) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bg-void/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          className="bg-gradient-to-b from-bg-secondary via-zinc-900 to-bg-secondary border-2 border-accent-gold/60 shadow-2xl rounded-3xl p-8 max-w-md w-full text-center space-y-6 relative overflow-hidden"
        >
          {/* Subtle glowing backdrop circle */}
          <div className="absolute -top-12 -left-12 w-48 h-48 bg-accent-gold/20 rounded-full blur-[60px] pointer-events-none" />
          <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-emerald-500/20 rounded-full blur-[60px] pointer-events-none" />

          <button
            onClick={() => setEventData(null)}
            className="absolute top-4 right-4 p-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-bg-void/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Trophy Icon */}
          <div className="relative inline-block">
            <div className="w-20 h-20 rounded-3xl bg-accent-gold/15 border-2 border-accent-gold/50 flex items-center justify-center mx-auto text-accent-gold shadow-xl shadow-accent-gold/20 animate-bounce">
              <Trophy className="w-10 h-10" />
            </div>
            <div className="absolute -top-2 -right-2 p-1.5 bg-emerald-500 rounded-full text-bg-void shadow-lg">
              <Sparkles className="w-4 h-4 fill-bg-void" />
            </div>
          </div>

          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full bg-accent-gold/20 border border-accent-gold/40 text-accent-gold text-[11px] font-mono font-bold uppercase tracking-widest">
              Financial Goal Unlocked
            </span>
            <h2 className="text-2xl font-black font-display text-text-primary">{eventData.title}</h2>
            <p className="text-xs text-text-secondary leading-relaxed font-mono">
              {eventData.message}
            </p>
          </div>

          {eventData.targetAmount && (
            <div className="p-4 rounded-2xl bg-bg-void/80 border border-accent-gold/30 font-mono">
              <span className="text-[10px] text-text-muted uppercase tracking-wider block">Target Milestone Achieved</span>
              <span className="text-2xl font-black text-emerald-400 mt-1 block">
                ${eventData.targetAmount.toLocaleString()}
              </span>
            </div>
          )}

          <div className="pt-2">
            <button
              onClick={() => setEventData(null)}
              className="w-full py-3 rounded-2xl bg-accent-gold text-bg-void font-mono font-black text-xs uppercase tracking-wider hover:opacity-95 transition-opacity cursor-pointer shadow-lg shadow-accent-gold/20 flex items-center justify-center gap-2"
            >
              <PartyPopper className="w-4 h-4" /> Claim Victory & Continue
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
