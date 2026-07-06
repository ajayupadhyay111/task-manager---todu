import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge, PriorityDot } from "@/components/ui/badge";
import { statusMeta } from "@/lib/utils";
import { TaskDetailClient } from "./task-detail-client";
import { Clock, User, Folder } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function TaskDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const t = await db.task.findUnique({
    where: { id },
    include: {
      client: { select: { id: true, name: true, color: true } },
      project: { select: { id: true, name: true, color: true } },
      checklist: { orderBy: { order: "asc" } },
      subtasks: { orderBy: { createdAt: "asc" } },
      comments: { orderBy: { createdAt: "asc" } },
      attachments: true,
    },
  });
  if (!t) notFound();

  type Sub = (typeof t.subtasks)[number];
  const sm = statusMeta(t.status);

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="relative overflow-hidden rounded-3xl border border-white/[0.06] p-5 sm:p-6">
        <div className="pointer-events-none absolute inset-0 opacity-30">
          <div className="absolute -left-16 -top-16 h-48 w-48 rounded-full bg-brand-500/30 blur-3xl" />
        </div>
        <div className="relative">
          <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-widest text-white/40">
            <span>Task</span>
            <span className={sm.tint}>· {sm.label}</span>
          </div>
          <h1 className="mt-1 flex items-start gap-2 text-xl font-semibold tracking-tight text-white sm:text-2xl">
            {t.emoji && <span>{t.emoji}</span>}
            <span className="min-w-0 break-words">{t.title}</span>
          </h1>
          {t.description && <p className="mt-2 text-sm text-white/60">{t.description}</p>}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Badge><PriorityDot priority={t.priority} /> {t.priority}</Badge>
            {t.dueDate && (
              <Badge><Clock className="h-3 w-3" /> {new Date(t.dueDate).toLocaleDateString()}{t.dueTime ? ` · ${t.dueTime}` : ""}</Badge>
            )}
            {t.estimatedMin && <Badge>{t.estimatedMin}m est</Badge>}
            {t.client && (
              <Link href={`/clients/${t.client.id}`}><Badge className="hover:bg-white/[0.08]"><User className="h-3 w-3" /> {t.client.name}</Badge></Link>
            )}
            {t.project && (
              <Link href={`/projects/${t.project.id}`}><Badge className="hover:bg-white/[0.08]"><Folder className="h-3 w-3" /> {t.project.name}</Badge></Link>
            )}
          </div>
        </div>
      </div>

      <TaskDetailClient
        id={t.id}
        status={t.status}
        checklist={t.checklist.map((c) => ({ id: c.id, text: c.text, done: c.done }))}
      />

      {t.subtasks.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Subtasks</CardTitle><span className="text-[11px] text-white/40">{t.subtasks.length}</span></CardHeader>
          <CardBody className="space-y-1.5">
            {t.subtasks.map((s: Sub) => (
              <Link key={s.id} href={`/tasks/${s.id}`}
                className="flex items-center gap-2 rounded-xl border border-white/[0.05] bg-white/[0.02] px-3 py-2 text-sm hover:bg-white/[0.04]">
                <PriorityDot priority={s.priority} />
                <span className={s.status === "completed" ? "text-white/40 line-through" : ""}>{s.title}</span>
              </Link>
            ))}
          </CardBody>
        </Card>
      )}

      {t.comments.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Comments</CardTitle></CardHeader>
          <CardBody className="space-y-2">
            {t.comments.map((c) => (
              <div key={c.id} className="rounded-xl border border-white/[0.05] bg-white/[0.02] px-3 py-2 text-sm text-white/80">
                {c.body}
                <div className="mt-1 text-[10px] text-white/30">{new Date(c.createdAt).toLocaleString()}</div>
              </div>
            ))}
          </CardBody>
        </Card>
      )}
    </div>
  );
}
