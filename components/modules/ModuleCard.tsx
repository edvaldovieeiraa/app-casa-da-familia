"use client";

import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import {
  Building2,
  FileText,
  Users,
  Users2,
  ShoppingCart,
  Wallet,
  Settings,
  PawPrint,
  Car,
  ClipboardList,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  imoveis:    Building2,
  documentos: FileText,
  contatos:   Users,
  feiras:     ShoppingCart,
  contas:     Wallet,
  familia:    Users2,
  pets:       PawPrint,
  config:     Settings,
  veiculos:   Car,
  tarefas:    ClipboardList,
};

export interface ModuleCardProps {
  id: string;
  label: string;
  color: string;
  gradient?: string;
  textColor: string;
  href: string;
  count: number;
  index: number;
}

const shineVariants: Variants = {
  rest: { x: "-120%", skewX: -12 },
  hover: {
    x: "320%",
    skewX: -12,
    transition: { duration: 0.55, ease: [0.25, 0.1, 0.25, 1] },
  },
};

export function ModuleCard({
  id,
  label,
  color,
  gradient,
  textColor,
  href,
  count,
  index,
}: ModuleCardProps) {
  const Icon = ICON_MAP[id] ?? Building2;

  const bgStyle = gradient
    ? { background: gradient }
    : { background: `linear-gradient(135deg, ${color} 0%, ${color}CC 100%)` };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.055, type: "spring", damping: 20, stiffness: 220 }}
    >
      <Link href={href} aria-label={label}>
        <motion.div
          initial="rest"
          whileHover="hover"
          whileTap={{ scale: 0.95 }}
          className="relative overflow-hidden rounded-[20px] p-5 flex flex-col gap-3 min-h-[148px] justify-between cursor-pointer"
          style={{
            ...bgStyle,
            boxShadow: `0 4px 20px ${color}35, 0 1px 3px rgba(0,0,0,0.08)`,
          }}
        >
          {/* Shine sweep */}
          <motion.div
            variants={shineVariants}
            className="absolute inset-y-0 w-[45%] pointer-events-none"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(255,255,255,0.22), transparent)",
            }}
          />

          {/* Badge */}
          {count > 0 && (
            <div
              className="absolute top-3.5 right-3.5 min-w-[22px] h-[22px] px-1.5 rounded-full flex items-center justify-center"
              style={{
                backgroundColor: "rgba(255,255,255,0.25)",
                backdropFilter: "blur(4px)",
                WebkitBackdropFilter: "blur(4px)",
              }}
            >
              <span className="text-[10px] font-800 leading-none" style={{ color: textColor }}>
                {count > 99 ? "99+" : count}
              </span>
            </div>
          )}

          {/* Glassmorphism icon container */}
          <div
            className="w-12 h-12 rounded-[14px] flex items-center justify-center flex-shrink-0"
            style={{
              backgroundColor: "rgba(255,255,255,0.2)",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
              border: "1px solid rgba(255,255,255,0.3)",
            }}
          >
            <Icon size={26} style={{ color: textColor }} />
          </div>

          {/* Label */}
          <p
            className="text-[17px] font-800 leading-tight"
            style={{
              color: textColor,
              fontFamily: "var(--font-serif)",
              textShadow: "0 1px 3px rgba(0,0,0,0.12)",
            }}
          >
            {label}
          </p>
        </motion.div>
      </Link>
    </motion.div>
  );
}
