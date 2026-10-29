import { apiGet, apiPost, apiPut } from "../../../shared/api/client";
import type { StudioPageDTO } from "./studio.types";
import type {
  CreateStudioPurchaseBody,
  DeclineStudioPurchaseBody,
  ReplaceStudioPaymentMethodsBody,
  StudioBuyerPurchaseDTO,
  StudioOfferDTO,
  StudioPaymentMethodsDTO,
  StudioPurchaseDownloadDTO,
  StudioPurchaseReferenceDTO,
  StudioPurchaseWallStateDTO,
  StudioSalesPendingCountDTO,
  StudioSalesTotalsDTO,
  StudioSellerPurchaseDTO,
  StudioWallEntryDTO,
  UpdateStudioPurchaseWallBody,
} from "./studioPurchases.types";

// One raw call per route of the Studio purchases contract (sections 2 to 4).
// Dates stay ISO strings; the adapters turn the answers into view models.

const segment = (id: string) => encodeURIComponent(id);

/** A query string from the entries that carry a value; empty without any. */
function queryStringOf(entries: [string, string | null][]): string {
  const params = new URLSearchParams();
  for (const [name, value] of entries) {
    if (value !== null) params.set(name, value);
  }
  const text = params.toString();
  return text === "" ? "" : `?${text}`;
}

/** GET /studio/releases/:releaseId/offer and /studio/tracks/:trackId/offer. */
export const getStudioOffer = (kind: "release" | "track", itemId: string) =>
  apiGet<StudioOfferDTO>(
    `/studio/${kind === "release" ? "releases" : "tracks"}/${segment(itemId)}/offer`,
  );

/** GET /studio/artists/:subprofileId/payment-methods. */
export const getStudioPaymentMethods = (subprofileId: string) =>
  apiGet<StudioPaymentMethodsDTO>(
    `/studio/artists/${segment(subprofileId)}/payment-methods`,
  );

/** PUT /studio/artists/:subprofileId/payment-methods replaces the list. */
export const putStudioPaymentMethods = (
  subprofileId: string,
  body: ReplaceStudioPaymentMethodsBody,
) =>
  apiPut<StudioPaymentMethodsDTO>(
    `/studio/artists/${segment(subprofileId)}/payment-methods`,
    body,
  );

/** POST /studio/purchases ("I've paid"). */
export const postStudioPurchase = (body: CreateStudioPurchaseBody) =>
  apiPost<StudioBuyerPurchaseDTO>("/studio/purchases", body);

/** POST /studio/purchases/:purchaseId/cancel, 204. */
export const postStudioPurchaseCancel = (purchaseId: string) =>
  apiPost<void>(`/studio/purchases/${segment(purchaseId)}/cancel`);

/** GET /studio/purchases/:purchaseId/wall. */
export const getStudioPurchaseWall = (purchaseId: string) =>
  apiGet<StudioPurchaseWallStateDTO>(
    `/studio/purchases/${segment(purchaseId)}/wall`,
  );

/** PUT /studio/purchases/:purchaseId/wall. */
export const putStudioPurchaseWall = (
  purchaseId: string,
  body: UpdateStudioPurchaseWallBody,
) =>
  apiPut<StudioPurchaseWallStateDTO>(
    `/studio/purchases/${segment(purchaseId)}/wall`,
    body,
  );

/** GET /studio/releases/:releaseId/wall, 24 per page. */
export const getStudioReleaseWall = (
  releaseId: string,
  cursor: string | null,
) =>
  apiGet<StudioPageDTO<StudioWallEntryDTO>>(
    `/studio/releases/${segment(releaseId)}/wall${queryStringOf([["cursor", cursor]])}`,
  );

/** GET /me/studio-purchases, outside the Studio gate. The status goes on only
 *  for "confirmed" (the account page). */
export const getMyStudioPurchases = (
  status: "all" | "confirmed",
  cursor: string | null,
) =>
  apiGet<StudioPageDTO<StudioBuyerPurchaseDTO>>(
    `/me/studio-purchases${queryStringOf([
      ["status", status === "confirmed" ? status : null],
      ["cursor", cursor],
    ])}`,
  );

/** GET /studio/purchases/:purchaseId/tracks/:trackId/download, outside the
 *  Studio gate. */
export const getStudioPurchaseDownload = (
  purchaseId: string,
  trackId: string,
) =>
  apiGet<StudioPurchaseDownloadDTO>(
    `/studio/purchases/${segment(purchaseId)}/tracks/${segment(trackId)}/download`,
  );

/** GET /studio/artists/:subprofileId/purchases (To confirm, oldest first). */
export const getStudioPurchaseInbox = (
  subprofileId: string,
  cursor: string | null,
) =>
  apiGet<StudioPageDTO<StudioSellerPurchaseDTO>>(
    `/studio/artists/${segment(subprofileId)}/purchases${queryStringOf([["cursor", cursor]])}`,
  );

/** POST /studio/artists/:subprofileId/purchases/:purchaseId/confirm, 204. */
export const postStudioPurchaseConfirm = (
  subprofileId: string,
  purchaseId: string,
) =>
  apiPost<void>(
    `/studio/artists/${segment(subprofileId)}/purchases/${segment(purchaseId)}/confirm`,
  );

/** POST /studio/artists/:subprofileId/purchases/:purchaseId/decline, 204. */
export const postStudioPurchaseDecline = (
  subprofileId: string,
  purchaseId: string,
  body: DeclineStudioPurchaseBody,
) =>
  apiPost<void>(
    `/studio/artists/${segment(subprofileId)}/purchases/${segment(purchaseId)}/decline`,
    body,
  );

/** GET /studio/artists/:subprofileId/sales, newest first. */
export const getStudioSales = (subprofileId: string, cursor: string | null) =>
  apiGet<StudioPageDTO<StudioSellerPurchaseDTO>>(
    `/studio/artists/${segment(subprofileId)}/sales${queryStringOf([["cursor", cursor]])}`,
  );

/** GET /studio/artists/:subprofileId/sales/totals. */
export const getStudioSalesTotals = (subprofileId: string) =>
  apiGet<StudioSalesTotalsDTO>(
    `/studio/artists/${segment(subprofileId)}/sales/totals`,
  );

/** GET /studio/sales/pending-count across every persona of the caller. */
export const getStudioSalesPendingCount = () =>
  apiGet<StudioSalesPendingCountDTO>("/studio/sales/pending-count");

/** POST /studio/purchases/reference-code (route 18): a fresh payment code,
 *  nothing stored. The body is empty. */
export const postStudioPurchaseReference = () =>
  apiPost<StudioPurchaseReferenceDTO>("/studio/purchases/reference-code", {});

/** The signed link as the browser may follow it: a string URL over https
 *  (http only in dev). Anything else throws, so a malformed or hostile link
 *  (`javascript:`, `data:`) never reaches `window.location`. */
export function toDownloadLinkView(dto: StudioPurchaseDownloadDTO): string {
  const url: unknown = dto?.url;
  if (typeof url !== "string")
    throw new Error("The download link from the server is missing its address");
  let protocol: string;
  try {
    protocol = new URL(url).protocol;
  } catch {
    throw new Error("The download link from the server is not a web address");
  }
  const isAllowed =
    protocol === "https:" || (import.meta.env.DEV && protocol === "http:");
  if (!isAllowed)
    throw new Error(
      `The download link from the server uses the ${protocol} protocol, which the browser will not follow`,
    );
  return url;
}
