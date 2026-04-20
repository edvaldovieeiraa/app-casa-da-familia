"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { PageContainer } from "@/components/layout/PageContainer";
import { ToastContainer } from "@/components/ui/Toast";
import { FeiraForm } from "@/components/modules/feiras/FeiraForm";
import { useFeiras } from "@/hooks/useFeiras";
import { useToast } from "@/hooks/useToast";

export default function NovaFeiraPage() {
  const router = useRouter();
  const { createFeira } = useFeiras();
  const { toasts, addToast, removeToast } = useToast();
  const [saving, setSaving] = useState(false);

  async function handleSubmit(values: Parameters<typeof createFeira>[0]) {
    setSaving(true);
    try {
      const nova = await createFeira(values);
      addToast("Feira cadastrada!", "success");
      setTimeout(() => router.push(`/feiras/${nova.id}`), 800);
    } catch (err) {
      addToast(err instanceof Error ? err.message : "Erro ao salvar", "error");
      setSaving(false);
    }
  }

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <Header title="Nova Feira" color="#2196F3" showBack />
      <PageContainer>
        <FeiraForm onSubmit={handleSubmit} loading={saving} submitLabel="Cadastrar feira" />
      </PageContainer>
    </>
  );
}
