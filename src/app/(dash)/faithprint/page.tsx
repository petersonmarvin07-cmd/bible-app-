import { Faithprint } from "@/components/faithprint";
import { requireUser } from "@/lib/auth";
import { BAND_IDS, type BandId } from "@/lib/constants";
import { getCollections } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function FaithprintPage() {
  const user = await requireUser();
  const collections = await getCollections(user.id);
  const band: BandId = BAND_IDS.includes(user.homeBand as BandId) ? (user.homeBand as BandId) : "grown";

  return (
    <Faithprint
      initialBand={band}
      homeBand={band}
      shelves={collections.map((collection) => ({
        id: collection.id,
        name: collection.name,
        emoji: collection.emoji,
      }))}
    />
  );
}
