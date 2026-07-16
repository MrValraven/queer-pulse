// i18n note: `name`/`pronouns` are each guest's own words and stay untranslated.
// `minutesAgo` / clock `Date`s / `waitlistPosition` are held as data so the
// component composes the chrome phrase via `t()` / `fmt` at render — see
// `dashboard.checkin.justNow`, `dashboard.waitlist.position` in the catalog.

export const RECENT = [
  {
    initials: "SR",
    bg: "rgba(74,140,111,.15)",
    color: "var(--jade)",
    name: "Sofia R.",
    minutesAgo: 0,
  },
  {
    initials: "AK",
    bg: "rgba(232,119,90,.12)",
    color: "var(--accent-ink)",
    name: "Anika K.",
    minutesAgo: 3,
  },
  {
    initials: "JP",
    bg: "rgba(45,27,61,.1)",
    color: "var(--plum)",
    name: "Jordan P.",
    minutesAgo: 7,
  },
  {
    initials: "TM",
    bg: "rgba(74,140,111,.08)",
    color: "var(--jade)",
    name: "Tomás M.",
    minutesAgo: 11,
  },
];

export interface Guest {
  initials: string;
  bg: string;
  color: string;
  name: string;
  pronouns: string;
  status: "in" | "pending";
  time?: Date;
}

/** Anchors the mock check-in clock times to the gathering's own morning. */
function checkInAt(hour: number, minute: number): Date {
  return new Date(2026, 5, 21, hour, minute);
}

export const INITIAL_GUESTS: Guest[] = [
  {
    initials: "SR",
    bg: "rgba(74,140,111,.12)",
    color: "var(--jade)",
    name: "Sofia Rodrigues",
    pronouns: "she/her",
    status: "in",
    time: checkInAt(11, 3),
  },
  {
    initials: "AK",
    bg: "rgba(232,119,90,.12)",
    color: "var(--accent-ink)",
    name: "Anika Kovač",
    pronouns: "she/they",
    status: "in",
    time: checkInAt(11, 7),
  },
  {
    initials: "JP",
    bg: "rgba(45,27,61,.1)",
    color: "var(--plum)",
    name: "Jordan Park",
    pronouns: "they/them",
    status: "in",
    time: checkInAt(11, 13),
  },
  {
    initials: "TM",
    bg: "rgba(74,140,111,.08)",
    color: "var(--jade)",
    name: "Tomás Mendes",
    pronouns: "he/him",
    status: "in",
    time: checkInAt(11, 19),
  },
  {
    initials: "MF",
    bg: "rgba(45,27,61,.07)",
    color: "var(--plum)",
    name: "Maria Ferreira",
    pronouns: "she/her",
    status: "in",
    time: checkInAt(11, 22),
  },
  {
    initials: "RL",
    bg: "rgba(232,119,90,.08)",
    color: "var(--accent-ink)",
    name: "Rosa Lima",
    pronouns: "she/her",
    status: "in",
    time: checkInAt(11, 28),
  },
  {
    initials: "BK",
    bg: "rgba(74,140,111,.1)",
    color: "var(--jade)",
    name: "Bilal Kaya",
    pronouns: "he/him",
    status: "in",
    time: checkInAt(11, 31),
  },
  {
    initials: "PO",
    bg: "rgba(45,27,61,.08)",
    color: "var(--plum)",
    name: "Priya Osei",
    pronouns: "she/they",
    status: "in",
    time: checkInAt(11, 38),
  },
  {
    initials: "CN",
    bg: "rgba(232,119,90,.1)",
    color: "var(--accent-ink)",
    name: "Carlos Neves",
    pronouns: "he/him",
    status: "in",
    time: checkInAt(11, 44),
  },
  {
    initials: "LM",
    bg: "rgba(45,27,61,.06)",
    color: "var(--ink-60)",
    name: "Lena Müller",
    pronouns: "she/her",
    status: "pending",
  },
  {
    initials: "XP",
    bg: "rgba(45,27,61,.06)",
    color: "var(--ink-60)",
    name: "Xabi Prieto",
    pronouns: "he/they",
    status: "pending",
  },
  {
    initials: "AS",
    bg: "rgba(45,27,61,.06)",
    color: "var(--ink-60)",
    name: "Amara Sow",
    pronouns: "she/her",
    status: "pending",
  },
  {
    initials: "DO",
    bg: "rgba(45,27,61,.06)",
    color: "var(--ink-60)",
    name: "Daniel Oliveira",
    pronouns: "he/him",
    status: "pending",
  },
  {
    initials: "IF",
    bg: "rgba(45,27,61,.06)",
    color: "var(--ink-60)",
    name: "Ines Fonseca",
    pronouns: "she/her",
    status: "pending",
  },
];

export const WAITLIST = [
  {
    initials: "NC",
    bg: "rgba(232,119,90,.08)",
    color: "var(--accent-ink)",
    name: "Nadia Castillo",
    pronouns: "she/her",
    waitlistPosition: 1,
  },
  {
    initials: "KL",
    bg: "rgba(74,140,111,.08)",
    color: "var(--jade)",
    name: "Kai Larsson",
    pronouns: "they/them",
    waitlistPosition: 2,
  },
];

/** The arrival-rate sparkline's x-axis ticks (all but the last, which is "now"). */
export const ARRIVAL_TICKS: Date[] = [
  checkInAt(11, 0),
  checkInAt(11, 15),
  checkInAt(11, 30),
  checkInAt(11, 45),
];

export const PEAK_ARRIVAL_START = checkInAt(11, 15);
export const PEAK_ARRIVAL_END = checkInAt(11, 30);

export function nowClock(): Date {
  return new Date();
}
