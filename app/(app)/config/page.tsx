"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Users, Plus, Trash2, LogOut, Info, Download, Share } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Skeleton } from "@/components/ui/Skeleton";
import { ToastContainer } from "@/components/ui/Toast";
import { useMembros } from "@/hooks/useMembros";
import { useToast } from "@/hooks/useToast";
import { createClient } from "@/lib/supabase/client";
import { APP_VERSION } from "@/lib/version";

const COLOR = "#1A1A2E";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-xs font-700 text-[#666666] uppercase tracking-wide px-1">{title}</h2>
      <div className="bg-white rounded-[16px] border border-[#E0E0E0] overflow-hidden">{children}</div>
    </div>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-[#F0F0F0] last:border-0">{children}</div>;
}

export default function ConfigPage() {
  const router = useRouter();
  const { membros, loading, createMembro, deleteMembro } = useMembros();
  const { toasts, addToast, removeToast } = useToast();

  const [addModal, setAddModal] = useState(false);
  const [nome, setNome] = useState("");
  const [parentesco, setParentesco] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleAddMembro() {
    if (!nome.trim()) { addToast("Digite o nome", "warning"); return; }
    setSaving(true);
    try {
      await createMembro({ nome: nome.trim(), parentesco: parentesco.trim() || null });
      addToast("Membro adicionado!", "success");
      setNome(""); setParentesco(""); setAddModal(false);
    } catch (err) {
      addToast(err instanceof Error ? err.message : "Erro ao salvar", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteMembro() {
    if (!confirmDeleteId) return;
    setDeleting(true);
    try {
      await deleteMembro(confirmDeleteId);
      addToast("Membro removido", "success");
      setConfirmDeleteId(null);
    } catch {
      addToast("Erro ao remover membro", "error");
    } finally {
      setDeleting(false);
    }
  }

  async function handleLogout() {
    setLoggingOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  const membroParaExcluir = membros.find((m) => m.id === confirmDeleteId);

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <Header title="Configurações" color={COLOR} showBack={false} />

      <PageContainer>
        <div className="flex flex-col gap-6">
          {/* Membros da família */}
          <Section title="Membros da família">
            {loading && (
              <div className="p-4"><Skeleton variant="text" count={3} className="mb-3" /></div>
            )}
            {!loading && membros.map((m, i) => (
              <motion.div key={m.id}
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}>
                <Row>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#1A1A2E]/10 flex items-center justify-center">
                      <Users size={16} className="text-[#1A1A2E]" />
                    </div>
                    <div>
                      <p className="font-600 text-[#333333]">{m.nome}</p>
                      {m.parentesco && <p className="text-xs text-[#666666]">{m.parentesco}</p>}
                    </div>
                  </div>
                  <button onClick={() => setConfirmDeleteId(m.id)} aria-label="Remover membro"
                    className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-[#FEF2F2] transition-colors">
                    <Trash2 size={16} className="text-[#E53935]" />
                  </button>
                </Row>
              </motion.div>
            ))}
            {!loading && (
              <div className="p-4">
                <Button variant="secondary" fullWidth icon={Plus} onClick={() => setAddModal(true)}>
                  Adicionar membro
                </Button>
              </div>
            )}
          </Section>

          {/* Instalar App */}
          <Section title="Instalar app">
            <div className="px-5 py-4 flex flex-col gap-5">
              {/* iOS */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-7 h-7 rounded-full bg-[#1A1A2E]/10 flex items-center justify-center">
                    <Share size={14} className="text-[#1A1A2E]" />
                  </div>
                  <span className="font-700 text-[#333333] text-sm">iPhone / iPad</span>
                </div>
                {[
                  "Abra o app no Safari",
                  "Toque no botão Compartilhar (quadrado com seta pra cima)",
                  'Role e toque em "Adicionar à tela de início"',
                  "Toque em Adicionar",
                ].map((step, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-[#1A1A2E] text-white text-[11px] font-700 flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                    <p className="text-sm text-[#555555] leading-snug">{step}</p>
                  </div>
                ))}
              </div>

              <div className="h-px bg-[#F0F0F0]" />

              {/* Android */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-7 h-7 rounded-full bg-[#1A1A2E]/10 flex items-center justify-center">
                    <Download size={14} className="text-[#1A1A2E]" />
                  </div>
                  <span className="font-700 text-[#333333] text-sm">Android</span>
                </div>
                {[
                  "Abra o app no Chrome",
                  "Toque nos 3 pontos (canto superior direito)",
                  'Toque em "Instalar app" ou "Adicionar à tela inicial"',
                  "Confirme tocando em Instalar",
                ].map((step, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-[#1A1A2E] text-white text-[11px] font-700 flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                    <p className="text-sm text-[#555555] leading-snug">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </Section>

          {/* Sobre */}
          <Section title="Sobre o app">
            <Row>
              <div className="flex items-center gap-3">
                <Info size={18} className="text-[#1A1A2E]" />
                <span className="font-600 text-[#333333]">Casa da Família</span>
              </div>
              <span className="text-sm text-[#999999]">v{APP_VERSION}</span>
            </Row>
          </Section>

          {/* Sair */}
          <Section title="Conta">
            <div className="p-4">
              <Button variant="danger" fullWidth icon={LogOut} loading={loggingOut} onClick={handleLogout}>
                Sair da conta
              </Button>
            </div>
          </Section>
        </div>
      </PageContainer>

      {/* Modal adicionar membro */}
      <Modal open={addModal} onClose={() => setAddModal(false)} title="Adicionar membro" size="sm">
        <div className="flex flex-col gap-4">
          <Input label="Nome *" placeholder="Nome completo" value={nome}
            onChange={(e) => setNome(e.target.value)} />
          <Input label="Parentesco" placeholder="Ex: Mãe, Pai, Filho..."
            value={parentesco} onChange={(e) => setParentesco(e.target.value)} />
          <Button fullWidth loading={saving} onClick={handleAddMembro}
            style={{ backgroundColor: COLOR }}>Adicionar</Button>
        </div>
      </Modal>

      {/* Modal confirmar remoção */}
      <Modal open={!!confirmDeleteId} onClose={() => setConfirmDeleteId(null)} title="Remover membro" size="sm">
        <p className="text-[#666666] mb-6">
          Remover <strong>{membroParaExcluir?.nome}</strong>? Os documentos vinculados ficarão sem membro.
        </p>
        <div className="flex flex-col gap-3">
          <Button variant="danger" fullWidth loading={deleting} onClick={handleDeleteMembro}>Sim, remover</Button>
          <Button variant="secondary" fullWidth onClick={() => setConfirmDeleteId(null)} disabled={deleting}>Cancelar</Button>
        </div>
      </Modal>
    </>
  );
}
