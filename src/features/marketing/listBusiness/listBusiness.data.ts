/* ===========================================================
   List Your Business — static option data, types, helpers.
   Ported from the design bundle (qp-listing.js).

   i18n note: option lists below (CATS, GOODFOR, LANGS) double as both
   platform-authored chrome (the visible chip/dropdown label) AND the raw
   value stored in `ListingDraft`/sent to the backend verbatim (the DTO is
   the draft as-is — see `api/listings.api.ts`). Translating the stored value
   itself would mean a language switch silently rewrites already-submitted
   data, so these keep their canonical English id and gain a `_LABEL_KEYS`
   lookup + `xLabel(s)` helper resolved with `t()` only at render time — the
   "fused mock string" pattern from the extraction brief, applied to enum
   values instead of a composed sentence. REL/VIS/NOTIFY/VERIFY/PRICES/DAYS
   already had a separate `id`, so their label fields become `labelKey`s
   directly. NEIGHBOURHOODS (Lisbon place names) are left untouched — proper
   nouns that read identically in pt-PT, same rationale as the gatherings
   HOOD_KEYS neighbourhood rail.
   =========================================================== */

import type { TFunction } from "../../../shared/i18n/types";
import { leadingInitials } from "../../../shared/lib/initials";

export const TOTAL_STEPS = 6;

/** Step-pill labels, as catalog keys — resolved with `t()` by the consumer. */
export const PILL_LABEL_KEYS = [
  "marketing:listBusiness.wizard.pill.path",
  "marketing:listBusiness.wizard.pill.basics",
  "marketing:listBusiness.wizard.pill.story",
  "marketing:listBusiness.wizard.pill.practical",
  "marketing:listBusiness.wizard.pill.photos",
  "marketing:listBusiness.wizard.pill.review",
];

/** i18n key for the PaneActions "next" button, indexed by wizard step. */
export const NEXT_LABEL_KEYS = [
  "marketing:listBusiness.next.basics",
  "marketing:listBusiness.next.story",
  "marketing:listBusiness.next.practical",
  "marketing:listBusiness.next.photos",
  "marketing:listBusiness.next.review",
  "marketing:listBusiness.next.send",
];

/* ---------- Field anchors ----------
   Stable DOM ids for each required field, so a "what's still needed" chip
   can scroll + focus the exact field it names. Shared by the form (which
   builds the missing list) and the steps (which render the anchors). */
export const ANCHOR = {
  path: "lb-path",
  verify: "lb-verify",
  name: "lb-name",
  cats: "lb-cats",
  hood: "lb-hood",
  badge: "lb-badge",
  price: "lb-price",
  blurb: "lb-blurb",
  tagline: "lb-tagline",
  whatItIs: "lb-what-it-is",
  address: "lb-address",
  hours: "lb-hours",
  social: "lb-social",
  rel: "lb-rel",
  ownerName: "lb-owner-name",
  ownerRole: "lb-owner-role",
  contactEmail: "lb-contact-email",
  consent: "lb-consent",
} as const;

/** A still-unfilled required field: its label key + the anchor to jump to. */
export interface MissingField {
  labelKey: string;
  anchor: string;
}

/* ---------- Option data ---------- */

/* CATS / GOODFOR / LANGS keep their canonical English id — that id IS the
   value stored in `ListingDraft` and sent to the backend verbatim — and gain
   a `_LABEL_KEYS` lookup resolved with `t()` only at render, so a language
   switch can never rewrite already-entered draft data. */

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

export const CAT_LABEL_KEYS: Record<string, string> = {
  "Food & drink": "marketing:listBusiness.cat.foodDrink",
  "Design & craft": "marketing:listBusiness.cat.designCraft",
  "Health & care": "marketing:listBusiness.cat.healthCare",
  Spaces: "marketing:listBusiness.cat.spaces",
  Culture: "marketing:listBusiness.cat.culture",
  Tech: "marketing:listBusiness.cat.tech",
  "Barbershop & Salon": "marketing:listBusiness.cat.barbershopSalon",
  "Gym & Fitness": "marketing:listBusiness.cat.gymFitness",
};

/** Display label for a stored category id. Falls back to the id itself. */
export function catLabel(t: TFunction, id: string): string {
  const key = CAT_LABEL_KEYS[id];
  return key ? t(key) : id;
}

