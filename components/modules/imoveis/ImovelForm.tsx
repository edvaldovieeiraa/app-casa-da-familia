"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import type { Imovel } from "@/types/database";

type ImovelFormValues = Omit<Imovel, "id" | "created_at" | "updated_at" | "ativo">;

interface ImovelFormProps {
  initial?: Partial<ImovelFormValues>;
  onSubmit: (values: ImovelFormValues) => Promise<void>;
  loading?: boolean;
  submitLabel?: string;
}

const EMPTY: ImovelFormValues = {
  nome: "",
  apelido: null,
  tipo: null,
  cep: null,
  logradouro: null,
  numero: null,
  complemento: null,
  bairro: null,
  cidade: null,
  estado: null,
  endereco_completo: null,
  sequencial: null,
  matricula_imovel: null,
  codigo_iptu: null,
  inscricao_imobiliaria: null,
  unidade_consumidora: null,
  cpf_conta_luz: null,
  distribuidora: null,
  matricula_agua: null,
  cpf_conta_agua: null,
  codigo_gas: null,
  codigo_cliente_internet: null,
  provedor_internet: null,
  observacoes: null,
  foto_url: null,
  favorito: false,
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-sm font-700 text-[#E53935] uppercase tracking-wide pt-2">
        {title}
      </h2>
      {children}
    </div>
  );
}

