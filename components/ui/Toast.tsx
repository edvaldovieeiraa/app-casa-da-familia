"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from "lucide-react";
import type { Toast as ToastItem, ToastType } from "@/types/ui";

const config: Record<
  ToastType,
  { icon: typeof CheckCircle; bg: string; text: string; border: string }
> = {
  success: {
    icon: CheckCircle,
    bg: "#F0FDF4",
    text: "#166534",
    border: "#BBF7D0",
  },
  error: {
    icon: AlertCircle,
    bg: "#FEF2F2",
    text: "#991B1B",
    border: "#FECACA",
  },
  warning: {
    icon: AlertTriangle,
    bg: "#FFFBEB",
    text: "#92400E",
    border: "#FDE68A",
  },
  info: {
    icon: Info,
    bg: "#EFF6FF",
    text: "#1E40AF",
    border: "#BFDBFE",
  },
};

interface ToastItemProps {
  toast: ToastItem;
  onRemove: (id: string) => void;
}

function ToastItem({ toast, onRemove }: ToastItemProps) {
  const { icon: Icon, bg, text, border } = config[toast.type];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 80, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 80, scale: 0.95 }}
      transition={{ type: "spring", damping: 26, stiffness: 320 }}
      className="flex items-center gap-3 px-4 py-3 rounded-[14px] shadow-lg min-w-[240px] max-w-[320px] border"
      style={{ backgroundColor: bg, borderColor: border }}
    >
      <Icon size={20} style={{ color: text, flexShrink: 0 }} />
      <p className="flex-1 text-sm font-600 leading-snug" style={{ color: text }}>
        {toast.message}
      </p>
      <button
        onClick={() => onRemove(toast.id)}
        aria-label="Fechar notificação"
        className="w-6 h-6 flex items-center justify-center rounded-full hover:opacity-70 transition-opacity flex-shrink-0"
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
