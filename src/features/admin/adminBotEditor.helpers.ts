import type { SocialLinkDTO } from "../members/api/members.api";

/* Non-component helpers split out of AdminBotEditorFields.tsx so that file only
 * exports its component (react-refresh/only-export-components). */

/**
 * A social link while it's being edited. Carries a stable client-only `id` so
 * React keys survive reorder/removal (an array index misplaces focus when a
 * middle row is deleted). The `id` is stripped before the list is sent to the
 * API — see `AdminBotEditorDrawer`'s save.
 */
export interface SocialRow extends SocialLinkDTO {
  id: string;
}

let nextSocialRowId = 0;

/** Wrap a social link (default: an empty row) with a fresh stable id. */
export function createSocialRow(
  social: SocialLinkDTO = { platform: "", urlOrHandle: "" },
): SocialRow {
  nextSocialRowId += 1;
  return { id: `social-${nextSocialRowId}`, ...social };
}
