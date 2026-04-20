"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { PageContainer } from "@/components/layout/PageContainer";
import { ToastContainer } from "@/components/ui/Toast";
import { Skeleton } from "@/components/ui/Skeleton";
import { DocumentoForm } from "@/components/modules/documentos/DocumentoForm";
import { useDocumento, useDocumentos } from "@/hooks/useDocumentos";
import { useToast } from "@/hooks/useToast";

export default function EditarDocumentoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { documento, loading, error } = useDocumento(id);
  const { updateDocumento } = useDocumentos();
  const { toasts, addToast, removeToast } = useToast();
  const [saving, setSaving] = useState(false);

  async function handleSubmit(values: Parameters<typeof updateDocumento>[1]) {
    setSaving(true);
    try {
      await updateDocumento(id, values);
      addToast("Documento atualizado!", "success");
      setTimeout(() => router.push(`/documentos/${id}`), 800);
    } catch (err) {
      addToast(err instanceof Error ? err.message : "Erro ao salvar", "error");
      setSaving(false);
    }
  }

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <Header title="Editar Documento" color="#F5C842" textColor="#333333" showBack />
      <PageContainer>
        {loading && <div className="flex flex-col gap-4 pt-2"><Skeleton variant="card" count={3} /></div>}
        {!loading && error && <p className="text-sm text-[#E53935] text-center py-8">{error}</p>}
        {!loading && !error && documento && (
          <DocumentoForm initial={documento} onSubmit={handleSubmit} loading={saving} submitLabel="Salvar alterações" />
        )}
      </PageContainer>
    </>
  );
}
