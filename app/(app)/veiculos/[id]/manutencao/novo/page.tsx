"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { PageContainer } from "@/components/layout/PageContainer";
import { ToastContainer } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useVeiculo } from "@/hooks/useVeiculos";
import { useToast } from "@/hooks/useToast";
import type { ManutencaoTipo } from "@/types/database";

const COLOR = "#F57C00";

const TIPOS: { value: ManutencaoTipo; label: string }[] = [
  { value: "revisao",     label: "Revisão" },
  { value: "troca_oleo",  label: "Troca de óleo" },
  { value: "pneu",        label: "Pneu" },
  { value: "freio",       label: "Freio" },
  { value: "multa",       label: "Multa" },
  { value: "combustivel", label: "Combustível" },
  { value: "outro",       label: "Outro" },
];

function today() { return new Date().toISOString().split("T")[0]; }

export default function NovaManutencaoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { addManutencao } = useVeiculo(id);
  const { toasts, addToast, removeToast } = useToast();
  const [saving, setSaving] = useState(false);

  const [tipo, setTipo] = useState<ManutencaoTipo>("revisao");
  const [descricao, setDescricao] = useState("");
  const [dataEvento, setDataEvento] = useState(today());
  const [proximaData, setProximaData] = useState("");
  const [kmAtual, setKmAtual] = useState("");
  const [valor, setValor] = useState("");
  const [local, setLocal] = useState("");
  const [observacoes, setObservacoes] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!dataEvento) { addToast("Informe a data do evento", "error"); return; }
    setSaving(true);
    try {
      await addManutencao({
        tipo,
        descricao: descricao || null,
        data_evento: dataEvento,
        proxima_data: proximaData || null,
        km_atual: kmAtual ? Number(kmAtual) : null,
        valor: valor ? Number(valor) : null,
        local: local || null,
        observacoes: observacoes || null,
      });
      addToast("Manutenção registrada!", "success");
      setTimeout(() => router.push(`/veiculos/${id}`), 800);
    } catch (err) {
      addToast(err instanceof Error ? err.message : "Erro ao salvar", "error");
      setSaving(false);
    }
  }

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <Header title="Registrar Manutenção" color={COLOR} showBack />
      <PageContainer>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5 pb-8">

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-600 text-[#333333]">Tipo *</label>
            <select value={tipo} onChange={(e) => setTipo(e.target.value as ManutencaoTipo)}
              className="w-full min-h-[48px] rounded-[10px] border border-[#E0E0E0] px-4 text-base text-[#333333] bg-white outline-none focus:border-[#F57C00] font-[inherit]">
              {TIPOS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>

          <Input label="Descrição" placeholder="Ex: Revisão dos 20.000 km"
            value={descricao} onChange={(e) => setDescricao(e.target.value)} />

          <div className="grid grid-cols-2 gap-4">
            <Input label="Data do evento *" type="date" value={dataEvento}
              onChange={(e) => setDataEvento(e.target.value)} />
            <Input label="Próxima data" type="date" value={proximaData}
              onChange={(e) => setProximaData(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="KM atual" type="number" placeholder="50000"
              value={kmAtual} onChange={(e) => setKmAtual(e.target.value)} />
            <Input label="Valor (R$)" type="number" placeholder="0,00"
              value={valor} onChange={(e) => setValor(e.target.value)} />
          </div>

          <Input label="Local / Oficina" placeholder="Auto Center Silva..."
            value={local} onChange={(e) => setLocal(e.target.value)} />

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-600 text-[#333333]">Observações</label>
            <textarea value={observacoes} onChange={(e) => setObservacoes(e.target.value)}
              rows={3} placeholder="Anotações..."
              className="w-full rounded-[10px] border border-[#E0E0E0] px-4 py-3 text-base text-[#333333] font-[inherit] bg-white outline-none resize-none focus:border-[#F57C00] placeholder:text-[#999999]" />
          </div>

          <Button type="submit" fullWidth loading={saving} size="lg"
            style={{ backgroundColor: COLOR, color: "#fff" }}>
            Registrar manutenção
          </Button>
        </form>
      </PageContainer>
    </>
  );
}
