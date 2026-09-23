import { useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { listingDtoToPending } from "../../marketing/listBusiness/api/listings.adapters";
import { BLANK_OWNER_PERSONAL_FIELDS } from "../../marketing/listBusiness/ownerPersonalFields";
import { toServiceRows } from "../../marketing/listBusiness/listingServices.data";
import {
  slugify,
  type PendingListing,
} from "../../marketing/listBusiness/listBusiness.data";
import {
  adminCreateListing,
  type AdminCreateListingDto,
} from "./adminListingCreate.api";
import { useDemoAwareMutation } from "./demoAwareMutation";
import { ADMIN_LISTINGS_KEY } from "./useAdminListings";

/** Demo refs are numbered in the order the console mints them, so two creates
 *  in one session never collide on a React key. */
let demoListingSequence = 0;

/**
 * The record demo mode resolves with, standing in for what the server would
 * return. Built from the body the console assembled plus the fields only a
 * created listing has.
 *
 * `publishState` and `ownerOffer` are destructured off, because neither is a
 * listing field and `PendingListing` has no room for them.
 * The owner-personal blanks come from `BLANK_OWNER_PERSONAL_FIELDS`, the same
 * inert values a co-manager's draft carries, because a staff-authored listing
 * genuinely has no owner yet.
 */
function demoCreatedListing({
  publishState,
  ownerOffer: _ownerOffer,
  ...business
}: AdminCreateListingDto): PendingListing {
  demoListingSequence += 1;
  return {
    ...business,
    ...BLANK_OWNER_PERSONAL_FIELDS,
    ownerRole: "",
    // The payload carries services in their WIRE shape, which has lost the
    // client-only React key every editable row needs. Adopt them back, the
    // same way `listingDtoToPending` does on the live path.
    services: toServiceRows(business.services),
    // The listing exists, so the affirming baseline applies to it. Whoever
    // accepts the handover agrees to it in their own name.
    affirmingBaselineAccepted: true,
    isStaffAuthored: true,
    ref: `QPL-DEMO-${String(demoListingSequence).padStart(4, "0")}`,
    slug: slugify(business.name),
    status: publishState === "live" ? "live" : "review",
    // Nobody's member account submitted this one.
    submittedBy: "",
  };
}

/**
 * `POST /admin/listings` as the admin create page's wizard submit.
 *
 * Resolves a `PendingListing`, which is what `ListingWizard`'s `submit` seam
 * is typed to and what its success panel renders. Live mode adapts the response through `listingDtoToPending`, the
 * same mapper the member create uses.
 *
 * The queue cache is invalidated in live mode only: demo mode's fixture never
 * goes stale, so there is nothing to reconcile.
 */
export function useAdminCreateListing() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useDemoAwareMutation<PendingListing, Error, AdminCreateListingDto>({
    demoMode,
    demoResult: (body) => demoCreatedListing(body),
    live: async (body) => listingDtoToPending(await adminCreateListing(body)),
    logLabel: "admin.listing.create",
    logContext: (body) => ({
      name: body.name,
      publishState: body.publishState,
      hasOwnerOffer: Boolean(body.ownerOffer),
    }),
    onLiveSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [ADMIN_LISTINGS_KEY] });
    },
  });
}
