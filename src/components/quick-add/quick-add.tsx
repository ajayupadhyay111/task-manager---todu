"use client";
import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { useUIStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Calendar, ChevronDown, Flag, Folder, Tag, User, X } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function QuickAddProvider({ children }: { children: React.ReactNode }) {
  const open = useUIStore((s) => s.quickAddOpen);
  const kind = useUIStore((s) => s.quickAddKind);
  const setOpen = useUIStore((s) => s.setQuickAdd);
  return (
    <>
      {children}
      <Dialog.Root open={open} onOpenChange={(o) => setOpen(o)}>
        <AnimatePresence>
          {open && (
            <Dialog.Portal forceMount>
              <Dialog.Overlay asChild>
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md"
                />
              </Dialog.Overlay>
              <Dialog.Content asChild>
                <motion.div
                  initial={{ opacity: 0, scale: 0.98, y: 8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98, y: 8 }}
                  transition={{ duration: 0.18, ease: [0.2, 0.8, 0.2, 1] }}
                  className="pb-safe fixed inset-x-3 top-[8%] z-50 mx-auto w-auto max-w-[560px] sm:inset-x-auto sm:left-1/2 sm:top-[12%] sm:w-[92vw] sm:-translate-x-1/2"
                >
                  <div className="glass-strong card-shadow max-h-[85vh] overflow-y-auto rounded-2xl">
                    <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/[0.05] bg-[rgba(20,22,29,0.85)] px-4 py-3 backdrop-blur-xl">
                      <Dialog.Title className="text-sm font-semibold capitalize">New {kind}</Dialog.Title>
                      <Dialog.Close asChild>
                        <button className="rounded-lg p-1.5 text-white/50 hover:bg-white/[0.05] hover:text-white" aria-label="Close">
                          <X className="h-4 w-4" />
                        </button>
                      </Dialog.Close>
                    </div>
                    <div className="p-4">
                      {kind === "task" && <TaskForm onDone={() => setOpen(false)} />}
                      {kind === "client" && <ClientForm onDone={() => setOpen(false)} />}
                      {kind === "project" && <ProjectForm onDone={() => setOpen(false)} />}
                      {kind === "note" && <NoteForm onDone={() => setOpen(false)} />}
                    </div>
                  </div>
                </motion.div>
              </Dialog.Content>
            </Dialog.Portal>
          )}
        </AnimatePresence>
      </Dialog.Root>
    </>
  );
}

function useSubmitLock() {
  const [saving, setSaving] = useState(false);
  const ref = useRef(false);
  return {
    saving,
    guard(fn: () => Promise<void>) {
      if (ref.current) return;
      ref.current = true; setSaving(true);
      fn().finally(() => setTimeout(() => { ref.current = false; setSaving(false); }, 400));
    },
  };
}

