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
  textColor = "#FFFFFF",
  showBack = false,
  actions,
}: HeaderProps) {
  const router = useRouter();

  return (
    <header
      className="sticky top-0 z-40 flex items-center gap-3 px-4 h-[60px] shadow-sm"
      style={{ backgroundColor: color }}
    >
      {showBack && (
        <button
          onClick={() => router.back()}
          aria-label="Voltar"
          className="w-10 h-10 flex items-center justify-center rounded-full transition-colors hover:bg-white/20 flex-shrink-0"
          style={{ color: textColor }}
        >
          <ArrowLeft size={22} />
        </button>
      )}
      <h1
        className="flex-1 text-lg font-800 truncate"
        style={{ color: textColor }}
      >
        {title}
      </h1>
      {actions && <div className="flex items-center gap-1">{actions}</div>}
    </header>
  );
}
