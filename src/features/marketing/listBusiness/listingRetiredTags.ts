import type { ListingDraft } from "./listBusiness.data";
import {
  normalizeOnlineDetails,
  type OnlineFulfilment,
  type OnlinePaymentMethod,
  type OnlineSessionFormat,
} from "./listingOnline.data";

/**
 * The two keys a draft saved before 2026-10-08 can still carry. `ListingDraft`
 * no longer has them; the healers read them through this type, and
 * `healLegacyListingDraft` removes them.
 */
export interface LegacyListingDraftFields {
  tags?: unknown;
  goodFor?: unknown;
}

/** A legacy list slot read defensively: its strings, or none. */
export function legacyStringList(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((entry): entry is string => typeof entry === "string")
    : [];
}

/**
 * The ten tags that became structured online fields on 2026-10-07. The
 * backend migration moved them on every stored listing; a draft saved before
 * that still carries them. Since 2026-10-08 the server ignores `tags`, and a
 * create's attributes must be ones the listing's kind and categories are
 * offered (server rules 2 and 7), so a retired tag survives only once moved
 * to its online field here. Same map as the backend's
 * `ONLINE_TAG_MOVES_AT_MIGRATION`.
 */
type RetiredTagMove =
  | { field: "fulfilment"; value: OnlineFulfilment }
  | { field: "payments"; value: OnlinePaymentMethod }
  | { field: "sessionFormats"; value: OnlineSessionFormat };

export const RETIRED_ONLINE_TAG_MOVES: Readonly<
  Record<string, RetiredTagMove>
> = {
  "Ships to Portugal": { field: "fulfilment", value: "shipsPortugal" },
  "Ships across the EU": { field: "fulfilment", value: "shipsEu" },
  "Ships worldwide": { field: "fulfilment", value: "shipsWorldwide" },
  "Pick-up in Lisbon": { field: "fulfilment", value: "pickupLisbon" },
  "Digital downloads": { field: "fulfilment", value: "digital" },
  "MB WAY": { field: "payments", value: "mbway" },
  Multibanco: { field: "payments", value: "multibanco" },
  PayPal: { field: "payments", value: "paypal" },
  "Video sessions": { field: "sessionFormats", value: "video" },
  "Phone sessions": { field: "sessionFormats", value: "phone" },
};

function retiredTagMove(tag: string): RetiredTagMove | undefined {
  return Object.hasOwn(RETIRED_ONLINE_TAG_MOVES, tag)
    ? RETIRED_ONLINE_TAG_MOVES[tag]
    : undefined;
}

/**
 * A resumed online draft with its retired tags moved into the online block
 * (how people get it, payments, session formats) and out of `tags`. Returns
 * the same draft when there is nothing to move, so a caller can run it on
 * every load. A place draft is left as it is: the attribute healer
 * (`healLegacyListingDraft`) drops the retired tags with the rest of the
 * legacy keys.
 */
export function healRetiredOnlineTags(
  draft: ListingDraft & LegacyListingDraftFields,
): ListingDraft & LegacyListingDraftFields {
  if (!draft.online) return draft;
  const tags = legacyStringList(draft.tags);
  const moves = tags.flatMap((tag) => {
    const move = retiredTagMove(tag);
    return move ? [move] : [];
  });
  if (moves.length === 0) return draft;
  const details = normalizeOnlineDetails(draft.onlineDetails);
  const valuesFor = (field: RetiredTagMove["field"]) =>
    moves.filter((move) => move.field === field).map((move) => move.value);
  return {
    ...draft,
    tags: tags.filter((tag) => retiredTagMove(tag) === undefined),
    // Through the normaliser again: known values once each, canonical order.
    onlineDetails: normalizeOnlineDetails({
      ...details,
      fulfilment: [...details.fulfilment, ...valuesFor("fulfilment")],
      payments: [...details.payments, ...valuesFor("payments")],
      sessionFormats: [
        ...details.sessionFormats,
        ...valuesFor("sessionFormats"),
      ],
    }),
  };
}
