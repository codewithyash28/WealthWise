import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Bell, Info, AlertTriangle, CheckCircle2, TrendingUp, Sparkles, X, History, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "../../lib/utils";

interface Alert {
  id: string;
  type: "market" | "info" | "risk" | "achievement";
  title: string;
  message: string;
  timestamp: string;
}

interface PulseAlertProps {
  alerts: Alert[];
  onClose: (id: string) => void;
  onClearAll?: () => void;
}

export function PulseAlert({ alerts, onClose, onClearAll }: PulseAlertProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  return (
    <>
      {/* Notification Toggle Button */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-4">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="card w-80 md:w-96 max-h-[500px] flex flex-col shadow-2xl border-accent-gold/20 backdrop-blur-2xl bg-bg-void/90"
            >
              <div className="p-4 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-accent-gold" />
                  <span className="font-bold text-sm uppercase tracking-widest">Notification Center</span>
                </div>
                <div className="flex items-center gap-2">
                  {onClearAll && (
                    <button 
                      onClick={onClearAll}
                      className="p-1.5 rounded-lg hover:bg-bg-secondary text-text-muted transition-colors"
                      title="Clear All"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button 
                    onClick={() => setIsMuted(!isMuted)}
                    className={cn(
                      "p-1.5 rounded-lg hover:bg-bg-secondary transition-colors text-[10px] font-bold uppercase",
                      isMuted ? "text-accent-red" : "text-accent-emerald"
                    )}
                    title={isMuted ? "Unmute Toasts" : "Mute Toasts"}
                  >
                    {isMuted ? "Muted" : "Active"}
                  </button>
                  <button 
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 rounded-lg hover:bg-bg-secondary text-text-muted transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {alerts.length === 0 ? (
                  <div className="py-12 text-center space-y-2">
                    <div className="text-3xl opacity-20">📭</div>
                    <p className="text-xs text-text-muted">All caught up! No recent alerts.</p>
                  </div>
                ) : (
                  alerts.map((alert) => (
                    <div 
                      key={alert.id}
                      className={cn(
                        "p-4 rounded-xl border border-border/50 bg-bg-secondary/40 space-y-2 relative group",
                        alert.type === "risk" && "border-accent-red/20",
                        alert.type === "achievement" && "border-accent-gold/20"
                      )}
                    >
                      <button 
                        onClick={() => onClose(alert.id)}
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 text-text-muted hover:text-text-primary transition-all"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          alert.type === "risk" ? "bg-accent-red" :
                          alert.type === "market" ? "bg-accent-blue" :
                          alert.type === "achievement" ? "bg-accent-gold" : "bg-accent-purple"
                        )} />
                        <span className="text-[9px] font-bold uppercase tracking-widest text-text-muted">{alert.type}</span>
                        <span className="text-[9px] font-mono text-text-muted ml-auto">{alert.timestamp}</span>
                      </div>
                      <div className="text-sm font-bold leading-tight">{alert.title}</div>
                      <p className="text-xs text-text-secondary leading-relaxed">{alert.message}</p>
                    </div>
                  ))
                )}
              </div>
              
              <div className="p-3 border-t border-border bg-bg-secondary/20">
                 <p className="text-[10px] text-center text-text-muted italic">Simulation metrics updated in real-time</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button 
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all hover:scale-110 active:scale-95 group relative",
            isOpen ? "bg-bg-secondary text-text-primary border border-border" : "bg-accent-gold text-bg-void"
          )}
        >
          {isOpen ? <ChevronDown className="w-6 h-6" /> : <Bell className="w-6 h-6" />}
          {alerts.length > 0 && !isOpen && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-gold opacity-75"></span>
              <span className="relative inline-flex rounded-full h-5 w-5 bg-accent-gold border-2 border-bg-void items-center justify-center text-[10px] font-black text-bg-void">
                {alerts.length}
              </span>
            </span>
          )}
        </button>
      </div>

      {/* Floating Toasts */}
      {!isMuted && (
        <div className="fixed top-24 right-6 z-50 w-full max-w-sm pointer-events-none">
          <div className="flex flex-col gap-4">
            <AnimatePresence mode="popLayout">
              {alerts.slice(0, 3).map((alert) => (
                <motion.div
                  key={alert.id}
                  layout
                  initial={{ opacity: 0, x: 50, scale: 0.9 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
                  className="pointer-events-auto"
                >
                  <div className={cn(
                    "card p-5 shadow-2xl backdrop-blur-xl border border-border/60 relative overflow-hidden group",
                    alert.type === "risk" ? "border-accent-red/40 bg-accent-red/5" :
                    alert.type === "market" ? "border-accent-blue/40 bg-accent-blue/5" :
                    alert.type === "achievement" ? "border-accent-gold/40 bg-accent-gold/5" : "bg-bg-secondary/90"
                  )}>
                    <button 
                      onClick={() => onClose(alert.id)}
                      className="absolute top-4 right-4 p-1 text-text-muted hover:text-text-primary transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>

                    <div className="flex gap-4">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                        alert.type === "risk" ? "bg-accent-red/20 text-accent-red" :
                        alert.type === "market" ? "bg-accent-blue/20 text-accent-blue" :
                        alert.type === "achievement" ? "bg-accent-gold/20 text-accent-gold" : "bg-accent-purple/20 text-accent-purple"
                      )}>
                        {alert.type === "risk" ? <AlertTriangle className="w-5 h-5" /> :
                         alert.type === "market" ? <TrendingUp className="w-5 h-5" /> :
                         alert.type === "achievement" ? <Sparkles className="w-5 h-5" /> : <Info className="w-5 h-5" />}
                      </div>

                      <div className="space-y-1 pr-6">
                        <div className="flex items-center gap-2">
                           <span className={cn(
                             "text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded",
                             alert.type === "risk" ? "bg-accent-red/10 text-accent-red" :
                             alert.type === "market" ? "bg-accent-blue/10 text-accent-blue" :
                             alert.type === "achievement" ? "bg-accent-gold/10 text-accent-gold" : "bg-accent-purple/10 text-accent-purple"
                           )}>
                             {alert.type}
                           </span>
                           <span className="text-[10px] text-text-muted font-mono">{alert.timestamp}</span>
                        </div>
                        <div className="font-bold text-sm leading-tight">{alert.title}</div>
                        <div className="text-xs text-text-secondary leading-relaxed">{alert.message}</div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}
    </>
  );
}

export function PulseAlertManager() {
  return null; 
}