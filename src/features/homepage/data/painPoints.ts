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
 *
 * i18n Pattern A — see `GapThreadItem` in `./types` for the key shapes.
 */
export const gapsThread: GapThreadItem[] = [
  // ── Act I · Belonging ──────────────────────────────────────────────
  {
    kind: "hero",
    eyebrowKey: "homepage:painPoints.hero1.eyebrow",
    questionKey: "homepage:painPoints.hero1.question",
    headingKey: "homepage:painPoints.hero1.heading",
    bodyKey: "homepage:painPoints.hero1.body",
    builtLabelKey: "homepage:painPoints.hero1.builtLabel",
    ctaLabelKey: "homepage:painPoints.hero1.cta",
    href: "#discovery",
  },
  {
    kind: "marker",
    labelKey: "homepage:painPoints.marker1",
  },
  {
    kind: "exchange",
    tone: "warm",
    questionKey: "homepage:painPoints.exchange1.question",
    headingKey: "homepage:painPoints.exchange1.heading",
    bodyKey: "homepage:painPoints.exchange1.body",
    ctaLabelKey: "homepage:painPoints.exchange1.cta",
    href: "#board",
  },
  {
    kind: "exchange",
    tone: "warm",
    questionKey: "homepage:painPoints.exchange2.question",
    headingKey: "homepage:painPoints.exchange2.heading",
    bodyKey: "homepage:painPoints.exchange2.body",
    ctaLabelKey: "homepage:painPoints.exchange2.cta",
    href: routes.businessDirectory,
  },
  {
    kind: "exchange",
    tone: "warm",
    questionKey: "homepage:painPoints.exchange3.question",
    headingKey: "homepage:painPoints.exchange3.heading",
    bodyKey: "homepage:painPoints.exchange3.body",
    ctaLabelKey: "homepage:painPoints.exchange3.cta",
    href: routes.host,
  },
  {
    kind: "exchange",
    tone: "warm",
    questionKey: "homepage:painPoints.exchange4.question",
    headingKey: "homepage:painPoints.exchange4.heading",
    bodyKey: "homepage:painPoints.exchange4.body",
    ctaLabelKey: "homepage:painPoints.exchange4.cta",
    href: routes.roadmap,
  },
  // ── Act II · Safety & rights ───────────────────────────────────────
  {
    kind: "hero",
    eyebrowKey: "homepage:painPoints.hero2.eyebrow",
    questionKey: "homepage:painPoints.hero2.question",
    headingKey: "homepage:painPoints.hero2.heading",
    bodyKey: "homepage:painPoints.hero2.body",
    builtLabelKey: "homepage:painPoints.hero2.builtLabel",
    ctaLabelKey: "homepage:painPoints.hero2.cta",
    href: routes.wellbeing,
  },
  {
    kind: "marker",
    labelKey: "homepage:painPoints.marker2",
  },
  {
    kind: "exchange",
    tone: "safe",
    questionKey: "homepage:painPoints.exchange5.question",
    headingKey: "homepage:painPoints.exchange5.heading",
    bodyKey: "homepage:painPoints.exchange5.body",
    ctaLabelKey: "homepage:painPoints.exchange5.cta",
    href: routes.activism,
  },
  {
    kind: "exchange",
    tone: "safe",
    questionKey: "homepage:painPoints.exchange6.question",
    headingKey: "homepage:painPoints.exchange6.heading",
    bodyKey: "homepage:painPoints.exchange6.body",
    ctaLabelKey: "homepage:painPoints.exchange6.cta",
    href: routes.legal,
  },
  {
    kind: "exchange",
    tone: "safe",
    questionKey: "homepage:painPoints.exchange7.question",
    headingKey: "homepage:painPoints.exchange7.heading",
    bodyKey: "homepage:painPoints.exchange7.body",
    ctaLabelKey: "homepage:painPoints.exchange7.cta",
    href: routes.roadmap,
  },
];
