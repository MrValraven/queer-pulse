import type { ReactNode } from "react";

/** Cover art for the tipped track (Unsplash). */
export const RECEIPT_COVER =
  "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=400&q=80&auto=format&fit=crop";

/** The two rows of the money-split breakdown (all pass-through to the artist). */
export interface SplitRow {
  dot: "jade" | "muted";
  muted?: boolean;
  name: ReactNode;
  sub: ReactNode;
  value: ReactNode;
  tip?: boolean;
  pct: string;
}

export const SPLIT_ROWS: SplitRow[] = [
  {
    dot: "jade",
    name: "Mariana Sol",
    sub: "Direct, SEPA · settles in 5 days",
    value: (
      <>
        €<em>2.00</em>
      </>
    ),
    tip: true,
    pct: "100%",
  },
  {
    dot: "muted",
    muted: true,
    name: "Platform · the room",
    sub: "Stripe processing fee absorbed by the co-op on tips.",
    value: "€0.00",
    pct: "0%",
  },
];

/** Definition rows in the receipt detail grid. */
export interface DetailRow {
  eb: string;
  value: ReactNode;
}

export const DETAIL_ROWS: DetailRow[] = [
  {
    eb: "Receipt no.",
    value: <code>QP-T-2026-06-09-4af7</code>,
  },
  {
    eb: "Date & time",
    value: "Wed 9 Jun 2026 · 21:24 Lisbon",
  },
  {
    eb: "From",
    value: "Rita Tavares · sustainer since Feb 2026",
  },
  {
    eb: "Method",
    value: (
      <>
        Saved card · ending 4242 · <em>chosen by default</em>
      </>
    ),
  },
  {
    eb: "Posted to ledger",
    value: "Mon 15 Jun · 12:00 Lisbon",
  },
  {
    eb: "Visibility",
    value: (
      <>
        Public · with your name · <em>change to anonymous</em>
      </>
    ),
  },
];

/** The note Rita left, plus Mariana's reply. */
export const NOTE = {
  quote: "earn it, mariana",
  reply: {
    avatar: "MS",
    who: (
      <>
        Mariana Sol · <em>replied</em>
      </>
    ),
    body: '"rita ily. and i\'m earning it. promise."',
    when: "22 minutes ago · still on air, two tracks later",
  },
};
