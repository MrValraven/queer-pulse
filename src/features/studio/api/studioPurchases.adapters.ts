// Studio purchases: the view models every purchase surface renders in both
// modes (contract 10.3; demo builds wire-shaped DTOs first). Unknown kinds,
// statuses and states from a newer server drop the row here. After an
// artist persona unlink the confirmed buyer keeps the record and the
// downloads (contract 4.7): the item has no link, the artist name stays as
// text and the kept tracks download. Artist text only: no amounts reach a
// wall entry.
import { ApiError } from "../../../shared/api/client";
import {
  STUDIO_PURCHASE_LIMITS,
  isSellableReleaseType,
} from "../studioPurchaseRules";
import {
  studioArtistPath,
  studioReleasePath,
  studioTrackPath,
} from "../studioPaths";
import {
  formatTrackTime,
  toArtistRefView,
  toPlaylistPersonView,
  type StudioArtistRefView,
} from "./studio.adapters";
import {
  STUDIO_ERROR_CODES,
  STUDIO_PRICE_MODES,
  type StudioErrorCode,
  type StudioPageDTO,
  type StudioPriceDTO,
  type StudioPriceMode,
} from "./studio.types";
import { parsedDate, wholeCountOf } from "./studioDashboard.adapters";
import {
  toSupporterIdentityView,
  type StudioSupporterIdentityView,
  type StudioSupporterOptionView,
} from "./studioListening.adapters";
import type { StudioSupporterOptionDTO } from "./studioListening.types";
import {
  STUDIO_OFFER_STATES,
  STUDIO_PAYMENT_METHOD_KINDS,
  STUDIO_PURCHASE_DECLINE_REASONS,
  STUDIO_PURCHASE_STATUSES,
  type StudioBuyerPurchaseDTO,
  type StudioOfferDTO,
  type StudioOfferState,
  type StudioPaymentMethodDTO,
  type StudioPaymentMethodKind,
  type StudioPaymentMethodsDTO,
  type StudioPurchaseArtistDTO,
  type StudioPurchaseDeclineReason,
  type StudioPurchaseDownloadTrackDTO,
  type StudioPurchaseItemDTO,
  type StudioPurchaseReferenceDTO,
  type StudioPurchaseStatusValue,
  type StudioPurchaseWallStateDTO,
  type StudioSalesTotalsDTO,
  type StudioSellerPurchaseDTO,
  type StudioTrackOfferDTO,
  type StudioWallEntryDTO,
} from "./studioPurchases.types";

export interface StudioPriceView {
  mode: StudioPriceMode;
  amountCents: number;
}

export interface StudioPaymentMethodView {
  id: string;
  kind: StudioPaymentMethodKind;
  label: string | null;
  value: string;
  note: string | null;
}

export interface StudioPaymentMethodsView {
  methods: StudioPaymentMethodView[];
  hasItemsForSale: boolean;
  updatedAt: Date | null;
}

export interface StudioPurchaseItemView {
  kind: "release" | "track";
  title: string;
  releaseId: string | null;
  trackId: string | null;
  formatLabelKey: string;
  coverUrl: string | null;
  /** The release or track page while the item exists; null renders text. */
  href: string | null;
  isAvailable: boolean;
}

export interface StudioPurchaseArtistView {
  name: string;
  /** The artist's Studio page while linkable; null renders text. */
  href: string | null;
  /** Null once the persona is unlinked: the wall control's "artist still on
   *  Studio" test. */
  subprofileId: string | null;
}

export interface StudioPurchaseDownloadTrackView {
  trackId: string;
  position: number;
  title: string;
  durationLabel: string | null;
  format: "mp3" | "m4a" | null;
  unavailableReason: StudioErrorCode | null;
}

export interface StudioBuyerPurchaseView {
  id: string;
  status: StudioPurchaseStatusValue;
  item: StudioPurchaseItemView;
  artist: StudioPurchaseArtistView;
  amountCents: number;
  referenceCode: string;
  payerName: string | null;
  declineReason: StudioPurchaseDeclineReason | null;
  declineNote: string | null;
  createdAt: Date;
  decidedAt: Date | null;
  wall: {
    isOnWall: boolean;
    shownAs: StudioSupporterIdentityView | null;
    needsNewIdentity: boolean;
  };
  downloads: StudioPurchaseDownloadTrackView[];
}

export interface StudioOfferViewerView {
  state: StudioOfferState;
  refusalCode: StudioErrorCode | null;
  pendingPurchase: StudioBuyerPurchaseView | null;
  ownedPurchase: StudioBuyerPurchaseView | null;
}

