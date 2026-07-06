import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { logActivity } from "@/lib/activity";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const clientId = searchParams.get("clientId");
  const projects = await db.project.findMany({
    where: clientId ? { clientId } : undefined,
    include: {
      client: { select: { id: true, name: true, color: true } },
      _count: { select: { tasks: true, milestones: true } },
    },
    orderBy: [{ pinned: "desc" }, { updatedAt: "desc" }],
  });
  return NextResponse.json({ projects });
}

export async function POST(req: NextRequest) {
  const b = await req.json();
  const project = await db.project.create({
    data: {
      name: b.name, description: b.description ?? null,
      status: b.status ?? "active", priority: b.priority ?? "medium",
      deadline: b.deadline ? new Date(b.deadline) : null,
      progress: b.progress ?? 0, color: b.color ?? "#4F7CFF",
      icon: b.icon ?? null, links: JSON.stringify(b.links ?? []),
      notes: b.notes ?? null, clientId: b.clientId ?? null,
    },
  });
  await logActivity({ kind: "project.created", entity: "project", entityId: project.id, title: project.name });
  return NextResponse.json({ project });
}
