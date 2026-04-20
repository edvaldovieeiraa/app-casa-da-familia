"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Edit, Trash2, CheckCircle } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Skeleton } from "@/components/ui/Skeleton";
import { CopyField } from "@/components/ui/CopyButton";
import { ToastContainer } from "@/components/ui/Toast";
import { useConta, useContas } from "@/hooks/useContas";
import { useToast } from "@/hooks/useToast";
import type { ContaStatus } from "@/types/database";

const GRADIENT = "linear-gradient(135deg,#E53935,#F5C842)";

const STATUS_STYLE: Record<ContaStatus, { bg: string; text: string; label: string }> = {
  pendente: { bg: "#FFFBEB", text: "#92400E", label: "Pendente" },
  pago:     { bg: "#F0FDF4", text: "#166534", label: "Pago" },
  vencido:  { bg: "#FEF2F2", text: "#991B1B", label: "Vencido" },
};

function formatDate(iso: string | null) {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

function formatMoney(v: number | null) {
  if (v == null) return "—";
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function DetalhesContaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { conta, loading, error, setConta } = useConta(id);
  const { deleteConta, marcarComoPago } = useContas();
  const { toasts, addToast, removeToast } = useToast();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [paying, setPaying] = useState(false);

  async function handlePagar() {
    setPaying(true);
    try {
      const updated = await marcarComoPago(id);
      setConta(updated);
      addToast("Conta marcada como paga!", "success");
    } catch {
      addToast("Erro ao atualizar", "error");
    } finally {
      setPaying(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteConta(id);
      addToast("Conta excluída", "success");
      setTimeout(() => router.push("/contas"), 600);
    } catch {
      addToast("Não foi possível excluir", "error");
      setDeleting(false);
      setConfirmDelete(false);
    }
  }

  const descricao = conta?.descricao ?? "Conta";

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <Header title={descricao} color="#E53935" showBack
        actions={conta && (
          <button onClick={() => router.push(`/contas/${id}/editar`)} aria-label="Editar"
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors">
            <Edit size={20} className="text-white" />
          </button>
        )} />

      <PageContainer>
        {loading && <div className="flex flex-col gap-4"><Skeleton variant="card" count={3} /></div>}
        {!loading && error && <p className="text-sm text-[#E53935] text-center py-8">{error}</p>}
        {!loading && !error && conta && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-4">
            {/* Resumo */}
            <div className="rounded-[16px] p-5 text-white" style={{ background: GRADIENT }}>
              <p className="text-3xl font-800">{formatMoney(conta.valor)}</p>
              <p className="text-white/70 text-sm mt-1">Vence em {formatDate(conta.data_vencimento)}</p>
              <span className="inline-block mt-3 text-xs font-700 px-3 py-1 rounded-full bg-white/20">
                {STATUS_STYLE[conta.status].label}
              </span>
            </div>

            {/* Marcar como pago */}
            {conta.status !== "pago" && (
              <Button fullWidth icon={CheckCircle} loading={paying} onClick={handlePagar}
                style={{ backgroundColor: "#4CAF50" }} size="lg">
                Marcar como paga
              </Button>
            )}

            {/* Dados */}
            <div className="bg-white rounded-[16px] border border-[#E0E0E0] px-5 py-2">
              {conta.data_pagamento && (
                <div className="flex items-center justify-between py-3 border-b border-[#F0F0F0]">
                  <div><span className="text-xs text-[#666666]">Data de pagamento</span>
                    <p className="text-base font-600 text-[#333333]">{formatDate(conta.data_pagamento)}</p></div>
                </div>
              )}
              {conta.codigo_barras && <CopyField label="Código de barras" value={conta.codigo_barras} />}
              {conta.linha_digitavel && <CopyField label="Linha digitável" value={conta.linha_digitavel} />}
              {conta.pix_copia_cola && <CopyField label="PIX copia e cola" value={conta.pix_copia_cola} />}
            </div>

            {conta.observacoes && (
              <div className="bg-white rounded-[16px] border border-[#E0E0E0] p-5">
                <p className="text-xs font-700 text-[#666666] uppercase tracking-wide mb-2">Observações</p>
                <p className="text-base text-[#333333] whitespace-pre-wrap">{conta.observacoes}</p>
              </div>
            )}

            <div className="pt-2">
              <Button variant="danger" fullWidth icon={Trash2} onClick={() => setConfirmDelete(true)}>
                Excluir conta
              </Button>
            </div>
          </motion.div>
        )}
      </PageContainer>

      <Modal open={confirmDelete} onClose={() => setConfirmDelete(false)} title="Excluir conta" size="sm">
        <p className="text-[#666666] mb-6">Excluir <strong>{descricao}</strong>? Essa ação não pode ser desfeita.</p>
        <div className="flex flex-col gap-3">
          <Button variant="danger" fullWidth loading={deleting} onClick={handleDelete}>Sim, excluir</Button>
          <Button variant="secondary" fullWidth onClick={() => setConfirmDelete(false)} disabled={deleting}>Cancelar</Button>
        </div>
      </Modal>
    </>
  );
}
