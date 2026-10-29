import type {
  StudioOfferDTO,
  StudioOfferState,
  StudioPaymentMethodsDTO,
  StudioTrackOfferDTO,
} from "./studioPurchases.types";
import { optionsOfViewer } from "./studioDemoYourSupporters";
import { studioRefusal } from "./studioDemoMutations";
import { DEMO_STUDIO_ME } from "./studioDemoMe.data";
import {
  catalogueItemOf,
  demoPurchaseStore,
  hasItemsForSale,
  ownedPersonaOf,
  type DemoCatalogueItem,
} from "./studioDemoPurchaseStore";
import type { DemoPurchaseRow } from "./studioDemoPurchases.data";
import { buyerPurchaseDto } from "./studioDemoPurchaseViews";

export function demoStudioPaymentMethods(
  subprofileId: string,
): StudioPaymentMethodsDTO {
  ownedPersonaOf(subprofileId);
  const { methods, methodsUpdatedAt } = demoPurchaseStore();
  const stored = methods.get(subprofileId) ?? [];
  return {
    methods: stored,
    hasItemsForSale: hasItemsForSale(subprofileId),
    updatedAt:
      stored.length > 0 ? (methodsUpdatedAt.get(subprofileId) ?? null) : null,
  };
}

export const isOwnPersona = (found: DemoCatalogueItem): boolean =>
  DEMO_STUDIO_ME.uploadablePersonas.some(
    (owned) => owned.id === found.artist.id,
  );

/** Contract 3.1 rules 4 to 8 (a block never happens in demo). */
export function lateRefusalOf(found: DemoCatalogueItem): string | null {
  if (found.price === null) return "studio_purchase_not_for_sale";
  if (found.status !== "published")
    return "studio_purchase_release_not_published";
  if (found.isTrackUnavailable) return "studio_purchase_track_unavailable";
  const methods = demoPurchaseStore().methods.get(found.artist.id) ?? [];
  return methods.length === 0 ? "studio_purchase_no_payment_methods" : null;
}

/** The viewer's confirmed purchase that covers the item, and the pending one
 *  of exactly this item (contract 4.5). */
export function viewerRowsOf(
  kind: "release" | "track",
  itemId: string,
  found: DemoCatalogueItem,
) {
  const mine = demoPurchaseStore().rows.filter((row) => row.buyer === "viewer");
  const isSameItem = (row: DemoPurchaseRow) =>
    row.itemId === itemId && row.kind === kind;
  return {
    owned:
      mine.find(
        (row) =>
          row.status === "confirmed" &&
          (isSameItem(row) ||
            (kind === "track" &&
              row.kind === "release" &&
              row.itemId === found.item.releaseId)),
      ) ?? null,
    pending:
      mine.find((row) => row.status === "pending" && isSameItem(row)) ?? null,
  };
}

function viewerStateOf(
  kind: "release" | "track",
  itemId: string,
  found: DemoCatalogueItem,
) {
  const { owned, pending } = viewerRowsOf(kind, itemId, found);
  const refusal = lateRefusalOf(found);
  const state: StudioOfferState = isOwnPersona(found)
    ? "refused"
    : owned
      ? "owned"
      : pending
        ? "pending"
        : refusal === null
          ? "can_buy"
          : "refused";
  const refusalCode =
    state !== "refused"
      ? null
      : isOwnPersona(found)
        ? "studio_purchase_own_persona"
        : refusal;
  return { state, refusalCode, owned, pending };
}

function trackOffersOf(found: DemoCatalogueItem): StudioTrackOfferDTO[] {
  return found.tracks.flatMap((track) => {
    const trackFound = catalogueItemOf("track", track.id);
    if (trackFound?.price == null) return [];
    const viewer = viewerStateOf("track", track.id, trackFound);
    return [
      {
        trackId: track.id,
        position: track.position,
        title: track.title,
        price: trackFound.price,
        state: viewer.state,
        refusalCode: viewer.refusalCode,
        pendingPurchaseId: viewer.pending?.id ?? null,
        ownedPurchaseId: viewer.owned?.id ?? null,
      },
    ];
  });
}

export function demoStudioOffer(
  kind: "release" | "track",
  itemId: string,
): StudioOfferDTO {
  const found = catalogueItemOf(kind, itemId);
  if (found === null)
    throw studioRefusal(404, "studio_purchase_item_not_found");
  const viewer = viewerStateOf(kind, itemId, found);
  const methods = demoPurchaseStore().methods.get(found.artist.id) ?? [];
  const isWaiting = viewer.state === "can_buy" || viewer.state === "pending";
  return {
    item: found.item,
    artist: found.artist,
    price: found.price,
    viewer: {
      state: viewer.state,
      refusalCode: viewer.refusalCode,
      pendingPurchase: viewer.pending ? buyerPurchaseDto(viewer.pending) : null,
      ownedPurchase: viewer.owned ? buyerPurchaseDto(viewer.owned) : null,
    },
    paymentMethods: isWaiting ? methods : [],
    identityOptions: viewer.state === "can_buy" ? optionsOfViewer() : [],
    ...(kind === "release" ? { trackOffers: trackOffersOf(found) } : {}),
  };
}
