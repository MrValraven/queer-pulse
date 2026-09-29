import type { ListingDraft } from "./listBusiness.data";

/**
 * Whether the wizard leaves off everything written about the person filling
 * it in: the "About you" block, the consents, the affirming baseline and the
 * recap rows that describe the submitter.
 *
 * Two drafts do. A staff-authored draft, because an admin cannot answer for a
 * business that has not joined. A brand new, still-unclaimed suggestion,
 * because the platform holds it and the suggester is not the business.
 *
 * `managementRole` is what tells the two suggestion states apart: absent on
 * the wizard's own new suggestion draft, and always set (`"owner"` or
 * `"co_manager"`) on a draft `dtoToDraft` builds from a listing somebody has
 * since claimed. Once claimed, the new owner or co-manager answers all of it
 * themselves, so the block shows again.
 */
export function isOwnerBlockHidden(
  draft: Pick<ListingDraft, "isStaffAuthored" | "path" | "managementRole">,
): boolean {
  return (
    Boolean(draft.isStaffAuthored) ||
    (draft.path === "suggest" && draft.managementRole === undefined)
  );
}
