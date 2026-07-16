import type { ReactNode } from "react";

export type AvailState = "open" | "full" | "off";
export type VouchTint = "jade" | "coral" | "plum";

export interface AvailCell {
  label: number;
  state: AvailState;
  month: string;
}

export interface TherapistProfile {
  id: string;
  eyebrow: string;
  /** Display name split so the final word renders as the coral italic em. */
  namePlain: string;
  nameEm: string;
  credsLine: string[];
  quote: string;
  pills: { label: string; tone?: "lang" | "accept" }[];
  /** Date credentials were last checked by QueerPulse Wellbeing. */
  vettedOn: string;
  specialisms: { initial: string; title: string; desc: string }[];
  approach: { titlePlain: string; titleEm: string; paragraphs: ReactNode[] };
  vouches: {
    initials: string;
    tint: VouchTint;
    name: string;
    byline: string;
    text: ReactNode;
    when: string;
  }[];
  notes: { title: string; text: string }[];
  /** 4 weeks × 7 days, Monday first. */
  availability: AvailCell[][];
  /** Session start time shown in the hold-slot label. */
  slotTime: string;
  fees: { label: string; value: string; tone?: "sliding" | "free" }[];
  venue: { name: string; lines: string[]; access: string };
  bookCta: string;
}

export const DAY_LETTERS = ["M", "T", "W", "T", "F", "S", "S"];
export const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/** "Dr. Marta Silva" → "Dr. Silva"; "James Chen" → "James". */
export function shortName(name: string): string {
  const parts = name.split(" ");
  return name.startsWith("Dr.")
    ? `Dr. ${parts.at(-1) ?? name}`
    : (parts[0] ?? name);
}

/**
 * Which `resources:therapistProfilePage.approachTitle.*` variant to use for
 * this therapist's pronouns — English and pt-PT build the phrase in
 * different word orders ("His approach" vs. "A abordagem dele"), so the
 * component resolves the full localized phrase via `t()` rather than
 * splicing this English word into a sentence.
 */
export function possessiveKey(pronouns: string): "he" | "she" | "neutral" {
  if (pronouns.startsWith("he")) return "he";
  if (pronouns.startsWith("she")) return "she";
  return "neutral";
}

/**
 * Compact availability spec: weeks separated by "|", cells by spaces; each
 * token is the day-of-month plus o(pen), f(ull) or .(no sessions). The month
 * flips to `months[1]` when the day number wraps past a month end.
 */
function parseAvail(spec: string, months: [string, string]): AvailCell[][] {
  const [firstMonth, secondMonth] = months;
  let inSecondMonth = false;
  let prev = 0;
  return spec.split("|").map((week) =>
    week
      .trim()
      .split(/\s+/)
      .map((token) => {
        const label = parseInt(token, 10);
        if (label < prev) inSecondMonth = true;
        prev = label;
        const state: AvailState = token.endsWith("o")
          ? "open"
          : token.endsWith("f")
            ? "full"
            : "off";
        return {
          label,
          state,
          month: inSecondMonth ? secondMonth : firstMonth,
        };
      }),
  );
}

