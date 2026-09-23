import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  getIdentityContact,
  type IdentityContactDTO,
  type IdentityContactTarget,
} from "./identityContact.api";

/** Query key segment for the per-caller contact read, so the send mutation
 *  (in `IdentityEnquiryModal`) can invalidate it once a message lands or a
 *  cap bites, and the button settles on the right state without a page
 *  reload. */
export const IDENTITY_CONTACT_KEY = "identity-contact";

export interface IdentityContactResult {
  /** `null` while loading, or when the read failed. Never coerced into a
   *  "nothing here" answer: `isError` carries that case instead. */
  contact: IdentityContactDTO | null;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
}

interface IdentityContactOptions {
  target: IdentityContactTarget;
  /**
   * Off for a signed-out visitor: the route is member-gated, so asking would
   * fail with a 401.
   */
  isEnabled: boolean;
}

function targetIdOrSlug(target: IdentityContactTarget): string {
  return target.kind === "persona" ? target.subprofileId : target.slug;
}

/**
 * Whether this member can write to this persona's or company's mailbox.
 *
 * Read BEFORE the composer opens, mirroring `useListingContact`: everything
 * it answers is something the member needs in advance, so a refusal never
 * shows up only after they have typed a message. A failure surfaces as
 * `isError` with a retry, kept distinct from "no contact options": the two
 * read identically on screen and mean opposite things.
 */
export function useIdentityContact({
  target,
  isEnabled,
}: IdentityContactOptions): IdentityContactResult {
  const { demoMode } = useDemoMode();

  const contactQuery = useQuery<IdentityContactDTO>({
    queryKey: [
      IDENTITY_CONTACT_KEY,
      target.kind,
      targetIdOrSlug(target),
      demoMode,
    ],
    enabled: isEnabled,
    queryFn: async ({ signal }) => {
      if (demoMode) {
        // Demo personas and companies never send or receive anything for
        // real, so nothing counts against the member and there is no cap or
        // existing thread to report.
        return {
          canMessage: true,
          unavailableReason: null,
          followUpAwaitsReply: true,
          existingConversationId: null,
          hasReachedEnquiryLimit: false,
          enquiryLimitReason: null,
          enquiryLimitClearsAt: null,
        };
      }
      return getIdentityContact(target, signal);
    },
  });

  return {
    contact: contactQuery.data ?? null,
    isLoading: contactQuery.isLoading,
    isError: contactQuery.isError,
    refetch: () => void contactQuery.refetch(),
  };
}
