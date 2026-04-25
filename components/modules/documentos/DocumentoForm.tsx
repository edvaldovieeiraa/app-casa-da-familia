"use client";

import { useState, useEffect, useRef } from "react";
import { Upload, X, FileText } from "lucide-react";
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

function FileUploadField({
  label,
  file,
  onFileChange,
}: {
  label: string;
  file: File | null;
  onFileChange: (file: File | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const isImage = file?.type.startsWith("image/") ?? false;
  const previewUrl = file && isImage ? URL.createObjectURL(file) : null;

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-600 text-[#333333]">{label}</label>
      <input
        ref={inputRef}
        type="file"
        accept="image/*,application/pdf"
        className="hidden"
        onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
      />

      {!file ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full min-h-[80px] rounded-[10px] border-2 border-dashed border-[#E0E0E0] flex flex-col items-center justify-center gap-2 text-[#999999] hover:border-[#F5C842] hover:text-[#F5C842] transition-colors bg-white"
        >
          <Upload size={22} />
          <span className="text-sm font-600">Toque para anexar</span>
          <span className="text-xs">Foto ou PDF</span>
        </button>
      ) : (
        <div className="w-full rounded-[10px] border border-[#E0E0E0] bg-white overflow-hidden">
          {isImage && previewUrl ? (
            <img src={previewUrl} alt={label} className="w-full max-h-48 object-contain bg-[#F8F9FA]" />
          ) : (
            <div className="flex items-center gap-3 px-4 py-3">
              <FileText size={24} className="text-[#666666] flex-shrink-0" />
              <span className="text-sm text-[#333333] truncate flex-1">{file.name}</span>
            </div>
          )}
          <div className="flex items-center justify-between px-4 py-2 border-t border-[#F0F0F0]">
            <span className="text-xs text-[#666666] truncate flex-1 mr-2">{file.name}</span>
            <button
              type="button"
              onClick={() => { onFileChange(null); if (inputRef.current) inputRef.current.value = ""; }}
              className="flex-shrink-0 w-7 h-7 rounded-full bg-[#FEF2F2] flex items-center justify-center text-[#E53935]"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function DocumentoForm({ initial = {}, onSubmit, loading = false, submitLabel = "Salvar" }: DocumentoFormProps) {
  const [values, setValues] = useState<DocumentoFormValues>({ ...EMPTY, ...initial });
  const [errors, setErrors] = useState<Partial<Record<keyof DocumentoFormValues, string>>>({});
  const [membros, setMembros] = useState<Pick<FamiliaMembro, "id" | "nome">[]>([]);
  const [uploading, setUploading] = useState(false);
  const [frente, setFrente] = useState<File | null>(null);
  const [verso, setVerso] = useState<File | null>(null);

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

  async function uploadFile(file: File, userId: string, side: "frente" | "verso") {
    const supabase = createClient();
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${userId}/${Date.now()}-${side}.${ext}`;
    const { error } = await supabase.storage.from("documentos").upload(path, file, { upsert: true });
    if (error) throw new Error(error.message);
    return path;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setUploading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      let foto_frente_url = values.foto_frente_url;
      let foto_verso_url = values.foto_verso_url;

      if (frente) foto_frente_url = await uploadFile(frente, user.id, "frente");
      if (verso) foto_verso_url = await uploadFile(verso, user.id, "verso");

      await onSubmit({ ...values, foto_frente_url, foto_verso_url });
    } finally {
      setUploading(false);
    }
  }

  function str(v: string | null | undefined) { return v ?? ""; }
  const isBusy = loading || uploading;

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

      <FileUploadField label="Frente do documento" file={frente} onFileChange={setFrente} />
      <FileUploadField label="Verso do documento (opcional)" file={verso} onFileChange={setVerso} />

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-600 text-[#333333]">Observações</label>
        <textarea value={str(values.observacoes)} onChange={(e) => set("observacoes", e.target.value)}
          rows={3} placeholder="Anotações..."
          className="w-full rounded-[10px] border border-[#E0E0E0] px-4 py-3 text-base text-[#333333] font-[inherit] bg-white outline-none resize-none focus:border-[#333333] placeholder:text-[#999999]" />
      </div>

      <Button type="submit" fullWidth loading={isBusy} size="lg"
        style={{ backgroundColor: "#F5C842", color: "#333333" }}>
        {uploading ? "Enviando arquivo..." : submitLabel}
      </Button>
    </form>
  );
}
