"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, PawPrint } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { PetCard } from "@/components/modules/pets/PetCard";
import { usePets } from "@/hooks/usePets";
import { createClient } from "@/lib/supabase/client";
import type { PetEvento } from "@/types/database";

const COLOR = "#FF6F00";

export default function PetsPage() {
  const router = useRouter();
  const { pets, loading, error } = usePets();
  const [eventosMap, setEventosMap] = useState<Record<string, PetEvento[]>>({});

  useEffect(() => {
    if (pets.length === 0) return;
    let cancelled = false;
    const supabase = createClient();
    supabase
      .from("pet_eventos")
      .select("*")
      .in("pet_id", pets.map((p) => p.id))
      .not("proxima_data", "is", null)
      .order("proxima_data")
      .then(({ data }) => {
        if (cancelled || !data) return;
        const map: Record<string, PetEvento[]> = {};
        for (const e of data as PetEvento[]) {
          if (!map[e.pet_id]) map[e.pet_id] = [];
          map[e.pet_id].push(e);
        }
        setEventosMap(map);
      });
    return () => { cancelled = true; };
  }, [pets]);

  return (
    <>
      <Header title="Pets" color={COLOR}
        actions={
          <button onClick={() => router.push("/pets/novo")} aria-label="Adicionar pet"
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors text-white">
            <Plus size={22} />
          </button>
        }
      />

      <PageContainer>
        {loading && <div className="flex flex-col gap-3"><Skeleton variant="text" count={4} /></div>}
        {!loading && error && <p className="text-sm text-[#E53935] text-center py-8">{error}</p>}
        {!loading && !error && pets.length === 0 && (
          <EmptyState
            icon={PawPrint}
            title="Nenhum pet"
            description="Cadastre seus animais de estimação e acompanhe vacinas, banhos e consultas."
            actionLabel="Adicionar pet"
            onAction={() => router.push("/pets/novo")}
            color={COLOR}
          />
        )}
        {!loading && !error && pets.length > 0 && (
          <div className="flex flex-col gap-3">
            {pets.map((pet, i) => (
              <PetCard key={pet.id} pet={pet} eventos={eventosMap[pet.id] ?? []} index={i} />
            ))}
          </div>
        )}
        {!loading && pets.length > 0 && (
          <div className="mt-4">
            <Button fullWidth icon={Plus} onClick={() => router.push("/pets/novo")}
              style={{ backgroundColor: COLOR }}>
              Adicionar pet
            </Button>
          </div>
        )}
      </PageContainer>
    </>
  );
}
