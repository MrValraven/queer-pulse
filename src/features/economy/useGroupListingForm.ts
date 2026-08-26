import { useState } from "react";
import type { CreateGroupListingBody } from "./api/housingGroups.api";
import type { GroupListing } from "./housingGroups.data";

/**
 * Field state, validity and body builder for a room inside a vetted housing
 * group, shared by the submit form and the poster's own edit form. Split out
 * the same way `useListSpaceForm` is split out of `ListSpaceModal`, so both
 * modals stay thin orchestrators under the 200-line rule.
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
   * review: the edit modal uses this both to gate submit and to be honest about
   * what saving costs. On a blank submit form every filled field differs from
   * the empty start, so it tracks `isValid` there and never blocks a first post.
   */
  hasChanges: boolean;
  buildBody: () => CreateGroupListingBody;
}

const MIN_TEXT_LENGTH = 2;

/** A blank room, so the submit form and the edit form share one hook rather
 *  than growing a near-identical second copy. */
const BLANK_LISTING: GroupListing = {
  id: "",
  title: "",
  description: "",
  neighbourhood: "",
  priceEuros: 0,
  accessibilityInfo: "",
};

export function useGroupListingForm(listing?: GroupListing): GroupListingForm {
  const initial = listing ?? BLANK_LISTING;
  // A blank form starts with an empty price box rather than a literal "0", so
  // the member types a number instead of correcting one.
  const [title, setTitle] = useState(initial.title);
  const [description, setDescription] = useState(initial.description);
  const [neighbourhood, setNeighbourhood] = useState(initial.neighbourhood);
  const [price, setPrice] = useState(
    initial.priceEuros > 0 ? String(initial.priceEuros) : "",
  );
  const [accessibilityInfo, setAccessibilityInfo] = useState(
    initial.accessibilityInfo,
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
    title.trim() !== initial.title ||
    description.trim() !== initial.description ||
    neighbourhood.trim() !== initial.neighbourhood ||
    accessibilityInfo.trim() !== initial.accessibilityInfo ||
    (Number.isInteger(priceEuros) && priceEuros !== initial.priceEuros);

  const buildBody = (): CreateGroupListingBody => ({
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
