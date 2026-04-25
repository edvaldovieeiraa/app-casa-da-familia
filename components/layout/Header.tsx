"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

interface HeaderProps {
  title: string;
  color: string;
  textColor?: string;
  showBack?: boolean;
  actions?: React.ReactNode;
}

export function Header({
  title,
  color,
  textColor = "#F0F0FF",
  showBack = false,
  actions,
}: HeaderProps) {
  const router = useRouter();

  return (
    <header
      className="sticky top-0 z-40 flex items-center gap-3 px-4"
      style={{
        minHeight: 64,
        background: `rgba(15, 15, 26, 0.85)`,
        backdropFilter: "blur(30px) saturate(200%)",
        WebkitBackdropFilter: "blur(30px) saturate(200%)",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        boxShadow: `0 1px 0 rgba(255,255,255,0.05), 0 4px 24px rgba(0,0,0,0.3)`,
      }}
    >
      {/* Color glow backdrop */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 60% 100% at 0% 50%, ${color}18 0%, transparent 70%)`,
        }}
      />

      {showBack && (
        <button
          onClick={() => router.back()}
          aria-label="Voltar"
          className="relative z-10 w-10 h-10 flex items-center justify-center rounded-full flex-shrink-0 transition-all"
          style={{
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.14)",
            color: textColor,
          }}
        >
          <ArrowLeft size={20} />
        </button>
      )}

      <h1
        className="relative z-10 flex-1 font-700 truncate"
        style={{
          color: textColor,
          fontSize: 18,
          fontWeight: 700,
          letterSpacing: "-0.01em",
        }}
      >
        {title}
      </h1>

      {actions && (
        <div className="relative z-10 flex items-center gap-1">{actions}</div>
      )}
    </header>
  );
}
