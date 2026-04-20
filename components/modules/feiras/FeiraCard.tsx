"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ShoppingCart, MapPin } from "lucide-react";
import type { Feira } from "@/types/database";

const COLOR = "#2196F3";

const DIAS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

interface FeiraCardProps {
  feira: Feira;
  index: number;
}

export function FeiraCard({ feira, index }: FeiraCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, type: "spring", damping: 22 }}
      className="bg-white rounded-[16px] border border-[#E0E0E0]"
    >
      <Link href={`/feiras/${feira.id}`} className="flex items-center gap-4 p-4">
        <div className="w-12 h-12 rounded-[12px] flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${COLOR}20` }}>
          <ShoppingCart size={24} style={{ color: COLOR }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-700 text-[#333333] truncate">{feira.nome}</p>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            {feira.dia_semana != null && (
              <span className="text-[10px] font-700 px-2 py-0.5 rounded-full text-white"
                style={{ backgroundColor: COLOR }}>
                {DIAS[feira.dia_semana]}
              </span>
            )}
            {feira.local && (
              <span className="text-xs text-[#666666] flex items-center gap-1 truncate">
                <MapPin size={11} /> {feira.local}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
