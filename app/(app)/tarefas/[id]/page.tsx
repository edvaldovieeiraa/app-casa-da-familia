"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Edit, Trash2, Play, CheckCircle, XCircle, MessageCircle, Send, ExternalLink } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Skeleton } from "@/components/ui/Skeleton";
import { ToastContainer } from "@/components/ui/Toast";
import { ComentarioItem } from "@/components/modules/tarefas/ComentarioItem";
import { ConcluirModal } from "@/components/modules/tarefas/ConcluirModal";
import { useTarefa, useTarefas } from "@/hooks/useTarefas";
import { useMembros } from "@/hooks/useMembros";
import { useToast } from "@/hooks/useToast";
import { createClient } from "@/lib/supabase/client";
import type { TarefaPrioridade, TarefaStatus } from "@/types/database";

const COLOR = "#00897B";

const PRIO_COLOR: Record<TarefaPrioridade, string> = {
  urgente: "#E53935", alta: "#FF6F00", media: "#F5C842", baixa: "#4CAF50",
};
const PRIO_LABEL: Record<TarefaPrioridade, string> = {
  urgente: "Urgente", alta: "Alta", media: "Média", baixa: "Baixa",
};
const STATUS_CONFIG: Record<TarefaStatus, { label: string; bg: string; color: string }> = {
  pendente:     { label: "Pendente",     bg: "#F5F5F5", color: "#9E9E9E" },
  em_andamento: { label: "Em andamento", bg: "#E3F2FD", color: "#2196F3" },
  concluida:    { label: "Concluída",    bg: "#E8F5E9", color: "#4CAF50" },
  cancelada:    { label: "Cancelada",    bg: "#FFEBEE", color: "#C62828" },
};
const CAT_LABEL: Record<string, string> = {
  compras: "🛒 Compras", servico: "🔧 Serviço", conserto: "🏠 Conserto",
  medico: "🏥 Médico", financeiro: "💰 Financeiro", outro: "📌 Outro",
};

