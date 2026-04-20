"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Edit, Trash2, FileText, Phone, Mail } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Skeleton } from "@/components/ui/Skeleton";
import { CopyField } from "@/components/ui/CopyButton";
import { ToastContainer } from "@/components/ui/Toast";
import { useMembro, useMembros } from "@/hooks/useMembros";
import { useToast } from "@/hooks/useToast";
import { createClient } from "@/lib/supabase/client";
import type { Documento } from "@/types/database";

const COLOR = "#9C27B0";

const AVATAR_COLORS = ["#9C27B0", "#E53935", "#4CAF50", "#2196F3", "#FF6F00", "#00BCD4", "#FF9800"];
function getAvatarColor(nome: string) {
  let hash = 0;
  for (let i = 0; i < nome.length; i++) hash = nome.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}
function initials(nome: string) {
  return nome.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}
function calcularIdade(dataNascimento: string): number {
  const hoje = new Date();
  const nasc = new Date(dataNascimento + "T12:00:00");
  let idade = hoje.getFullYear() - nasc.getFullYear();
  const m = hoje.getMonth() - nasc.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) idade--;
  return idade;
}

const TIPO_DOC: Record<string, string> = {
  rg: "RG", cpf: "CPF", cnh: "CNH", passaporte: "Passaporte",
  titulo_eleitor: "Título de Eleitor", certidao_nascimento: "Certidão de Nascimento",
  certidao_casamento: "Certidão de Casamento", outro: "Outro",
};

export default function DetalhesMembroPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { membro, loading, error } = useMembro(id);
  const { deleteMembro } = useMembros();
  const { toasts, addToast, removeToast } = useToast();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [documentos, setDocumentos] = useState<Documento[]>([]);

  useEffect(() => {
    const supabase = createClient();
    supabase.from("documentos").select("*").eq("membro_id", id).order("tipo")
      .then(({ data }) => setDocumentos((data ?? []) as Documento[]));
  }, [id]);

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteMembro(id);
      addToast("Membro excluído", "success");
      setTimeout(() => router.push("/familia"), 600);
    } catch {
      addToast("Não foi possível excluir", "error");
      setDeleting(false);
      setConfirmDelete(false);
    }
  }

  const nome = membro?.nome ?? "Membro";

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <Header title={membro?.apelido ?? nome} color={COLOR} showBack
        actions={membro && (
          <button onClick={() => router.push(`/familia/${id}/editar`)} aria-label="Editar"
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors">
            <Edit size={20} className="text-white" />
          </button>
        )} />

      <PageContainer>
        {loading && <div className="flex flex-col gap-4"><Skeleton variant="card" count={3} /></div>}
        {!loading && error && <p className="text-sm text-[#E53935] text-center py-8">{error}</p>}
        {!loading && !error && membro && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-4">
            {/* Avatar */}
            <div className="flex flex-col items-center gap-3 py-4">
              <div className="w-24 h-24 rounded-full flex items-center justify-center text-white text-3xl font-700"
                style={{ backgroundColor: getAvatarColor(nome) }}>
                {initials(nome)}
              </div>
              <div className="text-center">
                <p className="text-xl font-800 text-[#333333]">{nome}</p>
                {membro.apelido && <p className="text-sm text-[#666666]">&ldquo;{membro.apelido}&rdquo;</p>}
                {membro.data_nascimento && (
                  <p className="text-sm text-[#666666] mt-1">
                    {calcularIdade(membro.data_nascimento)} anos
                  </p>
                )}
              </div>
            </div>

            {/* Ações rápidas */}
            {(membro.telefone || membro.email) && (
              <div className="flex gap-3">
                {membro.telefone && (
                  <a href={`tel:${membro.telefone.replace(/\D/g, "")}`} className="flex-1">
                    <Button variant="secondary" fullWidth icon={Phone}
                      style={{ borderColor: COLOR, color: COLOR }}>Ligar</Button>
                  </a>
                )}
                {membro.email && (
                  <a href={`mailto:${membro.email}`} className="flex-1">
                    <Button variant="secondary" fullWidth icon={Mail}
                      style={{ borderColor: COLOR, color: COLOR }}>E-mail</Button>
                  </a>
                )}
              </div>
            )}

            {/* Dados pessoais */}
            <div className="bg-white rounded-[16px] border border-[#E0E0E0] px-5 py-4">
              <p className="text-xs font-700 text-[#666666] uppercase tracking-wide mb-3">Dados pessoais</p>
              {membro.data_nascimento && (
                <CopyField label="Data de nascimento"
                  value={new Date(membro.data_nascimento + "T12:00:00").toLocaleDateString("pt-BR")} />
              )}
              {membro.cpf && <CopyField label="CPF" value={membro.cpf} />}
              {membro.rg && <CopyField label="RG" value={membro.rg} />}
              {membro.telefone && <CopyField label="Telefone" value={membro.telefone} />}
              {membro.email && <CopyField label="E-mail" value={membro.email} />}
            </div>

            {/* Documentos vinculados */}
            {documentos.length > 0 && (
              <div className="bg-white rounded-[16px] border border-[#E0E0E0] p-5">
                <p className="text-xs font-700 text-[#666666] uppercase tracking-wide mb-3">
                  Documentos ({documentos.length})
                </p>
                <div className="flex flex-col gap-2">
                  {documentos.map((doc) => (
                    <button key={doc.id} onClick={() => router.push(`/documentos/${doc.id}`)}
                      className="flex items-center gap-3 py-2 text-left hover:opacity-75 transition-opacity">
                      <div className="w-8 h-8 rounded-[8px] bg-[#F5C842]/20 flex items-center justify-center flex-shrink-0">
                        <FileText size={16} className="text-[#F5C842]" />
                      </div>
                      <div>
                        <p className="font-600 text-[#333333] text-sm">{TIPO_DOC[doc.tipo] ?? doc.tipo}</p>
                        {doc.numero && <p className="text-xs text-[#666666]">{doc.numero}</p>}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-2">
              <Button variant="danger" fullWidth icon={Trash2} onClick={() => setConfirmDelete(true)}>
                Excluir membro
              </Button>
            </div>
          </motion.div>
        )}
      </PageContainer>

      <Modal open={confirmDelete} onClose={() => setConfirmDelete(false)} title="Excluir membro" size="sm">
        <p className="text-[#666666] mb-6">
          Excluir <strong>{nome}</strong>? Os documentos vinculados ficarão sem membro.
        </p>
        <div className="flex flex-col gap-3">
          <Button variant="danger" fullWidth loading={deleting} onClick={handleDelete}>Sim, excluir</Button>
          <Button variant="secondary" fullWidth onClick={() => setConfirmDelete(false)} disabled={deleting}>Cancelar</Button>
        </div>
      </Modal>
    </>
  );
}
