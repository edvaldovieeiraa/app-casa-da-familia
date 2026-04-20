"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Feira, FeiraItem, FeiraHistorico } from "@/types/database";

export function useFeiras() {
  const [feiras, setFeiras] = useState<Feira[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { data, error: err } = await supabase
      .from("feiras").select("*").eq("ativo", true).order("nome");
    if (err) setError(err.message);
    else setFeiras(data as Feira[]);
    setLoading(false);
  }, []);

  useEffect(() => { void fetch(); }, [fetch]);

  async function createFeira(values: Omit<Feira, "id" | "created_at" | "updated_at">) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Usuário não autenticado");
    const { data, error: err } = await supabase.from("feiras").insert({ ...values, user_id: user.id }).select().single();
    if (err) throw new Error(err.message);
    setFeiras((prev) => [...prev, data as Feira]);
    return data as Feira;
  }

  async function updateFeira(id: string, values: Partial<Feira>) {
    const supabase = createClient();
    const { data, error: err } = await supabase
      .from("feiras").update({ ...values, updated_at: new Date().toISOString() })
      .eq("id", id).select().single();
    if (err) throw new Error(err.message);
    setFeiras((prev) => prev.map((f) => (f.id === id ? (data as Feira) : f)));
    return data as Feira;
  }

  async function deleteFeira(id: string) {
    const supabase = createClient();
    const { error: err } = await supabase
      .from("feiras").update({ ativo: false, updated_at: new Date().toISOString() }).eq("id", id);
    if (err) throw new Error(err.message);
    setFeiras((prev) => prev.filter((f) => f.id !== id));
  }

  return { feiras, loading, error, refetch: fetch, createFeira, updateFeira, deleteFeira };
}

export function useFeira(id: string) {
  const [feira, setFeira] = useState<Feira | null>(null);
  const [itens, setItens] = useState<FeiraItem[]>([]);
  const [historico, setHistorico] = useState<FeiraHistorico[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const [feiraRes, itensRes, histRes] = await Promise.all([
      supabase.from("feiras").select("*").eq("id", id).single(),
      supabase.from("feira_itens").select("*").eq("feira_id", id).eq("ativo", true).order("ordem"),
      supabase.from("feira_historico").select("*").eq("feira_id", id).order("data", { ascending: false }).limit(6),
    ]);
    if (feiraRes.error) setError(feiraRes.error.message);
    else setFeira(feiraRes.data as Feira);
    setItens((itensRes.data ?? []) as FeiraItem[]);
    setHistorico((histRes.data ?? []) as FeiraHistorico[]);
    setLoading(false);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  async function addItem(nome: string) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Usuário não autenticado");
    const ordem = itens.length;
    const { data, error: err } = await supabase
      .from("feira_itens").insert({ feira_id: id, user_id: user.id, nome, ordem, ativo: true }).select().single();
    if (err) throw new Error(err.message);
    setItens((prev) => [...prev, data as FeiraItem]);
  }

  async function removeItem(itemId: string) {
    const supabase = createClient();
    const { error: err } = await supabase
      .from("feira_itens").update({ ativo: false }).eq("id", itemId);
    if (err) throw new Error(err.message);
    setItens((prev) => prev.filter((i) => i.id !== itemId));
  }

  async function registrarIda(valorGasto: number, local?: string, obs?: string) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Usuário não autenticado");
    const { data, error: err } = await supabase
      .from("feira_historico")
      .insert({
        feira_id: id,
        user_id: user.id,
        data: new Date().toISOString().split("T")[0],
        valor_gasto: valorGasto,
        local: local ?? null,
        observacoes: obs ?? null,
      })
      .select()
      .single();
    if (err) throw new Error(err.message);
    setHistorico((prev) => [data as FeiraHistorico, ...prev]);
  }

  return { feira, itens, historico, loading, error, refetch: load, addItem, removeItem, registrarIda };
}
