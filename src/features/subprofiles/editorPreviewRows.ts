import type {
  AffiliationDTO,
  AffiliationInputDTO,
  AffiliationOptionDTO,
  SocialLinkDTO,
} from "./api/subprofiles.api";
import type { AffiliationRow } from "./SubprofileAffiliationRow";
import type { SocialRow } from "./subprofileEditorContext";

/**
 * Resolve an owner-edited affiliation input to its display `name` and
 * `imageUrl`. A newly picked target resolves from the picker's options (the
 * cached `useAffiliationOptions` lists), then from the persona's
 * already-resolved affiliations (edits, reorders, removals), and only as a
 * last resort from its raw slug. Demo's save and the editor preview both
 * read it.
 */
export function resolveAffiliation(
  item: AffiliationInputDTO,
  pickerOptions: readonly AffiliationOptionDTO[],
  known: readonly AffiliationDTO[],
): AffiliationDTO {
  const isSameTarget = (candidate: {
    targetType: string;
    targetSlug: string;
  }) =>
    candidate.targetType === item.targetType &&
    candidate.targetSlug === item.targetSlug;
  const resolved = pickerOptions.find(isSameTarget) ?? known.find(isSameTarget);
  return {
    targetType: item.targetType,
    targetSlug: item.targetSlug,
    role: item.role,
    name: resolved?.name ?? item.targetSlug,
    imageUrl: resolved?.imageUrl ?? null,
  };
}

/** The social links the editor would save, in the page's shape: rows with
 *  something typed, trimmed, in the owner's order. Mirrors the Save chain's
 *  own filter (`useEditorSaveGraph`), so the preview never shows a link the
 *  save would drop. */
export function previewSocialLinks(rows: SocialRow[]): SocialLinkDTO[] {
  return rows
    .filter((row) => row.urlOrHandle.trim())
    .map(({ platform, urlOrHandle }) => ({
      platform,
      urlOrHandle: urlOrHandle.trim(),
    }));
}

/** The "Part of" links the editor would save, resolved for display: rows
 *  with a picked target, named from the picker's options or the saved list
 *  (`resolveAffiliation`). */
export function previewAffiliations(
  rows: AffiliationRow[],
  pickerOptions: readonly AffiliationOptionDTO[],
  known: readonly AffiliationDTO[],
): AffiliationDTO[] {
  return rows
    .filter((row) => row.targetSlug.trim())
    .map(({ targetType, targetSlug, role }) =>
      resolveAffiliation(
        { targetType, targetSlug: targetSlug.trim(), role },
        pickerOptions,
        known,
      ),
    );
}
