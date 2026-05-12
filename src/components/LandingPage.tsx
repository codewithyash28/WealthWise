import { motion } from "motion/react";
import { ChevronRight, Play, CheckCircle2, BookOpen, TrendingUp, Brain, Bot, PieChart, Sparkles, BrainCircuit, Trophy, ShieldCheck } from "lucide-react";
import { cn } from "../lib/utils";
import { Logo } from "./Logo";

export function LandingPage() {
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6, ease: "easeOut" as const }
  };

  const features = [
    { icon: <BrainCircuit className="w-8 h-8 text-accent-gold" />, title: "MacroPulse Engine", desc: "Simulate inflation & interest rate impacts" },
    { icon: <TrendingUp className="w-8 h-8 text-accent-emerald" />, title: "TrendMarket", desc: "Gamified pop-culture stock trading" },
    { icon: <PieChart className="w-8 h-8 text-accent-blue" />, title: "LiveOrLease", desc: "Real-time rent vs buy decision engine" },
    { icon: <Sparkles className="w-8 h-8 text-accent-purple" />, title: "MockYield DeFi", desc: "Learn staking & yield farming safely" },
    { icon: <CheckCircle2 className="w-8 h-8 text-accent-orange" />, title: "Mastery Alerts", desc: "Get real-time risk & opportunity nudges" }
  ];

  return (
    <div className="space-y-32 pb-32">
      {/* Hero Section */}
      <section className="min-h-screen flex flex-col items-center justify-center pt-20 px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-gold/5 border border-accent-gold/20 text-accent-gold text-[10px] font-bold uppercase tracking-widest shadow-[0_0_20px_rgba(240,180,41,0.1)]"
        >
          <ShieldCheck className="w-3 h-3" /> Educational Simulator • Not Financial Advice
        </motion.div>

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="mb-12"
        >
          <Logo size="xl" className="justify-center" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-6xl md:text-8xl font-serif leading-tight mb-8"
        >
          <span className="block font-light text-text-primary">Master your money with</span>
          <span className="relative inline-block font-semibold text-accent-gold">
            WealthWise Elite.
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ delay: 1, duration: 1 }}
              className="absolute -bottom-2 left-0 h-1 bg-accent-gold/40 rounded-full"
            />
          </span>
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="flex flex-wrap justify-center gap-6 md:gap-12 mb-16 max-w-3xl"
        >
          {[
            { icon: <BrainCircuit className="w-5 h-5 text-accent-gold" />, text: "Simulate Global Economics" },
            { icon: <TrendingUp className="w-5 h-5 text-accent-emerald" />, text: "Test Trading Psychology" },
            { icon: <Sparkles className="w-5 h-5 text-accent-purple" />, text: "Learn DeFi Essentials" }
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 text-text-secondary">
              <div className="w-8 h-8 rounded-lg bg-bg-secondary flex items-center justify-center border border-border">
                {item.icon}
              </div>
              <span className="text-sm font-medium">{item.text}</span>
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="flex flex-col sm:flex-row items-center gap-4 mb-20"
        >
          <div className="flex flex-col items-center gap-2">
            <a href="#dashboard" className="btn-primary text-lg px-10 py-4 w-full sm:w-auto" aria-label="Enter the full learning dashboard">
              Start Learning <ChevronRight className="w-5 h-5 ml-2" />
            </a>
            <span className="text-[9px] font-bold text-text-muted uppercase tracking-tighter">Full Dashboard Access</span>
          </div>
          
          <div className="flex flex-col items-center gap-2">
            <button 
              className="btn-secondary text-lg px-10 py-4 flex items-center gap-2 w-full sm:w-auto" 
              onClick={() => window.dispatchEvent(new CustomEvent('start-judge-tour'))}
              aria-label="Take a 1-minute guided tour of the features"
            >
              <Play className="w-5 h-5 fill-current" /> Take Tour
            </button>
            <span className="text-[9px] font-bold text-text-muted uppercase tracking-tighter">1-Minute Guided Walkthrough</span>
          </div>
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

        {/* Interactive Simulation Sneak Peek */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 1 }}
          className="mt-16 w-full max-w-4xl mx-auto"
        >
          <div className="card p-1 border-accent-gold/20 shadow-[0_0_50px_rgba(240,180,41,0.1)] overflow-hidden">
            <div className="bg-bg-secondary/50 rounded-2xl grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
               {/* Left: Input */}
               <div className="lg:col-span-4 p-8 border-b lg:border-b-0 lg:border-r border-border/50 text-left space-y-6">
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold">Try the Engine</h3>
                    <p className="text-xs text-text-muted">Simulate the "Invisible Tax" (Inflation)</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                       <label htmlFor="starting-wealth" className="text-[10px] uppercase font-bold tracking-widest text-text-muted">Starting Wealth</label>
                       <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-accent-gold">$</span>
                          <input 
                            id="starting-wealth"
                            type="number" 
                            defaultValue="100000" 
                            aria-label="Enter starting wealth for simulation"
                            className="w-full bg-bg-primary/50 border border-border rounded-xl py-3 pl-8 pr-4 text-sm focus:border-accent-gold outline-hidden transition-all"
                          />
                       </div>
                    </div>
                    <div className="space-y-2">
                       <label htmlFor="inflation-rate" className="text-[10px] uppercase font-bold tracking-widest text-text-muted">Inflation Rate (%)</label>
                       <input 
                        id="inflation-rate"
                        type="range" 
                        min="1" 
                        max="20" 
                        defaultValue="6" 
                        aria-label="Adjust inflation rate"
                        className="w-full accent-accent-gold"
                       />
                       <div className="flex justify-between text-[10px] text-text-muted">
                          <span>1% (Stable)</span>
                          <span>20% (Elite Crisis)</span>
                       </div>
                    </div>
                    <button 
                      onClick={() => window.location.hash = "#dashboard"} 
                      className="w-full py-3 bg-accent-gold text-bg-void font-bold text-xs uppercase tracking-widest rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2"
                      aria-label="Unlock the full MacroPulse simulator"
                    >
                      Unlock Full Simulator <ChevronRight className="w-4 h-4" />
                    </button>
                    <p className="text-[9px] text-text-muted text-center italic">This is a preview of the full MacroPulse simulator found in the dashboard.</p>
                  </div>
               </div>

               {/* Right: Visual */}
               <div className="lg:col-span-8 p-8 flex flex-col gap-6">
                  <div className="flex justify-between items-start">
                     <div>
                        <div className="text-[10px] font-bold text-accent-gold uppercase tracking-widest mb-1">Impact Analysis</div>
                        <h4 className="text-2xl font-bold">Purchasing Power Erosion</h4>
                     </div>
                     <div className="bg-bg-void/50 px-3 py-1.5 rounded-lg border border-accent-gold/20 flex flex-col items-end">
                        <span className="text-[10px] text-text-muted uppercase tracking-tighter">10 Year Value</span>
                        <span className="text-xl font-mono font-bold text-accent-gold">$55,839</span>
                     </div>
                  </div>

                  <div className="flex-1 min-h-[160px] flex items-end gap-3 pt-4">
                    {[100, 92, 85, 78, 72, 66, 61, 56, 51, 47, 43].map((h, i) => (
                      <motion.div
                        key={i}
                        initial={{ height: 0 }}
                        animate={{ height: `${h}%` }}
                        transition={{ delay: 1 + i * 0.05, duration: 0.8 }}
                        className={cn(
                          "flex-1 rounded-t-md relative group",
                          i === 0 ? "bg-accent-gold" : "bg-accent-gold/20"
                        )}
                      >
                         <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[9px] font-mono text-text-muted opacity-0 group-hover:opacity-100 transition-opacity">
                           Y{i}
                         </div>
                      </motion.div>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div className="flex items-center gap-2 p-3 bg-bg-void/30 rounded-xl border border-border">
                        <div className="w-2 h-2 rounded-full bg-accent-gold" />
                        <span className="text-[9px] font-bold text-text-muted uppercase">Today's Value</span>
                     </div>
                     <div className="flex items-center gap-2 p-3 bg-bg-void/30 rounded-xl border border-border">
                        <div className="w-2 h-2 rounded-full bg-accent-gold/20" />
                        <span className="text-[9px] font-bold text-text-muted uppercase">Eroded Projection</span>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16">
          {[
            { label: "Community Learners", value: "50,000+", icon: "📚" },
            { label: "Total Wealth Simulated", value: "$2M+", icon: "💰" },
            { label: "Quiz Success Rate", value: "94%", icon: "🧠" }
          ].map((stat, i) => (
            <motion.div
              key={i}
              {...fadeInUp}
              transition={{ delay: i * 0.1 }}
              className="card p-8 text-center space-y-2 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-5 text-4xl">{stat.icon}</div>
              <div className="text-4xl font-mono font-bold text-accent-gold">{stat.value}</div>
              <div className="text-[10px] uppercase font-bold tracking-widest text-text-muted">{stat.label}</div>
            </motion.div>
          ))}
        </div>
        <p className="text-center text-[9px] text-text-muted/60 mt-8 uppercase tracking-widest italic">
          Figures above are illustrative demo metrics for project evaluation.
        </p>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              {...fadeInUp}
              transition={{ delay: i * 0.1 }}
              className="card card-hover p-6 flex flex-col items-center text-center gap-6 group"
            >
              <div className="w-16 h-16 rounded-2xl bg-bg-secondary flex items-center justify-center border border-border group-hover:border-accent-gold/40 transition-colors">
                {feature.icon}
              </div>
              <div className="space-y-3">
                <h3 className="text-xl font-bold tracking-tight">{feature.title}</h3>
                <p className="text-text-secondary text-xs leading-relaxed">{feature.desc}</p>
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
            { step: "03", title: "Track Your Progress", desc: "Wealth Architect shows your growth" }
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16">
          {[
            { text: "WealthWise Elite helped me understand SIPs. Now I invest every month!", author: "Priya S.", age: 24, role: "Software Engineer" },
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
        <p className="text-center text-[10px] text-text-muted/60 mt-12 uppercase tracking-widest">
          Testimonials are illustrative for education
        </p>
      </section>
    </div>
  );
}
