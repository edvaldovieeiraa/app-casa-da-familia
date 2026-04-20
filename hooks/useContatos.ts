"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Contato } from "@/types/database";

export function useContatos() {
  const [contatos, setContatos] = useState<Contato[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { data, error: err } = await supabase
      .from("contatos")
      .select("*")
      .order("favorito", { ascending: false })
      .order("nome");
    if (err) setError(err.message);
    else setContatos(data as Contato[]);
    setLoading(false);
  }, []);

  useEffect(() => { void fetch(); }, [fetch]);

  async function createContato(values: Omit<Contato, "id" | "created_at" | "updated_at">) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Usuário não autenticado");
    const { data, error: err } = await supabase.from("contatos").insert({ ...values, user_id: user.id }).select().single();
    if (err) throw new Error(err.message);
    setContatos((prev) => [data as Contato, ...prev]);
    return data as Contato;
  }

  async function updateContato(id: string, values: Partial<Contato>) {
    const supabase = createClient();
    const { data, error: err } = await supabase
      .from("contatos").update({ ...values, updated_at: new Date().toISOString() })
      .eq("id", id).select().single();
    if (err) throw new Error(err.message);
    setContatos((prev) => prev.map((c) => (c.id === id ? (data as Contato) : c)));
    return data as Contato;
  }

  async function deleteContato(id: string) {
    const supabase = createClient();
    const { error: err } = await supabase.from("contatos").delete().eq("id", id);
    if (err) throw new Error(err.message);
    setContatos((prev) => prev.filter((c) => c.id !== id));
  }

  return { contatos, loading, error, refetch: fetch, createContato, updateContato, deleteContato };
}

export function useContato(id: string) {
  const [contato, setContato] = useState<Contato | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const supabase = createClient();
      const { data, error: err } = await supabase.from("contatos").select("*").eq("id", id).single();
      if (err) setError(err.message);
      else setContato(data as Contato);
      setLoading(false);
    }
    load();
  }, [id]);

  return { contato, loading, error };
}
