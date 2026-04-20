"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { PageContainer } from "@/components/layout/PageContainer";
import { ToastContainer } from "@/components/ui/Toast";
import { ContatoForm } from "@/components/modules/contatos/ContatoForm";
import { useContatos } from "@/hooks/useContatos";
import { useImoveis } from "@/hooks/useImoveis";
import { useToast } from "@/hooks/useToast";

export default function NovoContatoPage() {
  const router = useRouter();
  const { createContato } = useContatos();
  const { imoveis } = useImoveis();
  const { toasts, addToast, removeToast } = useToast();
  const [saving, setSaving] = useState(false);

  async function handleSubmit(values: Parameters<typeof createContato>[0]) {
    setSaving(true);
    try {
      const novo = await createContato(values);
      addToast("Contato cadastrado!", "success");
      setTimeout(() => router.push(`/contatos/${novo.id}`), 800);
    } catch (err) {
      addToast(err instanceof Error ? err.message : "Erro ao salvar", "error");
      setSaving(false);
    }
  }

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <Header title="Novo Contato" color="#4CAF50" showBack />
      <PageContainer>
        <ContatoForm imoveis={imoveis} onSubmit={handleSubmit} loading={saving} submitLabel="Cadastrar contato" />
      </PageContainer>
    </>
  );
}
