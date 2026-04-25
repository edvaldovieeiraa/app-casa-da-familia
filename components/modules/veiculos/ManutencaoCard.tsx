"use client";

import { motion } from "framer-motion";
import { Wrench, Droplets, Circle, AlertTriangle, Fuel, ReceiptText, Settings2, CalendarClock } from "lucide-react";
import type { VeiculoManutencao, ManutencaoTipo } from "@/types/database";

const COLOR = "#F57C00";

const TIPO_CONFIG: Record<ManutencaoTipo, { label: string; Icon: React.ComponentType<{ size: number; color?: string }> }> = {
  revisao:     { label: "Revisão",       Icon: Settings2 },
  troca_oleo:  { label: "Troca de óleo", Icon: Droplets },
  pneu:        { label: "Pneu",          Icon: Circle },
  freio:       { label: "Freio",         Icon: AlertTriangle },
  multa:       { label: "Multa",         Icon: ReceiptText },
  combustivel: { label: "Combustível",   Icon: Fuel },
  outro:       { label: "Outro",         Icon: Wrench },
};

function formatDate(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

function formatMoney(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function diasAte(dataStr: string | null): number | null {
  if (!dataStr) return null;
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  return Math.ceil((new Date(dataStr + "T12:00:00").getTime() - hoje.getTime()) / 86400000);
}

interface ManutencaoCardProps {
  manutencao: VeiculoManutencao;
  index: number;
}

export function ManutencaoCard({ manutencao, index }: ManutencaoCardProps) {
  const cfg = TIPO_CONFIG[manutencao.tipo] ?? TIPO_CONFIG.outro;
  const { Icon } = cfg;
  const dias = diasAte(manutencao.proxima_data);
  const proxColor = dias === null ? null : dias < 0 ? "#E53935" : dias <= 30 ? "#F5C842" : "#4CAF50";

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04, type: "spring", damping: 22 }}
      className="flex gap-3 py-3 border-b border-[#F0F0F0] last:border-0"
    >
      <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{ backgroundColor: `${COLOR}20` }}>
        <Icon size={18} color={COLOR} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="font-700 text-[#333333] text-sm">{cfg.label}</p>
          <p className="text-xs text-[#999999] flex-shrink-0">{formatDate(manutencao.data_evento)}</p>
        </div>

        {manutencao.descricao && (
          <p className="text-xs text-[#666666] mt-0.5 truncate">{manutencao.descricao}</p>
        )}

        <div className="flex flex-wrap gap-2 mt-1">
          {manutencao.km_atual && (
            <span className="text-[11px] text-[#999999]">{manutencao.km_atual.toLocaleString("pt-BR")} km</span>
          )}
          {manutencao.valor && (
            <span className="text-[11px] font-600 text-[#333333]">{formatMoney(manutencao.valor)}</span>
          )}
          {manutencao.local && (
            <span className="text-[11px] text-[#999999]">📍 {manutencao.local}</span>
          )}
        </div>

        {manutencao.proxima_data && proxColor && (
          <div className="flex items-center gap-1 mt-1.5">
            <CalendarClock size={11} style={{ color: proxColor }} />
            <span className="text-[11px] font-700" style={{ color: proxColor }}>
              Próxima: {formatDate(manutencao.proxima_data)}
              {dias !== null && dias < 0 && ` (${Math.abs(dias)}d atraso)`}
              {dias !== null && dias === 0 && " (hoje!)"}
              {dias !== null && dias > 0 && ` (em ${dias}d)`}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
