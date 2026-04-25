"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Home, Mail, Lock, Eye, EyeOff, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ToastContainer } from "@/components/ui/Toast";
import { InstallPrompt } from "@/components/InstallPrompt";
import { useToast } from "@/hooks/useToast";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loadingLogin, setLoadingLogin] = useState(false);
  const [loadingMagic, setLoadingMagic] = useState(false);
  const [magicSent, setMagicSent] = useState(false);
  const { toasts, addToast, removeToast } = useToast();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      addToast("Preencha o e-mail e a senha", "warning");
      return;
    }
    setLoadingLogin(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setLoadingLogin(false);
      addToast("E-mail ou senha incorretos", "error");
    } else {
      router.push("/");
    }
  }

  async function handleMagicLink() {
    if (!email) {
      addToast("Digite seu e-mail primeiro", "warning");
      return;
    }
    setLoadingMagic(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${location.origin}/` },
    });
    setLoadingMagic(false);
    if (error) {
      addToast("Não foi possível enviar o link", "error");
    } else {
      setMagicSent(true);
      addToast("Link enviado! Verifique seu e-mail", "success");
    }
  }

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <InstallPrompt noNav />

      <div className="min-h-screen flex flex-col items-center justify-center px-5 py-10">
        {/* Background glow */}
        <div
          className="fixed inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 70% 60% at 50% 0%, rgba(147,51,234,0.18) 0%, transparent 65%)",
          }}
        />

        <div className="relative z-10 w-full max-w-[400px] flex flex-col gap-8">
          {/* Logo + título */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", damping: 20 }}
            className="flex flex-col items-center gap-4"
          >
            <div
              className="w-20 h-20 rounded-[22px] flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #9C27B0 0%, #1A1A2E 100%)",
                boxShadow: "0 8px 32px rgba(156,39,176,0.35)",
                border: "1px solid rgba(255,255,255,0.12)",
              }}
            >
              <Home size={36} style={{ color: "#fff" }} />
            </div>

            <div className="text-center">
              <h1
                className="font-800 leading-tight"
                style={{ fontSize: 26, color: "#F0F0FF", letterSpacing: "-0.02em" }}
              >
                Casa da Família
              </h1>
              <p style={{ fontSize: 14, color: "rgba(240,240,255,0.5)", marginTop: 4 }}>
                Entre na sua conta para continuar
              </p>
            </div>
          </motion.div>

          {/* Card de formulário */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12, type: "spring", damping: 22 }}
            style={{
              background: "rgba(255,255,255,0.06)",
              backdropFilter: "blur(24px) saturate(180%)",
              WebkitBackdropFilter: "blur(24px) saturate(180%)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 24,
              padding: 28,
              boxShadow: "0 8px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)",
            }}
          >
            {magicSent ? (
              /* ── Magic link enviado ── */
              <div className="flex flex-col items-center gap-5 py-4 text-center">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{
                    background: "rgba(76,175,80,0.18)",
                    border: "1px solid rgba(76,175,80,0.4)",
                  }}
                >
                  <CheckCircle size={32} style={{ color: "#4CAF50" }} />
                </div>

                <div className="flex flex-col gap-2">
                  <h2
                    className="font-700"
                    style={{ fontSize: 20, color: "#F0F0FF" }}
                  >
                    Link enviado!
                  </h2>
                  <p style={{ fontSize: 14, color: "rgba(240,240,255,0.55)", lineHeight: 1.6 }}>
                    Verifique seu e-mail{" "}
                    <strong style={{ color: "#F0F0FF" }}>{email}</strong>{" "}
                    e clique no link para entrar.
                  </p>
                </div>

                <Button
                  variant="ghost"
                  onClick={() => setMagicSent(false)}
                  className="mt-1"
                >
                  Usar outra forma de entrar
                </Button>
              </div>
            ) : (
              /* ── Formulário principal ── */
              <form onSubmit={handleLogin} className="flex flex-col gap-4">
                <Input
                  label="E-mail"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  leftIcon={Mail}
                  autoComplete="email"
                />

                <div className="relative">
                  <Input
                    label="Senha"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    leftIcon={Lock}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                    className="absolute right-3 bottom-[14px]"
                    style={{ color: "rgba(240,240,255,0.4)" }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                <Button
                  type="submit"
                  fullWidth
                  loading={loadingLogin}
                  style={{ backgroundColor: "#9C27B0" }}
                  className="mt-2"
                >
                  Entrar
                </Button>

                {/* Separador */}
                <div className="flex items-center gap-3 my-1">
                  <div className="flex-1 h-px" style={{ backgroundColor: "rgba(255,255,255,0.1)" }} />
                  <span style={{ fontSize: 12, color: "rgba(240,240,255,0.4)" }}>ou</span>
                  <div className="flex-1 h-px" style={{ backgroundColor: "rgba(255,255,255,0.1)" }} />
                </div>

                <Button
                  type="button"
                  variant="glass"
                  fullWidth
                  loading={loadingMagic}
                  icon={Mail}
                  onClick={handleMagicLink}
                >
                  Entrar com link no e-mail
                </Button>

                <p
                  className="text-center leading-relaxed"
                  style={{ fontSize: 12, color: "rgba(240,240,255,0.38)" }}
                >
                  Sem senha: enviaremos um link mágico para você entrar com um clique.
                </p>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </>
  );
}
