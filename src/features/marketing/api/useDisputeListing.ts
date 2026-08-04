import { useMutation } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { apiPost } from "../../../shared/api/client";

export interface DisputeListingInput {
  /** Free-text explanation a moderator reads in the queue. Required. */
  reason: string;
  /** Optional reachback for a disputer whose member account isn't obviously
   * the business (e.g. the venue itself contesting a "friendly" tag). */
  contactEmail?: string;
}

/**
 * "Report / dispute a listing" — anyone (including the named business itself)
 * contests or claims a directory listing through the SHARED report+moderation
 * pipeline (`POST /listings/:ref/dispute`, a `listing_dispute`-coded report).
 * Modeled exactly on `useSuggestEdit`: there's no local cache shaped like a
 * moderation inbox to patch here, so demo mode never touches the network and
 * just resolves success after a short beat, while live POSTs to the endpoint.
 */
export function useDisputeListing(ref: string) {
  const { demoMode } = useDemoMode();

  return useMutation<void, Error, DisputeListingInput>({
    // DirectoryDisputeModal renders its own error state, so silence the global
    // duplicate toast.
    meta: { silentError: true },
    mutationFn: async (input) => {
      if (demoMode) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        return;
      }
      await apiPost(`/listings/${ref}/dispute`, {
        reason: input.reason,
        ...(input.contactEmail ? { contactEmail: input.contactEmail } : {}),
      });
    },
  });
}
