import { useCallback, useState } from "react";
import {
  HOUSING_CITY,
  type CreateHousingListingBody,
} from "./api/housingListing.api";

/**
 * One photo staged on the "list a space" form.
 *
 * `reference` is what goes on the wire in `gallery`: the private storage key a
 * presigned upload returned, or the resolved `/files/<key>` URL an existing
 * listing was read back with (the backend normalises that form back to the key
 * and re-accepts it, which is how the edit flow re-saves photos it did not
 * just upload). In demo mode it is a local blob URL, and demo mode never
 * submits to the network.
 *
 * `previewUrl` is always locally renderable, so a picked photo appears the
 * instant it finishes processing.
 */
export interface ListSpacePhoto {
  reference: string;
  previewUrl: string;
}

/** The backend accepts at most 8 gallery photos (`CreateHousingListingDto`). */
export const LIST_SPACE_MAX_PHOTOS = 8;

/** Every field the form holds. One object so the hook stays small and the
 * fields render from a single `values` bag instead of a dozen threaded props. */
export interface ListSpaceValues {
  title: string;
  /** The NEIGHBOURHOOD. The city is a constant, never typed here. */
  area: string;
  /**
   * The full street address. Optional, and PRIVATE: the backend hands it out
   * only to the lister, a moderator, a connected member, or someone whose
   * viewing the lister accepted. Blank clears a stored address (and the exact
   * map pin derived from it), which is why it is always sent rather than
   * conditionally spread.
   */
  addressLine: string;
  rent: string;
  /**
   * Up-front deposit in euros, as typed. Blank means "not stated", which the
   * board reads as unknown and never as zero, so a blank keeps the listing out
   * of a renter's deposit-capped search rather than into it. Blanking it on the
   * edit form CLEARS a stored deposit, which is why `buildBody` always sends
   * the field rather than dropping it when empty.
   */
  deposit: string;
  type: string;
  bedrooms: string;
  accessibility: string;
  virtualTour: string;
  /** One-line card summary. Falls back to the opening of `description`. */
  blurb: string;
  description: string;
  /** YYYY-MM-DD, or "" for available now. */
  availableFrom: string;
  minStayMonths: string;
  billsIncluded: boolean;
  isAgent: boolean;
  features: string[];
  idealFor: string[];
  photos: ListSpacePhoto[];
}

export interface ListSpaceForm {
  values: ListSpaceValues;
  setField: <Key extends keyof ListSpaceValues>(
    key: Key,
    value: ListSpaceValues[Key],
  ) => void;
  /** Adds or removes one value in `features`/`idealFor`. */
  toggleChip: (key: "features" | "idealFor", value: string) => void;
  addPhoto: (photo: ListSpacePhoto) => void;
  removePhoto: (reference: string) => void;
  isValid: boolean;
  /** True when a non-empty tour link isn't a valid https URL. Drives an inline
   * field error without blocking submit for the empty (optional) case. */
  isVirtualTourInvalid: boolean;
  buildBody: () => CreateHousingListingBody;
}

/** Whether a non-empty tour link is a usable https URL (the same shape the
 * backend validates). Empty is fine, the field is optional. */
function isHttpsUrl(value: string): boolean {
  try {
    return new URL(value.trim()).protocol === "https:";
  } catch {
    return false;
  }
}

/** The card summary the board renders. A lister who wrote a description and
 * skipped the summary gets their own opening words rather than a blank card. */
function resolveBlurb(values: ListSpaceValues): string {
  const written = values.blurb.trim();
  if (written.length > 0) return written.slice(0, 200);
  return values.description.trim().slice(0, 200);
}

const EMPTY_VALUES: ListSpaceValues = {
  title: "",
  area: "",
  addressLine: "",
  rent: "",
  deposit: "",
  type: "",
  bedrooms: "",
  accessibility: "",
  virtualTour: "",
  blurb: "",
  description: "",
  availableFrom: "",
  minStayMonths: "",
  billsIncluded: false,
  isAgent: false,
  features: [],
  idealFor: [],
  photos: [],
};

/** Seeds the form with an existing listing's values. The edit flow's only
 * difference from create (`MyHousingListingsPage`'s edit modal passes this;
 * omitting it, as every create-flow caller does, is the original blank form). */
export type ListSpaceFormInitial = Partial<ListSpaceValues>;