export interface StudioTrackOfferView {
  trackId: string;
  position: number;
  title: string;
  price: StudioPriceView;
  state: StudioOfferState;
  refusalCode: StudioErrorCode | null;
  pendingPurchaseId: string | null;
  ownedPurchaseId: string | null;
}

export interface StudioOfferView {
  item: StudioPurchaseItemView;
  artist: StudioArtistRefView;
  price: StudioPriceView | null;
  viewer: StudioOfferViewerView;
  paymentMethods: StudioPaymentMethodView[];
  identityOptions: StudioSupporterOptionView[];
  trackOffers: StudioTrackOfferView[];
}

export interface StudioPurchaseWallStateView {
  isOnWall: boolean;
  shownAsSubprofileId: string | null;
  shownAs: StudioSupporterIdentityView | null;
  needsNewIdentity: boolean;
  options: StudioSupporterOptionView[];
}

export interface StudioSellerPurchaseView {
  id: string;
  status: StudioPurchaseStatusValue;
  item: StudioPurchaseItemView;
  amountCents: number;
  referenceCode: string;
  payerName: string | null;
  /** Null is a deleted account. */
  buyer: { name: string; avatarUrl: string | null; href: string | null } | null;
  createdAt: Date;
  decidedAt: Date | null;
}

export interface StudioSalesTotalsView {
  last28Days: { amountCents: number; count: number };
  allTime: { amountCents: number; count: number };
}

/** A wall entry carries the identity only: no amount, no date. */
export interface StudioWallEntryView {
  key: string;
  identity: StudioSupporterIdentityView;
}

/** Route 18's answer. */
export interface StudioPurchaseReferenceView {
  referenceCode: string;
  referenceToken: string;
  expiresAt: Date;
}

