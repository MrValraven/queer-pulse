import type { StudioPageDTO } from "./studio.types";
import type {
  StudioBuyerPurchaseDTO,
  StudioPurchaseWallStateDTO,
  StudioSalesPendingCountDTO,
  StudioSalesTotalsDTO,
  StudioSellerPurchaseDTO,
  StudioWallEntryDTO,
} from "./studioPurchases.types";
import { STUDIO_WALL_PAGE_SIZE } from "./studioPurchases.types";
import { DEMO_STUDIO_ME } from "./studioDemoMe.data";
import { studioRefusal } from "./studioDemoMutations";
import {
  DEMO_SALES_PAGE_SIZE,
  type DemoPurchaseRow,
} from "./studioDemoPurchases.data";
import {
  catalogueItemOf,
  demoPurchaseStore,
  ownedPersonaOf,
  pageOf,
} from "./studioDemoPurchaseStore";
import {
  buyerPurchaseDto,
  sellerPurchaseDto,
  wallIdentityOf,
  wallStateOf,
} from "./studioDemoPurchaseViews";

export {
  demoReleasePriceOf,
  demoTrackPriceOf,
  resetDemoPurchases,
} from "./studioDemoPurchaseStore";
export {
  demoStudioOffer,
  demoStudioPaymentMethods,
} from "./studioDemoPurchaseOffers";

const DAY_MILLISECONDS = 86_400_000;
const SALES_WINDOW_DAYS = 28;

const newestFirst =
  (field: "createdAt" | "decidedAt") =>
  (left: DemoPurchaseRow, right: DemoPurchaseRow) =>
    (right[field] ?? "").localeCompare(left[field] ?? "") ||
    right.id.localeCompare(left.id);

export function demoMyStudioPurchases(
  status: "all" | "confirmed",
  cursor: string | null,
): StudioPageDTO<StudioBuyerPurchaseDTO> {
  const rows = demoPurchaseStore()
    .rows.filter(
      (row) =>
        row.buyer === "viewer" &&
        (status === "all" || row.status === "confirmed"),
    )
    .sort(newestFirst("createdAt"));
  return pageOf(rows.map(buyerPurchaseDto), cursor, DEMO_SALES_PAGE_SIZE);
}

/** One entry per shown identity, each at its newest confirmed purchase. */
export function demoStudioReleaseWall(
  releaseId: string,
  cursor: string | null,
): StudioPageDTO<StudioWallEntryDTO> {
  const found = catalogueItemOf("release", releaseId);
  if (found === null)
    throw studioRefusal(404, "studio_purchase_item_not_found");
  const trackIds = new Set(found.tracks.map((track) => track.id));
  const seen = new Set<string>();
  const entries = demoPurchaseStore()
    .rows.filter(
      (row) =>
        row.status === "confirmed" &&
        row.isOnWall &&
        row.buyer !== null &&
        row.itemId !== null &&
        (row.kind === "release"
          ? row.itemId === releaseId
          : trackIds.has(row.itemId)),
    )
    .sort(newestFirst("decidedAt"))
    .flatMap((row) => {
      const identityKey =
        row.shownAsSubprofileId === null
          ? `account:${row.buyer === "viewer" ? "viewer" : (row.buyer as { name: string }).name}`
          : `persona:${row.shownAsSubprofileId}`;
      if (seen.has(identityKey)) return [];
      seen.add(identityKey);
      const key =
        row.shownAsSubprofileId === null ? `account:${row.id}` : identityKey;
      return [{ key, identity: wallIdentityOf(row) }];
    });
  return pageOf(entries, cursor, STUDIO_WALL_PAGE_SIZE);
}

export function demoStudioPurchaseWall(
  purchaseId: string,
): StudioPurchaseWallStateDTO {
  const row = demoPurchaseStore().rows.find(
    (candidate) => candidate.id === purchaseId && candidate.buyer === "viewer",
  );
  if (row === undefined) throw studioRefusal(404, "studio_purchase_not_found");
  return wallStateOf(row);
}

const rowsOfPersona = (subprofileId: string, status: string) => {
  ownedPersonaOf(subprofileId);
  return demoPurchaseStore().rows.filter(
    (row) => row.artistId === subprofileId && row.status === status,
  );
};

/** Pending claims, oldest first. */
export function demoStudioPurchaseInbox(
  subprofileId: string,
  cursor: string | null,
): StudioPageDTO<StudioSellerPurchaseDTO> {
  const rows = rowsOfPersona(subprofileId, "pending").sort(
    (left, right) =>
      left.createdAt.localeCompare(right.createdAt) ||
      left.id.localeCompare(right.id),
  );
  return pageOf(rows.map(sellerPurchaseDto), cursor, DEMO_SALES_PAGE_SIZE);
}

export function demoStudioSales(
  subprofileId: string,
  cursor: string | null,
): StudioPageDTO<StudioSellerPurchaseDTO> {
  const rows = rowsOfPersona(subprofileId, "confirmed").sort(
    newestFirst("decidedAt"),
  );
  return pageOf(rows.map(sellerPurchaseDto), cursor, DEMO_SALES_PAGE_SIZE);
}

export function demoStudioSalesTotals(
  subprofileId: string,
): StudioSalesTotalsDTO {
  const rows = rowsOfPersona(subprofileId, "confirmed");
  const windowStart = new Date(
    Date.now() - SALES_WINDOW_DAYS * DAY_MILLISECONDS,
  ).toISOString();
  const totalOf = (counted: DemoPurchaseRow[]) => ({
    amountCents: counted.reduce((sum, row) => sum + row.amountCents, 0),
    count: counted.length,
  });
  return {
    last28Days: totalOf(
      rows.filter((row) => (row.decidedAt ?? "") >= windowStart),
    ),
    allTime: totalOf(rows),
  };
}

export function demoStudioSalesPendingCount(): StudioSalesPendingCountDTO {
  const byPersona = DEMO_STUDIO_ME.uploadablePersonas
    .map((persona) => ({
      subprofileId: persona.id,
      count: rowsOfPersona(persona.id, "pending").length,
    }))
    .filter((entry) => entry.count > 0);
  return {
    count: byPersona.reduce((sum, entry) => sum + entry.count, 0),
    byPersona,
  };
}
