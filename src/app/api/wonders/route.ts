import { desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { wonders } from "@/db/schema";
import { error, json, num, oneOf, str, withUser } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET() {
  return withUser(async (user) => {
    const rows = await db
      .select()
      .from(wonders)
      .where(eq(wonders.userId, user.id))
      .orderBy(desc(wonders.createdAt));
    return json(rows);
  });
}

export async function POST(request: Request) {
  return withUser(async (user) => {
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const question = str(body.question);
    if (question.length < 4) return error("Ask a full question — at least a few words.");

    const age = num(body.askedAge) ?? 8;
    const [created] = await db
      .insert(wonders)
      .values({
        userId: user.id,
        askedBy: str(body.askedBy).slice(0, 60) || "Someone curious",
        askedAge: Math.min(Math.max(Math.round(age), 2), 105),
        question: question.slice(0, 600),
        status: oneOf(body.status, ["open", "answered"] as const, "open"),
      })
      .returning();
    return json(created, 201);
  });
}
