"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home } from "lucide-react";
import { motion } from "framer-motion";
import { MODULES } from "@/lib/modules";

const NAV_MODULE_IDS = ["imoveis", "tarefas", "veiculos", "familia", "pets"];
const NAV_MODULES = NAV_MODULE_IDS.map((id) => MODULES.find((m) => m.id === id)!).filter(Boolean);

interface NavItem {
  id: string;
  label: string;
  color: string;
  href: string;
  Icon: React.ComponentType<{ size: number; style?: React.CSSProperties }>;
}

const HOME_ITEM: NavItem = {
  id: "home",
  label: "Início",
  color: "#1A1A2E",
  href: "/",
  Icon: Home,
};

export function BottomNav() {
  const pathname = usePathname();

  const items: NavItem[] = [
    HOME_ITEM,
    ...NAV_MODULES.map((m) => ({
      id: m.id,
      label: m.label,
      color: m.color,
      href: m.href,
      Icon: m.icon,
    })),
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 flex safe-area-pb"
      style={{
        background: "rgba(255,255,255,0.88)",
        backdropFilter: "blur(20px) saturate(180%)",
        WebkitBackdropFilter: "blur(20px) saturate(180%)",
        borderTop: "1px solid rgba(0,0,0,0.06)",
        boxShadow: "0 -4px 20px rgba(0,0,0,0.06)",
      }}
    >
      {items.map(({ id, label, color, href, Icon }) => {
        const isActive = id === "home" ? pathname === "/" : pathname.startsWith(href);

        return (
          <Link
            key={id}
            href={href}
            aria-label={label}
            className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 min-h-[60px]"
          >
            {/* Pill indicator */}
            <motion.div
              animate={{
                backgroundColor: isActive ? `${color}18` : "transparent",
                scale: isActive ? 1 : 0.85,
              }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className="w-12 h-8 rounded-full flex items-center justify-center"
            >
              <motion.div
                animate={{ scale: isActive ? 1.1 : 1 }}
                transition={{ type: "spring", damping: 20, stiffness: 300 }}
              >
                <Icon
                  size={22}
                  style={{ color: isActive ? color : "#9CA3AF" }}
                />
              </motion.div>
            </motion.div>

            <span
              className="text-[9px] font-700 leading-tight tracking-wide"
              style={{ color: isActive ? color : "#9CA3AF" }}
            >
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
