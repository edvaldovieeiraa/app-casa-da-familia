"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import type { Veiculo, VeiculoTipo, FamiliaMembro } from "@/types/database";

type VeiculoFormValues = Omit<Veiculo, "id" | "created_at" | "updated_at" | "user_id">;

interface VeiculoFormProps {
  initial?: Partial<VeiculoFormValues>;
  onSubmit: (values: VeiculoFormValues) => Promise<void>;
  loading?: boolean;
  submitLabel?: string;
}

const TIPOS: { value: VeiculoTipo; label: string }[] = [
  { value: "carro",       label: "Carro" },
  { value: "moto",        label: "Moto" },
  { value: "caminhonete", label: "Caminhonete" },
  { value: "van",         label: "Van" },
  { value: "outro",       label: "Outro" },
];

const CATEGORIAS_CNH = ["A", "B", "AB", "C", "D", "E", "ACC"];

const EMPTY: VeiculoFormValues = {
  apelido: null, tipo: "carro", marca: null, modelo: null,
  ano_fabricacao: null, ano_modelo: null, cor: null,
  placa: "", renavam: null, chassi: null, membro_id: null,
  data_vencimento_cnh: null, categoria_cnh: null,
  data_vencimento_ipva: null, valor_ipva: null,
  data_vencimento_licenciamento: null,
  data_vencimento_seguro: null, seguradora: null, numero_apolice: null,
  financiado: false, banco_financiamento: null,
  valor_parcela: null, data_vencimento_parcela: null, parcelas_restantes: null,
  foto_url: null, observacoes: null, ativo: true,
};

function formatPlaca(raw: string) {
  const v = raw.toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (v.length <= 3) return v;
  return v.slice(0, 3) + "-" + v.slice(3, 7);
}

function Section({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-3 mt-2">
      <span className="text-xs font-700 text-[#F57C00] uppercase tracking-wide whitespace-nowrap">{title}</span>
      <div className="flex-1 h-px bg-[#F0F0F0]" />
    </div>
  );
}

