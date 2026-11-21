import fs from "node:fs";
import path from "node:path";

import { PGlite } from "@electric-sql/pglite";
import { drizzle as drizzleNodePg, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { drizzle as drizzlePglite } from "drizzle-orm/pglite";
import { Pool } from "pg";

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS "bible_books" (
  "id" integer PRIMARY KEY NOT NULL,
  "osis" text NOT NULL,
  "name" text NOT NULL,
  "testament" text NOT NULL,
  "division" text NOT NULL,
  "chapter_count" integer NOT NULL,
  "verse_count" integer NOT NULL,
  "summary" text DEFAULT '' NOT NULL,
  "theme" text DEFAULT '' NOT NULL
);

CREATE TABLE IF NOT EXISTS "bible_verses" (
  "id" integer PRIMARY KEY NOT NULL,
  "book_id" integer NOT NULL REFERENCES "bible_books"("id") ON DELETE CASCADE,
  "book_name" text NOT NULL,
  "chapter" integer NOT NULL,
  "verse" integer NOT NULL,
  "text" text NOT NULL
);

CREATE TABLE IF NOT EXISTS "users" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "email" text NOT NULL,
  "name" text NOT NULL,
  "password_hash" text NOT NULL,
  "household_name" text DEFAULT 'My Household' NOT NULL,
  "avatar_emoji" text DEFAULT '🌿' NOT NULL,
  "home_band" text DEFAULT 'grown' NOT NULL,
  "streak_count" integer DEFAULT 0 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "sessions" (
  "token" text PRIMARY KEY NOT NULL,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "expires_at" timestamp with time zone NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "passages" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "slug" text NOT NULL,
  "reference" text NOT NULL,
  "book" text NOT NULL,
  "chapter" integer NOT NULL,
  "verse_start" integer NOT NULL,
  "verse_end" integer NOT NULL,
  "theme" text NOT NULL,
  "testament" text DEFAULT 'Old' NOT NULL,
  "reflection_prompt" text DEFAULT '' NOT NULL,
  "sort_order" integer DEFAULT 0 NOT NULL
);

CREATE TABLE IF NOT EXISTS "passage_versions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "passage_id" uuid NOT NULL REFERENCES "passages"("id") ON DELETE CASCADE,
  "band" text NOT NULL,
  "title" text NOT NULL,
  "body" text NOT NULL,
  "takeaway" text NOT NULL,
  "wonder_question" text NOT NULL
);

CREATE TABLE IF NOT EXISTS "journal_entries" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "title" text NOT NULL,
  "body" text NOT NULL,
  "mood" text DEFAULT 'peaceful' NOT NULL,
  "passage_id" uuid REFERENCES "passages"("id") ON DELETE SET NULL,
  "sharing" text DEFAULT 'private' NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "collections" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "name" text NOT NULL,
  "description" text DEFAULT '' NOT NULL,
  "emoji" text DEFAULT '📖' NOT NULL,
  "accent" text DEFAULT 'sage' NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "saved_verses" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "collection_id" uuid NOT NULL REFERENCES "collections"("id") ON DELETE CASCADE,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "reference" text NOT NULL,
  "text" text NOT NULL,
  "note" text DEFAULT '' NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "reading_plans" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "title" text NOT NULL,
  "description" text DEFAULT '' NOT NULL,
  "band" text DEFAULT 'family' NOT NULL,
  "is_active" boolean DEFAULT true NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "plan_days" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "plan_id" uuid NOT NULL REFERENCES "reading_plans"("id") ON DELETE CASCADE,
  "day_number" integer NOT NULL,
  "title" text NOT NULL,
  "passage_id" uuid REFERENCES "passages"("id") ON DELETE SET NULL,
  "completed" boolean DEFAULT false NOT NULL,
  "completed_at" timestamp with time zone
);

