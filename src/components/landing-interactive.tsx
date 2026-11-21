"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Icon } from "@/components/icons";
import { BANDS, MOODS, getBand, type BandId } from "@/lib/constants";

const SAMPLE_PASSAGES = [
  {
    slug: "philippians-4",
    reference: "Philippians 4:6–7",
    theme: "Peace in Anxiety",
    versions: {
      little: {
        title: "Tell God Everything",
        body: "When I feel worried or my tummy gets fluttery, I can tell God about it. God listens with a big, kind heart and gives me a quiet, happy feeling that stays with me like a warm blanket.",
        takeaway: "God loves to hear your smallest whisper.",
        wonder: "What would you like to tell God before sleep tonight?",
      },
      explorer: {
        title: "A Different Kind of Quiet",
        body: "Paul says worry doesn't have to be the whole conversation. Instead, we can turn every single worry into a prayer and every answer into a thank-you. Then something surprising shows up: a peace that stands guard over your heart.",
        takeaway: "Prayer is the door that lets real peace in.",
        wonder: "What worry could you hand to God like a handwritten note today?",
      },
      youth: {
        title: "Anxiety's Antidote",
        body: "Paul wrote this from a Roman prison cell, so he isn't guessing. He names anxiety directly, then offers a practice: pray specifically, thank honestly, and repeat. Peace here is not the absence of problems — it is a guard post around your mind while the chaos is still outside.",
        takeaway: "Trade the endless spiral for one specific sentence of prayer.",
        wonder: "What is one concrete worry you can convert into a prayer right now?",
      },
      grown: {
        title: "Beyond Comprehension",
        body: "The biblical command is not 'stop feeling' but 'start asking.' Prayer with thanksgiving reframes circumstance as relationship. The promised peace is not explained, only given — it exceeds human understanding and stands guard over both heart and mind.",
        takeaway: "Peace is not the resolution of everything; it is the presence of Someone.",
        wonder: "What would change if your first response to worry were prayer rather than a contingency plan?",
      },
    },
  },
  {
    slug: "psalm-23",
    reference: "Psalm 23:1–4",
    theme: "Comfort in the Dark",
    versions: {
      little: {
        title: "The Good Shepherd",
        body: "The Lord is like a kind shepherd who makes sure I have everything I need. Even when the bedroom gets dark or shadows look scary, I don't have to be afraid, because the shepherd stays right beside my bed.",
        takeaway: "God stays close, especially in the dark.",
        wonder: "When do you feel most brave?",
      },
      explorer: {
        title: "Green Pastures, Quiet Water",
        body: "The shepherd leads the sheep to soft grass and quiet water, and the sheep is never left alone. Even in a deep, shadowy valley, the shepherd keeps walking beside them with a staff in hand. Close to the shepherd, fear has to share the room.",
        takeaway: "You are led, not lost.",
        wonder: "What helps you remember God is near when you feel nervous?",
      },
      youth: {
        title: "Not Afraid, Not Alone",
        body: "David doesn't say the valley isn't real; he says the shepherd is. There is a difference between pretending life is fine and trusting that you are accompanied through it. You can be honest about the dark and still be unafraid.",
        takeaway: "Courage is not the absence of the valley — it is the presence of the Shepherd.",
        wonder: "Who could you invite into a valley you're walking through?",
      },
      grown: {
        title: "The Shepherd's Company",
        body: "This psalm is not a promise of easy terrain, but of unbroken company. Provision arrives as rest, guidance arrives as direction, and courage arrives as presence. The rod and staff are not threats but tools of a careful, steadfast hand.",
        takeaway: "Rest is a form of trust; let the Shepherd set the pace.",
        wonder: "Where have you been carrying something alone that the Shepherd is already holding?",
      },
    },
  },
  {
    slug: "matthew-5",
    reference: "Matthew 5:14–16",
    theme: "Your True Identity",
    versions: {
      little: {
        title: "You Are a Little Light",
        body: "Jesus says you are like a bright lamp! A lamp isn't hidden under a basket or stuffed in a closet — it sits up high so everyone can see. When you share and show kindness, people notice the light of God inside you.",
        takeaway: "Your kindness is a light in the dark.",
        wonder: "How can you be a light for someone today?",
      },
      explorer: {
        title: "Light for the Whole Room",
        body: "Jesus calls his friends the light of the world. Light isn't just for being admired — it shows people where to walk safely. When you do good things openly, people start looking for the God who made you shine.",
        takeaway: "Shine so others can find their way.",
        wonder: "Where is the world around you most afraid of the dark?",
      },
      youth: {
        title: "Identity Before Instruction",
        body: "Before Jesus tells you what to do, he tells you who you are: light. You are not fighting to become bright; you are being invited to stop hiding the brightness that is already yours. Let people see the real thing, not a curated version of it.",
        takeaway: "You don't manufacture your light; you reveal it.",
        wonder: "What part of your life are you tempted to hide under a basket?",
      },
      grown: {
        title: "Public Goodness",
        body: "Christ's command is not self-promotion but transparency: 'Let your light shine before others.' Good works are visible and directional, pointing beyond the person to the Father. Witness is less about argument and more about a life that makes sense of God.",
        takeaway: "Let your visible goodness be a signpost, not a spotlight.",
        wonder: "Whose life made God believable to you?",
      },
    },
  },
];

