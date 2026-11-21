"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { Icon } from "@/components/icons";
import { Badge, Button, EmptyState, Modal, Spinner } from "@/components/ui";
import { BANDS, getBand, type BandId } from "@/lib/constants";
import type { PassageItem } from "@/lib/types";

type Shelf = { id: string; name: string; emoji: string; accent: string };

export function ReaderExperience({
  passages,
  shelves,
  initialBand,
  initialSlug,
  streak,
}: {
  passages: PassageItem[];
  shelves: Shelf[];
  initialBand: BandId;
  initialSlug?: string;
  streak: number;
}) {
  const [band, setBand] = useState<BandId>(initialBand);
  const [slug, setSlug] = useState(initialSlug && passages.some((p) => p.slug === initialSlug) ? initialSlug : passages[0]?.slug ?? "");
  const [query, setQuery] = useState("");
  const [saveOpen, setSaveOpen] = useState(false);
  const [savingTo, setSavingTo] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [logged, setLogged] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [streakCount, setStreakCount] = useState(streak);

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined") {
        window.speechSynthesis?.cancel();
      }
    };
  }, []);

  const active = passages.find((passage) => passage.slug === slug) ?? passages[0];
  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return passages;
    return passages.filter(
      (passage) =>
        passage.reference.toLowerCase().includes(term) ||
        passage.theme.toLowerCase().includes(term) ||
        passage.book.toLowerCase().includes(term),
    );
  }, [passages, query]);

  if (!active) {
    return (
      <EmptyState
        icon="book"
        title="The library is still being written"
        description="Passages will appear here as soon as they are added to your household."
      />
    );
  }

  const version = active.versions.find((item) => item.band === band) ?? active.versions[0];
  const bandMeta = getBand(band);

  const speak = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window) || !version) return;
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(`${version.title}. ${version.body}`);
    utterance.rate = 0.92;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
    setSpeaking(true);
    setFlash("Reading aloud — a Lumen first for little ears.");
    setTimeout(() => setFlash(null), 3200);
  };

  const markRead = async () => {
    if (logged) return;
    const prevStreak = streakCount;
    const optimisticStreak = prevStreak > 0 ? prevStreak + 1 : 1;
    setLogged(true);
    setStreakCount(optimisticStreak);
    setError(null);
    try {
      const response = await fetch("/api/reading", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passageId: active.id, band }),
      });
      if (!response.ok) throw new Error("Could not log that reading.");
      const data = (await response.json()) as { streak: number };
      const resolvedStreak = typeof data.streak === "number" ? data.streak : optimisticStreak;
      setStreakCount(resolvedStreak);
      setFlash(`Logged. ${resolvedStreak} ${resolvedStreak === 1 ? "day" : "days"} in a row — the household sees you.`);
    } catch {
      setLogged(false);
      setStreakCount(prevStreak);
      setError("We couldn't save your reading. Check your connection and try again.");
    } finally {
      setTimeout(() => setFlash(null), 3600);
    }
  };

  const saveTo = async (collectionId: string) => {
    if (!version) return;
    setSavingTo(collectionId);
    setError(null);
    try {
      const response = await fetch(`/api/collections/${collectionId}/verses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference: active.reference, text: version.body, note: "" }),
      });
      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? "Could not save that verse.");
      }
      setSaveOpen(false);
      setFlash(`Saved ${active.reference} to your shelf.`);
      setTimeout(() => setFlash(null), 3200);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save that verse.");
    } finally {
      setSavingTo(null);
    }
  };

  return (
    <div className="space-y-4">
      {flash ? (
        <div className="animate-rise fixed bottom-5 left-1/2 z-40 -translate-x-1/2 rounded-full border border-pine/20 bg-pine px-4 py-2 text-xs font-medium text-cream shadow-lift">
          {flash}
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[290px_1fr]">
        <aside className="space-y-3">
          <div className="card-surface p-3">
            <div className="relative">
              <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search passages or themes"
                className="w-full rounded-xl border border-line bg-parchment/60 py-2 pl-9 pr-3 text-xs text-ink placeholder:text-ink-muted/70 focus:border-pine focus:outline-none"
              />
            </div>
            <p className="mt-2 px-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-muted">
              {filtered.length} passages · 4 bands
            </p>
          </div>

          <div className="card-surface scroll-fade max-h-[420px] overflow-y-auto p-2 lg:max-h-[560px]">
            <ul className="space-y-1">
              {filtered.map((passage) => {
                const isActive = passage.id === active.id;
                return (
                  <li key={passage.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setSlug(passage.slug);
                        setLogged(false);
                      }}
                      className={`w-full rounded-xl px-3 py-2.5 text-left transition ${
                        isActive ? "bg-pine text-cream shadow-sm" : "hover:bg-parchment"
                      }`}
                    >
                      <span className={`block text-[13px] font-semibold ${isActive ? "text-cream" : "text-ink"}`}>
                        {passage.reference}
                      </span>
                      <span className={`mt-0.5 flex items-center gap-1.5 text-[11px] ${isActive ? "text-cream/60" : "text-ink-muted"}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${isActive ? "bg-gold-soft" : "bg-sage"}`} />
                        {passage.theme} · {passage.testament} Testament
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
            {filtered.length === 0 ? (
              <p className="px-3 py-8 text-center text-xs text-ink-muted">
                No passages match &ldquo;{query}&rdquo;.
              </p>
            ) : null}
          </div>
        </aside>

        <div className="space-y-4">
          <div className="card-surface overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-parchment/50 px-5 py-4">
              <div>
                <div className="flex items-center gap-2">
                  <Badge tone="gold">{active.theme}</Badge>
                  <Badge>{active.testament} Testament</Badge>
                </div>
                <h2 className="mt-2 font-display text-2xl text-ink">{active.reference}</h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={speak}
                  title={speaking ? "Stop reading aloud" : "Read aloud"}
                  className={`rounded-xl border p-2 transition ${
                    speaking
                      ? "border-emerald-300 bg-emerald-50 text-emerald-800 animate-pulse"
                      : "border-line bg-cream text-ink-soft hover:border-pine/40 hover:text-pine"
                  }`}
                >
                  <Icon name="sun" className="h-4 w-4" />
                </button>
                <Button variant="secondary" size="sm" onClick={() => setSaveOpen(true)}>
                  <Icon name="bookmark" className="h-3.5 w-3.5" />
                  Save verse
                </Button>
              </div>
            </div>

            <div className="px-5 py-4">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-muted">
                Choose who is reading
              </p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {BANDS.map((option) => {
                  const isActive = option.id === band;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setBand(option.id)}
                      aria-pressed={isActive}
                      className={`rounded-xl border px-3 py-2 text-left transition ${
                        isActive
                          ? "border-pine bg-pine text-cream shadow-sm"
                          : "border-line bg-cream text-ink hover:border-pine/35 hover:bg-parchment/60"
                      }`}
                    >
                      <span className="flex items-center gap-1.5 text-xs font-semibold">
                        <span>{option.emoji}</span>
                        {option.label}
                      </span>
                      <span className={`mt-0.5 block text-[10px] ${isActive ? "text-cream/60" : "text-ink-muted"}`}>
                        {option.short}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div key={`${active.id}-${band}`} className="animate-fade border-t border-line px-5 py-6 sm:px-7">
              <div className="mb-4 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-gold">
                <span>{bandMeta.emoji}</span>
                {bandMeta.label} · {bandMeta.short}
              </div>
              <h3 className="font-display text-xl text-ink">{version?.title ?? "A retelling"}</h3>
              <p className="prose-scripture mt-3 max-w-2xl whitespace-pre-line">{version?.body ?? ""}</p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-emerald-200/70 bg-emerald-50/60 p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-800">
                    The takeaway
                  </p>
                  <p className="mt-1.5 font-display text-[15px] leading-relaxed text-emerald-950">
                    {version?.takeaway ?? ""}
                  </p>
                </div>
                <div className="rounded-2xl border border-amber-200/70 bg-amber-50/60 p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-amber-800">
                    Wonder together
                  </p>
                  <p className="mt-1.5 font-display text-[15px] leading-relaxed text-amber-950">
                    {version?.wonderQuestion ?? ""}
                  </p>
                </div>
              </div>

              {active.reflectionPrompt ? (
                <p className="mt-4 rounded-xl border border-line bg-parchment/60 px-4 py-3 text-[13px] italic leading-relaxed text-ink-soft">
                  Journal prompt: {active.reflectionPrompt}
                </p>
              ) : null}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line bg-parchment/40 px-5 py-4">
              <div className="flex items-center gap-2 text-xs text-ink-muted">
                <span className="inline-flex items-center gap-1 rounded-full border border-line bg-cream px-2.5 py-1 font-medium text-ink-soft">
                  <Icon name="flame" className="h-3.5 w-3.5 text-clay" filled />
                  {streakCount}-day streak
                </span>
                <span className="hidden sm:inline">Reading this counts for the whole household.</span>
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/journal?passage=${active.id}&reference=${encodeURIComponent(active.reference)}`}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-cream px-3 py-2 text-xs font-medium text-ink transition hover:border-pine/40"
                >
                  <Icon name="feather" className="h-3.5 w-3.5" />
                  Reflect
                </Link>
                <Button onClick={markRead} disabled={logged} size="sm">
                  {logged ? (
                    <>
                      <Icon name="check" className="h-3.5 w-3.5" /> Read today
                    </>
                  ) : (
                    <>
                      <Icon name="flame" className="h-3.5 w-3.5" /> I read this
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {error ? (
            <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700">
              {error}
            </p>
          ) : null}
        </div>
      </div>

      <Modal
        open={saveOpen}
        onClose={() => setSaveOpen(false)}
        title={`Save ${active.reference}`}
        subtitle="Choose a shelf. Verses feed the Verse Forge memory game."
      >
        <div className="space-y-2">
          {shelves.length === 0 ? (
            <EmptyState
              icon="bookmark"
              title="No shelves yet"
              description="Create your first verse collection from the Verse Shelf page."
            />
          ) : (
            shelves.map((shelf) => (
              <button
                key={shelf.id}
                type="button"
                onClick={() => saveTo(shelf.id)}
                disabled={savingTo !== null}
                className="flex w-full items-center justify-between gap-3 rounded-xl border border-line bg-parchment/50 px-4 py-3 text-left transition hover:border-pine/40 hover:bg-parchment disabled:opacity-60"
              >
                <span className="flex items-center gap-3">
                  <span className="text-lg">{shelf.emoji}</span>
                  <span className="text-sm font-medium text-ink">{shelf.name}</span>
                </span>
                {savingTo === shelf.id ? <Spinner className="h-4 w-4 text-pine" /> : <Icon name="plus" className="h-4 w-4 text-ink-muted" />}
              </button>
            ))
          )}
          <p className="pt-2 text-[11px] leading-relaxed text-ink-muted">
            Saving the {bandMeta.label} retelling — perfect for re-reading at the same age band later.
          </p>
        </div>
      </Modal>
    </div>
  );
}
