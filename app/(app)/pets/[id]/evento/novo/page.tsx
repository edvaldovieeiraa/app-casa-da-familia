"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { PageContainer } from "@/components/layout/PageContainer";
import { ToastContainer } from "@/components/ui/Toast";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { usePet } from "@/hooks/usePets";
import { useToast } from "@/hooks/useToast";
import type { PetEvento, PetEventoTipo } from "@/types/database";

const COLOR = "#FF6F00";

const TIPOS: { value: PetEventoTipo; label: string }[] = [
  { value: "vacina", label: "Vacina" },
  { value: "banho", label: "Banho" },
  { value: "tosa", label: "Tosa" },
  { value: "medicamento", label: "Medicamento" },
  { value: "consulta", label: "Consulta veterinária" },
  { value: "outro", label: "Outro" },
];

type EventoInput = Omit<PetEvento, "id" | "created_at" | "pet_id" | "user_id">;

const hoje = new Date().toISOString().split("T")[0];
const EMPTY: EventoInput = {
  tipo: "consulta", descricao: null, data_evento: hoje,
  proxima_data: null, valor: null, local: null, observacoes: null,
};

export default function NovoEventoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { pet, addEvento } = usePet(id);
  const { toasts, addToast, removeToast } = useToast();
  const [values, setValues] = useState<EventoInput>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof EventoInput, string>>>({});

  function set(field: keyof EventoInput, value: string | null | number) {
    setValues((prev) => ({ ...prev, [field]: value === "" ? null : value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!values.data_evento) { setErrors({ data_evento: "Data obrigatória" }); return; }
    setSaving(true);
    try {
      await addEvento(values);
      addToast("Evento registrado!", "success");
      setTimeout(() => router.push(`/pets/${id}`), 800);
    } catch (err) {
      addToast(err instanceof Error ? err.message : "Erro ao salvar", "error");
      setSaving(false);
    }
  }

  function str(v: string | null | undefined) { return v ?? ""; }

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <Header title={`Evento — ${pet?.nome ?? "Pet"}`} color={COLOR} showBack />
      <PageContainer>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5 pb-8">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-600 text-[#333333]">Tipo *</label>
            <select value={values.tipo} onChange={(e) => set("tipo", e.target.value)}
              className="w-full min-h-[48px] rounded-[10px] border border-[#E0E0E0] px-4 text-base text-[#333333] bg-white outline-none focus:border-[#FF6F00] font-[inherit]">
              {TIPOS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>

          <Input label="Descrição" placeholder="Ex: Vacina antirrábica anual" value={str(values.descricao)}
            onChange={(e) => set("descricao", e.target.value)} />

          <Input label="Data do evento *" type="date" value={str(values.data_evento)}
            onChange={(e) => set("data_evento", e.target.value)}
            error={errors.data_evento} />

          <Input label="Próxima data" type="date" value={str(values.proxima_data)}
            onChange={(e) => set("proxima_data", e.target.value)} />

          <Input label="Local / clínica" placeholder="Nome da clínica ou pet shop" value={str(values.local)}
            onChange={(e) => set("local", e.target.value)} />

          <Input label="Valor (R$)" type="number" placeholder="0,00"
            value={values.valor?.toString() ?? ""}
            onChange={(e) => set("valor", e.target.value ? parseFloat(e.target.value) : null)} />

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-600 text-[#333333]">Observações</label>
            <textarea value={str(values.observacoes)} onChange={(e) => set("observacoes", e.target.value)}
              rows={3} placeholder="Anotações adicionais..."
              className="w-full rounded-[10px] border border-[#E0E0E0] px-4 py-3 text-base text-[#333333] font-[inherit] bg-white outline-none resize-none focus:border-[#FF6F00] placeholder:text-[#999999]" />
          </div>

          <Button type="submit" fullWidth loading={saving} size="lg"
            style={{ backgroundColor: COLOR }}>Salvar evento</Button>
        </form>
      </PageContainer>
    </>
  );
}
