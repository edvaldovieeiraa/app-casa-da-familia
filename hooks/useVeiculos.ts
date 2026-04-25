"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Veiculo, VeiculoManutencao } from "@/types/database";

export function useVeiculos() {
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { data, error: err } = await supabase
      .from("veiculos")
      .select("*")
      .eq("ativo", true)
      .order("created_at", { ascending: false });
    if (err) setError(err.message);
    else setVeiculos(data as Veiculo[]);
    setLoading(false);
  }, []);

  useEffect(() => { void fetch(); }, [fetch]);

  async function createVeiculo(values: Omit<Veiculo, "id" | "created_at" | "updated_at" | "user_id">) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Usuário não autenticado");
    const { data, error: err } = await supabase
      .from("veiculos").insert({ ...values, user_id: user.id }).select().single();
    if (err) throw new Error(err.message);
    setVeiculos((prev) => [data as Veiculo, ...prev]);
    return data as Veiculo;
  }

  async function updateVeiculo(id: string, values: Partial<Veiculo>) {
    const supabase = createClient();
    const { data, error: err } = await supabase
      .from("veiculos").update({ ...values, updated_at: new Date().toISOString() })
      .eq("id", id).select().single();
    if (err) throw new Error(err.message);
    setVeiculos((prev) => prev.map((v) => (v.id === id ? (data as Veiculo) : v)));
    return data as Veiculo;
  }

  async function deleteVeiculo(id: string) {
    const supabase = createClient();
    const { error: err } = await supabase
      .from("veiculos").update({ ativo: false, updated_at: new Date().toISOString() }).eq("id", id);
    if (err) throw new Error(err.message);
    setVeiculos((prev) => prev.filter((v) => v.id !== id));
  }

  return { veiculos, loading, error, refetch: fetch, createVeiculo, updateVeiculo, deleteVeiculo };
}

export function useVeiculo(id: string) {
  const [veiculo, setVeiculo] = useState<Veiculo | null>(null);
  const [manutencoes, setManutencoes] = useState<VeiculoManutencao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const [{ data: v, error: ve }, { data: m }] = await Promise.all([
      supabase.from("veiculos").select("*").eq("id", id).single(),
      supabase.from("veiculo_manutencoes").select("*").eq("veiculo_id", id).order("data_evento", { ascending: false }),
    ]);
    if (ve) setError(ve.message);
    else {
      setVeiculo(v as Veiculo);
      setManutencoes((m ?? []) as VeiculoManutencao[]);
    }
    setLoading(false);
  }, [id]);

  useEffect(() => { void fetch(); }, [fetch]);

  async function addManutencao(values: Omit<VeiculoManutencao, "id" | "created_at" | "veiculo_id" | "user_id">) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Usuário não autenticado");
    const { data, error: err } = await supabase
      .from("veiculo_manutencoes")
      .insert({ ...values, veiculo_id: id, user_id: user.id })
      .select().single();
    if (err) throw new Error(err.message);
    setManutencoes((prev) => [data as VeiculoManutencao, ...prev]);
    return data as VeiculoManutencao;
  }

  async function deleteManutencao(manutencaoId: string) {
    const supabase = createClient();
    const { error: err } = await supabase.from("veiculo_manutencoes").delete().eq("id", manutencaoId);
    if (err) throw new Error(err.message);
    setManutencoes((prev) => prev.filter((m) => m.id !== manutencaoId));
  }

  return { veiculo, manutencoes, loading, error, refetch: fetch, addManutencao, deleteManutencao };
}
