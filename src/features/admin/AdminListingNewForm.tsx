import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { routes } from "../../app/routeMap";
import { ListingWizard } from "../marketing/listBusiness/ListingWizard";
import { BLANK_OWNER_PERSONAL_FIELDS } from "../marketing/listBusiness/ownerPersonalFields";
import type { ListingDraft } from "../marketing/listBusiness/listBusiness.data";
import { AdminListingNewFields } from "./AdminListingNewFields";
import { AdminListingNewSuccess } from "./AdminListingNewSuccess";
import {
  adminDraftToDto,
  type AdminListingOwnerOfferInput,
  type ListingPublishState,
} from "./api/adminListingCreate.api";
import { useAdminCreateListing } from "./api/useAdminCreateListing";

export interface AdminListingNewFormProps {
  /** The draft the wizard opens on: a staff-authored blank, or the business
   *  half of a member's unfinished draft (`teamDraftFromMemberDraft`). Read
   *  once on mount, like the wizard's own `initialDraft`. */
  initialDraft: ListingDraft;
  /** Who the offer goes to before the admin types anything. */
  initialOwnerSlug?: string;
  initialOwnerNote?: string;
  onAddAnother: () => void;
}

/**
 * Everything on the page that holds state for one listing: the admin block,
 * the wizard and the create mutation. The page mounts it under a `key` that
 * "Add another listing" bumps, so starting over is a clean remount with a
 * blank draft, the publish state back on "review" and a fresh mutation.
 */
export function AdminListingNewForm({
  initialDraft,
  initialOwnerSlug = "",
  initialOwnerNote = "",
  onAddAnother,
}: AdminListingNewFormProps) {
  const navigate = useNavigate();
  const { mutateAsync: createListing } = useAdminCreateListing();
  const [publishState, setPublishState] =
    useState<ListingPublishState>("review");
  const [ownerSlug, setOwnerSlug] = useState(initialOwnerSlug);
  const [ownerNote, setOwnerNote] = useState(initialOwnerNote);
  // Set the moment the create resolves, which is what retires the admin
  // block. The wizard leaves the form behind at the same point: it shows its
  // sending panel and then the success panel, and it offers no way back to a
  // form whose success is rendered by this page.
  const [hasCreatedListing, setHasCreatedListing] = useState(false);
  // Pinned on mount: the wizard reads `initialDraft` once, and a new object
  // identity from a parent re-render must not look like a new draft.
  const [startingDraft] = useState(initialDraft);

  const handleAdminSubmit = useCallback(
    async (draft: ListingDraft) => {
      const memberSlug = ownerSlug.trim();
      const note = ownerNote.trim();
      const ownerOffer: AdminListingOwnerOfferInput | undefined = memberSlug
        ? { memberSlug, ...(note ? { note } : {}) }
        : undefined;
      const created = await createListing(
        adminDraftToDto(draft, { publishState, ownerOffer }),
      );
      setHasCreatedListing(true);
      return created;
    },
    [createListing, publishState, ownerSlug, ownerNote],
  );

  const goToQueue = useCallback(
    () => void navigate(routes.adminListings),
    [navigate],
  );

  return (
    <>
      {/* The listing is created with the publish state and the offer the
          admin chose here, and nothing about them can be changed from this
          page afterwards. Retire the block once it exists, so the console
          stops offering controls that no longer reach anything. */}
      {!hasCreatedListing && (
        <AdminListingNewFields
          publishState={publishState}
          onPublishStateChange={setPublishState}
          ownerSlug={ownerSlug}
          onOwnerSlugChange={setOwnerSlug}
          ownerNote={ownerNote}
          onOwnerNoteChange={setOwnerNote}
        />
      )}

      <ListingWizard
        initialDraft={startingDraft}
        seed={BLANK_OWNER_PERSONAL_FIELDS}
        userName=""
        userInitials=""
        // Live autosave writes member-scoped draft rows through
        // `listingDrafts.api`. An admin console has no business minting one
        // against the admin's own member account, nor writing to the member's
        // draft it was opened from.
        isDraftAutosaveEnabled={false}
        submit={handleAdminSubmit}
        onCancel={goToQueue}
        onDone={goToQueue}
        renderSuccess={(created) => (
          <AdminListingNewSuccess
            created={created}
            onAddAnother={onAddAnother}
          />
        )}
      />
    </>
  );
}
