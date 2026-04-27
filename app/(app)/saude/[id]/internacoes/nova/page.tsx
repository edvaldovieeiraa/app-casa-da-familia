"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ToastContainer } from "@/components/ui/Toast";
import { useInternacoes } from "@/hooks/useSaude";
import { useToast } from "@/hooks/useToast";

const COLOR = "#E53935";

export default function NovaInternacaoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { createInternacao } = useInternacoes(id);
  const { toasts, addToast, removeToast } = useToast();
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    hospital: "", quarto: "", data_entrada: new Date().toISOString().split("T")[0],
    data_alta: "", diagnostico: "", medico_responsavel: "", procedimentos: "", observacoes: "",
  });

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.data_entrada) {
      addToast("Data de entrada é obrigatória", "error");
      return;
    }
    setSaving(true);
    try {
      await createInternacao({
        paciente_id: id,
        hospital: form.hospital || null,
        quarto: form.quarto || null,
        data_entrada: form.data_entrada,
        data_alta: form.data_alta || null,
        diagnostico: form.diagnostico || null,
        medico_responsavel: form.medico_responsavel || null,
        procedimentos: form.procedimentos
          ? form.procedimentos.split(",").map((s) => s.trim()).filter(Boolean)
          : null,
        resumo_alta: null,
        anexo_url: null,
        observacoes: form.observacoes || null,
      });
      addToast("Internação registrada!", "success");
      setTimeout(() => router.push(`/saude/${id}/internacoes`), 800);
    } catch (err) {
      addToast(err instanceof Error ? err.message : "Erro ao salvar", "error");
      setSaving(false);
    }
  }

  const sectionStyle: React.CSSProperties = {
    background: "rgba(255,255,255,0.04)", borderRadius: 16, padding: 16, border: "1px solid rgba(255,255,255,0.08)",
  };
  const labelStyle: React.CSSProperties = {
    fontSize: 13, fontWeight: 600, color: "rgba(240,240,255,0.7)", marginBottom: 4, display: "block",
  };
  const textareaStyle: React.CSSProperties = {
    background: "rgba(255,255,255,0.07)", border: "1.5px solid rgba(255,255,255,0.12)",
    borderRadius: 14, color: "#F0F0FF", fontSize: 15, padding: "14px 16px",
    width: "100%", outline: "none", resize: "vertical" as const, minHeight: 80,
  };

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <Header title="Nova Internação" color={COLOR} showBack />
      <PageContainer>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div style={sectionStyle} className="flex flex-col gap-3">
            <p style={{ fontSize: 12, fontWeight: 700, color: COLOR, letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Hospital
            </p>
            <Input label="Hospital / Clínica" placeholder="Ex: Hospital das Clínicas" value={form.hospital}
              onChange={(e) => set("hospital", e.target.value)} accentColor={COLOR} />
            <Input label="Quarto / Leito" placeholder="Ex: 302-A" value={form.quarto}
              onChange={(e) => set("quarto", e.target.value)} accentColor={COLOR} />
            <Input label="Médico responsável" placeholder="Ex: Dr. Silva" value={form.medico_responsavel}
              onChange={(e) => set("medico_responsavel", e.target.value)} accentColor={COLOR} />
          </div>

          <div style={sectionStyle} className="flex flex-col gap-3">
            <p style={{ fontSize: 12, fontWeight: 700, color: COLOR, letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Período
            </p>
            <Input label="Data de entrada *" type="date" value={form.data_entrada}
              onChange={(e) => set("data_entrada", e.target.value)} accentColor={COLOR} />
            <Input label="Data de alta (se já tiver)" type="date" value={form.data_alta}
              onChange={(e) => set("data_alta", e.target.value)} accentColor={COLOR} />
          </div>

          <div style={sectionStyle} className="flex flex-col gap-3">
            <p style={{ fontSize: 12, fontWeight: 700, color: COLOR, letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Diagnóstico
            </p>
            <div>
              <label style={labelStyle}>Diagnóstico</label>
              <textarea style={textareaStyle} value={form.diagnostico}
                onChange={(e) => set("diagnostico", e.target.value)}
                placeholder="Infarto, Pneumonia, Cirurgia..." />
            </div>
            <Input
              label="Procedimentos realizados (separados por vírgula)"
              placeholder="Ex: Cateterismo, Biopsia"
              value={form.procedimentos}
              onChange={(e) => set("procedimentos", e.target.value)}
              accentColor={COLOR}
            />
          </div>

          <div style={sectionStyle}>
            <label style={labelStyle}>Observações</label>
            <textarea style={textareaStyle} value={form.observacoes}
              onChange={(e) => set("observacoes", e.target.value)} />
          </div>

          <Button type="submit" fullWidth loading={saving} style={{ backgroundColor: COLOR }}>
            Registrar internação
          </Button>
        </form>
      </PageContainer>
    </>
  );
}
