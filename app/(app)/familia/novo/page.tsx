"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { PageContainer } from "@/components/layout/PageContainer";
import { ToastContainer } from "@/components/ui/Toast";
import { MembroForm } from "@/components/modules/familia/MembroForm";
import { useMembros } from "@/hooks/useMembros";
import { useToast } from "@/hooks/useToast";

export default function NovoMembroPage() {
  const router = useRouter();
  const { createMembro } = useMembros();
  const { toasts, addToast, removeToast } = useToast();
  const [saving, setSaving] = useState(false);

  async function handleSubmit(values: Parameters<typeof createMembro>[0]) {
    setSaving(true);
    try {
      const novo = await createMembro(values);
      addToast("Membro cadastrado!", "success");
      setTimeout(() => router.push(`/familia/${novo.id}`), 800);
    } catch (err) {
      addToast(err instanceof Error ? err.message : "Erro ao salvar", "error");
      setSaving(false);
    }
  }

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <Header title="Novo Membro" color="#9C27B0" showBack />
      <PageContainer>
        <MembroForm onSubmit={handleSubmit} loading={saving} submitLabel="Cadastrar membro" />
      </PageContainer>
    </>
  );
}
