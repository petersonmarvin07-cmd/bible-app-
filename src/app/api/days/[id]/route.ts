import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { planDays, readingPlans } from "@/db/schema";
import { bool, error, json, str, withUser } from "@/lib/api";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

async function ownedDay(dayId: string, userId: string) {
  const [row] = await db
    .select({ day: planDays })
    .from(planDays)
    .innerJoin(readingPlans, eq(readingPlans.id, planDays.planId))
    .where(and(eq(planDays.id, dayId), eq(readingPlans.userId, userId)))
    .limit(1);
  return row?.day ?? null;
}

export async function PATCH(request: Request, { params }: Params) {
  return withUser(async (user) => {
    const { id } = await params;
    const existing = await ownedDay(id, user.id);
    if (!existing) return error("Day not found.", 404);

    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const patch: Record<string, unknown> = {};
    const completed = bool(body.completed);
    if (completed !== undefined) {
      patch.completed = completed;
      patch.completedAt = completed ? new Date() : null;
    }
    if (typeof body.title === "string") patch.title = str(body.title).slice(0, 120) || existing.title;
    if ("passageId" in body) {
      patch.passageId = typeof body.passageId === "string" && body.passageId ? body.passageId : null;
    }
    if (Object.keys(patch).length === 0) return error("Nothing to update.");

    const [updated] = await db.update(planDays).set(patch).where(eq(planDays.id, id)).returning();
    return json(updated);
  });
}

export async function DELETE(_request: Request, { params }: Params) {
  return withUser(async (user) => {
    const { id } = await params;
    const existing = await ownedDay(id, user.id);
    if (!existing) return error("Day not found.", 404);
    await db.delete(planDays).where(eq(planDays.id, id));
    return json({ ok: true });
  });
}
