"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { FamiliaMembro } from "@/types/database";

const COLOR = "#9C27B0";

const AVATAR_COLORS = ["#9C27B0", "#E53935", "#4CAF50", "#2196F3", "#FF6F00", "#00BCD4", "#FF9800", "#F5C842"];

function getAvatarColor(nome: string) {
  let hash = 0;
  for (let i = 0; i < nome.length; i++) hash = nome.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function initials(nome: string) {
  return nome.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

function calcularIdade(dataNascimento: string): number {
  const hoje = new Date();
  const nasc = new Date(dataNascimento + "T12:00:00");
  let idade = hoje.getFullYear() - nasc.getFullYear();
  const m = hoje.getMonth() - nasc.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) idade--;
  return idade;
}

const PARENTESCO_LABEL: Record<string, string> = {
  pai: "Pai", mae: "Mãe", filho: "Filho", filha: "Filha",
  avo: "Avô", avo_f: "Avó", conjuge: "Cônjuge", outro: "Outro",
};

interface MembroCardProps {
  membro: FamiliaMembro;
  index: number;
}

export function MembroCard({ membro, index }: MembroCardProps) {
  const avatarColor = getAvatarColor(membro.nome);
  const idade = membro.data_nascimento ? calcularIdade(membro.data_nascimento) : null;
  const parentescoLabel = membro.parentesco ? (PARENTESCO_LABEL[membro.parentesco] ?? membro.parentesco) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, type: "spring", damping: 22 }}
      className="bg-white rounded-[16px] border border-[#E0E0E0]"
    >
      <Link href={`/familia/${membro.id}`} className="flex items-center gap-4 p-4">
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 text-white font-700 text-lg"
          style={{ backgroundColor: avatarColor }}
        >
          {initials(membro.nome)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-700 text-[#333333] truncate">{membro.apelido ?? membro.nome}</p>
          {membro.apelido && <p className="text-xs text-[#999999] truncate">{membro.nome}</p>}
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {parentescoLabel && (
              <span className="text-[10px] font-700 px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: COLOR }}>
                {parentescoLabel}
              </span>
            )}
            {idade !== null && (
              <span className="text-xs text-[#666666]">{idade} anos</span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
