"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Building2, FileText, ShoppingCart, Wallet } from "lucide-react";

const NAV_ITEMS = [
  { href: "/",          icon: Home,         label: "Início",    activeColor: "#9C27B0" },
  { href: "/imoveis",   icon: Building2,    label: "Imóveis",   activeColor: "#E53935" },
  { href: "/documentos",icon: FileText,     label: "Docs",      activeColor: "#F5C842" },
  { href: "/feiras",    icon: ShoppingCart, label: "Feiras",    activeColor: "#2196F3" },
  { href: "/contas",    icon: Wallet,       label: "Contas",    activeColor: "#E53935" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        height: 64,
        background: "rgba(15,15,26,0.95)",
        backdropFilter: "blur(30px) saturate(200%)",
        WebkitBackdropFilter: "blur(30px) saturate(200%)",
        borderTop: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "0 -4px 24px rgba(0,0,0,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-around",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
        zIndex: 50,
      }}
    >
      {NAV_ITEMS.map(({ href, icon: Icon, label, activeColor }) => {
        const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);

        return (
          <Link
            key={href}
            href={href}
            aria-label={label}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 3,
              flex: 1,
              height: "100%",
              textDecoration: "none",
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: isActive ? `${activeColor}22` : "transparent",
                transition: "background 0.2s",
              }}
            >
              <Icon
                size={22}
                style={{
                  color: isActive ? activeColor : "rgba(255,255,255,0.4)",
                  transition: "color 0.2s",
                  strokeWidth: isActive ? 2.2 : 1.8,
                } as React.CSSProperties}
              />
            </div>
            <span
              style={{
                fontSize: 10,
                color: isActive ? activeColor : "rgba(255,255,255,0.4)",
                fontWeight: isActive ? 600 : 400,
                letterSpacing: "0.01em",
                lineHeight: 1,
              }}
            >
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
