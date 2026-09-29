import type { TFunction } from "../../shared/i18n/types";
import type { ListingQueueRow } from "./api/adminListings.api";

type ProvenanceFields = Pick<
  ListingQueueRow,
  "submitterName" | "suggesterName" | "addedByStaffName"
>;

/** True for a listing staff added through "Add a listing" that nobody owns
 *  or suggested yet. */
function isStaffAuthoredOwnerless(row: ProvenanceFields): boolean {
  return !row.submitterName && !row.suggesterName && !!row.addedByStaffName;
}

/**
 * Where a queue row came from, shared by the row and the preview drawer so
 * the two read the same. Four cases, in order:
 * - an owner: "Owned by {name}";
 * - a member's suggestion nobody owns yet: "Suggested by {name} · No owner yet";
 * - a listing staff added through "Add a listing": "Added by {name} (staff) · No owner yet";
 * - none of the above: "No owner yet". This is typically a listing whose
 *   owner erased their account.
 */
export function listingProvenanceLabel(
  row: ProvenanceFields,
  t: TFunction,
): string {
  if (row.submitterName) {
    return t("admin:adminListings.provenance.ownedBy", {
      name: row.submitterName,
    });
  }
  const noOwnerYet = t("admin:adminListings.provenance.noOwnerYet");
  if (row.suggesterName) {
    const suggestedBy = t("admin:adminListings.suggestedBy", {
      name: row.suggesterName,
    });
    return `${suggestedBy} · ${noOwnerYet}`;
  }
  if (row.addedByStaffName) {
    const addedByStaff = t("admin:adminListings.provenance.addedByStaff", {
      name: row.addedByStaffName,
    });
    return `${addedByStaff} · ${noOwnerYet}`;
  }
  return noOwnerYet;
}

/**
 * The age part of a queue row's meta line. A staff-authored listing nobody
 * owns reads "Added {time}"; every other row reads "Submitted {time}". Empty
 * when there is no age to show.
 */
export function listingAgeLabel(
  row: ProvenanceFields,
  t: TFunction,
  ageText: string,
): string {
  if (!ageText) {
    return "";
  }
  if (isStaffAuthoredOwnerless(row)) {
    return t("admin:adminListings.row.addedAgo", { time: ageText });
  }
  return t("admin:adminListings.row.submittedAgo", { time: ageText });
}
