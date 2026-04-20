"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { PageContainer } from "@/components/layout/PageContainer";
import { ToastContainer } from "@/components/ui/Toast";
import { Skeleton } from "@/components/ui/Skeleton";
import { MembroForm } from "@/components/modules/familia/MembroForm";
import { useMembro, useMembros } from "@/hooks/useMembros";
import { useToast } from "@/hooks/useToast";

export default function EditarMembroPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { membro, loading, error } = useMembro(id);
  const { updateMembro } = useMembros();
  const { toasts, addToast, removeToast } = useToast();
  const [saving, setSaving] = useState(false);

  async function handleSubmit(values: Parameters<typeof updateMembro>[1]) {
    setSaving(true);
    try {
      await updateMembro(id, values);
      addToast("Membro atualizado!", "success");
      setTimeout(() => router.push(`/familia/${id}`), 800);
    } catch (err) {
      addToast(err instanceof Error ? err.message : "Erro ao salvar", "error");
      setSaving(false);
    }
  }

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <Header title="Editar Membro" color="#9C27B0" showBack />
      <PageContainer>
        {loading && <div className="flex flex-col gap-4 pt-2"><Skeleton variant="card" count={3} /></div>}
        {!loading && error && <p className="text-sm text-[#E53935] text-center py-8">{error}</p>}
        {!loading && !error && membro && (
          <MembroForm initial={membro} onSubmit={handleSubmit} loading={saving} submitLabel="Salvar alterações" />
        )}
      </PageContainer>
    </>
  );
}
