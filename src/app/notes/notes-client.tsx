"use client";
import { useMemo, useState } from "react";
import { Card, CardBody } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty";
import { NotebookPen, Plus, Search } from "lucide-react";
import { Input, Textarea } from "@/components/ui/input";
import { cn, fmtRelative } from "@/lib/utils";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useRouter } from "next/navigation";

type Note = {
  id: string; title: string; body: string; kind: string;
  updatedAt: string; color: string | null; pinned: boolean;
};

const KINDS = [
  { v: "", l: "All" },
  { v: "note", l: "Notes" },
  { v: "meeting", l: "Meeting" },
  { v: "journal", l: "Journal" },
  { v: "sticky", l: "Sticky" },
];

export function NotesClient({ initial }: { initial: Note[] }) {
  const router = useRouter();
  const [notes, setNotes] = useState(initial);
  const [selected, setSelected] = useState<string | null>(initial[0]?.id ?? null);
  const [q, setQ] = useState(""); const [kind, setKind] = useState("");

  const filtered = useMemo(() => notes.filter(n =>
    (!kind || n.kind === kind) &&
    (!q || n.title.toLowerCase().includes(q.toLowerCase()) || n.body.toLowerCase().includes(q.toLowerCase()))
  ), [notes, kind, q]);

  const current = notes.find(n => n.id === selected) ?? null;

  const create = async () => {
    const res = await fetch("/api/notes", {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ title: "Untitled", body: "", kind: kind || "note" }),
    });
    const j = await res.json();
    setNotes(p => [{ ...j.note, updatedAt: j.note.updatedAt }, ...p]);
    setSelected(j.note.id);
    router.refresh();
  };

  const patch = async (id: string, data: Partial<Note>) => {
    setNotes(p => p.map(x => x.id === id ? { ...x, ...data } : x));
    await fetch(`/api/notes/${id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify(data) });
  };

  return (
    <div className="mx-auto max-w-[1400px] space-y-4">
      <header className="flex items-end justify-between">
        <div>
          <div className="text-[11px] uppercase tracking-widest text-white/40">Second brain</div>
          <h1 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">Notes</h1>
        </div>
        <button onClick={create} className="flex items-center gap-1.5 rounded-xl bg-gradient-to-br from-brand-500 to-accent px-3 py-2 text-sm text-white shadow-lg shadow-brand-500/25"><Plus className="h-4 w-4" /> New note</button>
      </header>

      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <Card>
          <div className="border-b border-white/[0.05] p-3">
            <div className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3">
              <Search className="h-3.5 w-3.5 text-white/40" />
              <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search notes…" className="w-full bg-transparent py-2 text-sm text-white outline-none placeholder:text-white/30" />
            </div>
            <div className="mt-2 flex gap-1 overflow-x-auto">
              {KINDS.map(k => (
                <button key={k.v} onClick={() => setKind(k.v)}
                  className={cn("shrink-0 rounded-lg px-2 py-1 text-[11px]", kind === k.v ? "bg-white/[0.1] text-white" : "text-white/50 hover:text-white")}>
                  {k.l}
                </button>
              ))}
            </div>
          </div>
          <div className="max-h-[65vh] overflow-y-auto p-2">
            {filtered.length === 0 && (
              <div className="p-8 text-center text-sm text-white/40">No notes.</div>
            )}
            {filtered.map(n => (
              <button key={n.id} onClick={() => setSelected(n.id)}
                className={cn(
                  "block w-full rounded-xl border border-transparent px-3 py-2.5 text-left text-sm transition",
                  selected === n.id ? "border-white/[0.08] bg-white/[0.04]" : "hover:bg-white/[0.03]"
                )}>
                <div className="flex items-center justify-between">
                  <div className="truncate font-medium text-white">{n.title || "Untitled"}</div>
                  <span className="text-[10px] uppercase tracking-widest text-white/40">{n.kind}</span>
                </div>
                <div className="mt-0.5 truncate text-[11px] text-white/50">{n.body.slice(0, 60) || "Empty note"}</div>
                <div className="mt-0.5 text-[10px] text-white/30">{fmtRelative(n.updatedAt)}</div>
              </button>
            ))}
          </div>
        </Card>

        <Card>
          {current ? (
            <motion.div key={current.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col">
              <div className="border-b border-white/[0.05] p-4">
                <Input value={current.title}
                  onChange={e => patch(current.id, { title: e.target.value })}
                  placeholder="Title" className="border-none bg-transparent text-lg font-semibold focus:ring-0" />
              </div>
              <div className="grid gap-4 p-4 md:grid-cols-2">
                <Textarea
                  value={current.body}
                  onChange={e => patch(current.id, { body: e.target.value })}
                  rows={22}
                  placeholder="Write in markdown…"
                  className="font-mono"
                />
                <div className="prose prose-invert max-w-none rounded-xl border border-white/[0.05] bg-white/[0.02] p-4 text-sm">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {current.body || "*Preview will appear here.*"}
                  </ReactMarkdown>
                </div>
              </div>
            </motion.div>
          ) : (
            <CardBody>
              <EmptyState icon={<NotebookPen className="h-6 w-6" />} title="No note selected" description="Pick a note or create a new one." />
            </CardBody>
          )}
        </Card>
      </div>
    </div>
  );
}
