"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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
  color: "#9C27B0",
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
      className="fixed bottom-0 left-0 right-0 z-40 flex items-stretch"
      style={{
        background: "rgba(15, 15, 26, 0.92)",
        backdropFilter: "blur(30px) saturate(200%)",
        WebkitBackdropFilter: "blur(30px) saturate(200%)",
        borderTop: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "0 -4px 24px rgba(0,0,0,0.4)",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
        minHeight: 64,
      }}
    >
      {items.map(({ id, label, color, href, Icon }) => {
        const isActive = id === "home" ? pathname === "/" : pathname.startsWith(href);

        return (
          <Link
            key={id}
            href={href}
            aria-label={label}
            className="flex-1 flex flex-col items-center justify-center py-2"
          >
            <motion.div
              animate={{
                y: isActive ? -2 : 0,
              }}
              transition={{ type: "spring", damping: 18, stiffness: 280 }}
              className="flex flex-col items-center gap-1"
            >
              {/* Pill background for active */}
              <div className="relative flex items-center justify-center">
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      key="pill"
                      initial={{ opacity: 0, scale: 0.7 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.7 }}
                      transition={{ type: "spring", damping: 20, stiffness: 320 }}
                      className="absolute inset-0 rounded-[12px]"
                      style={{
                        background: `${color}28`,
                        border: `1px solid ${color}40`,
                        padding: "6px 16px",
                        inset: "-6px -12px",
                      }}
                    />
                  )}
                </AnimatePresence>
                <Icon
                  size={22}
                  style={{
                    color: isActive ? color : "rgba(240,240,255,0.38)",
                    position: "relative",
                    zIndex: 1,
                    transition: "color 0.2s ease",
                  }}
                />
              </div>

              {/* Label only for active */}
              <AnimatePresence>
                {isActive && (
                  <motion.span
                    key="label"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    transition={{ duration: 0.18 }}
                    className="text-[9px] font-700 leading-none tracking-wide"
                    style={{ color }}
                  >
                    {label}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.div>
          </Link>
        );
      })}
    </nav>
  );
}
