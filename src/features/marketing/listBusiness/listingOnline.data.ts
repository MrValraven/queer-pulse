import type { IconType } from "react-icons";
import {
  FiCoffee,
  FiHeart,
  FiLink,
  FiMail,
  FiMusic,
  FiShoppingBag,
  FiVideo,
} from "react-icons/fi";
import { asOnlineCategory } from "../localCategories";
import { WEBSITE_URL_RE } from "./listBusiness.data";

/**
 * Selling online: the vocabulary and the pure rules behind the "How people
 * buy from you" fields, the "We also sell online" section, the card's status
 * slot and the detail page's "Ordering & delivery" block.
 *
 * Every slug mirrors the backend's `listings/listing-online-details.ts` (wire
 * contract of 2026-10-07) exactly. They are stored verbatim, so they are never
 * localised; each gets a catalog label through the full maps below.
 */

export const ONLINE_MAIN_LINK_KINDS = [
  "shop",
  "booking",
  "website",
  "newsletter",
] as const;
export type OnlineMainLinkKind = (typeof ONLINE_MAIN_LINK_KINDS)[number];

export const ONLINE_LINK_PLATFORMS = [
  "etsy",
  "vinted",
  "bandcamp",
  "kofi",
  "patreon",
  "substack",
  "tiktok",
  "linktree",
  "other",
] as const;
export type OnlineLinkPlatform = (typeof ONLINE_LINK_PLATFORMS)[number];

export const ONLINE_FULFILMENT_OPTIONS = [
  "shipsPortugal",
  "shipsEu",
  "shipsWorldwide",
  "digital",
  "pickupLisbon",
] as const;
export type OnlineFulfilment = (typeof ONLINE_FULFILMENT_OPTIONS)[number];

/** `""` means the question is unanswered. */
export const ONLINE_SHIPS_FROM_OPTIONS = [
  "portugal",
  "eu",
  "outsideEu",
] as const;
export type OnlineShipsFrom = (typeof ONLINE_SHIPS_FROM_OPTIONS)[number];

export const ONLINE_PAYMENT_METHODS = [
  "mbway",
  "multibanco",
  "card",
  "paypal",
  "bankTransfer",
] as const;
export type OnlinePaymentMethod = (typeof ONLINE_PAYMENT_METHODS)[number];

export const ONLINE_SESSION_FORMATS = [
  "video",
  "phone",
  "chat",
  "inPerson",
] as const;
export type OnlineSessionFormat = (typeof ONLINE_SESSION_FORMATS)[number];

/** `""` means none. */
export const PROFESSIONAL_REGISTRATION_BODIES = [
  "opp",
  "ordemMedicos",
  "other",
] as const;
export type ProfessionalRegistrationBody =
  (typeof PROFESSIONAL_REGISTRATION_BODIES)[number];

/** Server ceilings, mirrored so the form stops a member before the API does. */
export const MAX_ONLINE_MORE_LINKS = 4;
export const ONLINE_NOTE_MAX = 140;
export const REGISTRATION_NUMBER_MAX = 40;
/** The `social.website` ceiling, which every online link is held to. */
export const ONLINE_LINK_MAX = 300;
/** The backend `city` column's DTO ceiling. */
export const ONLINE_CITY_MAX = 120;

/* ---------- Wire shapes ---------- */

export interface OnlineMainLink {
  url: string;
  kind: OnlineMainLinkKind;
}

export interface OnlineMoreLink {
  url: string;
  platform: OnlineLinkPlatform;
}

/** What the request body sends and what the public detail page receives. */
export interface ListingPublicOnlineDetails {
  mainLink: OnlineMainLink | null;
  moreLinks: OnlineMoreLink[];
  fulfilment: OnlineFulfilment[];
  pickupNote: string;
  shipsFrom: OnlineShipsFrom | "";
  isVatIncluded: boolean;
  payments: OnlinePaymentMethod[];
  sessionFormats: OnlineSessionFormat[];
  registration: { body: ProfessionalRegistrationBody | ""; number: string };
  replyNote: string;
}

