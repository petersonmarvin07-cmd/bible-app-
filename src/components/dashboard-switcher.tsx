"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, type ReactNode } from "react";
import { BackButton } from "@/components/back-button";
import { Icon } from "@/components/icons";

export function DashboardSwitcher({
  initialOption = "a",
  optionAView,
  optionBView,
}: {
  initialOption?: "a" | "b";
  optionAView: ReactNode;
  optionBView: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const urlOption = searchParams.get("option") || searchParams.get("mode");
  const defaultOption =
    urlOption === "b" || urlOption === "B"
      ? "b"
      : urlOption === "a" || urlOption === "A"
      ? "a"
      : initialOption;

  const [activeOption, setActiveOption] = useState<"a" | "b">(defaultOption);

  const switchOption = (opt: "a" | "b") => {
    setActiveOption(opt);
    const params = new URLSearchParams(searchParams.toString());
    params.set("option", opt);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="space-y-6">
      {/* Option A vs Option B Top Segmented Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-line/90 bg-cream p-2 shadow-card">
        <div className="flex items-center gap-2.5 px-2">
          <BackButton fallbackHref="/" label="Back" />
          <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-pine/10 text-pine font-bold text-xs">
            AB
          </span>
          <div>
            <p className="text-xs font-bold text-ink leading-tight">Dashboard Mode Switcher</p>
            <p className="text-[10px] text-ink-muted">Toggle between Household Hub and Canonical Study</p>
          </div>
        </div>

        <div className="inline-flex rounded-xl bg-parchment p-1 border border-line/70">
          <button
            type="button"
            onClick={() => switchOption("a")}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all ${
              activeOption === "a"
                ? "bg-cream text-pine shadow-sm ring-1 ring-line"
                : "text-ink-muted hover:text-ink"
            }`}
          >
            <span>Option A: Household Hub</span>
            <span className="rounded-full bg-amber-100 px-1.5 py-0.2 text-[9px] font-bold text-amber-900">
              Family
            </span>
          </button>

          <button
            type="button"
            onClick={() => switchOption("b")}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all ${
              activeOption === "b"
                ? "bg-pine text-cream shadow-sm"
                : "text-ink-muted hover:text-ink"
            }`}
          >
            <span>Option B: Bible Study Dashboard</span>
            <span className="rounded-full bg-gold-soft px-1.5 py-0.2 text-[9px] font-bold text-amber-900">
              All 66 Books
            </span>
          </button>
        </div>
      </div>

      {/* Render Active View */}
      <div className="animate-fade">
        {activeOption === "a" ? optionAView : optionBView}
      </div>
    </div>
  );
}
