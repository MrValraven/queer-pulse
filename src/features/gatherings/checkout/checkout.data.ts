import type { TFunction } from "../../../shared/i18n/types";
import type { Formatters } from "../../../shared/i18n/format";

/* Static config + copy for the checkout flow.
   Mirrors the design's pricing model, seat map, and confirmation content. */

export type TierId = "solidarity" | "standard" | "supporter";

/**
 * i18n Pattern A. `name`/`desc`/`tag` stay as plain English strings too —
 * CheckoutSidebar.tsx, CheckoutMobileBar.tsx and PriceSummary.tsx (outside this
 * slice) still read `.name` directly, so the key fields are additive rather
 * than a breaking rename. `TierSelect.tsx` (this slice) reads the `*Key`
 * fields through `t()`. `price` stays a number, formatted with
 * `useFormat().currency()` at render.
 */
export interface Tier {
  id: TierId;
  name: string;
  nameKey: string;
  price: number;
  desc: string;
  descKey: string;
  tag?: string;
  tagKey?: string;
}

export const TIERS: Tier[] = [
  {
    id: "solidarity",
    name: "Solidarity",
    nameKey: "gatherings:checkout.tiers.solidarity.name",
    price: 6,
    desc: "If money's tight right now. No questions, no proof — same seat, same welcome.",
    descKey: "gatherings:checkout.tiers.solidarity.desc",
  },
  {
    id: "standard",
    name: "Standard",
    nameKey: "gatherings:checkout.tiers.standard.name",
    price: 12,
    desc: "Covers your meal, ingredients, and the host's time.",
    descKey: "gatherings:checkout.tiers.standard.desc",
    tag: "Most pick this",
    tagKey: "gatherings:checkout.tiers.standard.tag",
  },
  {
    id: "supporter",
    name: "Supporter",
    nameKey: "gatherings:checkout.tiers.supporter.name",
    price: 18,
    desc: "Pays it forward — you quietly cover a solidarity seat for someone else.",
    descKey: "gatherings:checkout.tiers.supporter.desc",
  },
];

export const TIER_MAP: Record<TierId, Tier> = TIERS.reduce(
  (acc, t) => ({ ...acc, [t.id]: t }),
  {} as Record<TierId, Tier>,
);

export const MEMBER_RATE = 0.1; // 10% member discount
export const PROMO_RATE = 0.05; // extra 5% for a valid promo
export const VALID_PROMOS = ["COMMUNITY", "QP2026"];
export const MAX_SEATS = 2; // only 2 seats open at this supper
export const HOLD_SECONDS = 10 * 60;
export const STORE_KEY = "qp-checkout-v3";
export const DECLINE_CARD = "4000000000000002";

export const EVENT = {
  title: "Queer Supper Club #13",
  icon: "SC",
  dateLong: "Saturday 28 June 2026 · 7:30 PM",
  dateShort: "Sat 28 Jun · 7:30 PM · Mouraria",
  neighbourhood: "Mouraria (exact address shared on the day)",
  hostName: "Tomás Beto",
  hostInitials: "TB",
  seatsTotal: 9,
};

/**
 * Real `Date`s for the two moments the checkout copy talks about, so any new
 * chrome sentence can go through `useFormat()` instead of baking a string —
 * `EVENT.dateLong`/`dateShort` above stay as-is (untouched, cross-slice
 * fields consumed by CheckoutSidebar.tsx outside this slice).
 */
export const EVENT_ARRIVAL_DATE = new Date(2026, 5, 28, 19, 30);
export const ADDRESS_UNLOCK_DATE = new Date(2026, 5, 28, 10, 0);

export interface Seat {
  x: number;
  y: number;
  role: "guest" | "open" | "host";
  name?: string;
  pron?: string;
  init?: string;
  tint?: "jade" | "coral" | "plum";
  intro?: string;
  interests?: string[];
  connection?: string;
  joinedAgo?: string;
}

export const SEATS: Seat[] = [
  // top long side, left → right
  {
    x: 30,
    y: 12,
    role: "guest",
    name: "Mariana",
    pron: "she/her",
    init: "M",
    tint: "jade",
    intro:
      "Runs a queer ceramics studio in Marvila. Might teach you to centre clay by dessert.",
    interests: ["Ceramics", "Slow food"],
    connection: "Vouched by Tomás",
  },
  {
    x: 50,
    y: 9,
    role: "guest",
    name: "Kai",
    pron: "they/them",
    init: "K",
    tint: "coral",
    intro: "Sound designer. Always arrives with the night's best playlist.",
    interests: ["Music", "Film"],
    connection: "Regular — 6th supper",
  },
  {
    x: 70,
    y: 12,
    role: "guest",
    name: "Rui",
    pron: "he/him",
    init: "R",
    tint: "plum",
    intro: "Nurse and balcony gardener. Keeper of the spice drawer.",
    interests: ["Gardening", "Baking"],
    connection: "Friend of Noor",
  },
  // right short end — head of the table
  {
    x: 91,
    y: 50,
    role: "host",
    name: "Tomás",
    pron: "he/him",
    init: "TB",
    intro:
      "Your host. Cooks Goan-Portuguese and tells the long version of every story.",
    interests: ["Cooking", "Fado"],
    connection: "Hosts this table",
  },
  // bottom long side, right → left (open settings)
  { x: 70, y: 88, role: "open" },
  { x: 50, y: 91, role: "open" },
  { x: 30, y: 88, role: "open" },
  // left short end
  {
    x: 9,
    y: 68,
    role: "guest",
    name: "Noor",
    pron: "she/they",
    init: "N",
    tint: "jade",
    intro: "Poet and night-shift baker. Quietly the funniest person here.",
    interests: ["Poetry", "Tea"],
    connection: "First supper",
    joinedAgo: "Just joined",
  },
  {
    x: 9,
    y: 32,
    role: "guest",
    name: "Bea",
    pron: "she/her",
    init: "B",
    tint: "coral",
    intro:
      "Illustrator. Draws everyone at the table by the time dessert lands.",
    interests: ["Drawing", "Wine"],
    connection: "Regular — 4th supper",
  },
];

