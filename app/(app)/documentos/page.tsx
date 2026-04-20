"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Plus, FileText } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { PageContainer } from "@/components/layout/PageContainer";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { ToastContainer } from "@/components/ui/Toast";
import { DocumentoCard } from "@/components/modules/documentos/DocumentoCard";
import { useDocumentos } from "@/hooks/useDocumentos";
import { useMembros } from "@/hooks/useMembros";
import { useToast } from "@/hooks/useToast";

const COLOR = "#F5C842";

export default function DocumentosPage() {
  const router = useRouter();
  const { documentos, loading, error } = useDocumentos();
  const { membros } = useMembros();
  const { toasts, removeToast } = useToast();

  const membroMap = useMemo(() =>
    Object.fromEntries(membros.map((m) => [m.id, m])), [membros]);

  const agrupados = useMemo(() => {
    const map: Record<string, typeof documentos> = { sem_membro: [] };
    documentos.forEach((d) => {
      const key = d.membro_id ?? "sem_membro";
      if (!map[key]) map[key] = [];
      map[key].push(d);
    });
    return map;
  }, [documentos]);

  const grupos = useMemo(() => {
    return Object.entries(agrupados).map(([key, docs]) => ({
      key,
      label: key === "sem_membro" ? "Geral" : (membroMap[key]?.nome ?? "Desconhecido"),
      docs,
    })).filter((g) => g.docs.length > 0);
  }, [agrupados, membroMap]);

  let counter = 0;

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <Header title="Documentos" color={COLOR} textColor="#333333" showBack />

      <PageContainer>
        {loading && <div className="flex flex-col gap-4"><Skeleton variant="card" count={4} /></div>}
        {!loading && error && <p className="text-sm text-[#E53935] text-center py-8">{error}</p>}
        {!loading && !error && documentos.length === 0 && (
          <EmptyState icon={FileText} title="Nenhum documento ainda"
            description="Guarde os documentos da família de forma organizada."
            actionLabel="Adicionar documento" onAction={() => router.push("/documentos/novo")} color="#F5A500" />
        )}
        {!loading && !error && grupos.map((grupo) => (
          <div key={grupo.key} className="mb-6">
            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm font-700 text-[#666666] uppercase tracking-wide mb-3 px-1">
              {grupo.label}
            </motion.h2>
            <div className="flex flex-col gap-3">
              {grupo.docs.map((doc) => {
                const idx = counter++;
                return (
                  <DocumentoCard key={doc.id} documento={doc}
                    membro={doc.membro_id ? membroMap[doc.membro_id] : undefined}
                    index={idx} />
                );
              })}
            </div>
          </div>
        ))}
      </PageContainer>

      <motion.button whileTap={{ scale: 0.9 }} onClick={() => router.push("/documentos/novo")}
        aria-label="Adicionar documento"
        className="fixed bottom-20 right-5 w-14 h-14 rounded-full flex items-center justify-center shadow-lg z-30"
        style={{ backgroundColor: "#F5A500" }}>
        <Plus size={28} className="text-white" />
      </motion.button>
    </>
  );
}
