import {
  boolean,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull(),
    name: text("name").notNull(),
    passwordHash: text("password_hash").notNull(),
    householdName: text("household_name").notNull().default("My Household"),
    avatarEmoji: text("avatar_emoji").notNull().default("🌿"),
    homeBand: text("home_band").notNull().default("grown"),
    streakCount: integer("streak_count").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("users_email_key").on(table.email)],
);

export const sessions = pgTable(
  "sessions",
  {
    token: text("token").primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("sessions_user_idx").on(table.userId)],
);

export const passages = pgTable(
  "passages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull(),
    reference: text("reference").notNull(),
    book: text("book").notNull(),
    chapter: integer("chapter").notNull(),
    verseStart: integer("verse_start").notNull(),
    verseEnd: integer("verse_end").notNull(),
    theme: text("theme").notNull(),
    testament: text("testament").notNull().default("Old"),
    reflectionPrompt: text("reflection_prompt").notNull().default(""),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (table) => [uniqueIndex("passages_slug_key").on(table.slug)],
);

export const passageVersions = pgTable(
  "passage_versions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    passageId: uuid("passage_id")
      .notNull()
      .references(() => passages.id, { onDelete: "cascade" }),
    band: text("band").notNull(),
    title: text("title").notNull(),
    body: text("body").notNull(),
    takeaway: text("takeaway").notNull(),
    wonderQuestion: text("wonder_question").notNull(),
  },
  (table) => [uniqueIndex("passage_versions_unique").on(table.passageId, table.band)],
);

export const journalEntries = pgTable(
  "journal_entries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    body: text("body").notNull(),
    mood: text("mood").notNull().default("peaceful"),
    passageId: uuid("passage_id").references(() => passages.id, { onDelete: "set null" }),
    sharing: text("sharing").notNull().default("private"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("journal_user_idx").on(table.userId)],
);

export const collections = pgTable(
  "collections",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description").notNull().default(""),
    emoji: text("emoji").notNull().default("📖"),
    accent: text("accent").notNull().default("sage"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("collections_user_idx").on(table.userId)],
);

export const savedVerses = pgTable(
  "saved_verses",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    collectionId: uuid("collection_id")
      .notNull()
      .references(() => collections.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    reference: text("reference").notNull(),
    text: text("text").notNull(),
    note: text("note").notNull().default(""),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("saved_verses_collection_idx").on(table.collectionId)],
);

export const readingPlans = pgTable(
  "reading_plans",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description").notNull().default(""),
    band: text("band").notNull().default("family"),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("reading_plans_user_idx").on(table.userId)],
);

export const planDays = pgTable(
  "plan_days",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    planId: uuid("plan_id")
      .notNull()
      .references(() => readingPlans.id, { onDelete: "cascade" }),
    dayNumber: integer("day_number").notNull(),
    title: text("title").notNull(),
    passageId: uuid("passage_id").references(() => passages.id, { onDelete: "set null" }),
    completed: boolean("completed").notNull().default(false),
    completedAt: timestamp("completed_at", { withTimezone: true }),
  },
  (table) => [index("plan_days_plan_idx").on(table.planId)],
);

export const prayers = pgTable(
  "prayers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    authorName: text("author_name").notNull(),
    body: text("body").notNull(),
    category: text("category").notNull().default("everyday"),
    isAnswered: boolean("is_answered").notNull().default(false),
    answeredNote: text("answered_note").notNull().default(""),
    prayedCount: integer("prayed_count").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("prayers_user_idx").on(table.userId)],
);

export const wonders = pgTable(
  "wonders",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    askedBy: text("asked_by").notNull(),
    askedAge: integer("asked_age").notNull().default(8),
    question: text("question").notNull(),
    answer: text("answer").notNull().default(""),
    answeredBy: text("answered_by").notNull().default(""),
    status: text("status").notNull().default("open"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("wonders_user_idx").on(table.userId)],
);

export const familyMembers = pgTable(
  "family_members",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    band: text("band").notNull().default("explorer"),
    emoji: text("emoji").notNull().default("🌱"),
    role: text("role").notNull().default("member"),
    streak: integer("streak").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("family_members_user_idx").on(table.userId)],
);

export const readingLog = pgTable(
  "reading_log",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    passageId: uuid("passage_id").references(() => passages.id, { onDelete: "set null" }),
    band: text("band").notNull().default("grown"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("reading_log_user_idx").on(table.userId)],
);

export type User = typeof users.$inferSelect;
export type Passage = typeof passages.$inferSelect;
export type PassageVersion = typeof passageVersions.$inferSelect;
export type JournalEntry = typeof journalEntries.$inferSelect;
export type Collection = typeof collections.$inferSelect;
export type SavedVerse = typeof savedVerses.$inferSelect;
export type ReadingPlan = typeof readingPlans.$inferSelect;
export type PlanDay = typeof planDays.$inferSelect;
export type Prayer = typeof prayers.$inferSelect;
export type Wonder = typeof wonders.$inferSelect;
export const bibleBooks = pgTable(
  "bible_books",
  {
    id: integer("id").primaryKey(),
    osis: text("osis").notNull(),
    name: text("name").notNull(),
    testament: text("testament").notNull(),
    division: text("division").notNull(),
    chapterCount: integer("chapter_count").notNull(),
    verseCount: integer("verse_count").notNull(),
    summary: text("summary").notNull().default(""),
    theme: text("theme").notNull().default(""),
  },
  (table) => [
    uniqueIndex("bible_books_osis_key").on(table.osis),
    uniqueIndex("bible_books_name_key").on(table.name),
  ],
);

export const bibleVerses = pgTable(
  "bible_verses",
  {
    id: integer("id").primaryKey(),
    bookId: integer("book_id")
      .notNull()
      .references(() => bibleBooks.id, { onDelete: "cascade" }),
    bookName: text("book_name").notNull(),
    chapter: integer("chapter").notNull(),
    verse: integer("verse").notNull(),
    text: text("text").notNull(),
  },
  (table) => [
    index("bible_verses_book_ch_idx").on(table.bookId, table.chapter),
    index("bible_verses_book_name_ch_idx").on(table.bookName, table.chapter),
  ],
);

export const canonicalProgress = pgTable(
  "canonical_progress",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    bookId: integer("book_id").notNull(),
    chapter: integer("chapter").notNull(),
    completedAt: timestamp("completed_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("canonical_progress_user_book_ch").on(table.userId, table.bookId, table.chapter),
    index("canonical_progress_user_idx").on(table.userId),
  ],
);

export type FamilyMember = typeof familyMembers.$inferSelect;
export type ReadingLogRow = typeof readingLog.$inferSelect;
export type BibleBook = typeof bibleBooks.$inferSelect;
export type BibleVerse = typeof bibleVerses.$inferSelect;
export type CanonicalProgress = typeof canonicalProgress.$inferSelect;
