import { useState, type ReactNode } from "react";
import { AnimatePresence } from "motion/react";
import { useParams } from "react-router-dom";
import { FiEye, FiFileText } from "react-icons/fi";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { adminCreatorDraftsPath, routes } from "../../../app/routeMap";
import { ApiError } from "../../../shared/api/client";
import { AdminShell } from "../../../shared/components/layout/AdminShell";
import {
  EmptyState,
  FadeIn,
  LoadErrorState,
  SkeletonCard,
} from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  isCreatorDraftId,
  isCreatorDraftKind,
  type CreatorDraftKind,
} from "../api/adminCreatorDrafts.api";
import { useAdminCreatorDraft } from "../api/useAdminCreatorDrafts";
import { ListingDraftMessageModal } from "../ListingDraftMessageModal";
import { AdminPageHeader } from "../ui";
import { AdminCreatorDraftPreview } from "./AdminCreatorDraftPreview";
import { AdminCreatorDraftStrip } from "./AdminCreatorDraftStrip";
import { creatorDraftTitleText } from "./adminCreatorDraftLabels";
import styles from "./AdminCreatorDraft.module.css";

const CREATOR_DRAFT_MESSAGE_TEMPLATE_KEYS = {
  titled: "admin:creatorDrafts.message.template",
  untitled: "admin:creatorDrafts.message.templateUntitled",
};

/** A listing edit is unsaved changes to a live listing, so its message
 *  speaks of changes to the listing. */
const LISTING_EDIT_MESSAGE_TEMPLATE_KEYS = {
  titled: "admin:creatorDrafts.message.editTemplate",
  untitled: "admin:creatorDrafts.message.editTemplateUntitled",
};

/** A 404 means the draft is gone (published, discarded or expired); a 400 is
 *  an id the server's UUID check refuses, which can never load either. */
function isCreatorDraftGoneError(error: unknown): boolean {
  return (
    error instanceof ApiError && (error.status === 404 || error.status === 400)
  );
}

/** The admin chrome every state of the page shares: breadcrumb back to the
 *  list (narrowed to this kind when the URL names a real one) and the header.
 *  The shell prints the title after the breadcrumb itself. */
function AdminCreatorDraftFrame({
  kind,
  title,
  children,
}: {
  kind: CreatorDraftKind | null;
  /** The draft's title once it has loaded; null until then. */
  title: string | null;
  children: ReactNode;
}) {
  const { t } = useTranslation();
  const eyebrow = t("admin:creatorDrafts.detail.eyebrow");
  const breadcrumb = [
    { label: t("admin:common.adminBreadcrumb"), to: routes.admin },
    {
      label: t("shared:adminNav.items.creatorDrafts"),
      to: adminCreatorDraftsPath(kind),
    },
  ];
  return (
    <AdminShell title={title ?? eyebrow} breadcrumb={breadcrumb}>
      <FadeIn>
        <AdminPageHeader
          eyebrow={eyebrow}
          title={title ?? eyebrow}
          // The sub describes a preview, so it waits for one to exist.
          sub={title ? t("admin:creatorDrafts.detail.sub") : undefined}
        />
      </FadeIn>
      {children}
    </AdminShell>
  );
}

function AdminCreatorDraftNotFound() {
  const { t } = useTranslation();
  return (
    <EmptyState
      headingLevel={2}
      icon={<FiFileText />}
      title={t("admin:creatorDrafts.notFound.title")}
      description={t("admin:creatorDrafts.notFound.body")}
      action={{
        label: t("admin:creatorDrafts.backToList"),
        to: routes.adminCreatorDrafts,
      }}
    />
  );
}

/**
 * One draft, read once per open. Mounted only for a kind the URL names
 * correctly, so the query hook runs unconditionally here and an unknown kind
 * never reaches the server.
 */
