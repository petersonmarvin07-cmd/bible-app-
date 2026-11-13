import { PlansBoard } from "@/components/plans-board";
import { requireUser } from "@/lib/auth";
import { getPassageOptions, getPlans } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function PlansPage() {
  const user = await requireUser();
  const [plans, passageOptions] = await Promise.all([getPlans(user.id), getPassageOptions()]);
  return <PlansBoard initialPlans={plans} passageOptions={passageOptions} />;
}
