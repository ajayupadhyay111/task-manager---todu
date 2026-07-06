"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUIStore } from "@/lib/store";

export function KeyboardShortcuts() {
  const router = useRouter();
  const setPalette = useUIStore((s) => s.setPaletteOpen);
  const setQuickAdd = useUIStore((s) => s.setQuickAdd);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const t = e.target as HTMLElement;
      const inField = t.tagName === "INPUT" || t.tagName === "TEXTAREA" || (t as HTMLElement).isContentEditable;

      // Cmd/Ctrl + K always
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPalette(true);
        return;
      }
      if (inField) return;

      switch (e.key.toLowerCase()) {
        case "/": e.preventDefault(); setPalette(true); break;
        case "t": e.preventDefault(); setQuickAdd(true, "task"); break;
        case "c": e.preventDefault(); setQuickAdd(true, "client"); break;
        case "p": e.preventDefault(); setQuickAdd(true, "project"); break;
        case "n": e.preventDefault(); setQuickAdd(true, "note"); break;
        case "d": e.preventDefault(); router.push("/"); break;
        case "g": e.preventDefault(); router.push("/calendar"); break;
        case "i": e.preventDefault(); router.push("/inbox"); break;
        case "?": e.preventDefault(); router.push("/settings#shortcuts"); break;
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router, setPalette, setQuickAdd]);

  return null;
}
