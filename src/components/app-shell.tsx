"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

import { signOutAction } from "@/app/actions/auth";
import { BackButton } from "@/components/back-button";
import { Icon, LumenMark, type IconName } from "@/components/icons";

type NavItem = { href: string; label: string; icon: IconName; hint?: string };

const groups: { label: string; items: NavItem[] }[] = [
  {
    label: "Dashboards",
    items: [
      { href: "/dashboard?option=a", label: "Household Hub (Option A)", icon: "dashboard" },
      { href: "/dashboard?option=b", label: "Bible Study (Option B)", icon: "book", hint: "Option B" },
      { href: "/", label: "Home Showcase", icon: "sun" },
    ],
  },
  {
    label: "Scripture & Study",
    items: [
      { href: "/read", label: "Complete Bible Reader", icon: "book" },
      { href: "/faithprint", label: "Faithprint Matching", icon: "compass", hint: "world-first" },
      { href: "/trainer", label: "Verse Forge Trainer", icon: "brain", hint: "forge" },
    ],
  },
  {
    label: "Grow",
    items: [
      { href: "/journal", label: "Journal", icon: "feather" },
      { href: "/collections", label: "Verse Shelf", icon: "bookmark" },
      { href: "/plans", label: "Reading Plans", icon: "route" },
      { href: "/trainer", label: "Verse Forge", icon: "brain", hint: "trainer" },
    ],
  },
  {
    label: "Household",
    items: [
      { href: "/prayer", label: "Prayer Wall", icon: "hands" },
      { href: "/wonders", label: "Wonder Wall", icon: "sparkles" },
      { href: "/family", label: "Family Circle", icon: "users" },
    ],
  },
];

export type ShellUser = {
  name: string;
  email: string;
  avatarEmoji: string;
  householdName: string;
  streakCount: number;
};

export function AppShell({ user, children }: { user: ShellUser; children: ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const nav = (
    <div className="flex h-full flex-col">
      <div className="px-5 pb-5 pt-6">
        <Link href="/dashboard" className="flex items-center gap-2.5 text-cream">
          <LumenMark className="h-9 w-9" />
          <span className="font-display text-xl tracking-tight">Lumen</span>
        </Link>
        <div className="mt-5 rounded-2xl border border-cream/10 bg-cream/[0.06] p-3.5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gold-soft/80">
            Household
          </p>
          <p className="mt-1 truncate font-display text-[15px] text-cream">{user.householdName}</p>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-cream/60">
            <Icon name="flame" className="h-3.5 w-3.5 text-amber-300" filled />
            {user.streakCount}-day streak
            <span className="mx-1 h-1 w-1 rounded-full bg-cream/30" />
            ages 3–93
          </div>
        </div>
      </div>

      <nav className="scroll-fade flex-1 space-y-5 overflow-y-auto px-3 pb-4">
        {groups.map((group) => (
          <div key={group.label}>
            <p className="mb-1.5 px-2.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-cream/35">
              {group.label}
            </p>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const basePath = item.href.split("?")[0];
                const active =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname === basePath;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`group flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-[13px] font-medium transition ${
                        active
                          ? "bg-cream text-pine-deep shadow-sm"
                          : "text-cream/70 hover:bg-cream/10 hover:text-cream"
                      }`}
                    >
                      <Icon name={item.icon} className="h-4 w-4 shrink-0" />
                      <span className="flex-1">{item.label}</span>
                      {item.hint ? (
                        <span
                          className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                            active ? "bg-gold-soft text-amber-900" : "bg-gold/25 text-gold-soft"
                          }`}
                        >
                          {item.hint}
                        </span>
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-cream/10 p-3">
        <div className="flex items-center gap-2.5 rounded-xl px-1.5 py-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-cream/10 text-base">
            {user.avatarEmoji}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-medium text-cream">{user.name}</p>
            <p className="truncate text-[11px] text-cream/45">{user.email}</p>
          </div>
          <form action={signOutAction}>
            <button
              type="submit"
              title="Sign out"
              className="rounded-lg p-1.5 text-cream/50 transition hover:bg-cream/10 hover:text-cream"
            >
              <Icon name="logout" className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-dvh bg-parchment">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[264px] bg-pine-deep lg:block">{nav}</aside>

      <div className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-line bg-parchment/90 px-4 backdrop-blur lg:hidden">
        <div className="flex items-center gap-2.5">
          <BackButton fallbackHref={pathname === "/dashboard" ? "/" : "/dashboard"} label="Back" />
          <Link href="/dashboard" className="flex items-center gap-1.5">
            <LumenMark className="h-7 w-7" />
            <span className="font-display text-base">Lumen</span>
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full border border-line bg-cream px-2.5 py-1 text-[11px] font-medium text-ink-soft">
            <Icon name="flame" className="h-3 w-3 text-clay" filled /> {user.streakCount}
          </span>
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open navigation"
            className="rounded-xl border border-line bg-cream p-2 text-ink-soft"
          >
            <Icon name="menu" className="h-5 w-5" />
          </button>
        </div>
      </div>

      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-ink/50 backdrop-blur-sm"
          />
          <div className="animate-rise absolute inset-y-0 left-0 w-[280px] bg-pine-deep shadow-lift">
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close navigation"
              className="absolute right-3 top-4 rounded-lg p-1.5 text-cream/60 hover:bg-cream/10 hover:text-cream"
            >
              <Icon name="close" className="h-4 w-4" />
            </button>
            {nav}
          </div>
        </div>
      ) : null}

      <div className="lg:pl-[264px]">
        {/* Universal Top Navigation Header with Back button and breadcrumbs for Desktop */}
        <header className="sticky top-0 z-20 hidden lg:flex h-14 items-center justify-between border-b border-line/70 bg-parchment/85 px-8 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <BackButton fallbackHref={pathname === "/dashboard" ? "/" : "/dashboard"} label="Back" />
            <div className="flex items-center gap-1.5 text-xs text-ink-muted">
              <Link href="/" className="hover:text-ink transition">
                Home
              </Link>
              <span>/</span>
              <Link href="/dashboard" className="hover:text-ink transition">
                Dashboard
              </Link>
              {pathname !== "/dashboard" ? (
                <>
                  <span>/</span>
                  <span className="font-semibold text-ink capitalize">
                    {pathname.replace("/", "").replace(/-/g, " ")}
                  </span>
                </>
              ) : null}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1 text-xs text-ink-muted hover:text-ink transition font-medium"
            >
              <Icon name="sun" className="h-3 w-3 text-gold" />
              <span>Overview</span>
            </Link>
            <span className="text-line">|</span>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-clay">
              <Icon name="flame" className="h-3 w-3" filled />
              <span>{user.streakCount}d streak</span>
            </span>
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl px-4 pb-16 pt-5 sm:px-6 lg:px-8 lg:pt-8">{children}</main>
      </div>
    </div>
  );
}
