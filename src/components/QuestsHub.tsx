import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  BookOpen, Sparkles, Trophy, Award, ShoppingBag, ArrowRight, CheckCircle2, 
  HelpCircle, ChevronLeft, Info, Flame, TrendingUp, Sliders, Play, Lock, 
  Coins, ArrowUpRight, Percent, RefreshCw, Zap, Shield, HelpCircle as QuestionIcon
} from "lucide-react";
import { cn } from "../lib/utils";
import { Confetti } from "./Confetti";
import { Logo } from "./Logo";

// Quests Definition with their interactive simulators and mini-quizzes
interface MiniQuiz {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface Quest {
  id: string;
  title: string;
  category: "MICRO" | "MACRO" | "PERSONAL" | "BEHAVIORAL";
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  xpReward: number;
  coinReward: number;
  description: string;
  icon: string;
  slides: {
    title: string;
    text: string;
    interactiveType?: "SUPPLY_DEMAND" | "FED_INTEREST" | "RUNWAY_APY" | "LOSS_AVERSION";
  }[];
  quizzes: MiniQuiz[];
}

const QUESTS: Quest[] = [
  {
    id: "micro_utility",
    title: "The Micro Dance: Supply & Demand",
    category: "MICRO",
    difficulty: "Beginner",
    xpReward: 100,
    coinReward: 40,
    description: "Master supply-demand shifts, market equilibrium, and marginal utility through real-time curves.",
    icon: "📈",
    slides: [
      {
        title: "The Heart of Free Markets",
        text: "Every asset class—stocks, houses, oil, or Bitcoin—finds its price via the invisible handshake of Supply and Demand. Equilibrium occurs where quantity supplied exactly equals quantity demanded. Let's slide the curve to see it live!"
      },
      {
        title: "Shift the Curves",
        text: "Slide the parameters below to shift demand (buyers wanting more) or supply (sellers bringing more). Notice how price adjusts dynamically to clear the market.",
        interactiveType: "SUPPLY_DEMAND"
      },
      {
        title: "Marginal Utility & Elasticity",
        text: "Why is water cheap but diamonds expensive? Marginal utility! The more you have of something, the less utility the next unit brings. Price elasticity dictates how violently consumers react to price shifts."
      }
    ],
    quizzes: [
      {
        question: "If demand for electric vehicles surges while lithium supply remains fixed, what happens to the equilibrium price of lithium?",
        options: [
          "It remains completely unchanged",
          "It decreases due to efficiency gains",
          "It increases to clear the market",
          "It plummets as substitutes are found"
        ],
        correctAnswer: 2,
        explanation: "When demand shifts right (increases) and supply remains inelastic (fixed), competition among buyers drives the price higher."
      },
      {
        question: "Which economic concept explains why your fourth slice of pizza yields less satisfaction than your first?",
        options: [
          "Price Elasticity of Demand",
          "Law of Diminishing Marginal Utility",
          "The Keynesian Multiplier",
          "Opportunity Cost Arbitrage"
        ],
        correctAnswer: 1,
        explanation: "The Law of Diminishing Marginal Utility states that as a consumer increases consumption of a good, there is a decline in the marginal utility that they derive from consuming each additional unit."
      }
    ]
  },
  {
    id: "macro_fed",
    title: "Federal Reserve & Inflation Velocity",
    category: "MACRO",
    difficulty: "Intermediate",
    xpReward: 150,
    coinReward: 60,
    description: "Understand the Fed's monetary dials, interest rates, and how money printing devalues cash.",
    icon: "🌍",
    slides: [
      {
        title: "The Monopoly Board's Banker",
        text: "The Federal Reserve controls the cost of borrowing by setting the Fed Funds Rate. When inflation is high, the Fed raises rates to cool down the economy. When the economy stalls, they slash rates and inject liquidity."
      },
      {
        title: "FED Monetary Policy Simulator",
        text: "Act as the Fed Chair. Drag the Fed Funds Rate slider. Watch how raising rates dampens inflation but increases unemployment, while lowering rates sparks growth but risks high inflation.",
        interactiveType: "FED_INTEREST"
      },
      {
        title: "The Velocity of Money",
        text: "Inflation isn't just about printing bills; it is about how fast money is spent (Velocity). When velocity collapses, even huge liquidity injections might not spark immediate consumer inflation, but instead inflate asset prices (stocks/housing)."
      }
    ],
    quizzes: [
      {
        question: "When the Fed initiates Quantitative Easing (QE), what is it actively doing?",
        options: [
          "Selling treasury securities to commercial banks",
          "Increasing the reserve requirements for retail customers",
          "Buying long-term assets to pump liquidity into the financial system",
          "Increasing tax rates on high-yielding capital gains"
        ],
        correctAnswer: 2,
        explanation: "Quantitative Easing involves central banks buying longer-term government bonds or other securities to increase money supply and encourage lending/investment."
      },
      {
        question: "If inflation is soaring at 8% annually, what rate hike policy is the Fed most likely to deploy?",
        options: [
          "Slashing rates to 0% to stimulate cheap production",
          "Raising rates to cool off consumer demand and credit creation",
          "Pegging the dollar to speculative gold assets",
          "Maintaining rates unchanged to let the market stabilize itself"
        ],
        correctAnswer: 1,
        explanation: "To combat high inflation, central banks raise interest rates, making borrowing expensive, cooling spending, and stabilizing price levels."
      }
    ]
  },
  {
    id: "personal_runway",
    title: "Sinking Funds & APY Compounding",
    category: "PERSONAL",
    difficulty: "Beginner",
    xpReward: 100,
    coinReward: 40,
    description: "Build an impenetrable financial buffer. Simulate runway extensions using compound yield.",
    icon: "🏠",
    slides: [
      {
        title: "The Power of defensive runway",
        text: "Runway is the number of months you can survive with zero income. A sinking fund is an earmarked reserve for irregular, expected expenses (taxes, repairs, medical premiums) to prevent debt spirals."
      },
      {
        title: "Compounding Runway Calculator",
        text: "Play with your monthly burn rate and stashed cushion. Watch how moving your money from a 0.1% traditional checking account to a 4.5% High-Yield Savings Account (HYSA) or DeFi vault extends your financial runway.",
        interactiveType: "RUNWAY_APY"
      },
      {
        title: "Snowballing Yield Velocity",
        text: "Compound interest is the eighth wonder of the world. Those who understand it earn it; those who don't, pay it. Over a lifetime, earning 5% yield vs 0.1% can mean the difference of hundreds of thousands of dollars."
      }
    ],
    quizzes: [
      {
        question: "What is the primary difference between an Emergency Fund and a Sinking Fund?",
        options: [
          "Emergency funds are for unknown surprises; sinking funds are for known, planned upcoming costs",
          "Emergency funds carry high risk; sinking funds are insured by the government",
          "Sinking funds are only utilized for real estate downsizings",
          "Emergency funds are strictly invested in high-volatility cryptocurrency"
        ],
        correctAnswer: 0,
        explanation: "Emergency funds protect against unpredictable catastrophes (e.g., job loss). Sinking funds are designated for expected irregular bills (e.g., car insurance or annual tax payments) to keep your emergency fund untouched."
      },
      {
        question: "How does compounding frequency affect your annual percentage yield (APY)?",
        options: [
          "Frequent compounding decreases total interest generated",
          "More frequent compounding (e.g., daily vs. annually) increases overall APY",
          "Compounding frequency has no mathematical bearing on APY",
          "Compounding frequency only applies to variable-rate credit cards"
        ],
        correctAnswer: 1,
        explanation: "The more frequently interest compounds (daily or monthly vs. once a year), the more interest you earn on your earned interest, resulting in a higher APY."
      }
    ]
  },
  {
    id: "behavioral_loss",
    title: "Cognitive Sabotage: Loss Aversion",
    category: "BEHAVIORAL",
    difficulty: "Advanced",
    xpReward: 180,
    coinReward: 70,
    description: "Conquer loss aversion, FOMO, and the psychological flaws that ruin portfolio returns.",
    icon: "🧠",
    slides: [
      {
        title: "Why Humans Are Terrible Investors",
        text: "Behavioral Economics proves we are not perfectly rational calculators. Daniel Kahneman's Prospect Theory shows that the psychological pain of losing $100 is twice as intense as the joy of winning $100. This is Loss Aversion."
      },
      {
        title: "Loss Aversion Coin Flip Arena",
        text: "Would you accept a coin flip with a 50% chance to lose $100 and a 50% chance to win $150? Mathematically, it is highly positive. Let's run a series of simulated flips and test your emotional pain tolerance!",
        interactiveType: "LOSS_AVERSION"
      },
      {
        title: "Herd Mentality & FOMO",
        text: "Herd Mentality drives bubbles and panic sells. When an asset is skyrocketing, fear of missing out (FOMO) causes retail investors to buy at the absolute top, and panic sell at the absolute bottom. Recognizing this bias is your ultimate competitive moat."
      }
    ],
    quizzes: [
      {
        question: "According to Kahneman's Prospect Theory, how do people generally weigh losses compared to equal gains?",
        options: [
          "Losses are felt roughly twice as intensely as gains of the same magnitude",
          "Gains are valued far more due to natural optimism",
          "Both are calculated with perfect mathematical equivalence",
          "Losses are immediately dismissed due to cognitive confirmation bias"
        ],
        correctAnswer: 0,
        explanation: "Prospect Theory demonstrates that human beings suffer twice as much pain from a loss than pleasure from an equivalent gain, leading to highly risk-averse, sub-optimal actions."
      },
      {
        question: "Which psychological trap occurs when a trader refuses to sell a failing asset because they already invested heavily in it?",
        options: [
          "The Hot-Hand Fallacy",
          "Sunk Cost Fallacy",
          "Anchoring Bias on High Yields",
          "Availability Heuristic"
        ],
        correctAnswer: 1,
        explanation: "The Sunk Cost Fallacy occurs when people continue throwing capital into a failing investment because they cannot bear the emotional pain of realizing the loss of previously spent resources."
      }
    ]
  }
];

// Reward Shop Items
export interface ShopItem {
  id: string;
  title: string;
  cost: number;
  description: string;
  icon: string;
  type: "BADGE" | "THEME";
  value: string; // theme class or badge name
}

export const SHOP_ITEMS: ShopItem[] = [
  {
    id: "badge_stagflation",
    title: "Stagflation Survivor",
    cost: 50,
    description: "An exclusive golden badge proving your mastery over monetary contraction events.",
    icon: "🛡️",
    type: "BADGE",
    value: "Stagflation Survivor"
  },
  {
    id: "badge_defi_deg",
    title: "DeFi Degenerate",
    cost: 75,
    description: "Unlock this prestigious badge to signal advanced smart contract and APY leveraging.",
    icon: "⚡",
    type: "BADGE",
    value: "DeFi Degenerate"
  },
  {
    id: "badge_fomo_slayer",
    title: "FOMO Slayer Elite",
    cost: 100,
    description: "The ultimate psychological medal certifying a completely objective, non-emotional trading style.",
    icon: "⚔️",
    type: "BADGE",
    value: "FOMO Slayer Elite"
  },
  {
    id: "theme_gold_aura",
    title: "Gold Aura Preset",
    cost: 60,
    description: "Encase your profile in a radiant, premium Gold halo that sparkles on the dashboard.",
    icon: "✨",
    type: "THEME",
    value: "aura-gold"
  },
  {
    id: "theme_sapphire_pulse",
    title: "Sapphire Pulse Preset",
    cost: 80,
    description: "An elegant, futuristic deep-blue pulse wave flowing across your profile frame.",
    icon: "💎",
    type: "THEME",
    value: "aura-sapphire"
  },
  {
    id: "theme_matrix_green",
    title: "Cybernetic Obsidian",
    cost: 110,
    description: "A dark cyberpunk console glow with neon emerald outlines.",
    icon: "🌌",
    type: "THEME",
    value: "aura-cyber"
  }
];

interface QuestsHubProps {
  userProfile: any;
  onUpdateProfile: (updated: any) => void;
  onUnlockAchievement: (id: string) => void;
}

export function QuestsHub({ userProfile, onUpdateProfile, onUnlockAchievement }: QuestsHubProps) {
  const [activeTab, setActiveTab] = useState<"QUESTS" | "SHOP">("QUESTS");
  const [viewMode, setViewMode] = useState<"PATH" | "GRID">("PATH");
  const [activeQuest, setActiveQuest] = useState<Quest | null>(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [showQuestQuiz, setShowQuestQuiz] = useState(false);
  
  // Quiz taking state
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedQuizAnswer, setSelectedQuizAnswer] = useState<number | null>(null);
  const [quizScore, setQuizScore] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [questQuizCompleted, setQuestQuizCompleted] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  // Local game state for interactive slides
  const [demandShift, setDemandShift] = useState(50);
  const [supplyShift, setSupplyShift] = useState(50);
  const [fedRate, setFedRate] = useState(4.5);
  const [runwayBurn, setRunwayBurn] = useState(4000);
  const [runwayFund, setRunwayFund] = useState(20000);
  const [runwayYield, setRunwayYield] = useState(0.1);
  const [coinFlips, setCoinFlips] = useState<{ outcome: "WIN" | "LOSS"; balance: number }[]>([]);
  const [coinFlipBalance, setCoinFlipBalance] = useState(1000);

  // Profile dynamic parameters fallback
  const currentXP = userProfile.xp || 120;
  const currentCoins = userProfile.coins || 50;
  const completedQuestIds = userProfile.completedQuests || [];
  const purchasedItemIds = userProfile.purchasedItems || [];
  const userStreak = userProfile.streak || 7;

  // Level calculator
  const calculateLevel = (xp: number) => {
    return Math.floor(xp / 150) + 1;
  };
  const currentLevel = calculateLevel(currentXP);
  const nextLevelXp = currentLevel * 150;
  const prevLevelXp = (currentLevel - 1) * 150;
  const progressPercent = Math.min(100, Math.max(0, ((currentXP - prevLevelXp) / 150) * 100));

  // Handle Coin Flip Simulation
  const handleCoinFlip = () => {
    const isWin = Math.random() < 0.5;
    const wager = 100;
    const gain = 150;
    const change = isWin ? gain : -wager;
    const newBalance = coinFlipBalance + change;
    setCoinFlipBalance(newBalance);
    setCoinFlips(prev => [...prev.slice(-4), { outcome: isWin ? "WIN" : "LOSS", balance: newBalance }]);
  };

  // Reset coin flips
  const resetCoinFlips = () => {
    setCoinFlips([]);
    setCoinFlipBalance(1000);
  };

  // Run quest completion reward
  const handleQuestCompletion = () => {
    if (!activeQuest) return;
    
    const isFirstTime = !completedQuestIds.includes(activeQuest.id);
    let updatedCompleted = [...completedQuestIds];
    let newCoins = currentCoins;
    let newXp = currentXP;

    if (isFirstTime) {
      updatedCompleted.push(activeQuest.id);
      newCoins += activeQuest.coinReward;
      newXp += activeQuest.xpReward;
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);

      // Check achievements
      if (updatedCompleted.length >= 1) onUnlockAchievement("first_quest");
      if (updatedCompleted.length === QUESTS.length) {
        onUnlockAchievement("quests_grandmaster");
        onUnlockAchievement("completion_all");
      }
    }

    const updatedProfile = {
      ...userProfile,
      xp: newXp,
      coins: newCoins,
      completedQuests: updatedCompleted
    };

    onUpdateProfile(updatedProfile);
    localStorage.setItem("ww_profile", JSON.stringify(updatedProfile));
    
    // Dispatch system alert
    window.dispatchEvent(new CustomEvent('ww-trigger-alert', {
      detail: {
        type: 'success',
        title: 'Quest Completed! 🎓',
        message: `You earned +${activeQuest.xpReward} XP and +${activeQuest.coinReward} Gold Coins!`
      }
    }));

    setQuestQuizCompleted(true);
  };