export interface PriceBand {
  id: string;
  labelKey: string;
  sym: string;
}
export const PRICES: PriceBand[] = [
  { id: "Free", labelKey: "marketing:listBusiness.price.free", sym: "€0" },
  { id: "€", labelKey: "marketing:listBusiness.price.affordable", sym: "€" },
  { id: "€€", labelKey: "marketing:listBusiness.price.midRange", sym: "€€" },
  { id: "€€€", labelKey: "marketing:listBusiness.price.higherEnd", sym: "€€€" },
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

export const GOODFOR_LABEL_KEYS: Record<string, string> = {
  "Wheelchair accessible":
    "marketing:listBusiness.goodFor.wheelchairAccessible",
  "Gender-neutral toilets":
    "marketing:listBusiness.goodFor.genderNeutralToilets",
  "Step-free entrance": "marketing:listBusiness.goodFor.stepFreeEntrance",
  "Walk-ins welcome": "marketing:listBusiness.goodFor.walkInsWelcome",
  "Quiet, low-sensory hours": "marketing:listBusiness.goodFor.quietLowSensory",
  "Solo-friendly": "marketing:listBusiness.goodFor.soloFriendly",
  "Dog-friendly": "marketing:listBusiness.goodFor.dogFriendly",
  "Hosts community events":
    "marketing:listBusiness.goodFor.hostsCommunityEvents",
  "Budget-friendly": "marketing:listBusiness.goodFor.budgetFriendly",
  "Accessible bathroom": "marketing:listBusiness.goodFor.accessibleBathroom",
};

/** Display label for a stored good-for id. Falls back to the id itself. */
export function goodForLabel(t: TFunction, id: string): string {
  const key = GOODFOR_LABEL_KEYS[id];
  return key ? t(key) : id;
}

export const LANGS = [
  "Português",
  "English",
  "Español",
  "Français",
  "LGP (sign)",
  "Other",
];

export const LANG_LABEL_KEYS: Record<string, string> = {
  Português: "marketing:listBusiness.lang.portugues",
  English: "marketing:listBusiness.lang.english",
  Español: "marketing:listBusiness.lang.espanol",
  Français: "marketing:listBusiness.lang.francais",
  "LGP (sign)": "marketing:listBusiness.lang.lgp",
  Other: "marketing:listBusiness.lang.other",
};

/** Display label for a stored language id. Falls back to the id itself. */
export function langLabel(t: TFunction, id: string): string {
  const key = LANG_LABEL_KEYS[id];
  return key ? t(key) : id;
}

export interface OptionRow {
  id: string;
  labelKey: string;
  descKey: string;
}

export const REL: OptionRow[] = [
  {
    id: "own",
    labelKey: "marketing:listBusiness.rel.own.label",
    descKey: "marketing:listBusiness.rel.own.desc",
  },
  {
    id: "run",
    labelKey: "marketing:listBusiness.rel.run.label",
    descKey: "marketing:listBusiness.rel.run.desc",
  },
  {
    id: "work",
    labelKey: "marketing:listBusiness.rel.work.label",
    descKey: "marketing:listBusiness.rel.work.desc",
  },
  {
    id: "regular",
    labelKey: "marketing:listBusiness.rel.regular.label",
    descKey: "marketing:listBusiness.rel.regular.desc",
  },
];

export const VIS: OptionRow[] = [
  {
    id: "public",
    labelKey: "marketing:listBusiness.vis.public.label",
    descKey: "marketing:listBusiness.vis.public.desc",
  },
  {
    id: "role",
    labelKey: "marketing:listBusiness.vis.role.label",
    descKey: "marketing:listBusiness.vis.role.desc",
  },
  {
    id: "anon",
    labelKey: "marketing:listBusiness.vis.anon.label",
    descKey: "marketing:listBusiness.vis.anon.desc",
  },
];

export interface NotifyOption {
  id: string;
  labelKey: string;
  on: boolean;
}
export const NOTIFY: NotifyOption[] = [
  {
    id: "live",
    labelKey: "marketing:listBusiness.notify.live.label",
    on: true,
  },
  {
    id: "question",
    labelKey: "marketing:listBusiness.notify.question.label",
    on: true,
  },
  {
    id: "news",
    labelKey: "marketing:listBusiness.notify.news.label",
    on: false,
  },
];

export interface VerifyOption {
  id: string;
  labelKey: string;
  descKey: string;
  badgeKey: string;
}
export const VERIFY: VerifyOption[] = [
  {
    id: "email",
    labelKey: "marketing:listBusiness.verify.email.label",
    descKey: "marketing:listBusiness.verify.email.desc",
    badgeKey: "marketing:listBusiness.verify.email.badge",
  },
  {
    id: "instagram",
    labelKey: "marketing:listBusiness.verify.instagram.label",
    descKey: "marketing:listBusiness.verify.instagram.desc",
    badgeKey: "marketing:listBusiness.verify.instagram.badge",
  },
  {
    id: "post",
    labelKey: "marketing:listBusiness.verify.post.label",
    descKey: "marketing:listBusiness.verify.post.desc",
    badgeKey: "marketing:listBusiness.verify.post.badge",
  },
  {
    id: "later",
    labelKey: "marketing:listBusiness.verify.later.label",
    descKey: "marketing:listBusiness.verify.later.desc",
    badgeKey: "marketing:listBusiness.verify.later.badge",
  },
];

export interface DayDef {
  id: string;
  labelKey: string;
}
export const DAYS: DayDef[] = [
  { id: "Mon", labelKey: "marketing:listBusiness.day.mon" },
  { id: "Tue", labelKey: "marketing:listBusiness.day.tue" },
  { id: "Wed", labelKey: "marketing:listBusiness.day.wed" },
  { id: "Thu", labelKey: "marketing:listBusiness.day.thu" },
  { id: "Fri", labelKey: "marketing:listBusiness.day.fri" },
  { id: "Sat", labelKey: "marketing:listBusiness.day.sat" },
  { id: "Sun", labelKey: "marketing:listBusiness.day.sun" },
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
  latitude: number | null;
  longitude: number | null;
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
  return leadingInitials(name);
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
