"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { PageContainer } from "@/components/layout/PageContainer";
import { ToastContainer } from "@/components/ui/Toast";
import { Skeleton } from "@/components/ui/Skeleton";
import { ContatoForm } from "@/components/modules/contatos/ContatoForm";
import { useContato, useContatos } from "@/hooks/useContatos";
import { useImoveis } from "@/hooks/useImoveis";
import { useToast } from "@/hooks/useToast";

export default function EditarContatoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { contato, loading, error } = useContato(id);
  const { updateContato } = useContatos();
  const { imoveis } = useImoveis();
  const { toasts, addToast, removeToast } = useToast();
  const [saving, setSaving] = useState(false);

  async function handleSubmit(values: Parameters<typeof updateContato>[1]) {
    setSaving(true);
    try {
      await updateContato(id, values);
      addToast("Contato atualizado!", "success");
      setTimeout(() => router.push(`/contatos/${id}`), 800);
    } catch (err) {
      addToast(err instanceof Error ? err.message : "Erro ao salvar", "error");
      setSaving(false);
    }
  }

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <Header title="Editar Contato" color="#4CAF50" showBack />
      <PageContainer>
        {loading && <div className="flex flex-col gap-4 pt-2"><Skeleton variant="card" count={3} /></div>}
        {!loading && error && <p className="text-sm text-[#E53935] text-center py-8">{error}</p>}
        {!loading && !error && contato && (
          <ContatoForm initial={contato} imoveis={imoveis} onSubmit={handleSubmit}
            loading={saving} submitLabel="Salvar alterações" />
        )}
      </PageContainer>
    </>
  );
}
