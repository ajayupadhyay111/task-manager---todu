import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const q = (new URL(req.url).searchParams.get("q") ?? "").trim();
  if (!q) return NextResponse.json({ tasks: [], clients: [], projects: [], notes: [] });

  const [tasks, clients, projects, notes] = await Promise.all([
    db.task.findMany({ where: { OR: [{ title: { contains: q } }, { description: { contains: q } }] }, take: 10 }),
    db.client.findMany({ where: { OR: [{ name: { contains: q } }, { company: { contains: q } }] }, take: 8 }),
    db.project.findMany({ where: { OR: [{ name: { contains: q } }, { description: { contains: q } }] }, take: 8 }),
    db.note.findMany({ where: { OR: [{ title: { contains: q } }, { body: { contains: q } }] }, take: 8 }),
  ]);
  return NextResponse.json({ tasks, clients, projects, notes });
}
