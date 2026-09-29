import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AdminShell } from "../../shared/components/layout/AdminShell";
import { AdminPageHeader } from "./ui";
import { FadeIn } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { ListingWizard } from "../marketing/listBusiness/ListingWizard";
import { blankDraft } from "../marketing/listBusiness/listingFormDraft";
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

/**
 * The wizard opens on the one path that describes what staff are doing here.
 *
 * Seeding it is load-bearing twice over. `useListingFormMissing` blocks step 0
 * while `draft.path` is empty and `blankDraft()` leaves it so, and clicking
 * the card to fill it runs `pickPath`, which writes a `rel` the admin create
 * body has no room for. Seeding means that handler never runs. "suggest" is
 * also the truthful value: "claim" means "this is my business", which an
 * admin never is.
 */
function staffAuthoredDraft(): ListingDraft {
  return { ...blankDraft(), isStaffAuthored: true, path: "suggest" };
}

/** The id the page heading carries, so "Add another listing" can move focus
 *  back to the top of a fresh form. */
const LISTING_NEW_HEADING_ID = "admin-listing-new-heading";

/**
 * After "Add another listing" remounts the form, returns the admin to the top
 * of the page with focus on its heading. The button that was pressed unmounts
 * with the success panel, which would otherwise leave focus on the body. Waits
 * two frames so React has committed the fresh form first, the same way
 * `focusListingQueueHeadingAfterRemove` in `listingQueueFocus.ts` does.
 */
function focusListingNewHeadingAfterReset() {
  window.scrollTo({ top: 0 });
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      document.getElementById(LISTING_NEW_HEADING_ID)?.focus();
    });
  });
}

interface AdminListingNewFormProps {
  onAddAnother: () => void;
}

/**
 * Everything on the page that holds state for one listing: the admin block,
 * the wizard and the create mutation. The page mounts it under a `key` that
 * "Add another listing" bumps, so starting over is a clean remount with a
 * blank draft, the publish state back on "review" and a fresh mutation.
 */
function AdminListingNewForm({ onAddAnother }: AdminListingNewFormProps) {
  const navigate = useNavigate();
  const { mutateAsync: createListing } = useAdminCreateListing();
  const [publishState, setPublishState] =
    useState<ListingPublishState>("review");
  const [ownerSlug, setOwnerSlug] = useState("");
  const [ownerNote, setOwnerNote] = useState("");
  // Set the moment the create resolves, which is what retires the admin
  // block. The wizard leaves the form behind at the same point: it shows its
  // sending panel and then the success panel, and it offers no way back to a
  // form whose success is rendered by this page.
  const [hasCreatedListing, setHasCreatedListing] = useState(false);

  const initialDraft = useMemo(() => staffAuthoredDraft(), []);

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
        initialDraft={initialDraft}
        seed={BLANK_OWNER_PERSONAL_FIELDS}
        userName=""
        userInitials=""
        // Live autosave writes member-scoped draft rows through
        // `listingDrafts.api`. An admin console has no business minting one
        // against the admin's own member account.
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

/**
 * `/admin/listings/new`: staff authoring a directory listing for a business
 * that has not joined yet.
 *
 * The form itself IS the member wizard (`ListingWizard`), mounted through the
 * seams it grew for this page: a staff-authored draft, no autosave, no
 * member-shaped name or seed, and a submit that posts to `POST
 * /admin/listings`. Everything addressed to a
 * submitter about themselves (the owner block, the consents, the affirming
 * baseline, the vouch line) hides itself on a staff-authored draft, so what
 * is left is the business.
 *
 * The wizard's CSS modules live in the marketing feature. That cross-feature
 * import is deliberate and safe: they are plain CSS modules over the global
 * tokens, with nothing marketing-specific to inherit.
 */
export function AdminListingNewPage() {
  const { t } = useTranslation();
  // Bumped by "Add another listing": the form below is keyed on it, so each
  // round starts from a clean mount.
  const [formRound, setFormRound] = useState(0);

  const startAnotherListing = useCallback(() => {
    setFormRound((round) => round + 1);
    focusListingNewHeadingAfterReset();
  }, []);

  return (
    <AdminShell
      title={t("admin:listingNew.title")}
      breadcrumb={[
        { label: t("admin:common.adminBreadcrumb"), to: routes.admin },
        // A plain label of its own, because `admin:adminListings.title`
        // carries `<em>` markup for the queue's own heading.
        {
          label: t("admin:listingNew.queueBreadcrumb"),
          to: routes.adminListings,
        },
      ]}
    >
      <FadeIn>
        <AdminPageHeader
          eyebrow={t("admin:listingNew.eyebrow")}
          title={t("admin:listingNew.title")}
          sub={t("admin:listingNew.sub")}
          titleId={LISTING_NEW_HEADING_ID}
        />
      </FadeIn>

      <AdminListingNewForm key={formRound} onAddAnother={startAnotherListing} />
    </AdminShell>
  );
}
