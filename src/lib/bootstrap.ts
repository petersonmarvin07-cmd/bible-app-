import "server-only";

import { eq } from "drizzle-orm";

import { db } from "@/db";
import { collections, familyMembers, passageVersions, passages, planDays, readingPlans, savedVerses, users } from "@/db/schema";
import { ensureSeeded } from "@/lib/seed";

export async function bootstrapNewUser(user: { id: string; name: string; homeBand: string }) {
  try {
    await ensureSeeded();
    const starters = await db.select().from(passages).limit(4);
    if (starters.length === 0) return;

    const [collection] = await db
      .insert(collections)
      .values({
        userId: user.id,
        name: "My first anchors",
        description: "A small shelf to start with — add verses as you read.",
        emoji: "⚓",
        accent: "sage",
      })
      .returning();

    if (collection) {
      const grownVersions = await db
        .select()
        .from(passageVersions)
        .where(eq(passageVersions.band, user.homeBand));
      const picks = starters
        .map((passage) => grownVersions.find((version) => version.passageId === passage.id))
        .filter((version): version is typeof passageVersions.$inferSelect => Boolean(version))
        .slice(0, 3);

      if (picks.length > 0) {
        await db.insert(savedVerses).values(
          picks.map((version, index) => {
            const passage = starters.find((item) => item.id === version.passageId);
            return {
              collectionId: collection.id,
              userId: user.id,
              reference: passage?.reference ?? "Scripture",
              text: version.body,
              note: index === 0 ? "Start here when you need a steady breath." : "",
            };
          }),
        );
      }
    }

    const [plan] = await db
      .insert(readingPlans)
      .values({
        userId: user.id,
        title: "First Five Mornings",
        description: "Five short readings to find your rhythm. No rush.",
        band: "family",
        isActive: true,
      })
      .returning();

    if (plan) {
      await db.insert(planDays).values(
        starters.slice(0, 5).map((passage, index) => ({
          planId: plan.id,
          dayNumber: index + 1,
          title: `${index === 0 ? "Begin with" : "Day " + (index + 1) + ":"} ${passage.theme}`,
          passageId: passage.id,
          completed: false,
        })),
      );
    }

    const firstName = user.name.split(" ")[0] || "You";
    await db.insert(familyMembers).values({
      userId: user.id,
      name: firstName,
      band: user.homeBand,
      emoji: "🌿",
      role: "parent",
      streak: 0,
    });

    await db
      .update(users)
      .set({ householdName: `The ${user.name.split(" ").slice(-1)[0] || "Lumen"} Household` })
      .where(eq(users.id, user.id));
  } catch (cause) {
    console.error("bootstrapNewUser failed", cause);
  }
}
