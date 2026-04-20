"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Phone } from "lucide-react";
import type { Contato } from "@/types/database";

const COLOR = "#4CAF50";

const AVATAR_COLORS = [
  "#E53935", "#4CAF50", "#2196F3", "#F5C842",
  "#9C27B0", "#FF5722", "#00BCD4", "#FF9800",
];

function getAvatarColor(nome: string) {
  let hash = 0;
  for (let i = 0; i < nome.length; i++) hash = nome.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function initials(nome: string) {
  return nome.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

const CATEGORIA_LABEL: Record<string, string> = {
  medico: "Médico", advogado: "Advogado", prestador: "Prestador",
  vizinho: "Vizinho", familiar: "Familiar", amigo: "Amigo",
  comercio: "Comércio", outro: "Outro",
};

interface ContatoCardProps {
  contato: Contato;
  index: number;
}

export function ContatoCard({ contato, index }: ContatoCardProps) {
  const avatarColor = getAvatarColor(contato.nome);
  const label = CATEGORIA_LABEL[contato.categoria] ?? contato.categoria;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, type: "spring", damping: 22 }}
      className="bg-white rounded-[16px] border border-[#E0E0E0]"
    >
      <Link href={`/contatos/${contato.id}`} className="flex items-center gap-4 p-4">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 text-white font-700 text-base"
          style={{ backgroundColor: avatarColor }}
        >
          {initials(contato.nome)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-700 text-[#333333] truncate">{contato.nome}</p>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span
              className="text-[10px] font-700 px-2 py-0.5 rounded-full text-white"
              style={{ backgroundColor: COLOR }}
            >
              {label}
            </span>
            {contato.telefone_principal && (
              <span className="text-xs text-[#666666] flex items-center gap-1">
                <Phone size={11} /> {contato.telefone_principal}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
