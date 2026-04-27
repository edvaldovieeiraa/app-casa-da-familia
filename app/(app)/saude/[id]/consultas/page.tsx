"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Calendar, X, Save } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Header } from "@/components/layout/Header";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ToastContainer } from "@/components/ui/Toast";
import { usePaciente, useConsultas } from "@/hooks/useSaude";
import { useToast } from "@/hooks/useToast";
import type { SaudeConsulta } from "@/types/database";

const COLOR = "#2196F3";

function formatDateTime(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR") + " " + d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function ConsultaCard({ consulta, isProxima, onDelete }: {
  consulta: SaudeConsulta;
  isProxima: boolean;
  onDelete: () => void;
}) {
  return (
    <div className="bg-white rounded-[16px] border border-[#E0E0E0] p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-bold text-[#333]">
              {consulta.especialidade ?? consulta.tipo ?? "Consulta"}
            </p>
            {isProxima && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                style={{ backgroundColor: `${COLOR}20`, color: COLOR }}>
                Próxima
              </span>
            )}
          </div>
          {consulta.medico && <p className="text-xs text-[#666] mt-0.5">{consulta.medico}</p>}
          {consulta.local && <p className="text-xs text-[#999] mt-0.5">{consulta.local}</p>}
          <div className="flex items-center gap-1.5 mt-1.5">
            <Calendar size={12} style={{ color: COLOR }} />
            <span className="text-xs font-semibold" style={{ color: COLOR }}>
              {formatDateTime(consulta.data_hora)}
            </span>
          </div>
          {consulta.resultado && (
            <p className="text-xs text-[#555] mt-2 leading-relaxed">{consulta.resultado}</p>
          )}
        </div>
        <button
          onClick={onDelete}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#FFEBEE] transition-colors flex-shrink-0"
        >
          <X size={14} style={{ color: "#E53935" }} />
        </button>
      </div>
    </div>
  );
}

export default function ConsultasPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { toasts, addToast, removeToast } = useToast();
  const { paciente } = usePaciente(id);
  const { consultas, proximas, historico, loading, createConsulta, deleteConsulta } = useConsultas(id);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<"proximas" | "historico">("proximas");

  const [form, setForm] = useState({
    tipo: "", especialidade: "", medico: "", local: "", data_hora: "", resultado: "", observacoes: "",
  });

  function setF(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave() {
    if (!form.data_hora && !form.especialidade && !form.medico) {
      addToast("Preencha pelo menos a especialidade e data", "error");
      return;
    }
    setSaving(true);
    try {
      await createConsulta({
        paciente_id: id,
        tipo: form.tipo || null,
        especialidade: form.especialidade || null,
        medico: form.medico || null,
        local: form.local || null,
        data_hora: form.data_hora || null,
        resultado: form.resultado || null,
        anexo_url: null,
        observacoes: form.observacoes || null,
      });
      addToast("Consulta registrada!", "success");
      setShowForm(false);
      setForm({ tipo: "", especialidade: "", medico: "", local: "", data_hora: "", resultado: "", observacoes: "" });
    } catch (err) {
      addToast(err instanceof Error ? err.message : "Erro ao salvar", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(consultaId: string) {
    try {
      await deleteConsulta(consultaId);
      addToast("Consulta removida", "success");
    } catch {
      addToast("Erro ao remover", "error");
    }
  }

  const nome = paciente?.apelido ?? paciente?.nome ?? "Paciente";
  const listToShow = tab === "proximas" ? proximas : historico;

  const inputStyle: React.CSSProperties = {
    background: "rgba(255,255,255,0.07)", border: "1.5px solid rgba(255,255,255,0.12)",
    borderRadius: 14, color: "#F0F0FF", fontSize: 15, padding: "12px 14px",
    width: "100%", outline: "none",
  };
  const labelStyle: React.CSSProperties = {
    fontSize: 12, fontWeight: 600, color: "rgba(240,240,255,0.6)", marginBottom: 4, display: "block",
  };

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <Header
        title={`Consultas · ${nome}`}
        color={COLOR}
        showBack
        actions={
          <button
            onClick={() => setShowForm(true)}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors text-white"
          >
            <Plus size={22} />
          </button>
        }
      />

      <PageContainer>
        {/* Formulário inline */}
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
                <p className="font-bold text-sm" style={{ color: "rgba(240,240,255,0.9)" }}>Nova consulta</p>
                <button onClick={() => setShowForm(false)}>
                  <X size={18} style={{ color: "rgba(240,240,255,0.5)" }} />
                </button>
              </div>
              <div className="flex flex-col gap-2">
                <Input label="Especialidade" placeholder="Ex: Cardiologia, Clínico Geral" value={form.especialidade}
                  onChange={(e) => setF("especialidade", e.target.value)} accentColor={COLOR} />
                <Input label="Médico" placeholder="Ex: Dr. Carlos" value={form.medico}
                  onChange={(e) => setF("medico", e.target.value)} accentColor={COLOR} />
                <Input label="Local / Clínica" value={form.local}
                  onChange={(e) => setF("local", e.target.value)} accentColor={COLOR} />
                <Input label="Data e hora" type="datetime-local" value={form.data_hora}
                  onChange={(e) => setF("data_hora", e.target.value)} accentColor={COLOR} />
                <div>
                  <label style={labelStyle}>Resultado / Observações</label>
                  <textarea style={{ ...inputStyle, minHeight: 60, resize: "vertical" }}
                    value={form.resultado} onChange={(e) => setF("resultado", e.target.value)} />
                </div>
                <Button icon={Save} loading={saving} onClick={handleSave} style={{ backgroundColor: COLOR }}>
                  Salvar consulta
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {loading && <div className="flex flex-col gap-3"><Skeleton variant="text" count={4} /></div>}

        {!loading && consultas.length === 0 && !showForm && (
          <EmptyState
            icon={Calendar}
            title="Nenhuma consulta"
            description="Registre consultas passadas e agende as próximas."
            actionLabel="Registrar consulta"
            onAction={() => setShowForm(true)}
            color={COLOR}
          />
        )}

        {!loading && consultas.length > 0 && (
          <>
            {/* Tabs */}
            <div className="flex gap-2 mb-4">
              {(["proximas", "historico"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className="flex-1 py-2 rounded-[10px] text-sm font-semibold transition-colors"
                  style={{
                    backgroundColor: tab === t ? COLOR : "rgba(255,255,255,0.07)",
                    color: tab === t ? "#fff" : "rgba(240,240,255,0.6)",
                  }}
                >
                  {t === "proximas" ? `Próximas (${proximas.length})` : `Histórico (${historico.length})`}
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-3">
              {listToShow.length === 0 && (
                <p className="text-sm text-center py-6" style={{ color: "rgba(240,240,255,0.4)" }}>
                  Nenhuma consulta nesta aba.
                </p>
              )}
              {listToShow.map((c) => (
                <ConsultaCard
                  key={c.id}
                  consulta={c}
                  isProxima={proximas.some((p) => p.id === c.id)}
                  onDelete={() => handleDelete(c.id)}
                />
              ))}
            </div>

            {!showForm && (
              <div className="mt-4">
                <Button fullWidth icon={Plus} onClick={() => setShowForm(true)} style={{ backgroundColor: COLOR }}>
                  Registrar consulta
                </Button>
              </div>
            )}
          </>
        )}
      </PageContainer>
    </>
  );
}
