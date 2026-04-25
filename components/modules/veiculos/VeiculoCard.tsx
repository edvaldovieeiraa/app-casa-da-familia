"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Car, AlertTriangle, Clock } from "lucide-react";
import type { Veiculo } from "@/types/database";

const COLOR = "#F57C00";

function diasAte(dataStr: string | null): number | null {
  if (!dataStr) return null;
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const data = new Date(dataStr + "T12:00:00");
  return Math.ceil((data.getTime() - hoje.getTime()) / 86400000);
}

function alertBadge(label: string, dataStr: string | null) {
  const dias = diasAte(dataStr);
  if (dias === null) return null;
  if (dias < 0) return { label: `${label} vencido`, color: "#E53935", bg: "#FEF2F2" };
  if (dias <= 30) return { label: `${label} em ${dias}d`, color: "#F5C842", bg: "#FFFBEB" };
  return null;
}

interface VeiculoCardProps {
  veiculo: Veiculo;
  index: number;
}

export function VeiculoCard({ veiculo, index }: VeiculoCardProps) {
  const alerts = [
    alertBadge("IPVA", veiculo.data_vencimento_ipva),
    alertBadge("Seguro", veiculo.data_vencimento_seguro),
    alertBadge("CNH", veiculo.data_vencimento_cnh),
    alertBadge("Licenc.", veiculo.data_vencimento_licenciamento),
  ].filter(Boolean) as { label: string; color: string; bg: string }[];

  const modeloAno = [veiculo.marca, veiculo.modelo, veiculo.ano_modelo]
    .filter(Boolean).join(" · ");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, type: "spring", damping: 22 }}
      className="bg-white rounded-[16px] border border-[#E0E0E0] overflow-hidden"
    >
      <Link href={`/veiculos/${veiculo.id}`} className="flex items-center gap-4 p-4">
        <div className="w-14 h-14 rounded-[12px] flex items-center justify-center flex-shrink-0 overflow-hidden"
          style={{ backgroundColor: `${COLOR}20` }}>
          {veiculo.foto_url
            ? <img src={veiculo.foto_url} alt={veiculo.apelido ?? veiculo.placa} className="w-full h-full object-cover" />
            : <Car size={28} style={{ color: COLOR }} />
          }
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-700 text-[#333333] truncate">
              {veiculo.apelido ?? (`${veiculo.marca ?? ""} ${veiculo.modelo ?? ""}`.trim() || veiculo.placa)}
            </p>
            <span className="text-[11px] font-700 px-2 py-0.5 rounded-full bg-[#F0F0F0] text-[#666666] flex-shrink-0">
              {veiculo.placa}
            </span>
          </div>
          {modeloAno && <p className="text-xs text-[#666666] mt-0.5 truncate">{modeloAno}</p>}

          {alerts.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {alerts.map((a) => (
                <span key={a.label}
                  className="flex items-center gap-1 text-[10px] font-700 px-1.5 py-0.5 rounded-full"
                  style={{ backgroundColor: a.bg, color: a.color }}>
                  {a.color === "#E53935"
                    ? <AlertTriangle size={10} />
                    : <Clock size={10} />
                  }
                  {a.label}
                </span>
              ))}
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
