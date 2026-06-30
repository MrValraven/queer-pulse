export const GATHERING_DETAILS = [
  { label: "Date", value: "Saturday 21 June 2026" },
  { label: "Time", value: "11:00 – 14:00" },
  { label: "Venue", value: "A Cevicheria, Príncipe Real" },
  { label: "Capacity", value: "20 people" },
];

export const GATHERING_TITLE = "Pride Brunch — June Edition";

export const GATHERING_DESCRIPTION =
  "A slow, joyful Pride-week brunch for queer Lisbon. Good food, no agenda, no strangers for long. We'll have the terrace to ourselves from 11am. Bring your people, or come solo — you'll leave with new ones.";

export const ATTENDEE_COUNT = 14;

export const GOING_ATTENDEES = [
  {
    id: "going-sr",
    initials: "SR",
    bg: "rgba(74,140,111,.12)",
    color: "var(--jade)",
    name: "Sofia Rodrigues",
    meta: "she/her · RSVP'd 2 June",
  },
  {
    id: "going-ak",
    initials: "AK",
    bg: "rgba(232,119,90,.12)",
    color: "var(--accent-ink)",
    name: "Anika Kovač",
    meta: "she/they · RSVP'd 1 June",
  },
  {
    id: "going-jp",
    initials: "JP",
    bg: "rgba(45,27,61,.1)",
    color: "var(--plum)",
    name: "Jordan Park",
    meta: "they/them · RSVP'd 31 May",
  },
  {
    id: "going-tm",
    initials: "TM",
    bg: "rgba(74,140,111,.08)",
    color: "var(--jade)",
    name: "Tomás Mendes",
    meta: "he/him · RSVP'd 30 May",
  },
];

export const WAITLIST_ATTENDEES = [
  {
    id: "wait-nc",
    initials: "NC",
    bg: "rgba(45,27,61,.07)",
    color: "var(--plum)",
    name: "Nadia Castillo",
    meta: "she/her · On waitlist since 3 June · #1",
  },
  {
    id: "wait-kl",
    initials: "KL",
    bg: "rgba(74,140,111,.08)",
    color: "var(--jade)",
    name: "Kai Larsson",
    meta: "they/them · On waitlist since 4 June · #2",
  },
  {
    id: "wait-mf",
    initials: "MF",
    bg: "rgba(232,119,90,.08)",
    color: "var(--accent-ink)",
    name: "Maria Ferreira",
    meta: "she/her · On waitlist since 5 June · #3",
  },
];

export const PREVIOUS_MESSAGES = [
  {
    id: "msg-venue",
    subject: "Venue details confirmed",
    time: "3 days ago",
    preview:
      "We've confirmed the terrace at A Cevicheria. Entrance is on Rua Dom Pedro V. Look for the QueerPulse sign at the door…",
    opened: "11 / 14 opened",
  },
  {
    id: "msg-bring",
    subject: "What to bring",
    time: "1 day ago",
    preview:
      "Just yourselves — food and drinks are covered. We'll have a small quiet corner for anyone who needs a break from the crowd…",
    opened: "9 / 14 opened",
  },
];

export const GATHERING_SETTINGS = [
  {
    title: "Allow waitlist",
    desc: "Members can join a waitlist if the gathering is full",
    on: true,
  },
  {
    title: "Show attendee count publicly",
    desc: "Visitors can see how many people are going",
    on: true,
  },
  {
    title: "Allow questions from attendees",
    desc: "Guests can message you with questions before the event",
    on: false,
  },
  {
    title: "Require approval for RSVPs",
    desc: "You manually approve each RSVP before it's confirmed",
    on: false,
  },
];
