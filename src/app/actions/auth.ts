"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

import { db } from "@/db";
import { users } from "@/db/schema";
import { createSession, destroySession, hashPassword, verifyPassword } from "@/lib/auth";
import { bootstrapNewUser } from "@/lib/bootstrap";
import { DEMO_CREDENTIALS, ensureSeeded } from "@/lib/seed";
import { BAND_IDS, type BandId } from "@/lib/constants";

export type AuthState = { error?: string } | null;

const AVATARS = ["🌿", "🕊️", "🌻", "🔥", "🐢", "🦋", "⚓", "🌙"];

export async function signInAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  await ensureSeeded();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) return { error: "Enter your email and password." };

  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return { error: "That email and password combination doesn't match our records." };
  }

  await createSession(user.id);
  redirect("/dashboard");
}

export async function signUpAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  await ensureSeeded();
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const bandInput = String(formData.get("homeBand") ?? "grown");

  if (name.length < 2) return { error: "Tell us what to call you (at least 2 characters)." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "That email doesn't look quite right." };
  if (password.length < 6) return { error: "Use at least 6 characters for your password." };

  const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  if (existing) return { error: "An account with that email already exists. Try signing in." };

  const homeBand: BandId = BAND_IDS.includes(bandInput as BandId) ? (bandInput as BandId) : "grown";
  const avatar = AVATARS[Math.floor(Math.random() * AVATARS.length)];

  const [created] = await db
    .insert(users)
    .values({
      name,
      email,
      passwordHash: hashPassword(password),
      avatarEmoji: avatar,
      homeBand,
      householdName: "My Household",
    })
    .returning();

  if (!created) return { error: "We couldn't create your account. Please try again." };

  await bootstrapNewUser({ id: created.id, name, homeBand });
  await createSession(created.id);
  redirect("/dashboard");
}

export async function demoSignInAction() {
  await ensureSeeded();
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, DEMO_CREDENTIALS.email))
    .limit(1);

  if (!user) redirect("/login?demo=missing");

  await createSession(user.id);
  redirect("/dashboard");
}

export async function signOutAction() {
  await destroySession();
  redirect("/login");
}
