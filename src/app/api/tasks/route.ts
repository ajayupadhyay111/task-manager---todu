import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { logActivity } from "@/lib/activity";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const clientId = searchParams.get("clientId");
  const projectId = searchParams.get("projectId");
  const scope = searchParams.get("scope"); // today|tomorrow|upcoming|overdue|inbox

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfToday = new Date(startOfToday); endOfToday.setDate(endOfToday.getDate() + 1);
  const endOfTomorrow = new Date(endOfToday); endOfTomorrow.setDate(endOfTomorrow.getDate() + 1);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};
  if (status) where.status = status;
  if (clientId) where.clientId = clientId;
  if (projectId) where.projectId = projectId;

  if (scope === "today") {
    where.OR = [
      { status: "today" },
      { status: "in_progress" },
      { scheduledFor: { gte: startOfToday, lt: endOfToday } },
      { dueDate: { gte: startOfToday, lt: endOfToday } },
    ];
    where.status = { notIn: ["completed", "archived"] };
  } else if (scope === "tomorrow") {
    where.OR = [
      { status: "tomorrow" },
      { scheduledFor: { gte: endOfToday, lt: endOfTomorrow } },
      { dueDate: { gte: endOfToday, lt: endOfTomorrow } },
    ];
    where.status = { notIn: ["completed", "archived"] };
  } else if (scope === "overdue") {
    where.dueDate = { lt: startOfToday };
    where.status = { notIn: ["completed", "archived"] };
  } else if (scope === "upcoming") {
    where.dueDate = { gte: endOfTomorrow };
    where.status = { notIn: ["completed", "archived"] };
  } else if (scope === "inbox") {
    where.status = "inbox";
  }

  const tasks = await db.task.findMany({
    where,
    include: {
      client: { select: { id: true, name: true, color: true } },
      project: { select: { id: true, name: true, color: true } },
      _count: { select: { subtasks: true, checklist: true, comments: true } },
    },
    orderBy: [{ pinned: "desc" }, { order: "asc" }, { createdAt: "desc" }],
    take: 500,
  });
  return NextResponse.json({ tasks });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const task = await db.task.create({
    data: {
      title: body.title,
      description: body.description ?? null,
      status: body.status ?? "inbox",
      priority: body.priority ?? "medium",
      estimatedMin: body.estimatedMin ?? null,
      dueDate: body.dueDate ? new Date(body.dueDate) : null,
      dueTime: body.dueTime ?? null,
      scheduledFor: body.scheduledFor ? new Date(body.scheduledFor) : null,
      reminder: body.reminder ? new Date(body.reminder) : null,
      repeat: body.repeat ?? null,
      labels: JSON.stringify(body.labels ?? []),
      color: body.color ?? null,
      emoji: body.emoji ?? null,
      clientId: body.clientId ?? null,
      projectId: body.projectId ?? null,
      parentId: body.parentId ?? null,
    },
  });
  await logActivity({
    kind: "task.created", entity: "task", entityId: task.id, title: task.title,
  });
  return NextResponse.json({ task });
}
