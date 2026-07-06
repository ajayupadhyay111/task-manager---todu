import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const q = (new URL(req.url).searchParams.get("q") ?? "").trim();
  if (!q) return NextResponse.json({ tasks: [], clients: [], projects: [], notes: [] });

  const ic = "insensitive" as const;
  const tasksP = db.task.findMany({ where: { OR: [{ title: { contains: q, mode: ic } }, { description: { contains: q, mode: ic } }] }, take: 10 });
  const clientsP = db.client.findMany({ where: { OR: [{ name: { contains: q, mode: ic } }, { company: { contains: q, mode: ic } }] }, take: 8 });
  const projectsP = db.project.findMany({ where: { OR: [{ name: { contains: q, mode: ic } }, { description: { contains: q, mode: ic } }] }, take: 8 });
  const notesP = db.note.findMany({ where: { OR: [{ title: { contains: q, mode: ic } }, { body: { contains: q, mode: ic } }] }, take: 8 });
  const tasks = await tasksP;
  const clients = await clientsP;
  const projects = await projectsP;
  const notes = await notesP;
  return NextResponse.json({ tasks, clients, projects, notes });
}
