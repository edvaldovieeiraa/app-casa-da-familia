"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { PageContainer } from "@/components/layout/PageContainer";
import { ToastContainer } from "@/components/ui/Toast";
import { DocumentoForm } from "@/components/modules/documentos/DocumentoForm";
import { useDocumentos } from "@/hooks/useDocumentos";
import { useToast } from "@/hooks/useToast";

export default function NovoDocumentoPage() {
  const router = useRouter();
  const { createDocumento } = useDocumentos();
  const { toasts, addToast, removeToast } = useToast();
  const [saving, setSaving] = useState(false);

  async function handleSubmit(values: Parameters<typeof createDocumento>[0]) {
    setSaving(true);
    try {
      const novo = await createDocumento(values);
      addToast("Documento cadastrado!", "success");
      setTimeout(() => router.push(`/documentos/${novo.id}`), 800);
    } catch (err) {
      addToast(err instanceof Error ? err.message : "Erro ao salvar", "error");
      setSaving(false);
    }
  }

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <Header title="Novo Documento" color="#F5C842" textColor="#333333" showBack />
      <PageContainer>
        <DocumentoForm onSubmit={handleSubmit} loading={saving} submitLabel="Cadastrar documento" />
      </PageContainer>
    </>
  );
}
