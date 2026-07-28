import type { ReactNode } from "react";
import {
  FiBriefcase,
  FiAward,
  FiBookOpen,
  FiBookmark,
  FiDollarSign,
  FiStar,
  FiClock,
  FiMessageCircle,
} from "react-icons/fi";
import { routes } from "../../app/routeMap";
import type { TFunction } from "../../shared/i18n/types";
import { APPS } from "./applicationStatus.data";
import { MENTORS } from "./mentorship.data";

const activeApps = APPS.filter((a) => a.category === "active").length;
const sentApps = APPS.filter((a) => a.category !== "draft").length;
const offers = APPS.filter((a) => a.category === "offer").length;
const openMentors = MENTORS.filter((m) => m.button !== "Join waitlist").length;

/**
 * i18n Pattern B. This live one-line summary fuses chrome phrasing with counts
 * derived from mock data — in live mode the counts come over the wire and the
 * phrase is still chrome, so it's built from `t()` at render, memoized by the
 * sole consumer (`WorkHubPage.tsx`) via `useMemo(() => workStatusLine(t), [t])`.
 */
export function workStatusLine(t: TFunction): string {
  const apps = t("economy:workHub.statusLine.apps", { count: activeApps });
  const offerPart = offers
    ? t("economy:workHub.statusLine.offers", { count: offers })
    : t("economy:workHub.statusLine.noOffers");
  return `${apps} · ${offerPart} · ${t("economy:workHub.statusLine.mentorThreads")}`;
}

export interface NextAction {
  id: string;
  icon: ReactNode;
  labelKey: string;
  labelValues?: Record<string, string | number>;
  contextKey: string;
  /** Short urgency chip key, e.g. "Closes in {days} days". */
  urgencyKey?: string;
  urgencyValues?: Record<string, string | number>;
  /** When true the chip + row read as urgent (coral). */
  urgent?: boolean;
  to: string;
  ctaKey: string;
}

/**
 * i18n Pattern A with interpolation. Cross-silo "what needs you" list — the
 * spine's prioritised next actions. `Casa Viva`/`Inês` are mock-content
 * proper nouns (in live mode they'd come over the wire), passed as `{token}`
 * values rather than baked into the chrome phrase.
 */
export const NEXT_ACTIONS: NextAction[] = [
  {
    id: "offer",
    icon: <FiClock />,
    labelKey: "economy:workHub.next.offer.label",
    labelValues: { company: "Casa Viva" },
    contextKey: "economy:workHub.next.offer.context",
    urgencyKey: "economy:workHub.next.offer.urgency",
    urgencyValues: { days: 3 },
    urgent: true,
    to: routes.applicationStatus,
    ctaKey: "economy:workHub.next.offer.cta",
  },
  {
    id: "mentor",
    icon: <FiMessageCircle />,
    labelKey: "economy:workHub.next.mentor.label",
    labelValues: { name: "Inês" },
    contextKey: "economy:workHub.next.mentor.context",
    to: routes.mentorship,
    ctaKey: "economy:workHub.next.mentor.cta",
  },
  {
    id: "grant",
    icon: <FiDollarSign />,
    labelKey: "economy:workHub.next.grant.label",
    contextKey: "economy:workHub.next.grant.context",
    urgencyKey: "economy:workHub.next.grant.urgency",
    to: routes.grants,
    ctaKey: "economy:workHub.next.grant.cta",
  },
  {
    id: "profile",
    icon: <FiStar />,
    labelKey: "economy:workHub.next.profile.label",
    labelValues: { percent: 70 },
    contextKey: "economy:workHub.next.profile.context",
    to: routes.workProfile,
    ctaKey: "economy:workHub.next.profile.cta",
  },
];

export interface StatusCard {
  key: string;
  icon: ReactNode;
  labelKey: string;
  primaryKey: string;
  primaryValues?: Record<string, string | number>;
  nextKey: string;
  nextValues?: Record<string, string | number>;
  to: string;
}

/**
 * i18n Pattern A with interpolation. `contextValues`/`grant.context` carry the
 * fund name — mock content in demo mode, live data in live mode — as a
 * `{token}` next to a chrome phrase, same idiom as `NEXT_ACTIONS` above.
 */
export const STATUS_CARDS: StatusCard[] = [
  {
    key: "apps",
    icon: <FiBriefcase />,
    labelKey: "economy:workHub.card.apps.label",
    primaryKey: "economy:workHub.card.apps.primary",
    primaryValues: { active: activeApps, sent: sentApps },
    nextKey: offers
      ? "economy:workHub.statusLine.offers"
      : "economy:workHub.card.apps.noOffers",
    nextValues: offers ? { count: offers } : undefined,
    to: routes.applicationStatus,
  },
  {
    key: "mentor",
    icon: <FiAward />,
    labelKey: "economy:workHub.card.mentor.label",
    primaryKey: "economy:workHub.card.mentor.primary",
    nextKey: "economy:workHub.card.mentor.next",
    nextValues: { count: openMentors },
    to: routes.mentorship,
  },
  {
    key: "skills",
    icon: <FiBookOpen />,
    labelKey: "economy:workHub.card.skills.label",
    primaryKey: "economy:workHub.card.skills.primary",
    nextKey: "economy:workHub.card.skills.next",
    to: routes.skills,
  },
  {
    key: "saved",
    icon: <FiBookmark />,
    labelKey: "economy:workHub.card.saved.label",
    primaryKey: "economy:workHub.card.saved.primary",
    nextKey: "economy:workHub.card.saved.next",
    to: routes.jobs,
  },
  {
    key: "grants",
    icon: <FiDollarSign />,
    labelKey: "economy:workHub.card.grants.label",
    primaryKey: "economy:workHub.card.grants.primary",
    nextKey: "economy:workHub.card.grants.next",
    nextValues: { fund: "Queer Creators Fund" },
    to: routes.grants,
  },
  {
    key: "reviews",
    icon: <FiStar />,
    labelKey: "economy:workHub.card.reviews.label",
    primaryKey: "economy:workHub.card.reviews.primary",
    nextKey: "economy:workHub.card.reviews.next",
    to: routes.employerReviews,
  },
];
