import { motion, AnimatePresence } from "motion/react";
import { AlertTriangle, Trash2, X } from "lucide-react";

interface DeleteConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName: string;
  itemType: "asset" | "financial goal";
}

export function DeleteConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  itemName,
  itemType,
}: DeleteConfirmationDialogProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-bg-void/60 backdrop-blur-md"
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

            {/* Warning Icon */}
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-accent-red rounded-xl shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold tracking-tight text-text-primary">
                  Confirm Permanent Deletion
                </h3>
                <span className="text-[10px] font-mono text-accent-red font-bold uppercase tracking-wider">
                  Irreversible Session Operation
                </span>
              </div>
            </div>

            {/* Warning Message */}
            <p className="text-sm text-text-secondary leading-relaxed">
              Are you sure you want to permanently delete the {itemType} <strong className="text-text-primary font-semibold">"{itemName}"</strong>? This will recalculate all down-stream model weights instantly.
            </p>

            {/* Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 bg-bg-void hover:bg-bg-void/50 border border-border text-text-primary font-semibold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
              >
                No, Keep it
              </button>
              <button
                type="button"
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className="flex-1 px-4 py-2.5 bg-accent-red hover:bg-[#EF4444] text-white font-semibold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-red-500/10 cursor-pointer hover:scale-[1.01]"
              >
                <Trash2 className="w-3.5 h-3.5" /> Confirm Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
