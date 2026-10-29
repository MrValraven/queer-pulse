import {
  STUDIO_PURCHASE_LIMITS,
  isSellableReleaseType,
} from "../studioPurchaseRules";
import type { StudioPriceInput } from "./studio.types";
import { studioRefusal } from "./studioDemoMutations";
import { catalogueItemOf, demoPurchaseStore } from "./studioDemoPurchaseStore";

/** Contract 3.1 and 2.1 checks shared by both price setters. The context
 *  names the release type and the artist for an item the catalogue does not
 *  hold (a release made in the demo editor); the catalogue answers otherwise. */
export interface PriceContext {
  releaseType: string;
  artistId: string;
}
function assertPriceAllowed(
  price: StudioPriceInput | null,
  context: PriceContext | null,
): void {
  if (price === null) return;
  if (context !== null && !isSellableReleaseType(context.releaseType)) {
    throw studioRefusal(409, "studio_release_type_not_for_sale");
  }
  const [minimum, maximum] =
    price.mode === "fixed"
      ? [
          STUDIO_PURCHASE_LIMITS.fixedPriceMinCents,
          STUDIO_PURCHASE_LIMITS.priceMaxCents,
        ]
      : [
          STUDIO_PURCHASE_LIMITS.minimumPriceMinCents,
          STUDIO_PURCHASE_LIMITS.priceMaxCents,
        ];
  if (price.amountCents < minimum || price.amountCents > maximum) {
    throw studioRefusal(422, "studio_price_out_of_range");
  }
  const methods =
    context === null
      ? []
      : (demoPurchaseStore().methods.get(context.artistId) ?? []);
  if (context !== null && methods.length === 0) {
    throw studioRefusal(409, "studio_payment_methods_needed_for_sale");
  }
}

function setPrice(
  kind: "release" | "track",
  itemId: string,
  price: StudioPriceInput | null,
  context: PriceContext | undefined,
): void {
  const found = catalogueItemOf(kind, itemId);
  const known =
    context ??
    (found === null || found.item.releaseType === null
      ? null
      : { releaseType: found.item.releaseType, artistId: found.artist.id });
  assertPriceAllowed(price, known);
  const { prices, priceArtists } = demoPurchaseStore();
  const key = `${kind}:${itemId}`;
  if (price === null || known === null) {
    priceArtists.delete(key);
  } else {
    // The persona that owns the price, so the last-method check also counts
    // items made in the demo editor.
    priceArtists.set(key, known.artistId);
  }
  if (price === null) prices.delete(key);
  else prices.set(key, price);
}

/** Throws the server's 409s and 422 before anything changes. */
export const demoSetReleasePrice = (
  releaseId: string,
  price: StudioPriceInput | null,
  context?: PriceContext,
): void => setPrice("release", releaseId, price, context);
export const demoSetTrackPrice = (
  trackId: string,
  price: StudioPriceInput | null,
  context?: PriceContext,
): void => setPrice("track", trackId, price, context);
