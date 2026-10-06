import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { ApiError } from "../../../shared/api/client";
import { reasonFor } from "../../../shared/api/errorMessage";
import {
  sendListingEnquiry,
  type ListingEnquirySentDTO,
} from "./listingEnquiries.api";
import { DIRECTORY_KEY } from "./directoryQueryKey";
import { LISTING_CONTACT_KEY } from "./useListingContact";

/** The backend's own minimum on an enquiry body (`CreateListingEnquiryDto`).
 *  Its 2000-character maximum is the shared first-contact field's own cap. */
export const MIN_ENQUIRY_LENGTH = 8;

/**
 * What kind of "no" came back. A rejected enquiry is four different stories and
 * a single generic toast would tell none of them:
 *
 * - `rate_limited` — a counted cap or the route throttle. The member has
 *   written enough for today and the send is not going to work by retrying.
 * - `not_allowed`  — messaging refuses this pair. Stated without direction,
 *   because the backend deliberately does not say which side blocked which.
 * - `unavailable`  — the owner stopped being reachable between the contact read
 *   and the send (claimed, erased, suspended, or the member's own listing).
 * - `gone`         — the listing is no longer live or has been taken down.
 */
export type ListingEnquiryRefusalKind =
  "rate_limited" | "not_allowed" | "unavailable" | "gone" | "generic";

export interface ListingEnquiryRefusal {
  kind: ListingEnquiryRefusalKind;
  /**
   * The backend's own sentence behind a 400 (`unavailable`), for an English
   * reader only: it names the specific reason, such as an unclaimed listing.
   * PRD-467: the backend writes it in English, so every other language gets
   * `null` here and the caller's translated copy for the kind. Also `null` for
   * every other kind, including a cap or throttle refusal (`rate_limited`),
   * and for a 400 with nothing worth showing.
   */
  serverReason: string | null;
}

/** Classify a failed send into something the composer can say out loud.
 *  `language` is the reader's UI language, from `useTranslation()`. */
export function readListingEnquiryRefusal(
  error: unknown,
  language: string,
): ListingEnquiryRefusal {
  if (!(error instanceof ApiError)) {
    return { kind: "generic", serverReason: null };
  }
  switch (error.status) {
    case 429:
      return { kind: "rate_limited", serverReason: null };
    case 403:
      return { kind: "not_allowed", serverReason: null };
    case 400:
      return {
        kind: "unavailable",
        serverReason: language.toLowerCase().startsWith("en")
          ? reasonFor(error)
          : null,
      };
    case 404:
      return { kind: "gone", serverReason: null };
    default:
      return { kind: "generic", serverReason: null };
  }
}

/**
 * Send a private enquiry to the business behind a listing.
 *
 * It is delivered as a direct message from the member's own account, so the
 * composer says so before they write and links them to the thread afterwards.
 *
 * Every outcome invalidates the contact read: a success gives the member an
 * `existingConversationId` they did not have, and a refusal may mean the owner
 * stopped being reachable while the composer was open. Demo mode never touches
 * the network, mirroring `useClaimListing`.
 */
export function useSendListingEnquiry(slug: string) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();

  return useMutation<ListingEnquirySentDTO, Error, string>({
    // The composer renders the refusal itself, so silence the global toast.
    meta: { silentError: true },
    mutationFn: async (body) => {
      if (demoMode) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        return {
          conversationId: "",
          enquiryId: "",
          replyRequiresConnection: true,
          followUpAwaitsReply: true,
        };
      }
      return sendListingEnquiry(slug, body);
    },
    onSuccess: () => {
      if (demoMode) return;
      // PRD-342: the same gap housing's enquiry mutation had. Without this,
      // a member who had the inbox open (or cached) within react-query's
      // staleness window sees the success panel's "Open thread" link land on
      // whatever thread is already open, with `?c=` still in the URL and no
      // feedback, because the new conversation never enters the inbox cache.
      void queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
    onSettled: () => {
      if (demoMode) return;
      void queryClient.invalidateQueries({
        queryKey: [DIRECTORY_KEY, LISTING_CONTACT_KEY, slug],
      });
    },
  });
}
