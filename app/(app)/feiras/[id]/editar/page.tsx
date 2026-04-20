"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { PageContainer } from "@/components/layout/PageContainer";
import { ToastContainer } from "@/components/ui/Toast";
import { Skeleton } from "@/components/ui/Skeleton";
import { FeiraForm } from "@/components/modules/feiras/FeiraForm";
import { useFeira, useFeiras } from "@/hooks/useFeiras";
import { useToast } from "@/hooks/useToast";

export default function EditarFeiraPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { feira, loading, error } = useFeira(id);
  const { updateFeira } = useFeiras();
  const { toasts, addToast, removeToast } = useToast();
  const [saving, setSaving] = useState(false);

  async function handleSubmit(values: Parameters<typeof updateFeira>[1]) {
    setSaving(true);
    try {
      await updateFeira(id, values);
      addToast("Feira atualizada!", "success");
      setTimeout(() => router.push(`/feiras/${id}`), 800);
    } catch (err) {
      addToast(err instanceof Error ? err.message : "Erro ao salvar", "error");
      setSaving(false);
    }
  }

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <Header title="Editar Feira" color="#2196F3" showBack />
      <PageContainer>
        {loading && <div className="flex flex-col gap-4 pt-2"><Skeleton variant="card" count={3} /></div>}
        {!loading && error && <p className="text-sm text-[#E53935] text-center py-8">{error}</p>}
        {!loading && !error && feira && (
          <FeiraForm initial={feira} onSubmit={handleSubmit} loading={saving} submitLabel="Salvar alterações" />
        )}
      </PageContainer>
    </>
  );
}
