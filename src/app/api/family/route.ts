import { eq } from "drizzle-orm";

import { db } from "@/db";
import { familyMembers } from "@/db/schema";
import { error, json, num, oneOf, str, withUser } from "@/lib/api";
import { BAND_IDS } from "@/lib/constants";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  return withUser(async (user) => {
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const name = str(body.name);
    if (!name) return error("Who is joining the circle?");

    const [created] = await db
      .insert(familyMembers)
      .values({
        userId: user.id,
        name: name.slice(0, 60),
        band: oneOf(body.band, BAND_IDS, "explorer"),
        emoji: str(body.emoji, "🌱").slice(0, 4) || "🌱",
        role: oneOf(body.role, ["parent", "child", "grandparent", "member"] as const, "member"),
        streak: num(body.streak) ?? 0,
      })
      .returning();
    return json(created, 201);
  });
}

export async function GET() {
  return withUser(async (user) => {
    const rows = await db.select().from(familyMembers).where(eq(familyMembers.userId, user.id));
    return json(rows);
  });
}
