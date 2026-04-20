"use client";

import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import type { FamiliaMembro } from "@/types/database";

type MembroFormValues = Omit<FamiliaMembro, "id" | "created_at" | "is_admin" | "user_id">;

interface MembroFormProps {
  initial?: Partial<MembroFormValues>;
  onSubmit: (values: MembroFormValues) => Promise<void>;
  loading?: boolean;
  submitLabel?: string;
}

const PARENTESCO_OPTIONS = [
  { value: "", label: "Selecione..." },
  { value: "pai", label: "Pai" },
  { value: "mae", label: "Mãe" },
  { value: "filho", label: "Filho" },
  { value: "filha", label: "Filha" },
  { value: "avo", label: "Avô" },
  { value: "avo_f", label: "Avó" },
  { value: "conjuge", label: "Cônjuge" },
  { value: "outro", label: "Outro" },
];

const EMPTY: MembroFormValues = {
  nome: "", apelido: null, parentesco: null,
  data_nascimento: null, cpf: null, rg: null,
  telefone: null, email: null,
};

export function MembroForm({ initial = {}, onSubmit, loading = false, submitLabel = "Salvar" }: MembroFormProps) {
  const [values, setValues] = useState<MembroFormValues>({ ...EMPTY, ...initial });
  const [errors, setErrors] = useState<Partial<Record<keyof MembroFormValues, string>>>({});

  function set(field: keyof MembroFormValues, value: string | null) {
    setValues((prev) => ({ ...prev, [field]: value || null }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function validate() {
    const errs: typeof errors = {};
    if (!values.nome.trim()) errs.nome = "Nome obrigatório";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit({ ...values, nome: values.nome.trim() });
  }

  function str(v: string | null | undefined) { return v ?? ""; }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 pb-8">
      <Input label="Nome completo *" placeholder="Nome completo" value={str(values.nome)}
        onChange={(e) => setValues((p) => ({ ...p, nome: e.target.value }))}
        error={errors.nome} />

      <Input label="Apelido" placeholder="Como prefere ser chamado" value={str(values.apelido)}
        onChange={(e) => set("apelido", e.target.value)} />

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-600 text-[#333333]">Parentesco</label>
        <select value={str(values.parentesco)} onChange={(e) => set("parentesco", e.target.value)}
          className="w-full min-h-[48px] rounded-[10px] border border-[#E0E0E0] px-4 text-base text-[#333333] bg-white outline-none focus:border-[#9C27B0] font-[inherit]">
          {PARENTESCO_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      <Input label="Data de nascimento" type="date" value={str(values.data_nascimento)}
        onChange={(e) => set("data_nascimento", e.target.value)} />

      <Input label="CPF" placeholder="000.000.000-00" value={str(values.cpf)}
        onChange={(e) => set("cpf", e.target.value)} />

      <Input label="RG" placeholder="00.000.000-0" value={str(values.rg)}
        onChange={(e) => set("rg", e.target.value)} />

      <Input label="Telefone" type="tel" placeholder="(11) 99999-9999" value={str(values.telefone)}
        onChange={(e) => set("telefone", e.target.value)} />

      <Input label="E-mail" type="email" placeholder="email@exemplo.com" value={str(values.email)}
        onChange={(e) => set("email", e.target.value)} />

      <Button type="submit" fullWidth loading={loading} size="lg"
        style={{ backgroundColor: "#9C27B0" }}>{submitLabel}</Button>
    </form>
  );
}
