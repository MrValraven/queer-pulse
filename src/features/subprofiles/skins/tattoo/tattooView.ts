import type {
  PublicSubprofileView,
  SubprofileItemView,
} from "../../api/subprofiles.adapters";
import type { SkinData } from "../../api/subprofiles.api";
import type { PersonaViewMode } from "../../personaSkinRender";
import { personaTitleName } from "../../subprofile-kinds";
import { socialHref } from "../../../../shared/social/socialPlatforms";
import { parseAmount } from "../therapist/therapistView.helpers";
import { resolveTattooBooksStatus } from "./tattooBooksStatus";
import {
  listedValue,
  listedValues,
  safeText,
  splitGuestSpots,
  storedTexts,
  usableBookingRoute,
} from "./tattooView.helpers";
import {
  TATTOO_BOOKING_ROUTES,
  TATTOO_COLOURS,
  TATTOO_COMFORT_OPTIONS,
  TATTOO_CONSULTATIONS,
  TATTOO_HYGIENE_PRACTICES,
  TATTOO_KIND_SECTIONS,
  TATTOO_WHAT_TO_SEND,
  type TattooBookingRoute,
  type TattooBooksStatus,
  type TattooColour,
  type TattooComfortOption,
  type TattooConsultation,
  type TattooHygienePractice,
  type TattooWhatToSend,
} from "./tattooVocab.data";

export type TattooBlockKey =
  | "flash"
  | "healed"
  | "scarWork"
  | "coverUps"
  | "projects"
  | "wannaDos"
  | "styles"
  | "booking"
  | "prices"
  | "comfort"
  | "hygiene"
  | "aftercare"
  | "guestSpots"
  | "flashDays"
  | "shop"
  | "gallery"
  | "lineage"
  | "faq";

/** The main column, top to bottom (spec "Page layout"). */
export const TATTOO_MAIN_BLOCKS: readonly TattooBlockKey[] = [
  "flash",
  "healed",
  "scarWork",
  "coverUps",
  "projects",
  "wannaDos",
  "styles",
  "booking",
  "prices",
  "comfort",
  "hygiene",
  "aftercare",
  "guestSpots",
  "flashDays",
  "shop",
  "gallery",
  "lineage",
  "faq",
];

export interface TattooBookingView {
  route: TattooBookingRoute | null;
  /** The route when it can be used right now (contract "How to book: route availability"), else null. */
  usableRoute: TattooBookingRoute | null;
  email: string;
  formUrl: string;
  instagramHref: string | null;
  whatToSend: TattooWhatToSend[];
  consultation: TattooConsultation | null;
  replyTime: string;
}

export interface TattooPricesView {
  minimum: number | null;
  hourly: number | null;
  dayRate: number | null;
  depositAmount: number | null;
  isDepositRefundable: boolean;
  depositNote: string;
  cancellation: string;
  hasFreeTouchUps: boolean;
  touchUpMonths: number | null;
}

type TattooItemSectionKey = (typeof TATTOO_KIND_SECTIONS)[number] | "gallery";

export interface TattooView {
  titleName: string;
  status: TattooBooksStatus | null;
  nextOpening: string;
  waitNote: string;
  city: string;
  venue: { name: string; lines: string[] } | null;
  isPrivateStudio: boolean;
  isByAppointmentOnly: boolean;
  styles: string[];
  heroStyles: string[];
  colour: TattooColour | null;
  minSize: string;
  doesNotDo: string[];
  booking: TattooBookingView;
  prices: TattooPricesView;
  comfortOptions: TattooComfortOption[];
  comfortNote: string;
  hygienePractices: TattooHygienePractice[];
  scarIntro: string;
  hasFreeConsult: boolean;
  hasReducedPrice: boolean;
  reducedPriceNote: string;
  trainedWith: string;
  tattooingSince: string;
  isTakingApprentices: boolean;
  apprenticeNote: string;
  teaches: string[];
  faq: { question: string; answer: string }[];
  /** Every tattoo section plus gallery, in stored order, the starred item left out (it is the spotlight). */
  itemsBySection: Record<TattooItemSectionKey, SubprofileItemView[]>;
  featured: SubprofileItemView | null;
  guestSpots: {
    upcoming: SubprofileItemView[];
    past: SubprofileItemView[];
    next: SubprofileItemView | null;
    /** The next spot started on or before today, so it runs right now. */
    isNextRunning: boolean;
  };
  hasContent: Record<TattooBlockKey, boolean>;
}

