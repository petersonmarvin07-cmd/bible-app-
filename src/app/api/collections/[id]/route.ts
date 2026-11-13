import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { collections } from "@/db/schema";
import { error, json, oneOf, str, withUser } from "@/lib/api";
import { COLLECTION_ACCENTS } from "@/lib/constants";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };
const accents = COLLECTION_ACCENTS.map((accent) => accent.id);

export async function PATCH(request: Request, { params }: Params) {
  return withUser(async (user) => {
    const { id } = await params;
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const patch: Record<string, unknown> = {};
    if (typeof body.name === "string") {
      const name = str(body.name);
      if (!name) return error("Collection needs a name.");
      patch.name = name.slice(0, 80);
    }
    if (typeof body.description === "string") patch.description = str(body.description).slice(0, 240);
    if (typeof body.emoji === "string") patch.emoji = str(body.emoji, "📖").slice(0, 4) || "📖";
    if (typeof body.accent === "string") patch.accent = oneOf(body.accent, accents, "sage");
    if (Object.keys(patch).length === 0) return error("Nothing to update.");

    const [updated] = await db
      .update(collections)
      .set(patch)
      .where(and(eq(collections.id, id), eq(collections.userId, user.id)))
      .returning();
    if (!updated) return error("Collection not found.", 404);
    return json(updated);
  });
}

export async function DELETE(_request: Request, { params }: Params) {
  return withUser(async (user) => {
    const { id } = await params;
    const [deleted] = await db
      .delete(collections)
      .where(and(eq(collections.id, id), eq(collections.userId, user.id)))
      .returning({ id: collections.id });
    if (!deleted) return error("Collection not found.", 404);
    return json({ ok: true });
  });
}