/** The owner wire adds the server-set 18+ acceptance stamp. */
export interface ListingOnlineDetails extends ListingPublicOnlineDetails {
  adultTermsAcceptedAt: string | null;
}

/** The card payload's slice: enough for the status slot and Visit. */
export interface DirectoryOnlineSummary {
  mainLink: OnlineMainLink | null;
  fulfilment: OnlineFulfilment[];
  sessionFormats: OnlineSessionFormat[];
}

/* ---------- Draft shapes ---------- */

/** One "more links" row. `id` is client-only, for React keys. */
export interface OnlineMoreLinkRow {
  id: string;
  url: string;
  platform: OnlineLinkPlatform | "";
}

/** The editable shape: a main link that is never null (an empty url is "no
 *  link yet") and link rows with client ids. */
export interface ListingOnlineDetailsDraft extends Omit<
  ListingPublicOnlineDetails,
  "mainLink" | "moreLinks"
> {
  mainLink: OnlineMainLink;
  moreLinks: OnlineMoreLinkRow[];
}

/* ---------- Labels (full maps, so a new slug fails the typecheck) ---------- */

const ONLINE_KEY = "marketing:listBusiness.online";
const ORDERING_KEY = "marketing:directory.detail.ordering";

export const MAIN_LINK_KIND_LABEL_KEYS: Record<OnlineMainLinkKind, string> = {
  shop: `${ONLINE_KEY}.mainLink.kind.shop`,
  booking: `${ONLINE_KEY}.mainLink.kind.booking`,
  website: `${ONLINE_KEY}.mainLink.kind.website`,
  newsletter: `${ONLINE_KEY}.mainLink.kind.newsletter`,
};

/** The detail page's main button, named for what it does. */
export const MAIN_LINK_ACTION_KEYS: Record<OnlineMainLinkKind, string> = {
  shop: `${ORDERING_KEY}.action.shop`,
  booking: `${ORDERING_KEY}.action.booking`,
  website: `${ORDERING_KEY}.action.website`,
  newsletter: `${ORDERING_KEY}.action.newsletter`,
};

export const ONLINE_LINK_PLATFORM_DEFINITIONS: Record<
  OnlineLinkPlatform,
  { labelKey: string; icon: IconType }
> = {
  etsy: { labelKey: `${ONLINE_KEY}.platform.etsy`, icon: FiShoppingBag },
  vinted: { labelKey: `${ONLINE_KEY}.platform.vinted`, icon: FiShoppingBag },
  bandcamp: { labelKey: `${ONLINE_KEY}.platform.bandcamp`, icon: FiMusic },
  kofi: { labelKey: `${ONLINE_KEY}.platform.kofi`, icon: FiCoffee },
  patreon: { labelKey: `${ONLINE_KEY}.platform.patreon`, icon: FiHeart },
  substack: { labelKey: `${ONLINE_KEY}.platform.substack`, icon: FiMail },
  tiktok: { labelKey: `${ONLINE_KEY}.platform.tiktok`, icon: FiVideo },
  linktree: { labelKey: `${ONLINE_KEY}.platform.linktree`, icon: FiLink },
  other: { labelKey: `${ONLINE_KEY}.platform.other`, icon: FiLink },
};

/** Shared by the form chips, the card status slot and the detail page. */
export const FULFILMENT_LABEL_KEYS: Record<OnlineFulfilment, string> = {
  shipsPortugal: `${ONLINE_KEY}.fulfilment.shipsPortugal`,
  shipsEu: `${ONLINE_KEY}.fulfilment.shipsEu`,
  shipsWorldwide: `${ONLINE_KEY}.fulfilment.shipsWorldwide`,
  digital: `${ONLINE_KEY}.fulfilment.digital`,
  pickupLisbon: `${ONLINE_KEY}.fulfilment.pickupLisbon`,
};

