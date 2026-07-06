import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { logActivity } from "@/lib/activity";

export async function GET(_: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const task = await db.task.findUnique({
    where: { id },
    include: {
      client: true, project: true,
      subtasks: true, checklist: { orderBy: { order: "asc" } },
      comments: { orderBy: { createdAt: "asc" } }, attachments: true,
    },
  });
  return NextResponse.json({ task });
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const body = await req.json();
  const current = await db.task.findUnique({ where: { id } });
  if (!current) return NextResponse.json({ error: "not found" }, { status: 404 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: any = { ...body };
  if (body.labels !== undefined) data.labels = JSON.stringify(body.labels);
  for (const k of ["dueDate", "scheduledFor", "reminder"]) if (body[k] !== undefined) data[k] = body[k] ? new Date(body[k]) : null;

  if (body.status === "completed" && current.status !== "completed") data.completedAt = new Date();
  if (body.status && body.status !== "completed") data.completedAt = null;

  const task = await db.task.update({ where: { id }, data });

  if (body.status === "completed" && current.status !== "completed") {
    await logActivity({ kind: "task.completed", entity: "task", entityId: id, title: task.title });
  } else {
    await logActivity({ kind: "task.updated", entity: "task", entityId: id, title: task.title });
  }
  return NextResponse.json({ task });
}

export async function DELETE(_: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  await db.task.delete({ where: { id } });
  await logActivity({ kind: "task.deleted", entity: "task", entityId: id, title: "Task deleted" });
  return NextResponse.json({ ok: true });
}
