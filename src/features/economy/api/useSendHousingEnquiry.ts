import { useMutation } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { sendHousingEnquiry } from "./housingListing.api";

export interface SendHousingEnquiryInput {
  ref: string | null;
  body: string;
}

/** POST /housing-listings/:ref/enquiries. Demo fakes latency and resolves null
 * (no ref exists in demo); live delivers the message to the lister's inbox. */
export function useSendHousingEnquiry() {
  const { demoMode } = useDemoMode();
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
  });
}
