"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Icon } from "@/components/icons";
import { Button, Spinner } from "@/components/ui";
import { BANDS, getBand, type BandId } from "@/lib/constants";
import type { PassageItem } from "@/lib/types";

export function TodayReader({
  passage,
  initialBand,
  streak,
}: {
  passage: PassageItem;
  initialBand: BandId;
  streak: number;
}) {
  const [band, setBand] = useState<BandId>(initialBand);
  const [logged, setLogged] = useState(false);
  const [pending, setPending] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [streakCount, setStreakCount] = useState(streak);

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined") {
        window.speechSynthesis?.cancel();
      }
    };
  }, []);

  const version = passage.versions.find((item) => item.band === band) ?? passage.versions[0];
  const activeBandMeta = getBand(band);

  const logReading = async () => {
    if (logged || pending) return;
    setPending(true);
    setLogged(true);
    setStreakCount((count) => count + 1);
    try {
      const response = await fetch("/api/reading", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passageId: passage.id, band }),
      });
      if (!response.ok) throw new Error("failed");
      const data = (await response.json()) as { streak?: number };
      if (typeof data.streak === "number") setStreakCount(data.streak);
    } catch {
      setLogged(false);
      setStreakCount((count) => Math.max(0, count - 1));
    } finally {
      setPending(false);
    }
  };

  const speak = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window) || !version) return;
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(`${version.title}. ${version.body} Takeaway: ${version.takeaway}`);
    utterance.rate = 0.92;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
    setSpeaking(true);
  };

  return (
    <section className="relative overflow-hidden rounded-3xl border border-line bg-cream shadow-card transition-all">
      {/* Radiant ambient glow */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-gold-soft/50 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-20 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl" />

      {/* Top Header */}
      <div className="relative flex flex-wrap items-center justify-between gap-3 border-b border-line/70 bg-parchment/40 px-5 py-4 sm:px-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-gold animate-pulse" />
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gold">
              Today&rsquo;s Passage · {passage.theme}
            </p>
          </div>
          <h2 className="mt-1 font-display text-2xl text-ink font-semibold tracking-tight">
            {passage.reference}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={speak}
            className={`inline-flex items-center gap-1.5 rounded-xl border px-2.5 py-1 text-xs font-semibold transition ${
              speaking
                ? "border-emerald-300 bg-emerald-50 text-emerald-800 animate-pulse"
                : "border-line bg-cream text-ink-soft hover:border-pine/30 hover:text-pine"
            }`}
            title="Read aloud"
          >
            <Icon name="sun" className="h-3.5 w-3.5" />
            <span>{speaking ? "Listening…" : "Read aloud"}</span>
          </button>

          <div className="flex items-center gap-1.5 rounded-full border border-line bg-cream px-2.5 py-1 text-[11px] font-semibold text-clay shadow-sm">
            <Icon name="flame" className="h-3.5 w-3.5" filled />
            {streakCount} day streak
          </div>
        </div>
      </div>

      {/* Age Band Selector Bar */}
      <div className="relative px-5 pt-4 sm:px-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink-muted">
            Reading Level:
          </span>
          <span className="text-[10px] text-ink-muted">
            Active: <strong className="text-pine">{activeBandMeta.label}</strong>
          </span>
        </div>
        <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
          {BANDS.map((option) => {
            const isSelected = option.id === band;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => {
                  setBand(option.id);
                  if (speaking) {
                    window.speechSynthesis?.cancel();
                    setSpeaking(false);
                  }
                }}
                className={`inline-flex items-center justify-between rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                  isSelected
                    ? "border-pine bg-pine text-cream shadow-sm"
                    : "border-line/70 bg-parchment/40 text-ink-soft hover:border-pine/30 hover:bg-parchment"
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <span>{option.emoji}</span>
                  <span className="truncate">{option.label}</span>
                </span>
                <span className={`text-[10px] ${isSelected ? "text-cream/70" : "text-ink-muted"}`}>
                  {option.short}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Scripture Retelling Body */}
      <div key={`${passage.id}-${band}`} className="animate-fade relative px-5 pb-5 pt-4 sm:px-6">
        <h3 className="font-display text-xl text-ink font-semibold">
          {version?.title}
        </h3>
        <p className="prose-scripture mt-2.5 line-clamp-[7] text-[15px] leading-relaxed text-ink-soft">
          &ldquo;{version?.body}&rdquo;
        </p>

        {/* Takeaway & Wonder Prompts */}
        <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
          <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/70 p-3.5">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-800">
              Today&rsquo;s Takeaway
            </p>
            <p className="mt-1 font-display text-[14px] leading-snug text-emerald-950 font-medium">
              {version?.takeaway}
            </p>
          </div>
          <div className="rounded-2xl border border-amber-200/80 bg-amber-50/70 p-3.5">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-amber-800">
              Household Wonder Prompt
            </p>
            <p className="mt-1 font-display text-[14px] leading-snug text-amber-950 font-medium">
              {version?.wonderQuestion}
            </p>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="relative flex flex-wrap items-center justify-between gap-3 border-t border-line/80 bg-parchment/40 px-5 py-3 sm:px-6">
        <div className="flex items-center gap-2">
          <Link
            href={`/read?passage=${passage.slug}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-pine hover:text-pine-deep hover:underline"
          >
            <span>Open in Full Reader</span>
            <Icon name="arrowRight" className="h-3.5 w-3.5" />
          </Link>
          <span className="text-ink-muted text-xs">·</span>
          <Link
            href={`/journal?passage=${passage.id}`}
            className="text-xs font-medium text-ink-soft hover:text-ink hover:underline"
          >
            Journal this
          </Link>
        </div>

        <Button size="sm" onClick={logReading} disabled={logged || pending}>
          {pending ? (
            <Spinner className="h-3.5 w-3.5" />
          ) : (
            <Icon name={logged ? "check" : "flame"} className="h-3.5 w-3.5" />
          )}
          <span>{logged ? "Logged today (Streak +1)" : "Mark read today"}</span>
        </Button>
      </div>
    </section>
  );
}
