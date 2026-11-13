import { CollectionsBoard } from "@/components/collections-board";
import { requireUser } from "@/lib/auth";
import { getCollections } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function CollectionsPage() {
  const user = await requireUser();
  const collections = await getCollections(user.id);
  return <CollectionsBoard initialCollections={collections} />;
}
