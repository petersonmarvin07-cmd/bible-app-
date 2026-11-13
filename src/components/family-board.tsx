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
import { BANDS, getBand } from "@/lib/constants";
import type { FamilyItem } from "@/lib/types";

type Draft = { name: string; band: string; emoji: string; role: string; streak: number };
const blankDraft: Draft = { name: "", band: "explorer", emoji: "🌱", role: "child", streak: 0 };
const EMOJIS = ["🌿", "🎧", "🦋", "🐢", "🫖", "🌻", "🔥", "🕊️", "⚓", "🌙", "🐣", "🧭"];

export function FamilyBoard({
  initialMembers,
  householdName,
}: {
  initialMembers: FamilyItem[];
  householdName: string;
}) {
  const [members, setMembers] = useState(initialMembers);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<FamilyItem | null>(null);
  const [draft, setDraft] = useState<Draft>(blankDraft);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);

  const showFlash = (message: string) => {
    setFlash(message);
    setTimeout(() => setFlash(null), 2600);
  };

  const openNew = () => {
    setEditing(null);
    setDraft(blankDraft);
    setError(null);
    setOpen(true);
  };

  const openEdit = (member: FamilyItem) => {
    setEditing(member);
    setDraft({
      name: member.name,
      band: member.band,
      emoji: member.emoji,
      role: member.role,
      streak: member.streak,
    });
    setError(null);
    setOpen(true);
  };

  const save = async () => {
    if (!draft.name.trim()) {
      setError("Who is joining the circle?");
      return;
    }
    setPending(true);
    setError(null);

    if (editing) {
      const previous = members;
      setMembers((current) =>
        current.map((member) => (member.id === editing.id ? { ...member, ...draft } : member)),
      );
      setOpen(false);
      try {
        await apiRequest(`/api/family/${editing.id}`, "PATCH", draft);
        showFlash("Family member updated.");
      } catch (cause) {
        setMembers(previous);
        setError(cause instanceof Error ? cause.message : "Update failed.");
        setOpen(true);
      } finally {
        setPending(false);
      }
      return;
    }

    const optimistic: FamilyItem = { id: tempId(), ...draft };
    setMembers((current) => [...current, optimistic]);
    setOpen(false);
    try {
      const created = await apiRequest<{ id: string }>("/api/family", "POST", draft);
      setMembers((current) =>
        current.map((member) => (member.id === optimistic.id ? { ...member, id: created.id } : member)),
      );
      showFlash(`${draft.name} joined the circle.`);
    } catch (cause) {
      setMembers((current) => current.filter((member) => member.id !== optimistic.id));
      setError(cause instanceof Error ? cause.message : "Could not add that member.");
      setOpen(true);
    } finally {
      setPending(false);
    }
  };

  const remove = async (member: FamilyItem) => {
    const previous = members;
    setMembers((current) => current.filter((item) => item.id !== member.id));
    try {
      await apiRequest(`/api/family/${member.id}`, "DELETE");
    } catch (cause) {
      setMembers(previous);
      setError(cause instanceof Error ? cause.message : "Could not remove that member.");
    }
  };

  const cheer = async (member: FamilyItem) => {
    const next = member.streak + 1;
    setMembers((current) =>
      current.map((item) => (item.id === member.id ? { ...item, streak: next } : item)),
    );
    try {
      await apiRequest(`/api/family/${member.id}`, "PATCH", { streak: next });
    } catch {
      setMembers((current) =>
        current.map((item) => (item.id === member.id ? { ...item, streak: member.streak } : item)),
      );
    }
  };

  const totalStreak = members.reduce((sum, member) => sum + member.streak, 0);
  const bandCounts = BANDS.map((band) => ({
    band,
    count: members.filter((member) => member.band === band.id).length,
  }));

  return (
    <div className="space-y-5">
      <SectionHeading
        eyebrow="Family circle"
        title={householdName}
        description="One household, every age band. Cheer someone's streak, add a new member, or set the reading level each person sees by default."
        action={
          <Button onClick={openNew}>
            <Icon name="plus" className="h-4 w-4" />
            Add member
          </Button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-[1.4fr_1fr]">
        <div className="card-surface flex flex-wrap items-center gap-5 p-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-muted">
              Circle streak (combined)
            </p>
            <p className="mt-1 flex items-center gap-1.5 font-display text-2xl text-ink">
              <Icon name="flame" className="h-5 w-5 text-clay" filled />
              {totalStreak} days
            </p>
          </div>
          <div className="h-10 w-px bg-line" />
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-muted">
              Reading bands represented
            </p>
            <div className="mt-1 flex flex-wrap gap-1">
              {bandCounts
                .filter((item) => item.count > 0)
                .map(({ band, count }) => (
                  <Badge key={band.id} tone="green">
                    {band.emoji} {count}
                  </Badge>
                ))}
              {members.length === 0 ? <span className="text-xs text-ink-muted">None yet</span> : null}
            </div>
          </div>
        </div>
        <div className="card-surface p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-muted">
            How bands work
          </p>
          <p className="mt-1 text-[12px] leading-relaxed text-ink-muted">
            Each member&rsquo;s band sets the default retelling they see in the reader. Anyone can
            switch bands at any time — this is a starting point, not a ceiling.
          </p>
        </div>
      </div>

      <Notice message={error} />

      {members.length === 0 ? (
        <EmptyState
          icon="users"
          title="The circle is empty"
          description="Add the people you read with — grandma, the five-year-old, the teenager who asks the hard questions."
          action={
            <Button onClick={openNew}>
              <Icon name="plus" className="h-4 w-4" />
              Add the first member
            </Button>
          }
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {members.map((member) => {
            const band = getBand(member.band);
            return (
              <article
                key={member.id}
                className={`card-surface animate-fade p-4 ${member.id.startsWith("temp-") ? "opacity-70" : ""}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-parchment text-xl shadow-inner">
                      {member.emoji}
                    </span>
                    <div>
                      <p className="font-display text-[16px] leading-tight text-ink">{member.name}</p>
                      <p className="text-[11px] capitalize text-ink-muted">{member.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5">
                    <button
                      type="button"
                      onClick={() => openEdit(member)}
                      className="rounded p-1.5 text-ink-muted transition hover:bg-parchment hover:text-pine"
                      title="Edit member"
                    >
                      <Icon name="pencil" className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(member)}
                      className="rounded p-1.5 text-ink-muted transition hover:bg-rose-50 hover:text-rose-600"
                      title="Remove member"
                    >
                      <Icon name="trash" className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-1.5">
                  <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${band.tone}`}>
                    {band.emoji} {band.label}
                  </span>
                  <span className="text-[10px] text-ink-muted">{band.short}</span>
                </div>
                <p className="mt-2 text-[11px] leading-relaxed text-ink-muted">{band.blurb}</p>

                <div className="mt-3 flex items-center justify-between rounded-xl border border-line/70 bg-parchment/40 px-3 py-2">
                  <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-clay">
                    <Icon name="flame" className="h-3.5 w-3.5" filled />
                    {member.streak} day streak
                  </span>
                  <button
                    type="button"
                    onClick={() => cheer(member)}
                    className="rounded-full border border-line bg-cream px-2 py-1 text-[10px] font-semibold text-ink-soft transition hover:border-pine/40 hover:text-pine"
                  >
                    +1 cheer
                  </button>
                </div>
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
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Edit member" : "Add to the circle"}
        subtitle="Lumen uses the band to choose which retelling appears first."
      >
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className={labelClass} htmlFor="member-name">
                Name
              </label>
              <input
                id="member-name"
                value={draft.name}
                onChange={(event) => setDraft({ ...draft, name: event.target.value })}
                placeholder="Ada"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="member-role">
                Role
              </label>
              <select
                id="member-role"
                value={draft.role}
                onChange={(event) => setDraft({ ...draft, role: event.target.value })}
                className={`${inputClass} capitalize`}
              >
                {["parent", "child", "grandparent", "member"].map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <span className={labelClass}>Reading band</span>
            <div className="grid grid-cols-2 gap-2">
              {BANDS.map((band) => (
                <button
                  key={band.id}
                  type="button"
                  onClick={() => setDraft({ ...draft, band: band.id })}
                  className={`rounded-xl border px-3 py-2 text-left text-xs transition ${
                    draft.band === band.id
                      ? "border-pine bg-pine/5 shadow-sm"
                      : "border-line bg-cream hover:border-pine/30"
                  }`}
                >
                  <span className="font-semibold text-ink">
                    {band.emoji} {band.label}
                  </span>
                  <span className="mt-0.5 block text-[10px] text-ink-muted">{band.short}</span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <span className={labelClass}>Avatar</span>
            <div className="flex flex-wrap gap-1.5">
              {EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setDraft({ ...draft, emoji })}
                  className={`flex h-9 w-9 items-center justify-center rounded-xl border text-base transition ${
                    draft.emoji === emoji ? "border-pine bg-pine/5" : "border-line bg-cream hover:border-pine/30"
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className={labelClass} htmlFor="member-streak">
              Current streak (days)
            </label>
            <input
              id="member-streak"
              type="number"
              min={0}
              value={draft.streak}
              onChange={(event) => setDraft({ ...draft, streak: Number(event.target.value) })}
              className={inputClass}
            />
          </div>
          <Notice message={error} />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={save} disabled={pending}>
              {pending ? <Spinner /> : <Icon name="check" className="h-4 w-4" />}
              {editing ? "Save member" : "Add to circle"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
