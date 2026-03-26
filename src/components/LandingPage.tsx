import { motion } from "motion/react";
import { ChevronRight, Play, CheckCircle2, BookOpen, TrendingUp, Brain, Bot, PieChart } from "lucide-react";

export function LandingPage() {
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6, ease: "easeOut" as const }
  };

  const features = [
    { icon: <TrendingUp className="w-8 h-8 text-accent-gold" />, title: "Smart Budget Planner", desc: "50/30/20 analysis in real-time" },
    { icon: <TrendingUp className="w-8 h-8 text-accent-emerald" />, title: "Investment Simulator", desc: "Compound growth visualized" },
    { icon: <PieChart className="w-8 h-8 text-accent-orange" />, title: "Asset Allocation", desc: "Diversify your portfolio" },
    { icon: <Brain className="w-8 h-8 text-accent-blue" />, title: "Financial Quiz", desc: "15 questions, global standards" },
    { icon: <Bot className="w-8 h-8 text-accent-purple" />, title: "AI Advisor", desc: "35+ expert answers, instant" }
  ];

  return (
    <div className="space-y-32 pb-32">
      {/* Hero Section */}
      <section className="min-h-screen flex flex-col items-center justify-center pt-20 px-6 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-6xl md:text-9xl font-serif leading-tight mb-6"
        >
          <span className="block font-light text-text-primary">Financial Freedom</span>
          <span className="relative inline-block font-semibold text-accent-gold">
            Starts Here.
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ delay: 1, duration: 1 }}
              className="absolute -bottom-2 left-0 h-1 bg-accent-gold/40 rounded-full"
            />
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="text-lg md:text-xl text-text-secondary max-w-2xl mb-12"
        >
          Learn budgeting, simulate investments, test your knowledge, and get personalized AI advice — completely free.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="flex flex-col sm:flex-row items-center gap-6 mb-16"
        >
          <a href="#dashboard" className="btn-primary text-lg px-10 py-4">
            Start Learning <ChevronRight className="w-5 h-5 ml-2" />
          </a>
          <button className="btn-secondary text-lg px-10 py-4 flex items-center gap-2">
            <Play className="w-5 h-5 fill-current" /> See How It Works
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="flex flex-wrap justify-center gap-8 text-text-muted text-sm font-light"
        >
          <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-accent-emerald" /> No signup required</div>
          <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-accent-emerald" /> Works in any currency</div>
          <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-accent-emerald" /> 100% free</div>
        </motion.div>

        {/* Hero Visual Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 1 }}
          className="mt-24 relative w-full max-w-5xl mx-auto"
        >
          <div className="card p-4 border-accent-gold/20 shadow-[0_0_50px_rgba(240,180,41,0.1)]">
            <div className="h-[400px] rounded-xl bg-bg-secondary/50 flex flex-col p-8 space-y-8">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-4 w-32 bg-border rounded-full" />
                  <div className="h-8 w-48 bg-accent-gold/20 rounded-lg" />
                </div>
                <div className="h-10 w-32 bg-accent-emerald/10 border border-accent-emerald/20 rounded-full flex items-center justify-center text-accent-emerald font-bold">
                  +24.3%
                </div>
              </div>
              <div className="flex-1 flex items-end gap-4">
                {[40, 70, 50, 90, 60, 80, 100].map((h, i) => (
                  <motion.div
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    transition={{ delay: 1 + i * 0.1, duration: 1 }}
                    className="flex-1 bg-linear-to-t from-accent-gold/5 to-accent-gold/40 rounded-t-lg"
                  />
                ))}
              </div>
            </div>
          </div>
          {/* Floating elements */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-10 -right-10 glass p-4 rounded-2xl shadow-2xl hidden md:block"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-accent-emerald/20 flex items-center justify-center">💰</div>
              <div>
                <div className="text-xs text-text-muted">Investment</div>
                <div className="text-sm font-bold">SIP Success</div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { label: "Students Worldwide", value: "50,000+", icon: "📚" },
            { label: "Total Simulated", value: "$2M+", icon: "💰" },
            { label: "Quiz Completion Rate", value: "94%", icon: "🧠" }
          ].map((stat, i) => (
            <motion.div
              key={i}
              {...fadeInUp}
              transition={{ delay: i * 0.1 }}
              className="card p-8 text-center space-y-2"
            >
              <div className="text-4xl mb-4">{stat.icon}</div>
              <div className="text-4xl font-mono font-bold text-accent-gold">{stat.value}</div>
              <div className="text-text-secondary font-medium">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              {...fadeInUp}
              transition={{ delay: i * 0.1 }}
              className="card card-hover p-8 space-y-6"
            >
              <div className="w-16 h-16 rounded-2xl bg-bg-secondary flex items-center justify-center">
                {feature.icon}
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold">{feature.title}</h3>
                <p className="text-text-secondary text-sm">{feature.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-6 text-center">
        <motion.h2 {...fadeInUp} className="text-4xl md:text-5xl font-bold mb-20">How It Works</motion.h2>
        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Connecting Line */}
          <div className="absolute top-1/2 left-0 w-full h-0.5 border-t-2 border-dashed border-accent-gold/20 -translate-y-1/2 hidden md:block" />
          
          {[
            { step: "01", title: "Choose Your Currency", desc: "Personalize for your country" },
            { step: "02", title: "Learn & Simulate", desc: "Use all 4 powerful tools" },
            { step: "03", title: "Track Your Progress", desc: "Dashboard shows your growth" }
          ].map((step, i) => (
            <motion.div
              key={i}
              {...fadeInUp}
              transition={{ delay: i * 0.2 }}
              className="relative z-10 space-y-6"
            >
              <div className="w-16 h-16 rounded-full bg-accent-gold text-bg-void font-bold text-2xl flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(240,180,41,0.4)]">
                {step.step}
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold">{step.title}</h3>
                <p className="text-text-secondary">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { text: "WealthWise helped me understand SIPs. Now I invest every month!", author: "Priya S.", age: 24, role: "Software Engineer" },
            { text: "The budget planner showed me I was spending 40% on wants. Game changer.", author: "Marcus T.", age: 28, role: "Marketing Manager" },
            { text: "Finally a financial tool that works in GBP and actually makes sense!", author: "Sophie L.", age: 22, role: "University Student" }
          ].map((t, i) => (
            <motion.div
              key={i}
              {...fadeInUp}
              transition={{ delay: i * 0.1 }}
              className="card p-8 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(s => <span key={s} className="text-accent-gold text-xl">★</span>)}
                </div>
                <p className="text-lg font-serif italic text-text-primary">"{t.text}"</p>
              </div>
              <div className="mt-8 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-linear-to-br from-accent-gold to-accent-emerald flex items-center justify-center font-bold text-bg-void">
                  {t.author[0]}
                </div>
                <div>
                  <div className="font-bold">{t.author}, {t.age}</div>
                  <div className="text-xs text-text-muted uppercase tracking-wider">{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
