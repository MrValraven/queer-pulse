import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import type { MyGroupListing } from "../housingGroups.data";
import {
  createGroupListing,
  updateGroupListing,
  withdrawGroupListing,
  type CreateGroupListingBody,
  type UpdateGroupListingBody,
} from "./housingGroups.api";
import { myListingDtoToMyGroupListing } from "./housingGroups.adapters";
import { economyKeys } from "./economyKeys";

export interface UpdateGroupListingInput {
  listingId: string;
  body: UpdateGroupListingBody;
}

/** Applies an edit to a demo fixture listing so the prototype answers with no
 *  backend, mirroring `useHousingListingOwnerActions#applyDemoTransition`. */
function applyDemoEdit(
  listing: MyGroupListing,
  body: UpdateGroupListingBody,
): MyGroupListing {
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
    // The demo mirrors what the server does to a live room that is edited: it
    // goes back to review, and the old verdict stops standing against text
    // nobody has read yet.
    ...(listing.status === "live"
      ? {
          status: "review" as const,
          decidedAt: null,
          decisionReason: null,
        }
      : {}),
  };
}

/**
 * POST /housing-groups/:slug/listings. A member shares a room inside a vetted
 * group (LOC-19).
 *
 * This route shipped with no caller at all, which left the group review queue
 * with nothing to review and the poster's own edit and withdraw calls acting on
 * listings nobody could create. A 201 here means the room was RECEIVED: the
 * server forces `status: "review"` and the room reaches the group page only
 * once a moderator clears it, so nothing in the UI may read the response as a
 * publication.
 *
 * Two backend gates answer as errors rather than as state the client can see:
 * the LGBTQ+ affirming pledge and a phone-verified account. The modal catches
 * both and opens the matching prompt.
 */
export function useSubmitGroupListing(groupSlug: string) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  const key = economyKeys.myGroupListings(groupSlug, demoMode);
  return useMutation<MyGroupListing, Error, CreateGroupListingBody>({
    // The submit modal reports its own failure, and it has to distinguish the
    // pledge and verification gates from a real error, so the global toast
    // would only stack a duplicate over the prompt.
    meta: { silentError: true },
    mutationFn: async (body) => {
      if (demoMode) {
        await new Promise((resolve) => setTimeout(resolve, 700));
        return {
          id: `demo-${Date.now()}`,
          ...body,
          status: "review",
          hidden: false,
          hiddenReason: null,
          decidedAt: null,
          decisionReason: null,
          createdAt: new Date().toISOString(),
        };
      }
      return myListingDtoToMyGroupListing(
        await createGroupListing(groupSlug, body),
      );
    },
    onSuccess: (created) => {
      // Newest first, matching the server's own ordering.
      queryClient.setQueryData<MyGroupListing[]>(key, (previous) => [
        created,
        ...(previous ?? []),
      ]);
      if (!demoMode) {
        void queryClient.invalidateQueries({
          queryKey: economyKeys.myGroupListingsRoot,
        });
      }
    },
  });
}

/**
 * PATCH /housing-groups/:slug/listings/:id (BE-HSG-20). The poster corrects
 * their own room. Every field this reaches is one the group page renders, which
 * makes it moderated: a change to a listing that is currently live sends it
 * back to `review` server-side and it leaves the group page until a moderator
 * clears it.
 *
 * Nothing moves before the server answers. The refreshed row comes back from
 * the response rather than being guessed, and live mode also invalidates the
 * public group read so the group page loses a room that has just re-entered
 * review.
 */
export function useUpdateGroupListing(groupSlug: string) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  const key = economyKeys.myGroupListings(groupSlug, demoMode);
  return useMutation<MyGroupListing | null, Error, UpdateGroupListingInput>({
    // The edit modal reports its own failure, so the global mutation-error
    // toast would only stack a duplicate.
    meta: { silentError: true },
    mutationFn: async ({ listingId, body }) => {
      if (demoMode) {
        await new Promise((resolve) => setTimeout(resolve, 450));
        const current = queryClient
          .getQueryData<MyGroupListing[]>(key)
          ?.find((listing) => listing.id === listingId);
        return current ? applyDemoEdit(current, body) : null;
      }
      return myListingDtoToMyGroupListing(
        await updateGroupListing(groupSlug, listingId, body),
      );
    },
    onSuccess: (updated) => {
      if (!updated) return;
      queryClient.setQueryData<MyGroupListing[]>(key, (previous) =>
        (previous ?? []).map((listing) =>
          listing.id === updated.id ? updated : listing,
        ),
      );
      if (!demoMode) {
        void queryClient.invalidateQueries({
          queryKey: economyKeys.housingGroupRoot,
        });
      }
    },
  });
}

/**
 * DELETE /housing-groups/:slug/listings/:id (BE-HSG-20). The poster takes
 * their own room down once it is let. A real removal, distinct from the
 * moderator's `hidden` takedown, which records a norm violation.
 *
 * The caller gates this behind `ConfirmDialog`. The row is dropped from the
 * cache only in `onSuccess`, so a failure leaves the page exactly as it was.
 */
export function useWithdrawGroupListing(groupSlug: string) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  const key = economyKeys.myGroupListings(groupSlug, demoMode);
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
      queryClient.setQueryData<MyGroupListing[]>(key, (previous) =>
        (previous ?? []).filter((listing) => listing.id !== listingId),
      );
      if (!demoMode) {
        void queryClient.invalidateQueries({
          queryKey: economyKeys.housingGroupRoot,
        });
      }
    },
  });
}
