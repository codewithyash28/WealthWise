import { motion } from "motion/react";
import { BookOpen, Code2, Globe, Cpu, Zap, ShieldCheck, Sparkles, Trophy, GitBranch, Terminal, Brain, Users, Lock, Server, ShieldAlert } from "lucide-react";
import { cn } from "../lib/utils";

const TIMELINE = [
  {
    stage: "The Core Blueprint",
    title: "AuraVest AI Concept",
    desc: "The original vision for a five-module FinTech mentor focused on macro simulation and Gen-Z trading psychology.",
    icon: <Cpu className="w-5 h-5" />,
    color: "text-accent-purple"
  },
  {
    stage: "Implementation Evolution",
    title: "WealthWise Elite Implementation",
    desc: "Refined the visual language to Prestige Gold and Obsidian Void, ensuring brand consistency across all 15+ sub-components.",
    icon: <Zap className="w-5 h-5" />,
    color: "text-accent-gold"
  },
  {
    stage: "Judge-Ready Features",
    title: "Gamification & Walkthroughs",
    desc: "Added Judge Mode, Onboarding Flows, and real-time achievement tracking to turn the prototype into a production-grade submission.",
    icon: <Trophy className="w-5 h-5" />,
    color: "text-accent-blue"
  }
];

const SCENARIOS = [
  {
    user: "Advay, 21 (India)",
    context: "Final-year student, starting a job at ₹50k/month.",
    goal: "Understand how inflation affects his entry-level salary over 5 years.",
    path: [
      "Uses #macropulse to simulate 7% inflation.",
      "Discovers his 'real' purchasing power drops by ~30% if he doesn't invest.",
      "Switches to #mockyield to learn about inflation-hedging assets."
    ]
  },
  {
    user: "Sarah, 24 (USA)",
    context: "Working professional, considering a $2500/mo rental.",
    goal: "Decide if buying a home is viable in a high-rate environment.",
    path: [
      "Input rent vs. mortgage decimals in #liveorlease.",
      "Simulates the 'opportunity cost' of the down payment.",
      "Learns that renting + investing the difference currently yields higher 'Pure Worth'."
    ]
  }
];

