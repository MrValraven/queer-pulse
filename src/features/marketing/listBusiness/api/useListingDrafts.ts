import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../../app/providers/DemoModeProvider";
import { useAuth } from "../../../../app/providers/authContext";
import {
  deleteListingDraft,
  listListingDrafts,
  resumeListingDraft,
  type ListingDraftRecord,
  type ListingDraftSummary,
} from "./listingDrafts.api";

/** Root query key for the cross-device drafts list. `demoMode` kept LAST so a
 *  mode flip re-keys without colliding with the live cache. */
export const LISTING_DRAFTS_KEY = ["listing-drafts"] as const;

/**
 * The caller's saved in-progress listing drafts. Live-only: demo keeps its
 * single localStorage draft (see `useListingDraft`) and never hits the network,
 * so the query is disabled and returns nothing in demo.
 */
export function useListingDrafts() {
  const { demoMode } = useDemoMode();
  const { loggedIn } = useAuth();
  return useQuery<ListingDraftSummary[]>({
    queryKey: [...LISTING_DRAFTS_KEY, "list", demoMode],
    enabled: !demoMode && loggedIn,
    queryFn: () => listListingDrafts(),
  });
}

/** Delete a saved draft, then refresh the list. Live-only (demo is a no-op). */
export function useDeleteListingDraft() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      if (demoMode) return;
      await deleteListingDraft(id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: LISTING_DRAFTS_KEY });
    },
  });
}

/**
 * Resolve a `?draft=<token>` deep link to its draft so the wizard can be seeded
 * on another device. Live-only; disabled without a token or in demo (demo has
 * no cross-device tokens — its single draft lives in localStorage).
 */
export function useResumeListingDraft(token: string | null) {
  const { demoMode } = useDemoMode();
  const { loggedIn } = useAuth();
  const query = useQuery<ListingDraftRecord>({
    queryKey: [...LISTING_DRAFTS_KEY, "resume", token, demoMode],
    enabled: !demoMode && loggedIn && Boolean(token),
    // A resume token is single-purpose — don't auto-retry a bad/expired one.
    retry: false,
    queryFn: () => resumeListingDraft(token as string),
  });
  return {
    record: query.data,
    isLoading: query.isLoading,
    error: query.error,
  };
}
