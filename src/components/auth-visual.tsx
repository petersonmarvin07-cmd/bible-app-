import Link from "next/link";

import { LumenMark } from "@/components/icons";
import { getBand } from "@/lib/constants";

const preview = [
  {
    band: "little",
    text: "God loves the world so much that he gave us Jesus. Jesus came to help us find our way home.",
  },
  {
    band: "grown",
    text: "Love here is measured by what it gives and how it moves toward, not away. The mission is saving, not condemning.",
  },
];

export function AuthVisual() {
  return (
    <div className="relative flex h-full flex-col justify-between overflow-hidden bg-pine-deep p-8 text-cream lg:p-12">
      <div className="pointer-events-none absolute inset-0 opacity-70">
        <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="animate-glow absolute -right-16 bottom-0 h-80 w-80 rounded-full bg-amber-400/20 blur-3xl" />
        <div className="grain absolute inset-0 opacity-30" />
      </div>

      <Link href="/" className="relative z-10 inline-flex items-center gap-3">
        <LumenMark className="h-10 w-10" />
        <span className="font-display text-2xl tracking-tight">Lumen</span>
      </Link>

      <div className="relative z-10 my-10 max-w-md">
        <p className="font-display text-[30px] leading-[1.25] text-cream/95">
          &ldquo;The same passage, retold for four hearts — so nobody in the room has to read someone
          else&rsquo;s version of the story.&rdquo;
        </p>
        <div className="mt-8 space-y-3">
          {preview.map((item) => {
            const band = getBand(item.band);
            return (
              <div
                key={item.band}
                className="rounded-2xl border border-cream/15 bg-cream/[0.07] p-4 backdrop-blur-sm"
              >
                <div className="mb-1.5 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-gold-soft">
                  <span>{band.emoji}</span>
                  {band.label} · {band.short}
                </div>
                <p className="font-display text-[15px] leading-relaxed text-cream/85">{item.text}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="relative z-10 flex items-center gap-3 text-[11px] uppercase tracking-[0.18em] text-cream/50">
        <span className="h-px w-8 bg-cream/25" />
        Built for ages 3 to 93
      </div>
    </div>
  );
}
