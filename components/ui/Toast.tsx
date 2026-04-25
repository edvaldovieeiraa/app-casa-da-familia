"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from "lucide-react";
import type { Toast as ToastItem, ToastType } from "@/types/ui";

const config: Record<ToastType, { icon: typeof CheckCircle; color: string }> = {
  success: { icon: CheckCircle, color: "#4CAF50" },
  error:   { icon: AlertCircle, color: "#E53935" },
  warning: { icon: AlertTriangle, color: "#F5C842" },
  info:    { icon: Info, color: "#2196F3" },
};

function ToastItem({ toast, onRemove }: { toast: ToastItem; onRemove: (id: string) => void }) {
  const { icon: Icon, color } = config[toast.type];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 100, scale: 0.88 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.88 }}
      transition={{ type: "spring", damping: 20, stiffness: 260 }}
      className="flex items-center gap-0 overflow-hidden min-w-[260px] max-w-[320px]"
      style={{
        background: "rgba(22, 22, 42, 0.92)",
        backdropFilter: "blur(30px) saturate(200%)",
        WebkitBackdropFilter: "blur(30px) saturate(200%)",
        border: "1px solid rgba(255,255,255,0.12)",
        borderRadius: 16,
        boxShadow: "0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)",
      }}
    >
      {/* Left accent bar */}
      <div className="w-1 self-stretch flex-shrink-0" style={{ backgroundColor: color }} />

      <div className="flex items-center gap-2.5 px-3 py-3.5 flex-1 min-w-0">
        <Icon size={18} style={{ color, flexShrink: 0 }} />
        <p className="text-sm font-500 leading-snug flex-1 min-w-0 text-white">
          {toast.message}
        </p>
      </div>

      <button
        onClick={() => onRemove(toast.id)}
        aria-label="Fechar"
        className="w-8 h-8 flex items-center justify-center rounded-full mr-2 flex-shrink-0 transition-all"
        style={{ color: "rgba(240,240,255,0.45)" }}
      >
        <X size={14} />
      </button>
    </motion.div>
  );
}

export function ToastContainer({ toasts, onRemove }: { toasts: ToastItem[]; onRemove: (id: string) => void }) {
  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastItem toast={toast} onRemove={onRemove} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}
