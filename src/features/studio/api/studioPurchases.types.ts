import type {
  StudioArtistRefDTO,
  StudioPageDTO,
  StudioPlaylistPersonDTO,
  StudioPriceDTO,
  StudioPriceInput,
} from "./studio.types";
import type {
  StudioSupporterIdentityDTO,
  StudioSupporterOptionDTO,
} from "./studioListening.types";

// Studio purchases (contract sections 2, 3 and 4.7). Kinds, statuses, states,
// decline reasons and refusal codes are typed string on the DTOs so a value
// from a newer server reaches the adapter, which narrows them. Dates are ISO
// strings.

export type { StudioPriceDTO, StudioPriceInput };

export const STUDIO_PAYMENT_METHOD_KINDS = ["link", "mbway", "iban"] as const;
export type StudioPaymentMethodKind =
  (typeof STUDIO_PAYMENT_METHOD_KINDS)[number];
export const STUDIO_PURCHASE_STATUSES = [
  "pending",
  "confirmed",
  "declined",
  "cancelled",
  "expired",
] as const;
export type StudioPurchaseStatusValue =
  (typeof STUDIO_PURCHASE_STATUSES)[number];
export const STUDIO_PURCHASE_DECLINE_REASONS = [
  "payment_not_found",
  "amount_different",
  "other",
] as const;
export type StudioPurchaseDeclineReason =
  (typeof STUDIO_PURCHASE_DECLINE_REASONS)[number];
export const STUDIO_OFFER_STATES = [
  "can_buy",
  "pending",
  "owned",
  "refused",
] as const;
export type StudioOfferState = (typeof STUDIO_OFFER_STATES)[number];
export const STUDIO_PURCHASE_PAGE_SIZE = 30;
export const STUDIO_WALL_PAGE_SIZE = 24;

/** Contract 2.2: one way to get paid, the `CommunityGivingMethodDTO` fields. */
export interface StudioPaymentMethodDTO {
  /** Regenerated on every effective save; a render key only. */
  id: string;
  kind: string;
  label: string | null;
  /** Canonical: the https URL, 9 MB WAY digits, uppercase IBAN without spaces. */
  value: string;
  note: string | null;
  /** 0 to 7. */
  position: number;
}

/** GET and PUT /studio/artists/:subprofileId/payment-methods (contract 2.2). */
export interface StudioPaymentMethodsDTO {
  /** Position ascending. */
  methods: StudioPaymentMethodDTO[];
  /** True while the persona's releases or their tracks carry a price. */
  hasItemsForSale: boolean;
  /** Latest row update; null when empty. */
  updatedAt: string | null;
}

/** PUT body (contract 2.3): replaces the whole list, array order is position. */
export interface ReplaceStudioPaymentMethodsBody {
  methods: {
    kind: StudioPaymentMethodKind;
    value: string;
    label: string | null;
    note: string | null;
  }[];
}

/** Contract 3.0. */
export interface StudioPurchaseItemDTO {
  kind: string;
  /** The live title while the item exists, else the stored snapshot. */
  title: string;
  /** A track purchase: the track's release while both exist. */
  releaseId: string | null;
  trackId: string | null;
  /** Live release type while the release exists; drives the format label. */
  releaseType: string | null;
  coverUrl: string | null;
  /** False once the release or track row is gone. */
  isAvailable: boolean;
}

/** Contract 3.0. */
export interface StudioPurchaseArtistDTO {
  /** Live display name while the persona exists, else the stored snapshot. */
  name: string;
  subprofileId: string | null;
  handle: string | null;
  /** False renders the name as plain text. */
  isLinkable: boolean;
}

/** Contract 3.2. After a persona unlink, `trackId` is a kept-track id
 *  (contract 4.7). */
export interface StudioPurchaseDownloadTrackDTO {
  trackId: string;
  position: number;
  title: string;
  durationSeconds: number | null;
  /** 'mp3' or 'm4a'; null without audio. */
  format: string | null;
  /** The code the download route would answer now; null when it downloads. */
  unavailableReason: string | null;
}

/** Contract 3.2: a purchase as its buyer reads it. */
export interface StudioBuyerPurchaseDTO {
  id: string;
  status: string;
  item: StudioPurchaseItemDTO;
  artist: StudioPurchaseArtistDTO;
  amountCents: number;
  referenceCode: string;
  payerName: string | null;
  declineReason: string | null;
  declineNote: string | null;
  createdAt: string;
  decidedAt: string | null;
  wall: {
    isOnWall: boolean;
    /** Null when isOnWall is false or the chosen persona is gone. */
    shownAs: StudioSupporterIdentityDTO | null;
    /** On the wall with a chosen persona that no longer resolves. */
    needsNewIdentity: boolean;
  };
  /** Confirmed only, else []. Position ascending. */
  downloads: StudioPurchaseDownloadTrackDTO[];
}

