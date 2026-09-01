import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { ApiError } from "../../../shared/api/client";
import {
  sendListingEnquiry,
  type ListingEnquirySentDTO,
} from "./listingEnquiries.api";
import { DIRECTORY_KEY } from "./useDirectory";
import { LISTING_CONTACT_KEY } from "./useListingContact";

/** The backend's own bounds on an enquiry body (`CreateListingEnquiryDto`). */
export const MIN_ENQUIRY_LENGTH = 8;
export const MAX_ENQUIRY_LENGTH = 2000;

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
   * The backend's own sentence when it wrote one worth repeating: the cap
   * messages name which cap was hit and what to do about it ("You have already
   * written to this business today. Give them a chance to reply first."), which
   * is more useful than any generic line the frontend could offer. `null` when
   * the body carried nothing, or nothing but the throttler's own exception
   * name, and the caller falls back to its localized copy.
   *
   * Same trade `readAskQuestionReason` already makes on the public-question
   * form: the backend has no i18n layer, so these arrive in English.
   */
  serverReason: string | null;
}

/** Nest's throttler answers with its exception name, which is not copy. */
function readServerReason(error: ApiError): string | null {
  const reason = error.message.trim();
  if (reason.length === 0) return null;
  if (reason.startsWith("ThrottlerException")) return null;
  return reason;
}

/** Classify a failed send into something the composer can say out loud. */
export function readListingEnquiryRefusal(
  error: unknown,
): ListingEnquiryRefusal {
  if (!(error instanceof ApiError)) {
    return { kind: "generic", serverReason: null };
  }
  const serverReason = readServerReason(error);
  switch (error.status) {
    case 429:
      return { kind: "rate_limited", serverReason };
    case 403:
      return { kind: "not_allowed", serverReason: null };
    case 400:
      return { kind: "unavailable", serverReason };
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
        };
      }
      return sendListingEnquiry(slug, body);
    },
    onSettled: () => {
      if (demoMode) return;
      void queryClient.invalidateQueries({
        queryKey: [DIRECTORY_KEY, LISTING_CONTACT_KEY, slug],
      });
    },
  });
}
