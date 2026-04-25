"use client";

import { useState, useRef } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";

const COLOR = "#00897B";

interface ConcluirModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (comprovanteUrl: string | null) => Promise<void>;
}

export function ConcluirModal({ open, onClose, onConfirm }: ConcluirModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const preview = file ? URL.createObjectURL(file) : null;

  function handleClose() {
    setFile(null);
    onClose();
  }

  async function handleConfirm() {
    setUploading(true);
    try {
      let url: string | null = null;
      if (file) {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        const ext = file.name.split(".").pop() ?? "jpg";
        const path = `comprovantes/${user?.id ?? "anon"}/${Date.now()}.${ext}`;
        const { error } = await supabase.storage.from("tarefas").upload(path, file, { upsert: true });
        if (!error) url = path;
      }
      await onConfirm(url);
      setFile(null);
    } finally {
      setUploading(false);
    }
  }

  return (
    <Modal open={open} onClose={handleClose} title="Concluir tarefa" size="sm">
      <p className="text-[#666666] mb-4">Boa! Tem algum comprovante ou foto para registrar?</p>

      <input ref={inputRef} type="file" accept="image/*" className="hidden"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)} />

      {!file ? (
        <button type="button" onClick={() => inputRef.current?.click()}
          className="w-full min-h-[72px] rounded-[10px] border-2 border-dashed border-[#E0E0E0] flex flex-col items-center justify-center gap-1.5 text-[#999999] hover:border-[#00897B] hover:text-[#00897B] transition-colors mb-4">
          <Upload size={20} />
          <span className="text-sm font-600">Anexar comprovante (opcional)</span>
        </button>
      ) : (
        <div className="mb-4 rounded-[10px] border border-[#E0E0E0] overflow-hidden">
          {file.type.startsWith("image/") && preview ? (
            <img src={preview} alt="preview" className="w-full max-h-40 object-contain bg-[#F8F9FA]" />
          ) : (
            <div className="flex items-center gap-2 px-4 py-3">
              <ImageIcon size={20} className="text-[#666666]" />
              <span className="text-sm text-[#333333] truncate">{file.name}</span>
            </div>
          )}
          <div className="flex items-center justify-between px-4 py-2 border-t border-[#F0F0F0]">
            <span className="text-xs text-[#666666] truncate">{file.name}</span>
            <button onClick={() => { setFile(null); if (inputRef.current) inputRef.current.value = ""; }}
              className="w-7 h-7 rounded-full bg-[#FEF2F2] flex items-center justify-center text-[#E53935] flex-shrink-0">
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3">
        <Button fullWidth loading={uploading} onClick={handleConfirm}
          style={{ backgroundColor: COLOR, color: "#fff" }}>
          {uploading ? "Enviando..." : "Confirmar conclusão ✓"}
        </Button>
        <Button variant="secondary" fullWidth onClick={handleClose} disabled={uploading}>
          Cancelar
        </Button>
      </div>
    </Modal>
  );
}
