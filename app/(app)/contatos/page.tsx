"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Plus, Search, Users } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { PageContainer } from "@/components/layout/PageContainer";
import { Input } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { ToastContainer } from "@/components/ui/Toast";
import { ContatoCard } from "@/components/modules/contatos/ContatoCard";
import { useContatos } from "@/hooks/useContatos";
import { useToast } from "@/hooks/useToast";

const COLOR = "#4CAF50";
const CATEGORIAS = ["todas","medico","advogado","prestador","vizinho","familiar","amigo","comercio","outro"];
const CAT_LABEL: Record<string, string> = {
  todas:"Todas", medico:"Médico", advogado:"Advogado", prestador:"Prestador",
  vizinho:"Vizinho", familiar:"Familiar", amigo:"Amigo", comercio:"Comércio", outro:"Outro",
};

export default function ContatosPage() {
  const router = useRouter();
  const { contatos, loading, error } = useContatos();
  const { toasts, removeToast } = useToast();
  const [busca, setBusca] = useState("");
  const [categoria, setCategoria] = useState("todas");

  const filtrados = useMemo(() => {
    let list = contatos;
    if (categoria !== "todas") list = list.filter((c) => c.categoria === categoria);
    const q = busca.toLowerCase().trim();
    if (q) list = list.filter((c) =>
      c.nome.toLowerCase().includes(q) ||
      (c.empresa ?? "").toLowerCase().includes(q) ||
      (c.telefone_principal ?? "").includes(q)
    );
    return list;
  }, [contatos, busca, categoria]);

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <Header title="Contatos" color={COLOR} showBack />

      <div className="px-4 pt-3 pb-1 max-w-[480px] mx-auto flex flex-col gap-2">
        <Input placeholder="Buscar contato..." variant="search" leftIcon={Search}
          value={busca} onChange={(e) => setBusca(e.target.value)} />
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIAS.map((cat) => (
            <button key={cat} onClick={() => setCategoria(cat)}
              className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-700 transition-colors min-h-[32px]"
              style={{
                backgroundColor: categoria === cat ? COLOR : "#F0F0F0",
                color: categoria === cat ? "#fff" : "#666666",
              }}>
              {CAT_LABEL[cat]}
            </button>
          ))}
        </div>
      </div>

      <PageContainer className="pt-2">
        {loading && <div className="flex flex-col gap-4"><Skeleton variant="card" count={4} /></div>}
        {!loading && error && <p className="text-sm text-[#E53935] text-center py-8">{error}</p>}
        {!loading && !error && contatos.length === 0 && (
          <EmptyState icon={Users} title="Nenhum contato ainda"
            description="Guarde os contatos importantes da família em um só lugar."
            actionLabel="Adicionar contato" onAction={() => router.push("/contatos/novo")} color={COLOR} />
        )}
        {!loading && !error && filtrados.length === 0 && contatos.length > 0 && (
          <p className="text-center text-[#666666] py-10">Nenhum contato encontrado</p>
        )}
        {!loading && !error && filtrados.length > 0 && (
          <div className="flex flex-col gap-3">
            {filtrados.map((c, i) => <ContatoCard key={c.id} contato={c} index={i} />)}
          </div>
        )}
      </PageContainer>

      <motion.button whileTap={{ scale: 0.9 }} onClick={() => router.push("/contatos/novo")}
        aria-label="Adicionar contato"
        className="fixed bottom-20 right-5 w-14 h-14 rounded-full flex items-center justify-center shadow-lg z-30"
        style={{ backgroundColor: COLOR }}>
        <Plus size={28} className="text-white" />
      </motion.button>
    </>
  );
}
