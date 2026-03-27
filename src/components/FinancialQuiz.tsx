import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Brain, Timer, Trophy, CheckCircle2, XCircle, ChevronRight, RotateCcw, Share2 } from "lucide-react";
import { QUIZ_QUESTIONS } from "../constants";
import { cn } from "../lib/utils";

interface FinancialQuizProps {
  onComplete: (score: number) => void;
  bestScore: number;
}

import { Confetti } from "./Confetti";

export function FinancialQuiz({ onComplete, bestScore }: FinancialQuizProps) {
  const [gameState, setGameState] = useState<"START" | "QUIZ" | "RESULTS">("START");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [answers, setAnswers] = useState<{ questionId: number, isCorrect: boolean }[]>([]);

  const currentQuestion = QUIZ_QUESTIONS[currentQuestionIndex];

  const handleNext = useCallback(() => {
    if (currentQuestionIndex < QUIZ_QUESTIONS.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
      setTimeLeft(30);
    } else {
      setGameState("RESULTS");
      onComplete(score);
    }
  }, [currentQuestionIndex, score, onComplete]);

  useEffect(() => {
    if (gameState === "QUIZ" && !showExplanation) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleAnswer(-1); // Time's up
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [gameState, showExplanation, handleNext]);

  const handleAnswer = (index: number) => {
    if (selectedAnswer !== null) return;
    
    setSelectedAnswer(index);
    const isCorrect = index === currentQuestion.correctAnswer;
    if (isCorrect) {
      setScore(prev => prev + currentQuestion.points);
    }
    setAnswers(prev => [...prev, { questionId: currentQuestion.id, isCorrect }]);
    setShowExplanation(true);
  };

  const getGrade = (score: number) => {
    if (score >= 250) return { text: "🏆 Perfect Score! FinIQ Master!", color: "text-accent-gold", badge: "Master" };
    if (score >= 200) return { text: "🎓 Finance Expert", color: "text-accent-purple", badge: "Expert" };
    if (score >= 150) return { text: "📈 Investment Pro", color: "text-accent-blue", badge: "Pro" };
    if (score >= 101) return { text: "💼 Smart Saver", color: "text-accent-gold", badge: "Saver" };
    if (score >= 51) return { text: "📚 Money Student", color: "text-accent-orange", badge: "Student" };
    return { text: "💸 Financial Rookie", color: "text-accent-red", badge: "Rookie" };
  };

  const grade = getGrade(score);

  if (gameState === "START") {
    return (
      <div className="container mx-auto px-6 py-20 flex flex-col items-center justify-center text-center space-y-12">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="space-y-4">
          <h1 className="text-6xl font-display font-bold">Financial IQ Test</h1>
          <p className="text-xl text-text-secondary max-w-xl mx-auto">Test your knowledge with 15 questions across Easy, Medium, and Hard difficulty levels.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-4xl">
          <div className="card p-8 space-y-4">
            <div className="text-4xl text-accent-gold">⏱️</div>
            <div className="text-xl font-bold">7.5 Minutes</div>
            <p className="text-sm text-text-muted">30 seconds per question</p>
          </div>
          <div className="card p-8 space-y-4">
            <div className="text-4xl text-accent-emerald">🌍</div>
            <div className="text-xl font-bold">Global Standards</div>
            <p className="text-sm text-text-muted">International finance concepts</p>
          </div>
          <div className="card p-8 space-y-4">
            <div className="text-4xl text-accent-blue">🏆</div>
            <div className="text-xl font-bold">250 XP</div>
            <p className="text-sm text-text-muted">Earn points for every correct answer</p>
          </div>
        </div>

        <div className="space-y-6">
          <button onClick={() => setGameState("QUIZ")} className="btn-primary text-xl px-12 py-4">
            Start Quiz →
          </button>
          {bestScore > 0 && (
            <div className="text-text-muted font-mono">Best Score: {bestScore} / 250</div>
          )}
        </div>
      </div>
    );
  }

  if (gameState === "RESULTS") {
    return (
      <div className="container mx-auto px-6 py-20 flex flex-col items-center justify-center text-center space-y-12">
        {score >= 200 && <Confetti />}
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="space-y-6">
          <div className="text-text-muted uppercase tracking-widest text-sm">Your Results</div>
          <h2 className="text-8xl font-mono font-bold text-accent-gold">{score}</h2>
          <div className="text-2xl text-text-secondary">out of 250 points</div>
        </motion.div>

        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }} className="space-y-2">
          <div className={cn("text-4xl font-display font-bold", grade.color)}>{grade.text}</div>
          <div className="text-text-muted">Grade: {grade.badge}</div>
        </motion.div>

        <div className="flex gap-8 text-xl font-mono">
          <div className="flex items-center gap-2 text-accent-emerald">
            <CheckCircle2 className="w-6 h-6" /> {answers.filter(a => a.isCorrect).length} Correct
          </div>
          <div className="flex items-center gap-2 text-accent-red">
            <XCircle className="w-6 h-6" /> {answers.filter(a => !a.isCorrect).length} Wrong
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-4">
          <button onClick={() => { setGameState("START"); setScore(0); setCurrentQuestionIndex(0); setAnswers([]); }} className="btn-secondary flex items-center gap-2">
            <RotateCcw className="w-5 h-5" /> Retake Quiz
          </button>
          <button onClick={() => window.location.hash = "#dashboard"} className="btn-primary">
            Back to Dashboard
          </button>
          <button onClick={() => { navigator.clipboard.writeText(`I scored ${score}/250 on WealthWise Elite! Can you beat me?`); }} className="btn-secondary flex items-center gap-2">
            <Share2 className="w-5 h-5" /> Share Score
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-12 max-w-4xl space-y-8">
      {/* Quiz Header */}
      <div className="flex items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="text-xs text-text-muted uppercase tracking-widest">Question {currentQuestionIndex + 1} of 15</div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-mono font-bold text-accent-gold">{score} XP</span>
            <span className="text-text-muted">/ 250</span>
          </div>
        </div>

        <div className="relative w-16 h-16">
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" className="text-border" />
            <motion.circle
              cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8"
              strokeDasharray="282.7"
              animate={{ strokeDashoffset: 282.7 - (282.7 * timeLeft) / 30 }}
              className={cn(
                timeLeft > 15 ? "text-accent-emerald" : timeLeft > 8 ? "text-accent-gold" : "text-accent-red"
              )}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center font-mono font-bold text-lg">
            {timeLeft}
          </div>
        </div>
      </div>

      <div className="h-1.5 bg-border rounded-full overflow-hidden">
        <motion.div animate={{ width: `${((currentQuestionIndex + 1) / 15) * 100}%` }} className="h-full bg-accent-gold" />
      </div>

      {/* Question Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestionIndex}
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -50, opacity: 0 }}
          className="card p-8 md:p-12 space-y-10"
        >
          <div className="flex justify-between items-center">
            <span className={cn(
              "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border",
              currentQuestion.category === "EASY" ? "bg-accent-emerald/10 text-accent-emerald border-accent-emerald/20" :
              currentQuestion.category === "MEDIUM" ? "bg-accent-gold/10 text-accent-gold border-accent-gold/20" :
              "bg-accent-red/10 text-accent-red border-accent-red/20"
            )}>
              {currentQuestion.category}
            </span>
            <span className="text-accent-gold font-mono font-bold">+{currentQuestion.points} XP</span>
          </div>

          <h3 className="text-2xl md:text-3xl font-display font-bold leading-tight">{currentQuestion.question}</h3>

          <div className="grid grid-cols-1 gap-4">
            {currentQuestion.options.map((option, i) => (
              <button
                key={i}
                onClick={() => handleAnswer(i)}
                disabled={selectedAnswer !== null}
                className={cn(
                  "p-6 rounded-xl border text-left transition-all duration-200 flex items-center justify-between group",
                  selectedAnswer === null ? "bg-bg-secondary border-border hover:border-border-active hover:-translate-y-0.5" :
                  i === currentQuestion.correctAnswer ? "bg-accent-emerald/20 border-accent-emerald text-accent-emerald" :
                  selectedAnswer === i ? "bg-accent-red/20 border-accent-red text-accent-red" : "bg-bg-secondary/50 border-border opacity-50"
                )}
              >
                <span className="font-medium">{option}</span>
                {selectedAnswer !== null && i === currentQuestion.correctAnswer && <CheckCircle2 className="w-5 h-5" />}
                {selectedAnswer === i && i !== currentQuestion.correctAnswer && <XCircle className="w-5 h-5" />}
              </button>
            ))}
          </div>

          {showExplanation && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="space-y-6 pt-6 border-t border-border">
              <div className="space-y-2">
                <div className={cn("text-sm font-bold uppercase tracking-widest", selectedAnswer === currentQuestion.correctAnswer ? "text-accent-emerald" : "text-accent-red")}>
                  {selectedAnswer === currentQuestion.correctAnswer ? "Correct!" : "Incorrect"}
                </div>
                <p className="text-text-secondary leading-relaxed">{currentQuestion.explanation}</p>
              </div>
              <button onClick={handleNext} className="btn-primary w-full flex items-center justify-center gap-2">
                {currentQuestionIndex < 14 ? "Next Question" : "See Results"} <ChevronRight className="w-5 h-5" />
              </button>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
