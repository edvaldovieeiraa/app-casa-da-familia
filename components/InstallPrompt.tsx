"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, X } from "lucide-react";

const STORAGE_KEY = "install-prompt-dismissed";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY)) return;

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

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 26, stiffness: 300 }}
          className="fixed bottom-20 left-4 right-4 z-50 max-w-[480px] mx-auto"
        >
          <div className="bg-[#1A1A2E] rounded-[16px] px-4 py-3 flex items-center gap-3 shadow-xl">
            <div className="w-10 h-10 rounded-[10px] bg-white/10 flex items-center justify-center flex-shrink-0">
              <Download size={20} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-700 text-sm leading-tight">Instalar no celular</p>
              <p className="text-white/60 text-xs mt-0.5">Acesse sem precisar do browser</p>
            </div>
            <button
              onClick={install}
              className="px-4 py-2 bg-white text-[#1A1A2E] text-sm font-700 rounded-[10px] flex-shrink-0"
            >
              Instalar
            </button>
            <button
              onClick={dismiss}
              aria-label="Fechar"
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 flex-shrink-0"
            >
              <X size={16} className="text-white/60" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
