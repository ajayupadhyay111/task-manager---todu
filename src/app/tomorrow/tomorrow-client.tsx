"use client";
import { useState } from "react";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { Moon, Sunrise, Sun, Sunset, Cloud, Sparkles, ArrowRight } from "lucide-react";
import { TaskRow, type TaskRowData } from "@/components/task/task-row";
import { Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type Section = { key: "top" | "morning" | "afternoon" | "evening"; label: string; icon: React.ReactNode; hint: string; };

const SECTIONS: Section[] = [
  { key: "top", label: "Top 3 priorities", icon: <Sparkles className="h-4 w-4 text-brand-400" />, hint: "The must-do trio" },
  { key: "morning", label: "Morning", icon: <Sunrise className="h-4 w-4 text-amber-300" />, hint: "Deep work" },
  { key: "afternoon", label: "Afternoon", icon: <Sun className="h-4 w-4 text-orange-300" />, hint: "Meetings & momentum" },
  { key: "evening", label: "Evening", icon: <Sunset className="h-4 w-4 text-fuchsia-300" />, hint: "Wrap up & review" },
];

export function TomorrowClient({
  candidates, carryForward, quote, dateLabel,
}: { candidates: TaskRowData[]; carryForward: TaskRowData[]; quote: { q: string; by: string }; dateLabel: string }) {
  const router = useRouter();
  const [buckets, setBuckets] = useState<Record<Section["key"], TaskRowData[]>>({ top: [], morning: [], afternoon: [], evening: [] });
  const [pool, setPool] = useState<TaskRowData[]>(candidates);
  const [notes, setNotes] = useState("");

  const putInBucket = (task: TaskRowData, key: Section["key"]) => {
    setPool(p => p.filter(x => x.id !== task.id));
    setBuckets(b => ({ ...b, [key]: [...b[key], task] }));
  };
  const removeFromBucket = (task: TaskRowData, key: Section["key"]) => {
    setBuckets(b => ({ ...b, [key]: b[key].filter(x => x.id !== task.id) }));
    setPool(p => [task, ...p]);
  };

  const finalize = async () => {
    const all = [...buckets.top, ...buckets.morning, ...buckets.afternoon, ...buckets.evening];
    await Promise.all(all.map(t =>
      fetch(`/api/tasks/${t.id}`, {
        method: "PATCH", headers: { "content-type": "application/json" },
        body: JSON.stringify({ status: "tomorrow" }),
      })
    ));
    if (notes.trim()) {
      await fetch("/api/notes", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ title: `Notes for ${dateLabel}`, body: notes, kind: "journal" }),
      });
    }
    toast.success(`Plan set for ${dateLabel}`);
    router.push("/today");
  };

  const workloadMin = [...buckets.top, ...buckets.morning, ...buckets.afternoon, ...buckets.evening]
    .reduce((s, t) => s + (t.estimatedMin ?? 45), 0);

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <div className="relative overflow-hidden rounded-3xl border border-white/[0.06] p-6 md:p-8">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-24 top-8 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl" />
          <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-fuchsia-500/15 blur-3xl" />
          <div className="grid-bg absolute inset-0 opacity-15" />
        </div>
        <div className="relative flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <div className="text-[11px] uppercase tracking-widest text-white/40">Tonight planning</div>
            <h1 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">Plan for {dateLabel}</h1>
            <p className="mt-2 max-w-lg text-sm text-white/60">
              &ldquo;{quote.q}&rdquo; — <span className="text-white/40">{quote.by}</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="glass rounded-2xl px-4 py-3 text-center">
              <div className="text-[10px] uppercase tracking-widest text-white/40">Workload</div>
              <div className="mt-0.5 text-lg font-semibold">{Math.round(workloadMin / 60 * 10) / 10}h</div>
            </div>
            <div className="glass rounded-2xl px-4 py-3 text-center">
              <div className="flex items-center gap-1 text-[10px] uppercase tracking-widest text-white/40"><Cloud className="h-3 w-3" /> Weather</div>
              <div className="mt-0.5 text-lg font-semibold">21°</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="grid gap-4 md:grid-cols-2">
          {SECTIONS.map(s => (
            <Card key={s.key} className="min-h-[220px]">
              <CardHeader>
                <div>
                  <CardTitle className="flex items-center gap-2">{s.icon} {s.label}</CardTitle>
                  <p className="mt-0.5 text-xs text-white/40">{s.hint}</p>
                </div>
                <span className="text-[11px] text-white/40">{buckets[s.key].length}</span>
              </CardHeader>
              <CardBody className="space-y-1.5">
                {buckets[s.key].length === 0 ? (
                  <div className="rounded-xl border border-dashed border-white/[0.06] py-6 text-center text-[12px] text-white/40">Drag or add tasks here</div>
                ) : buckets[s.key].map(t => (
                  <motion.button key={t.id} onClick={() => removeFromBucket(t, s.key)} layout
                    className="flex w-full items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-2 text-left text-sm hover:bg-white/[0.05]">
                    <span className="line-clamp-1 flex-1">{t.title}</span>
                    <span className="text-[10px] text-white/40">remove</span>
                  </motion.button>
                ))}
              </CardBody>
            </Card>
          ))}
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div>
                <CardTitle className="flex items-center gap-2"><Moon className="h-4 w-4 text-brand-400" /> Task pool</CardTitle>
                <p className="mt-0.5 text-xs text-white/40">Tap a bucket, then a task</p>
              </div>
            </CardHeader>
            <CardBody className="space-y-1.5">
              {carryForward.length > 0 && (
                <div className="mb-2 rounded-xl border border-amber-400/15 bg-amber-500/5 px-3 py-2 text-[12px] text-amber-200">
                  {carryForward.length} carry-forward from earlier · move them into a bucket
                </div>
              )}
              {[...carryForward, ...pool].map(t => (
                <details key={t.id} className="rounded-xl border border-white/[0.04] bg-white/[0.02] px-3 py-2">
                  <summary className="flex cursor-pointer items-center gap-2 text-sm text-white">
                    <span className="line-clamp-1 flex-1">{t.title}</span>
                    <ArrowRight className="h-3 w-3 text-white/40" />
                  </summary>
                  <div className="mt-2 grid grid-cols-2 gap-1.5">
                    {SECTIONS.map(s => (
                      <Button key={s.key} size="sm" variant="secondary" onClick={() => putInBucket(t, s.key)}>{s.label}</Button>
                    ))}
                  </div>
                </details>
              ))}
              {pool.length === 0 && carryForward.length === 0 && (
                <div className="py-4 text-center text-sm text-white/40">Nothing else to plan.</div>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader><CardTitle>Notes for tomorrow</CardTitle></CardHeader>
            <CardBody>
              <Textarea rows={4} placeholder="Anything you want to remember…" value={notes} onChange={e => setNotes(e.target.value)} />
            </CardBody>
          </Card>

          <Button variant="primary" size="lg" className="w-full" onClick={finalize}>Set tomorrow&apos;s plan</Button>
        </div>
      </div>
    </div>
  );
}
