"use client";

import { use, useState } from "react";
import { Activity, Plus, X, Save } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Header } from "@/components/layout/Header";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ToastContainer } from "@/components/ui/Toast";
import { usePaciente, useSinaisVitais } from "@/hooks/useSaude";
import { useToast } from "@/hooks/useToast";
import type { SaudeSinaisVitais } from "@/types/database";

const COLOR = "#4CAF50";

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR") + " " + d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function SinalCard({ sinal, index }: { sinal: SaudeSinaisVitais; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, type: "spring", damping: 22 }}
      className="bg-white rounded-[16px] border border-[#E0E0E0] p-4"
    >
      <p className="text-xs text-[#999] mb-2">{formatDateTime(sinal.data_hora)}</p>
      <div className="grid grid-cols-3 gap-2">
        {sinal.pressao_sistolica && sinal.pressao_diastolica && (
          <div className="text-center p-2 rounded-[10px] bg-[#F8F9FA]">
            <p className="text-[10px] font-semibold text-[#999]">PRESSÃO</p>
            <p className="text-sm font-bold text-[#333]">{sinal.pressao_sistolica}/{sinal.pressao_diastolica}</p>
          </div>
        )}
        {sinal.frequencia_cardiaca && (
          <div className="text-center p-2 rounded-[10px] bg-[#F8F9FA]">
            <p className="text-[10px] font-semibold text-[#999]">BPM</p>
            <p className="text-sm font-bold text-[#333]">{sinal.frequencia_cardiaca}</p>
          </div>
        )}
        {sinal.glicemia && (
          <div className="text-center p-2 rounded-[10px] bg-[#F8F9FA]">
            <p className="text-[10px] font-semibold text-[#999]">GLICEMIA</p>
            <p className="text-sm font-bold text-[#333]">{sinal.glicemia}</p>
          </div>
        )}
        {sinal.saturacao_o2 && (
          <div className="text-center p-2 rounded-[10px] bg-[#F8F9FA]">
            <p className="text-[10px] font-semibold text-[#999]">SpO2</p>
            <p className="text-sm font-bold text-[#333]">{sinal.saturacao_o2}%</p>
          </div>
        )}
        {sinal.temperatura && (
          <div className="text-center p-2 rounded-[10px] bg-[#F8F9FA]">
            <p className="text-[10px] font-semibold text-[#999]">TEMP.</p>
            <p className="text-sm font-bold text-[#333]">{sinal.temperatura}°C</p>
          </div>
        )}
        {sinal.peso_kg && (
          <div className="text-center p-2 rounded-[10px] bg-[#F8F9FA]">
            <p className="text-[10px] font-semibold text-[#999]">PESO</p>
            <p className="text-sm font-bold text-[#333]">{sinal.peso_kg} kg</p>
          </div>
        )}
      </div>
      {sinal.observacao && (
        <p className="text-xs text-[#666] mt-2">{sinal.observacao}</p>
      )}
    </motion.div>
  );
}

