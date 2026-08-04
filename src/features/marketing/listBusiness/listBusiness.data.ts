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
import { LOCAL_CATEGORIES, categoryLabel } from "../localPlaces";

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
  photos: "lb-photos",
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

/* Categories are the unified directory slugs (LOCAL_CATEGORIES) — the same
 * vocabulary the map pins, category filter, and backend hours template key off.
 * The wizard stores the slug verbatim, so a new listing is born map-correct.
 * "nightlife" is included so the choosable set equals the displayed set. */
export const CATS = LOCAL_CATEGORIES;

/** Display label for a stored category slug. Delegates to the single directory
 * helper, which also heals any legacy display-string category. */
export function catLabel(t: TFunction, id: string): string {
  return categoryLabel(t, id);
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

/* ---------- City seam (item #15) ----------
   The whole wizard is Lisbon-only today. Everything city-specific lives on this
   single `CITY` object so a second city becomes a data change, not a code
   change: the neighbourhood dropdown, the fallback map centroids used when a
   member can't paste a Google Maps link (item #1), the default timezone the
   directory reads hours against, and the "Elsewhere in <city>" catch-all.
   Consumers still import `NEIGHBOURHOODS` (derived below) unchanged. */
export interface LatLng {
  latitude: number;
  longitude: number;
}
export interface CityConfig {
  id: string;
  name: string;
  defaultTimezone: string;
  centroid: LatLng;
  /** Named neighbourhoods (the catch-all is appended separately). */
  neighbourhoods: string[];
  /** Stable, locale-independent value for the trailing "anywhere else in this
   *  city" option (submitted to the backend / fed to `neighbourhoodCentroid`).
   *  Its user-facing label is localised via `hoodLabel`, not this string. */
  elsewhereLabel: string;
  /** Approx centroid per named neighbourhood — the geocode fallback pin. */
  neighbourhoodCentroids: Record<string, LatLng>;
}

export const CITY: CityConfig = {
  id: "lisbon",
  name: "Lisbon",
  defaultTimezone: "Europe/Lisbon",
  centroid: { latitude: 38.7223, longitude: -9.1393 },
  neighbourhoods: [
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
  ],
  elsewhereLabel: "Elsewhere in Lisbon",
  neighbourhoodCentroids: {
    Anjos: { latitude: 38.7267, longitude: -9.135 },
    Arroios: { latitude: 38.7295, longitude: -9.135 },
    Graça: { latitude: 38.7186, longitude: -9.13 },
    Alfama: { latitude: 38.712, longitude: -9.129 },
    Mouraria: { latitude: 38.7155, longitude: -9.1355 },
    "Príncipe Real": { latitude: 38.7175, longitude: -9.149 },
    "Bairro Alto": { latitude: 38.712, longitude: -9.146 },
    "Cais do Sodré": { latitude: 38.7065, longitude: -9.145 },
    Santos: { latitude: 38.7075, longitude: -9.156 },
    Estrela: { latitude: 38.7135, longitude: -9.16 },
    "Campo de Ourique": { latitude: 38.7185, longitude: -9.166 },
    Alvalade: { latitude: 38.753, longitude: -9.144 },
    Marvila: { latitude: 38.738, longitude: -9.101 },
    Beato: { latitude: 38.733, longitude: -9.109 },
    Intendente: { latitude: 38.722, longitude: -9.1355 },
  },
};

/** Neighbourhood dropdown options: the named list + the "Elsewhere" catch-all.
 *  Derived from `CITY` so a new city is one config edit. */
export const NEIGHBOURHOODS = [...CITY.neighbourhoods, CITY.elsewhereLabel];

/** Display label for a neighbourhood option. Named neighbourhoods are proper
 *  nouns rendered as-is; the trailing catch-all resolves to the shared
 *  `auth:tour.neighbourhood.elsewhere` catalog string so it localises. Value in
 *  `NEIGHBOURHOODS` stays stable (`CITY.elsewhereLabel`) regardless of locale. */
export function hoodLabel(t: TFunction, hood: string): string {
  return hood === CITY.elsewhereLabel
    ? t("auth:tour.neighbourhood.elsewhere")
    : hood;
}

/** Best-effort fallback coordinate for a neighbourhood, so a member who can't
 *  paste a Google Maps link still gets a draggable pin near the right area
 *  instead of being stuck at the location step (item #1). Unknown/"Elsewhere"
 *  falls back to the city centroid. */
export function neighbourhoodCentroid(hood: string): LatLng {
  return CITY.neighbourhoodCentroids[hood] ?? CITY.centroid;
}

/** Seed directory used only for live duplicate detection on the name field. */
export interface SeedPlace {
  name: string;
  cat: string;
  hood: string;
  badge: OwnerBadge;
}
export const SEED: SeedPlace[] = [
  { name: "Café Beirão", cat: "food", hood: "Anjos", badge: "owned" },
  { name: "Clínica do Largo", cat: "health", hood: "Anjos", badge: "friendly" },
  { name: "Livraria Rosa", cat: "culture", hood: "Graça", badge: "owned" },
  { name: "Estúdio Marvila", cat: "design", hood: "Marvila", badge: "owned" },
  { name: "Barbearia Lux", cat: "grooming", hood: "Arroios", badge: "friendly" },
  {
    name: "Ginásio Corpo Livre",
    cat: "fitness",
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

/* ---------- Opening hours (item #6 — split intervals + overnight) ----------
   A day can be closed, or open across one or two intervals. Each interval is a
   `from`–`to` pair in "HH:MM"; when `to <= from` the interval runs past midnight
   (a late bar), which is VALID. Two intervals model a lunch-break closure
   (e.g. 12:00–15:00 · 19:00–23:00). Legacy `{ open, from, to }` rows are healed
   by `normalizeDayHours`. */
export interface HoursInterval {
  from: string;
  to: string;
}
export interface DayHours {
  open: boolean;
  intervals: HoursInterval[];
}

export type PhotoKey = "wide" | "d1" | "d2" | "vibe";
export const PHOTO_KEYS: PhotoKey[] = ["wide", "d1", "d2", "vibe"];

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

/** A sensible default single interval for a freshly-opened day. */
export function defaultInterval(): HoursInterval {
  return { from: "09:00", to: "18:00" };
}

export function emptyHours(): Record<string, DayHours> {
  const hours: Record<string, DayHours> = {};
  DAYS.forEach((day) => {
    hours[day.id] = { open: false, intervals: [defaultInterval()] };
  });
  return hours;
}

/** Heal one day into the interval shape — accepts the new shape, the legacy
 *  `{ open, from, to }` shape, or junk (→ a closed default day). Idempotent. */
export function normalizeDayHours(raw: unknown): DayHours {
  if (raw && typeof raw === "object") {
    const record = raw as Record<string, unknown>;
    if (Array.isArray(record.intervals)) {
      const intervals = record.intervals
        .filter(
          (interval): interval is HoursInterval =>
            !!interval &&
            typeof (interval as HoursInterval).from === "string" &&
            typeof (interval as HoursInterval).to === "string",
        )
        .map((interval) => ({ from: interval.from, to: interval.to }));
      return {
        open: Boolean(record.open),
        intervals: intervals.length ? intervals : [defaultInterval()],
      };
    }
    if (typeof record.from === "string" && typeof record.to === "string") {
      return {
        open: Boolean(record.open),
        intervals: [{ from: record.from, to: record.to }],
      };
    }
  }
  return { open: false, intervals: [defaultInterval()] };
}

/** Heal a whole week's hours map (tolerates missing days + legacy rows). */
export function normalizeHours(
  raw: Record<string, unknown> | null | undefined,
): Record<string, DayHours> {
  const hours: Record<string, DayHours> = {};
  DAYS.forEach((day) => {
    hours[day.id] = normalizeDayHours(raw?.[day.id]);
  });
  return hours;
}

/** True when this interval closes after midnight (spills into the next day). */
export function isOvernight(interval: HoursInterval): boolean {
  return interval.to <= interval.from;
}

/** A compact human string for one day's hours, or null when closed/blank —
 *  e.g. "12:00–15:00 · 19:00–02:00". Used by every read-only hours display. */
export function formatDayHours(day: DayHours | undefined): string | null {
  if (!day?.open) return null;
  const label = day.intervals
    .filter((interval) => interval.from && interval.to)
    .map((interval) => `${interval.from}–${interval.to}`)
    .join(" · ");
  return label || null;
}

function toMinutes(hourMinute: string): number {
  const [hour, minute] = hourMinute.split(":");
  return Number(hour) * 60 + Number(minute);
}

/** Two same-day intervals overlap? Overnight intervals are treated as reaching
 *  midnight for this check, which is enough to catch obvious editor mistakes. */
function intervalsOverlap(first: HoursInterval, second: HoursInterval): boolean {
  const span = (interval: HoursInterval): [number, number] => {
    const start = toMinutes(interval.from);
    const end = isOvernight(interval) ? 24 * 60 : toMinutes(interval.to);
    return [start, end];
  };
  const [firstStart, firstEnd] = span(first);
  const [secondStart, secondEnd] = span(second);
  return firstStart < secondEnd && secondStart < firstEnd;
}

/** Validity of one day for the step gate + inline editor warnings. An open day
 *  needs ≥1 interval, every interval needs both times, a zero-length interval
 *  (`to === from`) is invalid, `to < from` (overnight) is valid, and two
 *  intervals must not overlap. A closed day is always valid. */
export function dayHoursValid(day: DayHours): boolean {
  if (!day.open) return true;
  if (!day.intervals.length) return false;
  const wellFormed = day.intervals.every(
    (interval) => interval.from && interval.to && interval.from !== interval.to,
  );
  if (!wellFormed) return false;
  if (day.intervals.length === 2)
    return !intervalsOverlap(day.intervals[0]!, day.intervals[1]!);
  return true;
}

/** Every open day across the week is well-formed. */
export function hoursValid(hours: Record<string, DayHours>): boolean {
  return DAYS.every((day) => dayHoursValid(hours[day.id] ?? { open: false, intervals: [] }));
}

/** At least one day is open somewhere in the week. */
export function anyDayOpen(hours: Record<string, DayHours>): boolean {
  return DAYS.some((day) => hours[day.id]?.open);
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

/** True when `value` can be rendered directly as an `<img src>` — an http(s),
 *  data, or blob URL. Guards the paste-a-URL field from non-image schemes. */
export function isPastableImageUrl(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  // Only `https://` — this is the value that gets PERSISTED into `photos`, so it
  // must satisfy the backend's `@IsImageReference` (queerpulse-backend
  // `common/validators/is-image-reference.decorator.ts`), which accepts only a
  // storage key or an `https://` URL and refuses `http:`/`data:`/`blob:`
  // (mixed-content downgrade + stored-XSS defence). Uploaded photos persist a
  // storage key via `useUploadImage` and never reach this guard.
  return /^https:\/\//i.test(trimmed);
}

/** Build a reference like QPL-2026-0007 from a numeric seed. */
export function makeRef(seq: number): string {
  return `QPL-2026-${String(seq).padStart(4, "0")}`;
}
