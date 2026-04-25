"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { PageContainer } from "@/components/layout/PageContainer";
import { ToastContainer } from "@/components/ui/Toast";
import { Skeleton } from "@/components/ui/Skeleton";
import { VeiculoForm } from "@/components/modules/veiculos/VeiculoForm";
import { useVeiculo, useVeiculos } from "@/hooks/useVeiculos";
import { useToast } from "@/hooks/useToast";

export default function EditarVeiculoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { veiculo, loading, error } = useVeiculo(id);
  const { updateVeiculo } = useVeiculos();
  const { toasts, addToast, removeToast } = useToast();
  const [saving, setSaving] = useState(false);

  async function handleSubmit(values: Parameters<typeof updateVeiculo>[1]) {
    setSaving(true);
    try {
      await updateVeiculo(id, values);
      addToast("Veículo atualizado!", "success");
      setTimeout(() => router.push(`/veiculos/${id}`), 800);
    } catch (err) {
      addToast(err instanceof Error ? err.message : "Erro ao salvar", "error");
      setSaving(false);
    }
  }

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <Header title="Editar Veículo" color="#F57C00" showBack />
      <PageContainer>
        {loading && <Skeleton variant="card" count={4} />}
        {!loading && error && <p className="text-sm text-[#E53935] text-center py-8">{error}</p>}
        {!loading && !error && veiculo && (
          <VeiculoForm initial={veiculo} onSubmit={handleSubmit} loading={saving} submitLabel="Salvar alterações" />
        )}
      </PageContainer>
    </>
  );
}
