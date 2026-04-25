"use client";

import { motion } from "framer-motion";
import type { TarefaComentario, FamiliaMembro } from "@/types/database";

const AVATAR_COLORS = ["#E53935", "#9C27B0", "#2196F3", "#4CAF50", "#FF6F00", "#00897B"];

function avatarColor(nome: string) {
  const sum = nome.split("").reduce((s, c) => s + c.charCodeAt(0), 0);
  return AVATAR_COLORS[sum % AVATAR_COLORS.length];
}

function tempoRelativo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "agora";
  if (mins < 60) return `há ${mins}min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `há ${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `há ${days}d`;
  return new Date(iso).toLocaleDateString("pt-BR");
}

interface ComentarioItemProps {
  comentario: TarefaComentario;
  membros: Pick<FamiliaMembro, "id" | "nome">[];
  index: number;
}

export function ComentarioItem({ comentario, membros, index }: ComentarioItemProps) {
  const membro = membros.find((m) => m.id === comentario.membro_id);
  const nome = membro?.nome ?? "Usuário";
  const iniciais = nome.split(" ").slice(0, 2).map((p) => p[0]).join("").toUpperCase();
  const cor = avatarColor(nome);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className="flex gap-3 py-3 border-b border-[#F0F0F0] last:border-0"
    >
      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-700"
        style={{ backgroundColor: cor }}>
        {iniciais}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-700 text-[#333333]">{nome.split(" ")[0]}</span>
          <span className="text-[11px] text-[#999999]">{tempoRelativo(comentario.created_at)}</span>
        </div>
        <p className="text-sm text-[#444444] mt-0.5 leading-relaxed">{comentario.texto}</p>
      </div>
    </motion.div>
  );
}
