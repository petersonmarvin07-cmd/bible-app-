import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { journalEntries } from "@/db/schema";
import { error, json, oneOf, str, withUser } from "@/lib/api";
import { JOURNAL_MOODS } from "@/lib/constants";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  return withUser(async (user) => {
    const { id } = await params;
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const patch: Record<string, unknown> = { updatedAt: new Date() };

    if (typeof body.title === "string") {
      const title = str(body.title);
      if (!title) return error("Your entry needs a title.");
      patch.title = title.slice(0, 160);
    }
    if (typeof body.body === "string") {
      const text = str(body.body);
      if (!text) return error("Your entry needs some words.");
      patch.body = text.slice(0, 8000);
    }
    if (typeof body.mood === "string") patch.mood = oneOf(body.mood, JOURNAL_MOODS, "peaceful");
    if (typeof body.sharing === "string") {
      patch.sharing = oneOf(body.sharing, ["private", "family"] as const, "private");
    }
    if ("passageId" in body) {
      patch.passageId = typeof body.passageId === "string" && body.passageId ? body.passageId : null;
    }

    const [updated] = await db
      .update(journalEntries)
      .set(patch)
      .where(and(eq(journalEntries.id, id), eq(journalEntries.userId, user.id)))
      .returning();

    if (!updated) return error("Entry not found.", 404);
    return json(updated);
  });
}

export async function DELETE(_request: Request, { params }: Params) {
  return withUser(async (user) => {
    const { id } = await params;
    const [deleted] = await db
      .delete(journalEntries)
      .where(and(eq(journalEntries.id, id), eq(journalEntries.userId, user.id)))
      .returning({ id: journalEntries.id });
    if (!deleted) return error("Entry not found.", 404);
    return json({ ok: true });
  });
}
