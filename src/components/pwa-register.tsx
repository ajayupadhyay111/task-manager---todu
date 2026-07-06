"use client";
import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

type BIPEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

export function PWARegister() {
  const [prompt, setPrompt] = useState<BIPEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      const url = "/sw.js";
      navigator.serviceWorker.register(url).catch(() => {});
    }
    const onBip = (e: Event) => {
      e.preventDefault();
      setPrompt(e as BIPEvent);
    };
    window.addEventListener("beforeinstallprompt", onBip);
    return () => window.removeEventListener("beforeinstallprompt", onBip);
  }, []);

  if (!prompt || dismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
        className="pb-safe fixed inset-x-3 bottom-24 z-40 mx-auto max-w-md lg:bottom-6"
      >
        <div className="glass-strong card-shadow flex items-center gap-3 rounded-2xl px-4 py-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-accent">
            <Download className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold">Install Todu</div>
            <div className="truncate text-xs text-white/50">Add to home screen for offline access</div>
          </div>
          <button
            onClick={async () => { await prompt.prompt(); await prompt.userChoice; setPrompt(null); }}
            className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/15"
          >Install</button>
          <button onClick={() => setDismissed(true)} className="rounded-lg p-1.5 text-white/50 hover:bg-white/5 hover:text-white" aria-label="Dismiss"><X className="h-4 w-4" /></button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
