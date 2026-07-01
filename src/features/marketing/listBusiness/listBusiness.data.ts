/* ===========================================================
   List Your Business — static option data, types, helpers.
   Ported from the design bundle (qp-listing.js), English only.
   =========================================================== */

export const TOTAL_STEPS = 6;

export const PILL_LABELS = [
  "You & the place",
  "Basics",
  "Story",
  "Practical",
  "Photos & you",
  "Review",
];

/* ---------- Option data ---------- */

export const CATS = [
  "Food & drink",
  "Design & craft",
  "Health & care",
  "Spaces",
  "Culture",
  "Tech",
  "Barbershop & Salon",
  "Gym & Fitness",
] as const;

export interface PriceBand {
  id: string;
  label: string;
  sym: string;
}
export const PRICES: PriceBand[] = [
  { id: "Free", label: "Free", sym: "€0" },
  { id: "€", label: "Affordable", sym: "€" },
  { id: "€€", label: "Mid-range", sym: "€€" },
  { id: "€€€", label: "Higher-end", sym: "€€€" },
];

export const GOODFOR = [
  "Wheelchair accessible",
  "Gender-neutral toilets",
  "Step-free entrance",
  "Walk-ins welcome",
  "Quiet, low-sensory hours",
  "Solo-friendly",
  "Dog-friendly",
  "Hosts community events",
  "Budget-friendly",
  "Accessible bathroom",
];

export const LANGS = [
  "Português",
  "English",
  "Español",
  "Français",
  "LGP (sign)",
  "Other",
];

export interface OptionRow {
  id: string;
  label: string;
  desc: string;
}

export const REL: OptionRow[] = [
  { id: "own", label: "I own or co-own it", desc: "You're the proprietor." },
  {
    id: "run",
    label: "I manage or help run it",
    desc: "Day-to-day, it's partly yours.",
  },
  {
    id: "work",
    label: "I work here",
    desc: "Staff, with the owner's blessing to list.",
  },
  {
    id: "regular",
    label: "I'm a regular who loves it",
    desc: "Suggesting a place that's been good to you.",
  },
];

export const VIS: OptionRow[] = [
  {
    id: "public",
    label: "My name and role",
    desc: "Both shown on the listing.",
  },
  { id: "role", label: "My role only", desc: '"Owner", but no name.' },
  {
    id: "anon",
    label: "Keep me anonymous",
    desc: "Visible only to the community team.",
  },
];

export interface NotifyOption {
  id: string;
  label: string;
  on: boolean;
}
export const NOTIFY: NotifyOption[] = [
  { id: "live", label: "It goes live", on: true },
  { id: "question", label: "The team has a question", on: true },
  { id: "news", label: "Occasional directory news", on: false },
];

export interface VerifyOption {
  id: string;
  label: string;
  desc: string;
  badge: string;
}
export const VERIFY: VerifyOption[] = [
  {
    id: "email",
    label: "Business email",
    desc: "We send a code to an address on your domain.",
    badge: "Fastest",
  },
  {
    id: "instagram",
    label: "Instagram",
    desc: "Confirm with a DM from the listed account.",
    badge: "Easy",
  },
  {
    id: "post",
    label: "Postcard to the address",
    desc: "Old-school. A code arrives in 3–5 days.",
    badge: "3–5 days",
  },
  {
    id: "later",
    label: "Verify after review",
    desc: "The team verifies with you directly, human to human.",
    badge: "Human",
  },
];

export interface DayDef {
  id: string;
  label: string;
}
export const DAYS: DayDef[] = [
  { id: "Mon", label: "Monday" },
  { id: "Tue", label: "Tuesday" },
  { id: "Wed", label: "Wednesday" },
  { id: "Thu", label: "Thursday" },
  { id: "Fri", label: "Friday" },
  { id: "Sat", label: "Saturday" },
  { id: "Sun", label: "Sunday" },
];

export const NEIGHBOURHOODS = [
  "Anjos",
  "Arroios",
  "Graça",
  "Alfama",
  "Mouraria",
  "Príncipe Real",
  "Bairro Alto",
  "Cais do Sodré",
  "Santos",
  "Estrela",
  "Campo de Ourique",
  "Alvalade",
  "Marvila",
  "Beato",
  "Intendente",
  "Elsewhere in Lisbon",
];

