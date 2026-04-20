"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Conta, ContaStatus } from "@/types/database";

export function useContas(mes?: string) {
  const [contas, setContas] = useState<Conta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    const supabase = createClient();
    let query = supabase.from("contas").select("*").order("data_vencimento");
    if (mes) {
      query = query
        .gte("data_vencimento", `${mes}-01`)
        .lte("data_vencimento", `${mes}-31`);
    }
    const { data, error: err } = await query;
    if (err) setError(err.message);
    else setContas(data as Conta[]);
    setLoading(false);
  }, [mes]);

  useEffect(() => { void fetch(); }, [fetch]);

  async function createConta(values: Omit<Conta, "id" | "created_at" | "updated_at">) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Usuário não autenticado");
    const { data, error: err } = await supabase.from("contas").insert({ ...values, user_id: user.id }).select().single();
    if (err) throw new Error(err.message);
    setContas((prev) => [...prev, data as Conta].sort((a, b) =>
      a.data_vencimento.localeCompare(b.data_vencimento)
    ));
    return data as Conta;
  }

  async function updateConta(id: string, values: Partial<Conta>) {
    const supabase = createClient();
    const { data, error: err } = await supabase
      .from("contas").update({ ...values, updated_at: new Date().toISOString() })
      .eq("id", id).select().single();
    if (err) throw new Error(err.message);
    setContas((prev) => prev.map((c) => (c.id === id ? (data as Conta) : c)));
    return data as Conta;
  }

  async function deleteConta(id: string) {
    const supabase = createClient();
    const { error: err } = await supabase.from("contas").delete().eq("id", id);
    if (err) throw new Error(err.message);
    setContas((prev) => prev.filter((c) => c.id !== id));
  }

  async function marcarComoPago(id: string) {
    return updateConta(id, {
      status: "pago" as ContaStatus,
      data_pagamento: new Date().toISOString().split("T")[0],
    });
  }

  return { contas, loading, error, refetch: fetch, createConta, updateConta, deleteConta, marcarComoPago };
}

export function useConta(id: string) {
  const [conta, setConta] = useState<Conta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const supabase = createClient();
      const { data, error: err } = await supabase.from("contas").select("*").eq("id", id).single();
      if (err) setError(err.message);
      else setConta(data as Conta);
      setLoading(false);
    }
    load();
  }, [id]);

  return { conta, loading, error, setConta };
}
