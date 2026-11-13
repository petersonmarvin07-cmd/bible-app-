import { FamilyBoard } from "@/components/family-board";
import { requireUser } from "@/lib/auth";
import { getFamily } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function FamilyPage() {
  const user = await requireUser();
  const members = await getFamily(user.id);
  return <FamilyBoard initialMembers={members} householdName={user.householdName} />;
}
