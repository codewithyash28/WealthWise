import { motion, AnimatePresence } from "motion/react";
import { AlertTriangle, Info, Trash2, X, RefreshCw } from "lucide-react";

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: "warning" | "danger" | "info";
}

export function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm High-Impact Action",
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "warning",
}: ConfirmationDialogProps) {
  const isDanger = type === "danger";
  const isInfo = type === "info";

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-bg-void/70 backdrop-blur-md"
          />

          {/* Dialog Card */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="w-full max-w-md bg-bg-secondary border border-border rounded-2xl p-6 shadow-2xl relative z-10 space-y-4 text-left"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-bg-void/40 text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Icon Header */}
            <div className="flex items-center gap-3">
              <div
                className={`p-3 rounded-xl border shrink-0 ${
                  isDanger
                    ? "bg-accent-red/10 border-accent-red/20 text-accent-red"
                    : isInfo
                    ? "bg-accent-blue/10 border-accent-blue/20 text-accent-blue"
                    : "bg-accent-gold/10 border-accent-gold/20 text-accent-gold"
                }`}
              >
                {isInfo ? (
                  <Info className="w-6 h-6" />
                ) : (
                  <AlertTriangle className="w-6 h-6" />
                )}
              </div>
              <div>
                <h3 className="text-lg font-bold tracking-tight text-text-primary">
                  {title}
                </h3>
                <span
                  className={`text-[10px] font-mono font-bold uppercase tracking-wider ${
                    isDanger ? "text-accent-red" : "text-accent-gold"
                  }`}
                >
                  Irreversible Model Operation
                </span>
              </div>
            </div>

            {/* Message Body */}
            <p className="text-sm text-text-secondary leading-relaxed">
              {message}
            </p>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 bg-bg-void hover:bg-bg-void/50 border border-border text-text-primary font-semibold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
              >
                {cancelText}
              </button>
              <button
                type="button"
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className={`flex-1 px-4 py-2.5 text-white font-semibold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-lg cursor-pointer hover:scale-[1.01] ${
                  isDanger
                    ? "bg-accent-red hover:bg-red-500 shadow-red-500/10"
                    : isInfo
                    ? "bg-accent-blue hover:bg-blue-500 shadow-blue-500/10"
                    : "bg-accent-gold hover:bg-[#E5A91E] text-bg-void shadow-accent-gold/10"
                }`}
              >
                {isDanger ? (
                  <Trash2 className="w-3.5 h-3.5" />
                ) : isInfo ? (
                  <Info className="w-3.5 h-3.5" />
                ) : (
                  <RefreshCw className="w-3.5 h-3.5" />
                )}
                {confirmText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
