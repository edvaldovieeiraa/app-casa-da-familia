"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { FamiliaMembro } from "@/types/database";

type MembroInput = Omit<FamiliaMembro, "id" | "created_at" | "is_admin">;

export function useMembros() {
  const [membros, setMembros] = useState<FamiliaMembro[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { data, error: err } = await supabase
      .from("familia_membros").select("*").order("nome");
    if (err) setError(err.message);
    else setMembros(data as FamiliaMembro[]);
    setLoading(false);
  }, []);

  useEffect(() => { void fetch(); }, [fetch]);

  async function createMembro(input: Partial<MembroInput> & { nome: string }) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Usuário não autenticado");
    const { data, error: err } = await supabase
      .from("familia_membros")
      .insert({ ...input, user_id: user.id, is_admin: false })
      .select().single();
    if (err) throw new Error(err.message);
    setMembros((prev) => [...prev, data as FamiliaMembro].sort((a, b) => a.nome.localeCompare(b.nome)));
    return data as FamiliaMembro;
  }

  async function updateMembro(id: string, values: Partial<MembroInput>) {
    const supabase = createClient();
    const { data, error: err } = await supabase
      .from("familia_membros").update(values).eq("id", id).select().single();
    if (err) throw new Error(err.message);
    setMembros((prev) => prev.map((m) => (m.id === id ? (data as FamiliaMembro) : m)));
    return data as FamiliaMembro;
  }

  async function deleteMembro(id: string) {
    const supabase = createClient();
    const { error: err } = await supabase.from("familia_membros").delete().eq("id", id);
    if (err) throw new Error(err.message);
    setMembros((prev) => prev.filter((m) => m.id !== id));
  }

  return { membros, loading, error, refetch: fetch, createMembro, updateMembro, deleteMembro };
}

export function useMembro(id: string) {
  const [membro, setMembro] = useState<FamiliaMembro | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const supabase = createClient();
      const { data, error: err } = await supabase
        .from("familia_membros").select("*").eq("id", id).single();
      if (err) setError(err.message);
      else setMembro(data as FamiliaMembro);
      setLoading(false);
    }
    load();
  }, [id]);

  return { membro, loading, error };
}
