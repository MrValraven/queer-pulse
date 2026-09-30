import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { ApiError } from "../../../shared/api/client";
import { DIRECTORY_KEY } from "../../marketing/api/directoryQueryKey";
import { listingDtoToPending } from "../../marketing/listBusiness/api/listings.adapters";
import type { ManagedListingDTO } from "../../marketing/listBusiness/api/listings.api";
import {
  BLANK_OWNER_PERSONAL_FIELDS,
  stripOwnerPersonalFields,
} from "../../marketing/listBusiness/ownerPersonalFields";
import { toMenuDraft } from "../../marketing/listBusiness/listingMenu.data";
import { toServiceRows } from "../../marketing/listBusiness/listingServices.data";
import {
  slugify,
  type ListingDraft,
  type ListingStatus,
  type PendingListing,
} from "../../marketing/listBusiness/listBusiness.data";
import {
  ADMIN_LISTINGS_QUEUE,
  getDemoListingMutation,
} from "../adminListings.data";
import type { ListingQueueRow } from "./adminListings.api";
import {
  adminDraftToUpdateDto,
  adminUpdateListing,
  getAdminEditableListing,
} from "./adminListingEdit.api";
import { useDemoAwareMutation } from "./demoAwareMutation";
import { ADMIN_LISTINGS_KEY } from "./useAdminListings";
import { listingHistoryQueryKey } from "./useListingHistory";

/** What the edit page's wizard submit hands the mutation. */
export interface AdminUpdateListingVariables {
  ref: string;
  draft: ListingDraft;
}

/**
 * The demo queue row for `ref`, with its status as the demo session last left
 * it. The overlay is what a demo moderation action writes, so an edit opened
 * after a demo "publish" sees the listing as live.
 */
function findDemoQueueRow(
  ref: string,
): { row: ListingQueueRow; status: ListingStatus } | undefined {
  const row = ADMIN_LISTINGS_QUEUE.find((queueRow) => queueRow.ref === ref);
  const overlay = getDemoListingMutation(ref);
  if (!row || overlay?.removed) return undefined;
  return { row, status: overlay?.status ?? row.status };
}

/**
 * Demo mode's stand-in for `GET /admin/listings/:ref/editable`: the fixture's
 * detail, redacted the way the server's `buildManagedDTO(listing, false)`
 * redacts it, so the demo draft is built from the same shape the live one is.
 */
function demoEditableListing(ref: string): ManagedListingDTO {
  const found = findDemoQueueRow(ref);
  // A 404, as the live route answers, so the page shows its not-found state.
  if (!found) throw new ApiError(404, `No demo listing with ref ${ref}`);
  return {
    ...stripOwnerPersonalFields(found.row.detail),
    status: found.status,
    managementRole: "co_manager" as const,
  };
}

/**
 * The record demo mode resolves a save with, built the way
 * `demoCreatedListing` builds a create's: the body the page assembled, plus
 * the fields only an existing listing has. The loaded `ref`, `slug` and
 * `status` are kept, because an edit changes none of them.
 */
function demoUpdatedListing({
  ref,
  draft,
}: AdminUpdateListingVariables): PendingListing {
  const business = adminDraftToUpdateDto(draft);
  const found = findDemoQueueRow(ref);
  return {
    ...business,
    ...BLANK_OWNER_PERSONAL_FIELDS,
    // The admin body carries neither, and the save leaves both as stored.
    path: found?.row.detail.path ?? draft.path,
    ownerRole: draft.ownerRole,
    // Wire shape back to editable shape, as `listingDtoToPending` does live.
    services: toServiceRows(business.services),
    menu: toMenuDraft(business.menu),
    affirmingBaselineAccepted: true,
    isStaffAuthored: true,
    ref,
    slug: found?.row.slug ?? slugify(business.name),
    status: found?.status ?? "review",
    // The platform holds it, so nobody's member account submitted it.
    submittedBy: "",
  };
}

/**
 * The listing the admin edit page opens, as `GET /admin/listings/:ref/editable`
 * returns it. Disabled until the route supplies a `ref`.
 *
 * Keyed under `ADMIN_LISTINGS_KEY` so a queue mutation's invalidation also
 * refreshes an open edit page. The `"editable"` segment sits where the queue
 * keys carry their `demoMode` boolean, so `patchListingInCache` and the queue
 * snapshots (which match on `[ADMIN_LISTINGS_KEY, demoMode]`) never walk this
 * entry expecting a queue page. `demoMode` rides at the end so a demo fixture
 * is never served from cache to a live session.
 */
export function useAdminEditableListing(ref: string | undefined) {
  const { demoMode } = useDemoMode();
  const listingRef = ref ?? "";
  return useQuery<ManagedListingDTO>({
    queryKey: [ADMIN_LISTINGS_KEY, "editable", listingRef, demoMode],
    queryFn: () =>
      demoMode
        ? Promise.resolve(demoEditableListing(listingRef))
        : getAdminEditableListing(listingRef),
    enabled: listingRef !== "",
    // A demo miss is a fixture lookup, so a retry would miss again.
    ...(demoMode ? { retry: false } : {}),
  });
}

/**
 * `PATCH /admin/listings/:ref` as the admin edit page's wizard submit.
 *
 * Resolves a `PendingListing`, which is what `ListingWizard`'s `submit` seam is
 * typed to. The global error toast is silenced because the wizard reports a
 * failed save itself, and the page swaps in its has-owner notice on a 409.
 *
 * Live success invalidates the queue, the public directory (a save on a live
 * listing changes what the directory shows) and the listing's history, where
 * the server records the save as a `staff_edited` event. Demo mode's fixtures
 * never go stale, so there is nothing to reconcile.
 */
export function useAdminUpdateListing() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useDemoAwareMutation<
    PendingListing,
    Error,
    AdminUpdateListingVariables
  >({
    demoMode,
    meta: { silentError: true },
    demoResult: (variables) => demoUpdatedListing(variables),
    live: async ({ ref, draft }) =>
      listingDtoToPending(
        await adminUpdateListing(ref, adminDraftToUpdateDto(draft)),
      ),
    logLabel: "admin.listing.update",
    logContext: ({ ref, draft }) => ({ ref, name: draft.name }),
    onLiveSuccess: (_saved, { ref }) => {
      void queryClient.invalidateQueries({ queryKey: [ADMIN_LISTINGS_KEY] });
      void queryClient.invalidateQueries({ queryKey: [DIRECTORY_KEY] });
      void queryClient.invalidateQueries({
        queryKey: listingHistoryQueryKey(ref, false),
      });
    },
  });
}
