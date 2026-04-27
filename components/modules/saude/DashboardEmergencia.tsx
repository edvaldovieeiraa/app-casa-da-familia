"use client";

import { Phone, Plus, Trash2, Droplets, AlertCircle, Pill } from "lucide-react";
import { motion } from "framer-motion";
import type { SaudePaciente, SaudeMedicamento, SaudeContatoEmergencia } from "@/types/database";

const SAMU = "192";
const BOMBEIROS = "193";
const POLICE = "190";

function EmergencyNumber({ label, number, color }: { label: string; number: string; color: string }) {
  return (
    <a
      href={`tel:${number}`}
      className="flex flex-col items-center justify-center gap-1 p-3 rounded-[14px]"
      style={{ backgroundColor: `${color}20`, border: `1.5px solid ${color}40` }}
    >
      <span className="text-2xl font-black" style={{ color }}>{number}</span>
      <span className="text-[11px] font-bold text-center" style={{ color }}>{label}</span>
    </a>
  );
}

interface DashboardEmergenciaProps {
  paciente: SaudePaciente;
  medicamentos: SaudeMedicamento[];
  contatos: SaudeContatoEmergencia[];
  onAddContato?: () => void;
  onDeleteContato?: (id: string) => void;
}

export function DashboardEmergencia({
  paciente, medicamentos, contatos, onAddContato, onDeleteContato,
}: DashboardEmergenciaProps) {
  const ativos = medicamentos.filter((m) => m.ativo);
  const usoContinuo = ativos.filter((m) => m.uso_continuo);

  return (
    <div className="flex flex-col gap-4">
      {/* Números de emergência */}
      <div className="grid grid-cols-3 gap-2">
        <EmergencyNumber label="SAMU" number={SAMU} color="#E53935" />
        <EmergencyNumber label="Bombeiros" number={BOMBEIROS} color="#FF6F00" />
        <EmergencyNumber label="Polícia" number={POLICE} color="#1565C0" />
      </div>

      {/* Informações críticas */}
      <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 16, padding: 16, border: "1px solid rgba(255,255,255,0.08)" }}>
        <p className="text-[11px] font-bold mb-3" style={{ color: "#E91E63", letterSpacing: "0.08em" }}>
          DADOS CRÍTICOS
        </p>

        <div className="flex flex-col gap-2">
          {paciente.tipo_sanguineo && (
            <div className="flex items-center gap-2">
              <Droplets size={16} style={{ color: "#E53935" }} />
              <span className="text-sm" style={{ color: "rgba(240,240,255,0.8)" }}>
                Tipo sanguíneo: <strong style={{ color: "#E53935" }}>{paciente.tipo_sanguineo}</strong>
              </span>
            </div>
          )}

          {paciente.alergias && paciente.alergias.length > 0 && (
            <div className="flex items-start gap-2">
              <AlertCircle size={16} className="mt-0.5 flex-shrink-0" style={{ color: "#E53935" }} />
              <div>
                <span className="text-sm font-semibold" style={{ color: "#E53935" }}>Alergias: </span>
                <span className="text-sm" style={{ color: "rgba(240,240,255,0.8)" }}>
                  {paciente.alergias.join(", ")}
                </span>
              </div>
            </div>
          )}

          {paciente.condicoes_cronicas && paciente.condicoes_cronicas.length > 0 && (
            <div className="flex items-start gap-2">
              <AlertCircle size={16} className="mt-0.5 flex-shrink-0" style={{ color: "#FF6F00" }} />
              <div>
                <span className="text-sm font-semibold" style={{ color: "#FF6F00" }}>Condições: </span>
                <span className="text-sm" style={{ color: "rgba(240,240,255,0.8)" }}>
                  {paciente.condicoes_cronicas.join(", ")}
                </span>
              </div>
            </div>
          )}

          {paciente.plano_saude && (
            <div className="flex items-center gap-2">
              <span className="text-sm" style={{ color: "rgba(240,240,255,0.7)" }}>
                Plano: <strong style={{ color: "rgba(240,240,255,0.9)" }}>{paciente.plano_saude}</strong>
                {paciente.numero_carteirinha && ` · ${paciente.numero_carteirinha}`}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Medicamentos em uso contínuo */}
      {usoContinuo.length > 0 && (
        <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 16, padding: 16, border: "1px solid rgba(255,255,255,0.08)" }}>
          <div className="flex items-center gap-2 mb-3">
            <Pill size={16} style={{ color: "#9C27B0" }} />
            <p className="text-[11px] font-bold" style={{ color: "#9C27B0", letterSpacing: "0.08em" }}>
              MEDICAMENTOS CONTÍNUOS
            </p>
          </div>
          <div className="flex flex-col gap-1.5">
            {usoContinuo.map((m) => (
              <div key={m.id} className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: "#9C27B0" }} />
                <span className="text-sm" style={{ color: "rgba(240,240,255,0.85)" }}>
                  {m.nome}
                  {m.dose && ` ${m.dose}${m.unidade ? ` ${m.unidade}` : ""}`}
                  {m.frequencia && ` · ${m.frequencia}`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Contatos de emergência */}
      <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 16, padding: 16, border: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Phone size={16} style={{ color: "#4CAF50" }} />
            <p className="text-[11px] font-bold" style={{ color: "#4CAF50", letterSpacing: "0.08em" }}>
              CONTATOS DE EMERGÊNCIA
            </p>
          </div>
          {onAddContato && (
            <button
              onClick={onAddContato}
              className="w-7 h-7 flex items-center justify-center rounded-full"
              style={{ backgroundColor: "#4CAF5020" }}
            >
              <Plus size={15} style={{ color: "#4CAF50" }} />
            </button>
          )}
        </div>

        {contatos.length === 0 && (
          <p className="text-sm" style={{ color: "rgba(240,240,255,0.4)" }}>
            Nenhum contato cadastrado.
          </p>
        )}

        <div className="flex flex-col gap-2">
          {contatos.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-3"
            >
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: "#4CAF5020" }}>
                <span className="text-xs font-bold" style={{ color: "#4CAF50" }}>{c.prioridade}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold" style={{ color: "rgba(240,240,255,0.9)" }}>{c.nome}</p>
                {c.relacao && <p className="text-xs" style={{ color: "rgba(240,240,255,0.5)" }}>{c.relacao}</p>}
              </div>
              <a
                href={`tel:${c.telefone}`}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-[10px]"
                style={{ backgroundColor: "#4CAF5020" }}
              >
                <Phone size={14} style={{ color: "#4CAF50" }} />
                <span className="text-sm font-bold" style={{ color: "#4CAF50" }}>{c.telefone}</span>
              </a>
              {onDeleteContato && (
                <button
                  onClick={() => onDeleteContato(c.id)}
                  className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-red-100 transition-colors"
                >
                  <Trash2 size={14} style={{ color: "#E53935" }} />
                </button>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
