import { desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { readingLog, users } from "@/db/schema";
import { json, oneOf, str, withUser } from "@/lib/api";
import { BAND_IDS } from "@/lib/constants";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  return withUser(async (user) => {
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const passageId = typeof body.passageId === "string" && body.passageId ? body.passageId : null;
    const band = oneOf(body.band, BAND_IDS, "grown");

    const [last] = await db
      .select({ createdAt: readingLog.createdAt })
      .from(readingLog)
      .where(eq(readingLog.userId, user.id))
      .orderBy(desc(readingLog.createdAt))
      .limit(1);

    await db.insert(readingLog).values({ userId: user.id, passageId, band });

    const key = (date: Date) => date.toISOString().slice(0, 10);
    const today = key(new Date());
    const yesterday = key(new Date(Date.now() - 86_400_000));
    const lastKey = last ? key(last.createdAt) : null;

    let streak = user.streakCount;
    if (lastKey === today) {
      streak = Math.max(streak, 1);
    } else if (lastKey === yesterday) {
      streak = streak + 1;
    } else {
      streak = 1;
    }

    await db.update(users).set({ streakCount: streak }).where(eq(users.id, user.id));

    return json({ ok: true, streak, loggedBand: band, passageId, at: new Date().toISOString() }, 201);
  });
}

export async function GET() {
  return withUser(async (user) => {
    const rows = await db
      .select()
      .from(readingLog)
      .where(eq(readingLog.userId, user.id))
      .orderBy(desc(readingLog.createdAt))
      .limit(40);
    return json(rows);
  });
}
