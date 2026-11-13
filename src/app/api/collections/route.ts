import { desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { collections } from "@/db/schema";
import { error, json, oneOf, str, withUser } from "@/lib/api";
import { COLLECTION_ACCENTS } from "@/lib/constants";

export const dynamic = "force-dynamic";

const accents = COLLECTION_ACCENTS.map((accent) => accent.id);

export async function POST(request: Request) {
  return withUser(async (user) => {
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const name = str(body.name);
    if (!name) return error("Name your collection.");

    const [created] = await db
      .insert(collections)
      .values({
        userId: user.id,
        name: name.slice(0, 80),
        description: str(body.description).slice(0, 240),
        emoji: str(body.emoji, "📖").slice(0, 4) || "📖",
        accent: oneOf(body.accent, accents, "sage"),
      })
      .returning();
    return json(created, 201);
  });
}

export async function GET() {
  return withUser(async (user) => {
    const rows = await db
      .select()
      .from(collections)
      .where(eq(collections.userId, user.id))
      .orderBy(desc(collections.createdAt));
    return json(rows);
  });
}
