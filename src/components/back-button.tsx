"use client";

import { useRouter } from "next/navigation";
import { Icon } from "@/components/icons";

export function BackButton({
  fallbackHref = "/dashboard",
  label = "Back",
  className = "",
}: {
  fallbackHref?: string;
  label?: string;
  className?: string;
}) {
  const router = useRouter();

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackHref);
    }
  };

  return (
    <button
      type="button"
      onClick={handleBack}
      className={`group inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xl border border-line bg-cream px-3 py-1.5 text-xs font-semibold text-ink-soft shadow-sm transition hover:border-pine/40 hover:bg-parchment hover:text-ink active:scale-95 ${className}`}
      aria-label={label}
    >
      <Icon
        name="chevronRight"
        className="h-3.5 w-3.5 rotate-180 text-ink-muted transition group-hover:-translate-x-0.5 group-hover:text-pine"
      />
      <span>{label}</span>
    </button>
  );
}
