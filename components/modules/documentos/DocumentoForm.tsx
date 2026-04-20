"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import type { Documento, FamiliaMembro, DocumentoStatus } from "@/types/database";

type DocumentoFormValues = Omit<Documento, "id" | "created_at" | "updated_at">;

interface DocumentoFormProps {
  initial?: Partial<DocumentoFormValues>;
  onSubmit: (values: DocumentoFormValues) => Promise<void>;
  loading?: boolean;
  submitLabel?: string;
}

const TIPOS = [
  { value: "rg", label: "RG" },
  { value: "cpf", label: "CPF" },
  { value: "cnh", label: "CNH" },
  { value: "passaporte", label: "Passaporte" },
  { value: "titulo_eleitor", label: "Título de Eleitor" },
  { value: "certidao_nascimento", label: "Certidão de Nascimento" },
  { value: "certidao_casamento", label: "Certidão de Casamento" },
  { value: "outro", label: "Outro" },
];

const EMPTY: DocumentoFormValues = {
  tipo: "rg", numero: null, orgao_emissor: null,
  data_emissao: null, data_validade: null,
  foto_frente_url: null, foto_verso_url: null,
  status: "ativo" as DocumentoStatus, observacoes: null, membro_id: null,
};

export function DocumentoForm({ initial = {}, onSubmit, loading = false, submitLabel = "Salvar" }: DocumentoFormProps) {
  const [values, setValues] = useState<DocumentoFormValues>({ ...EMPTY, ...initial });
  const [errors, setErrors] = useState<Partial<Record<keyof DocumentoFormValues, string>>>({});
  const [membros, setMembros] = useState<Pick<FamiliaMembro, "id" | "nome">[]>([]);

  useEffect(() => {
    const supabase = createClient();
    supabase.from("familia_membros").select("id, nome").order("nome")
      .then(({ data }) => setMembros((data ?? []) as Pick<FamiliaMembro, "id" | "nome">[]));
  }, []);

  function set(field: keyof DocumentoFormValues, value: string | null) {
    setValues((prev) => ({ ...prev, [field]: value || null }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function validate() {
    const errs: typeof errors = {};
    if (!values.tipo) errs.tipo = "Tipo obrigatório";
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
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-600 text-[#333333]">Tipo de documento *</label>
        <select value={str(values.tipo)} onChange={(e) => set("tipo", e.target.value)}
          className="w-full min-h-[48px] rounded-[10px] border border-[#E0E0E0] px-4 text-base text-[#333333] bg-white outline-none focus:border-[#333333] font-[inherit]">
          {TIPOS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
        {errors.tipo && <p className="text-xs text-[#E53935]">{errors.tipo}</p>}
      </div>

      <Input label="Número" placeholder="000.000.000-00" value={str(values.numero)}
        onChange={(e) => set("numero", e.target.value)} />
      <Input label="Órgão emissor" placeholder="SSP/SP, Detran..." value={str(values.orgao_emissor)}
        onChange={(e) => set("orgao_emissor", e.target.value)} />
      <Input label="Data de emissão" type="date" value={str(values.data_emissao)}
        onChange={(e) => set("data_emissao", e.target.value)} />
      <Input label="Data de validade" type="date" value={str(values.data_validade)}
        onChange={(e) => set("data_validade", e.target.value)} />

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-600 text-[#333333]">Membro da família</label>
        <select value={str(values.membro_id)} onChange={(e) => set("membro_id", e.target.value || null)}
          className="w-full min-h-[48px] rounded-[10px] border border-[#E0E0E0] px-4 text-base text-[#333333] bg-white outline-none focus:border-[#333333] font-[inherit]">
          <option value="">Nenhum</option>
          {membros.map((m) => <option key={m.id} value={m.id}>{m.nome}</option>)}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-600 text-[#333333]">Observações</label>
        <textarea value={str(values.observacoes)} onChange={(e) => set("observacoes", e.target.value)}
          rows={3} placeholder="Anotações..."
          className="w-full rounded-[10px] border border-[#E0E0E0] px-4 py-3 text-base text-[#333333] font-[inherit] bg-white outline-none resize-none focus:border-[#333333] placeholder:text-[#999999]" />
      </div>

      <Button type="submit" fullWidth loading={loading} size="lg"
        style={{ backgroundColor: "#F5C842", color: "#333333" }}>{submitLabel}</Button>
    </form>
  );
}