  // Handle Reward Purchasing
  const handlePurchase = (item: ShopItem) => {
    if (currentCoins < item.cost) {
      window.dispatchEvent(new CustomEvent('ww-trigger-alert', {
        detail: {
          type: 'risk',
          title: 'Insufficient Gold 🪙',
          message: `This item costs ${item.cost} Coins. You currently have ${currentCoins}. Complete more quests!`
        }
      }));
      return;
    }

    const updatedPurchased = [...purchasedItemIds, item.id];
    let newAchievements = [...(userProfile.achievements || [])];
    
    // If purchasing badge, append to profile badges
    if (item.type === "BADGE") {
      const isAlreadyUnlocked = newAchievements.some(a => a.id === item.id);
      if (!isAlreadyUnlocked) {
        newAchievements.push({
          id: item.id,
          title: item.title,
          description: item.description,
          icon: item.icon,
          unlockedAt: new Date().toISOString()
        });
      }
    }

    const updatedProfile = {
      ...userProfile,
      coins: currentCoins - item.cost,
      purchasedItems: updatedPurchased,
      achievements: newAchievements,
      // Apply profile outline/aura if theme was purchased
      activeAura: item.type === "THEME" ? item.value : userProfile.activeAura
    };

    onUpdateProfile(updatedProfile);
    localStorage.setItem("ww_profile", JSON.stringify(updatedProfile));

    window.dispatchEvent(new CustomEvent('ww-trigger-alert', {
      detail: {
        type: 'success',
        title: 'Upgrade Unlocked! 🛍️',
        message: `Successfully purchased "${item.title}"! Applied directly to your elite terminal profile.`
      }
    }));
  };

