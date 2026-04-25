"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { PageContainer } from "@/components/layout/PageContainer";
import { ToastContainer } from "@/components/ui/Toast";
import { VeiculoForm } from "@/components/modules/veiculos/VeiculoForm";
import { useVeiculos } from "@/hooks/useVeiculos";
import { useToast } from "@/hooks/useToast";

export default function NovoVeiculoPage() {
  const router = useRouter();
  const { createVeiculo } = useVeiculos();
  const { toasts, addToast, removeToast } = useToast();
  const [saving, setSaving] = useState(false);

  async function handleSubmit(values: Parameters<typeof createVeiculo>[0]) {
    setSaving(true);
    try {
      const novo = await createVeiculo(values);
      addToast("Veículo cadastrado!", "success");
      setTimeout(() => router.push(`/veiculos/${novo.id}`), 800);
    } catch (err) {
      addToast(err instanceof Error ? err.message : "Erro ao salvar", "error");
      setSaving(false);
    }
  }

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <Header title="Novo Veículo" color="#F57C00" showBack />
      <PageContainer>
        <VeiculoForm onSubmit={handleSubmit} loading={saving} submitLabel="Cadastrar veículo" />
      </PageContainer>
    </>
  );
}
