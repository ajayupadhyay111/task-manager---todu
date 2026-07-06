import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { TaskRow } from "@/components/task/task-row";
import { fmtRelative, safeJson } from "@/lib/utils";
import { MilestoneList } from "./milestones";

export default async function ProjectDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = await db.project.findUnique({
    where: { id },
    include: {
      client: true,
      milestones: { orderBy: { order: "asc" } },
      tasks: { include: { client: { select: { id: true, name: true, color: true } }, project: { select: { id: true, name: true, color: true } } }, orderBy: { updatedAt: "desc" } },
      projectNotes: { orderBy: { updatedAt: "desc" }, take: 10 },
    },
  });
  if (!p) notFound();

  type TaskItem = (typeof p.tasks)[number];
  type NoteItem = (typeof p.projectNotes)[number];
  const links = safeJson<{ label: string; url: string }[]>(p.links, []);
  const openTasks = p.tasks.filter((t: TaskItem) => t.status !== "completed" && t.status !== "archived");
  const doneTasks = p.tasks.filter((t: TaskItem) => t.status === "completed");

  return (
    <div className="mx-auto max-w-[1300px] space-y-6">
      <div className="relative overflow-hidden rounded-3xl border border-white/[0.06] p-6 md:p-8">
        <div className="absolute inset-0 opacity-30" style={{ background: `radial-gradient(700px 500px at 10% 0%, ${p.color}66, transparent 60%)` }} />
        <div className="relative flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-white/40">
              <span>Project</span>
              {p.client && <><span>/</span><Link href={`/clients/${p.client.id}`} className="hover:text-white">{p.client.name}</Link></>}
            </div>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-white md:text-4xl">{p.name}</h1>
            {p.description && <p className="mt-2 max-w-2xl text-sm text-white/60">{p.description}</p>}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Badge>{p.status}</Badge>
              <Badge>{p.priority}</Badge>
              {p.deadline && <Badge>due {new Date(p.deadline).toLocaleDateString()}</Badge>}
            </div>
          </div>
          <div className="w-full max-w-xs">
            <div className="glass rounded-2xl p-4">
              <div className="mb-1.5 flex items-center justify-between text-[11px] uppercase tracking-widest text-white/40">
                <span>Progress</span><span>{p.progress}%</span>
              </div>
              <Progress value={p.progress} />
              <div className="mt-3 grid grid-cols-2 gap-2 text-center">
                <div><div className="text-[10px] uppercase tracking-widest text-white/40">Tasks</div><div className="font-semibold">{p.tasks.length}</div></div>
                <div><div className="text-[10px] uppercase tracking-widest text-white/40">Milestones</div><div className="font-semibold">{p.milestones.length}</div></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader><CardTitle>Open tasks</CardTitle><span className="text-[11px] text-white/40">{openTasks.length}</span></CardHeader>
            <CardBody className="space-y-1.5">
              {openTasks.length === 0 && <div className="py-6 text-center text-sm text-white/40">Nothing open.</div>}
              {openTasks.map((t: TaskItem) => <TaskRow key={t.id} task={t} />)}
            </CardBody>
          </Card>

          {doneTasks.length > 0 && (
            <Card>
              <CardHeader><CardTitle>Completed</CardTitle><span className="text-[11px] text-white/40">{doneTasks.length}</span></CardHeader>
              <CardBody className="space-y-1.5">
                {doneTasks.slice(0, 20).map((t: TaskItem) => <TaskRow key={t.id} task={t} compact />)}
              </CardBody>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Milestones</CardTitle></CardHeader>
            <CardBody>
              <MilestoneList projectId={p.id} initial={p.milestones} />
            </CardBody>
          </Card>

          {links.length > 0 && (
            <Card>
              <CardHeader><CardTitle>Links</CardTitle></CardHeader>
              <CardBody className="space-y-2">
                {links.map((l, i) => (
                  <a key={i} href={l.url} target="_blank" rel="noreferrer"
                    className="block rounded-xl border border-white/[0.05] bg-white/[0.02] px-3 py-2 text-sm text-white/80 hover:bg-white/[0.05]">
                    {l.label} <span className="ml-1 text-[11px] text-white/40 truncate">{l.url}</span>
                  </a>
                ))}
              </CardBody>
            </Card>
          )}

          {p.notes && (
            <Card>
              <CardHeader><CardTitle>Notes</CardTitle></CardHeader>
              <CardBody><p className="whitespace-pre-wrap text-sm text-white/70">{p.notes}</p></CardBody>
            </Card>
          )}

          {p.projectNotes.length > 0 && (
            <Card>
              <CardHeader><CardTitle>Related notes</CardTitle></CardHeader>
              <CardBody className="space-y-2">
                {p.projectNotes.map((n: NoteItem) => (
                  <Link key={n.id} href={`/notes?id=${n.id}`} className="block rounded-xl border border-white/[0.05] bg-white/[0.02] px-3 py-2 text-sm">
                    <div className="truncate font-medium">{n.title}</div>
                    <div className="text-[11px] text-white/40">{fmtRelative(n.updatedAt)}</div>
                  </Link>
                ))}
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
