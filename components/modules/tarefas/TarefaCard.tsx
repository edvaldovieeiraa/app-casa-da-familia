"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Calendar, CheckCircle } from "lucide-react";
import type { Tarefa, FamiliaMembro, TarefaPrioridade, TarefaStatus } from "@/types/database";

const PRIO_COLOR: Record<TarefaPrioridade, string> = {
  urgente: "#E53935",
  alta:    "#FF6F00",
  media:   "#F5C842",
  baixa:   "#4CAF50",
};

const PRIO_LABEL: Record<TarefaPrioridade, string> = {
  urgente: "Urgente",
  alta:    "Alta",
  media:   "Média",
  baixa:   "Baixa",
};

const STATUS_CONFIG: Record<TarefaStatus, { label: string; bg: string; color: string }> = {
  pendente:     { label: "Pendente",     bg: "#F5F5F5", color: "#9E9E9E" },
  em_andamento: { label: "Em andamento", bg: "#E3F2FD", color: "#2196F3" },
  concluida:    { label: "Concluída",    bg: "#E8F5E9", color: "#4CAF50" },
  cancelada:    { label: "Cancelada",    bg: "#FFEBEE", color: "#C62828" },
};

const CAT_LABEL: Record<string, string> = {
  compras: "Compras", servico: "Serviço", conserto: "Conserto",
  medico: "Médico", financeiro: "Financeiro", outro: "Outro",
};

function diasAte(dataStr: string | null): number | null {
  if (!dataStr) return null;
  const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
  return Math.ceil((new Date(dataStr + "T12:00:00").getTime() - hoje.getTime()) / 86400000);
}

function formatDate(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

interface TarefaCardProps {
  tarefa: Tarefa;
  index: number;
  membros: Pick<FamiliaMembro, "id" | "nome">[];
  onConcluirRapido?: (tarefa: Tarefa) => void;
}

export function TarefaCard({ tarefa, index, membros, onConcluirRapido }: TarefaCardProps) {
  const prioColor = PRIO_COLOR[tarefa.prioridade];
  const status = STATUS_CONFIG[tarefa.status];
  const dias = diasAte(tarefa.data_prazo);
  const prazoVencido = dias !== null && dias < 0;
  const prazoHoje = dias === 0;
  const prazoAmanha = dias === 1;
  const solicitante = membros.find((m) => m.id === tarefa.solicitante_id);
  const ativa = tarefa.status === "pendente" || tarefa.status === "em_andamento";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, type: "spring", damping: 22 }}
      className="bg-white rounded-[16px] border border-[#E0E0E0] overflow-hidden flex"
    >
      {/* Barra de prioridade */}
      <div className="w-1 flex-shrink-0" style={{ backgroundColor: prioColor }} />

      <div className="flex-1 p-4">
        <div className="flex items-start justify-between gap-2">
          <Link href={`/tarefas/${tarefa.id}`} className="flex-1 min-w-0">
            <p className="font-700 text-[#333333] leading-snug">{tarefa.titulo}</p>
            {tarefa.descricao && (
              <p className="text-sm text-[#666666] mt-0.5 line-clamp-2">{tarefa.descricao}</p>
            )}
          </Link>

          {ativa && onConcluirRapido && (
            <button
              onClick={(e) => { e.preventDefault(); onConcluirRapido(tarefa); }}
              aria-label="Concluir tarefa"
              className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-full hover:bg-[#E8F5E9] transition-colors"
            >
              <CheckCircle size={22} className="text-[#4CAF50]" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-1.5 mt-2">
          {/* Status */}
          <span className="text-[11px] font-700 px-2 py-0.5 rounded-full"
            style={{ backgroundColor: status.bg, color: status.color }}>
            {status.label}
          </span>

          {/* Prioridade */}
          <span className="text-[11px] font-700 px-2 py-0.5 rounded-full"
            style={{ backgroundColor: `${prioColor}20`, color: prioColor }}>
            {PRIO_LABEL[tarefa.prioridade]}
          </span>

          {/* Categoria */}
          {tarefa.categoria && (
            <span className="text-[11px] font-600 px-2 py-0.5 rounded-full bg-[#F5F5F5] text-[#666666]">
              {CAT_LABEL[tarefa.categoria]}
            </span>
          )}

          {/* Solicitante */}
          {solicitante && (
            <span className="text-[11px] font-600 text-[#666666]">
              por {solicitante.nome.split(" ")[0]}
            </span>
          )}
        </div>

        {/* Prazo */}
        {tarefa.data_prazo && (
          <div className="flex items-center gap-1 mt-1.5">
            <Calendar size={11} style={{ color: prazoVencido ? "#E53935" : (prazoHoje || prazoAmanha) ? "#F5C842" : "#999999" }} />
            <span className="text-[11px] font-600"
              style={{ color: prazoVencido ? "#E53935" : (prazoHoje || prazoAmanha) ? "#92400E" : "#999999" }}>
              {prazoVencido
                ? `Venceu ${Math.abs(dias!)}d atrás`
                : prazoHoje
                ? "Vence hoje!"
                : prazoAmanha
                ? "Vence amanhã"
                : `Prazo: ${formatDate(tarefa.data_prazo)}`}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
