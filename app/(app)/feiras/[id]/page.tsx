"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Edit, Trash2, Plus, X, DollarSign } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Skeleton } from "@/components/ui/Skeleton";
import { ToastContainer } from "@/components/ui/Toast";
import { useFeira, useFeiras } from "@/hooks/useFeiras";
import { useToast } from "@/hooks/useToast";

const COLOR = "#2196F3";
const DIAS = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];

function formatMoney(v: number | null) {
  if (v == null) return "—";
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function DetalhesFeiraPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { feira, itens, historico, loading, error, addItem, removeItem, registrarIda } = useFeira(id);
  const { deleteFeira } = useFeiras();
  const { toasts, addToast, removeToast } = useToast();

  const [novoItem, setNovoItem] = useState("");
  const [addingItem, setAddingItem] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [registrarModal, setRegistrarModal] = useState(false);
  const [valorIda, setValorIda] = useState("");
  const [localIda, setLocalIda] = useState("");
  const [registrando, setRegistrando] = useState(false);
  const [checkedItens, setCheckedItens] = useState<Set<string>>(new Set());

  async function handleAddItem(e: React.FormEvent) {
    e.preventDefault();
    if (!novoItem.trim()) return;
    setAddingItem(true);
    try {
      await addItem(novoItem.trim());
      setNovoItem("");
    } catch {
      addToast("Erro ao adicionar item", "error");
    } finally {
      setAddingItem(false);
    }
  }

  async function handleRemoveItem(itemId: string) {
    try {
      await removeItem(itemId);
    } catch {
      addToast("Erro ao remover item", "error");
    }
  }

  async function handleRegistrar() {
    const valor = parseFloat(valorIda.replace(",", "."));
    if (isNaN(valor) || valor <= 0) {
      addToast("Informe um valor válido", "warning");
      return;
    }
    setRegistrando(true);
    try {
      await registrarIda(valor, localIda || undefined);
      addToast("Ida registrada!", "success");
      setRegistrarModal(false);
      setValorIda("");
      setLocalIda("");
    } catch {
      addToast("Erro ao registrar", "error");
    } finally {
      setRegistrando(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteFeira(id);
      addToast("Feira excluída", "success");
      setTimeout(() => router.push("/feiras"), 600);
    } catch {
      addToast("Não foi possível excluir", "error");
      setDeleting(false);
      setConfirmDelete(false);
    }
  }

  function toggleCheck(itemId: string) {
    setCheckedItens((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) next.delete(itemId); else next.add(itemId);
      return next;
    });
  }

  const nome = feira?.nome ?? "Feira";

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <Header title={nome} color={COLOR} showBack
        actions={feira && (
          <button onClick={() => router.push(`/feiras/${id}/editar`)} aria-label="Editar"
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors">
            <Edit size={20} className="text-white" />
          </button>
        )} />

      <PageContainer>
        {loading && <div className="flex flex-col gap-4"><Skeleton variant="card" count={3} /></div>}
        {!loading && error && <p className="text-sm text-[#E53935] text-center py-8">{error}</p>}
        {!loading && !error && feira && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-4">
            {/* Info */}
            <div className="bg-white rounded-[16px] border border-[#E0E0E0] p-5">
              <div className="flex items-center gap-3">
                {feira.dia_semana != null && (
                  <span className="text-sm font-700 px-3 py-1 rounded-full text-white" style={{ backgroundColor: COLOR }}>
                    {DIAS[feira.dia_semana]}
                  </span>
                )}
                <span className="text-sm text-[#666666]">{feira.tipo}</span>
                {feira.horario_preferido && (
                  <span className="text-sm text-[#666666]">· {feira.horario_preferido}</span>
                )}
              </div>
              {feira.local && <p className="text-sm text-[#666666] mt-2">📍 {feira.local}</p>}
            </div>

            {/* Botão registrar ida */}
            <Button fullWidth icon={DollarSign} onClick={() => setRegistrarModal(true)}
              style={{ backgroundColor: COLOR }} size="lg">
              Registrar ida à feira
            </Button>

            {/* Histórico */}
            {historico.length > 0 && (
              <div className="bg-white rounded-[16px] border border-[#E0E0E0] p-4">
                <p className="text-xs font-700 text-[#666666] uppercase tracking-wide mb-3">Últimas idas</p>
                <div className="flex flex-col gap-2">
                  {historico.map((h) => (
                    <div key={h.id} className="flex items-center justify-between py-1">
                      <span className="text-sm text-[#666666]">
                        {new Date(h.data + "T12:00:00").toLocaleDateString("pt-BR")}
                      </span>
                      <span className="font-700 text-[#333333]">{formatMoney(h.valor_gasto)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-[#F0F0F0] mt-2 pt-2 flex justify-between">
                  <span className="text-sm font-700 text-[#333333]">Total</span>
                  <span className="font-800 text-[#333333]">
                    {formatMoney(historico.reduce((s, h) => s + (h.valor_gasto ?? 0), 0))}
                  </span>
                </div>
              </div>
            )}

            {/* Lista de compras */}
            <div>
              <p className="text-sm font-700 text-[#333333] mb-3 px-1">Lista de compras</p>
              <div className="flex flex-col gap-2">
                <AnimatePresence>
                  {itens.map((item) => (
                    <motion.div key={item.id}
                      initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                      className="bg-white rounded-[14px] border border-[#E0E0E0] flex items-center gap-3 px-4 py-3">
                      <button onClick={() => toggleCheck(item.id)}
                        className="w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors"
                        style={{
                          borderColor: checkedItens.has(item.id) ? COLOR : "#CCCCCC",
                          backgroundColor: checkedItens.has(item.id) ? COLOR : "transparent",
                        }}>
                        {checkedItens.has(item.id) && <span className="text-white text-xs font-800">✓</span>}
                      </button>
                      <span className={`flex-1 text-base ${checkedItens.has(item.id) ? "line-through text-[#999999]" : "text-[#333333]"}`}>
                        {item.nome}
                      </span>
                      <button onClick={() => handleRemoveItem(item.id)} aria-label="Remover item"
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#F0F0F0]">
                        <X size={16} className="text-[#999999]" />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Adicionar item */}
                <form onSubmit={handleAddItem} className="flex gap-2">
                  <input value={novoItem} onChange={(e) => setNovoItem(e.target.value)}
                    placeholder="Adicionar item..."
                    className="flex-1 min-h-[48px] rounded-[10px] border border-[#E0E0E0] px-4 text-base text-[#333333] bg-white outline-none focus:border-[#2196F3] font-[inherit] placeholder:text-[#999999]" />
                  <Button type="submit" loading={addingItem} icon={Plus}
                    style={{ backgroundColor: COLOR }} aria-label="Adicionar" />
                </form>
              </div>
            </div>

            <div className="pt-2">
              <Button variant="danger" fullWidth icon={Trash2} onClick={() => setConfirmDelete(true)}>
                Excluir feira
              </Button>
            </div>
          </motion.div>
        )}
      </PageContainer>

      {/* Modal registrar ida */}
      <Modal open={registrarModal} onClose={() => setRegistrarModal(false)} title="Registrar ida à feira" size="sm">
        <div className="flex flex-col gap-4">
          <Input label="Valor gasto (R$)" type="number" inputMode="decimal" placeholder="0,00"
            value={valorIda} onChange={(e) => setValorIda(e.target.value)} />
          <Input label="Local (opcional)" placeholder="Nome do mercado ou feira"
            value={localIda} onChange={(e) => setLocalIda(e.target.value)} />
          <Button fullWidth loading={registrando} onClick={handleRegistrar}
            style={{ backgroundColor: COLOR }}>Registrar</Button>
        </div>
      </Modal>

      {/* Modal excluir */}
      <Modal open={confirmDelete} onClose={() => setConfirmDelete(false)} title="Excluir feira" size="sm">
        <p className="text-[#666666] mb-6">Excluir <strong>{nome}</strong>? Essa ação não pode ser desfeita.</p>
        <div className="flex flex-col gap-3">
          <Button variant="danger" fullWidth loading={deleting} onClick={handleDelete}>Sim, excluir</Button>
          <Button variant="secondary" fullWidth onClick={() => setConfirmDelete(false)} disabled={deleting}>Cancelar</Button>
        </div>
      </Modal>
    </>
  );
}
