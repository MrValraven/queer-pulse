import type { CropRect } from "../../../../shared/components/ui/cropGeometry";
import { VerifiedBadgeEditNotice } from "../../EditListingStatusHeader";
import type { ManagedListingDTO } from "../api/listings.api";
import { CoManagerRoleFields } from "../coManagers/CoManagerRoleFields";
import { ListingCoManagersSection } from "../coManagers/ListingCoManagersSection";
import type { ListingForm } from "../useListingForm";
import { BasicsFields } from "../fields/BasicsFields";
import { StoryFields } from "../fields/StoryFields";
import { PracticalFields } from "../fields/PracticalFields";
import { PhotosFields } from "../fields/PhotosFields";
import { OwnerFields } from "../fields/OwnerFields";
import { ConsentChecks } from "../fields/ConsentChecks";
import { AffirmingBaselineNotice } from "../fields/AffirmingBaselineAgreement";
import { ListingHoursExceptions } from "../ListingHoursExceptions";
import { ListingEditorSection } from "./ListingEditorSection";
import { ListingAccessibilityFields } from "./ListingAccessibilityFields";
import { ListingServicesFields } from "./ListingServicesFields";
import { ListingDirectoryVisibilitySection } from "./ListingDirectoryVisibilitySection";
import { ListingOperatingStateSection } from "./ListingOperatingStateSection";
import { editorSectionByKeyFor } from "./listingEditor.data";

/**
 * Every field of the listing on one page, grouped under its section heading.
 *
 * Each block renders the SAME field component the create wizard's matching
 * step renders, so the two surfaces cannot drift: the wizard supplies pane
 * chrome around those components, this supplies section chrome.
 *
 * Several blocks are owner-only and have no wizard counterpart: the dated
 * hours exceptions (slotted under the weekly grid), the priced services and
 * accessibility answers (both easier to get right once the place is listed
 * than mid-submission), and the trading + directory-visibility controls, which
 * report on a business that already exists.
 *
 * Two blocks change shape for a CO-MANAGER. "About you" is mostly the owner's
 * own personal data, which the API neither sends them nor accepts from them,
 * so they get the role field and a line explaining the rest; and the two
 * permissions in the last section are the owner's grant, so they are read-only
 * there. Everything else about the business is identical for both roles.
 *
 * Trading state and directory visibility share ONE section on purpose. They
 * are different questions with similar-sounding answers ("we are shut for
 * August" versus "take my entry down for a while"), and the only reliable way
 * to stop an owner picking the wrong one is to put both in front of them at
 * once with the difference spelled out.
 */
export function ListingEditorSections({
  form,
  listing,
  userName,
  uploadPhoto,
}: {
  form: ListingForm;
  listing: ManagedListingDTO;
  userName: string;
  uploadPhoto: (
    file: File,
    options?: { crop?: CropRect },
  ) => Promise<{ key: string; previewUrl: string }>;
}) {
  /** True only for a listing that actually carries the moderator-granted
   *  "verified queer-owned" badge, which the name, the owned/friendly badge
   *  and the link-to-profile toggle are pinned to. */
  const isBadgeNoticeVisible = listing.queerOwnedVerified === true;
  const isCoManagerView = listing.managementRole === "co_manager";
  const section = editorSectionByKeyFor(isCoManagerView);

  return (
    <>
      <ListingEditorSection section={section.basics}>
        {isBadgeNoticeVisible && <VerifiedBadgeEditNotice />}
        <BasicsFields form={form} editRef={listing.ref} />
      </ListingEditorSection>

      <ListingEditorSection section={section.story}>
        <StoryFields form={form} />
      </ListingEditorSection>

      <ListingEditorSection section={section.services}>
        <ListingServicesFields form={form} />
      </ListingEditorSection>

      <ListingEditorSection section={section.practical}>
        <PracticalFields
          form={form}
          hoursExtras={<ListingHoursExceptions form={form} />}
        />
      </ListingEditorSection>

      <ListingEditorSection section={section.accessibility}>
        <ListingAccessibilityFields form={form} />
      </ListingEditorSection>

      <ListingEditorSection section={section.trading}>
        <ListingOperatingStateSection listing={listing} />
        <ListingDirectoryVisibilitySection listing={listing} />
      </ListingEditorSection>

      <ListingEditorSection section={section.photos}>
        <PhotosFields form={form} uploadPhoto={uploadPhoto} />
      </ListingEditorSection>

      <ListingEditorSection section={section.aboutYou}>
        {/* The link-to-profile toggle lives here, and it is one of the three
            fields the verified badge is pinned to, so the disclosure sits
            beside it as well as beside the name and badge above. A co-manager
            never sees that toggle, so the notice would name a field that is
            not on their page. */}
        {isBadgeNoticeVisible && !isCoManagerView && (
          <VerifiedBadgeEditNotice />
        )}
        {isCoManagerView ? (
          <CoManagerRoleFields form={form} />
        ) : (
          <OwnerFields form={form} userName={userName} />
        )}
      </ListingEditorSection>

      <ListingEditorSection section={section.coManagers}>
        <ListingCoManagersSection listing={listing} />
      </ListingEditorSection>

      <ListingEditorSection section={section.permissions}>
        {/* Read-only: a listing cannot un-agree to the baseline it only exists
            because of, and the API rejects a PATCH that tries. */}
        <AffirmingBaselineNotice />
        {/* The two permissions are the owner's own grant about their own
            identity, so a co-manager neither sees nor sends them. */}
        {!isCoManagerView && <ConsentChecks form={form} />}
      </ListingEditorSection>
    </>
  );
}
