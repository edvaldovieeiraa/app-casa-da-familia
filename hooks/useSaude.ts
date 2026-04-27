"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type {
  SaudePaciente, SaudeMedicamento, SaudeDose,
  SaudeConsulta, SaudeInternacao, SaudeSinaisVitais, SaudeContatoEmergencia,
} from "@/types/database";

// ─── Pacientes ────────────────────────────────────────────────────────────────

export function usePacientes() {
  const [pacientes, setPacientes] = useState<SaudePaciente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { data, error: err } = await supabase
      .from("saude_pacientes")
      .select("*")
      .order("nome");
    if (err) setError(err.message);
    else setPacientes((data ?? []) as SaudePaciente[]);
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
    setPacientes((prev) => [...prev, data as SaudePaciente].sort((a, b) => a.nome.localeCompare(b.nome)));
    return data as SaudePaciente;
  }

  async function updatePaciente(id: string, values: Partial<SaudePaciente>) {
    const supabase = createClient();
    const { data, error: err } = await supabase
      .from("saude_pacientes").update(values).eq("id", id).select().single();
    if (err) throw new Error(err.message);
    setPacientes((prev) => prev.map((p) => (p.id === id ? data as SaudePaciente : p)));
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const { data, error: err } = await supabase
      .from("saude_pacientes").select("*").eq("id", id).single();
    if (err) setError(err.message);
    else setPaciente(data as SaudePaciente);
    setLoading(false);
  }, [id]);

  useEffect(() => { void fetch(); }, [fetch]);

  async function update(values: Partial<SaudePaciente>) {
    const supabase = createClient();
    const { data, error: err } = await supabase
      .from("saude_pacientes").update(values).eq("id", id).select().single();
    if (err) throw new Error(err.message);
    setPaciente(data as SaudePaciente);
    return data as SaudePaciente;
  }

  return { paciente, loading, error, refetch: fetch, update };
}

// ─── Medicamentos ─────────────────────────────────────────────────────────────

export function useMedicamentos(pacienteId: string) {
  const [medicamentos, setMedicamentos] = useState<SaudeMedicamento[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("saude_medicamentos")
      .select("*")
      .eq("paciente_id", pacienteId)
      .order("nome");
    setMedicamentos((data ?? []) as SaudeMedicamento[]);
    setLoading(false);
  }, [pacienteId]);

  useEffect(() => { void fetch(); }, [fetch]);

  async function createMedicamento(values: Omit<SaudeMedicamento, "id" | "created_at">) {
    const supabase = createClient();
    const { data, error: err } = await supabase
      .from("saude_medicamentos").insert({ ...values, paciente_id: pacienteId }).select().single();
    if (err) throw new Error(err.message);
    setMedicamentos((prev) => [...prev, data as SaudeMedicamento]);
    return data as SaudeMedicamento;
  }

  async function updateMedicamento(id: string, values: Partial<SaudeMedicamento>) {
    const supabase = createClient();
    const { data, error: err } = await supabase
      .from("saude_medicamentos").update(values).eq("id", id).select().single();
    if (err) throw new Error(err.message);
    setMedicamentos((prev) => prev.map((m) => (m.id === id ? data as SaudeMedicamento : m)));
    return data as SaudeMedicamento;
  }

  async function deleteMedicamento(id: string) {
    const supabase = createClient();
    const { error: err } = await supabase.from("saude_medicamentos").delete().eq("id", id);
    if (err) throw new Error(err.message);
    setMedicamentos((prev) => prev.filter((m) => m.id !== id));
  }

  const ativos = medicamentos.filter((m) => m.ativo);
  const inativos = medicamentos.filter((m) => !m.ativo);

  return { medicamentos, ativos, inativos, loading, refetch: fetch, createMedicamento, updateMedicamento, deleteMedicamento };
}

// ─── Doses ────────────────────────────────────────────────────────────────────

export function useDoses(medicamentoId: string) {
  const [doses, setDoses] = useState<SaudeDose[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const trinta = new Date();
    trinta.setDate(trinta.getDate() - 30);
    const { data } = await supabase
      .from("saude_doses")
      .select("*")
      .eq("medicamento_id", medicamentoId)
      .gte("data_hora", trinta.toISOString())
      .order("data_hora", { ascending: false });
    setDoses((data ?? []) as SaudeDose[]);
    setLoading(false);
  }, [medicamentoId]);

  useEffect(() => { void fetch(); }, [fetch]);

  async function registrarDose(tomou: boolean, observacao?: string) {
    const supabase = createClient();
    const { data, error: err } = await supabase
      .from("saude_doses")
      .insert({ medicamento_id: medicamentoId, tomou, observacao: observacao ?? null, data_hora: new Date().toISOString() })
      .select().single();
    if (err) throw new Error(err.message);
    setDoses((prev) => [data as SaudeDose, ...prev]);
    return data as SaudeDose;
  }

  const adesao = doses.length > 0
    ? Math.round((doses.filter((d) => d.tomou).length / doses.length) * 100)
    : null;

  return { doses, loading, adesao, refetch: fetch, registrarDose };
}

// ─── Consultas ────────────────────────────────────────────────────────────────

