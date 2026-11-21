import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { collections, savedVerses } from "@/db/schema";
import { error, json, str, withUser } from "@/lib/api";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  return withUser(async (user) => {
    const { id } = await params;
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const patch: Record<string, unknown> = {};
    if (typeof body.note === "string") patch.note = str(body.note).slice(0, 500);
    if (typeof body.reference === "string") {
      const reference = str(body.reference);
      if (!reference) return error("Verse reference cannot be empty.");
      patch.reference = reference.slice(0, 120);
    }
    if (typeof body.text === "string") {
      const text = str(body.text);
      if (!text) return error("Verse text cannot be empty.");
      patch.text = text.slice(0, 4000);
    }
    if (typeof body.collectionId === "string" && body.collectionId) {
      const [owned] = await db
        .select({ id: collections.id })
        .from(collections)
        .where(and(eq(collections.id, body.collectionId), eq(collections.userId, user.id)))
        .limit(1);
      if (!owned) return error("Collection not found.", 404);
      patch.collectionId = body.collectionId;
    }
    if (Object.keys(patch).length === 0) return error("Nothing to update.");

    const [updated] = await db
      .update(savedVerses)
      .set(patch)
      .where(and(eq(savedVerses.id, id), eq(savedVerses.userId, user.id)))
      .returning();
    if (!updated) return error("Verse not found.", 404);
    return json(updated);
  });
}

export async function DELETE(_request: Request, { params }: Params) {
  return withUser(async (user) => {
    const { id } = await params;
    const [deleted] = await db
      .delete(savedVerses)
      .where(and(eq(savedVerses.id, id), eq(savedVerses.userId, user.id)))
      .returning({ id: savedVerses.id });
    if (!deleted) return error("Verse not found.", 404);
    return json({ ok: true });
  });
}
