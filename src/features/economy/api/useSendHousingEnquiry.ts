import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { sendHousingEnquiry } from "./housingListing.api";

export interface SendHousingEnquiryInput {
  ref: string | null;
  body: string;
}

/**
 * POST /housing-listings/:ref/enquiries. Demo fakes latency and resolves null
 * (no ref exists in demo); live delivers the message to the lister's inbox.
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
    mutationFn: async ({ ref, body }) => {
      if (demoMode || !ref) {
        await new Promise((resolve) => setTimeout(resolve, 650));
        return null;
      }
      return sendHousingEnquiry(ref, { body });
    },
    onSuccess: (result) => {
      if (demoMode || !result) return;
      void queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}
