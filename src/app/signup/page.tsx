import { redirect } from "next/navigation";

import { AuthForm } from "@/components/auth-form";
import { AuthVisual } from "@/components/auth-visual";
import { getSessionUser } from "@/lib/auth";
import { ensureSeeded } from "@/lib/seed";

export const dynamic = "force-dynamic";

export const metadata = { title: "Create your household · Lumen" };

export default async function SignUpPage() {
  await ensureSeeded();
  const user = await getSessionUser();
  if (user) redirect("/dashboard");

  return (
    <main className="grid min-h-dvh lg:grid-cols-[1.05fr_1fr]">
      <div className="hidden lg:block">
        <AuthVisual />
      </div>
      <div className="flex items-center justify-center bg-parchment px-5 py-12 sm:px-10">
        <div className="w-full max-w-md">
          <AuthForm mode="signup" />
        </div>
      </div>
    </main>
  );
}
