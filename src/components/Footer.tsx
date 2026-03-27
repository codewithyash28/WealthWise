import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="bg-bg-primary border-t border-border pt-20 pb-10">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
          <div className="space-y-6">
            <Logo />
            <p className="text-text-secondary leading-relaxed max-width-xs">
              Empowering global financial literacy, one decision at a time. Your journey to financial freedom starts here.
            </p>
            <div className="flex gap-4">
              <a 
                href="https://yashchoubey.netlify.app/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-3 py-1 rounded-full bg-accent-gold/10 text-accent-gold text-xs font-semibold border border-accent-gold/20 hover:bg-accent-gold/20 transition-all"
              >
                made by Code with yash 🚀
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-display font-bold text-lg mb-6">Quick Links</h4>
            <ul className="space-y-4">
              <li><a href="#home" className="text-text-secondary hover:text-accent-gold transition-colors">Home</a></li>
              <li><a href="#dashboard" className="text-text-secondary hover:text-accent-gold transition-colors">Dashboard</a></li>
              <li><a href="#budget" className="text-text-secondary hover:text-accent-gold transition-colors">Budget Architect</a></li>
              <li><a href="#simulator" className="text-text-secondary hover:text-accent-gold transition-colors">Investment Simulator</a></li>
              <li><a href="#quiz" className="text-text-secondary hover:text-accent-gold transition-colors">Wealth Quiz</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-bold text-lg mb-6">Global Impact</h4>
            <p className="text-text-secondary mb-6">
              Join learners worldwide mastering their personal finances with WealthWise Elite.
            </p>
            <div className="flex items-center gap-2 text-text-muted text-sm">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-bg-primary bg-bg-card flex items-center justify-center text-[10px] font-bold">
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <span>+50k active learners</span>
            </div>
          </div>
        </div>

        <div className="pt-10 border-t border-border flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="text-text-muted text-sm">
            © WealthWise Elite · Educational content only · Not financial advice
          </div>
          <div className="flex items-center gap-4 text-text-muted text-xs">
            <span>HTML5</span>
            <span>CSS3</span>
            <span>JavaScript</span>
            <span>Chart.js</span>
            <span>React</span>
          </div>
        </div>
        <div className="mt-6 text-center text-[10px] text-text-muted uppercase tracking-widest">
          Information is for learning purposes. Always consult a qualified financial advisor for personal investment decisions.
        </div>
      </div>
    </footer>
  );
}
