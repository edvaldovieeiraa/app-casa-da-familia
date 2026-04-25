"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Conta, ContaStatus } from "@/types/database";

const FREQUENCIA_MESES: Record<string, number> = {
  mensal: 1, bimestral: 2, trimestral: 3, semestral: 6, anual: 12,
};
const TOTAL_PERIODOS: Record<string, number> = {
  mensal: 12, bimestral: 6, trimestral: 4, semestral: 2, anual: 1,
};

function addMonths(dateStr: string, months: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const target = new Date(y, m - 1 + months, 1);
  const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
  const day = Math.min(d, lastDay);
  return `${target.getFullYear()}-${String(target.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

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
      const [year, month] = mes.split("-").map(Number);
      const lastDay = new Date(year, month, 0).getDate();
      const lastDayStr = String(lastDay).padStart(2, "0");
      query = query
        .gte("data_vencimento", `${mes}-01`)
        .lte("data_vencimento", `${mes}-${lastDayStr}`);
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

    const { data, error: err } = await supabase
      .from("contas").insert({ ...values, user_id: user.id }).select().single();
    if (err) throw new Error(err.message);
    const primeira = data as Conta;

    let copiasCriadas = 0;
    if (values.recorrente && values.frequencia && values.data_vencimento) {
      const mesesPorPeriodo = FREQUENCIA_MESES[values.frequencia] ?? 1;
      const totalPeriodos = TOTAL_PERIODOS[values.frequencia] ?? 1;

      if (totalPeriodos > 1) {
        const copies = Array.from({ length: totalPeriodos - 1 }, (_, i) => ({
          ...values,
          user_id: user.id,
          status: "pendente" as ContaStatus,
          data_vencimento: addMonths(values.data_vencimento, (i + 1) * mesesPorPeriodo),
          data_pagamento: null,
          valor_pago: null,
          comprovante_url: null,
          foto_boleto_url: null,
        }));

        const { error: copyErr } = await supabase.from("contas").insert(copies);
        if (!copyErr) copiasCriadas = copies.length;
      }
    }

    setContas((prev) =>
      [...prev, primeira].sort((a, b) => a.data_vencimento.localeCompare(b.data_vencimento))
    );
    return { conta: primeira, copiasCriadas };
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
