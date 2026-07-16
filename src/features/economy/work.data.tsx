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
import { APPS } from "./applicationStatus.data";
import { MENTORS } from "./mentorship.data";

const activeApps = APPS.filter((a) => a.cat === "active").length;
const sentApps = APPS.filter((a) => a.cat !== "draft").length;
const offers = APPS.filter((a) => a.cat === "offer").length;
const openMentors = MENTORS.filter((m) => m.btn !== "Join waitlist").length;

/** A live one-line summary of where work stands, derived from the mock data. */
export const workStatusLine = `${activeApps} active application${activeApps === 1 ? "" : "s"} · ${
  offers ? `${offers} offer to respond to` : "no offers yet"
} · 2 mentor threads`;

export interface NextAction {
  id: string;
  icon: ReactNode;
  label: string;
  context: string;
  /** Short urgency chip, e.g. "Closes in 3 days". */
  urgency?: string;
  /** When true the chip + row read as urgent (coral). */
  urgent?: boolean;
  to: string;
  cta: string;
}

/** Cross-silo "what needs you" list — the spine's prioritised next actions. */
export const NEXT_ACTIONS: NextAction[] = [
  {
    id: "offer",
    icon: <FiClock />,
    label: "Respond to your offer from Casa Viva",
    context: "They’re waiting on your decision.",
    urgency: "Closes in 3 days",
    urgent: true,
    to: routes.applicationStatus,
    cta: "Review offer",
  },
  {
    id: "mentor",
    icon: <FiMessageCircle />,
    label: "Inês replied about your mentor match",
    context: "A first intro call is on the table.",
    to: routes.mentorship,
    cta: "Read reply",
  },
  {
    id: "grant",
    icon: <FiDollarSign />,
    label: "Micro-grant deadline this Friday",
    context: "Queer Creators Fund · up to €500.",
    urgency: "Due Fri",
    to: routes.grants,
    cta: "See grant",
  },
  {
    id: "profile",
    icon: <FiStar />,
    label: "Your work profile is 70% complete",
    context: "Add your out-at-work preference to be matched safely.",
    to: routes.workProfile,
    cta: "Finish profile",
  },
];

export interface StatusCard {
  key: string;
  icon: ReactNode;
  label: string;
  primary: string;
  next: string;
  to: string;
}

/** One card per Work-section silo, summarising state + a deep link. */
export const STATUS_CARDS: StatusCard[] = [
  {
    key: "apps",
    icon: <FiBriefcase />,
    label: "Applications",
    primary: `${activeApps} active / ${sentApps} sent`,
    next: offers ? `${offers} offer to respond to` : "No offers yet",
    to: routes.applicationStatus,
  },
  {
    key: "mentor",
    icon: <FiAward />,
    label: "Mentorship",
    primary: "1 active mentorship",
    next: `${openMentors} mentors with open spots`,
    to: routes.mentorship,
  },
  {
    key: "skills",
    icon: <FiBookOpen />,
    label: "Skills exchange",
    primary: "Teaching 2 · Learning 1",
    next: "A new request matches you",
    to: routes.skills,
  },
  {
    key: "saved",
    icon: <FiBookmark />,
    label: "Saved roles",
    primary: "5 saved jobs",
    next: "2 closing this week",
    to: routes.jobs,
  },
  {
    key: "grants",
    icon: <FiDollarSign />,
    label: "Grants & funding",
    primary: "2 deadlines this month",
    next: "Queer Creators Fund opens soon",
    to: routes.grants,
  },
  {
    key: "reviews",
    icon: <FiStar />,
    label: "Employer reviews",
    primary: "You’ve reviewed 2",
    next: "1 draft to finish",
    to: routes.employerReviews,
  },
];
