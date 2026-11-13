import Link from "next/link";
import { Icon, LumenMark } from "@/components/icons";
import {
  InteractiveMoodDemo,
  LiveReaderHero,
  WonderWallShowcase,
} from "@/components/landing-interactive";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Lumen — The Bible App for All Ages",
  description:
    "Scripture retold for four ages at once: Little Lambs (3–7), Explorers (8–12), Youth (13–17), and Grown-ups (18+). Featuring Faithprint mood matching, the Wonder Wall, and Verse Forge.",
};

const WORLD_FIRSTS = [
  {
    icon: "compass" as const,
    badge: "World-First",
    title: "Faithprint Matching",
    description:
      "Arrive with how you actually feel — anxious, weary, grateful, or stretched thin. Faithprint pairs your emotional state with an age-adapted passage and one clear, tangible next step.",
    href: "/faithprint",
    action: "Try Faithprint",
  },
  {
    icon: "sparkles" as const,
    badge: "World-First",
    title: "The Wonder Wall",
    description:
      "Every reading ends in a wonder prompt. Kids pin real questions with their age, and adults write back with warmth. No curious question gets dismissed as silly.",
    href: "/wonders",
    action: "See Wonder Wall",
  },
  {
    icon: "brain" as const,
    badge: "World-First",
    title: "Verse Forge Trainer",
    description:
      "Cloze-deletion memory training. Choose any saved verse and watch it cloak words across four stages: Read → Cloak → Half → Recite. Builds recall that outlasts a highlight.",
    href: "/trainer",
    action: "Launch Forge",
  },
  {
    icon: "book" as const,
    badge: "Core Reader",
    title: "One Passage, Four Hearts",
    description:
      "Every single scripture in the library is retold across four distinct developmental bands (3–7, 8–12, 13–17, 18+). Switch bands mid-thought without losing your place.",
    href: "/read",
    action: "Open The Reader",
  },
  {
    icon: "users" as const,
    badge: "Household",
    title: "Family Circle & Streaks",
    description:
      "One household account connects parents, teens, children, and grandparents. Track combined reading habits, hand out read-aloud assignments, and cheer each other's streaks.",
    href: "/family",
    action: "View Family Circle",
  },
  {
    icon: "hands" as const,
    badge: "Memorials",
    title: "Prayer & Answer Wall",
    description:
      "Pin household prayer requests, tap 'I prayed with you' to stand together, and stamp answered prayers with notes. Your future self will want the receipts of God's faithfulness.",
    href: "/prayer",
    action: "Visit Prayer Wall",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-dvh overflow-x-hidden bg-parchment text-ink selection:bg-gold-soft selection:text-ink">
      {/* Ambient background glow */}
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(65%_45%_at_15%_0%,#fbf7ee_0%,transparent_60%),radial-gradient(45%_40%_at_90%_15%,#eef3ec_0%,transparent_65%)]" />

      {/* Frosted Sticky Navigation Bar */}
      <header className="sticky top-0 z-40 border-b border-line/70 bg-parchment/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <LumenMark className="h-9 w-9 shadow-sm" />
            <div className="flex flex-col">
              <span className="font-display text-xl leading-none tracking-tight">
                Lumen
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-gold">
                Bible for All Ages
              </span>
            </div>
          </Link>

          <nav className="hidden items-center gap-6 text-sm text-ink-soft md:flex">
            <a href="#live-reader" className="transition hover:text-ink font-medium">
              Live Reader
            </a>
            <a href="#faithprint" className="transition hover:text-ink font-medium">
              Faithprint
            </a>
            <a href="#features" className="transition hover:text-ink font-medium">
              World-Firsts
            </a>
            <a href="#wonder-wall" className="transition hover:text-ink font-medium">
              Wonder Wall
            </a>
            <Link
              href="/read"
              className="text-pine font-semibold transition hover:text-pine-deep flex items-center gap-1"
            >
              The Library
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/dashboard?option=a"
              className="hidden sm:inline-flex rounded-xl px-3 py-2 text-xs font-semibold text-ink-soft transition hover:bg-parchment-deep/70 hover:text-ink"
            >
              Option A Hub
            </Link>
            <Link
              href="/dashboard?option=b"
              className="inline-flex items-center gap-1.5 rounded-xl bg-pine px-4 py-2.5 text-xs font-bold text-cream shadow-sm transition hover:bg-pine-deep hover:shadow-md"
            >
              <span>Option B Dashboard</span>
              <span className="rounded-full bg-gold-soft px-1.5 py-0.2 text-[9px] font-bold text-amber-900">
                Study
              </span>
              <Icon name="arrowRight" className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="mx-auto max-w-6xl px-5 pt-10 pb-16 sm:px-8 sm:pt-14 sm:pb-20">
        <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.1fr]">
          <div className="animate-rise">
            <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold-soft/60 px-3.5 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-amber-900 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-gold animate-pulse" />
              World&rsquo;s First All-Ages Scripture Engine
            </div>

            <h1 className="mt-5 font-display text-[40px] leading-[1.08] tracking-tight text-ink sm:text-[54px] lg:text-[58px]">
              The Bible app the whole household can actually read{" "}
              <span className="relative inline-block text-pine">
                together
                <svg
                  className="absolute -bottom-2 left-0 w-full text-gold/70"
                  viewBox="0 0 200 12"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M3 8.5C50 2.5 110 2 197 7"
                    stroke="currentColor"
                    strokeWidth="3.2"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              .
            </h1>

            <p className="mt-6 text-[16px] leading-relaxed text-ink-soft sm:text-[17px]">
              One passage retold for four developmental ages at once. Switch bands
              mid-sentence, match your emotional state with{" "}
              <strong className="text-ink">Faithprint</strong>, pin kids&rsquo; real
              questions to the <strong className="text-ink">Wonder Wall</strong>, and
              build memory verses in the <strong className="text-ink">Verse Forge</strong>.
            </p>

            {/* CTAs */}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/dashboard?option=b"
                className="inline-flex items-center gap-2 rounded-2xl bg-pine px-6 py-3.5 text-sm font-bold text-cream shadow-lift transition hover:bg-pine-deep hover:scale-[1.02]"
              >
                <span>Explore Option B Dashboard</span>
                <span className="rounded-full bg-gold-soft px-2 py-0.5 text-[10px] font-bold text-amber-900">
                  All 66 Books
                </span>
                <Icon name="arrowRight" className="h-4 w-4" />
              </Link>
              <Link
                href="/dashboard?option=a"
                className="inline-flex items-center gap-2 rounded-2xl border border-line bg-cream px-5 py-3.5 text-sm font-semibold text-ink shadow-sm transition hover:border-pine/40 hover:bg-parchment"
              >
                <Icon name="dashboard" className="h-4 w-4 text-pine" />
                <span>Option A: Household Hub</span>
              </Link>
              <Link
                href="/read?canon=true"
                className="inline-flex items-center gap-1.5 rounded-2xl border border-gold/40 bg-gold-soft/40 px-4 py-3.5 text-sm font-semibold text-amber-900 transition hover:bg-gold-soft/70"
              >
                <Icon name="book" className="h-4 w-4 text-gold" />
                <span>Entire Bible (31,102 Verses)</span>
              </Link>
            </div>

            {/* Demo household preview pill */}
            <div className="mt-8 flex items-center gap-3 rounded-2xl border border-line/80 bg-cream/70 p-3 shadow-card max-w-md">
              <div className="flex -space-x-2">
                {["🌿", "🎧", "🦋", "🐢", "🫖"].map((emoji) => (
                  <span
                    key={emoji}
                    className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-cream bg-parchment text-sm shadow-sm"
                  >
                    {emoji}
                  </span>
                ))}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-ink">
                  Seeded with The Okafor Family (12-day streak)
                </p>
                <p className="text-[11px] text-ink-muted">
                  5 members reading across Little Lambs, Explorers, Youth &amp; Grown-ups
                </p>
              </div>
              <Link
                href="/dashboard"
                className="rounded-xl bg-parchment px-2.5 py-1.5 text-[11px] font-bold text-pine transition hover:bg-pine hover:text-cream shrink-0"
              >
                Explore →
              </Link>
            </div>
          </div>

          {/* Interactive Live Hero Card */}
          <div id="live-reader" className="animate-rise [animation-delay:120ms]">
            <LiveReaderHero />
          </div>
        </div>
      </section>

      {/* Faithprint Section */}
      <section id="faithprint" className="border-y border-line bg-cream/60 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <InteractiveMoodDemo />
        </div>
      </section>

      {/* World-First Features Grid */}
      <section id="features" className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
        <div className="max-w-2xl">
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-gold">
            A First In Digital Scripture
          </span>
          <h2 className="mt-2 font-display text-3xl leading-tight text-ink sm:text-4xl">
            Features built because real households asked for them.
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-ink-muted sm:text-base">
            Lumen was created for the chaotic breakfast table, the 3am anxiety prayer,
            the curious eight-year-old in the backseat, and the teenager with hard questions.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {WORLD_FIRSTS.map((f) => (
            <article
              key={f.title}
              className="card-surface group flex flex-col justify-between p-6 transition-all hover:-translate-y-1 hover:border-pine/30 hover:shadow-lift"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-pine/10 text-pine transition group-hover:bg-pine group-hover:text-cream">
                    <Icon name={f.icon} className="h-5 w-5" />
                  </span>
                  <span className="rounded-full bg-parchment px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-ink-muted">
                    {f.badge}
                  </span>
                </div>
                <h3 className="mt-5 font-display text-xl text-ink font-semibold">
                  {f.title}
                </h3>
                <p className="mt-2 text-[13px] leading-relaxed text-ink-muted">
                  {f.description}
                </p>
              </div>

              <div className="mt-6 border-t border-line/70 pt-4">
                <Link
                  href={f.href}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-pine transition group-hover:translate-x-0.5 hover:text-pine-deep"
                >
                  <span>{f.action}</span>
                  <Icon name="arrowRight" className="h-3.5 w-3.5" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Wonder Wall Spotlight */}
      <section
        id="wonder-wall"
        className="border-y border-line bg-gradient-to-b from-cream to-parchment py-16 sm:py-24"
      >
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-gold">
                The Wonder Wall · Real Curiosity
              </span>
              <h2 className="mt-2 font-display text-3xl text-ink sm:text-4xl">
                &ldquo;Nothing curious gets dismissed.&rdquo;
              </h2>
              <p className="mt-2 max-w-xl text-sm text-ink-muted">
                Every passage ends in a wonder prompt. Kids pin questions; adults write back.
                Here are actual wonders pinned by the Okafor children:
              </p>
            </div>
            <Link
              href="/wonders"
              className="inline-flex items-center gap-2 rounded-xl bg-pine px-4 py-2.5 text-xs font-bold text-cream shadow-sm transition hover:bg-pine-deep"
            >
              <span>Explore Wonder Wall in App</span>
              <Icon name="arrowRight" className="h-3.5 w-3.5" />
            </Link>
          </div>

          <WonderWallShowcase />
        </div>
      </section>

      {/* Verse Forge Teaser Section */}
      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
        <div className="relative overflow-hidden rounded-3xl border border-line bg-cream p-8 shadow-card sm:p-12">
          <div className="grid items-center gap-8 lg:grid-cols-[1.2fr_1fr]">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-violet-800">
                <Icon name="brain" className="h-3.5 w-3.5" />
                Verse Forge · Memory Method
              </span>
              <h2 className="mt-4 font-display text-3xl text-ink sm:text-4xl">
                Hide the words. Keep the meaning.
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-ink-muted sm:text-base">
                Memorizing scripture shouldn&rsquo;t feel like cramming for an exam. Verse Forge
                takes the verses on your personal shelves and cloaks them word by word.
                Fill in the missing words across four stages: Read, Cloak, Half, and Recite.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {["Stage 1: Read Twice", "Stage 2: Cloak Keywords", "Stage 3: 50% Cloaked", "Stage 4: Recite & Grade"].map((step, idx) => (
                  <span
                    key={step}
                    className="rounded-xl border border-line bg-parchment/60 px-3 py-1.5 text-xs font-semibold text-ink-soft"
                  >
                    {step}
                  </span>
                ))}
              </div>
              <div className="mt-8 flex gap-3">
                <Link
                  href="/trainer"
                  className="inline-flex items-center gap-2 rounded-xl bg-pine px-5 py-3 text-sm font-bold text-cream shadow-sm transition hover:bg-pine-deep"
                >
                  <span>Open Verse Forge</span>
                  <Icon name="arrowRight" className="h-4 w-4" />
                </Link>
                <Link
                  href="/collections"
                  className="inline-flex items-center gap-2 rounded-xl border border-line bg-cream px-4 py-3 text-sm font-semibold text-ink transition hover:border-pine/40"
                >
                  <span>View Verse Shelves</span>
                </Link>
              </div>
            </div>

            {/* Visual Cloze Demonstration Card */}
            <div className="rounded-2xl border border-line/80 bg-parchment/50 p-6 font-display text-lg leading-[2.2] text-ink shadow-inner">
              <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-gold block mb-2 font-sans">
                Sample Cloze Deck · Philippians 4:6
              </span>
              <span>Do not be </span>
              <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-emerald-900 border-b-2 border-emerald-500 font-bold">
                anxious
              </span>
              <span> about </span>
              <span className="rounded border-b-2 border-pine/40 bg-cream px-2 py-0.5 text-pine italic">
                anything
              </span>
              <span>, but in </span>
              <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-emerald-900 border-b-2 border-emerald-500 font-bold">
                every
              </span>
              <span> situation, by </span>
              <span className="rounded border-b-2 border-pine/40 bg-cream px-2 py-0.5 text-pine italic">
                prayer
              </span>
              <span> and petition, with thanksgiving, present your requests to </span>
              <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-emerald-900 border-b-2 border-emerald-500 font-bold">
                God
              </span>
              <span>.</span>
            </div>
          </div>
        </div>
      </section>

      {/* Enter App Callout Section */}
      <section className="mx-auto max-w-6xl px-5 pb-20 sm:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-pine-deep px-6 py-12 text-cream sm:px-12 sm:py-16 shadow-lift">
          <div className="pointer-events-none absolute inset-0 opacity-40">
            <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-emerald-400/20 blur-3xl" />
            <div className="absolute -bottom-24 left-10 h-72 w-72 rounded-full bg-amber-300/20 blur-3xl" />
            <div className="grain absolute inset-0 opacity-20" />
          </div>

          <div className="relative grid items-center gap-8 lg:grid-cols-[1.3fr_1fr]">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-gold-soft">
                Ready to Read?
              </span>
              <h2 className="mt-2 font-display text-3xl sm:text-4xl text-cream font-medium">
                Step into the live household dashboard.
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-cream/80 max-w-xl">
                The seeded demo household is open and ready. Explore the 28-day reading
                rhythm heatmap, active 7-day courage plan, recent journal entries, open
                wonders, and family circle streaks.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 rounded-xl bg-cream px-6 py-3.5 text-sm font-bold text-pine-deep shadow-lift transition hover:bg-white hover:scale-[1.02]"
                >
                  <span>Open Household Dashboard</span>
                  <Icon name="arrowRight" className="h-4 w-4" />
                </Link>
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 rounded-xl border border-cream/30 px-5 py-3.5 text-sm font-semibold text-cream transition hover:bg-cream/10"
                >
                  <span>Create Your Own Household</span>
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Active Passages", val: "12 Scripture Stories" },
                { label: "Developmental Bands", val: "4 Reading Levels" },
                { label: "Combined Streak", val: "12 Days Running" },
                { label: "Household Circle", val: "5 Family Members" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-cream/15 bg-cream/[0.08] p-4 backdrop-blur-sm"
                >
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gold-soft">
                    {stat.label}
                  </p>
                  <p className="mt-1 font-display text-base text-cream font-medium">
                    {stat.val}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-line bg-cream/70 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-5 text-xs text-ink-muted sm:flex-row sm:px-8">
          <div className="flex items-center gap-2.5">
            <LumenMark className="h-7 w-7" />
            <span className="font-display text-base font-semibold text-ink">
              Lumen
            </span>
            <span className="hidden sm:inline">· Scripture for every age</span>
          </div>

          <div className="flex flex-wrap items-center gap-5 text-xs font-medium">
            <Link href="/dashboard" className="hover:text-ink">
              Dashboard
            </Link>
            <Link href="/read" className="hover:text-ink">
              Reader
            </Link>
            <Link href="/faithprint" className="hover:text-ink">
              Faithprint
            </Link>
            <Link href="/wonders" className="hover:text-ink">
              Wonder Wall
            </Link>
            <Link href="/trainer" className="hover:text-ink">
              Verse Forge
            </Link>
            <Link href="/login" className="hover:text-ink">
              Sign In
            </Link>
          </div>

          <p className="text-center sm:text-right">
            Built for ages 3 to 93. Every passage is an original Lumen retelling.
          </p>
        </div>
      </footer>
    </div>
  );
}
