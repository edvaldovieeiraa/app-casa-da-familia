"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ToastContainer } from "@/components/ui/Toast";
import { useMedicamentos } from "@/hooks/useSaude";
import { useToast } from "@/hooks/useToast";

const COLOR = "#9C27B0";

const FREQUENCIAS = [
  "1x ao dia", "2x ao dia", "3x ao dia", "4x ao dia",
  "A cada 8h", "A cada 6h", "A cada 12h",
  "Em dias alternados", "1x por semana", "Conforme necessário",
];

export default function NovoMedicamentoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { createMedicamento } = useMedicamentos(id);
  const { toasts, addToast, removeToast } = useToast();
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    nome: "",
    principio_ativo: "",
    dose: "",
    unidade: "",
    frequencia: "",
    horarios: "",
    estoque_atual: "",
    estoque_minimo: "",
    data_inicio: "",
    data_fim: "",
    medico_prescreveu: "",
    uso_continuo: false,
    observacoes: "",
  });

  function set(field: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nome.trim()) {
      addToast("Nome do medicamento é obrigatório", "error");
      return;
    }
    setSaving(true);
    try {
      const horarios = form.horarios
        ? form.horarios.split(",").map((s) => s.trim()).filter(Boolean)
        : null;

      await createMedicamento({
        paciente_id: id,
        nome: form.nome.trim(),
        principio_ativo: form.principio_ativo.trim() || null,
        dose: form.dose.trim() || null,
        unidade: form.unidade.trim() || null,
        frequencia: form.frequencia || null,
        horarios,
        estoque_atual: form.estoque_atual ? parseFloat(form.estoque_atual) : null,
        estoque_minimo: form.estoque_minimo ? parseFloat(form.estoque_minimo) : null,
        data_inicio: form.data_inicio || null,
        data_fim: form.data_fim || null,
        medico_prescreveu: form.medico_prescreveu.trim() || null,
        uso_continuo: form.uso_continuo,
        ativo: true,
        observacoes: form.observacoes.trim() || null,
      });
      addToast("Medicamento cadastrado!", "success");
      setTimeout(() => router.push(`/saude/${id}/medicamentos`), 800);
    } catch (err) {
      addToast(err instanceof Error ? err.message : "Erro ao salvar", "error");
      setSaving(false);
    }
  }

  const labelStyle: React.CSSProperties = {
    fontSize: 13, fontWeight: 600, color: "rgba(240,240,255,0.7)", marginBottom: 4, display: "block",
  };
  const selectStyle: React.CSSProperties = {
    background: "rgba(255,255,255,0.07)", border: "1.5px solid rgba(255,255,255,0.12)",
    borderRadius: 14, color: "#F0F0FF", fontSize: 16, minHeight: 52,
    padding: "14px 16px", width: "100%", outline: "none",
  };
  const sectionStyle: React.CSSProperties = {
    background: "rgba(255,255,255,0.04)", borderRadius: 16, padding: 16, border: "1px solid rgba(255,255,255,0.08)",
  };
  const textareaStyle: React.CSSProperties = {
    background: "rgba(255,255,255,0.07)", border: "1.5px solid rgba(255,255,255,0.12)",
    borderRadius: 14, color: "#F0F0FF", fontSize: 15, padding: "14px 16px",
    width: "100%", outline: "none", resize: "vertical" as const, minHeight: 80,
  };

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <Header title="Novo Medicamento" color={COLOR} showBack />
      <PageContainer>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Identificação */}
          <div style={sectionStyle} className="flex flex-col gap-3">
            <p style={{ fontSize: 12, fontWeight: 700, color: COLOR, letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Identificação
            </p>
            <Input label="Nome do medicamento *" placeholder="Ex: Metformina" value={form.nome}
              onChange={(e) => set("nome", e.target.value)} accentColor={COLOR} />
            <Input label="Princípio ativo" placeholder="Ex: Metformina HCl" value={form.principio_ativo}
              onChange={(e) => set("principio_ativo", e.target.value)} accentColor={COLOR} />
            <Input label="Médico que prescreveu" placeholder="Ex: Dr. Carlos" value={form.medico_prescreveu}
              onChange={(e) => set("medico_prescreveu", e.target.value)} accentColor={COLOR} />
          </div>

          {/* Dosagem */}
          <div style={sectionStyle} className="flex flex-col gap-3">
            <p style={{ fontSize: 12, fontWeight: 700, color: COLOR, letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Dosagem e horários
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Dose" placeholder="Ex: 500" value={form.dose}
                onChange={(e) => set("dose", e.target.value)} accentColor={COLOR} />
              <Input label="Unidade" placeholder="Ex: mg, ml, cp" value={form.unidade}
                onChange={(e) => set("unidade", e.target.value)} accentColor={COLOR} />
            </div>
            <div>
              <label style={labelStyle}>Frequência</label>
              <select style={selectStyle} value={form.frequencia} onChange={(e) => set("frequencia", e.target.value)}>
                <option value="">Selecione...</option>
                {FREQUENCIAS.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <Input
              label="Horários (separados por vírgula)"
              placeholder="Ex: 07:00, 19:00"
              value={form.horarios}
              onChange={(e) => set("horarios", e.target.value)}
              accentColor={COLOR}
            />
            <label className="flex items-center gap-3 cursor-pointer">
              <div
                onClick={() => set("uso_continuo", !form.uso_continuo)}
                className="w-11 h-6 rounded-full transition-colors flex items-center px-0.5"
                style={{ backgroundColor: form.uso_continuo ? COLOR : "rgba(255,255,255,0.15)" }}
              >
                <div
                  className="w-5 h-5 rounded-full bg-white transition-transform"
                  style={{ transform: form.uso_continuo ? "translateX(20px)" : "translateX(0)" }}
                />
              </div>
              <span style={{ fontSize: 14, color: "rgba(240,240,255,0.8)" }}>Uso contínuo</span>
            </label>
          </div>

          {/* Estoque */}
          <div style={sectionStyle} className="flex flex-col gap-3">
            <p style={{ fontSize: 12, fontWeight: 700, color: COLOR, letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Estoque
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Estoque atual" type="number" placeholder="Ex: 30" value={form.estoque_atual}
                onChange={(e) => set("estoque_atual", e.target.value)} accentColor={COLOR} />
              <Input label="Estoque mínimo" type="number" placeholder="Ex: 5" value={form.estoque_minimo}
                onChange={(e) => set("estoque_minimo", e.target.value)} accentColor={COLOR}
                hint="Alerta quando chegar neste valor" />
            </div>
          </div>

          {/* Período */}
          <div style={sectionStyle} className="flex flex-col gap-3">
            <p style={{ fontSize: 12, fontWeight: 700, color: COLOR, letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Período de uso
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Data de início" type="date" value={form.data_inicio}
                onChange={(e) => set("data_inicio", e.target.value)} accentColor={COLOR} />
              <Input label="Data de fim" type="date" value={form.data_fim}
                onChange={(e) => set("data_fim", e.target.value)} accentColor={COLOR} />
            </div>
          </div>

          {/* Obs */}
          <div style={sectionStyle}>
            <label style={labelStyle}>Observações</label>
            <textarea style={textareaStyle} value={form.observacoes}
              onChange={(e) => set("observacoes", e.target.value)}
              placeholder="Tomar com água, antes das refeições..." />
          </div>

          <Button type="submit" fullWidth loading={saving} style={{ backgroundColor: COLOR }}>
            Cadastrar medicamento
          </Button>
        </form>
      </PageContainer>
    </>
  );
}
