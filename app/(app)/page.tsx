import Link from "next/link";
import { Settings } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { MODULES } from "@/lib/modules";
import { ModuleCard } from "@/components/modules/ModuleCard";

const GRID_IDS = ["imoveis", "tarefas", "documentos", "contatos", "feiras", "contas", "familia", "pets", "saude", "veiculos"];

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

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

function getUserInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export default async function HomePage() {
  const supabase = await createClient();
  const [{ data: { user } }, counts] = await Promise.all([
    supabase.auth.getUser(),
    getCounts(supabase),
  ]);

  const fullName = user?.user_metadata?.full_name ?? user?.email?.split("@")[0] ?? "Família";
  const firstName = fullName.split(" ")[0];
  const initials = getUserInitials(fullName);
  const countMap: Record<string, number> = { ...counts, config: 0 };
  const gridModules = GRID_IDS.map((id) => MODULES.find((m) => m.id === id)!).filter(Boolean);

  return (
    <>
      {/* ── Premium dark header ── */}
      <header className="relative overflow-hidden px-5 pt-14 pb-7">
        {/* Background glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse 80% 100% at 30% 0%, rgba(147,51,234,0.18) 0%, transparent 65%)",
          }}
        />
        {/* Bottom separator */}
        <div
          className="absolute bottom-0 left-5 right-5 h-px"
          style={{ background: "rgba(255,255,255,0.07)" }}
        />

        <div className="relative z-10 flex items-center gap-4 max-w-[480px] mx-auto">
          <div className="flex-1 min-w-0">
            <p
              className="font-500 mb-0.5 tracking-wide uppercase"
              style={{ fontSize: 11, color: "rgba(240,240,255,0.45)", letterSpacing: "0.07em" }}
            >
              {getGreeting()}
            </p>
            <h1
              className="font-700 leading-tight truncate"
              style={{ fontSize: 26, color: "#F0F0FF", letterSpacing: "-0.02em" }}
            >
              {firstName} 👋
            </h1>
            <p style={{ fontSize: 13, color: "rgba(240,240,255,0.4)", marginTop: 2 }}>
              Tudo da família em um só lugar
            </p>
          </div>

          {/* User avatar + settings */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center font-700 text-sm"
              style={{
                background: "linear-gradient(135deg, #9C27B0, #673AB7)",
                color: "#fff",
                boxShadow: "0 4px 14px rgba(156,39,176,0.4)",
                fontSize: 13,
              }}
            >
              {initials}
            </div>
            <Link
              href="/config"
              aria-label="Configurações"
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all"
              style={{
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.12)",
              }}
            >
              <Settings size={18} style={{ color: "rgba(240,240,255,0.65)" }} />
            </Link>
          </div>
        </div>
      </header>

      {/* ── Module grid ── */}
      <main className="max-w-[480px] mx-auto w-full px-4 pt-5 pb-28">
        <div className="grid grid-cols-2 gap-3.5">
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
