"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Car, Plus, Search } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { PageContainer } from "@/components/layout/PageContainer";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { VeiculoCard } from "@/components/modules/veiculos/VeiculoCard";
import { useVeiculos } from "@/hooks/useVeiculos";

const COLOR = "#F57C00";

export default function VeiculosPage() {
  const router = useRouter();
  const { veiculos, loading, error } = useVeiculos();
  const [busca, setBusca] = useState("");

  const filtrados = veiculos.filter((v) => {
    const q = busca.toLowerCase();
    return (
      (v.apelido ?? "").toLowerCase().includes(q) ||
      (v.placa ?? "").toLowerCase().includes(q) ||
      (v.marca ?? "").toLowerCase().includes(q) ||
      (v.modelo ?? "").toLowerCase().includes(q)
    );
  });

  return (
    <>
      <Header title="Veículos" color={COLOR}
        actions={
          <button onClick={() => router.push("/veiculos/novo")} aria-label="Adicionar veículo"
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors text-white">
            <Plus size={22} />
          </button>
        }
      />

      <PageContainer>
        {/* Busca */}
        <div className="relative mb-4">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#999999]" />
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por apelido, placa, modelo..."
            className="w-full min-h-[48px] pl-10 pr-4 rounded-[10px] border border-[#E0E0E0] text-base text-[#333333] bg-white outline-none focus:border-[#F57C00] font-[inherit]"
          />
        </div>

        {loading && <div className="flex flex-col gap-3"><Skeleton variant="card" count={3} /></div>}
        {!loading && error && <p className="text-sm text-[#E53935] text-center py-8">{error}</p>}

        {!loading && !error && veiculos.length === 0 && (
          <EmptyState icon={Car} title="Nenhum veículo cadastrado"
            description="Cadastre seus veículos para acompanhar documentos, seguros e manutenções."
            actionLabel="Adicionar veículo" onAction={() => router.push("/veiculos/novo")} color={COLOR} />
        )}

        {!loading && !error && veiculos.length > 0 && filtrados.length === 0 && (
          <p className="text-center text-[#666666] py-10">Nenhum veículo encontrado para "{busca}"</p>
        )}

        {!loading && !error && filtrados.length > 0 && (
          <motion.div className="flex flex-col gap-3">
            {filtrados.map((v, i) => <VeiculoCard key={v.id} veiculo={v} index={i} />)}
          </motion.div>
        )}
      </PageContainer>

      <motion.button whileTap={{ scale: 0.9 }} onClick={() => router.push("/veiculos/novo")}
        aria-label="Adicionar veículo"
        className="fixed bottom-20 right-5 w-14 h-14 rounded-full flex items-center justify-center shadow-lg z-30"
        style={{ backgroundColor: COLOR }}>
        <Plus size={28} className="text-white" />
      </motion.button>
    </>
  );
}