export const SHIPS_FROM_LABEL_KEYS: Record<OnlineShipsFrom, string> = {
  portugal: `${ONLINE_KEY}.shipsFrom.portugal`,
  eu: `${ONLINE_KEY}.shipsFrom.eu`,
  outsideEu: `${ONLINE_KEY}.shipsFrom.outsideEu`,
};

/** The detail page's sentence ("Ships from Portugal"). */
export const SHIPS_FROM_DETAIL_KEYS: Record<OnlineShipsFrom, string> = {
  portugal: `${ORDERING_KEY}.shipsFrom.portugal`,
  eu: `${ORDERING_KEY}.shipsFrom.eu`,
  outsideEu: `${ORDERING_KEY}.shipsFrom.outsideEu`,
};

export const PAYMENT_LABEL_KEYS: Record<OnlinePaymentMethod, string> = {
  mbway: `${ONLINE_KEY}.payment.mbway`,
  multibanco: `${ONLINE_KEY}.payment.multibanco`,
  card: `${ONLINE_KEY}.payment.card`,
  paypal: `${ONLINE_KEY}.payment.paypal`,
  bankTransfer: `${ONLINE_KEY}.payment.bankTransfer`,
};

export const SESSION_FORMAT_LABEL_KEYS: Record<OnlineSessionFormat, string> = {
  video: `${ONLINE_KEY}.session.video`,
  phone: `${ONLINE_KEY}.session.phone`,
  chat: `${ONLINE_KEY}.session.chat`,
  inPerson: `${ONLINE_KEY}.session.inPerson`,
};

/** The card status slot's wording ("Video sessions"). */
export const SESSION_FORMAT_STATUS_KEYS: Record<OnlineSessionFormat, string> = {
  video: "marketing:directory.card.status.session.video",
  phone: "marketing:directory.card.status.session.phone",
  chat: "marketing:directory.card.status.session.chat",
  inPerson: "marketing:directory.card.status.session.inPerson",
};

export const REGISTRATION_BODY_LABEL_KEYS: Record<
  ProfessionalRegistrationBody,
  string
> = {
  opp: `${ONLINE_KEY}.registration.body.opp`,
  ordemMedicos: `${ONLINE_KEY}.registration.body.ordemMedicos`,
  other: `${ONLINE_KEY}.registration.body.other`,
};

/** The detail page's sentence ("Registered with the OPP, no. {number}"). */
export const REGISTRATION_DETAIL_KEYS: Record<
  ProfessionalRegistrationBody,
  string
> = {
  opp: `${ORDERING_KEY}.registration.opp`,
  ordemMedicos: `${ORDERING_KEY}.registration.ordemMedicos`,
  other: `${ORDERING_KEY}.registration.other`,
};

/* ---------- Predicates ---------- */

/** "Sells online": online only, or a place with an online shop. The Online
 *  tab and the server `online` filter use this definition. */
export function isSellingOnline(source: {
  online?: boolean;
  hasOnlineShop?: boolean;
}): boolean {
  return source.online === true || source.hasOnlineShop === true;
}

const SHIPPING_OPTIONS: ReadonlySet<OnlineFulfilment> = new Set([
  "shipsPortugal",
  "shipsEu",
  "shipsWorldwide",
]);

export function isShippingPicked(fulfilment: readonly OnlineFulfilment[]) {
  return fulfilment.some((option) => SHIPPING_OPTIONS.has(option));
}

const SESSION_CATEGORIES: ReadonlySet<string> = new Set([
  "therapy",
  "classes",
  "services",
]);

/** Session formats are asked when a category is Health & therapy, Classes &
 *  courses or Creative services (a place's health or fitness reads as one).
 *  `intimacy` never asks on its own. */
export function shouldAskSessionFormats(cats: readonly string[]): boolean {
  return cats.some((category) =>
    SESSION_CATEGORIES.has(asOnlineCategory(category)),
  );
}

/** Professional registration is asked for Health & therapy, or a place's
 *  health category. */
export function shouldAskRegistration(cats: readonly string[]): boolean {
  return cats.some((category) => asOnlineCategory(category) === "therapy");
}

