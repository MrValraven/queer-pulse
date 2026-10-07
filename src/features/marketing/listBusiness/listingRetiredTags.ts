import type { ListingDraft } from "./listBusiness.data";
import {
  normalizeOnlineDetails,
  type OnlineFulfilment,
  type OnlinePaymentMethod,
  type OnlineSessionFormat,
} from "./listingOnline.data";
import { LISTING_TAG_GROUPS } from "./listingTags.data";

/**
 * The ten tags that became structured online fields on 2026-10-07. The
 * backend migration moved them on every stored listing; a draft saved before
 * that still carries them, and the server answers its create with "Unknown
 * listing tags". Same map as the backend's `ONLINE_TAG_MOVES_AT_MIGRATION`.
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
 * every load. A place draft is left as it is: its create body drops the
 * retired tags (`knownListingTags`).
 */
export function healRetiredOnlineTags(draft: ListingDraft): ListingDraft {
  if (!draft.online) return draft;
  const moves = draft.tags.flatMap((tag) => {
    const move = retiredTagMove(tag);
    return move ? [move] : [];
  });
  if (moves.length === 0) return draft;
  const details = normalizeOnlineDetails(draft.onlineDetails);
  const valuesFor = (field: RetiredTagMove["field"]) =>
    moves.filter((move) => move.field === field).map((move) => move.value);
  return {
    ...draft,
    tags: draft.tags.filter((tag) => retiredTagMove(tag) === undefined),
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

const KNOWN_LISTING_TAGS: ReadonlySet<string> = new Set(
  LISTING_TAG_GROUPS.flatMap((group) => [...group.tags, ...group.onlineTags]),
);

/** The tags a CREATE body may carry: the vocabulary's, place and online
 *  alike. The server refuses any other tag on a create, while an update
 *  keeps the older tags a listing already holds. */
export function knownListingTags(tags: readonly string[]): string[] {
  return tags.filter((tag) => KNOWN_LISTING_TAGS.has(tag));
}
