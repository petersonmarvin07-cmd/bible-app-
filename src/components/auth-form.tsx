"use client";

import Link from "next/link";
import { useActionState } from "react";

import { demoSignInAction, signInAction, signUpAction, type AuthState } from "@/app/actions/auth";
import { BackButton } from "@/components/back-button";
import { Icon } from "@/components/icons";
import { BANDS } from "@/lib/constants";
import { inputClass, labelClass, Notice, Spinner } from "@/components/ui";

export function AuthForm({ mode }: { mode: "signin" | "signup" }) {
  const action = mode === "signin" ? signInAction : signUpAction;
  const [state, formAction, pending] = useActionState<AuthState, FormData>(action, null);

  return (
    <div className="w-full">
      <div className="mb-6 flex items-center justify-between gap-3">
        <BackButton fallbackHref="/" label="Back to Home" />
        <Link
          href="/read"
          className="text-xs font-semibold text-pine hover:underline"
        >
          Browse the Bible first →
        </Link>
      </div>

      <div className="mb-7">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-gold">
          {mode === "signin" ? "Welcome back" : "Create your household"}
        </p>
        <h1 className="font-display text-3xl leading-tight text-ink">
          {mode === "signin" ? "Pick up where you left off." : "Scripture that fits every age."}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-muted">
          {mode === "signin"
            ? "Your saved verses, family circle and reading streaks are waiting."
            : "One account for the whole household — from Tunde's bedtime stories to your 6am quiet."}
        </p>
      </div>

      <form action={formAction} className="space-y-4">
        {mode === "signup" ? (
          <div>
            <label className={labelClass} htmlFor="name">
              Your name
            </label>
            <input id="name" name="name" required autoComplete="name" placeholder="Grace Okafor" className={inputClass} />
          </div>
        ) : null}

        <div>
          <label className={labelClass} htmlFor="email">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            defaultValue={mode === "signin" ? "grace@lumen.app" : ""}
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="password">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={6}
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            placeholder={mode === "signin" ? "••••••••" : "At least 6 characters"}
            defaultValue={mode === "signin" ? "lumen123" : ""}
            className={inputClass}
          />
        </div>

        {mode === "signup" ? (
          <div>
            <span className={labelClass}>Which reading level feels like home?</span>
            <div className="grid grid-cols-2 gap-2">
              {BANDS.map((band, index) => (
                <label
                  key={band.id}
                  className="cursor-pointer rounded-xl border border-line bg-cream px-3 py-2.5 text-xs transition has-[:checked]:border-pine has-[:checked]:bg-pine/5 has-[:checked]:shadow-sm"
                >
                  <input
                    type="radio"
                    name="homeBand"
                    value={band.id}
                    defaultChecked={index === 3}
                    className="sr-only"
                  />
                  <span className="flex items-center gap-2 font-medium text-ink">
                    <span>{band.emoji}</span>
                    {band.label}
                  </span>
                  <span className="mt-0.5 block text-[11px] text-ink-muted">{band.short}</span>
                </label>
              ))}
            </div>
          </div>
        ) : null}

        <Notice message={state?.error ?? null} />

        <button
          type="submit"
          disabled={pending}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-pine px-4 py-3 text-sm font-semibold text-cream shadow-sm transition hover:bg-pine-deep disabled:opacity-60"
        >
          {pending ? <Spinner /> : null}
          {pending
            ? mode === "signin"
              ? "Opening your library…"
              : "Preparing your household…"
            : mode === "signin"
              ? "Sign in"
              : "Create account"}
        </button>
      </form>

      <div className="my-6 flex items-center gap-3 text-[11px] uppercase tracking-[0.18em] text-ink-muted">
        <span className="h-px flex-1 bg-line" />
        or walk through the demo
        <span className="h-px flex-1 bg-line" />
      </div>

      <form action={demoSignInAction}>
        <button
          type="submit"
          className="group flex w-full items-center justify-between gap-3 rounded-xl border border-line bg-parchment/70 px-4 py-3 text-left text-sm transition hover:border-gold/60 hover:bg-gold-soft/40"
        >
          <span>
            <span className="block font-medium text-ink">Enter the Okafor Family</span>
            <span className="block text-[11px] text-ink-muted">
              A seeded household with journals, plans and wonders
            </span>
          </span>
          <Icon name="arrowRight" className="h-4 w-4 shrink-0 text-pine transition group-hover:translate-x-0.5" />
        </button>
      </form>

      <p className="mt-6 text-center text-xs text-ink-muted">
        {mode === "signin" ? "New to Lumen? " : "Already have a household? "}
        <Link
          href={mode === "signin" ? "/signup" : "/login"}
          className="font-semibold text-pine underline decoration-gold/50 underline-offset-4 hover:text-pine-deep"
        >
          {mode === "signin" ? "Create an account" : "Sign in"}
        </Link>
      </p>
    </div>
  );
}