export const THERAPIST_PROFILES: Record<string, TherapistProfile> = {
  "ines-pereira": {
    id: "ines-pereira",
    eyebrow: "Psychologist · 12 years in practice",
    namePlain: "Dr. Inês",
    nameEm: "Pereira.",
    credsLine: [
      "OPP n.º 14826",
      "MSc Universidade de Lisboa",
      "WPATH-certified",
    ],
    quote:
      "I don't treat being queer as the problem. I treat what the world does to you for being queer — and what you'd like to do about it.",
    pills: [
      { label: "PT · EN · ES", tone: "lang" },
      { label: "Accepting new clients", tone: "accept" },
      { label: "Trans-affirming" },
      { label: "EMDR-trained" },
      { label: "In-person + tele" },
      { label: "Sliding scale" },
    ],
    vettedOn: "2 Mar 2026",
    specialisms: [
      {
        initial: "T",
        title: "Trans & non-binary",
        desc: "Identity, transition support, letter-writing, gender dysphoria",
      },
      {
        initial: "A",
        title: "Anxiety & minority stress",
        desc: "Persistent low-grade fear, hypervigilance, social anxiety",
      },
      {
        initial: "R",
        title: "Relationships",
        desc: "Couple work (any structure), polyamory, breakup, attachment",
      },
      {
        initial: "F",
        title: "Family & coming-out",
        desc: "Estrangement, reconciliation, mixed-faith families",
      },
      {
        initial: "G",
        title: "Grief",
        desc: "Bereavement, identity loss, friendship loss after coming out",
      },
      {
        initial: "M",
        title: "Migration stress",
        desc: "Adapting to Lisbon, integration, longing for elsewhere",
      },
    ],
    approach: {
      titlePlain: "Person-centred, evidence-based,",
      titleEm: "politically literate.",
      paragraphs: [
        <>
          Inês trained in psychodynamic and CBT, certified in EMDR for trauma,
          and works with what she calls a <em>politically literate</em> lens —
          meaning she understands that some of what you're feeling isn't a
          disorder, it's a reasonable response to conditions, and treating it
          that way is part of the work.
        </>,
        <>
          Most clients start with weekly sessions for 2–3 months, then move to
          fortnightly. She'll tell you in session 2 or 3 if she thinks she's not
          the right fit and refer you to someone who is.{" "}
          <em>This is unusual in Portugal. She means it.</em>
        </>,
        <>
          Tele-sessions are real sessions. She doesn't offer email-only
          "check-ins" because she thinks they're a bad substitute. She'll
          sometimes give brief, optional reading or audio between sessions —
          never homework you'll feel bad for skipping.
        </>,
      ],
    },
    vouches: [
      {
        initials: "AK",
        tint: "jade",
        name: "Member · trans, 30s",
        byline: "12 months of weekly sessions",
        text: (
          <>
            Inês was the first therapist I didn't have to <em>train</em>. She
            knew what I meant, she knew the protocols, she pushed back when I
            needed it. Wrote my support letter without making it feel like an
            exam.
          </>
        ),
        when: "Vouched 21 Mar 2026",
      },
      {
        initials: "SC",
        tint: "coral",
        name: "Member · couple work",
        byline: "8 sessions, ended Feb 2026",
        text: (
          <>
            We came in as a non-monogamous triad. She didn't blink. She also
            gently named the dynamic in the room that we'd all been avoiding for
            a year. Worth it.
          </>
        ),
        when: "Vouched 14 Feb 2026",
      },
      {
        initials: "LB",
        tint: "plum",
        name: "Member · migration stress",
        byline: "3 months, fortnightly",
        text: (
          <>
            I came in saying "I don't know if my problem is therapy-shaped." She
            said "let's find out" and then we did. Practical, kind, and she knew
            the Lisbon-specific stuff.
          </>
        ),
        when: "Vouched 8 Jan 2026",
      },
    ],
    notes: [
      {
        title: "First call is free",
        text: "20-minute video call, no charge, no pressure. You decide if it's a fit. She'll also tell you if she's not.",
      },
      {
        title: "Sliding scale, openly",
        text: "€60 standard. €40 reduced (no questions asked). €25 solidarity (1 slot/week, alternates). Pay what's honest.",
      },
      {
        title: "SNS / reimbursement",
        text: "Not on SNS. Private health: ADSE, Multicare, Médis reimburse approx 60%. Receipts itemised on request.",
      },
      {
        title: "What she doesn't do",
        text: "Active psychotic episodes, ED inpatient. She'll refer you to a colleague she trusts. She knows the names.",
      },
    ],
    availability: parseAvail(
      "9f 10f 11o 12f 13o 14. 15. | 16f 17o 18f 19f 20o 21. 22. | 23f 24o 25o 26f 27o 28. 29. | 30f 1o 2f 3f 4o 5. 6.",
      ["Jun", "Jul"],
    ),
    slotTime: "11:00",
    fees: [
      { label: "Standard session · 50 min", value: "€60", tone: undefined },
      { label: "Reduced rate", value: "€40", tone: "sliding" },
      { label: "Solidarity slot · 1/week", value: "€25", tone: "sliding" },
      { label: "First call · 20 min", value: "Free", tone: "free" },
      { label: "Late cancellation (<24h)", value: "50%" },
    ],
    venue: {
      name: "Clínica do Largo",
      lines: ["Largo do Intendente Pina Manique 22", "1100-285 Lisboa · Anjos"],
      access:
        "Step-free entrance. Bathroom is single-stall, gender-free. Metro: Intendente (5 min walk).",
    },
    bookCta: "Book intro call · free 20 min",
  },

  "marta-silva": {
    id: "marta-silva",
    eyebrow: "Clinical psychologist · 12 years in practice",
    namePlain: "Dr. Marta",
    nameEm: "Silva.",
    credsLine: [
      "OPP 4821",
      "PhD Universidade de Lisboa",
      "EMDR Europe accredited",
    ],
    quote:
      "You will not spend your first months here teaching me what queer means. We start from where you actually are.",
    pills: [
      { label: "PT · EN", tone: "lang" },
      { label: "Accepting new clients", tone: "accept" },
      { label: "LGBTQ+ only practice" },
      { label: "Trauma-informed" },
      { label: "EMDR-accredited" },
      { label: "Sliding scale" },
    ],
    vettedOn: "14 Feb 2026",
    specialisms: [
      {
        initial: "T",
        title: "Trauma",
        desc: "Acute and complex trauma, EMDR, the slow accumulated kind",
      },
      {
        initial: "M",
        title: "Minority stress",
        desc: "Hypervigilance, burnout from being the only one in the room",
      },
      {
        initial: "I",
        title: "Identity",
        desc: "Who you are when nobody needs you to perform it",
      },
      {
        initial: "R",
        title: "Relational work",
        desc: "Attachment, trust after it's been broken, chosen family",
      },
      {
        initial: "C",
        title: "Coming out later",
        desc: "At 40, at 60 — untangling a life built around a secret",
      },
      {
        initial: "G",
        title: "Grief",
        desc: "Bereavement, estrangement, the losses that came with honesty",
      },
    ],
    approach: {
      titlePlain: "Relational, trauma-informed,",
      titleEm: "unhurried.",
      paragraphs: [
        <>
          Marta works exclusively with LGBTQ+ adults, and has for twelve years.
          Her practice grew out of a frustration you may recognise: queer
          clients spending the first months of therapy educating their therapist
          instead of being helped by them. <em>That does not happen here.</em>
        </>,
        <>
          Sessions are relational and paced by you. For trauma she draws on EMDR
          — she is one of the few EMDR Europe accredited practitioners in Lisbon
          working in an explicitly affirmative frame. Nothing is rushed, and
          nothing about who you are is up for debate.
        </>,
        <>
          Expect weekly sessions to start. She reviews openly with you every
          couple of months — whether it's working, what to change, whether
          you're done.
        </>,
      ],
    },
    vouches: [
      {
        initials: "MB",
        tint: "jade",
        name: "Member · trauma work",
        byline: "18 months of weekly sessions",
        text: (
          <>
            I had been to three therapists before her. She is the first one who
            didn't flinch, didn't need the glossary, and didn't let me{" "}
            <em>hide</em> either. EMDR with her rearranged something.
          </>
        ),
        when: "Vouched 2 May 2026",
      },
      {
        initials: "RD",
        tint: "coral",
        name: "Member · came out at 52",
        byline: "A year, now monthly",
        text: (
          <>
            I arrived certain it was too late for all of it. She never once
            treated my age as the story. Kind is the wrong word — she is
            precise, and that turned out to be kinder.
          </>
        ),
        when: "Vouched 19 Mar 2026",
      },
      {
        initials: "TF",
        tint: "plum",
        name: "Member · chosen family",
        byline: "6 months, fortnightly",
        text: (
          <>
            She holds the political and the personal in the same sentence. I
            stopped having to explain why things are heavy — we just got to work
            on carrying them.
          </>
        ),
        when: "Vouched 8 Feb 2026",
      },
    ],
    notes: [
      {
        title: "First session, no forms",
        text: "A relaxed 50-minute conversation — you talk through what brought you here and whether it's a fit. No obligation to continue.",
      },
      {
        title: "Sliding scale, quietly",
        text: "€70–90 standard. A few reduced-rate places are always held — ask, and if one is free it's yours. No proof asked.",
      },
      {
        title: "Reimbursement",
        text: "Not on SNS. ADSE, Multicare and Médis reimburse around 60% — receipts come itemised without you having to ask twice.",
      },
      {
        title: "What she doesn't do",
        text: "Under-18s and active addiction treatment. She'll refer you warmly to a colleague she trusts by name.",
      },
    ],
    availability: parseAvail(
      "9f 10f 11f 12o 13f 14. 15. | 16f 17f 18o 19f 20f 21. 22. | 23f 24f 25f 26o 27f 28. 29. | 30f 1o 2f 3f 4f 5. 6.",
      ["Jun", "Jul"],
    ),
    slotTime: "10:00",
    fees: [
      { label: "Standard session · 50 min", value: "€80" },
      { label: "Reduced rate", value: "€60", tone: "sliding" },
      { label: "EMDR session · 75 min", value: "€95" },
      { label: "Late cancellation (<24h)", value: "50%" },
    ],
    venue: {
      name: "Consultório Camões",
      lines: ["Praça Luís de Camões 14, 2.º", "1200-243 Lisboa · Chiado"],
      access:
        "Second floor with a lift. Bathroom is single-stall, gender-free. Metro: Baixa-Chiado (2 min walk).",
    },
    bookCta: "Book a first session",
  },

  "james-chen": {
    id: "james-chen",
    eyebrow: "Psychotherapist · 9 years in practice",
    namePlain: "James",
    nameEm: "Chen.",
    credsLine: [
      "UKCP 2019148921",
      "MSc University of Edinburgh",
      "Cross-cultural specialism",
    ],
    quote:
      "Most of my clients are holding two lives at once — the one they left and the one they're building. Therapy is where the two finally get to talk.",
    pills: [
      { label: "EN · Mandarin", tone: "lang" },
      { label: "Accepting new clients", tone: "accept" },
      { label: "Online only" },
      { label: "Queer expats" },
      { label: "Cross-cultural" },
      { label: "Evening slots" },
    ],
    vettedOn: "27 Jan 2026",
    specialisms: [
      {
        initial: "E",
        title: "Expat adjustment",
        desc: "The disorientation of rebuilding a life in a second language",
      },
      {
        initial: "A",
        title: "Anxiety",
        desc: "Social anxiety, spirals, the hum that won't switch off",
      },
      {
        initial: "R",
        title: "Relationships",
        desc: "Long-distance, cross-cultural couples, new-city dating fatigue",
      },
      {
        initial: "F",
        title: "Family at a distance",
        desc: "Coming out across time zones — duty, guilt, silence",
      },
      {
        initial: "I",
        title: "Identity across cultures",
        desc: "Being differently queer in each language you speak",
      },
      {
        initial: "B",
        title: "Burnout",
        desc: "Remote work, visa stress, the pressure to make the move worth it",
      },
    ],
    approach: {
      titlePlain: "Integrative, practical,",
      titleEm: "between cultures.",
      paragraphs: [
        <>
          James works entirely online, which means distance is never a barrier —
          he sees clients in Lisbon, across Europe, and back home in whichever
          time zone that is. His frame is integrative: CBT structure when it
          helps, mindfulness when it fits, and a cross-cultural lens over all of
          it.
        </>,
        <>
          He is bilingual in English and Mandarin and knows first-hand how
          identity <em>reshapes itself</em> across cultures — what you can say
          in one language and not yet in the other.
        </>,
        <>
          Sessions run weekly or fortnightly. He'll suggest concrete things to
          try between sessions — always optional, never homework you'll feel bad
          for skipping.
        </>,
      ],
    },
    vouches: [
      {
        initials: "KW",
        tint: "jade",
        name: "Member · moved from Singapore",
        byline: "9 months, weekly",
        text: (
          <>
            He understood the specific loneliness of being queer in a city where
            nobody knew me yet — and being <em>differently</em> queer than I was
            allowed to be at home. Practical without being cold.
          </>
        ),
        when: "Vouched 11 Apr 2026",
      },
      {
        initials: "DM",
        tint: "coral",
        name: "Member · anxiety",
        byline: "4 months, weekly evenings",
        text: (
          <>
            Evening slots meant I didn't have to explain therapy to my boss. He
            gave me actual tools in week two. The spiral still starts sometimes;
            now it doesn't finish.
          </>
        ),
        when: "Vouched 30 Jan 2026",
      },
    ],
    notes: [
      {
        title: "Free first call",
        text: "30 minutes by video, no charge, so you can both feel out whether it works before you commit.",
      },
      {
        title: "Fixed fees",
        text: "No sliding scale, but rates vary €55–75 by hour of day — the quiet daytime slots cost less.",
      },
      {
        title: "Time zones",
        text: "He schedules across CET, GMT and further out. If you travel often, sessions move with you.",
      },
      {
        title: "What he doesn't do",
        text: "Couples where one partner won't attend, and crisis care. He keeps a referral list he actually maintains.",
      },
    ],
    availability: parseAvail(
      "9o 10f 11o 12o 13f 14. 15. | 16o 17o 18f 19o 20f 21. 22. | 23f 24o 25o 26f 27o 28. 29. | 30o 1f 2o 3o 4f 5. 6.",
      ["Jun", "Jul"],
    ),
    slotTime: "19:00",
    fees: [
      { label: "Standard session · 50 min", value: "€65" },
      { label: "Daytime slot · 50 min", value: "€55" },
      { label: "Evening slot · 50 min", value: "€75" },
      { label: "First call · 30 min", value: "Free", tone: "free" },
      { label: "Late cancellation (<24h)", value: "50%" },
    ],
    venue: {
      name: "Online practice",
      lines: [
        "Video sessions across time zones",
        "Lisbon · London · Taipei hours",
      ],
      access:
        "A private video link arrives before each session — no account needed. Captions available on request.",
    },
    bookCta: "Book a free first call",
  },

  "ana-lima": {
    id: "ana-lima",
    eyebrow: "Psychologist · 7 years in practice",
    namePlain: "Ana",
    nameEm: "Lima.",
    credsLine: ["OPP 5117", "MSc ISPA Lisboa", "Systemic family therapy"],
    quote:
      "A lot of people arrive carrying questions they've never felt safe to say out loud. My room is built for exactly that.",
    pills: [
      { label: "PT · ES", tone: "lang" },
      { label: "Waitlist only right now" },
      { label: "Sexuality" },
      { label: "Family & systemic" },
      { label: "Sliding scale" },
      { label: "In-person + online" },
    ],
    vettedOn: "3 Dec 2025",
    specialisms: [
      {
        initial: "S",
        title: "Sexuality",
        desc: "Orientation, desire, the questions without tidy names",
      },
      {
        initial: "D",
        title: "Depression",
        desc: "The flat months, low energy, the version of you that went quiet",
      },
      {
        initial: "F",
        title: "Family & coming out",
        desc: "Estrangement, reconciliation, conditional love",
      },
      {
        initial: "C",
        title: "Couples & structures",
        desc: "Any configuration — monogamous or not, named or not",
      },
      {
        initial: "R",
        title: "Religious recovery",
        desc: "Faith that hurt, faith you miss, or both at once",
      },
      {
        initial: "Q",
        title: "Questioning",
        desc: "You don't need a label to book a session",
      },
    ],
    approach: {
      titlePlain: "Person-centred, systemic,",
      titleEm: "no script.",
      paragraphs: [
        <>
          Ana works person-centred first: you set the pace and the agenda, and
          there is no script to follow. Her systemic training means the family —
          present or absent — is always allowed in the room too.
        </>,
        <>
          She works in Portuguese and Spanish and keeps a sliding scale because
          access shouldn't depend on income.{" "}
          <em>When her caseload is full she still answers messages</em> — tell
          her what you need and she'll point you somewhere good.
        </>,
        <>
          Her waitlist is honestly run: she takes people in order, tells you
          where you stand, and won't leave you guessing.
        </>,
      ],
    },
    vouches: [
      {
        initials: "VP",
        tint: "jade",
        name: "Member · family work",
        byline: "A year, weekly then monthly",
        text: (
          <>
            My mother and I hadn't spoken in four years. Ana never promised
            reconciliation — she promised clarity. We got both, eventually, in
            that order.
          </>
        ),
        when: "Vouched 15 Feb 2026",
      },
      {
        initials: "NR",
        tint: "coral",
        name: "Member · questioning",
        byline: "5 months",
        text: (
          <>
            I booked the first session saying I probably didn't belong in
            therapy because I didn't have a word for what I was. She said{" "}
            <em>the word can come last.</em> It did.
          </>
        ),
        when: "Vouched 27 Nov 2025",
      },
      {
        initials: "JG",
        tint: "plum",
        name: "Member · couple work",
        byline: "10 sessions with my partner",
        text: (
          <>
            In Spanish, which mattered more than I expected. She caught the
            pattern in session three and was gentle and completely unsparing
            about it at the same time.
          </>
        ),
        when: "Vouched 9 Oct 2025",
      },
    ],
    notes: [
      {
        title: "Waitlist, honestly run",
        text: "She's full right now and says so. Join the list and she'll write when a slot opens — typically 6–10 weeks.",
      },
      {
        title: "Sliding scale",
        text: "€50–70 by income, no proof asked. Two solidarity places are held for members who need them.",
      },
      {
        title: "In the meantime",
        text: "She answers messages even while full, and will point you to a colleague or a peer group rather than leave you waiting alone.",
      },
      {
        title: "What she doesn't do",
        text: "Court reports and assessments for legal processes. Therapy stays therapy.",
      },
    ],
    availability: parseAvail(
      "9f 10f 11f 12f 13f 14. 15. | 16f 17f 18f 19f 20f 21. 22. | 23f 24f 25f 26f 27f 28. 29. | 30f 1f 2f 3f 4f 5. 6.",
      ["Jun", "Jul"],
    ),
    slotTime: "11:00",
    fees: [
      { label: "Standard session · 50 min", value: "€60" },
      { label: "Sliding scale", value: "from €50", tone: "sliding" },
      { label: "Couple / family · 80 min", value: "€70" },
      { label: "Solidarity places · 2 held", value: "€35", tone: "sliding" },
      { label: "Late cancellation (<24h)", value: "50%" },
    ],
    venue: {
      name: "Espaço Arroios",
      lines: ["Rua de Arroios 89, 1.º", "1150-053 Lisboa · Arroios"],
      access:
        "One flight of stairs, no lift — say so and she'll arrange the ground-floor room. Bathroom is single-stall, gender-free. Metro: Arroios (3 min).",
    },
    bookCta: "Join the waitlist",
  },

  "sarah-okafor": {
    id: "sarah-okafor",
    eyebrow: "Counselling psychologist · 11 years in practice",
    namePlain: "Sarah",
    nameEm: "Okafor.",
    credsLine: [
      "BPS Chartered 365112",
      "DPsych City, University of London",
      "Racial-trauma certified",
    ],
    quote:
      "You shouldn't have to leave half of yourself in the waiting room. Bring all of it — that's where the work is.",
    pills: [
      { label: "EN · FR", tone: "lang" },
      { label: "Accepting new clients", tone: "accept" },
      { label: "Online only" },
      { label: "Intersectional" },
      { label: "Trauma-focused" },
      { label: "Sliding scale" },
    ],
    vettedOn: "9 Apr 2026",
    specialisms: [
      {
        initial: "R",
        title: "Race & queerness",
        desc: "Holding both without ranking them, in rooms that ask you to",
      },
      {
        initial: "T",
        title: "Trauma",
        desc: "Racial trauma, complex trauma, EMDR where it serves",
      },
      {
        initial: "D",
        title: "Displacement",
        desc: "Migration, diaspora, homesickness for places that hurt you",
      },
      {
        initial: "I",
        title: "Intersectionality",
        desc: "The whole of you, not the intake-form version",
      },
      {
        initial: "F",
        title: "Faith & culture",
        desc: "Communities you love that don't always love you back",
      },
      {
        initial: "B",
        title: "Belonging",
        desc: "Building home in a body and a city that both take work",
      },
    ],
    approach: {
      titlePlain: "Trauma-focused and",
      titleEm: "politically literate.",
      paragraphs: [
        <>
          Sarah is a chartered counselling psychologist working at the
          intersection of race, queerness and displacement. If you've sat across
          from a therapist who could hold one part of you but not the rest,{" "}
          <em>you already know why that intersection matters.</em>
        </>,
        <>
          Her work is trauma-focused and politically literate — she doesn't
          treat the world outside the room as irrelevant to what happens inside
          it. Liberation psychology isn't a slogan in her practice; it's the
          method.
        </>,
        <>
          She works in English and French, online, with people across the UK and
          the EU. Expect her to be direct about what she's noticing — and to
          check whether you want it named.
        </>,
      ],
    },
    vouches: [
      {
        initials: "OA",
        tint: "jade",
        name: "Member · QTIPOC",
        byline: "14 months, weekly",
        text: (
          <>
            Every other therapist made me choose which thing we were working on
            that week. Sarah never split me into <em>manageable pieces.</em>{" "}
            That alone was worth it.
          </>
        ),
        when: "Vouched 18 May 2026",
      },
      {
        initials: "CL",
        tint: "coral",
        name: "Member · trauma work",
        byline: "8 months",
        text: (
          <>
            She names power like other people name weather — calmly, accurately,
            and then we deal with it. EMDR sessions were hard and worth it.
          </>
        ),
        when: "Vouched 2 Mar 2026",
      },
      {
        initials: "FN",
        tint: "plum",
        name: "Member · Lisbon via Paris",
        byline: "6 months, in French",
        text: (
          <>
            Therapy in French, about a life lived in three countries, with
            someone who didn't need the geography explained. I didn't know how
            much I needed that.
          </>
        ),
        when: "Vouched 21 Dec 2025",
      },
    ],
    notes: [
      {
        title: "First session",
        text: "A full 50-minute session where you set the agenda, with space to ask her anything before you decide to continue.",
      },
      {
        title: "Sliding scale",
        text: "€85 standard, €65 reduced, with places for students and precarious work. Say what's honest; she takes it from there.",
      },
      {
        title: "UK & EU",
        text: "She's registered in the UK and sees clients across Europe. Invoices work for most private reimbursement schemes.",
      },
      {
        title: "What she doesn't do",
        text: "Under-18s and couples work. Her referral list is intersectional too — she built it herself.",
      },
    ],
    availability: parseAvail(
      "9f 10o 11f 12f 13o 14. 15. | 16o 17f 18f 19o 20f 21. 22. | 23f 24f 25o 26f 27o 28. 29. | 30f 1o 2f 3o 4f 5. 6.",
      ["Jun", "Jul"],
    ),
    slotTime: "17:00",
    fees: [
      { label: "Standard session · 50 min", value: "€85" },
      { label: "Reduced rate", value: "€65", tone: "sliding" },
      { label: "Intro call · 15 min", value: "Free", tone: "free" },
      { label: "Late cancellation (<24h)", value: "50%" },
    ],
    venue: {
      name: "Online practice",
      lines: ["Video sessions · UK & EU", "GMT and CET hours"],
      access:
        "A private video link before each session. She sends a short grounding note the day before your first one.",
    },
    bookCta: "Book a first session",
  },

  "pedro-carvalho": {
    id: "pedro-carvalho",
    eyebrow: "Psychotherapist · 8 years in practice",
    namePlain: "Pedro",
    nameEm: "Carvalho.",
    credsLine: ["APAF 0742", "MSc ISCTE Lisboa", "WPATH-informed"],
    quote:
      "There's no age where coming out stops counting. I've sat with people doing it at 17 and at 70 — the honesty is the same size.",
    pills: [
      { label: "PT · EN", tone: "lang" },
      { label: "Accepting new clients", tone: "accept" },
      { label: "Queer himself" },
      { label: "Couples — any structure" },
      { label: "Trans-affirming" },
      { label: "In-person · Príncipe Real" },
    ],
    vettedOn: "22 May 2026",
    specialisms: [
      {
        initial: "C",
        title: "Coming out",
        desc: "At any age — including the ones nobody makes films about",
      },
      {
        initial: "P",
        title: "Couples & relationships",
        desc: "Any structure; opening up, closing, starting over",
      },
      {
        initial: "T",
        title: "Trans & non-binary",
        desc: "Transition support, and the renegotiations that ripple outward",
      },
      {
        initial: "G",
        title: "Gestalt work",
        desc: "What's happening right now — in the room, in your body",
      },
      {
        initial: "F",
        title: "Family fallout",
        desc: "Parents, siblings, the phone calls you rehearse",
      },
      {
        initial: "S",
        title: "Second adolescence",
        desc: "Dating for the first time at 35, and other honest chaos",
      },
    ],
    approach: {
      titlePlain: "Functional, present-tense,",
      titleEm: "queer himself.",
      paragraphs: [
        <>
          Pedro is a queer therapist, and that isn't a footnote in his bio —
          it's load-bearing. He works with coming-out processes at every age:
          the teenager, the forty-year-old, the person who waited until both
          parents had passed. <em>There is no timeline that's too late.</em>
        </>,
        <>
          His frame is functional-analytic with Gestalt in the room: less
          archaeology, more what's happening right now — in your week, in your
          body, in the relationship you brought with you.
        </>,
        <>
          Couples of any structure are welcome, and he's WPATH-informed for
          trans and non-binary clients — support letters included, without
          making it feel like an exam.
        </>,
      ],
    },
    vouches: [
      {
        initials: "HD",
        tint: "jade",
        name: "Member · came out at 44",
        byline: "A year, weekly",
        text: (
          <>
            I spent the first session apologising for being late to my own life.
            He never let me do it again — not by being soft about it, by being{" "}
            <em>right</em> about it.
          </>
        ),
        when: "Vouched 26 Apr 2026",
      },
      {
        initials: "MT",
        tint: "coral",
        name: "Member · open relationship, couple work",
        byline: "7 months",
        text: (
          <>
            We expected to spend three sessions explaining our structure. He
            asked one clarifying question and moved on to the actual problem.
            Rare.
          </>
        ),
        when: "Vouched 13 Feb 2026",
      },
      {
        initials: "AS",
        tint: "plum",
        name: "Member · trans, letter + therapy",
        byline: "5 months",
        text: (
          <>
            He wrote my letter in week six without ceremony, and then we kept
            working on the things that were actually mine. Knows the Portuguese
            system cold.
          </>
        ),
        when: "Vouched 30 Nov 2025",
      },
    ],
    notes: [
      {
        title: "First session",
        text: "50 minutes, on your own or as a couple. You map what you want to work on together — no pressure to continue if it's not a fit.",
      },
      {
        title: "Fixed fees",
        text: "€60 individual, €80 couples. No sliding scale, but he keeps two lower-fee slots through ILGA's referral network.",
      },
      {
        title: "Letters & documents",
        text: "Support letters for gender-affirming care are part of the work, not an extra service with a price tag.",
      },
      {
        title: "What he doesn't do",
        text: "Minors and eating-disorder treatment. His referrals are people he's actually sent friends to.",
      },
    ],
    availability: parseAvail(
      "9o 10f 11f 12o 13f 14o 15. | 16f 17o 18f 19f 20o 21. 22. | 23o 24f 25f 26o 27f 28o 29. | 30f 1o 2f 3f 4o 5. 6.",
      ["Jun", "Jul"],
    ),
    slotTime: "18:00",
    fees: [
      { label: "Individual session · 50 min", value: "€60" },
      { label: "Couple session · 60 min", value: "€80" },
      { label: "ILGA-referred slot", value: "€40", tone: "sliding" },
      { label: "Late cancellation (<24h)", value: "50%" },
    ],
    venue: {
      name: "Estúdio Príncipe Real",
      lines: ["Praça do Príncipe Real 26", "1250-096 Lisboa"],
      access:
        "Ground floor, step-free. Bathroom is shared, gender-free. Metro: Rato (7 min walk).",
    },
    bookCta: "Book a first session",
  },
};
