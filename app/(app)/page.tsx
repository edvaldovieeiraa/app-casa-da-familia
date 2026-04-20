import Link from "next/link";
import { Settings } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { MODULES } from "@/lib/modules";
import { ModuleCard } from "@/components/modules/ModuleCard";

const GRID_IDS = ["imoveis", "documentos", "contatos", "feiras", "contas", "familia", "pets"];

async function getCounts(supabase: Awaited<ReturnType<typeof createClient>>) {
  const tables = ["imoveis", "documentos", "contatos", "feiras", "contas", "familia_membros", "pets"] as const;
  const results = await Promise.all(
    tables.map((t) => supabase.from(t).select("id", { count: "exact", head: true }))
  );
  return {
    imoveis: results[0].count ?? 0,
    documentos: results[1].count ?? 0,
    contatos: results[2].count ?? 0,
    feiras: results[3].count ?? 0,
    contas: results[4].count ?? 0,
    familia: results[5].count ?? 0,
    pets: results[6].count ?? 0,
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

  return (
    <>
      <header className="px-5 pt-10 pb-6" style={{ backgroundColor: "#1A1A2E" }}>
        <div className="flex items-center gap-3 max-w-[480px] mx-auto">
          <div className="flex-1">
            <p className="text-white/60 text-sm">Olá,</p>
            <p className="text-white font-800 text-lg leading-tight">{firstName}</p>
          </div>
          <Link href="/config" aria-label="Configurações"
            className="w-11 h-11 rounded-[14px] bg-white/10 flex items-center justify-center">
            <Settings size={22} className="text-white" />
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
