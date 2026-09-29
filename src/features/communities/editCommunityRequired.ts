import type { CommunityDraft } from "./startCommunity/startCommunity.data";

/**
 * The required fields the edit form is still missing, as the label keys the
 * form itself shows them under, in the order they appear in the form.
 *
 * One list answers both questions the footer asks: whether Save is allowed
 * (the list is empty) and, when it is not, what to fix. Deriving the disabled
 * state and the explanation from the same place means the button can never be
 * greyed out for a reason the owner is not told.
 */
export function missingRequiredFieldKeys(
  draft: CommunityDraft,
  initialDraft: CommunityDraft,
): string[] {
  const missing: string[] = [];
  if (!draft.name.trim()) missing.push("communities:edit.field.name");
  if (!draft.tagline.trim()) missing.push("communities:edit.field.tagline");
  if (!draft.type) missing.push("communities:edit.field.type");
  if (!draft.whoFor.trim()) missing.push("communities:edit.field.whoFor");
  if (!draft.purpose.trim()) missing.push("communities:edit.field.purpose");
  if (!draft.accessTier) missing.push("communities:edit.field.access");
  // A community keeps at least one shared value, the same floor the
  // Start-a-Community wizard enforces, so editing can't strip it below that.
  // Only a community that opened with values is held to it: one founded
  // without any (the platform-seeded Ambassadors circle) would otherwise have
  // every unrelated edit, a new cover included, blocked.
  if (draft.rules.length === 0 && initialDraft.rules.length > 0) {
    missing.push("communities:edit.field.rules");
  }
  return missing;
}
