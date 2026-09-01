import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  getListingContact,
  type ListingContactDTO,
} from "./listingEnquiries.api";
import { DIRECTORY_KEY } from "./useDirectory";

/** Query key segment for the per-caller contact read, so the send mutation can
 *  invalidate it by slug after a message lands or a cap bites. */
export const LISTING_CONTACT_KEY = "contact";

export interface ListingContactResult {
  /** `null` while loading, or when the read failed. Never coerced into a
   *  "nothing here" answer: `isError` carries that case instead. */
  contact: ListingContactDTO | null;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
}

interface ListingContactOptions {
  slug: string;
  /**
   * Off for a signed-out visitor, the moderation preview and the listing's own
   * owner: the route is member-gated, so asking would 401, and the owner has
   * "Edit this listing" rather than an inbox to write to.
   */
  isEnabled: boolean;
  /**
   * Demo mode only: whether the fixture's owner is on QueerPulse. The demo
   * personas never reach the network, so the answer is built from the fixture
   * the page is already rendering. A live read never consults this.
   */
  isDemoOwnerOnPlatform: boolean;
}

/**
 * Whether this member can write to this listing's business.
 *
 * Read BEFORE the composer opens, because everything it answers is something
 * the member needs in advance: whether there is anybody on the other end, why
 * not when there is not, whether a reply will need a connection, and whether
 * they already have a thread with this owner.
 *
 * A failure surfaces as `isError` with a retry rather than as "no contact
 * options". The two read identically on screen and mean opposite things, and
 * collapsing them would tell a member a business is unreachable because a
 * request timed out.
 */
export function useListingContact({
  slug,
  isEnabled,
  isDemoOwnerOnPlatform,
}: ListingContactOptions): ListingContactResult {
  const { demoMode } = useDemoMode();

  const contactQuery = useQuery<ListingContactDTO>({
    queryKey: [DIRECTORY_KEY, LISTING_CONTACT_KEY, slug, demoMode],
    enabled: isEnabled,
    queryFn: async ({ signal }) => {
      if (demoMode) {
        return {
          canMessageOwner: isDemoOwnerOnPlatform,
          unavailableReason: isDemoOwnerOnPlatform ? null : "unclaimed",
          replyRequiresConnection: true,
          existingConversationId: null,
          // The demo personas never send anything, so nothing counts against
          // them and there is no cap to report.
          hasReachedEnquiryLimit: false,
          enquiryLimitReason: null,
          enquiryLimitClearsAt: null,
        };
      }
      return getListingContact(slug, signal);
    },
  });

  return {
    contact: contactQuery.data ?? null,
    isLoading: contactQuery.isLoading,
    isError: contactQuery.isError,
    refetch: () => void contactQuery.refetch(),
  };
}
