"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { Conta, ContaStatus } from "@/types/database";

const STATUS_STYLE: Record<ContaStatus, { bg: string; text: string; label: string }> = {
  pendente: { bg: "#FFFBEB", text: "#92400E", label: "Pendente" },
  pago:     { bg: "#F0FDF4", text: "#166534", label: "Pago" },
  vencido:  { bg: "#FEF2F2", text: "#991B1B", label: "Vencido" },
};

function formatDate(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

function formatMoney(v: number | null) {
  if (v == null) return "—";
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

interface ContaCardProps {
  conta: Conta;
  index: number;
}

export function ContaCard({ conta, index }: ContaCardProps) {
  const s = STATUS_STYLE[conta.status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, type: "spring", damping: 22 }}
      className="bg-white rounded-[16px] border overflow-hidden"
      style={{ borderColor: conta.status === "vencido" ? "#FECACA" : "#E0E0E0" }}
    >
      <Link href={`/contas/${conta.id}`} className="flex items-center justify-between gap-3 p-4">
        <div className="flex-1 min-w-0">
          <p className="font-700 text-[#333333] truncate">{conta.descricao}</p>
          <p className="text-xs text-[#666666] mt-0.5">
            Vence: {formatDate(conta.data_vencimento)}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
          <p className="font-800 text-[#333333]">{formatMoney(conta.valor)}</p>
          <span className="text-[10px] font-700 px-2 py-0.5 rounded-full"
            style={{ backgroundColor: s.bg, color: s.text }}>
            {s.label}
          </span>
        </div>
      </Link>
    </motion.div>
  );
}
