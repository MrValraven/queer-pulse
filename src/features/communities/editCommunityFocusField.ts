/**
 * The edit modal fields the setup checklist can open straight onto. Each one
 * names a wrapper id in `EditCommunityFields`, so a checklist row can scroll
 * the founder to the field it is asking about and put focus in it.
 */
export const EDIT_COMMUNITY_FOCUS_FIELDS = [
  "cover",
  "avatar",
  "welcome",
  "tags",
] as const;

export type EditCommunityFocusField =
  (typeof EDIT_COMMUNITY_FOCUS_FIELDS)[number];

/** The DOM id on the wrapper of a focusable edit modal field. */
export function editCommunityFieldId(field: EditCommunityFocusField): string {
  return `edit-community-field-${field}`;
}

/** The first control inside a field wrapper that can take focus. File and
 *  hidden inputs are skipped, since the upload field opens through its button. */
export const EDIT_FIELD_FOCUSABLE_SELECTOR =
  "textarea, select, input:not([type='file']):not([type='hidden']), button:not([disabled]), [tabindex]:not([tabindex='-1'])";
