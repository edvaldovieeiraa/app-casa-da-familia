"use client";

import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { PageContainer } from "@/components/layout/PageContainer";
import { ToastContainer } from "@/components/ui/Toast";
import { ImovelForm } from "@/components/modules/imoveis/ImovelForm";
import { useImoveis } from "@/hooks/useImoveis";
import { useToast } from "@/hooks/useToast";
import { useState } from "react";

const COLOR = "#E53935";

export default function NovoImovelPage() {
  const router = useRouter();
  const { createImovel } = useImoveis();
  const { toasts, addToast, removeToast } = useToast();
  const [saving, setSaving] = useState(false);

  type FormValues = Parameters<typeof createImovel>[0];

  async function handleSubmit(values: Omit<FormValues, "ativo">) {
    setSaving(true);
    try {
      const novo = await createImovel({ ...values, ativo: true });
      addToast("Imóvel cadastrado com sucesso!", "success");
      setTimeout(() => router.push(`/imoveis/${novo.id}`), 800);
    } catch (err) {
      addToast(
        err instanceof Error ? err.message : "Erro ao salvar imóvel",
        "error"
      );
      setSaving(false);
    }
  }

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <Header title="Novo Imóvel" color={COLOR} showBack />
      <PageContainer>
        <ImovelForm
          onSubmit={handleSubmit}
          loading={saving}
          submitLabel="Cadastrar imóvel"
        />
      </PageContainer>
    </>
  );
}
