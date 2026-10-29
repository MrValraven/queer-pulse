import { ApiError } from "../../../shared/api/client";
import { normalizeGivingValue } from "../../communities/giving/givingValue";
import { STUDIO_PURCHASE_LIMITS } from "../studioPurchaseRules";
import type {
  CreateStudioPurchaseBody,
  DeclineStudioPurchaseBody,
  ReplaceStudioPaymentMethodsBody,
  StudioBuyerPurchaseDTO,
  StudioPaymentMethodsDTO,
  StudioPurchaseDownloadDTO,
  StudioPurchaseReferenceDTO,
  StudioPurchaseWallStateDTO,
  UpdateStudioPurchaseWallBody,
} from "./studioPurchases.types";
import { DEMO_STUDIO_ME } from "./studioDemoMe.data";
import { studioRefusal } from "./studioDemoMutations";
import {
  demoStudioPaymentMethods,
  isOwnPersona,
  lateRefusalOf,
  viewerRowsOf,
} from "./studioDemoPurchaseOffers";
import {
  DEMO_REFERENCE_CODE,
  DEMO_REFERENCE_TOKEN,
  catalogueItemOf,
  demoPurchaseStore,
  hasItemsForSale,
  ownedPersonaOf,
} from "./studioDemoPurchaseStore";
import {
  artistOfRow,
  buyerPurchaseDto,
  downloadsOf,
  wallStateOf,
} from "./studioDemoPurchaseViews";
import type { DemoPurchaseRow } from "./studioDemoPurchases.data";

const DAY_MILLISECONDS = 86_400_000;
const REFERENCE_VALID_DAYS = 7;
const DOWNLOAD_VALID_SECONDS = 900;
const REFERENCE_CODE_PATTERN = /^[2-9A-HJKMNP-Z]{6}$/;

const REFERENCE_ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";

/** A fresh six-letter code from the contract alphabet, unused by any
 *  purchase or earlier code. */
function freshReferenceCode(): string {
  const { rows, issuedReferences } = demoPurchaseStore();
  let code = "";
  do {
    code = Array.from(
      { length: 6 },
      () => REFERENCE_ALPHABET[Math.floor(Math.random() * 31)],
    ).join("");
  } while (
    issuedReferences.has(code) ||
    rows.some((row) => row.referenceCode === code)
  );
  return code;
}

const STATUS_BY_REFUSAL: Record<string, number> = {
  studio_purchase_own_persona: 403,
  studio_purchase_unavailable: 403,
};
const DOWNLOAD_GONE_REASONS = new Set([
  "studio_download_release_taken_down",
  "studio_download_artist_unavailable",
  "studio_download_track_withheld",
]);

/** A refusal whose body carries a field beyond the code, as the server sends
 *  `price` (price changed) and `index` (a payment-method row). */
function refusalWith(
  status: number,
  code: string,
  extra: Record<string, unknown>,
): ApiError {
  return new ApiError(status, code, {
    statusCode: status,
    code,
    message: code,
    ...extra,
  });
}

/** The first call after a reset answers the fixed demo code (QP4M7R); every
 *  later call answers a fresh code with its own token, so "Get a new payment
 *  code" shows a different code. */
export function demoStudioPurchaseReference(): StudioPurchaseReferenceDTO {
  const store = demoPurchaseStore();
  const isFirst = store.referencesIssued === 0;
  store.referencesIssued += 1;
  const referenceCode = isFirst ? DEMO_REFERENCE_CODE : freshReferenceCode();
  const referenceToken = isFirst
    ? DEMO_REFERENCE_TOKEN
    : `demo-reference-token-${referenceCode}`;
  store.issuedReferences.set(referenceCode, referenceToken);
  return {
    referenceCode,
    referenceToken,
    expiresAt: new Date(
      Date.now() + REFERENCE_VALID_DAYS * DAY_MILLISECONDS,
    ).toISOString(),
  };
}

const PAYMENT_ERROR_BY_KIND = {
  link: "studio_payment_link_invalid",
  mbway: "studio_payment_mbway_invalid",
  iban: "studio_payment_iban_invalid",
} as const;

