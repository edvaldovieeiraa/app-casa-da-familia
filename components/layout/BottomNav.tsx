"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home } from "lucide-react";
import { MODULES } from "@/lib/modules";

const NAV_MODULE_IDS = ["imoveis", "familia", "feiras", "pets", "config"];
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
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#E0E0E0] flex safe-area-pb">
      {items.map(({ id, label, color, href, Icon }) => {
        const isActive = id === "home" ? pathname === "/" : pathname.startsWith(href);
        return (
          <Link
            key={id}
            href={href}
            aria-label={label}
            className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2 min-h-[56px] transition-colors"
          >
            <Icon size={22} style={{ color: isActive ? color : "#999999" }} />
            <span className="text-[9px] font-700 leading-tight" style={{ color: isActive ? color : "#999999" }}>
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
