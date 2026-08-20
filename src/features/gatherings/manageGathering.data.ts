// i18n note: `id` is a stable lookup key (never rendered); `labelKey` is the
// chrome field name shown beside it; `value` is the event-specific data a
// live fetch would return, so it stays a plain string, never translated.
export const GATHERING_DETAILS = [
  {
    id: "date",
    labelKey: "gatherings:manage.details.date",
    value: "Saturday 21 June 2026",
  },
  {
    id: "time",
    labelKey: "gatherings:manage.details.time",
    value: "11:00 – 14:00",
  },
  {
    id: "venue",
    labelKey: "gatherings:manage.details.venue",
    value: "A Cevicheria, Príncipe Real",
  },
  {
    id: "capacity",
    labelKey: "gatherings:manage.details.capacity",
    value: "20 people",
  },
];

export const GATHERING_TITLE = "Pride Brunch: June Edition";

export const GATHERING_DESCRIPTION =
  "A slow, joyful Pride-week brunch for queer Lisbon. Good food, no agenda, no strangers for long. We'll have the terrace to ourselves from 11am. Bring your people, or come solo. You'll leave with new ones.";

export const ATTENDEE_COUNT = 14;

/** Static demo timestamp for the overview tab's "Last edited …" line. */
export const LAST_EDITED_AT = new Date(2026, 6, 14);

/** The gathering's date, for the sidebar's `fmt.date()`-formatted summary. */
export const GATHERING_DATE = new Date(2026, 5, 21);

// i18n note: `pronouns` are each person's own words and stay untranslated;
// the RSVP/waitlist dates are held as `Date`s and composed into a meta line by
// `attendeeMeta()` in `api/events.adapters.ts`, so demo and live mode render
// the identical translated phrasing.

export const GOING_ATTENDEES = [
  {
    id: "going-sr",
    initials: "SR",
    background: "rgba(74,140,111,.12)",
    color: "var(--jade)",
    name: "Sofia Rodrigues",
    pronouns: "she/her",
    rsvpAt: new Date(2026, 5, 2),
  },
  {
    id: "going-ak",
    initials: "AK",
    background: "rgba(232,119,90,.12)",
    color: "var(--accent-ink)",
    name: "Anika Kovač",
    pronouns: "she/they",
    rsvpAt: new Date(2026, 5, 1),
  },
  {
    id: "going-jp",
    initials: "JP",
    background: "rgba(45,27,61,.1)",
    color: "var(--plum)",
    name: "Jordan Park",
    pronouns: "they/them",
    rsvpAt: new Date(2026, 4, 31),
  },
  {
    id: "going-tm",
    initials: "TM",
    background: "rgba(74,140,111,.08)",
    color: "var(--jade)",
    name: "Tomás Mendes",
    pronouns: "he/him",
    rsvpAt: new Date(2026, 4, 30),
  },
];

export const WAITLIST_ATTENDEES = [
  {
    id: "wait-nc",
    initials: "NC",
    background: "rgba(45,27,61,.07)",
    color: "var(--plum)",
    name: "Nadia Castillo",
    pronouns: "she/her",
    waitlistedAt: new Date(2026, 5, 3),
    waitlistPosition: 1,
  },
  {
    id: "wait-kl",
    initials: "KL",
    background: "rgba(74,140,111,.08)",
    color: "var(--jade)",
    name: "Kai Larsson",
    pronouns: "they/them",
    waitlistedAt: new Date(2026, 5, 4),
    waitlistPosition: 2,
  },
  {
    id: "wait-mf",
    initials: "MF",
    background: "rgba(232,119,90,.08)",
    color: "var(--accent-ink)",
    name: "Maria Ferreira",
    pronouns: "she/her",
    waitlistedAt: new Date(2026, 5, 5),
    waitlistPosition: 3,
  },
];

// i18n note: `subject`/`preview` are the host's own words and stay untranslated.
// `sentAt` is a real `Date` (formatted via `fmt.relativeTime` at render);
// `openedCount` pairs with `ATTENDEE_COUNT` through the
// `manage.messages.openedOf` "{opened} / {total} opened" template.
export const PREVIOUS_MESSAGES = [
  {
    id: "msg-venue",
    subject: "Venue details confirmed",
    sentAt: new Date(2026, 6, 13),
    preview:
      "We've confirmed the terrace at A Cevicheria. Entrance is on Rua Dom Pedro V. Look for the QueerPulse sign at the door…",
    openedCount: 11,
  },
  {
    id: "msg-bring",
    subject: "What to bring",
    sentAt: new Date(2026, 6, 15),
    preview:
      "Just yourselves. Food and drinks are covered. We'll have a small quiet corner for anyone who needs a break from the crowd…",
    openedCount: 9,
  },
];

// i18n note: `id` is a stable lookup key for toggle state (never rendered);
// `titleKey`/`descriptionKey` are the chrome copy shown per row.
//
// Only these two have a real backend effect (`Event.allowWaitlist`/
// `showAttendeeCount` — see the `AddEventOptionsFlags` migration's doc). The
// mock originally had two more ("Allow questions", "Require approval") that
// persisted nothing and gated no real feature — there is no Q&A or
// RSVP-approval workflow anywhere in this app for either to control, so they
// were removed rather than wired to a flag that would still do nothing.
// `on` seeds the DEMO prototype's starting state only; live reads/writes the
// real event field (see `SettingsTab`).
export const GATHERING_SETTINGS = [
  {
    id: "allowWaitlist",
    titleKey: "gatherings:manage.settings.allowWaitlist.title",
    descriptionKey: "gatherings:manage.settings.allowWaitlist.desc",
    on: true,
  },
  {
    id: "showAttendeeCount",
    titleKey: "gatherings:manage.settings.showAttendeeCount.title",
    descriptionKey: "gatherings:manage.settings.showAttendeeCount.desc",
    on: true,
  },
] as const;
