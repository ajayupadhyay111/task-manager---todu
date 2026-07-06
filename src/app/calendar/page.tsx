import { db } from "@/lib/db";
import { CalendarClient } from "./calendar-client";

export const dynamic = "force-dynamic";

export default async function CalendarPage() {
  const tasks = await db.task.findMany({
    where: { status: { notIn: ["archived"] }, dueDate: { not: null } },
    include: {
      client: { select: { id: true, name: true, color: true } },
      project: { select: { id: true, name: true, color: true } },
    },
  });
  return <CalendarClient initial={tasks.map(t => ({
    id: t.id, title: t.title, status: t.status, priority: t.priority,
    dueDate: t.dueDate!, dueTime: t.dueTime, color: t.color,
    clientName: t.client?.name, projectName: t.project?.name,
    projectColor: t.project?.color, clientColor: t.client?.color,
  }))} />;
}
