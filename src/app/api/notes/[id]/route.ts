import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { logActivity } from "@/lib/activity";

export async function GET(_: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const note = await db.note.findUnique({ where: { id } });
  return NextResponse.json({ note });
}
export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const b = await req.json();
  const note = await db.note.update({ where: { id }, data: b });
  await logActivity({ kind: "note.edited", entity: "note", entityId: id, title: note.title });
  return NextResponse.json({ note });
}
export async function DELETE(_: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  await db.note.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
