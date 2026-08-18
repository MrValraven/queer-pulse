import { useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  setQueerOwnedVerified,
  type ListingQueueRow,
} from "./adminListings.api";
import {
  ADMIN_LISTINGS_KEY,
  patchListingInCache,
  restoreAdminListingsQueries,
  snapshotAdminListingsQueries,
} from "./useAdminListings";
import { useDemoAwareMutation } from "./demoAwareMutation";

export interface SetQueerOwnedVerifiedVars {
  row: ListingQueueRow;
  verified: boolean;
}

interface SetQueerOwnedVerifiedContext {
  previousQueries: ReturnType<typeof snapshotAdminListingsQueries>;
}

/**
 * A moderator confirms (or removes confirmation of) the "queer-owned" badge —
 * distinct from the submitter's own self-reported `linkToProfile` claim.
 * Mirrors `useSetListingStatus`'s optimistic-patch shape: `patchListingInCache`
 * is the single source of truth for the queue row across every cached
 * status/q/sort combination, so no local override map is needed. Unlike a
 * status move, verification never changes which status tab a row belongs to,
 * so there's no per-ref demo-mutation registry to keep in sync (mirrors
 * `useSetListingStatus`'s doc comment on why that registry exists at all).
 * Live mode PATCHes `/listings/:ref/queer-owned-verified`.
 */
export function useSetQueerOwnedVerified() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useDemoAwareMutation<
    ListingQueueRow,
    Error,
    SetQueerOwnedVerifiedVars,
    SetQueerOwnedVerifiedContext
  >({
    demoMode,
    demoResult: ({ row, verified }) => ({
      ...row,
      detail: { ...row.detail, queerOwnedVerified: verified },
    }),
    live: async ({ row, verified }) => ({
      ...row,
      detail: await setQueerOwnedVerified(row.ref, verified),
    }),
    logLabel: "admin.listing.setQueerOwnedVerified",
    logContext: ({ row, verified }) => ({ ref: row.ref, verified }),
    onMutate: async ({ row, verified }) => {
      await queryClient.cancelQueries({
        queryKey: [ADMIN_LISTINGS_KEY, demoMode],
      });
      const previousQueries = snapshotAdminListingsQueries(
        queryClient,
        demoMode,
      );
      patchListingInCache(queryClient, demoMode, row.ref, (current) => ({
        ...current,
        detail: { ...current.detail, queerOwnedVerified: verified },
      }));
      return { previousQueries };
    },
    onError: (_error, _vars, context) => {
      if (context?.previousQueries) {
        restoreAdminListingsQueries(queryClient, context.previousQueries);
      }
    },
    onLiveSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [ADMIN_LISTINGS_KEY] });
    },
  });
}
