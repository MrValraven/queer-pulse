import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { flushSync } from "react-dom";
import { useNavigate, useParams } from "react-router-dom";
import { AdminShell } from "../../shared/components/layout/AdminShell";
import { AdminPageHeader } from "./ui";
import {
  FadeIn,
  LoadErrorState,
  SkeletonCard,
} from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { ApiError } from "../../shared/api/client";
import { ListingWizard } from "../marketing/listBusiness/ListingWizard";
import { dtoToDraft } from "../marketing/listBusiness/dtoToDraft";
import { BLANK_OWNER_PERSONAL_FIELDS } from "../marketing/listBusiness/ownerPersonalFields";
import type { ListingDraft } from "../marketing/listBusiness/listBusiness.data";
import type { ManagedListingDTO } from "../marketing/listBusiness/api/listings.api";
import { isListingHasOwnerError } from "./api/adminListingEdit.api";
import {
  useAdminEditableListing,
  useAdminUpdateListing,
} from "./api/useAdminListingEdit";
import {
  AdminListingEditHasOwner,
  AdminListingEditNotFound,
  AdminListingEditSuccess,
} from "./AdminListingEditStates";

/** The wizard's basics step, where an admin editing a listing starts. Step 0
 *  only picks the path, which the staff draft already fixes. */
const BASICS_STEP = 1;

/** A load refused as missing (404) or out of this admin's reach (403) reads
 *  as "not found"; anything else is an outage worth retrying. */
function isListingNotFoundError(error: unknown): boolean {
  return (
    error instanceof ApiError && (error.status === 404 || error.status === 403)
  );
}

/**
 * The member wizard over a listing the platform holds.
 *
 * `path` is forced to "suggest" for the reason `staffAuthoredDraft` in
 * `AdminListingNewPage` documents: step 0 offers staff only that card, and a
 * draft carrying any other path would leave step 0 with nothing selected. A
 * listing stored as `claim` therefore still shows the staff path here. The
 * value never reaches the server, because `adminDraftToUpdateDto` drops it.
 */
function AdminListingEditWizard({
  listingRef,
  listing,
  onHasOwner,
}: {
  listingRef: string;
  listing: ManagedListingDTO;
  onHasOwner: () => void;
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { mutateAsync: updateListing } = useAdminUpdateListing();
  const initialDraft = useMemo(
    () => ({
      ...dtoToDraft(listing),
      isStaffAuthored: true,
      path: "suggest" as const,
    }),
    [listing],
  );

  const handleSubmit = useCallback(
    async (draft: ListingDraft) => {
      try {
        return await updateListing({ ref: listingRef, draft });
      } catch (error) {
        // Committed synchronously: the has-owner notice replaces the wizard
        // before the rethrow reaches its catch, which then sees itself
        // unmounted and returns early without its "couldn't send" toast.
        if (isListingHasOwnerError(error)) flushSync(onHasOwner);
        // Rethrown so the wizard's own error path runs on every other failure.
        throw error;
      }
    },
    [updateListing, listingRef, onHasOwner],
  );

  const goToQueue = useCallback(
    () => void navigate(routes.adminListings),
    [navigate],
  );

  return (
    <ListingWizard
      initialDraft={initialDraft}
      initialStep={BASICS_STEP}
      submitLabel={t("admin:listingEdit.submitCta")}
      isEditSave
      seed={BLANK_OWNER_PERSONAL_FIELDS}
      userName=""
      userInitials=""
      // Autosave writes member-scoped draft rows; an admin console has no
      // business minting one against the admin's own member account.
      isDraftAutosaveEnabled={false}
      submit={handleSubmit}
      onCancel={goToQueue}
      onDone={goToQueue}
      renderSuccess={(saved) => <AdminListingEditSuccess saved={saved} />}
    />
  );
}

/**
 * `/admin/listings/:ref/edit`: an admin editing a listing the platform holds,
 * a suggestion or a staff-authored listing nobody has taken over yet.
 *
 * Built like `AdminListingNewPage`: the form IS the member wizard, fed a
 * staff-authored draft, and the save goes to `PATCH /admin/listings/:ref`.
 * Once the listing has an owner (the loaded listing names a submitter, or the
 * save is refused with `LISTING_HAS_OWNER`), the page shows that in place of
 * the wizard.
 */
export function AdminListingEditPage() {
  const { t } = useTranslation();
  const { ref = "" } = useParams<{ ref: string }>();
  const {
    data: listing,
    error,
    isError,
    refetch,
  } = useAdminEditableListing(ref);
  const [hasOwnerNow, setHasOwnerNow] = useState(false);
  const markHasOwner = useCallback(() => setHasOwnerNow(true), []);
  const hasOwnerNoticeRef = useRef<HTMLElement>(null);

  // A refused save swaps the notice in under the admin's cursor, and the
  // submit button they pressed is gone, so focus moves to the notice for a
  // screen reader to announce it and a keyboard user to continue from it.
  useEffect(() => {
    if (hasOwnerNow) hasOwnerNoticeRef.current?.focus();
  }, [hasOwnerNow]);

  const hasOwner =
    hasOwnerNow || (listing !== undefined && listing.submittedBy !== null);

  let body: ReactNode;
  if (hasOwner) {
    body = (
      <AdminListingEditHasOwner
        listing={listing}
        noticeRef={hasOwnerNoticeRef}
      />
    );
  } else if (listing) {
    body = (
      <AdminListingEditWizard
        listingRef={ref}
        listing={listing}
        onHasOwner={markHasOwner}
      />
    );
  } else if (isError && isListingNotFoundError(error)) {
    body = <AdminListingEditNotFound />;
  } else if (isError) {
    body = (
      <LoadErrorState
        onRetry={() => void refetch()}
        title={t("admin:listingEdit.loadError.title")}
        description={t("admin:listingEdit.loadError.body")}
      />
    );
  } else {
    body = <SkeletonCard />;
  }

  return (
    <AdminShell
      title={t("admin:listingEdit.title")}
      breadcrumb={[
        { label: t("admin:common.adminBreadcrumb"), to: routes.admin },
        {
          label: t("admin:listingEdit.queueBreadcrumb"),
          to: routes.adminListings,
        },
      ]}
    >
      <FadeIn>
        <AdminPageHeader
          eyebrow={t("admin:listingEdit.eyebrow")}
          title={t("admin:listingEdit.title")}
          sub={t("admin:listingEdit.sub")}
        />
      </FadeIn>
      {body}
    </AdminShell>
  );
}
