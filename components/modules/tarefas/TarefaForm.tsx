"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, X } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import type { Tarefa, TarefaCategoria, TarefaPrioridade, TarefaStatus, FamiliaMembro } from "@/types/database";

type TarefaFormValues = Omit<Tarefa, "id" | "created_at" | "updated_at" | "user_id">;

interface TarefaFormProps {
  initial?: Partial<TarefaFormValues>;
  initialChecklist?: string[];
  onSubmit: (values: TarefaFormValues, checklist: string[]) => Promise<void>;
  loading?: boolean;
  submitLabel?: string;
}

const COLOR = "#00897B";

const CATEGORIAS: { value: TarefaCategoria; label: string; emoji: string }[] = [
  { value: "compras",    label: "Compras",    emoji: "🛒" },
  { value: "servico",    label: "Serviço",    emoji: "🔧" },
  { value: "conserto",   label: "Conserto",   emoji: "🏠" },
  { value: "medico",     label: "Médico",     emoji: "🏥" },
  { value: "financeiro", label: "Financeiro", emoji: "💰" },
  { value: "outro",      label: "Outro",      emoji: "📌" },
];

const PRIORIDADES: { value: TarefaPrioridade; label: string; color: string; textDark?: boolean }[] = [
  { value: "baixa",   label: "Baixa",   color: "#4CAF50" },
  { value: "media",   label: "Média",   color: "#F5C842", textDark: true },
  { value: "alta",    label: "Alta",    color: "#FF6F00" },
  { value: "urgente", label: "Urgente", color: "#E53935" },
];

const EMPTY: TarefaFormValues = {
  titulo: "", descricao: null, categoria: null,
  prioridade: "media", status: "pendente" as TarefaStatus,
  solicitante_id: null, responsavel_id: null,
  data_prazo: null, data_conclusao: null,
  comprovante_url: null, observacoes: null,
};