function formatDate(iso: string | null) {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

export default function DetalhesTarefaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const {
    tarefa, comentarios, checklist,
    loading, error,
    mudarStatus, adicionarComentario, refetch,
    adicionarChecklistItem, toggleChecklistItem, removerChecklistItem,
  } = useTarefa(id);
  const { deleteTarefa } = useTarefas();
  const { membros } = useMembros();
  const { toasts, addToast, removeToast } = useToast();

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [canceling, setCanceling] = useState(false);
  const [iniciando, setIniciando] = useState(false);
  const [concluirOpen, setConcluirOpen] = useState(false);
  const [novoComentario, setNovoComentario] = useState("");
  const [membroComentario, setMembroComentario] = useState("");
  const [novoItemChecklist, setNovoItemChecklist] = useState("");
  const [addingItem, setAddingItem] = useState(false);
  const [sendingComment, setSendingComment] = useState(false);
  const [comprovanteUrl, setComprovanteUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!tarefa?.comprovante_url) return;
    createClient().storage.from("tarefas").createSignedUrl(tarefa.comprovante_url, 3600)
      .then(({ data }) => setComprovanteUrl(data?.signedUrl ?? null));
  }, [tarefa?.comprovante_url]);

  const prioColor = tarefa ? PRIO_COLOR[tarefa.prioridade] : COLOR;
  const status = tarefa ? STATUS_CONFIG[tarefa.status] : null;

  async function handleIniciar() {
    setIniciando(true);
    try {
      await mudarStatus("em_andamento");
      addToast("Tarefa iniciada!", "success");
    } catch { addToast("Erro ao atualizar", "error"); }
    finally { setIniciando(false); }
  }

  async function handleConcluir(url: string | null) {
    try {
      await mudarStatus("concluida", url);
      addToast("Tarefa concluída! 🎉", "success");
      setConcluirOpen(false);
    } catch { addToast("Erro ao concluir", "error"); }
  }

  async function handleCancelar() {
    setCanceling(true);
    try {
      await mudarStatus("cancelada");
      addToast("Tarefa cancelada", "success");
      setConfirmCancel(false);
    } catch { addToast("Erro ao cancelar", "error"); }
    finally { setCanceling(false); }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteTarefa(id);
      addToast("Tarefa excluída", "success");
      setTimeout(() => router.push("/tarefas"), 600);
    } catch {
      addToast("Não foi possível excluir", "error");
      setDeleting(false);
      setConfirmDelete(false);
    }
  }

  async function handleAddChecklistItem(e: React.FormEvent) {
    e.preventDefault();
    const texto = novoItemChecklist.trim();
    if (!texto) return;
    setAddingItem(true);
    try {
      await adicionarChecklistItem(texto);
      setNovoItemChecklist("");
    } catch { addToast("Erro ao adicionar item", "error"); }
    finally { setAddingItem(false); }
  }

  async function handleToggle(itemId: string, atual: boolean) {
    try { await toggleChecklistItem(itemId, !atual); }
    catch { addToast("Erro ao atualizar item", "error"); }
  }

  async function handleRemoveItem(itemId: string) {
    try { await removerChecklistItem(itemId); }
    catch { addToast("Erro ao remover item", "error"); }
  }

  async function handleComment(e: React.FormEvent) {
    e.preventDefault();
    if (!novoComentario.trim()) return;
    setSendingComment(true);
    try {
      await adicionarComentario(novoComentario.trim(), membroComentario || null);
      setNovoComentario("");
      addToast("Comentário adicionado!", "success");
    } catch { addToast("Erro ao enviar comentário", "error"); }
    finally { setSendingComment(false); }
  }

  const ativa = tarefa?.status === "pendente" || tarefa?.status === "em_andamento";

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <ConcluirModal open={concluirOpen} onClose={() => setConcluirOpen(false)} onConfirm={handleConcluir} />

      <Header title={tarefa?.titulo ?? "Tarefa"} color={COLOR} showBack
        actions={tarefa && (
          <button onClick={() => router.push(`/tarefas/${id}/editar`)} aria-label="Editar"
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors text-white">
            <Edit size={20} />
          </button>
        )} />

      <PageContainer>
        {loading && <div className="flex flex-col gap-4"><Skeleton variant="card" count={4} /></div>}
        {!loading && error && <p className="text-sm text-[#E53935] text-center py-8">{error}</p>}

        {!loading && !error && tarefa && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-4">

            {/* Header card */}
            <div className="bg-white rounded-[16px] border border-[#E0E0E0] p-5">
              <div className="flex items-start gap-3">
                <div className="w-1.5 self-stretch rounded-full flex-shrink-0" style={{ backgroundColor: prioColor }} />
                <div className="flex-1">
                  <p className="text-lg font-800 text-[#333333] leading-snug">{tarefa.titulo}</p>
                  {tarefa.descricao && (
                    <p className="text-sm text-[#666666] mt-1 leading-relaxed">{tarefa.descricao}</p>
                  )}
                  <div className="flex flex-wrap gap-2 mt-3">
                    {status && (
                      <span className="text-xs font-700 px-2.5 py-1 rounded-full"
                        style={{ backgroundColor: status.bg, color: status.color }}>
                        {status.label}
                      </span>
                    )}
                    <span className="text-xs font-700 px-2.5 py-1 rounded-full"
                      style={{ backgroundColor: `${prioColor}20`, color: prioColor }}>
                      {PRIO_LABEL[tarefa.prioridade]}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Ações de status */}
            {ativa && (
              <div className="flex gap-2">
                {tarefa.status === "pendente" && (
                  <Button fullWidth icon={Play} loading={iniciando} onClick={handleIniciar}
                    style={{ backgroundColor: "#2196F3", color: "#fff" }}>
                    Iniciar
                  </Button>
                )}
                <Button fullWidth icon={CheckCircle} onClick={() => setConcluirOpen(true)}
                  style={{ backgroundColor: "#4CAF50", color: "#fff" }}>
                  Concluir
                </Button>
                <Button fullWidth icon={XCircle} variant="secondary" onClick={() => setConfirmCancel(true)}>
                  Cancelar
                </Button>
              </div>
            )}

            {/* Informações */}
            <div className="bg-white rounded-[16px] border border-[#E0E0E0] px-5 py-2">
              <p className="text-xs font-700 text-[#666666] uppercase tracking-wide pt-3 pb-1">Informações</p>
              {tarefa.categoria && (
                <div className="py-3 border-b border-[#F0F0F0]">
                  <p className="text-xs text-[#666666]">Categoria</p>
                  <p className="text-base font-600 text-[#333333]">{CAT_LABEL[tarefa.categoria]}</p>
                </div>
              )}
              {tarefa.data_prazo && (
                <div className="py-3 border-b border-[#F0F0F0]">
                  <p className="text-xs text-[#666666]">Prazo</p>
                  <p className="text-base font-600 text-[#333333]">{formatDate(tarefa.data_prazo)}</p>
                </div>
              )}
              {tarefa.solicitante_id && (
                <div className="py-3 border-b border-[#F0F0F0]">
                  <p className="text-xs text-[#666666]">Solicitado por</p>
                  <p className="text-base font-600 text-[#333333]">
                    {membros.find((m) => m.id === tarefa.solicitante_id)?.nome ?? "—"}
                  </p>
                </div>
              )}
              {tarefa.responsavel_id && (
                <div className="py-3 border-b border-[#F0F0F0] last:border-0">
                  <p className="text-xs text-[#666666]">Responsável</p>
                  <p className="text-base font-600 text-[#333333]">
                    {membros.find((m) => m.id === tarefa.responsavel_id)?.nome ?? "—"}
                  </p>
                </div>
              )}
              {tarefa.data_conclusao && (
                <div className="py-3 last:border-0">
                  <p className="text-xs text-[#666666]">Concluída em</p>
                  <p className="text-base font-600 text-[#4CAF50]">{formatDate(tarefa.data_conclusao)}</p>
                </div>
              )}
            </div>

            {/* Comprovante */}
            {tarefa.comprovante_url && (
              <div className="bg-white rounded-[16px] border border-[#E0E0E0] p-5">
                <p className="text-xs font-700 text-[#666666] uppercase tracking-wide mb-3">Comprovante</p>
                {comprovanteUrl && (
                  <img src={comprovanteUrl} alt="Comprovante" className="w-full rounded-[10px] border border-[#E0E0E0] object-contain max-h-56 bg-[#F8F9FA] mb-2" />
                )}
                {comprovanteUrl && (
                  <a href={comprovanteUrl} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-[#2196F3] font-600">
                    <ExternalLink size={14} /> Abrir comprovante
                  </a>
                )}
              </div>
            )}

            {/* Checklist */}
            {(checklist.length > 0 || true) && (() => {
              const total = checklist.length;
              const concluidos = checklist.filter((i) => i.concluido).length;
              const pct = total > 0 ? Math.round((concluidos / total) * 100) : 0;
              return (
                <div className="bg-white rounded-[16px] border border-[#E0E0E0] p-5">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-700 text-[#666666] uppercase tracking-wide">
                      Checklist {total > 0 && `(${concluidos}/${total})`}
                    </p>
                    {total > 0 && (
                      <span className="text-xs font-800 text-[#00897B]">{pct}%</span>
                    )}
                  </div>

                  {/* Barra de progresso */}
                  {total > 0 && (
                    <div className="w-full h-2 bg-[#E0E0E0] rounded-full mb-4 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, backgroundColor: pct === 100 ? "#4CAF50" : "#00897B" }}
                      />
                    </div>
                  )}

                  {/* Itens */}
                  <ul className="flex flex-col gap-1 mb-3">
                    {checklist.map((item) => (
                      <li key={item.id}
                        className="flex items-center gap-3 py-2 rounded-[8px] px-2 hover:bg-[#F8F9FA] transition-colors group">
                        <button
                          onClick={() => handleToggle(item.id, item.concluido)}
                          className="w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all"
                          style={{
                            borderColor: item.concluido ? "#4CAF50" : "#00897B",
                            backgroundColor: item.concluido ? "#4CAF50" : "transparent",
                          }}>
                          {item.concluido && (
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                              <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </button>
                        <span className={`flex-1 text-sm transition-all ${item.concluido ? "line-through text-[#999999]" : "text-[#333333]"}`}>
                          {item.texto}
                        </span>
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="opacity-0 group-hover:opacity-100 w-7 h-7 rounded-full flex items-center justify-center text-[#999999] hover:text-[#E53935] hover:bg-[#FEF2F2] transition-all">
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                            <path d="M9 3L3 9M3 3l6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                          </svg>
                        </button>
                      </li>
                    ))}
                  </ul>

                  {/* Adicionar item */}
                  <form onSubmit={handleAddChecklistItem} className="flex gap-2">
                    <input
                      value={novoItemChecklist}
                      onChange={(e) => setNovoItemChecklist(e.target.value)}
                      placeholder="Adicionar item..."
                      className="flex-1 min-h-[44px] rounded-[10px] border border-[#E0E0E0] px-3 text-sm text-[#333333] bg-white outline-none focus:border-[#00897B] font-[inherit]"
                    />
                    <button type="submit" disabled={addingItem || !novoItemChecklist.trim()}
                      className="w-11 h-11 rounded-[10px] flex items-center justify-center disabled:opacity-40 transition-opacity flex-shrink-0"
                      style={{ backgroundColor: "#00897B" }}>
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                        <path d="M9 3v12M3 9h12" stroke="white" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </button>
                  </form>
                </div>
              );
            })()}

            {/* Comentários */}
            <div className="bg-white rounded-[16px] border border-[#E0E0E0] p-5">
              <p className="text-xs font-700 text-[#666666] uppercase tracking-wide mb-3 flex items-center gap-1.5">
                <MessageCircle size={13} /> Comentários ({comentarios.length})
              </p>

              {comentarios.length === 0 && (
                <p className="text-sm text-[#999999] text-center py-3">Nenhum comentário ainda</p>
              )}
              {comentarios.map((c, i) => (
                <ComentarioItem key={c.id} comentario={c} membros={membros} index={i} />
              ))}

              {/* Form de novo comentário */}
              <form onSubmit={handleComment} className="mt-4 flex flex-col gap-3">
                {membros.length > 0 && (
                  <select value={membroComentario} onChange={(e) => setMembroComentario(e.target.value)}
                    className="w-full min-h-[40px] rounded-[10px] border border-[#E0E0E0] px-3 text-sm text-[#333333] bg-white outline-none focus:border-[#00897B] font-[inherit]">
                    <option value="">Quem está comentando?</option>
                    {membros.map((m) => <option key={m.id} value={m.id}>{m.nome}</option>)}
                  </select>
                )}
                <div className="flex gap-2">
                  <input
                    value={novoComentario}
                    onChange={(e) => setNovoComentario(e.target.value)}
                    placeholder="Escreva um comentário..."
                    className="flex-1 min-h-[48px] rounded-[10px] border border-[#E0E0E0] px-4 text-sm text-[#333333] bg-white outline-none focus:border-[#00897B] font-[inherit]"
                  />
                  <button type="submit" disabled={sendingComment || !novoComentario.trim()}
                    className="w-12 h-12 rounded-[10px] flex items-center justify-center transition-colors disabled:opacity-40"
                    style={{ backgroundColor: COLOR }}>
                    <Send size={18} className="text-white" />
                  </button>
                </div>
              </form>
            </div>

            {tarefa.observacoes && (
              <div className="bg-white rounded-[16px] border border-[#E0E0E0] p-5">
                <p className="text-xs font-700 text-[#666666] uppercase tracking-wide mb-2">Observações</p>
                <p className="text-base text-[#333333] whitespace-pre-wrap leading-relaxed">{tarefa.observacoes}</p>
              </div>
            )}

            <div className="pt-2">
              <Button variant="danger" fullWidth icon={Trash2} onClick={() => setConfirmDelete(true)}>
                Excluir tarefa
              </Button>
            </div>
          </motion.div>
        )}
      </PageContainer>

      <Modal open={confirmCancel} onClose={() => setConfirmCancel(false)} title="Cancelar tarefa" size="sm">
        <p className="text-[#666666] mb-6">Deseja cancelar esta tarefa?</p>
        <div className="flex flex-col gap-3">
          <Button fullWidth loading={canceling} onClick={handleCancelar}
            style={{ backgroundColor: "#EF9A9A", color: "#C62828" }}>
            Sim, cancelar
          </Button>
          <Button variant="secondary" fullWidth onClick={() => setConfirmCancel(false)} disabled={canceling}>Voltar</Button>
        </div>
      </Modal>

      <Modal open={confirmDelete} onClose={() => setConfirmDelete(false)} title="Excluir tarefa" size="sm">
        <p className="text-[#666666] mb-6">Excluir <strong>{tarefa?.titulo}</strong>? Essa ação não pode ser desfeita.</p>
        <div className="flex flex-col gap-3">
          <Button variant="danger" fullWidth loading={deleting} onClick={handleDelete}>Sim, excluir</Button>
          <Button variant="secondary" fullWidth onClick={() => setConfirmDelete(false)} disabled={deleting}>Cancelar</Button>
        </div>
      </Modal>
    </>
  );
}
