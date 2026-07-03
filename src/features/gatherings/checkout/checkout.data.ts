/* Static config + copy for the checkout flow.
   Mirrors the design's pricing model, seat map, and confirmation content. */

export type TierId = "solidarity" | "standard" | "supporter";

export interface Tier {
  id: TierId;
  name: string;
  price: number;
  desc: string;
  tag?: string;
}

export const TIERS: Tier[] = [
  {
    id: "solidarity",
    name: "Solidarity",
    price: 6,
    desc: "If money's tight right now. No questions, no proof — same seat, same welcome.",
  },
  {
    id: "standard",
    name: "Standard",
    price: 12,
    desc: "Covers your meal, ingredients, and the host's time.",
    tag: "Most pick this",
  },
  {
    id: "supporter",
    name: "Supporter",
    price: 18,
    desc: "Pays it forward — you quietly cover a solidarity seat for someone else.",
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

export const FIRST_TIMER_STEPS = [
  {
    n: "01",
    title: "You arrive",
    body: "Doors at 7:30. Come as you are — no dress code, no small-talk pressure.",
  },
  {
    n: "02",
    title: "We share a meal",
    body: "A home-cooked dinner around one table, eight of us, three unhurried hours.",
  },
  {
    n: "03",
    title: "You leave full",
    body: "Of food, and usually a few new numbers in your phone. Leave whenever you like.",
  },
];

export const COC_LIST = [
  "Consent first — ask before photos, and take a no gracefully.",
  "What's shared at the table stays at the table.",
  "Respect names and pronouns, always.",
  "If something feels off, tell the host — we've got you.",
];

export const TIMELINE = [
  {
    when: "Right now",
    title: "Ticket in your inbox",
    body: "Your confirmation and QR ticket are already on their way.",
    future: false,
  },
  {
    when: "28 June · 10:00 AM",
    title: "The address unlocks",
    body: "Exact door, buzzer code and directions to Mouraria arrive the morning of.",
    future: true,
  },
  {
    when: "28 June · 7:30 PM",
    title: "You arrive & we eat",
    body: "Come as you are. Tomás handles the rest — three unhurried hours together.",
    future: true,
  },
];

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
