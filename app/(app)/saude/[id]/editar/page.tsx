"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import { ToastContainer } from "@/components/ui/Toast";
import { useToast } from "@/hooks/useToast";
import { usePaciente, usePacientes } from "@/hooks/useSaude";

const COLOR = "#00ACC1";
const TIPOS_SANGUINEOS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function EditarPacientePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { paciente, loading, error } = usePaciente(id);
  const { updatePaciente } = usePacientes();
  const { toasts, addToast, removeToast } = useToast();

  const [nome, setNome] = useState("");
  const [apelido, setApelido] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [tipoSanguineo, setTipoSanguineo] = useState("");
  const [pesoKg, setPesoKg] = useState("");
  const [alturaCm, setAlturaCm] = useState("");
  const [planoSaude, setPlanoSaude] = useState("");
  const [numeroCarteirinha, setNumeroCarteirinha] = useState("");
  const [alergiasTexto, setAlergiasTexto] = useState("");
  const [condicoesTexto, setCondicoesTexto] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [saving, setSaving] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!paciente) return;
    setNome(paciente.nome ?? "");
    setApelido(paciente.apelido ?? "");
    setDataNascimento(paciente.data_nascimento ?? "");
    setTipoSanguineo(paciente.tipo_sanguineo ?? "");
    setPesoKg(paciente.peso_kg != null ? String(paciente.peso_kg) : "");
    setAlturaCm(paciente.altura_cm != null ? String(paciente.altura_cm) : "");
    setPlanoSaude(paciente.plano_saude ?? "");
    setNumeroCarteirinha(paciente.numero_carteirinha ?? "");
    setAlergiasTexto((paciente.alergias ?? []).join(", "));
    setCondicoesTexto((paciente.condicoes_cronicas ?? []).join(", "));
    setObservacoes(paciente.observacoes ?? "");
    setReady(true);
  }, [paciente]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nome.trim()) { addToast("Nome é obrigatório", "warning"); return; }
    setSaving(true);
    try {
      const alergias = alergiasTexto.trim() ? alergiasTexto.split(",").map((s) => s.trim()).filter(Boolean) : null;
      const condicoes = condicoesTexto.trim() ? condicoesTexto.split(",").map((s) => s.trim()).filter(Boolean) : null;
      await updatePaciente(id, {
        nome: nome.trim(),
        apelido: apelido.trim() || null,
        data_nascimento: dataNascimento || null,
        tipo_sanguineo: tipoSanguineo || null,
        peso_kg: pesoKg ? parseFloat(pesoKg) : null,
        altura_cm: alturaCm ? parseInt(alturaCm) : null,
        plano_saude: planoSaude.trim() || null,
        numero_carteirinha: numeroCarteirinha.trim() || null,
        alergias,
        condicoes_cronicas: condicoes,
        observacoes: observacoes.trim() || null,
      });
      addToast("Perfil atualizado!", "success");
      setTimeout(() => router.push(`/saude/${id}`), 600);
    } catch (err) {
      addToast(err instanceof Error ? err.message : "Erro ao salvar", "error");
      setSaving(false);
    }
  }

  if (loading || !ready) {
    return (
      <>
        <Header title="Editar perfil" color={COLOR} showBack />
        <PageContainer>
          <div className="flex flex-col gap-4">
            <Skeleton variant="card" count={4} />
          </div>
        </PageContainer>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header title="Editar perfil" color={COLOR} showBack />
        <PageContainer>
          <p className="text-sm text-[#E53935] text-center py-8">{error}</p>
        </PageContainer>
      </>
    );
  }

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <Header title="Editar perfil de saúde" color={COLOR} showBack />

      <PageContainer>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Identificação */}
          <div className="bg-white rounded-[16px] border border-[#E0E0E0] p-5 flex flex-col gap-4">
            <p className="text-xs font-700 text-[#666666] uppercase tracking-wide">Identificação</p>
            <Input label="Nome completo *" placeholder="Nome do paciente" value={nome}
              onChange={(e) => setNome(e.target.value)} />
            <Input label="Apelido" placeholder="Como é chamado" value={apelido}
              onChange={(e) => setApelido(e.target.value)} />
            <Input label="Data de nascimento" type="date" value={dataNascimento}
              onChange={(e) => setDataNascimento(e.target.value)} />
          </div>

          {/* Dados físicos */}
          <div className="bg-white rounded-[16px] border border-[#E0E0E0] p-5 flex flex-col gap-4">
            <p className="text-xs font-700 text-[#666666] uppercase tracking-wide">Dados físicos</p>
            <div>
              <p className="text-sm font-600 text-[#333333] mb-2">Tipo sanguíneo</p>
              <div className="flex flex-wrap gap-2">
                {TIPOS_SANGUINEOS.map((t) => (
                  <button key={t} type="button"
                    onClick={() => setTipoSanguineo(tipoSanguineo === t ? "" : t)}
                    className="px-4 py-2 rounded-[10px] border text-sm font-700 transition-all"
                    style={{
                      borderColor: tipoSanguineo === t ? COLOR : "#E0E0E0",
                      backgroundColor: tipoSanguineo === t ? `${COLOR}15` : "transparent",
                      color: tipoSanguineo === t ? COLOR : "#666666",
                    }}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-1">
                <Input label="Peso (kg)" type="number" placeholder="70" value={pesoKg}
                  onChange={(e) => setPesoKg(e.target.value)} />
              </div>
              <div className="flex-1">
                <Input label="Altura (cm)" type="number" placeholder="170" value={alturaCm}
                  onChange={(e) => setAlturaCm(e.target.value)} />
              </div>
            </div>
          </div>

          {/* Plano de saúde */}
          <div className="bg-white rounded-[16px] border border-[#E0E0E0] p-5 flex flex-col gap-4">
            <p className="text-xs font-700 text-[#666666] uppercase tracking-wide">Plano de saúde</p>
            <Input label="Operadora" placeholder="Unimed, Bradesco Saúde..." value={planoSaude}
              onChange={(e) => setPlanoSaude(e.target.value)} />
            <Input label="Número da carteirinha" placeholder="0000.0000.0000.0000" value={numeroCarteirinha}
              onChange={(e) => setNumeroCarteirinha(e.target.value)} />
          </div>

          {/* Histórico */}
          <div className="bg-white rounded-[16px] border border-[#E0E0E0] p-5 flex flex-col gap-4">
            <p className="text-xs font-700 text-[#666666] uppercase tracking-wide">Histórico médico</p>
            <div>
              <label className="block text-sm font-600 text-[#333333] mb-1">Alergias</label>
              <p className="text-xs text-[#999999] mb-2">Separe por vírgula: penicilina, amendoim...</p>
              <textarea
                value={alergiasTexto}
                onChange={(e) => setAlergiasTexto(e.target.value)}
                placeholder="penicilina, amendoim, látex..."
                rows={2}
                className="w-full rounded-[10px] border border-[#E0E0E0] px-3 py-2.5 text-sm text-[#333333] bg-white outline-none focus:border-[#00ACC1] resize-none font-[inherit]"
              />
            </div>
            <div>
              <label className="block text-sm font-600 text-[#333333] mb-1">Condições crônicas</label>
              <p className="text-xs text-[#999999] mb-2">Separe por vírgula: diabetes, hipertensão...</p>
              <textarea
                value={condicoesTexto}
                onChange={(e) => setCondicoesTexto(e.target.value)}
                placeholder="diabetes tipo 2, hipertensão..."
                rows={2}
                className="w-full rounded-[10px] border border-[#E0E0E0] px-3 py-2.5 text-sm text-[#333333] bg-white outline-none focus:border-[#00ACC1] resize-none font-[inherit]"
              />
            </div>
            <div>
              <label className="block text-sm font-600 text-[#333333] mb-1">Observações</label>
              <textarea
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Informações adicionais..."
                rows={3}
                className="w-full rounded-[10px] border border-[#E0E0E0] px-3 py-2.5 text-sm text-[#333333] bg-white outline-none focus:border-[#00ACC1] resize-none font-[inherit]"
              />
            </div>
          </div>

          <Button type="submit" fullWidth loading={saving} style={{ backgroundColor: COLOR }}>
            Salvar alterações
          </Button>
        </form>
      </PageContainer>
    </>
  );
}
