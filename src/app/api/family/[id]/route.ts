import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { familyMembers } from "@/db/schema";
import { error, json, num, oneOf, str, withUser } from "@/lib/api";
import { BAND_IDS } from "@/lib/constants";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  return withUser(async (user) => {
    const { id } = await params;
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const patch: Record<string, unknown> = {};

    if (typeof body.name === "string") {
      const name = str(body.name);
      if (!name) return error("Name cannot be empty.");
      patch.name = name.slice(0, 60);
    }
    if (typeof body.band === "string") patch.band = oneOf(body.band, BAND_IDS, "explorer");
    if (typeof body.emoji === "string") patch.emoji = str(body.emoji, "🌱").slice(0, 4) || "🌱";
    if (typeof body.role === "string") {
      patch.role = oneOf(body.role, ["parent", "child", "grandparent", "member"] as const, "member");
    }
    if (body.streak !== undefined) {
      const streak = num(body.streak);
      if (streak !== undefined) patch.streak = Math.max(0, Math.round(streak));
    }
    if (Object.keys(patch).length === 0) return error("Nothing to update.");

    const [updated] = await db
      .update(familyMembers)
      .set(patch)
      .where(and(eq(familyMembers.id, id), eq(familyMembers.userId, user.id)))
      .returning();
    if (!updated) return error("Family member not found.", 404);
    return json(updated);
  });
}

export async function DELETE(_request: Request, { params }: Params) {
  return withUser(async (user) => {
    const { id } = await params;
    const [deleted] = await db
      .delete(familyMembers)
      .where(and(eq(familyMembers.id, id), eq(familyMembers.userId, user.id)))
      .returning({ id: familyMembers.id });
    if (!deleted) return error("Family member not found.", 404);
    return json({ ok: true });
  });
}
