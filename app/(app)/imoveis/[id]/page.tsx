"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Building2,
  Edit,
  Trash2,
  Star,
  MapPin,
  Zap,
  Droplets,
  Flame,
  Wifi,
  FileCheck,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Skeleton } from "@/components/ui/Skeleton";
import { CopyField } from "@/components/ui/CopyButton";
import { ToastContainer } from "@/components/ui/Toast";
import { useImovel, useImoveis } from "@/hooks/useImoveis";
import { useToast } from "@/hooks/useToast";
import type { Imovel } from "@/types/database";

const COLOR = "#E53935";

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof Building2;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-[16px] border border-[#E0E0E0] overflow-hidden">
      <div className="flex items-center gap-2 px-5 pt-4 pb-2">
        <Icon size={16} style={{ color: COLOR }} />
        <span className="text-xs font-700 text-[#E53935] uppercase tracking-wide">
          {title}
        </span>
      </div>
      <div className="px-5 pb-4">{children}</div>
    </div>
  );
}

function hasAny(imovel: Imovel, fields: (keyof Imovel)[]) {
  return fields.some((f) => imovel[f]);
}

export default function DetalhesImovelPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { imovel, loading, error } = useImovel(id);
  const { deleteImovel, toggleFavorito } = useImoveis();
  const { toasts, addToast, removeToast } = useToast();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteImovel(id);
      addToast("Imóvel excluído", "success");
      setTimeout(() => router.push("/imoveis"), 600);
    } catch {
      addToast("Não foi possível excluir", "error");
      setDeleting(false);
      setConfirmDelete(false);
    }
  }

  async function handleFavorito() {
    if (!imovel) return;
    try {
      await toggleFavorito(imovel.id, imovel.favorito);
    } catch {
      addToast("Erro ao atualizar favorito", "error");
    }
  }

  const nome = imovel?.apelido ?? imovel?.nome ?? "Imóvel";

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <Header
        title={nome}
        color={COLOR}
        showBack
        actions={
          imovel && (
            <>
              <button
                onClick={handleFavorito}
                aria-label={imovel.favorito ? "Remover dos favoritos" : "Favoritar"}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors"
              >
                <Star
                  size={20}
                  fill={imovel.favorito ? "#F5C842" : "none"}
                  className="text-white"
                />
              </button>
              <button
                onClick={() => router.push(`/imoveis/${id}/editar`)}
                aria-label="Editar imóvel"
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors"
              >
                <Edit size={20} className="text-white" />
              </button>
            </>
          )
        }
      />

      <PageContainer>
        {loading && (
          <div className="flex flex-col gap-4">
            <Skeleton variant="card" count={4} />
          </div>
        )}

        {!loading && error && (
          <p className="text-sm text-[#E53935] text-center py-8">{error}</p>
        )}

        {!loading && !error && imovel && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col gap-4"
          >
            {/* Foto / placeholder */}
            <div className="w-full h-44 rounded-[16px] overflow-hidden bg-[#E53935]/10 flex items-center justify-center">
              {imovel.foto_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imovel.foto_url}
                  alt={nome}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Building2 size={56} className="text-[#E53935]/40" />
              )}
            </div>

            {/* Endereço */}
            {hasAny(imovel, ["logradouro", "numero", "bairro", "cidade", "estado", "cep"]) && (
              <Section icon={MapPin} title="Localização">
                {imovel.logradouro && (
                  <CopyField
                    label="Logradouro"
                    value={[imovel.logradouro, imovel.numero, imovel.complemento]
                      .filter(Boolean)
                      .join(", ")}
                  />
                )}
                {imovel.bairro && <CopyField label="Bairro" value={imovel.bairro} />}
                {imovel.cidade && (
                  <CopyField
                    label="Cidade / Estado"
                    value={[imovel.cidade, imovel.estado].filter(Boolean).join(" - ")}
                  />
                )}
                {imovel.cep && <CopyField label="CEP" value={imovel.cep} />}
              </Section>
            )}

            {/* Documentação */}
            {hasAny(imovel, ["matricula_imovel", "codigo_iptu", "inscricao_imobiliaria", "sequencial"]) && (
              <Section icon={FileCheck} title="Documentação">
                {imovel.matricula_imovel && (
                  <CopyField label="Matrícula do imóvel" value={imovel.matricula_imovel} />
                )}
                {imovel.codigo_iptu && (
                  <CopyField label="Código do IPTU" value={imovel.codigo_iptu} />
                )}
                {imovel.inscricao_imobiliaria && (
                  <CopyField label="Inscrição imobiliária" value={imovel.inscricao_imobiliaria} />
                )}
                {imovel.sequencial && (
                  <CopyField label="Sequencial" value={imovel.sequencial} />
                )}
              </Section>
            )}

            {/* Energia */}
            {hasAny(imovel, ["unidade_consumidora", "cpf_conta_luz", "distribuidora"]) && (
              <Section icon={Zap} title="Energia elétrica">
                {imovel.unidade_consumidora && (
                  <CopyField label="Unidade consumidora" value={imovel.unidade_consumidora} />
                )}
                {imovel.cpf_conta_luz && (
                  <CopyField label="CPF da conta de luz" value={imovel.cpf_conta_luz} />
                )}
                {imovel.distribuidora && (
                  <CopyField label="Distribuidora" value={imovel.distribuidora} />
                )}
              </Section>
            )}

            {/* Água */}
            {hasAny(imovel, ["matricula_agua", "cpf_conta_agua"]) && (
              <Section icon={Droplets} title="Água">
                {imovel.matricula_agua && (
                  <CopyField label="Matrícula da água" value={imovel.matricula_agua} />
                )}
                {imovel.cpf_conta_agua && (
                  <CopyField label="CPF da conta de água" value={imovel.cpf_conta_agua} />
                )}
              </Section>
            )}

            {/* Gás */}
            {imovel.codigo_gas && (
              <Section icon={Flame} title="Gás">
                <CopyField label="Código do gás" value={imovel.codigo_gas} />
              </Section>
            )}

            {/* Internet */}
            {hasAny(imovel, ["provedor_internet", "codigo_cliente_internet"]) && (
              <Section icon={Wifi} title="Internet">
                {imovel.provedor_internet && (
                  <CopyField label="Provedor" value={imovel.provedor_internet} />
                )}
                {imovel.codigo_cliente_internet && (
                  <CopyField label="Código de cliente" value={imovel.codigo_cliente_internet} />
                )}
              </Section>
            )}

            {/* Observações */}
            {imovel.observacoes && (
              <div className="bg-white rounded-[16px] border border-[#E0E0E0] p-5">
                <p className="text-xs font-700 text-[#666666] uppercase tracking-wide mb-2">
                  Observações
                </p>
                <p className="text-base text-[#333333] whitespace-pre-wrap leading-relaxed">
                  {imovel.observacoes}
                </p>
              </div>
            )}

            {/* Excluir */}
            <div className="pt-4">
              <Button
                variant="danger"
                fullWidth
                icon={Trash2}
                onClick={() => setConfirmDelete(true)}
              >
                Excluir imóvel
              </Button>
            </div>
          </motion.div>
        )}
      </PageContainer>

      {/* Modal confirmação de exclusão */}
      <Modal
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="Excluir imóvel"
        size="sm"
      >
        <p className="text-[#666666] mb-6 leading-relaxed">
          Tem certeza que deseja excluir <strong>{nome}</strong>? Essa ação não pode ser desfeita.
        </p>
        <div className="flex flex-col gap-3">
          <Button
            variant="danger"
            fullWidth
            loading={deleting}
            onClick={handleDelete}
          >
            Sim, excluir
          </Button>
          <Button
            variant="secondary"
            fullWidth
            onClick={() => setConfirmDelete(false)}
            disabled={deleting}
          >
            Cancelar
          </Button>
        </div>
      </Modal>
    </>
  );
}
