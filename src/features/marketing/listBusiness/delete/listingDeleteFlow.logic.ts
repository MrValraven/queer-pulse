import {
  LISTING_DELETE_ACKNOWLEDGEMENTS,
  type ListingDeleteFlowVariant,
  type ListingDeleteStepKind,
} from "./listingDeleteFlow.data";

/**
 * Puts a name in the form both sides are compared in: trimmed, NFC-normalised,
 * and with typographic punctuation folded to its plain keyboard form. Curly
 * and modifier apostrophes become ', curly double quotes become ", and en and
 * em dashes become -, because iOS smart punctuation rewrites what the owner
 * types (and a stored name may carry either form).
 */
function toComparableName(name: string) {
  return name
    .trim()
    .normalize("NFC")
    .replace(/[\u2019\u2018\u02BC]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, "-");
}

/**
 * True when the typed text is exactly the listing's name. Both sides go
 * through `toComparableName`, so a stray space, a decomposed accent or a smart
 * apostrophe, quote or dash from the keyboard still matches. Capitals must
 * match as written.
 */
export function isListingNameMatch(typed: string, listingName: string) {
  const expectedName = toComparableName(listingName);
  if (!expectedName) return false;
  return toComparableName(typed) === expectedName;
}

/** True when every acknowledgement the variant asks for is ticked. */
export function areAllAcknowledged(
  variant: ListingDeleteFlowVariant,
  acknowledgedIds: ReadonlySet<string>,
) {
  return LISTING_DELETE_ACKNOWLEDGEMENTS[variant].every((acknowledgement) =>
    acknowledgedIds.has(acknowledgement.id),
  );
}

export interface ListingDeleteFlowEntries {
  acknowledgedIds: ReadonlySet<string>;
  reason: string;
  typedName: string;
}

/** Whether a step's primary action (Continue, or Delete on the last step) is
 *  allowed with what the person has entered so far. */
export function isListingDeleteStepSatisfied(
  step: ListingDeleteStepKind,
  variant: ListingDeleteFlowVariant,
  entries: ListingDeleteFlowEntries,
  listingName: string,
) {
  switch (step) {
    case "losses":
      return true;
    case "acknowledge":
      return areAllAcknowledged(variant, entries.acknowledgedIds);
    case "reason":
      return entries.reason.trim().length > 0;
    case "confirmName":
      return isListingNameMatch(entries.typedName, listingName);
  }
}