/**
 * Field state, validity and the request-body builder for the "list a space"
 * form. Split out of `ListSpaceModal` so the modal stays a thin orchestrator
 * (submit / step-up / success) and the fields render from one `form` object.
 *
 * The form now sends everything the detail page renders: photos, the long
 * description, the move-in date, the minimum stay, the features and the
 * "ideal for" chips. It also separates the city from the neighbourhood. It
 * used to send `city: area.trim()`, which put "Arroios" in the city column and
 * degraded saved-search matching, since a saved search matches on area AND
 * city. Lisbon is the only city this product serves, so the city is a constant
 * rather than a field anyone fills in.
 */
export function useListSpaceForm(
  initial: ListSpaceFormInitial = {},
): ListSpaceForm {
  const [values, setValues] = useState<ListSpaceValues>(() => ({
    ...EMPTY_VALUES,
    ...initial,
  }));

  const setField = useCallback(
    <Key extends keyof ListSpaceValues>(
      key: Key,
      value: ListSpaceValues[Key],
    ) => {
      setValues((current) => ({ ...current, [key]: value }));
    },
    [],
  );

  const toggleChip = useCallback(
    (key: "features" | "idealFor", value: string) => {
      setValues((current) => {
        const chips = current[key];
        return {
          ...current,
          [key]: chips.includes(value)
            ? chips.filter((chip) => chip !== value)
            : [...chips, value],
        };
      });
    },
    [],
  );

  const addPhoto = useCallback((photo: ListSpacePhoto) => {
    setValues((current) =>
      current.photos.length >= LIST_SPACE_MAX_PHOTOS
        ? current
        : { ...current, photos: [...current.photos, photo] },
    );
  }, []);

  const removePhoto = useCallback((reference: string) => {
    setValues((current) => ({
      ...current,
      photos: current.photos.filter((photo) => photo.reference !== reference),
    }));
  }, []);

  const isVirtualTourInvalid =
    values.virtualTour.trim().length > 0 && !isHttpsUrl(values.virtualTour);

  const isValid =
    values.title.trim().length > 3 &&
    values.area.trim().length > 1 &&
    !!values.rent &&
    !!values.type &&
    values.accessibility.trim().length > 3 &&
    !isVirtualTourInvalid;

  const buildBody = useCallback((): CreateHousingListingBody => {
    const trimmedTour = values.virtualTour.trim();
    const trimmedBedrooms = values.bedrooms.trim();
    const trimmedDeposit = values.deposit.trim();
    const trimmedMinStay = values.minStayMonths.trim();
    const trimmedDescription = values.description.trim();
    const blurb = resolveBlurb(values);
    return {
      type: values.type as CreateHousingListingBody["type"],
      title: values.title.trim(),
      city: HOUSING_CITY,
      area: values.area.trim(),
      // Always sent, including empty: an omitted field would leave a stored
      // address in place forever, so a lister could never take their exact
      // address back off the record.
      addressLine: values.addressLine.trim(),
      rentEuros: Number(values.rent),
      // Always sent, like `addressLine` above and for the same reason. A blank
      // is an explicit `null` ("not stated"), never a 0, which would claim
      // there is no deposit to pay. Omitting the key on a blank looked
      // harmless, but this body is also the EDIT body
      // (`EditHousingListingModal`), and the backend's PATCH applies only the
      // keys that are present: a lister who set a deposit by mistake, or whose
      // deposit went away, could never take it back off. A deposit is a money
      // term renters filter on, so a stale one is worse than none.
      depositEuros: trimmedDeposit !== "" ? Number(trimmedDeposit) : null,
      ...(trimmedBedrooms !== "" ? { bedrooms: Number(trimmedBedrooms) } : {}),
      accessibilityInfo: values.accessibility.trim(),
      billsIncluded: values.billsIncluded,
      listerKind: values.isAgent ? "agent" : "member",
      ...(blurb !== "" ? { blurb } : {}),
      ...(trimmedDescription !== "" ? { description: trimmedDescription } : {}),
      ...(values.availableFrom ? { availableFrom: values.availableFrom } : {}),
      ...(trimmedMinStay !== ""
        ? { minStayMonths: Number(trimmedMinStay) }
        : {}),
      ...(values.features.length ? { features: values.features } : {}),
      ...(values.idealFor.length ? { idealFor: values.idealFor } : {}),
      ...(values.photos.length
        ? { gallery: values.photos.map((photo) => photo.reference) }
        : {}),
      ...(trimmedTour !== "" ? { virtualTourUrl: trimmedTour } : {}),
    };
  }, [values]);

  return {
    values,
    setField,
    toggleChip,
    addPhoto,
    removePhoto,
    isValid,
    isVirtualTourInvalid,
    buildBody,
  };
}
