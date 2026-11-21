"use client";

import Link from "next/link";
import { useState } from "react";

import { Icon } from "@/components/icons";
import { Badge, Button, Notice, SectionHeading, Spinner } from "@/components/ui";
import { apiRequest } from "@/lib/client";
import { BANDS, MOODS, getBand, type BandId } from "@/lib/constants";

type Match = {
  mood: string;
  band: string;
  passage: {
    id: string;
    slug: string;
    reference: string;
    theme: string;
    testament: string;
    reflectionPrompt: string;
  };
  version: {
    title: string;
    body: string;
    takeaway: string;
    wonderQuestion: string;
  } | null;
};

type Shelf = { id: string; name: string; emoji: string };

export function Faithprint({
  initialBand,
  shelves,
  homeBand,
}: {
  initialBand: BandId;
  shelves: Shelf[];
  homeBand: BandId;
}) {
  const [mood, setMood] = useState<string | null>(null);
  const [band, setBand] = useState<BandId>(initialBand);
  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shelfId, setShelfId] = useState(shelves[0]?.id ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const find = async () => {
    if (!mood) {
      setError("Pick the feeling you're arriving with first.");
      return;
    }
    setLoading(true);
    setError(null);
    setSaved(false);
    try {
      const result = await apiRequest<Match>("/api/faithprint", "POST", { mood, band });
      setMatch(result);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not reach the library.");
    } finally {
      setLoading(false);
    }
  };

  const save = async () => {
    if (!match?.version || !shelfId) return;
    setSaving(true);
    try {
      await apiRequest(`/api/collections/${shelfId}/verses`, "POST", {
        reference: match.passage.reference,
        text: match.version.body,
        note: `Faithprint · feeling ${match.mood}`,
      });
      setSaved(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save that verse.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <SectionHeading
        eyebrow="Faithprint · world-first"
        title="Start with how you actually feel"
        description="Most apps hand you a verse and hope it lands. Faithprint takes your mood and your reading age, then matches a passage, a retelling and one next step."
        action={<Badge tone="gold">10 moods · 12 passages · 4 bands</Badge>}
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_1.1fr]">
        <div className="space-y-3">
          <section className="card-surface p-5">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-pine text-[11px] font-bold text-cream">
                1
              </span>
              <h2 className="font-display text-lg text-ink">How are you arriving?</h2>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {MOODS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setMood(option.id)}
                  aria-pressed={mood === option.id}
                  className={`rounded-xl border px-3 py-2.5 text-left transition ${
                    mood === option.id
                      ? "border-pine bg-pine text-cream shadow-sm"
                      : "border-line bg-cream text-ink hover:border-pine/35 hover:bg-parchment/60"
                  }`}
                >
                  <span className="text-base">{option.emoji}</span>
                  <span className="mt-0.5 block text-[12px] font-semibold">{option.label}</span>
                  <span className={`text-[10px] ${mood === option.id ? "text-cream/60" : "text-ink-muted"}`}>
                    {option.theme}
                  </span>
                </button>
              ))}
            </div>
          </section>

          <section className="card-surface p-5">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-pine text-[11px] font-bold text-cream">
                2
              </span>
              <h2 className="font-display text-lg text-ink">Who is reading right now?</h2>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {BANDS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setBand(option.id)}
                  aria-pressed={band === option.id}
                  className={`rounded-xl border px-3 py-2 text-left transition ${
                    band === option.id
                      ? "border-pine bg-pine/5 shadow-sm"
                      : "border-line bg-cream hover:border-pine/30"
                  }`}
                >
                  <span className="text-[12px] font-semibold text-ink">
                    {option.emoji} {option.label}
                  </span>
                  <span className="mt-0.5 block text-[10px] text-ink-muted">{option.short}</span>
                </button>
              ))}
            </div>
            <Button className="mt-4 w-full" onClick={find} disabled={loading}>
              {loading ? <Spinner /> : <Icon name="compass" className="h-4 w-4" />}
              {loading ? "Listening for the right passage…" : "Find my faithprint"}
            </Button>
            <Notice message={error} />
          </section>
        </div>

        <div className="card-surface relative overflow-hidden p-5">
          <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gold-soft/50 blur-2xl" />
          {loading ? (
            <div className="space-y-3">
              <div className="skeleton h-3 w-24" />
              <div className="skeleton h-7 w-48" />
              <div className="skeleton h-4 w-full" />
              <div className="skeleton h-4 w-11/12" />
              <div className="skeleton h-4 w-10/12" />
              <div className="skeleton h-20 w-full rounded-2xl" />
            </div>
          ) : match?.version ? (
            <div className="animate-rise relative">
              <div className="flex flex-wrap items-center gap-1.5">
                <Badge tone="gold">{match.passage.theme}</Badge>
                <Badge>{match.passage.reference}</Badge>
                <Badge tone="green">{getBand(match.band).label}</Badge>
              </div>
              <h2 className="mt-3 font-display text-2xl leading-tight text-ink">{match.version.title}</h2>
              <p className="mt-3 font-display text-[16px] leading-[1.8] text-ink-soft">{match.version.body}</p>
              <div className="mt-4 rounded-2xl border border-emerald-200/70 bg-emerald-50/60 p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-800">
                  One next step
                </p>
                <p className="mt-1 font-display text-[14px] leading-relaxed text-emerald-950">
                  {match.version.takeaway}
                </p>
              </div>
              <p className="mt-3 rounded-xl border border-amber-200/70 bg-amber-50/60 px-3.5 py-2.5 font-display text-[13px] leading-relaxed text-amber-950">
                Wonder: {match.version.wonderQuestion}
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <Link
                  href={`/read?passage=${match.passage.slug}`}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-pine px-3.5 py-2 text-xs font-semibold text-cream transition hover:bg-pine-deep"
                >
                  <Icon name="book" className="h-3.5 w-3.5" />
                  Open in reader
                </Link>
                <Link
                  href={`/journal?passage=${match.passage.id}`}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-cream px-3.5 py-2 text-xs font-semibold text-ink transition hover:border-pine/40"
                >
                  <Icon name="feather" className="h-3.5 w-3.5" />
                  Journal this
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setMatch(null);
                    setMood(null);
                  }}
                  className="rounded-xl px-2 py-2 text-xs font-medium text-ink-muted hover:text-ink"
                >
                  Try another mood
                </button>
              </div>

              {shelves.length > 0 ? (
                <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-line/70 pt-3">
                  <select
                    value={shelfId}
                    onChange={(event) => setShelfId(event.target.value)}
                    className="flex-1 rounded-xl border border-line bg-cream px-2.5 py-2 text-xs text-ink focus:border-pine focus:outline-none"
                  >
                    {shelves.map((shelf) => (
                      <option key={shelf.id} value={shelf.id}>
                        {shelf.emoji} {shelf.name}
                      </option>
                    ))}
                  </select>
                  <Button size="sm" variant="secondary" onClick={save} disabled={saving || saved}>
                    {saving ? <Spinner className="h-3.5 w-3.5" /> : <Icon name="bookmark" className="h-3.5 w-3.5" />}
                    {saved ? "Saved" : "Save verse"}
                  </Button>
                </div>
              ) : (
                <Link href="/collections" className="mt-4 block text-[11px] font-medium text-pine">
                  Create a shelf to save matches →
                </Link>
              )}
            </div>
          ) : (
            <div className="flex h-full min-h-[320px] flex-col items-center justify-center px-6 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-parchment text-pine">
                <Icon name="compass" className="h-7 w-7" />
              </span>
              <h2 className="mt-4 font-display text-xl text-ink">Your faithprint appears here</h2>
              <p className="mt-1.5 max-w-xs text-sm leading-relaxed text-ink-muted">
                Pick a mood and a reading age. Lumen will match a passage from the library, retold for{" "}
                {getBand(homeBand).label.toLowerCase()} by default — no guilt, no randomness.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
