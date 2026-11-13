import { eq } from "drizzle-orm";

import { db } from "@/db";
import { planDays, readingPlans } from "@/db/schema";
import { error, json, oneOf, str, withUser } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  return withUser(async (user) => {
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const title = str(body.title);
    if (!title) return error("Give your plan a name.");

    const [plan] = await db
      .insert(readingPlans)
      .values({
        userId: user.id,
        title: title.slice(0, 100),
        description: str(body.description).slice(0, 400),
        band: oneOf(body.band, ["family", "little", "explorer", "youth", "grown"] as const, "family"),
        isActive: body.isActive !== false,
      })
      .returning();
    if (!plan) return error("Could not create that plan.", 500);

    const passageIds = Array.isArray(body.passageIds)
      ? body.passageIds.filter((value): value is string => typeof value === "string")
      : [];

    if (passageIds.length > 0) {
      await db.insert(planDays).values(
        passageIds.slice(0, 30).map((passageId, index) => ({
          planId: plan.id,
          dayNumber: index + 1,
          title: `Day ${index + 1}`,
          passageId,
        })),
      );
    }

    const days = await db.select().from(planDays).where(eq(planDays.planId, plan.id));
    return json({ ...plan, days }, 201);
  });
}
