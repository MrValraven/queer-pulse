import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useParams } from "react-router-dom";
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
import { useAdminEditableListing } from "./api/useAdminListingEdit";
import { AdminListingEditor } from "./AdminListingEditor";
import {
  AdminListingEditHasOwner,
  AdminListingEditNotFound,
} from "./AdminListingEditStates";
import { AdminListingEditStatusLine } from "./AdminListingEditStatusLine";

/** A load refused as missing (404) or out of this admin's reach (403) reads
 *  as "not found"; anything else is an outage worth retrying. */
function isListingNotFoundError(error: unknown): boolean {
  return (
    error instanceof ApiError && (error.status === 404 || error.status === 403)
  );
}

/**
 * `/admin/listings/:ref/edit`: an admin editing a listing the platform holds,
 * a suggestion or a staff-authored listing nobody has taken over yet.
 *
 * The form IS the owner's single-screen editor (`AdminListingEditor`), fed
 * a staff-authored draft, so an admin edits every business field an owner
 * can, the priced lists, accessibility and dated hours included. The save
 * goes to `PATCH /admin/listings/:ref`. A status line under the header names
 * the listing's ref and status, so the page reads as an edit of an existing
 * listing. Once the listing has an owner (the loaded listing names a
 * submitter, or the save is refused with `LISTING_HAS_OWNER`), the page
 * shows that in place of the editor.
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
  // Once the save lands, the editor's success panel names the outcome, and
  // the "Editing" status line and the header's sub above it would read stale.
  const [isSaved, setIsSaved] = useState(false);
  const markSaved = useCallback(() => setIsSaved(true), []);
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
      <>
        {!isSaved && (
          <AdminListingEditStatusLine
            listingRef={ref}
            status={listing.status}
          />
        )}
        <AdminListingEditor
          listing={listing}
          onHasOwner={markHasOwner}
          onSaved={markSaved}
        />
      </>
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
          // The sub says what a save will do; once it has, the success panel
          // says what it did. `sub` renders as a paragraph, which cannot hold
          // the block-level Collapse, so it goes with the status line.
          sub={isSaved ? undefined : t("admin:listingEdit.sub")}
        />
      </FadeIn>
      {body}
    </AdminShell>
  );
}
