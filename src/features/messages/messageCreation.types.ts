/** Fired by a creation action so the caller (the modal that triggered it) knows
 *  whether to close itself or stay open with its state intact for a retry. The
 *  global mutation-error toast already tells the member something went wrong —
 *  these exist purely to keep the UI's own local state honest. */
export interface CreationOutcome {
  onSuccess?: () => void;
  onError?: () => void;
}
