import { useState } from "react";
import type { UpdateGroupListingBody } from "./api/housingGroups.api";
import type { GroupListing } from "./housingGroups.data";

/**
 * Field state, validity and body builder for editing a room posted inside a
 * vetted housing group. Split out of `EditGroupListingModal` the same way
 * `useListSpaceForm` is split out of `ListSpaceModal`, so the modal stays a thin
 * orchestrator under the 200-line rule.
 *
 * The bounds mirror the backend's `CreateGroupListingDto`, which
 * `UpdateGroupListingDto` inherits: a title and neighbourhood of at least two
 * characters, a real price of at least one euro, and real accessibility
 * information. Those two are group norms rather than nice-to-haves, so the form
 * refuses to submit without them instead of letting the API reject it.
 */
export interface GroupListingForm {
  title: string;
  setTitle: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  neighbourhood: string;
  setNeighbourhood: (value: string) => void;
  price: string;
  setPrice: (value: string) => void;
  accessibilityInfo: string;
  setAccessibilityInfo: (value: string) => void;
  /** True when every norm-required field holds a usable value. */
  isValid: boolean;
  /** True when the price box holds something that is not a whole euro amount of
   *  one or more. Drives an inline field error rather than a silent 400. */
  hasPriceError: boolean;
  /**
   * True when at least one field differs from the listing as posted. Every
   * field here is moderated, so a real change always returns the listing to
   * review: the modal uses this both to gate submit and to be honest about what
   * saving costs.
   */
  hasChanges: boolean;
  buildBody: () => UpdateGroupListingBody;
}

const MIN_TEXT_LENGTH = 2;

export function useGroupListingForm(listing: GroupListing): GroupListingForm {
  const [title, setTitle] = useState(listing.title);
  const [description, setDescription] = useState(listing.description);
  const [neighbourhood, setNeighbourhood] = useState(listing.neighbourhood);
  const [price, setPrice] = useState(String(listing.priceEuros));
  const [accessibilityInfo, setAccessibilityInfo] = useState(
    listing.accessibilityInfo,
  );

  const priceEuros = Number(price.trim());
  const hasPriceError =
    price.trim().length > 0 &&
    (!Number.isInteger(priceEuros) || priceEuros < 1);

  const isValid =
    title.trim().length >= MIN_TEXT_LENGTH &&
    description.trim().length >= MIN_TEXT_LENGTH &&
    neighbourhood.trim().length >= MIN_TEXT_LENGTH &&
    accessibilityInfo.trim().length >= MIN_TEXT_LENGTH &&
    price.trim().length > 0 &&
    !hasPriceError;

  const hasChanges =
    title.trim() !== listing.title ||
    description.trim() !== listing.description ||
    neighbourhood.trim() !== listing.neighbourhood ||
    accessibilityInfo.trim() !== listing.accessibilityInfo ||
    (Number.isInteger(priceEuros) && priceEuros !== listing.priceEuros);

  const buildBody = (): UpdateGroupListingBody => ({
    title: title.trim(),
    description: description.trim(),
    neighbourhood: neighbourhood.trim(),
    priceEuros,
    accessibilityInfo: accessibilityInfo.trim(),
  });

  return {
    title,
    setTitle,
    description,
    setDescription,
    neighbourhood,
    setNeighbourhood,
    price,
    setPrice,
    accessibilityInfo,
    setAccessibilityInfo,
    isValid,
    hasPriceError,
    hasChanges,
    buildBody,
  };
}
