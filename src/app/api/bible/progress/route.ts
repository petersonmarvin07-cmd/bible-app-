import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { canonicalProgress, readingLog, users } from "@/db/schema";
import { error, json, num, withUser } from "@/lib/api";
import { getBookById } from "@/lib/bible-data";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  return withUser(async (user) => {
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const bookId = num(body.bookId);
    const chapter = num(body.chapter);

    if (!bookId || !chapter || bookId < 1 || bookId > 66) {
      return error("Valid bookId (1-66) and chapter are required.");
    }

    const book = getBookById(bookId);
    if (!book || chapter < 1 || chapter > book.chapterCount) {
      return error("Chapter is out of bounds for this book.");
    }

    // Insert into canonical_progress
    await db
      .insert(canonicalProgress)
      .values({
        userId: user.id,
        bookId,
        chapter,
      })
      .onConflictDoNothing();

    // Also log to reading_log and bump streak
    await db.insert(readingLog).values({
      userId: user.id,
      band: user.homeBand,
    });

    const newStreak = user.streakCount + 1;
    await db
      .update(users)
      .set({ streakCount: newStreak })
      .where(eq(users.id, user.id));

    return json({
      ok: true,
      bookId,
      bookName: book.name,
      chapter,
      completed: true,
      streak: newStreak,
    });
  });
}

export async function DELETE(request: Request) {
  return withUser(async (user) => {
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const bookId = num(body.bookId);
    const chapter = num(body.chapter);

    if (!bookId || !chapter) {
      return error("Valid bookId and chapter are required.");
    }

    await db
      .delete(canonicalProgress)
      .where(
        and(
          eq(canonicalProgress.userId, user.id),
          eq(canonicalProgress.bookId, bookId),
          eq(canonicalProgress.chapter, chapter)
        )
      );

    return json({ ok: true, bookId, chapter, completed: false });
  });
}
