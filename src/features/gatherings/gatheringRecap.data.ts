/**
 * The one recap event this page renders. Attendee counts and the two dates
 * are held as real data (not baked English strings) so the page can format
 * them through `useFormat()` and pluralize the attendee copy through `t()`.
 * Host name, venue, and the write-up body are organizer-authored content and
 * stay as literals in the components — in live mode they'd arrive from the
 * recap fetch itself, so they're never translated.
 */
export const RECAP_ATTENDED_COUNT = 38;
export const RECAP_MORE_ATTENDED_COUNT = 30;
export const RECAP_EVENT_DATE = new Date(2026, 5, 21);
export const RECAP_NEXT_EVENT_DATE = new Date(2026, 6, 19);

/** This gathering's own name/venue/host — content, held as named constants
 *  (not inline JSX literals) so the components read them as expressions. */
export const RECAP_EVENT_TITLE = "Pride Brunch";
export const RECAP_EVENT_SUBTITLE = "June Edition";
export const RECAP_VENUE = "Príncipe Real, Lisbon";
export const RECAP_SIDEBAR_VENUE = "A Cevicheria";
export const RECAP_HOST_NAME = "Sofia Rodrigues";
export const RECAP_NEXT_EVENT_TITLE = "Queer Book Club: July";
export const RECAP_NEXT_EVENT_VENUE = "LX Factory";

/**
 * The recap write-up itself — staff-authored prose about this specific
 * gathering. In live mode it's the recap document's body text (analogous to
 * `gatheringDetails[].body`), so it stays in English; held as an array of
 * paragraphs (not inline JSX literals) so the component renders each as an
 * expression.
 */
export const RECAP_WRITEUP: string[] = [
  "We took over the terrace at A Cevicheria on a warm Saturday morning, and for three hours it became ours: a little corner of Príncipe Real that felt genuinely, unmistakably queer. Thirty-eight people came. Some knew each other; most didn't, at least not yet. By noon, you wouldn't have known the difference.",
  'There was a long table of food that kept getting replenished. There were conversations that started with "how do you know the host?" and turned into something else entirely: plans, collaborations, phone numbers exchanged. Two people who\'d been connected on QueerPulse for months finally met in person.',
  "These gatherings don't have agendas. They're just time, held deliberately, for people like us to be in a room together. This one was a good one. We'll do it again in July.",
];

export interface RecapDayPhoto {
  tint: "coral" | "jade" | "plum";
  image?: string;
}

export interface RecapAttendee {
  initials: string;
  tint: "coral" | "jade" | "plum";
  name: string;
  pronouns: string;
}

export const RECAP_ATTENDEES: RecapAttendee[] = [
  { initials: "SR", tint: "jade", name: "Sofia R.", pronouns: "she/her" },
  { initials: "AK", tint: "coral", name: "Anika K.", pronouns: "she/they" },
  { initials: "JP", tint: "plum", name: "Jordan P.", pronouns: "they/them" },
  { initials: "TM", tint: "jade", name: "Tomás M.", pronouns: "he/him" },
  { initials: "MF", tint: "coral", name: "Maria F.", pronouns: "she/her" },
  { initials: "KL", tint: "plum", name: "Kai L.", pronouns: "they/them" },
  { initials: "BK", tint: "jade", name: "Bilal K.", pronouns: "he/him" },
  { initials: "NC", tint: "coral", name: "Nadia C.", pronouns: "she/her" },
];

export const RECAP_PHOTOS: RecapDayPhoto[] = [
  {
    tint: "coral",
    image:
      "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?q=80&w=1000&auto=format&fit=crop",
  },
  {
    tint: "jade",
    image:
      "https://images.unsplash.com/photo-1719590839309-5dbf71989e8d?q=80&w=800&auto=format&fit=crop",
  },
  {
    tint: "plum",
    image:
      "https://images.unsplash.com/photo-1720524119990-97c506ee1246?q=80&w=800&auto=format&fit=crop",
  },
  {
    tint: "coral",
    image:
      "https://images.unsplash.com/photo-1720741741673-ce5c7a2c2fb2?q=80&w=800&auto=format&fit=crop",
  },
  {
    tint: "jade",
    image:
      "https://images.unsplash.com/photo-1723199686044-32743f788589?q=80&w=800&auto=format&fit=crop",
  },
  {
    tint: "plum",
    image:
      "https://images.unsplash.com/photo-1731174218715-9b4d23795265?q=80&w=800&auto=format&fit=crop",
  },
];
