import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="bg-bg-primary/40 border-t border-white/[0.04] pt-20 pb-10 text-left">
      <div className="container mx-auto px-6 max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
          <div className="space-y-6">
            <Logo size="sm" />
            <p className="text-text-secondary text-xs leading-relaxed max-w-xs font-light">
              Empowering global financial literacy, one decision at a time. Your journey to structured wealth management begins here.
            </p>
            <div className="flex">
              <a 
                href="https://yash-choubey-student-developer-port.vercel.app/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-3.5 py-1.5 rounded-full bg-white/[0.02] text-accent-gold text-[9px] font-bold uppercase tracking-widest border border-white/[0.08] hover:border-accent-gold/30 hover:bg-white/[0.04] transition-all duration-300"
              >
                made by Code with yash 🚀
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-display font-medium text-sm uppercase tracking-[0.2em] text-text-primary mb-6">Quick Navigation</h4>
            <ul className="space-y-3.5">
              <li><a href="#home" className="text-text-secondary hover:text-accent-gold text-[10px] font-bold uppercase tracking-widest transition-colors duration-200">Home</a></li>
              <li><a href="#dashboard" className="text-text-secondary hover:text-accent-gold text-[10px] font-bold uppercase tracking-widest transition-colors duration-200">Dashboard</a></li>
              <li><a href="#budget" className="text-text-secondary hover:text-accent-gold text-[10px] font-bold uppercase tracking-widest transition-colors duration-200">Budget Architect</a></li>
              <li><a href="#simulator" className="text-text-secondary hover:text-accent-gold text-[10px] font-bold uppercase tracking-widest transition-colors duration-200">Investment Simulator</a></li>
              <li><a href="#quiz" className="text-text-secondary hover:text-accent-gold text-[10px] font-bold uppercase tracking-widest transition-colors duration-200">Wealth Quiz</a></li>
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="font-display font-medium text-sm uppercase tracking-[0.2em] text-text-primary">Global Impact</h4>
            <p className="text-text-secondary text-xs leading-relaxed max-w-xs font-light">
              Join thousands of learners worldwide mastering personal finance and economic simulation parameters within WealthWise Elite.
            </p>
            <div className="flex items-center gap-3 text-text-muted text-[10px] uppercase tracking-wider font-bold">
              <div className="flex -space-x-1.5">
                {['W', 'W', 'E', 'L'].map((char, i) => (
                  <div key={i} className="w-7 h-7 rounded-full border border-bg-primary bg-bg-secondary flex items-center justify-center text-[9px] font-black text-accent-gold shadow-sm">
                    {char}
                  </div>
                ))}
              </div>
              <span>+50k active learners</span>
            </div>
          </div>
        </div>

        <div className="pt-10 border-t border-white/[0.04] flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="text-text-muted text-[10px] uppercase tracking-wider font-medium">
            © WealthWise Elite · Educational simulator only · Device-local workspace
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 text-text-muted text-[9px] font-bold uppercase tracking-widest">
            <span>HTML5</span>
            <span>CSS3</span>
            <span>TypeScript</span>
            <span>Chart.js</span>
            <span>React</span>
          </div>
        </div>
        <div className="mt-6 text-center text-[8px] text-text-muted uppercase tracking-[0.25em] font-medium leading-relaxed max-w-3xl mx-auto opacity-60">
          Information is for educational parameters only. Always consult a qualified professional financial advisor prior to making real-world investment decisions.
        </div>
      </div>
    </footer>
  );
}
