"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { FileText } from "lucide-react";
import type { Documento, FamiliaMembro } from "@/types/database";

const COLOR = "#F5C842";
const TEXT = "#333333";

function validadeStatus(dataValidade: string | null): "ok" | "proximo" | "vencido" | null {
  if (!dataValidade) return null;
  const hoje = new Date();
  const validade = new Date(dataValidade);
  const dias = Math.floor((validade.getTime() - hoje.getTime()) / 86400000);
  if (dias < 0) return "vencido";
  if (dias <= 60) return "proximo";
  return "ok";
}

const STATUS_STYLE = {
  ok:      { bg: "#F0FDF4", text: "#166534", label: "Válido" },
  proximo: { bg: "#FFFBEB", text: "#92400E", label: "Vence em breve" },
  vencido: { bg: "#FEF2F2", text: "#991B1B", label: "Vencido" },
};

const TIPO_LABEL: Record<string, string> = {
  rg: "RG", cpf: "CPF", cnh: "CNH", passaporte: "Passaporte",
  titulo_eleitor: "Título de Eleitor", certidao_nascimento: "Certidão de Nascimento",
  certidao_casamento: "Certidão de Casamento", outro: "Outro",
};

interface DocumentoCardProps {
  documento: Documento;
  membro?: FamiliaMembro;
  index: number;
}

export function DocumentoCard({ documento, membro, index }: DocumentoCardProps) {
  const status = validadeStatus(documento.data_validade);
  const tipo = TIPO_LABEL[documento.tipo] ?? documento.tipo;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, type: "spring", damping: 22 }}
      className="bg-white rounded-[16px] border border-[#E0E0E0]"
    >
      <Link href={`/documentos/${documento.id}`} className="flex items-center gap-4 p-4">
        <div className="w-12 h-12 rounded-[12px] flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${COLOR}30` }}>
          <FileText size={24} style={{ color: TEXT }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-700 text-[#333333]">{tipo}</p>
            {status && (
              <span className="text-[10px] font-700 px-2 py-0.5 rounded-full"
                style={{ backgroundColor: STATUS_STYLE[status].bg, color: STATUS_STYLE[status].text }}>
                {STATUS_STYLE[status].label}
              </span>
            )}
          </div>
          {documento.numero && (
            <p className="text-xs text-[#666666] mt-0.5 truncate">
              {documento.numero.replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
            </p>
          )}
          {membro && <p className="text-xs text-[#999999]">{membro.nome}</p>}
        </div>
      </Link>
    </motion.div>
  );
}
