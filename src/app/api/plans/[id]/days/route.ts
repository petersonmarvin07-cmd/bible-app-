import { and, desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { planDays, readingPlans } from "@/db/schema";
import { error, json, str, withUser } from "@/lib/api";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  return withUser(async (user) => {
    const { id } = await params;
    const [plan] = await db
      .select({ id: readingPlans.id })
      .from(readingPlans)
      .where(and(eq(readingPlans.id, id), eq(readingPlans.userId, user.id)))
      .limit(1);
    if (!plan) return error("Plan not found.", 404);

    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const [last] = await db
      .select({ dayNumber: planDays.dayNumber })
      .from(planDays)
      .where(eq(planDays.planId, id))
      .orderBy(desc(planDays.dayNumber))
      .limit(1);

    const [created] = await db
      .insert(planDays)
      .values({
        planId: id,
        dayNumber: (last?.dayNumber ?? 0) + 1,
        title: str(body.title).slice(0, 120) || `Day ${(last?.dayNumber ?? 0) + 1}`,
        passageId: typeof body.passageId === "string" && body.passageId ? body.passageId : null,
      })
      .returning();
    return json(created, 201);
  });
}
