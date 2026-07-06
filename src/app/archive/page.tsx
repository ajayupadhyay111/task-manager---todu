import { db } from "@/lib/db";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty";
import { Archive as ArchiveIcon } from "lucide-react";
import { TaskRow } from "@/components/task/task-row";

export const dynamic = "force-dynamic";

export default async function ArchivePage() {
  const archivedTasks = await db.task.findMany({ where: { status: "archived" }, include: { client: { select: { id: true, name: true, color: true } }, project: { select: { id: true, name: true, color: true } } }, orderBy: { updatedAt: "desc" }, take: 100 });
  const completedTasks = await db.task.findMany({ where: { status: "completed" }, include: { client: { select: { id: true, name: true, color: true } }, project: { select: { id: true, name: true, color: true } } }, orderBy: { completedAt: "desc" }, take: 100 });
  type Row = (typeof completedTasks)[number];
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <div className="text-[11px] uppercase tracking-widest text-white/40">Vault</div>
        <h1 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">Archive</h1>
        <p className="mt-1 text-sm text-white/50">Everything finished, never lost</p>
      </header>

      {archivedTasks.length === 0 && completedTasks.length === 0 && (
        <EmptyState icon={<ArchiveIcon className="h-6 w-6" />} title="Nothing archived yet" />
      )}

      {completedTasks.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Completed</CardTitle><span className="text-[11px] text-white/40">{completedTasks.length}</span></CardHeader>
          <CardBody className="space-y-1.5">
            {completedTasks.map((t: Row) => <TaskRow key={t.id} task={t} compact />)}
          </CardBody>
        </Card>
      )}
      {archivedTasks.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Archived</CardTitle><span className="text-[11px] text-white/40">{archivedTasks.length}</span></CardHeader>
          <CardBody className="space-y-1.5">
            {archivedTasks.map((t: Row) => <TaskRow key={t.id} task={t} compact />)}
          </CardBody>
        </Card>
      )}
    </div>
  );
}