export function useConsultas(pacienteId: string) {
  const [consultas, setConsultas] = useState<SaudeConsulta[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("saude_consultas")
      .select("*")
      .eq("paciente_id", pacienteId)
      .order("data_hora", { ascending: false });
    setConsultas((data ?? []) as SaudeConsulta[]);
    setLoading(false);
  }, [pacienteId]);

  useEffect(() => { void fetch(); }, [fetch]);

  async function createConsulta(values: Omit<SaudeConsulta, "id" | "created_at">) {
    const supabase = createClient();
    const { data, error: err } = await supabase
      .from("saude_consultas").insert({ ...values, paciente_id: pacienteId }).select().single();
    if (err) throw new Error(err.message);
    setConsultas((prev) => [data as SaudeConsulta, ...prev]);
    return data as SaudeConsulta;
  }

  async function updateConsulta(id: string, values: Partial<SaudeConsulta>) {
    const supabase = createClient();
    const { data, error: err } = await supabase
      .from("saude_consultas").update(values).eq("id", id).select().single();
    if (err) throw new Error(err.message);
    setConsultas((prev) => prev.map((c) => (c.id === id ? data as SaudeConsulta : c)));
    return data as SaudeConsulta;
  }

  async function deleteConsulta(id: string) {
    const supabase = createClient();
    const { error: err } = await supabase.from("saude_consultas").delete().eq("id", id);
    if (err) throw new Error(err.message);
    setConsultas((prev) => prev.filter((c) => c.id !== id));
  }

  const agora = new Date().toISOString();
  const proximas = consultas.filter((c) => c.data_hora && c.data_hora >= agora).reverse();
  const historico = consultas.filter((c) => !c.data_hora || c.data_hora < agora);

  return { consultas, proximas, historico, loading, refetch: fetch, createConsulta, updateConsulta, deleteConsulta };
}

// ─── Internações ──────────────────────────────────────────────────────────────

export function useInternacoes(pacienteId: string) {
  const [internacoes, setInternacoes] = useState<SaudeInternacao[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("saude_internacoes")
      .select("*")
      .eq("paciente_id", pacienteId)
      .order("data_entrada", { ascending: false });
    setInternacoes((data ?? []) as SaudeInternacao[]);
    setLoading(false);
  }, [pacienteId]);

  useEffect(() => { void fetch(); }, [fetch]);

  async function createInternacao(values: Omit<SaudeInternacao, "id" | "created_at">) {
    const supabase = createClient();
    const { data, error: err } = await supabase
      .from("saude_internacoes").insert({ ...values, paciente_id: pacienteId }).select().single();
    if (err) throw new Error(err.message);
    setInternacoes((prev) => [data as SaudeInternacao, ...prev]);
    return data as SaudeInternacao;
  }

  async function updateInternacao(id: string, values: Partial<SaudeInternacao>) {
    const supabase = createClient();
    const { data, error: err } = await supabase
      .from("saude_internacoes").update(values).eq("id", id).select().single();
    if (err) throw new Error(err.message);
    setInternacoes((prev) => prev.map((i) => (i.id === id ? data as SaudeInternacao : i)));
    return data as SaudeInternacao;
  }

  async function deleteInternacao(id: string) {
    const supabase = createClient();
    const { error: err } = await supabase.from("saude_internacoes").delete().eq("id", id);
    if (err) throw new Error(err.message);
    setInternacoes((prev) => prev.filter((i) => i.id !== id));
  }

  const emCurso = internacoes.find((i) => !i.data_alta) ?? null;

  return { internacoes, emCurso, loading, refetch: fetch, createInternacao, updateInternacao, deleteInternacao };
}

// ─── Sinais Vitais ────────────────────────────────────────────────────────────

export function useSinaisVitais(pacienteId: string) {
  const [sinais, setSinais] = useState<SaudeSinaisVitais[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("saude_sinais_vitais")
      .select("*")
      .eq("paciente_id", pacienteId)
      .order("data_hora", { ascending: false })
      .limit(30);
    setSinais((data ?? []) as SaudeSinaisVitais[]);
    setLoading(false);
  }, [pacienteId]);

  useEffect(() => { void fetch(); }, [fetch]);

  async function registrar(values: Omit<SaudeSinaisVitais, "id">) {
    const supabase = createClient();
    const { data, error: err } = await supabase
      .from("saude_sinais_vitais")
      .insert({ ...values, paciente_id: pacienteId })
      .select().single();
    if (err) throw new Error(err.message);
    setSinais((prev) => [data as SaudeSinaisVitais, ...prev]);
    return data as SaudeSinaisVitais;
  }

  return { sinais, loading, refetch: fetch, registrar };
}

// ─── Contatos de Emergência ───────────────────────────────────────────────────

export function useContatosEmergencia(pacienteId: string) {
  const [contatos, setContatos] = useState<SaudeContatoEmergencia[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("saude_contatos_emergencia")
      .select("*")
      .eq("paciente_id", pacienteId)
      .order("prioridade");
    setContatos((data ?? []) as SaudeContatoEmergencia[]);
    setLoading(false);
  }, [pacienteId]);

  useEffect(() => { void fetch(); }, [fetch]);

  async function createContato(values: Omit<SaudeContatoEmergencia, "id">) {
    const supabase = createClient();
    const { data, error: err } = await supabase
      .from("saude_contatos_emergencia").insert({ ...values, paciente_id: pacienteId }).select().single();
    if (err) throw new Error(err.message);
    setContatos((prev) => [...prev, data as SaudeContatoEmergencia]);
    return data as SaudeContatoEmergencia;
  }

  async function deleteContato(id: string) {
    const supabase = createClient();
    const { error: err } = await supabase.from("saude_contatos_emergencia").delete().eq("id", id);
    if (err) throw new Error(err.message);
    setContatos((prev) => prev.filter((c) => c.id !== id));
  }

  return { contatos, loading, refetch: fetch, createContato, deleteContato };
}
