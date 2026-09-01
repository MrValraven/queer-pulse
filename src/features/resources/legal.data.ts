import { routes } from "../../app/routeMap";

export interface Right {
  badge: "protected" | "know" | "practical";
  /** CNT-18 rating key — the i18n dot-path prefix minus `.title` (e.g.
   *  `legal.workplace.dismissal`), so `GuideRatingWidget` addresses the same
   *  guide the titleKey/bodyKey render. */
  contentKey: string;
  titleKey: string;
  bodyKey: string;
  linkKey: string;
  to: string;
}

/**
 * i18n Pattern A — platform-authored legal guidance chrome, resolved via
 * `t()` in RightsSection. Real-world proper nouns inside the body strings
 * (ACT, SNS, ILGA Portugal) stay untranslated as part of the catalog value
 * itself. This is legal information — flagged for native review.
 */
export const WORKPLACE: Right[] = [
  {
    badge: "protected",
    contentKey: "legal.workplace.dismissal",
    titleKey: "resources:legal.workplace.dismissal.title",
    bodyKey: "resources:legal.workplace.dismissal.body",
    linkKey: "resources:legal.link.readGuide",
    to: routes.resources,
  },
  {
    badge: "protected",
    contentKey: "legal.workplace.harassment",
    titleKey: "resources:legal.workplace.harassment.title",
    bodyKey: "resources:legal.workplace.harassment.body",
    linkKey: "resources:legal.link.readGuide",
    to: routes.resources,
  },
  {
    badge: "know",
    contentKey: "legal.workplace.pronouns",
    titleKey: "resources:legal.workplace.pronouns.title",
    bodyKey: "resources:legal.workplace.pronouns.body",
    linkKey: "resources:legal.link.readGuide",
    to: routes.resources,
  },
  {
    badge: "practical",
    contentKey: "legal.workplace.complaint",
    titleKey: "resources:legal.workplace.complaint.title",
    bodyKey: "resources:legal.workplace.complaint.body",
    linkKey: "resources:legal.link.getTemplate",
    to: routes.resources,
  },
];

export const HOUSING: Right[] = [
  {
    badge: "protected",
    contentKey: "legal.housing.rental",
    titleKey: "resources:legal.housing.rental.title",
    bodyKey: "resources:legal.housing.rental.body",
    linkKey: "resources:legal.link.readGuide",
    to: routes.resources,
  },
  {
    badge: "practical",
    contentKey: "legal.housing.samesex",
    titleKey: "resources:legal.housing.samesex.title",
    bodyKey: "resources:legal.housing.samesex.body",
    linkKey: "resources:legal.link.readGuide",
    to: routes.resources,
  },
  {
    badge: "practical",
    contentKey: "legal.housing.eviction",
    titleKey: "resources:legal.housing.eviction.title",
    bodyKey: "resources:legal.housing.eviction.body",
    linkKey: "resources:legal.link.findSupport",
    to: routes.changemakers,
  },
];

export const HEALTHCARE: Right[] = [
  {
    badge: "protected",
    contentKey: "legal.healthcare.sns",
    titleKey: "resources:legal.healthcare.sns.title",
    bodyKey: "resources:legal.healthcare.sns.body",
    linkKey: "resources:legal.link.transHubGuide",
    to: routes.transHub,
  },
  {
    badge: "protected",
    contentKey: "legal.healthcare.refusal",
    titleKey: "resources:legal.healthcare.refusal.title",
    bodyKey: "resources:legal.healthcare.refusal.body",
    linkKey: "resources:legal.link.reportRefusal",
    to: routes.report,
  },
  {
    badge: "practical",
    contentKey: "legal.healthcare.prep",
    titleKey: "resources:legal.healthcare.prep.title",
    bodyKey: "resources:legal.healthcare.prep.body",
    linkKey: "resources:legal.link.prepGuide",
    to: routes.wellbeing,
  },
];

/**
 * Mock lawyer directory — demo-only. There is NO lawyer-directory backend yet,
 * so live mode must not render these fabricated, "consultation-bookable"
 * profiles; it shows an honest coming-soon instead (see the `#lawyers` section).
 * Names/spec/tags/loc are content, left in English per the scope rule.
 */
export const LAWYERS = [
  {
    name: "Sofia Mendonça",
    spec: "Labour law specialist · discrimination, constructive dismissal, workplace harassment.",
    tags: ["Workplace", "PT · EN", "No-win no-fee available"],
    loc: "Chiado",
  },
  {
    name: "Ricardo Faria",
    spec: "Civil & tenancy law · rental discrimination, same-sex property rights, housing disputes.",
    tags: ["Housing", "PT"],
    loc: "Baixa · Online",
  },
  {
    name: "Ana Beatriz Leal",
    spec: "Healthcare & administrative law · trans legal name change, SNS complaints, discrimination in healthcare.",
    tags: ["Trans rights", "Healthcare", "PT · FR"],
    loc: "Avenidas Novas",
  },
];
