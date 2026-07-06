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
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
    const onBip = (e: Event) => {
      e.preventDefault();
      setPrompt(e as BIPEvent);
    };
    window.addEventListener("beforeinstallprompt", onBip);
    return () => window.removeEventListener("beforeinstallprompt", onBip);
  }, []);

  return (
    <AnimatePresence>
      {prompt && !dismissed && (
        <motion.div
          initial={{ y: -90, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -90, opacity: 0 }}
          transition={{ type: "spring", damping: 26, stiffness: 300 }}
          className="fixed inset-x-3 z-[60] mx-auto max-w-md"
          style={{ top: "calc(env(safe-area-inset-top, 0px) + 10px)" }}
        >
          <div className="glass-strong card-shadow flex items-center gap-3 rounded-2xl px-4 py-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-accent">
              <Download className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold">Install Todu</div>
              <div className="truncate text-xs text-white/50">Add to home screen for the full app experience</div>
            </div>
            <button
              onClick={async () => { await prompt.prompt(); await prompt.userChoice; setPrompt(null); }}
              className="shrink-0 rounded-lg bg-gradient-to-br from-brand-500 to-accent px-3 py-1.5 text-xs font-medium text-white"
            >Install</button>
            <button onClick={() => setDismissed(true)} className="shrink-0 rounded-lg p-1.5 text-white/50 hover:bg-white/5 hover:text-white" aria-label="Dismiss">
              <X className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
