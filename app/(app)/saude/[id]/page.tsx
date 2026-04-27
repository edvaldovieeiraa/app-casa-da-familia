"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Edit2, Pill, Calendar, Hospital, Activity, Phone, ChevronRight,
  AlertCircle, Shield, Droplets, Ruler, Weight, ChevronDown, ChevronUp,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { PageContainer } from "@/components/layout/PageContainer";
import { Skeleton } from "@/components/ui/Skeleton";
import { ToastContainer } from "@/components/ui/Toast";
import { usePaciente, useMedicamentos, useConsultas, useInternacoes, useSinaisVitais } from "@/hooks/useSaude";
import { useToast } from "@/hooks/useToast";

const COLOR = "#E91E63";

function calcIdade(dataNascimento: string | null): string | null {
  if (!dataNascimento) return null;
  const nasc = new Date(dataNascimento + "T12:00:00");
  const hoje = new Date();
  let idade = hoje.getFullYear() - nasc.getFullYear();
  const m = hoje.getMonth() - nasc.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) idade--;
  return `${idade} anos`;
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso.includes("T") ? iso : iso + "T12:00:00");
  return d.toLocaleDateString("pt-BR");
}

function Section({ title, icon: Icon, children, color = COLOR, defaultOpen = true }: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  color?: string;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 16, border: "1px solid rgba(255,255,255,0.08)" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between p-4"
      >
        <div className="flex items-center gap-2">
          <Icon size={18} style={{ color }} />
          <span style={{ fontSize: 15, fontWeight: 700, color: "rgba(240,240,255,0.9)" }}>{title}</span>
        </div>
        {open ? <ChevronUp size={16} style={{ color: "rgba(240,240,255,0.4)" }} /> : <ChevronDown size={16} style={{ color: "rgba(240,240,255,0.4)" }} />}
      </button>
      {open && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
}

function QuickAccessButton({ href, icon: Icon, label, count, alert }: {
  href: string; icon: React.ElementType; label: string; count?: number; alert?: boolean;
}) {
  const router = useRouter();
  return (
    <button
      onClick={() => router.push(href)}
      className="flex items-center gap-3 w-full p-3 rounded-[12px] hover:bg-white/5 transition-colors"
      style={{ border: "1px solid rgba(255,255,255,0.08)" }}
    >
      <div className="w-9 h-9 rounded-[10px] flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: alert ? "#FFEBEE" : `${COLOR}20` }}>
        <Icon size={18} style={{ color: alert ? "#E53935" : COLOR }} />
      </div>
      <span className="flex-1 text-left text-sm font-semibold" style={{ color: "rgba(240,240,255,0.85)" }}>{label}</span>
      <div className="flex items-center gap-1.5">
        {count !== undefined && count > 0 && (
          <span className="text-xs font-bold px-1.5 py-0.5 rounded-full"
            style={{ backgroundColor: alert ? "#FFEBEE" : `${COLOR}20`, color: alert ? "#E53935" : COLOR }}>
            {count}
          </span>
        )}
        <ChevronRight size={16} style={{ color: "rgba(240,240,255,0.3)" }} />
      </div>
    </button>
  );
}

export default function PacientePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { toasts, removeToast } = useToast();
  const { paciente, loading } = usePaciente(id);
  const { medicamentos, ativos } = useMedicamentos(id);
  const { proximas } = useConsultas(id);
  const { emCurso } = useInternacoes(id);
  const { sinais } = useSinaisVitais(id);

  const estoquesBaixos = ativos.filter(
    (m) => m.estoque_atual !== null && m.estoque_minimo !== null && m.estoque_atual <= m.estoque_minimo
  );

  const ultimoSinal = sinais[0] ?? null;

  if (loading) {
    return (
      <>
        <Header title="Carregando..." color={COLOR} showBack />
        <PageContainer>
          <div className="flex flex-col gap-3"><Skeleton variant="text" count={6} /></div>
        </PageContainer>
      </>
    );
  }

  if (!paciente) {
    return (
      <>
        <Header title="Paciente" color={COLOR} showBack />
        <PageContainer>
          <p className="text-center py-12" style={{ color: "rgba(240,240,255,0.5)" }}>Paciente não encontrado.</p>
        </PageContainer>
      </>
    );
  }

  const idade = calcIdade(paciente.data_nascimento);

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <Header
        title={paciente.apelido ?? paciente.nome}
        color={COLOR}
        showBack
        actions={
          <button
            onClick={() => router.push(`/saude/${id}/editar`)}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors text-white"
          >
            <Edit2 size={18} />
          </button>
        }
      />

      <PageContainer>
        <div className="flex flex-col gap-4">
          {/* Alerta de internação em curso */}
          {emCurso && (
            <div className="flex items-start gap-3 p-3 rounded-[12px]" style={{ backgroundColor: "#FFEBEE" }}>
              <Hospital size={18} className="mt-0.5 flex-shrink-0" style={{ color: "#E53935" }} />
              <div>
                <p className="text-sm font-bold text-[#E53935]">Internado</p>
                <p className="text-xs text-[#C62828]">
                  {emCurso.hospital ?? "Hospital"} · desde {formatDate(emCurso.data_entrada)}
                </p>
              </div>
            </div>
          )}

          {/* Alerta de estoque baixo */}
          {estoquesBaixos.length > 0 && (
            <div className="flex items-start gap-3 p-3 rounded-[12px]" style={{ backgroundColor: "#FFEBEE" }}>
              <AlertCircle size={18} className="mt-0.5 flex-shrink-0" style={{ color: "#E53935" }} />
              <div>
                <p className="text-sm font-bold text-[#E53935]">Estoque baixo</p>
                <p className="text-xs text-[#C62828]">{estoquesBaixos.map((m) => m.nome).join(", ")}</p>
              </div>
            </div>
          )}

          {/* Dados básicos */}
          <Section title="Dados pessoais" icon={Shield}>
            <div className="grid grid-cols-2 gap-3">
              {idade && (
                <div className="p-3 rounded-[12px]" style={{ background: "rgba(255,255,255,0.05)" }}>
                  <p className="text-[11px] font-semibold" style={{ color: "rgba(240,240,255,0.5)" }}>IDADE</p>
                  <p className="text-base font-bold mt-0.5" style={{ color: "rgba(240,240,255,0.9)" }}>{idade}</p>
                </div>
              )}
              {paciente.tipo_sanguineo && (
                <div className="p-3 rounded-[12px]" style={{ background: "rgba(255,255,255,0.05)" }}>
                  <div className="flex items-center gap-1 mb-0.5">
                    <Droplets size={11} style={{ color: "#E53935" }} />
                    <p className="text-[11px] font-semibold" style={{ color: "rgba(240,240,255,0.5)" }}>TIPO SANG.</p>
                  </div>
                  <p className="text-base font-bold" style={{ color: "#E53935" }}>{paciente.tipo_sanguineo}</p>
                </div>
              )}
              {paciente.peso_kg && (
                <div className="p-3 rounded-[12px]" style={{ background: "rgba(255,255,255,0.05)" }}>
                  <div className="flex items-center gap-1 mb-0.5">
                    <Weight size={11} style={{ color: COLOR }} />
                    <p className="text-[11px] font-semibold" style={{ color: "rgba(240,240,255,0.5)" }}>PESO</p>
                  </div>
                  <p className="text-base font-bold" style={{ color: "rgba(240,240,255,0.9)" }}>{paciente.peso_kg} kg</p>
                </div>
              )}
              {paciente.altura_cm && (
                <div className="p-3 rounded-[12px]" style={{ background: "rgba(255,255,255,0.05)" }}>
                  <div className="flex items-center gap-1 mb-0.5">
                    <Ruler size={11} style={{ color: COLOR }} />
                    <p className="text-[11px] font-semibold" style={{ color: "rgba(240,240,255,0.5)" }}>ALTURA</p>
                  </div>
                  <p className="text-base font-bold" style={{ color: "rgba(240,240,255,0.9)" }}>{paciente.altura_cm} cm</p>
                </div>
              )}
            </div>

            {paciente.condicoes_cronicas && paciente.condicoes_cronicas.length > 0 && (
              <div className="mt-3">
                <p className="text-[11px] font-semibold mb-1.5" style={{ color: "rgba(240,240,255,0.5)" }}>CONDIÇÕES CRÔNICAS</p>
                <div className="flex flex-wrap gap-1.5">
                  {paciente.condicoes_cronicas.map((c) => (
                    <span key={c} className="text-xs px-2.5 py-1 rounded-full font-semibold"
                      style={{ backgroundColor: "#FFF3E0", color: "#E65100" }}>
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {paciente.alergias && paciente.alergias.length > 0 && (
              <div className="mt-3">
                <p className="text-[11px] font-semibold mb-1.5" style={{ color: "rgba(240,240,255,0.5)" }}>ALERGIAS</p>
                <div className="flex flex-wrap gap-1.5">
                  {paciente.alergias.map((a) => (
                    <span key={a} className="text-xs px-2.5 py-1 rounded-full font-semibold"
                      style={{ backgroundColor: "#FFEBEE", color: "#C62828" }}>
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {paciente.plano_saude && (
              <div className="mt-3 p-3 rounded-[12px]" style={{ background: "rgba(255,255,255,0.05)" }}>
                <p className="text-[11px] font-semibold" style={{ color: "rgba(240,240,255,0.5)" }}>PLANO DE SAÚDE</p>
                <p className="text-sm font-semibold mt-0.5" style={{ color: "rgba(240,240,255,0.85)" }}>{paciente.plano_saude}</p>
                {paciente.numero_carteirinha && (
                  <p className="text-xs mt-0.5" style={{ color: "rgba(240,240,255,0.5)" }}>Carteirinha: {paciente.numero_carteirinha}</p>
                )}
              </div>
            )}
          </Section>

          {/* Último sinal vital */}
          {ultimoSinal && (
            <Section title="Último sinal vital" icon={Activity} color="#4CAF50" defaultOpen={false}>
              <p className="text-xs mb-2" style={{ color: "rgba(240,240,255,0.4)" }}>{formatDate(ultimoSinal.data_hora)}</p>
              <div className="grid grid-cols-3 gap-2">
                {ultimoSinal.pressao_sistolica && ultimoSinal.pressao_diastolica && (
                  <div className="p-2 rounded-[10px] text-center" style={{ background: "rgba(255,255,255,0.05)" }}>
                    <p className="text-[10px] font-semibold" style={{ color: "rgba(240,240,255,0.5)" }}>PRESSÃO</p>
                    <p className="text-sm font-bold" style={{ color: "#4CAF50" }}>
                      {ultimoSinal.pressao_sistolica}/{ultimoSinal.pressao_diastolica}
                    </p>
                  </div>
                )}
                {ultimoSinal.frequencia_cardiaca && (
                  <div className="p-2 rounded-[10px] text-center" style={{ background: "rgba(255,255,255,0.05)" }}>
                    <p className="text-[10px] font-semibold" style={{ color: "rgba(240,240,255,0.5)" }}>BPM</p>
                    <p className="text-sm font-bold" style={{ color: "#4CAF50" }}>{ultimoSinal.frequencia_cardiaca}</p>
                  </div>
                )}
                {ultimoSinal.glicemia && (
                  <div className="p-2 rounded-[10px] text-center" style={{ background: "rgba(255,255,255,0.05)" }}>
                    <p className="text-[10px] font-semibold" style={{ color: "rgba(240,240,255,0.5)" }}>GLICEMIA</p>
                    <p className="text-sm font-bold" style={{ color: "#4CAF50" }}>{ultimoSinal.glicemia}</p>
                  </div>
                )}
                {ultimoSinal.saturacao_o2 && (
                  <div className="p-2 rounded-[10px] text-center" style={{ background: "rgba(255,255,255,0.05)" }}>
                    <p className="text-[10px] font-semibold" style={{ color: "rgba(240,240,255,0.5)" }}>SpO2</p>
                    <p className="text-sm font-bold" style={{ color: "#4CAF50" }}>{ultimoSinal.saturacao_o2}%</p>
                  </div>
                )}
                {ultimoSinal.temperatura && (
                  <div className="p-2 rounded-[10px] text-center" style={{ background: "rgba(255,255,255,0.05)" }}>
                    <p className="text-[10px] font-semibold" style={{ color: "rgba(240,240,255,0.5)" }}>TEMP.</p>
                    <p className="text-sm font-bold" style={{ color: "#4CAF50" }}>{ultimoSinal.temperatura}°C</p>
                  </div>
                )}
              </div>
            </Section>
          )}

          {/* Acesso rápido */}
          <Section title="Acompanhamento" icon={ChevronRight} color={COLOR}>
            <div className="flex flex-col gap-2">
              <QuickAccessButton
                href={`/saude/${id}/medicamentos`}
                icon={Pill}
                label="Medicamentos"
                count={ativos.length}
                alert={estoquesBaixos.length > 0}
              />
              <QuickAccessButton
                href={`/saude/${id}/consultas`}
                icon={Calendar}
                label="Consultas"
                count={proximas.length}
              />
              <QuickAccessButton
                href={`/saude/${id}/internacoes`}
                icon={Hospital}
                label="Internações"
                alert={!!emCurso}
              />
              <QuickAccessButton
                href={`/saude/${id}/sinais`}
                icon={Activity}
                label="Sinais Vitais"
                count={sinais.length}
              />
              <QuickAccessButton
                href={`/saude/${id}/emergencia`}
                icon={Phone}
                label="Emergência"
                alert={false}
              />
            </div>
          </Section>

          {/* Observações */}
          {paciente.observacoes && (
            <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 16, padding: 16, border: "1px solid rgba(255,255,255,0.08)" }}>
              <p className="text-[11px] font-semibold mb-2" style={{ color: "rgba(240,240,255,0.5)" }}>OBSERVAÇÕES</p>
              <p className="text-sm" style={{ color: "rgba(240,240,255,0.7)", lineHeight: 1.6 }}>{paciente.observacoes}</p>
            </div>
          )}
        </div>
      </PageContainer>
    </>
  );
}
