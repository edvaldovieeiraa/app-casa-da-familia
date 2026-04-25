"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { PageContainer } from "@/components/layout/PageContainer";
import { ToastContainer } from "@/components/ui/Toast";
import { TarefaForm } from "@/components/modules/tarefas/TarefaForm";
import { useTarefas } from "@/hooks/useTarefas";
import { useToast } from "@/hooks/useToast";
import { createClient } from "@/lib/supabase/client";

export default function NovaTarefaPage() {
  const router = useRouter();
  const { createTarefa } = useTarefas();
  const { toasts, addToast, removeToast } = useToast();
  const [saving, setSaving] = useState(false);

  async function handleSubmit(values: Parameters<typeof createTarefa>[0], checklist: string[]) {
    setSaving(true);
    try {
      const nova = await createTarefa(values);

      if (checklist.length > 0) {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from("tarefa_checklist").insert(
            checklist.map((texto, ordem) => ({
              tarefa_id: nova.id, user_id: user.id, texto, concluido: false, ordem,
            }))
          );
        }
      }

      addToast("Tarefa criada!", "success");
      setTimeout(() => router.push(`/tarefas/${nova.id}`), 800);
    } catch (err) {
      addToast(err instanceof Error ? err.message : "Erro ao salvar", "error");
      setSaving(false);
    }
  }

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <Header title="Nova Tarefa" color="#00897B" showBack />
      <PageContainer>
        <TarefaForm onSubmit={handleSubmit} loading={saving} submitLabel="Criar tarefa" />
      </PageContainer>
    </>
  );
}
