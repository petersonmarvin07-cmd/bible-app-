import type { ReactNode } from "react";
import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { LumenMark, Icon } from "@/components/icons";
import { getCurrentUser } from "@/lib/auth";
import { ensureSeeded } from "@/lib/seed";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  await ensureSeeded().catch(() => undefined);
  const user = await getCurrentUser();

  if (!user) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-parchment px-5 py-12 text-ink">
        <div className="card-surface w-full max-w-md p-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center">
            <LumenMark className="h-11 w-11 shadow-sm" />
          </div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold">
            Session Required
          </p>
          <h1 className="mt-2 font-display text-2xl text-ink">
            Sign in to open your household
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-ink-muted">
            Your session expired or hasn&rsquo;t started yet. Sign in or step into the seeded Okafor Family demo.
          </p>
          <div className="mt-6 flex flex-col gap-2.5">
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-pine px-5 py-3 text-sm font-semibold text-cream shadow-sm transition hover:bg-pine-deep"
            >
              <span>Continue to Sign In</span>
              <Icon name="arrowRight" className="h-4 w-4" />
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-xl border border-line bg-cream px-5 py-2.5 text-xs font-semibold text-ink-soft transition hover:text-ink"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <AppShell
      user={{
        name: user.name,
        email: user.email,
        avatarEmoji: user.avatarEmoji,
        householdName: user.householdName,
        streakCount: user.streakCount,
      }}
    >
      {children}
    </AppShell>
  );
}
