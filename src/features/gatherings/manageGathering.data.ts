/** How many people the demo prototype lets go. Seeds `GatheringState.capacity`
 *  and the "capacity" details row below, so the edit modal opens on the number
 *  the row shows. */
export const GATHERING_CAPACITY = 45;

// i18n note: `id` is a stable lookup key (never rendered); `labelKey` is the
// chrome field name shown beside it; `value` is the event-specific data a
// live fetch would return, so it stays a plain, untranslated string.
export const GATHERING_DETAILS = [
  {
    id: "date",
    labelKey: "gatherings:manage.details.date",
    value: "Sunday 21 June 2026",
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
    value: `${GATHERING_CAPACITY} people`,
  },
];

export const GATHERING_TITLE = "Pride Brunch: June Edition";

export const GATHERING_DESCRIPTION =
  "A slow, joyful Pride-week brunch for queer Lisbon. Good food, no agenda, no strangers for long. We'll have the terrace to ourselves from 11am, @tomas is on the eggs and the pastéis come from b/cafe-mouraria-velha. Bring your people, or come solo. You'll leave with new ones.";

export const ATTENDEE_COUNT = 14;

/** Static demo timestamp for the overview tab's "Last edited …" line. */
export const LAST_EDITED_AT = new Date(2026, 6, 14);

/** The demo gathering's day. `demoScheduleAt` (manageGatheringState.ts) sets
 *  the brunch's start and end hours on it, the times the "time" row prints. */
export const GATHERING_DATE = new Date(2026, 5, 21);

// i18n note: `pronouns` are each person's own words and stay untranslated;
// the RSVP/waitlist dates are held as `Date`s and composed into a meta line by
// `attendeeMeta()` in `api/events.adapters.ts`, so demo and live mode render
// the identical translated phrasing.

// A going row's `id` doubles as its member slug in demo (`mockRows()` in
// `api/useAttendees.ts`), so rows for registry members carry the registry
// slug and the invite picker can hide them.
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
    id: "anika",
    initials: "AK",
    background: "rgba(232,119,90,.12)",
    color: "var(--accent-ink)",
    name: "Anika Kovač",
    pronouns: "she/they",
    rsvpAt: new Date(2026, 5, 1),
  },
  {
    id: "jordan",
    initials: "JP",
    background: "rgba(var(--line-rgb),.1)",
    color: "var(--text-strong)",
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
    background: "rgba(var(--line-rgb),.07)",
    color: "var(--text-strong)",
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
// `showAttendeeCount`; see the `AddEventOptionsFlags` migration's doc). The
// mock originally had two more ("Allow questions", "Require approval") that
// persisted nothing and gated no real feature. There is no Q&A or
// RSVP-approval workflow anywhere in this app for either to control, so they
// were removed. A flag for either would still do nothing.
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
