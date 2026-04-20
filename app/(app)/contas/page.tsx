"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Plus, Wallet, ChevronRight } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { PageContainer } from "@/components/layout/PageContainer";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { ToastContainer } from "@/components/ui/Toast";
import { ContaCard } from "@/components/modules/contas/ContaCard";
import { useContas } from "@/hooks/useContas";
import { useToast } from "@/hooks/useToast";
import type { ContaStatus } from "@/types/database";

const GRADIENT = "linear-gradient(135deg,#E53935,#F5C842)";

function mesAtual() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function formatMoney(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const STATUS_FILTROS: { value: ContaStatus | "todas"; label: string }[] = [
  { value: "todas", label: "Todas" },
  { value: "pendente", label: "Pendente" },
  { value: "pago", label: "Pago" },
  { value: "vencido", label: "Vencido" },
];

export default function ContasPage() {
  const router = useRouter();
  const [mes, setMes] = useState(mesAtual);
  const [statusFiltro, setStatusFiltro] = useState<ContaStatus | "todas">("todas");
  const { contas, loading, error } = useContas(mes);
  const { toasts, removeToast } = useToast();

  const filtradas = useMemo(() =>
    statusFiltro === "todas" ? contas : contas.filter((c) => c.status === statusFiltro),
    [contas, statusFiltro]);

  const resumo = useMemo(() => ({
    total: contas.reduce((s, c) => s + (c.valor ?? 0), 0),
    pago: contas.filter((c) => c.status === "pago").reduce((s, c) => s + (c.valor_pago ?? c.valor ?? 0), 0),
    pendente: contas.filter((c) => c.status !== "pago").reduce((s, c) => s + (c.valor ?? 0), 0),
  }), [contas]);

  function navMes(delta: number) {
    const [y, m] = mes.split("-").map(Number);
    const d = new Date(y, m - 1 + delta);
    setMes(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }

  const [mesNum, anoNum] = mes.split("-").map(Number);
  const mesLabel = new Date(anoNum, mesNum - 1).toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <Header title="Contas" color="#E53935" showBack />

      <PageContainer>
        {/* Navegação de mês */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navMes(-1)} aria-label="Mês anterior"
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#F0F0F0]">
            <ChevronRight size={20} className="text-[#666666] rotate-180" />
          </button>
          <p className="font-700 text-[#333333] capitalize">{mesLabel}</p>
          <button onClick={() => navMes(1)} aria-label="Próximo mês"
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#F0F0F0]">
            <ChevronRight size={20} className="text-[#666666]" />
          </button>
        </div>

        {/* Resumo */}
        <div className="rounded-[16px] p-4 mb-4 text-white" style={{ background: GRADIENT }}>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-[10px] font-600 text-white/70 uppercase">Total</p>
              <p className="font-800 text-sm mt-0.5">{formatMoney(resumo.total)}</p>
            </div>
            <div>
              <p className="text-[10px] font-600 text-white/70 uppercase">Pago</p>
              <p className="font-800 text-sm mt-0.5">{formatMoney(resumo.pago)}</p>
            </div>
            <div>
              <p className="text-[10px] font-600 text-white/70 uppercase">Pendente</p>
              <p className="font-800 text-sm mt-0.5">{formatMoney(resumo.pendente)}</p>
            </div>
          </div>
        </div>

        {/* Filtros de status */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1 scrollbar-none">
          {STATUS_FILTROS.map((f) => (
            <button key={f.value} onClick={() => setStatusFiltro(f.value)}
              className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-700 transition-colors min-h-[32px]"
              style={{
                backgroundColor: statusFiltro === f.value ? "#E53935" : "#F0F0F0",
                color: statusFiltro === f.value ? "#fff" : "#666666",
              }}>
              {f.label}
            </button>
          ))}
        </div>

        {loading && <div className="flex flex-col gap-4"><Skeleton variant="card" count={4} /></div>}
        {!loading && error && <p className="text-sm text-[#E53935] text-center py-8">{error}</p>}
        {!loading && !error && contas.length === 0 && (
          <EmptyState icon={Wallet} title="Nenhuma conta neste mês"
            description="Cadastre as contas do mês para acompanhar os vencimentos."
            actionLabel="Adicionar conta" onAction={() => router.push("/contas/novo")} color="#E53935" />
        )}
        {!loading && !error && filtradas.length === 0 && contas.length > 0 && (
          <p className="text-center text-[#666666] py-10">Nenhuma conta com este filtro</p>
        )}
        {!loading && !error && filtradas.length > 0 && (
          <div className="flex flex-col gap-3">
            {filtradas.map((c, i) => <ContaCard key={c.id} conta={c} index={i} />)}
          </div>
        )}
      </PageContainer>

      <motion.button whileTap={{ scale: 0.9 }} onClick={() => router.push("/contas/novo")}
        aria-label="Adicionar conta"
        className="fixed bottom-20 right-5 w-14 h-14 rounded-full flex items-center justify-center shadow-lg z-30"
        style={{ background: GRADIENT }}>
        <Plus size={28} className="text-white" />
      </motion.button>
    </>
  );
}
