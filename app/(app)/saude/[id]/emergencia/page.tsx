"use client";

import { use, useState } from "react";
import { X, Save } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Header } from "@/components/layout/Header";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import { ToastContainer } from "@/components/ui/Toast";
import { DashboardEmergencia } from "@/components/modules/saude/DashboardEmergencia";
import { usePaciente, useMedicamentos, useContatosEmergencia } from "@/hooks/useSaude";
import { useToast } from "@/hooks/useToast";

const COLOR = "#E91E63";

export default function EmergenciaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { toasts, addToast, removeToast } = useToast();
  const { paciente, loading: loadPac } = usePaciente(id);
  const { medicamentos, loading: loadMed } = useMedicamentos(id);
  const { contatos, loading: loadCont, createContato, deleteContato } = useContatosEmergencia(id);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({ nome: "", relacao: "", telefone: "", prioridade: "1" });

  function setF(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSaveContato() {
    if (!form.nome.trim() || !form.telefone.trim()) {
      addToast("Nome e telefone são obrigatórios", "error");
      return;
    }
    setSaving(true);
    try {
      await createContato({
        paciente_id: id,
        nome: form.nome.trim(),
        relacao: form.relacao || null,
        telefone: form.telefone.trim(),
        prioridade: parseInt(form.prioridade) || 1,
      });
      addToast("Contato adicionado!", "success");
      setShowForm(false);
      setForm({ nome: "", relacao: "", telefone: "", prioridade: "1" });
    } catch (err) {
      addToast(err instanceof Error ? err.message : "Erro ao salvar", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteContato(contatoId: string) {
    try {
      await deleteContato(contatoId);
      addToast("Contato removido", "success");
    } catch {
      addToast("Erro ao remover", "error");
    }
  }

  const loading = loadPac || loadMed || loadCont;

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <Header title="Emergência" color={COLOR} showBack />
      <PageContainer>
        {loading && <div className="flex flex-col gap-3"><Skeleton variant="text" count={5} /></div>}

        {!loading && paciente && (
          <>
            <AnimatePresence>
              {showForm && (
                <motion.div
                  initial={{ opacity: 0, y: -12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  className="mb-4 p-4 rounded-[16px]"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)" }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-bold text-sm" style={{ color: "rgba(240,240,255,0.9)" }}>Novo contato de emergência</p>
                    <button onClick={() => setShowForm(false)}>
                      <X size={18} style={{ color: "rgba(240,240,255,0.5)" }} />
                    </button>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Input label="Nome *" value={form.nome} onChange={(e) => setF("nome", e.target.value)} accentColor={COLOR} />
                    <Input label="Relação (pai, mãe, filho...)" value={form.relacao} onChange={(e) => setF("relacao", e.target.value)} accentColor={COLOR} />
                    <Input label="Telefone *" type="tel" placeholder="(11) 99999-9999" value={form.telefone}
                      onChange={(e) => setF("telefone", e.target.value)} accentColor={COLOR} />
                    <Input label="Prioridade (1 = mais importante)" type="number" min="1" max="9"
                      value={form.prioridade} onChange={(e) => setF("prioridade", e.target.value)} accentColor={COLOR} />
                    <Button icon={Save} loading={saving} onClick={handleSaveContato} style={{ backgroundColor: "#4CAF50" }}>
                      Salvar contato
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <DashboardEmergencia
              paciente={paciente}
              medicamentos={medicamentos}
              contatos={contatos}
              onAddContato={() => setShowForm(true)}
              onDeleteContato={handleDeleteContato}
            />
          </>
        )}
      </PageContainer>
    </>
  );
}
