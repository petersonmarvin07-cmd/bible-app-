import Link from "next/link";

import { BackButton } from "@/components/back-button";
import { Icon, type IconName } from "@/components/icons";
import { TodayReader } from "@/components/today-reader";
import { Badge, EmptyState } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { BAND_IDS, getBand, relativeDay, type BandId } from "@/lib/constants";
import {
  getCanonicalProgressStats,
  getBibleChapterVerses,
  getCollections,
  getDashboardCounts,
  getFamily,
  getJournal,
  getPassagesWithVersions,
  getPlans,
  getPrayers,
  getReadingStats,
  getWonders,
} from "@/lib/queries";
import { DashboardSwitcher } from "@/components/dashboard-switcher";
import { OptionBDashboard } from "@/components/option-b-dashboard";

export const dynamic = "force-dynamic";

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function StatCard({
  icon,
  label,
  value,
  hint,
  tone,
}: {
  icon: IconName;
  label: string;
  value: string;
  hint: string;
  tone: string;
}) {
  return (
    <div className="card-surface flex items-start gap-3 p-4">
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tone}`}>
        <Icon name={icon} className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-muted">{label}</p>
        <p className="mt-0.5 font-display text-xl leading-tight text-ink">{value}</p>
        <p className="mt-0.5 truncate text-[11px] text-ink-muted">{hint}</p>
      </div>
    </div>
  );
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams?: Promise<{ option?: string; mode?: string }>;
}) {
  const resolvedParams = searchParams ? await searchParams : {};
  const user = await requireUser();
  const [
    passages,
    stats,
    plans,
    family,
    journal,
    wonders,
    prayers,
    counts,
    canonicalStats,
    initialVersesData,
    collections,
  ] = await Promise.all([
    getPassagesWithVersions(),
    getReadingStats(user.id),
    getPlans(user.id),
    getFamily(user.id),
    getJournal(user.id),
    getWonders(user.id),
    getPrayers(user.id),
    getDashboardCounts(user.id),
    getCanonicalProgressStats(user.id),
    getBibleChapterVerses(1, 1),
    getCollections(user.id),
  ]);

  const now = new Date();
  const dayIndex = Math.floor(now.getTime() / 86_400_000) % Math.max(passages.length, 1);
  const todaysPassage = passages[dayIndex] ?? passages[0];
  const initialBand: BandId = BAND_IDS.includes(user.homeBand as BandId)
    ? (user.homeBand as BandId)
    : "grown";

  const activePlan = plans.find((plan) => plan.isActive) ?? plans[0];
  const doneDays = activePlan?.days.filter((day) => day.completed).length ?? 0;
  const totalDays = activePlan?.days.length ?? 0;
  const progress = totalDays > 0 ? Math.round((doneDays / totalDays) * 100) : 0;
  const nextDay = activePlan?.days.find((day) => !day.completed);
  const openWonders = wonders.filter((wonder) => wonder.status === "open");
  const answeredPrayers = prayers.filter((prayer) => prayer.isAnswered);
  const maxDay = Math.max(1, ...stats.days.map((day) => day.count));

  const today = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date());

  const initialOpt =
    resolvedParams.option === "b" || resolvedParams.mode === "b" ? "b" : "a";

  const optionAView = (
    <div className="space-y-5">
      {/* Top breadcrumb & household status */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line/60 pb-2">
        <div className="flex items-center gap-2">
          <BackButton fallbackHref="/" label="Back to Overview" />
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-pine hover:text-pine-deep hover:underline transition"
          >
            <Icon name="sun" className="h-3.5 w-3.5 text-gold" />
            <span>Welcome Overview</span>
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[11px] font-medium text-ink-muted">
            Household: <strong className="text-ink">{user.householdName}</strong> · {user.streakCount}-day streak
          </span>
        </div>
      </div>

      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gold">{today}</p>
          <h1 className="mt-1 font-display text-3xl leading-tight text-ink sm:text-[34px]">
            {greeting()}, {user.name.split(" ")[0]}.
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            {user.householdName} · {family.length} in the circle · reading as{" "}
            {getBand(user.homeBand).label.toLowerCase()}.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/wonders"
            className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-cream px-3.5 py-2.5 text-xs font-semibold text-ink transition hover:border-pine/40"
          >
            <Icon name="sparkles" className="h-3.5 w-3.5 text-gold" />
            {openWonders.length} wonders open
          </Link>
          <Link
            href="/journal"
            className="inline-flex items-center gap-1.5 rounded-xl bg-pine px-3.5 py-2.5 text-xs font-semibold text-cream transition hover:bg-pine-deep"
          >
            <Icon name="feather" className="h-3.5 w-3.5" />
            Write an entry
          </Link>
        </div>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon="flame"
          label="Family streak"
          value={`${user.streakCount} days`}
          hint={stats.todayCount > 0 ? "Read together today" : "A reading today keeps it alive"}
          tone="bg-clay/10 text-clay"
        />
        <StatCard
          icon="bookmark"
          label="Verses kept"
          value={String(counts.verses)}
          hint="Across your shelves"
          tone="bg-emerald-500/10 text-emerald-700"
        />
        <StatCard
          icon="feather"
          label="Journal entries"
          value={String(counts.journal)}
          hint={`${answeredPrayers.length} answered prayers recorded`}
          tone="bg-sky-500/10 text-sky-700"
        />
        <StatCard
          icon="sparkles"
          label="Wonder wall"
          value={`${openWonders.length} open`}
          hint={`${counts.openWonders} waiting for a grown-up`}
          tone="bg-amber-500/10 text-amber-700"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.55fr_1fr]">
        <div className="space-y-4">
          {todaysPassage ? (
            <TodayReader passage={todaysPassage} initialBand={initialBand} streak={user.streakCount} />
          ) : (
            <EmptyState
              icon="book"
              title="No passages yet"
              description="Once your library is seeded, today's reading will appear here."
            />
          )}

          <section className="card-surface p-5">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h2 className="font-display text-lg text-ink">Reading rhythm</h2>
                <p className="mt-0.5 text-xs text-ink-muted">
                  {stats.weeklyCount} readings in the last 7 days · {stats.totalReads} in the last month
                </p>
              </div>
              <Link href="/read" className="text-xs font-medium text-pine hover:text-pine-deep">
                Open reader →
              </Link>
            </div>
            <div className="mt-4 grid grid-cols-7 gap-1.5 sm:grid-cols-14">
              {stats.days.map((day) => {
                const ratio = day.count / maxDay;
                const background =
                  day.count === 0
                    ? "rgba(226,220,205,0.6)"
                    : ratio > 0.66
                      ? "#1f3d33"
                      : ratio > 0.33
                        ? "#5b7f6f"
                        : "#a8c0b2";
                return (
                  <div key={day.date} className="group relative">
                    <div
                      title={`${day.date}: ${day.count} reading${day.count === 1 ? "" : "s"}`}
                      className="aspect-square rounded-md transition group-hover:scale-110"
                      style={{ background }}
                    />
                  </div>
                );
              })}
            </div>
            <div className="mt-3 flex items-center justify-between text-[10px] uppercase tracking-[0.14em] text-ink-muted">
              <span>28 days ago</span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-sm bg-[#a8c0b2]" />
                <span className="h-2 w-2 rounded-sm bg-[#5b7f6f]" />
                <span className="h-2 w-2 rounded-sm bg-[#1f3d33]" />
                more
              </span>
              <span>Today</span>
            </div>
          </section>

          <section className="card-surface p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg text-ink">Recent journal</h2>
              <Link href="/journal" className="text-xs font-medium text-pine hover:text-pine-deep">
                All entries →
              </Link>
            </div>
            <div className="mt-3 space-y-2.5">
              {journal.slice(0, 3).map((entry) => (
                <Link
                  key={entry.id}
                  href={`/journal?entry=${entry.id}`}
                  className="flex items-start gap-3 rounded-xl border border-line/70 bg-parchment/40 px-3.5 py-3 transition hover:border-pine/30 hover:bg-parchment"
                >
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cream text-sm shadow-sm">
                    <Icon name="feather" className="h-4 w-4 text-pine" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-[13px] font-semibold text-ink">{entry.title}</p>
                      <span className="shrink-0 text-[10px] uppercase tracking-wide text-ink-muted">
                        {relativeDay(entry.createdAt)}
                      </span>
                    </div>
                    <p className="mt-0.5 line-clamp-1 text-xs text-ink-muted">{entry.body}</p>
                    <div className="mt-1 flex items-center gap-1.5">
                      <Badge tone="green">{entry.mood}</Badge>
                      {entry.passageReference ? <span className="text-[10px] text-ink-muted">{entry.passageReference}</span> : null}
                    </div>
                  </div>
                </Link>
              ))}
              {journal.length === 0 ? (
                <EmptyState
                  icon="feather"
                  title="The page is blank — in a good way"
                  description="Your first journal entry can be one honest sentence. Nobody is grading it."
                  action={
                    <Link
                      href="/journal"
                      className="inline-flex items-center gap-1.5 rounded-xl bg-pine px-4 py-2 text-xs font-semibold text-cream"
                    >
                      Write your first entry
                    </Link>
                  }
                />
              ) : null}
            </div>
          </section>
        </div>

        <div className="space-y-4">
          <section className="card-surface p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg text-ink">Active plan</h2>
              <Link href="/plans" className="text-xs font-medium text-pine hover:text-pine-deep">
                Manage →
              </Link>
            </div>
            {activePlan ? (
              <>
                <div className="mt-3 flex items-center gap-4">
                  <div
                    className="relative flex h-16 w-16 items-center justify-center rounded-full"
                    style={{
                      background: `conic-gradient(#1f3d33 ${progress * 3.6}deg, #ece6d8 0deg)`,
                    }}
                  >
                    <span className="flex h-[52px] w-[52px] flex-col items-center justify-center rounded-full bg-cream">
                      <span className="font-display text-sm leading-none text-ink">{progress}%</span>
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-ink">{activePlan.title}</p>
                    <p className="text-[11px] text-ink-muted">
                      {doneDays} of {totalDays} days · {getBand(activePlan.band === "family" ? "grown" : activePlan.band).label}
                    </p>
                    {nextDay ? (
                      <p className="mt-1 truncate text-[11px] text-pine">
                        Next: {nextDay.title}
                        {nextDay.passageReference ? ` · ${nextDay.passageReference}` : ""}
                      </p>
                    ) : (
                      <p className="mt-1 text-[11px] font-medium text-emerald-700">Plan complete 🎉</p>
                    )}
                  </div>
                </div>
                <div className="mt-4 space-y-1.5">
                  {activePlan.days.slice(0, 4).map((day) => (
                    <div key={day.id} className="flex items-center gap-2 text-xs">
                      <span
                        className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                          day.completed
                            ? "border-pine bg-pine text-cream"
                            : "border-line bg-parchment text-ink-muted"
                        }`}
                      >
                        {day.completed ? <Icon name="check" className="h-3 w-3" /> : <span className="text-[9px]">{day.dayNumber}</span>}
                      </span>
                      <span className={`flex-1 truncate ${day.completed ? "text-ink-muted line-through" : "text-ink-soft"}`}>
                        {day.title}
                      </span>
                      <span className="truncate text-[10px] text-ink-muted">{day.passageReference ?? ""}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="mt-3">
                <EmptyState
                  icon="route"
                  title="No plan in motion"
                  description="A five-day plan is the easiest way to build the habit."
                  action={
                    <Link href="/plans" className="rounded-xl bg-pine px-4 py-2 text-xs font-semibold text-cream">
                      Start a plan
                    </Link>
                  }
                />
              </div>
            )}
          </section>

          <section className="card-surface p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg text-ink">Family circle</h2>
              <Link href="/family" className="text-xs font-medium text-pine hover:text-pine-deep">
                View →
              </Link>
            </div>
            <ul className="mt-3 space-y-2">
              {family.slice(0, 5).map((member) => {
                const band = getBand(member.band);
                return (
                  <li key={member.id} className="flex items-center gap-2.5 rounded-xl border border-line/60 bg-parchment/30 px-2.5 py-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-cream text-sm shadow-sm">
                      {member.emoji}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-medium text-ink">{member.name}</p>
                      <p className="text-[10px] text-ink-muted">
                        {band.emoji} {band.label} · {member.role}
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-cream px-2 py-0.5 text-[10px] font-semibold text-clay shadow-sm">
                      <Icon name="flame" className="h-3 w-3" filled />
                      {member.streak}
                    </span>
                  </li>
                );
              })}
              {family.length === 0 ? (
                <p className="rounded-xl border border-dashed border-line px-3 py-6 text-center text-xs text-ink-muted">
                  Invite the household to see their streaks here.
                </p>
              ) : null}
            </ul>
          </section>

          <section className="overflow-hidden rounded-2xl border border-amber-200/70 bg-gradient-to-br from-amber-50 to-cream p-5 shadow-card">
            <div className="flex items-center gap-2">
              <Icon name="sparkles" className="h-4 w-4 text-gold" />
              <h2 className="font-display text-lg text-ink">From the wonder wall</h2>
            </div>
            {openWonders[0] ? (
              <>
                <p className="mt-2 font-display text-[15px] leading-relaxed text-amber-950">
                  &ldquo;{openWonders[0].question}&rdquo;
                </p>
                <p className="mt-2 text-[11px] text-amber-900/70">
                  — {openWonders[0].askedBy}, age {openWonders[0].askedAge}
                </p>
                <Link
                  href="/wonders"
                  className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-amber-900 px-3 py-2 text-[11px] font-semibold text-amber-50 transition hover:bg-amber-950"
                >
                  Write an answer
                  <Icon name="arrowRight" className="h-3 w-3" />
                </Link>
              </>
            ) : (
              <p className="mt-2 text-sm text-amber-900/80">
                Every wonder has an answer. Ask something new together tonight.
              </p>
            )}
          </section>

          <section className="card-surface p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg text-ink">Answered prayers</h2>
              <Link href="/prayer" className="text-xs font-medium text-pine hover:text-pine-deep">
                Wall →
              </Link>
            </div>
            {answeredPrayers[0] ? (
              <div className="mt-3 rounded-xl border border-emerald-200/70 bg-emerald-50/60 p-3.5">
                <p className="line-clamp-3 text-[13px] leading-relaxed text-emerald-950">
                  {answeredPrayers[0].body}
                </p>
                <p className="mt-2 text-[11px] font-medium text-emerald-800">
                  {answeredPrayers[0].answeredNote || "Marked answered"}
                </p>
              </div>
            ) : (
              <p className="mt-2 rounded-xl border border-dashed border-line px-3 py-5 text-center text-xs text-ink-muted">
                When something is answered, mark it — future-you will want the receipt.
              </p>
            )}
          </section>
        </div>
      </div>
    </div>
  );

  const optionBView = (
    <OptionBDashboard
      canonicalStats={canonicalStats}
      shelves={collections}
      initialBookId={1}
      initialChapter={1}
      initialVerses={initialVersesData.verses}
      userName={user.name.split(" ")[0]}
    />
  );

  return (
    <DashboardSwitcher
      initialOption={initialOpt}
      optionAView={optionAView}
      optionBView={optionBView}
    />
  );
}
