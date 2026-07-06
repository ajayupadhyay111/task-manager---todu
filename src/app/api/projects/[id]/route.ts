import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { logActivity } from "@/lib/activity";

export async function GET(_: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const project = await db.project.findUnique({
    where: { id },
    include: {
      client: true,
      milestones: { orderBy: { order: "asc" } },
      tasks: { orderBy: { updatedAt: "desc" }, take: 200 },
      projectNotes: { orderBy: { updatedAt: "desc" }, take: 10 },
    },
  });
  return NextResponse.json({ project });
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const b = await req.json();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: any = { ...b };
  if (b.links !== undefined) data.links = JSON.stringify(b.links);
  if (b.deadline !== undefined) data.deadline = b.deadline ? new Date(b.deadline) : null;
  const project = await db.project.update({ where: { id }, data });
  await logActivity({ kind: "project.updated", entity: "project", entityId: id, title: project.name });
  return NextResponse.json({ project });
}

export async function DELETE(_: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  await db.project.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
