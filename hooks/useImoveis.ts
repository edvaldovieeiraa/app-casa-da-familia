"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Imovel } from "@/types/database";

export function useImoveis() {
  const [imoveis, setImoveis] = useState<Imovel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { data, error: err } = await supabase
      .from("imoveis")
      .select("*")
      .eq("ativo", true)
      .order("favorito", { ascending: false })
      .order("nome");
    if (err) {
      setError(err.message);
    } else {
      setImoveis(data as Imovel[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  async function createImovel(values: Omit<Imovel, "id" | "created_at" | "updated_at">) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Usuário não autenticado");
    const { data, error: err } = await supabase
      .from("imoveis")
      .insert({ ...values, user_id: user.id })
      .select()
      .single();
    if (err) throw new Error(err.message);
    setImoveis((prev) => [data as Imovel, ...prev]);
    return data as Imovel;
  }

  async function updateImovel(id: string, values: Partial<Imovel>) {
    const supabase = createClient();
    const { data, error: err } = await supabase
      .from("imoveis")
      .update({ ...values, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();
    if (err) throw new Error(err.message);
    setImoveis((prev) =>
      prev.map((im) => (im.id === id ? (data as Imovel) : im))
    );
    return data as Imovel;
  }

  async function deleteImovel(id: string) {
    const supabase = createClient();
    const { error: err } = await supabase
      .from("imoveis")
      .update({ ativo: false, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (err) throw new Error(err.message);
    setImoveis((prev) => prev.filter((im) => im.id !== id));
  }

  async function toggleFavorito(id: string, favorito: boolean) {
    return updateImovel(id, { favorito: !favorito });
  }

  return {
    imoveis,
    loading,
    error,
    refetch: fetch,
    createImovel,
    updateImovel,
    deleteImovel,
    toggleFavorito,
  };
}

export function useImovel(id: string) {
  const [imovel, setImovel] = useState<Imovel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      const supabase = createClient();
      const { data, error: err } = await supabase
        .from("imoveis")
        .select("*")
        .eq("id", id)
        .single();
      if (err) {
        setError(err.message);
      } else {
        setImovel(data as Imovel);
      }
      setLoading(false);
    }
    load();
  }, [id]);

  return { imovel, loading, error };
}
