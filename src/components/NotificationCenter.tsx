import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Bell, 
  Check, 
  CheckCheck, 
  Trash2, 
  AlertTriangle, 
  Sparkles, 
  ShieldAlert, 
  TrendingUp, 
  Info, 
  Filter, 
  X,
  Zap,
  Receipt,
  ExternalLink
} from "lucide-react";
import { cn } from "../lib/utils";

export interface SystemNotification {
  id: string;
  type: "system" | "warning" | "market" | "receipt" | "achievement";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionHash?: string;
}

const INITIAL_NOTIFICATIONS: SystemNotification[] = [
  {
    id: "notif_1",
    type: "warning",
    title: "Budget Threshold Warning",
    message: "Discretionary entertainment expenses reached 82% of monthly allocated cap.",
    timestamp: "10 mins ago",
    read: false,
    actionHash: "#dashboard"
  },
  {
    id: "notif_2",
    type: "system",
    title: "Wexa Vision Engine Active",
    message: "Multimodal receipt scanner & Gemini auto-categorization engine ready.",
    timestamp: "1 hour ago",
    read: false,
    actionHash: "#wexa-companion"
  },
  {
    id: "notif_3",
    type: "market",
    title: "MacroPulse Alert",
    message: "Federal Reserve interest rate signals updated. Check Scenario Simulator.",
    timestamp: "3 hours ago",
    read: true,
    actionHash: "#macropulse"
  },
  {
    id: "notif_4",
    type: "achievement",
    title: "Level Up: Bronze Investor 🏆",
    message: "You earned 150 XP by configuring your monthly budget plan!",
    timestamp: "1 day ago",
    read: true
  }
];

