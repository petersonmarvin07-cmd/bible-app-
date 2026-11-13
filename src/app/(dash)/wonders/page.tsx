import { WonderBoard } from "@/components/wonder-board";
import { requireUser } from "@/lib/auth";
import { getFamily, getWonders } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function WondersPage() {
  const user = await requireUser();
  const [wonders, family] = await Promise.all([getWonders(user.id), getFamily(user.id)]);
  return <WonderBoard initialWonders={wonders} family={family} answererName={user.name.split(" ")[0]} />;
}