function AdminCreatorDraftLoaded({
  kind,
  id,
}: {
  kind: CreatorDraftKind;
  id: string;
}) {
  const { t } = useTranslation();
  const {
    data: detail,
    error,
    isError,
    isFetching,
    refetch,
  } = useAdminCreatorDraft(kind, id);
  const [isMessageOpen, setIsMessageOpen] = useState(false);
  // A retry from an error drops the query back to pending, which would swap
  // the error state for the skeleton and lose focus on Retry. Remembering the
  // failure keeps the error state mounted, busy, until the retry settles.
  const isLoadError = isError && !isCreatorDraftGoneError(error);
  const [hasLoadFailed, setHasLoadFailed] = useState(false);
  // Only a read that never produced a draft counts: a refetch failing after a
  // success keeps the draft on screen, and setting the flag there would fight
  // the reset below on every render.
  if (isLoadError && detail === undefined && !hasLoadFailed) {
    setHasLoadFailed(true);
  }
  if (hasLoadFailed && (detail !== undefined || (isError && !isLoadError))) {
    setHasLoadFailed(false);
  }

  let body: ReactNode;
  if (detail) {
    body = (
      <div className={styles.body}>
        <p className={styles.loggedLine}>
          <FiEye aria-hidden />
          {t("admin:creatorDrafts.detail.logged")}
        </p>
        <AdminCreatorDraftStrip
          detail={detail}
          onMessageOwner={() => setIsMessageOpen(true)}
        />
        <AdminCreatorDraftPreview detail={detail} />
      </div>
    );
  } else if (isError && isCreatorDraftGoneError(error)) {
    body = <AdminCreatorDraftNotFound />;
  } else if (isLoadError || hasLoadFailed) {
    body = (
      <LoadErrorState
        headingLevel={2}
        onRetry={() => void refetch()}
        isRetrying={isFetching}
        title={t("admin:creatorDrafts.detail.loadError.title")}
        description={t("admin:creatorDrafts.detail.loadError.body")}
      />
    );
  } else {
    body = (
      <div className={styles.body} aria-busy="true">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  return (
    <AdminCreatorDraftFrame
      kind={kind}
      title={detail ? creatorDraftTitleText(detail, t) : null}
    >
      {body}
      <AnimatePresence>
        {isMessageOpen && detail?.owner ? (
          <ListingDraftMessageModal
            key="message"
            owner={detail.owner}
            draftTitle={detail.title}
            templateKeys={
              detail.kind === "listing_edit"
                ? LISTING_EDIT_MESSAGE_TEMPLATE_KEYS
                : CREATOR_DRAFT_MESSAGE_TEMPLATE_KEYS
            }
            onClose={() => setIsMessageOpen(false)}
          />
        ) : null}
      </AnimatePresence>
    </AdminCreatorDraftFrame>
  );
}

/**
 * `/admin/creator-drafts/:kind/:id`: a read-only look at one member's
 * unfinished draft, rendered through the public page it would become. Every
 * open is recorded in the Platform log, and the page says so. The only
 * actions reach out to the owner (or, for a listing wizard draft, finish it
 * as a team listing); nothing here edits, publishes or deletes the draft.
 */
export function AdminCreatorDraftPage() {
  const { kind = "", id = "" } = useParams<{ kind: string; id: string }>();
  const { demoMode } = useDemoMode();
  if (!isCreatorDraftKind(kind)) {
    return (
      <AdminCreatorDraftFrame kind={null} title={null}>
        <AdminCreatorDraftNotFound />
      </AdminCreatorDraftFrame>
    );
  }
  // A live id the server's UUID check would refuse can never load, so the
  // page says not found without asking (a 400 would only reach Sentry).
  if (!demoMode && !isCreatorDraftId(id)) {
    return (
      <AdminCreatorDraftFrame kind={kind} title={null}>
        <AdminCreatorDraftNotFound />
      </AdminCreatorDraftFrame>
    );
  }
  // Keyed so moving between drafts starts each one from a clean state.
  return <AdminCreatorDraftLoaded key={`${kind}:${id}`} kind={kind} id={id} />;
}
