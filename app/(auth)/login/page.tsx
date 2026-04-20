"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Home, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ToastContainer } from "@/components/ui/Toast";
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
      <div className="min-h-screen flex flex-col bg-[#F8F9FA]">
        {/* Header */}
        <div
          className="flex flex-col items-center justify-center gap-3 py-12 px-6"
          style={{ backgroundColor: "#1A1A2E" }}
        >
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", damping: 18 }}
            className="w-20 h-20 rounded-[20px] bg-white/10 flex items-center justify-center"
          >
            <Home size={40} className="text-white" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-2xl font-800 text-white"
          >
            Casa da Família
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-white/60 text-sm"
          >
            Entre na sua conta para continuar
          </motion.p>
        </div>

        {/* Formulário */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, type: "spring", damping: 24 }}
          className="flex-1 max-w-[440px] w-full mx-auto px-6 py-8 flex flex-col gap-5"
        >
          {magicSent ? (
            <div className="flex flex-col items-center gap-4 py-10 text-center">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <Mail size={32} className="text-[#4CAF50]" />
              </div>
              <h2 className="text-xl font-700 text-[#333333]">Link enviado!</h2>
              <p className="text-[#666666]">
                Verifique seu e-mail <strong>{email}</strong> e clique no link para entrar.
              </p>
              <Button
                variant="ghost"
                onClick={() => setMagicSent(false)}
                className="mt-2"
              >
                Usar outra forma de entrar
              </Button>
            </div>
          ) : (
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
                  className="absolute right-3 bottom-[12px] text-[#666666]"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <Button
                type="submit"
                fullWidth
                loading={loadingLogin}
                style={{ backgroundColor: "#1A1A2E" }}
                className="mt-2"
              >
                Entrar
              </Button>

              <div className="flex items-center gap-3 my-1">
                <div className="flex-1 h-px bg-[#E0E0E0]" />
                <span className="text-xs text-[#999999]">ou</span>
                <div className="flex-1 h-px bg-[#E0E0E0]" />
              </div>

              <Button
                type="button"
                variant="secondary"
                fullWidth
                loading={loadingMagic}
                icon={Mail}
                onClick={handleMagicLink}
              >
                Entrar com link no e-mail
              </Button>

              <p className="text-xs text-[#999999] text-center leading-relaxed">
                Sem senha: enviaremos um link mágico para você entrar com um clique.
              </p>
            </form>
          )}
        </motion.div>
      </div>
    </>
  );
}
