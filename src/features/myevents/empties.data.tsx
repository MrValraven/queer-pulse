import type { ReactNode } from "react";
import { linkToPath } from "../../app/routeMap";

const GATHERING = linkToPath("QueerPulse Gathering.html");
const HOST = linkToPath("QueerPulse Host.html");

export interface EmptyAction {
  label: string;
  variant: "primary" | "ghost";
  to?: string;
  /** in-page reset instead of navigation */
  reset?: "day" | "secondary";
}

export interface EmptyConfig {
  tone?: "jade" | "plum";
  icon: ReactNode;
  title: ReactNode;
  sub: string;
  actions: EmptyAction[];
}

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
    title: (
      <>
        Nothing on the calendar <em>yet</em>
      </>
    ),
    sub: "When you say yes to a gathering or host one of your own, it'll land right here. There's always something on — have a look when you're ready.",
    actions: [
      { label: "Browse gatherings", variant: "primary", to: GATHERING },
      { label: "Host your own", variant: "ghost", to: HOST },
    ],
  },
  going: {
    tone: "jade",
    icon: <path d="M5 14l6 6 12-13" />,
    title: (
      <>
        No RSVPs <em>right now</em>
      </>
    ),
    sub: "You haven't said yes to anything coming up. Browse what's on — a film night, a picnic, a quiet book club — and say yes to one.",
    actions: [{ label: "See what's on", variant: "primary", to: GATHERING }],
  },
  hosting: {
    icon: (
      <>
        <circle cx="14" cy="9" r="5" />
        <path d="M4 24c0-5 4.5-8 10-8s10 3 10 8" />
      </>
    ),
    title: (
      <>
        You're not hosting <em>anything</em>
      </>
    ),
    sub: "The best gatherings start with one person deciding to make space. Yours could be a small dinner or a whole picnic — we'll help you run it.",
    actions: [{ label: "Create a gathering", variant: "primary", to: HOST }],
  },
  waitlisted: {
    icon: (
      <>
        <circle cx="14" cy="14" r="11" />
        <path d="M14 8v6l4 2" />
      </>
    ),
    title: (
      <>
        No waitlists <em>right now</em>
      </>
    ),
    sub: "When a gathering you want is full, join its waitlist and we'll keep your place — we'll let you know if a spot opens.",
    actions: [
      { label: "Browse gatherings", variant: "primary", to: GATHERING },
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
    title: (
      <>
        No history <em>here</em> — but you're early
      </>
    ),
    sub: "Once you've been to your first gathering, it'll live here as a quiet record of where you've been and who you met.",
    actions: [
      { label: "Find your first one", variant: "primary", to: GATHERING },
    ],
  },
  saved: {
    icon: <path d="M7 4h14a1 1 0 0 1 1 1v19l-8-4.5L6 24V5a1 1 0 0 1 1-1Z" />,
    title: (
      <>
        Nothing saved or <em>pending</em>
      </>
    ),
    sub: "Bookmark gatherings you're not sure about yet, and any invites from other members will wait for you here — no rush, no pressure.",
    actions: [
      { label: "Browse gatherings", variant: "primary", to: GATHERING },
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
    title: (
      <>
        Nothing on <em>this day</em>
      </>
    ),
    sub: "You've nothing planned here. Pick another day with a dot, or clear the filter to see everything coming up.",
    actions: [{ label: "Show everything", variant: "ghost", reset: "day" }],
  },
  search: {
    tone: "plum",
    icon: (
      <>
        <circle cx="12" cy="12" r="8" />
        <path d="M18 18l6 6" />
      </>
    ),
    title: (
      <>
        No events <em>match</em>
      </>
    ),
    sub: "Nothing here fits your search and filters right now. Try a different word, or loosen a filter.",
    actions: [
      { label: "Clear search & filters", variant: "ghost", reset: "secondary" },
    ],
  },
};
