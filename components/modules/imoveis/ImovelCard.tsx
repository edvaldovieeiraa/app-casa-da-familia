"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Building2, MapPin, Star } from "lucide-react";
import type { Imovel } from "@/types/database";

interface ImovelCardProps {
  imovel: Imovel;
  index: number;
  onToggleFavorito: (id: string, favorito: boolean) => void;
}

export function ImovelCard({ imovel, index, onToggleFavorito }: ImovelCardProps) {
  const endereco = [imovel.logradouro, imovel.numero, imovel.bairro]
    .filter(Boolean)
    .join(", ");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, type: "spring", damping: 22 }}
      className="bg-white rounded-[16px] border border-[#E0E0E0] overflow-hidden"
    >
      <Link href={`/imoveis/${imovel.id}`} className="flex items-center gap-4 p-4">
        {/* Thumbnail */}
        <div className="w-14 h-14 rounded-[12px] bg-[#E53935]/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
          {imovel.foto_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imovel.foto_url}
              alt={imovel.nome}
              className="w-full h-full object-cover"
            />
          ) : (
            <Building2 size={28} className="text-[#E53935]" />
          )}
        </div>

        {/* Texto */}
        <div className="flex-1 min-w-0">
          <p className="font-700 text-[#333333] truncate">
            {imovel.apelido ?? imovel.nome}
          </p>
          {endereco && (
            <div className="flex items-center gap-1 mt-0.5">
              <MapPin size={12} className="text-[#999999] flex-shrink-0" />
              <p className="text-xs text-[#666666] truncate">{endereco}</p>
            </div>
          )}
        </div>
      </Link>

      {/* Favorito */}
      <button
        onClick={(e) => {
          e.preventDefault();
          onToggleFavorito(imovel.id, imovel.favorito);
        }}
        aria-label={imovel.favorito ? "Remover dos favoritos" : "Adicionar aos favoritos"}
        className="absolute top-3 right-3 w-9 h-9 flex items-center justify-center"
      >
        <Star
          size={18}
          fill={imovel.favorito ? "#F5C842" : "none"}
          className={imovel.favorito ? "text-[#F5C842]" : "text-[#CCCCCC]"}
        />
      </button>
    </motion.div>
  );
}