export function CaseStudy() {
  return (
    <div className="space-y-12 py-12">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-gold/10 border border-accent-gold/20 text-accent-gold text-xs font-bold uppercase tracking-widest">
          <BookOpen className="w-3 h-3" /> Developer Case Study
        </div>
        <h2 className="text-5xl font-display font-bold">From Prompt to Production</h2>
        <p className="text-text-secondary max-w-2xl mx-auto text-lg italic">
          "This application is designed as a complete, submission-ready educational suite and developer case study."
        </p>
      </div>

      {/* The Transformation Card */}
      <div className="card p-1 border-accent-gold/20 overflow-hidden">
        <div className="bg-bg-secondary/40 grid grid-cols-1 md:grid-cols-2">
           <div className="p-8 border-b md:border-b-0 md:border-r border-border/50">
              <h3 className="text-xl font-bold flex items-center gap-2 mb-6">
                <GitBranch className="w-5 h-5 text-accent-gold" /> Branding Evolution
              </h3>
              <div className="space-y-8">
                 <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-xl bg-bg-void border border-border flex items-center justify-center shrink-0 grayscale opacity-50">
                       <span className="font-bold text-xs uppercase tracking-tighter">AuraVest</span>
                    </div>
                    <div>
                       <h4 className="font-bold text-text-muted">AuraVest AI (Original Branding)</h4>
                       <p className="text-xs text-text-muted leading-relaxed">Early prototype phase branding focusing on the 'Aura' of automated investing. While strong, the name shifted to meet broader 'Elite' market positioning.</p>
                    </div>
                 </div>
                 <div className="relative border-l-2 border-dashed border-accent-gold/30 ml-6 h-8" />
                 <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-xl bg-accent-gold/20 border border-accent-gold flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(240,180,41,0.3)]">
                       <span className="font-black text-xs uppercase tracking-tighter text-accent-gold">WW Elite</span>
                    </div>
                    <div>
                       <h4 className="font-bold text-accent-gold">WealthWise Elite (Final Release)</h4>
                       <p className="text-xs text-text-secondary leading-relaxed">Rebranded for a global hacker audience. The identity now aligns with professional wealth management dashboards, with an 'Elite' emphasis on high financial literacy levels.</p>
                    </div>
                 </div>
              </div>
           </div>
           
           <div className="p-8 space-y-6">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Terminal className="w-5 h-5 text-accent-emerald" /> Core Tech Stack
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { name: "React 18", sub: "Vite + TS" },
                  { name: "Tailwind CSS", sub: "Utility Architecture" },
                  { name: "Framer Motion", sub: "Motion/React" },
                  { name: "Gemini Pro", sub: "Structured Prompting" },
                  { name: "Lucide React", sub: "Icon System" },
                  { name: "Local Storage", sub: "Privacy Persistence" }
                ].map((tech) => (
                  <div key={tech.name} className="p-4 rounded-xl bg-bg-void/50 border border-border">
                     <div className="text-xs font-bold text-text-primary">{tech.name}</div>
                     <div className="text-[10px] text-text-muted font-mono uppercase tracking-tighter">{tech.sub}</div>
                  </div>
                ))}
              </div>
              <div className="p-4 rounded-xl bg-accent-emerald/5 border border-accent-emerald/20 flex gap-3 items-center">
                 <ShieldCheck className="w-5 h-5 text-accent-emerald" />
                 <p className="text-[10px] leading-relaxed text-accent-emerald/80 italic font-bold">"Zero server-side data extraction. All financial data remains encrypted in your local browser sandbox."</p>
              </div>
           </div>
        </div>
      </div>

      {/* Real World Scenarios */}
      <div className="space-y-6 text-center">
         <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-blue/10 border border-accent-blue/20 text-accent-blue text-[10px] font-bold uppercase tracking-widest">
            <Users className="w-3 h-3" /> Impact Scenarios
         </div>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
            {SCENARIOS.map((s, i) => (
               <div key={i} className="card p-8 space-y-6 border-accent-blue/10">
                  <div className="space-y-2">
                     <h4 className="text-xl font-bold text-accent-blue">{s.user}</h4>
                     <p className="text-xs text-text-muted italic">{s.context}</p>
                  </div>
                  <div className="p-4 bg-bg-secondary/40 rounded-xl border border-border">
                     <div className="text-[10px] font-black uppercase text-accent-blue/60 mb-1">Learning Objective</div>
                     <p className="text-xs leading-relaxed">{s.goal}</p>
                  </div>
                  <div className="space-y-3">
                     <div className="text-[10px] font-black uppercase text-text-muted">Mastery Path</div>
                     {s.path.map((step, si) => (
                        <div key={si} className="flex gap-3 items-start">
                           <div className="w-5 h-5 rounded-full bg-accent-blue/10 text-accent-blue flex items-center justify-center text-[10px] font-bold shrink-0">{si + 1}</div>
                           <p className="text-xs text-text-secondary leading-normal">{step}</p>
                        </div>
                     ))}
                  </div>
               </div>
            ))}
         </div>
      </div>

      {/* Under the Hood */}
      <div className="card p-8 bg-linear-to-br from-bg-secondary to-bg-card border-border/50 text-center space-y-6">
         <div className="space-y-2">
            <div className="flex items-center justify-center gap-2 text-accent-emerald uppercase tracking-[0.3em] font-bold text-[10px]">
               <Lock className="w-3 h-3" /> Under The Hood: Security & Scaling
            </div>
            <h3 className="text-2xl font-bold italic">Architected for the Real World</h3>
         </div>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-2">
               <div className="w-10 h-10 rounded-full bg-bg-void border border-border flex items-center justify-center mx-auto text-accent-emerald">
                  <ShieldAlert className="w-5 h-5" />
               </div>
               <h5 className="font-bold text-sm">LLM Safety Gates</h5>
               <p className="text-[10px] text-text-secondary leading-relaxed px-4">System prompts strictly forbid direct stock recommendations, ensuring compliance with educational advisory guidelines.</p>
            </div>
            <div className="space-y-2">
               <div className="w-10 h-10 rounded-full bg-bg-void border border-border flex items-center justify-center mx-auto text-accent-gold text-white">
                  <Server className="w-5 h-5" />
               </div>
               <h5 className="font-bold text-sm">State Persistence</h5>
               <p className="text-[10px] text-text-secondary leading-relaxed px-4">Uses specialized LocalStorage hooks for instant-load reactivity without the cost overhead of a database for prototype phase.</p>
            </div>
            <div className="space-y-2">
               <div className="w-10 h-10 rounded-full bg-bg-void border border-border flex items-center justify-center mx-auto text-accent-blue">
                  <Globe className="w-5 h-5" />
               </div>
               <h5 className="font-bold text-sm">API Context Control</h5>
               <p className="text-[10px] text-text-secondary leading-relaxed px-4">Managed context windows for Gemini Pro ensure the 'Elite Mentor' maintains session memory without exceeding rate limits.</p>
            </div>
         </div>
      </div>

      {/* Timeline / Roadmap */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {TIMELINE.map((item, i) => (
          <div key={i} className="card p-6 space-y-4 hover:border-accent-gold/40 transition-all group">
             <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest leading-none">{item.stage}</span>
                <div className={cn("w-10 h-10 rounded-lg bg-bg-secondary flex items-center justify-center group-hover:scale-110 transition-transform", item.color)}>
                  {item.icon}
                </div>
             </div>
             <h4 className="font-bold">{item.title}</h4>
             <p className="text-xs text-text-secondary leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>

      {/* Footer / Links */}
      <div className="card p-12 text-center space-y-8 bg-linear-to-b from-bg-secondary/20 to-bg-card">
         <div className="space-y-2">
            <h3 className="text-2xl font-bold">Explore the Source</h3>
            <p className="text-text-secondary max-w-lg mx-auto">This project is a testament to what's possible with a 'Prompt-First' development workflow. Check out my other work or connect for collaborations.</p>
         </div>
         <div className="flex flex-wrap justify-center gap-4">
            <a 
              href="https://yash-choubey-student-developer-port.vercel.app/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-8 py-3 bg-accent-gold text-bg-void font-bold rounded-xl hover:opacity-90 transition-all flex items-center gap-2"
            >
              <Globe className="w-4 h-4" /> Portfolio Site
            </a>
            <a 
              href="https://github.com/yashchoubey" 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-8 py-3 bg-bg-secondary border border-border hover:bg-bg-primary text-text-primary font-bold rounded-xl transition-all flex items-center gap-2"
            >
              <Code2 className="w-4 h-4" /> GitHub Profile
            </a>
         </div>
         <p className="text-[10px] text-text-muted uppercase tracking-[0.2em] font-bold">
           Made with ❤️ for the AI Studio Hackathon
         </p>
      </div>
    </div>
  );
}