/** Seed directory used only for live duplicate detection on the name field. */
export interface SeedPlace {
  name: string;
  cat: string;
  hood: string;
  badge: OwnerBadge;
}
export const SEED: SeedPlace[] = [
  { name: "Café Beirão", cat: "Food & drink", hood: "Anjos", badge: "owned" },
  {
    name: "Clínica do Largo",
    cat: "Health & care",
    hood: "Anjos",
    badge: "friendly",
  },
  { name: "Livraria Rosa", cat: "Culture", hood: "Graça", badge: "owned" },
  {
    name: "Estúdio Marvila",
    cat: "Design & craft",
    hood: "Marvila",
    badge: "owned",
  },
  {
    name: "Barbearia Lux",
    cat: "Barbershop & Salon",
    hood: "Arroios",
    badge: "friendly",
  },
  {
    name: "Ginásio Corpo Livre",
    cat: "Gym & Fitness",
    hood: "Alvalade",
    badge: "owned",
  },
];

/* ---------- Types ---------- */

export type ListingStatus = "review" | "question" | "live";
export type OwnerBadge = "owned" | "friendly";
export type ListingPath = "claim" | "suggest";
export type OwnerRel = "own" | "run" | "work" | "regular";
export type OwnerVisibility = "public" | "role" | "anon";

/** A single "what it actually is" line, with a stable id for React keys. */
export interface WitLine {
  id: string;
  text: string;
}
let witSeq = 0;
export function witLine(text = ""): WitLine {
  witSeq += 1;
  return { id: `wit-${witSeq}`, text };
}

export interface DayHours {
  open: boolean;
  from: string;
  to: string;
}

export type PhotoKey = "wide" | "d1" | "d2" | "vibe";

export interface ListingDraft {
  path: ListingPath | "";
  verify: string; // VERIFY id, claim path only
  name: string;
  cats: string[]; // up to 2
  hood: string;
  badge: OwnerBadge | "";
  evidence: string; // owned only
  price: string; // PRICES id
  blurb: string; // one-liner, <=140
  tagline: string;
  whatItIs: WitLine[]; // 2-4 lines
  tags: string[]; // <=6
  goodFor: string[]; // GOODFOR ids
  langs: string[];
  address: string;
  geocoded: boolean;
  hours: Record<string, DayHours>; // keyed by DAYS id
  hoursNote: string;
  social: {
    instagram: string;
    website: string;
    email: string;
    phone: string;
  };
  photos: Record<PhotoKey, string>;
  alt: Record<PhotoKey, string>;
  rel: OwnerRel | ""; // REL id — your connection to the place
  ownerName: string;
  ownerRole: string;
  ownerBio: string;
  visibility: OwnerVisibility; // VIS id
  linkToProfile: boolean;
  contactEmail: string;
  notify: string[]; // NOTIFY ids
  consentOuting: boolean;
  consentGuide: boolean;
}

export interface PendingListing extends ListingDraft {
  ref: string; // e.g. "QPL-2026-0007"
  status: ListingStatus;
  slug: string;
  submittedBy: string; // member slug
}

/* ---------- Helpers ---------- */

export function emptyHours(): Record<string, DayHours> {
  const h: Record<string, DayHours> = {};
  DAYS.forEach((d) => {
    h[d.id] = { open: false, from: "09:00", to: "18:00" };
  });
  return h;
}

export function slugify(s: string): string {
  return (
    s
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48) || "your-place"
  );
}

/** Loose name match against the seed directory (substring or first word). */
export function findDuplicates(name: string): SeedPlace[] {
  const n = name.trim().toLowerCase();
  if (n.length < 3) return [];
  return SEED.filter((s) => {
    const sn = s.name.toLowerCase();
    return (
      sn.includes(n) || n.includes(sn) || sn.split(" ")[0] === n.split(" ")[0]
    );
  }).slice(0, 3);
}

export function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

const RE = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  // a domain-ish website, optionally with protocol/path
  web: /^(https?:\/\/)?([\w-]+\.)+[a-z]{2,}(\/\S*)?$/i,
  phone: /^[+()\d][\d\s().-]{5,}$/,
};

export interface SocialValidity {
  instagram: boolean;
  website: boolean;
  email: boolean;
  phone: boolean;
}

/** Empty fields are valid (all optional). Returns per-field validity. */
export function validateSocials(s: ListingDraft["social"]): SocialValidity {
  const ok = (v: string, re: RegExp) => !v.trim() || re.test(v.trim());
  return {
    instagram: true, // any handle text is accepted
    website: ok(s.website, RE.web),
    email: ok(s.email, RE.email),
    phone: ok(s.phone, RE.phone),
  };
}

export function allSocialsValid(s: ListingDraft["social"]): boolean {
  const v = validateSocials(s);
  return v.website && v.email && v.phone;
}

export function emailValid(v: string): boolean {
  return RE.email.test(v.trim());
}

/** Build a reference like QPL-2026-0007 from a numeric seed. */
export function makeRef(seq: number): string {
  return `QPL-2026-${String(seq).padStart(4, "0")}`;
}