/** The 31 symbols of the reference code alphabet (contract 1.6). */
const REFERENCE_CODE_PATTERN = /^[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{6}$/;
const KNOWN_ERROR_CODES: ReadonlySet<string> = new Set(STUDIO_ERROR_CODES);
/** The codes an offer can refuse with (contract 3.1). */
const OFFER_REFUSAL_CODES: ReadonlySet<string> = new Set<StudioErrorCode>([
  "studio_purchase_own_persona",
  "studio_purchase_not_for_sale",
  "studio_release_type_not_for_sale",
  "studio_purchase_release_not_published",
  "studio_purchase_track_unavailable",
  "studio_purchase_unavailable",
  "studio_purchase_no_payment_methods",
]);
const UNKNOWN_DOWNLOAD_REFUSAL: StudioErrorCode =
  "studio_download_track_not_ready";

function isOneOf<Value extends string>(
  values: readonly Value[],
  candidate: string,
): candidate is Value {
  return (values as readonly string[]).includes(candidate);
}

function knownErrorCodeOf(code: string | null): StudioErrorCode | null {
  return code !== null && KNOWN_ERROR_CODES.has(code)
    ? (code as StudioErrorCode)
    : null;
}

function offerRefusalCodeOf(code: string | null): StudioErrorCode | null {
  return code !== null && OFFER_REFUSAL_CODES.has(code)
    ? (code as StudioErrorCode)
    : null;
}

/** An amount in euro cents: a whole number from 0. */
function isReadableAmountCents(amountCents: number): boolean {
  return Number.isInteger(amountCents) && amountCents >= 0;
}

export function toPriceView(
  dto: StudioPriceDTO | null | undefined,
): StudioPriceView | null {
  if (!dto || !isOneOf(STUDIO_PRICE_MODES, dto.mode)) return null;
  const lowestCents =
    dto.mode === "fixed"
      ? STUDIO_PURCHASE_LIMITS.fixedPriceMinCents
      : STUDIO_PURCHASE_LIMITS.minimumPriceMinCents;
  const isInRange =
    Number.isInteger(dto.amountCents) &&
    dto.amountCents >= lowestCents &&
    dto.amountCents <= STUDIO_PURCHASE_LIMITS.priceMaxCents;
  return isInRange ? { mode: dto.mode, amountCents: dto.amountCents } : null;
}

/** Null for a kind this build does not know. */
export function toPaymentMethodView(
  dto: StudioPaymentMethodDTO,
): StudioPaymentMethodView | null {
  if (!isOneOf(STUDIO_PAYMENT_METHOD_KINDS, dto.kind)) return null;
  return {
    id: dto.id,
    kind: dto.kind,
    label: dto.label,
    value: dto.value,
    note: dto.note,
  };
}

/** Methods keep the server order (position ascending). */
export function toPaymentMethodsView(
  dto: StudioPaymentMethodsDTO,
): StudioPaymentMethodsView {
  return {
    methods: (dto.methods ?? []).flatMap(
      (method) => toPaymentMethodView(method) ?? [],
    ),
    hasItemsForSale: dto.hasItemsForSale,
    updatedAt: dto.updatedAt ? parsedDate(dto.updatedAt) : null,
  };
}

export function purchaseFormatLabelKey(
  kind: "release" | "track",
  releaseType: string | null,
): string {
  if (kind === "track") return "studio:purchase.format.track";
  return releaseType !== null && isSellableReleaseType(releaseType)
    ? `studio:purchase.format.${releaseType}`
    : "studio:purchase.format.release";
}

function itemHrefOf(dto: StudioPurchaseItemDTO): string | null {
  if (!dto.isAvailable) return null;
  if (dto.kind === "release" && dto.releaseId) {
    return studioReleasePath(dto.releaseId);
  }
  if (dto.kind === "track" && dto.trackId) return studioTrackPath(dto.trackId);
  return null;
}

/** Null for a kind this build does not know. */
export function toPurchaseItemView(
  dto: StudioPurchaseItemDTO,
): StudioPurchaseItemView | null {
  if (dto.kind !== "release" && dto.kind !== "track") return null;
  return {
    kind: dto.kind,
    title: dto.title,
    releaseId: dto.releaseId,
    trackId: dto.trackId,
    formatLabelKey: purchaseFormatLabelKey(dto.kind, dto.releaseType),
    coverUrl: dto.coverUrl,
    href: itemHrefOf(dto),
    isAvailable: dto.isAvailable,
  };
}

export function toPurchaseArtistView(
  dto: StudioPurchaseArtistDTO,
): StudioPurchaseArtistView {
  return {
    name: dto.name,
    href:
      dto.isLinkable && dto.subprofileId
        ? studioArtistPath(dto.subprofileId)
        : null,
    subprofileId: dto.subprofileId,
  };
}

/** A code this build knows reads as itself; an unknown reason fails closed as
 *  "not ready" so a row never offers a download the server refuses. */
export function toDownloadRefusalCode(
  code: string | null,
): StudioErrorCode | null {
  if (code === null) return null;
  return knownErrorCodeOf(code) ?? UNKNOWN_DOWNLOAD_REFUSAL;
}

function toDownloadTrackView(
  dto: StudioPurchaseDownloadTrackDTO,
): StudioPurchaseDownloadTrackView {
  return {
    trackId: dto.trackId,
    position: dto.position,
    title: dto.title,
    durationLabel: formatTrackTime(dto.durationSeconds),
    format: dto.format === "mp3" || dto.format === "m4a" ? dto.format : null,
    unavailableReason: toDownloadRefusalCode(dto.unavailableReason),
  };
}

function toDeclineReason(
  reason: string | null,
): StudioPurchaseDeclineReason | null {
  if (reason === null) return null;
  return isOneOf(STUDIO_PURCHASE_DECLINE_REASONS, reason) ? reason : "other";
}

/** Null when the status or item kind is unknown or `createdAt` or the
 *  amount is unreadable. */
export function toBuyerPurchaseView(
  dto: StudioBuyerPurchaseDTO,
): StudioBuyerPurchaseView | null {
  const item = toPurchaseItemView(dto.item);
  const createdAt = parsedDate(dto.createdAt);
  if (
    !item ||
    !createdAt ||
    !isReadableAmountCents(dto.amountCents) ||
    !isOneOf(STUDIO_PURCHASE_STATUSES, dto.status)
  ) {
    return null;
  }
  return {
    id: dto.id,
    status: dto.status,
    item,
    artist: toPurchaseArtistView(dto.artist),
    amountCents: dto.amountCents,
    referenceCode: dto.referenceCode,
    payerName: dto.payerName,
    declineReason: toDeclineReason(dto.declineReason),
    declineNote: dto.declineNote,
    createdAt,
    decidedAt: dto.decidedAt ? parsedDate(dto.decidedAt) : null,
    wall: {
      isOnWall: dto.wall?.isOnWall ?? false,
      shownAs: dto.wall?.shownAs
        ? toSupporterIdentityView(dto.wall.shownAs)
        : null,
      needsNewIdentity: dto.wall?.needsNewIdentity ?? false,
    },
    downloads: (dto.downloads ?? []).map(toDownloadTrackView),
  };
}

function toIdentityOptionViews(
  options: StudioSupporterOptionDTO[] | undefined,
): StudioSupporterOptionView[] {
  return (options ?? []).flatMap((option) => {
    const identity = toSupporterIdentityView(option.identity);
    return identity
      ? [{ shownAsSubprofileId: option.shownAsSubprofileId, identity }]
      : [];
  });
}

function toTrackOfferView(
  dto: StudioTrackOfferDTO,
): StudioTrackOfferView | null {
  const price = toPriceView(dto.price);
  if (!price || !isOneOf(STUDIO_OFFER_STATES, dto.state)) return null;
  return {
    trackId: dto.trackId,
    position: dto.position,
    title: dto.title,
    price,
    state: dto.state,
    refusalCode: offerRefusalCodeOf(dto.refusalCode),
    pendingPurchaseId: dto.pendingPurchaseId,
    ownedPurchaseId: dto.ownedPurchaseId,
  };
}

/** The viewer block. An `owned` or `pending` state needs the purchase it
 *  names: without a readable one the viewer reads as `refused` with no code,
 *  so the panel never renders owned with no downloads. */
function toOfferViewerView(
  dto: StudioOfferDTO["viewer"],
): StudioOfferViewerView {
  const pendingPurchase = dto.pendingPurchase
    ? toBuyerPurchaseView(dto.pendingPurchase)
    : null;
  const ownedPurchase = dto.ownedPurchase
    ? toBuyerPurchaseView(dto.ownedPurchase)
    : null;
  const state = dto.state as StudioOfferState;
  const isMissingPurchase =
    (state === "owned" && !ownedPurchase) ||
    (state === "pending" && !pendingPurchase);
  return {
    state: isMissingPurchase ? "refused" : state,
    refusalCode: isMissingPurchase ? null : offerRefusalCodeOf(dto.refusalCode),
    pendingPurchase,
    ownedPurchase,
  };
}

/** Null when the item kind or the viewer state is unknown. A refusal code
 *  outside contract 3.1 leaves `refusalCode` null, which the panel shows as
 *  the generic line. */
export function toOfferView(dto: StudioOfferDTO): StudioOfferView | null {
  const item = toPurchaseItemView(dto.item);
  if (!item || !isOneOf(STUDIO_OFFER_STATES, dto.viewer.state)) return null;
  return {
    item,
    artist: toArtistRefView(dto.artist),
    price: toPriceView(dto.price),
    viewer: toOfferViewerView(dto.viewer),
    paymentMethods: (dto.paymentMethods ?? []).flatMap(
      (method) => toPaymentMethodView(method) ?? [],
    ),
    identityOptions: toIdentityOptionViews(dto.identityOptions),
    trackOffers: (dto.trackOffers ?? []).flatMap(
      (trackOffer) => toTrackOfferView(trackOffer) ?? [],
    ),
  };
}

export function toPurchaseWallStateView(
  dto: StudioPurchaseWallStateDTO,
): StudioPurchaseWallStateView {
  return {
    isOnWall: dto.isOnWall,
    shownAsSubprofileId: dto.shownAsSubprofileId,
    shownAs: dto.shownAs ? toSupporterIdentityView(dto.shownAs) : null,
    needsNewIdentity: dto.needsNewIdentity,
    options: toIdentityOptionViews(dto.options),
  };
}

/** Null when the status or item kind is unknown or `createdAt` or the
 *  amount is unreadable. */
export function toSellerPurchaseView(
  dto: StudioSellerPurchaseDTO,
): StudioSellerPurchaseView | null {
  const item = toPurchaseItemView(dto.item);
  const createdAt = parsedDate(dto.createdAt);
  if (
    !item ||
    !createdAt ||
    !isReadableAmountCents(dto.amountCents) ||
    !isOneOf(STUDIO_PURCHASE_STATUSES, dto.status)
  ) {
    return null;
  }
  const person = dto.buyer ? toPlaylistPersonView(dto.buyer) : null;
  return {
    id: dto.id,
    status: dto.status,
    item,
    amountCents: dto.amountCents,
    referenceCode: dto.referenceCode,
    payerName: dto.payerName,
    buyer: person
      ? { name: person.name, avatarUrl: person.avatarUrl, href: person.href }
      : null,
    createdAt,
    decidedAt: dto.decidedAt ? parsedDate(dto.decidedAt) : null,
  };
}

export function toSalesTotalsView(
  dto: StudioSalesTotalsDTO,
): StudioSalesTotalsView {
  return {
    last28Days: {
      amountCents: wholeCountOf(dto.last28Days.amountCents),
      count: wholeCountOf(dto.last28Days.count),
    },
    allTime: {
      amountCents: wholeCountOf(dto.allTime.amountCents),
      count: wholeCountOf(dto.allTime.count),
    },
  };
}

/** Null when the identity kind is unknown. */
export function toWallEntryView(
  dto: StudioWallEntryDTO,
): StudioWallEntryView | null {
  const identity = toSupporterIdentityView(dto.identity);
  return identity ? { key: dto.key, identity } : null;
}

function pageOfRows<Dto, View>(
  dto: StudioPageDTO<Dto>,
  toView: (row: Dto) => View | null,
): StudioPageDTO<View> {
  return {
    items: dto.items.flatMap((row) => toView(row) ?? []),
    pageInfo: dto.pageInfo,
  };
}

/** Pages as view models, with the rows this build cannot read dropped
 *  (statuses, kinds); `pageInfo` passes through. The cursor hooks read
 *  these and map with the identity. */
export function buyerPurchaseViewsPageOf(
  dto: StudioPageDTO<StudioBuyerPurchaseDTO>,
): StudioPageDTO<StudioBuyerPurchaseView> {
  return pageOfRows(dto, toBuyerPurchaseView);
}

export function sellerPurchaseViewsPageOf(
  dto: StudioPageDTO<StudioSellerPurchaseDTO>,
): StudioPageDTO<StudioSellerPurchaseView> {
  return pageOfRows(dto, toSellerPurchaseView);
}

export function wallEntryViewsPageOf(
  dto: StudioPageDTO<StudioWallEntryDTO>,
): StudioPageDTO<StudioWallEntryView> {
  return pageOfRows(dto, toWallEntryView);
}

/** The panel shows for a price, a track for sale, a pending claim or an
 *  owned item. */
export function isBuyPanelShown(offer: StudioOfferView): boolean {
  return (
    offer.price !== null ||
    offer.trackOffers.length > 0 ||
    offer.viewer.ownedPurchase !== null ||
    offer.viewer.pendingPurchase !== null
  );
}

function errorBodyOf(error: unknown): Record<string, unknown> | null {
  if (!(error instanceof ApiError)) return null;
  const { data } = error;
  return typeof data === "object" && data !== null
    ? (data as Record<string, unknown>)
    : null;
}

/** The new price a 409 studio_purchase_price_changed carries
 *  (ApiError.data.price), else null. */
export function priceChangedPriceOf(error: unknown): StudioPriceView | null {
  const body = errorBodyOf(error);
  if (!body || body.code !== "studio_purchase_price_changed") return null;
  const price = body.price;
  if (typeof price !== "object" || price === null) return null;
  return toPriceView(price as StudioPriceDTO);
}

/** Whether "I've paid" was refused for its payment code: the code expired
 *  or belongs to another caller (400 studio_purchase_reference_invalid), or
 *  a stored code took it (409 studio_purchase_reference_taken). A new code
 *  lets the buyer claim again. */
export function isPaymentCodeRefusal(error: unknown): boolean {
  const code = errorBodyOf(error)?.code;
  return (
    code === "studio_purchase_reference_invalid" ||
    code === "studio_purchase_reference_taken"
  );
}

/** The zero-based row a payment-method refusal names (ApiError.data.index),
 *  else null. */
export function paymentMethodErrorIndexOf(error: unknown): number | null {
  const body = errorBodyOf(error);
  const index = body?.index;
  return typeof index === "number" && Number.isInteger(index) && index >= 0
    ? index
    : null;
}

/** Route 18's answer; null when the code breaks the alphabet pattern or the
 *  date is unreadable. */
export function toPurchaseReferenceView(
  dto: StudioPurchaseReferenceDTO,
): StudioPurchaseReferenceView | null {
  const expiresAt = parsedDate(dto.expiresAt);
  const hasToken =
    typeof dto.referenceToken === "string" && dto.referenceToken.trim() !== "";
  if (
    !expiresAt ||
    !hasToken ||
    !REFERENCE_CODE_PATTERN.test(dto.referenceCode)
  ) {
    return null;
  }
  return {
    referenceCode: dto.referenceCode,
    referenceToken: dto.referenceToken,
    expiresAt,
  };
}
