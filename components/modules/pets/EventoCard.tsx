"use client";

import { motion } from "framer-motion";
import { Syringe, Bath, Scissors, Pill, Stethoscope, Calendar, MapPin, DollarSign } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { PetEvento, PetEventoTipo } from "@/types/database";

const TIPO_CONFIG: Record<PetEventoTipo, { label: string; Icon: LucideIcon; color: string }> = {
  vacina:      { label: "Vacina",      Icon: Syringe,      color: "#E53935" },
  banho:       { label: "Banho",       Icon: Bath,         color: "#2196F3" },
  tosa:        { label: "Tosa",        Icon: Scissors,     color: "#9C27B0" },
  medicamento: { label: "Medicamento", Icon: Pill,         color: "#FF6F00" },
  consulta:    { label: "Consulta",    Icon: Stethoscope,  color: "#4CAF50" },
  outro:       { label: "Outro",       Icon: Calendar,     color: "#666666" },
};

function formatarData(data: string) {
  return new Date(data + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

function badgeProxima(proxima: string) {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const data = new Date(proxima + "T12:00:00");
  const diff = Math.ceil((data.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
  if (diff < 0) return { text: `Atrasado ${Math.abs(diff)}d`, color: "#E53935" };
  if (diff === 0) return { text: "Hoje!", color: "#E53935" };
  if (diff <= 7) return { text: `Em ${diff} dias`, color: "#F5A000" };
  return { text: formatarData(proxima), color: "#4CAF50" };
}

interface EventoCardProps {
  evento: PetEvento;
  index: number;
}

export function EventoCard({ evento, index }: EventoCardProps) {
  const config = TIPO_CONFIG[evento.tipo] ?? TIPO_CONFIG.outro;
  const { Icon } = config;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04 }}
      className="flex items-start gap-3 py-3 border-b border-[#F0F0F0] last:border-0"
    >
      <div className="w-9 h-9 rounded-[10px] flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{ backgroundColor: `${config.color}18` }}>
        <Icon size={18} style={{ color: config.color }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="font-700 text-[#333333] text-sm">{config.label}</span>
          <span className="text-xs text-[#999999] flex-shrink-0">{formatarData(evento.data_evento)}</span>
        </div>
        {evento.descricao && <p className="text-sm text-[#555555] mt-0.5 leading-snug">{evento.descricao}</p>}
        <div className="flex flex-wrap items-center gap-3 mt-1">
          {evento.local && (
            <span className="flex items-center gap-1 text-xs text-[#666666]">
              <MapPin size={11} />{evento.local}
            </span>
          )}
          {evento.valor && (
            <span className="flex items-center gap-1 text-xs text-[#666666]">
              <DollarSign size={11} />R$ {evento.valor.toFixed(2).replace(".", ",")}
            </span>
          )}
          {evento.proxima_data && (() => {
            const badge = badgeProxima(evento.proxima_data);
            return (
              <span className="text-[11px] font-700 px-2 py-0.5 rounded-full" style={{ backgroundColor: `${badge.color}18`, color: badge.color }}>
                Próximo: {badge.text}
              </span>
            );
          })()}
        </div>
      </div>
    </motion.div>
  );
}