/** SEATS indices that are choosable open settings, in preferred fill order. */
export const OPEN_SEAT_INDICES: number[] = SEATS.reduce<number[]>(
  (acc, seat, i) => (seat.role === "open" ? [...acc, i] : acc),
  [],
);

/** SEATS indices in clockwise ring order (used to find seat neighbours). */
export const RING_ORDER: number[] = SEATS.map((_, i) => i);

/**
 * Return exactly `qty` valid, de-duped open-seat indices for the buyer's party.
 * Keeps the user's existing picks, then pads from OPEN_SEAT_INDICES in order.
 * Guards persisted/stale shapes so the card is never in a broken state.
 */
export function normalizeSeatPick(pick: number[], qty: number): number[] {
  const wanted = Math.max(1, Math.min(qty, OPEN_SEAT_INDICES.length));
  const valid = (Array.isArray(pick) ? pick : []).filter(
    (i, n, arr) => OPEN_SEAT_INDICES.includes(i) && arr.indexOf(i) === n,
  );
  const result = valid.slice(0, wanted);
  for (const i of OPEN_SEAT_INDICES) {
    if (result.length >= wanted) break;
    if (!result.includes(i)) result.push(i);
  }
  return result;
}

export const PRON_OPTIONS = [
  "she/her",
  "he/him",
  "they/them",
  "she/they",
  "ze/zir",
  "prefer not to say",
];

/**
 * i18n Pattern A. `titleKey`/`bodyKey` are chrome (platform-authored onboarding
 * copy) resolved by `FirstTimerCard.tsx`, the sole consumer. `n` is a decorative
 * step numeral, not language content. Step 1's body carries a `{time}` token —
 * `FirstTimerCard.tsx` fills it from `EVENT_ARRIVAL_DATE` via `useFormat()`
 * instead of baking "7:30" into the string.
 */
export interface FirstTimerStep {
  n: string;
  titleKey: string;
  bodyKey: string;
}

export const FIRST_TIMER_STEPS: FirstTimerStep[] = [
  {
    n: "01",
    titleKey: "gatherings:checkout.firstTimer.step1.title",
    bodyKey: "gatherings:checkout.firstTimer.step1.body",
  },
  {
    n: "02",
    titleKey: "gatherings:checkout.firstTimer.step2.title",
    bodyKey: "gatherings:checkout.firstTimer.step2.body",
  },
  {
    n: "03",
    titleKey: "gatherings:checkout.firstTimer.step3.title",
    bodyKey: "gatherings:checkout.firstTimer.step3.body",
  },
];

/** i18n Pattern A — chrome list, sole consumer is `CodeOfCare.tsx`. */
export const COC_KEYS = [
  "gatherings:checkout.coc.item1",
  "gatherings:checkout.coc.item2",
  "gatherings:checkout.coc.item3",
  "gatherings:checkout.coc.item4",
];

export interface TimelineItem {
  key: string;
  when: string;
  title: string;
  body: string;
  future: boolean;
}

/**
 * i18n Pattern B. The "when" column mixes a real date/time (needs
 * `useFormat()` for PT's 24h clock) with a special "right now" case that isn't
 * a date at all, so the raw source lives here and `ConfirmationNext.tsx`
 * memoizes `buildTimeline(t, fmt)`. `Mouraria` and `EVENT.hostName` are fused
 * content inside otherwise-chrome sentences, so they're passed as
 * interpolation values rather than baked into the catalog string.
 */
const TIMELINE_SOURCE: {
  date: Date | null;
  titleKey: string;
  bodyKey: string;
  future: boolean;
}[] = [
  {
    date: null,
    titleKey: "gatherings:checkout.timeline.ticket.title",
    bodyKey: "gatherings:checkout.timeline.ticket.body",
    future: false,
  },
  {
    date: ADDRESS_UNLOCK_DATE,
    titleKey: "gatherings:checkout.timeline.address.title",
    bodyKey: "gatherings:checkout.timeline.address.body",
    future: true,
  },
  {
    date: EVENT_ARRIVAL_DATE,
    titleKey: "gatherings:checkout.timeline.arrive.title",
    bodyKey: "gatherings:checkout.timeline.arrive.body",
    future: true,
  },
];

export function buildTimeline(t: TFunction, fmt: Formatters): TimelineItem[] {
  return TIMELINE_SOURCE.map((item, index) => ({
    key: String(index),
    when: item.date
      ? `${fmt.date(item.date, { day: "numeric", month: "long" })} · ${fmt.time(item.date)}`
      : t("gatherings:checkout.timeline.now"),
    title: t(item.titleKey),
    body: t(item.bodyKey, {
      neighbourhood: "Mouraria",
      host: EVENT.hostName.split(" ")[0] ?? EVENT.hostName,
    }),
    future: item.future,
  }));
}

export const BILLING_COUNTRIES = [
  { value: "PT", label: "Portugal" },
  { value: "ES", label: "Spain" },
  { value: "FR", label: "France" },
  { value: "DE", label: "Germany" },
  { value: "IT", label: "Italy" },
  { value: "NL", label: "Netherlands" },
  { value: "IE", label: "Ireland" },
  { value: "GB", label: "United Kingdom" },
  { value: "US", label: "United States" },
  { value: "OTHER", label: "Somewhere else" },
];