/** The props every page block component takes (Tasks 21 to 23). */
export interface TattooBlockProps {
  data: PublicSubprofileView;
  view: TattooView;
  mode: PersonaViewMode;
  onOpenWorkItem?: (item: SubprofileItemView) => void;
  onOpenGalleryPhoto?: (item: SubprofileItemView) => void;
}

function buildItemsBySection(
  data: PublicSubprofileView,
): Record<TattooItemSectionKey, SubprofileItemView[]> {
  const featuredId = data.featured?.id ?? null;
  const itemsFor = (sectionKey: TattooItemSectionKey) =>
    (
      data.sections.find((section) => section.section === sectionKey)?.items ??
      []
    ).filter((item) => !item.isFeatured && item.id !== featuredId);
  const entries = [...TATTOO_KIND_SECTIONS, "gallery" as const].map(
    (sectionKey) => [sectionKey, itemsFor(sectionKey)] as const,
  );
  return Object.fromEntries(entries) as Record<
    TattooItemSectionKey,
    SubprofileItemView[]
  >;
}

function buildBooking(
  skinData: SkinData,
  data: PublicSubprofileView,
): TattooBookingView {
  const stored = skinData.tattooBooking;
  const route = listedValue(TATTOO_BOOKING_ROUTES, stored?.route);
  const email = safeText(stored?.email);
  const formUrl = safeText(stored?.formUrl);
  const instagramLink = data.socialLinks.find(
    (link) => link.platform === "instagram",
  );
  const instagramHref = instagramLink
    ? (socialHref("instagram", instagramLink.urlOrHandle) ?? null)
    : null;
  return {
    route,
    usableRoute: usableBookingRoute(route, {
      email,
      formUrl,
      instagramHref,
      isPublished: data.status === "published",
    }),
    email,
    formUrl,
    instagramHref,
    whatToSend: listedValues(TATTOO_WHAT_TO_SEND, stored?.whatToSend),
    consultation: listedValue(TATTOO_CONSULTATIONS, stored?.consultation),
    replyTime: safeText(stored?.replyTime),
  };
}

function buildPrices(skinData: SkinData): TattooPricesView {
  const stored = skinData.tattooPrices;
  return {
    minimum: parseAmount(stored?.minimum),
    hourly: parseAmount(stored?.hourly),
    dayRate: parseAmount(stored?.dayRate),
    depositAmount: parseAmount(stored?.deposit?.amount),
    isDepositRefundable: stored?.deposit?.isRefundable === true,
    depositNote: safeText(stored?.deposit?.note),
    cancellation: safeText(stored?.cancellation),
    hasFreeTouchUps: stored?.touchUps?.isFree === true,
    touchUpMonths: parseAmount(stored?.touchUps?.months),
  };
}

function hasAnyPrice(prices: TattooPricesView): boolean {
  return (
    prices.minimum !== null ||
    prices.hourly !== null ||
    prices.dayRate !== null ||
    prices.depositAmount !== null ||
    prices.depositNote !== "" ||
    prices.cancellation !== "" ||
    prices.hasFreeTouchUps ||
    prices.touchUpMonths !== null
  );
}

/** The studio's place from `skinData.venue`, read defensively: a stored
 *  value of the wrong shape (a string, a non-list `lines`, a number in the
 *  list) reads as empty and never throws. Null when neither a name nor an
 *  address line is set. */
function storedVenue(stored: unknown): TattooView["venue"] {
  if (typeof stored !== "object" || stored === null) return null;
  const { name, lines } = stored as { name?: unknown; lines?: unknown };
  const venueName = safeText(name);
  const venueLines = Array.isArray(lines)
    ? lines.map(safeText).filter((line) => line !== "")
    : [];
  return venueName !== "" || venueLines.length > 0
    ? { name: venueName, lines: venueLines }
    : null;
}

/** Upcoming and past guest spots, plus whether the soonest upcoming one
 *  (whose last day is today or later) has already started. */
function buildGuestSpots(
  items: readonly SubprofileItemView[],
  today: string,
): TattooView["guestSpots"] {
  const split = splitGuestSpots(items, today);
  const nextStart = split.next ? safeText(split.next.date).slice(0, 10) : "";
  return { ...split, isNextRunning: nextStart !== "" && nextStart <= today };
}

function storedFaq(stored: unknown): TattooView["faq"] {
  if (!Array.isArray(stored)) return [];
  const entries = stored.filter(
    (entry): entry is { question?: unknown; answer?: unknown } =>
      typeof entry === "object" && entry !== null,
  );
  return entries
    .map((entry) => ({
      question: safeText(entry.question),
      answer: safeText(entry.answer),
    }))
    .filter((entry) => entry.question !== "");
}

