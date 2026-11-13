"use client";

import { useEffect, useRef, useState } from "react";

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
import { JOURNAL_MOODS, formatDate } from "@/lib/constants";
import type { JournalItem, PassageOption } from "@/lib/types";

type Draft = {
  title: string;
  body: string;
  mood: string;
  sharing: string;
  passageId: string;
};

const blankDraft: Draft = { title: "", body: "", mood: "peaceful", sharing: "private", passageId: "" };

export function JournalBoard({
  initialEntries,
  passageOptions,
  focusId,
  defaultPassageId,
}: {
  initialEntries: JournalItem[];
  passageOptions: PassageOption[];
  focusId?: string;
  defaultPassageId?: string;
}) {
  const focusEntry = focusId ? initialEntries.find((entry) => entry.id === focusId) ?? null : null;
  const [entries, setEntries] = useState(initialEntries);
  const [open, setOpen] = useState(Boolean(focusEntry) || Boolean(defaultPassageId));
  const [editing, setEditing] = useState<JournalItem | null>(focusEntry);
  const [draft, setDraft] = useState<Draft>(
    focusEntry
      ? {
          title: focusEntry.title,
          body: focusEntry.body,
          mood: focusEntry.mood,
          sharing: focusEntry.sharing,
          passageId: focusEntry.passageId ?? "",
        }
      : { ...blankDraft, passageId: defaultPassageId ?? "" },
  );
  const [moodFilter, setMoodFilter] = useState("all");
  const autoOpened = useRef(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);

  useEffect(() => {
    if (!autoOpened.current && initialEntries.length === 0) {
      autoOpened.current = true;
      setOpen(true);
    }
  }, [initialEntries.length]);

  const showFlash = (message: string) => {
    setFlash(message);
    setTimeout(() => setFlash(null), 2800);
  };

  const startNew = () => {
    setEditing(null);
    setDraft({ ...blankDraft, passageId: draft.passageId });
    setError(null);
    setOpen(true);
  };

  const closeComposer = () => {
    if (!editing && !draft.title.trim() && !draft.body.trim()) {
      setDraft(blankDraft);
    }
    setOpen(false);
  };

  const startEdit = (entry: JournalItem) => {
    setEditing(entry);
    setDraft({
      title: entry.title,
      body: entry.body,
      mood: entry.mood,
      sharing: entry.sharing,
      passageId: entry.passageId ?? "",
    });
    setError(null);
    setOpen(true);
  };

  const save = async () => {
    if (!draft.title.trim() || !draft.body.trim()) {
      setError("A title and a few words are all we need.");
      return;
    }
    setPending(true);
    setError(null);

    const passageReference =
      passageOptions.find((option) => option.id === draft.passageId)?.reference ?? null;

    if (editing) {
      const previous = entries;
      const optimistic: JournalItem = {
        ...editing,
        ...draft,
        passageId: draft.passageId || null,
        passageReference,
        updatedAt: new Date().toISOString(),
      };
      setEntries((current) => current.map((entry) => (entry.id === editing.id ? optimistic : entry)));
      setOpen(false);
      try {
        await apiRequest(`/api/journal/${editing.id}`, "PATCH", draft);
        showFlash("Entry updated.");
      } catch (cause) {
        setEntries(previous);
        setError(cause instanceof Error ? cause.message : "Update failed.");
        setOpen(true);
      } finally {
        setPending(false);
      }
      return;
    }

    const now = new Date().toISOString();
    const optimistic: JournalItem = {
      id: tempId(),
      title: draft.title,
      body: draft.body,
      mood: draft.mood,
      sharing: draft.sharing,
      passageId: draft.passageId || null,
      passageReference,
      createdAt: now,
      updatedAt: now,
    };
    setEntries((current) => [optimistic, ...current]);
    setOpen(false);
    try {
      const created = await apiRequest<{
        id: string;
        title: string;
        body: string;
        mood: string;
        sharing: string;
        passageId: string | null;
        createdAt: string;
        updatedAt: string;
      }>("/api/journal", "POST", draft);
      setEntries((current) =>
        current.map((entry) =>
          entry.id === optimistic.id
            ? {
                ...entry,
                id: created.id,
                createdAt: created.createdAt,
                updatedAt: created.updatedAt,
              }
            : entry,
        ),
      );
      showFlash("Kept. Future-you says thank you.");
    } catch (cause) {
      setEntries((current) => current.filter((entry) => entry.id !== optimistic.id));
      setError(cause instanceof Error ? cause.message : "Could not save that entry.");
      setOpen(true);
    } finally {
      setPending(false);
    }
  };

  const remove = async (entry: JournalItem) => {
    const previous = entries;
    setEntries((current) => current.filter((item) => item.id !== entry.id));
    try {
      await apiRequest(`/api/journal/${entry.id}`, "DELETE");
      showFlash("Entry deleted.");
    } catch (cause) {
      setEntries(previous);
      setError(cause instanceof Error ? cause.message : "Could not delete that entry.");
    }
  };

  const visible =
    moodFilter === "all" ? entries : entries.filter((entry) => entry.mood === moodFilter);

  return (
    <div className="space-y-5">
      <SectionHeading
        eyebrow="Journal"
        title="A place to be honest"
        description="Link a passage, name your mood, and keep the receipt of what God is doing. Entries can stay private or be shared with the household."
        action={
          <Button onClick={startNew}>
            <Icon name="plus" className="h-4 w-4" />
            New entry
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-1.5">
        <button
          type="button"
          onClick={() => setMoodFilter("all")}
          className={`rounded-full border px-3 py-1.5 text-[11px] font-semibold transition ${
            moodFilter === "all" ? "border-pine bg-pine text-cream" : "border-line bg-cream text-ink-soft"
          }`}
        >
          All {entries.length}
        </button>
        {JOURNAL_MOODS.map((mood) => {
          const count = entries.filter((entry) => entry.mood === mood).length;
          if (count === 0) return null;
          return (
            <button
              key={mood}
              type="button"
              onClick={() => setMoodFilter(mood)}
              className={`rounded-full border px-3 py-1.5 text-[11px] font-semibold capitalize transition ${
                moodFilter === mood ? "border-pine bg-pine text-cream" : "border-line bg-cream text-ink-soft"
              }`}
            >
              {mood} {count}
            </button>
          );
        })}
      </div>

      <Notice message={error} />

      {!open ? (
        <section className="card-surface p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-parchment text-pine">
                <Icon name="feather" className="h-4 w-4" />
              </span>
              <div>
                <p className="text-[13px] font-semibold text-ink">Quick capture</p>
                <p className="text-[11px] text-ink-muted">
                  One honest sentence is enough. Click in to open the full composer.
                </p>
              </div>
            </div>
            <Button size="sm" onClick={startNew}>
              <Icon name="plus" className="h-3.5 w-3.5" />
              New
            </Button>
          </div>
          <button
            type="button"
            onClick={startNew}
            className="mt-3 w-full rounded-xl border border-dashed border-line bg-parchment/40 px-4 py-3 text-left text-[13px] text-ink-muted transition hover:border-pine/40 hover:bg-parchment/70"
          >
            What is God doing today?
          </button>
        </section>
      ) : null}

      {visible.length === 0 ? (
        <EmptyState
          icon="feather"
          title={entries.length === 0 ? "Your first page is waiting" : "No entries with that mood"}
          description={
            entries.length === 0
              ? "Start with one sentence about today. You can always edit, link scripture, or share it with the household later."
              : "Try another mood filter, or write something new."
          }
          action={
            <Button onClick={startNew}>
              <Icon name="plus" className="h-4 w-4" />
              Write an entry
            </Button>
          }
        />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {visible.map((entry) => (
            <article
              key={entry.id}
              className={`card-surface animate-fade flex flex-col p-5 transition hover:shadow-lift ${
                entry.id.startsWith("temp-") ? "opacity-70" : ""
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge tone="green">{entry.mood}</Badge>
                    <Badge tone={entry.sharing === "family" ? "sky" : "neutral"}>
                      {entry.sharing === "family" ? (
                        <>
                          <Icon name="users" className="h-3 w-3" /> household
                        </>
                      ) : (
                        "private"
                      )}
                    </Badge>
                  </div>
                  <h3 className="mt-2 font-display text-lg leading-snug text-ink">{entry.title}</h3>
                </div>
                <span className="shrink-0 text-[10px] uppercase tracking-wide text-ink-muted">
                  {formatDate(entry.createdAt)}
                </span>
              </div>
              <p className="mt-2 line-clamp-4 flex-1 whitespace-pre-line text-[13px] leading-relaxed text-ink-soft">
                {entry.body}
              </p>
              <div className="mt-4 flex items-center justify-between gap-2 border-t border-line/70 pt-3">
                <span className="truncate text-[11px] text-ink-muted">
                  {entry.passageReference ? `📖 ${entry.passageReference}` : "No passage linked"}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => startEdit(entry)}
                    className="rounded-lg p-1.5 text-ink-muted transition hover:bg-parchment hover:text-pine"
                    title="Edit entry"
                  >
                    <Icon name="pencil" className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(entry)}
                    className="rounded-lg p-1.5 text-ink-muted transition hover:bg-rose-50 hover:text-rose-600"
                    title="Delete entry"
                  >
                    <Icon name="trash" className="h-3.5 w-3.5" />
                  </button>
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
        title={editing ? "Edit entry" : "New journal entry"}
        subtitle="No performance required. Write like nobody is grading it."
        wide
      >
        <div className="space-y-4">
          <div>
            <label className={labelClass} htmlFor="entry-title">
              Title
            </label>
            <input
              id="entry-title"
              value={draft.title}
              onChange={(event) => setDraft({ ...draft, title: event.target.value })}
              placeholder="What are you carrying today?"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="entry-body">
              Entry
            </label>
            <textarea
              id="entry-body"
              value={draft.body}
              onChange={(event) => setDraft({ ...draft, body: event.target.value })}
              rows={8}
              placeholder="Start anywhere. One honest sentence counts."
              className={`${inputClass} resize-y leading-relaxed`}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <span className={labelClass}>Mood</span>
              <select
                value={draft.mood}
                onChange={(event) => setDraft({ ...draft, mood: event.target.value })}
                className={inputClass}
              >
                {JOURNAL_MOODS.map((mood) => (
                  <option key={mood} value={mood}>
                    {mood}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <span className={labelClass}>Linked passage</span>
              <select
                value={draft.passageId}
                onChange={(event) => setDraft({ ...draft, passageId: event.target.value })}
                className={inputClass}
              >
                <option value="">None</option>
                {passageOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.reference}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <span className={labelClass}>Who can read it</span>
              <select
                value={draft.sharing}
                onChange={(event) => setDraft({ ...draft, sharing: event.target.value })}
                className={inputClass}
              >
                <option value="private">Just me</option>
                <option value="family">Household</option>
              </select>
            </div>
          </div>
          <Notice message={error} />
          <div className="flex items-center justify-end gap-2 pt-1">
            <Button variant="secondary" onClick={closeComposer}>
              Cancel
            </Button>
            <Button onClick={save} disabled={pending}>
              {pending ? <Spinner /> : <Icon name="check" className="h-4 w-4" />}
              {editing ? "Save changes" : "Keep this entry"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
