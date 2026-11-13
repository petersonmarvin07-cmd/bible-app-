"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { Icon } from "@/components/icons";
import { Badge, Button, EmptyState, SectionHeading } from "@/components/ui";

export type ForgeVerse = {
  id: string;
  reference: string;
  text: string;
  note: string;
  collection: string;
};

const STAGES = [
  { id: 0, label: "Read", hint: "Read it slowly. Twice." },
  { id: 1, label: "Cloak", hint: "A few words have gone missing." },
  { id: 2, label: "Half", hint: "Now every other key word is hidden." },
  { id: 3, label: "Recite", hint: "Rebuild it from memory." },
];

function cleanWord(word: string) {
  return word.replace(/[^A-Za-z0-9']/g, "").toLowerCase();
}

function isHiddenAt(index: number, word: string, stage: number) {
  if (stage === 0) return false;
  if (cleanWord(word).length <= 2) return false;
  if (stage === 1) return index % 4 === 1;
  if (stage === 2) return index % 2 === 1;
  return true;
}

export function VerseForge({ verses }: { verses: ForgeVerse[] }) {
  const [index, setIndex] = useState(0);
  const [stage, setStage] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [checked, setChecked] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [best, setBest] = useState<number | null>(null);

  const verse = verses[index];
  const words = useMemo(() => (verse ? verse.text.split(/\s+/) : []), [verse]);
  const hiddenIndexes = useMemo(
    () => words.map((word, i) => (isHiddenAt(i, word, stage) ? i : -1)).filter((i) => i >= 0),
    [words, stage],
  );

  if (!verse) {
    return (
      <div className="space-y-5">
        <SectionHeading
          eyebrow="Verse Forge"
          title="Hide the words, keep the meaning"
          description="A memory game built on the verses you've saved."
        />
        <EmptyState
          icon="brain"
          title="Your forge needs raw material"
          description="Save a verse to any shelf and it will appear here for cloze training. Three passes through a verse beats ten re-reads."
          action={
            <Link
              href="/read"
              className="inline-flex items-center gap-1.5 rounded-xl bg-pine px-4 py-2.5 text-xs font-semibold text-cream"
            >
              <Icon name="book" className="h-3.5 w-3.5" />
              Go save a verse
            </Link>
          }
        />
      </div>
    );
  }

  const resetStage = (nextStage: number) => {
    setStage(nextStage);
    setAnswers({});
    setChecked(false);
    setRevealed(false);
  };

  const resetVerse = (nextIndex: number) => {
    setIndex(nextIndex);
    resetStage(0);
    setBest(null);
  };

  const matches = hiddenIndexes.filter((i) => cleanWord(answers[i] ?? "") === cleanWord(words[i]));
  const score = hiddenIndexes.length === 0 ? 100 : Math.round((matches.length / hiddenIndexes.length) * 100);
  const passed = score === 100;

  const check = () => {
    setChecked(true);
    if (score === 100) {
      setBest((current) => (current === null ? 100 : Math.max(current, 100)));
    }
  };

  return (
    <div className="space-y-5">
      <SectionHeading
        eyebrow="Verse Forge · world-first"
        title="Hide the words, keep the meaning"
        description="Lumen cloaks your saved verses word by word. Three passes — cloak, half, recite — and it stays with you longer than a highlight ever would."
        action={
          <Badge tone="violet">
            {verses.length} verse{verses.length === 1 ? "" : "s"} in the forge
          </Badge>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
        <div className="card-surface overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-parchment/50 px-5 py-3">
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-muted">
              <Icon name="bookmark" className="h-3.5 w-3.5 text-gold" />
              {verse.collection}
            </div>
            <div className="flex items-center gap-1">
              {STAGES.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => resetStage(item.id)}
                  className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide transition ${
                    stage === item.id
                      ? "bg-pine text-cream"
                      : "bg-cream text-ink-muted hover:bg-parchment-deep"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="px-5 py-6 sm:px-7">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-display text-xl text-ink">{verse.reference}</p>
              <p className="text-[11px] italic text-ink-muted">
                {STAGES[stage].hint}
              </p>
            </div>

            <div className="mt-5 flex flex-wrap items-baseline gap-x-2 gap-y-3 font-display text-[19px] leading-[2.1] text-ink">
              {words.map((word, i) => {
                const hidden = isHiddenAt(i, word, stage);
                if (!hidden) {
                  return (
                    <span key={i} className="animate-fade">
                      {word}
                    </span>
                  );
                }

                const value = answers[i] ?? "";
                const correct = cleanWord(value) === cleanWord(word);
                const attempted = cleanWord(value).length > 0;
                const blankWidth = `${Math.max(3, Math.min(cleanWord(word).length + 1, 18))}ch`;

                // REVEAL: render the real answer itself (not a placeholder),
                // so it shows whether or not the blank already has text in it.
                if (revealed) {
                  return (
                    <span
                      key={i}
                      style={{ width: blankWidth }}
                      title={
                        attempted
                          ? correct
                            ? "You had this one right"
                            : `You wrote: ${value}`
                          : "Answer revealed"
                      }
                      className={`animate-fade inline-block rounded-none border-b-2 bg-gold-soft/60 px-1 pb-0.5 text-center transition ${
                        attempted
                          ? correct
                            ? "border-emerald-500"
                            : "border-rose-400"
                          : "border-gold"
                      }`}
                    >
                      <span
                        className={
                          attempted && !correct
                            ? "text-ink-muted line-through decoration-rose-300"
                            : "text-ink font-semibold"
                        }
                      >
                        {word}
                      </span>
                    </span>
                  );
                }

                return (
                  <input
                    key={i}
                    value={value}
                    onChange={(event) => {
                      setAnswers((current) => ({ ...current, [i]: event.target.value }));
                      setChecked(false);
                    }}
                    aria-label={`Missing word ${i + 1}`}
                    spellCheck={false}
                    autoComplete="off"
                    placeholder="…"
                    style={{ width: blankWidth }}
                    className={`rounded-none border-b-2 bg-transparent px-1 pb-0.5 text-center font-display text-[19px] transition focus:outline-none ${
                      checked
                        ? correct
                          ? "border-emerald-500 text-emerald-800"
                          : "border-rose-400 text-rose-700"
                        : "border-pine/30 text-pine focus:border-pine"
                    }`}
                  />
                );
              })}
            </div>

            {revealed ? (
              <div className="animate-fade mt-4 rounded-xl border border-amber-200/80 bg-amber-50/70 px-4 py-3 text-[12px] leading-relaxed text-amber-950">
                <span className="font-semibold">Answer key shown.</span> Your typed blanks are
                preserved — press <strong>Hide answers</strong> to keep practising, or{" "}
                <strong>Reset blanks</strong> to start the pass again.
              </div>
            ) : null}

            {stage === 0 ? (
              <div className="mt-6 rounded-xl border border-line bg-parchment/50 px-4 py-3 text-[12px] leading-relaxed text-ink-muted">
                Read it out loud once. Then press <strong>Cloak</strong> and fill the blanks.
              </div>
            ) : null}

            {checked ? (
              <div
                className={`mt-5 rounded-xl border px-4 py-3 ${
                  passed ? "border-emerald-200 bg-emerald-50/70" : "border-amber-200 bg-amber-50/70"
                }`}
              >
                <p className={`text-sm font-semibold ${passed ? "text-emerald-900" : "text-amber-900"}`}>
                  {passed
                    ? stage === 3
                      ? "Recited from memory. Forged. 🔥"
                      : `${score}% — good. Move to the next stage.`
                    : `${matches.length} of ${hiddenIndexes.length} correct (${score}%). Keep going.`}
                </p>
                <p className="mt-0.5 text-[11px] text-ink-muted">
                  {passed && stage < 3
                    ? STAGES[stage + 1].hint
                    : passed
                      ? "Try another saved verse, or run this one again without hints."
                      : "Reveal the words, look away, and try once more."}
                </p>
              </div>
            ) : null}

            <div className="mt-6 flex flex-wrap items-center gap-2">
              {stage === 0 ? (
                <Button onClick={() => resetStage(1)}>
                  <Icon name="wand" className="h-4 w-4" />
                  Cloak the words
                </Button>
              ) : (
                <>
                  <Button onClick={check}>
                    <Icon name="check" className="h-4 w-4" />
                    Check my memory
                  </Button>
                  <Button
                    variant={revealed ? "primary" : "secondary"}
                    onClick={() => setRevealed((value) => !value)}
                    aria-pressed={revealed}
                  >
                    <Icon name={revealed ? "close" : "wand"} className="h-4 w-4" />
                    {revealed ? "Hide answers" : "Reveal answers"}
                  </Button>
                  {revealed ? (
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setAnswers({});
                        setChecked(false);
                        setRevealed(false);
                      }}
                    >
                      Reset blanks
                    </Button>
                  ) : null}
                  {passed && stage < 3 ? (
                    <Button onClick={() => resetStage(stage + 1)}>
                      Next stage
                      <Icon name="arrowRight" className="h-4 w-4" />
                    </Button>
                  ) : null}
                  {passed && stage === 3 ? (
                    <Button onClick={() => resetVerse((index + 1) % verses.length)}>
                      Forge another verse
                      <Icon name="arrowRight" className="h-4 w-4" />
                    </Button>
                  ) : null}
                </>
              )}
            </div>
          </div>
        </div>

        <aside className="space-y-3">
          <div className="card-surface p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-muted">
              Progression
            </p>
            <ol className="mt-2 space-y-2">
              {STAGES.map((item) => (
                <li key={item.id} className="flex items-start gap-2">
                  <span
                    className={`mt-0.5 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                      stage === item.id
                        ? "bg-pine text-cream"
                        : stage > item.id
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-parchment-deep text-ink-muted"
                    }`}
                  >
                    {item.id + 1}
                  </span>
                  <div>
                    <p className="text-[12px] font-semibold text-ink">{item.label}</p>
                    <p className="text-[10px] leading-relaxed text-ink-muted">{item.hint}</p>
                  </div>
                </li>
              ))}
            </ol>
            {best !== null ? (
              <p className="mt-3 rounded-lg bg-emerald-50 px-2.5 py-1.5 text-[10px] font-semibold text-emerald-800">
                Forged at 100% — keep this one.
              </p>
            ) : null}
          </div>

          <div className="card-surface p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-muted">
              Your verse deck
            </p>
            <ul className="mt-2 space-y-1">
              {verses.map((item, i) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => resetVerse(i)}
                    className={`w-full rounded-lg px-2.5 py-2 text-left text-[12px] transition ${
                      i === index
                        ? "bg-parchment-deep/70 font-semibold text-ink"
                        : "text-ink-soft hover:bg-parchment"
                    }`}
                  >
                    <span className="mr-1.5 text-[10px] text-ink-muted">{String(i + 1).padStart(2, "0")}</span>
                    {item.reference}
                  </button>
                </li>
              ))}
            </ul>
            <Link
              href="/collections"
              className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-pine hover:text-pine-deep"
            >
              Add more verses
              <Icon name="arrowRight" className="h-3 w-3" />
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
