import "server-only";

import { randomBytes, randomUUID, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { and, eq, gt } from "drizzle-orm";

import { db } from "@/db";
import { sessions, users, type User } from "@/db/schema";

export const SESSION_COOKIE = "lumen_session";
const SESSION_DAYS = 30;

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derived = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derived}`;
}

export function verifyPassword(password: string, stored: string) {
  const [salt, digest] = stored.split(":");
  if (!salt || !digest) return false;
  const derived = scryptSync(password, salt, 64);
  const expected = Buffer.from(digest, "hex");
  if (expected.length !== derived.length) return false;
  return timingSafeEqual(derived, expected);
}

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("hex") + randomUUID();
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 86_400_000);
  await db.insert(sessions).values({ token, userId, expiresAt });
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
  });
  return token;
}

export async function destroySession() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) {
    await db.delete(sessions).where(eq(sessions.token, token)).catch(() => undefined);
  }
  store.delete(SESSION_COOKIE);
}

export async function getSessionUser(): Promise<User | null> {
  try {
    const store = await cookies().catch(() => null);
    const token = store?.get(SESSION_COOKIE)?.value;

    if (!token) return null;

    const [row] = await db
      .select({ user: users })
      .from(sessions)
      .innerJoin(users, eq(users.id, sessions.userId))
      .where(and(eq(sessions.token, token), gt(sessions.expiresAt, new Date())))
      .limit(1);

    return row?.user ?? null;
  } catch (error) {
    console.error("getSessionUser failed", error);
    return null;
  }
}

export async function getCurrentUser(): Promise<User | null> {
  const sessionUser = await getSessionUser();
  if (sessionUser) return sessionUser;

  const isDemoAllowed =
    process.env.NODE_ENV !== "production" &&
    process.env.ENABLE_DEMO_AUTH === "true";

  if (!isDemoAllowed) return null;

  try {
    const demoEmail = process.env.DEMO_EMAIL ?? "grace@lumen.app";
    const [demo] = await db
      .select()
      .from(users)
      .where(eq(users.email, demoEmail))
      .limit(1);

    if (demo) return demo;

    const [first] = await db.select().from(users).limit(1);
    return first ?? null;
  } catch (error) {
    console.error("getCurrentUser fallback failed", error);
    return null;
  }
}

export async function requireUser(): Promise<User> {
  let user = await getCurrentUser();

  if (!user) {
    try {
      const { ensureSeeded } = await import("@/lib/seed");
      await ensureSeeded();
    } catch (error) {
      console.error("ensureSeeded failed", error);
    }

    user = await getCurrentUser();
  }

  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function requireApiUser(): Promise<User> {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  return user;
}