type TattooViewFields = Omit<TattooView, "hasContent">;

function buildHasContent(
  fields: TattooViewFields,
): Record<TattooBlockKey, boolean> {
  const { itemsBySection: items, booking } = fields;
  return {
    flash: items.flash.length > 0,
    healed: items.healed.length > 0,
    scarWork:
      items.scar_work.length > 0 ||
      fields.scarIntro !== "" ||
      fields.hasFreeConsult ||
      fields.hasReducedPrice,
    coverUps: items.cover_ups.length > 0,
    projects: items.in_progress.length > 0,
    wannaDos: items.wanna_dos.length > 0,
    styles:
      fields.styles.length > 0 ||
      fields.colour !== null ||
      fields.minSize !== "" ||
      fields.doesNotDo.length > 0,
    booking:
      booking.usableRoute !== null ||
      booking.whatToSend.length > 0 ||
      booking.consultation !== null ||
      booking.replyTime !== "",
    prices: hasAnyPrice(fields.prices),
    comfort: fields.comfortOptions.length > 0 || fields.comfortNote !== "",
    hygiene: fields.hygienePractices.length > 0 || items.credentials.length > 0,
    aftercare: items.aftercare.length > 0,
    guestSpots: items.guest_spots.length > 0,
    flashDays: items.flash_days.length > 0,
    shop: items.shop.length > 0,
    gallery: items.gallery.length > 0,
    lineage:
      fields.trainedWith !== "" ||
      fields.tattooingSince !== "" ||
      fields.isTakingApprentices ||
      fields.apprenticeNote !== "" ||
      fields.teaches.length > 0,
    faq: fields.faq.length > 0,
  };
}

/** Everything the tattoo layout renders, derived once from the public view.
 *  Lists are never null; strings are "" when unset. `today` is local
 *  YYYY-MM-DD (`localIsoDate`). */
export function buildTattooView(
  data: PublicSubprofileView,
  today: string,
): TattooView {
  const skinData: SkinData = data.skinData ?? {};
  const styleFacts = skinData.tattooStyles;
  const studio = skinData.tattooStudio;
  const lineage = skinData.tattooLineage;
  const scarWork = skinData.tattooScarWork;
  const styles = storedTexts(styleFacts?.styles);
  const itemsBySection = buildItemsBySection(data);
  const fields: TattooViewFields = {
    titleName: personaTitleName({
      displayName: data.displayName,
      kind: data.kind,
      ownerName: data.ownerName,
    }),
    status: resolveTattooBooksStatus(skinData, data.availability),
    nextOpening: safeText(skinData.tattoo?.nextOpening),
    waitNote: safeText(skinData.tattoo?.waitNote),
    city: safeText(studio?.city),
    venue: storedVenue(skinData.venue),
    isPrivateStudio: studio?.isPrivateStudio === true,
    isByAppointmentOnly: studio?.isByAppointmentOnly === true,
    styles,
    heroStyles: styles.slice(0, 3),
    colour: listedValue(TATTOO_COLOURS, styleFacts?.colour),
    minSize: safeText(styleFacts?.minSize),
    doesNotDo: storedTexts(styleFacts?.doesNotDo),
    booking: buildBooking(skinData, data),
    prices: buildPrices(skinData),
    comfortOptions: listedValues(
      TATTOO_COMFORT_OPTIONS,
      skinData.tattooComfort?.options,
    ),
    comfortNote: safeText(skinData.tattooComfort?.note),
    hygienePractices: listedValues(
      TATTOO_HYGIENE_PRACTICES,
      skinData.tattooHygiene?.practices,
    ),
    scarIntro: safeText(scarWork?.intro),
    hasFreeConsult: scarWork?.hasFreeConsult === true,
    hasReducedPrice: scarWork?.hasReducedPrice === true,
    reducedPriceNote: safeText(scarWork?.reducedPriceNote),
    trainedWith: safeText(lineage?.trainedWith),
    tattooingSince: safeText(lineage?.tattooingSince),
    isTakingApprentices: lineage?.isTakingApprentices === true,
    apprenticeNote: safeText(lineage?.apprenticeNote),
    teaches: storedTexts(lineage?.teaches),
    faq: storedFaq(skinData.faq),
    itemsBySection,
    featured: data.featured,
    guestSpots: buildGuestSpots(itemsBySection.guest_spots, today),
  };
  return { ...fields, hasContent: buildHasContent(fields) };
}
