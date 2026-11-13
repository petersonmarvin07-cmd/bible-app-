import { PrayerBoard } from "@/components/prayer-board";
import { requireUser } from "@/lib/auth";
import { getPrayers } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function PrayerPage() {
  const user = await requireUser();
  const prayers = await getPrayers(user.id);
  return <PrayerBoard initialPrayers={prayers} defaultAuthor={user.name.split(" ")[0]} />;
}
