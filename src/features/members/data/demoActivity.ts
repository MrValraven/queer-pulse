import {
  FiBookOpen,
  FiCalendar,
  FiFileText,
  FiMessageCircle,
  FiMusic,
  FiUserPlus,
  FiUsers,
} from "react-icons/fi";
import { routes } from "../../../app/routeMap";
import type { ActivityItem } from "./members";

const HOUR_MS = 60 * 60 * 1000;

/** An ISO timestamp `days` (plus `hours`) before now, for demo "Recent
 *  activity" rows. Computed at load so the profile's period groups ("This
 *  week", "Earlier this month") stay populated whatever day the demo runs. */
export function activityDaysAgo(days: number, hours = 0): string {
  return new Date(Date.now() - (days * 24 + hours) * HOUR_MS).toISOString();
}

/**
 * The demo signed-in member's activity, shared by `MEMBERS.tiago`
 * (members.ts) and `demoCurrentUser.ts` so the two copies cannot drift. It
 * covers every action the live feed sends, enough rows to fold behind
 * "Show more", and one repeated persona row: the live feed has sent one row
 * per persona save, and the section folds repeats into the newest.
 */
export const TIAGO_ACTIVITY: ActivityItem[] = [
  {
    icon: FiUserPlus,
    title: "Published a persona: Backend developer",
    sub: null,
    to: null,
    occurredAt: activityDaysAgo(1, 3),
    action: "persona",
    subject: "Backend developer",
  },
  {
    icon: FiUsers,
    title: "Joined Non-Monogamy Network",
    sub: null,
    to: routes.communities,
    occurredAt: activityDaysAgo(2, 5),
    action: "join",
    subject: "Non-Monogamy Network",
  },
  {
    icon: FiCalendar,
    title: "RSVP'd to Queer Thursdays at Lux",
    sub: null,
    to: routes.events,
    occurredAt: activityDaysAgo(4),
    action: "rsvp",
    subject: "Queer Thursdays at Lux",
  },
  {
    icon: FiUserPlus,
    title: "Published a persona: Backend developer",
    sub: null,
    to: null,
    occurredAt: activityDaysAgo(6),
    action: "persona",
    subject: "Backend developer",
  },
  {
    icon: FiMessageCircle,
    title: "Started a thread: Self-hosting for community projects",
    sub: "Looking for folks who have run a small Postgres setup on a shoestring budget and lived to tell the tale",
    to: routes.forum,
    occurredAt: activityDaysAgo(9),
    action: "thread",
    subject: "Self-hosting for community projects",
  },
  {
    icon: FiFileText,
    title: "Posted in Queer Community Events",
    sub: "Next month's calendar is up, add yours before Friday",
    to: routes.communities,
    occurredAt: activityDaysAgo(12),
    action: "communityPost",
    subject: "Queer Community Events",
  },
  {
    icon: FiMusic,
    title: "DJ set as Hot Mess Express",
    sub: "Queer party · with Camila",
    to: routes.events,
    occurredAt: activityDaysAgo(16),
    action: null,
    subject: null,
  },
  {
    icon: FiCalendar,
    title: "Organised a community event",
    sub: "Queer + non-monogamy meetup",
    to: routes.events,
    occurredAt: activityDaysAgo(21),
    action: null,
    subject: null,
  },
  {
    icon: FiBookOpen,
    title: "Published in the Ofélia books",
    sub: "Four poems · 2024",
    to: routes.magazine,
    occurredAt: activityDaysAgo(40),
    action: null,
    subject: null,
  },
];
