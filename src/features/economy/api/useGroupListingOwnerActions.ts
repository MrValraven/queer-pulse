import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import type { GroupListing, VettedGroup } from "../housingGroups.data";
import {
  updateGroupListing,
  withdrawGroupListing,
  type UpdateGroupListingBody,
} from "./housingGroups.api";
import { listingDtoToGroupListing } from "./housingGroups.adapters";
import { economyKeys } from "./economyKeys";

export interface UpdateGroupListingInput {
  listingId: string;
  body: UpdateGroupListingBody;
}

/** Applies an edit to a demo fixture listing so the prototype answers with no
 *  backend, mirroring `useHousingListingOwnerActions#applyDemoTransition`. */
function applyDemoEdit(
  listing: GroupListing,
  body: UpdateGroupListingBody,
): GroupListing {
  return {
    ...listing,
    ...(body.title !== undefined ? { title: body.title } : {}),
    ...(body.description !== undefined
      ? { description: body.description }
      : {}),
    ...(body.neighbourhood !== undefined
      ? { neighbourhood: body.neighbourhood }
      : {}),
    ...(body.priceEuros !== undefined ? { priceEuros: body.priceEuros } : {}),
    ...(body.accessibilityInfo !== undefined
      ? { accessibilityInfo: body.accessibilityInfo }
      : {}),
  };
}

/**
 * PATCH /housing-groups/:slug/listings/:id (BE-HSG-20). The poster corrects
 * their own room. Every field this reaches is one the group page renders, which
 * makes it moderated: a change to a listing that is currently live sends it
 * back to `review` server-side and it leaves the group page until a moderator
 * clears it. The public `GroupListingDTO` carries no status, so the UI never
 * guesses the outcome from the response. It says what will happen before the
 * member submits, and then re-reads the group from the server.
 *
 * Nothing moves before the server answers. `onSuccess` invalidates in live mode
 * so the refreshed list is the backend's; demo mode has no server, so it
 * patches its own fixture there instead.
 */
export function useUpdateGroupListing(groupSlug: string) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  const key = economyKeys.housingGroup(groupSlug, demoMode);
  return useMutation<GroupListing | null, Error, UpdateGroupListingInput>({
    // The edit modal reports its own failure, so the global mutation-error
    // toast would only stack a duplicate.
    meta: { silentError: true },
    mutationFn: async ({ listingId, body }) => {
      if (demoMode) {
        await new Promise((resolve) => setTimeout(resolve, 450));
        const current = queryClient
          .getQueryData<VettedGroup | null>(key)
          ?.listings?.find((listing) => listing.id === listingId);
        return current ? applyDemoEdit(current, body) : null;
      }
      return listingDtoToGroupListing(
        await updateGroupListing(groupSlug, listingId, body),
      );
    },
    onSuccess: (updated) => {
      if (demoMode) {
        if (!updated) return;
        queryClient.setQueryData<VettedGroup | null>(key, (previous) =>
          previous
            ? {
                ...previous,
                listings: (previous.listings ?? []).map((listing) =>
                  listing.id === updated.id ? updated : listing,
                ),
              }
            : previous,
        );
        return;
      }
      void queryClient.invalidateQueries({
        queryKey: economyKeys.housingGroupRoot,
      });
    },
  });
}

/**
 * DELETE /housing-groups/:slug/listings/:id (BE-HSG-20). The poster takes
 * their own room down once it is let. A real removal, distinct from the
 * moderator's `hidden` takedown, which records a norm violation.
 *
 * The caller gates this behind `ConfirmDialog`. The row is dropped from the
 * cached group only in `onSuccess`, so a failure leaves the group page exactly
 * as it was.
 */
export function useWithdrawGroupListing(groupSlug: string) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  const key = economyKeys.housingGroup(groupSlug, demoMode);
  return useMutation<void, Error, string>({
    meta: { silentError: true },
    mutationFn: async (listingId) => {
      if (demoMode) {
        await new Promise((resolve) => setTimeout(resolve, 450));
        return;
      }
      await withdrawGroupListing(groupSlug, listingId);
    },
    onSuccess: (_result, listingId) => {
      queryClient.setQueryData<VettedGroup | null>(key, (previous) =>
        previous
          ? {
              ...previous,
              listings: (previous.listings ?? []).filter(
                (listing) => listing.id !== listingId,
              ),
            }
          : previous,
      );
      if (!demoMode) {
        void queryClient.invalidateQueries({
          queryKey: economyKeys.housingGroupRoot,
        });
      }
    },
  });
}
