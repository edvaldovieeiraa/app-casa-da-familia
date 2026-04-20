"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Edit, Trash2, Plus, PawPrint } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Skeleton } from "@/components/ui/Skeleton";
import { ToastContainer } from "@/components/ui/Toast";
import { EventoCard } from "@/components/modules/pets/EventoCard";
import { RegistrarEventoModal } from "@/components/modules/pets/RegistrarEventoModal";
import { usePet, usePets } from "@/hooks/usePets";
import { useToast } from "@/hooks/useToast";

const COLOR = "#FF6F00";

function calcularIdade(dataNascimento: string): string {
  const hoje = new Date();
  const nasc = new Date(dataNascimento + "T12:00:00");
  let anos = hoje.getFullYear() - nasc.getFullYear();
  let meses = hoje.getMonth() - nasc.getMonth();
  if (meses < 0) { anos--; meses += 12; }
  if (anos > 0) return `${anos} ano${anos !== 1 ? "s" : ""}`;
  return `${meses} mês${meses !== 1 ? "es" : ""}`;
}

export default function DetalhesPetPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { pet, eventos, loading, error, addEvento, deleteEvento } = usePet(id);
  const { deletePet } = usePets();
  const { toasts, addToast, removeToast } = useToast();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [eventoModal, setEventoModal] = useState(false);
  const [confirmDeleteEventoId, setConfirmDeleteEventoId] = useState<string | null>(null);

  async function handleDeletePet() {
    setDeleting(true);
    try {
      await deletePet(id);
      addToast("Pet excluído", "success");
      setTimeout(() => router.push("/pets"), 600);
    } catch {
      addToast("Não foi possível excluir", "error");
      setDeleting(false);
      setConfirmDelete(false);
    }
  }

  async function handleSaveEvento(values: Parameters<typeof addEvento>[0]) {
    try {
      await addEvento(values);
      addToast("Evento registrado!", "success");
    } catch (err) {
      addToast(err instanceof Error ? err.message : "Erro ao salvar", "error");
      throw err;
    }
  }

  async function handleDeleteEvento() {
    if (!confirmDeleteEventoId) return;
    try {
      await deleteEvento(confirmDeleteEventoId);
      addToast("Evento excluído", "success");
      setConfirmDeleteEventoId(null);
    } catch {
      addToast("Erro ao excluir", "error");
    }
  }

  const nome = pet?.nome ?? "Pet";

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <Header title={nome} color={COLOR} showBack
        actions={pet && (
          <button onClick={() => router.push(`/pets/${id}/editar`)} aria-label="Editar"
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors">
            <Edit size={20} className="text-white" />
          </button>
        )} />

      <PageContainer>
        {loading && <div className="flex flex-col gap-4"><Skeleton variant="card" count={3} /></div>}
        {!loading && error && <p className="text-sm text-[#E53935] text-center py-8">{error}</p>}
        {!loading && !error && pet && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-4">
            {/* Perfil */}
            <div className="bg-white rounded-[16px] border border-[#E0E0E0] p-5">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${COLOR}20` }}>
                  {pet.foto_url
                    ? <img src={pet.foto_url} alt={pet.nome} className="w-20 h-20 rounded-full object-cover" />
                    : <PawPrint size={36} style={{ color: COLOR }} />
                  }
                </div>
                <div>
                  <p className="text-xl font-800 text-[#333333]">{pet.nome}</p>
                  {pet.raca && <p className="text-sm text-[#666666]">{pet.especie ? `${pet.especie} · ` : ""}{pet.raca}</p>}
                  {pet.sexo && <p className="text-sm text-[#666666] capitalize">{pet.sexo}</p>}
                  {pet.data_nascimento && (
                    <p className="text-sm text-[#666666]">{calcularIdade(pet.data_nascimento)}</p>
                  )}
                </div>
              </div>
              {(pet.cor || pet.observacoes) && (
                <div className="mt-4 pt-4 border-t border-[#F0F0F0]">
                  {pet.cor && <p className="text-sm text-[#555555]"><span className="font-600">Cor:</span> {pet.cor}</p>}
                  {pet.observacoes && <p className="text-sm text-[#555555] mt-1">{pet.observacoes}</p>}
                </div>
              )}
            </div>

            {/* Botão registrar evento */}
            <Button fullWidth icon={Plus} onClick={() => setEventoModal(true)}
              style={{ backgroundColor: COLOR }}>
              Registrar evento
            </Button>

            {/* Timeline de eventos */}
            <div className="bg-white rounded-[16px] border border-[#E0E0E0] p-5">
              <p className="text-xs font-700 text-[#666666] uppercase tracking-wide mb-3">
                Histórico ({eventos.length})
              </p>
              {eventos.length === 0 && (
                <p className="text-sm text-[#999999] text-center py-4">Nenhum evento registrado ainda.</p>
              )}
              {eventos.map((ev, i) => (
                <div key={ev.id} className="relative group">
                  <EventoCard evento={ev} index={i} />
                  <button
                    onClick={() => setConfirmDeleteEventoId(ev.id)}
                    className="absolute top-3 right-0 opacity-0 group-hover:opacity-100 transition-opacity w-7 h-7 flex items-center justify-center rounded-full hover:bg-[#FEF2F2]"
                    aria-label="Excluir evento">
                    <Trash2 size={14} className="text-[#E53935]" />
                  </button>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <Button variant="danger" fullWidth icon={Trash2} onClick={() => setConfirmDelete(true)}>
                Excluir pet
              </Button>
            </div>
          </motion.div>
        )}
      </PageContainer>

      <RegistrarEventoModal open={eventoModal} onClose={() => setEventoModal(false)} onSave={handleSaveEvento} />

      <Modal open={confirmDelete} onClose={() => setConfirmDelete(false)} title="Excluir pet" size="sm">
        <p className="text-[#666666] mb-6">Excluir <strong>{nome}</strong>? Todo o histórico será perdido.</p>
        <div className="flex flex-col gap-3">
          <Button variant="danger" fullWidth loading={deleting} onClick={handleDeletePet}>Sim, excluir</Button>
          <Button variant="secondary" fullWidth onClick={() => setConfirmDelete(false)} disabled={deleting}>Cancelar</Button>
        </div>
      </Modal>

      <Modal open={!!confirmDeleteEventoId} onClose={() => setConfirmDeleteEventoId(null)} title="Excluir evento" size="sm">
        <p className="text-[#666666] mb-6">Excluir este evento do histórico?</p>
        <div className="flex flex-col gap-3">
          <Button variant="danger" fullWidth onClick={handleDeleteEvento}>Sim, excluir</Button>
          <Button variant="secondary" fullWidth onClick={() => setConfirmDeleteEventoId(null)}>Cancelar</Button>
        </div>
      </Modal>
    </>
  );
}
