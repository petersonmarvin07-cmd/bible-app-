import Link from "next/link";

import { BackButton } from "@/components/back-button";
import { Icon, LumenMark } from "@/components/icons";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-parchment px-6 text-center">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(50%_40%_at_50%_0%,#fbf7ee_0%,transparent_70%)]" />
      <LumenMark className="h-12 w-12" />
      <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.2em] text-gold">
        Psalm 119:105
      </p>
      <h1 className="mt-2 max-w-md font-display text-3xl leading-tight text-ink">
        This path doesn&rsquo;t have a lamp on it yet.
      </h1>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-ink-muted">
        The page you were looking for isn&rsquo;t here. Your readings, shelves and journals are safe.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
        <BackButton fallbackHref="/dashboard" label="Go Back" className="px-4 py-2.5 text-sm" />
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 rounded-xl bg-pine px-4 py-2.5 text-sm font-semibold text-cream transition hover:bg-pine-deep"
        >
          Back to Dashboard
          <Icon name="arrowRight" className="h-4 w-4" />
        </Link>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl border border-line bg-cream px-4 py-2.5 text-sm font-semibold text-ink transition hover:border-pine/40"
        >
          Visit Homepage
        </Link>
      </div>
    </main>
  );
}