export function TarefaForm({ initial = {}, initialChecklist = [], onSubmit, loading = false, submitLabel = "Salvar" }: TarefaFormProps) {
  const [values, setValues] = useState<TarefaFormValues>({ ...EMPTY, ...initial });
  const [errors, setErrors] = useState<Partial<Record<keyof TarefaFormValues, string>>>({});
  const [membros, setMembros] = useState<Pick<FamiliaMembro, "id" | "nome">[]>([]);
  const [checklistItems, setChecklistItems] = useState<string[]>(initialChecklist);
  const [novoItem, setNovoItem] = useState("");
  const checklistInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    createClient().from("familia_membros").select("id, nome").order("nome")
      .then(({ data }) => setMembros((data ?? []) as Pick<FamiliaMembro, "id" | "nome">[]));
  }, []);

  function set<K extends keyof TarefaFormValues>(field: K, value: TarefaFormValues[K]) {
    setValues((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function str(v: string | null | undefined) { return v ?? ""; }

  function validate() {
    const errs: typeof errors = {};
    if (!values.titulo.trim()) errs.titulo = "Título obrigatório";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function adicionarItem() {
    const texto = novoItem.trim();
    if (!texto) return;
    setChecklistItems((prev) => [...prev, texto]);
    setNovoItem("");
    checklistInputRef.current?.focus();
  }

  function removerItem(index: number) {
    setChecklistItems((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit(values, checklistItems);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 pb-8">

      <Input label="Título *" placeholder="Ex: Pagar conta de luz"
        value={values.titulo} onChange={(e) => set("titulo", e.target.value)}
        error={errors.titulo} />

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-600 text-[#333333]">Descrição</label>
        <textarea value={str(values.descricao)} onChange={(e) => set("descricao", e.target.value || null)}
          rows={3} placeholder="Detalhes da tarefa..."
          className="w-full rounded-[10px] border border-[#E0E0E0] px-4 py-3 text-base text-[#333333] font-[inherit] bg-white outline-none resize-none focus:border-[#00897B] placeholder:text-[#999999]" />
      </div>

      {/* Categoria */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-600 text-[#333333]">Categoria</label>
        <select value={str(values.categoria)} onChange={(e) => set("categoria", (e.target.value as TarefaCategoria) || null)}
          className="w-full min-h-[48px] rounded-[10px] border border-[#E0E0E0] px-4 text-base text-[#333333] bg-white outline-none focus:border-[#00897B] font-[inherit]">
          <option value="">Sem categoria</option>
          {CATEGORIAS.map((c) => (
            <option key={c.value} value={c.value}>{c.emoji} {c.label}</option>
          ))}
        </select>
      </div>

      {/* Prioridade */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-600 text-[#333333]">Prioridade</label>
        <div className="grid grid-cols-4 gap-2">
          {PRIORIDADES.map((p) => {
            const selected = values.prioridade === p.value;
            return (
              <button key={p.value} type="button"
                onClick={() => set("prioridade", p.value)}
                className="min-h-[44px] rounded-[10px] text-sm font-700 transition-all border-2"
                style={{
                  backgroundColor: selected ? p.color : "transparent",
                  borderColor: p.color,
                  color: selected ? (p.textDark ? "#333333" : "#ffffff") : p.color,
                }}>
                {p.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Solicitante */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-600 text-[#333333]">Solicitado por</label>
        <select value={str(values.solicitante_id)} onChange={(e) => set("solicitante_id", e.target.value || null)}
          className="w-full min-h-[48px] rounded-[10px] border border-[#E0E0E0] px-4 text-base text-[#333333] bg-white outline-none focus:border-[#00897B] font-[inherit]">
          <option value="">Nenhum</option>
          {membros.map((m) => <option key={m.id} value={m.id}>{m.nome}</option>)}
        </select>
      </div>

      {/* Responsável */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-600 text-[#333333]">Responsável (opcional)</label>
        <select value={str(values.responsavel_id)} onChange={(e) => set("responsavel_id", e.target.value || null)}
          className="w-full min-h-[48px] rounded-[10px] border border-[#E0E0E0] px-4 text-base text-[#333333] bg-white outline-none focus:border-[#00897B] font-[inherit]">
          <option value="">Sem responsável</option>
          {membros.map((m) => <option key={m.id} value={m.id}>{m.nome}</option>)}
        </select>
      </div>

      <Input label="Data prazo" type="date" value={str(values.data_prazo)}
        onChange={(e) => set("data_prazo", e.target.value || null)} />

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-600 text-[#333333]">Observações</label>
        <textarea value={str(values.observacoes)} onChange={(e) => set("observacoes", e.target.value || null)}
          rows={2} placeholder="Anotações adicionais..."
          className="w-full rounded-[10px] border border-[#E0E0E0] px-4 py-3 text-base text-[#333333] font-[inherit] bg-white outline-none resize-none focus:border-[#00897B] placeholder:text-[#999999]" />
      </div>

      {/* Checklist */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-600 text-[#333333]">Checklist</label>

        {checklistItems.length > 0 && (
          <ul className="flex flex-col gap-1.5">
            {checklistItems.map((item, i) => (
              <li key={i} className="flex items-center gap-2 bg-[#F8F9FA] rounded-[10px] px-3 py-2.5">
                <span className="w-5 h-5 rounded-full border-2 border-[#00897B] flex-shrink-0" />
                <span className="flex-1 text-sm text-[#333333]">{item}</span>
                <button type="button" onClick={() => removerItem(i)}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-[#999999] hover:text-[#E53935] hover:bg-[#FEF2F2] transition-colors">
                  <X size={14} />
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="flex gap-2">
          <input
            ref={checklistInputRef}
            value={novoItem}
            onChange={(e) => setNovoItem(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); adicionarItem(); } }}
            placeholder="Adicionar item..."
            className="flex-1 min-h-[48px] rounded-[10px] border border-[#E0E0E0] px-4 text-sm text-[#333333] bg-white outline-none focus:border-[#00897B] font-[inherit]"
          />
          <button type="button" onClick={adicionarItem}
            disabled={!novoItem.trim()}
            className="w-12 h-12 rounded-[10px] flex items-center justify-center disabled:opacity-40 transition-opacity"
            style={{ backgroundColor: "#00897B" }}>
            <Plus size={20} className="text-white" />
          </button>
        </div>
      </div>

      <Button type="submit" fullWidth loading={loading} size="lg"
        style={{ backgroundColor: COLOR, color: "#fff" }}>
        {submitLabel}
      </Button>
    </form>
  );
}
