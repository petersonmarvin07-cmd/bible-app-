"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Icon } from "@/components/icons";
import { Badge, Button, EmptyState, Modal, Spinner } from "@/components/ui";
import {
  BIBLE_BOOKS_CATALOG,
  getBookById,
} from "@/lib/bible-data";
import type { BibleVerseItem } from "@/lib/queries";

export function CompleteCanonReader({
  shelves = [],
  initialBookId = 1,
  initialChapter = 1,
  initialVerses = [],
}: {
  shelves?: { id: string; name: string; emoji: string }[];
  initialBookId?: number;
  initialChapter?: number;
  initialVerses?: BibleVerseItem[];
}) {
  const [activeBookId, setActiveBookId] = useState<number>(initialBookId);
  const [activeChapter, setActiveChapter] = useState<number>(initialChapter);
  const [verses, setVerses] = useState<BibleVerseItem[]>(initialVerses);
  const [isLoading, setIsLoading] = useState(false);
  const [isReadingAloud, setIsReadingAloud] = useState(false);

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined") {
        window.speechSynthesis?.cancel();
      }
    };
  }, []);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<BibleVerseItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Save verse modal
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [selectedVerse, setSelectedVerse] = useState<BibleVerseItem | null>(null);
  const [targetShelfId, setTargetShelfId] = useState(shelves[0]?.id || "");
  const [saveNote, setSaveNote] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const activeBook = getBookById(activeBookId) ?? BIBLE_BOOKS_CATALOG[0];

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const loadChapter = async (bId: number, ch: number) => {
    if (bId === activeBookId && ch === activeChapter && verses.length > 0) return;
    setIsLoading(true);
    if (isReadingAloud && typeof window !== "undefined") {
      window.speechSynthesis?.cancel();
      setIsReadingAloud(false);
    }
    setActiveBookId(bId);
    setActiveChapter(ch);

    try {
      const res = await fetch(`/api/bible/chapter?bookId=${bId}&chapter=${ch}`);
      if (!res.ok) throw new Error("Failed to load");
      const data = await res.json();
      setVerses(data.verses || []);
    } catch {
      showToast("Error loading chapter");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSpeech = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    if (isReadingAloud) {
      window.speechSynthesis.cancel();
      setIsReadingAloud(false);
      return;
    }

    const text = `${activeBook.name}, Chapter ${activeChapter}. ` +
      verses.map((v) => `Verse ${v.verse}. ${v.text}`).join(" ");

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.93;
    utterance.onend = () => setIsReadingAloud(false);
    utterance.onerror = () => setIsReadingAloud(false);

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    setIsReadingAloud(true);
    showToast(`Reading ${activeBook.name} ${activeChapter} aloud`);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const res = await fetch(`/api/bible/search?q=${encodeURIComponent(searchQuery.trim())}`);
      const data = await res.json();
      setSearchResults(data.results || []);
      setSearchOpen(true);
    } catch {
      showToast("Search failed");
    } finally {
      setIsSearching(false);
    }
  };

  const saveVerse = async () => {
    if (!selectedVerse || !targetShelfId) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/collections/${targetShelfId}/verses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reference: `${selectedVerse.bookName} ${selectedVerse.chapter}:${selectedVerse.verse}`,
          text: selectedVerse.text,
          note: saveNote.trim(),
        }),
      });
      if (!res.ok) throw new Error("Could not save");
      showToast(`Saved to shelf!`);
      setSaveModalOpen(false);
      setSelectedVerse(null);
    } catch {
      showToast("Could not save verse");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      {toast && (
        <div className="animate-rise fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-full bg-pine px-4 py-2 text-xs font-semibold text-cream shadow-lift">
          {toast}
        </div>
      )}

      {/* Scripture Navigation Header */}
      <div className="card-surface p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-ink-muted uppercase tracking-wider">Book:</span>
            <select
              value={activeBookId}
              onChange={(e) => loadChapter(parseInt(e.target.value, 10), 1)}
              className="rounded-xl border border-line bg-cream px-3 py-1.5 text-xs font-bold text-ink focus:border-pine focus:outline-none"
            >
              <optgroup label="Old Testament">
                {BIBLE_BOOKS_CATALOG.filter((b) => b.testament === "Old").map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.chapterCount} ch)
                  </option>
                ))}
              </optgroup>
              <optgroup label="New Testament">
                {BIBLE_BOOKS_CATALOG.filter((b) => b.testament === "New").map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.chapterCount} ch)
                  </option>
                ))}
              </optgroup>
            </select>

            <span className="text-xs font-bold text-ink-muted uppercase tracking-wider ml-2">Chapter:</span>
            <select
              value={activeChapter}
              onChange={(e) => loadChapter(activeBookId, parseInt(e.target.value, 10))}
              className="rounded-xl border border-line bg-cream px-3 py-1.5 text-xs font-bold text-ink focus:border-pine focus:outline-none"
            >
              {Array.from({ length: activeBook.chapterCount }, (_, i) => i + 1).map((ch) => (
                <option key={ch} value={ch}>
                  {ch}
                </option>
              ))}
            </select>

            <Badge tone="gold">{activeBook.division}</Badge>
            <Badge>{activeBook.testament} Testament</Badge>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleSpeech}
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${
                isReadingAloud
                  ? "border-emerald-300 bg-emerald-50 text-emerald-800 animate-pulse"
                  : "border-line bg-cream text-ink-soft hover:border-pine/30 hover:text-pine"
              }`}
            >
              <Icon name="sun" className="h-3.5 w-3.5" />
              <span>{isReadingAloud ? "Pause" : "Read Aloud"}</span>
            </button>

            <form onSubmit={handleSearch} className="flex items-center gap-1.5">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Bible..."
                className="w-36 sm:w-48 rounded-xl border border-line bg-cream px-2.5 py-1 text-xs text-ink focus:border-pine focus:outline-none"
              />
              <Button size="sm" type="submit" disabled={isSearching || !searchQuery.trim()}>
                {isSearching ? <Spinner className="h-3 w-3" /> : <Icon name="search" className="h-3 w-3" />}
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Chapter Reader View */}
      <div className="grid gap-5 lg:grid-cols-[1fr_260px]">
        <div className="card-surface overflow-hidden">
          <div className="border-b border-line/70 bg-parchment/40 px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="font-display text-2xl font-bold text-ink">
                {activeBook.name} {activeChapter}
              </h2>
              <p className="text-xs text-ink-muted mt-0.5">
                {activeBook.theme}
              </p>
            </div>
            <span className="text-xs text-ink-muted">
              {verses.length} verses
            </span>
          </div>

          <div className="scroll-fade p-6 sm:p-8 max-h-[620px] overflow-y-auto space-y-3 font-display text-[16px] leading-[1.85] text-ink">
            {isLoading ? (
              <div className="space-y-4 py-8">
                <div className="skeleton h-4 w-3/4" />
                <div className="skeleton h-4 w-full" />
                <div className="skeleton h-4 w-5/6" />
                <div className="skeleton h-4 w-full" />
              </div>
            ) : verses.length === 0 ? (
              <EmptyState
                icon="book"
                title="Loading verses..."
                description="Please wait while the text loads."
              />
            ) : (
              verses.map((v) => (
                <div
                  key={v.id}
                  className="group relative rounded-xl p-2 transition-all hover:bg-parchment/50"
                >
                  <span className="mr-2 inline-block font-sans text-xs font-bold text-gold select-none">
                    {v.verse}
                  </span>
                  <span>{v.text}</span>

                  <div className="absolute right-2 top-2 hidden items-center gap-1 rounded-lg border border-line bg-cream px-2 py-0.5 shadow-sm group-hover:flex">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedVerse(v);
                        setSaveNote("");
                        setSaveModalOpen(true);
                      }}
                      className="p-1 text-ink-muted hover:text-pine"
                      title="Save to shelf"
                    >
                      <Icon name="bookmark" className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard?.writeText(`"${v.text}" — ${v.bookName} ${v.chapter}:${v.verse}`);
                        showToast(`Copied ${v.bookName} ${v.chapter}:${v.verse}`);
                      }}
                      className="p-1 text-ink-muted hover:text-pine"
                      title="Copy verse"
                    >
                      <Icon name="quote" className="h-3 w-3" />
                    </button>
                    <Link
                      href={`/journal?passage=${encodeURIComponent(`${v.bookName} ${v.chapter}:${v.verse}`)}`}
                      className="p-1 text-ink-muted hover:text-pine"
                      title="Journal on this verse"
                    >
                      <Icon name="feather" className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="flex items-center justify-between border-t border-line bg-parchment/40 px-6 py-3">
            <button
              type="button"
              onClick={() => {
                if (activeChapter > 1) {
                  loadChapter(activeBookId, activeChapter - 1);
                } else if (activeBookId > 1) {
                  const prev = getBookById(activeBookId - 1)!;
                  loadChapter(activeBookId - 1, prev.chapterCount);
                }
              }}
              disabled={activeBookId === 1 && activeChapter === 1}
              className="rounded-xl border border-line bg-cream px-3 py-1.5 text-xs font-semibold text-ink disabled:opacity-40 hover:bg-parchment"
            >
              ← Previous Chapter
            </button>

            <span className="text-xs text-ink-muted">
              Chapter {activeChapter} of {activeBook.chapterCount}
            </span>

            <button
              type="button"
              onClick={() => {
                if (activeChapter < activeBook.chapterCount) {
                  loadChapter(activeBookId, activeChapter + 1);
                } else if (activeBookId < 66) {
                  loadChapter(activeBookId + 1, 1);
                }
              }}
              disabled={activeBookId === 66 && activeChapter === activeBook.chapterCount}
              className="rounded-xl border border-line bg-cream px-3 py-1.5 text-xs font-semibold text-ink disabled:opacity-40 hover:bg-parchment"
            >
              Next Chapter →
            </button>
          </div>
        </div>

        {/* Right Sidebar: Chapter Quick Selector */}
        <div className="space-y-4">
          <div className="card-surface p-4">
            <h3 className="font-display text-sm font-bold text-ink">
              {activeBook.name} Chapters ({activeBook.chapterCount})
            </h3>
            <div className="scroll-fade mt-3 grid grid-cols-5 gap-1 max-h-64 overflow-y-auto">
              {Array.from({ length: activeBook.chapterCount }, (_, i) => i + 1).map((ch) => (
                <button
                  key={ch}
                  type="button"
                  onClick={() => loadChapter(activeBookId, ch)}
                  className={`flex h-8 items-center justify-center rounded-lg border text-xs font-bold transition ${
                    ch === activeChapter
                      ? "border-pine bg-pine text-cream"
                      : "border-line bg-cream text-ink hover:bg-parchment"
                  }`}
                >
                  {ch}
                </button>
              ))}
            </div>
          </div>

          <div className="card-surface p-4">
            <h3 className="font-display text-sm font-bold text-ink mb-1">Book Summary</h3>
            <p className="text-xs leading-relaxed text-ink-muted">
              {activeBook.summary}
            </p>
          </div>
        </div>
      </div>

      {/* Search Results Modal */}
      <Modal
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        title={`Search Results (${searchResults.length} verses)`}
        subtitle={`Query: "${searchQuery}" across all 31,102 verses`}
        wide
      >
        <div className="scroll-fade max-h-96 space-y-2 overflow-y-auto pr-1">
          {searchResults.length === 0 ? (
            <p className="py-6 text-center text-xs text-ink-muted">
              No verses found matching &ldquo;{searchQuery}&rdquo;.
            </p>
          ) : (
            searchResults.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => {
                  loadChapter(v.bookId, v.chapter);
                  setSearchOpen(false);
                }}
                className="w-full text-left rounded-xl border border-line bg-parchment/40 p-3 transition hover:bg-parchment hover:border-pine/30"
              >
                <span className="font-sans text-xs font-bold text-pine">
                  {v.bookName} {v.chapter}:{v.verse}
                </span>
                <p className="font-display text-xs text-ink-soft mt-1">
                  {v.text}
                </p>
              </button>
            ))
          )}
        </div>
      </Modal>

      {/* Save Verse Modal */}
      <Modal
        open={saveModalOpen}
        onClose={() => setSaveModalOpen(false)}
        title={selectedVerse ? `Save ${selectedVerse.bookName} ${selectedVerse.chapter}:${selectedVerse.verse}` : "Save Verse"}
      >
        <div className="space-y-4">
          {selectedVerse && (
            <p className="rounded-xl border border-line bg-parchment/40 p-3 font-display text-xs italic text-ink">
              &ldquo;{selectedVerse.text}&rdquo;
            </p>
          )}

          {shelves.length === 0 ? (
            <div className="rounded-xl border border-dashed border-line bg-parchment/40 p-4 text-center">
              <p className="text-xs text-ink-muted">You don&rsquo;t have any verse shelves yet.</p>
              <Link
                href="/collections"
                className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-pine hover:underline"
              >
                Create a shelf first →
              </Link>
            </div>
          ) : (
            <div>
              <label className="mb-1 block text-xs font-semibold text-ink">Select Shelf:</label>
              <select
                value={targetShelfId}
                onChange={(e) => setTargetShelfId(e.target.value)}
                className="w-full rounded-xl border border-line bg-cream px-3 py-2 text-xs text-ink"
              >
                {shelves.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.emoji} {s.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="mb-1 block text-xs font-semibold text-ink">Note (optional):</label>
            <input
              type="text"
              value={saveNote}
              onChange={(e) => setSaveNote(e.target.value)}
              placeholder="Why this verse matters..."
              className="w-full rounded-xl border border-line bg-cream px-3 py-2 text-xs text-ink"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setSaveModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveVerse} disabled={isSaving || !targetShelfId}>
              {isSaving ? <Spinner className="h-3 w-3" /> : <Icon name="bookmark" className="h-3 w-3" />}
              <span>Save</span>
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
