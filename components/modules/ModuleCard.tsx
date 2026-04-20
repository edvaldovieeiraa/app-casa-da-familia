"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Building2,
  FileText,
  Users,
  Users2,
  ShoppingCart,
  Wallet,
  Settings,
  PawPrint,
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
    : { backgroundColor: color };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, type: "spring", damping: 22 }}
    >
      <Link href={href} aria-label={label}>
        <motion.div
          whileTap={{ scale: 0.95 }}
          className="rounded-[16px] p-5 flex flex-col gap-3 min-h-[140px] justify-between"
          style={bgStyle}
        >
          <Icon size={32} style={{ color: textColor }} />
          <div>
            <p className="text-lg font-800 leading-tight" style={{ color: textColor }}>
              {label}
            </p>
            {count > 0 && (
              <p
                className="text-xs font-600 mt-0.5"
                style={{ color: `${textColor}BB` }}
              >
                {count} cadastrado{count !== 1 ? "s" : ""}
              </p>
            )}
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
}
