"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import type { PetEvento, PetEventoTipo } from "@/types/database";

type EventoInput = Omit<PetEvento, "id" | "created_at" | "pet_id" | "user_id">;

interface RegistrarEventoModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (values: EventoInput) => Promise<void>;
}

const TIPOS: { value: PetEventoTipo; label: string }[] = [
  { value: "vacina", label: "Vacina" },
  { value: "banho", label: "Banho" },
  { value: "tosa", label: "Tosa" },
  { value: "medicamento", label: "Medicamento" },
  { value: "consulta", label: "Consulta veterinária" },
  { value: "outro", label: "Outro" },
];

const hoje = new Date().toISOString().split("T")[0];

const EMPTY: EventoInput = {
  tipo: "consulta", descricao: null,
  data_evento: hoje, proxima_data: null,
  valor: null, local: null, observacoes: null,
};

export function RegistrarEventoModal({ open, onClose, onSave }: RegistrarEventoModalProps) {
  const [values, setValues] = useState<EventoInput>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof EventoInput, string>>>({});

  function set(field: keyof EventoInput, value: string | null | number) {
    setValues((prev) => ({ ...prev, [field]: value === "" ? null : value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function validate() {
    const errs: typeof errors = {};
    if (!values.data_evento) errs.data_evento = "Data obrigatória";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;
    setSaving(true);
    try {
      await onSave(values);
      setValues(EMPTY);
      onClose();
    } finally {
      setSaving(false);
    }
  }

  function str(v: string | null | undefined) { return v ?? ""; }

  return (
    <Modal open={open} onClose={onClose} title="Registrar evento">
      <div className="flex flex-col gap-4">
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

        <Input label="Valor (R$)" type="number" placeholder="0,00" value={values.valor?.toString() ?? ""}
          onChange={(e) => set("valor", e.target.value ? parseFloat(e.target.value) : null)} />

        <div className="flex flex-col gap-3 pt-2">
          <Button fullWidth loading={saving} onClick={handleSave}
            style={{ backgroundColor: "#FF6F00" }}>Salvar evento</Button>
          <Button variant="secondary" fullWidth onClick={onClose} disabled={saving}>Cancelar</Button>
        </div>
      </div>
    </Modal>
  );
}
