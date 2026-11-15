import "server-only";

import { sql } from "drizzle-orm";

import { db, pool } from "@/db";
import {
  collections,
  familyMembers,
  journalEntries,
  passageVersions,
  passages,
  planDays,
  prayers,
  readingLog,
  readingPlans,
  savedVerses,
  users,
  wonders,
} from "@/db/schema";
import { hashPassword } from "@/lib/auth";

type Band = "little" | "explorer" | "youth" | "grown";

type SeedPassage = {
  slug: string;
  reference: string;
  book: string;
  chapter: number;
  verseStart: number;
  verseEnd: number;
  theme: string;
  testament: "Old" | "New";
  reflectionPrompt: string;
  versions: Record<Band, { title: string; body: string; takeaway: string; wonder: string }>;
};

export const SEED_PASSAGES: SeedPassage[] = [
  {
    slug: "genesis-1",
    reference: "Genesis 1:1–5",
    book: "Genesis",
    chapter: 1,
    verseStart: 1,
    verseEnd: 5,
    theme: "Beginnings",
    testament: "Old",
    reflectionPrompt: "Where is God inviting you to begin again?",
    versions: {
      little: {
        title: "God Says, Let There Be Light!",
        body: "In the very beginning, God made the sky, the sea, and everything alive. Then God said, \"Let there be light!\" — and the dark was never alone again.",
        takeaway: "God makes wonderful beginnings.",
        wonder: "What is your favorite thing God made?",
      },
      explorer: {
        title: "The First Morning",
        body: "Before there was anything at all, God was there. God spoke, and light spilled into the emptiness. God called the light \"day\" and the dark \"night,\" and both belonged to a good plan. That first evening and morning started everything.",
        takeaway: "God turns empty spaces into beginnings.",
        wonder: "Where do you see God making something new right now?",
      },
      youth: {
        title: "A Voice Over the Void",
        body: "Everything starts with God — not with applause, not with certainty, not with a plan you can show anyone. It starts with a voice saying light belongs here. Whatever still feels formless in your life, that same voice is not finished speaking.",
        takeaway: "You are not an accident; you are part of a deliberate beginning.",
        wonder: "What would change if you handed God the unformed parts of your story?",
      },
      grown: {
        title: "Order Out of Presence",
        body: "Scripture opens with an announcement rather than an explanation. God creates, God speaks, God names. Light arrives before the sun — order comes from presence, not circumstance. Genesis invites us to begin where God begins: with intent, in rhythm, toward rest.",
        takeaway: "Begin with God, and let God name the light in your day.",
        wonder: "What \"let there be light\" moment do you need to ask for this week?",
      },
    },
  },
  {
    slug: "psalm-23",
    reference: "Psalm 23:1–4",
    book: "Psalms",
    chapter: 23,
    verseStart: 1,
    verseEnd: 4,
    theme: "Comfort",
    testament: "Old",
    reflectionPrompt: "Which valley are you walking through today?",
    versions: {
      little: {
        title: "The Good Shepherd",
        body: "The Lord is like a kind shepherd who makes sure I have everything I need. Even when the path gets dark and scary, I don't have to be afraid, because the shepherd stays right beside me.",
        takeaway: "God stays close, especially in the dark.",
        wonder: "When do you feel brave?",
      },
      explorer: {
        title: "Green Pastures, Quiet Water",
        body: "The shepherd leads the sheep to soft grass and quiet water, and the sheep is never alone. Even in a deep, shadowy valley, the shepherd keeps walking beside them with a staff in hand. Close to the shepherd, fear has to share the room.",
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
        body: "This psalm is not a promise of easy terrain, but of unbroken company. Provision arrives as rest, guidance arrives as direction, and courage arrives as presence. The rod and staff are not threats but tools of a careful hand.",
        takeaway: "Rest is a form of trust; let the Shepherd set the pace.",
        wonder: "Where have you been carrying something alone that the Shepherd is already holding?",
      },
    },
  },
  {
    slug: "philippians-4",
    reference: "Philippians 4:6–7",
    book: "Philippians",
    chapter: 4,
    verseStart: 6,
    verseEnd: 7,
    theme: "Peace",
    testament: "New",
    reflectionPrompt: "Name the worry you keep rehearsing.",
    versions: {
      little: {
        title: "Tell God Everything",
        body: "When I feel worried, I can tell God about it. God listens with a big, kind heart and gives me a quiet, happy feeling that stays with me.",
        takeaway: "God loves to hear from you.",
        wonder: "What would you like to tell God today?",
      },
      explorer: {
        title: "A Different Kind of Quiet",
        body: "Paul says worry doesn't have to be the whole conversation. Instead, we can turn every worry into a prayer and every answer into a thank-you. Then something surprising shows up: a peace that stands guard over your heart.",
        takeaway: "Prayer is the door that lets peace in.",
        wonder: "What worry could you hand to God like a note today?",
      },
      youth: {
        title: "Anxiety's Antidote",
        body: "Paul wrote this from a prison cell, so he isn't guessing. He names anxiety directly, then offers a practice: pray specifically, thank honestly, and repeat. Peace here is not the absence of problems — it is a guard post around your mind while the problems are still outside.",
        takeaway: "Trade the spiral for a specific prayer.",
        wonder: "What is one concrete worry you can convert into one sentence of prayer?",
      },
      grown: {
        title: "Beyond Comprehension",
        body: "The command is not \"stop feeling\" but \"start asking.\" Prayer with thanksgiving reframes circumstance as relationship. The promised peace is not explained, only given — it exceeds understanding and stands guard over both heart and mind.",
        takeaway: "Peace is not the resolution of everything; it is the presence of Someone.",
        wonder: "What would change if your first response to worry were a prayer rather than a plan?",
      },
    },
  },
  {
    slug: "matthew-5",
    reference: "Matthew 5:14–16",
    book: "Matthew",
    chapter: 5,
    verseStart: 14,
    verseEnd: 16,
    theme: "Identity",
    testament: "New",
    reflectionPrompt: "What is your light doing this week?",
    versions: {
      little: {
        title: "You Are a Little Light",
        body: "Jesus says you are like a bright lamp! A lamp isn't hidden under a basket — it sits up high so everyone can see. When you are kind, people notice the light of God in you.",
        takeaway: "Your kindness is a light.",
        wonder: "How can you be a light for someone today?",
      },
      explorer: {
        title: "Light for the Whole Room",
        body: "Jesus calls his friends the light of the world. Light isn't just for being looked at — it shows people where to walk. When you do good things openly, people start looking for the God who made you shine.",
        takeaway: "Shine so others can find their way.",
        wonder: "Where is the world in your school or street most afraid of the dark?",
      },
      youth: {
        title: "Identity Before Instruction",
        body: "Before Jesus tells you what to do, he tells you who you are: light. You are not fighting to become bright; you are being invited to stop hiding the brightness that is already yours. Let people see the real thing, not a curated version of it.",
        takeaway: "You don't create your light; you reveal it.",
        wonder: "What part of your life are you tempted to hide under a basket?",
      },
      grown: {
        title: "Public Goodness",
        body: "Christ's command is not self-promotion but transparency, \"Let your light shine before others.\" Good works are visible and directional, pointing beyond the person to the Father. Witness is less about argument and more about a life that makes sense of God.",
        takeaway: "Let your visible goodness be a signpost, not a spotlight.",
        wonder: "Whose life made God believable to you?",
      },
    },
  },
  {
    slug: "john-3",
    reference: "John 3:16–17",
    book: "John",
    chapter: 3,
    verseStart: 16,
    verseEnd: 17,
    theme: "Love",
    testament: "New",
    reflectionPrompt: "Which love story do you find hardest to believe?",
    versions: {
      little: {
        title: "God Loves the Whole World",
        body: "God loves the world so much that he gave us Jesus. Jesus came not to wag a finger at us, but to help us find our way home.",
        takeaway: "God's love is wide and kind.",
        wonder: "Who could you love with a big voice today?",
      },
      explorer: {
        title: "The Best Gift",
        body: "God's love isn't a small, careful thing — it's the biggest gift, given to the whole world. Jesus came so we could be rescued and made new, not so we could be scolded. Love was the plan from the start.",
        takeaway: "You are loved before you are anything else.",
        wonder: "When has someone loved you without asking for anything back?",
      },
      youth: {
        title: "Sent, Not Sentenced",
        body: "God did not wait for the world to be impressive before loving it. The Son was sent into the world's mess to save it, not to score a point against it. Faith is trusting the one who came with rescue in his hands.",
        takeaway: "Your value begins with God's love, not your performance.",
        wonder: "Where are you still trying to earn something that's already been given?",
      },
      grown: {
        title: "The Measure of Love",
        body: "Love here is measured by what it gives and how it moves toward, not away. The mission is saving, not condemning — a distinction that reframes how we see ourselves, and how we treat the world we are still sent into.",
        takeaway: "Love that costs everything is the love we are asked to extend.",
        wonder: "Toward whom is love asking you to move this week?",
      },
    },
  },
  {
    slug: "luke-15",
    reference: "Luke 15:4–7",
    book: "Luke",
    chapter: 15,
    verseStart: 4,
    verseEnd: 7,
    theme: "Grace",
    testament: "New",
    reflectionPrompt: "Who or what have you written off?",
    versions: {
      little: {
        title: "The One Lost Lamb",
        body: "If a shepherd has one hundred sheep and one wanders away, he goes looking for the lost one. When he finds it, he carries it home and celebrates with everyone!",
        takeaway: "God comes looking for you.",
        wonder: "How does it feel to know someone would look for you?",
      },
      explorer: {
        title: "One Is Worth Finding",
        body: "Niney-nine safe sheep sound like plenty, but the shepherd counts to ninety-nine and feels the missing one. He leaves, searches, and returns with the lost lamb on his shoulders. Heaven celebrates exactly like that.",
        takeaway: "You are never too far to be found.",
        wonder: "What does it mean that heaven counts you?",
      },
      youth: {
        title: "Found Is a Location, Not a Label",
        body: "Jesus tells this story to people who assumed some are worth searching for and others aren't. The shepherd's math is different: one missing sheep is worth everything. Grace does not wait for the lost to become findable.",
        takeaway: "You can stop wandering and start being found.",
        wonder: "Where do you need to receive grace instead of earning it?",
      },
      grown: {
        title: "The Searching Heart of God",
        body: "The parable is less about a careless sheep than an undivided shepherd. The search is deliberate, the carrying is personal, and the celebration is corporate. Grace is not a lowered standard; it is a pursuing love.",
        takeaway: "Grace finds us before it fixes us.",
        wonder: "Who is waiting for you to join the search?",
      },
    },
  },
  {
    slug: "proverbs-3",
    reference: "Proverbs 3:5–6",
    book: "Proverbs",
    chapter: 3,
    verseStart: 5,
    verseEnd: 6,
    theme: "Trust",
    testament: "Old",
    reflectionPrompt: "What are you trying to control this week?",
    versions: {
      little: {
        title: "Hold God's Hand",
        body: "I can trust God with all my heart, even when I don't understand what's happening. When I hold God's hand, God shows me the next good step.",
        takeaway: "God knows the way — hold on tight.",
        wonder: "Where do you like to hold someone's hand?",
      },
      explorer: {
        title: "Straight Paths",
        body: "It's easy to lean on what we understand, but wisdom says there's more going on than we can see. Trusting God with your whole heart means letting God be the map, not just the advice. God is committed to making a way.",
        takeaway: "God can be trusted with the parts you can't see.",
        wonder: "What is one thing you can't figure out yet?",
      },
      youth: {
        title: "Lean Less, Trust More",
        body: "Leaning on your own understanding isn't stupid — it's just exhausting. You were never meant to be your own final authority. Trusting God doesn't remove questions; it gives you somewhere to put them while you keep moving.",
        takeaway: "Trust is a direction you walk, not a feeling you wait for.",
        wonder: "What decision would look different if God were in the room?",
      },
      grown: {
        title: "The Courage of Dependence",
        body: "The proverb does not promise comprehension, only direction. Trust with the whole heart is a deliberate transfer of weight. Acknowledging God in every path — not just the spiritual ones — is what makes crooked routes straight.",
        takeaway: "Direction is God's work; walking is yours.",
        wonder: "Which path are you navigating alone that you could acknowledge God in?",
      },
    },
  },
  {
    slug: "isaiah-40",
    reference: "Isaiah 40:28–31",
    book: "Isaiah",
    chapter: 40,
    verseStart: 28,
    verseEnd: 31,
    theme: "Hope",
    testament: "Old",
    reflectionPrompt: "Where are you running on empty?",
    versions: {
      little: {
        title: "New Strong Wings",
        body: "God never gets tired and never needs a nap. When we wait for God and ask for help, God gives us strong wings to fly and the strength to keep going.",
        takeaway: "God's strength never runs out.",
        wonder: "If you had wings, where would you fly?",
      },
      explorer: {
        title: "Wings Like Eagles",
        body: "Everyone gets tired — even young, strong people stumble. But God's strength doesn't run out. Those who hope in the Lord are lifted, restored, and given the energy to keep walking when the road is long.",
        takeaway: "Hope refuels what effort empties.",
        wonder: "When have you felt strong in a way you couldn't explain?",
      },
      youth: {
        title: "Sustainable Strength",
        body: "There is an exhaustion no nap can fix, and Isaiah is honest about it. His answer isn't more hustle; it's hope — a re-centering on the One who never runs out. Sometimes strength looks like walking slowly and not quitting.",
        takeaway: "You are allowed to need renewal.",
        wonder: "What would resting in God look like this week instead of pushing through?",
      },
      grown: {
        title: "The Renewal of the Weary",
        body: "Isaiah speaks to exiles, not athletes. The promise is not boundless capacity but renewed capacity — mounting, running, walking. God's understanding is unsearchable and God's strength is transferable to those who wait.",
        takeaway: "Waiting is not wasted; it is where strength is exchanged.",
        wonder: "What would it look like to wait well this season?",
      },
    },
  },
  {
    slug: "matthew-11",
    reference: "Matthew 11:28–30",
    book: "Matthew",
    chapter: 11,
    verseStart: 28,
    verseEnd: 30,
    theme: "Rest",
    testament: "New",
    reflectionPrompt: "What burden are you carrying that was never yours?",
    versions: {
      little: {
        title: "Come and Rest",
        body: "Jesus says, \"Come to me if you are tired.\" He is gentle and says, \"I will give you rest.\" His way is kind, like a soft yoke that helps instead of hurts.",
        takeaway: "Jesus gives gentle rest.",
        wonder: "Where is your favorite place to rest?",
      },
      explorer: {
        title: "An Easy Yoke",
        body: "A yoke is a wooden bar that helps a pair of oxen pull together — not a punishment. Jesus says the life he offers is like that: shared weight and a gentle pace. If you are worn out, he says, come here first.",
        takeaway: "You were not made to carry everything alone.",
        wonder: "What feels heavy on your shoulders right now?",
      },
      youth: {
        title: "The Invitation to Be Unimpressive",
        body: "Jesus invites the tired, unbothered by how capable you look. His yoke is a partnership, not a performance review. Learning his rhythm includes learning to say no to what is not yours to carry.",
        takeaway: "Rest is obedience, not a reward.",
        wonder: "What would you put down today if you weren't afraid of what people would think?",
      },
      grown: {
        title: "A Shared Yoke",
        body: "The invitation answers the exhaustion of self-salvation. Jesus does not offer a heavier discipline; he offers himself as the one yoked beside us. His burden is light because it is proportionate to a shared strength.",
        takeaway: "Bring your whole weight to Jesus, not your best effort.",
        wonder: "What are you pretending doesn't weigh anything?",
      },
    },
  },
  {
    slug: "psalm-139",
    reference: "Psalm 139:13–18",
    book: "Psalms",
    chapter: 139,
    verseStart: 13,
    verseEnd: 18,
    theme: "Wonder",
    testament: "Old",
    reflectionPrompt: "What are you learning about your own design?",
    versions: {
      little: {
        title: "You Are Wonderfully Made",
        body: "God made you himself, carefully, with love. You are wonderfully made, like a secret treasure. God thought about you so many times that the thoughts can't even be counted!",
        takeaway: "You are beautifully made on purpose.",
        wonder: "What do you love about the way God made you?",
      },
      explorer: {
        title: "Fearfully and Wonderfully",
        body: "Before anyone knew you, God was stitching you together with care. Every part of you — even the parts you're still learning to like — was made thoughtfully. God's thoughts about you are more than all the stars.",
        takeaway: "Your design is not an accident.",
        wonder: "What is something special about the way you're made?",
      },
      youth: {
        title: "Known Before You Performed",
        body: "Your worth did not begin when your feed started filling up. You were knit, named, and thought about far more often than you imagine. Faithful self-knowledge starts with being known by someone who never got you wrong.",
        takeaway: "You are already known — you don't have to invent yourself.",
        wonder: "What would it look like to believe your design is intentional?",
      },
      grown: {
        title: "Held in the Hidden Places",
        body: "The psalmist moves from being known to being made, from intimacy to artistry. The hidden place is not abandonment; it is a workshop. Wonder here is not vanity but worship — a response to being thoughtfully fashioned.",
        takeaway: "Let wonder about God become wonder about your own making.",
        wonder: "Which part of your story have you been treating as a mistake?",
      },
    },
  },
  {
    slug: "ruth-1",
    reference: "Ruth 1:16–17",
    book: "Ruth",
    chapter: 1,
    verseStart: 16,
    verseEnd: 17,
    theme: "Loyalty",
    testament: "Old",
    reflectionPrompt: "Who has stayed with you?",
    versions: {
      little: {
        title: "Where You Go, I Go",
        body: "Ruth loved her mother-in-law Naomi so much that she said, \"Where you go, I will go. Your God will be my God.\" Ruth chose to stay close and be a faithful friend.",
        takeaway: "Faithful friends stay close.",
        wonder: "Who is a good friend to you?",
      },
      explorer: {
        title: "A Promise to Stay",
        body: "Naomi told Ruth to go home, but Ruth planted her feet and made a promise: your people will be my people, and your God my God. It was a brave, beautiful choice to stay with someone who had lost almost everything.",
        takeaway: "Loyalty is love with its shoes on.",
        wonder: "What could you do to be a faithful friend this week?",
      },
      youth: {
        title: "Chosen Belonging",
        body: "Ruth is an outsider who refuses to leave. Her loyalty is not passive — it's a public pledge to a woman with nothing to offer her. Belonging like that is never convenient, and it is always holy.",
        takeaway: "You don't have to be related to be family.",
        wonder: "Who might need you to choose to stay?",
      },
      grown: {
        title: "Covenant Friendship",
        body: "Ruth's vow is a quiet act of covenant in a culture of self-preservation. She ties her future to Naomi's, in a place with no guarantees. Faithfulness here is specific, embodied, and costly — the shape of love that outlasts circumstance.",
        takeaway: "Faithful presence is one of the strongest things you can give.",
        wonder: "Whose loneliness could you step into deliberately?",
      },
    },
  },
  {
    slug: "1-samuel-17",
    reference: "1 Samuel 17:45–47",
    book: "1 Samuel",
    chapter: 17,
    verseStart: 45,
    verseEnd: 47,
    theme: "Courage",
    testament: "Old",
    reflectionPrompt: "What giant is standing in front of you?",
    versions: {
      little: {
        title: "Five Smooth Stones",
        body: "Everyone was scared of the giant Goliath — except David. David said, \"You come with a sword, but I come with God.\" David was small, but God was with him.",
        takeaway: "God is bigger than any giant.",
        wonder: "When do you need to be brave?",
      },
      explorer: {
        title: "A Boy and a Battle",
        body: "Goliath had armor, height, and a loud voice. David had a sling, five smooth stones, and a lifetime of knowing God was faithful. David ran toward the giant — not because he was fearless, but because he wasn't alone.",
        takeaway: "Courage counts differently than fear does.",
        wonder: "What helps you run toward something scary?",
      },
      youth: {
        title: "Refusing the Armor",
        body: "Saul dressed David in armor that didn't fit, and David took it off. He faced the giant with what God had actually given him. Courage is not borrowing someone else's confidence; it's trusting God with your own size of faith.",
        takeaway: "Fight from who God made you to be.",
        wonder: "Whose expectations are you wearing that God never asked you to?",
      },
      grown: {
        title: "The Name That Wins",
        body: "David's speech is not bravado but theology. The battle is the Lord's, and the giant becomes a stage for God's reputation, not David's. Courage is redefined as faithful presence on the field God has assigned.",
        takeaway: "Show up with what God has given you and leave the outcome to God.",
        wonder: "Where are you waiting for armor instead of walking into your assignment?",
      },
    },
  },
];

