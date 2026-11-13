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
import { getBand, relativeDay } from "@/lib/constants";
import type { FamilyItem, WonderItem } from "@/lib/types";

type Draft = { askedBy: string; askedAge: number; question: string };
const blankDraft: Draft = { askedBy: "", askedAge: 8, question: "" };

function bandForAge(age: number) {
  if (age < 8) return getBand("little");
  if (age < 13) return getBand("explorer");
  if (age < 18) return getBand("youth");
  return getBand("grown");
}

export function WonderBoard({
  initialWonders,
  family,
  answererName,
}: {
  initialWonders: WonderItem[];
  family: FamilyItem[];
  answererName: string;
}) {
  const [wonders, setWonders] = useState(initialWonders);
  const [tab, setTab] = useState<"open" | "answered" | "all">("all");
  const [askOpen, setAskOpen] = useState(false);
  const [draft, setDraft] = useState<Draft>(blankDraft);
  const [answerFor, setAnswerFor] = useState<WonderItem | null>(null);
  const [answerText, setAnswerText] = useState("");
  const [editingQuestion, setEditingQuestion] = useState<WonderItem | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);

  const showFlash = (message: string) => {
    setFlash(message);
    setTimeout(() => setFlash(null), 2600);
  };

  const ask = async () => {
    if (draft.question.trim().length < 4) {
      setError("Ask a full question — even a funny one.");
      return;
    }
    setPending(true);
    setError(null);
    const optimistic: WonderItem = {
      id: tempId(),
      askedBy: draft.askedBy.trim() || "Someone curious",
      askedAge: draft.askedAge,
      question: draft.question,
      answer: "",
      answeredBy: "",
      status: "open",
      createdAt: new Date().toISOString(),
    };
    setWonders((current) => [optimistic, ...current]);
    setAskOpen(false);
    setDraft({ ...blankDraft, askedBy: draft.askedBy, askedAge: draft.askedAge });
    try {
      const created = await apiRequest<{ id: string; createdAt: string }>("/api/wonders", "POST", draft);
      setWonders((current) =>
        current.map((wonder) =>
          wonder.id === optimistic.id ? { ...wonder, id: created.id, createdAt: created.createdAt } : wonder,
        ),
      );
      showFlash("Pinned to the wonder wall.");
    } catch (cause) {
      setWonders((current) => current.filter((wonder) => wonder.id !== optimistic.id));
      setError(cause instanceof Error ? cause.message : "Could not pin that question.");
      setAskOpen(true);
    } finally {
      setPending(false);
    }
  };

  const saveAnswer = async () => {
    if (!answerFor) return;
    if (!answerText.trim()) {
      setError("An answer needs at least a sentence.");
      return;
    }
    const target = answerFor;
    const previous = wonders;
    setPending(true);
    setError(null);
    setWonders((current) =>
      current.map((wonder) =>
        wonder.id === target.id
          ? { ...wonder, answer: answerText, answeredBy: answererName, status: "answered" }
          : wonder,
      ),
    );
    setAnswerFor(null);
    try {
      await apiRequest(`/api/wonders/${target.id}`, "PATCH", { answer: answerText, answeredBy: answererName });
      showFlash("Answered. Curious faith grows here.");
    } catch (cause) {
      setWonders(previous);
      setError(cause instanceof Error ? cause.message : "Could not save that answer.");
    } finally {
      setPending(false);
    }
  };

  const reopen = async (wonder: WonderItem) => {
    const previous = wonders;
    setWonders((current) =>
      current.map((item) =>
        item.id === wonder.id ? { ...item, status: "open", answer: "", answeredBy: "" } : item,
      ),
    );
    try {
      await apiRequest(`/api/wonders/${wonder.id}`, "PATCH", { status: "open" });
    } catch {
      setWonders(previous);
    }
  };

  const remove = async (wonder: WonderItem) => {
    const previous = wonders;
    setWonders((current) => current.filter((item) => item.id !== wonder.id));
    try {
      await apiRequest(`/api/wonders/${wonder.id}`, "DELETE");
    } catch (cause) {
      setWonders(previous);
      setError(cause instanceof Error ? cause.message : "Could not remove that wonder.");
    }
  };

  const saveQuestion = async () => {
    if (!editingQuestion) return;
    if (editingQuestion.question.trim().length < 4 || !editingQuestion.askedBy.trim()) {
      setError("A question and a name, please.");
      return;
    }
    const previous = wonders;
    const target = editingQuestion;
    setWonders((current) => current.map((item) => (item.id === target.id ? target : item)));
    setEditingQuestion(null);
    try {
      await apiRequest(`/api/wonders/${target.id}`, "PATCH", {
        question: target.question,
        askedBy: target.askedBy,
        askedAge: target.askedAge,
      });
      showFlash("Question updated.");
    } catch (cause) {
      setWonders(previous);
      setError(cause instanceof Error ? cause.message : "Could not update that question.");
    }
  };

  const visible = wonders.filter((wonder) => {
    if (tab === "open") return wonder.status === "open";
    if (tab === "answered") return wonder.status === "answered";
    return true;
  });
  const openCount = wonders.filter((wonder) => wonder.status === "open").length;

  return (
    <div className="space-y-5">
      <SectionHeading
        eyebrow="Wonder wall"
        title="Nothing curious gets dismissed"
        description="Kids pin their questions here. Grown-ups write back. Ages 5 to 15 ask the sharpest things — treat every one as an invitation."
        action={
          <Button onClick={() => setAskOpen(true)}>
            <Icon name="plus" className="h-4 w-4" />
            Ask a wonder
          </Button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="card-surface flex items-center gap-3 p-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-700">
            <Icon name="sparkles" className="h-4 w-4" />
          </span>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-muted">Open</p>
            <p className="font-display text-lg leading-none text-ink">{openCount} questions</p>
          </div>
        </div>
        <div className="card-surface flex items-center gap-3 p-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-700">
            <Icon name="check" className="h-4 w-4" />
          </span>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-muted">Answered</p>
            <p className="font-display text-lg leading-none text-ink">{wonders.length - openCount} wonders</p>
          </div>
        </div>
        <div className="card-surface flex items-center gap-3 p-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/10 text-sky-700">
            <Icon name="users" className="h-4 w-4" />
          </span>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-muted">Curious minds</p>
            <p className="font-display text-lg leading-none text-ink">
              {new Set(wonders.map((wonder) => wonder.askedBy)).size} askers
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        {(
          [
            { id: "all", label: "All wonders" },
            { id: "open", label: "Waiting for a grown-up" },
            { id: "answered", label: "Answered" },
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
          icon="sparkles"
          title="The wall is waiting for a question"
          description="Ask the thing you've been wondering about scripture. Kids' questions are especially welcome here."
          action={
            <Button onClick={() => setAskOpen(true)}>
              <Icon name="plus" className="h-4 w-4" />
              Ask the first wonder
            </Button>
          }
        />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {visible.map((wonder) => {
            const band = bandForAge(wonder.askedAge);
            return (
              <article
                key={wonder.id}
                className={`card-surface animate-fade flex flex-col p-5 ${
                  wonder.status === "open" ? "border-amber-200/80" : ""
                } ${wonder.id.startsWith("temp-") ? "opacity-70" : ""}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-50 text-base">
                      {band.emoji}
                    </span>
                    <div>
                      <p className="text-[13px] font-semibold text-ink">
                        {wonder.askedBy} <span className="font-normal text-ink-muted">· age {wonder.askedAge}</span>
                      </p>
                      <p className="text-[10px] text-ink-muted">{relativeDay(wonder.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5">
                    <Badge tone={wonder.status === "open" ? "gold" : "green"}>
                      {wonder.status === "open" ? "open" : "answered"}
                    </Badge>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingQuestion(wonder);
                        setError(null);
                      }}
                      className="rounded p-1 text-ink-muted transition hover:text-pine"
                      title="Edit question"
                    >
                      <Icon name="pencil" className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(wonder)}
                      className="rounded p-1 text-ink-muted transition hover:text-rose-600"
                      title="Delete wonder"
                    >
                      <Icon name="trash" className="h-3 w-3" />
                    </button>
                  </div>
                </div>

                <p className="mt-3 flex-1 font-display text-[16px] leading-relaxed text-ink">
                  &ldquo;{wonder.question}&rdquo;
                </p>

                {wonder.status === "answered" ? (
                  <div className="mt-3 rounded-xl border border-emerald-200/70 bg-emerald-50/60 p-3.5">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-800">
                      {wonder.answeredBy || "Grown-up"} answered
                    </p>
                    <p className="mt-1 text-[13px] leading-relaxed text-emerald-950">{wonder.answer}</p>
                    <button
                      type="button"
                      onClick={() => reopen(wonder)}
                      className="mt-2 text-[10px] font-medium text-emerald-800 underline underline-offset-2"
                    >
                      Keep exploring
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setAnswerFor(wonder);
                      setAnswerText("");
                      setError(null);
                    }}
                    className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-amber-300 bg-amber-50/50 px-3 py-2.5 text-[11px] font-semibold text-amber-900 transition hover:bg-amber-50"
                  >
                    <Icon name="feather" className="h-3.5 w-3.5" />
                    Answer as a grown-up
                  </button>
                )}
              </article>
            );
          })}
        </div>
      )}

      {flash ? (
        <div className="animate-rise fixed bottom-5 left-1/2 z-40 -translate-x-1/2 rounded-full bg-pine px-4 py-2 text-xs font-medium text-cream shadow-lift">
          {flash}
        </div>
      ) : null}

      <Modal
        open={askOpen}
        onClose={() => setAskOpen(false)}
        title="Ask a wonder"
        subtitle="The best questions usually start with 'why' or 'what if'."
      >
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className={labelClass} htmlFor="wonder-name">
                Who is asking
              </label>
              {family.length > 0 ? (
                <select
                  id="wonder-name"
                  value={draft.askedBy}
                  onChange={(event) => {
                    const member = family.find((item) => item.name === event.target.value);
                    setDraft({
                      ...draft,
                      askedBy: event.target.value,
                      askedAge: member
                        ? member.band === "little"
                          ? 6
                          : member.band === "explorer"
                            ? 10
                            : member.band === "youth"
                              ? 15
                              : 35
                        : draft.askedAge,
                    });
                  }}
                  className={inputClass}
                >
                  <option value="">Someone curious</option>
                  {family.map((member) => (
                    <option key={member.id} value={member.name}>
                      {member.emoji} {member.name}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  id="wonder-name"
                  value={draft.askedBy}
                  onChange={(event) => setDraft({ ...draft, askedBy: event.target.value })}
                  placeholder="Name"
                  className={inputClass}
                />
              )}
            </div>
            <div>
              <label className={labelClass} htmlFor="wonder-age">
                Age
              </label>
              <input
                id="wonder-age"
                type="number"
                min={2}
                max={105}
                value={draft.askedAge}
                onChange={(event) => setDraft({ ...draft, askedAge: Number(event.target.value) })}
                className={inputClass}
              />
            </div>
          </div>
          <div>
            <label className={labelClass} htmlFor="wonder-question">
              The wonder
            </label>
            <textarea
              id="wonder-question"
              value={draft.question}
              onChange={(event) => setDraft({ ...draft, question: event.target.value })}
              rows={4}
              placeholder="If God made everything, who made God?"
              className={inputClass}
            />
          </div>
          <div className="rounded-xl border border-amber-200 bg-amber-50/60 px-3 py-2 text-[11px] leading-relaxed text-amber-900">
            {bandForAge(draft.askedAge).emoji} We&rsquo;ll tag this for{" "}
            <strong>{bandForAge(draft.askedAge).label}</strong> ({bandForAge(draft.askedAge).short}) so
            answers match the reader.
          </div>
          <Notice message={error} />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setAskOpen(false)}>
              Cancel
            </Button>
            <Button onClick={ask} disabled={pending}>
              {pending ? <Spinner /> : <Icon name="sparkles" className="h-4 w-4" />}
              Pin the wonder
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={answerFor !== null}
        onClose={() => setAnswerFor(null)}
        title="Answer with care"
        subtitle={answerFor ? `${answerFor.askedBy}, age ${answerFor.askedAge}` : ""}
      >
        <div className="space-y-4">
          <div className="rounded-xl border border-line bg-parchment/50 p-3 font-display text-sm italic leading-relaxed text-ink">
            &ldquo;{answerFor?.question}&rdquo;
          </div>
          <div>
            <label className={labelClass} htmlFor="wonder-answer">
              Your answer
            </label>
            <textarea
              id="wonder-answer"
              value={answerText}
              onChange={(event) => setAnswerText(event.target.value)}
              rows={4}
              placeholder="It's okay not to know everything — wonder alongside them."
              className={inputClass}
            />
          </div>
          <p className="text-[11px] leading-relaxed text-ink-muted">
            Answering as <strong>{answererName}</strong>. You can always reopen the question later.
          </p>
          <Notice message={error} />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setAnswerFor(null)}>
              Cancel
            </Button>
            <Button onClick={saveAnswer} disabled={pending}>
              {pending ? <Spinner /> : <Icon name="check" className="h-4 w-4" />}
              Post answer
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={editingQuestion !== null}
        onClose={() => setEditingQuestion(null)}
        title="Edit the question"
      >
        <div className="space-y-4">
          {editingQuestion ? (
            <>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Asked by</label>
                  <input
                    value={editingQuestion.askedBy}
                    onChange={(event) =>
                      setEditingQuestion({ ...editingQuestion, askedBy: event.target.value })
                    }
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Age</label>
                  <input
                    type="number"
                    min={2}
                    max={105}
                    value={editingQuestion.askedAge}
                    onChange={(event) =>
                      setEditingQuestion({ ...editingQuestion, askedAge: Number(event.target.value) })
                    }
                    className={inputClass}
                  />
                </div>
              </div>
              <div>
                <label className={labelClass}>Question</label>
                <textarea
                  value={editingQuestion.question}
                  onChange={(event) =>
                    setEditingQuestion({ ...editingQuestion, question: event.target.value })
                  }
                  rows={4}
                  className={inputClass}
                />
              </div>
            </>
          ) : null}
          <Notice message={error} />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setEditingQuestion(null)}>
              Cancel
            </Button>
            <Button onClick={saveQuestion} disabled={pending}>
              {pending ? <Spinner /> : <Icon name="check" className="h-4 w-4" />}
              Save question
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
