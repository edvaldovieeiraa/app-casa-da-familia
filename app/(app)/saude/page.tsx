"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, HeartPulse, Pill, AlertCircle } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { PacienteCard } from "@/components/modules/saude/PacienteCard";
import { usePacientes } from "@/hooks/useSaude";
import { createClient } from "@/lib/supabase/client";
import type { SaudeMedicamento } from "@/types/database";

const COLOR = "#E91E63";

export default function SaudePage() {
  const router = useRouter();
  const { pacientes, loading, error } = usePacientes();
  const [medMap, setMedMap] = useState<Record<string, SaudeMedicamento[]>>({});
  const [medicamentosHoje, setMedicamentosHoje] = useState<{ nome: string; paciente: string; horarios: string[] }[]>([]);

  useEffect(() => {
    if (pacientes.length === 0) return;
    let cancelled = false;
    const supabase = createClient();
    supabase
      .from("saude_medicamentos")
      .select("*")
      .in("paciente_id", pacientes.map((p) => p.id))
      .eq("ativo", true)
      .then(({ data }) => {
        if (cancelled || !data) return;
        const map: Record<string, SaudeMedicamento[]> = {};
        const hoje: { nome: string; paciente: string; horarios: string[] }[] = [];
        for (const m of data as SaudeMedicamento[]) {
          if (!map[m.paciente_id]) map[m.paciente_id] = [];
          map[m.paciente_id].push(m);
          if (m.horarios && m.horarios.length > 0) {
            const pac = pacientes.find((p) => p.id === m.paciente_id);
            hoje.push({ nome: m.nome, paciente: pac?.apelido ?? pac?.nome ?? "", horarios: m.horarios });
          }
        }
        setMedMap(map);
        setMedicamentosHoje(hoje);
      });
    return () => { cancelled = true; };
  }, [pacientes]);

  const estoquesBaixos = Object.values(medMap)
    .flat()
    .filter((m) => m.estoque_atual !== null && m.estoque_minimo !== null && m.estoque_atual <= m.estoque_minimo);

  return (
    <>
      <Header
        title="Saúde"
        color={COLOR}
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
        {loading && <div className="flex flex-col gap-3"><Skeleton variant="text" count={4} /></div>}
        {!loading && error && (
          <p className="text-sm text-[#E53935] text-center py-8">{error}</p>
        )}

        {!loading && !error && pacientes.length === 0 && (
          <EmptyState
            icon={HeartPulse}
            title="Nenhum paciente"
            description="Cadastre os membros da família para acompanhar medicamentos, consultas e sinais vitais."
            actionLabel="Adicionar paciente"
            onAction={() => router.push("/saude/novo")}
            color={COLOR}
          />
        )}

        {!loading && !error && pacientes.length > 0 && (
          <>
            {/* Alertas de hoje */}
            {(medicamentosHoje.length > 0 || estoquesBaixos.length > 0) && (
              <div className="mb-4 flex flex-col gap-2">
                {estoquesBaixos.length > 0 && (
                  <div
                    className="flex items-start gap-3 p-3 rounded-[12px]"
                    style={{ backgroundColor: "#FFEBEE" }}
                  >
                    <AlertCircle size={18} className="mt-0.5 flex-shrink-0" style={{ color: "#E53935" }} />
                    <div>
                      <p className="text-sm font-bold text-[#E53935]">Estoque baixo</p>
                      <p className="text-xs text-[#C62828] mt-0.5">
                        {estoquesBaixos.map((m) => m.nome).join(", ")}
                      </p>
                    </div>
                  </div>
                )}
                {medicamentosHoje.length > 0 && (
                  <div
                    className="flex items-start gap-3 p-3 rounded-[12px]"
                    style={{ backgroundColor: "#F3E5F5" }}
                  >
                    <Pill size={18} className="mt-0.5 flex-shrink-0" style={{ color: "#9C27B0" }} />
                    <div>
                      <p className="text-sm font-bold text-[#9C27B0]">
                        {medicamentosHoje.length} remédio{medicamentosHoje.length !== 1 ? "s" : ""} hoje
                      </p>
                      <p className="text-xs text-[#7B1FA2] mt-0.5">
                        {medicamentosHoje.slice(0, 3).map((m) => `${m.nome} (${m.paciente})`).join(", ")}
                        {medicamentosHoje.length > 3 && ` e mais ${medicamentosHoje.length - 3}`}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-col gap-3">
              {pacientes.map((pac, i) => (
                <PacienteCard
                  key={pac.id}
                  paciente={pac}
                  medicamentos={medMap[pac.id] ?? []}
                  index={i}
                />
              ))}
            </div>

            <div className="mt-4">
              <Button
                fullWidth
                icon={Plus}
                onClick={() => router.push("/saude/novo")}
                style={{ backgroundColor: COLOR }}
              >
                Adicionar paciente
              </Button>
            </div>
          </>
        )}
      </PageContainer>
    </>
  );
}
