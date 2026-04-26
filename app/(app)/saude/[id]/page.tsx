"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Edit, Trash2, Pill, Calendar, Activity, Phone,
  Plus, ChevronDown, ChevronUp, Check, X as XIcon,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Skeleton } from "@/components/ui/Skeleton";
import { ToastContainer } from "@/components/ui/Toast";
import { useToast } from "@/hooks/useToast";
import { usePaciente, usePacientes } from "@/hooks/useSaude";
import type { SaudeConsultaTipo } from "@/types/database";

const COLOR = "#00ACC1";

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}
function formatDatetime(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

type Tab = "medicamentos" | "consultas" | "vitais" | "contatos";

export default function DetalhesPacientePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const {
    paciente, medicamentos, consultas, sinaisVitais, contatos,
    loading, error, refetch,
    addMedicamento, updateMedicamento, deleteMedicamento,
    addConsulta, deleteConsulta,
    addSinalVital,
  } = usePaciente(id);
  const { deletePaciente } = usePacientes();
  const { toasts, addToast, removeToast } = useToast();

  const [tab, setTab] = useState<Tab>("medicamentos");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Modal — novo medicamento
  const [medModal, setMedModal] = useState(false);
  const [medNome, setMedNome] = useState("");
  const [medDose, setMedDose] = useState("");
  const [medFreq, setMedFreq] = useState("");
  const [medContínuo, setMedContinuo] = useState(false);
  const [savingMed, setSavingMed] = useState(false);

  // Modal — nova consulta
  const [consModal, setConsModal] = useState(false);
  const [consTipo, setConsTipo] = useState<SaudeConsultaTipo>("consulta");
  const [consEsp, setConsEsp] = useState("");
  const [consMedico, setConsMedico] = useState("");
  const [consLocal, setConsLocal] = useState("");
  const [consData, setConsData] = useState("");
  const [savingCons, setSavingCons] = useState(false);

  // Modal — sinal vital
  const [svModal, setSvModal] = useState(false);
  const [svPressS, setSvPressS] = useState("");
  const [svPressD, setSvPressD] = useState("");
  const [svFC, setSvFC] = useState("");
  const [svGlic, setSvGlic] = useState("");
  const [svSat, setSvSat] = useState("");
  const [svTemp, setSvTemp] = useState("");
  const [savingSv, setSavingSv] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    try {
      await deletePaciente(id);
      addToast("Perfil excluído", "success");
      setTimeout(() => router.push("/saude"), 600);
    } catch {
      addToast("Erro ao excluir", "error");
      setDeleting(false);
    }
  }

  async function handleAddMed(e: React.FormEvent) {
    e.preventDefault();
    if (!medNome.trim()) return;
    setSavingMed(true);
    try {
      await addMedicamento({
        nome: medNome.trim(), principio_ativo: null,
        dose: medDose.trim() || null, unidade: null,
        frequencia: medFreq.trim() || null, horarios: null,
        estoque_atual: null, estoque_minimo: 5,
        data_inicio: null, data_fim: null,
        medico_prescreveu: null,
        uso_continuo: medContínuo, ativo: true, observacoes: null,
      });
      addToast("Medicamento adicionado!", "success");
      setMedNome(""); setMedDose(""); setMedFreq(""); setMedContinuo(false);
      setMedModal(false);
    } catch (err) {
      addToast(err instanceof Error ? err.message : "Erro ao salvar", "error");
    } finally { setSavingMed(false); }
  }

  async function handleAddCons(e: React.FormEvent) {
    e.preventDefault();
    setSavingCons(true);
    try {
      await addConsulta({
        tipo: consTipo, especialidade: consEsp.trim() || null,
        medico: consMedico.trim() || null, local: consLocal.trim() || null,
        data_hora: consData || null, resultado: null, anexo_url: null, observacoes: null,
      });
      addToast("Consulta adicionada!", "success");
      setConsEsp(""); setConsMedico(""); setConsLocal(""); setConsData("");
      setConsModal(false);
    } catch (err) {
      addToast(err instanceof Error ? err.message : "Erro ao salvar", "error");
    } finally { setSavingCons(false); }
  }

  async function handleAddSv(e: React.FormEvent) {
    e.preventDefault();
    setSavingSv(true);
    try {
      await addSinalVital({
        data_hora: new Date().toISOString(),
        pressao_sistolica: svPressS ? parseInt(svPressS) : null,
        pressao_diastolica: svPressD ? parseInt(svPressD) : null,
        frequencia_cardiaca: svFC ? parseInt(svFC) : null,
        glicemia: svGlic ? parseFloat(svGlic) : null,
        saturacao_o2: svSat ? parseFloat(svSat) : null,
        peso_kg: null, temperatura: svTemp ? parseFloat(svTemp) : null,
        observacao: null,
      });
      addToast("Registro salvo!", "success");
      setSvPressS(""); setSvPressD(""); setSvFC(""); setSvGlic(""); setSvSat(""); setSvTemp("");
      setSvModal(false);
    } catch (err) {
      addToast(err instanceof Error ? err.message : "Erro ao salvar", "error");
    } finally { setSavingSv(false); }
  }

  const TABS: { key: Tab; label: string; icon: typeof Pill; count: number }[] = [
    { key: "medicamentos", label: "Remédios", icon: Pill, count: medicamentos.length },
    { key: "consultas", label: "Consultas", icon: Calendar, count: consultas.length },
    { key: "vitais", label: "Sinais", icon: Activity, count: sinaisVitais.length },
    { key: "contatos", label: "Contatos", icon: Phone, count: contatos.length },
  ];

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <Header
        title={paciente?.nome ?? "Saúde"}
        color={COLOR}
        showBack
        actions={paciente && (
          <button onClick={() => router.push(`/saude/${id}/editar`)} aria-label="Editar"
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors text-white">
            <Edit size={20} />
          </button>
        )}
      />

      <PageContainer>
        {loading && <Skeleton variant="card" count={4} />}
        {!loading && error && <p className="text-sm text-[#E53935] text-center py-8">{error}</p>}

        {!loading && !error && paciente && (
          <div className="flex flex-col gap-4">
            {/* Card resumo */}
            <div className="bg-white rounded-[16px] border border-[#E0E0E0] p-5">
              <div className="flex gap-4 items-start">
                <div className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-800 text-white flex-shrink-0"
                  style={{ background: `linear-gradient(135deg, ${COLOR}, #00838F)` }}>
                  {paciente.nome.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-800 text-[#333333] text-lg leading-snug">{paciente.nome}</p>
                  {paciente.apelido && <p className="text-sm text-[#666666]">{paciente.apelido}</p>}
                  <div className="flex flex-wrap gap-2 mt-2">
                    {paciente.tipo_sanguineo && (
                      <span className="text-xs font-800 px-2.5 py-1 rounded-full text-white" style={{ backgroundColor: "#E53935" }}>
                        {paciente.tipo_sanguineo}
                      </span>
                    )}
                    {paciente.plano_saude && (
                      <span className="text-xs font-600 px-2.5 py-1 rounded-full" style={{ backgroundColor: `${COLOR}15`, color: COLOR }}>
                        {paciente.plano_saude}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Alergias */}
              {paciente.alergias && paciente.alergias.length > 0 && (
                <div className="mt-4 pt-3 border-t border-[#F0F0F0]">
                  <p className="text-xs font-700 text-[#E53935] uppercase tracking-wide mb-1.5">⚠ Alergias</p>
                  <div className="flex flex-wrap gap-1.5">
                    {paciente.alergias.map((a) => (
                      <span key={a} className="text-xs px-2.5 py-1 rounded-full font-600"
                        style={{ backgroundColor: "#FFEBEE", color: "#C62828" }}>
                        {a}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Condições */}
              {paciente.condicoes_cronicas && paciente.condicoes_cronicas.length > 0 && (
                <div className="mt-3 pt-3 border-t border-[#F0F0F0]">
                  <p className="text-xs font-700 text-[#666666] uppercase tracking-wide mb-1.5">Condições crônicas</p>
                  <div className="flex flex-wrap gap-1.5">
                    {paciente.condicoes_cronicas.map((c) => (
                      <span key={c} className="text-xs px-2.5 py-1 rounded-full font-600"
                        style={{ backgroundColor: "#FFF3E0", color: "#E65100" }}>
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-[#F5F5F5] p-1 rounded-[14px]">
              {TABS.map(({ key, label, icon: Icon, count }) => (
                <button key={key} onClick={() => setTab(key)}
                  className="flex-1 flex flex-col items-center gap-0.5 py-2 rounded-[10px] transition-all"
                  style={{
                    backgroundColor: tab === key ? "#FFFFFF" : "transparent",
                    color: tab === key ? COLOR : "#999999",
                    boxShadow: tab === key ? "0 1px 4px rgba(0,0,0,0.1)" : "none",
                  }}>
                  <Icon size={18} />
                  <span className="text-[10px] font-700">{label}</span>
                  {count > 0 && (
                    <span className="text-[9px] font-800" style={{ color: tab === key ? COLOR : "#BDBDBD" }}>
                      {count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <AnimatePresence mode="wait">
              <motion.div key={tab}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.15 }}>

                {/* MEDICAMENTOS */}
                {tab === "medicamentos" && (
                  <div className="flex flex-col gap-3">
                    <Button fullWidth icon={Plus} onClick={() => setMedModal(true)}
                      style={{ backgroundColor: COLOR }}>
                      Adicionar medicamento
                    </Button>
                    {medicamentos.length === 0 && (
                      <p className="text-sm text-[#999999] text-center py-6">Nenhum medicamento cadastrado</p>
                    )}
                    {medicamentos.map((m) => (
                      <div key={m.id} className="bg-white rounded-[14px] border border-[#E0E0E0] p-4 flex gap-3 items-start">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: `${COLOR}15` }}>
                          <Pill size={16} style={{ color: COLOR }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className="font-700 text-[#333333] text-sm">{m.nome}</p>
                            <button onClick={async () => {
                              try { await deleteMedicamento(m.id); addToast("Removido", "success"); }
                              catch { addToast("Erro ao remover", "error"); }
                            }} className="text-[#BDBDBD] hover:text-[#E53935] transition-colors flex-shrink-0">
                              <Trash2 size={14} />
                            </button>
                          </div>
                          {m.dose && <p className="text-xs text-[#666666] mt-0.5">{m.dose}{m.unidade ? ` ${m.unidade}` : ""}</p>}
                          {m.frequencia && <p className="text-xs text-[#666666]">{m.frequencia}</p>}
                          {m.uso_continuo && (
                            <span className="inline-block mt-1 text-[10px] font-700 px-2 py-0.5 rounded-full"
                              style={{ backgroundColor: `${COLOR}15`, color: COLOR }}>
                              Uso contínuo
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* CONSULTAS */}
                {tab === "consultas" && (
                  <div className="flex flex-col gap-3">
                    <Button fullWidth icon={Plus} onClick={() => setConsModal(true)}
                      style={{ backgroundColor: COLOR }}>
                      Adicionar consulta / exame
                    </Button>
                    {consultas.length === 0 && (
                      <p className="text-sm text-[#999999] text-center py-6">Nenhuma consulta registrada</p>
                    )}
                    {consultas.map((c) => (
                      <div key={c.id} className="bg-white rounded-[14px] border border-[#E0E0E0] p-4">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-700 text-[#333333] text-sm">
                              {c.tipo === "exame" ? "Exame" : c.tipo === "retorno" ? "Retorno" : "Consulta"}
                              {c.especialidade ? ` — ${c.especialidade}` : ""}
                            </p>
                            {c.medico && <p className="text-xs text-[#666666] mt-0.5">Dr(a). {c.medico}</p>}
                            {c.local && <p className="text-xs text-[#666666]">{c.local}</p>}
                            {c.data_hora && (
                              <p className="text-xs font-600 mt-1" style={{ color: COLOR }}>
                                {formatDatetime(c.data_hora)}
                              </p>
                            )}
                          </div>
                          <button onClick={async () => {
                            try { await deleteConsulta(c.id); addToast("Removida", "success"); }
                            catch { addToast("Erro ao remover", "error"); }
                          }} className="text-[#BDBDBD] hover:text-[#E53935] transition-colors flex-shrink-0">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* SINAIS VITAIS */}
                {tab === "vitais" && (
                  <div className="flex flex-col gap-3">
                    <Button fullWidth icon={Plus} onClick={() => setSvModal(true)}
                      style={{ backgroundColor: COLOR }}>
                      Registrar sinais vitais
                    </Button>
                    {sinaisVitais.length === 0 && (
                      <p className="text-sm text-[#999999] text-center py-6">Nenhum registro de sinais vitais</p>
                    )}
                    {sinaisVitais.map((sv) => (
                      <div key={sv.id} className="bg-white rounded-[14px] border border-[#E0E0E0] p-4">
                        <p className="text-xs font-600 text-[#999999] mb-2">{formatDatetime(sv.data_hora)}</p>
                        <div className="grid grid-cols-3 gap-2">
                          {sv.pressao_sistolica && sv.pressao_diastolica && (
                            <div className="text-center">
                              <p className="text-[10px] text-[#666666]">Pressão</p>
                              <p className="text-sm font-800 text-[#E53935]">{sv.pressao_sistolica}/{sv.pressao_diastolica}</p>
                            </div>
                          )}
                          {sv.frequencia_cardiaca && (
                            <div className="text-center">
                              <p className="text-[10px] text-[#666666]">BPM</p>
                              <p className="text-sm font-800 text-[#E91E63]">{sv.frequencia_cardiaca}</p>
                            </div>
                          )}
                          {sv.glicemia && (
                            <div className="text-center">
                              <p className="text-[10px] text-[#666666]">Glicemia</p>
                              <p className="text-sm font-800 text-[#F57C00]">{sv.glicemia}</p>
                            </div>
                          )}
                          {sv.saturacao_o2 && (
                            <div className="text-center">
                              <p className="text-[10px] text-[#666666]">SpO₂</p>
                              <p className="text-sm font-800" style={{ color: COLOR }}>{sv.saturacao_o2}%</p>
                            </div>
                          )}
                          {sv.temperatura && (
                            <div className="text-center">
                              <p className="text-[10px] text-[#666666]">Temp</p>
                              <p className="text-sm font-800 text-[#00897B]">{sv.temperatura}°C</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* CONTATOS */}
                {tab === "contatos" && (
                  <div className="flex flex-col gap-3">
                    {contatos.length === 0 && (
                      <p className="text-sm text-[#999999] text-center py-6">Nenhum contato de emergência</p>
                    )}
                    {contatos.map((c) => (
                      <div key={c.id} className="bg-white rounded-[14px] border border-[#E0E0E0] p-4 flex gap-3 items-center">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: "#FFF3E0" }}>
                          <Phone size={16} className="text-[#F57C00]" />
                        </div>
                        <div className="flex-1">
                          <p className="font-700 text-[#333333] text-sm">{c.nome}</p>
                          {c.relacao && <p className="text-xs text-[#666666]">{c.relacao}</p>}
                          <a href={`tel:${c.telefone}`} className="text-sm font-700 mt-0.5 block"
                            style={{ color: COLOR }}>{c.telefone}</a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Excluir */}
            <div className="pt-2">
              <Button variant="danger" fullWidth icon={Trash2} onClick={() => setConfirmDelete(true)}>
                Excluir perfil
              </Button>
            </div>
          </div>
        )}
      </PageContainer>

      {/* Modal — medicamento */}
      <Modal open={medModal} onClose={() => setMedModal(false)} title="Novo medicamento" size="sm">
        <form onSubmit={handleAddMed} className="flex flex-col gap-4">
          <Input label="Nome *" placeholder="Losartana, Metformina..." value={medNome}
            onChange={(e) => setMedNome(e.target.value)} />
          <Input label="Dose" placeholder="50mg, 500mg..." value={medDose}
            onChange={(e) => setMedDose(e.target.value)} />
          <Input label="Frequência" placeholder="1x ao dia, 2x ao dia..." value={medFreq}
            onChange={(e) => setMedFreq(e.target.value)} />
          <label className="flex items-center gap-3 cursor-pointer">
            <div onClick={() => setMedContinuo(!medContínuo)}
              className="w-12 h-6 rounded-full transition-colors flex items-center px-1"
              style={{ backgroundColor: medContínuo ? COLOR : "#E0E0E0" }}>
              <div className="w-4 h-4 bg-white rounded-full transition-transform"
                style={{ transform: medContínuo ? "translateX(24px)" : "translateX(0)" }} />
            </div>
            <span className="text-sm font-600 text-[#333333]">Uso contínuo</span>
          </label>
          <Button type="submit" fullWidth loading={savingMed} style={{ backgroundColor: COLOR }}>
            Adicionar
          </Button>
        </form>
      </Modal>

      {/* Modal — consulta */}
      <Modal open={consModal} onClose={() => setConsModal(false)} title="Nova consulta / exame" size="sm">
        <form onSubmit={handleAddCons} className="flex flex-col gap-4">
          <div>
            <p className="text-sm font-600 text-[#333333] mb-2">Tipo</p>
            <div className="flex gap-2">
              {(["consulta", "exame", "retorno"] as SaudeConsultaTipo[]).map((t) => (
                <button key={t} type="button" onClick={() => setConsTipo(t)}
                  className="flex-1 py-2 rounded-[10px] border text-sm font-600 transition-all capitalize"
                  style={{
                    borderColor: consTipo === t ? COLOR : "#E0E0E0",
                    backgroundColor: consTipo === t ? `${COLOR}15` : "transparent",
                    color: consTipo === t ? COLOR : "#666666",
                  }}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <Input label="Especialidade" placeholder="Cardiologia, Endocrinologia..." value={consEsp}
            onChange={(e) => setConsEsp(e.target.value)} />
          <Input label="Médico" placeholder="Nome do médico" value={consMedico}
            onChange={(e) => setConsMedico(e.target.value)} />
          <Input label="Local / Hospital" placeholder="Hospital, clínica..." value={consLocal}
            onChange={(e) => setConsLocal(e.target.value)} />
          <Input label="Data e horário" type="datetime-local" value={consData}
            onChange={(e) => setConsData(e.target.value)} />
          <Button type="submit" fullWidth loading={savingCons} style={{ backgroundColor: COLOR }}>
            Salvar
          </Button>
        </form>
      </Modal>

      {/* Modal — sinais vitais */}
      <Modal open={svModal} onClose={() => setSvModal(false)} title="Sinais vitais" size="sm">
        <form onSubmit={handleAddSv} className="flex flex-col gap-3">
          <div className="flex gap-3">
            <Input label="Pressão sistólica" placeholder="120" value={svPressS}
              onChange={(e) => setSvPressS(e.target.value)} type="number" />
            <Input label="Diastólica" placeholder="80" value={svPressD}
              onChange={(e) => setSvPressD(e.target.value)} type="number" />
          </div>
          <Input label="Freq. cardíaca (BPM)" placeholder="70" value={svFC}
            onChange={(e) => setSvFC(e.target.value)} type="number" />
          <Input label="Glicemia (mg/dL)" placeholder="100" value={svGlic}
            onChange={(e) => setSvGlic(e.target.value)} type="number" />
          <Input label="Saturação O₂ (%)" placeholder="98" value={svSat}
            onChange={(e) => setSvSat(e.target.value)} type="number" />
          <Input label="Temperatura (°C)" placeholder="36.5" value={svTemp}
            onChange={(e) => setSvTemp(e.target.value)} type="number" />
          <Button type="submit" fullWidth loading={savingSv} style={{ backgroundColor: COLOR }}>
            Registrar
          </Button>
        </form>
      </Modal>

      {/* Confirmar exclusão */}
      <Modal open={confirmDelete} onClose={() => setConfirmDelete(false)} title="Excluir perfil" size="sm">
        <p className="text-[#666666] mb-6">
          Excluir <strong>{paciente?.nome}</strong>? Todos os dados serão perdidos permanentemente.
        </p>
        <div className="flex flex-col gap-3">
          <Button variant="danger" fullWidth loading={deleting} onClick={handleDelete}>
            Sim, excluir tudo
          </Button>
          <Button variant="secondary" fullWidth onClick={() => setConfirmDelete(false)} disabled={deleting}>
            Cancelar
          </Button>
        </div>
      </Modal>
    </>
  );
}
