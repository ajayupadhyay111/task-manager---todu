"use client";
import * as Dialog from "@radix-ui/react-dialog";
import { Command } from "cmdk";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useUIStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import {
  CalendarDays, FolderKanban, Inbox, LayoutDashboard, NotebookPen,
  Search, Sun, Users, Plus, Archive, Activity as ActIcon, Settings,
} from "lucide-react";

type SearchResults = {
  tasks: { id: string; title: string }[];
  clients: { id: string; name: string }[];
  projects: { id: string; name: string }[];
  notes: { id: string; title: string }[];
};

export function CommandPaletteProvider({ children }: { children: React.ReactNode }) {
  const open = useUIStore((s) => s.paletteOpen);
  const setOpen = useUIStore((s) => s.setPaletteOpen);
  const setQuickAdd = useUIStore((s) => s.setQuickAdd);
  const router = useRouter();
  const [q, setQ] = useState("");
  const [results, setResults] = useState<SearchResults>({ tasks: [], clients: [], projects: [], notes: [] });

  useEffect(() => { if (!open) setQ(""); }, [open]);

  useEffect(() => {
    if (!q.trim()) { setResults({ tasks: [], clients: [], projects: [], notes: [] }); return; }
    const c = new AbortController();
    fetch(`/api/search?q=${encodeURIComponent(q)}`, { signal: c.signal })
      .then(r => r.json()).then(setResults).catch(() => {});
    return () => c.abort();
  }, [q]);

  const go = (href: string) => { setOpen(false); router.push(href); };

  return (
    <>
      {children}
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <AnimatePresence>
          {open && (
            <Dialog.Portal forceMount>
              <Dialog.Overlay asChild>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 bg-black/70" />
              </Dialog.Overlay>
              <Dialog.Content asChild>
                <motion.div
                  initial={{ opacity: 0, y: 12, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.98 }}
                  transition={{ duration: 0.16, ease: [0.2, 0.8, 0.2, 1] }}
                  className="fixed left-1/2 top-[10%] z-50 w-[92vw] max-w-[640px] -translate-x-1/2"
                >
                  <Command shouldFilter={!q} className="glass-strong card-shadow overflow-hidden rounded-2xl">
                    <Dialog.Title className="sr-only">Search</Dialog.Title>
                    <div className="flex items-center gap-2 border-b border-white/[0.05] px-4">
                      <Search className="h-4 w-4 text-white/50" />
                      <Command.Input
                        value={q} onValueChange={setQ}
                        placeholder="Search or run a command…"
                        className="w-full bg-transparent py-4 text-[15px] text-white outline-none placeholder:text-white/30"
                      />
                      <kbd className="hidden rounded border border-white/10 bg-white/[0.03] px-1.5 py-0.5 text-[11px] text-white/50 sm:inline">Esc</kbd>
                    </div>

                    <Command.List className="max-h-[60vh] overflow-y-auto p-2">
                      <Command.Empty className="px-3 py-8 text-center text-sm text-white/40">
                        {q ? "No results" : "Type to search…"}
                      </Command.Empty>

                      {!q && (
                        <>
                          <Group heading="Navigate">
                            <Item onSelect={() => go("/")} icon={<LayoutDashboard className="h-4 w-4" />} label="Dashboard" shortcut="D" />
                            <Item onSelect={() => go("/today")} icon={<Sun className="h-4 w-4" />} label="Today" />
                            <Item onSelect={() => go("/inbox")} icon={<Inbox className="h-4 w-4" />} label="Inbox" shortcut="I" />
                            <Item onSelect={() => go("/calendar")} icon={<CalendarDays className="h-4 w-4" />} label="Calendar" shortcut="G" />
                            <Item onSelect={() => go("/clients")} icon={<Users className="h-4 w-4" />} label="Clients" />
                            <Item onSelect={() => go("/projects")} icon={<FolderKanban className="h-4 w-4" />} label="Projects" />
                            <Item onSelect={() => go("/notes")} icon={<NotebookPen className="h-4 w-4" />} label="Notes" />
                            <Item onSelect={() => go("/activity")} icon={<ActIcon className="h-4 w-4" />} label="Activity" />
                            <Item onSelect={() => go("/archive")} icon={<Archive className="h-4 w-4" />} label="Archive" />
                            <Item onSelect={() => go("/settings")} icon={<Settings className="h-4 w-4" />} label="Settings" />
                          </Group>
                          <Group heading="Create">
                            <Item onSelect={() => { setOpen(false); setQuickAdd(true, "task"); }} icon={<Plus className="h-4 w-4" />} label="New task" shortcut="T" />
                            <Item onSelect={() => { setOpen(false); setQuickAdd(true, "client"); }} icon={<Plus className="h-4 w-4" />} label="New client" shortcut="C" />
                            <Item onSelect={() => { setOpen(false); setQuickAdd(true, "project"); }} icon={<Plus className="h-4 w-4" />} label="New project" shortcut="P" />
                            <Item onSelect={() => { setOpen(false); setQuickAdd(true, "note"); }} icon={<Plus className="h-4 w-4" />} label="New note" shortcut="N" />
                          </Group>
                        </>
                      )}

                      {q && (
                        <>
                          {results.tasks.length > 0 && (
                            <Group heading="Tasks">
                              {results.tasks.map(t => (
                                <Item key={t.id} onSelect={() => go(`/tasks/${t.id}`)} icon={<div className="h-2 w-2 rounded-sm bg-brand-500" />} label={t.title} />
                              ))}
                            </Group>
                          )}
                          {results.clients.length > 0 && (
                            <Group heading="Clients">
                              {results.clients.map(c => (
                                <Item key={c.id} onSelect={() => go(`/clients/${c.id}`)} icon={<Users className="h-4 w-4" />} label={c.name} />
                              ))}
                            </Group>
                          )}
                          {results.projects.length > 0 && (
                            <Group heading="Projects">
                              {results.projects.map(p => (
                                <Item key={p.id} onSelect={() => go(`/projects/${p.id}`)} icon={<FolderKanban className="h-4 w-4" />} label={p.name} />
                              ))}
                            </Group>
                          )}
                          {results.notes.length > 0 && (
                            <Group heading="Notes">
                              {results.notes.map(n => (
                                <Item key={n.id} onSelect={() => go(`/notes?id=${n.id}`)} icon={<NotebookPen className="h-4 w-4" />} label={n.title} />
                              ))}
                            </Group>
                          )}
                        </>
                      )}
                    </Command.List>
                  </Command>
                </motion.div>
              </Dialog.Content>
            </Dialog.Portal>
          )}
        </AnimatePresence>
      </Dialog.Root>
    </>
  );
}

function Group({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <Command.Group heading={heading} className="mb-1">
      {children}
    </Command.Group>
  );
}
function Item({ icon, label, shortcut, onSelect }: { icon?: React.ReactNode; label: string; shortcut?: string; onSelect?: () => void }) {
  return (
    <Command.Item
      onSelect={onSelect}
      className="mx-1 flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-sm text-white/80 aria-selected:bg-white/[0.06] aria-selected:text-white"
    >
      <span className="text-white/60">{icon}</span>
      <span className="flex-1 truncate">{label}</span>
      {shortcut && <kbd className="rounded border border-white/10 bg-white/[0.03] px-1.5 py-0.5 text-[10px] text-white/40">{shortcut}</kbd>}
    </Command.Item>
  );
}
