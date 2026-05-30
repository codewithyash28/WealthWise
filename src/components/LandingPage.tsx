import { motion } from "motion/react";
import { ChevronRight, Play, CheckCircle2, TrendingUp, PieChart, Sparkles, BrainCircuit, ShieldCheck } from "lucide-react";
import { cn } from "../lib/utils";
import { Logo } from "./Logo";

export function LandingPage() {
  const fadeInUp = {
    initial: { opacity: 0, y: 15 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6, ease: "easeOut" as const }
  };

  const features = [
    { icon: <BrainCircuit className="w-6 h-6 text-accent-gold" />, title: "MacroPulse Engine", desc: "Simulate inflation & interest rate impacts on purchasing power in real-time." },
    { icon: <TrendingUp className="w-6 h-6 text-accent-emerald" />, title: "TrendMarket", desc: "Test trading psychology with simulated stocks tied to pop-culture trends." },
    { icon: <PieChart className="w-6 h-6 text-accent-blue" />, title: "LiveOrLease", desc: "Analyze the financial implications of renting vs buying with a dynamic math engine." },
    { icon: <Sparkles className="w-6 h-6 text-accent-gold-bright" />, title: "MockYield DeFi", desc: "Safely learn decentralized finance, liquidity provision, and yield farming mechanics." },
    { icon: <CheckCircle2 className="w-6 h-6 text-accent-emerald" />, title: "Mastery Alerts", desc: "Receive automated alerts detailing risk management opportunities as you learn." }
  ];

  return (
    <div className="space-y-24 md:space-y-36 pb-32">
      {/* Hero Section */}
      <section className="min-h-[90vh] flex flex-col items-center justify-center pt-24 px-6 text-center max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.02] border border-white/[0.04] text-accent-gold text-[9px] font-bold uppercase tracking-[0.2em] shadow-sm"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-accent-gold" /> Educational Simulator • Not Financial Advice
        </motion.div>

        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-8"
        >
          <Logo size="xl" className="justify-center" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-4xl sm:text-5xl md:text-7xl font-display leading-[1.15] mb-6 max-w-4xl tracking-tight"
        >
          <span className="block font-light text-text-primary">Master your money with</span>
          <span className="relative inline-block font-medium text-accent-gold italic pl-2 pr-2">
            WealthWise Elite.
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ delay: 0.8, duration: 1.2 }}
              className="absolute -bottom-1.5 left-0 right-0 h-[1.5px] bg-gradient-to-r from-accent-gold/0 via-accent-gold/40 to-accent-gold/0"
            />
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="text-text-secondary text-sm md:text-base max-w-2xl leading-relaxed mb-10"
        >
          A premium wealth architecture playground. Simulate real-world macroeconomic forces, master behavioral investments, and optimize asset allocation inside a secure, private, device-local workspace.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="flex flex-wrap justify-center gap-4 mb-12"
        >
          {[
            { icon: <BrainCircuit className="w-3.5 h-3.5 text-accent-gold" />, text: "Simulate Global Economics" },
            { icon: <TrendingUp className="w-3.5 h-3.5 text-accent-emerald" />, text: "Test Trading Psychology" },
            { icon: <Sparkles className="w-3.5 h-3.5 text-accent-blue" />, text: "Learn DeFi Essentials" }
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.02] border border-white/[0.04] text-text-secondary shadow-sm">
              {item.icon}
              <span className="text-[10px] font-bold uppercase tracking-wider">{item.text}</span>
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="flex flex-col sm:flex-row items-center gap-6 mb-16"
        >
          <div className="flex flex-col items-center gap-1.5">
            <a href="#dashboard" className="btn-primary text-xs tracking-wider uppercase px-8 py-3.5 w-full sm:w-auto flex items-center justify-center gap-2" aria-label="Enter the full learning dashboard">
              Start Learning <ChevronRight className="w-4 h-4" />
            </a>
            <span className="text-[8px] font-bold text-text-muted uppercase tracking-[0.2em] pointer-events-none">Full Dashboard Access</span>
          </div>
          
          <div className="flex flex-col items-center gap-1.5">
            <button 
              className="btn-secondary text-xs tracking-wider uppercase px-8 py-3.5 flex items-center justify-center gap-2 w-full sm:w-auto" 
              onClick={() => window.dispatchEvent(new CustomEvent('start-judge-tour'))}
              aria-label="Take a guided tour"
            >
              <Play className="w-3.5 h-3.5 fill-current" /> Take Tour
            </button>
            <span className="text-[8px] font-bold text-text-muted uppercase tracking-[0.2em] pointer-events-none">1-Minute Walkthrough</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="flex flex-wrap justify-center gap-8 text-text-muted text-[11px] uppercase tracking-widest font-medium"
        >
          <div className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-accent-emerald" /> No signup required</div>
          <div className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-accent-emerald" /> Works in any currency</div>
          <div className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-accent-emerald" /> 100% free</div>
        </motion.div>

        {/* Interactive Simulation Sneak Peek */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 1 }}
          className="mt-20 w-full max-w-4xl mx-auto"
        >
          <div className="card p-1 border-white/[0.03] shadow-[0_24px_60px_rgba(0,0,0,0.6)] overflow-hidden">
            <div className="bg-bg-secondary/40 rounded-2xl grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
               {/* Left: Input */}
               <div className="lg:col-span-4 p-8 border-b lg:border-b-0 lg:border-r border-white/[0.04] text-left space-y-6">
                  <div className="space-y-1">
                    <div className="text-[9px] font-bold text-accent-gold uppercase tracking-[0.2em]">Live Sandbox</div>
                    <h3 className="text-xl font-bold font-display">Try the Engine</h3>
                    <p className="text-xs text-text-secondary leading-relaxed">Simulate how inflation (the invisible tax) erodes your net worth over a decade.</p>
                  </div>
                  
                  <div className="space-y-5">
                    <div className="space-y-2">
                       <label htmlFor="starting-wealth" className="text-[9px] uppercase font-bold tracking-widest text-text-secondary">Starting Wealth</label>
                       <div className="relative">
                          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-accent-gold font-medium">$</span>
                          <input 
                            id="starting-wealth"
                            type="number" 
                            defaultValue="100000" 
                            aria-label="Enter starting wealth for simulation"
                            className="w-full bg-bg-primary/60 border border-white/[0.06] rounded-xl py-3 pl-8 pr-4 text-xs font-mono focus:border-accent-gold/40 focus:ring-1 focus:ring-accent-gold/10 outline-hidden transition-all duration-300"
                          />
                       </div>
                    </div>
                    <div className="space-y-2">
                       <label htmlFor="inflation-rate" className="text-[9px] uppercase font-bold tracking-widest text-text-secondary flex justify-between">
                         <span>Inflation Rate</span>
                         <span className="text-accent-gold font-mono">6%</span>
                       </label>
                       <input 
                        id="inflation-rate"
                        type="range" 
                        min="1" 
                        max="20" 
                        defaultValue="6" 
                        aria-label="Adjust inflation rate"
                         className="w-full h-1 bg-white/[0.05] rounded-lg appearance-none cursor-pointer accent-accent-gold outline-none"
                       />
                       <div className="flex justify-between text-[8px] font-bold text-text-muted uppercase tracking-wider">
                          <span>1% (Stable)</span>
                          <span>20% (Crisis)</span>
                       </div>
                    </div>
                    <button 
                      onClick={() => window.location.hash = "#dashboard"} 
                      className="w-full py-3 bg-gradient-to-br from-[#E2C9A1] via-[#C5A880] to-[#9F8259] text-bg-void font-bold text-[10px] uppercase tracking-widest rounded-xl hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-1.5"
                      aria-label="Unlock the full MacroPulse simulator"
                    >
                      Unlock Full Simulator <ChevronRight className="w-4 h-4" />
                    </button>
                    <p className="text-[8px] text-text-muted text-center italic">Device local computation. No data is sent to external servers.</p>
                  </div>
               </div>

               {/* Right: Visual */}
               <div className="lg:col-span-8 p-8 flex flex-col justify-between gap-6">
                  <div className="flex justify-between items-start">
                     <div className="text-left">
                        <div className="text-[9px] font-bold text-accent-gold uppercase tracking-[0.2em] mb-1">Erosion Projection</div>
                        <h4 className="text-2xl font-bold font-display">Purchasing Power Loss</h4>
                     </div>
                     <div className="bg-white/[0.02] border border-white/[0.04] px-4 py-2 rounded-xl flex flex-col items-end shadow-sm">
                        <span className="text-[8px] font-bold text-text-muted uppercase tracking-widest mb-0.5">Value after 10 years</span>
                        <span className="text-lg font-mono font-bold text-accent-gold">$55,839</span>
                     </div>
                  </div>

                  <div className="flex-1 min-h-[160px] flex items-end gap-2.5 pt-6 pb-2">
                    {[100, 92, 85, 78, 72, 66, 61, 56, 51, 47, 43].map((h, i) => (
                      <motion.div
                        key={i}
                        initial={{ height: 0 }}
                        animate={{ height: `${h}%` }}
                        transition={{ delay: 0.6 + i * 0.05, duration: 0.8, ease: "easeOut" }}
                        className={cn(
                          "flex-1 rounded-md relative group transition-all duration-300",
                          i === 0 
                            ? "bg-gradient-to-t from-[#9F8259] to-[#E2C9A1] shadow-[0_0_15px_rgba(197,168,128,0.15)]" 
                            : "bg-white/[0.04] hover:bg-white/[0.1] hover:border-accent-gold/20 border border-transparent"
                        )}
                      >
                         <div className="absolute -top-7 left-1/2 -translate-x-1/2 text-[9px] font-mono font-semibold text-text-secondary bg-bg-secondary border border-white/[0.04] px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-md">
                           Y{i}
                         </div>
                      </motion.div>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div className="flex items-center gap-2 p-3 bg-white/[0.01] rounded-xl border border-white/[0.04]">
                        <div className="w-2 h-2 rounded-full bg-accent-gold" />
                        <span className="text-[9px] font-bold text-text-secondary uppercase tracking-widest">Initial Capital</span>
                     </div>
                     <div className="flex items-center gap-2 p-3 bg-white/[0.01] rounded-xl border border-white/[0.04]">
                        <div className="w-2 h-2 rounded-full bg-white/[0.1]" />
                        <span className="text-[9px] font-bold text-text-secondary uppercase tracking-widest">Eroded Capital</span>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-6 max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {[
            { label: "Community Learners", value: "50,000+", icon: "📚" },
            { label: "Total Wealth Simulated", value: "$2M+", icon: "💰" },
            { label: "Quiz Success Rate", value: "94%", icon: "🧠" }
          ].map((stat, i) => (
            <motion.div
              key={i}
              {...fadeInUp}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              className="card p-8 text-center space-y-2 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-5 text-4xl">{stat.icon}</div>
              <div className="text-4xl font-mono font-bold text-accent-gold">{stat.value}</div>
              <div className="text-[9px] uppercase font-bold tracking-[0.2em] text-text-secondary">{stat.label}</div>
            </motion.div>
          ))}
        </div>
        <p className="text-center text-[9px] text-text-muted mt-8 uppercase tracking-widest italic opacity-60">
          Figures above are illustrative metrics for education.
        </p>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-6 max-w-5xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              {...fadeInUp}
              transition={{ delay: i * 0.08, duration: 0.6 }}
              className="card card-hover p-6 flex flex-col items-center text-center gap-6 group"
            >
              <div className="w-12 h-12 rounded-2xl bg-white/[0.02] border border-white/[0.04] flex items-center justify-center group-hover:border-accent-gold/30 transition-colors shadow-inner">
                {feature.icon}
              </div>
              <div className="space-y-2.5">
                <h3 className="text-base font-bold tracking-tight font-display text-text-primary">{feature.title}</h3>
                <p className="text-text-secondary text-[11px] leading-relaxed">{feature.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-6 text-center max-w-5xl">
        <motion.h2 {...fadeInUp} className="text-3xl md:text-4xl font-display font-medium mb-16 tracking-tight">How It Works</motion.h2>
        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Connecting Line */}
          <div className="absolute top-1/2 left-0 w-full h-[1px] border-t border-dashed border-white/[0.06] -translate-y-1/2 hidden md:block" />
          
          {[
            { step: "01", title: "Choose Your Currency", desc: "Select USD, EUR, GBP, INR, or JPY to instantly localize all simulations and dashboard figures." },
            { step: "02", title: "Learn & Simulate", desc: "Engage with all four comprehensive macro and micro simulators safely with real-time feedback loop." },
            { step: "03", title: "Track Your Progress", desc: "Unlock achievements, grow your Financial Literacy rating, and secure your Elite Mastery Tier." }
          ].map((step, i) => (
            <motion.div
              key={i}
              {...fadeInUp}
              transition={{ delay: i * 0.15, duration: 0.6 }}
              className="relative z-10 space-y-4"
            >
              <div className="w-11 h-11 rounded-full bg-bg-secondary border border-white/[0.08] text-accent-gold font-bold text-base flex items-center justify-center mx-auto shadow-md">
                {step.step}
              </div>
              <div className="space-y-1.5">
                <h3 className="text-lg font-bold font-display text-text-primary">{step.title}</h3>
                <p className="text-text-secondary text-xs leading-relaxed max-w-xs mx-auto">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="container mx-auto px-6 max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { text: "WealthWise Elite completely demystified capital growth and inflation erosion. The simulators are insanely interactive and visually clear.", author: "Priya S.", age: 24, role: "Software Engineer" },
            { text: "The Rent vs Buy decision engine is the single most objective calculator I have ever seen. It completely changed my long-term timeline.", author: "Marcus T.", age: 28, role: "Marketing Manager" },
            { text: "A breathtakingly premium workspace that operates entirely on my device. No complex signups, just instant academic value in GBP.", author: "Sophie L.", age: 22, role: "University Student" }
          ].map((t, i) => (
            <motion.div
              key={i}
              {...fadeInUp}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              className="card p-8 flex flex-col justify-between border-white/[0.03]"
            >
              <div className="space-y-4 text-left">
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map(s => <span key={s} className="text-accent-gold text-sm">★</span>)}
                </div>
                <p className="text-base font-display italic font-light text-text-primary leading-relaxed">"{t.text}"</p>
              </div>
              <div className="mt-8 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent-gold to-accent-emerald flex items-center justify-center font-bold text-[11px] text-bg-void">
                  {t.author[0]}
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-text-primary">{t.author}, {t.age}</div>
                  <div className="text-[9px] text-text-muted font-bold uppercase tracking-wider">{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        <p className="text-center text-[10px] text-text-muted mt-12 uppercase tracking-widest opacity-60">
          User reactions are curated simulated reflections of academic feedback.
        </p>
      </section>
    </div>
  );
}
