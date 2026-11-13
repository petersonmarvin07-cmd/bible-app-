"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { BackButton } from "@/components/back-button";
import { Icon } from "@/components/icons";
import { Badge, Button, EmptyState, Modal, Spinner } from "@/components/ui";
import {
  BIBLE_BOOKS_CATALOG,
  BIBLE_DIVISIONS,
  BibleBookMeta,
  getBookById,
} from "@/lib/bible-data";
import type { BibleVerseItem, CanonicalProgressSummary } from "@/lib/queries";
import type { CollectionItem } from "@/lib/types";

export function OptionBDashboard({
  canonicalStats,
  shelves,
  initialBookId = 1,
  initialChapter = 1,
  initialVerses,
  userName = "Friend",
}: {
  canonicalStats: CanonicalProgressSummary;
  shelves: CollectionItem[];
  initialBookId?: number;
  initialChapter?: number;
  initialVerses: BibleVerseItem[];
  userName?: string;
}) {
  // Navigation & view states
  const [selectedDivision, setSelectedDivision] = useState<string>("All");
  const [bookSearch, setBookSearch] = useState("");
  const [activeBookId, setActiveBookId] = useState<number>(initialBookId);
  const [activeChapter, setActiveChapter] = useState<number>(initialChapter);
  const [verses, setVerses] = useState<BibleVerseItem[]>(initialVerses);
  const [isLoadingVerses, setIsLoadingVerses] = useState(false);

  // Canonical Progress states
  const [readKeys, setReadKeys] = useState<Set<string>>(
    () => new Set(canonicalStats.readKeys)
  );
  const [stats, setStats] = useState(canonicalStats);

  // Audio speech synthesis
  const [isReadingAloud, setIsReadingAloud] = useState(false);

  // Search Engine state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<BibleVerseItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchHasSearched, setSearchHasSearched] = useState(false);

  // Save verse to shelf modal
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [selectedVerseForSave, setSelectedVerseForSave] = useState<BibleVerseItem | null>(null);
  const [targetShelfId, setTargetShelfId] = useState<string>(shelves[0]?.id || "");
  const [saveNote, setSaveNote] = useState("");
  const [isSavingVerse, setIsSavingVerse] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const activeBook = getBookById(activeBookId) ?? BIBLE_BOOKS_CATALOG[0];
  const activeChapterKey = `${activeBookId}-${activeChapter}`;
  const isCurrentChapterRead = readKeys.has(activeChapterKey);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  // Filter books by division and text search
  const filteredBooks = useMemo(() => {
    return BIBLE_BOOKS_CATALOG.filter((book) => {
      const matchesDivision =
        selectedDivision === "All" || book.division === selectedDivision;
      const matchesSearch =
        !bookSearch.trim() ||
        book.name.toLowerCase().includes(bookSearch.toLowerCase()) ||
        book.osis.toLowerCase().includes(bookSearch.toLowerCase());
      return matchesDivision && matchesSearch;
    });
  }, [selectedDivision, bookSearch]);

  // Load verses when book or chapter changes
  const loadChapter = async (bId: number, ch: number) => {
    if (bId === activeBookId && ch === activeChapter && verses.length > 0) return;
    setIsLoadingVerses(true);
    if (isReadingAloud && typeof window !== "undefined") {
      window.speechSynthesis?.cancel();
      setIsReadingAloud(false);
    }
    setActiveBookId(bId);
    setActiveChapter(ch);

    try {
      const res = await fetch(`/api/bible/chapter?bookId=${bId}&chapter=${ch}`);
      if (!res.ok) throw new Error("Could not load chapter");
      const data = await res.json();
      setVerses(data.verses || []);
    } catch (err) {
      console.error("Error loading chapter:", err);
      showToast("Error loading chapter verses");
    } finally {
      setIsLoadingVerses(false);
    }
  };

  // Toggle chapter read status
  const toggleChapterRead = async () => {
    const nextRead = !isCurrentChapterRead;
    const key = activeChapterKey;

    // Optimistic update
    const nextSet = new Set(readKeys);
    if (nextRead) {
      nextSet.add(key);
    } else {
      nextSet.delete(key);
    }
    setReadKeys(nextSet);

    // Update stats optimistically
    const nextTotal = nextSet.size;
    const isOT = activeBook.testament === "Old";
    setStats((prev) => ({
      ...prev,
      totalChaptersRead: nextTotal,
      overallPercentage: Math.round((nextTotal / prev.totalChapters) * 100),
      otChaptersRead: isOT
        ? prev.otChaptersRead + (nextRead ? 1 : -1)
        : prev.otChaptersRead,
      otPercentage: isOT
        ? Math.round(((prev.otChaptersRead + (nextRead ? 1 : -1)) / prev.otTotalChapters) * 100)
        : prev.otPercentage,
      ntChaptersRead: !isOT
        ? prev.ntChaptersRead + (nextRead ? 1 : -1)
        : prev.ntChaptersRead,
      ntPercentage: !isOT
        ? Math.round(((prev.ntChaptersRead + (nextRead ? 1 : -1)) / prev.ntTotalChapters) * 100)
        : prev.ntPercentage,
    }));

    try {
      const method = nextRead ? "POST" : "DELETE";
      const res = await fetch("/api/bible/progress", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookId: activeBookId, chapter: activeChapter }),
      });
      if (!res.ok) throw new Error("Progress update failed");
      showToast(
        nextRead
          ? `✓ Marked ${activeBook.name} ${activeChapter} complete!`
          : `Marked ${activeBook.name} ${activeChapter} unread`
      );
    } catch {
      // Revert on error
      setReadKeys(readKeys);
      showToast("Failed to update progress. Please retry.");
    }
  };

  // Audio Read Aloud
  const toggleReadAloud = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    if (isReadingAloud) {
      window.speechSynthesis.cancel();
      setIsReadingAloud(false);
      return;
    }

    const chapterText = `${activeBook.name}, Chapter ${activeChapter}. ` +
      verses.map((v) => `Verse ${v.verse}. ${v.text}`).join(" ");

    const utterance = new SpeechSynthesisUtterance(chapterText);
    utterance.rate = 0.93;
    utterance.onend = () => setIsReadingAloud(false);
    utterance.onerror = () => setIsReadingAloud(false);

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    setIsReadingAloud(true);
    showToast(`Listening to ${activeBook.name} ${activeChapter}`);
  };

  // Run whole-Bible search
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchHasSearched(true);
    try {
      const res = await fetch(`/api/bible/search?q=${encodeURIComponent(searchQuery.trim())}`);
      const data = await res.json();
      setSearchResults(data.results || []);
    } catch {
      showToast("Search failed. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  // Save verse to shelf
  const confirmSaveVerse = async () => {
    if (!selectedVerseForSave || !targetShelfId) return;
    setIsSavingVerse(true);
    try {
      const res = await fetch(`/api/collections/${targetShelfId}/verses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reference: `${selectedVerseForSave.bookName} ${selectedVerseForSave.chapter}:${selectedVerseForSave.verse}`,
          text: selectedVerseForSave.text,
          note: saveNote.trim(),
        }),
      });
      if (!res.ok) throw new Error("Could not save verse");
      showToast(
        `Saved ${selectedVerseForSave.bookName} ${selectedVerseForSave.chapter}:${selectedVerseForSave.verse} to shelf!`
      );
      setSaveModalOpen(false);
      setSelectedVerseForSave(null);
      setSaveNote("");
    } catch {
      showToast("Could not save verse to shelf");
    } finally {
      setIsSavingVerse(false);
    }
  };

  // Copy verse to clipboard
  const copyVerse = (v: BibleVerseItem) => {
    const text = `"${v.text}" — ${v.bookName} ${v.chapter}:${v.verse}`;
    navigator.clipboard?.writeText(text);
    showToast(`Copied ${v.bookName} ${v.chapter}:${v.verse}`);
  };

  // Navigate to previous/next chapter
  const goPrevChapter = () => {
    if (activeChapter > 1) {
      loadChapter(activeBookId, activeChapter - 1);
    } else if (activeBookId > 1) {
      const prevBook = getBookById(activeBookId - 1)!;
      loadChapter(activeBookId - 1, prevBook.chapterCount);
    }
  };

  const goNextChapter = () => {
    if (activeChapter < activeBook.chapterCount) {
      loadChapter(activeBookId, activeChapter + 1);
    } else if (activeBookId < 66) {
      loadChapter(activeBookId + 1, 1);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast notification */}
      {toastMessage && (
        <div className="animate-rise fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full border border-pine/20 bg-pine px-4 py-2 text-xs font-semibold text-cream shadow-lift">
          {toastMessage}
        </div>
      )}

      {/* Option B Hero Header & Stats Banner */}
      <section className="relative overflow-hidden rounded-3xl border border-line bg-gradient-to-br from-cream via-cream to-parchment p-6 shadow-card sm:p-8">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gold-soft/50 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />

        <div className="relative flex flex-wrap items-center justify-between gap-4 border-b border-line/70 pb-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <BackButton fallbackHref="/" label="Back to Overview" />
              <span className="rounded-full bg-gold-soft px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-amber-900 shadow-sm">
                Option B · Complete Canon Study Dashboard
              </span>
              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                All 66 Books Available
              </span>
            </div>
            <h1 className="mt-2 font-display text-2xl sm:text-3xl text-ink font-semibold">
              The Holy Bible · Complete Canonical Explorer
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-ink-muted max-w-2xl">
              Genesis 1:1 through Revelation 22:21. Track your progress across all 1,189 chapters,
              search 31,102 verses, study cross-references, and save verses directly to your memory shelves.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById("search-section");
                el?.scrollIntoView({ behavior: "smooth" });
              }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-cream px-3.5 py-2 text-xs font-semibold text-ink shadow-sm transition hover:border-pine/40 hover:bg-parchment"
            >
              <Icon name="search" className="h-3.5 w-3.5 text-pine" />
              <span>Concordance Search</span>
            </button>
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById("canon-browser");
                el?.scrollIntoView({ behavior: "smooth" });
              }}
              className="inline-flex items-center gap-1.5 rounded-xl bg-pine px-4 py-2 text-xs font-bold text-cream shadow-sm transition hover:bg-pine-deep"
            >
              <Icon name="book" className="h-3.5 w-3.5" />
              <span>Browse 66 Books</span>
            </button>
          </div>
        </div>

        {/* 4 Canonical Metric Badges */}
        <div className="relative mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-line/80 bg-parchment/50 p-4">
            <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-[0.14em] text-ink-muted">
              <span>Whole Bible Progress</span>
              <span className="text-pine">{stats.overallPercentage}%</span>
            </div>
            <p className="mt-1 font-display text-2xl text-ink font-semibold">
              {stats.totalChaptersRead} <span className="text-sm font-sans font-normal text-ink-muted">/ 1,189 ch</span>
            </p>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-parchment-deep">
              <div
                className="h-full rounded-full bg-pine transition-all duration-500"
                style={{ width: `${Math.max(stats.overallPercentage, 2)}%` }}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-line/80 bg-parchment/50 p-4">
            <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-[0.14em] text-ink-muted">
              <span>Old Testament</span>
              <span className="text-amber-800">{stats.otPercentage}%</span>
            </div>
            <p className="mt-1 font-display text-2xl text-ink font-semibold">
              {stats.otChaptersRead} <span className="text-sm font-sans font-normal text-ink-muted">/ 929 ch</span>
            </p>
            <p className="mt-1 text-[11px] text-ink-muted">39 Books · Genesis to Malachi</p>
          </div>

          <div className="rounded-2xl border border-line/80 bg-parchment/50 p-4">
            <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-[0.14em] text-ink-muted">
              <span>New Testament</span>
              <span className="text-emerald-800">{stats.ntPercentage}%</span>
            </div>
            <p className="mt-1 font-display text-2xl text-ink font-semibold">
              {stats.ntChaptersRead} <span className="text-sm font-sans font-normal text-ink-muted">/ 260 ch</span>
            </p>
            <p className="mt-1 text-[11px] text-ink-muted">27 Books · Matthew to Revelation</p>
          </div>

          <div className="rounded-2xl border border-line/80 bg-parchment/50 p-4">
            <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-[0.14em] text-ink-muted">
              <span>Current Study Focus</span>
              <span className="text-gold font-bold">Chapter {activeChapter}</span>
            </div>
            <p className="mt-1 font-display text-2xl text-ink font-semibold truncate">
              {activeBook.name}
            </p>
            <p className="mt-1 text-[11px] text-ink-muted truncate">{activeBook.division}</p>
          </div>
        </div>
      </section>

      {/* Main Study Grid: In-Dashboard Scripture Reader (Left) + Study Tools & Fast Picker (Right) */}
      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        {/* Left Pane: Interactive Canonical Scripture Reader */}
        <section className="card-surface flex flex-col overflow-hidden">
          {/* Reader Top Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-parchment/60 px-5 py-4">
            <div className="flex flex-wrap items-center gap-2">
              {/* Quick Book Selector */}
              <select
                value={activeBookId}
                onChange={(e) => loadChapter(parseInt(e.target.value, 10), 1)}
                className="rounded-xl border border-line bg-cream px-3 py-1.5 text-xs font-bold text-ink shadow-sm focus:border-pine focus:outline-none"
              >
                <optgroup label="Old Testament (39 Books)">
                  {BIBLE_BOOKS_CATALOG.filter((b) => b.testament === "Old").map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.chapterCount} ch)
                    </option>
                  ))}
                </optgroup>
                <optgroup label="New Testament (27 Books)">
                  {BIBLE_BOOKS_CATALOG.filter((b) => b.testament === "New").map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.chapterCount} ch)
                    </option>
                  ))}
                </optgroup>
              </select>

              {/* Quick Chapter Selector */}
              <select
                value={activeChapter}
                onChange={(e) => loadChapter(activeBookId, parseInt(e.target.value, 10))}
                className="rounded-xl border border-line bg-cream px-2.5 py-1.5 text-xs font-bold text-ink shadow-sm focus:border-pine focus:outline-none"
              >
                {Array.from({ length: activeBook.chapterCount }, (_, i) => i + 1).map((ch) => (
                  <option key={ch} value={ch}>
                    Chapter {ch}
                  </option>
                ))}
              </select>

              <Badge tone="neutral">{activeBook.division}</Badge>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={toggleReadAloud}
                className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${
                  isReadingAloud
                    ? "border-emerald-300 bg-emerald-50 text-emerald-800 animate-pulse"
                    : "border-line bg-cream text-ink-soft hover:border-pine/30 hover:text-pine"
                }`}
                title="Read aloud via Speech Synthesis"
              >
                <Icon name="sun" className="h-3.5 w-3.5" />
                <span>{isReadingAloud ? "Pause Audio" : "Read Aloud"}</span>
              </button>

              <Button
                size="sm"
                variant={isCurrentChapterRead ? "secondary" : "primary"}
                onClick={toggleChapterRead}
                title={isCurrentChapterRead ? "Click to unmark" : "Mark chapter completed"}
              >
                <Icon name="check" className="h-3.5 w-3.5" />
                <span>{isCurrentChapterRead ? "Chapter Read ✓" : "Mark as Read"}</span>
              </Button>
            </div>
          </div>

          {/* Chapter Metadata & Theme Header */}
          <div className="border-b border-line/60 bg-cream px-6 py-4">
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="font-display text-2xl font-bold text-ink">
                {activeBook.name} {activeChapter}
              </h2>
              <span className="text-xs text-ink-muted">
                {verses.length} verses · King James Version (KJV)
              </span>
            </div>
            <p className="mt-1 text-xs text-ink-muted italic">
              Theme: {activeBook.theme}
            </p>
          </div>

          {/* Verse Text Area */}
          <div className="scroll-fade flex-1 overflow-y-auto px-6 py-6 max-h-[580px]">
            {isLoadingVerses ? (
              <div className="space-y-4 py-8">
                <div className="skeleton h-4 w-3/4" />
                <div className="skeleton h-4 w-full" />
                <div className="skeleton h-4 w-5/6" />
                <div className="skeleton h-4 w-full" />
                <div className="skeleton h-4 w-2/3" />
              </div>
            ) : verses.length === 0 ? (
              <EmptyState
                icon="book"
                title="No verses loaded"
                description="Unable to find verses for this chapter. Please select another book."
              />
            ) : (
              <div className="space-y-3 font-display text-[16px] leading-[1.85] text-ink">
                {verses.map((v) => (
                  <div
                    key={v.id}
                    className="group relative rounded-xl p-2 transition-all hover:bg-parchment/60"
                  >
                    <span className="mr-2 inline-block font-sans text-xs font-bold text-gold select-none">
                      {v.verse}
                    </span>
                    <span>{v.text}</span>

                    {/* Quick hover action toolbar */}
                    <div className="absolute right-2 top-2 hidden items-center gap-1 rounded-lg border border-line bg-cream px-2 py-1 shadow-sm group-hover:flex">
                      <button
                        type="button"
                        onClick={() => copyVerse(v)}
                        className="p-1 text-ink-muted hover:text-pine"
                        title="Copy verse"
                      >
                        <Icon name="quote" className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedVerseForSave(v);
                          setSaveNote("");
                          setSaveModalOpen(true);
                        }}
                        className="p-1 text-ink-muted hover:text-pine"
                        title="Save to shelf"
                      >
                        <Icon name="bookmark" className="h-3 w-3" />
                      </button>
                      <Link
                        href={`/journal?passage=${encodeURIComponent(
                          `${v.bookName} ${v.chapter}:${v.verse}`
                        )}`}
                        className="p-1 text-ink-muted hover:text-pine"
                        title="Write journal entry"
                      >
                        <Icon name="feather" className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Reader Chapter Footer Navigation */}
          <div className="flex items-center justify-between border-t border-line bg-parchment/40 px-5 py-3.5">
            <button
              type="button"
              onClick={goPrevChapter}
              disabled={activeBookId === 1 && activeChapter === 1}
              className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-cream px-3 py-1.5 text-xs font-semibold text-ink transition hover:border-pine/40 hover:bg-parchment disabled:opacity-40"
            >
              <span>← Previous Chapter</span>
            </button>

            <span className="text-xs text-ink-muted font-medium">
              {activeBook.name} {activeChapter} of {activeBook.chapterCount}
            </span>

            <button
              type="button"
              onClick={goNextChapter}
              disabled={activeBookId === 66 && activeChapter === activeBook.chapterCount}
              className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-cream px-3 py-1.5 text-xs font-semibold text-ink transition hover:border-pine/40 hover:bg-parchment disabled:opacity-40"
            >
              <span>Next Chapter →</span>
            </button>
          </div>
        </section>

        {/* Right Pane: Chapter Picker, Concordance Search & Study Plans */}
        <div className="space-y-6">
          {/* Chapter Quick Picker for Active Book */}
          <section className="card-surface p-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display text-lg font-bold text-ink">
                  {activeBook.name} Chapters ({activeBook.chapterCount})
                </h3>
                <p className="text-[11px] text-ink-muted">
                  Click any chapter to jump directly to it:
                </p>
              </div>
              <span className="rounded-full bg-parchment px-2 py-0.5 text-[10px] font-bold text-ink-muted">
                {activeBook.testament} Testament
              </span>
            </div>

            <div className="scroll-fade mt-3.5 grid grid-cols-6 sm:grid-cols-8 gap-1.5 max-h-48 overflow-y-auto p-1">
              {Array.from({ length: activeBook.chapterCount }, (_, i) => i + 1).map((ch) => {
                const isSelected = ch === activeChapter;
                const isRead = readKeys.has(`${activeBookId}-${ch}`);
                return (
                  <button
                    key={ch}
                    type="button"
                    onClick={() => loadChapter(activeBookId, ch)}
                    className={`flex h-8 items-center justify-center rounded-lg border text-xs font-bold transition ${
                      isSelected
                        ? "border-pine bg-pine text-cream shadow-sm"
                        : isRead
                        ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                        : "border-line bg-cream text-ink hover:border-pine/30 hover:bg-parchment"
                    }`}
                  >
                    {ch}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Whole-Bible Full-Text Concordance Search */}
          <section id="search-section" className="card-surface p-5">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-pine/10 text-pine">
                <Icon name="search" className="h-4 w-4" />
              </span>
              <div>
                <h3 className="font-display text-lg font-bold text-ink">
                  Whole-Bible Search
                </h3>
                <p className="text-[11px] text-ink-muted">
                  Search across all 31,102 verses instantly
                </p>
              </div>
            </div>

            <form onSubmit={handleSearch} className="mt-3.5 flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="e.g. shepherd, peace, light, courage..."
                className="flex-1 rounded-xl border border-line bg-cream px-3 py-2 text-xs text-ink placeholder:text-ink-muted focus:border-pine focus:outline-none"
              />
              <Button size="sm" type="submit" disabled={isSearching || !searchQuery.trim()}>
                {isSearching ? <Spinner className="h-3.5 w-3.5" /> : "Search"}
              </Button>
            </form>

            {/* Quick search pills */}
            <div className="mt-2.5 flex flex-wrap gap-1">
              {["grace", "shepherd", "light", "peace", "fear not", "covenant", "resurrection"].map(
                (term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => {
                      setSearchQuery(term);
                      // Trigger search immediately
                      fetch(`/api/bible/search?q=${encodeURIComponent(term)}`)
                        .then((res) => res.json())
                        .then((data) => {
                          setSearchResults(data.results || []);
                          setSearchHasSearched(true);
                        });
                    }}
                    className="rounded-full bg-parchment px-2 py-0.5 text-[10px] font-medium text-ink-soft hover:bg-gold-soft/60 hover:text-amber-900"
                  >
                    {term}
                  </button>
                )
              )}
            </div>

            {/* Search Results list */}
            {searchHasSearched && (
              <div className="mt-4 border-t border-line/70 pt-3">
                <p className="text-[11px] font-bold text-ink-muted">
                  {searchResults.length} matches found
                </p>
                <div className="scroll-fade mt-2 space-y-2 max-h-56 overflow-y-auto">
                  {searchResults.length === 0 ? (
                    <p className="p-3 text-center text-xs text-ink-muted">
                      No verses match &ldquo;{searchQuery}&rdquo;.
                    </p>
                  ) : (
                    searchResults.map((v) => (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => loadChapter(v.bookId, v.chapter)}
                        className="w-full text-left rounded-xl border border-line/80 bg-parchment/40 p-2.5 transition hover:bg-parchment hover:border-pine/30"
                      >
                        <span className="block font-sans text-[11px] font-bold text-pine">
                          {v.bookName} {v.chapter}:{v.verse}
                        </span>
                        <p className="font-display text-xs text-ink-soft line-clamp-2 mt-0.5">
                          {v.text}
                        </p>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </section>

          {/* Canonical Reading Plans */}
          <section className="card-surface p-5">
            <h3 className="font-display text-lg font-bold text-ink">
              Canonical Reading Plans
            </h3>
            <p className="text-[11px] text-ink-muted">
              Structured tracks across the full 66 books
            </p>

            <div className="mt-3.5 space-y-2.5">
              {[
                {
                  title: "Whole Bible in 1 Year",
                  desc: "Genesis to Revelation (~3.2 ch/day)",
                  badge: "1,189 ch",
                  targetBookId: 1,
                  targetChapter: 1,
                },
                {
                  title: "Gospels & Acts in 30 Days",
                  desc: "Matthew, Mark, Luke, John, Acts",
                  badge: "117 ch",
                  targetBookId: 40,
                  targetChapter: 1,
                },
                {
                  title: "Wisdom & Psalms Focus",
                  desc: "Psalms, Proverbs & Ecclesiastes",
                  badge: "193 ch",
                  targetBookId: 19,
                  targetChapter: 1,
                },
              ].map((plan) => (
                <div
                  key={plan.title}
                  className="flex items-center justify-between rounded-xl border border-line/80 bg-parchment/40 p-3"
                >
                  <div>
                    <p className="text-xs font-bold text-ink">{plan.title}</p>
                    <p className="text-[10px] text-ink-muted">{plan.desc}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => loadChapter(plan.targetBookId, plan.targetChapter)}
                    className="rounded-lg bg-pine px-2.5 py-1 text-[10px] font-bold text-cream hover:bg-pine-deep"
                  >
                    Open
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* 66-Book Canonical Grid Browser */}
      <section id="canon-browser" className="card-surface p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line/70 pb-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-gold">
              Complete Scripture Catalog
            </span>
            <h2 className="mt-1 font-display text-2xl font-bold text-ink">
              The 66 Books of the Holy Bible
            </h2>
            <p className="mt-1 text-xs text-ink-muted">
              Old Testament (39 books) and New Testament (27 books). Tap any book to inspect its
              chapters.
            </p>
          </div>

          <div className="w-full sm:w-64">
            <input
              type="text"
              value={bookSearch}
              onChange={(e) => setBookSearch(e.target.value)}
              placeholder="Search books (e.g. Genesis, Romans)..."
              className="w-full rounded-xl border border-line bg-cream px-3 py-1.5 text-xs text-ink focus:border-pine focus:outline-none"
            />
          </div>
        </div>

        {/* Division Filter Pills */}
        <div className="scroll-fade mt-4 flex gap-1.5 overflow-x-auto pb-2">
          {BIBLE_DIVISIONS.map((div) => {
            const isSelected = div === selectedDivision;
            return (
              <button
                key={div}
                type="button"
                onClick={() => setSelectedDivision(div)}
                className={`rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap transition ${
                  isSelected
                    ? "bg-pine text-cream shadow-sm"
                    : "bg-parchment text-ink-soft hover:bg-parchment-deep hover:text-ink"
                }`}
              >
                {div}
              </button>
            );
          })}
        </div>

        {/* Book Cards Grid */}
        <div className="mt-5 grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filteredBooks.map((book) => {
            const isCurrent = book.id === activeBookId;
            return (
              <button
                key={book.id}
                type="button"
                onClick={() => {
                  loadChapter(book.id, 1);
                  window.scrollTo({ top: 120, behavior: "smooth" });
                }}
                className={`flex flex-col justify-between rounded-2xl border p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-card ${
                  isCurrent
                    ? "border-pine bg-pine/5 shadow-sm ring-1 ring-pine"
                    : "border-line bg-cream hover:border-pine/30"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-display text-base font-bold text-ink">
                      {book.name}
                    </span>
                    <span className="rounded-full bg-parchment px-2 py-0.5 text-[9px] font-bold text-ink-muted">
                      {book.testament}
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-gold font-semibold">
                    {book.division}
                  </p>
                  <p className="mt-1.5 text-[11px] leading-relaxed text-ink-muted line-clamp-2">
                    {book.theme}
                  </p>
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-line/60 pt-2 text-[10px] text-ink-muted">
                  <span>{book.chapterCount} chapters</span>
                  <span>{book.verseCount} verses</span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Save Verse Modal */}
      <Modal
        open={saveModalOpen}
        onClose={() => setSaveModalOpen(false)}
        title={
          selectedVerseForSave
            ? `Save ${selectedVerseForSave.bookName} ${selectedVerseForSave.chapter}:${selectedVerseForSave.verse}`
            : "Save Verse"
        }
        subtitle="Add this scripture to one of your household verse shelves"
      >
        <div className="space-y-4">
          {selectedVerseForSave && (
            <div className="rounded-xl border border-line bg-parchment/50 p-3.5 font-display text-sm leading-relaxed text-ink">
              &ldquo;{selectedVerseForSave.text}&rdquo;
            </div>
          )}

          <div>
            <label className="mb-1 block text-xs font-semibold text-ink">
              Choose Shelf:
            </label>
            <select
              value={targetShelfId}
              onChange={(e) => setTargetShelfId(e.target.value)}
              className="w-full rounded-xl border border-line bg-cream px-3 py-2 text-xs text-ink focus:border-pine focus:outline-none"
            >
              {shelves.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.emoji} {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-ink">
              Personal Reflection / Note (Optional):
            </label>
            <textarea
              value={saveNote}
              onChange={(e) => setSaveNote(e.target.value)}
              placeholder="Why this verse matters to you today..."
              rows={3}
              className="w-full rounded-xl border border-line bg-cream px-3 py-2 text-xs text-ink focus:border-pine focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="secondary"
              onClick={() => setSaveModalOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={confirmSaveVerse} disabled={isSavingVerse}>
              {isSavingVerse ? <Spinner className="h-3.5 w-3.5" /> : <Icon name="bookmark" className="h-3.5 w-3.5" />}
              <span>Save to Shelf</span>
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
