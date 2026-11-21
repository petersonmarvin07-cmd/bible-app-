import { redirect } from "next/navigation";

import { AuthForm } from "@/components/auth-form";
import { AuthVisual } from "@/components/auth-visual";
import { getSessionUser } from "@/lib/auth";
import { ensureSeeded } from "@/lib/seed";

export const dynamic = "force-dynamic";

export const metadata = { title: "Sign in · Lumen" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ demo?: string }>;
}) {
  await ensureSeeded().catch(() => undefined);
  const user = await getSessionUser();
  if (user) redirect("/dashboard");
  const params = searchParams ? await searchParams : {};
  const initialError =
    params.demo === "missing"
      ? "Demo household could not be loaded. Please verify DATABASE_URL and database connectivity."
      : null;

  return (
    <main className="grid min-h-dvh lg:grid-cols-[1.05fr_1fr]">
      <div className="hidden lg:block">
        <AuthVisual />
      </div>
      <div className="flex items-center justify-center bg-parchment px-5 py-12 sm:px-10">
        <div className="w-full max-w-md">
          <AuthForm mode="signin" initialError={initialError} />
        </div>
      </div>
    </main>
  );
}
