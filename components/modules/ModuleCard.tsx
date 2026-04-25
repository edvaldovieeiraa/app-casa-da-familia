"use client";

import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import {
  Building2, FileText, Users, Users2,
  ShoppingCart, Wallet, Settings, PawPrint,
  Car, ClipboardList,
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
  rest: { x: "-120%", skewX: -12, opacity: 0 },
  hover: {
    x: "320%",
    skewX: -12,
    opacity: 1,
    transition: { duration: 0.55, ease: [0.25, 0.1, 0.25, 1] },
  },
};

export function ModuleCard({ id, label, color, gradient, href, count, index }: ModuleCardProps) {
  const Icon = ICON_MAP[id] ?? Building2;

  const cardGradient = gradient ?? `linear-gradient(135deg, ${color}28 0%, ${color}0F 100%)`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.06, type: "spring", damping: 22, stiffness: 220 }}
    >
      <Link href={href} aria-label={label}>
        <motion.div
          initial="rest"
          whileHover="hover"
          whileTap={{ scale: 0.96 }}
          className="relative overflow-hidden flex flex-col gap-4 min-h-[148px] justify-between cursor-pointer"
          style={{
            background: cardGradient,
            backdropFilter: "blur(20px) saturate(180%)",
            WebkitBackdropFilter: "blur(20px) saturate(180%)",
            border: `1px solid ${color}35`,
            borderTop: `2px solid ${color}80`,
            borderRadius: 20,
            padding: 18,
            boxShadow: `0 4px 24px ${color}20, 0 1px 0 rgba(255,255,255,0.06) inset`,
          }}
        >
          {/* Shine sweep */}
          <motion.div
            variants={shineVariants}
            className="absolute inset-y-0 w-[40%] pointer-events-none"
            style={{
              background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)",
            }}
          />

          {/* Counter badge */}
          {count > 0 && (
            <div
              className="absolute top-3 right-3 min-w-[22px] h-[22px] px-1.5 rounded-full flex items-center justify-center"
              style={{
                background: "rgba(255,255,255,0.14)",
                border: "1px solid rgba(255,255,255,0.22)",
                backdropFilter: "blur(8px)",
              }}
            >
              <span className="text-[10px] font-700 text-white leading-none">
                {count > 99 ? "99+" : count}
              </span>
            </div>
          )}

          {/* Glassmorphism icon container */}
          <div
            className="w-[52px] h-[52px] flex items-center justify-center flex-shrink-0"
            style={{
              background: `${color}30`,
              border: `1px solid ${color}55`,
              borderRadius: 16,
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
              boxShadow: `0 2px 12px ${color}25`,
            }}
          >
            <Icon size={26} style={{ color }} />
          </div>

          {/* Label */}
          <p
            className="font-600 leading-tight text-white"
            style={{ fontSize: 15, letterSpacing: "-0.01em" }}
          >
            {label}
          </p>
        </motion.div>
      </Link>
    </motion.div>
  );
}
