import Link from "next/link";
import { Settings } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { MODULES } from "@/lib/modules";
import { ModuleCard } from "@/components/modules/ModuleCard";

const GRID_IDS = ["imoveis", "tarefas", "documentos", "contatos", "feiras", "contas", "familia", "pets", "veiculos"];

async function getCounts(supabase: Awaited<ReturnType<typeof createClient>>) {
  const tables = ["imoveis", "documentos", "contatos", "feiras", "contas", "familia_membros", "pets", "veiculos"] as const;
  const [tarefasAtivas, ...rest] = await Promise.all([
    supabase.from("tarefas").select("id", { count: "exact", head: true }).in("status", ["pendente", "em_andamento"]),
    ...tables.map((t) => supabase.from(t).select("id", { count: "exact", head: true })),
  ]);
  return {
    tarefas: tarefasAtivas.count ?? 0,
    imoveis: rest[0].count ?? 0,
    documentos: rest[1].count ?? 0,
    contatos: rest[2].count ?? 0,
    feiras: rest[3].count ?? 0,
    contas: rest[4].count ?? 0,
    familia: rest[5].count ?? 0,
    pets: rest[6].count ?? 0,
    veiculos: rest[7].count ?? 0,
  };
}

export default async function HomePage() {
  const supabase = await createClient();
  const [{ data: { user } }, counts] = await Promise.all([
    supabase.auth.getUser(),
    getCounts(supabase),
  ]);

  const firstName = user?.user_metadata?.full_name?.split(" ")[0]
    ?? user?.email?.split("@")[0]
    ?? "Família";

  const countMap: Record<string, number> = { ...counts, config: 0 };
  const gridModules = GRID_IDS.map((id) => MODULES.find((m) => m.id === id)!).filter(Boolean);

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";

  return (
    <>
      {/* Premium home header */}
      <header
        className="relative overflow-hidden px-5 pt-12 pb-8"
        style={{
          background: "linear-gradient(150deg, #1A1A2E 0%, #2D2D4E 60%, #1A1A2E 100%)",
        }}
      >
        {/* Subtle dot texture */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        />
        {/* Color accent bar */}
        <div
          className="absolute bottom-0 left-0 right-0 h-[3px]"
          style={{
            background: "linear-gradient(90deg, #E53935, #F5C842, #4CAF50, #2196F3)",
          }}
        />

        <div className="relative z-10 flex items-start gap-3 max-w-[480px] mx-auto">
          <div className="flex-1">
            <p className="text-white/50 text-[13px] font-500 tracking-[0.04em] uppercase mb-0.5">
              {greeting},
            </p>
            <h1
              className="text-white font-700 leading-tight"
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "clamp(22px, 5vw, 28px)",
                textShadow: "0 2px 8px rgba(0,0,0,0.3)",
              }}
            >
              {firstName}
            </h1>
            <p className="text-white/40 text-xs mt-1 font-400">
              Casa da Família
            </p>
          </div>

          <Link
            href="/config"
            aria-label="Configurações"
            className="w-11 h-11 rounded-[14px] flex items-center justify-center mt-1 transition-all"
            style={{
              backgroundColor: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.12)",
              backdropFilter: "blur(8px)",
            }}
          >
            <Settings size={20} className="text-white/80" />
          </Link>
        </div>
      </header>

      <main className="max-w-[480px] mx-auto w-full px-4 pt-5 pb-28">
        <div className="grid grid-cols-2 gap-4">
          {gridModules.map((module, i) => (
            <ModuleCard
              key={module.id}
              id={module.id}
              label={module.label}
              color={module.color}
              gradient={module.gradient}
              textColor={module.textColor}
              href={module.href}
              count={countMap[module.id] ?? 0}
              index={i}
            />
          ))}
        </div>
      </main>
    </>
  );
}
