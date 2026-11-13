"use client";

import Link from "next/link";
import { useEffect } from "react";
import { BackButton } from "@/components/back-button";
import { Icon, LumenMark } from "@/components/icons";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Lumen caught error:", error);
  }, [error]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-parchment px-6 py-12 text-center text-ink">
      <LumenMark className="h-12 w-12" />
      <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.2em] text-gold">
        A moment of pause
      </p>
      <h1 className="mt-2 font-display text-2xl text-ink sm:text-3xl">
        Something quieted this page
      </h1>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-ink-muted">
        We encountered a momentary hiccup. You can reload this view or head directly into the dashboard.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <BackButton fallbackHref="/dashboard" label="Go Back" className="px-4 py-2.5 text-xs" />
        <button
          type="button"
          onClick={() => reset()}
          className="inline-flex items-center gap-2 rounded-xl bg-pine px-4 py-2.5 text-xs font-semibold text-cream shadow-sm transition hover:bg-pine-deep"
        >
          <Icon name="sun" className="h-4 w-4" />
          Try reloading
        </button>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 rounded-xl border border-line bg-cream px-4 py-2.5 text-xs font-semibold text-ink transition hover:border-pine/40"
        >
          Go to Dashboard
          <Icon name="arrowRight" className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