/** The draft facts the 18+ rules read. `managementRole` is set on every edit
 *  (`dtoToDraft`) and absent on a create, the same signal `ownerBlock` uses. */
interface AdultTermsSource {
  path: string;
  isStaffAuthored?: boolean;
  managementRole?: string;
  adultTermsAccepted?: boolean;
}

function isEditDraft(draft: AdultTermsSource): boolean {
  return draft.managementRole !== undefined;
}

/** Whether the person filling the form can accept the 18+ rules: only the
 *  business itself. Staff never can, and neither can a member suggesting a
 *  business on a create. On an edit, the member saving speaks for it. */
export function canAcceptAdultTerms(draft: AdultTermsSource): boolean {
  if (draft.isStaffAuthored === true) return false;
  return isEditDraft(draft) || draft.path !== "suggest";
}

/** Whether the 18+ category is offered at all. Someone who cannot accept the
 *  rules is offered it only on an edit of a listing that already holds the
 *  server's acceptance stamp (`dtoToDraft` loads it as `adultTermsAccepted`).
 *  A create never counts a stamp: nothing was accepted on the server yet. */
export function isAdultCategoryOffered(draft: AdultTermsSource): boolean {
  if (canAcceptAdultTerms(draft)) return true;
  return isEditDraft(draft) && draft.adultTermsAccepted === true;
}

/** The backend refuses an online link holding whitespace or a backslash
 *  anywhere inside it (`normalizeOnlineListingUrl`). */
const WHITESPACE_OR_BACKSLASH_RE = /[\s\\]/;

/** A filled link the backend would store: a domain with an optional http(s)
 *  protocol, the same shape `social.website` accepts, within the ceiling and
 *  with no whitespace or backslash inside. Shared with the shop item link. */
export function isFilledOnlineLinkValid(
  trimmed: string,
  maxLength: number,
): boolean {
  return (
    trimmed.length <= maxLength &&
    !WHITESPACE_OR_BACKSLASH_RE.test(trimmed) &&
    WEBSITE_URL_RE.test(trimmed)
  );
}

/** Empty is valid here (whether a link is required is decided elsewhere);
 *  a filled one must pass `isFilledOnlineLinkValid`. */
export function isOnlineLinkValid(url: string): boolean {
  const trimmed = url.trim();
  if (trimmed === "") return true;
  return isFilledOnlineLinkValid(trimmed, ONLINE_LINK_MAX);
}

/* ---------- Normalisers ---------- */

export function recordOrEmpty(raw: unknown): Record<string, unknown> {
  return raw !== null && typeof raw === "object" && !Array.isArray(raw)
    ? (raw as Record<string, unknown>)
    : {};
}

export function stringOrEmpty(raw: unknown): string {
  return typeof raw === "string" ? raw : "";
}

function oneOf<Value extends string>(
  raw: unknown,
  vocabulary: readonly Value[],
): Value | "" {
  return typeof raw === "string" &&
    (vocabulary as readonly string[]).includes(raw)
    ? (raw as Value)
    : "";
}

/** Known values only, once each, in vocabulary order. */
function knownValues<Value extends string>(
  raw: unknown,
  vocabulary: readonly Value[],
): Value[] {
  if (!Array.isArray(raw)) return [];
  const wanted = new Set(
    raw.filter((entry): entry is string => typeof entry === "string"),
  );
  return vocabulary.filter((value) => wanted.has(value));
}

/** The kind an unanswered, unknown or missing main link reads as, in the
 *  editable block and the card summary alike: the broadest kind, which fits
 *  any business's link. */
export const DEFAULT_MAIN_LINK_KIND: OnlineMainLinkKind = "website";

/** A fresh "more links" row. The id is a uuid, so a row added after a resume
 *  can never share an id with one the autosaved draft already carries. */
export function newOnlineMoreLinkRow(
  url = "",
  platform: OnlineLinkPlatform | "" = "",
): OnlineMoreLinkRow {
  return { id: crypto.randomUUID(), url, platform };
}

