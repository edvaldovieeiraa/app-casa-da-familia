"use client";

import { motion } from "framer-motion";
import type { DiaSemana } from "@/types/database";

const COLOR = "#2196F3";
const DIAS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

interface WeekCalendarProps {
  diasComFeira: DiaSemana[];
  selected: DiaSemana | null;
  onSelect: (dia: DiaSemana | null) => void;
}

export function WeekCalendar({ diasComFeira, selected, onSelect }: WeekCalendarProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
      {(DIAS as string[]).map((label, i) => {
        const dia = i as DiaSemana;
        const temFeira = diasComFeira.includes(dia);
        const isSelected = selected === dia;

        return (
          <motion.button
            key={dia}
            whileTap={{ scale: 0.9 }}
            onClick={() => onSelect(isSelected ? null : dia)}
            className="flex flex-col items-center gap-1.5 min-w-[52px] py-3 px-1 rounded-[14px] flex-shrink-0 transition-colors"
            style={{
              backgroundColor: isSelected ? COLOR : "transparent",
              border: `2px solid ${isSelected ? COLOR : "#E0E0E0"}`,
            }}
          >
            <span className="text-xs font-700"
              style={{ color: isSelected ? "#fff" : "#666666" }}>{label}</span>
            <div className="w-2 h-2 rounded-full transition-colors"
              style={{
                backgroundColor: temFeira
                  ? isSelected ? "#fff" : COLOR
                  : "transparent",
              }} />
          </motion.button>
        );
      })}
    </div>
  );
}
