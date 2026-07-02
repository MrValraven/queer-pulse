import { type ReactNode } from "react";
import { FiHeart, FiPause, FiArrowDown } from "react-icons/fi";

export type Step = 1 | 2 | 3 | "done" | "paused" | "downshifted" | "solidarity";
export type Alt = "pause" | "downshift" | "solidarity";

export const ALT_CONFIRM = {
  pause: {
    eyebrow: "Pause · Sustainer",
    title: (
      <>
        Pause for <em>3 months?</em>
      </>
    ),
    body: (
      <>
        We'll freeze your renewal for <b>3 months</b>. You keep full access the
        whole time, and we won't charge you until you resume — you can undo it
        any time.
      </>
    ),
    confirmLabel: "Yes, pause it",
    icon: <FiPause />,
    tone: "jade",
    next: "paused",
  },
  downshift: {
    eyebrow: "Downshift to Member",
    title: (
      <>
        Switch to <em>Member?</em>
      </>
    ),
    body: (
      <>
        You'll move to <b>Member · €36/year</b>. You keep all community access,
        but Sustainer-only perks (Open Studio, ILGA consult, magazine) wind down
        at the end of your term. Upgrade back any time.
      </>
    ),
    confirmLabel: "Yes, switch to Member",
    icon: <FiArrowDown />,
    tone: "accent",
    next: "downshifted",
  },
  solidarity: {
    eyebrow: "Solidarity rate",
    title: (
      <>
        Drop to the <em>solidarity rate?</em>
      </>
    ),
    body: (
      <>
        You'll pay <b>€12/year</b>, no questions asked — the community fund
        covers the difference, genuinely. You keep <b>every Sustainer perk</b>{" "}
        exactly as it is now.
      </>
    ),
    confirmLabel: "Yes, drop to €12/year",
    icon: <FiHeart />,
    tone: "plum",
    next: "solidarity",
  },
} as const;

export const REASONS = [
  {
    id: "r1",
    label: (
      <>
        <b>Money is tight.</b> The price isn't right for me right now.
      </>
    ),
  },
  {
    id: "r2",
    label: (
      <>
        <b>I'm not using it enough.</b> Logging in less than I'd like.
      </>
    ),
  },
  {
    id: "r3",
    label: (
      <>
        <b>I'm leaving Lisbon</b> or no longer based here.
      </>
    ),
  },
  {
    id: "r4",
    label: (
      <>
        <b>Something happened on the platform</b> that I want to flag.
      </>
    ),
  },
  {
    id: "r5",
    label: (
      <>
        <b>I don't see the value</b> in the perks I'm paying for.
      </>
    ),
  },
  {
    id: "r6",
    label: (
      <>
        <b>Other / prefer not to say.</b>
      </>
    ),
  },
];

export const ENDS: { t: string; d: ReactNode }[] = [
  {
    t: "Sustainer-only Open Studio",
    d: "You'll lose your standing invite to the monthly sessions.",
  },
  {
    t: "Magazine subscription",
    d: "Quarterly print magazine stops shipping after the next issue.",
  },
  {
    t: "Free ILGA legal consult",
    d: "Your unused consult for this year expires when membership ends.",
  },
  {
    t: "Sustainer badge",
    d: (
      <>
        The little <FiHeart /> on your profile goes away.
      </>
    ),
  },
];

export const STAYS = [
  {
    t: "Your account & connections",
    d: "Profile, messages, connections, communities — all stay.",
  },
  { t: "Gatherings & communities", d: "You can still RSVP, attend, and host." },
  {
    t: "Wellbeing resources",
    d: "Crisis chat, directory, vetted therapists — open to everyone.",
  },
  { t: "Safe-spaces network", d: "The whole point of QueerPulse stays free." },
];
