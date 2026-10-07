import {
  FULFILMENT_LABEL_KEYS,
  MAIN_LINK_KIND_LABEL_KEYS,
  normalizeOnlineDetails,
  ONLINE_LINK_PLATFORM_DEFINITIONS,
  PAYMENT_LABEL_KEYS,
  REGISTRATION_BODY_LABEL_KEYS,
  SESSION_FORMAT_LABEL_KEYS,
  SHIPS_FROM_LABEL_KEYS,
  toPublicOnlineDetails,
  type ListingPublicOnlineDetails,
} from "../../listingOnline.data";
import type { ListingShopItem } from "../../listingShop.data";
import type { RestoreFieldChange, RestoreRowChange } from "./restoreDiff.types";
import {
  fieldLabelKey,
  isFieldChanged,
  LIST_SEPARATOR,
  yesNoLabel,
  type RestoreDiffContext,
} from "./restoreDiffFields.data";
import {
  changedRow,
  pairsByPosition,
  summaryOf,
  untitled,
} from "./restoreDiffRowParts.data";

/**
 * The online block as the review shows it: one entry per answer that differs,
 * each under the label the form gives it, so "How people buy from you" never
 * arrives as one unreadable blob. The comparison runs on the wire shape, so a
 * regenerated link row id never counts as a change.
 */
export function onlineDetailsFields(
  context: RestoreDiffContext,
): RestoreFieldChange[] {
  if (!isFieldChanged(context, "onlineDetails")) return [];
  const { t } = context;
  const before = toPublicOnlineDetails(
    normalizeOnlineDetails(context.current.onlineDetails),
  );
  const after = toPublicOnlineDetails(
    normalizeOnlineDetails(context.saved.onlineDetails),
  );
  const entries: RestoreFieldChange[] = [];
  const choice = (
    name: string,
    describe: (details: ListingPublicOnlineDetails) => string,
  ) => {
    const beforeText = describe(before);
    const afterText = describe(after);
    if (beforeText === afterText) return;
    entries.push({
      kind: "choice",
      key: `onlineDetails.${name}`,
      labelKey: fieldLabelKey(name),
      before: beforeText,
      after: afterText,
    });
  };
  const labels = (values: readonly string[], keys: Record<string, string>) =>
    values.map((value) => t(keys[value] ?? value)).join(LIST_SEPARATOR);

  choice("mainLink", (details) =>
    details.mainLink
      ? `${t(MAIN_LINK_KIND_LABEL_KEYS[details.mainLink.kind])}: ${details.mainLink.url}`
      : "",
  );
  choice("moreLinks", (details) =>
    details.moreLinks
      .map(
        (link) =>
          `${t(ONLINE_LINK_PLATFORM_DEFINITIONS[link.platform].labelKey)}: ${link.url}`,
      )
      .join(LIST_SEPARATOR),
  );
  choice("fulfilment", (details) =>
    labels(details.fulfilment, FULFILMENT_LABEL_KEYS),
  );
  choice("pickupNote", (details) => details.pickupNote);
  choice("shipsFrom", (details) =>
    details.shipsFrom ? t(SHIPS_FROM_LABEL_KEYS[details.shipsFrom]) : "",
  );
  choice("isVatIncluded", (details) => yesNoLabel(t, details.isVatIncluded));
  choice("payments", (details) => labels(details.payments, PAYMENT_LABEL_KEYS));
  choice("sessionFormats", (details) =>
    labels(details.sessionFormats, SESSION_FORMAT_LABEL_KEYS),
  );
  // A number typed before a body was picked still reads, so a change to it
  // is listed under its own label.
  choice("registration", (details) =>
    `${details.registration.body ? t(REGISTRATION_BODY_LABEL_KEYS[details.registration.body]) : ""} ${details.registration.number}`.trim(),
  );
  choice("replyNote", (details) => details.replyNote);
  return entries;
}

function shopItemSummary(item: ListingShopItem): string {
  return summaryOf([item.name, item.price, item.link, item.photo?.alt ?? ""]);
}

function isSameShopItem(
  first: ListingShopItem,
  second: ListingShopItem,
): boolean {
  return (
    first.name === second.name &&
    first.price === second.price &&
    first.link === second.link &&
    (first.photo?.image ?? "") === (second.photo?.image ?? "") &&
    (first.photo?.alt ?? "") === (second.photo?.alt ?? "")
  );
}

/** Matched on position, like services: the review lists what each slot of
 *  the shop would read. */
export function shopItemRows(context: RestoreDiffContext): RestoreRowChange[] {
  const { t } = context;
  return pairsByPosition(
    context.current.shopItems ?? [],
    context.saved.shopItems ?? [],
  ).flatMap((pair) => {
    if (pair.before && pair.after && isSameShopItem(pair.before, pair.after))
      return [];
    return [
      changedRow(
        `shopItems.${pair.position}`,
        untitled(t, (pair.after ?? pair.before)!.name),
        pair.before ? shopItemSummary(pair.before) : null,
        pair.after ? shopItemSummary(pair.after) : null,
      ),
    ];
  });
}
