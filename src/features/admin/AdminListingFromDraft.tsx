import { useMemo } from "react";
import { FiFileText } from "react-icons/fi";
import {
  EmptyState,
  LoadErrorState,
  SkeletonCard,
} from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { ApiError } from "../../shared/api/client";
import { routes } from "../../app/routeMap";
import { AdminListingNewForm } from "./AdminListingNewForm";
import { teamDraftFromMemberDraft } from "./listingDraftHandover";
import type { AdminListingDraftDetailDTO } from "./api/adminListingDrafts.api";
import { useAdminListingDraft } from "./api/useAdminListingDrafts";
import styles from "./AdminListingNewPage.module.css";

/** Gone (submitted or discarded since the list loaded) or not this admin's
 *  to open. Either way there is nothing to retry. */
function isDraftGoneError(error: unknown): boolean {
  return (
    error instanceof ApiError && (error.status === 404 || error.status === 403)
  );
}

interface AdminListingFromDraftProps {
  draftId: string;
  onAddAnother: () => void;
}

/**
 * `/admin/listings/new?fromDraft=<id>`: the add-a-listing form, opened on the
 * business half of a member's unfinished draft and offered back to them.
 *
 * It goes out as a team listing, like any other on this page. The member's
 * own answers (who they are, their consents, the pledge, a queer-owned claim)
 * are never copied; they give those themselves when they accept the offer.
 * Their own draft is only read, never written, so it stays as they left it.
 */
export function AdminListingFromDraft({
  draftId,
  onAddAnother,
}: AdminListingFromDraftProps) {
  const { t } = useTranslation();
  const { data, isError, error, refetch } = useAdminListingDraft(draftId);

  if (data) {
    return <DraftHandoverForm draft={data} onAddAnother={onAddAnother} />;
  }
  if (isError && isDraftGoneError(error)) {
    return (
      <EmptyState
        headingLevel={2}
        icon={<FiFileText />}
        title={t("admin:listingNew.fromDraft.gone.title")}
        description={t("admin:listingNew.fromDraft.gone.body")}
        action={{
          label: t("admin:listingNew.fromDraft.gone.backCta"),
          to: routes.adminListings,
        }}
      />
    );
  }
  if (isError) {
    return (
      <LoadErrorState
        onRetry={() => void refetch()}
        title={t("admin:listingNew.fromDraft.loadError.title")}
        description={t("admin:listingNew.fromDraft.loadError.body")}
      />
    );
  }
  return <SkeletonCard />;
}

function DraftHandoverForm({
  draft,
  onAddAnother,
}: {
  draft: AdminListingDraftDetailDTO;
  onAddAnother: () => void;
}) {
  const { t } = useTranslation();
  const initialDraft = useMemo(
    () => teamDraftFromMemberDraft(draft.payload),
    [draft.payload],
  );
  const placeName = draft.name.trim();
  const ownerName = draft.owner?.firstName ?? "";
  // An erased member can't be offered anything, so the offer starts empty
  // and the listing stays with the team unless the admin names someone.
  const initialOwnerNote = draft.owner
    ? placeName
      ? t("admin:listingNew.fromDraft.offerNote", {
          firstName: ownerName,
          name: placeName,
        })
      : t("admin:listingNew.fromDraft.offerNoteUntitled", {
          firstName: ownerName,
        })
    : "";

  return (
    <>
      <section
        className={styles.handoverNote}
        aria-label={t("admin:listingNew.fromDraft.noteAria")}
      >
        <p className={styles.handoverTitle}>
          {draft.owner
            ? t("admin:listingNew.fromDraft.title", { name: ownerName })
            : t("admin:listingNew.fromDraft.titleNoOwner")}
        </p>
        <p className={styles.hint}>{t("admin:listingNew.fromDraft.body")}</p>
      </section>
      <AdminListingNewForm
        initialDraft={initialDraft}
        initialOwnerSlug={draft.owner?.slug ?? ""}
        initialOwnerNote={initialOwnerNote}
        onAddAnother={onAddAnother}
      />
    </>
  );
}
