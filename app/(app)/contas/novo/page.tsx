"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { PageContainer } from "@/components/layout/PageContainer";
import { ToastContainer } from "@/components/ui/Toast";
import { ContaForm } from "@/components/modules/contas/ContaForm";
import { useContas } from "@/hooks/useContas";
import { useImoveis } from "@/hooks/useImoveis";
import { useToast } from "@/hooks/useToast";

export default function NovaContaPage() {
  const router = useRouter();
  const { createConta } = useContas();
  const { imoveis } = useImoveis();
  const { toasts, addToast, removeToast } = useToast();
  const [saving, setSaving] = useState(false);

  async function handleSubmit(values: Parameters<typeof createConta>[0]) {
    setSaving(true);
    try {
      const nova = await createConta(values);
      addToast("Conta cadastrada!", "success");
      setTimeout(() => router.push(`/contas/${nova.id}`), 800);
    } catch (err) {
      addToast(err instanceof Error ? err.message : "Erro ao salvar", "error");
      setSaving(false);
    }
  }

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <Header title="Nova Conta" color="#E53935" showBack />
      <PageContainer>
        <ContaForm imoveis={imoveis} onSubmit={handleSubmit} loading={saving} submitLabel="Cadastrar conta" />
      </PageContainer>
    </>
  );
}
