import { useMutation } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { apiPost } from "../../../shared/api/client";

/** The 6 fields a member can flag as needing a correction — mirrors the
 *  backend's accepted `field` enum on `POST /directory/:slug/edit-suggestions`. */
export type SuggestEditField =
  | "hours"
  | "address"
  | "phone"
  | "website"
  | "description"
  | "other";

export interface SuggestEditInput {
  field: SuggestEditField;
  message: string;
  /**
   * The exact replacement value, when the member happens to know it: the new
   * phone number, the corrected address, the real closing time. Optional on
   * purpose. "The hours are wrong and I do not know what they are now" is a
   * genuinely useful report, so prose alone is always a valid submission.
   *
   * The server validates it against the rules of the real listing column the
   * chosen `field` writes to, and answers a 400 naming the constraint that
   * failed. It also refuses one on the `other` bucket, which maps to no column
   * at all, so the form never offers the input there.
   */
  proposedValue?: string;
}

/**
 * "Suggest an edit" on a directory listing — a non-owner member flags a
 * correction (which field + a note) for the owner to see. There's no local
 * cache shaped like a suggestion inbox to patch (the owner sees these
 * elsewhere, not on this detail page), so demo mode never touches the
 * network and just resolves success after a short beat, mirroring
 * `useSuggestLandlord`. Live POSTs to the member-gated endpoint.
 */
export function useSuggestEdit(slug: string) {
  const { demoMode } = useDemoMode();

  return useMutation<void, Error, SuggestEditInput>({
    // DirectorySuggestEditModal toasts its own error, so silence the global duplicate.
    meta: { silentError: true },
    mutationFn: async (input) => {
      if (demoMode) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        return;
      }
      await apiPost(`/directory/${slug}/edit-suggestions`, input);
    },
  });
}
