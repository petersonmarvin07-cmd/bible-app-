import { eq, sql } from "drizzle-orm";

import { db } from "@/db";
import { passageVersions, passages } from "@/db/schema";
import { json, oneOf, str, withUser } from "@/lib/api";
import { BAND_IDS, MOODS, type BandId, type MoodId } from "@/lib/constants";

export const dynamic = "force-dynamic";

const moodIds = MOODS.map((mood) => mood.id) as MoodId[];

export async function POST(request: Request) {
  return withUser(async (user) => {
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const mood = oneOf(body.mood, moodIds, "hopeful");
    const defaultBand: BandId = BAND_IDS.includes(user.homeBand as BandId)
      ? (user.homeBand as BandId)
      : "grown";
    const band = oneOf(body.band, BAND_IDS, defaultBand);
    const energy = str(body.energy, "any");

    const target = MOODS.find((item) => item.id === mood) ?? MOODS[0];

    const matches = await db
      .select()
      .from(passages)
      .where(eq(passages.theme, target.theme))
      .orderBy(sql`random()`)
      .limit(1);

    let passage = matches[0];
    if (!passage) {
      const fallback = await db.select().from(passages).orderBy(sql`random()`).limit(1);
      passage = fallback[0];
    }
    if (!passage) {
      return json({ error: "The library is still warming up. Try again in a moment." }, 409);
    }

    const [version] = await db
      .select()
      .from(passageVersions)
      .where(sql`${passageVersions.passageId} = ${passage.id} and ${passageVersions.band} = ${band}`)
      .limit(1);

    return json({
      mood,
      energy,
      band,
      passage: {
        id: passage.id,
        slug: passage.slug,
        reference: passage.reference,
        theme: passage.theme,
        testament: passage.testament,
        reflectionPrompt: passage.reflectionPrompt,
      },
      version: version
        ? {
            title: version.title,
            body: version.body,
            takeaway: version.takeaway,
            wonderQuestion: version.wonderQuestion,
          }
        : null,
    });
  });
}
