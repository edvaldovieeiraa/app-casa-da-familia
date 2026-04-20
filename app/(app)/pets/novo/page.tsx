"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { PageContainer } from "@/components/layout/PageContainer";
import { ToastContainer } from "@/components/ui/Toast";
import { PetForm } from "@/components/modules/pets/PetForm";
import { usePets } from "@/hooks/usePets";
import { useToast } from "@/hooks/useToast";

export default function NovoPetPage() {
  const router = useRouter();
  const { createPet } = usePets();
  const { toasts, addToast, removeToast } = useToast();
  const [saving, setSaving] = useState(false);

  async function handleSubmit(values: Parameters<typeof createPet>[0]) {
    setSaving(true);
    try {
      const novo = await createPet(values);
      addToast("Pet cadastrado!", "success");
      setTimeout(() => router.push(`/pets/${novo.id}`), 800);
    } catch (err) {
      addToast(err instanceof Error ? err.message : "Erro ao salvar", "error");
      setSaving(false);
    }
  }

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <Header title="Novo Pet" color="#FF6F00" showBack />
      <PageContainer>
        <PetForm onSubmit={handleSubmit} loading={saving} submitLabel="Cadastrar pet" />
      </PageContainer>
    </>
  );
}
