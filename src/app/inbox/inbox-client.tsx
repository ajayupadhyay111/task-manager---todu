"use client";
import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { TaskRow, type TaskRowData } from "@/components/task/task-row";
import { Input } from "@/components/ui/input";
import { Plus, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function InboxClient({ initial }: { initial: TaskRowData[] }) {
  const router = useRouter();
  const [items, setItems] = useState(initial);
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const lockRef = useRef(false);

  const add = async () => {
    if (!value.trim() || lockRef.current) return;
    lockRef.current = true; setBusy(true);
    try {
      const res = await fetch("/api/tasks", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ title: value.trim(), status: "inbox" }),
      });
      const j = await res.json();
      setItems(p => [j.task, ...p]);
      setValue("");
      toast.success("Added to inbox");
      router.refresh();
    } finally {
      setTimeout(() => { lockRef.current = false; setBusy(false); }, 300);
    }
  };

  return (
    <div className="space-y-3">
      <div className="glass card-shadow flex items-center gap-2 rounded-2xl p-2">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-500/20 to-accent/20 text-brand-300">
          <Sparkles className="h-4 w-4" />
        </div>
        <Input
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") add(); }}
          placeholder="Type an idea and press Enter…"
          className="border-none bg-transparent text-[15px] focus:ring-0"
        />
        <button
          onClick={add}
          disabled={busy || !value.trim()}
          aria-label="Add" aria-busy={busy}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-accent text-white transition disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus className={`h-4 w-4 ${busy ? "animate-spin" : ""}`} />
        </button>
      </div>

      <div className="space-y-1.5">
        <AnimatePresence initial={false}>
          {items.map((t) => (
            <motion.div key={t.id} layout>
              <TaskRow task={t} onChange={(id, patch) => {
                setItems(p => p.map(x => x.id === id ? { ...x, ...patch } : x));
                setTimeout(() => router.refresh(), 400);
              }} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