export function demoPutStudioPaymentMethods(
  subprofileId: string,
  body: ReplaceStudioPaymentMethodsBody,
): StudioPaymentMethodsDTO {
  ownedPersonaOf(subprofileId);
  if (body.methods.length > STUDIO_PURCHASE_LIMITS.paymentMethodsMax) {
    throw studioRefusal(400, "studio_payment_methods_limit");
  }
  const methods = body.methods.map((method, index) => {
    const value = normalizeGivingValue(method.kind, method.value);
    if (value === null) {
      throw refusalWith(400, PAYMENT_ERROR_BY_KIND[method.kind], { index });
    }
    return {
      id: `${subprofileId}-method-${Date.now()}-${index}`,
      kind: method.kind,
      label: method.label?.trim() || null,
      value,
      note: method.note?.trim() || null,
      position: index,
    };
  });
  if (methods.length === 0 && hasItemsForSale(subprofileId)) {
    throw studioRefusal(409, "studio_payment_methods_needed_for_sale");
  }
  const store = demoPurchaseStore();
  store.methods.set(subprofileId, methods);
  store.methodsUpdatedAt.set(subprofileId, new Date().toISOString());
  return demoStudioPaymentMethods(subprofileId);
}

export function demoCreateStudioPurchase(
  body: CreateStudioPurchaseBody,
): StudioBuyerPurchaseDTO {
  const hasRelease = body.releaseId !== undefined;
  if (hasRelease === (body.trackId !== undefined)) {
    throw studioRefusal(400, "studio_purchase_item_required");
  }
  const kind = hasRelease ? "release" : "track";
  const itemId = (hasRelease ? body.releaseId : body.trackId) ?? "";
  const found = catalogueItemOf(kind, itemId);
  if (found === null)
    throw studioRefusal(404, "studio_purchase_item_not_found");
  if (isOwnPersona(found))
    throw studioRefusal(403, "studio_purchase_own_persona");
  const { owned, pending } = viewerRowsOf(kind, itemId, found);
  if (owned !== null) throw studioRefusal(409, "studio_purchase_already_owned");
  const refusal = lateRefusalOf(found);
  if (refusal !== null) {
    throw studioRefusal(STATUS_BY_REFUSAL[refusal] ?? 409, refusal);
  }
  if (
    demoPurchaseStore().issuedReferences.get(body.referenceCode) !==
      body.referenceToken ||
    !REFERENCE_CODE_PATTERN.test(body.referenceCode)
  ) {
    throw studioRefusal(400, "studio_purchase_reference_invalid");
  }
  const price = found.price;
  if (body.amountCents > STUDIO_PURCHASE_LIMITS.amountMaxCents) {
    throw studioRefusal(422, "studio_purchase_amount_above_cap");
  }
  if (price?.mode === "fixed" && body.amountCents !== price.amountCents) {
    throw refusalWith(409, "studio_purchase_price_changed", { price });
  }
  if (
    price?.mode === "name_your_price" &&
    body.amountCents < price.amountCents
  ) {
    throw studioRefusal(422, "studio_purchase_amount_below_minimum");
  }
  const isPersonaNotOwned =
    body.isOnWall &&
    body.shownAsSubprofileId !== null &&
    !DEMO_STUDIO_ME.uploadablePersonas.some(
      (persona) => persona.id === body.shownAsSubprofileId,
    );
  if (isPersonaNotOwned) {
    throw studioRefusal(403, "studio_supporter_identity_not_yours");
  }
  if (pending !== null)
    throw studioRefusal(409, "studio_purchase_pending_exists");
  const { rows } = demoPurchaseStore();
  const isCodeTaken =
    body.referenceCode !== DEMO_REFERENCE_CODE &&
    rows.some((row) => row.referenceCode === body.referenceCode);
  if (isCodeTaken) throw studioRefusal(409, "studio_purchase_reference_taken");
  const row: DemoPurchaseRow = {
    id: `demo-purchase-new-${rows.length}`,
    status: "pending",
    kind,
    itemId,
    artistId: found.artist.id,
    gone: null,
    amountCents: body.amountCents,
    referenceCode: body.referenceCode,
    payerName: body.payerName?.trim() || null,
    buyer: "viewer",
    declineReason: null,
    declineNote: null,
    createdAt: new Date().toISOString(),
    decidedAt: null,
    isOnWall: body.isOnWall,
    shownAsSubprofileId: body.isOnWall ? body.shownAsSubprofileId : null,
  };
  rows.push(row);
  return buyerPurchaseDto(row);
}

