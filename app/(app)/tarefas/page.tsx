"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Plus, ClipboardList } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { PageContainer } from "@/components/layout/PageContainer";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { ToastContainer } from "@/components/ui/Toast";
import { TarefaCard } from "@/components/modules/tarefas/TarefaCard";
import { ConcluirModal } from "@/components/modules/tarefas/ConcluirModal";
import { useTarefas } from "@/hooks/useTarefas";
import { useMembros } from "@/hooks/useMembros";
import { useToast } from "@/hooks/useToast";
import type { Tarefa, TarefaStatus } from "@/types/database";

const COLOR = "#00897B";

const PRIO_ORDER: Record<string, number> = { urgente: 0, alta: 1, media: 2, baixa: 3 };

type Filtro = TarefaStatus | "todas";

const FILTROS: { value: Filtro; label: string }[] = [
  { value: "todas",        label: "Todas" },
  { value: "pendente",     label: "Pendentes" },
  { value: "em_andamento", label: "Em andamento" },
  { value: "concluida",    label: "Concluídas" },
  { value: "cancelada",    label: "Canceladas" },
];

export default function TarefasPage() {
  const router = useRouter();
  const { tarefas, loading, error, mudarStatus, refetch } = useTarefas();
  const { membros } = useMembros();
  const { toasts, addToast, removeToast } = useToast();
  const [filtro, setFiltro] = useState<Filtro>("todas");
  const [concluindoTarefa, setConcluindoTarefa] = useState<Tarefa | null>(null);

  const ativas = tarefas.filter((t) => t.status !== "cancelada" && t.status !== "concluida");

  const resumo = useMemo(() => ({
    pendentes: tarefas.filter((t) => t.status === "pendente").length,
    emAndamento: tarefas.filter((t) => t.status === "em_andamento").length,
    concluidasHoje: tarefas.filter((t) => {
      if (t.status !== "concluida" || !t.data_conclusao) return false;
      return t.data_conclusao === new Date().toISOString().split("T")[0];
    }).length,
    urgentes: ativas.filter((t) => t.prioridade === "urgente").length,
  }), [tarefas, ativas]);

  const filtradas = useMemo(() => {
    const base = filtro === "todas" ? tarefas : tarefas.filter((t) => t.status === filtro);
    return [...base].sort((a, b) => {
      const pa = PRIO_ORDER[a.prioridade] ?? 3;
      const pb = PRIO_ORDER[b.prioridade] ?? 3;
      if (pa !== pb) return pa - pb;
      if (a.data_prazo && b.data_prazo) return a.data_prazo.localeCompare(b.data_prazo);
      if (a.data_prazo) return -1;
      if (b.data_prazo) return 1;
      return 0;
    });
  }, [tarefas, filtro]);

  async function handleConcluir(comprovanteUrl: string | null) {
    if (!concluindoTarefa) return;
    try {
      await mudarStatus(concluindoTarefa.id, "concluida", comprovanteUrl);
      addToast("Tarefa concluída! 🎉", "success");
      setConcluindoTarefa(null);
      await refetch();
    } catch {
      addToast("Erro ao concluir tarefa", "error");
    }
  }

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <ConcluirModal
        open={!!concluindoTarefa}
        onClose={() => setConcluindoTarefa(null)}
        onConfirm={handleConcluir}
      />

      <Header title="Recados & Tarefas" color={COLOR}
        actions={
          <button onClick={() => router.push("/tarefas/novo")} aria-label="Nova tarefa"
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors text-white">
            <Plus size={22} />
          </button>
        }
      />

      <PageContainer>
        {/* Resumo */}
        {!loading && (
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[
              { label: "Pendentes",    value: resumo.pendentes,    color: "#9E9E9E" },
              { label: "Andamento",    value: resumo.emAndamento,  color: "#2196F3" },
              { label: "Hoje",         value: resumo.concluidasHoje, color: "#4CAF50" },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-white rounded-[12px] border border-[#E0E0E0] p-3 text-center">
                <p className="text-xl font-800" style={{ color }}>{value}</p>
                <p className="text-[11px] text-[#666666] font-600">{label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Alerta urgentes */}
        {resumo.urgentes > 0 && (
          <div className="mb-3 rounded-[12px] bg-[#FEF2F2] border border-[#E5393520] p-3 flex items-center gap-2">
            <span className="text-[#E53935] font-700 text-sm">🚨 {resumo.urgentes} tarefa{resumo.urgentes > 1 ? "s" : ""} urgente{resumo.urgentes > 1 ? "s" : ""}</span>
          </div>
        )}

        {/* Filtros */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1 scrollbar-none">
          {FILTROS.map((f) => (
            <button key={f.value} onClick={() => setFiltro(f.value)}
              className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-700 transition-colors min-h-[32px]"
              style={{
                backgroundColor: filtro === f.value ? COLOR : "#F0F0F0",
                color: filtro === f.value ? "#fff" : "#666666",
              }}>
              {f.label}
            </button>
          ))}
        </div>

        {loading && <div className="flex flex-col gap-3"><Skeleton variant="card" count={4} /></div>}
        {!loading && error && <p className="text-sm text-[#E53935] text-center py-8">{error}</p>}

        {!loading && !error && tarefas.length === 0 && (
          <EmptyState icon={ClipboardList} title="Nenhuma tarefa por aqui! 🎉"
            description="Tudo em dia! Adicione uma nova tarefa ou recado para a família."
            actionLabel="Nova tarefa" onAction={() => router.push("/tarefas/novo")} color={COLOR} />
        )}

        {!loading && !error && tarefas.length > 0 && filtradas.length === 0 && (
          <p className="text-center text-[#666666] py-10">Nenhuma tarefa com este filtro</p>
        )}

        {!loading && !error && filtradas.length > 0 && (
          <div className="flex flex-col gap-3">
            {filtradas.map((t, i) => (
              <TarefaCard key={t.id} tarefa={t} index={i} membros={membros}
                onConcluirRapido={(tarefa) => setConcluindoTarefa(tarefa)} />
            ))}
          </div>
        )}
      </PageContainer>

      <motion.button whileTap={{ scale: 0.9 }} onClick={() => router.push("/tarefas/novo")}
        aria-label="Nova tarefa"
        className="fixed bottom-20 right-5 w-14 h-14 rounded-full flex items-center justify-center shadow-lg z-30"
        style={{ backgroundColor: COLOR }}>
        <Plus size={28} className="text-white" />
      </motion.button>
    </>
  );
}
