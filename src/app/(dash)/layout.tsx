import type { ReactNode } from "react";

import { AppShell } from "@/components/app-shell";
import { requireUser } from "@/lib/auth";
import { ensureSeeded } from "@/lib/seed";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  await ensureSeeded().catch(() => undefined);
  const user = await requireUser();

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
