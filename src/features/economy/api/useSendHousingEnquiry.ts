import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { sendGroupListingEnquiry } from "./housingGroups.api";
import { sendHousingEnquiry } from "./housingListing.api";

/** A room inside a housing group, addressed by its group and its own id
 *  (PRD-443). */
export interface GroupRoomTarget {
  groupSlug: string;
  listingId: string;
}

export interface SendHousingEnquiryInput {
  ref: string | null;
  body: string;
  /** Set for a group room: the enquiry goes to the room's poster through
   *  `POST /housing-groups/:slug/listings/:id/enquiries`, and `ref` is unused. */
  groupRoom?: GroupRoomTarget;
}

/** Demo, and a live listing with no ref, fake the send's latency and resolve
 *  with no thread. */
function simulatedSend(): Promise<null> {
  return new Promise((resolve) => setTimeout(() => resolve(null), 650));
}

/**
 * POST /housing-listings/:ref/enquiries, or for a group room (PRD-443)
 * POST /housing-groups/:slug/listings/:id/enquiries. Demo fakes latency and
 * resolves null (no ref exists in demo); live delivers the message to the
 * lister's or the poster's inbox.
 *
 * PRD-342: invalidates `["conversations"]` on a live send, the same key
 * `useMessageRequest` invalidates for its own first-contact flow. Without it,
 * a member who opened the inbox within the last 30 seconds sees the success
 * panel's "Open thread" link land on the first cached thread with `?c=` still
 * in the URL and no feedback, because the enquiry's new conversation never
 * enters a cache that was already fresh.
 */
export function useSendHousingEnquiry() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<
    { conversationId: string } | null,
    Error,
    SendHousingEnquiryInput
  >({
    // The enquiry modal says every refusal itself (inline copy, or the pledge
    // and step-up prompts), so silence the global toast.
    meta: { silentError: true },
    mutationFn: async ({ ref, body, groupRoom }) => {
      if (demoMode) return simulatedSend();
      if (groupRoom) {
        const { groupSlug, listingId } = groupRoom;
        return sendGroupListingEnquiry(groupSlug, listingId, { body });
      }
      if (!ref) return simulatedSend();
      return sendHousingEnquiry(ref, { body });
    },
    onSuccess: (result) => {
      if (demoMode || !result) return;
      void queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}
