import { VerifiedBadgeEditNotice } from "../marketing/EditListingStatusHeader";
import type { ManagedListingDTO } from "../marketing/listBusiness/api/listings.api";
import { listingKindOf } from "../marketing/listBusiness/listingMobile.data";
import { effectivePricingMode } from "../marketing/listBusiness/listingShop.data";
import type { ListingForm } from "../marketing/listBusiness/useListingForm";
import { BasicsFields } from "../marketing/listBusiness/fields/BasicsFields";
import { StoryFields } from "../marketing/listBusiness/fields/StoryFields";
import { PracticalFields } from "../marketing/listBusiness/fields/PracticalFields";
import { PhotosFields } from "../marketing/listBusiness/fields/PhotosFields";
import { ListingHoursExceptions } from "../marketing/listBusiness/ListingHoursExceptions";
import { ListingEditorSection } from "../marketing/listBusiness/editor/ListingEditorSection";
import { ListingAccessibilityFields } from "../marketing/listBusiness/editor/ListingAccessibilityFields";
import { ListingPricingFields } from "../marketing/listBusiness/editor/ListingPricingFields";
import {
  accessibilitySectionDefinition,
  isSectionShownForListing,
  practicalSectionDefinition,
  pricingSectionDefinition,
} from "../marketing/listBusiness/editor/listingEditor.data";
import { ADMIN_EDITOR_SECTION_BY_KEY } from "./adminListingEditor.data";

/**
 * Every business field of a platform-held listing on one page, for an admin.
 *
 * Each block is the owner editor's block (`ListingEditorSections`), with the
 * same field component and the same section chrome, so an admin and an owner
 * edit the listing through identical inputs: the priced services, menu or
 * shop, the dated hours exceptions under the weekly grid, and the
 * accessibility answers included.
 *
 * The blocks about whoever holds the listing are left out (see
 * `adminListingEditor.data`). The fields themselves read the draft's
 * `isStaffAuthored` flag where it matters, as they did in the wizard: the
 * 18+ acknowledgement only the business can give never shows here.
 */
export function AdminListingEditorSections({
  form,
  listing,
  loadedName,
}: {
  form: ListingForm;
  listing: ManagedListingDTO;
  /** The name the listing loaded with. The duplicate hint waits until the
   *  name changes, so the listing's own name never flags itself. */
  loadedName: string;
}) {
  const section = ADMIN_EDITOR_SECTION_BY_KEY;
  const isAccessibilityShown = isSectionShownForListing(
    "accessibility",
    form.draft.online,
  );

  return (
    <>
      <ListingEditorSection section={section.basics}>
        {/* The name and badge are pinned while the moderator-granted badge
            stands, for staff as for an owner. */}
        {listing.queerOwnedVerified === true && <VerifiedBadgeEditNotice />}
        <BasicsFields
          form={form}
          editRef={listing.ref}
          duplicateCheckBaselineName={loadedName}
        />
      </ListingEditorSection>

      <ListingEditorSection section={section.story}>
        <StoryFields form={form} />
      </ListingEditorSection>

      <ListingEditorSection
        section={pricingSectionDefinition(
          section.services,
          effectivePricingMode(form.draft),
        )}
      >
        <ListingPricingFields form={form} />
      </ListingEditorSection>

      <ListingEditorSection
        section={practicalSectionDefinition(
          section.practical,
          form.draft.online,
        )}
      >
        <PracticalFields
          form={form}
          hoursExtras={<ListingHoursExceptions form={form} />}
        />
      </ListingEditorSection>

      {isAccessibilityShown && (
        <ListingEditorSection
          section={accessibilitySectionDefinition(
            section.accessibility,
            listingKindOf(form.draft),
          )}
        >
          <ListingAccessibilityFields form={form} />
        </ListingEditorSection>
      )}

      <ListingEditorSection section={section.photos}>
        <PhotosFields form={form} />
      </ListingEditorSection>
    </>
  );
}
