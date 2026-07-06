"use client";
import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

type Note = { id: string; title: string; body: string; color: string | null };

const COLORS = ["#FBBF24", "#F87171", "#34D399", "#A78BFA", "#4F7CFF", "#F472B6"];

export function StickyNotesRow({ initial }: { initial: Note[] }) {
  const router = useRouter();
  const [notes, setNotes] = useState<Note[]>(initial);
  const [creating, setCreating] = useState(false);
  const lockRef = useRef(false);

  const addSticky = async () => {
    if (lockRef.current || creating) return;
    lockRef.current = true;
    setCreating(true);
    try {
      const color = COLORS[notes.length % COLORS.length];
      const res = await fetch("/api/notes", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ title: "Note", body: "", kind: "sticky", color }),
      });
      const j = await res.json();
      setNotes((prev) => [j.note, ...prev]);
      router.refresh();
    } finally {
      // Cooldown to prevent rapid double-taps (mobile bounce, keypress + click)
      setTimeout(() => { lockRef.current = false; setCreating(false); }, 500);
    }
  };

  const save = async (n: Note) => {
    await fetch(`/api/notes/${n.id}`, {
      method: "PATCH", headers: { "content-type": "application/json" },
      body: JSON.stringify({ title: n.title, body: n.body }),
    });
  };

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {notes.map((n, i) => {
        const c = n.color ?? COLORS[i % COLORS.length];
        return (
          <motion.div key={n.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
            className="rounded-2xl p-4 shadow-xl"
            style={{ background: `linear-gradient(135deg, ${c}30, ${c}12)`, boxShadow: `0 20px 40px -20px ${c}40` }}
          >
            <input
              defaultValue={n.title}
              onBlur={e => { const v = e.target.value; if (v === n.title) return; setNotes(p => p.map(x => x.id === n.id ? { ...x, title: v } : x)); save({ ...n, title: v }); }}
              className="w-full bg-transparent text-sm font-semibold text-white outline-none placeholder:text-white/40"
              placeholder="Title"
            />
            <textarea
              defaultValue={n.body}
              onBlur={e => { const v = e.target.value; if (v === n.body) return; setNotes(p => p.map(x => x.id === n.id ? { ...x, body: v } : x)); save({ ...n, body: v }); }}
              className="mt-1 h-20 w-full resize-none bg-transparent text-[13px] text-white/80 outline-none placeholder:text-white/40"
              placeholder="Write it down…"
            />
          </motion.div>
        );
      })}
      <button
        onClick={addSticky}
        disabled={creating}
        aria-busy={creating}
        className="grid h-full min-h-[120px] place-items-center rounded-2xl border border-dashed border-white/[0.08] text-white/40 transition hover:border-white/[0.2] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
      >
        <div className="flex flex-col items-center gap-1 text-xs">
          <Plus className={`h-4 w-4 ${creating ? "animate-spin" : ""}`} />
          {creating ? "Creating…" : "New sticky"}
        </div>
      </button>
    </div>
  );
}
