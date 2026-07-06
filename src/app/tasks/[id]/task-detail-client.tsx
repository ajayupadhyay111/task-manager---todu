"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type ChecklistItem = { id: string; text: string; done: boolean };

export function TaskDetailClient({
  id, status, checklist: initialChecklist,
}: { id: string; status: string; checklist: ChecklistItem[] }) {
  const router = useRouter();
  const [checklist, setChecklist] = useState(initialChecklist);
  const [currentStatus, setCurrentStatus] = useState(status);
  const [busy, setBusy] = useState(false);
  const done = currentStatus === "completed";

  const toggleComplete = async () => {
    if (busy) return;
    setBusy(true);
    const next = done ? "planned" : "completed";
    setCurrentStatus(next);
    try {
      await fetch(`/api/tasks/${id}`, {
        method: "PATCH", headers: { "content-type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      toast.success(next === "completed" ? "Task completed 🎉" : "Task reopened");
      router.refresh();
    } finally {
      setBusy(false);
    }
  };

  const toggleItem = async (item: ChecklistItem) => {
    setChecklist(p => p.map(x => x.id === item.id ? { ...x, done: !x.done } : x));
    await fetch("/api/checklist", {
      method: "PATCH", headers: { "content-type": "application/json" },
      body: JSON.stringify({ id: item.id, done: !item.done }),
    });
  };

  const removeTask = async () => {
    if (busy) return;
    setBusy(true);
    await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    toast.success("Task deleted");
    router.push("/");
    router.refresh();
  };

  return (
    <>
      <div className="flex gap-2">
        <Button variant="primary" size="lg" className="flex-1" onClick={toggleComplete} disabled={busy} aria-busy={busy}>
          <Check className="h-4 w-4" />
          {done ? "Mark as not done" : "Mark complete"}
        </Button>
        <Button variant="danger" size="lg" onClick={removeTask} disabled={busy} aria-label="Delete task">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {checklist.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Checklist</CardTitle>
            <span className="text-[11px] text-white/40">{checklist.filter(c => c.done).length}/{checklist.length}</span>
          </CardHeader>
          <CardBody className="space-y-1.5">
            {checklist.map(item => (
              <button key={item.id} onClick={() => toggleItem(item)}
                className="flex w-full items-center gap-3 rounded-xl border border-white/[0.05] bg-white/[0.02] px-3 py-2 text-left transition hover:bg-white/[0.04]">
                <span className={cn(
                  "grid h-5 w-5 shrink-0 place-items-center rounded-md border transition",
                  item.done ? "border-emerald-400/60 bg-emerald-400/25" : "border-white/[0.14]",
                )}>
                  {item.done && <Check className="h-3 w-3 text-emerald-200" />}
                </span>
                <span className={cn("text-sm", item.done && "text-white/40 line-through")}>{item.text}</span>
              </button>
            ))}
          </CardBody>
        </Card>
      )}
    </>
  );
}