  return (
    <div className="space-y-10 py-6 max-w-7xl mx-auto">
      {showConfetti && <Confetti />}
      
      {/* Header Panel */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-bg-secondary/40 border border-border/80 rounded-2xl p-6 lg:p-8 relative overflow-hidden backdrop-blur-xs">
        <div className="absolute right-0 top-0 opacity-10 pointer-events-none translate-x-12 -translate-y-6">
          <Logo size="xl" iconOnly />
        </div>
        
        <div className="space-y-3 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent-gold/10 border border-accent-gold/20 rounded-full text-accent-gold text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive Mastery Curriculum</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-black tracking-tight text-text-primary">
            Financial IQ & Quests Portal
          </h1>
          <p className="text-sm md:text-base text-text-secondary max-w-xl leading-relaxed">
            Acquire systemic economic intelligence. Complete micro-simulations, clear assessments, and collect gold coins to customize your exclusive obsidian dashboard.
          </p>
        </div>

        {/* Level and Coins Panel */}
        <div className="flex flex-wrap items-center gap-4 bg-bg-void/80 border border-border p-4 rounded-xl relative z-10">
          <div className="space-y-1.5 pr-4 border-r border-border/60">
            <div className="text-[10px] text-text-muted font-bold uppercase tracking-widest flex items-center gap-1">
              <Trophy className="w-3.5 h-3.5 text-accent-gold" /> Level {currentLevel} Scholar
            </div>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-mono font-bold text-accent-gold">{currentXP}</div>
              <span className="text-xs text-text-muted font-mono">/ {nextLevelXp} XP</span>
            </div>
            <div className="w-32 h-1.5 bg-bg-secondary rounded-full overflow-hidden">
              <div className="h-full bg-accent-gold" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>

          <div className="space-y-1 pl-2">
            <div className="text-[10px] text-text-muted font-bold uppercase tracking-widest flex items-center gap-1">
              <Coins className="w-3.5 h-3.5 text-accent-gold" /> Vault Wealth
            </div>
            <div className="flex items-center gap-1 text-2xl font-mono font-black text-accent-gold">
              <span className="animate-bounce">🪙</span> {currentCoins} <span className="text-xs text-text-muted font-mono font-medium">COINS</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      {!activeQuest && (
        <div className="flex border-b border-border">
          <button
            onClick={() => setActiveTab("QUESTS")}
            className={cn(
              "px-6 py-3 font-semibold text-sm tracking-wider uppercase border-b-2 transition-all flex items-center gap-2",
              activeTab === "QUESTS" ? "border-accent-gold text-accent-gold" : "border-transparent text-text-secondary hover:text-text-primary"
            )}
          >
            <BookOpen className="w-4 h-4" /> 1. Guided Quests
          </button>
          <button
            onClick={() => setActiveTab("SHOP")}
            className={cn(
              "px-6 py-3 font-semibold text-sm tracking-wider uppercase border-b-2 transition-all flex items-center gap-2",
              activeTab === "SHOP" ? "border-accent-gold text-accent-gold" : "border-transparent text-text-secondary hover:text-text-primary"
            )}
          >
            <ShoppingBag className="w-4 h-4" /> 2. Cosmic Reward Shop
          </button>
        </div>
      )}

      {/* Main Tab Switch */}
      <AnimatePresence mode="wait">
        {activeQuest ? (
          /* Active Quest Guided Panel */
          <motion.div
            key="active-quest"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
          >
            {/* Left Hand Slide Navigation & Text Content (7 Cols) */}
            <div className="lg:col-span-7 card p-6 md:p-10 space-y-8 min-h-[500px] flex flex-col justify-between">
              
              {/* Slide Header */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <button 
                    onClick={() => {
                      setActiveQuest(null);
                      setCurrentSlideIndex(0);
                      setShowQuestQuiz(false);
                      setQuestQuizCompleted(false);
                    }}
                    className="flex items-center gap-1.5 text-xs text-text-muted hover:text-accent-gold transition-colors font-mono font-bold uppercase"
                  >
                    <ChevronLeft className="w-4 h-4" /> Return to Menu
                  </button>
                  <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded bg-bg-secondary border border-border text-text-muted">
                    Slide {currentSlideIndex + 1} of {activeQuest.slides.length}
                  </span>
                </div>

                <div className="space-y-2 pt-2">
                  <span className="text-[10px] font-bold text-accent-gold tracking-widest uppercase block">
                    Quest: {activeQuest.title}
                  </span>
                  <h2 className="text-3xl font-display font-bold leading-tight">
                    {showQuestQuiz ? "Module Assessment Test" : activeQuest.slides[currentSlideIndex].title}
                  </h2>
                </div>
              </div>

              {/* Main Content Area */}
              <div className="flex-1 py-6">
                {!showQuestQuiz ? (
                  <p className="text-base md:text-lg text-text-secondary leading-relaxed font-serif">
                    {activeQuest.slides[currentSlideIndex].text}
                  </p>
                ) : (
                  /* Quiz Form */
                  <div className="space-y-6">
                    {questQuizCompleted ? (
                      <div className="text-center py-10 space-y-6">
                        <div className="w-20 h-20 rounded-full bg-accent-gold/10 text-accent-gold flex items-center justify-center text-4xl mx-auto border border-accent-gold/30">
                          🎉
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-2xl font-bold">Module Mastery Certified!</h3>
                          <p className="text-text-secondary text-sm max-w-sm mx-auto">
                            You answered all challenges successfully. +{activeQuest.xpReward} XP and +{activeQuest.coinReward} Coins have been securely synchronized in MongoDB database ledger.
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            setActiveQuest(null);
                            setCurrentSlideIndex(0);
                            setShowQuestQuiz(false);
                            setQuestQuizCompleted(false);
                          }}
                          className="btn-primary"
                        >
                          Unlock Next Module
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="flex justify-between items-center text-xs font-mono text-text-muted">
                          <span>Challenge {currentQuizIndex + 1} of {activeQuest.quizzes.length}</span>
                          <span className="text-accent-gold font-bold">Passing Mark: 100%</span>
                        </div>
                        <h4 className="text-lg md:text-xl font-bold leading-snug">
                          {activeQuest.quizzes[currentQuizIndex].question}
                        </h4>
                        
                        <div className="grid grid-cols-1 gap-3 pt-2">
                          {activeQuest.quizzes[currentQuizIndex].options.map((option, i) => (
                            <button
                              key={i}
                              disabled={selectedQuizAnswer !== null}
                              onClick={() => {
                                setSelectedQuizAnswer(i);
                                const correct = i === activeQuest.quizzes[currentQuizIndex].correctAnswer;
                                if (correct) setQuizScore(p => p + 1);
                                setShowExplanation(true);
                              }}
                              className={cn(
                                "p-4 rounded-xl border text-left text-sm transition-all flex justify-between items-center",
                                selectedQuizAnswer === null ? "bg-bg-secondary border-border hover:border-border-active hover:-translate-y-0.5" :
                                i === activeQuest.quizzes[currentQuizIndex].correctAnswer ? "bg-accent-emerald/15 border-accent-emerald text-accent-emerald" :
                                selectedQuizAnswer === i ? "bg-accent-red/15 border-accent-red text-accent-red" : "bg-bg-secondary/40 border-border/50 opacity-60"
                              )}
                            >
                              <span>{option}</span>
                              {selectedQuizAnswer !== null && i === activeQuest.quizzes[currentQuizIndex].correctAnswer && <CheckCircle2 className="w-4 h-4" />}
                            </button>
                          ))}
                        </div>

                        {showExplanation && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="p-4 bg-bg-secondary/80 border border-border/80 rounded-xl space-y-3">
                            <p className="text-xs text-text-secondary">
                              <span className="font-bold uppercase tracking-wider text-accent-gold mr-1">Explanation:</span>
                              {activeQuest.quizzes[currentQuizIndex].explanation}
                            </p>
                            <button
                              onClick={() => {
                                if (currentQuizIndex < activeQuest.quizzes.length - 1) {
                                  setCurrentQuizIndex(p => p + 1);
                                  setSelectedQuizAnswer(null);
                                  setShowExplanation(false);
                                } else {
                                  handleQuestCompletion();
                                }
                              }}
                              className="btn-primary w-full text-xs font-mono font-bold uppercase py-2 flex items-center justify-center gap-1.5"
                            >
                              <span>{currentQuizIndex < activeQuest.quizzes.length - 1 ? "Next Challenge" : "Complete Assessment"}</span> <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </motion.div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Slider / Next Navigation Footer */}
              {!showQuestQuiz && (
                <div className="border-t border-border/60 pt-6 flex items-center justify-between">
                  <button
                    disabled={currentSlideIndex === 0}
                    onClick={() => setCurrentSlideIndex(p => Math.max(0, p - 1))}
                    className="btn-secondary px-4 py-2 disabled:opacity-30 disabled:pointer-events-none text-xs flex items-center gap-1"
                  >
                    <ChevronLeft className="w-4 h-4" /> Previous
                  </button>

                  <div className="flex gap-1.5">
                    {activeQuest.slides.map((_, i) => (
                      <div 
                        key={i} 
                        className={cn("w-2 h-2 rounded-full transition-all", i === currentSlideIndex ? "bg-accent-gold w-4" : "bg-border")} 
                      />
                    ))}
                  </div>

                  {currentSlideIndex < activeQuest.slides.length - 1 ? (
                    <button
                      onClick={() => setCurrentSlideIndex(p => p + 1)}
                      className="btn-primary px-5 py-2 text-xs flex items-center gap-1.5"
                    >
                      Next Slide <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setShowQuestQuiz(true);
                        setCurrentQuizIndex(0);
                        setSelectedQuizAnswer(null);
                        setShowExplanation(false);
                      }}
                      className="btn-primary bg-linear-to-r from-accent-purple to-accent-gold text-bg-void px-6 py-2.5 text-xs font-bold uppercase tracking-widest flex items-center gap-1.5"
                    >
                      <span>Take Quiz (+{activeQuest.coinReward} 🪙)</span> <Zap className="w-4 h-4 text-bg-void" />
                    </button>
                  )}
                </div>
              )}

            </div>

            {/* Right Hand Interactive Sandbox Area (5 Cols) */}
            <div className="lg:col-span-5 card p-6 md:p-8 space-y-6">
              <div className="flex items-center gap-2 border-b border-border/80 pb-4">
                <Sliders className="w-5 h-5 text-accent-gold" />
                <h3 className="font-bold text-sm uppercase tracking-wider">Dynamic Sandbox Emulator</h3>
              </div>

              {/* Decide what simulator to render */}
              {activeQuest.slides[currentSlideIndex].interactiveType === "SUPPLY_DEMAND" ? (
                /* SUPPLY DEMAND SIMULATOR */
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-text-secondary">Buyer Demand Strength</span>
                        <span className="font-mono text-accent-gold">{demandShift}%</span>
                      </div>
                      <input 
                        type="range" min="10" max="90" value={demandShift} 
                        onChange={(e) => setDemandShift(Number(e.target.value))}
                        className="w-full accent-accent-gold"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-text-secondary">Seller Asset Supply Volume</span>
                        <span className="font-mono text-accent-gold">{supplyShift}%</span>
                      </div>
                      <input 
                        type="range" min="10" max="90" value={supplyShift} 
                        onChange={(e) => setSupplyShift(Number(e.target.value))}
                        className="w-full accent-accent-gold"
                      />
                    </div>
                  </div>

                  {/* SVG graph rendering the intersection */}
                  <div className="relative aspect-square w-full bg-bg-void rounded-xl border border-border p-4 flex flex-col justify-between overflow-hidden">
                    <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
                      {/* Grid Lines */}
                      <line x1="10" y1="90" x2="90" y2="90" stroke="#333" strokeWidth="1" />
                      <line x1="10" y1="10" x2="10" y2="90" stroke="#333" strokeWidth="1" />

                      {/* Demand Curve (Shifts right as demandShift increases) */}
                      <path 
                        d={`M 15,${100 - (demandShift + 5)} L 85,${100 - (demandShift - 45)}`}
                        stroke="#e11d48" strokeWidth="3" fill="none" strokeDasharray="1 1" opacity="0.3"
                      />
                      <path 
                        d={`M 20,${100 - (demandShift + 10)} L 80,${100 - (demandShift - 30)}`}
                        stroke="#e11d48" strokeWidth="3" fill="none"
                      />
                      <text x="75" y={`${100 - (demandShift - 20)}`} fill="#e11d48" className="text-[5px] font-bold">Demand (D)</text>

                      {/* Supply Curve (Shifts right/down as supplyShift increases) */}
                      <path 
                        d={`M 20,${supplyShift - 5} L 80,${supplyShift + 55}`}
                        stroke="#10b981" strokeWidth="3" fill="none"
                      />
                      <text x="75" y={`${supplyShift + 50}`} fill="#10b981" className="text-[5px] font-bold">Supply (S)</text>

                      {/* Equilibrium Intersection Point Calculation */}
                      {/* Derived from demandShift and supplyShift */}
                      {(() => {
                        const dOffset = demandShift;
                        const sOffset = supplyShift;
                        const eqX = 20 + (dOffset + sOffset) / 3;
                        const eqY = 100 - (dOffset - sOffset) / 2 - 25;

                        return (
                          <>
                            <line x1={eqX} y1="90" x2={eqX} y2={eqY} stroke="#f0b429" strokeWidth="0.5" strokeDasharray="2" />
                            <line x1="10" y1={eqY} x2={eqX} y2={eqY} stroke="#f0b429" strokeWidth="0.5" strokeDasharray="2" />
                            <circle cx={eqX} cy={eqY} r="3" fill="#f0b429" className="animate-ping" />
                            <circle cx={eqX} cy={eqY} r="2.5" fill="#f0b429" />
                          </>
                        );
                      })()}
                    </svg>
                    
                    {/* Floating Metrics */}
                    <div className="absolute top-2 right-2 bg-bg-secondary/95 border border-border p-2 rounded-lg text-[9px] font-mono space-y-1">
                      <div className="text-accent-gold">Equilibrium Point:</div>
                      <div>Simulated Price: <span className="font-bold text-text-primary">${Math.round((demandShift / supplyShift) * 100)} / unit</span></div>
                      <div>Cleared Volume: <span className="font-bold text-text-primary">{Math.round((demandShift + supplyShift) * 4.5)}k</span></div>
                    </div>
                  </div>
                  <p className="text-[10px] text-text-muted leading-relaxed">
                    *Graph Theory: Increasing demand (sliding up) pushes the price and clearing volume up. Increasing supply pushes the price down but clearing volume up.
                  </p>
                </div>
              ) : activeQuest.slides[currentSlideIndex].interactiveType === "FED_INTEREST" ? (
                /* FED INTEREST SIMULATOR */
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-text-secondary">Fed Funds Interest Rate</span>
                      <span className="font-mono text-accent-gold font-bold">{fedRate}%</span>
                    </div>
                    <input 
                      type="range" min="0" max="15" step="0.25" value={fedRate} 
                      onChange={(e) => setFedRate(Number(e.target.value))}
                      className="w-full accent-accent-gold"
                    />
                  </div>

                  {/* Calculated Monetary Multipliers */}
                  {(() => {
                    const simulatedInflation = Math.max(1.2, 12.5 - fedRate * 1.6).toFixed(1);
                    const simulatedGDP = Math.max(-2.5, 6.8 - fedRate * 0.7).toFixed(1);
                    const simulatedUnemp = Math.min(10, 3.2 + fedRate * 0.4).toFixed(1);
                    const moneyVelocity = Math.max(0.5, 2.8 - fedRate * 0.15).toFixed(2);

                    return (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="card p-4 space-y-1">
                          <div className="text-[9px] text-text-muted uppercase tracking-widest font-bold">Annual CPI Inflation</div>
                          <div className={cn("text-xl font-mono font-bold", Number(simulatedInflation) > 5 ? "text-accent-red" : "text-accent-emerald")}>
                            {simulatedInflation}%
                          </div>
                          <div className="text-[8px] text-text-muted">Target: 2.0%</div>
                        </div>

                        <div className="card p-4 space-y-1">
                          <div className="text-[9px] text-text-muted uppercase tracking-widest font-bold">Real GDP Growth</div>
                          <div className={cn("text-xl font-mono font-bold", Number(simulatedGDP) < 0 ? "text-accent-red animate-pulse" : "text-accent-blue")}>
                            {simulatedGDP}%
                          </div>
                          <div className="text-[8px] text-text-muted">{Number(simulatedGDP) < 0 ? "RECESSSION STATE" : "ECONOMICEXPANSION"}</div>
                        </div>

                        <div className="card p-4 space-y-1 col-span-2">
                          <div className="text-[9px] text-text-muted uppercase tracking-widest font-bold">Monetary Velocity & Credit Liquidity</div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-mono font-bold">{moneyVelocity}x velocity</span>
                            <span className="text-[10px] text-accent-gold bg-accent-gold/10 px-2 py-0.5 rounded border border-accent-gold/20">
                              {fedRate > 8 ? "MONETARY CONTRACTION" : fedRate < 3 ? "QUANTITATIVE EASING" : "NEUTRAL DIAL"}
                            </span>
                          </div>
                          <div className="h-1.5 bg-bg-void rounded-full overflow-hidden mt-2">
                            <div className="h-full bg-accent-purple" style={{ width: `${(fedRate / 15) * 100}%` }} />
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                  <p className="text-[10px] text-text-muted leading-relaxed">
                    *Central Banking Reality: Slashing interest rates to 0% yields high growth but risks runaway consumer inflation (too many dollars chasing too few goods).
                  </p>
                </div>
              ) : activeQuest.slides[currentSlideIndex].interactiveType === "RUNWAY_APY" ? (
                /* RUNWAY APY SIMULATOR */
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-text-secondary">Emergency Savings Cash</span>
                        <span className="font-mono text-accent-gold">${runwayFund.toLocaleString()}</span>
                      </div>
                      <input 
                        type="range" min="2000" max="100000" step="1000" value={runwayFund} 
                        onChange={(e) => setRunwayFund(Number(e.target.value))}
                        className="w-full accent-accent-gold"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-text-secondary">Monthly Burn Rate</span>
                        <span className="font-mono text-accent-gold">${runwayBurn.toLocaleString()}</span>
                      </div>
                      <input 
                        type="range" min="1000" max="10000" step="250" value={runwayBurn} 
                        onChange={(e) => setRunwayBurn(Number(e.target.value))}
                        className="w-full accent-accent-gold"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <div className="text-xs text-text-secondary mb-1">Choose Asset Location (Compound APY)</div>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { name: "Checking Account", apy: 0.1 },
                          { name: "High-Yield Savings", apy: 4.5 },
                          { name: "DeFi APY Vault", apy: 10.5 }
                        ].map((item) => (
                          <button
                            key={item.name}
                            onClick={() => setRunwayYield(item.apy)}
                            className={cn(
                              "p-2 rounded-lg border text-[10px] font-bold text-center leading-tight transition-all",
                              runwayYield === item.apy ? "bg-accent-gold/25 border-accent-gold text-accent-gold" : "bg-bg-secondary/60 border-border text-text-secondary"
                            )}
                          >
                            <div>{item.name}</div>
                            <div className="font-mono mt-1 text-accent-gold">{item.apy}% APY</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {(() => {
                    const baselineRunway = runwayFund / runwayBurn;
                    const monthlyInterestRate = (runwayYield / 100) / 12;
                    
                    // Simple iterative solver to find how many months it survives with compound interest added monthly
                    let tempFund = runwayFund;
                    let calculatedMonths = 0;
                    while (tempFund >= runwayBurn && calculatedMonths < 120) {
                      tempFund = (tempFund - runwayBurn) * (1 + monthlyInterestRate);
                      calculatedMonths++;
                    }

                    const extension = Math.max(0, calculatedMonths - baselineRunway);

                    return (
                      <div className="space-y-4 pt-4 border-t border-border/80 text-center">
                        <div className="text-[10px] text-text-muted uppercase tracking-widest font-bold">Total Liquid Runway Available</div>
                        <div className="text-4xl font-mono font-black text-accent-emerald flex items-center justify-center gap-1">
                          {calculatedMonths >= 120 ? "10+ Years ♾️" : `${calculatedMonths.toFixed(1)} Months`}
                        </div>
                        {extension > 0.1 && (
                          <div className="text-[11px] text-accent-gold font-bold flex items-center justify-center gap-1">
                            🚀 APY Compounding extended your buffer by {extension.toFixed(1)} Months!
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              ) : activeQuest.slides[currentSlideIndex].interactiveType === "LOSS_AVERSION" ? (
                /* LOSS AVERSION FLIP ARENA */
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-xs">
                      <span>Mock Capital Pool</span>
                      <span className="font-mono text-accent-gold font-bold">${coinFlipBalance.toLocaleString()}</span>
                    </div>

                    <div className="card p-4 border-dashed border-border flex flex-col items-center justify-center gap-4 text-center">
                      <div className="text-xs text-text-secondary max-w-xs leading-relaxed">
                        A mathematically positive wager: 50% chance to lose **$100**, and 50% chance to win **$150**. Real portfolio theory mandates taking this flip.
                      </div>
                      
                      <div className="flex gap-4">
                        <button 
                          onClick={handleCoinFlip}
                          className="btn-primary py-2.5 px-6 text-xs flex items-center gap-1.5"
                        >
                          <Play className="w-4 h-4 fill-bg-void text-bg-void" /> Flip Coin
                        </button>
                        <button 
                          onClick={resetCoinFlips}
                          className="btn-secondary py-2.5 px-4 text-xs flex items-center gap-1"
                        >
                          <RefreshCw className="w-3.5 h-3.5" /> Clear Series
                        </button>
                      </div>
                    </div>

                    {/* Flips visual representation */}
                    {coinFlips.length > 0 && (
                      <div className="space-y-2">
                        <div className="text-[10px] text-text-muted uppercase font-bold tracking-widest">Flip Sequence Log:</div>
                        <div className="flex gap-2 justify-center">
                          {coinFlips.map((flip, i) => (
                            <motion.div 
                              key={i}
                              initial={{ scale: 0.5, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              className={cn(
                                "w-12 h-12 rounded-full flex flex-col items-center justify-center font-mono font-bold text-xs border shadow-sm",
                                flip.outcome === "WIN" ? "bg-accent-emerald/15 border-accent-emerald text-accent-emerald" : "bg-accent-red/15 border-accent-red text-accent-red"
                              )}
                            >
                              <span>{flip.outcome}</span>
                              <span className="text-[7px] mt-0.5">{flip.outcome === "WIN" ? "+$150" : "-$100"}</span>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <p className="text-[10px] text-text-muted leading-relaxed">
                    *Prospect Theory Insight: If loss aversion makes you reject this flip, you suffer from sub-optimal decision bias. Wealth compounding requires looking at mathematically expected values, not fear of local variances.
                  </p>
                </div>
              ) : (
                /* Static Default Screen if slide has no interactive element */
                <div className="h-64 flex flex-col items-center justify-center text-center p-4 space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-bg-secondary flex items-center justify-center text-accent-gold text-2xl border border-border">
                    💡
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-sm">Theoretical Insight Phase</h4>
                    <p className="text-xs text-text-secondary max-w-xs leading-relaxed">
                      Read the curriculum slide carefully. Click "Next" to unlock the interactive sandbox widget and master this financial discipline.
                    </p>
                  </div>
                </div>
              )}
            </div>

          </motion.div>
        ) : activeTab === "QUESTS" ? (
          /* Guided Quests Selection Layout with Toggle */
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-bg-secondary/20 p-4 rounded-xl border border-border/60">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-accent-gold animate-pulse" />
                <span className="text-xs text-text-secondary font-mono">Curriculum Presentation:</span>
              </div>
              <div className="flex bg-bg-void border border-border rounded-lg p-0.5 w-full sm:w-auto">
                <button
                  onClick={() => setViewMode("PATH")}
                  className={cn(
                    "flex-1 sm:flex-initial px-4 py-1.5 text-xs font-bold rounded-md transition-all flex items-center justify-center gap-1.5",
                    viewMode === "PATH" ? "bg-accent-gold text-bg-void font-black shadow-md" : "text-text-secondary hover:text-text-primary"
                  )}
                >
                  <Trophy className="w-3.5 h-3.5" /> Interactive Journey Map
                </button>
                <button
                  onClick={() => setViewMode("GRID")}
                  className={cn(
                    "flex-1 sm:flex-initial px-4 py-1.5 text-xs font-bold rounded-md transition-all flex items-center justify-center gap-1.5",
                    viewMode === "GRID" ? "bg-accent-gold text-bg-void font-black shadow-md" : "text-text-secondary hover:text-text-primary"
                  )}
                >
                  <BookOpen className="w-3.5 h-3.5" /> Grid Directory
                </button>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {viewMode === "PATH" ? (
                /* Interactive Journey Roadmap Map Mode */
                <motion.div
                  key="quests-roadmap"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="relative py-12 max-w-4xl mx-auto"
                >
                  {/* Decorative curved SVG connection path */}
                  <div className="absolute inset-0 pointer-events-none hidden md:block" style={{ zIndex: 0 }}>
                    <svg className="w-full h-full stroke-border" fill="none">
                      <path 
                        d="M 120, 100 Q 450, 120 450, 300 T 120, 500 T 450, 700" 
                        strokeWidth="3" 
                        strokeDasharray="8 8" 
                        className="opacity-40 animate-[dash_20s_linear_infinite]" 
                      />
                    </svg>
                  </div>

                  {/* Vertical connector line for mobile */}
                  <div className="absolute top-4 bottom-4 left-8 md:left-1/2 w-0.5 border-l-2 border-dashed border-border/80 pointer-events-none -translate-x-1/2 md:hidden" />

                  <div className="space-y-16 relative z-10">
                    {QUESTS.map((quest, idx) => {
                      const completed = completedQuestIds.includes(quest.id);
                      // Unlock status logic
                      let unlocked = true;
                      if (idx > 0) {
                        const previousQuest = QUESTS[idx - 1];
                        unlocked = completedQuestIds.includes(previousQuest.id);
                      }

                      // Alternating sides for desktop
                      const isLeft = idx % 2 === 0;

                      return (
                        <motion.div
                          key={quest.id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          viewport={{ once: true }}
                          className={cn(
                            "flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-12 relative",
                            isLeft ? "md:flex-row" : "md:flex-row-reverse"
                          )}
                        >
                          {/* Central node connector bullet */}
                          <div className="absolute left-8 md:left-1/2 -translate-x-1/2 flex flex-col items-center justify-center gap-1.5" style={{ zIndex: 11 }}>
                            <motion.button
                              whileHover={unlocked ? { scale: 1.15 } : {}}
                              onClick={() => {
                                if (!unlocked) {
                                  window.dispatchEvent(new CustomEvent('ww-trigger-alert', {
                                    detail: {
                                      type: 'risk',
                                      title: 'Subject Locked 🔒',
                                      message: `To unlock "${quest.title}", you must complete the previous module: "${QUESTS[idx - 1].title}" first!`
                                    }
                                  }));
                                  return;
                                }
                                setActiveQuest(quest);
                                setCurrentSlideIndex(0);
                                setShowQuestQuiz(false);
                                setQuestQuizCompleted(completed);
                                setQuizScore(0);
                                setCurrentQuizIndex(0);
                                setSelectedQuizAnswer(null);
                                setShowExplanation(false);
                              }}
                              className={cn(
                                "w-16 h-16 rounded-full flex items-center justify-center text-2xl border-4 shadow-xl transition-all relative",
                                completed ? "bg-accent-emerald/20 border-accent-emerald text-accent-emerald shadow-accent-emerald/15" :
                                unlocked ? "bg-accent-gold/20 border-accent-gold text-accent-gold animate-pulse shadow-accent-gold/15" :
                                "bg-bg-secondary border-border text-text-muted cursor-not-allowed"
                              )}
                            >
                              {completed ? "✅" : !unlocked ? "🔒" : quest.icon}
                              {unlocked && !completed && (
                                <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-gold opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-accent-gold"></span>
                                </span>
                              )}
                            </motion.button>
                            <span className="text-[10px] font-mono font-bold text-text-muted bg-bg-void/90 px-2 py-0.5 rounded border border-border">
                              STAGE {idx + 1}
                            </span>
                          </div>

                          {/* Empty spacer to align staggered cards */}
                          <div className="hidden md:block md:w-1/2" />

                          {/* Content Card */}
                          <div className="w-full md:w-1/2 pl-16 md:pl-0">
                            <motion.div
                              whileHover={unlocked ? { y: -3, border: "1px solid var(--accent-gold)" } : {}}
                              onClick={() => {
                                if (unlocked) {
                                  setActiveQuest(quest);
                                  setCurrentSlideIndex(0);
                                  setShowQuestQuiz(false);
                                  setQuestQuizCompleted(completed);
                                  setQuizScore(0);
                                  setCurrentQuizIndex(0);
                                  setSelectedQuizAnswer(null);
                                  setShowExplanation(false);
                                }
                              }}
                              className={cn(
                                "card p-6 space-y-4 text-left border relative overflow-hidden cursor-pointer transition-all",
                                completed ? "border-accent-emerald/30 bg-accent-emerald/5" :
                                unlocked ? "border-accent-gold/20 bg-bg-secondary/40 shadow-[0_0_20px_rgba(234,179,8,0.02)]" :
                                "border-border/40 bg-bg-void/40 opacity-50 cursor-not-allowed"
                              )}
                            >
                              <div className="flex items-center justify-between">
                                <span className={cn(
                                  "text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border",
                                  quest.category === "MICRO" ? "bg-accent-blue/10 border-accent-blue/20 text-accent-blue" :
                                  quest.category === "MACRO" ? "bg-accent-purple/10 border-accent-purple/20 text-accent-purple" :
                                  quest.category === "PERSONAL" ? "bg-accent-emerald/10 border-accent-emerald/20 text-accent-emerald" :
                                  "bg-accent-orange/10 border-accent-orange/20 text-accent-orange"
                                )}>
                                  {quest.category}
                                </span>
                                <div className="text-[10px] font-mono text-text-muted">
                                  {quest.difficulty}
                                </div>
                              </div>

                              <div className="space-y-1.5">
                                <h3 className="text-lg font-display font-bold text-text-primary flex items-center gap-2">
                                  {quest.title}
                                  {!unlocked && <Lock className="w-3.5 h-3.5 text-text-muted" />}
                                </h3>
                                <p className="text-xs text-text-secondary leading-relaxed">
                                  {quest.description}
                                </p>
                              </div>

                              <div className="border-t border-border/40 pt-3 flex items-center justify-between">
                                <div className="flex gap-2 text-[10px] font-mono text-text-muted">
                                  <span className="text-accent-gold/90 font-bold flex items-center gap-0.5">🪙 +{quest.coinReward}</span>
                                  <span className="text-accent-gold/90 font-bold flex items-center gap-0.5">⭐ +{quest.xpReward} XP</span>
                                </div>
                                <span className="text-[10px] font-bold text-accent-gold uppercase tracking-wider flex items-center gap-1 group">
                                  {completed ? "Replay Stage" : unlocked ? "Launch Simulation" : "Stage Locked"} <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                                </span>
                              </div>
                            </motion.div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              ) : (
                /* Classic Grid Selection view */
                <motion.div
                  key="quests-grid"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                  {QUESTS.map((quest) => {
                    const completed = completedQuestIds.includes(quest.id);
                    
                    return (
                      <motion.div
                        key={quest.id}
                        whileHover={{ y: -5 }}
                        className={cn(
                          "card p-6 flex flex-col justify-between gap-6 relative transition-all group overflow-hidden border",
                          completed ? "border-accent-emerald/40 bg-accent-emerald/5" : "hover:border-accent-gold/40"
                        )}
                      >
                        {/* Category Pill and Difficulty */}
                        <div className="flex items-center justify-between">
                          <div className="flex gap-2">
                            <span className={cn(
                              "text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded border",
                              quest.category === "MICRO" ? "bg-accent-blue/10 border-accent-blue/20 text-accent-blue" :
                              quest.category === "MACRO" ? "bg-accent-purple/10 border-accent-purple/20 text-accent-purple" :
                              quest.category === "PERSONAL" ? "bg-accent-emerald/10 border-accent-emerald/20 text-accent-emerald" :
                              "bg-accent-orange/10 border-accent-orange/20 text-accent-orange"
                            )}>
                              {quest.category}
                            </span>
                            <span className="text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 bg-bg-secondary border border-border text-text-muted">
                              {quest.difficulty}
                            </span>
                          </div>

                          {completed && (
                            <span className="text-xs font-bold text-accent-emerald flex items-center gap-1 font-mono uppercase bg-accent-emerald/10 px-2.5 py-1 rounded">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                            </span>
                          )}
                        </div>

                        {/* Icon & Title */}
                        <div className="flex gap-4 items-start pt-2">
                          <div className="w-14 h-14 bg-bg-secondary rounded-xl flex items-center justify-center text-3xl shrink-0 border border-border group-hover:border-accent-gold/20 transition-all">
                            {quest.icon}
                          </div>
                          <div className="space-y-1.5">
                            <h3 className="text-xl font-display font-bold group-hover:text-accent-gold transition-colors">{quest.title}</h3>
                            <p className="text-xs text-text-secondary leading-relaxed">{quest.description}</p>
                          </div>
                        </div>

                        {/* Reward & Button Footer */}
                        <div className="border-t border-border/60 pt-4 flex items-center justify-between">
                          <div className="flex items-center gap-3 text-xs font-mono">
                            <span className="text-accent-gold font-bold flex items-center gap-0.5">
                              <Trophy className="w-3.5 h-3.5 text-accent-gold" /> +{quest.xpReward} XP
                            </span>
                            <span className="text-accent-gold font-bold flex items-center gap-0.5">
                              <Coins className="w-3.5 h-3.5 text-accent-gold" /> +{quest.coinReward} Coins
                            </span>
                          </div>

                          <button
                            onClick={() => {
                              setActiveQuest(quest);
                              setCurrentSlideIndex(0);
                              setShowQuestQuiz(false);
                              setQuestQuizCompleted(completed);
                              // Reset quiz metrics
                              setQuizScore(0);
                              setCurrentQuizIndex(0);
                              setSelectedQuizAnswer(null);
                              setShowExplanation(false);
                            }}
                            className={cn(
                              "btn-primary text-[10px] font-bold uppercase tracking-widest py-2 px-4 flex items-center gap-1 shrink-0",
                              completed ? "bg-bg-secondary text-text-primary border border-border hover:bg-bg-primary" : ""
                            )}
                          >
                            {completed ? "Replay Simulation" : "Begin Quest"} <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          /* Reward Shop Interface */
          <motion.div
            key="shop-grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
          >
            <div className="bg-bg-secondary/20 p-5 rounded-xl border border-border/80 flex items-center gap-3">
              <Info className="w-5 h-5 text-accent-gold shrink-0" />
              <p className="text-xs text-text-secondary leading-relaxed">
                Spend your earned gold coins to unlock rare pedagogical badges and cosmetic visual presets. Badges purchased in the reward shop instantly register as custom certifications inside your **Prestigious Achievements** cabinet!
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {SHOP_ITEMS.map((item) => {
                const alreadyPurchased = purchasedItemIds.includes(item.id);
                const canAfford = currentCoins >= item.cost;
                
                return (
                  <motion.div
                    key={item.id}
                    whileHover={{ y: -4 }}
                    className={cn(
                      "card p-6 flex flex-col justify-between gap-6 transition-all relative border",
                      alreadyPurchased ? "border-accent-gold/40 bg-accent-gold/5" : ""
                    )}
                  >
                    {/* Item type pill */}
                    <div className="flex items-center justify-between">
                      <span className={cn(
                        "text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border",
                        item.type === "BADGE" ? "bg-accent-purple/10 border-accent-purple/20 text-accent-purple" : "bg-accent-gold/10 border-accent-gold/20 text-accent-gold"
                      )}>
                        {item.type}
                      </span>
                      {alreadyPurchased && (
                        <span className="text-[9px] font-bold uppercase tracking-widest text-accent-gold flex items-center gap-1 font-mono">
                          <CheckCircle2 className="w-3 h-3" /> Unlocked & Applied
                        </span>
                      )}
                    </div>

                    {/* Meta info */}
                    <div className="flex gap-4 items-start">
                      <div className="w-14 h-14 bg-bg-secondary border border-border rounded-xl flex items-center justify-center text-3xl shrink-0">
                        {item.icon}
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-bold text-lg text-text-primary leading-tight">{item.title}</h3>
                        <p className="text-xs text-text-secondary leading-relaxed">{item.description}</p>
                      </div>
                    </div>

                    {/* Cost and Purchase Action */}
                    <div className="border-t border-border/60 pt-4 flex items-center justify-between">
                      <div className="flex items-center gap-1 text-sm font-mono font-bold text-accent-gold">
                        🪙 {item.cost} <span className="text-[10px] text-text-muted">COINS</span>
                      </div>

                      {alreadyPurchased ? (
                        <button 
                          disabled 
                          className="btn-secondary px-4 py-2 text-[10px] font-bold uppercase tracking-widest disabled:opacity-50 disabled:pointer-events-none"
                        >
                          Acquired
                        </button>
                      ) : (
                        <button
                          onClick={() => handlePurchase(item)}
                          className={cn(
                            "btn-primary text-[10px] font-bold uppercase tracking-widest py-2 px-4 flex items-center gap-1",
                            !canAfford ? "opacity-50 grayscale hover:scale-100" : ""
                          )}
                        >
                          Unlock Upgrade <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
