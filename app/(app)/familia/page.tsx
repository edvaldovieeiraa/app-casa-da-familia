"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Users2 } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ToastContainer } from "@/components/ui/Toast";
import { MembroCard } from "@/components/modules/familia/MembroCard";
import { useMembros } from "@/hooks/useMembros";
import { useToast } from "@/hooks/useToast";

const COLOR = "#9C27B0";

export default function FamiliaPage() {
  const router = useRouter();
  const { membros, loading, error } = useMembros();
  const { toasts, removeToast } = useToast();
  const [search, setSearch] = useState("");

  const filtered = membros.filter((m) => {
    const q = search.toLowerCase();
    return (
      m.nome.toLowerCase().includes(q) ||
      (m.apelido ?? "").toLowerCase().includes(q) ||
      (m.parentesco ?? "").toLowerCase().includes(q)
    );
  });

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <Header title="Família" color={COLOR}
        actions={
          <button onClick={() => router.push("/familia/novo")} aria-label="Adicionar membro"
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors text-white">
            <Plus size={22} />
          </button>
        }
      />

      <PageContainer>
        {/* Busca */}
        <div className="mb-4">
          <input
            type="search"
            placeholder="Buscar membro..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full min-h-[48px] rounded-[10px] border border-[#E0E0E0] px-4 text-base text-[#333333] bg-white outline-none focus:border-[#9C27B0] placeholder:text-[#999999] font-[inherit]"
          />
        </div>

        {loading && <div className="flex flex-col gap-3"><Skeleton variant="text" count={5} /></div>}
        {!loading && error && <p className="text-sm text-[#E53935] text-center py-8">{error}</p>}
        {!loading && !error && filtered.length === 0 && (
          <EmptyState
            icon={Users2}
            title="Nenhum membro"
            description="Cadastre os membros da sua família para organizar documentos e informações."
            actionLabel="Adicionar membro"
            onAction={() => router.push("/familia/novo")}
            color={COLOR}
          />
        )}
        {!loading && !error && filtered.length > 0 && (
          <div className="flex flex-col gap-3">
            {filtered.map((m, i) => (
              <MembroCard key={m.id} membro={m} index={i} />
            ))}
          </div>
        )}

        {!loading && membros.length > 0 && (
          <div className="mt-4">
            <Button fullWidth icon={Plus} onClick={() => router.push("/familia/novo")}
              style={{ backgroundColor: COLOR }}>
              Adicionar membro
            </Button>
          </div>
        )}
      </PageContainer>
    </>
  );
}