export const NotificationCenter: React.FC = () => {
  const [notifications, setNotifications] = useState<SystemNotification[]>(() => {
    try {
      const saved = localStorage.getItem("ww_notification_center_v1");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn("Failed loading saved notifications:", e);
    }
    return INITIAL_NOTIFICATIONS;
  });

  const [isOpen, setIsOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<"all" | "unread" | "warning" | "system">("all");
  const popoverRef = useRef<HTMLDivElement>(null);

  // Save to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem("ww_notification_center_v1", JSON.stringify(notifications));
    } catch (e) {
      console.warn("Failed saving notifications:", e);
    }
  }, [notifications]);

  // Listen for window event 'ww-trigger-alert' to capture new notifications dynamically!
  useEffect(() => {
    const handleTriggerAlert = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        const { type, title, message } = customEvent.detail;
        
        let notifType: SystemNotification["type"] = "system";
        if (type === "warning" || type === "risk") notifType = "warning";
        else if (type === "market") notifType = "market";
        else if (type === "achievement") notifType = "achievement";

        const newNotif: SystemNotification = {
          id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          type: notifType,
          title: title || "System Alert",
          message: message || "Notification recorded in Wexa Center.",
          timestamp: "Just now",
          read: false
        };

        setNotifications(prev => [newNotif, ...prev.slice(0, 25)]);
      }
    };

    window.addEventListener("ww-trigger-alert", handleTriggerAlert);
    return () => window.removeEventListener("ww-trigger-alert", handleTriggerAlert);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const toggleReadStatus = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: !n.read } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const filteredNotifications = notifications.filter(n => {
    if (activeFilter === "unread") return !n.read;
    if (activeFilter === "warning") return n.type === "warning";
    if (activeFilter === "system") return n.type === "system" || n.type === "market";
    return true;
  });

  const getNotifIcon = (type: SystemNotification["type"]) => {
    switch (type) {
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case "market":
        return <TrendingUp className="w-4 h-4 text-cyan-400" />;
      case "receipt":
        return <Receipt className="w-4 h-4 text-emerald-400" />;
      case "achievement":
        return <Sparkles className="w-4 h-4 text-accent-gold" />;
      default:
        return <Zap className="w-4 h-4 text-blue-400" />;
    }
  };

  return (
    <div className="relative" ref={popoverRef}>
      {/* Bell Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "relative p-2 rounded-xl border text-xs font-mono transition-all cursor-pointer flex items-center justify-center",
          isOpen
            ? "bg-accent-gold/20 border-accent-gold text-accent-gold shadow-lg shadow-amber-500/10"
            : "bg-bg-secondary border-border text-text-secondary hover:text-text-primary hover:border-accent-gold/40"
        )}
        title="Notification Center"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-accent-gold text-bg-void text-[9px] font-mono font-black animate-pulse shadow-md">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Popover Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-80 sm:w-96 bg-bg-secondary border border-border shadow-2xl rounded-2xl p-4 z-50 space-y-3 backdrop-blur-xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-accent-gold/15 border border-accent-gold/30 text-accent-gold">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-text-primary">
                    Notification Center
                  </h3>
                  <p className="text-[10px] text-text-muted">System alerts & budget warnings</p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={markAllAsRead}
                    className="px-2 py-1 rounded-lg bg-bg-void hover:bg-bg-primary border border-border text-[10px] font-mono font-bold text-accent-gold transition-all cursor-pointer flex items-center gap-1"
                    title="Mark all as read"
                  >
                    <CheckCheck className="w-3 h-3" /> Mark All Read
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-lg text-text-muted hover:text-text-primary cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1 p-1 bg-bg-void border border-border rounded-xl">
              {[
                { id: "all", label: `All (${notifications.length})` },
                { id: "unread", label: `Unread (${unreadCount})` },
                { id: "warning", label: "Warnings" },
                { id: "system", label: "System" }
              ].map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveFilter(tab.id as any)}
                  className={cn(
                    "flex-1 py-1 text-[10px] font-mono font-bold rounded-lg transition-all cursor-pointer text-center",
                    activeFilter === tab.id
                      ? "bg-accent-gold text-bg-void shadow-sm"
                      : "text-text-muted hover:text-text-primary"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Notification Stream */}
            <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
              {filteredNotifications.length === 0 ? (
                <div className="p-6 text-center text-xs font-mono text-text-muted space-y-1">
                  <Check className="w-6 h-6 mx-auto text-emerald-400 opacity-60" />
                  <div>No notifications in this filter</div>
                </div>
              ) : (
                filteredNotifications.map(notif => (
                  <div
                    key={notif.id}
                    className={cn(
                      "p-3 rounded-xl border transition-all space-y-1.5 relative group",
                      !notif.read
                        ? "bg-bg-void/90 border-accent-gold/40 shadow-sm"
                        : "bg-bg-void/50 border-border/60 opacity-80"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="p-1 rounded bg-bg-secondary border border-border shrink-0">
                          {getNotifIcon(notif.type)}
                        </div>
                        <span className={cn(
                          "text-xs font-bold leading-tight",
                          !notif.read ? "text-text-primary" : "text-text-secondary"
                        )}>
                          {notif.title}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => toggleReadStatus(notif.id)}
                          className={cn(
                            "p-1 rounded hover:bg-bg-secondary cursor-pointer transition-colors",
                            notif.read ? "text-text-muted hover:text-accent-gold" : "text-accent-gold font-bold"
                          )}
                          title={notif.read ? "Mark as unread" : "Mark as read"}
                        >
                          <Check className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteNotification(notif.id)}
                          className="p-1 rounded text-text-muted hover:text-accent-red cursor-pointer transition-colors"
                          title="Delete notification"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    <p className="text-[11px] text-text-secondary leading-snug pl-7">
                      {notif.message}
                    </p>

                    <div className="flex items-center justify-between text-[9px] font-mono text-text-muted pl-7 pt-0.5">
                      <span>{notif.timestamp}</span>
                      {notif.actionHash && (
                        <a
                          href={notif.actionHash}
                          onClick={() => setIsOpen(false)}
                          className="text-accent-gold hover:underline flex items-center gap-0.5"
                        >
                          <span>View</span> <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="pt-2 border-t border-border/40 flex justify-between items-center text-[10px] font-mono text-text-muted">
              <span>{unreadCount} unread warnings</span>
              {notifications.length > 0 && (
                <button
                  type="button"
                  onClick={clearAllNotifications}
                  className="text-accent-red hover:underline cursor-pointer"
                >
                  Clear All
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
