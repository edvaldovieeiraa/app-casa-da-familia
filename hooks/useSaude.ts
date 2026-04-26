"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type {
  SaudePaciente, SaudeMedicamento, SaudeConsulta,
  SaudeSinalVital, SaudeContatoEmergencia, SaudeInternacao,
} from "@/types/database";

export function usePacientes() {
  const [pacientes, setPacientes] = useState<SaudePaciente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { data, error: err } = await supabase
      .from("saude_pacientes").select("*").order("nome");
    if (err) setError(err.message);
    else setPacientes(data as SaudePaciente[]);
    setLoading(false);
  }, []);

  useEffect(() => { void fetch(); }, [fetch]);

  async function createPaciente(values: Omit<SaudePaciente, "id" | "created_at" | "user_id">) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Usuário não autenticado");
    const { data, error: err } = await supabase
      .from("saude_pacientes").insert({ ...values, user_id: user.id }).select().single();
    if (err) throw new Error(err.message);
    setPacientes((prev) => [...prev, data as SaudePaciente]);
    return data as SaudePaciente;
  }

  async function updatePaciente(id: string, values: Partial<SaudePaciente>) {
    const supabase = createClient();
    const { data, error: err } = await supabase
      .from("saude_pacientes").update(values).eq("id", id).select().single();
    if (err) throw new Error(err.message);
    setPacientes((prev) => prev.map((p) => (p.id === id ? (data as SaudePaciente) : p)));
    return data as SaudePaciente;
  }

  async function deletePaciente(id: string) {
    const supabase = createClient();
    const { error: err } = await supabase.from("saude_pacientes").delete().eq("id", id);
    if (err) throw new Error(err.message);
    setPacientes((prev) => prev.filter((p) => p.id !== id));
  }

  return { pacientes, loading, error, refetch: fetch, createPaciente, updatePaciente, deletePaciente };
}

export function usePaciente(id: string) {
  const [paciente, setPaciente] = useState<SaudePaciente | null>(null);
  const [medicamentos, setMedicamentos] = useState<SaudeMedicamento[]>([]);
  const [consultas, setConsultas] = useState<SaudeConsulta[]>([]);
  const [sinaisVitais, setSinaisVitais] = useState<SaudeSinalVital[]>([]);
  const [contatos, setContatos] = useState<SaudeContatoEmergencia[]>([]);
  const [internacoes, setInternacoes] = useState<SaudeInternacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const [pRes, mRes, cRes, svRes, ctRes, iRes] = await Promise.all([
      supabase.from("saude_pacientes").select("*").eq("id", id).single(),
      supabase.from("saude_medicamentos").select("*").eq("paciente_id", id).order("nome"),
      supabase.from("saude_consultas").select("*").eq("paciente_id", id).order("data_hora", { ascending: false }),
      supabase.from("saude_sinais_vitais").select("*").eq("paciente_id", id).order("data_hora", { ascending: false }).limit(10),
      supabase.from("saude_contatos_emergencia").select("*").eq("paciente_id", id).order("prioridade"),
      supabase.from("saude_internacoes").select("*").eq("paciente_id", id).order("data_entrada", { ascending: false }),
    ]);
    if (pRes.error) setError(pRes.error.message);
    else setPaciente(pRes.data as SaudePaciente);
    setMedicamentos((mRes.data ?? []) as SaudeMedicamento[]);
    setConsultas((cRes.data ?? []) as SaudeConsulta[]);
    setSinaisVitais((svRes.data ?? []) as SaudeSinalVital[]);
    setContatos((ctRes.data ?? []) as SaudeContatoEmergencia[]);
    setInternacoes((iRes.data ?? []) as SaudeInternacao[]);
    setLoading(false);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  // ── Medicamentos ──────────────────────────────────────────────────────────
  async function addMedicamento(values: Omit<SaudeMedicamento, "id" | "created_at" | "paciente_id">) {
    const supabase = createClient();
    const { data, error: err } = await supabase
      .from("saude_medicamentos").insert({ ...values, paciente_id: id }).select().single();
    if (err) throw new Error(err.message);
    setMedicamentos((prev) => [...prev, data as SaudeMedicamento]);
    return data as SaudeMedicamento;
  }

  async function updateMedicamento(medId: string, values: Partial<SaudeMedicamento>) {
    const supabase = createClient();
    const { data, error: err } = await supabase
      .from("saude_medicamentos").update(values).eq("id", medId).select().single();
    if (err) throw new Error(err.message);
    setMedicamentos((prev) => prev.map((m) => (m.id === medId ? (data as SaudeMedicamento) : m)));
  }

  async function deleteMedicamento(medId: string) {
    const supabase = createClient();
    const { error: err } = await supabase.from("saude_medicamentos").delete().eq("id", medId);
    if (err) throw new Error(err.message);
    setMedicamentos((prev) => prev.filter((m) => m.id !== medId));
  }

  // ── Consultas ─────────────────────────────────────────────────────────────
  async function addConsulta(values: Omit<SaudeConsulta, "id" | "created_at" | "paciente_id">) {
    const supabase = createClient();
    const { data, error: err } = await supabase
      .from("saude_consultas").insert({ ...values, paciente_id: id }).select().single();
    if (err) throw new Error(err.message);
    setConsultas((prev) => [data as SaudeConsulta, ...prev]);
    return data as SaudeConsulta;
  }

  async function deleteConsulta(consultaId: string) {
    const supabase = createClient();
    const { error: err } = await supabase.from("saude_consultas").delete().eq("id", consultaId);
    if (err) throw new Error(err.message);
    setConsultas((prev) => prev.filter((c) => c.id !== consultaId));
  }

  // ── Sinais Vitais ─────────────────────────────────────────────────────────
  async function addSinalVital(values: Omit<SaudeSinalVital, "id" | "paciente_id">) {
    const supabase = createClient();
    const { data, error: err } = await supabase
      .from("saude_sinais_vitais").insert({ ...values, paciente_id: id }).select().single();
    if (err) throw new Error(err.message);
    setSinaisVitais((prev) => [data as SaudeSinalVital, ...prev]);
    return data as SaudeSinalVital;
  }

  return {
    paciente, medicamentos, consultas, sinaisVitais, contatos, internacoes,
    loading, error, refetch: load,
    addMedicamento, updateMedicamento, deleteMedicamento,
    addConsulta, deleteConsulta,
    addSinalVital,
    setPaciente,
  };
}
