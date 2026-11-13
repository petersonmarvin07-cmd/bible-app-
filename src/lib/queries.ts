import "server-only";

import { and, asc, desc, eq, inArray, sql } from "drizzle-orm";

import { db } from "@/db";
import {
  bibleBooks,
  bibleVerses,
  canonicalProgress,
  collections,
  familyMembers,
  journalEntries,
  passageVersions,
  passages,
  planDays,
  prayers,
  readingLog,
  readingPlans,
  savedVerses,
  wonders,
} from "@/db/schema";
import {
  BIBLE_BOOKS_CATALOG,
  BibleBookMeta,
  NT_CHAPTERS,
  OT_CHAPTERS,
  TOTAL_CANONICAL_CHAPTERS,
  getBookById,
  getBookByNameOrOsis,
} from "@/lib/bible-data";
import type {
  CollectionItem,
  FamilyItem,
  JournalItem,
  PassageItem,
  PassageOption,
  PlanItem,
  PrayerItem,
  WonderItem,
} from "@/lib/types";

export async function getJournal(userId: string): Promise<JournalItem[]> {
  const rows = await db
    .select({ entry: journalEntries, reference: passages.reference })
    .from(journalEntries)
    .leftJoin(passages, eq(passages.id, journalEntries.passageId))
    .where(eq(journalEntries.userId, userId))
    .orderBy(desc(journalEntries.createdAt));

  return rows.map(({ entry, reference }) => ({
    id: entry.id,
    title: entry.title,
    body: entry.body,
    mood: entry.mood,
    passageId: entry.passageId,
    passageReference: reference ?? null,
    sharing: entry.sharing,
    createdAt: entry.createdAt.toISOString(),
    updatedAt: entry.updatedAt.toISOString(),
  }));
}

export async function getCollections(userId: string): Promise<CollectionItem[]> {
  const groups = await db
    .select()
    .from(collections)
    .where(eq(collections.userId, userId))
    .orderBy(desc(collections.createdAt));

  if (groups.length === 0) return [];

  const verseRows = await db
    .select()
    .from(savedVerses)
    .where(
      inArray(
        savedVerses.collectionId,
        groups.map((group) => group.id),
      ),
    )
    .orderBy(desc(savedVerses.createdAt));

  return groups.map((group) => ({
    id: group.id,
    name: group.name,
    description: group.description,
    emoji: group.emoji,
    accent: group.accent,
    createdAt: group.createdAt.toISOString(),
    verses: verseRows
      .filter((verse) => verse.collectionId === group.id)
      .map((verse) => ({
        id: verse.id,
        collectionId: verse.collectionId,
        reference: verse.reference,
        text: verse.text,
        note: verse.note,
        createdAt: verse.createdAt.toISOString(),
      })),
  }));
}

export async function getPlans(userId: string): Promise<PlanItem[]> {
  const groups = await db
    .select()
    .from(readingPlans)
    .where(eq(readingPlans.userId, userId))
    .orderBy(desc(readingPlans.isActive), desc(readingPlans.createdAt));

  if (groups.length === 0) return [];

  const dayRows = await db
    .select({ day: planDays, reference: passages.reference })
    .from(planDays)
    .leftJoin(passages, eq(passages.id, planDays.passageId))
    .where(
      inArray(
        planDays.planId,
        groups.map((group) => group.id),
      ),
    )
    .orderBy(asc(planDays.dayNumber));

  return groups.map((group) => ({
    id: group.id,
    title: group.title,
    description: group.description,
    band: group.band,
    isActive: group.isActive,
    createdAt: group.createdAt.toISOString(),
    days: dayRows
      .filter((row) => row.day.planId === group.id)
      .map(({ day, reference }) => ({
        id: day.id,
        planId: day.planId,
        dayNumber: day.dayNumber,
        title: day.title,
        passageId: day.passageId,
        passageReference: reference ?? null,
        completed: day.completed,
      })),
  }));
}

export async function getPrayers(userId: string): Promise<PrayerItem[]> {
  const rows = await db
    .select()
    .from(prayers)
    .where(eq(prayers.userId, userId))
    .orderBy(desc(prayers.createdAt));

  return rows.map((row) => ({
    id: row.id,
    authorName: row.authorName,
    body: row.body,
    category: row.category,
    isAnswered: row.isAnswered,
    answeredNote: row.answeredNote,
    prayedCount: row.prayedCount,
    createdAt: row.createdAt.toISOString(),
  }));
}

