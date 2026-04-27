"use client";

import { motion } from "framer-motion";
import { Pill, AlertCircle, CheckCircle, Clock } from "lucide-react";
import type { SaudeMedicamento } from "@/types/database";

const COLOR = "#9C27B0";

interface MedicamentoCardProps {
  medicamento: SaudeMedicamento;
  index: number;
  onRegistrarDose?: (tomou: boolean) => void;
}

export function MedicamentoCard({ medicamento: m, index, onRegistrarDose }: MedicamentoCardProps) {
  const estoqueAlerta =
    m.estoque_atual !== null &&
    m.estoque_minimo !== null &&
    m.estoque_atual <= m.estoque_minimo;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, type: "spring", damping: 22 }}
      className="bg-white rounded-[16px] border border-[#E0E0E0] p-4"
    >
      <div className="flex items-start gap-3">
        <div
          className="w-10 h-10 rounded-[10px] flex items-center justify-center flex-shrink-0 mt-0.5"
          style={{ backgroundColor: `${COLOR}20` }}
        >
          <Pill size={20} style={{ color: COLOR }} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-bold text-[#333333]">{m.nome}</p>
            {!m.ativo && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#F5F5F5] text-[#999]">
                Inativo
              </span>
            )}
            {m.uso_continuo && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                style={{ backgroundColor: `${COLOR}15`, color: COLOR }}>
                Uso contínuo
              </span>
            )}
          </div>

          {m.principio_ativo && (
            <p className="text-xs text-[#666] mt-0.5">{m.principio_ativo}</p>
          )}

          <div className="flex flex-wrap gap-2 mt-1.5">
            {m.dose && (
              <span className="text-xs text-[#555] font-semibold">{m.dose}{m.unidade ? ` ${m.unidade}` : ""}</span>
            )}
            {m.frequencia && (
              <div className="flex items-center gap-1">
                <Clock size={11} style={{ color: "#9C27B0" }} />
                <span className="text-xs text-[#666]">{m.frequencia}</span>
              </div>
            )}
          </div>

          {m.horarios && m.horarios.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {m.horarios.map((h) => (
                <span key={h} className="text-[11px] px-2 py-0.5 rounded-full font-semibold"
                  style={{ backgroundColor: `${COLOR}15`, color: COLOR }}>
                  {h}
                </span>
              ))}
            </div>
          )}

          {estoqueAlerta && (
            <div className="flex items-center gap-1.5 mt-2">
              <AlertCircle size={13} style={{ color: "#E53935" }} />
              <span className="text-xs font-semibold text-[#E53935]">
                Estoque baixo: {m.estoque_atual} {m.unidade ?? ""}
              </span>
            </div>
          )}
          {!estoqueAlerta && m.estoque_atual !== null && (
            <p className="text-xs text-[#999] mt-1">Estoque: {m.estoque_atual} {m.unidade ?? ""}</p>
          )}
        </div>
      </div>

      {onRegistrarDose && m.ativo && (
        <div className="flex gap-2 mt-3 pt-3 border-t border-[#F0F0F0]">
          <button
            onClick={() => onRegistrarDose(true)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-[10px] text-sm font-semibold transition-colors"
            style={{ backgroundColor: "#E8F5E9", color: "#2E7D32" }}
          >
            <CheckCircle size={15} />
            Tomei
          </button>
          <button
            onClick={() => onRegistrarDose(false)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-[10px] text-sm font-semibold transition-colors"
            style={{ backgroundColor: "#FFEBEE", color: "#C62828" }}
          >
            Não tomei
          </button>
        </div>
      )}
    </motion.div>
  );
}
