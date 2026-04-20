"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/useToast";

interface CopyButtonProps {
  value: string;
  label?: string;
  toastMessage?: string;
}

export function CopyButton({
  value,
  label,
  toastMessage = "Copiado!",
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const { addToast } = useToast();

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      addToast(toastMessage, "success");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      addToast("Não foi possível copiar", "error");
    }
  }

  return (
    <button
      onClick={handleCopy}
      aria-label={label ? `Copiar ${label}` : "Copiar"}
      className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-[#F0F0F0] transition-colors flex-shrink-0"
    >
      <AnimatePresence mode="wait" initial={false}>
        {copied ? (
          <motion.span
            key="check"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.6, opacity: 0 }}
          >
            <Check size={18} className="text-[#4CAF50]" />
          </motion.span>
        ) : (
          <motion.span
            key="copy"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.6, opacity: 0 }}
          >
            <Copy size={18} className="text-[#666666]" />
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}

interface CopyFieldProps {
  label: string;
  value: string;
}

export function CopyField({ label, value }: CopyFieldProps) {
  return (
    <div className="flex items-center justify-between gap-3 py-3 border-b border-[#F0F0F0] last:border-0">
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="text-xs text-[#666666]">{label}</span>
        <span className="text-base font-600 text-[#333333] truncate">{value}</span>
      </div>
      <CopyButton value={value} label={label} />
    </div>
  );
}