export async function getWonders(userId: string): Promise<WonderItem[]> {
  const rows = await db
    .select()
    .from(wonders)
    .where(eq(wonders.userId, userId))
    .orderBy(desc(wonders.createdAt));

  return rows.map((row) => ({
    id: row.id,
    askedBy: row.askedBy,
    askedAge: row.askedAge,
    question: row.question,
    answer: row.answer,
    answeredBy: row.answeredBy,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
  }));
}

export async function getFamily(userId: string): Promise<FamilyItem[]> {
  const rows = await db
    .select()
    .from(familyMembers)
    .where(eq(familyMembers.userId, userId))
    .orderBy(desc(familyMembers.streak));

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    band: row.band,
    emoji: row.emoji,
    role: row.role,
    streak: row.streak,
  }));
}

export async function getPassagesWithVersions(): Promise<PassageItem[]> {
  const rows = await db.select().from(passages).orderBy(asc(passages.sortOrder));
  if (rows.length === 0) return [];
  const versions = await db
    .select()
    .from(passageVersions)
    .where(
      inArray(
        passageVersions.passageId,
        rows.map((row) => row.id),
      ),
    );

  return rows.map((row) => ({
    id: row.id,
    slug: row.slug,
    reference: row.reference,
    book: row.book,
    chapter: row.chapter,
    verseStart: row.verseStart,
    verseEnd: row.verseEnd,
    theme: row.theme,
    testament: row.testament,
    reflectionPrompt: row.reflectionPrompt,
    versions: versions
      .filter((version) => version.passageId === row.id)
      .map((version) => ({
        band: version.band,
        title: version.title,
        body: version.body,
        takeaway: version.takeaway,
        wonderQuestion: version.wonderQuestion,
      })),
  }));
}

export async function getPassageOptions(): Promise<PassageOption[]> {
  const rows = await db
    .select({ id: passages.id, slug: passages.slug, reference: passages.reference, theme: passages.theme })
    .from(passages)
    .orderBy(asc(passages.sortOrder));
  return rows;
}

export type ReadingStats = {
  days: { date: string; count: number }[];
  todayCount: number;
  totalReads: number;
  weeklyCount: number;
};

