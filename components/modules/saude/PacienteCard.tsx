"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { UserRound, Pill, AlertCircle } from "lucide-react";
import type { SaudePaciente, SaudeMedicamento } from "@/types/database";

const COLOR = "#E91E63";

function calcIdade(dataNascimento: string | null): string | null {
  if (!dataNascimento) return null;
  const nasc = new Date(dataNascimento + "T12:00:00");
  const hoje = new Date();
  let idade = hoje.getFullYear() - nasc.getFullYear();
  const m = hoje.getMonth() - nasc.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) idade--;
  return `${idade} anos`;
}

interface PacienteCardProps {
  paciente: SaudePaciente;
  medicamentos?: SaudeMedicamento[];
  index: number;
}

export function PacienteCard({ paciente, medicamentos = [], index }: PacienteCardProps) {
  const idade = calcIdade(paciente.data_nascimento);
  const medicAtivos = medicamentos.filter((m) => m.ativo);
  const estoquesBaixos = medicAtivos.filter(
    (m) => m.estoque_atual !== null && m.estoque_minimo !== null && m.estoque_atual <= m.estoque_minimo
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, type: "spring", damping: 22 }}
      className="bg-white rounded-[16px] border border-[#E0E0E0]"
    >
      <Link href={`/saude/${paciente.id}`} className="flex items-center gap-4 p-4">
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${COLOR}20` }}
        >
          {paciente.foto_url ? (
            <img
              src={paciente.foto_url}
              alt={paciente.nome}
              className="w-14 h-14 rounded-full object-cover"
            />
          ) : (
            <UserRound size={28} style={{ color: COLOR }} />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-bold text-[#333333] truncate">
            {paciente.apelido ?? paciente.nome}
          </p>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            {idade && <span className="text-xs text-[#666666]">{idade}</span>}
            {paciente.tipo_sanguineo && (
              <span
                className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                style={{ backgroundColor: `${COLOR}20`, color: COLOR }}
              >
                {paciente.tipo_sanguineo}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            {medicAtivos.length > 0 && (
              <div className="flex items-center gap-1">
                <Pill size={12} style={{ color: "#9C27B0" }} />
                <span className="text-[11px] text-[#9C27B0] font-semibold">
                  {medicAtivos.length} remédio{medicAtivos.length !== 1 ? "s" : ""}
                </span>
              </div>
            )}
            {estoquesBaixos.length > 0 && (
              <div className="flex items-center gap-1">
                <AlertCircle size={12} style={{ color: "#E53935" }} />
                <span className="text-[11px] text-[#E53935] font-semibold">
                  Estoque baixo
                </span>
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
