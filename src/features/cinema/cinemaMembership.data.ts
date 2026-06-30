export interface Feature {
  yes: boolean;
  text: string;
}

export interface Tier {
  tag: string;
  namePre: string;
  nameEm: string;
  amount: string;
  per: string;
  desc: string;
  features: Feature[];
  cta: string;
  ctaVariant: "primary" | "ghost";
  ctaTo: string;
  note?: string;
  featured?: boolean;
  badge?: string;
}

export const TIERS: Tier[] = [
  {
    tag: "Free · always",
    namePre: "The ",
    nameEm: "door",
    amount: "€0",
    per: "/ forever",
    desc: "The door is open. Community films, made-here shorts, and selected free-tier films — no account needed. No time limit.",
    features: [
      { yes: true, text: "All free-tier films (40+ in catalogue)" },
      { yes: true, text: "All made-here community shorts" },
      { yes: true, text: "Free live events & Q&As" },
      { yes: true, text: "Captions & audio description" },
      { yes: false, text: "Sustainer library (100+ films)" },
      { yes: false, text: "Offline downloads" },
      { yes: false, text: "Votes on open calls" },
    ],
    cta: "Browse free films",
    ctaVariant: "ghost",
    ctaTo: "/cinema/browse",
  },
  {
    tag: "Sustainer · monthly",
    namePre: "The ",
    nameEm: "room",
    amount: "€7",
    per: "/ month",
    desc: "Everything in the cinema, plus your €7 directly funds the commissioning pool, the captioning fund, and the curators' stipend. The number is transparent.",
    features: [
      { yes: true, text: "Everything in Free" },
      { yes: true, text: "Full sustainer library — 142 films" },
      { yes: true, text: "Offline downloads (sustainer titles)" },
      { yes: true, text: "Watch parties with other sustainers" },
      { yes: true, text: "Vote on open calls & commissions" },
      { yes: true, text: "Curator's notebook — full essays" },
      { yes: true, text: "Screener access (festival films)" },
    ],
    cta: "Become a sustainer · €7/mo",
    ctaVariant: "primary",
    ctaTo: "/checkout",
    note: "Cancel any time. No lock-in. No dark patterns.",
    featured: true,
    badge: "Most sustainers choose this",
  },
  {
    tag: "Patron · monthly",
    namePre: "The ",
    nameEm: "patron",
    amount: "€20",
    per: "/ month",
    desc: "Everything in Sustainer, plus your name on the public patron wall and a larger contribution to the commissioning pool (~€4.80/mo after costs).",
    features: [
      { yes: true, text: "Everything in Sustainer" },
      { yes: true, text: "Name on the patron wall (opt-in)" },
      { yes: true, text: "Direct input on future open calls" },
      { yes: true, text: "Invite to annual co-op assembly" },
      { yes: true, text: "~€4.80/mo → commissioning pool" },
      { yes: true, text: "Advance screeners before public" },
      { yes: true, text: "Two guest passes per year" },
    ],
    cta: "Become a patron · €20/mo",
    ctaVariant: "ghost",
    ctaTo: "/checkout",
    note: "Cancel any time.",
  },
];

export const LEDGER: { k: string; v: string; note: string }[] = [
  { k: "Sustainers", v: "1,240", note: "Up 38 this month" },
  { k: "Paid to filmmakers", v: "€8.4k", note: "This month, all transactions" },
  { k: "Films in catalogue", v: "142", note: "9 new this month" },
  { k: "Commission pool", v: "€13.2k", note: "Season 3 · 4 calls open" },
];
