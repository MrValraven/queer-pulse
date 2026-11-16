import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../../app/providers/DemoModeProvider";
import { useAuth } from "../../../../app/providers/authContext";
import { ApiError } from "../../../../shared/api/client";
import {
  deleteListingDraft,
  getListingDraft,
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

/** A 4xx answer (gone, owned by someone else, malformed, signed out) would come back the
 *  same on every try, so only other failures (offline, timeout, 5xx) retry,
 *  up to TanStack's default three times. */
function retryUnlessClientError(failureCount: number, error: Error): boolean {
  const isClientError =
    error instanceof ApiError && error.status >= 400 && error.status < 500;
  return !isClientError && failureCount < 3;
}

/** What a link-opening hook hands the page: the record, its fetch state, and
 *  a retry for a failure that may pass. */
function linkRecordResult(query: {
  data: ListingDraftRecord | undefined;
  isLoading: boolean;
  isFetching: boolean;
  isPaused: boolean;
  error: Error | null;
  refetch: () => Promise<unknown>;
}) {
  return {
    record: query.data,
    isLoading: query.isLoading,
    /** True during any fetch, a background refetch of a cached copy too. */
    isFetching: query.isFetching,
    /** True while the fetch waits for the connection to come back. */
    isPaused: query.isPaused,
    error: query.error,
    retry: () => void query.refetch(),
  };
}

/**
 * Resolve a `?draft=<token>` deep link to its draft so the wizard can be seeded
 * on another device. Live-only; disabled without a token or in demo (demo has
 * no cross-device tokens: its single draft lives in localStorage).
 */
export function useResumeListingDraft(token: string | null) {
  const { demoMode } = useDemoMode();
  const { loggedIn } = useAuth();
  const query = useQuery<ListingDraftRecord>({
    queryKey: [...LISTING_DRAFTS_KEY, "resume", token, demoMode],
    enabled: !demoMode && loggedIn && Boolean(token),
    // A bad or expired token fails the same way twice; a dropped connection
    // may not.
    retry: retryUnlessClientError,
    queryFn: () => resumeListingDraft(token as string),
  });
  return linkRecordResult(query);
}

/**
 * Open one owned draft by id for a `?continue=<id>` link (the directory CTA
 * names a single draft and lands straight in it). Live-only and signed-in
 * only: disabled otherwise, so it settles at once with no record. A draft that
 * was submitted, deleted or belongs to someone else fails with a 4xx and is
 * not retried; other failures retry.
 */
export function useListingDraftRecord(id: string | null) {
  const { demoMode } = useDemoMode();
  const { loggedIn } = useAuth();
  const query = useQuery<ListingDraftRecord>({
    queryKey: [...LISTING_DRAFTS_KEY, "record", id, demoMode],
    enabled: !demoMode && loggedIn && Boolean(id),
    retry: retryUnlessClientError,
    // Kept out of the cache once unobserved: coming back to the same link
    // after submitting must ask the server again and get the "no longer
    // valid" answer, so a cached copy never reopens a finished draft.
    gcTime: 0,
    queryFn: () => getListingDraft(id as string),
  });
  return linkRecordResult(query);
}
