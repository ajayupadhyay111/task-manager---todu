import { db } from "@/lib/db";
import { NotesClient } from "./notes-client";

export const dynamic = "force-dynamic";

export default async function NotesPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const { id } = await searchParams;
  const notes = await db.note.findMany({
    orderBy: [{ pinned: "desc" }, { updatedAt: "desc" }],
    take: 200,
  });
  type NoteRow = (typeof notes)[number];
  return (
    <NotesClient
      initial={notes.map((n: NoteRow) => ({ ...n, updatedAt: n.updatedAt.toISOString() }))}
      initialSelected={id ?? null}
    />
  );
}