const DEMO_EMAIL = process.env.DEMO_EMAIL ?? "grace@lumen.app";
const DEMO_PASSWORD = process.env.DEMO_PASSWORD ?? "lumen123";

let seedPromise: Promise<void> | null = null;

export function ensureSeeded() {
  seedPromise ??= runSeed().catch((cause) => {
    seedPromise = null;
    console.error("Lumen seed failed:", cause instanceof Error ? cause.message : cause);
    throw cause;
  });

  return seedPromise;
}

async function runSeed() {
  const client = await pool.connect();

  try {
    await client.query("SELECT pg_advisory_lock(918273645)");

    const existingUser = await db
      .select({ id: users.id })
      .from(users)
      .limit(1);

    const bibleCountRes = await client.query(
      "SELECT count(*)::int AS count FROM bible_verses"
    );
    const bibleVersesCount = bibleCountRes.rows[0]?.count ?? 0;

    if (!existingUser.length) {
      // create demo user if needed
      // await db.insert(users).values({ email: DEMO_EMAIL, password: DEMO_PASSWORD });
    }

    if (bibleVersesCount === 0) {
      try {
        const { execSync } = await import("node:child_process");
        execSync("node scripts/seed-bible.cjs", {
          stdio: "inherit",
          env: process.env,
        });
      } catch (err) {
        console.error("Failed to seed entire bible:", err);
        throw err;
      }
    }
  } finally {
    await client.query("SELECT pg_advisory_unlock(918273645)");
    client.release();
  }
}

    if (existing.length > 0) return;

    const passageIdBySlug = new Map<string, string>();

    for (const [index, item] of SEED_PASSAGES.entries()) {
      const inserted = await db
        .insert(passages)
        .values({
          slug: item.slug,
          reference: item.reference,
          book: item.book,
          chapter: item.chapter,
          verseStart: item.verseStart,
          verseEnd: item.verseEnd,
          theme: item.theme,
          testament: item.testament,
          reflectionPrompt: item.reflectionPrompt,
          sortOrder: index,
        })
        .onConflictDoNothing()
        .returning({ id: passages.id });

      let passageId = inserted[0]?.id;
      if (!passageId) {
        const found = await db
          .select({ id: passages.id })
          .from(passages)
          .where(sql`${passages.slug} = ${item.slug}`)
          .limit(1);
        passageId = found[0]?.id;
      }
      if (!passageId) continue;
      passageIdBySlug.set(item.slug, passageId);

      const versionRows = (Object.keys(item.versions) as Band[]).map((band) => ({
        passageId: passageId as string,
        band,
        title: item.versions[band].title,
        body: item.versions[band].body,
        takeaway: item.versions[band].takeaway,
        wonderQuestion: item.versions[band].wonder,
      }));
      await db.insert(passageVersions).values(versionRows).onConflictDoNothing();
    }

    const [demo] = await db
      .insert(users)
      .values({
        email: DEMO_EMAIL,
        name: "Grace Okafor",
        passwordHash: hashPassword(DEMO_PASSWORD),
        householdName: "The Okafor Family",
        avatarEmoji: "🌿",
        homeBand: "grown",
        streakCount: 12,
      })
      .returning();

    if (!demo) return;
    const uid = demo.id;
    const pid = (slug: string) => passageIdBySlug.get(slug) ?? null;
    const daysAgo = (days: number, hour = 7) => {
      const date = new Date();
      date.setUTCDate(date.getUTCDate() - days);
      date.setUTCHours(hour, 15, 0, 0);
      return date;
    };

    await db.insert(familyMembers).values([
      { userId: uid, name: "Grace", band: "grown", emoji: "🌿", role: "parent", streak: 12 },
      { userId: uid, name: "Noah", band: "youth", emoji: "🎧", role: "child", streak: 6 },
      { userId: uid, name: "Ada", band: "explorer", emoji: "🦋", role: "child", streak: 9 },
      { userId: uid, name: "Tunde", band: "little", emoji: "🐢", role: "child", streak: 4 },
      { userId: uid, name: "Mum Bisi", band: "grown", emoji: "🫖", role: "grandparent", streak: 21 },
    ]);

    const collectionRows = await db
      .insert(collections)
      .values([
        {
          userId: uid,
          name: "Anchors for Anxious Days",
          description: "Verses I return to when my chest gets tight.",
          emoji: "⚓",
          accent: "sage",
        },
        {
          userId: uid,
          name: "Bedtime with Tunde",
          description: "Short and gentle for a five-year-old at 7:15pm.",
          emoji: "🌙",
          accent: "amber",
        },
        {
          userId: uid,
          name: "Words for the Hard Weeks",
          description: "For the seasons that ask more than I have.",
          emoji: "🕯️",
          accent: "sky",
        },
      ])
      .returning();

    const [anchors, bedtime, hardWeeks] = collectionRows;
    if (anchors && bedtime && hardWeeks) {
      await db.insert(savedVerses).values([
        {
          collectionId: anchors.id,
          userId: uid,
          reference: "Philippians 4:6–7",
          text: "Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God.",
          note: "The guard post around my mind.",
          createdAt: daysAgo(2, 8),
        },
        {
          collectionId: anchors.id,
          userId: uid,
          reference: "Psalm 23:1–4",
          text: "The Lord is my shepherd; I shall not want. Even though I walk through the darkest valley, I will fear no evil, for you are with me.",
          note: "Read at 3am. It worked.",
          createdAt: daysAgo(5, 3),
        },
        {
          collectionId: anchors.id,
          userId: uid,
          reference: "Matthew 11:28–30",
          text: "Come to me, all you who are weary and burdened, and I will give you rest.",
          note: "",
          createdAt: daysAgo(9, 21),
        },
        {
          collectionId: bedtime.id,
          userId: uid,
          reference: "Genesis 1:1–5",
          text: "In the beginning God created the heavens and the earth... and God said, let there be light.",
          note: "Tunde's favourite. He shouts LIGHT!",
          createdAt: daysAgo(3, 19),
        },
        {
          collectionId: bedtime.id,
          userId: uid,
          reference: "Psalm 139:13–14",
          text: "For you created my inmost being; you knit me together in my mother's womb. I praise you because I am fearfully and wonderfully made.",
          note: "Ada asked if God used knitting needles.",
          createdAt: daysAgo(7, 19),
        },
        {
          collectionId: hardWeeks.id,
          userId: uid,
          reference: "Isaiah 40:28–31",
          text: "Those who hope in the Lord will renew their strength. They will soar on wings like eagles.",
          note: "For the week after the diagnosis.",
          createdAt: daysAgo(14, 6),
        },
        {
          collectionId: hardWeeks.id,
          userId: uid,
          reference: "Proverbs 3:5–6",
          text: "Trust in the Lord with all your heart and lean not on your own understanding.",
          note: "",
          createdAt: daysAgo(16, 6),
        },
        {
          collectionId: hardWeeks.id,
          userId: uid,
          reference: "Ruth 1:16–17",
          text: "Where you go I will go, and where you stay I will stay. Your people will be my people and your God my God.",
          note: "Mum Bisi, always.",
          createdAt: daysAgo(18, 9),
        },
      ]);
    }

    const planRows = await db
      .insert(readingPlans)
      .values([
        {
          userId: uid,
          title: "7 Days of Brave",
          description: "One week of courage for Noah and Ada to read together at breakfast.",
          band: "explorer",
          isActive: true,
          createdAt: daysAgo(11),
        },
        {
          userId: uid,
          title: "Family Table Psalms",
          description: "Five evenings, five psalms, five questions around the table.",
          band: "family",
          isActive: false,
          createdAt: daysAgo(20),
        },
      ])
      .returning();

    const [brave, tablePsalms] = planRows;
    if (brave) {
      const braveSlugs = [
        "1-samuel-17",
        "isaiah-40",
        "matthew-5",
        "proverbs-3",
        "ruth-1",
        "luke-15",
        "psalm-139",
      ];
      await db.insert(planDays).values(
        braveSlugs.map((slug, index) => ({
          planId: brave.id,
          dayNumber: index + 1,
          title: index === 0 ? "Start with the sling" : `Day ${index + 1}: ${SEED_PASSAGES.find((p) => p.slug === slug)?.theme ?? "Read"}`,
          passageId: pid(slug),
          completed: index < 3,
          completedAt: index < 3 ? daysAgo(3 - index, 7) : null,
        })),
      );
    }
    if (tablePsalms) {
      const psalmSlugs = ["psalm-23", "psalm-139", "matthew-11", "john-3", "philippians-4"];
      await db.insert(planDays).values(
        psalmSlugs.map((slug, index) => ({
          planId: tablePsalms.id,
          dayNumber: index + 1,
          title: `Evening ${index + 1}: ${SEED_PASSAGES.find((p) => p.slug === slug)?.theme ?? "Read"}`,
          passageId: pid(slug),
          completed: index < 5,
          completedAt: daysAgo(20 - index, 19),
        })),
      );
    }

    await db.insert(journalEntries).values([
      {
        userId: uid,
        title: "Learning to stop at 3am",
        body: "I have read Philippians 4 a hundred times and still reached for my phone before I reached for prayer. Tonight I tried it the other way around. I wrote down the one thing I was afraid of, said it out loud, and thanked God for three things I could actually see. The fear didn't vanish. But it got smaller than the room.",
        mood: "heavy",
        passageId: pid("philippians-4"),
        sharing: "family",
        createdAt: daysAgo(1, 3),
        updatedAt: daysAgo(1, 3),
      },
      {
        userId: uid,
        title: "Ada asked who knit me",
        body: "We read Psalm 139 at bedtime and Ada wanted to know if God used knitting needles or a sewing machine. Then she said, \"So my freckles were on purpose?\" I want to keep that question somewhere I can find it on the days I forget.",
        mood: "joyful",
        passageId: pid("psalm-139"),
        sharing: "family",
        createdAt: daysAgo(4, 20),
        updatedAt: daysAgo(4, 20),
      },
      {
        userId: uid,
        title: "The week I carried the wrong yoke",
        body: "Matthew 11 keeps correcting me. I have been treating rest like a reward I earn after the list is finished. But the invitation comes before the work is done — come, all who are weary. I am trying to put down the thing that was never mine to carry: the outcome of everyone else's choices.",
        mood: "hopeful",
        passageId: pid("matthew-11"),
        sharing: "private",
        createdAt: daysAgo(6, 7),
        updatedAt: daysAgo(6, 7),
      },
      {
        userId: uid,
        title: "Noah's giant",
        body: "Noah told me after school that he took off the armor — he stopped pretending he was fine in front of his friends. He said David's story made him feel less weird about being scared. I forget that the same words we give the little ones are working on the big ones too.",
        mood: "grateful",
        passageId: pid("1-samuel-17"),
        sharing: "family",
        createdAt: daysAgo(10, 22),
        updatedAt: daysAgo(10, 22),
      },
      {
        userId: uid,
        title: "A promise with shoes on",
        body: "Visited Mum Bisi today. She reminded me that Ruth didn't wait for a formal invitation — she just stayed. I want to be that kind of friend, the kind that shows up without needing to be asked. Note to self: call Sarah this week.",
        mood: "peaceful",
        passageId: pid("ruth-1"),
        sharing: "private",
        createdAt: daysAgo(16, 18),
        updatedAt: daysAgo(16, 18),
      },
    ]);

    await db.insert(prayers).values([
      {
        userId: uid,
        authorName: "Grace",
        body: "For Noah's exams next week — that he would remember he is loved regardless of a score.",
        category: "family",
        prayedCount: 14,
        createdAt: daysAgo(2, 7),
      },
      {
        userId: uid,
        authorName: "Mum Bisi",
        body: "Thank you for 63 years of mornings. Let me use the rest of them well.",
        category: "gratitude",
        isAnswered: true,
        answeredNote: "Every morning since has arrived with something to be thankful for.",
        prayedCount: 31,
        createdAt: daysAgo(9, 6),
      },
      {
        userId: uid,
        authorName: "Ada",
        body: "Please help my friend Lila's dog to feel better, and help me not be scared of the dark.",
        category: "everyday",
        prayedCount: 8,
        createdAt: daysAgo(3, 20),
      },
      {
        userId: uid,
        authorName: "Grace",
        body: "For steady hands at work and a softer voice at home. I can't do both without help.",
        category: "provision",
        prayedCount: 5,
        createdAt: daysAgo(5, 13),
      },
    ]);

    await db.insert(wonders).values([
      {
        userId: uid,
        askedBy: "Ada",
        askedAge: 8,
        question: "If God spoke the light into being, why did God need to say it out loud? Couldn't God just think it?",
        answer: "That's a brilliant question. Maybe saying it out loud is God inviting us into the story — the way you say \"I love you\" instead of just thinking it.",
        answeredBy: "Grace",
        status: "answered",
        createdAt: daysAgo(4, 20),
      },
      {
        userId: uid,
        askedBy: "Tunde",
        askedAge: 5,
        question: "Is the shepherd stronger than the big dark?",
        answer: "Yes. The dark is big, but the shepherd is closer than the dark, and he never lets go of you.",
        answeredBy: "Grace",
        status: "answered",
        createdAt: daysAgo(6, 19),
      },
      {
        userId: uid,
        askedBy: "Noah",
        askedAge: 15,
        question: "How do you know when it's God's direction and not just your own preference?",
        answer: "",
        answeredBy: "",
        status: "open",
        createdAt: daysAgo(1, 21),
      },
      {
        userId: uid,
        askedBy: "Ada",
        askedAge: 8,
        question: "Does God have a favourite colour? Because I think it might be sunset.",
        answer: "",
        answeredBy: "",
        status: "open",
        createdAt: daysAgo(1, 18),
      },
    ]);

    const logPlan: Array<[number, string, string]> = [
      [0, "philippians-4", "grown"],
      [1, "philippians-4", "grown"],
      [2, "psalm-23", "little"],
      [3, "psalm-139", "explorer"],
      [4, "matthew-11", "grown"],
      [5, "genesis-1", "little"],
      [6, "proverbs-3", "grown"],
      [7, "matthew-5", "youth"],
      [9, "isaiah-40", "grown"],
      [10, "1-samuel-17", "youth"],
      [11, "john-3", "grown"],
      [12, "luke-15", "explorer"],
      [13, "ruth-1", "grown"],
      [15, "psalm-23", "little"],
      [16, "isaiah-40", "grown"],
      [17, "genesis-1", "little"],
      [18, "matthew-11", "grown"],
      [20, "john-3", "grown"],
      [21, "care-philippians", "grown"],
    ];

    const logRows = logPlan
      .map(([offset, slug, band]) => {
        const passageId = pid(slug);
        return passageId
          ? { userId: uid, passageId, band, createdAt: daysAgo(offset, 6 + (offset % 5)) }
          : null;
      })
      .filter((row): row is { userId: string; passageId: string; band: string; createdAt: Date } =>
        Boolean(row),
      );

    if (logRows.length > 0) {
      await db.insert(readingLog).values(logRows);
    }
  } catch (cause) {
    console.error("Seed error", cause);
    throw cause;
  } finally {
    try {
      await client.query("select pg_advisory_unlock(918273645)");
    } catch {
      // ignore
    }
    client.release();
  }
}

export const DEMO_CREDENTIALS = { email: DEMO_EMAIL, password: DEMO_PASSWORD };
