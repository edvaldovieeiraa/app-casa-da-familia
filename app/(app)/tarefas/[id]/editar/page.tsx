"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { PageContainer } from "@/components/layout/PageContainer";
import { ToastContainer } from "@/components/ui/Toast";
import { Skeleton } from "@/components/ui/Skeleton";
import { TarefaForm } from "@/components/modules/tarefas/TarefaForm";
import { useTarefa, useTarefas } from "@/hooks/useTarefas";
import { useToast } from "@/hooks/useToast";

export default function EditarTarefaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { tarefa, checklist, loading, error } = useTarefa(id);
  const { updateTarefa } = useTarefas();
  const { toasts, addToast, removeToast } = useToast();
  const [saving, setSaving] = useState(false);

  async function handleSubmit(values: Parameters<typeof updateTarefa>[1], _checklist: string[]) {
    setSaving(true);
    try {
      await updateTarefa(id, values);
      addToast("Tarefa atualizada!", "success");
      setTimeout(() => router.push(`/tarefas/${id}`), 800);
    } catch (err) {
      addToast(err instanceof Error ? err.message : "Erro ao salvar", "error");
      setSaving(false);
    }
  }

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <Header title="Editar Tarefa" color="#00897B" showBack />
      <PageContainer>
        {loading && <Skeleton variant="card" count={4} />}
        {!loading && error && <p className="text-sm text-[#E53935] text-center py-8">{error}</p>}
        {!loading && !error && tarefa && (
          <TarefaForm
            initial={tarefa}
            initialChecklist={checklist.map((i) => i.texto)}
            onSubmit={handleSubmit}
            loading={saving}
            submitLabel="Salvar alterações"
          />
        )}
      </PageContainer>
    </>
  );
}
