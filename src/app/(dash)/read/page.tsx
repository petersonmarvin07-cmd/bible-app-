import { CombinedReader } from "@/components/combined-reader";
import { SectionHeading } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { BAND_IDS, type BandId } from "@/lib/constants";
import { getBibleChapterVerses, getCollections, getPassagesWithVersions } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function ReadPage({
  searchParams,
}: {
  searchParams: Promise<{ passage?: string; canon?: string }>;
}) {
  const user = await requireUser();
  const [passages, collections, canonVersesData, params] = await Promise.all([
    getPassagesWithVersions(),
    getCollections(user.id),
    getBibleChapterVerses(1, 1),
    searchParams,
  ]);

  const initialBand: BandId = BAND_IDS.includes(user.homeBand as BandId)
    ? (user.homeBand as BandId)
    : "grown";

  return (
    <div className="space-y-5">
      <SectionHeading
        eyebrow="The Scripture Reader"
        title="Scripture for every heart & the complete canon"
        description="Choose between our age-adapted 4-band retellings or browse the entire 66-book canon with full chapters, search, and verse-by-verse audio."
      />
      <CombinedReader
        passages={passages}
        shelves={collections.map((collection) => ({
          id: collection.id,
          name: collection.name,
          emoji: collection.emoji,
          accent: collection.accent,
        }))}
        initialBand={initialBand}
        initialSlug={params.passage}
        streak={user.streakCount}
        initialCanonVerses={canonVersesData.verses}
        defaultMode={params.canon === "true" ? "canon" : "curated"}
      />
    </div>
  );
}