export function LiveReaderHero() {
  const [passageIndex, setPassageIndex] = useState(0);
  const [band, setBand] = useState<BandId>("explorer");
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined") {
        window.speechSynthesis?.cancel();
      }
    };
  }, []);

  const activePassage = SAMPLE_PASSAGES[passageIndex];
  const activeVersion = activePassage.versions[band];
  const bandInfo = getBand(band);

  const speak = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    window.speechSynthesis.cancel();
    const text = `${activeVersion.title}. ${activeVersion.body} Takeaway: ${activeVersion.takeaway}`;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.92;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
    setSpeaking(true);
  };

  return (
    <div className="relative overflow-hidden rounded-[28px] border border-line/90 bg-cream p-1 shadow-lift transition-all">
      {/* Decorative ambient gradients */}
      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-gold-soft/60 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />

      {/* Header bar of the card */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line/70 bg-parchment/60 px-5 py-3.5 sm:px-6">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-pine">
            Live Interactive Scripture Reader
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {SAMPLE_PASSAGES.map((p, idx) => (
            <button
              key={p.slug}
              type="button"
              onClick={() => {
                setPassageIndex(idx);
                if (speaking) {
                  window.speechSynthesis?.cancel();
                  setSpeaking(false);
                }
              }}
              className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition ${
                idx === passageIndex
                  ? "bg-pine text-cream shadow-sm"
                  : "bg-cream text-ink-muted hover:text-ink hover:bg-parchment"
              }`}
            >
              {p.reference.split(" ")[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Age Band Selector Pills */}
      <div className="px-5 pt-4 sm:px-6">
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-ink-muted">
            Tap an age band to adapt the words:
          </span>
          <span className="text-[10px] text-gold font-semibold uppercase tracking-wider">
            One passage · 4 hearts
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {BANDS.map((item) => {
            const isSelected = item.id === band;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setBand(item.id);
                  if (speaking) {
                    window.speechSynthesis?.cancel();
                    setSpeaking(false);
                  }
                }}
                className={`relative flex flex-col rounded-xl border p-2.5 text-left transition-all ${
                  isSelected
                    ? "border-pine bg-pine text-cream shadow-md scale-[1.02]"
                    : "border-line/80 bg-cream/90 text-ink hover:border-pine/30 hover:bg-parchment/60"
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-sm">{item.emoji}</span>
                  <span className="text-xs font-semibold truncate">{item.label}</span>
                </div>
                <span
                  className={`mt-1 text-[10px] font-medium ${
                    isSelected ? "text-cream/80" : "text-ink-muted"
                  }`}
                >
                  {item.short}
                </span>
                {isSelected ? (
                  <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-gold-soft" />
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      {/* Live Scripture Content */}
      <div
        key={`${activePassage.slug}-${band}`}
        className="animate-fade px-5 py-5 sm:px-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/30 bg-gold-soft/50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-amber-900">
              {activePassage.theme} · {activePassage.reference}
            </span>
            <h3 className="mt-2 font-display text-xl text-ink sm:text-2xl">
              {activeVersion.title}
            </h3>
          </div>
          <button
            type="button"
            onClick={speak}
            className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${
              speaking
                ? "border-emerald-300 bg-emerald-50 text-emerald-800 animate-pulse"
                : "border-line bg-cream text-ink-soft hover:border-pine/40 hover:text-pine"
            }`}
            title="Listen to this retelling"
          >
            <Icon name={speaking ? "sun" : "sun"} className="h-3.5 w-3.5" />
            {speaking ? "Reading aloud…" : "Read aloud"}
          </button>
        </div>

        <p className="prose-scripture mt-3 text-[15px] sm:text-[16px] leading-[1.8] text-ink-soft">
          &ldquo;{activeVersion.body}&rdquo;
        </p>

        {/* Takeaway & Wonder Cards */}
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/70 p-3.5">
            <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-800">
              The Takeaway
            </span>
            <p className="mt-1 font-display text-[14px] leading-snug text-emerald-950">
              {activeVersion.takeaway}
            </p>
          </div>
          <div className="rounded-xl border border-amber-200/80 bg-amber-50/70 p-3.5">
            <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-amber-800">
              Wonder Together
            </span>
            <p className="mt-1 font-display text-[14px] leading-snug text-amber-950">
              {activeVersion.wonder}
            </p>
          </div>
        </div>
      </div>

      {/* Footer bar with quick action */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line/70 bg-parchment/40 px-5 py-3 sm:px-6">
        <span className="text-xs text-ink-muted flex items-center gap-1.5">
          <Icon name="sparkles" className="h-3.5 w-3.5 text-gold" />
          <span>
            Retold for <strong>{bandInfo.label}</strong> ({bandInfo.short})
          </span>
        </span>
        <div className="flex items-center gap-2">
          <Link
            href="/read"
            className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-cream px-3 py-1.5 text-xs font-semibold text-ink transition hover:border-pine/40 hover:bg-parchment"
          >
            Open Full Library (12 Passages)
            <Icon name="arrowRight" className="h-3 w-3" />
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 rounded-xl bg-pine px-3.5 py-1.5 text-xs font-semibold text-cream shadow-sm transition hover:bg-pine-deep"
          >
            Enter Dashboard
            <Icon name="arrowRight" className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export function InteractiveMoodDemo() {
  const [selectedMood, setSelectedMood] = useState<string>(MOODS[0].id);

  const moodData: Record<
    string,
    { slug: string; passage: string; theme: string; quote: string; step: string }
  > = {
    anxious: {
      slug: "philippians-4",
      passage: "Philippians 4:6–7",
      theme: "Peace",
      quote: "Do not be anxious about anything. Turn every worry into a prayer, and a peace that stands guard will arrive.",
      step: "Name the exact worry you're rehearsing and speak it out loud to God once.",
    },
    grateful: {
      slug: "genesis-1",
      passage: "Genesis 1:1–5",
      theme: "Beginnings",
      quote: "God spoke, and light spilled into the void. God called the light day and said it was good.",
      step: "Notice three small things you can actually see right now and whisper thank you.",
    },
    hopeful: {
      slug: "isaiah-40",
      passage: "Isaiah 40:28–31",
      theme: "Hope & Strength",
      quote: "Those who hope in the Lord will renew their strength. They will soar on wings like eagles.",
      step: "Pause pushing. Waiting on God is where your strength gets exchanged.",
    },
    lonely: {
      slug: "psalm-23",
      passage: "Psalm 23:1–4",
      theme: "Comfort & Presence",
      quote: "Even through the darkest valley, I will fear no evil, for you are with me; your rod and staff comfort me.",
      step: "Remind yourself: you are accompanied right where you sit.",
    },
    joyful: {
      slug: "john-3",
      passage: "John 3:16–17",
      theme: "Love",
      quote: "God's love isn't a small, careful thing — it's the biggest gift, given so the world could be rescued and made new.",
      step: "Share that joy with someone who has had a heavy week.",
    },
    weary: {
      slug: "matthew-11",
      passage: "Matthew 11:28–30",
      theme: "Rest for the Soul",
      quote: "Come to me, all who are weary and burdened, and I will give you rest. My yoke is easy and light.",
      step: "Lay down the burden that was never yours to fix today.",
    },
    curious: {
      slug: "psalm-139",
      passage: "Psalm 139:13–18",
      theme: "Wonder & Design",
      quote: "I am fearfully and wonderfully made; your works are wonderful, I know that full well.",
      step: "Pin your question on the Wonder Wall — curious faith is welcomed.",
    },
    courageous: {
      slug: "1-samuel-17",
      passage: "1 Samuel 17:45–47",
      theme: "Courage",
      quote: "You come with a sword, but I come in the name of the Lord of hosts.",
      step: "Take off the armor that doesn't fit you and walk with your own size of faith.",
    },
    grieving: {
      slug: "luke-15",
      passage: "Luke 15:4–7",
      theme: "Grace & Pursuing Love",
      quote: "What shepherd having a hundred sheep, if he loses one, does not leave the ninety-nine and search?",
      step: "You are not forgotten. God searches for the one who hurts.",
    },
    stretched: {
      slug: "proverbs-3",
      passage: "Proverbs 3:5–6",
      theme: "Trust",
      quote: "Trust in the Lord with all your heart, and lean not on your own understanding.",
      step: "Acknowledge God in the one decision you can't figure out.",
    },
  };

  const active = moodData[selectedMood] ?? moodData.anxious;

  return (
    <div className="rounded-3xl border border-line bg-cream p-6 shadow-card sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-gold">
            World-First · Faithprint Matching
          </span>
          <h3 className="mt-1 font-display text-2xl text-ink">
            How is your heart arriving today?
          </h3>
          <p className="mt-1 text-xs text-ink-muted">
            Tap a mood below. Lumen matches scripture by emotional state, not random chance.
          </p>
        </div>
        <Link
          href="/faithprint"
          className="inline-flex items-center gap-1.5 rounded-xl bg-pine px-4 py-2 text-xs font-semibold text-cream shadow-sm transition hover:bg-pine-deep"
        >
          Try Full Faithprint
          <Icon name="arrowRight" className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Mood Pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        {MOODS.map((m) => {
          const isSelected = m.id === selectedMood;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => setSelectedMood(m.id)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                isSelected
                  ? "border-pine bg-pine text-cream shadow-sm scale-105"
                  : "border-line bg-parchment/60 text-ink hover:border-pine/30 hover:bg-parchment"
              }`}
            >
              <span>{m.emoji}</span>
              <span>{m.label}</span>
            </button>
          );
        })}
      </div>

      {/* Result Card */}
      <div className="rounded-2xl border border-line/80 bg-parchment/40 p-5 sm:p-6 transition-all">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-gold-soft px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-900">
              Matched: {active.theme}
            </span>
            <span className="font-display font-semibold text-sm text-ink">
              {active.passage}
            </span>
          </div>
          <Link
            href={`/read?passage=${active.slug}`}
            className="text-xs font-semibold text-pine hover:underline flex items-center gap-1"
          >
            Read across all 4 ages →
          </Link>
        </div>

        <p className="mt-3 font-display text-[16px] leading-relaxed text-ink">
          &ldquo;{active.quote}&rdquo;
        </p>

        <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-emerald-200/80 bg-emerald-50/70 p-3">
          <Icon name="sparkles" className="h-4 w-4 shrink-0 text-emerald-800 mt-0.5" />
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-800">
              Your Faithprint Next Step
            </span>
            <p className="mt-0.5 text-xs text-emerald-950 font-medium">
              {active.step}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function WonderWallShowcase() {
  const wonders = [
    {
      asker: "Ada",
      age: 8,
      avatar: "🦋",
      band: "Explorers",
      question: "If God spoke light into being, why did God say it out loud? Couldn't God just think it?",
      answer: "That's a brilliant question. Maybe saying it out loud is God inviting us into the story — the way you say 'I love you' out loud instead of just thinking it.",
      answeredBy: "Grace (Mum)",
    },
    {
      asker: "Tunde",
      age: 5,
      avatar: "🐢",
      band: "Little Lambs",
      question: "Is the shepherd stronger than the big dark outside my window?",
      answer: "Yes, always. The dark is big, but the shepherd is closer than the dark, and he never lets go of you.",
      answeredBy: "Grace (Mum)",
    },
    {
      asker: "Noah",
      age: 15,
      avatar: "🎧",
      band: "Youth",
      question: "How do you know when it's God's direction and not just your own preference?",
      answer: "God's direction usually makes you more patient, more generous, and less self-protective than your own preferences do.",
      answeredBy: "Mum Bisi (Grandma)",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {wonders.map((w) => (
        <div
          key={w.asker}
          className="card-surface flex flex-col justify-between p-5 transition-all hover:-translate-y-1 hover:shadow-lift"
        >
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">{w.avatar}</span>
                <div>
                  <p className="text-xs font-bold text-ink">
                    {w.asker}, age {w.age}
                  </p>
                  <p className="text-[10px] text-ink-muted">{w.band}</p>
                </div>
              </div>
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-900">
                Answered
              </span>
            </div>
            <p className="font-display text-[15px] leading-snug text-ink font-semibold">
              &ldquo;{w.question}&rdquo;
            </p>
          </div>

          <div className="mt-4 rounded-xl border border-emerald-200/80 bg-emerald-50/60 p-3">
            <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-800">
              {w.answeredBy}
            </span>
            <p className="mt-1 text-xs leading-relaxed text-emerald-950">
              {w.answer}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
