import { db } from "@/lib/db";
import { NotesClient } from "./notes-client";

export const dynamic = "force-dynamic";

export default async function NotesPage() {
  const notes = await db.note.findMany({
    orderBy: [{ pinned: "desc" }, { updatedAt: "desc" }],
    take: 200,
  });
  return <NotesClient initial={notes.map(n => ({ ...n, updatedAt: n.updatedAt.toISOString() }))} />;
}
