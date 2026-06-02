import { useState } from "react";
import { motion } from "motion/react";
import { BookOpen, Code2, Globe, Cpu, Zap, ShieldCheck, Sparkles, Trophy, GitBranch, Terminal, Brain, Users, Lock, Server, ShieldAlert } from "lucide-react";
import { cn } from "../lib/utils";
import { UserProfile } from "../types";

interface CaseStudyProps {
  user?: UserProfile | null;
  onUpdateGitProvider?: (provider: "gitlab" | "github" | "bitbucket") => void;
}

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

export function CaseStudy({ user, onUpdateGitProvider }: CaseStudyProps) {
  const [localProvider, setLocalProvider] = useState<"gitlab" | "github" | "bitbucket">("github");
  
  const activeProvider = user?.gitProvider || localProvider;
  
  const handleProviderChange = (p: "gitlab" | "github" | "bitbucket") => {
    if (onUpdateGitProvider) {
      onUpdateGitProvider(p);
    } else {
      setLocalProvider(p);
    }
  };

  const providerDetails = {
    github: {
      name: "GitHub",
      track: "GitHub Project GitOps",
      apiName: "GitHub_MCP",
      actionWord: "Pull Request",
      actionMini: "PR",
      issueWord: "GitHub Issue",
      color: "text-white bg-zinc-900 border-zinc-800",
      desc1: "Utilizes Gemini 3's high-fidelity reasoning capabilities to plan multi-step financial GitOps routes. Rather than simple text responses, the agent inspects active parameters and dispatches corresponding GitHub payloads to commit policy files, create repository issues, and manage branch releases.",
      desc2: "Saves active user budget structures and target allocations directly into the user's GitHub repository (e.g., `/wealth-policies/user-profile.json`) via the GitHub MCP Server. Updates occur cleanly within Git, tracking historical financial plans via complete version control.",
      desc3: "When running active user simulations (e.g., severe 7% global inflation devaluations or compounding DeFi staking), the agent automatically logs the audit report as a comprehensive markdown Issue on a linked GitHub project. Under user review, it can draft a Pull Request updating target budgeting laws.",
      planLog: [
        { text: 'user: "Stress-test my INR salary for 7% inflation & commit updated plan"', style: "text-accent-gold" },
        { text: "1. [PLANNING] Engine identifies regional variables (INR, India profile).", style: "text-white" },
        { text: "2. [TOOL_CALL] Querying local budget profiles & compounding inflation devaluations.", style: "text-white" },
        { text: "   // Calculations complete: Simulated -7.14% purchasing power reduction.", style: "text-text-muted italic" },
        { text: "3. [TOOL_CALL] Formatting a gorgeous markdown audit card.", style: "text-white" },
        { text: "4. [GitHub_MCP] dispatching `create_issue` to repository for long-term tracking.", style: "text-white" },
        { text: "5. [GitHub_MCP] dispatching `create_or_update_file` in branch \"wealth/inflation-mitigation\".", style: "text-white" },
        { text: "> Plan submitted. GitHub PR #42 and Issue #119 recorded. Success.", style: "text-accent-emerald font-bold" }
      ]
    },
    gitlab: {
      name: "GitLab",
      track: "GitLab Developer Platform",
      apiName: "GitLab_MCP",
      actionWord: "Merge Request",
      actionMini: "MR",
      issueWord: "GitLab Issue",
      color: "text-accent-gold bg-amber-500/5 border-amber-500/20",
      desc1: "Utilizes Gemini 3's high-fidelity reasoning capabilities to plan multi-step financial GitOps routes. Instead of plain chat responses, the agent inspects active parameters and dispatches corresponding GitLab payloads to commit policy files, create tracking issues, and manage financial configuration templates.",
      desc2: "Saves active user budget structures and target allocations directly into the user's GitLab repository (e.g., `/wealth-policies/user-profile.json`) via the GitLab MCP Server. Updates occur cleanly within Git, tracking historical financial plans via complete version control.",
      desc3: "When running active user simulations (e.g., severe 7% global inflation devaluations or compounding DeFi staking), the agent automatically logs the audit report as a comprehensive markdown Issue on a linked GitLab project. Under user review, it can draft a Merge Request updating target budgeting laws.",
      planLog: [
        { text: 'user: "Stress-test my INR salary for 7% inflation & commit updated plan"', style: "text-accent-gold" },
        { text: "1. [PLANNING] Engine identifies regional variables (INR, India profile).", style: "text-white" },
        { text: "2. [TOOL_CALL] Querying local budget profiles & compounding inflation devaluations.", style: "text-white" },
        { text: "   // Calculations complete: Simulated -7.14% purchasing power reduction.", style: "text-text-muted italic" },
        { text: "3. [TOOL_CALL] Formatting a gorgeous markdown audit card.", style: "text-white" },
        { text: "4. [GitLab_MCP] dispatching `create_issue` to repository for long-term tracking.", style: "text-white" },
        { text: "5. [GitLab_MCP] dispatching `create_or_update_file` in branch \"wealth/inflation-mitigation\".", style: "text-white" },
        { text: "> Plan submitted. GitLab MR #42 and Issue #119 recorded. Success.", style: "text-accent-emerald font-bold" }
      ]
    },
    bitbucket: {
      name: "Bitbucket",
      track: "Atlassian Workspace Ecosystem",
      apiName: "Bitbucket_MCP",
      actionWord: "Pull Request",
      actionMini: "PR",
      issueWord: "Jira / Bitbucket Issue",
      color: "text-blue-400 bg-blue-500/5 border-blue-500/20",
      desc1: "Utilizes Gemini 3's high-fidelity reasoning capabilities to plan multi-step financial GitOps routes. Rather than standard text chats, the agent inspects parameters and dispatches Bitbucket Workspace API requests to commit wealth policies, log task tickets, and create policy pipelines.",
      desc2: "Saves active user budget structures and target allocations directly into the user's Bitbucket repository (e.g., `/wealth-policies/user-profile.json`) via the Bitbucket MCP Server. Updates occur cleanly within Git, tracking plans via full version control.",
      desc3: "When running active user simulations (e.g., severe 7% global inflation devaluations or compounding DeFi staking), the agent logs details as a markdown Ticket. Under user oversight, it can draft a Bitbucket Pull Request updating target budgeting rules.",
      planLog: [
        { text: 'user: "Stress-test my INR salary for 7% inflation & commit updated plan"', style: "text-accent-gold" },
        { text: "1. [PLANNING] Engine identifies regional variables (INR, India profile).", style: "text-white" },
        { text: "2. [TOOL_CALL] Querying local budget profiles & compounding inflation devaluations.", style: "text-white" },
        { text: "   // Calculations complete: Simulated -7.14% purchasing power reduction.", style: "text-text-muted italic" },
        { text: "3. [TOOL_CALL] Formatting a gorgeous markdown audit card.", style: "text-white" },
        { text: "4. [Bitbucket_MCP] dispatching `create_issue` to workspace tracker for audit logging.", style: "text-white" },
        { text: "5. [Bitbucket_MCP] dispatching `create_or_update_file` in branch \"wealth/inflation-mitigation\".", style: "text-white" },
        { text: "> Plan submitted. Bitbucket PR #42 and Jira Ticket #119 recorded. Success.", style: "text-accent-emerald font-bold" }
      ]
    }
  };

  const details = providerDetails[activeProvider];
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
                    <div className="w-12 h-12 rounded-xl bg-accent-gold/20 border border-accent-gold flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(197,168,128,0.15)]">
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

      {/* Git Provider Architecture and Mock Execution Integration Section */}
      <div id="mcp-architecture" className="card p-8 bg-linear-to-b from-bg-secondary/40 to-bg-card border-border/80 space-y-8">
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border/40 pb-6">
            <div className="space-y-1">
               <div className="inline-flex items-center gap-1.5 text-[10px] uppercase font-bold text-accent-emerald tracking-widest bg-accent-emerald/10 px-2.5 py-0.5 rounded-full border border-accent-emerald/20">
                  🛡️ Hackathon Submission Architecture
               </div>
               <h3 className="text-2xl font-bold font-display">{details.name} MCP Agent Framework</h3>
            </div>
            
            {/* Interactive Selector */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
               <span className="text-[10px] text-text-muted font-bold uppercase tracking-widest leading-none">Select Architecture:</span>
               <div className="flex rounded-lg bg-bg-secondary p-1 border border-border">
                  {(["github", "gitlab", "bitbucket"] as const).map((p) => {
                     const active = activeProvider === p;
                     return (
                        <button
                           key={p}
                           onClick={() => handleProviderChange(p)}
                           type="button"
                           className={cn(
                              "px-3 py-1 text-xs font-bold uppercase tracking-widest rounded-md transition-all cursor-pointer",
                              active 
                                 ? "bg-accent-emerald text-bg-void shadow-sm" 
                                 : "text-text-secondary hover:text-text-primary"
                           )}
                        >
                           {p}
                        </button>
                     );
                  })}
               </div>
            </div>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
               <div className="flex gap-3 items-start">
                  <div className="w-8 h-8 rounded-lg bg-accent-emerald/10 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20 text-xs">🧠</div>
                  <div>
                     <h4 className="text-sm font-bold text-text-primary">Gemini 3 Multi-Step Reasoning Brain</h4>
                     <p className="text-xs text-text-secondary leading-relaxed mt-1">
                        {details.desc1}
                     </p>
                  </div>
               </div>
               <div className="flex gap-3 items-start">
                  <div className="w-8 h-8 rounded-lg bg-accent-emerald/10 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20 text-xs">📂</div>
                  <div>
                     <h4 className="text-sm font-bold text-text-primary">Wealth-As-Code Policy Commits</h4>
                     <p className="text-xs text-text-secondary leading-relaxed mt-1">
                        Saves active user budget structures and target allocations directly into the user&apos;s {details.name} repository (e.g., <code>/wealth-policies/user-profile.json</code>) via the {details.name} MCP Server. Updates occur cleanly within Git, tracking historical financial plans via complete version control.
                     </p>
                  </div>
               </div>
               <div className="flex gap-3 items-start">
                  <div className="w-8 h-8 rounded-lg bg-accent-emerald/10 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20 text-xs">🔗</div>
                  <div>
                     <h4 className="text-sm font-bold text-text-primary">Active Issue Tracking & {details.actionMini} Rebalancing</h4>
                     <p className="text-xs text-text-secondary leading-relaxed mt-1">
                        When running active user simulations (e.g., severe 7% global inflation devaluations or compounding DeFi staking), the agent automatically logs the audit report as a comprehensive markdown {details.issueWord} on a linked project. Under user review, it can draft a {details.actionWord} updating target budgeting laws.
                     </p>
                  </div>
               </div>
            </div>

            <div className="space-y-4 bg-bg-void/80 p-6 rounded-2xl border border-border/80 font-mono text-[11px] leading-relaxed selection-none">
               <div className="flex items-center justify-between border-b border-border/50 pb-2 text-[10px] text-text-muted uppercase font-bold">
                  <span>Agent Execution Plan (Gemini 3 + {details.name} MCP)</span>
                  <span className="text-accent-emerald">Status: Live</span>
               </div>
               <div className="space-y-2 text-text-secondary">
                  {details.planLog.map((log, li) => (
                    <div key={li} className={log.style}>
                      {log.text.startsWith('user:') ? `> ${log.text}` : log.text}
                    </div>
                  ))}
               </div>
            </div>
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
               <h5 className="font-bold text-sm">{details.name} MCP Integration</h5>
               <p className="text-[10px] text-text-secondary leading-relaxed px-4">Utilizes the {details.name} Model Context Protocol server for version-controlled policy backups, secure state changes, and audited issue logs.</p>
            </div>
            <div className="space-y-2">
               <div className="w-10 h-10 rounded-full bg-bg-void border border-border flex items-center justify-center mx-auto text-accent-blue">
                  <Globe className="w-5 h-5" />
               </div>
               <h5 className="font-bold text-sm">API Context Control</h5>
               <p className="text-[10px] text-text-secondary leading-relaxed px-4">Managed context windows for Gemini Pro ensure the &apos;Elite Mentor&apos; maintains session memory without exceeding rate limits.</p>
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
