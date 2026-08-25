import { EditListingStatusHeader } from "../../EditListingStatusHeader";
import type { ManagedListingDTO } from "../api/listings.api";
import { CoManagerRoleBanner } from "../coManagers/CoManagerRoleBanner";
import { WizardServerError } from "../WizardExtras";
import { ListingDetailsConfirmCard } from "./ListingDetailsConfirmCard";
import { ListingHiddenBanner } from "./ListingHiddenBanner";
import { ListingEditorRestoreBanner } from "./ListingEditorRestoreBanner";
import type { RestorableEditDraft } from "./useListingEditorAutosave";

/**
 * Everything the editor says before the form starts: what this member is to
 * the listing, where it stands with moderation, whether it is paused, when its
 * details were last confirmed, an unsaved local copy going spare, and the last
 * save's failure.
 *
 * Its own component so `ListingEditor` stays about the form and the save.
 * Ordered by how much it would cost to miss: the role first (a co-manager is
 * about to edit somebody else's business), then the listing's standing, then
 * the recoverable and the recent.
 */
export function ListingEditorNotices({
  listing,
  restorable,
  onRestore,
  onDiscardRestorable,
  serverError,
  onDismissServerError,
}: {
  listing: ManagedListingDTO;
  /** A local copy of an unfinished edit, when one is going spare. */
  restorable: RestorableEditDraft | null;
  onRestore: () => void;
  onDiscardRestorable: () => void;
  serverError: string | null;
  onDismissServerError: () => void;
}) {
  return (
    <>
      {listing.managementRole === "co_manager" && (
        <CoManagerRoleBanner
          listingName={listing.name}
          ownerFirstName={listing.submittedBy?.firstName}
        />
      )}
      <EditListingStatusHeader status={listing.status} />
      {/* A paused listing is invisible in the directory, and the switch that
          did it sits far down the page beside the trading controls. Say so on
          arrival so nobody edits a listing for an hour believing it is live. */}
      <ListingHiddenBanner listing={listing} />
      <ListingDetailsConfirmCard
        listingRef={listing.ref}
        detailsConfirmedAt={listing.detailsConfirmedAt}
      />
      {restorable && (
        <ListingEditorRestoreBanner
          restorable={restorable}
          onRestore={onRestore}
          onDiscard={onDiscardRestorable}
        />
      )}
      {serverError && (
        <WizardServerError
          message={serverError}
          onDismiss={onDismissServerError}
        />
      )}
    </>
  );
}