export function ImovelForm({
  initial = {},
  onSubmit,
  loading = false,
  submitLabel = "Salvar",
}: ImovelFormProps) {
  const [values, setValues] = useState<ImovelFormValues>({ ...EMPTY, ...initial });
  const [cepLoading, setCepLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof ImovelFormValues, string>>>({});

  function set(field: keyof ImovelFormValues, value: string | boolean | null) {
    setValues((prev) => ({ ...prev, [field]: value || null }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  async function buscarCep() {
    const cep = (values.cep ?? "").replace(/\D/g, "");
    if (cep.length !== 8) return;
    setCepLoading(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data: {
        logradouro?: string;
        bairro?: string;
        localidade?: string;
        uf?: string;
        erro?: boolean;
      } = await res.json();
      if (!data.erro) {
        setValues((prev) => ({
          ...prev,
          logradouro: data.logradouro ?? prev.logradouro,
          bairro: data.bairro ?? prev.bairro,
          cidade: data.localidade ?? prev.cidade,
          estado: data.uf ?? prev.estado,
        }));
      }
    } catch {
      // ViaCEP indisponível — usuário preenche manualmente
    } finally {
      setCepLoading(false);
    }
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

  function str(v: string | null | undefined) {
    return v ?? "";
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 pb-8">
      {/* Identificação */}
      <Section title="Identificação">
        <Input
          label="Nome do imóvel *"
          placeholder="Ex: Apartamento Centro"
          value={str(values.nome)}
          onChange={(e) => set("nome", e.target.value)}
          error={errors.nome}
        />
        <Input
          label="Apelido"
          placeholder="Ex: Apê do João"
          value={str(values.apelido)}
          onChange={(e) => set("apelido", e.target.value)}
        />
      </Section>

      {/* Endereço */}
      <Section title="Endereço">
        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <Input
              label="CEP"
              placeholder="00000-000"
              value={str(values.cep)}
              onChange={(e) => set("cep", e.target.value)}
              maxLength={9}
            />
          </div>
          <Button
            type="button"
            variant="secondary"
            icon={Search}
            loading={cepLoading}
            onClick={buscarCep}
            className="flex-shrink-0"
          >
            Buscar
          </Button>
        </div>
        <Input
          label="Logradouro"
          placeholder="Rua, Avenida..."
          value={str(values.logradouro)}
          onChange={(e) => set("logradouro", e.target.value)}
        />
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Número"
            placeholder="123"
            value={str(values.numero)}
            onChange={(e) => set("numero", e.target.value)}
          />
          <Input
            label="Complemento"
            placeholder="Apto, Bloco..."
            value={str(values.complemento)}
            onChange={(e) => set("complemento", e.target.value)}
          />
        </div>
        <Input
          label="Bairro"
          placeholder="Centro"
          value={str(values.bairro)}
          onChange={(e) => set("bairro", e.target.value)}
        />
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2">
            <Input
              label="Cidade"
              placeholder="São Paulo"
              value={str(values.cidade)}
              onChange={(e) => set("cidade", e.target.value)}
            />
          </div>
          <Input
            label="Estado"
            placeholder="SP"
            value={str(values.estado)}
            onChange={(e) => set("estado", e.target.value)}
            maxLength={2}
          />
        </div>
      </Section>

      {/* Documentação */}
      <Section title="Documentação">
        <Input
          label="Matrícula do imóvel"
          placeholder="000.000"
          value={str(values.matricula_imovel)}
          onChange={(e) => set("matricula_imovel", e.target.value)}
        />
        <Input
          label="Código do IPTU"
          placeholder="0000000-0"
          value={str(values.codigo_iptu)}
          onChange={(e) => set("codigo_iptu", e.target.value)}
        />
        <Input
          label="Inscrição imobiliária"
          placeholder=""
          value={str(values.inscricao_imobiliaria)}
          onChange={(e) => set("inscricao_imobiliaria", e.target.value)}
        />
        <Input
          label="Sequencial"
          placeholder=""
          value={str(values.sequencial)}
          onChange={(e) => set("sequencial", e.target.value)}
        />
      </Section>

      {/* Energia */}
      <Section title="Energia elétrica">
        <Input
          label="Unidade consumidora"
          placeholder="0000000"
          value={str(values.unidade_consumidora)}
          onChange={(e) => set("unidade_consumidora", e.target.value)}
        />
        <Input
          label="CPF da conta de luz"
          placeholder="000.000.000-00"
          value={str(values.cpf_conta_luz)}
          onChange={(e) => set("cpf_conta_luz", e.target.value)}
        />
        <Input
          label="Distribuidora"
          placeholder="Ex: Enel, CPFL..."
          value={str(values.distribuidora)}
          onChange={(e) => set("distribuidora", e.target.value)}
        />
      </Section>

      {/* Água */}
      <Section title="Água">
        <Input
          label="Matrícula da água"
          placeholder="0000000"
          value={str(values.matricula_agua)}
          onChange={(e) => set("matricula_agua", e.target.value)}
        />
        <Input
          label="CPF da conta de água"
          placeholder="000.000.000-00"
          value={str(values.cpf_conta_agua)}
          onChange={(e) => set("cpf_conta_agua", e.target.value)}
        />
      </Section>

      {/* Outros serviços */}
      <Section title="Outros serviços">
        <Input
          label="Código do gás"
          placeholder=""
          value={str(values.codigo_gas)}
          onChange={(e) => set("codigo_gas", e.target.value)}
        />
        <Input
          label="Provedor de internet"
          placeholder="Ex: Vivo, Claro..."
          value={str(values.provedor_internet)}
          onChange={(e) => set("provedor_internet", e.target.value)}
        />
        <Input
          label="Código de cliente (internet)"
          placeholder=""
          value={str(values.codigo_cliente_internet)}
          onChange={(e) => set("codigo_cliente_internet", e.target.value)}
        />
      </Section>

      {/* Observações */}
      <Section title="Observações">
        <textarea
          placeholder="Anotações gerais sobre o imóvel..."
          value={str(values.observacoes)}
          onChange={(e) => set("observacoes", e.target.value)}
          rows={4}
          className="w-full rounded-[10px] border border-[#E0E0E0] px-4 py-3 text-base text-[#333333] font-[inherit] bg-white outline-none resize-none transition-colors focus:border-[#333333] placeholder:text-[#999999]"
        />
      </Section>

      <Button type="submit" fullWidth loading={loading} size="lg">
        {submitLabel}
      </Button>
    </form>
  );
}
