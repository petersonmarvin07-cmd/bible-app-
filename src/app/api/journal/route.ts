import { desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { journalEntries } from "@/db/schema";
import { error, json, oneOf, str, withUser } from "@/lib/api";
import { JOURNAL_MOODS } from "@/lib/constants";

export const dynamic = "force-dynamic";

export async function GET() {
  return withUser(async (user) => {
    const rows = await db
      .select()
      .from(journalEntries)
      .where(eq(journalEntries.userId, user.id))
      .orderBy(desc(journalEntries.createdAt));
    return json(rows);
  });
}

export async function POST(request: Request) {
  return withUser(async (user) => {
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const title = str(body.title);
    const text = str(body.body);
    if (!title) return error("Give your entry a title.");
    if (!text) return error("Write something before saving.");

    const [created] = await db
      .insert(journalEntries)
      .values({
        userId: user.id,
        title: title.slice(0, 160),
        body: text.slice(0, 8000),
        mood: oneOf(body.mood, JOURNAL_MOODS, "peaceful"),
        sharing: oneOf(body.sharing, ["private", "family"] as const, "private"),
        passageId: typeof body.passageId === "string" && body.passageId ? body.passageId : null,
      })
      .returning();

    return json(created, 201);
  });
}
