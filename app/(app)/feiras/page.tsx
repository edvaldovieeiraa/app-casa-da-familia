"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Plus, ShoppingCart } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { PageContainer } from "@/components/layout/PageContainer";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { ToastContainer } from "@/components/ui/Toast";
import { FeiraCard } from "@/components/modules/feiras/FeiraCard";
import { WeekCalendar } from "@/components/modules/feiras/WeekCalendar";
import { useFeiras } from "@/hooks/useFeiras";
import { useToast } from "@/hooks/useToast";
import type { DiaSemana } from "@/types/database";

const COLOR = "#2196F3";

export default function FeirasPage() {
  const router = useRouter();
  const { feiras, loading, error } = useFeiras();
  const { toasts, removeToast } = useToast();
  const [diaSelecionado, setDiaSelecionado] = useState<DiaSemana | null>(null);

  const diasComFeira = useMemo(() =>
    feiras.map((f) => f.dia_semana).filter((d): d is DiaSemana => d != null),
    [feiras]);

  const feirasFiltradas = useMemo(() => {
    if (diaSelecionado == null) return feiras;
    return feiras.filter((f) => f.dia_semana === diaSelecionado);
  }, [feiras, diaSelecionado]);

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <Header title="Feiras" color={COLOR} showBack />

      <PageContainer>
        <div className="mb-5">
          <WeekCalendar diasComFeira={diasComFeira} selected={diaSelecionado} onSelect={setDiaSelecionado} />
        </div>

        {loading && <div className="flex flex-col gap-4"><Skeleton variant="card" count={3} /></div>}
        {!loading && error && <p className="text-sm text-[#E53935] text-center py-8">{error}</p>}
        {!loading && !error && feiras.length === 0 && (
          <EmptyState icon={ShoppingCart} title="Nenhuma feira cadastrada"
            description="Cadastre as feiras e mercados que a família frequenta."
            actionLabel="Adicionar feira" onAction={() => router.push("/feiras/novo")} color={COLOR} />
        )}
        {!loading && !error && feirasFiltradas.length === 0 && feiras.length > 0 && (
          <p className="text-center text-[#666666] py-10">Nenhuma feira neste dia</p>
        )}
        {!loading && !error && feirasFiltradas.length > 0 && (
          <div className="flex flex-col gap-3">
            {feirasFiltradas.map((f, i) => <FeiraCard key={f.id} feira={f} index={i} />)}
          </div>
        )}
      </PageContainer>

      <motion.button whileTap={{ scale: 0.9 }} onClick={() => router.push("/feiras/novo")}
        aria-label="Adicionar feira"
        className="fixed bottom-20 right-5 w-14 h-14 rounded-full flex items-center justify-center shadow-lg z-30"
        style={{ backgroundColor: COLOR }}>
        <Plus size={28} className="text-white" />
      </motion.button>
    </>
  );
}
