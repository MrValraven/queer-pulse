import type { ReactNode } from "react";
import type { SpotsLabel } from "./data";

/** The cancelling host's name — organizer-authored content. */
export const HOST_NAME = "Marta";
export const HOST_LAST_NAME = "Reis";
export const CANCELLED_HOURS_AGO = 4;
export const EVENT_START = new Date(2026, 5, 20, 14, 0);
export const EVENT_END = new Date(2026, 5, 20, 17, 0);
export const RESCHEDULE_DATE = new Date(2026, 6, 19);
export const REFUND_PRICE_EUR = 5;

/**
 * This cancellation's own narrative — organizer-authored content (like a
 * gathering's `body`), left in English and held as constants rather than
 * inline JSX text so it has a single source and doesn't trip the lint rule
 * that guards un-keyed chrome.
 */
export const CANCELLATION_REASON = "Host illness · cancelled ";
export const EVENT_VENUE_LINE = "Largo do Carmo · Lisbon";
export const EXPLAINER_P1 =
  "Marta is out sick. She dropped us a message yesterday and we waited 24h hoping a co-host could step in. ";
export const EXPLAINER_EM = "Nobody available this week.";
export const EXPLAINER_P2 =
  " We're not rescheduling immediately because the studio's painting work starts Monday, but the next visit is already on the calendar for ";
export const EXPLAINER_DATE_TEXT = "19 July";
export const REFUND_NOTE =
  "Refunded to Visa ending 4729 within 3–5 business days.";
export const NOTE_QUOTE_P1 = "\"I'm so sorry, especially to the three of you";
export const NOTE_QUOTE_EM = "who travelled in.";
export const NOTE_P1 =
  "It's a chest cold and not anything dramatic, but I lose my voice the moment I try to talk for more than ten minutes, and a studio visit where I can't talk is just a tour.";
export const NOTE_P2 =
  "July 19 will happen. The painting is done by then and we'll have the new riso press set up. Promise.";

/** The alternative gatherings offered in place of the cancelled one — the
 *  titles carry an italic emphasis so this is organizer-authored JSX content. */
export const ALTS: {
  primary: boolean;
  date: Date;
  title: ReactNode;
  venue: string;
  time: Date;
  note: string;
  spots: SpotsLabel;
}[] = [
  {
    primary: true,
    date: RESCHEDULE_DATE,
    title: (
      <>
        {"Studio visit · "}
        <em>{"Atelier Pulso · July"}</em>
      </>
    ),
    venue: "Largo do Carmo",
    time: new Date(2026, 6, 19, 14, 0),
    note: "same host · new press!",
    spots: { key: "gatherings:cancelled.altRsvpsOpen" },
  },
  {
    primary: false,
    date: new Date(2026, 5, 22),
    title: (
      <>
        {"Sunday risograph workshop · "}
        <em>{"Bairro Alto"}</em>
      </>
    ),
    venue: "Editora Anjos",
    time: new Date(2026, 5, 22, 11, 0),
    note: "open to 8 people",
    spots: { key: "gatherings:spots.spotsLeft", values: { count: 3 } },
  },
  {
    primary: false,
    date: new Date(2026, 5, 28),
    title: (
      <>
        {"Portfolio night · "}
        <em>{"creatives only"}</em>
      </>
    ),
    venue: "Café Beirão back room",
    time: new Date(2026, 5, 28, 18, 0),
    note: "informal",
    spots: { key: "gatherings:spots.spotsLeft", values: { count: 11 } },
  },
];
