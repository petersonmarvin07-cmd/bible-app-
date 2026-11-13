import { desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { prayers } from "@/db/schema";
import { error, json, num, oneOf, str, withUser } from "@/lib/api";
import { PRAYER_CATEGORIES } from "@/lib/constants";

export const dynamic = "force-dynamic";

export async function GET() {
  return withUser(async (user) => {
    const rows = await db
      .select()
      .from(prayers)
      .where(eq(prayers.userId, user.id))
      .orderBy(desc(prayers.createdAt));
    return json(rows);
  });
}

export async function POST(request: Request) {
  return withUser(async (user) => {
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const text = str(body.body);
    if (!text) return error("Write the prayer on your heart.");

    const [created] = await db
      .insert(prayers)
      .values({
        userId: user.id,
        authorName: str(body.authorName).slice(0, 60) || user.name.split(" ")[0],
        body: text.slice(0, 2000),
        category: oneOf(body.category, PRAYER_CATEGORIES, "everyday"),
        prayedCount: num(body.prayedCount) ?? 0,
      })
      .returning();
    return json(created, 201);
  });
}
