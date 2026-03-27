import { useState, useEffect, useRef, ChangeEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Bot, User, Send, Trash2, Copy, ChevronRight, Sparkles, Image as ImageIcon, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { getAIResponse, analyzeFinancialImage } from "../lib/gemini";
import { cn } from "../lib/utils";
import { ChatMessage } from "../types";

const TOPICS = [
  "🚀 Start Investing", "💳 Credit Scores", "📊 Budgeting", "🛡️ Insurance",
  "🏦 Emergency Fund", "📈 Index Funds", "💸 Get Out of Debt", "🏠 Buying a Home",
  "📉 Inflation", "🤝 Compound Interest", "💰 Retirement", "🌍 International Investing",
  "📑 Tax Efficiency", "🎓 Student Loans", "💼 Salary Negotiation", "🤔 Mutual Funds",
  "🔢 Rule of 72", "📊 Asset Allocation", "💡 Passive Income", "🏆 FIRE Movement"
];

export function AIAdvisor() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("ww_chat");
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch (err) {
        console.error("Failed to parse chat history:", err);
        setMessages([{
          role: "model",
          text: "Hello! 👋 I'm your WealthWise AI Advisor. I can help you understand budgeting, investing, credit scores, and more. What financial topic would you like to explore today?",
          timestamp: new Date().toISOString()
        }]);
      }
    } else {
      setMessages([{
        role: "model",
        text: "Hello! 👋 I'm your WealthWise AI Advisor. I can help you understand budgeting, investing, credit scores, and more. What financial topic would you like to explore today?",
        timestamp: new Date().toISOString()
      }]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("ww_chat", JSON.stringify(messages));
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (text: string = input) => {
    if (!text.trim() || isTyping) return;

    const userMsg: ChatMessage = { role: "user", text, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    const history = messages.map(m => ({
      role: m.role,
      parts: [{ text: m.text }]
    }));

    const response = await getAIResponse(text, history);
    const modelMsg: ChatMessage = { role: "model", text: response, timestamp: new Date().toISOString() };
    
    setIsTyping(false);
    setMessages(prev => [...prev, modelMsg]);
  };

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = (event.target?.result as string).split(",")[1];
      setIsAnalyzing(true);
      
      const userMsg: ChatMessage = { role: "user", text: "Analyzing uploaded image...", timestamp: new Date().toISOString() };
      setMessages(prev => [...prev, userMsg]);

      const response = await analyzeFinancialImage(base64, "Analyze this financial document or chart and provide key insights and advice.");
      const modelMsg: ChatMessage = { role: "model", text: response, timestamp: new Date().toISOString() };
      
      setIsAnalyzing(false);
      setMessages(prev => [...prev, modelMsg]);
    };
    reader.readAsDataURL(file);
  };

  const clearChat = () => {
    if (confirm("Are you sure you want to clear the chat history?")) {
      setMessages([{
        role: "model",
        text: "Hello! 👋 I'm your WealthWise AI Advisor. I can help you understand budgeting, investing, credit scores, and more. What financial topic would you like to explore today?",
        timestamp: new Date().toISOString()
      }]);
    }
  };

  return (
    <div className="container mx-auto px-6 py-12 h-[calc(100vh-200px)] min-h-[600px] flex flex-col lg:flex-row gap-8">
      {/* Sidebar - Topics */}
      <div className="lg:w-72 shrink-0 space-y-6">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-accent-gold" /> Quick Topics
        </h3>
        <div className="flex lg:flex-col flex-wrap gap-2 overflow-x-auto pb-4 lg:pb-0">
          {TOPICS.map(topic => (
            <button
              key={topic}
              onClick={() => handleSend(topic.replace(/[^a-zA-Z0-9 ]/g, "").trim())}
              className="px-4 py-2 rounded-xl glass border border-border hover:border-border-active hover:bg-accent-gold/5 text-sm text-left transition-all shrink-0"
            >
              {topic}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 card flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-border flex items-center justify-between bg-bg-secondary/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent-gold/20 flex items-center justify-center text-accent-gold">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="font-bold">WealthWise AI Advisor</div>
              <div className="flex items-center gap-1.5 text-[10px] text-accent-emerald uppercase tracking-widest font-bold">
                <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" /> Online
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-text-muted hover:text-accent-gold transition-colors"
              title="Analyze Image"
            >
              {isAnalyzing ? <Loader2 className="w-5 h-5 animate-spin" /> : <ImageIcon className="w-5 h-5" />}
            </button>
            <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
            <button onClick={clearChat} className="p-2 text-text-muted hover:text-accent-red transition-colors">
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "flex gap-4 max-w-[85%]",
                msg.role === "user" ? "ml-auto flex-row-reverse" : ""
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-xs font-bold",
                msg.role === "user" ? "bg-accent-gold text-bg-void" : "bg-bg-secondary text-accent-gold border border-border"
              )}>
                {msg.role === "user" ? "U" : "WW"}
              </div>
              <div className={cn(
                "p-4 rounded-2xl text-sm leading-relaxed relative group",
                msg.role === "user" ? "bg-accent-gold text-bg-void font-medium" : "bg-bg-card border-l-4 border-l-accent-gold border border-border"
              )}>
                <div className="markdown-body">
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                </div>
                <div className={cn(
                  "text-[10px] mt-2 opacity-50",
                  msg.role === "user" ? "text-bg-void" : "text-text-muted"
                )}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
                {msg.role === "model" && (
                  <button 
                    onClick={() => { navigator.clipboard.writeText(msg.text); alert("Tip copied!"); }}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-bg-secondary opacity-0 group-hover:opacity-100 transition-opacity text-text-muted hover:text-accent-gold"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                )}
              </div>
            </motion.div>
          ))}
          {(isTyping || isAnalyzing) && (
            <div className="flex gap-4 max-w-[85%]">
              <div className="w-8 h-8 rounded-full bg-bg-secondary text-accent-gold border border-border flex items-center justify-center text-xs font-bold">
                WW
              </div>
              <div className="p-4 rounded-2xl bg-bg-card border-l-4 border-l-accent-gold border border-border flex gap-1">
                <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6 }} className="w-1.5 h-1.5 rounded-full bg-accent-gold" />
                <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-1.5 h-1.5 rounded-full bg-accent-gold" />
                <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-1.5 h-1.5 rounded-full bg-accent-gold" />
              </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>

        {/* Input */}
        <div className="p-6 border-t border-border bg-bg-secondary/30">
          <div className="flex gap-4">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask about budgeting, investing, credit..."
              className="input-field flex-1"
            />
            <button onClick={() => handleSend()} disabled={!input.trim() || isTyping || isAnalyzing} className="btn-primary !p-3 disabled:opacity-50">
              <Send className="w-5 h-5" />
            </button>
          </div>
          <p className="text-[10px] text-text-muted mt-3 text-center uppercase tracking-widest">
            💡 Tip: Click a topic above for instant answers · Not financial advice
          </p>
        </div>
      </div>
    </div>
  );
}
