import type { Recommendation, Prefs, Pill } from "./myEvents.types";

/** Pill buckets, in display order. */
export const PILLS: Pill[] = [
  "upcoming",
  "going",
  "hosting",
  "waitlisted",
  "past",
  "saved",
];

/** Mock "now" — the prototype is anchored to Mon 29 Jun 2026, 16:30. */
export const TODAY = new Date(2026, 5, 29);
TODAY.setHours(0, 0, 0, 0);
export const NOW = new Date(2026, 5, 29, 16, 30);

export const MON = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
export const MONFULL = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
export const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const DOWFULL = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

/** Avatar tint inline-styles, keyed by tint name. */
export const TINT_STYLE: Record<string, { background: string; color: string }> =
  {
    coral: {
      background: "rgba(var(--accent-rgb),.18)",
      color: "var(--accent-ink)",
    },
    jade: { background: "rgba(var(--jade-rgb),.18)", color: "var(--jade)" },
    plum: { background: "rgba(var(--plum-rgb),.1)", color: "var(--plum)" },
  };

/**
 * Access / safety chip labels — i18n Pattern A. Chrome (a fixed taxonomy of
 * access flags), resolved by `EventCardExtras.tsx`'s `AccessRow` via `t()`.
 */
export const ACCESS_LABEL_KEYS: Record<string, string> = {
  sober: "myevents:access.label.sober",
  stepfree: "myevents:access.label.stepfree",
  quiet: "myevents:access.label.quiet",
  interpret: "myevents:access.label.interpret",
  bsl: "myevents:access.label.bsl",
  masks: "myevents:access.label.masks",
};

export const DEFAULT_PREFS: Prefs = {
  reminderLead: "1 day",
  visibility: "connections",
  email: true,
  push: true,
};


export const RECOMMENDATIONS: Recommendation[] = [
  {
    id: "rec1",
    title: "Reading Group #9 — “Giovanni’s Room”",
    date: "Tue 28 Jul · 19:00",
    venue: "Mouraria Community Centre",
    reason: "Because you went to Reading Group #8",
  },
  {
    id: "rec2",
    title: "Trans Masc Brunch",
    date: "Sun 13 Jul · 11:30",
    venue: "Café Janis, Cais do Sodré",
    reason: "Popular in Trans Lisbon, a circle you’re in",
  },
  {
    id: "rec3",
    title: "Queer Swimming Social",
    date: "Sat 19 Jul · 10:00",
    venue: "Oeiras beach",
    reason: "3 of your connections are going",
  },
];

