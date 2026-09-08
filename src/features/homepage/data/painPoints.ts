import {
  FiCalendar,
  FiCompass,
  FiFeather,
  FiFilm,
  FiFlag,
  FiHeart,
  FiMessageSquare,
  FiMusic,
  FiRepeat,
  FiShoppingBag,
  FiUsers,
} from "react-icons/fi";
import type { BuiltStep, BuiltVoice } from "./types";
import { MEMBERS } from "../../members/data/members";
import { routes } from "../../../app/routeMap";

/**
 * "We built the community we wanted to find." — one card, one icon per thing
 * we built, each unfolding as a short conversation: two voices name the gap,
 * we answer with what we built, then, weeks later, both of them say what
 * changed. See `PainPoints.tsx` for the card.
 *
 * Order is meaningful, and it runs in pairs: meet people and talk to them →
 * go to something and host your own → spend locally and read → support and
 * action, which `tone` also carries into the styling. Everything still being
 * built closes the list, greyed on the rail by `isLaunched` and saying so in
 * its own words: Skill swaps waits on the Work hub behind
 * `COMING_SOON_PATTERNS`, and Cinema and Studio resolve to their coming-soon
 * page in a live build (see `cinemaRoutes` / `studioRoutes`).
 *
 * i18n Pattern A — see `BuiltStep` in `./types` for the key shapes.
 */

/**
 * The conversation is spoken by the showcase's DEMO personas, so the faces on
 * this card are the same ones the rest of the homepage already shows. The two
 * entries in `realMembers.ts` are deliberately absent: the lines here are
 * written by us, and a written line never goes under a real member's face. The
 * note under the thread says so on the page.
 *
 * Eleven steps need 22 voices and `members.ts` holds 20 usable personas, so two
 * of them speak in two steps: Nuno and Jordan. No persona speaks in two
 * ADJACENT steps, which is what stopped anyone turning into the section's
 * mascot when every voice was unique. Adding a step means checking that pairing
 * again.
 */
function voice(slug: string): BuiltVoice {
  const member = MEMBERS[slug]!;
  return {
    name: member.first,
    initials: member.initials,
    tint: member.tint,
    photo: member.photo,
  };
}

