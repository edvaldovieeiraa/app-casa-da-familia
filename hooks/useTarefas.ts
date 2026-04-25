"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Tarefa, TarefaComentario, TarefaChecklistItem, TarefaStatus } from "@/types/database";

export function useTarefas() {
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { data, error: err } = await supabase
      .from("tarefas")
      .select("*")
      .order("created_at", { ascending: false });
    if (err) setError(err.message);
    else setTarefas(data as Tarefa[]);
    setLoading(false);
  }, []);

  useEffect(() => { void fetch(); }, [fetch]);

  async function createTarefa(values: Omit<Tarefa, "id" | "created_at" | "updated_at" | "user_id">) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Usuário não autenticado");
    const { data, error: err } = await supabase
      .from("tarefas").insert({ ...values, user_id: user.id }).select().single();
    if (err) throw new Error(err.message);
    setTarefas((prev) => [data as Tarefa, ...prev]);
    return data as Tarefa;
  }

  async function updateTarefa(id: string, values: Partial<Tarefa>) {
    const supabase = createClient();
    const { data, error: err } = await supabase
      .from("tarefas").update({ ...values, updated_at: new Date().toISOString() })
      .eq("id", id).select().single();
    if (err) throw new Error(err.message);
    setTarefas((prev) => prev.map((t) => (t.id === id ? (data as Tarefa) : t)));
    return data as Tarefa;
  }

  async function deleteTarefa(id: string) {
    const supabase = createClient();
    const { error: err } = await supabase.from("tarefas").delete().eq("id", id);
    if (err) throw new Error(err.message);
    setTarefas((prev) => prev.filter((t) => t.id !== id));
  }

  async function mudarStatus(id: string, novoStatus: TarefaStatus, comprovanteUrl?: string | null) {
    const updates: Partial<Tarefa> = { status: novoStatus };
    if (novoStatus === "concluida") {
      updates.data_conclusao = new Date().toISOString().split("T")[0];
      if (comprovanteUrl) updates.comprovante_url = comprovanteUrl;
    }
    return updateTarefa(id, updates);
  }

  return { tarefas, loading, error, refetch: fetch, createTarefa, updateTarefa, deleteTarefa, mudarStatus };
}

export function useTarefa(id: string) {
  const [tarefa, setTarefa] = useState<Tarefa | null>(null);
  const [comentarios, setComentarios] = useState<TarefaComentario[]>([]);
  const [checklist, setChecklist] = useState<TarefaChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const [{ data: t, error: te }, { data: c }, { data: ch }] = await Promise.all([
      supabase.from("tarefas").select("*").eq("id", id).single(),
      supabase.from("tarefa_comentarios").select("*").eq("tarefa_id", id).order("created_at"),
      supabase.from("tarefa_checklist").select("*").eq("tarefa_id", id).order("ordem"),
    ]);
    if (te) setError(te.message);
    else {
      setTarefa(t as Tarefa);
      setComentarios((c ?? []) as TarefaComentario[]);
      setChecklist((ch ?? []) as TarefaChecklistItem[]);
    }
    setLoading(false);
  }, [id]);

  useEffect(() => { void fetch(); }, [fetch]);

  async function mudarStatus(novoStatus: TarefaStatus, comprovanteUrl?: string | null) {
    const supabase = createClient();
    const updates: Partial<Tarefa> & { updated_at: string } = {
      status: novoStatus,
      updated_at: new Date().toISOString(),
    };
    if (novoStatus === "concluida") {
      updates.data_conclusao = new Date().toISOString().split("T")[0];
      if (comprovanteUrl) updates.comprovante_url = comprovanteUrl;
    }
    const { data, error: err } = await supabase
      .from("tarefas").update(updates).eq("id", id).select().single();
    if (err) throw new Error(err.message);
    setTarefa(data as Tarefa);
    return data as Tarefa;
  }

  async function adicionarComentario(texto: string, membroId: string | null) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Usuário não autenticado");
    const { data, error: err } = await supabase
      .from("tarefa_comentarios")
      .insert({ tarefa_id: id, user_id: user.id, membro_id: membroId, texto })
      .select().single();
    if (err) throw new Error(err.message);
    setComentarios((prev) => [...prev, data as TarefaComentario]);
    return data as TarefaComentario;
  }

  async function adicionarChecklistItem(texto: string) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Usuário não autenticado");
    const ordem = checklist.length;
    const { data, error: err } = await supabase
      .from("tarefa_checklist")
      .insert({ tarefa_id: id, user_id: user.id, texto, concluido: false, ordem })
      .select().single();
    if (err) throw new Error(err.message);
    setChecklist((prev) => [...prev, data as TarefaChecklistItem]);
    return data as TarefaChecklistItem;
  }

  async function toggleChecklistItem(itemId: string, concluido: boolean) {
    const supabase = createClient();
    const { data, error: err } = await supabase
      .from("tarefa_checklist").update({ concluido }).eq("id", itemId).select().single();
    if (err) throw new Error(err.message);
    setChecklist((prev) => prev.map((i) => (i.id === itemId ? (data as TarefaChecklistItem) : i)));
  }

  async function removerChecklistItem(itemId: string) {
    const supabase = createClient();
    const { error: err } = await supabase.from("tarefa_checklist").delete().eq("id", itemId);
    if (err) throw new Error(err.message);
    setChecklist((prev) => prev.filter((i) => i.id !== itemId));
  }

  async function criarChecklistEmLote(itens: string[]) {
    if (itens.length === 0) return;
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const rows = itens.map((texto, ordem) => ({
      tarefa_id: id, user_id: user.id, texto, concluido: false, ordem,
    }));
    const { data, error: err } = await supabase.from("tarefa_checklist").insert(rows).select();
    if (!err && data) setChecklist((prev) => [...prev, ...(data as TarefaChecklistItem[])]);
  }

  return {
    tarefa, comentarios, checklist,
    loading, error, refetch: fetch,
    mudarStatus, adicionarComentario, setTarefa,
    adicionarChecklistItem, toggleChecklistItem, removerChecklistItem, criarChecklistEmLote,
  };
}
