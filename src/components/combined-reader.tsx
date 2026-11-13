"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { CompleteCanonReader } from "@/components/complete-canon-reader";
import { ReaderExperience } from "@/components/reader-experience";
import { BackButton } from "@/components/back-button";
import { Icon } from "@/components/icons";
import type { BandId } from "@/lib/constants";
import type { BibleVerseItem } from "@/lib/queries";
import type { PassageItem } from "@/lib/types";

type Shelf = { id: string; name: string; emoji: string; accent: string };

export function CombinedReader({
  passages,
  shelves,
  initialBand,
  initialSlug,
  streak,
  initialCanonVerses,
  defaultMode = "curated",
}: {
  passages: PassageItem[];
  shelves: Shelf[];
  initialBand: BandId;
  initialSlug?: string;
  streak: number;
  initialCanonVerses: BibleVerseItem[];
  defaultMode?: "curated" | "canon";
}) {
  const searchParams = useSearchParams();
  const canonParam = searchParams.get("canon") || searchParams.get("full");
  const initial = canonParam === "true" || canonParam === "1" ? "canon" : defaultMode;

  const [mode, setMode] = useState<"curated" | "canon">(initial);

  return (
    <div className="space-y-6">
      {/* Top Reader Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-line bg-cream p-2 shadow-card">
        <div className="flex items-center gap-2.5 px-2">
          <BackButton fallbackHref="/dashboard" label="Back" />
          <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-gold-soft text-amber-900 font-bold text-xs">
            📖
          </span>
          <div>
            <p className="text-xs font-bold text-ink leading-tight">Reader Experience</p>
            <p className="text-[10px] text-ink-muted">Switch between curated all-ages retellings and the full 66-book canon</p>
          </div>
        </div>

        <div className="inline-flex rounded-xl bg-parchment p-1 border border-line/70">
          <button
            type="button"
            onClick={() => setMode("curated")}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all ${
              mode === "curated"
                ? "bg-cream text-pine shadow-sm ring-1 ring-line"
                : "text-ink-muted hover:text-ink"
            }`}
          >
            <span>🕊️ All-Ages Retellings (4 Bands)</span>
          </button>

          <button
            type="button"
            onClick={() => setMode("canon")}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all ${
              mode === "canon"
                ? "bg-pine text-cream shadow-sm"
                : "text-ink-muted hover:text-ink"
            }`}
          >
            <span>📖 Complete Bible (All 66 Books)</span>
            <span className="rounded-full bg-gold-soft px-1.5 py-0.2 text-[9px] font-bold text-amber-900">
              31,102 verses
            </span>
          </button>
        </div>
      </div>

      {mode === "curated" ? (
        <ReaderExperience
          passages={passages}
          shelves={shelves}
          initialBand={initialBand}
          initialSlug={initialSlug}
          streak={streak}
        />
      ) : (
        <CompleteCanonReader
          shelves={shelves.map((s) => ({ id: s.id, name: s.name, emoji: s.emoji }))}
          initialBookId={1}
          initialChapter={1}
          initialVerses={initialCanonVerses}
        />
      )}
    </div>
  );
}
