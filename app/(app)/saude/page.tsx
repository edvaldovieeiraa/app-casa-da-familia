"use client";

import { useRouter } from "next/navigation";
import { Plus, Heart } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { PacienteCard } from "@/components/modules/saude/PacienteCard";
import { usePacientes } from "@/hooks/useSaude";
import { createClient } from "@/lib/supabase/client";
import { useState, useEffect } from "react";
import type { SaudeMedicamento, SaudeConsulta } from "@/types/database";

const COLOR = "#00ACC1";

export default function SaudePage() {
  const router = useRouter();
  const { pacientes, loading, error } = usePacientes();
  const [medsMap, setMedsMap] = useState<Record<string, number>>({});
  const [consultasMap, setConsultasMap] = useState<Record<string, string | null>>({});

  useEffect(() => {
    if (pacientes.length === 0) return;
    let cancelled = false;
    const supabase = createClient();
    const ids = pacientes.map((p) => p.id);
    Promise.all([
      supabase.from("saude_medicamentos").select("paciente_id").in("paciente_id", ids).eq("ativo", true),
      supabase.from("saude_consultas").select("paciente_id, data_hora")
        .in("paciente_id", ids)
        .gte("data_hora", new Date().toISOString())
        .order("data_hora"),
    ]).then(([medsRes, consRes]) => {
      if (cancelled) return;
      const meds: Record<string, number> = {};
      for (const m of (medsRes.data ?? []) as { paciente_id: string }[]) {
        meds[m.paciente_id] = (meds[m.paciente_id] ?? 0) + 1;
      }
      setMedsMap(meds);

      const cons: Record<string, string | null> = {};
      for (const c of (consRes.data ?? []) as SaudeConsulta[]) {
        if (!cons[c.paciente_id]) cons[c.paciente_id] = c.data_hora;
      }
      setConsultasMap(cons);
    });
    return () => { cancelled = true; };
  }, [pacientes]);

  return (
    <>
      <Header
        title="Saúde"
        color={COLOR}
        showBack={false}
        actions={
          <button
            onClick={() => router.push("/saude/novo")}
            aria-label="Adicionar paciente"
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors text-white"
          >
            <Plus size={22} />
          </button>
        }
      />

      <PageContainer>
        {loading && <div className="flex flex-col gap-3"><Skeleton variant="card" count={3} /></div>}
        {!loading && error && <p className="text-sm text-[#E53935] text-center py-8">{error}</p>}
        {!loading && !error && pacientes.length === 0 && (
          <EmptyState
            icon={Heart}
            title="Nenhum perfil de saúde"
            description="Cadastre os membros da família para acompanhar medicamentos, consultas e sinais vitais."
            actionLabel="Adicionar perfil"
            onAction={() => router.push("/saude/novo")}
            color={COLOR}
          />
        )}
        {!loading && !error && pacientes.length > 0 && (
          <div className="flex flex-col gap-3">
            {pacientes.map((p, i) => (
              <PacienteCard
                key={p.id}
                paciente={p}
                medicamentosAtivos={medsMap[p.id] ?? 0}
                proximaConsulta={consultasMap[p.id] ?? null}
                index={i}
              />
            ))}
          </div>
        )}
        {!loading && pacientes.length > 0 && (
          <div className="mt-4">
            <Button fullWidth icon={Plus} onClick={() => router.push("/saude/novo")}
              style={{ backgroundColor: COLOR }}>
              Adicionar perfil
            </Button>
          </div>
        )}
      </PageContainer>
    </>
  );
}
