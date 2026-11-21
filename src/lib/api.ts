import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import type { User } from "@/db/schema";

export function json<T>(data: T, init?: number | ResponseInit) {
  return NextResponse.json(data, typeof init === "number" ? { status: init } : init);
}

export function error(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function withUser(
  handler: (user: User) => Promise<NextResponse>,
): Promise<NextResponse> {
  let user: User | null = null;
  try {
    user = await getCurrentUser();
  } catch {
    return error("Could not verify your session.", 500);
  }
  if (!user) return error("You need to sign in first.", 401);
  try {
    return await handler(user);
  } catch (cause) {
    console.error("API failure", cause);
    return error("Something went wrong. Please try again.", 500);
  }
}

export function str(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value.trim() : fallback;
}

export function bool(value: unknown): boolean | undefined {
  if (typeof value === "boolean") return value;
  if (value === "true") return true;
  if (value === "false") return false;
  return undefined;
}

export function num(value: unknown): number | undefined {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : undefined;
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return undefined;
    const parsed = Number(trimmed);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

export function oneOf<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  return allowed.includes(value as T) ? (value as T) : fallback;
}
