import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { readingPlans } from "@/db/schema";
import { bool, error, json, oneOf, str, withUser } from "@/lib/api";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  return withUser(async (user) => {
    const { id } = await params;
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const patch: Record<string, unknown> = {};
    if (typeof body.title === "string") {
      const title = str(body.title);
      if (!title) return error("Plan needs a name.");
      patch.title = title.slice(0, 100);
    }
    if (typeof body.description === "string") patch.description = str(body.description).slice(0, 400);
    if (typeof body.band === "string") {
      patch.band = oneOf(body.band, ["family", "little", "explorer", "youth", "grown"] as const, "family");
    }
    const isActive = bool(body.isActive);
    if (isActive !== undefined) patch.isActive = isActive;
    if (Object.keys(patch).length === 0) return error("Nothing to update.");

    const [updated] = await db
      .update(readingPlans)
      .set(patch)
      .where(and(eq(readingPlans.id, id), eq(readingPlans.userId, user.id)))
      .returning();
    if (!updated) return error("Plan not found.", 404);
    return json(updated);
  });
}

export async function DELETE(_request: Request, { params }: Params) {
  return withUser(async (user) => {
    const { id } = await params;
    const [deleted] = await db
      .delete(readingPlans)
      .where(and(eq(readingPlans.id, id), eq(readingPlans.userId, user.id)))
      .returning({ id: readingPlans.id });
    if (!deleted) return error("Plan not found.", 404);
    return json({ ok: true });
  });
}
