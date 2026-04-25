"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from "lucide-react";
import type { Toast as ToastItem, ToastType } from "@/types/ui";

const config: Record<
  ToastType,
  { icon: typeof CheckCircle; bg: string; text: string; border: string; accent: string }
> = {
  success: {
    icon: CheckCircle,
    bg: "#FFFFFF",
    text: "#166534",
    border: "rgba(74,222,128,0.3)",
    accent: "#22C55E",
  },
  error: {
    icon: AlertCircle,
    bg: "#FFFFFF",
    text: "#991B1B",
    border: "rgba(239,68,68,0.25)",
    accent: "#EF4444",
  },
  warning: {
    icon: AlertTriangle,
    bg: "#FFFFFF",
    text: "#92400E",
    border: "rgba(245,200,66,0.3)",
    accent: "#F5C842",
  },
  info: {
    icon: Info,
    bg: "#FFFFFF",
    text: "#1E40AF",
    border: "rgba(96,165,250,0.3)",
    accent: "#3B82F6",
  },
};

interface ToastItemProps {
  toast: ToastItem;
  onRemove: (id: string) => void;
}

function ToastItem({ toast, onRemove }: ToastItemProps) {
  const { icon: Icon, bg, text, border, accent } = config[toast.type];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 100, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.9 }}
      transition={{ type: "spring", damping: 22, stiffness: 280 }}
      className="flex items-center gap-3 pr-3 rounded-[16px] min-w-[240px] max-w-[320px] overflow-hidden"
      style={{
        backgroundColor: bg,
        border: `1px solid ${border}`,
        boxShadow: "0 4px 24px rgba(0,0,0,0.12), 0 1px 3px rgba(0,0,0,0.06)",
      }}
    >
      {/* Accent left bar */}
      <div className="w-1 self-stretch flex-shrink-0" style={{ backgroundColor: accent }} />

      <div className="flex items-center gap-2.5 py-3 flex-1 min-w-0">
        <Icon size={18} style={{ color: accent, flexShrink: 0 }} />
        <p
          className="text-sm font-600 leading-snug flex-1 min-w-0"
          style={{ color: text }}
        >
          {toast.message}
        </p>
      </div>

      <button
        onClick={() => onRemove(toast.id)}
        aria-label="Fechar notificação"
        className="w-7 h-7 flex items-center justify-center rounded-full flex-shrink-0 transition-colors hover:bg-black/05"
        style={{ color: text }}
      >
        <X size={14} />
      </button>
    </motion.div>
  );
}

interface ToastContainerProps {
  toasts: ToastItem[];
  onRemove: (id: string) => void;
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
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