export function VeiculoForm({ initial = {}, onSubmit, loading = false, submitLabel = "Salvar" }: VeiculoFormProps) {
  const [values, setValues] = useState<VeiculoFormValues>({ ...EMPTY, ...initial });
  const [errors, setErrors] = useState<Partial<Record<keyof VeiculoFormValues, string>>>({});
  const [membros, setMembros] = useState<Pick<FamiliaMembro, "id" | "nome">[]>([]);

  useEffect(() => {
    createClient().from("familia_membros").select("id, nome").order("nome")
      .then(({ data }) => setMembros((data ?? []) as Pick<FamiliaMembro, "id" | "nome">[]));
  }, []);

  function set<K extends keyof VeiculoFormValues>(field: K, value: VeiculoFormValues[K]) {
    setValues((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function str(v: string | number | null | undefined) { return v != null ? String(v) : ""; }

  function validate() {
    const errs: typeof errors = {};
    if (!values.placa.trim()) errs.placa = "Placa obrigatória";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit(values);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 pb-8">

      <Section title="Identificação" />

      <Input label="Apelido" placeholder='Ex: "Carro da Ana"'
        value={str(values.apelido)} onChange={(e) => set("apelido", e.target.value || null)} />

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-600 text-[#333333]">Tipo</label>
        <select value={str(values.tipo)} onChange={(e) => set("tipo", e.target.value as VeiculoTipo)}
          className="w-full min-h-[48px] rounded-[10px] border border-[#E0E0E0] px-4 text-base text-[#333333] bg-white outline-none focus:border-[#F57C00] font-[inherit]">
          {TIPOS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input label="Marca" placeholder="Toyota, Honda..." value={str(values.marca)}
          onChange={(e) => set("marca", e.target.value || null)} />
        <Input label="Modelo" placeholder="Corolla, Civic..." value={str(values.modelo)}
          onChange={(e) => set("modelo", e.target.value || null)} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input label="Ano fabricação" type="number" placeholder="2020" value={str(values.ano_fabricacao)}
          onChange={(e) => set("ano_fabricacao", e.target.value ? Number(e.target.value) : null)} />
        <Input label="Ano modelo" type="number" placeholder="2021" value={str(values.ano_modelo)}
          onChange={(e) => set("ano_modelo", e.target.value ? Number(e.target.value) : null)} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Input label="Placa *" placeholder="ABC-1234" value={values.placa}
            onChange={(e) => set("placa", formatPlaca(e.target.value))}
            error={errors.placa} />
        </div>
        <Input label="Cor" placeholder="Prata, Preto..." value={str(values.cor)}
          onChange={(e) => set("cor", e.target.value || null)} />
      </div>

      <Input label="RENAVAM" placeholder="00000000000" value={str(values.renavam)}
        onChange={(e) => set("renavam", e.target.value || null)} />
      <Input label="Chassi" placeholder="9BWZZZ377VT004251" value={str(values.chassi)}
        onChange={(e) => set("chassi", e.target.value || null)} />

      <Section title="Proprietário" />

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-600 text-[#333333]">Membro da família</label>
        <select value={str(values.membro_id)} onChange={(e) => set("membro_id", e.target.value || null)}
          className="w-full min-h-[48px] rounded-[10px] border border-[#E0E0E0] px-4 text-base text-[#333333] bg-white outline-none focus:border-[#F57C00] font-[inherit]">
          <option value="">Nenhum</option>
          {membros.map((m) => <option key={m.id} value={m.id}>{m.nome}</option>)}
        </select>
      </div>

      <Section title="Documentação" />

      <div className="grid grid-cols-2 gap-4">
        <Input label="Venc. CNH" type="date" value={str(values.data_vencimento_cnh)}
          onChange={(e) => set("data_vencimento_cnh", e.target.value || null)} />
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-600 text-[#333333]">Categoria CNH</label>
          <select value={str(values.categoria_cnh)} onChange={(e) => set("categoria_cnh", e.target.value || null)}
            className="w-full min-h-[48px] rounded-[10px] border border-[#E0E0E0] px-4 text-base text-[#333333] bg-white outline-none focus:border-[#F57C00] font-[inherit]">
            <option value="">—</option>
            {CATEGORIAS_CNH.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input label="Venc. IPVA" type="date" value={str(values.data_vencimento_ipva)}
          onChange={(e) => set("data_vencimento_ipva", e.target.value || null)} />
        <Input label="Valor IPVA (R$)" type="number" value={str(values.valor_ipva)}
          onChange={(e) => set("valor_ipva", e.target.value ? Number(e.target.value) : null)} />
      </div>

      <Input label="Venc. Licenciamento" type="date" value={str(values.data_vencimento_licenciamento)}
        onChange={(e) => set("data_vencimento_licenciamento", e.target.value || null)} />

      <Input label="Venc. Seguro" type="date" value={str(values.data_vencimento_seguro)}
        onChange={(e) => set("data_vencimento_seguro", e.target.value || null)} />
      <div className="grid grid-cols-2 gap-4">
        <Input label="Seguradora" placeholder="Porto, Bradesco..." value={str(values.seguradora)}
          onChange={(e) => set("seguradora", e.target.value || null)} />
        <Input label="Nº Apólice" placeholder="000000" value={str(values.numero_apolice)}
          onChange={(e) => set("numero_apolice", e.target.value || null)} />
      </div>

      <Section title="Financiamento" />

      <div className="flex items-center gap-3 py-1">
        <button type="button" onClick={() => set("financiado", !values.financiado)}
          className={`w-12 h-6 rounded-full transition-colors flex items-center ${values.financiado ? "bg-[#F57C00] justify-end" : "bg-[#E0E0E0] justify-start"}`}>
          <span className="w-5 h-5 rounded-full bg-white shadow mx-0.5 block" />
        </button>
        <span className="text-sm font-600 text-[#333333]">Veículo financiado</span>
      </div>

      {values.financiado && (
        <>
          <Input label="Banco / Financeira" placeholder="Banco do Brasil, Itaú..." value={str(values.banco_financiamento)}
            onChange={(e) => set("banco_financiamento", e.target.value || null)} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Valor parcela (R$)" type="number" value={str(values.valor_parcela)}
              onChange={(e) => set("valor_parcela", e.target.value ? Number(e.target.value) : null)} />
            <Input label="Parcelas restantes" type="number" value={str(values.parcelas_restantes)}
              onChange={(e) => set("parcelas_restantes", e.target.value ? Number(e.target.value) : null)} />
          </div>
          <Input label="Venc. parcela" type="date" value={str(values.data_vencimento_parcela)}
            onChange={(e) => set("data_vencimento_parcela", e.target.value || null)} />
        </>
      )}

      <Section title="Outros" />

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-600 text-[#333333]">Observações</label>
        <textarea value={str(values.observacoes)} onChange={(e) => set("observacoes", e.target.value || null)}
          rows={3} placeholder="Anotações sobre o veículo..."
          className="w-full rounded-[10px] border border-[#E0E0E0] px-4 py-3 text-base text-[#333333] font-[inherit] bg-white outline-none resize-none focus:border-[#F57C00] placeholder:text-[#999999]" />
      </div>

      <Button type="submit" fullWidth loading={loading} size="lg"
        style={{ backgroundColor: "#F57C00", color: "#fff" }}>
        {submitLabel}
      </Button>
    </form>
  );
}
