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
import { COLLECTION_ACCENTS, accentFor, formatDate } from "@/lib/constants";
import type { CollectionItem, VerseItem } from "@/lib/types";

type CollectionDraft = { name: string; description: string; emoji: string; accent: string };
type VerseDraft = { reference: string; text: string; note: string };

const blankCollection: CollectionDraft = { name: "", description: "", emoji: "📖", accent: "sage" };
const blankVerse: VerseDraft = { reference: "", text: "", note: "" };
const EMOJIS = ["📖", "⚓", "🌙", "🕯️", "🌻", "🫧", "🛡️", "🕊️", "🌱", "✨"];

export function CollectionsBoard({ initialCollections }: { initialCollections: CollectionItem[] }) {
  const [collections, setCollections] = useState(initialCollections);
  const [collectionModal, setCollectionModal] = useState(false);
  const [editingCollection, setEditingCollection] = useState<CollectionItem | null>(null);
  const [collectionDraft, setCollectionDraft] = useState<CollectionDraft>(blankCollection);
  const [verseModalFor, setVerseModalFor] = useState<CollectionItem | null>(null);
  const [verseDraft, setVerseDraft] = useState<VerseDraft>(blankVerse);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);

  const showFlash = (message: string) => {
    setFlash(message);
    setTimeout(() => setFlash(null), 2600);
  };

  const openNewCollection = () => {
    setEditingCollection(null);
    setCollectionDraft(blankCollection);
    setError(null);
    setCollectionModal(true);
  };

  const openEditCollection = (collection: CollectionItem) => {
    setEditingCollection(collection);
    setCollectionDraft({
      name: collection.name,
      description: collection.description,
      emoji: collection.emoji,
      accent: collection.accent,
    });
    setError(null);
    setCollectionModal(true);
  };

  const saveCollection = async () => {
    if (!collectionDraft.name.trim()) {
      setError("Give the shelf a name.");
      return;
    }
    setPending(true);
    setError(null);

    if (editingCollection) {
      const previous = collections;
      setCollections((current) =>
        current.map((item) =>
          item.id === editingCollection.id ? { ...item, ...collectionDraft } : item,
        ),
      );
      setCollectionModal(false);
      try {
        await apiRequest(`/api/collections/${editingCollection.id}`, "PATCH", collectionDraft);
        showFlash("Shelf updated.");
      } catch (cause) {
        setCollections(previous);
        setError(cause instanceof Error ? cause.message : "Update failed.");
        setCollectionModal(true);
      } finally {
        setPending(false);
      }
      return;
    }

    const optimistic: CollectionItem = {
      id: tempId(),
      ...collectionDraft,
      createdAt: new Date().toISOString(),
      verses: [],
    };
    setCollections((current) => [optimistic, ...current]);
    setCollectionModal(false);
    try {
      const created = await apiRequest<{ id: string; createdAt: string }>(
        "/api/collections",
        "POST",
        collectionDraft,
      );
      setCollections((current) =>
        current.map((item) =>
          item.id === optimistic.id ? { ...item, id: created.id, createdAt: created.createdAt } : item,
        ),
      );
      showFlash("New shelf created.");
    } catch (cause) {
      setCollections((current) => current.filter((item) => item.id !== optimistic.id));
      setError(cause instanceof Error ? cause.message : "Could not create that shelf.");
      setCollectionModal(true);
    } finally {
      setPending(false);
    }
  };

  const removeCollection = async (collection: CollectionItem) => {
    const previous = collections;
    setCollections((current) => current.filter((item) => item.id !== collection.id));
    try {
      await apiRequest(`/api/collections/${collection.id}`, "DELETE");
      showFlash("Shelf removed.");
    } catch (cause) {
      setCollections(previous);
      setError(cause instanceof Error ? cause.message : "Could not delete that shelf.");
    }
  };

  const addVerse = async () => {
    if (!verseModalFor) return;
    if (!verseDraft.reference.trim() || !verseDraft.text.trim()) {
      setError("Add a reference and the verse words.");
      return;
    }
    const collectionId = verseModalFor.id;
    setPending(true);
    setError(null);
    const optimistic: VerseItem = {
      id: tempId(),
      collectionId,
      ...verseDraft,
      createdAt: new Date().toISOString(),
    };
    setCollections((current) =>
      current.map((item) =>
        item.id === collectionId ? { ...item, verses: [optimistic, ...item.verses] } : item,
      ),
    );
    setVerseModalFor(null);
    setVerseDraft(blankVerse);
    try {
      const created = await apiRequest<{ id: string; createdAt: string }>(
        `/api/collections/${collectionId}/verses`,
        "POST",
        verseDraft,
      );
      setCollections((current) =>
        current.map((item) =>
          item.id === collectionId
            ? {
                ...item,
                verses: item.verses.map((verse) =>
                  verse.id === optimistic.id ? { ...verse, id: created.id, createdAt: created.createdAt } : verse,
                ),
              }
            : item,
        ),
      );
      showFlash("Verse saved to the shelf.");
    } catch (cause) {
      setCollections((current) =>
        current.map((item) =>
          item.id === collectionId
            ? { ...item, verses: item.verses.filter((verse) => verse.id !== optimistic.id) }
            : item,
        ),
      );
      setError(cause instanceof Error ? cause.message : "Could not save that verse.");
    } finally {
      setPending(false);
    }
  };

  const removeVerse = async (collectionId: string, verse: VerseItem) => {
    const previous = collections;
    setCollections((current) =>
      current.map((item) =>
        item.id === collectionId
          ? { ...item, verses: item.verses.filter((entry) => entry.id !== verse.id) }
          : item,
      ),
    );
    try {
      await apiRequest(`/api/verses/${verse.id}`, "DELETE");
      showFlash("Verse removed.");
    } catch (cause) {
      setCollections(previous);
      setError(cause instanceof Error ? cause.message : "Could not remove that verse.");
    }
  };

  const saveNote = async (collectionId: string, verse: VerseItem, note: string) => {
    setCollections((current) =>
      current.map((item) =>
        item.id === collectionId
          ? {
              ...item,
              verses: item.verses.map((entry) => (entry.id === verse.id ? { ...entry, note } : entry)),
            }
          : item,
      ),
    );
    try {
      await apiRequest(`/api/verses/${verse.id}`, "PATCH", { note });
      showFlash("Note saved.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save that note.");
    }
  };

  const totalVerses = collections.reduce((sum, item) => sum + item.verses.length, 0);

  return (
    <div className="space-y-5">
      <SectionHeading
        eyebrow="Verse shelf"
        title="Scripture you want to remember"
        description={`${totalVerses} saved verses across ${collections.length} shelves. Saved verses also feed the Verse Forge memory game.`}
        action={
          <div className="flex gap-2">
            <Link
              href="/trainer"
              className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-cream px-3.5 py-2.5 text-xs font-semibold text-ink transition hover:border-pine/40"
            >
              <Icon name="brain" className="h-3.5 w-3.5 text-pine" />
              Open Verse Forge
            </Link>
            <Button onClick={openNewCollection}>
              <Icon name="plus" className="h-4 w-4" />
              New shelf
            </Button>
          </div>
        }
      />

      <Notice message={error} />

      {collections.length === 0 ? (
        <EmptyState
          icon="bookmark"
          title="Start your first shelf"
          description="Shelves are for the verses you want within reach — anchors for anxious days, bedtime verses, or words for a hard week."
          action={
            <Button onClick={openNewCollection}>
              <Icon name="plus" className="h-4 w-4" />
              Create a shelf
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {collections.map((collection) => {
            const accent = accentFor(collection.accent);
            return (
              <section key={collection.id} className="card-surface animate-fade flex flex-col overflow-hidden">
                <div className={`h-1.5 w-full ${accent.chip}`} />
                <div className="flex items-start justify-between gap-2 px-4 pb-3 pt-4">
                  <div className="flex min-w-0 items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-parchment text-lg shadow-inner">
                      {collection.emoji}
                    </span>
                    <div className="min-w-0">
                      <h2 className="truncate font-display text-[17px] leading-tight text-ink">
                        {collection.name}
                      </h2>
                      <p className="mt-0.5 line-clamp-2 text-[11px] leading-relaxed text-ink-muted">
                        {collection.description || "No description yet."}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-0.5">
                    <button
                      type="button"
                      onClick={() => openEditCollection(collection)}
                      title="Edit shelf"
                      className="rounded-lg p-1.5 text-ink-muted transition hover:bg-parchment hover:text-pine"
                    >
                      <Icon name="pencil" className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeCollection(collection)}
                      title="Delete shelf"
                      className="rounded-lg p-1.5 text-ink-muted transition hover:bg-rose-50 hover:text-rose-600"
                    >
                      <Icon name="trash" className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <div className="scroll-fade max-h-[320px] flex-1 space-y-2 overflow-y-auto px-4 pb-2">
                  {collection.verses.length === 0 ? (
                    <p className="rounded-xl border border-dashed border-line px-3 py-6 text-center text-[11px] text-ink-muted">
                      Empty shelf — save a verse from the reader or add one here.
                    </p>
                  ) : (
                    collection.verses.map((verse) => (
                      <div
                        key={verse.id}
                        className={`group rounded-xl border p-3 ${accent.soft} ${verse.id.startsWith("temp-") ? "opacity-70" : ""}`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-ink">
                            {verse.reference}
                          </p>
                          <button
                            type="button"
                            onClick={() => removeVerse(collection.id, verse)}
                            className="rounded p-1 text-ink-muted opacity-0 transition group-hover:opacity-100 hover:text-rose-600"
                            title="Remove verse"
                          >
                            <Icon name="close" className="h-3 w-3" />
                          </button>
                        </div>
                        <p className="mt-1 font-display text-[13px] leading-relaxed text-ink-soft">
                          {verse.text}
                        </p>
                        <input
                          defaultValue={verse.note}
                          placeholder="Add a note…"
                          onBlur={(event) => {
                            if (event.target.value !== verse.note) {
                              void saveNote(collection.id, verse, event.target.value);
                            }
                          }}
                          className="mt-2 w-full border-none bg-transparent p-0 text-[11px] italic text-ink-muted placeholder:text-ink-muted/60 focus:outline-none"
                        />
                        <p className="mt-1 text-[9px] uppercase tracking-wide text-ink-muted/70">
                          {formatDate(verse.createdAt)}
                        </p>
                      </div>
                    ))
                  )}
                </div>

                <div className="border-t border-line/70 p-3">
                  <button
                    type="button"
                    onClick={() => {
                      setVerseModalFor(collection);
                      setVerseDraft(blankVerse);
                      setError(null);
                    }}
                    className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-line bg-parchment/40 px-3 py-2 text-[11px] font-semibold text-ink-soft transition hover:border-pine/40 hover:text-pine"
                  >
                    <Icon name="plus" className="h-3.5 w-3.5" />
                    Add a verse
                  </button>
                </div>
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
        open={collectionModal}
        onClose={() => setCollectionModal(false)}
        title={editingCollection ? "Edit shelf" : "New shelf"}
        subtitle="Give it a name you'll recognize at 2am."
      >
        <div className="space-y-4">
          <div>
            <label className={labelClass} htmlFor="shelf-name">
              Name
            </label>
            <input
              id="shelf-name"
              value={collectionDraft.name}
              onChange={(event) => setCollectionDraft({ ...collectionDraft, name: event.target.value })}
              placeholder="Anchors for anxious days"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="shelf-description">
              Description
            </label>
            <textarea
              id="shelf-description"
              value={collectionDraft.description}
              onChange={(event) => setCollectionDraft({ ...collectionDraft, description: event.target.value })}
              rows={2}
              placeholder="Why this shelf exists"
              className={inputClass}
            />
          </div>
          <div>
            <span className={labelClass}>Emoji</span>
            <div className="flex flex-wrap gap-1.5">
              {EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setCollectionDraft({ ...collectionDraft, emoji })}
                  className={`flex h-9 w-9 items-center justify-center rounded-xl border text-base transition ${
                    collectionDraft.emoji === emoji
                      ? "border-pine bg-pine/5"
                      : "border-line bg-cream hover:border-pine/30"
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
          <div>
            <span className={labelClass}>Accent</span>
            <div className="flex gap-2">
              {COLLECTION_ACCENTS.map((accent) => (
                <button
                  key={accent.id}
                  type="button"
                  onClick={() => setCollectionDraft({ ...collectionDraft, accent: accent.id })}
                  className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium transition ${
                    collectionDraft.accent === accent.id ? "border-pine bg-pine/5" : "border-line"
                  }`}
                >
                  <span className={`h-2.5 w-2.5 rounded-full ${accent.chip}`} />
                  {accent.label}
                </button>
              ))}
            </div>
          </div>
          <Notice message={error} />
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="secondary" onClick={() => setCollectionModal(false)}>
              Cancel
            </Button>
            <Button onClick={saveCollection} disabled={pending}>
              {pending ? <Spinner /> : <Icon name="check" className="h-4 w-4" />}
              {editingCollection ? "Save shelf" : "Create shelf"}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={verseModalFor !== null}
        onClose={() => setVerseModalFor(null)}
        title={`Add a verse${verseModalFor ? ` · ${verseModalFor.name}` : ""}`}
        subtitle="Paste it in your own words or from your print Bible."
      >
        <div className="space-y-4">
          <div>
            <label className={labelClass} htmlFor="verse-reference">
              Reference
            </label>
            <input
              id="verse-reference"
              value={verseDraft.reference}
              onChange={(event) => setVerseDraft({ ...verseDraft, reference: event.target.value })}
              placeholder="Psalm 46:10"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="verse-text">
              Verse text
            </label>
            <textarea
              id="verse-text"
              value={verseDraft.text}
              onChange={(event) => setVerseDraft({ ...verseDraft, text: event.target.value })}
              rows={4}
              placeholder="Write out the verse you want to keep."
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="verse-note">
              Note (optional)
            </label>
            <input
              id="verse-note"
              value={verseDraft.note}
              onChange={(event) => setVerseDraft({ ...verseDraft, note: event.target.value })}
              placeholder="Why this one?"
              className={inputClass}
            />
          </div>
          <Notice message={error} />
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="secondary" onClick={() => setVerseModalFor(null)}>
              Cancel
            </Button>
            <Button onClick={addVerse} disabled={pending}>
              {pending ? <Spinner /> : <Icon name="bookmark" className="h-4 w-4" />}
              Save verse
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