export default function SinaisVitaisPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { toasts, addToast, removeToast } = useToast();
  const { paciente } = usePaciente(id);
  const { sinais, loading, registrar } = useSinaisVitais(id);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    pressao_sistolica: "", pressao_diastolica: "", frequencia_cardiaca: "",
    glicemia: "", saturacao_o2: "", peso_kg: "", temperatura: "",
    data_hora: new Date().toISOString().slice(0, 16), observacao: "",
  });

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      await registrar({
        paciente_id: id,
        data_hora: form.data_hora ? new Date(form.data_hora).toISOString() : new Date().toISOString(),
        pressao_sistolica: form.pressao_sistolica ? parseInt(form.pressao_sistolica) : null,
        pressao_diastolica: form.pressao_diastolica ? parseInt(form.pressao_diastolica) : null,
        frequencia_cardiaca: form.frequencia_cardiaca ? parseInt(form.frequencia_cardiaca) : null,
        glicemia: form.glicemia ? parseFloat(form.glicemia) : null,
        saturacao_o2: form.saturacao_o2 ? parseFloat(form.saturacao_o2) : null,
        peso_kg: form.peso_kg ? parseFloat(form.peso_kg) : null,
        temperatura: form.temperatura ? parseFloat(form.temperatura) : null,
        observacao: form.observacao || null,
      });
      addToast("Sinais registrados!", "success");
      setShowForm(false);
      setForm({
        pressao_sistolica: "", pressao_diastolica: "", frequencia_cardiaca: "",
        glicemia: "", saturacao_o2: "", peso_kg: "", temperatura: "",
        data_hora: new Date().toISOString().slice(0, 16), observacao: "",
      });
    } catch (err) {
      addToast(err instanceof Error ? err.message : "Erro ao registrar", "error");
    } finally {
      setSaving(false);
    }
  }

  const nome = paciente?.apelido ?? paciente?.nome ?? "Paciente";

  const inputStyle: React.CSSProperties = {
    background: "rgba(255,255,255,0.07)", border: "1.5px solid rgba(255,255,255,0.12)",
    borderRadius: 12, color: "#F0F0FF", fontSize: 15, padding: "10px 12px", width: "100%", outline: "none",
  };

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <Header
        title={`Sinais Vitais · ${nome}`}
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
                <p className="font-bold text-sm" style={{ color: "rgba(240,240,255,0.9)" }}>Registrar sinais</p>
                <button onClick={() => setShowForm(false)}>
                  <X size={18} style={{ color: "rgba(240,240,255,0.5)" }} />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <div>
                  <p className="text-[11px] font-semibold mb-1" style={{ color: "rgba(240,240,255,0.6)" }}>SISTÓLICA</p>
                  <input style={inputStyle} type="number" placeholder="Ex: 120" value={form.pressao_sistolica}
                    onChange={(e) => set("pressao_sistolica", e.target.value)} />
                </div>
                <div>
                  <p className="text-[11px] font-semibold mb-1" style={{ color: "rgba(240,240,255,0.6)" }}>DIASTÓLICA</p>
                  <input style={inputStyle} type="number" placeholder="Ex: 80" value={form.pressao_diastolica}
                    onChange={(e) => set("pressao_diastolica", e.target.value)} />
                </div>
                <div>
                  <p className="text-[11px] font-semibold mb-1" style={{ color: "rgba(240,240,255,0.6)" }}>BPM</p>
                  <input style={inputStyle} type="number" placeholder="Ex: 72" value={form.frequencia_cardiaca}
                    onChange={(e) => set("frequencia_cardiaca", e.target.value)} />
                </div>
                <div>
                  <p className="text-[11px] font-semibold mb-1" style={{ color: "rgba(240,240,255,0.6)" }}>GLICEMIA</p>
                  <input style={inputStyle} type="number" placeholder="Ex: 100" value={form.glicemia}
                    onChange={(e) => set("glicemia", e.target.value)} />
                </div>
                <div>
                  <p className="text-[11px] font-semibold mb-1" style={{ color: "rgba(240,240,255,0.6)" }}>SpO2 (%)</p>
                  <input style={inputStyle} type="number" placeholder="Ex: 98" value={form.saturacao_o2}
                    onChange={(e) => set("saturacao_o2", e.target.value)} />
                </div>
                <div>
                  <p className="text-[11px] font-semibold mb-1" style={{ color: "rgba(240,240,255,0.6)" }}>TEMP. (°C)</p>
                  <input style={inputStyle} type="number" placeholder="Ex: 36.5" step="0.1" value={form.temperatura}
                    onChange={(e) => set("temperatura", e.target.value)} />
                </div>
                <div>
                  <p className="text-[11px] font-semibold mb-1" style={{ color: "rgba(240,240,255,0.6)" }}>PESO (kg)</p>
                  <input style={inputStyle} type="number" placeholder="Ex: 70" value={form.peso_kg}
                    onChange={(e) => set("peso_kg", e.target.value)} />
                </div>
                <div>
                  <p className="text-[11px] font-semibold mb-1" style={{ color: "rgba(240,240,255,0.6)" }}>DATA/HORA</p>
                  <input style={inputStyle} type="datetime-local" value={form.data_hora}
                    onChange={(e) => set("data_hora", e.target.value)} />
                </div>
              </div>
              <input style={{ ...inputStyle, marginBottom: 12 }} placeholder="Observação (opcional)"
                value={form.observacao} onChange={(e) => set("observacao", e.target.value)} />
              <Button icon={Save} fullWidth loading={saving} onClick={handleSave} style={{ backgroundColor: COLOR }}>
                Registrar
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {loading && <div className="flex flex-col gap-3"><Skeleton variant="text" count={4} /></div>}

        {!loading && sinais.length === 0 && !showForm && (
          <EmptyState
            icon={Activity}
            title="Nenhum sinal registrado"
            description="Registre pressão, glicemia, batimentos e outros sinais vitais."
            actionLabel="Registrar sinais"
            onAction={() => setShowForm(true)}
            color={COLOR}
          />
        )}

        {!loading && sinais.length > 0 && (
          <div className="flex flex-col gap-3">
            {sinais.map((s, i) => (
              <SinalCard key={s.id} sinal={s} index={i} />
            ))}
            {!showForm && (
              <Button fullWidth icon={Plus} onClick={() => setShowForm(true)} style={{ backgroundColor: COLOR }}>
                Registrar sinais
              </Button>
            )}
          </div>
        )}
      </PageContainer>
    </>
  );
}
