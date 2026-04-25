"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Car, Edit, Trash2, Plus, AlertTriangle, Clock, Wrench } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Skeleton } from "@/components/ui/Skeleton";
import { CopyField } from "@/components/ui/CopyButton";
import { ToastContainer } from "@/components/ui/Toast";
import { ManutencaoCard } from "@/components/modules/veiculos/ManutencaoCard";
import { useVeiculo, useVeiculos } from "@/hooks/useVeiculos";
import { useToast } from "@/hooks/useToast";

const COLOR = "#F57C00";

function formatDate(iso: string | null) {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

function formatMoney(v: number | null) {
  if (v == null) return "—";
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function diasAte(dataStr: string | null): number | null {
  if (!dataStr) return null;
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  return Math.ceil((new Date(dataStr + "T12:00:00").getTime() - hoje.getTime()) / 86400000);
}

function DocRow({ label, data }: { label: string; data: string | null }) {
  const dias = diasAte(data);
  const vencido = dias !== null && dias < 0;
  const alerta = dias !== null && dias >= 0 && dias <= 30;

  return (
    <div className="flex items-center justify-between py-3 border-b border-[#F0F0F0] last:border-0">
      <div>
        <p className="text-xs text-[#666666]">{label}</p>
        <p className="text-base font-600 text-[#333333]">{formatDate(data)}</p>
      </div>
      {vencido && (
        <span className="flex items-center gap-1 text-[11px] font-700 px-2 py-0.5 rounded-full bg-[#FEF2F2] text-[#E53935]">
          <AlertTriangle size={11} /> Vencido
        </span>
      )}
      {alerta && (
        <span className="flex items-center gap-1 text-[11px] font-700 px-2 py-0.5 rounded-full bg-[#FFFBEB] text-[#F5C842]">
          <Clock size={11} /> {dias}d
        </span>
      )}
    </div>
  );
}

export default function DetalhesVeiculoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { veiculo, manutencoes, loading, error } = useVeiculo(id);
  const { deleteVeiculo } = useVeiculos();
  const { toasts, addToast, removeToast } = useToast();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const titulo = veiculo?.apelido
    ?? ([veiculo?.marca, veiculo?.modelo].filter(Boolean).join(" ") || veiculo?.placa || "Veículo");

  const alertas = [
    { label: "IPVA", data: veiculo?.data_vencimento_ipva ?? null },
    { label: "Seguro", data: veiculo?.data_vencimento_seguro ?? null },
    { label: "CNH", data: veiculo?.data_vencimento_cnh ?? null },
    { label: "Licenciamento", data: veiculo?.data_vencimento_licenciamento ?? null },
  ].filter(({ data }) => { const d = diasAte(data); return d !== null && d <= 30; });

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteVeiculo(id);
      addToast("Veículo excluído", "success");
      setTimeout(() => router.push("/veiculos"), 600);
    } catch {
      addToast("Não foi possível excluir", "error");
      setDeleting(false);
      setConfirmDelete(false);
    }
  }

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <Header title={titulo} color={COLOR} showBack
        actions={veiculo && (
          <button onClick={() => router.push(`/veiculos/${id}/editar`)} aria-label="Editar"
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors text-white">
            <Edit size={20} />
          </button>
        )} />

      <PageContainer>
        {loading && <div className="flex flex-col gap-4"><Skeleton variant="card" count={4} /></div>}
        {!loading && error && <p className="text-sm text-[#E53935] text-center py-8">{error}</p>}

        {!loading && !error && veiculo && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-4">

            {/* Alertas de vencimento */}
            {alertas.length > 0 && (
              <div className="rounded-[16px] p-4 flex flex-col gap-2" style={{ backgroundColor: "#FFF8F0", border: "1px solid #F57C0040" }}>
                <p className="text-xs font-700 text-[#F57C00] uppercase tracking-wide">Atenção</p>
                {alertas.map(({ label, data }) => {
                  const dias = diasAte(data);
                  const vencido = dias !== null && dias < 0;
                  return (
                    <div key={label} className="flex items-center gap-2">
                      <AlertTriangle size={14} style={{ color: vencido ? "#E53935" : "#F5C842" }} />
                      <span className="text-sm font-600" style={{ color: vencido ? "#E53935" : "#92400E" }}>
                        {label}: {vencido ? `vencido há ${Math.abs(dias!)}d` : `vence em ${dias}d`}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Header card */}
            <div className="bg-white rounded-[16px] border border-[#E0E0E0] p-5 flex items-center gap-4">
              <div className="w-16 h-16 rounded-[12px] flex items-center justify-center flex-shrink-0 overflow-hidden"
                style={{ backgroundColor: `${COLOR}20` }}>
                {veiculo.foto_url
                  ? <img src={veiculo.foto_url} alt={titulo} className="w-full h-full object-cover" />
                  : <Car size={32} style={{ color: COLOR }} />
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xl font-800 text-[#333333]">{titulo}</p>
                {veiculo.placa && (
                  <span className="inline-block text-xs font-700 px-2 py-0.5 rounded-full bg-[#F0F0F0] text-[#666666] mt-1">
                    {veiculo.placa}
                  </span>
                )}
                {veiculo.modelo && (
                  <p className="text-sm text-[#666666] mt-0.5">
                    {[veiculo.marca, veiculo.modelo, veiculo.ano_modelo].filter(Boolean).join(" · ")}
                  </p>
                )}
                {veiculo.cor && <p className="text-xs text-[#999999]">{veiculo.cor}</p>}
              </div>
            </div>

            {/* Dados básicos */}
            <div className="bg-white rounded-[16px] border border-[#E0E0E0] px-5 py-2">
              {veiculo.placa && <CopyField label="Placa" value={veiculo.placa} />}
              {veiculo.renavam && <CopyField label="RENAVAM" value={veiculo.renavam} />}
              {veiculo.chassi && <CopyField label="Chassi" value={veiculo.chassi} />}
            </div>

            {/* Documentação */}
            <div className="bg-white rounded-[16px] border border-[#E0E0E0] p-5">
              <p className="text-xs font-700 text-[#666666] uppercase tracking-wide mb-1">Documentação</p>
              <DocRow label="IPVA" data={veiculo.data_vencimento_ipva} />
              {veiculo.valor_ipva && (
                <div className="flex items-center justify-between py-3 border-b border-[#F0F0F0]">
                  <div>
                    <p className="text-xs text-[#666666]">Valor IPVA</p>
                    <p className="text-base font-600 text-[#333333]">{formatMoney(veiculo.valor_ipva)}</p>
                  </div>
                </div>
              )}
              <DocRow label="Licenciamento" data={veiculo.data_vencimento_licenciamento} />
              <DocRow label="Seguro" data={veiculo.data_vencimento_seguro} />
              {veiculo.seguradora && (
                <div className="py-3 border-b border-[#F0F0F0] last:border-0">
                  <p className="text-xs text-[#666666]">Seguradora</p>
                  <p className="text-base font-600 text-[#333333]">{veiculo.seguradora}</p>
                </div>
              )}
              {veiculo.numero_apolice && <CopyField label="Nº Apólice" value={veiculo.numero_apolice} />}
              <DocRow label="CNH" data={veiculo.data_vencimento_cnh} />
              {veiculo.categoria_cnh && (
                <div className="py-3 last:border-0">
                  <p className="text-xs text-[#666666]">Categoria CNH</p>
                  <p className="text-base font-600 text-[#333333]">{veiculo.categoria_cnh}</p>
                </div>
              )}
            </div>

            {/* Financiamento */}
            {veiculo.financiado && (
              <div className="bg-white rounded-[16px] border border-[#E0E0E0] p-5">
                <p className="text-xs font-700 text-[#666666] uppercase tracking-wide mb-1">Financiamento</p>
                {veiculo.banco_financiamento && (
                  <div className="py-3 border-b border-[#F0F0F0]">
                    <p className="text-xs text-[#666666]">Banco / Financeira</p>
                    <p className="text-base font-600 text-[#333333]">{veiculo.banco_financiamento}</p>
                  </div>
                )}
                <div className="flex gap-4 py-3 border-b border-[#F0F0F0]">
                  <div className="flex-1">
                    <p className="text-xs text-[#666666]">Parcela</p>
                    <p className="text-base font-600 text-[#333333]">{formatMoney(veiculo.valor_parcela)}</p>
                  </div>
                  {veiculo.parcelas_restantes != null && (
                    <div className="flex-1">
                      <p className="text-xs text-[#666666]">Parcelas restantes</p>
                      <p className="text-base font-600 text-[#333333]">{veiculo.parcelas_restantes}</p>
                    </div>
                  )}
                </div>
                {veiculo.data_vencimento_parcela && (
                  <div className="py-3">
                    <p className="text-xs text-[#666666]">Próximo vencimento</p>
                    <p className="text-base font-600 text-[#333333]">{formatDate(veiculo.data_vencimento_parcela)}</p>
                  </div>
                )}
              </div>
            )}

            {/* Manutenções */}
            <div className="bg-white rounded-[16px] border border-[#E0E0E0] p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-700 text-[#666666] uppercase tracking-wide flex items-center gap-1.5">
                  <Wrench size={13} /> Manutenções
                </p>
                <button onClick={() => router.push(`/veiculos/${id}/manutencao/novo`)}
                  className="flex items-center gap-1 text-xs font-700 px-3 py-1.5 rounded-full min-h-[32px]"
                  style={{ backgroundColor: `${COLOR}20`, color: COLOR }}>
                  <Plus size={13} /> Registrar
                </button>
              </div>
              {manutencoes.length === 0 ? (
                <p className="text-sm text-[#999999] text-center py-4">Nenhuma manutenção registrada</p>
              ) : (
                manutencoes.slice(0, 5).map((m, i) => <ManutencaoCard key={m.id} manutencao={m} index={i} />)
              )}
              {manutencoes.length > 5 && (
                <p className="text-xs text-center text-[#666666] mt-3">
                  + {manutencoes.length - 5} registros anteriores
                </p>
              )}
            </div>

            {veiculo.observacoes && (
              <div className="bg-white rounded-[16px] border border-[#E0E0E0] p-5">
                <p className="text-xs font-700 text-[#666666] uppercase tracking-wide mb-2">Observações</p>
                <p className="text-base text-[#333333] whitespace-pre-wrap leading-relaxed">{veiculo.observacoes}</p>
              </div>
            )}

            <div className="pt-2">
              <Button variant="danger" fullWidth icon={Trash2} onClick={() => setConfirmDelete(true)}>
                Excluir veículo
              </Button>
            </div>
          </motion.div>
        )}
      </PageContainer>

      <Modal open={confirmDelete} onClose={() => setConfirmDelete(false)} title="Excluir veículo" size="sm">
        <p className="text-[#666666] mb-6">Excluir <strong>{titulo}</strong>? Essa ação não pode ser desfeita.</p>
        <div className="flex flex-col gap-3">
          <Button variant="danger" fullWidth loading={deleting} onClick={handleDelete}>Sim, excluir</Button>
          <Button variant="secondary" fullWidth onClick={() => setConfirmDelete(false)} disabled={deleting}>Cancelar</Button>
        </div>
      </Modal>
    </>
  );
}
