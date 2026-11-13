"use client";

import Link from "next/link";
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
import { BANDS, getBand } from "@/lib/constants";
import type { DayItem, PassageOption, PlanItem } from "@/lib/types";

type PlanDraft = {
  title: string;
  description: string;
  band: string;
  passageIds: string[];
};

const blankPlan: PlanDraft = { title: "", description: "", band: "family", passageIds: [] };

export function PlansBoard({
  initialPlans,
  passageOptions,
}: {
  initialPlans: PlanItem[];
  passageOptions: PassageOption[];
}) {
  const [plans, setPlans] = useState(initialPlans);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<PlanItem | null>(null);
  const [draft, setDraft] = useState<PlanDraft>(blankPlan);
  const [newDayFor, setNewDayFor] = useState<string | null>(null);
  const [dayTitle, setDayTitle] = useState("");
  const [dayPassage, setDayPassage] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);

  const showFlash = (message: string) => {
    setFlash(message);
    setTimeout(() => setFlash(null), 2600);
  };

  const openNew = () => {
    setEditing(null);
    setDraft(blankPlan);
    setError(null);
    setModalOpen(true);
  };

  const openEdit = (plan: PlanItem) => {
    setEditing(plan);
    setDraft({ title: plan.title, description: plan.description, band: plan.band, passageIds: [] });
    setError(null);
    setModalOpen(true);
  };

  const savePlan = async () => {
    if (!draft.title.trim()) {
      setError("Name your plan first.");
      return;
    }
    setPending(true);
    setError(null);

    if (editing) {
      const previous = plans;
      setPlans((current) =>
        current.map((plan) =>
          plan.id === editing.id
            ? { ...plan, title: draft.title, description: draft.description, band: draft.band }
            : plan,
        ),
      );
      setModalOpen(false);
      try {
        await apiRequest(`/api/plans/${editing.id}`, "PATCH", draft);
        showFlash("Plan updated.");
      } catch (cause) {
        setPlans(previous);
        setError(cause instanceof Error ? cause.message : "Update failed.");
        setModalOpen(true);
      } finally {
        setPending(false);
      }
      return;
    }

    const optimistic: PlanItem = {
      id: tempId(),
      title: draft.title,
      description: draft.description,
      band: draft.band,
      isActive: true,
      createdAt: new Date().toISOString(),
      days: draft.passageIds.map((passageId, index) => ({
        id: tempId(),
        planId: "temp",
        dayNumber: index + 1,
        title: `Day ${index + 1}`,
        passageId,
        passageReference: passageOptions.find((option) => option.id === passageId)?.reference ?? null,
        completed: false,
      })),
    };
    setPlans((current) => [optimistic, ...current]);
    setModalOpen(false);
    try {
      const created = await apiRequest<{
        id: string;
        createdAt: string;
        days: { id: string; dayNumber: number; title: string; passageId: string | null }[];
      }>("/api/plans", "POST", draft);
      setPlans((current) =>
        current.map((plan) =>
          plan.id === optimistic.id
            ? {
                ...plan,
                id: created.id,
                createdAt: created.createdAt,
                days: created.days.map((day) => ({
                  id: day.id,
                  planId: created.id,
                  dayNumber: day.dayNumber,
                  title: day.title,
                  passageId: day.passageId,
                  passageReference:
                    passageOptions.find((option) => option.id === day.passageId)?.reference ?? null,
                  completed: false,
                })),
              }
            : plan,
        ),
      );
      showFlash("Plan is live.");
    } catch (cause) {
      setPlans((current) => current.filter((plan) => plan.id !== optimistic.id));
      setError(cause instanceof Error ? cause.message : "Could not create that plan.");
      setModalOpen(true);
    } finally {
      setPending(false);
    }
  };

  const removePlan = async (plan: PlanItem) => {
    const previous = plans;
    setPlans((current) => current.filter((item) => item.id !== plan.id));
    try {
      await apiRequest(`/api/plans/${plan.id}`, "DELETE");
      showFlash("Plan removed.");
    } catch (cause) {
      setPlans(previous);
      setError(cause instanceof Error ? cause.message : "Could not remove that plan.");
    }
  };

  const toggleActive = async (plan: PlanItem) => {
    const previous = plans;
    setPlans((current) =>
      current.map((item) => (item.id === plan.id ? { ...item, isActive: !item.isActive } : item)),
    );
    try {
      await apiRequest(`/api/plans/${plan.id}`, "PATCH", { isActive: !plan.isActive });
    } catch (cause) {
      setPlans(previous);
      setError(cause instanceof Error ? cause.message : "Could not update that plan.");
    }
  };

  const toggleDay = async (plan: PlanItem, day: DayItem) => {
    const next = !day.completed;
    setPlans((current) =>
      current.map((item) =>
        item.id === plan.id
          ? {
              ...item,
              days: item.days.map((entry) =>
                entry.id === day.id ? { ...entry, completed: next } : entry,
              ),
            }
          : item,
      ),
    );
    try {
      await apiRequest(`/api/days/${day.id}`, "PATCH", { completed: next });
      if (next) {
        await apiRequest("/api/reading", "POST", { passageId: day.passageId, band: "grown" }).catch(
          () => undefined,
        );
        showFlash("Day complete. One step further.");
      }
    } catch (cause) {
      setPlans((current) =>
        current.map((item) =>
          item.id === plan.id
            ? {
                ...item,
                days: item.days.map((entry) =>
                  entry.id === day.id ? { ...entry, completed: !next } : entry,
                ),
              }
            : item,
        ),
      );
      setError(cause instanceof Error ? cause.message : "Could not update that day.");
    }
  };

  const addDay = async (plan: PlanItem) => {
    if (!dayTitle.trim() && !dayPassage) {
      setError("Name the day or pick a passage.");
      return;
    }
    setPending(true);
    setError(null);
    const optimistic: DayItem = {
      id: tempId(),
      planId: plan.id,
      dayNumber: plan.days.length + 1,
      title: dayTitle.trim() || `Day ${plan.days.length + 1}`,
      passageId: dayPassage || null,
      passageReference: passageOptions.find((option) => option.id === dayPassage)?.reference ?? null,
      completed: false,
    };
    setPlans((current) =>
      current.map((item) =>
        item.id === plan.id ? { ...item, days: [...item.days, optimistic] } : item,
      ),
    );
    setNewDayFor(null);
    setDayTitle("");
    setDayPassage("");
    try {
      const created = await apiRequest<{ id: string }>(`/api/plans/${plan.id}/days`, "POST", {
        title: optimistic.title,
        passageId: optimistic.passageId,
      });
      setPlans((current) =>
        current.map((item) =>
          item.id === plan.id
            ? {
                ...item,
                days: item.days.map((entry) =>
                  entry.id === optimistic.id ? { ...entry, id: created.id } : entry,
                ),
              }
            : item,
        ),
      );
      showFlash("Day added.");
    } catch (cause) {
      setPlans((current) =>
        current.map((item) =>
          item.id === plan.id
            ? { ...item, days: item.days.filter((entry) => entry.id !== optimistic.id) }
            : item,
        ),
      );
      setError(cause instanceof Error ? cause.message : "Could not add that day.");
    } finally {
      setPending(false);
    }
  };

  const removeDay = async (plan: PlanItem, day: DayItem) => {
    const previous = plans;
    setPlans((current) =>
      current.map((item) =>
        item.id === plan.id
          ? { ...item, days: item.days.filter((entry) => entry.id !== day.id) }
          : item,
      ),
    );
    try {
      await apiRequest(`/api/days/${day.id}`, "DELETE");
    } catch (cause) {
      setPlans(previous);
      setError(cause instanceof Error ? cause.message : "Could not remove that day.");
    }
  };

  return (
    <div className="space-y-5">
      <SectionHeading
        eyebrow="Reading plans"
        title="Small steps, kept"
        description="Build a plan from any passages in the library, then tick a day at a time. Completed days count toward the household streak."
        action={
          <Button onClick={openNew}>
            <Icon name="plus" className="h-4 w-4" />
            New plan
          </Button>
        }
      />

      <Notice message={error} />

      {plans.length === 0 ? (
        <EmptyState
          icon="route"
          title="No plans yet"
          description="Pick three passages and three days. That's enough for a first plan — you can always add more."
          action={
            <Button onClick={openNew}>
              <Icon name="plus" className="h-4 w-4" />
              Build a plan
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {plans.map((plan) => {
            const done = plan.days.filter((day) => day.completed).length;
            const progress = plan.days.length > 0 ? Math.round((done / plan.days.length) * 100) : 0;
            return (
              <section key={plan.id} className={`card-surface animate-fade flex flex-col p-5 ${!plan.isActive ? "opacity-90" : ""}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Badge tone={plan.isActive ? "green" : "neutral"}>
                        {plan.isActive ? "active" : "paused"}
                      </Badge>
                      <Badge tone="gold">
                        {plan.band === "family" ? "whole household" : getBand(plan.band).label}
                      </Badge>
                    </div>
                    <h2 className="mt-2 font-display text-lg leading-tight text-ink">{plan.title}</h2>
                    <p className="mt-0.5 line-clamp-2 text-[11px] leading-relaxed text-ink-muted">
                      {plan.description || "No description"}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-0.5">
                    <button
                      type="button"
                      onClick={() => toggleActive(plan)}
                      title={plan.isActive ? "Pause plan" : "Activate plan"}
                      className="rounded-lg p-1.5 text-ink-muted transition hover:bg-parchment hover:text-pine"
                    >
                      <Icon name={plan.isActive ? "check" : "clock"} className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => openEdit(plan)}
                      title="Edit plan"
                      className="rounded-lg p-1.5 text-ink-muted transition hover:bg-parchment hover:text-pine"
                    >
                      <Icon name="pencil" className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removePlan(plan)}
                      title="Delete plan"
                      className="rounded-lg p-1.5 text-ink-muted transition hover:bg-rose-50 hover:text-rose-600"
                    >
                      <Icon name="trash" className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex items-center justify-between text-[11px] text-ink-muted">
                    <span>
                      {done} of {plan.days.length} days
                    </span>
                    <span className="font-semibold text-pine">{progress}%</span>
                  </div>
                  <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-parchment-deep">
                    <div
                      className="h-full rounded-full bg-pine transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                <ul className="mt-4 flex-1 space-y-1">
                  {plan.days.map((day) => (
                    <li
                      key={day.id}
                      className={`group flex items-center gap-2.5 rounded-xl border px-2.5 py-2 transition ${
                        day.completed
                          ? "border-emerald-100 bg-emerald-50/40"
                          : "border-line/60 bg-parchment/30 hover:border-pine/25"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => toggleDay(plan, day)}
                        aria-label={day.completed ? "Mark incomplete" : "Mark complete"}
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition ${
                          day.completed
                            ? "border-pine bg-pine text-cream"
                            : "border-line bg-cream text-transparent hover:border-pine"
                        }`}
                      >
                        <Icon name="check" className="h-3 w-3" />
                      </button>
                      <div className="min-w-0 flex-1">
                        <p
                          className={`truncate text-[12px] font-medium ${
                            day.completed ? "text-ink-muted line-through" : "text-ink"
                          }`}
                        >
                          {day.dayNumber}. {day.title}
                        </p>
                        {day.passageReference ? (
                          <Link
                            href={`/read?passage=${encodeURIComponent(
                              passageOptions.find((option) => option.id === day.passageId)?.slug ?? "",
                            )}`}
                            className="text-[10px] text-pine hover:underline"
                          >
                            {day.passageReference}
                          </Link>
                        ) : (
                          <span className="text-[10px] text-ink-muted">No passage linked</span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeDay(plan, day)}
                        className="rounded p-1 text-ink-muted opacity-0 transition group-hover:opacity-100 hover:text-rose-600"
                        title="Remove day"
                      >
                        <Icon name="close" className="h-3 w-3" />
                      </button>
                    </li>
                  ))}
                  {plan.days.length === 0 ? (
                    <li className="rounded-xl border border-dashed border-line px-3 py-5 text-center text-[11px] text-ink-muted">
                      No days yet — add the first one below.
                    </li>
                  ) : null}
                </ul>

                {newDayFor === plan.id ? (
                  <div className="mt-3 space-y-2 rounded-xl border border-line bg-parchment/40 p-3">
                    <input
                      value={dayTitle}
                      onChange={(event) => setDayTitle(event.target.value)}
                      placeholder="Day title (optional)"
                      className={inputClass}
                    />
                    <select
                      value={dayPassage}
                      onChange={(event) => setDayPassage(event.target.value)}
                      className={inputClass}
                    >
                      <option value="">Pick a passage</option>
                      {passageOptions.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.reference} — {option.theme}
                        </option>
                      ))}
                    </select>
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => setNewDayFor(null)}>
                        Cancel
                      </Button>
                      <Button size="sm" onClick={() => addDay(plan)} disabled={pending}>
                        {pending ? <Spinner className="h-3.5 w-3.5" /> : <Icon name="plus" className="h-3.5 w-3.5" />}
                        Add day
                      </Button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setNewDayFor(plan.id);
                      setDayTitle("");
                      setDayPassage("");
                      setError(null);
                    }}
                    className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-line bg-parchment/30 px-3 py-2 text-[11px] font-semibold text-ink-soft transition hover:border-pine/40 hover:text-pine"
                  >
                    <Icon name="plus" className="h-3.5 w-3.5" />
                    Add a day
                  </button>
                )}
              </section>
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
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit plan" : "Build a reading plan"}
        subtitle={editing ? "Rename it, re-band it, or pause it." : "Choose a few passages and we'll build the days."}
        wide
      >
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-[1.6fr_1fr]">
            <div>
              <label className={labelClass} htmlFor="plan-title">
                Plan name
              </label>
              <input
                id="plan-title"
                value={draft.title}
                onChange={(event) => setDraft({ ...draft, title: event.target.value })}
                placeholder="7 Days of Brave"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="plan-band">
                Who is it for
              </label>
              <select
                id="plan-band"
                value={draft.band}
                onChange={(event) => setDraft({ ...draft, band: event.target.value })}
                className={inputClass}
              >
                <option value="family">Whole household</option>
                {BANDS.map((band) => (
                  <option key={band.id} value={band.id}>
                    {band.label} · {band.short}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className={labelClass} htmlFor="plan-description">
              Description
            </label>
            <textarea
              id="plan-description"
              value={draft.description}
              onChange={(event) => setDraft({ ...draft, description: event.target.value })}
              rows={2}
              placeholder="What is this plan for?"
              className={inputClass}
            />
          </div>
          {!editing ? (
            <div>
              <span className={labelClass}>
                Passages ({draft.passageIds.length} selected)
              </span>
              <div className="scroll-fade max-h-56 space-y-1 overflow-y-auto rounded-xl border border-line bg-parchment/40 p-2">
                {passageOptions.map((option) => {
                  const checked = draft.passageIds.includes(option.id);
                  return (
                    <label
                      key={option.id}
                      className={`flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs transition ${
                        checked ? "bg-cream shadow-sm" : "hover:bg-cream/60"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() =>
                          setDraft((current) => ({
                            ...current,
                            passageIds: checked
                              ? current.passageIds.filter((id) => id !== option.id)
                              : [...current.passageIds, option.id],
                          }))
                        }
                        className="h-3.5 w-3.5 rounded border-line accent-pine"
                      />
                      <span className="flex-1 font-medium text-ink">{option.reference}</span>
                      <span className="text-[10px] uppercase tracking-wide text-ink-muted">{option.theme}</span>
                    </label>
                  );
                })}
              </div>
              <p className="mt-1 text-[10px] text-ink-muted">
                Selected passages become Day 1, Day 2, Day 3 in order.
              </p>
            </div>
          ) : null}
          <Notice message={error} />
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={savePlan} disabled={pending}>
              {pending ? <Spinner /> : <Icon name="route" className="h-4 w-4" />}
              {editing ? "Save plan" : "Create plan"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