export const builtSteps: BuiltStep[] = [
  // ── Meeting people, and talking to them ───────────────────────────
  {
    key: "network",
    icon: FiUsers,
    labelKey: "homepage:painPoints.network.label",
    firstVoice: voice("ines"),
    secondVoice: voice("rui"),
    questionKey: "homepage:painPoints.network.question",
    question2Key: "homepage:painPoints.network.question2",
    headingKey: "homepage:painPoints.network.heading",
    bodyKey: "homepage:painPoints.network.body",
    payoffKey: "homepage:painPoints.network.payoff",
    payoff2Key: "homepage:painPoints.network.payoff2",
    ctaLabelKey: "homepage:painPoints.network.cta",
    href: "#discovery",
    isLaunched: true,
    tone: "warm",
  },
  {
    key: "forum",
    icon: FiMessageSquare,
    labelKey: "homepage:painPoints.forum.label",
    firstVoice: voice("nuno"),
    secondVoice: voice("ana"),
    questionKey: "homepage:painPoints.forum.question",
    question2Key: "homepage:painPoints.forum.question2",
    headingKey: "homepage:painPoints.forum.heading",
    bodyKey: "homepage:painPoints.forum.body",
    payoffKey: "homepage:painPoints.forum.payoff",
    payoff2Key: "homepage:painPoints.forum.payoff2",
    ctaLabelKey: "homepage:painPoints.forum.cta",
    href: routes.forum,
    isLaunched: true,
    tone: "warm",
  },
  // ── Getting out, and putting something on yourself ────────────────
  {
    key: "whatsOn",
    icon: FiCompass,
    labelKey: "homepage:painPoints.whatsOn.label",
    firstVoice: voice("mariana"),
    secondVoice: voice("jordan"),
    questionKey: "homepage:painPoints.whatsOn.question",
    question2Key: "homepage:painPoints.whatsOn.question2",
    headingKey: "homepage:painPoints.whatsOn.heading",
    bodyKey: "homepage:painPoints.whatsOn.body",
    payoffKey: "homepage:painPoints.whatsOn.payoff",
    payoff2Key: "homepage:painPoints.whatsOn.payoff2",
    ctaLabelKey: "homepage:painPoints.whatsOn.cta",
    href: routes.gatherings,
    isLaunched: true,
    tone: "warm",
  },
  {
    key: "host",
    icon: FiCalendar,
    labelKey: "homepage:painPoints.host.label",
    firstVoice: voice("tomas"),
    secondVoice: voice("beatriz"),
    questionKey: "homepage:painPoints.host.question",
    question2Key: "homepage:painPoints.host.question2",
    headingKey: "homepage:painPoints.host.heading",
    bodyKey: "homepage:painPoints.host.body",
    payoffKey: "homepage:painPoints.host.payoff",
    payoff2Key: "homepage:painPoints.host.payoff2",
    ctaLabelKey: "homepage:painPoints.host.cta",
    href: routes.host,
    isLaunched: true,
    tone: "warm",
  },
  // ── Everyday Lisbon: where you spend, what you read ───────────────
  {
    key: "directory",
    icon: FiShoppingBag,
    labelKey: "homepage:painPoints.directory.label",
    firstVoice: voice("carla"),
    secondVoice: voice("nuno"),
    questionKey: "homepage:painPoints.directory.question",
    question2Key: "homepage:painPoints.directory.question2",
    headingKey: "homepage:painPoints.directory.heading",
    bodyKey: "homepage:painPoints.directory.body",
    payoffKey: "homepage:painPoints.directory.payoff",
    payoff2Key: "homepage:painPoints.directory.payoff2",
    ctaLabelKey: "homepage:painPoints.directory.cta",
    href: routes.businessDirectory,
    isLaunched: true,
    tone: "warm",
  },
  {
    key: "magazine",
    icon: FiFeather,
    labelKey: "homepage:painPoints.magazine.label",
    firstVoice: voice("anika"),
    secondVoice: voice("luisa"),
    questionKey: "homepage:painPoints.magazine.question",
    question2Key: "homepage:painPoints.magazine.question2",
    headingKey: "homepage:painPoints.magazine.heading",
    bodyKey: "homepage:painPoints.magazine.body",
    payoffKey: "homepage:painPoints.magazine.payoff",
    payoff2Key: "homepage:painPoints.magazine.payoff2",
    ctaLabelKey: "homepage:painPoints.magazine.cta",
    href: routes.magazine,
    isLaunched: true,
    tone: "warm",
  },
  // ── When it gets heavier: support, and doing something ────────────
  {
    key: "wellbeing",
    icon: FiHeart,
    labelKey: "homepage:painPoints.wellbeing.label",
    firstVoice: voice("kai"),
    secondVoice: voice("jordan"),
    questionKey: "homepage:painPoints.wellbeing.question",
    question2Key: "homepage:painPoints.wellbeing.question2",
    headingKey: "homepage:painPoints.wellbeing.heading",
    bodyKey: "homepage:painPoints.wellbeing.body",
    payoffKey: "homepage:painPoints.wellbeing.payoff",
    payoff2Key: "homepage:painPoints.wellbeing.payoff2",
    ctaLabelKey: "homepage:painPoints.wellbeing.cta",
    href: routes.wellbeing,
    isLaunched: true,
    tone: "safe",
  },
  {
    key: "activism",
    icon: FiFlag,
    labelKey: "homepage:painPoints.activism.label",
    firstVoice: voice("maria"),
    secondVoice: voice("fatima"),
    questionKey: "homepage:painPoints.activism.question",
    question2Key: "homepage:painPoints.activism.question2",
    headingKey: "homepage:painPoints.activism.heading",
    bodyKey: "homepage:painPoints.activism.body",
    payoffKey: "homepage:painPoints.activism.payoff",
    payoff2Key: "homepage:painPoints.activism.payoff2",
    ctaLabelKey: "homepage:painPoints.activism.cta",
    href: routes.volunteer,
    isLaunched: true,
    tone: "safe",
  },
  // ── Still being built. Greyed on the rail, and they say so ────────
  {
    key: "skillSwaps",
    icon: FiRepeat,
    labelKey: "homepage:painPoints.skillSwaps.label",
    firstVoice: voice("jonas"),
    secondVoice: voice("rita"),
    questionKey: "homepage:painPoints.skillSwaps.question",
    question2Key: "homepage:painPoints.skillSwaps.question2",
    headingKey: "homepage:painPoints.skillSwaps.heading",
    bodyKey: "homepage:painPoints.skillSwaps.body",
    payoffKey: "homepage:painPoints.skillSwaps.payoff",
    payoff2Key: "homepage:painPoints.skillSwaps.payoff2",
    ctaLabelKey: "homepage:painPoints.skillSwaps.cta",
    href: routes.roadmap,
    isLaunched: false,
    tone: "warm",
  },
  {
    key: "cinema",
    icon: FiFilm,
    labelKey: "homepage:painPoints.cinema.label",
    firstVoice: voice("sofia"),
    secondVoice: voice("andre"),
    questionKey: "homepage:painPoints.cinema.question",
    question2Key: "homepage:painPoints.cinema.question2",
    headingKey: "homepage:painPoints.cinema.heading",
    bodyKey: "homepage:painPoints.cinema.body",
    payoffKey: "homepage:painPoints.cinema.payoff",
    payoff2Key: "homepage:painPoints.cinema.payoff2",
    ctaLabelKey: "homepage:painPoints.cinema.cta",
    href: routes.cinema,
    isLaunched: false,
    tone: "warm",
  },
  {
    key: "studio",
    icon: FiMusic,
    labelKey: "homepage:painPoints.studio.label",
    firstVoice: voice("diogo"),
    secondVoice: voice("monica"),
    questionKey: "homepage:painPoints.studio.question",
    question2Key: "homepage:painPoints.studio.question2",
    headingKey: "homepage:painPoints.studio.heading",
    bodyKey: "homepage:painPoints.studio.body",
    payoffKey: "homepage:painPoints.studio.payoff",
    payoff2Key: "homepage:painPoints.studio.payoff2",
    ctaLabelKey: "homepage:painPoints.studio.cta",
    href: routes.studio,
    isLaunched: false,
    tone: "warm",
  },
];
