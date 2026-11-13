export const BANDS = [
  {
    id: "little",
    label: "Little Lambs",
    short: "Ages 3–7",
    ages: "3–7",
    emoji: "🐣",
    blurb: "Short, playful retellings with a single big idea.",
    tone: "bg-amber-100 text-amber-900 border-amber-200",
    dot: "bg-amber-400",
  },
  {
    id: "explorer",
    label: "Explorers",
    short: "Ages 8–12",
    ages: "8–12",
    emoji: "🧭",
    blurb: "Story-shaped scripture with a wonder question.",
    tone: "bg-emerald-100 text-emerald-900 border-emerald-200",
    dot: "bg-emerald-400",
  },
  {
    id: "youth",
    label: "Youth",
    short: "Ages 13–17",
    ages: "13–17",
    emoji: "🔥",
    blurb: "Honest language for the questions that matter.",
    tone: "bg-sky-100 text-sky-900 border-sky-200",
    dot: "bg-sky-400",
  },
  {
    id: "grown",
    label: "Grown-Ups",
    short: "Ages 18+",
    ages: "18+",
    emoji: "🕊️",
    blurb: "Full-text richness with reflection and context.",
    tone: "bg-indigo-100 text-indigo-900 border-indigo-200",
    dot: "bg-indigo-400",
  },
] as const;

export type BandId = (typeof BANDS)[number]["id"];

export const BAND_IDS = BANDS.map((b) => b.id) as BandId[];

export function getBand(id: string | null | undefined) {
  return BANDS.find((band) => band.id === id) ?? BANDS[3];
}

export const MOODS = [
  { id: "anxious", label: "Anxious", emoji: "🌀", theme: "Peace" },
  { id: "grateful", label: "Grateful", emoji: "🌻", theme: "Beginnings" },
  { id: "hopeful", label: "Hopeful", emoji: "🌅", theme: "Hope" },
  { id: "lonely", label: "Lonely", emoji: "🌙", theme: "Comfort" },
  { id: "joyful", label: "Joyful", emoji: "✨", theme: "Love" },
  { id: "weary", label: "Weary", emoji: "🫧", theme: "Rest" },
  { id: "curious", label: "Curious", emoji: "🔭", theme: "Wonder" },
  { id: "courageous", label: "Courageous", emoji: "🛡️", theme: "Courage" },
  { id: "grieving", label: "Grieving", emoji: "🕯️", theme: "Grace" },
  { id: "stretched", label: "Stretched Thin", emoji: "🌾", theme: "Trust" },
] as const;

export type MoodId = (typeof MOODS)[number]["id"];

export const PRAYER_CATEGORIES = [
  "everyday",
  "family",
  "healing",
  "provision",
  "gratitude",
  "world",
] as const;

export const JOURNAL_MOODS = [
  "peaceful",
  "grateful",
  "hopeful",
  "heavy",
  "curious",
  "joyful",
] as const;

export const COLLECTION_ACCENTS = [
  { id: "sage", label: "Sage", chip: "bg-emerald-500", soft: "bg-emerald-50 border-emerald-200" },
  { id: "amber", label: "Amber", chip: "bg-amber-500", soft: "bg-amber-50 border-amber-200" },
  { id: "sky", label: "Sky", chip: "bg-sky-500", soft: "bg-sky-50 border-sky-200" },
  { id: "rose", label: "Rose", chip: "bg-rose-500", soft: "bg-rose-50 border-rose-200" },
  { id: "violet", label: "Violet", chip: "bg-violet-500", soft: "bg-violet-50 border-violet-200" },
] as const;

export function accentFor(id: string) {
  return COLLECTION_ACCENTS.find((accent) => accent.id === id) ?? COLLECTION_ACCENTS[0];
}

export function formatDate(value: Date | string, withTime = false) {
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    ...(withTime ? { hour: "numeric", minute: "2-digit" } : {}),
    timeZone: "UTC",
  }).format(date);
}

export function relativeDay(value: Date | string) {
  const date = typeof value === "string" ? new Date(value) : value;
  const today = new Date();
  const startOfDay = (d: Date) => Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
  const diff = Math.round((startOfDay(today) - startOfDay(date)) / 86_400_000);
  if (diff <= 0) return "Today";
  if (diff === 1) return "Yesterday";
  if (diff < 7) return `${diff} days ago`;
  return formatDate(date);
}