function TaskForm({ onDone }: { onDone: () => void }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [status, setStatus] = useState("inbox");
  const [dueDate, setDueDate] = useState<string>("");
  const [clients, setClients] = useState<{ id: string; name: string; color: string }[]>([]);
  const [projects, setProjects] = useState<{ id: string; name: string; color: string; clientId: string | null }[]>([]);
  const [clientId, setClientId] = useState<string>("");
  const [projectId, setProjectId] = useState<string>("");
  const [emoji, setEmoji] = useState("");
  const [estimatedMin, setEstimatedMin] = useState<string>("");
  const { saving, guard } = useSubmitLock();

  useEffect(() => {
    Promise.all([
      fetch("/api/clients").then(r => r.json()),
      fetch("/api/projects").then(r => r.json()),
    ]).then(([c, p]) => {
      setClients(c.clients);
      setProjects(p.projects);
    });
  }, []);

  const projectsFor = useMemo(() =>
    clientId ? projects.filter(p => p.clientId === clientId) : projects, [projects, clientId]);

  const submit = () => {
    if (!title.trim()) return;
    guard(async () => {
      const res = await fetch("/api/tasks", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({
          title, description, priority, status,
          dueDate: dueDate || null,
          clientId: clientId || null, projectId: projectId || null,
          emoji: emoji || null,
          estimatedMin: estimatedMin ? parseInt(estimatedMin) : null,
        }),
      });
      if (res.ok) { toast.success("Task added"); onDone(); router.refresh(); }
      else toast.error("Could not create task");
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-2">
        <input value={emoji} onChange={e => setEmoji(e.target.value)} placeholder="✨" maxLength={2}
          className="h-11 w-11 shrink-0 rounded-xl border border-white/[0.06] bg-white/[0.02] text-center text-lg outline-none focus:border-brand-500/60" />
        <Input autoFocus placeholder="What needs to happen?"
          value={title} onChange={e => setTitle(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); } }}
          className="text-[15px] font-medium"
        />
      </div>
      <Textarea placeholder="Notes (optional)…" rows={2} value={description} onChange={e => setDescription(e.target.value)} />
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        <Select icon={<Flag className="h-3.5 w-3.5" />} label="Priority" value={priority} onChange={setPriority}
          options={[{v:"critical",l:"Critical"},{v:"high",l:"High"},{v:"medium",l:"Medium"},{v:"low",l:"Low"}]} />
        <Select icon={<Tag className="h-3.5 w-3.5" />} label="Status" value={status} onChange={setStatus}
          options={[
            {v:"inbox",l:"Inbox"},{v:"planned",l:"Planned"},{v:"today",l:"Today"},
            {v:"tomorrow",l:"Tomorrow"},{v:"in_progress",l:"In progress"},
            {v:"waiting",l:"Waiting"},{v:"blocked",l:"Blocked"},
          ]} />
        <label className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 text-xs text-white/50">
          <Calendar className="h-3.5 w-3.5" />
          <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}
            className="w-full bg-transparent py-2 text-sm text-white outline-none" />
        </label>
        <label className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 text-xs text-white/50">
          Est
          <input type="number" min={5} step={5} placeholder="60" value={estimatedMin} onChange={e => setEstimatedMin(e.target.value)}
            className="w-full bg-transparent py-2 text-sm text-white outline-none" />
          <span>min</span>
        </label>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Select icon={<User className="h-3.5 w-3.5" />} label="Client" value={clientId} onChange={(v) => { setClientId(v); setProjectId(""); }}
          options={[{v:"",l:"— none"}, ...clients.map(c => ({ v: c.id, l: c.name }))]} />
        <Select icon={<Folder className="h-3.5 w-3.5" />} label="Project" value={projectId} onChange={setProjectId}
          options={[{v:"",l:"— none"}, ...projectsFor.map(p => ({ v: p.id, l: p.name }))]} />
      </div>

      <div className="mt-2 flex items-center justify-between gap-2">
        <div className="hidden text-[11px] text-white/40 sm:block">Press <kbd className="rounded bg-white/[0.06] px-1 py-0.5">Enter</kbd> to save</div>
        <div className="flex flex-1 justify-end gap-2 sm:flex-none">
          <Button variant="ghost" size="sm" onClick={onDone}>Cancel</Button>
          <Button variant="primary" onClick={submit} disabled={saving || !title.trim()} aria-busy={saving}>{saving ? "Adding…" : "Add task"}</Button>
        </div>
      </div>
    </div>
  );
}

function ClientForm({ onDone }: { onDone: () => void }) {
  const router = useRouter();
  const [name, setName] = useState(""); const [company, setCompany] = useState("");
  const [email, setEmail] = useState(""); const [color, setColor] = useState("#4F7CFF");
  const { saving, guard } = useSubmitLock();
  const submit = () => {
    if (!name.trim()) return;
    guard(async () => {
      const res = await fetch("/api/clients", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, company, email, color }),
      });
      if (res.ok) { toast.success("Client added"); onDone(); router.refresh(); }
    });
  };
  return (
    <div className="space-y-3">
      <Input autoFocus placeholder="Client name" value={name} onChange={e => setName(e.target.value)} />
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <Input placeholder="Company" value={company} onChange={e => setCompany(e.target.value)} />
        <Input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
      </div>
      <div className="flex items-center gap-2">
        <div className="text-xs text-white/50">Color</div>
        {["#4F7CFF","#A78BFA","#34D399","#FBBF24","#F87171","#F472B6"].map(c => (
          <button key={c} type="button" onClick={() => setColor(c)} aria-label={c}
            className="h-6 w-6 rounded-full transition"
            style={{ background: c, boxShadow: color === c ? `0 0 0 2px #0A0B0F, 0 0 0 4px ${c}` : undefined }} />
        ))}
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={onDone}>Cancel</Button>
        <Button variant="primary" onClick={submit} disabled={saving || !name.trim()} aria-busy={saving}>{saving ? "Adding…" : "Add client"}</Button>
      </div>
    </div>
  );
}

