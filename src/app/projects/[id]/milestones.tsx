"use client";
import { useState } from "react";
import { Check, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

type M = { id: string; title: string; done: boolean; dueDate: Date | string | null };

export function MilestoneList({ projectId, initial }: { projectId: string; initial: M[] }) {
  const [items, setItems] = useState<M[]>(initial);
  const [val, setVal] = useState("");

  const add = async () => {
    if (!val.trim()) return;
    const res = await fetch("/api/milestones", {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ title: val.trim(), projectId, order: items.length }),
    });
    const j = await res.json();
    setItems(p => [...p, j.milestone]);
    setVal("");
  };
  const toggle = async (id: string) => {
    const it = items.find(x => x.id === id); if (!it) return;
    setItems(p => p.map(x => x.id === id ? { ...x, done: !x.done } : x));
    await fetch("/api/milestones", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ id, done: !it.done }) });
  };

  return (
    <div className="space-y-2">
      {items.map(m => (
        <motion.div layout key={m.id} className="flex items-center gap-3 rounded-xl border border-white/[0.05] bg-white/[0.02] px-3 py-2">
          <button onClick={() => toggle(m.id)}
            className={cn("grid h-5 w-5 place-items-center rounded-md border transition",
              m.done ? "border-emerald-400/60 bg-emerald-400/25" : "border-white/[0.14] hover:border-brand-400/70")}>
            {m.done && <Check className="h-3 w-3 text-emerald-200" />}
          </button>
          <span className={cn("flex-1 text-sm", m.done && "text-white/40 line-through")}>{m.title}</span>
          {m.dueDate && <span className="text-[11px] text-white/40">{new Date(m.dueDate).toLocaleDateString()}</span>}
        </motion.div>
      ))}
      <div className="flex items-center gap-2">
        <Input value={val} onChange={e => setVal(e.target.value)} onKeyDown={e => { if (e.key === "Enter") add(); }} placeholder="Add milestone…" />
        <button onClick={add} className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-accent text-white"><Plus className="h-4 w-4" /></button>
      </div>
      {items.length === 0 && <div className="py-4 text-center text-sm text-white/40">No milestones yet.</div>}
    </div>
  );
}