CREATE TABLE IF NOT EXISTS "prayers" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "author_name" text NOT NULL,
  "body" text NOT NULL,
  "category" text DEFAULT 'everyday' NOT NULL,
  "is_answered" boolean DEFAULT false NOT NULL,
  "answered_note" text DEFAULT '' NOT NULL,
  "prayed_count" integer DEFAULT 0 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "wonders" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "asked_by" text NOT NULL,
  "asked_age" integer DEFAULT 8 NOT NULL,
  "question" text NOT NULL,
  "answer" text DEFAULT '' NOT NULL,
  "answered_by" text DEFAULT '' NOT NULL,
  "status" text DEFAULT 'open' NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "family_members" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "name" text NOT NULL,
  "band" text DEFAULT 'explorer' NOT NULL,
  "emoji" text DEFAULT '🌱' NOT NULL,
  "role" text DEFAULT 'member' NOT NULL,
  "streak" integer DEFAULT 0 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "reading_log" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "passage_id" uuid REFERENCES "passages"("id") ON DELETE SET NULL,
  "band" text DEFAULT 'grown' NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "canonical_progress" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "book_id" integer NOT NULL,
  "chapter" integer NOT NULL,
  "completed_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "bible_books_osis_key" ON "bible_books" ("osis");
CREATE UNIQUE INDEX IF NOT EXISTS "bible_books_name_key" ON "bible_books" ("name");
CREATE INDEX IF NOT EXISTS "bible_verses_book_ch_idx" ON "bible_verses" ("book_id", "chapter");
CREATE INDEX IF NOT EXISTS "bible_verses_book_name_ch_idx" ON "bible_verses" ("book_name", "chapter");
CREATE UNIQUE INDEX IF NOT EXISTS "canonical_progress_user_book_ch" ON "canonical_progress" ("user_id", "book_id", "chapter");
CREATE INDEX IF NOT EXISTS "canonical_progress_user_idx" ON "canonical_progress" ("user_id");
CREATE INDEX IF NOT EXISTS "collections_user_idx" ON "collections" ("user_id");
CREATE INDEX IF NOT EXISTS "family_members_user_idx" ON "family_members" ("user_id");
CREATE INDEX IF NOT EXISTS "journal_user_idx" ON "journal_entries" ("user_id");
CREATE UNIQUE INDEX IF NOT EXISTS "passage_versions_unique" ON "passage_versions" ("passage_id", "band");
CREATE UNIQUE INDEX IF NOT EXISTS "passages_slug_key" ON "passages" ("slug");
CREATE INDEX IF NOT EXISTS "plan_days_plan_idx" ON "plan_days" ("plan_id");
CREATE INDEX IF NOT EXISTS "prayers_user_idx" ON "prayers" ("user_id");
CREATE INDEX IF NOT EXISTS "reading_log_user_idx" ON "reading_log" ("user_id");
CREATE INDEX IF NOT EXISTS "reading_plans_user_idx" ON "reading_plans" ("user_id");
CREATE INDEX IF NOT EXISTS "saved_verses_collection_idx" ON "saved_verses" ("collection_id");
CREATE INDEX IF NOT EXISTS "sessions_user_idx" ON "sessions" ("user_id");
CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key" ON "users" ("email");
CREATE INDEX IF NOT EXISTS "wonders_user_idx" ON "wonders" ("user_id");
`;

type DbGlobal = typeof globalThis & {
  __arenaNextJsPostgresqlPool?: Pool;
  __arenaNextJsPglite?: PGlite;
  __arenaNextJsDbPromise?: Promise<NodePgDatabase>;
};

const globalForDb = globalThis as DbGlobal;

async function createPgliteDb(): Promise<NodePgDatabase> {
  if (!globalForDb.__arenaNextJsPglite) {
    const dataDir = path.join(process.cwd(), ".pglite");
    fs.mkdirSync(dataDir, { recursive: true });
    const pglite = new PGlite(dataDir);
    await pglite.waitReady;
    await pglite.exec(SCHEMA_SQL);
    globalForDb.__arenaNextJsPglite = pglite;
  }
  return drizzlePglite(globalForDb.__arenaNextJsPglite) as unknown as NodePgDatabase;
}

async function resolveDb(): Promise<NodePgDatabase> {
  const databaseUrl = process.env.DATABASE_URL;

  if (databaseUrl && !databaseUrl.startsWith("pglite://")) {
    try {
      const candidatePool =
        globalForDb.__arenaNextJsPostgresqlPool ??
        new Pool({
          connectionString: databaseUrl,
          connectionTimeoutMillis: 3000,
        });
      const client = await candidatePool.connect();
      try {
        await client.query(SCHEMA_SQL);
      } finally {
        client.release();
      }
      globalForDb.__arenaNextJsPostgresqlPool = candidatePool;
      return drizzleNodePg(candidatePool);
    } catch (err) {
      if (process.env.NODE_ENV === "production") {
        throw err;
      }
      console.warn(
        "PostgreSQL server unreachable; falling back to embedded local PGlite database (.pglite)."
      );
    }
  } else if (
    process.env.NODE_ENV === "production" &&
    !databaseUrl &&
    process.env.ALLOW_EMBEDDED_DB !== "true"
  ) {
    // Allow fallback to embedded PGlite in self-hosted/sandbox environments unless explicitly disallowed
    if (process.env.REQUIRE_EXTERNAL_DB === "true") {
      throw new Error("DATABASE_URL is required in production");
    }
  }

  return createPgliteDb();
}

export function getDbAsync(): Promise<NodePgDatabase> {
  globalForDb.__arenaNextJsDbPromise ??= resolveDb().catch((err) => {
    globalForDb.__arenaNextJsDbPromise = undefined;
    throw err;
  });
  return globalForDb.__arenaNextJsDbPromise;
}

export const pool: Pool = new Proxy({} as Pool, {
  get(_target, prop) {
    if (prop === "connect") {
      return async () => {
        await getDbAsync();
        if (globalForDb.__arenaNextJsPostgresqlPool) {
          return globalForDb.__arenaNextJsPostgresqlPool.connect();
        }
        const pg = globalForDb.__arenaNextJsPglite!;
        return {
          query: async (text: string, values?: unknown[]) => {
            if (/pg_advisory_(un)?lock/i.test(text)) {
              return { rows: [] };
            }
            return pg.query(text, values);
          },
          release: () => undefined,
        };
      };
    }
    const activePool = globalForDb.__arenaNextJsPostgresqlPool;
    if (activePool) {
      const value = Reflect.get(activePool, prop, activePool);
      return typeof value === "function" ? value.bind(activePool) : value;
    }
    return undefined;
  },
});

function createAsyncQueryBuilderProxy(methodName: string, args: unknown[]) {
  const chain: { method: string; args: unknown[] }[] = [];

  const executeChain = async () => {
    const activeDb = await getDbAsync();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let current: any = (activeDb as any)[methodName](...args);
    for (const step of chain) {
      current = current[step.method](...step.args);
    }
    return await current;
  };

  const proxy: unknown = new Proxy(function () {}, {
    get(_target, prop) {
      if (prop === "then") {
        const promise = executeChain();
        return promise.then.bind(promise);
      }
      if (prop === "catch") {
        const promise = executeChain();
        return promise.catch.bind(promise);
      }
      if (prop === "finally") {
        const promise = executeChain();
        return promise.finally.bind(promise);
      }
      return (...stepArgs: unknown[]) => {
        chain.push({ method: String(prop), args: stepArgs });
        return proxy;
      };
    },
  });

  return proxy;
}

export const db: NodePgDatabase = new Proxy({} as NodePgDatabase, {
  get(_target, prop) {
    if (prop === "then" || typeof prop === "symbol") {
      return undefined;
    }
    return (...args: unknown[]) => createAsyncQueryBuilderProxy(String(prop), args);
  },
});