function ProjectForm({ onDone }: { onDone: () => void }) {
  const router = useRouter();
  const [name, setName] = useState(""); const [description, setDescription] = useState("");
  const [clients, setClients] = useState<{ id: string; name: string; color: string }[]>([]);
  const [clientId, setClientId] = useState<string>("");
  const [deadline, setDeadline] = useState<string>("");
  const { saving, guard } = useSubmitLock();
  useEffect(() => { fetch("/api/clients").then(r => r.json()).then(d => setClients(d.clients)); }, []);
  const submit = () => {
    if (!name.trim()) return;
    guard(async () => {
      const res = await fetch("/api/projects", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, description, clientId: clientId || null, deadline: deadline || null }),
      });
      if (res.ok) { toast.success("Project created"); onDone(); router.refresh(); }
    });
  };
  return (
    <div className="space-y-3">
      <Input autoFocus placeholder="Project name" value={name} onChange={e => setName(e.target.value)} />
      <Textarea rows={2} placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} />
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <Select label="Client" value={clientId} onChange={setClientId}
          options={[{v:"",l:"— none"}, ...clients.map(c => ({ v: c.id, l: c.name }))]} />
        <label className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 text-xs text-white/50">
          Deadline
          <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)}
            className="w-full bg-transparent py-2 text-sm text-white outline-none" />
        </label>
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={onDone}>Cancel</Button>
        <Button variant="primary" onClick={submit} disabled={saving || !name.trim()} aria-busy={saving}>{saving ? "Creating…" : "Create project"}</Button>
      </div>
    </div>
  );
}

function NoteForm({ onDone }: { onDone: () => void }) {
  const router = useRouter();
  const [title, setTitle] = useState(""); const [body, setBody] = useState("");
  const { saving, guard } = useSubmitLock();
  const canSave = title.trim().length > 0 || body.trim().length > 0;
  const submit = () => {
    if (!canSave) return;
    guard(async () => {
      const res = await fetch("/api/notes", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ title: title || "Untitled", body }),
      });
      if (res.ok) { toast.success("Note saved"); onDone(); router.refresh(); }
    });
  };
  return (
    <div className="space-y-3">
      <Input autoFocus placeholder="Note title" value={title} onChange={e => setTitle(e.target.value)} />
      <Textarea rows={6} placeholder="Write something…" value={body} onChange={e => setBody(e.target.value)} />
      <div className="flex justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={onDone}>Cancel</Button>
        <Button variant="primary" onClick={submit} disabled={saving || !canSave} aria-busy={saving}>{saving ? "Saving…" : "Save note"}</Button>
      </div>
    </div>
  );
}

function Select({
  label, value, onChange, options, icon,
}: {
  label: string; value: string; onChange: (v: string) => void;
  options: { v: string; l: string }[]; icon?: React.ReactNode;
}) {
  return (
    <label className="relative flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 text-xs text-white/50">
      {icon} <span className="hidden md:inline">{label}</span>
      <select value={value} onChange={e => onChange(e.target.value)}
        className="w-full appearance-none bg-transparent py-2 text-sm text-white outline-none">
        {options.map(o => <option key={o.v} value={o.v} className="bg-[#14161d]">{o.l}</option>)}
      </select>
      <ChevronDown className="pointer-events-none h-3.5 w-3.5" />
    </label>
  );
}
