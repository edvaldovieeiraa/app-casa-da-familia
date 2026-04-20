"use client";

import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import type { Pet } from "@/types/database";

type PetFormValues = Omit<Pet, "id" | "created_at" | "user_id">;

interface PetFormProps {
  initial?: Partial<PetFormValues>;
  onSubmit: (values: PetFormValues) => Promise<void>;
  loading?: boolean;
  submitLabel?: string;
}

const EMPTY: PetFormValues = {
  nome: "", especie: null, raca: null, data_nascimento: null,
  sexo: null, cor: null, foto_url: null, observacoes: null, ativo: true,
};

export function PetForm({ initial = {}, onSubmit, loading = false, submitLabel = "Salvar" }: PetFormProps) {
  const [values, setValues] = useState<PetFormValues>({ ...EMPTY, ...initial });
  const [errors, setErrors] = useState<Partial<Record<keyof PetFormValues, string>>>({});

  function set(field: keyof PetFormValues, value: string | null | boolean) {
    setValues((prev) => ({ ...prev, [field]: value === "" ? null : value }));
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
      <Input label="Nome *" placeholder="Nome do pet" value={str(values.nome)}
        onChange={(e) => setValues((p) => ({ ...p, nome: e.target.value }))}
        error={errors.nome} />

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-600 text-[#333333]">Espécie</label>
        <select value={str(values.especie)} onChange={(e) => set("especie", e.target.value)}
          className="w-full min-h-[48px] rounded-[10px] border border-[#E0E0E0] px-4 text-base text-[#333333] bg-white outline-none focus:border-[#FF6F00] font-[inherit]">
          <option value="">Selecione...</option>
          <option value="Cachorro">Cachorro</option>
          <option value="Gato">Gato</option>
          <option value="Pássaro">Pássaro</option>
          <option value="Peixe">Peixe</option>
          <option value="Hamster">Hamster</option>
          <option value="Coelho">Coelho</option>
          <option value="Outro">Outro</option>
        </select>
      </div>

      <Input label="Raça" placeholder="Ex: Labrador, Siamês..." value={str(values.raca)}
        onChange={(e) => set("raca", e.target.value)} />

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-600 text-[#333333]">Sexo</label>
        <select value={str(values.sexo)} onChange={(e) => set("sexo", e.target.value)}
          className="w-full min-h-[48px] rounded-[10px] border border-[#E0E0E0] px-4 text-base text-[#333333] bg-white outline-none focus:border-[#FF6F00] font-[inherit]">
          <option value="">Selecione...</option>
          <option value="macho">Macho</option>
          <option value="femea">Fêmea</option>
        </select>
      </div>

      <Input label="Data de nascimento" type="date" value={str(values.data_nascimento)}
        onChange={(e) => set("data_nascimento", e.target.value)} />

      <Input label="Cor / pelagem" placeholder="Ex: Caramelo, Preto e branco..." value={str(values.cor)}
        onChange={(e) => set("cor", e.target.value)} />

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-600 text-[#333333]">Observações</label>
        <textarea value={str(values.observacoes)} onChange={(e) => set("observacoes", e.target.value)}
          rows={3} placeholder="Informações adicionais..."
          className="w-full rounded-[10px] border border-[#E0E0E0] px-4 py-3 text-base text-[#333333] font-[inherit] bg-white outline-none resize-none focus:border-[#FF6F00] placeholder:text-[#999999]" />
      </div>

      <Button type="submit" fullWidth loading={loading} size="lg"
        style={{ backgroundColor: "#FF6F00" }}>{submitLabel}</Button>
    </form>
  );
}
