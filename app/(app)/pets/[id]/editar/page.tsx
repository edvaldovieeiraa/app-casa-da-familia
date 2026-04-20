"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { PageContainer } from "@/components/layout/PageContainer";
import { ToastContainer } from "@/components/ui/Toast";
import { Skeleton } from "@/components/ui/Skeleton";
import { PetForm } from "@/components/modules/pets/PetForm";
import { usePet, usePets } from "@/hooks/usePets";
import { useToast } from "@/hooks/useToast";

export default function EditarPetPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { pet, loading, error } = usePet(id);
  const { updatePet } = usePets();
  const { toasts, addToast, removeToast } = useToast();
  const [saving, setSaving] = useState(false);

  async function handleSubmit(values: Parameters<typeof updatePet>[1]) {
    setSaving(true);
    try {
      await updatePet(id, values);
      addToast("Pet atualizado!", "success");
      setTimeout(() => router.push(`/pets/${id}`), 800);
    } catch (err) {
      addToast(err instanceof Error ? err.message : "Erro ao salvar", "error");
      setSaving(false);
    }
  }

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <Header title="Editar Pet" color="#FF6F00" showBack />
      <PageContainer>
        {loading && <div className="flex flex-col gap-4 pt-2"><Skeleton variant="card" count={3} /></div>}
        {!loading && error && <p className="text-sm text-[#E53935] text-center py-8">{error}</p>}
        {!loading && !error && pet && (
          <PetForm initial={pet} onSubmit={handleSubmit} loading={saving} submitLabel="Salvar alterações" />
        )}
      </PageContainer>
    </>
  );
}