function viewerRowOf(purchaseId: string): DemoPurchaseRow {
  const row = demoPurchaseStore().rows.find(
    (candidate) => candidate.id === purchaseId && candidate.buyer === "viewer",
  );
  if (row === undefined) throw studioRefusal(404, "studio_purchase_not_found");
  return row;
}

export function demoCancelStudioPurchase(purchaseId: string): void {
  const row = viewerRowOf(purchaseId);
  if (row.status !== "pending")
    throw studioRefusal(409, "studio_purchase_not_pending");
  row.status = "cancelled";
  row.decidedAt = new Date().toISOString();
}

export function demoPutStudioPurchaseWall(
  purchaseId: string,
  body: UpdateStudioPurchaseWallBody,
): StudioPurchaseWallStateDTO {
  const row = viewerRowOf(purchaseId);
  const isOpen = row.status === "pending" || row.status === "confirmed";
  if (!isOpen || row.artistId === null) {
    throw studioRefusal(409, "studio_purchase_wall_not_available");
  }
  const isPersonaNotOwned =
    body.shownAsSubprofileId !== null &&
    !DEMO_STUDIO_ME.uploadablePersonas.some(
      (persona) => persona.id === body.shownAsSubprofileId,
    );
  if (isPersonaNotOwned) {
    throw studioRefusal(403, "studio_supporter_identity_not_yours");
  }
  row.isOnWall = body.isOnWall;
  // Turning the wall off keeps the identity choice.
  row.shownAsSubprofileId = body.shownAsSubprofileId;
  return wallStateOf(row);
}

/** The pending claim of a persona the viewer runs; the second decider of two
 *  gets the 409. */
function claimOf(subprofileId: string, purchaseId: string): DemoPurchaseRow {
  ownedPersonaOf(subprofileId);
  const row = demoPurchaseStore().rows.find(
    (candidate) =>
      candidate.id === purchaseId && candidate.artistId === subprofileId,
  );
  if (row === undefined) throw studioRefusal(404, "studio_purchase_not_found");
  if (row.status !== "pending")
    throw studioRefusal(409, "studio_purchase_not_pending");
  return row;
}

export function demoConfirmStudioPurchase(
  subprofileId: string,
  purchaseId: string,
): void {
  const row = claimOf(subprofileId, purchaseId);
  row.status = "confirmed";
  row.decidedAt = new Date().toISOString();
}

export function demoDeclineStudioPurchase(
  subprofileId: string,
  purchaseId: string,
  body: DeclineStudioPurchaseBody,
): void {
  const row = claimOf(subprofileId, purchaseId);
  row.status = "declined";
  row.decidedAt = new Date().toISOString();
  row.declineReason = body.reason;
  row.declineNote = body.note?.trim() || null;
}

/** Throws the row's refusal as the server would (410 for a gone file, 409
 *  for one that is not ready), else a link the demo cannot open. */
export function demoStudioPurchaseDownload(
  purchaseId: string,
  trackId: string,
): StudioPurchaseDownloadDTO {
  const row = viewerRowOf(purchaseId);
  if (row.status !== "confirmed") {
    throw studioRefusal(409, "studio_purchase_not_confirmed");
  }
  const track = downloadsOf(row).find(
    (candidate) => candidate.trackId === trackId,
  );
  if (track === undefined)
    throw studioRefusal(410, "studio_download_track_removed");
  if (track.unavailableReason !== null) {
    throw studioRefusal(
      DOWNLOAD_GONE_REASONS.has(track.unavailableReason) ? 410 : 409,
      track.unavailableReason,
    );
  }
  return {
    url: "about:blank",
    expiresAt: new Date(
      Date.now() + DOWNLOAD_VALID_SECONDS * 1000,
    ).toISOString(),
    fileName: `${artistOfRow(row).name} - ${track.title}.${track.format ?? "mp3"}`,
  };
}
