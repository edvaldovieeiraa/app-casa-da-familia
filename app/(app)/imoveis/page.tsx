"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Plus, Search, Building2 } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { PageContainer } from "@/components/layout/PageContainer";
import { Input } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { ToastContainer } from "@/components/ui/Toast";
import { ImovelCard } from "@/components/modules/imoveis/ImovelCard";
import { useImoveis } from "@/hooks/useImoveis";
import { useToast } from "@/hooks/useToast";

const COLOR = "#E53935";

export default function ImoveisPage() {
  const router = useRouter();
  const { imoveis, loading, error, toggleFavorito } = useImoveis();
  const [busca, setBusca] = useState("");
  const { toasts, addToast, removeToast } = useToast();

  const filtrados = useMemo(() => {
    const q = busca.toLowerCase().trim();
    if (!q) return imoveis;
    return imoveis.filter(
      (im) =>
        im.nome.toLowerCase().includes(q) ||
        (im.apelido ?? "").toLowerCase().includes(q) ||
        (im.logradouro ?? "").toLowerCase().includes(q) ||
        (im.bairro ?? "").toLowerCase().includes(q)
    );
  }, [imoveis, busca]);

  async function handleToggleFavorito(id: string, favorito: boolean) {
    try {
      await toggleFavorito(id, favorito);
    } catch {
      addToast("Não foi possível atualizar o favorito", "error");
    }
  }

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <Header title="Imóveis" color={COLOR} showBack />

      {/* Busca */}
      <div className="px-4 py-3 max-w-[480px] mx-auto">
        <Input
          placeholder="Buscar imóvel..."
          variant="search"
          leftIcon={Search}
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>

      <PageContainer className="pt-1">
        {loading && (
          <div className="flex flex-col gap-4">
            <Skeleton variant="card" count={4} />
          </div>
        )}

        {!loading && error && (
          <p className="text-sm text-[#E53935] text-center py-8">{error}</p>
        )}

        {!loading && !error && filtrados.length === 0 && busca && (
          <p className="text-center text-[#666666] py-10">
            Nenhum imóvel encontrado para &quot;{busca}&quot;
          </p>
        )}

        {!loading && !error && imoveis.length === 0 && (
          <EmptyState
            icon={Building2}
            title="Nenhum imóvel ainda"
            description="Cadastre seu primeiro imóvel para guardar todas as informações em um só lugar."
            actionLabel="Adicionar imóvel"
            onAction={() => router.push("/imoveis/novo")}
            color={COLOR}
          />
        )}

        {!loading && !error && filtrados.length > 0 && (
          <div className="flex flex-col gap-4">
            {filtrados.map((imovel, i) => (
              <div key={imovel.id} className="relative">
                <ImovelCard
                  imovel={imovel}
                  index={i}
                  onToggleFavorito={handleToggleFavorito}
                />
              </div>
            ))}
          </div>
        )}
      </PageContainer>

      {/* FAB */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => router.push("/imoveis/novo")}
        aria-label="Adicionar imóvel"
        className="fixed bottom-20 right-5 w-14 h-14 rounded-full flex items-center justify-center shadow-lg z-30"
        style={{ backgroundColor: COLOR }}
      >
        <Plus size={28} className="text-white" />
      </motion.button>
    </>
  );
}