/** Contract 3.1. */
export interface StudioOfferViewerDTO {
  state: string;
  /** Set when state is 'refused'. */
  refusalCode: string | null;
  pendingPurchase: StudioBuyerPurchaseDTO | null;
  /** The confirmed purchase that grants this item. */
  ownedPurchase: StudioBuyerPurchaseDTO | null;
}

/** Contract 3.1: one priced track of a release offer. */
export interface StudioTrackOfferDTO {
  trackId: string;
  position: number;
  title: string;
  price: StudioPriceDTO;
  state: string;
  refusalCode: string | null;
  pendingPurchaseId: string | null;
  ownedPurchaseId: string | null;
}

/** GET /studio/releases/:releaseId/offer and /studio/tracks/:trackId/offer. */
export interface StudioOfferDTO {
  item: StudioPurchaseItemDTO;
  artist: StudioArtistRefDTO;
  price: StudioPriceDTO | null;
  viewer: StudioOfferViewerDTO;
  /** Only while viewer.state is 'can_buy' or 'pending'; [] otherwise. */
  paymentMethods: StudioPaymentMethodDTO[];
  /** "Your account" first, then the caller's personas; [] unless can_buy. */
  identityOptions: StudioSupporterOptionDTO[];
  /** Release offer only, position ascending; absent on the track offer. */
  trackOffers?: StudioTrackOfferDTO[];
}

/** POST /studio/purchases/reference-code (route 18, contract 4.4). */
export interface StudioPurchaseReferenceDTO {
  referenceCode: string;
  referenceToken: string;
  /** Seven days after issue. */
  expiresAt: string;
}

/** POST /studio/purchases (contract 3.2): exactly one of the two item ids. */
export interface CreateStudioPurchaseBody {
  releaseId?: string;
  trackId?: string;
  amountCents: number;
  payerName: string | null;
  isOnWall: boolean;
  /** Required key; null shows the account. */
  shownAsSubprofileId: string | null;
  referenceCode: string;
  referenceToken: string;
}

/** GET and PUT /studio/purchases/:purchaseId/wall (contract 3.4). */
export interface StudioPurchaseWallStateDTO {
  isOnWall: boolean;
  /** Null shows the account. */
  shownAsSubprofileId: string | null;
  shownAs: StudioSupporterIdentityDTO | null;
  needsNewIdentity: boolean;
  options: StudioSupporterOptionDTO[];
}

/** PUT body; the key is required and null shows the account. */
export interface UpdateStudioPurchaseWallBody {
  isOnWall: boolean;
  shownAsSubprofileId: string | null;
}

/** GET /studio/releases/:releaseId/wall (contract 3.5), 24 per page. */
export interface StudioWallEntryDTO {
  /** 'account:' plus an opaque key, or 'persona:' plus the persona id. */
  key: string;
  identity: StudioSupporterIdentityDTO;
}

export type StudioWallPageDTO = StudioPageDTO<StudioWallEntryDTO>;

/** Contract 3.8: a purchase as the persona members read it. */
export interface StudioSellerPurchaseDTO {
  id: string;
  status: string;
  item: StudioPurchaseItemDTO;
  amountCents: number;
  referenceCode: string;
  payerName: string | null;
  /** Always the account, whatever the wall choice; null is a deleted account. */
  buyer: StudioPlaylistPersonDTO | null;
  createdAt: string;
  decidedAt: string | null;
}

/** POST .../purchases/:purchaseId/decline body (contract 3.9). */
export interface DeclineStudioPurchaseBody {
  reason: StudioPurchaseDeclineReason;
  note: string | null;
}

/** GET /studio/artists/:subprofileId/sales/totals (contract 3.10). */
export interface StudioSalesTotalsDTO {
  /** Confirmed in the last 28 days. */
  last28Days: { amountCents: number; count: number };
  allTime: { amountCents: number; count: number };
}

/** GET /studio/sales/pending-count (contract 3.11). */
export interface StudioSalesPendingCountDTO {
  /** The menu dot. */
  count: number;
  /** Count above 0 only. */
  byPersona: { subprofileId: string; count: number }[];
}

/** GET /studio/purchases/:purchaseId/tracks/:trackId/download (contract 3.7). */
export interface StudioPurchaseDownloadDTO {
  /** Presigned GET with an attachment disposition. */
  url: string;
  expiresAt: string;
  fileName: string;
}

/** The 409 body of studio_purchase_price_changed: the sheet reads the new price. */
export interface StudioPriceChangedErrorBody {
  statusCode: number;
  code: "studio_purchase_price_changed";
  message: string;
  price: StudioPriceDTO;
}

/** A payment-method row refusal: `index` is the zero-based row. */
export interface StudioPaymentMethodErrorBody {
  statusCode: number;
  code: string;
  message: string;
  index: number;
}
