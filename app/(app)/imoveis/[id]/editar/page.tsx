"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { PageContainer } from "@/components/layout/PageContainer";
import { ToastContainer } from "@/components/ui/Toast";
import { Skeleton } from "@/components/ui/Skeleton";
import { ImovelForm } from "@/components/modules/imoveis/ImovelForm";
import { useImovel, useImoveis } from "@/hooks/useImoveis";
import { useToast } from "@/hooks/useToast";
import { useState } from "react";

const COLOR = "#E53935";

export default function EditarImovelPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { imovel, loading, error } = useImovel(id);
  const { updateImovel } = useImoveis();
  const { toasts, addToast, removeToast } = useToast();
  const [saving, setSaving] = useState(false);

  async function handleSubmit(values: Parameters<typeof updateImovel>[1]) {
    setSaving(true);
    try {
      await updateImovel(id, values);
      addToast("Imóvel atualizado com sucesso!", "success");
      setTimeout(() => router.push(`/imoveis/${id}`), 800);
    } catch (err) {
      addToast(
        err instanceof Error ? err.message : "Erro ao salvar",
        "error"
      );
      setSaving(false);
    }
  }

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <Header title="Editar Imóvel" color={COLOR} showBack />
      <PageContainer>
        {loading && (
          <div className="flex flex-col gap-4 pt-2">
            <Skeleton variant="card" count={3} />
          </div>
        )}
        {!loading && error && (
          <p className="text-sm text-[#E53935] text-center py-8">{error}</p>
        )}
        {!loading && !error && imovel && (
          <ImovelForm
            initial={imovel}
            onSubmit={handleSubmit}
            loading={saving}
            submitLabel="Salvar alterações"
          />
        )}
      </PageContainer>
    </>
  );
}
