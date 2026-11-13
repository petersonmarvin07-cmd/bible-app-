import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { collections, savedVerses } from "@/db/schema";
import { error, json, str, withUser } from "@/lib/api";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  return withUser(async (user) => {
    const { id } = await params;
    const [collection] = await db
      .select({ id: collections.id })
      .from(collections)
      .where(and(eq(collections.id, id), eq(collections.userId, user.id)))
      .limit(1);
    if (!collection) return error("Collection not found.", 404);

    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const reference = str(body.reference);
    const text = str(body.text);
    if (!reference) return error("Which verse are you saving?");
    if (!text) return error("There is no verse text to save.");

    const [created] = await db
      .insert(savedVerses)
      .values({
        collectionId: id,
        userId: user.id,
        reference: reference.slice(0, 120),
        text: text.slice(0, 4000),
        note: str(body.note).slice(0, 500),
      })
      .returning();
    return json(created, 201);
  });
}
