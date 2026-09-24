import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDirectoryListingsActions } from "../../../../app/providers/useDirectoryListingsActions";
import { routes } from "../../../../app/routeMap";
import { useToast } from "../../../../shared/components/feedback/useToast";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import type { ManagedListingDTO } from "../api/listings.api";

/**
 * The owner's way out of the editor once the Danger zone's delete has gone
 * through: wipe this listing's local autosave, say what happened, and land on
 * the owner's own places on their profile.
 *
 * `confirmDelete` is what `ListingDeleteFlow` awaits. A failed delete rejects
 * straight through it, so the flow stays open on its last step with the error,
 * and the editor underneath is exactly as it was.
 *
 * `hasDeleted` is for the unsaved-changes guard, which must stand down before
 * the navigation or it would offer to keep edits to a listing that no longer
 * exists. The navigation therefore waits for the commit that turns it true:
 * the guard un-patches the router in that same commit's cleanups, which React
 * runs before any of its effects, this one included.
 */
export function useDeleteListingExit(
  listing: ManagedListingDTO,
  clearAutosave: () => void,
) {
  const { deleteListing } = useDirectoryListingsActions();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { t } = useTranslation();
  const [hasDeleted, setHasDeleted] = useState(false);
  const listingName = listing.name;

  useEffect(() => {
    if (!hasDeleted) return;
    showToast(
      t("marketing:listBusiness.editor.dangerZone.deletedToast", {
        name: listingName,
      }),
      "success",
    );
    // `PlacesSection` renders `id="places"`, and `ScrollManager` scrolls to a
    // hash on arrival.
    void navigate(`${routes.accountProfile}#places`);
  }, [hasDeleted, listingName, navigate, showToast, t]);

  const confirmDelete = async () => {
    await deleteListing(listing.ref);
    clearAutosave();
    setHasDeleted(true);
  };

  return { hasDeleted, confirmDelete };
}
