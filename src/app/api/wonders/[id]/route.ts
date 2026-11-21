import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { wonders } from "@/db/schema";
import { error, json, num, oneOf, str, withUser } from "@/lib/api";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  return withUser(async (user) => {
    const { id } = await params;
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const patch: Record<string, unknown> = {};

    if (typeof body.question === "string") {
      const question = str(body.question);
      if (question.length < 4) return error("Question is too short.");
      patch.question = question.slice(0, 600);
    }
    if (typeof body.askedBy === "string") {
      const askedBy = str(body.askedBy).slice(0, 60);
      if (!askedBy) return error("Asker name cannot be empty.");
      patch.askedBy = askedBy;
    }
    if (body.askedAge !== undefined) {
      const age = num(body.askedAge);
      if (age !== undefined) patch.askedAge = Math.min(Math.max(Math.round(age), 2), 105);
    }
    if (typeof body.answer === "string") {
      patch.answer = str(body.answer).slice(0, 2000);
      if (patch.answer) {
        patch.status = "answered";
        patch.answeredBy = str(body.answeredBy).slice(0, 60) || user.name.split(" ")[0];
      }
    }
    if (typeof body.status === "string") {
      patch.status = oneOf(body.status, ["open", "answered"] as const, "open");
      if (patch.status === "open") {
        patch.answer = "";
        patch.answeredBy = "";
      }
    }
    if (Object.keys(patch).length === 0) return error("Nothing to update.");

    const [updated] = await db
      .update(wonders)
      .set(patch)
      .where(and(eq(wonders.id, id), eq(wonders.userId, user.id)))
      .returning();
    if (!updated) return error("Wonder not found.", 404);
    return json(updated);
  });
}

export async function DELETE(_request: Request, { params }: Params) {
  return withUser(async (user) => {
    const { id } = await params;
    const [deleted] = await db
      .delete(wonders)
      .where(and(eq(wonders.id, id), eq(wonders.userId, user.id)))
      .returning({ id: wonders.id });
    if (!deleted) return error("Wonder not found.", 404);
    return json({ ok: true });
  });
}
