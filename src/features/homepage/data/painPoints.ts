import type { GapThreadItem } from "./types";
import { routes } from "../../../app/routeMap";

/**
 * "We built this because we felt these gaps." — Direction E, a threaded
 * question↔answer conversation running down a central line, with two
 * full-width plum hero panels planted at the pivotal beats. The emotional
 * arc runs warm (belong/build) → heavier (safety/rights).
 *
 * Order is meaningful: the two `hero` items open each act, the `marker`
 * items caption the transitions, and the alternating left/right layout of
 * the `exchange` items is derived from their position (see PainPoints.tsx).
 */
export const gapsThread: GapThreadItem[] = [
  // ── Act I · Belonging ──────────────────────────────────────────────
  {
    kind: "hero",
    eyebrow: "The gap we felt first",
    question:
      "Why is it so hard to connect with other queer people outside of nightlife or dating apps?",
    headingPrefix: "A network built on ",
    accent: "craft, not clubs.",
    body: "QueerPulse is where queer professionals meet as themselves — designers, engineers, chefs, filmmakers — not as who they are at 2am.",
    builtLabel: "So we built the network",
    ctaLabel: "Explore members",
    href: "#discovery",
  },
  {
    kind: "marker",
    label: "And everything that grows from belonging",
  },
  {
    kind: "exchange",
    tone: "warm",
    question:
      "I want to work on projects with like-minded people. Where do I find them?",
    headingPrefix: "Collaborators, not ",
    accent: "connections.",
    body: "The Board is where members post what they're making and who they need. No cold outreach, no speculative emails. Just real asks from real people.",
    ctaLabel: "See the board",
    href: "#board",
  },
  {
    kind: "exchange",
    tone: "warm",
    question:
      "I'm new to Lisbon. How do I find queer-owned businesses and professionals?",
    headingPrefix: "A city guide built by ",
    accent: "the community.",
    body: "The directory is a living map of queer-owned and queer-friendly businesses in Lisbon — maintained by members who actually use them.",
    ctaLabel: "Browse the directory",
    href: routes.businessDirectory,
  },
  {
    kind: "exchange",
    tone: "warm",
    question: "I want to host events for my community. Where do I start?",
    headingPrefix: "From idea to gathering ",
    accent: "in an afternoon.",
    body: "A step-by-step guide to running a supper club, studio visit, workshop, or screening — with partner spaces, member support, and a listing on the gatherings board.",
    ctaLabel: "Host a gathering",
    href: routes.host,
  },
  {
    kind: "exchange",
    tone: "warm",
    question: "I want to get better at X. Who can help? Where can I learn?",
    headingPrefix: "Learn from people doing ",
    accent: "the thing you want to do.",
    body: "Members offer mentoring, workshops, and portfolio reviews — not as a service, but as a community practice. No platform fee, no imposter syndrome required.",
    ctaLabel: "See skills & learning",
    href: routes.skills,
  },
  // ── Act II · Safety & rights ───────────────────────────────────────
  {
    kind: "hero",
    eyebrow: "The gap that matters most",
    question:
      "I'm struggling and don't know where to turn. Who can I actually trust?",
    headingPrefix: "Mental health resources ",
    accent: "built for us.",
    body: "Queer-affirming therapists in Lisbon, a peer support group, and crisis resources — all vetted by community members, not a directory algorithm.",
    builtLabel: "So we vetted them ourselves",
    ctaLabel: "Find support",
    href: routes.wellbeing,
  },
  {
    kind: "marker",
    label: "Know your rights, wherever you stand",
  },
  {
    kind: "exchange",
    tone: "safe",
    question:
      "I want to make a difference. How do I make my activism feel like it matters?",
    headingPrefix: "Local action, ",
    accent: "real impact.",
    body: "A practical guide to activism in Lisbon — using your skills, finding others who care, and making change in the places you actually live and work.",
    ctaLabel: "Read the guide",
    href: routes.activism,
  },
  {
    kind: "exchange",
    tone: "safe",
    question:
      "My employer is discriminating against me. What are my rights in Portugal?",
    headingPrefix: "Know your rights. ",
    accent: "Have your receipts.",
    body: "Workplace discrimination, housing rights, healthcare access — legal guides for LGBTQ+ people in Portugal, plus queer-friendly lawyers.",
    ctaLabel: "Read the guide",
    href: routes.legal,
  },
  {
    kind: "exchange",
    tone: "safe",
    question:
      "My company has a Pride float. That doesn't mean it's safe to be out there.",
    headingPrefix: "Employer reviews written ",
    accent: "by us, for us.",
    body: "Anonymous reviews of companies by LGBTQ+ employees in Lisbon. Beyond the rainbow logo — is the culture actually safe to be out in?",
    ctaLabel: "Read & write reviews",
    href: routes.employerReviews,
  },
];
