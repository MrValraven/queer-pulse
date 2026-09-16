import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { getHousingListingContact } from "./housingListing.api";

/** Query key segment, local to this hook: nothing else reads or invalidates
 *  a housing listing's contact read. */
const housingListingContactKey = (ref: string | null, demoMode: boolean) =>
  ["housing-listing-contact", ref, demoMode] as const;

export interface HousingListingContactResult {
  /**
   * PRD-340: true once the read is known and the lister and enquirer are NOT
   * accepted connections, so this first message stays a one-message thread
   * until the LISTER replies to it (their reply needs no connection).
   * Mirrors the local directory's `followUpAwaitsReply`. `false` while
   * loading or on a read error, so the notice never flashes on before the
   * member has typed anything. `createEnquiry`'s own send-time errors still
   * cover an outage that happens between this read and the actual send.
   */
  followUpAwaitsReply: boolean;
  isLoading: boolean;
}

/**
 * GET /housing-listings/:ref/contact: read before the enquiry modal shows a
 * composer, so a member writing about a home learns up front that the
 * lister can answer straight away, rather than assuming a connection is
 * needed first.
 *
 * Demo never reaches the network: the seeded personas the housing modal
 * addresses are never accepted connections, so the notice reads true here
 * exactly as it does on `useListingContact`'s demo branch for the local
 * directory's twin flow.
 */
export function useHousingListingContact(
  ref: string | null,
): HousingListingContactResult {
  const { demoMode } = useDemoMode();

  const contactQuery = useQuery<{
    replyRequiresConnection: boolean;
    followUpAwaitsReply: boolean;
  }>({
    queryKey: housingListingContactKey(ref, demoMode),
    enabled: Boolean(ref),
    queryFn: async () => {
      if (demoMode || !ref) {
        return { replyRequiresConnection: true, followUpAwaitsReply: true };
      }
      return getHousingListingContact(ref);
    },
  });

  return {
    followUpAwaitsReply: contactQuery.data?.followUpAwaitsReply ?? false,
    isLoading: contactQuery.isLoading,
  };
}