export function emptyOnlineDetailsDraft(): ListingOnlineDetailsDraft {
  return {
    mainLink: { url: "", kind: DEFAULT_MAIN_LINK_KIND },
    moreLinks: [],
    fulfilment: [],
    pickupNote: "",
    shipsFrom: "",
    isVatIncluded: false,
    payments: [],
    sessionFormats: [],
    registration: { body: "", number: "" },
    replyNote: "",
  };
}

/**
 * Any stored, received or resumed value read as the editable online block.
 * Absent (a draft from before the feature, a row the server wrote with the
 * `'{}'` default), partial or mangled values heal to the empty block. Known
 * values only, in canonical order. A row id already there is kept, so
 * healing a well-formed editor draft changes nothing a reader could see. A
 * row with no id, or one repeating an id an earlier row holds, gets a fresh
 * uuid, so every row stays addressable on its own.
 */
export function normalizeOnlineDetails(
  raw: unknown,
): ListingOnlineDetailsDraft {
  const source = recordOrEmpty(raw);
  const mainLink = recordOrEmpty(source.mainLink);
  const registration = recordOrEmpty(source.registration);
  const moreLinks = Array.isArray(source.moreLinks) ? source.moreLinks : [];
  const seenRowIds = new Set<string>();
  return {
    mainLink: {
      url: stringOrEmpty(mainLink.url),
      kind:
        oneOf(mainLink.kind, ONLINE_MAIN_LINK_KINDS) || DEFAULT_MAIN_LINK_KIND,
    },
    moreLinks: moreLinks.slice(0, MAX_ONLINE_MORE_LINKS).map((entry) => {
      const link = recordOrEmpty(entry);
      const row = newOnlineMoreLinkRow(
        stringOrEmpty(link.url),
        oneOf(link.platform, ONLINE_LINK_PLATFORMS),
      );
      const existingId = stringOrEmpty(link.id);
      const id =
        existingId && !seenRowIds.has(existingId) ? existingId : row.id;
      seenRowIds.add(id);
      return { ...row, id };
    }),
    fulfilment: knownValues(source.fulfilment, ONLINE_FULFILMENT_OPTIONS),
    pickupNote: stringOrEmpty(source.pickupNote),
    shipsFrom: oneOf(source.shipsFrom, ONLINE_SHIPS_FROM_OPTIONS),
    isVatIncluded: source.isVatIncluded === true,
    payments: knownValues(source.payments, ONLINE_PAYMENT_METHODS),
    sessionFormats: knownValues(source.sessionFormats, ONLINE_SESSION_FORMATS),
    registration: {
      body: oneOf(registration.body, PROFESSIONAL_REGISTRATION_BODIES),
      number: stringOrEmpty(registration.number),
    },
    replyNote: stringOrEmpty(source.replyNote),
  };
}

/** The editable block in its wire shape, with no cleanup: link row ids
 *  dropped, an empty main link as null, half-filled link rows left out. */
export function toPublicOnlineDetails(
  details: ListingOnlineDetailsDraft,
): ListingPublicOnlineDetails {
  const mainLinkUrl = details.mainLink.url.trim();
  return {
    ...details,
    mainLink: mainLinkUrl
      ? { url: mainLinkUrl, kind: details.mainLink.kind }
      : null,
    moreLinks: details.moreLinks.flatMap((row) =>
      row.url.trim() && row.platform
        ? [{ url: row.url.trim(), platform: row.platform }]
        : [],
    ),
    registration: { ...details.registration },
  };
}

/** A public detail payload's block, or null when the listing sells nothing
 *  online (the wire's `null`) or the payload predates the field. */
export function normalizePublicOnlineDetails(
  raw: unknown,
): ListingPublicOnlineDetails | null {
  if (raw === null || raw === undefined) return null;
  return toPublicOnlineDetails(normalizeOnlineDetails(raw));
}

