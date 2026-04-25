"use client";

import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import type { Conta, ContaTipo, FrequenciaConta, ContaStatus, Imovel } from "@/types/database";

type ContaFormValues = Omit<Conta, "id" | "created_at" | "updated_at">;

interface ContaFormProps {
  initial?: Partial<ContaFormValues>;
  imoveis: Pick<Imovel, "id" | "nome" | "apelido">[];
  onSubmit: (values: ContaFormValues) => Promise<void>;
  loading?: boolean;
  submitLabel?: string;
}

const TIPOS: { value: ContaTipo; label: string }[] = [
  { value: "luz", label: "Luz" }, { value: "agua", label: "Água" },
  { value: "gas", label: "Gás" }, { value: "internet", label: "Internet" },
  { value: "iptu", label: "IPTU" }, { value: "condominio", label: "Condomínio" },
  { value: "seguro", label: "Seguro" }, { value: "outro", label: "Outro" },
];

const FREQUENCIAS: { value: FrequenciaConta; label: string }[] = [
  { value: "mensal", label: "Mensal" }, { value: "bimestral", label: "Bimestral" },
  { value: "trimestral", label: "Trimestral" }, { value: "semestral", label: "Semestral" },
  { value: "anual", label: "Anual" },
];

const EMPTY: ContaFormValues = {
  descricao: "", tipo: null, imovel_id: null,
  valor: null, valor_pago: null,
  data_vencimento: "", data_pagamento: null,
  recorrente: false, frequencia: null,
  codigo_barras: null, linha_digitavel: null, pix_copia_cola: null,
  foto_boleto_url: null, comprovante_url: null,
  status: "pendente" as ContaStatus, observacoes: null,
};

export function ContaForm({ initial = {}, imoveis, onSubmit, loading = false, submitLabel = "Salvar" }: ContaFormProps) {
  const [values, setValues] = useState<ContaFormValues>({ ...EMPTY, ...initial });
  const [errors, setErrors] = useState<Partial<Record<keyof ContaFormValues, string>>>({});

  function set(field: keyof ContaFormValues, value: string | boolean | number | null) {
    setValues((prev) => ({ ...prev, [field]: value === "" ? null : value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function isValidDate(value: string | null) {
    if (!value) return false;
    const d = new Date(value);
    return !isNaN(d.getTime()) && value === d.toISOString().slice(0, 10);
  }

  function validate() {
    const errs: typeof errors = {};
    if (!values.descricao?.trim()) errs.descricao = "Descrição obrigatória";
    if (!values.data_vencimento) errs.data_vencimento = "Data de vencimento obrigatória";
    else if (!isValidDate(values.data_vencimento)) errs.data_vencimento = "Data inválida";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit(values);
  }

  function str(v: string | number | null | undefined) { return v != null ? String(v) : ""; }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 pb-8">
      <Input label="Descrição *" placeholder="Ex: Conta de luz - Janeiro"
        value={str(values.descricao)}
        onChange={(e) => setValues((p) => ({ ...p, descricao: e.target.value }))}
        error={errors.descricao} />

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-600 text-[#333333]">Tipo</label>
        <select value={str(values.tipo)} onChange={(e) => set("tipo", e.target.value as ContaTipo || null)}
          className="w-full min-h-[48px] rounded-[10px] border border-[#E0E0E0] px-4 text-base text-[#333333] bg-white outline-none focus:border-[#333333] font-[inherit]">
          <option value="">Selecionar...</option>
          {TIPOS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
      </div>

      <Input label="Valor (R$)" type="number" placeholder="0,00" inputMode="decimal"
        value={str(values.valor)} onChange={(e) => set("valor", e.target.value ? Number(e.target.value) : null)} />

      <Input label="Data de vencimento *" type="date" value={str(values.data_vencimento)}
        onChange={(e) => setValues((p) => ({ ...p, data_vencimento: e.target.value }))}
        error={errors.data_vencimento} />

      {imoveis.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-600 text-[#333333]">Imóvel relacionado</label>
          <select value={str(values.imovel_id)} onChange={(e) => set("imovel_id", e.target.value || null)}
            className="w-full min-h-[48px] rounded-[10px] border border-[#E0E0E0] px-4 text-base text-[#333333] bg-white outline-none focus:border-[#333333] font-[inherit]">
            <option value="">Nenhum</option>
            {imoveis.map((im) => <option key={im.id} value={im.id}>{im.apelido ?? im.nome}</option>)}
          </select>
        </div>
      )}

      <div className="flex items-center gap-3 py-1">
        <button type="button"
          onClick={() => set("recorrente", !values.recorrente)}
          className={`w-12 h-6 rounded-full transition-colors flex items-center ${values.recorrente ? "bg-[#E53935] justify-end" : "bg-[#E0E0E0] justify-start"}`}>
          <span className="w-5 h-5 rounded-full bg-white shadow mx-0.5 block" />
        </button>
        <span className="text-sm font-600 text-[#333333]">Conta recorrente</span>
      </div>

      {values.recorrente && (
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-600 text-[#333333]">Frequência</label>
          <select value={str(values.frequencia)} onChange={(e) => set("frequencia", e.target.value as FrequenciaConta || null)}
            className="w-full min-h-[48px] rounded-[10px] border border-[#E0E0E0] px-4 text-base text-[#333333] bg-white outline-none focus:border-[#333333] font-[inherit]">
            <option value="">Selecionar...</option>
            {FREQUENCIAS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
          </select>
        </div>
      )}

      <Input label="Código de barras" placeholder="00000.00000..."
        value={str(values.codigo_barras)} onChange={(e) => set("codigo_barras", e.target.value)} />
      <Input label="PIX copia e cola" placeholder="00020126..."
        value={str(values.pix_copia_cola)} onChange={(e) => set("pix_copia_cola", e.target.value)} />

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-600 text-[#333333]">Observações</label>
        <textarea value={str(values.observacoes)} onChange={(e) => set("observacoes", e.target.value)}
          rows={3} placeholder="Anotações..."
          className="w-full rounded-[10px] border border-[#E0E0E0] px-4 py-3 text-base text-[#333333] font-[inherit] bg-white outline-none resize-none focus:border-[#333333] placeholder:text-[#999999]" />
      </div>

      <Button type="submit" fullWidth loading={loading} size="lg"
        style={{ background: "linear-gradient(135deg,#E53935,#F5C842)", color: "#fff" }}>
        {submitLabel}
      </Button>
    </form>
  );
}
