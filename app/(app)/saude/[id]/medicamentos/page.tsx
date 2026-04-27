"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pill } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ToastContainer } from "@/components/ui/Toast";
import { MedicamentoCard } from "@/components/modules/saude/MedicamentoCard";
import { usePaciente, useMedicamentos, useDoses } from "@/hooks/useSaude";
import { useToast } from "@/hooks/useToast";

const COLOR = "#9C27B0";

function DoseRegistrar({ medicamentoId, onDone }: { medicamentoId: string; onDone: () => void }) {
  const { registrarDose } = useDoses(medicamentoId);
  const { addToast } = useToast();

  async function registrar(tomou: boolean) {
    try {
      await registrarDose(tomou);
      addToast(tomou ? "Dose registrada!" : "Não tomou registrado", "success");
      onDone();
    } catch {
      addToast("Erro ao registrar dose", "error");
    }
  }

  return registrar;
}

export default function MedicamentosPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { toasts, addToast, removeToast } = useToast();
  const { paciente } = usePaciente(id);
  const { medicamentos, ativos, inativos, loading, refetch } = useMedicamentos(id);

  async function handleDose(medicamentoId: string, tomou: boolean) {
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    const { error } = await supabase
      .from("saude_doses")
      .insert({ medicamento_id: medicamentoId, tomou, data_hora: new Date().toISOString() });
    if (error) {
      addToast("Erro ao registrar dose", "error");
    } else {
      addToast(tomou ? "Dose registrada!" : "Não tomou registrado", "success");
    }
  }

  const nome = paciente?.apelido ?? paciente?.nome ?? "Paciente";

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <Header title={`Remédios · ${nome}`} color={COLOR} showBack />
      <PageContainer>
        {loading && <div className="flex flex-col gap-3"><Skeleton variant="text" count={4} /></div>}

        {!loading && medicamentos.length === 0 && (
          <EmptyState
            icon={Pill}
            title="Nenhum medicamento"
            description="Cadastre os remédios e acompanhe as doses e o estoque."
            actionLabel="Adicionar medicamento"
            onAction={() => router.push(`/saude/${id}/medicamentos/novo`)}
            color={COLOR}
          />
        )}

        {!loading && ativos.length > 0 && (
          <>
            <p className="text-[11px] font-bold mb-2" style={{ color: "rgba(240,240,255,0.5)", letterSpacing: "0.08em" }}>
              EM USO ({ativos.length})
            </p>
            <div className="flex flex-col gap-3 mb-4">
              {ativos.map((m, i) => (
                <MedicamentoCard
                  key={m.id}
                  medicamento={m}
                  index={i}
                  onRegistrarDose={(tomou) => handleDose(m.id, tomou)}
                />
              ))}
            </div>
          </>
        )}

        {!loading && inativos.length > 0 && (
          <>
            <p className="text-[11px] font-bold mb-2" style={{ color: "rgba(240,240,255,0.5)", letterSpacing: "0.08em" }}>
              INATIVOS ({inativos.length})
            </p>
            <div className="flex flex-col gap-3 mb-4">
              {inativos.map((m, i) => (
                <MedicamentoCard key={m.id} medicamento={m} index={i} />
              ))}
            </div>
          </>
        )}

        {!loading && (
          <Button
            fullWidth
            icon={Plus}
            onClick={() => router.push(`/saude/${id}/medicamentos/novo`)}
            style={{ backgroundColor: COLOR }}
          >
            Adicionar medicamento
          </Button>
        )}
      </PageContainer>
    </>
  );
}
