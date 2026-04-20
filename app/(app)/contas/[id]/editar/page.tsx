"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { PageContainer } from "@/components/layout/PageContainer";
import { ToastContainer } from "@/components/ui/Toast";
import { Skeleton } from "@/components/ui/Skeleton";
import { ContaForm } from "@/components/modules/contas/ContaForm";
import { useConta, useContas } from "@/hooks/useContas";
import { useImoveis } from "@/hooks/useImoveis";
import { useToast } from "@/hooks/useToast";

export default function EditarContaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { conta, loading, error } = useConta(id);
  const { updateConta } = useContas();
  const { imoveis } = useImoveis();
  const { toasts, addToast, removeToast } = useToast();
  const [saving, setSaving] = useState(false);

  async function handleSubmit(values: Parameters<typeof updateConta>[1]) {
    setSaving(true);
    try {
      await updateConta(id, values);
      addToast("Conta atualizada!", "success");
      setTimeout(() => router.push(`/contas/${id}`), 800);
    } catch (err) {
      addToast(err instanceof Error ? err.message : "Erro ao salvar", "error");
      setSaving(false);
    }
  }

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <Header title="Editar Conta" color="#E53935" showBack />
      <PageContainer>
        {loading && <div className="flex flex-col gap-4 pt-2"><Skeleton variant="card" count={3} /></div>}
        {!loading && error && <p className="text-sm text-[#E53935] text-center py-8">{error}</p>}
        {!loading && !error && conta && (
          <ContaForm initial={conta} imoveis={imoveis} onSubmit={handleSubmit}
            loading={saving} submitLabel="Salvar alterações" />
        )}
      </PageContainer>
    </>
  );
}
