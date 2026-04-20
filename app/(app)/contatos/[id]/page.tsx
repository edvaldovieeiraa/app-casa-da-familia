"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Edit, Trash2, Phone, MessageCircle, Mail, MapPin } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Skeleton } from "@/components/ui/Skeleton";
import { CopyField } from "@/components/ui/CopyButton";
import { ToastContainer } from "@/components/ui/Toast";
import { useContato, useContatos } from "@/hooks/useContatos";
import { useToast } from "@/hooks/useToast";

const COLOR = "#4CAF50";

const AVATAR_COLORS = ["#E53935","#4CAF50","#2196F3","#F5C842","#9C27B0","#FF5722","#00BCD4","#FF9800"];
function getAvatarColor(nome: string) {
  let hash = 0;
  for (let i = 0; i < nome.length; i++) hash = nome.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}
function initials(nome: string) {
  return nome.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

export default function DetalhesContatoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { contato, loading, error } = useContato(id);
  const { deleteContato } = useContatos();
  const { toasts, addToast, removeToast } = useToast();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteContato(id);
      addToast("Contato excluído", "success");
      setTimeout(() => router.push("/contatos"), 600);
    } catch {
      addToast("Não foi possível excluir", "error");
      setDeleting(false);
      setConfirmDelete(false);
    }
  }

  const nome = contato?.nome ?? "Contato";

  function phoneHref(tel: string) {
    return `tel:${tel.replace(/\D/g, "")}`;
  }
  function waHref(tel: string) {
    return `https://wa.me/55${tel.replace(/\D/g, "")}`;
  }

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <Header title={nome} color={COLOR} showBack
        actions={contato && (
          <button onClick={() => router.push(`/contatos/${id}/editar`)} aria-label="Editar"
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors">
            <Edit size={20} className="text-white" />
          </button>
        )} />

      <PageContainer>
        {loading && <div className="flex flex-col gap-4"><Skeleton variant="card" count={3} /></div>}
        {!loading && error && <p className="text-sm text-[#E53935] text-center py-8">{error}</p>}
        {!loading && !error && contato && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-4">
            {/* Avatar */}
            <div className="flex flex-col items-center gap-3 py-4">
              <div className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-700"
                style={{ backgroundColor: getAvatarColor(contato.nome) }}>
                {initials(contato.nome)}
              </div>
              <div className="text-center">
                <p className="text-xl font-800 text-[#333333]">{contato.nome}</p>
                {contato.empresa && <p className="text-sm text-[#666666]">{contato.empresa}</p>}
              </div>
            </div>

            {/* Ações rápidas */}
            {(contato.telefone_principal || contato.whatsapp) && (
              <div className="flex gap-3">
                {contato.telefone_principal && (
                  <a href={phoneHref(contato.telefone_principal)} className="flex-1">
                    <Button variant="secondary" fullWidth icon={Phone} style={{ borderColor: COLOR, color: COLOR }}>
                      Ligar
                    </Button>
                  </a>
                )}
                {contato.whatsapp && (
                  <a href={waHref(contato.whatsapp)} target="_blank" rel="noopener noreferrer" className="flex-1">
                    <Button fullWidth icon={MessageCircle} style={{ backgroundColor: "#25D366" }}>
                      WhatsApp
                    </Button>
                  </a>
                )}
              </div>
            )}

            {/* Dados */}
            <div className="bg-white rounded-[16px] border border-[#E0E0E0] px-5 py-4">
              {contato.telefone_principal && <CopyField label="Telefone principal" value={contato.telefone_principal} />}
              {contato.telefone_secundario && <CopyField label="Telefone secundário" value={contato.telefone_secundario} />}
              {contato.whatsapp && <CopyField label="WhatsApp" value={contato.whatsapp} />}
              {contato.email && <CopyField label="E-mail" value={contato.email} />}
              {contato.endereco && <CopyField label="Endereço" value={contato.endereco} />}
            </div>

            {contato.observacoes && (
              <div className="bg-white rounded-[16px] border border-[#E0E0E0] p-5">
                <p className="text-xs font-700 text-[#666666] uppercase tracking-wide mb-2">Observações</p>
                <p className="text-base text-[#333333] whitespace-pre-wrap leading-relaxed">{contato.observacoes}</p>
              </div>
            )}

            <div className="pt-2">
              <Button variant="danger" fullWidth icon={Trash2} onClick={() => setConfirmDelete(true)}>
                Excluir contato
              </Button>
            </div>
          </motion.div>
        )}
      </PageContainer>

      <Modal open={confirmDelete} onClose={() => setConfirmDelete(false)} title="Excluir contato" size="sm">
        <p className="text-[#666666] mb-6">Excluir <strong>{nome}</strong>? Essa ação não pode ser desfeita.</p>
        <div className="flex flex-col gap-3">
          <Button variant="danger" fullWidth loading={deleting} onClick={handleDelete}>Sim, excluir</Button>
          <Button variant="secondary" fullWidth onClick={() => setConfirmDelete(false)} disabled={deleting}>Cancelar</Button>
        </div>
      </Modal>
    </>
  );
}
