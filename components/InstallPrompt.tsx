"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, X, Smartphone } from "lucide-react";

const STORAGE_KEY = "install-prompt-dismissed";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

interface InstallPromptProps {
  /** Sem BottomNav — ajusta o bottom para ficar rente à base da tela */
  noNav?: boolean;
}

export function InstallPrompt({ noNav = false }: InstallPromptProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY)) return;

    // Já está instalado como PWA — não mostrar
    if (window.matchMedia("(display-mode: standalone)").matches) return;

    // O evento pode ter disparado antes do React hidratar; o layout.tsx
    // o captura globalmente em window.__pwaPrompt para não perdermos.
    const early = (window as Window & { __pwaPrompt?: BeforeInstallPromptEvent }).__pwaPrompt;
    if (early) {
      setDeferredPrompt(early);
      setVisible(true);
      return;
    }

    function handler(e: Event) {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setVisible(true);
    }

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  function dismiss() {
    setVisible(false);
    localStorage.setItem(STORAGE_KEY, "1");
  }

  async function install() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      localStorage.setItem(STORAGE_KEY, "1");
    }
    setVisible(false);
  }

  const bottomClass = noNav ? "bottom-4" : "bottom-[76px]";

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 80, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 80, opacity: 0, scale: 0.95 }}
          transition={{ type: "spring", damping: 24, stiffness: 280 }}
          className={`fixed ${bottomClass} left-4 right-4 z-50 max-w-[480px] mx-auto`}
        >
          <div
            className="flex items-center gap-3 px-4 py-3.5 rounded-[20px]"
            style={{
              background: "rgba(22, 22, 42, 0.94)",
              backdropFilter: "blur(30px) saturate(200%)",
              WebkitBackdropFilter: "blur(30px) saturate(200%)",
              border: "1px solid rgba(255,255,255,0.14)",
              boxShadow: "0 8px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)",
            }}
          >
            {/* Ícone */}
            <div
              className="w-11 h-11 rounded-[14px] flex items-center justify-center flex-shrink-0"
              style={{
                background: "linear-gradient(135deg, #9C27B0 0%, #1A1A2E 100%)",
                boxShadow: "0 4px 14px rgba(156,39,176,0.35)",
              }}
            >
              <Smartphone size={20} style={{ color: "#fff" }} />
            </div>

            {/* Texto */}
            <div className="flex-1 min-w-0">
              <p className="font-700 leading-tight" style={{ fontSize: 14, color: "#F0F0FF" }}>
                Instalar no celular
              </p>
              <p className="leading-tight mt-0.5" style={{ fontSize: 12, color: "rgba(240,240,255,0.5)" }}>
                Acesse direto da tela inicial
              </p>
            </div>

            {/* Botão instalar */}
            <button
              onClick={install}
              className="flex items-center gap-1.5 flex-shrink-0 font-700 rounded-[12px] transition-all"
              style={{
                fontSize: 13,
                padding: "8px 14px",
                background: "linear-gradient(135deg, #9C27B0, #7B1FA2)",
                color: "#fff",
                boxShadow: "0 4px 14px rgba(156,39,176,0.4)",
              }}
            >
              <Download size={14} />
              Instalar
            </button>

            {/* Fechar */}
            <button
              onClick={dismiss}
              aria-label="Fechar"
              className="w-8 h-8 flex items-center justify-center rounded-full flex-shrink-0 transition-colors"
              style={{ color: "rgba(240,240,255,0.4)" }}
            >
              <X size={16} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
