import { db } from "./db";

export async function logActivity(input: {
  kind: string;
  entity: string;
  entityId?: string;
  title: string;
  meta?: unknown;
}) {
  try {
    await db.activity.create({
      data: {
        kind: input.kind,
        entity: input.entity,
        entityId: input.entityId,
        title: input.title,
        meta: input.meta ? JSON.stringify(input.meta) : undefined,
      },
    });
  } catch { /* non-critical */ }
}
