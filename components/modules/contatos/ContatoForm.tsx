"use client";

import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import type { Contato, Imovel } from "@/types/database";

type ContatoFormValues = Omit<Contato, "id" | "created_at" | "updated_at">;

interface ContatoFormProps {
  initial?: Partial<ContatoFormValues>;
  imoveis: Pick<Imovel, "id" | "nome" | "apelido">[];
  onSubmit: (values: ContatoFormValues) => Promise<void>;
  loading?: boolean;
  submitLabel?: string;
}

const CATEGORIAS = [
  { value: "medico", label: "Médico" },
  { value: "advogado", label: "Advogado" },
  { value: "prestador", label: "Prestador de serviço" },
  { value: "vizinho", label: "Vizinho" },
  { value: "familiar", label: "Familiar" },
  { value: "amigo", label: "Amigo" },
  { value: "comercio", label: "Comércio" },
  { value: "outro", label: "Outro" },
];

const EMPTY: ContatoFormValues = {
  nome: "", categoria: "outro",
  empresa: null, telefone_principal: null, telefone_secundario: null,
  whatsapp: null, email: null, endereco: null, relacionamento: null,
  imovel_id: null, favorito: false, observacoes: null,
};

export function ContatoForm({ initial = {}, imoveis, onSubmit, loading = false, submitLabel = "Salvar" }: ContatoFormProps) {
  const [values, setValues] = useState<ContatoFormValues>({ ...EMPTY, ...initial });
  const [errors, setErrors] = useState<Partial<Record<keyof ContatoFormValues, string>>>({});

  function set(field: keyof ContatoFormValues, value: string | boolean | null) {
    setValues((prev) => ({ ...prev, [field]: value || null }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function validate() {
    const errs: typeof errors = {};
    if (!values.nome?.trim()) errs.nome = "Nome obrigatório";
    if (!values.categoria) errs.categoria = "Categoria obrigatória";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit(values);
  }

  function str(v: string | null | undefined) { return v ?? ""; }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 pb-8">
      <Input label="Nome *" placeholder="Nome completo" value={str(values.nome)}
        onChange={(e) => setValues((p) => ({ ...p, nome: e.target.value }))}
        error={errors.nome} />

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-600 text-[#333333]">Categoria *</label>
        <select
          value={str(values.categoria)}
          onChange={(e) => set("categoria", e.target.value)}
          className="w-full min-h-[48px] rounded-[10px] border border-[#E0E0E0] px-4 text-base text-[#333333] bg-white outline-none focus:border-[#333333] font-[inherit]"
        >
          {CATEGORIAS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
        {errors.categoria && <p className="text-xs text-[#E53935]">{errors.categoria}</p>}
      </div>

      <Input label="Empresa / Clínica" placeholder="Opcional" value={str(values.empresa)}
        onChange={(e) => set("empresa", e.target.value)} />
      <Input label="Telefone principal" type="tel" placeholder="(00) 00000-0000"
        value={str(values.telefone_principal)} onChange={(e) => set("telefone_principal", e.target.value)} />
      <Input label="Telefone secundário" type="tel" placeholder="(00) 00000-0000"
        value={str(values.telefone_secundario)} onChange={(e) => set("telefone_secundario", e.target.value)} />
      <Input label="WhatsApp" type="tel" placeholder="(00) 00000-0000"
        value={str(values.whatsapp)} onChange={(e) => set("whatsapp", e.target.value)} />
      <Input label="E-mail" type="email" placeholder="email@exemplo.com"
        value={str(values.email)} onChange={(e) => set("email", e.target.value)} />
      <Input label="Endereço" placeholder="Rua, número, bairro..."
        value={str(values.endereco)} onChange={(e) => set("endereco", e.target.value)} />

      {imoveis.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-600 text-[#333333]">Imóvel relacionado</label>
          <select
            value={str(values.imovel_id)}
            onChange={(e) => set("imovel_id", e.target.value || null)}
            className="w-full min-h-[48px] rounded-[10px] border border-[#E0E0E0] px-4 text-base text-[#333333] bg-white outline-none focus:border-[#333333] font-[inherit]"
          >
            <option value="">Nenhum</option>
            {imoveis.map((im) => (
              <option key={im.id} value={im.id}>{im.apelido ?? im.nome}</option>
            ))}
          </select>
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-600 text-[#333333]">Observações</label>
        <textarea value={str(values.observacoes)} onChange={(e) => set("observacoes", e.target.value)}
          rows={3} placeholder="Anotações..."
          className="w-full rounded-[10px] border border-[#E0E0E0] px-4 py-3 text-base text-[#333333] font-[inherit] bg-white outline-none resize-none focus:border-[#333333] placeholder:text-[#999999]" />
      </div>

      <Button type="submit" fullWidth loading={loading} size="lg"
        style={{ backgroundColor: "#4CAF50" }}>{submitLabel}</Button>
    </form>
  );
}
