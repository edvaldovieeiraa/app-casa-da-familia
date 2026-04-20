"use client";

import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import type { Feira, DiaSemana, FrequenciaFeira } from "@/types/database";

type FeiraFormValues = Omit<Feira, "id" | "created_at" | "updated_at">;

interface FeiraFormProps {
  initial?: Partial<FeiraFormValues>;
  onSubmit: (values: FeiraFormValues) => Promise<void>;
  loading?: boolean;
  submitLabel?: string;
}

const DIAS_SEMANA = ["Domingo","Segunda","Terça","Quarta","Quinta","Sexta","Sábado"];
const FREQUENCIAS: { value: FrequenciaFeira; label: string }[] = [
  { value: "semanal", label: "Semanal" },
  { value: "quinzenal", label: "Quinzenal" },
  { value: "mensal", label: "Mensal" },
];
const TIPOS = ["Feira livre","Supermercado","Açougue","Hortifruti","Padaria","Outro"];

const EMPTY: FeiraFormValues = {
  nome: "", tipo: "Feira livre", dia_semana: null,
  frequencia: "semanal", horario_preferido: null,
  local: null, ativo: true, lembrete_ativo: true, observacoes: null,
};

export function FeiraForm({ initial = {}, onSubmit, loading = false, submitLabel = "Salvar" }: FeiraFormProps) {
  const [values, setValues] = useState<FeiraFormValues>({ ...EMPTY, ...initial });
  const [errors, setErrors] = useState<Partial<Record<keyof FeiraFormValues, string>>>({});

  function set(field: keyof FeiraFormValues, value: string | number | boolean | null) {
    setValues((prev) => ({ ...prev, [field]: value === "" ? null : value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function validate() {
    const errs: typeof errors = {};
    if (!values.nome?.trim()) errs.nome = "Nome obrigatório";
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
      <Input label="Nome *" placeholder="Ex: Feira do Bairro"
        value={str(values.nome)}
        onChange={(e) => setValues((p) => ({ ...p, nome: e.target.value }))}
        error={errors.nome} />

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-600 text-[#333333]">Tipo</label>
        <select value={str(values.tipo)} onChange={(e) => set("tipo", e.target.value)}
          className="w-full min-h-[48px] rounded-[10px] border border-[#E0E0E0] px-4 text-base text-[#333333] bg-white outline-none focus:border-[#333333] font-[inherit]">
          {TIPOS.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-600 text-[#333333]">Dia da semana</label>
        <select value={values.dia_semana != null ? String(values.dia_semana) : ""}
          onChange={(e) => set("dia_semana", e.target.value !== "" ? Number(e.target.value) as DiaSemana : null)}
          className="w-full min-h-[48px] rounded-[10px] border border-[#E0E0E0] px-4 text-base text-[#333333] bg-white outline-none focus:border-[#333333] font-[inherit]">
          <option value="">Sem dia fixo</option>
          {DIAS_SEMANA.map((d, i) => <option key={i} value={i}>{d}</option>)}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-600 text-[#333333]">Frequência</label>
        <select value={str(values.frequencia)}
          onChange={(e) => set("frequencia", e.target.value as FrequenciaFeira)}
          className="w-full min-h-[48px] rounded-[10px] border border-[#E0E0E0] px-4 text-base text-[#333333] bg-white outline-none focus:border-[#333333] font-[inherit]">
          {FREQUENCIAS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
        </select>
      </div>

      <Input label="Local" placeholder="Endereço ou nome do local"
        value={str(values.local)} onChange={(e) => set("local", e.target.value)} />
      <Input label="Horário preferido" placeholder="Ex: 07:00 - 12:00"
        value={str(values.horario_preferido)} onChange={(e) => set("horario_preferido", e.target.value)} />

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-600 text-[#333333]">Observações</label>
        <textarea value={str(values.observacoes)} onChange={(e) => set("observacoes", e.target.value)}
          rows={3} placeholder="Anotações..."
          className="w-full rounded-[10px] border border-[#E0E0E0] px-4 py-3 text-base text-[#333333] font-[inherit] bg-white outline-none resize-none focus:border-[#333333] placeholder:text-[#999999]" />
      </div>

      <Button type="submit" fullWidth loading={loading} size="lg"
        style={{ backgroundColor: "#2196F3" }}>{submitLabel}</Button>
    </form>
  );
}
