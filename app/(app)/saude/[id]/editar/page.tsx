"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import { ToastContainer } from "@/components/ui/Toast";
import { usePaciente } from "@/hooks/useSaude";
import { useToast } from "@/hooks/useToast";

const COLOR = "#E91E63";
const TIPOS_SANGUINEOS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function EditarPacientePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { paciente, loading, update } = usePaciente(id);
  const { toasts, addToast, removeToast } = useToast();
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    nome: "",
    apelido: "",
    data_nascimento: "",
    tipo_sanguineo: "",
    peso_kg: "",
    altura_cm: "",
    plano_saude: "",
    numero_carteirinha: "",
    condicoes_cronicas: "",
    alergias: "",
    observacoes: "",
  });

  useEffect(() => {
    if (!paciente) return;
    setForm({
      nome: paciente.nome ?? "",
      apelido: paciente.apelido ?? "",
      data_nascimento: paciente.data_nascimento ?? "",
      tipo_sanguineo: paciente.tipo_sanguineo ?? "",
      peso_kg: paciente.peso_kg?.toString() ?? "",
      altura_cm: paciente.altura_cm?.toString() ?? "",
      plano_saude: paciente.plano_saude ?? "",
      numero_carteirinha: paciente.numero_carteirinha ?? "",
      condicoes_cronicas: paciente.condicoes_cronicas?.join(", ") ?? "",
      alergias: paciente.alergias?.join(", ") ?? "",
      observacoes: paciente.observacoes ?? "",
    });
  }, [paciente]);

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nome.trim()) {
      addToast("Nome é obrigatório", "error");
      return;
    }
    setSaving(true);
    try {
      await update({
        nome: form.nome.trim(),
        apelido: form.apelido.trim() || null,
        data_nascimento: form.data_nascimento || null,
        tipo_sanguineo: form.tipo_sanguineo || null,
        peso_kg: form.peso_kg ? parseFloat(form.peso_kg) : null,
        altura_cm: form.altura_cm ? parseFloat(form.altura_cm) : null,
        plano_saude: form.plano_saude.trim() || null,
        numero_carteirinha: form.numero_carteirinha.trim() || null,
        condicoes_cronicas: form.condicoes_cronicas
          ? form.condicoes_cronicas.split(",").map((s) => s.trim()).filter(Boolean)
          : null,
        alergias: form.alergias
          ? form.alergias.split(",").map((s) => s.trim()).filter(Boolean)
          : null,
        observacoes: form.observacoes.trim() || null,
      });
      addToast("Dados salvos!", "success");
      setTimeout(() => router.push(`/saude/${id}`), 800);
    } catch (err) {
      addToast(err instanceof Error ? err.message : "Erro ao salvar", "error");
      setSaving(false);
    }
  }

  const labelStyle: React.CSSProperties = {
    fontSize: 13,
    fontWeight: 600,
    color: "rgba(240,240,255,0.7)",
    marginBottom: 4,
    display: "block",
  };

  const selectStyle: React.CSSProperties = {
    background: "rgba(255,255,255,0.07)",
    border: "1.5px solid rgba(255,255,255,0.12)",
    borderRadius: 14,
    color: "#F0F0FF",
    fontSize: 16,
    minHeight: 52,
    padding: "14px 16px",
    width: "100%",
    outline: "none",
  };

  const textareaStyle: React.CSSProperties = {
    background: "rgba(255,255,255,0.07)",
    border: "1.5px solid rgba(255,255,255,0.12)",
    borderRadius: 14,
    color: "#F0F0FF",
    fontSize: 15,
    padding: "14px 16px",
    width: "100%",
    outline: "none",
    resize: "vertical",
    minHeight: 80,
  };

  const sectionStyle: React.CSSProperties = {
    background: "rgba(255,255,255,0.04)",
    borderRadius: 16,
    padding: 16,
    border: "1px solid rgba(255,255,255,0.08)",
  };

  if (loading) {
    return (
      <>
        <Header title="Editar paciente" color={COLOR} showBack />
        <PageContainer>
          <div className="flex flex-col gap-3"><Skeleton variant="text" count={6} /></div>
        </PageContainer>
      </>
    );
  }

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <Header title="Editar paciente" color={COLOR} showBack />
      <PageContainer>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div style={sectionStyle} className="flex flex-col gap-3">
            <p style={{ fontSize: 12, fontWeight: 700, color: COLOR, letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Dados básicos
            </p>
            <Input label="Nome completo *" value={form.nome} onChange={(e) => set("nome", e.target.value)} accentColor={COLOR} />
            <Input label="Apelido" value={form.apelido} onChange={(e) => set("apelido", e.target.value)} accentColor={COLOR} />
            <Input label="Data de nascimento" type="date" value={form.data_nascimento} onChange={(e) => set("data_nascimento", e.target.value)} accentColor={COLOR} />
          </div>

          <div style={sectionStyle} className="flex flex-col gap-3">
            <p style={{ fontSize: 12, fontWeight: 700, color: COLOR, letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Dados médicos
            </p>
            <div>
              <label style={labelStyle}>Tipo sanguíneo</label>
              <select style={selectStyle} value={form.tipo_sanguineo} onChange={(e) => set("tipo_sanguineo", e.target.value)}>
                <option value="">Não informado</option>
                {TIPOS_SANGUINEOS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Peso (kg)" type="number" value={form.peso_kg} onChange={(e) => set("peso_kg", e.target.value)} accentColor={COLOR} />
              <Input label="Altura (cm)" type="number" value={form.altura_cm} onChange={(e) => set("altura_cm", e.target.value)} accentColor={COLOR} />
            </div>
            <div>
              <label style={labelStyle}>Condições crônicas (separadas por vírgula)</label>
              <textarea style={textareaStyle} value={form.condicoes_cronicas} onChange={(e) => set("condicoes_cronicas", e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>Alergias (separadas por vírgula)</label>
              <textarea style={textareaStyle} value={form.alergias} onChange={(e) => set("alergias", e.target.value)} />
            </div>
          </div>

          <div style={sectionStyle} className="flex flex-col gap-3">
            <p style={{ fontSize: 12, fontWeight: 700, color: COLOR, letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Plano de saúde
            </p>
            <Input label="Nome do plano" value={form.plano_saude} onChange={(e) => set("plano_saude", e.target.value)} accentColor={COLOR} />
            <Input label="Número da carteirinha" value={form.numero_carteirinha} onChange={(e) => set("numero_carteirinha", e.target.value)} accentColor={COLOR} />
          </div>

          <div style={sectionStyle}>
            <label style={labelStyle}>Observações gerais</label>
            <textarea style={textareaStyle} value={form.observacoes} onChange={(e) => set("observacoes", e.target.value)} />
          </div>

          <Button type="submit" fullWidth loading={saving} style={{ backgroundColor: COLOR }}>
            Salvar alterações
          </Button>
        </form>
      </PageContainer>
    </>
  );
}