/**
 * The block a save sends, for the listing's kind. Selling nothing online sends
 * the empty block. Every sub-answer the form is not showing right now is
 * blanked, so a value typed before a switch never reaches the public page:
 * pick-up on a place (it has an address), the pick-up note without pick-up,
 * "ships from" without a shipping answer, the IOSS box outside "outside the
 * EU", session formats and registration without the category that asks.
 */
export function onlineDetailsForPayload(
  details: ListingOnlineDetailsDraft | undefined,
  kind: { online: boolean; hasOnlineShop?: boolean; cats: readonly string[] },
): ListingPublicOnlineDetails {
  if (!isSellingOnline(kind)) {
    return toPublicOnlineDetails(emptyOnlineDetailsDraft());
  }
  const source = toPublicOnlineDetails(normalizeOnlineDetails(details));
  const fulfilment = kind.online
    ? source.fulfilment
    : source.fulfilment.filter((option) => option !== "pickupLisbon");
  const shipsFrom = isShippingPicked(fulfilment) ? source.shipsFrom : "";
  const hasRegistration =
    shouldAskRegistration(kind.cats) && source.registration.body !== "";
  return {
    ...source,
    fulfilment,
    pickupNote: fulfilment.includes("pickupLisbon")
      ? source.pickupNote.trim()
      : "",
    shipsFrom,
    isVatIncluded: shipsFrom === "outsideEu" && source.isVatIncluded,
    sessionFormats: shouldAskSessionFormats(kind.cats)
      ? source.sessionFormats
      : [],
    registration: hasRegistration
      ? {
          body: source.registration.body,
          number: source.registration.number.trim(),
        }
      : { body: "", number: "" },
    replyNote: source.replyNote.trim(),
  };
}

/** The card's slice of a full block. */
export function summaryFromDetails(
  details: ListingPublicOnlineDetails | null,
): DirectoryOnlineSummary | null {
  if (!details) return null;
  return {
    mainLink: details.mainLink,
    fulfilment: details.fulfilment,
    sessionFormats: details.sessionFormats,
  };
}

/** A card payload's `onlineSummary`, healed. Null stays null. */
export function normalizeOnlineSummary(
  raw: unknown,
): DirectoryOnlineSummary | null {
  if (raw === null || raw === undefined) return null;
  const source = recordOrEmpty(raw);
  const mainLink = recordOrEmpty(source.mainLink);
  const url = stringOrEmpty(mainLink.url).trim();
  return {
    mainLink: url
      ? {
          url,
          kind:
            oneOf(mainLink.kind, ONLINE_MAIN_LINK_KINDS) ||
            DEFAULT_MAIN_LINK_KIND,
        }
      : null,
    fulfilment: knownValues(source.fulfilment, ONLINE_FULFILMENT_OPTIONS),
    sessionFormats: knownValues(source.sessionFormats, ONLINE_SESSION_FORMATS),
  };
}

/** Widest delivery first: one line is all the slot has. */
const FULFILMENT_STATUS_ORDER: readonly OnlineFulfilment[] = [
  "shipsWorldwide",
  "shipsEu",
  "shipsPortugal",
  "digital",
  "pickupLisbon",
];

/**
 * What an online-only card's status slot says, in priority order: a delivery
 * summary ("Ships across the EU", "Digital download"), else the first session
 * format ("Video sessions"), else nothing. Never "Closed": an online business
 * has no opening hours.
 */
export function onlineStatusOf(
  summary: DirectoryOnlineSummary | null | undefined,
): { labelKey: string; isSession: boolean } | null {
  if (!summary) return null;
  const fulfilment = FULFILMENT_STATUS_ORDER.find((option) =>
    summary.fulfilment.includes(option),
  );
  if (fulfilment) {
    return { labelKey: FULFILMENT_LABEL_KEYS[fulfilment], isSession: false };
  }
  const sessionFormat = ONLINE_SESSION_FORMATS.find((format) =>
    summary.sessionFormats.includes(format),
  );
  return sessionFormat
    ? { labelKey: SESSION_FORMAT_STATUS_KEYS[sessionFormat], isSession: true }
    : null;
}