export async function getReadingStats(userId: string): Promise<ReadingStats> {
  const since = new Date();
  since.setUTCDate(since.getUTCDate() - 34);
  since.setUTCHours(0, 0, 0, 0);

  const rows = await db
    .select({ createdAt: readingLog.createdAt })
    .from(readingLog)
    .where(and(eq(readingLog.userId, userId), sql`${readingLog.createdAt} >= ${since}`))
    .orderBy(desc(readingLog.createdAt));

  const counts = new Map<string, number>();
  for (const row of rows) {
    const key = row.createdAt.toISOString().slice(0, 10);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const days: { date: string; count: number }[] = [];
  for (let i = 27; i >= 0; i -= 1) {
    const date = new Date();
    date.setUTCHours(0, 0, 0, 0);
    date.setUTCDate(date.getUTCDate() - i);
    const key = date.toISOString().slice(0, 10);
    days.push({ date: key, count: counts.get(key) ?? 0 });
  }

  const todayKey = new Date().toISOString().slice(0, 10);
  const weekAgo = new Date();
  weekAgo.setUTCDate(weekAgo.getUTCDate() - 6);
  weekAgo.setUTCHours(0, 0, 0, 0);

  return {
    days,
    todayCount: counts.get(todayKey) ?? 0,
    totalReads: rows.length,
    weeklyCount: rows.filter((row) => row.createdAt >= weekAgo).length,
  };
}

export async function getDashboardCounts(userId: string) {
  const [journalCount, verseCount, openWonderCount, answeredPrayerCount] = await Promise.all([
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(journalEntries)
      .where(eq(journalEntries.userId, userId)),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(savedVerses)
      .where(eq(savedVerses.userId, userId)),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(wonders)
      .where(and(eq(wonders.userId, userId), eq(wonders.status, "open"))),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(prayers)
      .where(and(eq(prayers.userId, userId), eq(prayers.isAnswered, true))),
  ]);

  return {
    journal: journalCount[0]?.count ?? 0,
    verses: verseCount[0]?.count ?? 0,
    openWonders: openWonderCount[0]?.count ?? 0,
    answeredPrayers: answeredPrayerCount[0]?.count ?? 0,
  };
}

export type CanonicalProgressSummary = {
  totalChaptersRead: number;
  totalChapters: number;
  overallPercentage: number;
  otChaptersRead: number;
  otTotalChapters: number;
  otPercentage: number;
  ntChaptersRead: number;
  ntTotalChapters: number;
  ntPercentage: number;
  readKeys: string[];
  recentReads: { bookId: number; bookName: string; chapter: number; completedAt: string }[];
};

export async function getCanonicalProgressStats(userId: string): Promise<CanonicalProgressSummary> {
  const rows = await db
    .select({
      bookId: canonicalProgress.bookId,
      chapter: canonicalProgress.chapter,
      completedAt: canonicalProgress.completedAt,
    })
    .from(canonicalProgress)
    .where(eq(canonicalProgress.userId, userId))
    .orderBy(desc(canonicalProgress.completedAt));

  const readKeys = rows.map((r) => `${r.bookId}-${r.chapter}`);
  const otSet = new Set(BIBLE_BOOKS_CATALOG.filter((b) => b.testament === "Old").map((b) => b.id));
  const ntSet = new Set(BIBLE_BOOKS_CATALOG.filter((b) => b.testament === "New").map((b) => b.id));

  let otChaptersRead = 0;
  let ntChaptersRead = 0;

  for (const r of rows) {
    if (otSet.has(r.bookId)) otChaptersRead++;
    if (ntSet.has(r.bookId)) ntChaptersRead++;
  }

  const recentReads = rows.slice(0, 10).map((r) => ({
    bookId: r.bookId,
    bookName: getBookById(r.bookId)?.name ?? `Book ${r.bookId}`,
    chapter: r.chapter,
    completedAt: r.completedAt.toISOString(),
  }));

  const totalChaptersRead = rows.length;
  const overallPercentage = Math.round((totalChaptersRead / TOTAL_CANONICAL_CHAPTERS) * 100);
  const otPercentage = Math.round((otChaptersRead / OT_CHAPTERS) * 100);
  const ntPercentage = Math.round((ntChaptersRead / NT_CHAPTERS) * 100);

  return {
    totalChaptersRead,
    totalChapters: TOTAL_CANONICAL_CHAPTERS,
    overallPercentage,
    otChaptersRead,
    otTotalChapters: OT_CHAPTERS,
    otPercentage,
    ntChaptersRead,
    ntTotalChapters: NT_CHAPTERS,
    ntPercentage,
    readKeys,
    recentReads,
  };
}

export type BibleVerseItem = {
  id: number;
  bookId: number;
  bookName: string;
  chapter: number;
  verse: number;
  text: string;
};

export async function getBibleChapterVerses(
  bookId: number,
  chapter: number
): Promise<{ book: BibleBookMeta; chapter: number; verses: BibleVerseItem[] }> {
  const bookMeta = getBookById(bookId) ?? BIBLE_BOOKS_CATALOG[0];
  const safeChapter = Math.max(1, Math.min(chapter, bookMeta.chapterCount));

  const rows = await db
    .select()
    .from(bibleVerses)
    .where(and(eq(bibleVerses.bookId, bookMeta.id), eq(bibleVerses.chapter, safeChapter)))
    .orderBy(asc(bibleVerses.verse));

  return {
    book: bookMeta,
    chapter: safeChapter,
    verses: rows.map((r) => ({
      id: r.id,
      bookId: r.bookId,
      bookName: r.bookName,
      chapter: r.chapter,
      verse: r.verse,
      text: r.text,
    })),
  };
}

export async function searchWholeBible(
  query: string,
  limit = 25
): Promise<BibleVerseItem[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  // Use full-text search with plainto_tsquery or ILIKE fallback
  try {
    const rawResults = await db.execute(sql`
      SELECT id, book_id AS "bookId", book_name AS "bookName", chapter, verse, text
      FROM bible_verses
      WHERE to_tsvector('english', text) @@ plainto_tsquery('english', ${trimmed})
         OR text ILIKE ${`%${trimmed}%`}
      ORDER BY book_id ASC, chapter ASC, verse ASC
      LIMIT ${limit}
    `);

    return (rawResults.rows as unknown as BibleVerseItem[]) || [];
  } catch (err) {
    console.error("searchWholeBible error:", err);
    return [];
  }
}
