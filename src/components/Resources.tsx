import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { BookOpen, ExternalLink, ChevronDown, ChevronUp, Search, Info } from "lucide-react";
import { cn } from "../lib/utils";

const BOOKS = [
  { title: "The Psychology of Money", author: "Morgan Housel", desc: "Why smart people make dumb money decisions", color: "bg-accent-gold" },
  { title: "I Will Teach You to Be Rich", author: "Ramit Sethi", desc: "A 6-week program to get your finances in order", color: "bg-accent-emerald" },
  { title: "The Intelligent Investor", author: "Benjamin Graham", desc: "The definitive book on value investing by Buffett's mentor", color: "bg-accent-blue" },
  { title: "Rich Dad Poor Dad", author: "Robert Kiyosaki", desc: "The importance of financial education and assets", color: "bg-accent-purple" },
  { title: "Your Money or Your Life", author: "Vicki Robin", desc: "Transforming your relationship with money", color: "bg-accent-orange" },
  { title: "A Random Walk Down Wall Street", author: "Burton Malkiel", desc: "Why index funds beat active management", color: "bg-accent-red" }
];

const GLOSSARY = [
  { term: "Asset", def: "Anything of value that can be converted into cash. Examples include cash, stocks, bonds, real estate, and personal property." },
  { term: "Liability", def: "A financial obligation or debt that you owe to another person or institution. Examples include mortgages, car loans, and credit card balances." },
  { term: "Net Worth", def: "The total value of everything you own (assets) minus everything you owe (liabilities). It's a key measure of financial health." },
  { term: "Portfolio", def: "A collection of financial investments like stocks, bonds, commodities, cash, and cash equivalents, including closed-end funds and exchange traded funds (ETFs)." },
  { term: "Diversification", def: "The strategy of spreading your investments across various asset classes to reduce risk. It's the 'don't put all your eggs in one basket' approach." },
  { term: "Compound Interest", def: "Interest calculated on the initial principal and also on the accumulated interest of previous periods." },
  { term: "CAGR", def: "Compound Annual Growth Rate. The mean annual growth rate of an investment over a specified period of time longer than one year." },
  { term: "Expense Ratio", def: "The annual fee that all funds or ETFs charge their shareholders. It is expressed as a percentage of the fund's average net assets." },
  { term: "Index Fund", def: "A type of mutual fund or exchange-traded fund (ETF) with a portfolio constructed to match or track the components of a financial market index." },
  { term: "ETF", def: "Exchange-Traded Fund. A type of pooled investment security that operates much like a mutual fund but can be bought and sold on a stock exchange." },
  { term: "P/E Ratio", def: "Price-to-Earnings ratio. A valuation ratio of a company's current share price compared to its per-share earnings." },
  { term: "Dividend", def: "A distribution of a portion of a company's earnings, decided by the board of directors, paid to a class of its shareholders." },
  { term: "Bull Market", def: "A market in which share prices are rising, encouraging buying." },
  { term: "Bear Market", def: "A market in which prices are falling, encouraging selling." },
  { term: "Liquidity", def: "The ease with which an asset, or security, can be converted into ready cash without affecting its market price." },
  { term: "Dollar-Cost Averaging", def: "An investment strategy in which an investor divides up the total amount to be invested across periodic purchases of a target asset." },
  { term: "4% Rule", def: "A rule of thumb used to determine the amount of funds an individual can withdraw from their retirement savings each year." },
  { term: "Rebalancing", def: "The process of realigning the weightings of a portfolio of assets. It involves periodically buying or selling assets in a portfolio." },
  { term: "Inflation", def: "The rate at which the general level of prices for goods and services is rising and, consequently, the purchasing power of currency is falling." },
  { term: "Hedge", def: "An investment that is made with the intention of reducing the risk of adverse price movements in an asset." }
];

const LINKS = [
  { category: "Learning", items: [
    { name: "Investopedia", url: "https://www.investopedia.com" },
    { name: "Khan Academy Finance", url: "https://www.khanacademy.org/economics-finance-domain" },
    { name: "Coursera Finance", url: "https://www.coursera.org/browse/business/finance" }
  ]},
  { category: "Calculators", items: [
    { name: "NerdWallet", url: "https://www.nerdwallet.com" },
    { name: "Bankrate", url: "https://www.bankrate.com" }
  ]},
  { category: "Market Data", items: [
    { name: "Yahoo Finance", url: "https://finance.yahoo.com" },
    { name: "Google Finance", url: "https://www.google.com/finance" },
    { name: "Morningstar", url: "https://www.morningstar.com" }
  ]},
  { category: "Government", items: [
    { name: "IRS.gov (USA)", url: "https://www.irs.gov" },
    { name: "SEC.gov (USA)", url: "https://www.sec.gov" },
    { name: "FCA.gov.uk (UK)", url: "https://www.fca.org.uk" },
    { name: "SEBI.gov.in (India)", url: "https://www.sebi.gov.in" }
  ]}
];

export function Resources() {
  const [openGlossary, setOpenGlossary] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredGlossary = GLOSSARY.filter(g => 
    g.term.toLowerCase().includes(searchTerm.toLowerCase()) || 
    g.def.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto px-6 py-12 space-y-16">
      <div className="space-y-2">
        <h1 className="text-4xl font-display font-bold">Resources Hub</h1>
        <p className="text-text-secondary">Explore curated knowledge to master your financial future</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Books Column */}
        <div className="space-y-8">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-accent-gold" /> Recommended Books
          </h3>
          <div className="grid grid-cols-1 gap-4">
            {BOOKS.map((book, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="card card-hover p-6 flex gap-4"
              >
                <div className={cn("w-1.5 h-full rounded-full shrink-0", book.color)} />
                <div className="space-y-1">
                  <div className="font-bold text-lg">{book.title}</div>
                  <div className="text-xs text-text-muted uppercase tracking-wider">{book.author}</div>
                  <p className="text-sm text-text-secondary mt-2">{book.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Glossary Column */}
        <div className="space-y-8">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Info className="w-5 h-5 text-accent-emerald" /> Financial Glossary
          </h3>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search terms..."
              className="input-field w-full pl-10 py-2 text-sm"
            />
          </div>
          <div className="space-y-2 max-h-[800px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
            {filteredGlossary.map((g, i) => (
              <div key={i} className="card overflow-hidden">
                <button
                  onClick={() => setOpenGlossary(openGlossary === g.term ? null : g.term)}
                  className="w-full p-4 flex items-center justify-between text-left hover:bg-bg-secondary transition-colors"
                >
                  <span className="font-bold text-sm">{g.term}</span>
                  {openGlossary === g.term ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                <AnimatePresence>
                  {openGlossary === g.term && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-4 pb-4 text-xs text-text-secondary leading-relaxed"
                    >
                      {g.def}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>

        {/* Links Column */}
        <div className="space-y-8">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <ExternalLink className="w-5 h-5 text-accent-blue" /> Trusted Resources
          </h3>
          <div className="space-y-8">
            {LINKS.map((cat, i) => (
              <div key={i} className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-widest text-text-muted">{cat.category}</h4>
                <div className="grid grid-cols-1 gap-2">
                  {cat.items.map((link, j) => (
                    <a
                      key={j}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="card p-4 flex items-center justify-between group hover:border-accent-blue/40 transition-all"
                    >
                      <span className="text-sm font-medium">{link.name}</span>
                      <ExternalLink className="w-3 h-3 text-text-muted group-hover:text-accent-blue transition-colors" />
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
