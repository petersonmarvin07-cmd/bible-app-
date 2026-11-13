export type BandKey = "little" | "explorer" | "youth" | "grown";

export type VersionItem = {
  band: string;
  title: string;
  body: string;
  takeaway: string;
  wonderQuestion: string;
};

export type PassageItem = {
  id: string;
  slug: string;
  reference: string;
  book: string;
  chapter: number;
  verseStart: number;
  verseEnd: number;
  theme: string;
  testament: string;
  reflectionPrompt: string;
  versions: VersionItem[];
};

export type JournalItem = {
  id: string;
  title: string;
  body: string;
  mood: string;
  passageId: string | null;
  passageReference: string | null;
  sharing: string;
  createdAt: string;
  updatedAt: string;
};

export type VerseItem = {
  id: string;
  collectionId: string;
  reference: string;
  text: string;
  note: string;
  createdAt: string;
};

export type CollectionItem = {
  id: string;
  name: string;
  description: string;
  emoji: string;
  accent: string;
  createdAt: string;
  verses: VerseItem[];
};

export type DayItem = {
  id: string;
  planId: string;
  dayNumber: number;
  title: string;
  passageId: string | null;
  passageReference: string | null;
  completed: boolean;
};

export type PlanItem = {
  id: string;
  title: string;
  description: string;
  band: string;
  isActive: boolean;
  createdAt: string;
  days: DayItem[];
};

export type PrayerItem = {
  id: string;
  authorName: string;
  body: string;
  category: string;
  isAnswered: boolean;
  answeredNote: string;
  prayedCount: number;
  createdAt: string;
};

export type WonderItem = {
  id: string;
  askedBy: string;
  askedAge: number;
  question: string;
  answer: string;
  answeredBy: string;
  status: string;
  createdAt: string;
};

export type FamilyItem = {
  id: string;
  name: string;
  band: string;
  emoji: string;
  role: string;
  streak: number;
};

export type PassageOption = { id: string; slug: string; reference: string; theme: string };
