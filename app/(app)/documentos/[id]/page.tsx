"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Edit, Trash2, FileText, AlertTriangle } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Skeleton } from "@/components/ui/Skeleton";
import { CopyField } from "@/components/ui/CopyButton";
import { ToastContainer } from "@/components/ui/Toast";
import { useDocumento, useDocumentos } from "@/hooks/useDocumentos";
import { useMembros } from "@/hooks/useMembros";
import { useToast } from "@/hooks/useToast";

const COLOR = "#F5C842";
const TEXT = "#333333";

const TIPO_LABEL: Record<string, string> = {
  rg:"RG", cpf:"CPF", cnh:"CNH", passaporte:"Passaporte",
  titulo_eleitor:"Título de Eleitor", certidao_nascimento:"Certidão de Nascimento",
  certidao_casamento:"Certidão de Casamento", outro:"Outro",
};

function validadeBadge(dataValidade: string | null) {
  if (!dataValidade) return null;
  const dias = Math.floor((new Date(dataValidade).getTime() - Date.now()) / 86400000);
  if (dias < 0) return { bg: "#FEF2F2", text: "#991B1B", label: "Vencido" };
  if (dias <= 60) return { bg: "#FFFBEB", text: "#92400E", label: `Vence em ${dias} dias` };
  return { bg: "#F0FDF4", text: "#166534", label: "Válido" };
}

function formatDate(iso: string | null) {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

export default function DetalhesDocumentoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { documento, loading, error } = useDocumento(id);
  const { deleteDocumento } = useDocumentos();
  const { membros } = useMembros();
  const { toasts, addToast, removeToast } = useToast();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const membro = documento?.membro_id ? membros.find((m) => m.id === documento.membro_id) : undefined;
  const tipo = documento ? (TIPO_LABEL[documento.tipo] ?? documento.tipo) : "Documento";
  const badge = documento ? validadeBadge(documento.data_validade) : null;

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteDocumento(id);
      addToast("Documento excluído", "success");
      setTimeout(() => router.push("/documentos"), 600);
    } catch {
      addToast("Não foi possível excluir", "error");
      setDeleting(false);
      setConfirmDelete(false);
    }
  }

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <Header title={tipo} color={COLOR} textColor={TEXT} showBack
        actions={documento && (
          <button onClick={() => router.push(`/documentos/${id}/editar`)} aria-label="Editar"
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-black/10 transition-colors">
            <Edit size={20} style={{ color: TEXT }} />
          </button>
        )} />

      <PageContainer>
        {loading && <div className="flex flex-col gap-4"><Skeleton variant="card" count={3} /></div>}
        {!loading && error && <p className="text-sm text-[#E53935] text-center py-8">{error}</p>}
        {!loading && !error && documento && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-4">
            {/* Header card */}
            <div className="bg-white rounded-[16px] border border-[#E0E0E0] p-5 flex items-center gap-4">
              <div className="w-14 h-14 rounded-[12px] flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${COLOR}30` }}>
                <FileText size={28} style={{ color: TEXT }} />
              </div>
              <div className="flex-1">
                <p className="text-xl font-800 text-[#333333]">{tipo}</p>
                {membro && <p className="text-sm text-[#666666]">{membro.nome}</p>}
                {badge && (
                  <span className="inline-block text-xs font-700 px-2 py-0.5 rounded-full mt-1"
                    style={{ backgroundColor: badge.bg, color: badge.text }}>
                    {badge.label}
                  </span>
                )}
              </div>
            </div>

            {/* Dados */}
            <div className="bg-white rounded-[16px] border border-[#E0E0E0] px-5 py-2">
              {documento.numero && <CopyField label="Número" value={documento.numero} />}
              {documento.orgao_emissor && <CopyField label="Órgão emissor" value={documento.orgao_emissor} />}
              {documento.data_emissao && (
                <div className="flex items-center justify-between py-3 border-b border-[#F0F0F0] last:border-0">
                  <div><span className="text-xs text-[#666666]">Data de emissão</span>
                    <p className="text-base font-600 text-[#333333]">{formatDate(documento.data_emissao)}</p>
                  </div>
                </div>
              )}
              {documento.data_validade && (
                <div className="flex items-center justify-between py-3 last:border-0">
                  <div><span className="text-xs text-[#666666]">Validade</span>
                    <div className="flex items-center gap-2">
                      <p className="text-base font-600 text-[#333333]">{formatDate(documento.data_validade)}</p>
                      {badge && badge.text === "#991B1B" && <AlertTriangle size={16} className="text-[#E53935]" />}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {documento.observacoes && (
              <div className="bg-white rounded-[16px] border border-[#E0E0E0] p-5">
                <p className="text-xs font-700 text-[#666666] uppercase tracking-wide mb-2">Observações</p>
                <p className="text-base text-[#333333] whitespace-pre-wrap leading-relaxed">{documento.observacoes}</p>
              </div>
            )}

            <div className="pt-2">
              <Button variant="danger" fullWidth icon={Trash2} onClick={() => setConfirmDelete(true)}>
                Excluir documento
              </Button>
            </div>
          </motion.div>
        )}
      </PageContainer>

      <Modal open={confirmDelete} onClose={() => setConfirmDelete(false)} title="Excluir documento" size="sm">
        <p className="text-[#666666] mb-6">Excluir <strong>{tipo}</strong>? Essa ação não pode ser desfeita.</p>
        <div className="flex flex-col gap-3">
          <Button variant="danger" fullWidth loading={deleting} onClick={handleDelete}>Sim, excluir</Button>
          <Button variant="secondary" fullWidth onClick={() => setConfirmDelete(false)} disabled={deleting}>Cancelar</Button>
        </div>
      </Modal>
    </>
  );
}
