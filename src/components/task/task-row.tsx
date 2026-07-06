"use client";
import { useState } from "react";
import { Check, MessageSquare, ListChecks, Clock, Pin } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { PriorityDot } from "@/components/ui/badge";
import { cn, fmtRelative } from "@/lib/utils";

export type TaskRowData = {
  id: string;
  title: string;
  status: string;
  priority: string;
  emoji?: string | null;
  dueDate?: string | Date | null;
  dueTime?: string | null;
  estimatedMin?: number | null;
  pinned?: boolean;
  client?: { id: string; name: string; color: string } | null;
  project?: { id: string; name: string; color: string } | null;
  _count?: { subtasks: number; checklist: number; comments: number };
};

export function TaskRow({
  task, onChange, onOpen, compact,
}: {
  task: TaskRowData;
  onChange?: (id: string, patch: Partial<TaskRowData & { status: string }>) => void;
  onOpen?: (id: string) => void;
  compact?: boolean;
}) {
  const [checking, setChecking] = useState(false);
  const done = task.status === "completed";

  const toggle = async () => {
    setChecking(true);
    const next = done ? "planned" : "completed";
    onChange?.(task.id, { status: next });
    try {
      await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
    } finally {
      setChecking(false);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: done ? 0.55 : 1, y: 0 }}
      exit={{ opacity: 0, x: -12 }}
      transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }}
      className={cn(
        "group relative flex items-center gap-3 rounded-2xl border border-white/[0.04] bg-white/[0.02] px-3 py-2.5 transition-colors",
        "hover:bg-white/[0.04]",
        compact && "py-2",
      )}
    >
      <button
        onClick={toggle}
        aria-label="Toggle done"
        className={cn(
          "relative grid h-5 w-5 shrink-0 place-items-center rounded-md border transition",
          done
            ? "border-emerald-400/60 bg-gradient-to-br from-emerald-400/40 to-emerald-500/20"
            : "border-white/[0.14] hover:border-brand-400/70 hover:bg-brand-500/10",
        )}
      >
        <AnimatePresence>
          {done && (
            <motion.span
              initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0 }} transition={{ type: "spring", stiffness: 500, damping: 22 }}
            >
              <Check className="h-3 w-3 text-emerald-200" />
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      <button onClick={() => onOpen?.(task.id)} className="flex min-w-0 flex-1 flex-col items-start text-left">
        <div className="flex min-w-0 items-center gap-2">
          <PriorityDot priority={task.priority} />
          {task.emoji && <span className="text-sm leading-none">{task.emoji}</span>}
          <span className={cn("truncate text-[14px] font-medium text-white", done && "line-through text-white/50")}>
            {task.title}
          </span>
        </div>
        {(task.client || task.project || task.dueDate || checking) && (
          <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] text-white/45">
            {task.project && (
              <span className="flex items-center gap-1 rounded-full bg-white/[0.03] px-2 py-0.5">
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: task.project.color }} />
                {task.project.name}
              </span>
            )}
            {task.client && (
              <span className="rounded-full bg-white/[0.03] px-2 py-0.5">{task.client.name}</span>
            )}
            {task.dueDate && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {fmtRelative(task.dueDate)}{task.dueTime ? ` · ${task.dueTime}` : ""}
              </span>
            )}
            {task.estimatedMin && (
              <span className="rounded-full bg-white/[0.03] px-2 py-0.5">{task.estimatedMin}m</span>
            )}
          </div>
        )}
      </button>

      <div className="hidden items-center gap-1 text-white/40 sm:flex">
        {task.pinned && <Pin className="h-3.5 w-3.5 text-brand-400" />}
        {task._count?.subtasks ? (
          <span className="flex items-center gap-0.5 text-[11px]">
            <ListChecks className="h-3.5 w-3.5" />{task._count.subtasks}
          </span>
        ) : null}
        {task._count?.comments ? (
          <span className="flex items-center gap-0.5 text-[11px]">
            <MessageSquare className="h-3.5 w-3.5" />{task._count.comments}
          </span>
        ) : null}
      </div>
    </motion.div>
  );
}
