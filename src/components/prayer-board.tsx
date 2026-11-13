"use client";

import { useState } from "react";

import { Icon } from "@/components/icons";
import {
  Badge,
  Button,
  EmptyState,
  Modal,
  Notice,
  SectionHeading,
  Spinner,
  inputClass,
  labelClass,
} from "@/components/ui";
import { apiRequest, tempId } from "@/lib/client";
import { PRAYER_CATEGORIES, relativeDay } from "@/lib/constants";
import type { PrayerItem } from "@/lib/types";

type Draft = { authorName: string; body: string; category: string };
const blankDraft: Draft = { authorName: "", body: "", category: "everyday" };

export function PrayerBoard({
  initialPrayers,
  defaultAuthor,
}: {
  initialPrayers: PrayerItem[];
  defaultAuthor: string;
}) {
  const [prayers, setPrayers] = useState(initialPrayers);
  const [tab, setTab] = useState<"open" | "answered" | "all">("open");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<PrayerItem | null>(null);
  const [draft, setDraft] = useState<Draft>({ ...blankDraft, authorName: defaultAuthor });
  const [answerFor, setAnswerFor] = useState<PrayerItem | null>(null);
  const [answerNote, setAnswerNote] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);

  const showFlash = (message: string) => {
    setFlash(message);
    setTimeout(() => setFlash(null), 2600);
  };

  const openNew = () => {
    setEditing(null);
    setDraft({ ...blankDraft, authorName: defaultAuthor });
    setError(null);
    setOpen(true);
  };

  const openEdit = (prayer: PrayerItem) => {
    setEditing(prayer);
    setDraft({ authorName: prayer.authorName, body: prayer.body, category: prayer.category });
    setError(null);
    setOpen(true);
  };

  const save = async () => {
    if (!draft.body.trim()) {
      setError("Write the prayer on your heart.");
      return;
    }
    setPending(true);
    setError(null);

    if (editing) {
      const previous = prayers;
      setPrayers((current) =>
        current.map((prayer) => (prayer.id === editing.id ? { ...prayer, ...draft } : prayer)),
      );
      setOpen(false);
      try {
        await apiRequest(`/api/prayers/${editing.id}`, "PATCH", draft);
        showFlash("Prayer updated.");
      } catch (cause) {
        setPrayers(previous);
        setError(cause instanceof Error ? cause.message : "Update failed.");
        setOpen(true);
      } finally {
        setPending(false);
      }
      return;
    }

    const optimistic: PrayerItem = {
      id: tempId(),
      authorName: draft.authorName.trim() || defaultAuthor,
      body: draft.body,
      category: draft.category,
      isAnswered: false,
      answeredNote: "",
      prayedCount: 0,
      createdAt: new Date().toISOString(),
    };
    setPrayers((current) => [optimistic, ...current]);
    setTab("open");
    setOpen(false);
    try {
      const created = await apiRequest<{ id: string; createdAt: string }>("/api/prayers", "POST", draft);
      setPrayers((current) =>
        current.map((prayer) =>
          prayer.id === optimistic.id
            ? { ...prayer, id: created.id, createdAt: created.createdAt }
            : prayer,
        ),
      );
      showFlash("Prayer added to the wall.");
    } catch (cause) {
      setPrayers((current) => current.filter((prayer) => prayer.id !== optimistic.id));
      setError(cause instanceof Error ? cause.message : "Could not add that prayer.");
      setOpen(true);
    } finally {
      setPending(false);
    }
  };

  const pray = async (prayer: PrayerItem) => {
    setPrayers((current) =>
      current.map((item) =>
        item.id === prayer.id ? { ...item, prayedCount: item.prayedCount + 1 } : item,
      ),
    );
    try {
      await apiRequest(`/api/prayers/${prayer.id}`, "PATCH", { action: "pray" });
    } catch {
      setPrayers((current) =>
        current.map((item) =>
          item.id === prayer.id ? { ...item, prayedCount: Math.max(0, item.prayedCount - 1) } : item,
        ),
      );
    }
  };

  const markAnswered = async () => {
    if (!answerFor) return;
    setPending(true);
    const target = answerFor;
    const previous = prayers;
    setPrayers((current) =>
      current.map((prayer) =>
        prayer.id === target.id
          ? { ...prayer, isAnswered: true, answeredNote: answerNote }
          : prayer,
      ),
    );
    setAnswerFor(null);
    try {
      await apiRequest(`/api/prayers/${target.id}`, "PATCH", {
        isAnswered: true,
        answeredNote: answerNote,
      });
      showFlash("Answered — a receipt for future-you.");
    } catch (cause) {
      setPrayers(previous);
      setError(cause instanceof Error ? cause.message : "Could not mark that answered.");
    } finally {
      setPending(false);
    }
  };

  const reopen = async (prayer: PrayerItem) => {
    const previous = prayers;
    setPrayers((current) =>
      current.map((item) =>
        item.id === prayer.id ? { ...item, isAnswered: false, answeredNote: "" } : item,
      ),
    );
    try {
      await apiRequest(`/api/prayers/${prayer.id}`, "PATCH", { isAnswered: false, answeredNote: "" });
    } catch {
      setPrayers(previous);
    }
  };

  const remove = async (prayer: PrayerItem) => {
    const previous = prayers;
    setPrayers((current) => current.filter((item) => item.id !== prayer.id));
    try {
      await apiRequest(`/api/prayers/${prayer.id}`, "DELETE");
    } catch (cause) {
      setPrayers(previous);
      setError(cause instanceof Error ? cause.message : "Could not remove that prayer.");
    }
  };

  const visible = prayers.filter((prayer) => {
    if (tab === "open") return !prayer.isAnswered;
    if (tab === "answered") return prayer.isAnswered;
    return true;
  });

  const answeredCount = prayers.filter((prayer) => prayer.isAnswered).length;
  const prayedTotal = prayers.reduce((sum, prayer) => sum + prayer.prayedCount, 0);

  return (
    <div className="space-y-5">
      <SectionHeading
        eyebrow="Prayer wall"
        title="Say it here, together"
        description={`${prayers.length - answeredCount} open prayers · ${answeredCount} answered · ${prayedTotal} taps of “I prayed”. Tap a card to stand with someone.`}
        action={
          <Button onClick={openNew}>
            <Icon name="plus" className="h-4 w-4" />
            Add a prayer
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-1.5">
        {(
          [
            { id: "open", label: `Open (${prayers.length - answeredCount})` },
            { id: "answered", label: `Answered (${answeredCount})` },
            { id: "all", label: `All (${prayers.length})` },
          ] as const
        ).map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => setTab(option.id)}
            className={`rounded-full border px-3 py-1.5 text-[11px] font-semibold transition ${
              tab === option.id ? "border-pine bg-pine text-cream" : "border-line bg-cream text-ink-soft"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      <Notice message={error} />

      {visible.length === 0 ? (
        <EmptyState
          icon="hands"
          title={tab === "answered" ? "No answered prayers recorded yet" : "The wall is quiet"}
          description={
            tab === "answered"
              ? "When something breaks through, mark it answered. The record becomes your own memorial."
              : "Write the first prayer. It can be one line, and it doesn't have to be tidy."
          }
          action={
            <Button onClick={openNew}>
              <Icon name="plus" className="h-4 w-4" />
              Write a prayer
            </Button>
          }
        />
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {visible.map((prayer) => (
            <article
              key={prayer.id}
              className={`card-surface animate-fade flex flex-col p-4 ${
                prayer.isAnswered ? "border-emerald-200 bg-emerald-50/30" : ""
              } ${prayer.id.startsWith("temp-") ? "opacity-70" : ""}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-parchment text-sm">
                    {prayer.authorName.slice(0, 1).toUpperCase()}
                  </span>
                  <div>
                    <p className="text-[13px] font-semibold text-ink">{prayer.authorName}</p>
                    <p className="text-[10px] text-ink-muted">{relativeDay(prayer.createdAt)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-0.5">
                  <button
                    type="button"
                    onClick={() => openEdit(prayer)}
                    className="rounded p-1 text-ink-muted transition hover:text-pine"
                    title="Edit prayer"
                  >
                    <Icon name="pencil" className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(prayer)}
                    className="rounded p-1 text-ink-muted transition hover:text-rose-600"
                    title="Delete prayer"
                  >
                    <Icon name="trash" className="h-3 w-3" />
                  </button>
                </div>
              </div>

              <p className="mt-3 flex-1 whitespace-pre-line text-[13px] leading-relaxed text-ink-soft">
                {prayer.body}
              </p>

              {prayer.isAnswered ? (
                <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50/70 p-2.5">
                  <p className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-800">
                    <Icon name="check" className="h-3 w-3" /> Answered
                  </p>
                  <p className="mt-0.5 text-[12px] italic text-emerald-900">
                    {prayer.answeredNote || "God answered this one."}
                  </p>
                </div>
              ) : null}

              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-line/70 pt-3">
                <Badge tone="violet">{prayer.category}</Badge>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => pray(prayer)}
                    className="inline-flex items-center gap-1 rounded-full border border-line bg-cream px-2.5 py-1 text-[11px] font-semibold text-ink-soft transition hover:border-pine/40 hover:text-pine"
                  >
                    <Icon name="hands" className="h-3 w-3" />
                    I prayed · {prayer.prayedCount}
                  </button>
                  {prayer.isAnswered ? (
                    <button
                      type="button"
                      onClick={() => reopen(prayer)}
                      className="rounded-full px-2 py-1 text-[10px] font-medium text-ink-muted hover:text-ink"
                    >
                      Reopen
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setAnswerFor(prayer);
                        setAnswerNote(prayer.answeredNote);
                      }}
                      className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-800 transition hover:bg-emerald-100"
                    >
                      Answered
                    </button>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {flash ? (
        <div className="animate-rise fixed bottom-5 left-1/2 z-40 -translate-x-1/2 rounded-full bg-pine px-4 py-2 text-xs font-medium text-cream shadow-lift">
          {flash}
        </div>
      ) : null}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Edit prayer" : "Add a prayer"}
        subtitle="Written prayers become a record of God's faithfulness."
      >
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className={labelClass} htmlFor="prayer-author">
                From
              </label>
              <input
                id="prayer-author"
                value={draft.authorName}
                onChange={(event) => setDraft({ ...draft, authorName: event.target.value })}
                placeholder="Grace"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="prayer-category">
                Category
              </label>
              <select
                id="prayer-category"
                value={draft.category}
                onChange={(event) => setDraft({ ...draft, category: event.target.value })}
                className={`${inputClass} capitalize`}
              >
                {PRAYER_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className={labelClass} htmlFor="prayer-body">
              Prayer
            </label>
            <textarea
              id="prayer-body"
              value={draft.body}
              onChange={(event) => setDraft({ ...draft, body: event.target.value })}
              rows={5}
              placeholder="For steady hands and a softer voice…"
              className={inputClass}
            />
          </div>
          <Notice message={error} />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={save} disabled={pending}>
              {pending ? <Spinner /> : <Icon name="hands" className="h-4 w-4" />}
              {editing ? "Save prayer" : "Pin to the wall"}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={answerFor !== null}
        onClose={() => setAnswerFor(null)}
        title="Mark as answered"
        subtitle={answerFor ? `Prayed ${answerFor.prayedCount} times` : ""}
      >
        <div className="space-y-4">
          <div className="rounded-xl border border-line bg-parchment/50 p-3 text-[13px] italic leading-relaxed text-ink-soft">
            {answerFor?.body}
          </div>
          <div>
            <label className={labelClass} htmlFor="answer-note">
              How did God answer?
            </label>
            <textarea
              id="answer-note"
              value={answerNote}
              onChange={(event) => setAnswerNote(event.target.value)}
              rows={3}
              placeholder="Not how I expected, but…"
              className={inputClass}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setAnswerFor(null)}>
              Cancel
            </Button>
            <Button onClick={markAnswered} disabled={pending}>
              {pending ? <Spinner /> : <Icon name="check" className="h-4 w-4" />}
              Mark answered
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
