import {
  ANCHOR,
  anyDayOpen,
  hoursExceptionsValid,
  hoursValid,
  type ListingDraft,
  type MissingField,
} from "./listBusiness.data";
import { listingKindOf, normalizeMobileDetails } from "./listingMobile.data";

const KEY = "marketing:listBusiness.missing";

function field(name: string, anchor: string): MissingField {
  return { labelKey: `${KEY}.${name}`, anchor };
}

export interface MobileMissingFields {
  step1: MissingField[];
  step3: MissingField[];
}

/**
 * What an out-and-about listing still needs, per wizard step. Kept apart
 * from `useListingFormMissing` (like the online rules) so the hook stays one
 * list per step and these stay testable without React.
 *
 * - Step 1: at least one parish once "Some parishes" is picked.
 * - Step 3: a ticked meeting point needs its neighbourhood (anchored on the
 *   meeting point block, which holds the field), an address and a pin. A
 *   claim needs an open day or "By appointment only". The hours checks run
 *   only while hours are kept: by appointment sends none.
 */
export function mobileMissingFields(draft: ListingDraft): MobileMissingFields {
  const step1: MissingField[] = [];
  const step3: MissingField[] = [];
  if (listingKindOf(draft) !== "mobile") return { step1, step3 };

  const details = normalizeMobileDetails(draft.mobileDetails);
  if (!details.allOfCity && details.parishes.length === 0) {
    step1.push(field("parishes", ANCHOR.whereYouWork));
  }

  if (draft.hasMeetingPoint === true) {
    if (!draft.hood) step3.push(field("hood", ANCHOR.meetingPoint));
    if (!draft.address.trim()) step3.push(field("address", ANCHOR.address));
    if (draft.latitude === null || draft.longitude === null) {
      step3.push(field("pin", ANCHOR.address));
    }
  }

  if (!details.byAppointment) {
    if (draft.path === "claim" && !anyDayOpen(draft.hours)) {
      step3.push(field("hoursOrAppointment", ANCHOR.byAppointment));
    }
    if (!hoursValid(draft.hours)) {
      step3.push(field("hoursInvalid", ANCHOR.hours));
    }
    if (!hoursExceptionsValid(draft.hoursExceptions ?? [])) {
      step3.push(field("hoursExceptionsInvalid", ANCHOR.hoursExceptions));
    }
  }
  return { step1, step3 };
}
