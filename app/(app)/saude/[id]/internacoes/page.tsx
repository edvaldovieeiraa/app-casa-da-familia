"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Hospital } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ToastContainer } from "@/components/ui/Toast";
import { usePaciente, useInternacoes } from "@/hooks/useSaude";
import { useToast } from "@/hooks/useToast";
import type { SaudeInternacao } from "@/types/database";

const COLOR = "#E53935";

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso.includes("T") ? iso : iso + "T12:00:00").toLocaleDateString("pt-BR");
}

function InternacaoCard({ internacao, onAlta }: { internacao: SaudeInternacao; onAlta: () => void }) {
  const emCurso = !internacao.data_alta;
  const dias = internacao.data_alta
    ? Math.ceil(
        (new Date(internacao.data_alta).getTime() - new Date(internacao.data_entrada).getTime()) / 86400000
      )
    : Math.ceil((Date.now() - new Date(internacao.data_entrada).getTime()) / 86400000);

  return (
    <div
      className="bg-white rounded-[16px] border p-4"
      style={{ borderColor: emCurso ? "#FFCDD2" : "#E0E0E0" }}
    >
      {emCurso && (
        <div className="flex items-center gap-1.5 mb-2">
          <div className="w-2 h-2 rounded-full bg-[#E53935] animate-pulse" />
          <span className="text-xs font-bold text-[#E53935]">Em internação</span>
        </div>
      )}
      <p className="font-bold text-[#333]">{internacao.hospital ?? "Hospital não informado"}</p>
      {internacao.diagnostico && <p className="text-xs text-[#666] mt-0.5">{internacao.diagnostico}</p>}
      {internacao.medico_responsavel && <p className="text-xs text-[#999] mt-0.5">Dr(a). {internacao.medico_responsavel}</p>}

      <div className="flex items-center gap-3 mt-2 flex-wrap">
        <span className="text-xs text-[#555]">Entrada: <strong>{formatDate(internacao.data_entrada)}</strong></span>
        {internacao.data_alta
          ? <span className="text-xs text-[#555]">Alta: <strong>{formatDate(internacao.data_alta)}</strong></span>
          : null
        }
        <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
          style={{ backgroundColor: emCurso ? "#FFEBEE" : "#F5F5F5", color: emCurso ? "#E53935" : "#666" }}>
          {dias} dia{dias !== 1 ? "s" : ""}
        </span>
      </div>

      {internacao.procedimentos && internacao.procedimentos.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {internacao.procedimentos.map((p) => (
            <span key={p} className="text-[10px] px-2 py-0.5 rounded-full bg-[#FFF3E0] text-[#E65100] font-semibold">
              {p}
            </span>
          ))}
        </div>
      )}

      {emCurso && (
        <Button
          size="sm"
          onClick={onAlta}
          style={{ backgroundColor: "#4CAF50", marginTop: 12 }}
        >
          Registrar alta
        </Button>
      )}
    </div>
  );
}

export default function InternacoesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { toasts, addToast, removeToast } = useToast();
  const { paciente } = usePaciente(id);
  const { internacoes, emCurso, loading, updateInternacao } = useInternacoes(id);

  async function handleAlta(internacaoId: string) {
    const hoje = new Date().toISOString().split("T")[0];
    try {
      await updateInternacao(internacaoId, { data_alta: hoje });
      addToast("Alta registrada!", "success");
    } catch {
      addToast("Erro ao registrar alta", "error");
    }
  }

  const nome = paciente?.apelido ?? paciente?.nome ?? "Paciente";

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <Header
        title={`Internações · ${nome}`}
        color={COLOR}
        showBack
        actions={
          <button
            onClick={() => router.push(`/saude/${id}/internacoes/nova`)}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors text-white"
          >
            <Plus size={22} />
          </button>
        }
      />

      <PageContainer>
        {loading && <div className="flex flex-col gap-3"><Skeleton variant="text" count={3} /></div>}

        {!loading && internacoes.length === 0 && (
          <EmptyState
            icon={Hospital}
            title="Nenhuma internação"
            description="Registre internações hospitalares para manter o histórico médico completo."
            actionLabel="Registrar internação"
            onAction={() => router.push(`/saude/${id}/internacoes/nova`)}
            color={COLOR}
          />
        )}

        {!loading && internacoes.length > 0 && (
          <div className="flex flex-col gap-3">
            {internacoes.map((i) => (
              <InternacaoCard key={i.id} internacao={i} onAlta={() => handleAlta(i.id)} />
            ))}
            <Button
              fullWidth
              icon={Plus}
              onClick={() => router.push(`/saude/${id}/internacoes/nova`)}
              style={{ backgroundColor: COLOR }}
            >
              Registrar internação
            </Button>
          </div>
        )}
      </PageContainer>
    </>
  );
}
