"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Pet, PetEvento } from "@/types/database";

export function usePets() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { data, error: err } = await supabase
      .from("pets").select("*").eq("ativo", true).order("nome");
    if (err) setError(err.message);
    else setPets(data as Pet[]);
    setLoading(false);
  }, []);

  useEffect(() => { void fetch(); }, [fetch]);

  async function createPet(values: Omit<Pet, "id" | "created_at" | "user_id">) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Usuário não autenticado");
    const { data, error: err } = await supabase
      .from("pets").insert({ ...values, user_id: user.id }).select().single();
    if (err) throw new Error(err.message);
    setPets((prev) => [...prev, data as Pet]);
    return data as Pet;
  }

  async function updatePet(id: string, values: Partial<Pet>) {
    const supabase = createClient();
    const { data, error: err } = await supabase
      .from("pets").update(values).eq("id", id).select().single();
    if (err) throw new Error(err.message);
    setPets((prev) => prev.map((p) => (p.id === id ? (data as Pet) : p)));
    return data as Pet;
  }

  async function deletePet(id: string) {
    const supabase = createClient();
    const { error: err } = await supabase.from("pets").update({ ativo: false }).eq("id", id);
    if (err) throw new Error(err.message);
    setPets((prev) => prev.filter((p) => p.id !== id));
  }

  return { pets, loading, error, refetch: fetch, createPet, updatePet, deletePet };
}

export function usePet(id: string) {
  const [pet, setPet] = useState<Pet | null>(null);
  const [eventos, setEventos] = useState<PetEvento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const [petRes, eventosRes] = await Promise.all([
      supabase.from("pets").select("*").eq("id", id).single(),
      supabase.from("pet_eventos").select("*").eq("pet_id", id).order("data_evento", { ascending: false }),
    ]);
    if (petRes.error) setError(petRes.error.message);
    else setPet(petRes.data as Pet);
    setEventos((eventosRes.data ?? []) as PetEvento[]);
    setLoading(false);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  async function addEvento(values: Omit<PetEvento, "id" | "created_at" | "pet_id" | "user_id">) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Usuário não autenticado");
    const { data, error: err } = await supabase
      .from("pet_eventos")
      .insert({ ...values, pet_id: id, user_id: user.id })
      .select().single();
    if (err) throw new Error(err.message);
    setEventos((prev) => [data as PetEvento, ...prev]);
    return data as PetEvento;
  }

  async function deleteEvento(eventoId: string) {
    const supabase = createClient();
    const { error: err } = await supabase.from("pet_eventos").delete().eq("id", eventoId);
    if (err) throw new Error(err.message);
    setEventos((prev) => prev.filter((e) => e.id !== eventoId));
  }

  return { pet, eventos, loading, error, refetch: load, addEvento, deleteEvento };
}
