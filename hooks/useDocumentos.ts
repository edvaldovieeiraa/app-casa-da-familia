"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Documento } from "@/types/database";

export function useDocumentos() {
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { data, error: err } = await supabase
      .from("documentos")
      .select("*")
      .order("tipo");
    if (err) setError(err.message);
    else setDocumentos(data as Documento[]);
    setLoading(false);
  }, []);

  useEffect(() => { void fetch(); }, [fetch]);

  async function createDocumento(values: Omit<Documento, "id" | "created_at" | "updated_at">) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Usuário não autenticado");
    const { data, error: err } = await supabase.from("documentos").insert({ ...values, user_id: user.id }).select().single();
    if (err) throw new Error(err.message);
    setDocumentos((prev) => [data as Documento, ...prev]);
    return data as Documento;
  }

  async function updateDocumento(id: string, values: Partial<Documento>) {
    const supabase = createClient();
    const { data, error: err } = await supabase
      .from("documentos").update({ ...values, updated_at: new Date().toISOString() })
      .eq("id", id).select().single();
    if (err) throw new Error(err.message);
    setDocumentos((prev) => prev.map((d) => (d.id === id ? (data as Documento) : d)));
    return data as Documento;
  }

  async function deleteDocumento(id: string) {
    const supabase = createClient();
    const { error: err } = await supabase.from("documentos").delete().eq("id", id);
    if (err) throw new Error(err.message);
    setDocumentos((prev) => prev.filter((d) => d.id !== id));
  }

  return { documentos, loading, error, refetch: fetch, createDocumento, updateDocumento, deleteDocumento };
}

export function useDocumento(id: string) {
  const [documento, setDocumento] = useState<Documento | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const supabase = createClient();
      const { data, error: err } = await supabase.from("documentos").select("*").eq("id", id).single();
      if (err) setError(err.message);
      else setDocumento(data as Documento);
      setLoading(false);
    }
    load();
  }, [id]);

  return { documento, loading, error };
}
