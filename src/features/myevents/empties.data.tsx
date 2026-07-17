import type { ReactNode } from "react";
import { linkToPath } from "../../app/routeMap";

const GATHERING = linkToPath("QueerPulse Gathering.html");
const HOST = linkToPath("QueerPulse Host.html");

export interface EmptyAction {
  labelKey: string;
  variant: "primary" | "ghost";
  to?: string;
  /** in-page reset instead of navigation */
  reset?: "day" | "secondary";
}

export interface EmptyConfig {
  tone?: "jade" | "plum";
  icon: ReactNode;
  titleKey: string;
  subKey: string;
  actions: EmptyAction[];
}

/**
 * i18n Pattern A — every string here is platform chrome (empty-state copy for
 * the dashboard's own buckets), held as catalog keys and resolved by
 * `EmptyState.tsx` via `t()` / `<Translation>` (titles carry a coral `<em>`
 * run).
 */
export const EMPTIES: Record<string, EmptyConfig> = {
  upcoming: {
    icon: (
      <>
        <rect x="3" y="5" width="22" height="20" rx="4" />
        <line x1="3" y1="11" x2="25" y2="11" />
        <line x1="9" y1="2" x2="9" y2="7" />
        <line x1="19" y1="2" x2="19" y2="7" />
      </>
    ),
    titleKey: "myevents:empties.upcoming.title",
    subKey: "myevents:empties.upcoming.sub",
    actions: [
      {
        labelKey: "myevents:empties.upcoming.browseCta",
        variant: "primary",
        to: GATHERING,
      },
      {
        labelKey: "myevents:empties.upcoming.hostCta",
        variant: "ghost",
        to: HOST,
      },
    ],
  },
  going: {
    tone: "jade",
    icon: <path d="M5 14l6 6 12-13" />,
    titleKey: "myevents:empties.going.title",
    subKey: "myevents:empties.going.sub",
    actions: [
      {
        labelKey: "myevents:empties.going.cta",
        variant: "primary",
        to: GATHERING,
      },
    ],
  },
  hosting: {
    icon: (
      <>
        <circle cx="14" cy="9" r="5" />
        <path d="M4 24c0-5 4.5-8 10-8s10 3 10 8" />
      </>
    ),
    titleKey: "myevents:empties.hosting.title",
    subKey: "myevents:empties.hosting.sub",
    actions: [
      {
        labelKey: "myevents:empties.hosting.cta",
        variant: "primary",
        to: HOST,
      },
    ],
  },
  waitlisted: {
    icon: (
      <>
        <circle cx="14" cy="14" r="11" />
        <path d="M14 8v6l4 2" />
      </>
    ),
    titleKey: "myevents:empties.waitlisted.title",
    subKey: "myevents:empties.waitlisted.sub",
    actions: [
      {
        labelKey: "myevents:empties.waitlisted.cta",
        variant: "primary",
        to: GATHERING,
      },
    ],
  },
  past: {
    tone: "plum",
    icon: (
      <>
        <circle cx="14" cy="14" r="11" />
        <path d="M14 7v7l4 3" />
      </>
    ),
    titleKey: "myevents:empties.past.title",
    subKey: "myevents:empties.past.sub",
    actions: [
      {
        labelKey: "myevents:empties.past.cta",
        variant: "primary",
        to: GATHERING,
      },
    ],
  },
  saved: {
    icon: <path d="M7 4h14a1 1 0 0 1 1 1v19l-8-4.5L6 24V5a1 1 0 0 1 1-1Z" />,
    titleKey: "myevents:empties.saved.title",
    subKey: "myevents:empties.saved.sub",
    actions: [
      {
        labelKey: "myevents:empties.saved.cta",
        variant: "primary",
        to: GATHERING,
      },
    ],
  },
  day: {
    tone: "plum",
    icon: (
      <>
        <rect x="3" y="5" width="22" height="20" rx="4" />
        <line x1="3" y1="11" x2="25" y2="11" />
        <line x1="9" y1="2" x2="9" y2="7" />
        <line x1="19" y1="2" x2="19" y2="7" />
      </>
    ),
    titleKey: "myevents:empties.day.title",
    subKey: "myevents:empties.day.sub",
    actions: [
      { labelKey: "myevents:empties.day.cta", variant: "ghost", reset: "day" },
    ],
  },
  search: {
    tone: "plum",
    icon: (
      <>
        <circle cx="12" cy="12" r="8" />
        <path d="M18 18l6 6" />
      </>
    ),
    titleKey: "myevents:empties.search.title",
    subKey: "myevents:empties.search.sub",
    actions: [
      {
        labelKey: "myevents:empties.search.cta",
        variant: "ghost",
        reset: "secondary",
      },
    ],
  },
};
