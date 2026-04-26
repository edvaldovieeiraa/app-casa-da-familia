"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Heart, ChevronRight, Pill, Calendar } from "lucide-react";
import type { SaudePaciente, SaudeMedicamento } from "@/types/database";

const COLOR = "#00ACC1";

function calcIdade(dataNasc: string | null) {
  if (!dataNasc) return null;
  const hoje = new Date();
  const nasc = new Date(dataNasc);
  let age = hoje.getFullYear() - nasc.getFullYear();
  const m = hoje.getMonth() - nasc.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) age--;
  return age;
}

interface PacienteCardProps {
  paciente: SaudePaciente;
  medicamentosAtivos: number;
  proximaConsulta: string | null;
  index: number;
}

export function PacienteCard({ paciente, medicamentosAtivos, proximaConsulta, index }: PacienteCardProps) {
  const router = useRouter();
  const idade = calcIdade(paciente.data_nascimento);
  const iniciais = paciente.nome.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, type: "spring", damping: 22 }}
      onClick={() => router.push(`/saude/${paciente.id}`)}
      className="bg-white rounded-[16px] border border-[#E0E0E0] p-4 flex items-center gap-4 cursor-pointer active:scale-[0.98] transition-transform"
      style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
    >
      {/* Avatar */}
      <div
        className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 text-lg font-800 text-white"
        style={{ background: `linear-gradient(135deg, ${COLOR}, #00838F)` }}
      >
        {iniciais}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-700 text-[#333333] text-base leading-snug truncate">{paciente.nome}</p>
        <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1">
          {idade !== null && (
            <span className="text-xs text-[#666666]">{idade} anos</span>
          )}
          {paciente.tipo_sanguineo && (
            <span className="text-xs font-700" style={{ color: COLOR }}>{paciente.tipo_sanguineo}</span>
          )}
          {paciente.plano_saude && (
            <span className="text-xs text-[#666666] truncate">{paciente.plano_saude}</span>
          )}
        </div>
        <div className="flex gap-3 mt-2">
          {medicamentosAtivos > 0 && (
            <div className="flex items-center gap-1">
              <Pill size={11} style={{ color: COLOR }} />
              <span className="text-[11px] text-[#666666]">{medicamentosAtivos} med.</span>
            </div>
          )}
          {proximaConsulta && (
            <div className="flex items-center gap-1">
              <Calendar size={11} className="text-[#F57C00]" />
              <span className="text-[11px] text-[#666666]">
                {new Date(proximaConsulta).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
              </span>
            </div>
          )}
        </div>
      </div>

      <ChevronRight size={18} className="text-[#BDBDBD] flex-shrink-0" />
    </motion.div>
  );
}
