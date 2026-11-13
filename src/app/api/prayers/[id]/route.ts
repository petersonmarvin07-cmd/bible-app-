import { and, eq, sql } from "drizzle-orm";

import { db } from "@/db";
import { prayers } from "@/db/schema";
import { bool, error, json, oneOf, str, withUser } from "@/lib/api";
import { PRAYER_CATEGORIES } from "@/lib/constants";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  return withUser(async (user) => {
    const { id } = await params;
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;

    if (body.action === "pray") {
      const [bumped] = await db
        .update(prayers)
        .set({ prayedCount: sql`${prayers.prayedCount} + 1` })
        .where(and(eq(prayers.id, id), eq(prayers.userId, user.id)))
        .returning();
      if (!bumped) return error("Prayer not found.", 404);
      return json(bumped);
    }

    const patch: Record<string, unknown> = {};
    if (typeof body.body === "string") {
      const text = str(body.body);
      if (!text) return error("Prayer cannot be empty.");
      patch.body = text.slice(0, 2000);
    }
    if (typeof body.authorName === "string") patch.authorName = str(body.authorName).slice(0, 60);
    if (typeof body.category === "string") {
      patch.category = oneOf(body.category, PRAYER_CATEGORIES, "everyday");
    }
    if (typeof body.answeredNote === "string") patch.answeredNote = str(body.answeredNote).slice(0, 1000);
    const answered = bool(body.isAnswered);
    if (answered !== undefined) patch.isAnswered = answered;
    if (Object.keys(patch).length === 0) return error("Nothing to update.");

    const [updated] = await db
      .update(prayers)
      .set(patch)
      .where(and(eq(prayers.id, id), eq(prayers.userId, user.id)))
      .returning();
    if (!updated) return error("Prayer not found.", 404);
    return json(updated);
  });
}

export async function DELETE(_request: Request, { params }: Params) {
  return withUser(async (user) => {
    const { id } = await params;
    const [deleted] = await db
      .delete(prayers)
      .where(and(eq(prayers.id, id), eq(prayers.userId, user.id)))
      .returning({ id: prayers.id });
    if (!deleted) return error("Prayer not found.", 404);
    return json({ ok: true });
  });
}
