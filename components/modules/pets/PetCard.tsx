"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { PawPrint, CalendarClock } from "lucide-react";
import type { Pet, PetEvento } from "@/types/database";

const COLOR = "#FF6F00";

function proximoEventoBadge(eventos: PetEvento[]) {
  const comProxima = eventos
    .filter((e) => e.proxima_data)
    .sort((a, b) => a.proxima_data!.localeCompare(b.proxima_data!));
  if (comProxima.length === 0) return null;
  const proximo = comProxima[0];
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const data = new Date(proximo.proxima_data! + "T12:00:00");
  const diff = Math.ceil((data.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
  const label = proximo.tipo.charAt(0).toUpperCase() + proximo.tipo.slice(1);
  if (diff < 0) return { label, diff, color: "#E53935" };
  if (diff <= 7) return { label, diff, color: "#F5C842" };
  return { label, diff, color: "#4CAF50" };
}

interface PetCardProps {
  pet: Pet;
  eventos: PetEvento[];
  index: number;
}

export function PetCard({ pet, eventos, index }: PetCardProps) {
  const badge = proximoEventoBadge(eventos);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, type: "spring", damping: 22 }}
      className="bg-white rounded-[16px] border border-[#E0E0E0]"
    >
      <Link href={`/pets/${pet.id}`} className="flex items-center gap-4 p-4">
        <div className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${COLOR}20` }}>
          {pet.foto_url
            ? <img src={pet.foto_url} alt={pet.nome} className="w-14 h-14 rounded-full object-cover" />
            : <PawPrint size={28} style={{ color: COLOR }} />
          }
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-700 text-[#333333]">{pet.nome}</p>
          {pet.raca && <p className="text-xs text-[#666666] mt-0.5">{pet.especie ? `${pet.especie} · ` : ""}{pet.raca}</p>}
          {badge && (
            <div className="flex items-center gap-1.5 mt-1.5">
              <CalendarClock size={12} style={{ color: badge.color }} />
              <span className="text-[11px] font-700" style={{ color: badge.color }}>
                {badge.label}
                {badge.diff < 0
                  ? ` (${Math.abs(badge.diff)}d atrasado)`
                  : badge.diff === 0
                  ? " (hoje!)"
                  : ` (em ${badge.diff}d)`}
              </span>
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
