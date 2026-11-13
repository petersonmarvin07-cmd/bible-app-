import { VerseForge } from "@/components/verse-forge";
import { requireUser } from "@/lib/auth";
import { getCollections } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function TrainerPage() {
  const user = await requireUser();
  const collections = await getCollections(user.id);
  const verses = collections.flatMap((collection) =>
    collection.verses.map((verse) => ({
      id: verse.id,
      reference: verse.reference,
      text: verse.text,
      note: verse.note,
      collection: `${collection.emoji} ${collection.name}`,
    })),
  );

  return <VerseForge verses={verses} />;
}
